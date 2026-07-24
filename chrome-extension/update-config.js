(function registerUpdateConfig(root) {
  const config = Object.freeze({
    github: Object.freeze({
      owner: 'ngiken',
      repo: 'KenEasy-BiliCC-Exporter',
      latestApi: 'https://api.github.com/repos/ngiken/KenEasy-BiliCC-Exporter/releases/latest',
      releasesPage: 'https://github.com/ngiken/KenEasy-BiliCC-Exporter/releases/latest',
      accept: 'application/vnd.github+json',
      userAgent: 'KenEasy-BiliCC-Exporter-Update-Check',
    }),
    assets: Object.freeze({
      manualZip: 'KenEasy-BiliCC-Exporter-manual-install.zip',
      storeZip: 'KenEasy-BiliCC-Exporter-store.zip',
    }),
    storage: Object.freeze({
      lastCheckAt: 'keneasy_bilicc_update_last_check_at',
      lastResult: 'keneasy_bilicc_update_last_result',
    }),
    messages: Object.freeze({
      checkForUpdate: 'CHECK_FOR_UPDATE',
      applyUpdate: 'APPLY_UPDATE',
    }),
    strategies: Object.freeze([
      Object.freeze({ id: 'store_request' }),
      Object.freeze({ id: 'github_package', preferredAsset: 'manualZip' }),
    ]),
    checkCooldownMs: 30 * 60 * 1000,
    autoCheckOnPopupOpen: true,
  });

  Object.defineProperty(root, 'KENEASY_UPDATE_CONFIG', {
    value: config,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}(globalThis));
