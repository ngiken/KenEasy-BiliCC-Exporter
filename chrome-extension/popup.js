const appState = {
  video: null,
  subtitles: null,
  mediaOptions: null,
  mediaJobId: null,
  updateInfo: null,
};

const BRAND_CONFIG = globalThis.KENEASY_BILICC_CONFIG;
const STORAGE_PREFIX = BRAND_CONFIG.storage.subtitleHintPrefix;

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
  footerFormats: 'TXT / SRT',
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
  mediaStepResolve: 'Resolving streams',
  mediaStepDownload: 'Downloading tracks',
  mediaStepSave: 'Saving local file',
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
  mediaDownloadProgress: 'MEDIA_DOWNLOAD_PROGRESS',
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
  document.querySelectorAll('.btn-back').forEach((button) => {
    button.addEventListener('click', () => showState('ready'));
  });

  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.type === MEDIA_MESSAGE_TYPES.mediaDownloadProgress) {
        handleMediaProgress(message);
      }
    });
  }

  await Promise.all([
    initActiveTab(),
    checkForUpdates({ force: false, silent: true }),
  ]);
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

function triggerDownload(track, format, video) {
  const content = format === 'txt' ? toPlainText(track.entries) : toSrt(track.entries);
  const filename = buildSubtitleFilename(video, track, format);
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/plain;charset=utf-8' });
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
  const sec = Number(value) || 0;
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(ms, 3)}`;
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

async function downloadMedia() {
  if (!appState.video?.bvid) return;

  const qualitySelect = document.getElementById('mediaQualitySelect');
  const modeSelect = document.getElementById('mediaModeSelect');
  const jobId = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  appState.mediaJobId = jobId;

  showState('downloading');
  resetMediaProgress();
  updateMediaProgress(5, t('mediaProgressStart'));
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
      modeId: modeSelect?.value || 'video_with_audio',
      qualityId: qualitySelect?.value || 'auto',
    });

    if (!response) throw new Error(t('backgroundNoResponse'));
    if (!response.success) throw new Error(response.error || t('mediaDownloadFailed'));

    updateMediaProgress(100, t('mediaProgressDone'));
    setMediaStep(1, t('mediaStepResolve'), 'done');
    setMediaStep(2, t('mediaStepDownload'), 'done');
    setMediaStep(3, t('mediaStepSave'), 'done');
    await wait(400);
    showState('ready');
    setText('mediaHint', `${t('mediaProgressDone')}: ${response.data.filename}`);
  } catch (error) {
    showError(error);
  } finally {
    appState.mediaJobId = null;
  }
}

function handleMediaProgress(message) {
  if (!message || message.jobId !== appState.mediaJobId) return;
  const label = message.messageKey ? t(message.messageKey) : t('mediaProgressStart');
  updateMediaProgress(message.percent || 0, label);

  if (message.phase === 'resolve' || message.phase === 'select') {
    setMediaStep(1, t('mediaStepResolve'), 'active');
  } else if (message.phase === 'video' || message.phase === 'audio' || message.phase === 'remux') {
    setMediaStep(1, t('mediaStepResolve'), 'done');
    setMediaStep(2, t('mediaStepDownload'), 'active');
  } else if (message.phase === 'save' || message.phase === 'done') {
    setMediaStep(1, t('mediaStepResolve'), 'done');
    setMediaStep(2, t('mediaStepDownload'), 'done');
    setMediaStep(3, t('mediaStepSave'), message.phase === 'done' ? 'done' : 'active');
  }
}

function resetMediaProgress() {
  updateMediaProgress(0, t('mediaProgressStart'));
  setMediaStep(1, t('mediaStepResolve'), 'active');
  setMediaStep(2, t('mediaStepDownload'), '');
  setMediaStep(3, t('mediaStepSave'), '');
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
  setText('mediaStep2', t('mediaStepDownload'));
  setText('mediaStep3', t('mediaStepSave'));
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
  setText('footerVersion', `${t('extensionName')} v${getExtensionVersion()}`);
  setText('footerHelp', t('helpLink'));
  setText('footerGithub', t('footerGithub'));
  setText('footerStar', t('footerStar'));
  globalThis.KenEasyTheme?.setLabels({
    toLight: t('themeToLight'),
    toDark: t('themeToDark'),
  });
}

function getExtensionVersion() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
    return chrome.runtime.getManifest().version;
  }
  return '1.3.1';
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
