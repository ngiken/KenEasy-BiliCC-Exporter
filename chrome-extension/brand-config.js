(function registerBrandConfig(root) {
  const config = Object.freeze({
    appName: 'KenEasy BiliCC Exporter',
    shortName: 'BiliCC Exporter',
    headerSubtitle: 'Bilibili CC + media downloader',
    logPrefix: '[KenEasy BiliCC]',
    storage: Object.freeze({
      subtitleHintPrefix: 'keneasy_bilicc_',
      appearance: 'keneasy_bilicc_preferences_appearance',
    }),
    protocol: Object.freeze({
      fetchRequest: 'KENEASY_BILICC_FETCH_REQUEST',
      fetchResponse: 'KENEASY_BILICC_FETCH_RESPONSE',
      binaryFetchRequest: 'KENEASY_BILICC_BINARY_FETCH_REQUEST',
      binaryFetchResponse: 'KENEASY_BILICC_BINARY_FETCH_RESPONSE',
      infoRequest: 'KENEASY_BILICC_INFO_REQUEST',
      infoResponse: 'KENEASY_BILICC_INFO_RESPONSE',
      subtitleIntercepted: 'KENEASY_BILICC_SUBTITLE_INTERCEPTED',
    }),
  });

  Object.defineProperty(root, 'KENEASY_BILICC_CONFIG', {
    value: config,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}(globalThis));
