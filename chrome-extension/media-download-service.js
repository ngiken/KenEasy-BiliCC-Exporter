/**
 * Media download orchestration service.
 * Depends on config + stream resolver + fMP4 remux, stays independent from popup UI.
 */
(function registerMediaDownloadService(root) {
  const CONFIG = root.KENEASY_MEDIA_DOWNLOAD_CONFIG;
  const BRAND_CONFIG = root.KENEASY_BILICC_CONFIG;
  const Resolver = root.KenEasyMediaStreamResolver;
  const Remux = root.KenEasyMediaFmp4;

  const API_BASE = 'https://api.bilibili.com';
  const PAGE_REFERER = 'https://www.bilibili.com';
  const DESKTOP_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  const activeJobs = new Map();

  function pageProfile() {
    return {
      credentials: 'include',
      headers: {
        Referer: PAGE_REFERER,
        'User-Agent': DESKTOP_UA,
      },
    };
  }

  function cdnProfile() {
    return {
      credentials: 'include',
      headers: {
        Referer: PAGE_REFERER,
        'User-Agent': DESKTOP_UA,
        Origin: PAGE_REFERER,
      },
    };
  }

  async function jsonFetch(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function emitProgress(jobId, payload) {
    const message = {
      type: CONFIG.messages.mediaDownloadProgress,
      jobId,
      ...payload,
    };
    try {
      chrome.runtime.sendMessage(message, () => {
        void chrome.runtime.lastError;
      });
    } catch (error) {
      // Popup may be closed; progress is best-effort.
    }
  }

  async function fetchViaPage(tabId, url) {
    if (!tabId) return null;
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        type: 'FETCH_API_FROM_PAGE',
        url,
      });
      if (response?.success) return response.data;
      return null;
    } catch (error) {
      console.warn(`${BRAND_CONFIG.logPrefix} Page playurl fetch failed.`, error);
      return null;
    }
  }

  async function getPlayurlPayload({ bvid, aid, cid, qn, strategy, tabId, signWbi }) {
    const baseParams = {
      bvid,
      cid,
      qn: Number(qn) || 80,
      fnval: strategy.fnval,
      fourk: strategy.fourk || 0,
      fnver: 0,
      otype: 'json',
    };
    if (aid) baseParams.avid = aid;

    let params = baseParams;
    let path = CONFIG.playurlFallbackPath;
    try {
      params = await signWbi(baseParams);
      path = CONFIG.playurlPath;
    } catch (error) {
      console.warn(`${BRAND_CONFIG.logPrefix} playurl WBI sign failed, using unsigned path.`, error);
      params = { ...baseParams, wts: Math.floor(Date.now() / 1000) };
      path = CONFIG.playurlFallbackPath;
    }

    const url = `${API_BASE}${path}?${new URLSearchParams(params).toString()}`;
    const data = (await fetchViaPage(tabId, url)) || (await jsonFetch(url, pageProfile()));
    if (data.code !== 0) {
      throw new Error(`playurl failed: ${data.message || data.code}`);
    }
    return data.data;
  }

  async function resolveBestPayload(request, signWbi) {
    const targetQn = !request.qualityId || request.qualityId === CONFIG.autoQualityId
      ? 80
      : Number(request.qualityId);

    const errors = [];
    for (const strategy of CONFIG.streamStrategies) {
      try {
        const payload = await getPlayurlPayload({
          bvid: request.bvid,
          aid: request.aid,
          cid: request.cid,
          qn: targetQn,
          strategy,
          tabId: request.tabId,
          signWbi,
        });
        // Validate that this payload can satisfy the selected mode.
        Resolver.resolvePlan(payload, request.modeId || CONFIG.defaultModeId, request.qualityId || CONFIG.autoQualityId);
        return { payload, strategyId: strategy.id };
      } catch (error) {
        errors.push(`${strategy.id}: ${error.message || error}`);
      }
    }
    throw new Error(errors.join(' | ') || 'Unable to resolve media streams.');
  }

  async function fetchBinary(url, onProgress) {
    const response = await fetch(url, cdnProfile());
    if (!response.ok) throw new Error(`Media HTTP ${response.status}`);

    const total = Number(response.headers.get('content-length') || 0);
    if (!response.body || !response.body.getReader) {
      const buffer = await response.arrayBuffer();
      if (onProgress) onProgress(1, buffer.byteLength, buffer.byteLength);
      return buffer;
    }

    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      if (onProgress) onProgress(total ? received / total : 0, received, total);
    }
    return concatArrayBuffers(chunks);
  }

  function concatArrayBuffers(chunks) {
    const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const output = new Uint8Array(total);
    let offset = 0;
    chunks.forEach((chunk) => {
      output.set(chunk, offset);
      offset += chunk.byteLength;
    });
    return output.buffer;
  }

  function safeFilenamePart(name, maxLength = 80) {
    const cleaned = String(name || 'bilibili')
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, ' ')
      .trim();
    return (cleaned || 'bilibili').slice(0, maxLength);
  }

  function buildFilename(request, mode, plan) {
    const title = safeFilenamePart(request.title || request.bvid || 'bilibili', 96);
    const quality = safeFilenamePart(plan.qualityLabel || `QN${plan.qualityQn || ''}`, 24);
    const modeTag = mode.id === 'audio_only' ? 'audio' : mode.id === 'video_only' ? 'video' : 'media';
    return `${title} - ${quality} - ${modeTag}.${mode.extension}`;
  }

  async function saveBuffer(buffer, filename, mime) {
    const blob = new Blob([buffer], { type: mime });
    const objectUrl = URL.createObjectURL(blob);

    try {
      const downloadId = await new Promise((resolve, reject) => {
        chrome.downloads.download(
          {
            url: objectUrl,
            filename,
            saveAs: false,
            conflictAction: 'uniquify',
          },
          (id) => {
            if (chrome.runtime.lastError || id === undefined) {
              reject(new Error(chrome.runtime.lastError?.message || 'Download API failed'));
              return;
            }
            resolve(id);
          },
        );
      });
      return { downloadId, filename };
    } finally {
      // Keep URL alive briefly so the download manager can acquire it.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    }
  }

  async function materializeMedia({ mode, plan, onPhaseProgress }) {
    if (plan.kind === 'durl') {
      onPhaseProgress?.('video', 0);
      const buffer = await fetchBinary(plan.videoUrl, (ratio) => {
        onPhaseProgress?.('video', ratio);
      });
      return {
        buffer,
        mime: 'video/mp4',
      };
    }

    let videoBuffer = null;
    let audioBuffer = null;

    if (mode.needsVideo) {
      onPhaseProgress?.('video', 0);
      videoBuffer = await fetchBinary(plan.videoUrl, (ratio) => {
        onPhaseProgress?.('video', ratio);
      });
    }

    if (mode.needsAudio) {
      onPhaseProgress?.('audio', 0);
      audioBuffer = await fetchBinary(plan.audioUrl, (ratio) => {
        onPhaseProgress?.('audio', ratio);
      });
    }

    if (mode.id === 'video_with_audio') {
      onPhaseProgress?.('remux', 0.1);
      const merged = Remux.mergeDashVideoAudio(videoBuffer, audioBuffer);
      onPhaseProgress?.('remux', 1);
      return { buffer: merged, mime: 'video/mp4' };
    }

    if (mode.id === 'audio_only') {
      onPhaseProgress?.('remux', 0.2);
      const normalized = Remux.normalizeSingleTrack(audioBuffer, 1);
      onPhaseProgress?.('remux', 1);
      return { buffer: normalized, mime: 'audio/mp4' };
    }

    onPhaseProgress?.('remux', 0.2);
    const normalized = Remux.normalizeSingleTrack(videoBuffer, 1);
    onPhaseProgress?.('remux', 1);
    return { buffer: normalized, mime: 'video/mp4' };
  }

  function mapPhaseToPercent(phase, ratio) {
    const progress = CONFIG.progress;
    const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));
    if (phase === 'video') {
      return Math.round(progress.videoStart + (progress.audioStart - progress.videoStart - 2) * clamped);
    }
    if (phase === 'audio') {
      return Math.round(progress.audioStart + (progress.remuxStart - progress.audioStart - 2) * clamped);
    }
    if (phase === 'remux') {
      return Math.round(progress.remuxStart + (progress.saveStart - progress.remuxStart) * clamped);
    }
    return progress.select;
  }

  async function resolveMediaOptions(request, helpers) {
    const { payload } = await resolveBestPayload(
      {
        ...request,
        modeId: request.modeId || CONFIG.defaultModeId,
        qualityId: request.qualityId || CONFIG.autoQualityId,
      },
      helpers.signWbi,
    );
    return Resolver.buildOptionsFromPayload(payload);
  }

  async function startMediaDownload(request, helpers) {
    const jobId = request.jobId || `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    if (activeJobs.has(jobId)) {
      throw new Error('Download job already running.');
    }

    const controller = { cancelled: false };
    activeJobs.set(jobId, controller);

    try {
      emitProgress(jobId, {
        percent: CONFIG.progress.resolve,
        phase: 'resolve',
        messageKey: 'mediaProgressResolve',
      });

      const { payload, strategyId } = await resolveBestPayload(request, helpers.signWbi);
      if (controller.cancelled) throw new Error('Download cancelled.');

      emitProgress(jobId, {
        percent: CONFIG.progress.select,
        phase: 'select',
        messageKey: 'mediaProgressSelect',
        strategyId,
      });

      const { mode, plan } = Resolver.resolvePlan(
        payload,
        request.modeId || CONFIG.defaultModeId,
        request.qualityId || CONFIG.autoQualityId,
      );

      const { buffer, mime } = await materializeMedia({
        mode,
        plan,
        onPhaseProgress: (phase, ratio) => {
          emitProgress(jobId, {
            percent: mapPhaseToPercent(phase, ratio),
            phase,
            messageKey:
              phase === 'video'
                ? 'mediaProgressVideo'
                : phase === 'audio'
                  ? 'mediaProgressAudio'
                  : 'mediaProgressRemux',
          });
        },
      });

      if (controller.cancelled) throw new Error('Download cancelled.');

      emitProgress(jobId, {
        percent: CONFIG.progress.saveStart,
        phase: 'save',
        messageKey: 'mediaProgressSave',
      });

      const filename = buildFilename(request, mode, plan);
      const saved = await saveBuffer(buffer, filename, mime);

      emitProgress(jobId, {
        percent: CONFIG.progress.done,
        phase: 'done',
        messageKey: 'mediaProgressDone',
        filename: saved.filename,
      });

      return {
        jobId,
        filename: saved.filename,
        downloadId: saved.downloadId,
        modeId: mode.id,
        qualityQn: plan.qualityQn,
        qualityLabel: plan.qualityLabel,
        strategyId,
        kind: plan.kind,
      };
    } finally {
      activeJobs.delete(jobId);
    }
  }

  root.KenEasyMediaDownloadService = Object.freeze({
    resolveMediaOptions,
    startMediaDownload,
    messageTypes: CONFIG.messages,
  });
}(globalThis));
