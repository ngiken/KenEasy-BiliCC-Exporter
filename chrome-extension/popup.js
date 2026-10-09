const appState = {
  video: null,
  subtitles: null,
  mediaOptions: null,
  mediaJobId: null,
  updateInfo: null,
};

const BRAND_CONFIG = globalThis.KENEASY_BILICC_CONFIG;
const STORAGE_PREFIX = BRAND_CONFIG.storage.subtitleHintPrefix;
const USAGE_STORAGE_KEYS = Object.freeze({
  count: `${STORAGE_PREFIX}usage_success_count`,
  starStatus: `${STORAGE_PREFIX}star_prompt_status`,
});
const USAGE_MILESTONE = 10;

async function getStorageItem(key) {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await chrome.storage.local.get(key);
      return res[key];
    }
  } catch (_) {}
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

async function setStorageItem(key, value) {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [key]: value });
    }
  } catch (_) {}
  try {
    localStorage.setItem(key, String(value));
  } catch (_) {}
}

async function recordSuccessfulUsage() {
  try {
    const raw = await getStorageItem(USAGE_STORAGE_KEYS.count);
    const count = (parseInt(raw, 10) || 0) + 1;
    await setStorageItem(USAGE_STORAGE_KEYS.count, count);

    const status = await getStorageItem(USAGE_STORAGE_KEYS.starStatus);
    if (count >= USAGE_MILESTONE && status !== 'starred' && status !== 'dismissed') {
      setTimeout(() => {
        showStarPromptModal();
      }, 700);
    }
  } catch (err) {
    console.warn('[KenEasy] Usage tracking error:', err);
  }
}

function showStarPromptModal() {
  const modal = document.getElementById('starPromptModal');
  if (modal) {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
  }
}

function hideStarPromptModal() {
  const modal = document.getElementById('starPromptModal');
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }
}

const FALLBACK_TEXT = Object.freeze({
  extensionName: BRAND_CONFIG.appName,
  headerSubtitle: BRAND_CONFIG.headerSubtitle,
  loadingKicker: 'CONNECTING TO VIDEO',
  notBiliKicker: 'READY WHEN YOU ARE',
  notBiliTitle: 'Open a Bilibili video',
  currentVideoLabel: 'CURRENT VIDEO',
  extractingKicker: 'PREPARING YOUR SUBTITLES',
  availableTracksLabel: 'AVAILABLE TRACKS',
  checkedVideoLabel: 'CHECKED VIDEO',
  noSubTitle: 'No downloadable subtitles yet',
  errorTitle: 'Something did not complete',
  themeToLight: 'Switch to light appearance',
  themeToDark: 'Switch to dark appearance',
  helpLink: 'Help & guide',
  loading: 'Reading the current video...',
  notBili: `Open a bilibili.com video page before using ${BRAND_CONFIG.appName}.`,
  unknownTitle: 'Untitled video',
  unknownDuration: '--:--',
  fetchButton: 'Extract subtitles',
  progressStart: 'Preparing subtitle extraction',
  progressVideo: 'Reading video information',
  progressTracks: 'Fetching subtitle tracks',
  progressDone: 'Subtitles are ready',
  videoInfoDone: 'Video information loaded',
  tracksFound: 'Found {count} subtitle tracks',
  subtitleCount: '{count} subtitles',
  noSubtitle: 'This video has no downloadable CC subtitles yet. Check whether subtitles are visible on the page, or sign in to Bilibili and try again.',
  loginRequired: "This video's subtitles require a Bilibili sign-in. Sign in with the current browser and try again.",
  unknownLanguage: 'Subtitle',
  errorPrefix: 'Failed: ',
  downloaded: 'Saved',
  previewLabel: 'Subtitle preview',
  backButton: 'Back',
  footerFormats: 'TXT / SRT / VTT / JSON',
  copyText: 'Copy',
  copyTextTitle: 'Copy plain text subtitles to clipboard',
  copiedText: 'Copied✓',
  copiedSuccessToast: 'Subtitles copied to clipboard',
  copyFailedToast: 'Failed to copy subtitles to clipboard',
  footerGithub: 'GitHub',
  footerStar: 'Star ★',
  currentPageNotVideo: 'The current page is not a Bilibili video page.',
  backgroundNoResponse: 'The extension background did not return a result. Reopen the extension and try again.',
  subtitleApiFailed: 'The subtitle API request failed.',
  subtitleFileFailed: 'Subtitle file download failed: HTTP {status}',
  mediaDownloadLabel: 'MEDIA DOWNLOAD',
  mediaQualityLabel: 'Quality',
  mediaModeLabel: 'Mode',
  mediaHint: 'Download the current video with audio, or audio only.',
  mediaDownloadButton: 'Download media',
  downloadingKicker: 'DOWNLOADING MEDIA',
  mediaProgressStart: 'Preparing media download',
  mediaProgressResolve: 'Resolving playable streams',
  mediaProgressSelect: 'Selecting quality and tracks',
  mediaProgressVideo: 'Downloading video track',
  mediaProgressAudio: 'Downloading audio track',
  mediaProgressRemux: 'Merging video and audio',
  mediaProgressSave: 'Saving local file',
  mediaProgressDone: 'Media saved',
  mediaDoneKicker: 'DOWNLOAD COMPLETE',
  mediaDoneBtn: 'Done & Return',
  mediaStepResolve: 'Resolving streams',
  mediaStepVideo: 'Downloading video track',
  mediaStepAudio: 'Downloading audio track',
  mediaStepRemux: 'Remuxing MP4 locally',
  mediaStepSave: 'Saving file to disk',
  mediaStepDownload: 'Downloading tracks',
  mediaBgAssurance: 'Safe to close popup or switch tabs. Download continues in background with notification on finish.',
  activeJobRunning: 'Background download in progress',
  activeJobViewBtn: 'View Progress',
  cancelButton: 'Cancel',
  mediaProgressCancelled: 'Download cancelled',
  metricSpeedLabel: 'Speed',
  metricSizeLabel: 'Transferred',
  metricEtaLabel: 'ETA',
  metricDoneSpeed: 'Done',
  notificationDownloadDone: 'Download complete: {filename}',
  starPromptKicker: 'MILESTONE REACHED',
  starPromptTitle: "You've used KenEasy 10 times!",
  starPromptBody: "We're so glad KenEasy has been helpful to you! If you enjoy this tool, could you spare a moment to give us a Star on GitHub? It means the world to us!",
  starPromptActionLabel: 'Star on GitHub ★',
  starPromptLaterLabel: 'Maybe later',
  starPromptThankToast: 'Thank you so much for your support! ❤️',
  mediaOptionsFailed: 'Unable to load media download options for this video.',
  mediaDownloadFailed: 'Media download failed.',
  qualityAuto: 'Auto',
  quality8k: '8K',
  qualityDolbyVision: 'Dolby Vision',
  qualityHdr: 'HDR',
  quality4k: '4K',
  quality1080p60: '1080P60',
  quality1080pPlus: '1080P+',
  quality1080p: '1080P',
  quality720p60: '720P60',
  quality720p: '720P',
  quality480p: '480P',
  quality360p: '360P',
  downloadVideoWithAudio: 'Video + audio',
  downloadAudioOnly: 'Audio only',
  downloadVideoOnly: 'Video only',
  updateButton: 'Update',
  updateChecking: 'Checking for updates...',
  updateAvailable: 'Update available: v{version}',
  updateLatest: 'Already the latest version (v{version})',
  updateDownloading: 'Downloading latest package...',
  updateDownloaded: 'Latest package downloaded. Follow the reload steps.',
  updateFailed: 'Update check failed.',
  updateApplyFailed: 'Could not start the update download.',
  updateBannerTitle: 'New version ready',
  updateBannerBody: 'v{version} is available. One click downloads the package and opens install steps.',
  updateNow: 'Update now',
  updateCheckNow: 'Check for updates',
});

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatSpeed(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec <= 0) return '--';
  return `${formatBytes(bytesPerSec)}/s`;
}

function formatEta(seconds) {
  if (seconds === null || seconds === undefined || seconds < 0) return '--';
  if (seconds === 0) return '0s';
  if (seconds < 60) return `~${seconds}s`;
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `~${hours}h ${mins}m`;
  }
  const mins = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  return `~${mins}m ${remSec}s`;
}

const STATE_IDS = Object.freeze({
  loading: 'stateLoading',
  notbili: 'stateNotBili',
  ready: 'stateReady',
  downloading: 'stateDownloading',
  extracting: 'stateExtracting',
  results: 'stateResults',
  nosub: 'stateNoSub',
  error: 'stateError',
});

const MEDIA_MESSAGE_TYPES = Object.freeze({
  resolveMediaOptions: 'RESOLVE_MEDIA_OPTIONS',
  startMediaDownload: 'START_MEDIA_DOWNLOAD',
  cancelMediaDownload: 'CANCEL_MEDIA_DOWNLOAD',
  mediaDownloadProgress: 'MEDIA_DOWNLOAD_PROGRESS',
  getActiveJobs: 'GET_ACTIVE_JOBS',
});

const UPDATE_MESSAGE_TYPES = Object.freeze({
  checkForUpdate: 'CHECK_FOR_UPDATE',
  applyUpdate: 'APPLY_UPDATE',
});

document.addEventListener('DOMContentLoaded', async () => {
  applyStaticText();
  document.getElementById('fetchBtn')?.addEventListener('click', fetchSubtitles);
  document.getElementById('mediaDownloadBtn')?.addEventListener('click', downloadMedia);
  document.getElementById('footerUpdateBtn')?.addEventListener('click', () => handleUpdateButtonClick());
  document.getElementById('updateNowBtn')?.addEventListener('click', () => applyLatestUpdate());
  document.getElementById('activeJobViewBtn')?.addEventListener('click', () => {
    if (appState.runningJob) {
      appState.mediaJobId = appState.runningJob.jobId;
      adaptPipelineStepsToMode(appState.runningJob.request?.modeId);
      showState('downloading');
      handleMediaProgress({ jobId: appState.runningJob.jobId, ...appState.runningJob.state });
    }
  });
  document.getElementById('mediaCancelBtn')?.addEventListener('click', async () => {
    if (appState.mediaJobId) {
      try {
        await chrome.runtime.sendMessage({
          type: MEDIA_MESSAGE_TYPES.cancelMediaDownload,
          jobId: appState.mediaJobId,
        });
      } catch (e) {
        console.warn('Failed to send cancel message:', e);
      }
      appState.mediaJobId = null;
    }
    const indicator = document.getElementById('activeJobIndicator');
    if (indicator) indicator.hidden = true;
    appState.runningJob = null;
    showToast(t('mediaProgressCancelled'));
    showState('ready');
  });
  document.querySelectorAll('.btn-back').forEach((button) => {
    button.addEventListener('click', () => {
      appState.mediaJobId = null;
      showState('ready');
    });
  });

  document.getElementById('starPromptCloseBtn')?.addEventListener('click', async () => {
    hideStarPromptModal();
    await setStorageItem(USAGE_STORAGE_KEYS.starStatus, 'dismissed');
  });

  document.getElementById('starPromptLaterBtn')?.addEventListener('click', async () => {
    hideStarPromptModal();
    await setStorageItem(USAGE_STORAGE_KEYS.starStatus, 'later');
  });

  document.getElementById('starPromptActionBtn')?.addEventListener('click', async () => {
    hideStarPromptModal();
    await setStorageItem(USAGE_STORAGE_KEYS.starStatus, 'starred');
    showStatusToast(t('starPromptThankToast'), 'success');
    const githubUrl = BRAND_CONFIG.links?.github || 'https://github.com/ngiken/KenEasy-BiliCC-Exporter';
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: githubUrl });
    } else {
      window.open(githubUrl, '_blank');
    }
  });

  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.type === MEDIA_MESSAGE_TYPES.mediaDownloadProgress) {
        handleMediaProgress(message);
        if (!document.getElementById('stateReady')?.hidden) {
          refreshActiveJobIndicator();
        }
      }
    });
  }

  if (isStoreInstalled()) {
    const updateBtn = document.getElementById('footerUpdateBtn');
    if (updateBtn) updateBtn.style.display = 'none';
    const banner = document.getElementById('updateBanner');
    if (banner) banner.hidden = true;
    await initActiveTab();
  } else {
    await Promise.all([
      initActiveTab(),
      checkForUpdates({ force: false, silent: true }),
    ]);
  }
});

if (typeof chrome !== 'undefined' && chrome.tabs) {
  chrome.tabs.onActivated.addListener(() => initActiveTab());
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status !== 'complete' && !changeInfo.url) return;
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      if (activeTab?.id === tabId) initActiveTab();
    });
  });
}

async function initActiveTab() {
  showState('loading');
  setText('loadingText', t('loading'));
  appState.video = null;
  appState.subtitles = null;

  try {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      showState('notbili');
      return;
    }

    const tab = await getActiveTab();
    if (!isBilibiliVideo(tab?.url)) {
      showState('notbili');
      return;
    }

    const video = await getVideoInfoFromTab(tab);
    appState.video = video;
    populateVideoCard(video);

    try {
      const jobsRes = await chrome.runtime.sendMessage({ type: MEDIA_MESSAGE_TYPES.getActiveJobs });
      if (jobsRes?.success && jobsRes.data?.length > 0) {
        const myJob = jobsRes.data.find(j => j.request?.bvid === video.bvid);
        if (myJob && myJob.state) {
          appState.mediaJobId = myJob.jobId;
          adaptPipelineStepsToMode(myJob.request?.modeId);
          showState('downloading');
          handleMediaProgress({ jobId: myJob.jobId, ...myJob.state });
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to restore active jobs:', e);
    }

    showState('ready');
    loadMediaOptions(video);

    if (!video.aid || !video.cid) {
      hydrateVideoDetail(video.bvid);
    }
  } catch (error) {
    showError(error);
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

function isBilibiliVideo(url) {
  return /bilibili\.com\/video\/BV[0-9A-Za-z]{10}/.test(url || '');
}

async function getVideoInfoFromTab(tab) {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_VIDEO_INFO' });
    if (response?.success && response.data) return response.data;
  } catch (error) {
    console.warn(`${BRAND_CONFIG.logPrefix} Unable to read page state, falling back to URL.`, error);
  }

  const match = tab.url.match(/BV[0-9A-Za-z]{10}/);
  if (!match) throw new Error(t('currentPageNotVideo'));
  return {
    bvid: match[0],
    title: cleanTitle(tab.title) || t('unknownTitle'),
    aid: null,
    cid: null,
    pages: [],
    currentP: 1,
  };
}

async function hydrateVideoDetail(bvid) {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'FETCH_VIDEO_DETAIL', bvid });
    if (!response?.success || !response.data || appState.video?.bvid !== bvid) return;

    appState.video = {
      ...appState.video,
      aid: response.data.aid,
      cid: response.data.cid,
      title: response.data.title || appState.video.title,
      pages: response.data.pages || appState.video.pages,
    };
    populateVideoCard(appState.video);
    loadMediaOptions(appState.video);
  } catch (error) {
    console.warn(`${BRAND_CONFIG.logPrefix} Video detail fallback failed.`, error);
  }
}

function populateVideoCard(info) {
  setText('videoTitle', info.title || t('unknownTitle'));
  setText('bvidTag', info.bvid || 'BV...');
  setText('durationTag', formatDuration(info.pages?.[0]?.duration));
}

async function fetchSubtitles() {
  if (!appState.video) return;

  showState('extracting');
  updateProgress(5, t('progressStart'));
  setStep(1, t('progressVideo'), 'active');
  setStep(2, t('progressTracks'));
  setStep(3, t('progressDone'));

  try {
    const tab = await getActiveTab();
    const stored = await getStoredSubtitles(appState.video.bvid, appState.video.cid);
    let subtitleData = null;

    updateProgress(25, t('progressVideo'));
    setStep(1, t('videoInfoDone'), 'done');
    setStep(2, t('progressTracks'), 'active');

    if (stored?.subtitles?.length) {
      subtitleData = await buildTracksFromStoredHint(stored);
    }

    if (!subtitleData?.tracks?.length) {
      subtitleData = await requestSubtitlesFromBackground(tab?.id, stored);
    }

    appState.subtitles = subtitleData;
    if (!subtitleData?.hasSubtitles || subtitleData.tracks.length === 0) {
      showNoSubtitle(subtitleData);
      return;
    }

    updateProgress(85, t('tracksFound', [subtitleData.tracks.length]));
    setStep(2, t('tracksFound', [subtitleData.tracks.length]), 'done');
    setStep(3, t('progressDone'), 'active');

    renderResults(subtitleData.tracks);
    updateProgress(100, t('progressDone'));
    setStep(3, t('progressDone'), 'done');

    await wait(250);
    showState('results');
  } catch (error) {
    showError(error);
  }
}

async function requestSubtitlesFromBackground(tabId, stored) {
  const video = appState.video;
  const response = await chrome.runtime.sendMessage({
    type: 'FETCH_SUBTITLES',
    bvid: video.bvid,
    aid: video.aid || stored?.aid || null,
    cid: video.cid || stored?.cid || null,
    tabId: tabId || null,
  });

  if (!response) throw new Error(t('backgroundNoResponse'));
  if (!response.success) throw new Error(response.error || t('subtitleApiFailed'));
  return response.data;
}

async function buildTracksFromStoredHint(stored) {
  const tracks = [];
  for (const subtitle of stored.subtitles) {
    try {
      tracks.push({
        lan: subtitle.lan,
        lanDoc: subtitle.lan_doc,
        entries: await downloadSubtitleJson(subtitle.subtitle_url),
      });
    } catch (error) {
      console.warn(`${BRAND_CONFIG.logPrefix} Failed to use cached subtitle hint.`, error);
    }
  }
  return { hasSubtitles: tracks.length > 0, needLogin: false, tracks };
}

async function getStoredSubtitles(bvid, cid) {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) return resolve(null);

      if (cid && items[`${STORAGE_PREFIX}${bvid}_${cid}`]) {
        return resolve(items[`${STORAGE_PREFIX}${bvid}_${cid}`]);
      }

      const keys = Object.keys(items)
        .filter((key) => key.startsWith(`${STORAGE_PREFIX}${bvid}_`))
        .sort((a, b) => (items[b].timestamp || 0) - (items[a].timestamp || 0));
      return resolve(keys.length ? items[keys[0]] : null);
    });
  });
}

async function downloadSubtitleJson(url) {
  const normalizedUrl = url?.startsWith('//') ? `https:${url}` : url;
  const response = await fetch(normalizedUrl, { credentials: 'include' });
  if (!response.ok) throw new Error(t('subtitleFileFailed', [response.status]));
  const data = await response.json();
  return data.body || [];
}

function renderResults(tracks) {
  setText('videoTitle2', appState.video.title || t('unknownTitle'));
  setText('bvidTag2', appState.video.bvid || 'BV...');
  renderTracks(tracks);
  showPreview(tracks[0]);
  recordSuccessfulUsage();
}

function renderTracks(tracks) {
  const list = document.getElementById('tracksList');
  if (!list) return;
  list.replaceChildren();

  tracks.forEach((track, index) => {
    const item = document.createElement('div');
    item.className = 'track-item';

    const meta = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'track-name';
    name.textContent = track.lanDoc || track.lan || 'Subtitle';
    const count = document.createElement('div');
    count.className = 'track-count';
    count.textContent = t('subtitleCount', [track.entries.length]);
    meta.append(name, count);

    const buttons = document.createElement('div');
    buttons.className = 'track-btns';
    buttons.append(
      createDownloadButton(track, index, 'txt'),
      createDownloadButton(track, index, 'srt'),
      createDownloadButton(track, index, 'vtt'),
      createDownloadButton(track, index, 'json'),
      createCopyButton(track, index),
    );

    item.append(meta, buttons);
    list.appendChild(item);
  });
}

function createDownloadButton(track, index, format) {
  const button = document.createElement('button');
  button.className = `dl-btn ${format}`;
  button.id = `dl-${format}-${index}`;
  button.type = 'button';
  button.textContent = format.toUpperCase();
  button.addEventListener('click', () => {
    triggerDownload(track, format, appState.video);
    flashButton(button);
  });
  return button;
}

function createCopyButton(track, index) {
  const button = document.createElement('button');
  button.className = 'dl-btn copy';
  button.id = `dl-copy-${index}`;
  button.type = 'button';
  button.textContent = t('copyText');
  button.title = t('copyTextTitle');
  button.addEventListener('click', async () => {
    const text = toPlainText(track.entries);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      const prev = button.textContent;
      button.textContent = t('copiedText');
      button.classList.add('downloaded');
      showStatusToast(t('copiedSuccessToast'), 'success');
      setTimeout(() => {
        button.textContent = prev;
        button.classList.remove('downloaded');
      }, 1500);
    } catch (e) {
      showStatusToast(t('copyFailedToast'), 'error');
    }
  });
  return button;
}

function formatSubtitleContent(entries, format, track, video) {
  if (format === 'txt') return toPlainText(entries);
  if (format === 'srt') return toSrt(entries);
  if (format === 'vtt') return toVtt(entries);
  if (format === 'json') return toJson(entries, track, video);
  return toPlainText(entries);
}

function triggerDownload(track, format, video) {
  const content = formatSubtitleContent(track.entries, format, track, video);
  const filename = buildSubtitleFilename(video, track, format);
  const mime = format === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8';
  const prefix = format === 'json' ? '' : '\uFEFF';
  const blob = new Blob([`${prefix}${content}`], { type: mime });
  const reader = new FileReader();

  reader.onloadend = () => {
    const dataUrl = reader.result;
    chrome.downloads.download({ url: dataUrl, filename, saveAs: false }, () => {
      if (chrome.runtime.lastError) downloadWithAnchor(dataUrl, filename);
    });
  };
  reader.readAsDataURL(blob);
}

function buildSubtitleFilename(video, track, format) {
  const title = video?.title || t('unknownTitle');
  const language = getTrackLanguageLabel(track);
  return `${safeFilenamePart(title, 96)} - ${safeFilenamePart(language, 40)}.${format}`;
}

function getTrackLanguageLabel(track) {
  return track?.lanDoc || track?.lan || t('unknownLanguage');
}

function toPlainText(entries) {
  return entries.map((entry) => entry.content).filter(Boolean).join('\n');
}

function toSrt(entries) {
  return entries.map((entry, index) => (
    `${index + 1}\n${toSrtTime(entry.from || 0)} --> ${toSrtTime(entry.to || 0)}\n${entry.content || ''}\n`
  )).join('\n');
}

function toSrtTime(value) {
  const totalMs = Math.max(0, Math.round((Number(value) || 0) * 1000));
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const seconds = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const minutes = totalMin % 60;
  const hours = Math.floor(totalMin / 60);
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(ms, 3)}`;
}

function toVtt(entries) {
  const lines = ['WEBVTT\n'];
  entries.forEach((entry, index) => {
    lines.push(`${index + 1}`);
    lines.push(`${toVttTime(entry.from || 0)} --> ${toVttTime(entry.to || 0)}`);
    lines.push(`${entry.content || ''}\n`);
  });
  return lines.join('\n');
}

function toVttTime(value) {
  const totalMs = Math.max(0, Math.round((Number(value) || 0) * 1000));
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const seconds = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const minutes = totalMin % 60;
  const hours = Math.floor(totalMin / 60);
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms, 3)}`;
}

function toJson(entries, track, video) {
  const payload = {
    title: video?.title || '',
    bvid: video?.bvid || '',
    language: getTrackLanguageLabel(track),
    exportedAt: new Date().toISOString(),
    totalEntries: entries.length,
    subtitles: entries.map((entry, index) => ({
      index: index + 1,
      from: Number(entry.from || 0),
      to: Number(entry.to || 0),
      content: entry.content || '',
    })),
  };
  return JSON.stringify(payload, null, 2);
}

function downloadWithAnchor(url, filename) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function showPreview(track) {
  const previewBox = document.getElementById('previewBox');
  const previewText = document.getElementById('previewText');
  if (!previewBox || !previewText || !track) return;

  previewText.textContent = track.entries.slice(0, 10)
    .map((entry) => entry.content)
    .filter(Boolean)
    .join('\n');
  previewBox.classList.add('visible');
}

function showNoSubtitle(data) {
  setText('videoTitle3', appState.video?.title || t('unknownTitle'));
  setText('noSubHint', data?.needLogin ? t('loginRequired') : t('noSubtitle'));
  showState('nosub');
}



async function checkForUpdates({ force = false, silent = false } = {}) {
  const button = document.getElementById('footerUpdateBtn');
  if (button && !silent) {
    button.disabled = true;
    button.textContent = t('updateChecking');
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: UPDATE_MESSAGE_TYPES.checkForUpdate,
      force: !!force,
    });
    if (!response?.success) throw new Error(response?.error || t('updateFailed'));
    appState.updateInfo = response.data;
    renderUpdateState(response.data);
    return response.data;
  } catch (error) {
    console.warn(`${BRAND_CONFIG.logPrefix} Update check failed.`, error);
    if (!silent) {
      setUpdateStatus(error.message || t('updateFailed'), false);
    }
    return null;
  } finally {
    if (button) button.disabled = false;
  }
}

function renderUpdateState(info) {
  const banner = document.getElementById('updateBanner');
  const button = document.getElementById('footerUpdateBtn');
  if (isStoreInstalled()) {
    if (banner) banner.hidden = true;
    if (button) button.style.display = 'none';
    return;
  }
  if (!info) {
    if (banner) banner.hidden = true;
    if (button) {
      button.classList.remove('has-update');
      button.textContent = t('updateCheckNow');
    }
    return;
  }

  if (info.hasUpdate) {
    if (banner) {
      banner.hidden = false;
      setText('updateBannerTitle', t('updateBannerTitle'));
      setText('updateBannerBody', t('updateBannerBody', [info.latestVersion]));
      setText('updateNowBtn', t('updateNow'));
    }
    if (button) {
      button.classList.add('has-update');
      button.textContent = t('updateButton');
      button.title = t('updateAvailable', [info.latestVersion]);
    }
    return;
  }

  if (banner) banner.hidden = true;
  if (button) {
    button.classList.remove('has-update');
    button.textContent = t('updateCheckNow');
    button.title = t('updateLatest', [info.currentVersion || getExtensionVersion()]);
  }
}

async function handleUpdateButtonClick() {
  const info = appState.updateInfo;
  if (info?.hasUpdate) {
    await applyLatestUpdate();
    return;
  }
  showStatusToast(t('updateChecking'), 'info');
  const result = await checkForUpdates({ force: true, silent: false });
  if (result?.hasUpdate) {
    setUpdateStatus(t('updateAvailable', [result.latestVersion]), true);
  } else if (result) {
    // Explicit "already latest" feedback is required by product UX.
    showStatusToast(t('updateLatest', [result.currentVersion || getExtensionVersion()]), 'success');
    setUpdateStatus(t('updateLatest', [result.currentVersion || getExtensionVersion()]), true);
  } else {
    showStatusToast(t('updateFailed'), 'error');
  }
}

async function applyLatestUpdate() {
  const button = document.getElementById('footerUpdateBtn');
  const nowBtn = document.getElementById('updateNowBtn');
  if (button) {
    button.disabled = true;
    button.textContent = t('updateDownloading');
  }
  if (nowBtn) {
    nowBtn.disabled = true;
    nowBtn.textContent = t('updateDownloading');
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: UPDATE_MESSAGE_TYPES.applyUpdate,
      preferStore: true,
    });
    if (!response?.success) throw new Error(response?.error || t('updateApplyFailed'));

    const payload = response.data;
    if (!payload.applied) {
      setUpdateStatus(t('updateLatest', [payload.result?.currentVersion || getExtensionVersion()]), false);
      renderUpdateState(payload.result);
      return;
    }

    if (payload.strategy === 'github_package' && payload.guideUrl) {
      const guide = new URL(payload.guideUrl);
      guide.searchParams.set('current', payload.result?.currentVersion || getExtensionVersion());
      guide.searchParams.set('latest', payload.result?.latestVersion || '');
      guide.searchParams.set('package', payload.packageName || '');
      guide.searchParams.set('release', payload.result?.releaseUrl || '');
      chrome.tabs.create({ url: guide.toString() });
    }

    setUpdateStatus(t('updateDownloaded'), true);
    if (payload.result) renderUpdateState(payload.result);
  } catch (error) {
    setUpdateStatus(error.message || t('updateApplyFailed'), false);
  } finally {
    if (button) button.disabled = false;
    if (nowBtn) {
      nowBtn.disabled = false;
      nowBtn.textContent = t('updateNow');
    }
    if (button && !appState.updateInfo?.hasUpdate) {
      button.textContent = t('updateCheckNow');
    } else if (button) {
      button.textContent = t('updateButton');
    }
  }
}

function setUpdateStatus(message, isSuccess) {
  showStatusToast(message, isSuccess ? 'success' : 'error');
  const hint = document.getElementById('mediaHint');
  if (hint && !document.getElementById('stateReady')?.hidden) {
    hint.textContent = message;
    hint.style.color = isSuccess ? 'var(--green)' : 'var(--danger)';
  }
  const button = document.getElementById('footerUpdateBtn');
  if (button) button.title = message;
}

function showStatusToast(message, kind = 'info') {
  const toast = document.getElementById('statusToast');
  if (!toast) return;
  toast.hidden = false;
  toast.textContent = message;
  toast.classList.add('is-visible');
  toast.classList.remove('is-success', 'is-error', 'is-info');
  toast.classList.add(kind === 'success' ? 'is-success' : kind === 'error' ? 'is-error' : 'is-info');
  clearTimeout(showStatusToast._timer);
  showStatusToast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.hidden = true;
  }, 3200);
}

async function loadMediaOptions(video) {
  const qualitySelect = document.getElementById('mediaQualitySelect');
  const modeSelect = document.getElementById('mediaModeSelect');
  const downloadBtn = document.getElementById('mediaDownloadBtn');
  if (!qualitySelect || !modeSelect || !video?.bvid) return;

  qualitySelect.disabled = true;
  modeSelect.disabled = true;
  if (downloadBtn) downloadBtn.disabled = true;
  setText('mediaHint', t('mediaHint'));

  try {
    const tab = await getActiveTab();
    const response = await chrome.runtime.sendMessage({
      type: MEDIA_MESSAGE_TYPES.resolveMediaOptions,
      bvid: video.bvid,
      aid: video.aid || null,
      cid: video.cid || null,
      tabId: tab?.id || null,
      modeId: modeSelect.value || 'video_with_audio',
      qualityId: 'auto',
    });

    if (!response?.success || !response.data) {
      throw new Error(response?.error || t('mediaOptionsFailed'));
    }

    appState.mediaOptions = response.data;
    fillSelect(qualitySelect, response.data.qualities || [], (item) => ({
      value: item.id,
      label: item.labelKey ? t(item.labelKey) : (item.label || item.id),
    }), 'auto');
    fillSelect(modeSelect, response.data.modes || [], (item) => ({
      value: item.id,
      label: item.labelKey ? t(item.labelKey) : (item.label || item.id),
    }), 'video_with_audio');

    qualitySelect.disabled = false;
    modeSelect.disabled = false;
    if (downloadBtn) downloadBtn.disabled = false;
  } catch (error) {
    console.warn(`${BRAND_CONFIG.logPrefix} Media options unavailable.`, error);
    appState.mediaOptions = null;
    fillSelect(qualitySelect, [{ id: 'auto', labelKey: 'qualityAuto' }], (item) => ({
      value: item.id,
      label: t(item.labelKey),
    }), 'auto');
    fillSelect(modeSelect, [
      { id: 'video_with_audio', labelKey: 'downloadVideoWithAudio' },
      { id: 'audio_only', labelKey: 'downloadAudioOnly' },
      { id: 'video_only', labelKey: 'downloadVideoOnly' },
    ], (item) => ({
      value: item.id,
      label: t(item.labelKey),
    }), 'video_with_audio');
    qualitySelect.disabled = false;
    modeSelect.disabled = false;
    if (downloadBtn) downloadBtn.disabled = false;
    setText('mediaHint', error.message || t('mediaOptionsFailed'));
  }
}

function fillSelect(select, items, mapItem, preferredValue) {
  select.replaceChildren();
  items.forEach((item) => {
    const mapped = mapItem(item);
    const option = document.createElement('option');
    option.value = mapped.value;
    option.textContent = mapped.label;
    select.appendChild(option);
  });
  if (preferredValue && Array.from(select.options).some((option) => option.value === preferredValue)) {
    select.value = preferredValue;
  }
}

function adaptPipelineStepsToMode(modeId) {
  const stepVideo = document.getElementById('mediaStepRow2');
  const stepRemux = document.getElementById('mediaStepRow4');
  if (modeId === 'audio_only') {
    if (stepVideo) stepVideo.style.display = 'none';
    if (stepRemux) stepRemux.style.display = 'none';
  } else {
    if (stepVideo) stepVideo.style.display = '';
    if (stepRemux) stepRemux.style.display = '';
  }
}

async function downloadMedia() {
  if (!appState.video?.bvid) return;

  const qualitySelect = document.getElementById('mediaQualitySelect');
  const modeSelect = document.getElementById('mediaModeSelect');
  const selectedMode = modeSelect?.value || 'video_with_audio';
  const jobId = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  appState.mediaJobId = jobId;

  adaptPipelineStepsToMode(selectedMode);
  showState('downloading');
  resetMediaProgress();
  updateMediaProgress(4, t('mediaProgressStart'));
  setMediaStep(1, t('mediaStepResolve'), 'active');

  try {
    const tab = await getActiveTab();
    let video = appState.video;
    if (!video.aid || !video.cid) {
      const detail = await chrome.runtime.sendMessage({ type: 'FETCH_VIDEO_DETAIL', bvid: video.bvid });
      if (detail?.success && detail.data) {
        video = {
          ...video,
          aid: detail.data.aid,
          cid: detail.data.cid || video.cid,
          title: detail.data.title || video.title,
        };
        appState.video = video;
      }
    }

    const response = await chrome.runtime.sendMessage({
      type: MEDIA_MESSAGE_TYPES.startMediaDownload,
      jobId,
      bvid: video.bvid,
      aid: video.aid || null,
      cid: video.cid || null,
      title: video.title || t('unknownTitle'),
      tabId: tab?.id || null,
      modeId: selectedMode,
      qualityId: qualitySelect?.value || 'auto',
    });

    if (!response) throw new Error(t('backgroundNoResponse'));
    if (!response.success) {
      if (response.error?.includes('cancelled')) {
        showToast(t('mediaProgressCancelled'));
        showState('ready');
        return;
      }
      throw new Error(response.error || t('mediaDownloadFailed'));
    }

    setMediaDoneState(response.data?.filename, 0);
  } catch (error) {
    if (error.message?.includes('cancelled')) {
      showToast(t('mediaProgressCancelled'));
      showState('ready');
      return;
    }
    showError(error);
  } finally {
    appState.mediaJobId = null;
  }
}

function setMediaDoneState(filename, totalBytes = 0) {
  const spinner = document.getElementById('mediaSpinner');
  const doneVisual = document.getElementById('mediaDoneVisual');
  const kicker = document.getElementById('downloadingKicker');
  const pulseDot = document.getElementById('mediaPulseDot');
  const btnLabel = document.getElementById('mediaBackBtnLabel');
  const cancelBtn = document.getElementById('mediaCancelBtn');
  const backBtn = document.getElementById('mediaBackBtn');
  const savedPill = document.getElementById('mediaSavedFilePill');
  const savedName = document.getElementById('mediaSavedFileName');

  if (spinner) spinner.hidden = true;
  if (doneVisual) doneVisual.hidden = false;
  if (pulseDot) pulseDot.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'none';
  if (kicker) kicker.textContent = t('mediaDoneKicker');
  if (btnLabel) btnLabel.textContent = t('mediaDoneBtn');
  if (backBtn) {
    backBtn.classList.remove('btn-secondary');
    backBtn.classList.add('btn-primary');
  }

  setText('mediaMetricSpeed', t('metricDoneSpeed') || '✓');
  setText('mediaMetricSize', totalBytes ? formatBytes(totalBytes) : '100%');
  setText('mediaMetricEta', '0s');

  updateMediaProgress(100, t('mediaProgressDone'));
  setMediaStep(1, t('mediaStepResolve'), 'done');
  setMediaStep(2, t('mediaStepVideo'), 'done');
  setMediaStep(3, t('mediaStepAudio'), 'done');
  setMediaStep(4, t('mediaStepRemux'), 'done');
  setMediaStep(5, t('mediaStepSave'), 'done');

  if (savedPill && savedName && filename) {
    savedName.textContent = filename;
    savedPill.hidden = false;
  }

  if (filename) {
    const info = document.getElementById('mediaProgressInfo');
    if (info) info.textContent = `${t('mediaProgressDone')} (100%)\n${filename}`;
    setText('mediaHint', `${t('mediaProgressDone')}: ${filename}`);
  }

  const activeIndicator = document.getElementById('activeJobIndicator');
  if (activeIndicator) activeIndicator.hidden = true;
  appState.runningJob = null;
  recordSuccessfulUsage();
}

function handleMediaProgress(message) {
  if (!message || (appState.mediaJobId && message.jobId && message.jobId !== appState.mediaJobId)) return;

  if (message.phase === 'cancelled') {
    appState.mediaJobId = null;
    showToast(t('mediaProgressCancelled'));
    showState('ready');
    return;
  }

  if (message.phase === 'done' || message.percent === 100) {
    setMediaDoneState(message.filename, message.totalBytes || message.loadedBytes);
    return;
  }

  const spinner = document.getElementById('mediaSpinner');
  const doneVisual = document.getElementById('mediaDoneVisual');
  const kicker = document.getElementById('downloadingKicker');
  const pulseDot = document.getElementById('mediaPulseDot');
  const btnLabel = document.getElementById('mediaBackBtnLabel');
  const cancelBtn = document.getElementById('mediaCancelBtn');

  if (spinner) spinner.hidden = false;
  if (doneVisual) doneVisual.hidden = true;
  if (pulseDot) pulseDot.style.display = 'inline-block';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
  if (kicker) kicker.textContent = t('downloadingKicker');
  if (btnLabel) btnLabel.textContent = t('backButton');

  const label = message.messageKey ? t(message.messageKey) : t('mediaProgressStart');
  updateMediaProgress(message.percent || 0, label);

  // Live metrics display
  const speedEl = document.getElementById('mediaMetricSpeed');
  const sizeEl = document.getElementById('mediaMetricSize');
  const etaEl = document.getElementById('mediaMetricEta');

  if (speedEl) {
    speedEl.textContent = formatSpeed(message.speedBps);
  }

  if (sizeEl) {
    if (message.indeterminate) {
      sizeEl.textContent = `${formatBytes(message.loadedBytes)}...`;
    } else if (message.totalBytes && message.totalBytes > 0) {
      sizeEl.textContent = `${formatBytes(message.loadedBytes)} / ${formatBytes(message.totalBytes)}`;
    } else if (message.loadedBytes) {
      sizeEl.textContent = formatBytes(message.loadedBytes);
    } else {
      sizeEl.textContent = '--';
    }
  }

  if (etaEl) {
    etaEl.textContent = formatEta(message.etaSeconds);
  }

  // 5-Stage Transparent Pipeline:
  // 1: Resolve, 2: Video, 3: Audio, 4: Remux, 5: Save
  const phase = message.phase;
  if (phase === 'resolve' || phase === 'select') {
    setMediaStep(1, t('mediaStepResolve'), 'active');
    setMediaStep(2, t('mediaStepVideo'), '');
    setMediaStep(3, t('mediaStepAudio'), '');
    setMediaStep(4, t('mediaStepRemux'), '');
    setMediaStep(5, t('mediaStepSave'), '');
  } else if (phase === 'video') {
    setMediaStep(1, t('mediaStepResolve'), 'done');
    setMediaStep(2, t('mediaStepVideo'), 'active');
    setMediaStep(3, t('mediaStepAudio'), '');
    setMediaStep(4, t('mediaStepRemux'), '');
    setMediaStep(5, t('mediaStepSave'), '');
  } else if (phase === 'audio') {
    setMediaStep(1, t('mediaStepResolve'), 'done');
    setMediaStep(2, t('mediaStepVideo'), 'done');
    setMediaStep(3, t('mediaStepAudio'), 'active');
    setMediaStep(4, t('mediaStepRemux'), '');
    setMediaStep(5, t('mediaStepSave'), '');
  } else if (phase === 'remux') {
    setMediaStep(1, t('mediaStepResolve'), 'done');
    setMediaStep(2, t('mediaStepVideo'), 'done');
    setMediaStep(3, t('mediaStepAudio'), 'done');
    setMediaStep(4, t('mediaStepRemux'), 'active');
    setMediaStep(5, t('mediaStepSave'), '');
  } else if (phase === 'save') {
    setMediaStep(1, t('mediaStepResolve'), 'done');
    setMediaStep(2, t('mediaStepVideo'), 'done');
    setMediaStep(3, t('mediaStepAudio'), 'done');
    setMediaStep(4, t('mediaStepRemux'), 'done');
    setMediaStep(5, t('mediaStepSave'), 'active');
  }
}

function resetMediaProgress() {
  const spinner = document.getElementById('mediaSpinner');
  const doneVisual = document.getElementById('mediaDoneVisual');
  const kicker = document.getElementById('downloadingKicker');
  const pulseDot = document.getElementById('mediaPulseDot');
  const btnLabel = document.getElementById('mediaBackBtnLabel');
  const cancelBtn = document.getElementById('mediaCancelBtn');
  const backBtn = document.getElementById('mediaBackBtn');
  const savedPill = document.getElementById('mediaSavedFilePill');

  if (spinner) spinner.hidden = false;
  if (doneVisual) doneVisual.hidden = true;
  if (pulseDot) pulseDot.style.display = 'inline-block';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
  if (kicker) kicker.textContent = t('downloadingKicker');
  if (btnLabel) btnLabel.textContent = t('backButton');
  if (backBtn) {
    backBtn.classList.remove('btn-primary');
    backBtn.classList.add('btn-secondary');
  }
  if (savedPill) savedPill.hidden = true;

  setText('mediaMetricSpeed', '--');
  setText('mediaMetricSize', '--');
  setText('mediaMetricEta', '--');

  updateMediaProgress(0, t('mediaProgressStart'));
  setMediaStep(1, t('mediaStepResolve'), 'active');
  setMediaStep(2, t('mediaStepVideo'), '');
  setMediaStep(3, t('mediaStepAudio'), '');
  setMediaStep(4, t('mediaStepRemux'), '');
  setMediaStep(5, t('mediaStepSave'), '');
}

async function refreshActiveJobIndicator() {
  const indicator = document.getElementById('activeJobIndicator');
  const jobText = document.getElementById('activeJobText');
  if (!indicator || !jobText) return;
  try {
    const res = await chrome.runtime.sendMessage({ type: MEDIA_MESSAGE_TYPES.getActiveJobs });
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      const job = res.data[0];
      appState.runningJob = job;
      const percent = job.state?.percent || 0;
      const title = job.request?.title || '';
      jobText.textContent = `${t('activeJobRunning')}: ${percent}% ${title ? `· ${title}` : ''}`;
      indicator.hidden = false;
      return;
    }
  } catch (e) {
    // Ignore when background not responsive
  }
  indicator.hidden = true;
  appState.runningJob = null;
}

function updateMediaProgress(percent, textValue) {
  const bar = document.getElementById('mediaProgressBar');
  const info = document.getElementById('mediaProgressInfo');
  if (bar) {
    bar.style.width = `${percent}%`;
    bar.parentElement?.setAttribute('aria-valuenow', String(percent));
  }
  if (info) info.textContent = `${textValue} (${percent}%)`;
}

function setMediaStep(number, textValue, status = '') {
  const row = document.getElementById(`mediaStepRow${number}`);
  const label = document.getElementById(`mediaStep${number}`);
  if (label) label.textContent = textValue;
  if (!row) return;
  row.classList.remove('active', 'done');
  if (status) row.classList.add(status);
}

function showError(error) {
  showState('error');
  setText('errorMsg', `${t('errorPrefix')}${error.message || String(error)}`);
}

function showState(state) {
  Object.values(STATE_IDS).forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.hidden = true;
  });

  const target = document.getElementById(STATE_IDS[state]);
  if (target) target.hidden = false;

  if (state === 'ready') {
    refreshActiveJobIndicator();
  }
}

function setStep(number, text, status = '') {
  const row = document.getElementById(`stepRow${number}`);
  const label = document.getElementById(`step${number}`);
  if (label) label.textContent = text;
  if (!row) return;

  row.classList.remove('active', 'done');
  if (status) row.classList.add(status);
}

function updateProgress(percent, text) {
  const bar = document.getElementById('progressBar');
  const info = document.getElementById('progressInfo');
  if (bar) {
    bar.style.width = `${percent}%`;
    bar.parentElement?.setAttribute('aria-valuenow', String(percent));
  }
  if (info) info.textContent = `${text} (${percent}%)`;
}

function flashButton(button) {
  const originalText = button.textContent;
  button.textContent = t('downloaded');
  button.classList.add('downloaded');
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('downloaded');
  }, 1200);
}

function formatDuration(seconds) {
  if (!seconds) return t('unknownDuration');
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${pad(secs, 2)}`;
}

function cleanTitle(title) {
  return (title || '').replace(/\s*-\s*bilibili.*$/i, '').replace(/\s*-\s*\u54d4\u54e9\u54d4\u54e9.*$/i, '').trim();
}

function safeFilename(name) {
  return safeFilenamePart(name, 80);
}

function safeFilenamePart(name, maxLength) {
  const cleaned = String(name || 'subtitle')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return (cleaned || 'subtitle').slice(0, maxLength);
}

function pad(value, length) {
  return String(value).padStart(length, '0');
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}


function applyStaticText() {
  const uiLanguage = typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage
    ? chrome.i18n.getUILanguage()
    : 'en';
  document.documentElement.lang = uiLanguage.startsWith('zh') ? 'zh-CN' : 'en';
  setText('headerSubtitle', t('headerSubtitle'));
  setText('loadingKicker', t('loadingKicker'));
  setText('notBiliKicker', t('notBiliKicker'));
  setText('notBiliTitle', t('notBiliTitle'));
  setText('currentVideoLabel', t('currentVideoLabel'));
  setText('extractingKicker', t('extractingKicker'));
  setText('availableTracksLabel', t('availableTracksLabel'));
  setText('checkedVideoLabel', t('checkedVideoLabel'));
  setText('noSubTitle', t('noSubTitle'));
  setText('errorTitle', t('errorTitle'));
  setText('notBiliText', t('notBili'));
  setText('loadingText', t('loading'));
  setText('videoTitle', t('unknownTitle'));
  setText('durationTag', t('unknownDuration'));
  setText('fetchBtnLabel', t('fetchButton'));
  setText('mediaDownloadLabel', t('mediaDownloadLabel'));
  setText('mediaQualityLabel', t('mediaQualityLabel'));
  setText('mediaModeLabel', t('mediaModeLabel'));
  setText('mediaHint', t('mediaHint'));
  setText('mediaDownloadBtnLabel', t('mediaDownloadButton'));
  setText('updateBannerTitle', t('updateBannerTitle'));
  setText('updateBannerBody', t('updateBannerBody', [getExtensionVersion()]));
  setText('updateNowBtn', t('updateNow'));
  const updateBtn = document.getElementById('footerUpdateBtn');
  if (updateBtn) updateBtn.textContent = t('updateCheckNow');
  setText('downloadingKicker', t('downloadingKicker'));
  setText('mediaProgressInfo', `${t('mediaProgressStart')} (0%)`);
  setText('mediaStep1', t('mediaStepResolve'));
  setText('mediaStep2', t('mediaStepVideo'));
  setText('mediaStep3', t('mediaStepAudio'));
  setText('mediaStep4', t('mediaStepRemux'));
  setText('mediaStep5', t('mediaStepSave'));
  setText('mediaMetricSpeedLabel', t('metricSpeedLabel'));
  setText('mediaMetricSizeLabel', t('metricSizeLabel'));
  setText('mediaMetricEtaLabel', t('metricEtaLabel'));
  setText('mediaBgAssuranceText', t('mediaBgAssurance'));
  setText('mediaCancelBtnLabel', t('cancelButton'));
  setText('activeJobViewBtn', t('activeJobViewBtn'));
  setText('starPromptKicker', t('starPromptKicker'));
  setText('starPromptTitle', t('starPromptTitle'));
  setText('starPromptBody', t('starPromptBody'));
  setText('starPromptActionLabel', t('starPromptActionLabel'));
  setText('starPromptLaterLabel', t('starPromptLaterLabel'));
  setText('progressInfo', `${t('progressStart')} (0%)`);
  setText('step1', t('progressVideo'));
  setText('step2', t('progressTracks'));
  setText('step3', t('progressDone'));
  setText('videoTitle2', t('unknownTitle'));
  setText('previewLabel', t('previewLabel'));
  setText('videoTitle3', t('unknownTitle'));
  setText('noSubHint', t('noSubtitle'));
  setText('errorMsg', t('errorPrefix'));
  document.querySelectorAll('.btn-back').forEach((button) => {
    button.textContent = t('backButton');
  });
  setText('mediaBackBtnLabel', t('backButton'));
  setText('footerVersion', `${t('extensionName')} v${getExtensionVersion()}`);
  setText('footerHelp', t('helpLink'));
  setText('footerGithub', t('footerGithub'));
  setText('footerStar', t('footerStar'));
  globalThis.KenEasyTheme?.setLabels({
    toLight: t('themeToLight'),
    toDark: t('themeToDark'),
  });
}

function isStoreInstalled() {
  try {
    const manifest = chrome?.runtime?.getManifest?.();
    return Boolean(manifest?.update_url && manifest.update_url.includes('google.com'));
  } catch {
    return false;
  }
}

function getExtensionVersion() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
    return chrome.runtime.getManifest().version;
  }
  return '3.0.0';
}

function t(key, substitutions = []) {
  if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
    const message = chrome.i18n.getMessage(key, substitutions.map(String));
    if (message) return message;
  }

  let text = FALLBACK_TEXT[key] || key;
  substitutions.forEach((value, index) => {
    text = text
      .replace(`{${index}}`, value)
      .replace('{count}', value)
      .replace('{status}', value)
      .replace('{version}', value);
  });
  return text;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
