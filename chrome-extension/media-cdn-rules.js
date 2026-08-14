/**
 * Data-driven CDN access rules for Bilibili media hosts.
 * Chrome forbids setting Referer on extension fetch(); DNR enforces it instead.
 */
(function registerMediaCdnRules(root) {
  const PAGE_ORIGIN = 'https://www.bilibili.com';
  const DESKTOP_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

  const rules = Object.freeze({
    pageOrigin: PAGE_ORIGIN,
    pageReferer: PAGE_ORIGIN + '/',
    userAgent: DESKTOP_UA,
    // Domains that require bilibili page Referer or return HTTP 403.
    requestDomains: Object.freeze([
      'bilivideo.com',
      'bilivideo.cn',
      'akamaized.net',
      'hdslb.com',
      'biliapi.net',
      'biliapi.com',
      'szbdyd.com',
      'acgvideo.com',
      'ourvideo.com',
    ]),
    resourceTypes: Object.freeze([
      'xmlhttprequest',
      'media',
      'other',
      'image',
      'object',
      'sub_frame',
    ]),
    dnrRuleIdBase: 91001,
  });

  function buildSessionRules() {
    const domainRules = rules.requestDomains.map((domain, index) => ({
      id: rules.dnrRuleIdBase + index + 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Referer', operation: 'set', value: rules.pageReferer },
          { header: 'User-Agent', operation: 'set', value: rules.userAgent },
        ],
      },
      condition: {
        requestDomains: [domain],
        resourceTypes: rules.resourceTypes.slice(),
      },
    }));

    // Universal rule for background service worker / offscreen media downloads (-1 tab ID)
    domainRules.push({
      id: rules.dnrRuleIdBase,
      priority: 2,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Referer', operation: 'set', value: rules.pageReferer },
          { header: 'User-Agent', operation: 'set', value: rules.userAgent },
        ],
      },
      condition: {
        tabIds: [-1],
        excludedRequestDomains: [
          'api.github.com',
          'github.com',
          'raw.githubusercontent.com',
          'objects.githubusercontent.com',
          'release-assets.githubusercontent.com',
        ],
        resourceTypes: rules.resourceTypes.slice(),
      },
    });

    return domainRules;
  }

  async function ensureCdnHeaderRules() {
    if (!chrome.declarativeNetRequest?.updateSessionRules) {
      console.warn('[KenEasy BiliCC] declarativeNetRequest unavailable; CDN Referer rewrite skipped.');
      return false;
    }

    const addRules = buildSessionRules();
    const removeRuleIds = addRules.map((rule) => rule.id);
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds,
      addRules,
    });
    return true;
  }

  root.KenEasyMediaCdnRules = Object.freeze({
    config: rules,
    buildSessionRules,
    ensureCdnHeaderRules,
  });
}(globalThis));
