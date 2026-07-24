(function registerKenEasyTheme(root) {
  const config = root.KENEASY_BILICC_CONFIG;
  const storageKey = config?.storage?.appearance || 'keneasy_bilicc_preferences_appearance';
  const themeRules = Object.freeze({
    allowed: Object.freeze(['light', 'dark']),
    fallback: 'light',
    darkQuery: '(prefers-color-scheme: dark)',
    themeColors: Object.freeze({ light: '#f5f5f7', dark: '#09090b' }),
  });

  let labels = Object.freeze({ toLight: 'Switch to light appearance', toDark: 'Switch to dark appearance' });
  let hasSavedPreference = false;

  function systemTheme() {
    return root.matchMedia?.(themeRules.darkQuery).matches ? 'dark' : themeRules.fallback;
  }

  function normalizeTheme(value) {
    return themeRules.allowed.includes(value) ? value : systemTheme();
  }

  function applyTheme(value) {
    const theme = normalizeTheme(value);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    document.body?.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeRules.themeColors[theme]);
    // Keep system form controls aligned with our explicit theme tokens.
    if (document.body) {
      document.body.style.color = theme === 'dark' ? '#f5f5f7' : '#1d1d1f';
      document.body.style.backgroundColor = theme === 'dark' ? '#09090b' : '#f5f5f7';
    }
    syncControl();
    return theme;
  }

  function readSavedTheme() {
    return new Promise((resolve) => {
      if (!root.chrome?.storage?.local) return resolve(null);
      root.chrome.storage.local.get(storageKey, (items) => {
        if (root.chrome.runtime?.lastError) return resolve(null);
        const saved = items?.[storageKey];
        resolve(themeRules.allowed.includes(saved) ? saved : null);
      });
    });
  }

  function persistTheme(theme) {
    if (!root.chrome?.storage?.local) return;
    root.chrome.storage.local.set({ [storageKey]: theme });
  }

  function syncControl() {
    const control = document.querySelector('[data-theme-toggle]');
    if (!control) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    control.setAttribute('aria-pressed', String(isDark));
    control.setAttribute('aria-label', isDark ? labels.toLight : labels.toDark);
  }

  function setLabels(nextLabels) {
    labels = Object.freeze({ ...labels, ...nextLabels });
    syncControl();
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = applyTheme(current === 'dark' ? 'light' : 'dark');
    hasSavedPreference = true;
    persistTheme(next);
  }

  function wireControls() {
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', toggleTheme);
    syncControl();
  }

  applyTheme(systemTheme());
  readSavedTheme().then((saved) => {
    hasSavedPreference = Boolean(saved);
    if (saved) applyTheme(saved);
  });

  const media = root.matchMedia?.(themeRules.darkQuery);
  media?.addEventListener?.('change', () => {
    if (!hasSavedPreference) applyTheme(systemTheme());
  });

  document.addEventListener('DOMContentLoaded', wireControls, { once: true });

  Object.defineProperty(root, 'KenEasyTheme', {
    value: Object.freeze({ applyTheme, setLabels }),
    configurable: false,
    enumerable: false,
    writable: false,
  });
}(globalThis));
