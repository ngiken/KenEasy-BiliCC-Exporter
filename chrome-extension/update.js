(function () {
  const params = new URLSearchParams(location.search);
  const current = params.get('current') || (chrome.runtime?.getManifest ? chrome.runtime.getManifest().version : '3.0.0');
  const latest = params.get('latest') || '-';
  const packageName = params.get('package') || 'KenEasy-BiliCC-Exporter-manual-install.zip';
  const releaseUrl = params.get('release') || 'https://github.com/ngiken/KenEasy-BiliCC-Exporter/releases/latest';

  let rawLang = params.get('lang') || '';
  if (!rawLang) {
    try {
      const saved = localStorage.getItem('keneasy_bilicc_ui_language');
      if (saved && saved !== 'auto') rawLang = saved;
    } catch (_) {}
  }
  if (!rawLang) {
    rawLang = chrome.i18n?.getUILanguage ? chrome.i18n.getUILanguage() : (navigator.language || 'en');
  }

  const lower = String(rawLang).toLowerCase().replace('-', '_');
  let lang = 'en';
  if (lower.startsWith('zh_tw') || lower.startsWith('zh_hk')) lang = 'zh_TW';
  else if (lower.startsWith('zh')) lang = 'zh_CN';
  else if (lower.startsWith('ja')) lang = 'ja';
  else if (lower.startsWith('ko')) lang = 'ko';

  document.documentElement.lang = lang === 'zh_CN' ? 'zh-CN' : lang === 'zh_TW' ? 'zh-TW' : lang;

  const COPIES = {
    zh_CN: {
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
    },
    zh_TW: {
      eyebrow: '一鍵更新',
      title: '安裝最新版本安裝包',
      lead: '最新版壓縮包已開始下載。請解壓縮後替換本機擴充功能資料夾，並在擴充功能管理頁重新載入。',
      current: '目前版本',
      latest: '最新版本',
      package: '安裝包',
      step1: '解壓縮剛下載的 zip 檔案。',
      step2: '開啟 chrome://extensions，並開啟「開發者模式」。',
      step3: '在 KenEasy BiliCC Exporter 上點擊「重新載入」；或先移除，再點「載入未封裝項目」。',
      step4: '選擇解壓縮後的 KenEasy-BiliCC-Exporter 資料夾。',
      openExtensions: '開啟擴充功能管理頁',
      openRelease: '開啟 Release 頁面',
      note: 'Chrome 無法對已解壓擴充功能熱替換，重新載入資料夾是最後一步。',
    },
    ja: {
      eyebrow: 'ワンクリック更新',
      title: '最新パッケージのインストール',
      lead: '最新のリリースパッケージのダウンロードが開始されました。解凍して上書きし、拡張機能ページで再読み込みしてください。',
      current: '現在のバージョン',
      latest: '最新バージョン',
      package: 'パッケージ',
      step1: 'ダウンロードしたzipファイルを解凍します。',
      step2: 'chrome://extensions を開き、「デベロッパーモード」を有効にします。',
      step3: 'KenEasy BiliCC Exporter の「再読み込み」をクリックするか、削除後に「パッケージ化されていない拡張機能を読み込む」を選択します。',
      step4: '解凍した KenEasy-BiliCC-Exporter フォルダを選択します。',
      openExtensions: '拡張機能ページを開く',
      openRelease: 'Release ページを開く',
      note: 'Chromeは解凍済み拡張機能を自動ホットスワップできないため、フォルダの再読み込みが必要です。',
    },
    ko: {
      eyebrow: '원클릭 업데이트',
      title: '최신 설치 패키지 적용',
      lead: '최신 릴리스 패키지가 다운로드되었습니다. 압축을 풀고 로컬 확장 폴더를 교체한 후 확장 프로그램 관리 페이지에서 다시 로드하세요.',
      current: '현재 버전',
      latest: '최신 버전',
      package: '패키지',
      step1: '다운로드한 zip 파일의 압축을 풉니다.',
      step2: 'chrome://extensions 를 열고 「개발자 모드」를 활성화합니다.',
      step3: 'KenEasy BiliCC Exporter 에서 「다시 로드」를 클릭하거나, 삭제 후 「압축해제된 확장 프로그램을 로드합니다」를 선택합니다.',
      step4: '압축을 푼 KenEasy-BiliCC-Exporter 폴더를 선택합니다.',
      openExtensions: '확장 프로그램 페이지 열기',
      openRelease: '릴리스 페이지 열기',
      note: 'Chrome은 압축 해제된 확장을 자동 교체할 수 없으므로, 폴더를 다시 로드하는 과정이 필수적입니다.',
    },
    en: {
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
    },
  };

  const copy = COPIES[lang] || COPIES.en;

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

  document.getElementById('openExtensionsBtn')?.addEventListener('click', () => {
    if (chrome.tabs?.create) chrome.tabs.create({ url: 'chrome://extensions' });
    else window.open('chrome://extensions', '_blank');
  });

  document.getElementById('openReleaseLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (chrome.tabs?.create) chrome.tabs.create({ url: releaseUrl });
    else window.open(releaseUrl, '_blank');
  });
})();
