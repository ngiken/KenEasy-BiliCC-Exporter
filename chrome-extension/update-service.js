/**
 * Update service layer.
 * Rules-driven version compare + GitHub release package resolution.
 * UI stays decoupled; this module only answers check/apply requests.
 */
(function registerUpdateService(root) {
  const CONFIG = root.KENEASY_UPDATE_CONFIG;
  const BRAND = root.KENEASY_BILICC_CONFIG;

  function parseVersion(version) {
    return String(version || '0')
      .trim()
      .replace(/^v/i, '')
      .split(/[.+-]/)
      .filter(Boolean)
      .map((part) => {
        const num = Number(part);
        return Number.isFinite(num) ? num : part;
      });
  }

  function compareVersions(left, right) {
    const a = parseVersion(left);
    const b = parseVersion(right);
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i += 1) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        if (av > bv) return 1;
        if (av < bv) return -1;
        continue;
      }
      const as = String(av);
      const bs = String(bv);
      if (as > bs) return 1;
      if (as < bs) return -1;
    }
    return 0;
  }

  function getCurrentVersion() {
    return chrome.runtime.getManifest().version;
  }

  async function readStorage(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (items) => resolve(items || {}));
    });
  }

  async function writeStorage(values) {
    return new Promise((resolve) => {
      chrome.storage.local.set(values, () => resolve());
    });
  }

  async function fetchLatestRelease() {
    const response = await fetch(CONFIG.github.latestApi, {
      headers: {
        Accept: CONFIG.github.accept,
        'User-Agent': CONFIG.github.userAgent,
      },
    });
    if (!response.ok) {
      throw new Error('GitHub release lookup failed: HTTP ' + response.status);
    }
    return response.json();
  }

  function pickAsset(release, preferredName) {
    const assets = Array.isArray(release && release.assets) ? release.assets : [];
    const exact = assets.find((asset) => asset.name === preferredName);
    if (exact && exact.browser_download_url) return exact;
    const zip = assets.find((asset) => String(asset.name || '').toLowerCase().endsWith('.zip'));
    return zip || null;
  }

  function buildUpdateResult(release) {
    const currentVersion = getCurrentVersion();
    const latestVersion = String((release && (release.tag_name || release.name)) || '').replace(/^v/i, '');
    if (!latestVersion) {
      throw new Error('Latest release version is missing.');
    }

    const manualAsset = pickAsset(release, CONFIG.assets.manualZip);
    const storeAsset = pickAsset(release, CONFIG.assets.storeZip);
    const comparison = compareVersions(latestVersion, currentVersion);

    return {
      currentVersion,
      latestVersion,
      hasUpdate: comparison > 0,
      isSame: comparison === 0,
      isNewerLocal: comparison < 0,
      releaseName: (release && release.name) || ('v' + latestVersion),
      releaseNotes: String((release && release.body) || '').slice(0, 2000),
      releaseUrl: (release && release.html_url) || CONFIG.github.releasesPage,
      publishedAt: (release && release.published_at) || null,
      manualZip: manualAsset
        ? {
            name: manualAsset.name,
            url: manualAsset.browser_download_url,
            size: manualAsset.size || null,
          }
        : null,
      storeZip: storeAsset
        ? {
            name: storeAsset.name,
            url: storeAsset.browser_download_url,
            size: storeAsset.size || null,
          }
        : null,
      checkedAt: Date.now(),
    };
  }

  async function checkForUpdate(options) {
    const force = !!(options && options.force);
    const keys = [CONFIG.storage.lastCheckAt, CONFIG.storage.lastResult];
    const cached = await readStorage(keys);
    const lastCheckAt = Number(cached[CONFIG.storage.lastCheckAt] || 0);
    const lastResult = cached[CONFIG.storage.lastResult] || null;

    if (!force && lastResult && Date.now() - lastCheckAt < CONFIG.checkCooldownMs) {
      return Object.assign({}, lastResult, { fromCache: true });
    }

    const release = await fetchLatestRelease();
    const result = Object.assign({}, buildUpdateResult(release), { fromCache: false });

    await writeStorage({
      [CONFIG.storage.lastCheckAt]: result.checkedAt,
      [CONFIG.storage.lastResult]: result,
    });

    return result;
  }

  async function downloadPackage(url, filename) {
    if (!url) throw new Error('Update package URL is missing.');
    const downloadId = await new Promise((resolve, reject) => {
      chrome.downloads.download(
        {
          url: url,
          filename: filename || CONFIG.assets.manualZip,
          saveAs: false,
          conflictAction: 'uniquify',
        },
        (id) => {
          if (chrome.runtime.lastError || id === undefined) {
            reject(new Error((chrome.runtime.lastError && chrome.runtime.lastError.message) || 'Failed to start update download.'));
            return;
          }
          resolve(id);
        },
      );
    });
    return downloadId;
  }

  async function tryStoreUpdateCheck() {
    if (!chrome.runtime.requestUpdateCheck) {
      return { status: 'unsupported' };
    }
    return new Promise((resolve) => {
      try {
        chrome.runtime.requestUpdateCheck((status, details) => {
          resolve({
            status: status || 'unknown',
            version: (details && details.version) || null,
          });
        });
      } catch (error) {
        resolve({ status: 'error', error: error.message || String(error) });
      }
    });
  }

  async function applyUpdate(options) {
    const preferStore = !options || options.preferStore !== false;
    const result = await checkForUpdate({ force: true });
    if (!result.hasUpdate) {
      return {
        applied: false,
        reason: result.isNewerLocal ? 'local_newer' : 'already_latest',
        result: result,
      };
    }

    if (preferStore) {
      const storeCheck = await tryStoreUpdateCheck();
      if (storeCheck.status === 'update_available') {
        return {
          applied: true,
          strategy: 'store_request',
          storeCheck: storeCheck,
          result: result,
          nextStep: 'reload_extension',
        };
      }
    }

    const packageInfo = result.manualZip || result.storeZip;
    if (!packageInfo || !packageInfo.url) {
      throw new Error('No downloadable update package found in the latest release.');
    }

    const downloadId = await downloadPackage(packageInfo.url, packageInfo.name);
    const guideUrl = chrome.runtime.getURL('update.html');

    return {
      applied: true,
      strategy: 'github_package',
      downloadId: downloadId,
      packageName: packageInfo.name,
      packageUrl: packageInfo.url,
      guideUrl: guideUrl,
      result: result,
      nextStep: 'reload_unpacked',
    };
  }

  root.KenEasyUpdateService = Object.freeze({
    compareVersions: compareVersions,
    checkForUpdate: checkForUpdate,
    applyUpdate: applyUpdate,
    messageTypes: CONFIG.messages,
    logPrefix: (BRAND && BRAND.logPrefix) || '[KenEasy BiliCC]',
  });
}(globalThis));
