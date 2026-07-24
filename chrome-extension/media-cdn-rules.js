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
    return rules.requestDomains.map((domain, index) => ({
      id: rules.dnrRuleIdBase + index,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Referer', operation: 'set', value: rules.pageReferer },
          { header: 'Origin', operation: 'set', value: rules.pageOrigin },
        ],
      },
      condition: {
        requestDomains: [domain],
        resourceTypes: rules.resourceTypes.slice(),
      },
    }));
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
