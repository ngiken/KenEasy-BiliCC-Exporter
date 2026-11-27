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

  /**
   * Rolling window speedometer for computing smooth transfer speeds and ETA.
   */
  function createSpeedometer(windowMs = 1500) {
    const samples = [];
    let totalLoaded = 0;
    return {
      record(loadedBytes, now = Date.now()) {
        totalLoaded = loadedBytes;
        samples.push({ time: now, bytes: loadedBytes });
        const cutoff = now - windowMs;
        while (samples.length > 2 && samples[0].time < cutoff) {
          samples.shift();
        }
      },
      getSpeed(now = Date.now()) {
        if (samples.length < 2) return 0;
        const earliest = samples[0];
        const latest = samples[samples.length - 1];
        const elapsedSec = (latest.time - earliest.time) / 1000;
        if (elapsedSec <= 0.05) return 0;
        const bytesDelta = latest.bytes - earliest.bytes;
        return Math.max(0, bytesDelta / elapsedSec);
      },
      getEta(totalBytes, now = Date.now()) {
        if (!totalBytes || totalBytes <= totalLoaded) return 0;
        const speed = this.getSpeed(now);
        if (speed < 1024) return null;
        const remainingBytes = totalBytes - totalLoaded;
        return Math.max(1, Math.round(remainingBytes / speed));
      },
      getLoaded() {
        return totalLoaded;
      },
    };
  }

  function pageProfile() {
    return {
      credentials: 'include',
      headers: {
        Referer: PAGE_REFERER,
        'User-Agent': DESKTOP_UA,
      },
    };
  }

  function cdnProfile(extraHeaders = {}) {
    // Referer/UA are enforced by KenEasyMediaCdnRules via DNR.
    // Bilibili CDN URLs are authenticated via query params, not cookies;
    // omitting credentials avoids CORS errors when mirrors reply with ACAO: *.
    return {
      credentials: 'omit',
      headers: {
        Accept: '*/*',
        ...extraHeaders,
      },
    };
  }

  async function jsonFetch(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function emitProgress(jobId, payload, force = false) {
    const job = activeJobs.get(jobId);
    if (job) {
      job.lastState = Object.freeze({
        ...(job.lastState || {}),
        ...payload,
        updatedAt: Date.now(),
      });
    }

    const now = Date.now();
    const throttleMs = CONFIG.progressThrottleMs || 120;
    if (!force && job && job.lastEmitTime && (now - job.lastEmitTime < throttleMs)) {
      return;
    }
    if (job) {
      job.lastEmitTime = now;
    }

    const message = {
      type: CONFIG.messages.mediaDownloadProgress,
      jobId,
      ...(job ? job.lastState : payload),
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

  function hostOf(url) {
    try {
      return new URL(url).hostname;
    } catch (_) {
      return 'unknown';
    }
  }

  function isPcdnUrl(url) {
    try {
      const host = new URL(url).hostname.toLowerCase();
      return (
        host.includes('mcdn.bilivideo') ||
        host.endsWith('.szbdyd.com') ||
        /^xy\d+x/.test(host) ||
        /^\d+\.\d+\.\d+\.\d+$/.test(host)
      );
    } catch (_) {
      return false;
    }
  }

  function collectCandidateUrls(primaryUrl, extras) {
    const list = [];
    const push = (value) => {
      if (!value || list.includes(value)) return;
      list.push(value);
    };
    push(primaryUrl);
    (extras || []).forEach(push);
    // Prefer standard UPOS/Akamai CDN mirrors ahead of PCDN/MCDN nodes while
    // keeping every URL as a fallback.
    return list
      .map((url, index) => ({ url, index, pcdn: isPcdnUrl(url) ? 1 : 0 }))
      .sort((a, b) => a.pcdn - b.pcdn || a.index - b.index)
      .map((item) => item.url);
  }

  function parseContentRange(headerValue) {
    if (!headerValue) return null;
    const text = String(headerValue).trim();
    const rangeMatch = text.match(/^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/i);
    if (rangeMatch) {
      return {
        start: Number(rangeMatch[1]),
        end: Number(rangeMatch[2]),
        total: rangeMatch[3] === '*' ? 0 : Number(rangeMatch[3]),
      };
    }
    const unsatMatch = text.match(/^bytes\s+\*\/(\d+)$/i);
    if (unsatMatch) {
      return {
        start: null,
        end: null,
        total: Number(unsatMatch[1]),
      };
    }
    return null;
  }

  function isCancelledError(error, signal) {
    return Boolean(
      signal?.aborted ||
      error?.name === 'AbortError' ||
      String(error?.message || '').includes('cancelled'),
    );
  }

  function sleepWithSignal(ms, signal) {
    if (signal?.aborted) return Promise.reject(new Error('Download cancelled.'));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (signal) signal.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
      function onAbort() {
        clearTimeout(timer);
        reject(new Error('Download cancelled.'));
      }
      if (signal) signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  function emitTransferProgress(onProgress, speedometer, loadedBytes, totalBytes, done = false) {
    if (!onProgress) return;
    const assumedScale = 30 * 1024 * 1024; // 30MB baseline if total size unknown
    if (done) {
      onProgress({
        ratio: 1,
        loadedBytes,
        totalBytes: totalBytes || loadedBytes,
        speedBps: speedometer.getSpeed(),
        etaSeconds: 0,
        indeterminate: false,
      });
      return;
    }

    let ratio;
    let indeterminate = false;
    if (totalBytes > 0) {
      ratio = Math.min(1, loadedBytes / totalBytes);
    } else {
      indeterminate = true;
      ratio = Math.min(0.95, 1 - Math.exp(-loadedBytes / assumedScale));
    }

    onProgress({
      ratio,
      loadedBytes,
      totalBytes,
      speedBps: speedometer.getSpeed(),
      etaSeconds: speedometer.getEta(totalBytes),
      indeterminate,
    });
  }

  async function readResponseStreamChunks(response, onChunkBytes, signal) {
    if (!response.body || !response.body.getReader) {
      if (signal?.aborted) throw new Error('Download cancelled.');
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      if (onChunkBytes) onChunkBytes(bytes.byteLength);
      return [bytes];
    }

    const reader = response.body.getReader();
    const onAbort = () => {
      try { reader.cancel(); } catch (_) {}
    };
    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    const parts = [];
    try {
      while (true) {
        if (signal?.aborted) {
          try { reader.cancel(); } catch (_) {}
          throw new Error('Download cancelled.');
        }
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.byteLength > 0) {
          parts.push(value);
          if (onChunkBytes) onChunkBytes(value.byteLength);
        }
      }
    } finally {
      if (signal) signal.removeEventListener('abort', onAbort);
    }
    return parts;
  }

  async function fetchWorkerRangeChunk(url, start, end, expectedTotal, onBytes, signal) {
    const response = await fetch(url, {
      ...cdnProfile({ Range: `bytes=${start}-${end}` }),
      signal,
    });
    const contentRange = parseContentRange(response.headers.get('content-range'));
    const contentLength = Number(response.headers.get('content-length') || 0);

    if (response.status === 416) {
      try { await response.body?.cancel(); } catch (_) {}
      return { status: 416, contentRange, contentLength: 0, parts: [], byteLength: 0 };
    }

    if (!response.ok) {
      try { await response.body?.cancel(); } catch (_) {}
      throw new Error('Media HTTP ' + response.status);
    }

    if (response.status === 200 && start > 0) {
      try { await response.body?.cancel(); } catch (_) {}
      throw new Error('Unexpected HTTP 200 for partial range');
    }

    if (response.status === 206 && contentRange) {
      if (contentRange.start !== null && contentRange.start !== start) {
        try { await response.body?.cancel(); } catch (_) {}
        throw new Error(`Range start mismatch: expected ${start}, got ${contentRange.start}`);
      }
      if (expectedTotal > 0 && contentRange.total > 0 && contentRange.total !== expectedTotal) {
        try { await response.body?.cancel(); } catch (_) {}
        throw new Error(`Mirror size mismatch: expected ${expectedTotal}, got ${contentRange.total}`);
      }
    }

    const parts = await readResponseStreamChunks(response, onBytes, signal);
    const byteLength = parts.reduce((sum, part) => sum + part.byteLength, 0);
    return {
      status: response.status,
      contentRange,
      contentLength,
      parts,
      byteLength,
    };
  }

  async function fetchBinaryViaWorker(candidates, onProgress, signal) {
    // Bilibili CDNs (both UPOS/bilivideo -> HTTP 567 and Akamai -> HTTP 403)
    // reject unbounded full-file GET requests and require bounded Range requests.
    const chunkSize = CONFIG.rangeChunkBytes || (4 * 1024 * 1024);
    const maxRetries = CONFIG.chunkMaxRetries ?? 2;
    const speedometer = createSpeedometer(CONFIG.speedSampleWindowMs || 1500);
    const chunks = [];
    const errors = [];

    let activeIndex = 0;
    let offset = 0;
    let totalSize = 0;
    let retriedInitial416 = false;

    while (totalSize === 0 || offset < totalSize) {
      if (signal?.aborted) throw new Error('Download cancelled.');

      const rangeEnd = totalSize > 0
        ? Math.min(totalSize - 1, offset + chunkSize - 1)
        : offset + chunkSize - 1;
      const requestedLength = rangeEnd - offset + 1;

      let chunkResult = null;
      let lastChunkError = null;

      // Try from the active candidate first; if it fails, try remaining mirrors.
      for (let step = 0; step < candidates.length; step += 1) {
        const candidateIdx = (activeIndex + step) % candidates.length;
        const candidateUrl = candidates[candidateIdx];
        const attempts = offset > 0 ? maxRetries + 1 : 1;

        for (let attempt = 0; attempt < attempts; attempt += 1) {
          if (signal?.aborted) throw new Error('Download cancelled.');
          let inFlightBytes = 0;
          try {
            chunkResult = await fetchWorkerRangeChunk(
              candidateUrl,
              offset,
              rangeEnd,
              totalSize,
              (delta) => {
                inFlightBytes += delta;
                const loaded = offset + inFlightBytes;
                speedometer.record(loaded);
                emitTransferProgress(onProgress, speedometer, loaded, totalSize, false);
              },
              signal,
            );
            activeIndex = candidateIdx;
            break;
          } catch (error) {
            if (isCancelledError(error, signal)) throw error;
            lastChunkError = error;
            if (attempt + 1 < attempts) {
              await sleepWithSignal(300 * (attempt + 1), signal);
            }
          }
        }

        if (chunkResult) break;
        errors.push(`worker[${hostOf(candidateUrl)}@${offset}-${rangeEnd}]:${lastChunkError?.message || lastChunkError || 'fetch failed'}`);
        // At offset 0, try next candidate immediately without wrapping around.
        if (offset === 0 && candidateIdx === candidates.length - 1) break;
      }

      if (!chunkResult) {
        const err = new Error(errors.join(' | ') || lastChunkError?.message || 'Worker media fetch failed.');
        err.collectedErrors = errors;
        throw err;
      }

      if (chunkResult.status === 416) {
        if (offset === 0 && !retriedInitial416 && chunkResult.contentRange?.total > 0) {
          retriedInitial416 = true;
          totalSize = chunkResult.contentRange.total;
          continue;
        }
        if (offset > 0 && totalSize === 0) {
          break;
        }
        throw new Error('Media HTTP 416');
      }

      if (chunkResult.status === 200) {
        // Server ignored Range and returned the complete stream from byte 0.
        for (const part of chunkResult.parts) chunks.push(part);
        offset += chunkResult.byteLength;
        totalSize = chunkResult.contentLength || offset;
        break;
      }

      // HTTP 206 Partial Content
      if (chunkResult.contentRange?.total > 0) {
        totalSize = chunkResult.contentRange.total;
      }
      if (chunkResult.byteLength === 0) {
        if (totalSize > 0 && offset < totalSize) {
          throw new Error(`Empty media chunk at byte ${offset}/${totalSize}`);
        }
        break;
      }

      for (const part of chunkResult.parts) chunks.push(part);
      offset += chunkResult.byteLength;
      speedometer.record(offset);
      emitTransferProgress(onProgress, speedometer, offset, totalSize, false);

      if (totalSize === 0 && chunkResult.byteLength < requestedLength) {
        break;
      }
    }

    if (totalSize > 0 && offset < totalSize) {
      throw new Error(`Incomplete media download: ${offset}/${totalSize}`);
    }

    emitTransferProgress(onProgress, speedometer, offset, totalSize || offset, true);
    return concatArrayBuffers(chunks);
  }

  function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function fetchBinaryViaPage(tabId, url, onProgress, signal) {
    if (!tabId) throw new Error('No tab for page-context media fetch.');
    if (signal?.aborted) throw new Error('Download cancelled.');

    const chunkSize = CONFIG.rangeChunkBytes || (4 * 1024 * 1024);
    const speedometer = createSpeedometer(CONFIG.speedSampleWindowMs || 1500);
    const chunks = [];
    let offset = 0;
    let totalSize = 0;
    let retriedInitial416 = false;

    while (totalSize === 0 || offset < totalSize) {
      if (signal?.aborted) throw new Error('Download cancelled.');

      const rangeEnd = totalSize > 0
        ? Math.min(totalSize - 1, offset + chunkSize - 1)
        : offset + chunkSize - 1;
      const requestedLength = rangeEnd - offset + 1;

      const response = await chrome.tabs.sendMessage(tabId, {
        type: 'FETCH_BINARY_FROM_PAGE',
        url,
        rangeStart: offset,
        rangeEnd,
      });

      if (!response?.success) {
        throw new Error(response?.error || 'Page-context media fetch failed.');
      }

      const contentRange = parseContentRange(response.contentRange);
      if (response.status === 416) {
        if (offset === 0 && !retriedInitial416 && contentRange?.total > 0) {
          retriedInitial416 = true;
          totalSize = contentRange.total;
          continue;
        }
        if (offset > 0 && totalSize === 0) break;
        throw new Error('Media HTTP 416');
      }

      if (!response.base64 && response.byteLength !== 0) {
        throw new Error('Page-context media fetch returned empty payload.');
      }

      const bytes = response.base64 ? base64ToUint8Array(response.base64) : new Uint8Array(0);
      if (response.status === 200) {
        if (offset > 0) throw new Error('Unexpected HTTP 200 for partial range');
        chunks.push(bytes);
        offset += bytes.byteLength;
        totalSize = response.contentLength || offset;
        break;
      }

      if (contentRange?.total > 0) {
        totalSize = contentRange.total;
      }
      if (bytes.byteLength === 0) {
        if (totalSize > 0 && offset < totalSize) {
          throw new Error(`Empty page media chunk at byte ${offset}/${totalSize}`);
        }
        break;
      }

      chunks.push(bytes);
      offset += bytes.byteLength;
      speedometer.record(offset);
      emitTransferProgress(onProgress, speedometer, offset, totalSize, false);

      if (totalSize === 0 && bytes.byteLength < requestedLength) {
        break;
      }
    }

    if (totalSize > 0 && offset < totalSize) {
      throw new Error(`Incomplete media download: ${offset}/${totalSize}`);
    }

    emitTransferProgress(onProgress, speedometer, offset, totalSize || offset, true);
    return concatArrayBuffers(chunks);
  }

  async function fetchBinary(url, onProgress, options) {
    const candidates = collectCandidateUrls(url, options && options.backupUrls);
    const tabId = options && options.tabId;
    const signal = options && options.signal;
    const errors = [];

    // Ensure CDN Referer rewrite is active before worker fetch.
    try {
      await root.KenEasyMediaCdnRules?.ensureCdnHeaderRules?.();
    } catch (error) {
      console.warn(BRAND_CONFIG.logPrefix + ' Unable to install CDN header rules.', error);
    }

    if (candidates.length > 0) {
      try {
        return await fetchBinaryViaWorker(candidates, onProgress, signal);
      } catch (error) {
        if (isCancelledError(error, signal)) throw error;
        if (Array.isArray(error.collectedErrors) && error.collectedErrors.length > 0) {
          errors.push(...error.collectedErrors);
        } else {
          errors.push('worker:' + (error.message || error));
        }
      }
    }

    // Fallback: page world chunked Range fetch (natural bilibili Referer, credentials:'omit').
    if (tabId) {
      for (const candidate of candidates) {
        if (signal?.aborted) throw new Error('Download cancelled.');
        try {
          return await fetchBinaryViaPage(tabId, candidate, onProgress, signal);
        } catch (error) {
          if (isCancelledError(error, signal)) throw error;
          errors.push(`page[${hostOf(candidate)}]:${error.message || error}`);
        }
      }
    }

    throw new Error(errors.join(' | ') || 'Media download failed.');
  }

  function concatArrayBuffers(chunks) {
    const views = chunks.map((chunk) => (chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk)));
    const total = views.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const output = new Uint8Array(total);
    let offset = 0;
    views.forEach((chunk) => {
      output.set(chunk, offset);
      offset += chunk.byteLength;
    });
    return output.buffer;
  }

  function safeFilenamePart(name, maxLength = 80) {
    let cleaned = String(name || 'bilibili')
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[.\s]+$/, '');
    const base = cleaned.replace(/\.[^.]*$/, '');
    if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(base)) {
      cleaned = `${cleaned}_`;
    }
    return (cleaned || 'bilibili').slice(0, maxLength);
  }

  function buildFilename(request, mode, plan) {
    const title = safeFilenamePart(request.title || request.bvid || 'bilibili', 96);
    if (mode.id === 'audio_only') {
      return `${title} - audio.${mode.extension}`;
    }
    const quality = safeFilenamePart(plan.qualityLabel || `QN${plan.qualityQn || ''}`, 24);
    const modeTag = mode.id === 'video_only' ? 'video' : 'media';
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
      tx.oncomplete = () => {
        try { db.close(); } catch (_) {}
        resolve();
      };
      tx.onerror = () => {
        try { db.close(); } catch (_) {}
        reject(tx.error || new Error('IndexedDB put failed'));
      };
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

  async function materializeMedia({ mode, plan, onPhaseProgress, tabId, signal }) {
    const fetchOptsBase = { tabId, signal };

    if (plan.kind === 'durl') {
      onPhaseProgress?.('video', 0, { loadedBytes: 0, totalBytes: 0, speedBps: 0, etaSeconds: null });
      const buffer = await fetchBinary(plan.videoUrl, (info) => {
        onPhaseProgress?.('video', info.ratio, info);
      }, Object.assign({}, fetchOptsBase, { backupUrls: plan.videoBackupUrls || [] }));
      return {
        buffer,
        mime: 'video/mp4',
      };
    }

    let videoBuffer = null;
    let audioBuffer = null;

    if (mode.needsVideo) {
      onPhaseProgress?.('video', 0, { loadedBytes: 0, totalBytes: 0, speedBps: 0, etaSeconds: null });
      videoBuffer = await fetchBinary(plan.videoUrl, (info) => {
        onPhaseProgress?.('video', info.ratio, info);
      }, Object.assign({}, fetchOptsBase, { backupUrls: plan.videoBackupUrls || [] }));
    }

    if (signal?.aborted) throw new Error('Download cancelled.');

    if (mode.needsAudio) {
      onPhaseProgress?.('audio', 0, { loadedBytes: 0, totalBytes: 0, speedBps: 0, etaSeconds: null });
      audioBuffer = await fetchBinary(plan.audioUrl, (info) => {
        onPhaseProgress?.('audio', info.ratio, info);
      }, Object.assign({}, fetchOptsBase, { backupUrls: plan.audioBackupUrls || [] }));
    }

    if (signal?.aborted) throw new Error('Download cancelled.');

    if (mode.id === 'video_with_audio') {
      const combinedLoaded = (videoBuffer?.byteLength || 0) + (audioBuffer?.byteLength || 0);
      onPhaseProgress?.('remux', 0.2, {
        loadedBytes: combinedLoaded,
        totalBytes: combinedLoaded,
        speedBps: 0,
        etaSeconds: 0,
      });
      const merged = Remux.mergeDashVideoAudio(videoBuffer, audioBuffer);
      onPhaseProgress?.('remux', 1, {
        loadedBytes: merged.byteLength,
        totalBytes: merged.byteLength,
        speedBps: 0,
        etaSeconds: 0,
      });
      return { buffer: merged, mime: 'video/mp4' };
    }

    if (mode.id === 'audio_only') {
      const loaded = audioBuffer?.byteLength || 0;
      onPhaseProgress?.('remux', 0.2, {
        loadedBytes: loaded,
        totalBytes: loaded,
        speedBps: 0,
        etaSeconds: 0,
      });
      const normalized = Remux.normalizeSingleTrack(audioBuffer, 1);
      onPhaseProgress?.('remux', 1, {
        loadedBytes: normalized.byteLength,
        totalBytes: normalized.byteLength,
        speedBps: 0,
        etaSeconds: 0,
      });
      return { buffer: normalized, mime: 'audio/mp4' };
    }

    const loaded = videoBuffer?.byteLength || 0;
    onPhaseProgress?.('remux', 0.2, {
      loadedBytes: loaded,
      totalBytes: loaded,
      speedBps: 0,
      etaSeconds: 0,
    });
    const normalized = Remux.normalizeSingleTrack(videoBuffer, 1);
    onPhaseProgress?.('remux', 1, {
      loadedBytes: normalized.byteLength,
      totalBytes: normalized.byteLength,
      speedBps: 0,
      etaSeconds: 0,
    });
    return { buffer: normalized, mime: 'video/mp4' };
  }

  function mapPhaseToPercent(phase, ratio, modeId = 'video_with_audio') {
    const p = CONFIG.progress;
    const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));

    if (modeId === 'audio_only') {
      if (phase === 'audio') {
        return Math.round(p.videoStart + (p.audioEnd - p.videoStart) * clamped);
      }
      if (phase === 'remux') {
        return Math.round(p.remuxStart + (p.remuxEnd - p.remuxStart) * clamped);
      }
      return p.select;
    }

    if (modeId === 'video_only') {
      if (phase === 'video') {
        return Math.round(p.videoStart + (p.audioEnd - p.videoStart) * clamped);
      }
      if (phase === 'remux') {
        return Math.round(p.remuxStart + (p.remuxEnd - p.remuxStart) * clamped);
      }
      return p.select;
    }

    // Default: video_with_audio
    if (phase === 'video') {
      return Math.round(p.videoStart + (p.videoEnd - p.videoStart) * clamped);
    }
    if (phase === 'audio') {
      return Math.round(p.audioStart + (p.audioEnd - p.audioStart) * clamped);
    }
    if (phase === 'remux') {
      return Math.round(p.remuxStart + (p.remuxEnd - p.remuxStart) * clamped);
    }
    return p.select;
  }

  async function ensureVideoIdentifiers(request, helpers) {
    let aid = request.aid || null;
    let cid = request.cid || null;
    let title = request.title || '';

    if ((!cid || !aid) && request.bvid && typeof helpers?.getVideoInfo === 'function') {
      const info = await helpers.getVideoInfo(request.bvid, request.tabId || null);
      if (info) {
        aid = aid || info.aid || null;
        const pages = Array.isArray(info.pages) ? info.pages : [];
        const pIndex = Math.max(0, (Number(request.currentP) || 1) - 1);
        cid = cid || pages[pIndex]?.cid || info.cid || null;
        title = title || info.title || '';
      }
    }

    if (!cid) {
      throw new Error(`Missing video cid for ${request.bvid || 'unknown video'}.`);
    }

    return { ...request, aid, cid, title };
  }

  async function resolveMediaOptions(request, helpers) {
    const resolvedRequest = await ensureVideoIdentifiers(request, helpers);
    const { payload } = await resolveBestPayload(
      {
        ...resolvedRequest,
        modeId: resolvedRequest.modeId || CONFIG.defaultModeId,
        qualityId: resolvedRequest.qualityId || CONFIG.autoQualityId,
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

    const abortController = new AbortController();
    const controller = {
      cancelled: false,
      request,
      abortController,
      startTime: Date.now(),
      lastState: null,
      lastEmitTime: 0,
    };
    activeJobs.set(jobId, controller);

    try {
      await root.KenEasyMediaCdnRules?.ensureCdnHeaderRules?.();
      emitProgress(jobId, {
        percent: CONFIG.progress.resolve,
        phase: 'resolve',
        messageKey: 'mediaProgressResolve',
        loadedBytes: 0,
        totalBytes: 0,
        speedBps: 0,
        etaSeconds: null,
      }, true);

      const resolvedRequest = await ensureVideoIdentifiers(request, helpers);
      controller.request = resolvedRequest;
      const { payload, strategyId } = await resolveBestPayload(resolvedRequest, helpers.signWbi);
      if (controller.cancelled || abortController.signal.aborted) throw new Error('Download cancelled.');

      emitProgress(jobId, {
        percent: CONFIG.progress.select,
        phase: 'select',
        messageKey: 'mediaProgressSelect',
        strategyId,
        loadedBytes: 0,
        totalBytes: 0,
        speedBps: 0,
        etaSeconds: null,
      }, true);

      const { mode, plan } = Resolver.resolvePlan(
        payload,
        request.modeId || CONFIG.defaultModeId,
        request.qualityId || CONFIG.autoQualityId,
      );

      const { buffer, mime } = await materializeMedia({
        mode,
        plan,
        tabId: request.tabId || null,
        signal: abortController.signal,
        onPhaseProgress: (phase, ratio, metricInfo = {}) => {
          emitProgress(jobId, {
            percent: mapPhaseToPercent(phase, ratio, mode.id),
            phase,
            modeId: mode.id,
            loadedBytes: metricInfo.loadedBytes || 0,
            totalBytes: metricInfo.totalBytes || 0,
            speedBps: metricInfo.speedBps || 0,
            etaSeconds: metricInfo.etaSeconds ?? null,
            indeterminate: !!metricInfo.indeterminate,
            messageKey:
              phase === 'video'
                ? 'mediaProgressVideo'
                : phase === 'audio'
                  ? 'mediaProgressAudio'
                  : 'mediaProgressRemux',
          });
        },
      });

      if (controller.cancelled || abortController.signal.aborted) throw new Error('Download cancelled.');

      emitProgress(jobId, {
        percent: CONFIG.progress.saveStart,
        phase: 'save',
        messageKey: 'mediaProgressSave',
        loadedBytes: buffer.byteLength,
        totalBytes: buffer.byteLength,
        speedBps: 0,
        etaSeconds: 0,
      }, true);

      const filename = buildFilename(resolvedRequest, mode, plan);
      const saved = await saveBuffer(buffer, filename, mime);

      emitProgress(jobId, {
        percent: CONFIG.progress.done,
        phase: 'done',
        messageKey: 'mediaProgressDone',
        filename: saved.filename,
        loadedBytes: buffer.byteLength,
        totalBytes: buffer.byteLength,
        speedBps: 0,
        etaSeconds: 0,
      }, true);

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

  function cancelMediaDownload(jobId) {
    const job = activeJobs.get(jobId);
    if (!job) return false;
    job.cancelled = true;
    if (job.abortController) {
      try { job.abortController.abort(); } catch (_) {}
    }
    emitProgress(jobId, {
      percent: 0,
      phase: 'cancelled',
      messageKey: 'mediaProgressCancelled',
    }, true);
    activeJobs.delete(jobId);
    return true;
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
    cancelMediaDownload,
    getActiveJobs,
    createSpeedometer,
    mapPhaseToPercent,
    parseContentRange,
    collectCandidateUrls,
    fetchBinary,
    messageTypes: CONFIG.messages,
  });
}(globalThis));
