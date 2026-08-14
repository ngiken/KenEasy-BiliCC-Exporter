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
    // Referer/Origin/UA are enforced by KenEasyMediaCdnRules via DNR.
    return {
      credentials: 'include',
      cache: 'no-cache',
      headers: {
        Accept: '*/*',
      },
    };
  }

  async function jsonFetch(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function emitProgress(jobId, payload) {
    const job = activeJobs.get(jobId);
    if (job) {
      job.lastState = payload;
    }
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

  function collectCandidateUrls(primaryUrl, extras) {
    const list = [];
    const push = (value) => {
      if (!value || list.includes(value)) return;
      list.push(value);
    };
    push(primaryUrl);
    (extras || []).forEach(push);
    return list;
  }

  async function readResponseBuffer(response, onProgress) {
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

  async function fetchBinaryViaWorker(url, onProgress) {
    const response = await fetch(url, cdnProfile());
    if (!response.ok) throw new Error('Media HTTP ' + response.status);
    return readResponseBuffer(response, onProgress);
  }

  async function fetchBinaryViaPage(tabId, url, onProgress) {
    if (!tabId) throw new Error('No tab for page-context media fetch.');
    // Page-context fetch inherits bilibili cookies and natural Referer.
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'FETCH_BINARY_FROM_PAGE',
      url,
    });
    if (!response?.success || !response.base64) {
      throw new Error(response?.error || 'Page-context media fetch failed.');
    }
    const binary = atob(response.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    if (onProgress) onProgress(1, bytes.byteLength, bytes.byteLength);
    return bytes.buffer;
  }

  async function fetchBinary(url, onProgress, options) {
    const candidates = collectCandidateUrls(url, options && options.backupUrls);
    const tabId = options && options.tabId;
    const errors = [];

    // Ensure CDN Referer rewrite is active before worker fetch.
    try {
      await root.KenEasyMediaCdnRules?.ensureCdnHeaderRules?.();
    } catch (error) {
      console.warn(BRAND_CONFIG.logPrefix + ' Unable to install CDN header rules.', error);
    }

    for (const candidate of candidates) {
      try {
        return await fetchBinaryViaWorker(candidate, onProgress);
      } catch (error) {
        errors.push('worker:' + (error.message || error));
      }
    }

    // Fallback: page world fetch (correct Referer + cookies).
    if (tabId) {
      for (const candidate of candidates) {
        try {
          return await fetchBinaryViaPage(tabId, candidate, onProgress);
        } catch (error) {
          errors.push('page:' + (error.message || error));
        }
      }
    }

    throw new Error(errors.join(' | ') || 'Media download failed.');
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

  const DB_NAME = 'KenEasyMediaStore';
  const DB_VERSION = 1;
  const STORE_NAME = 'buffers';

  function openMediaDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
    });
  }

  async function putMediaBuffer(id, buffer) {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, buffer });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('IndexedDB put failed'));
    });
  }

  async function saveBuffer(buffer, filename, mime) {
    // If URL.createObjectURL is available in the current context, use it directly.
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
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
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      }
    }

    // In Manifest V3 Service Worker: Store buffer in IndexedDB and delegate ObjectURL download to Offscreen Document.
    const tempId = `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await putMediaBuffer(tempId, buffer);

    if (root.setupOffscreenDocument) {
      await root.setupOffscreenDocument();
    }

    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'OFFSCREEN_SAVE_BUFFER',
          id: tempId,
          filename,
          mime,
        },
        (res) => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }
          if (res?.success) return resolve(res);
          return reject(new Error(res?.error || 'Save buffer failed in offscreen document.'));
        },
      );
    });

    return { downloadId: response.downloadId || 1, filename };
  }

  async function materializeMedia({ mode, plan, onPhaseProgress, tabId }) {
    const fetchOptsBase = { tabId };

    if (plan.kind === 'durl') {
      onPhaseProgress?.('video', 0);
      const buffer = await fetchBinary(plan.videoUrl, (ratio) => {
        onPhaseProgress?.('video', ratio);
      }, Object.assign({}, fetchOptsBase, { backupUrls: plan.videoBackupUrls || [] }));
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
      }, Object.assign({}, fetchOptsBase, { backupUrls: plan.videoBackupUrls || [] }));
    }

    if (mode.needsAudio) {
      onPhaseProgress?.('audio', 0);
      audioBuffer = await fetchBinary(plan.audioUrl, (ratio) => {
        onPhaseProgress?.('audio', ratio);
      }, Object.assign({}, fetchOptsBase, { backupUrls: plan.audioBackupUrls || [] }));
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

    const controller = { cancelled: false, request };
    activeJobs.set(jobId, controller);

    try {
      await root.KenEasyMediaCdnRules?.ensureCdnHeaderRules?.();
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
        tabId: request.tabId || null,
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

  function getActiveJobs() {
    const jobs = [];
    for (const [jobId, job] of activeJobs.entries()) {
      if (job.lastState) {
        jobs.push({ jobId, request: job.request, state: job.lastState });
      }
    }
    return jobs;
  }

  root.KenEasyMediaDownloadService = Object.freeze({
    resolveMediaOptions,
    startMediaDownload,
    getActiveJobs,
    messageTypes: CONFIG.messages,
  });
}(globalThis));
