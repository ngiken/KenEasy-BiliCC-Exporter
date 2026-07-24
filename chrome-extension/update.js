(function () {
  const params = new URLSearchParams(location.search);
  const current = params.get('current') || (chrome.runtime.getManifest ? chrome.runtime.getManifest().version : '-');
  const latest = params.get('latest') || '-';
  const packageName = params.get('package') || 'KenEasy-BiliCC-Exporter-manual-install.zip';
  const releaseUrl = params.get('release') || 'https://github.com/ngiken/KenEasy-BiliCC-Exporter/releases/latest';

  const uiLanguage = chrome.i18n?.getUILanguage ? chrome.i18n.getUILanguage() : 'en';
  const isZh = String(uiLanguage).toLowerCase().startsWith('zh');
  document.documentElement.lang = isZh ? 'zh-CN' : 'en';

  const copy = isZh ? {
    eyebrow: '一键更新',
    title: '安装最新版本安装包',
    lead: '最新版压缩包已开始下载。请解压后替换本地扩展目录，并在扩展管理页重新加载。',
    current: '当前版本',
    latest: '最新版本',
    package: '安装包',
    step1: '解压刚下载的 zip 文件。',
    step2: '打开 chrome://extensions，并开启“开发者模式”。',
    step3: '在 KenEasy BiliCC Exporter 上点击“重新加载”；或先移除，再点“加载已解压的扩展程序”。',
    step4: '选择解压后的 KenEasy-BiliCC-Exporter 文件夹。',
    openExtensions: '打开扩展管理页',
    openRelease: '打开 Release 页面',
    note: 'Chrome 无法对已解压扩展做热替换，重新加载目录是最后一步。',
  } : {
    eyebrow: 'ONE-CLICK UPDATE',
    title: 'Install the latest package',
    lead: 'The newest release package has been downloaded. Extract it, replace the unpacked folder, and reload the extension.',
    current: 'Current',
    latest: 'Latest',
    package: 'Package',
    step1: 'Extract the downloaded zip file.',
    step2: 'Open chrome://extensions and enable Developer mode.',
    step3: 'Click Reload on KenEasy BiliCC Exporter, or Remove it and Load unpacked again.',
    step4: 'Select the extracted KenEasy-BiliCC-Exporter folder.',
    openExtensions: 'Open extensions page',
    openRelease: 'Open release page',
    note: 'Chrome cannot hot-swap unpacked extensions automatically. Reloading the folder is the final required step.',
  };

  const set = (id, text) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  };

  set('updateEyebrow', copy.eyebrow);
  set('updateTitle', copy.title);
  set('updateLead', copy.lead);
  set('currentLabel', copy.current);
  set('latestLabel', copy.latest);
  set('currentVersion', 'v' + current);
  set('latestVersion', latest === '-' ? '-' : ('v' + latest));
  set('packageLine', copy.package + ': ' + packageName);
  set('step1', copy.step1);
  set('step2', copy.step2);
  set('step3', copy.step3);
  set('step4', copy.step4);
  set('openExtensionsBtn', copy.openExtensions);
  set('updateNote', copy.note);

  const releaseBtn = document.getElementById('openReleaseBtn');
  if (releaseBtn) {
    releaseBtn.textContent = copy.openRelease;
    releaseBtn.href = releaseUrl;
  }

  document.getElementById('openExtensionsBtn')?.addEventListener('click', () => {
    // chrome:// URLs cannot be opened from extension pages in all contexts; copy as fallback.
    const url = 'chrome://extensions';
    navigator.clipboard?.writeText(url).catch(() => {});
    window.prompt(isZh ? '请手动打开此地址：' : 'Open this URL manually:', url);
  });
}());
