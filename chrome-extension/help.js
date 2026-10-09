const HELP_COPY = Object.freeze({
  zh: Object.freeze({
    brandSub: '使用帮助与关于', navStart: '快速开始', navInstall: '安装', navFaq: '常见问题',
    eyebrow: 'KEN EASY · BILICC WORKFLOW', heroTitle: '把 Bilibili CC 字幕，轻松保存下来。',
    heroLead: '打开视频页，即可导出 CC 字幕，或把当前视频（含音频）下载到本地。',
    chipTxt: 'TXT 纯文本', chipSrt: 'SRT 标准字幕', chipFast: '字幕 / 视频', heroCta: '查看三步教程', heroBadge: '字幕 + 视频下载',
    startTitle: '三步完成第一次导出', startLead: '不需要复制链接，也不需要手动寻找字幕接口。',
    stepOneTitle: '打开视频页', stepOneBody: '在 Chrome 打开带有 BV 号的 Bilibili 视频页面，等待页面加载完成。',
    stepTwoTitle: '提取字幕', stepTwoBody: '点击扩展图标，确认当前视频后点击「提取字幕」，等待轨道读取完成。',
    stepThreeTitle: '选择格式', stepThreeBody: '在字幕轨道右侧选择 TXT 或 SRT，文件会自动下载到 Chrome 的下载目录。',
    screensTitle: '认识弹窗里的几个位置', screensLead: '下面的截图可以帮助你快速找到每一步。',
    screenCaptionOne: '字幕轨道列表：每条轨道都可以分别保存为 TXT 或 SRT。', screenCaptionTwo: '动态演示：从当前视频页打开扩展并完成字幕下载。',
    calloutOneTitle: '当前视频', calloutOneBody: '显示视频标题、BV 号和时长，确认你打开的是正确页面。',
    calloutTwoTitle: '字幕轨道', calloutTwoBody: '中文、英文或其他可用语言会分别显示在这里。',
    calloutThreeTitle: '导出格式', calloutThreeBody: 'TXT 适合阅读和编辑，SRT 保留时间轴，适合播放器使用。',
    calloutFourTitle: '字幕预览', calloutFourBody: '下载前可以先查看开头内容，避免选错字幕轨道。',
    installTitle: '第一次安装怎么做？', installLead: 'GitHub 下载的扩展需要通过开发者模式加载。',
    installOne: '下载并解压 KenEasy-BiliCC-Exporter-manual-install.zip。', installTwo: '在 Chrome 地址栏打开 chrome://extensions/。',
    installThree: '打开右上角「开发者模式」，点击「加载已解压的扩展程序」。', installFour: '选择解压后的 chrome-extension 文件夹，然后固定扩展图标。',
    tipLabel: '小提示', tipTitle: '把扩展固定在工具栏', tipBody: '点击 Chrome 工具栏的拼图图标，将 KenEasy BiliCC Exporter 固定下来，之后打开视频就能快速使用。',
    faqTitle: '遇到问题时先看这里', faqLead: '大多数情况都和当前视频的字幕状态有关。',
    faqOneQ: '为什么显示没有字幕？', faqOneA: '这个视频可能没有 CC 字幕，或者字幕还没有被当前页面加载。可以先刷新视频页，再打开扩展重试。',
    faqTwoQ: '为什么需要登录？', faqTwoA: '部分字幕接口只对已登录用户开放。请先在当前 Chrome 浏览器登录 Bilibili，再重新打开扩展。',
    faqMediaQ: '可以下载当前视频和音频吗？', faqMediaA: '可以。在弹窗的“视频下载”区域选择清晰度与模式，即可把视频+音频、仅音频或仅视频保存到本机。',
    faqUpdateQ: '如何更新到最新版？', faqUpdateA: '点击弹窗底部的“检查更新/更新”。若有新版本，会下载最新安装包并打开更新指引，按步骤重新加载扩展即可。',
    faqThreeQ: 'TXT 和 SRT 有什么区别？', faqThreeA: 'TXT 只保留字幕文字，适合阅读和二次编辑；SRT 保留时间轴，适合导入视频播放器或剪辑软件。',
    faqFourQ: '下载的文件在哪里？', faqFourA: '默认会保存到 Chrome 的下载目录。如果浏览器启用了“每次下载前询问保存位置”，会出现保存位置选择框。',
    footerText: '开源、轻量，支持字幕导出与视频下载。', footerClose: '关闭帮助页', themeToLight: '切换到浅色外观', themeToDark: '切换到深色外观',
  }),
  zh_TW: Object.freeze({
    brandSub: '使用說明與關於', navStart: '快速開始', navInstall: '安裝', navFaq: '常見問題',
    eyebrow: 'KEN EASY · BILICC WORKFLOW', heroTitle: '輕鬆儲存 Bilibili CC 字幕與高畫質影音。',
    heroLead: '開啟影片頁，即可匯出 CC 字幕，或把目前影片（含音訊）下載至本機。',
    chipTxt: 'TXT 純文字', chipSrt: 'SRT 標準字幕', chipFast: '字幕 / 影音', heroCta: '檢視三步教學', heroBadge: '字幕 + 影音下載',
    startTitle: '三步完成第一次匯出', startLead: '不需要複製連結，也不需要手動尋找字幕介面。',
    stepOneTitle: '開啟影片頁', stepOneBody: '在 Chrome 開啟帶有 BV 號的 Bilibili 影片頁面，等待頁面載入完成。',
    stepTwoTitle: '擷取字幕', stepTwoBody: '點擊擴充功能圖示，確認目前影片後點擊「擷取字幕」，等待軌道讀取完成。',
    stepThreeTitle: '選擇格式', stepThreeBody: '在字幕軌道右側選擇 TXT 或 SRT，檔案會自動下載至 Chrome 的下載資料夾。',
    screensTitle: '認識彈窗裡的各項功能', screensLead: '下方的螢幕截圖可以幫助你快速找到每個步驟。',
    screenCaptionOne: '字幕軌道列表：每條軌道都可以分別儲存為 TXT 或 SRT。', screenCaptionTwo: '動態示範：從目前影片頁開啟擴充功能並完成字幕下載。',
    calloutOneTitle: '目前影片', calloutOneBody: '顯示影片標題、BV 號與長度，確認你開啟的是正確頁面。',
    calloutTwoTitle: '字幕軌道', calloutTwoBody: '中文、英文或其他可用語言會分別顯示在此處。',
    calloutThreeTitle: '匯出格式', calloutThreeBody: 'TXT 適合閱讀與筆記編輯，SRT 保留時間軸，適合播放器使用。',
    calloutFourTitle: '字幕預覽', calloutFourBody: '下載前可先檢視開頭內容，避免選錯字幕軌道。',
    installTitle: '第一次安裝怎麼做？', installLead: 'GitHub 下載的擴充功能需要透過開發者模式載入。',
    installOne: '下載並解壓縮 KenEasy-BiliCC-Exporter-manual-install.zip。', installTwo: '在 Chrome 網址列開啟 chrome://extensions/。',
    installThree: '開啟右上角「開發者模式」，點擊「載入未封裝項目」。', installFour: '選擇解壓縮後的 chrome-extension 資料夾，然後將圖示釘選在工具列。',
    tipLabel: '小提示', tipTitle: '將擴充功能釘選在工具列', tipBody: '點擊 Chrome 工具列的拼圖圖示將 KenEasy 固定，之後開啟影片即可快速點用。',
    faqTitle: '遇到問題時先看這裡', faqLead: '大多數情況都與目前影片的字幕狀態有關。',
    faqOneQ: '為什麼顯示沒有字幕？', faqOneA: '該影片可能沒有 CC 字幕，或字幕尚未被目前頁面載入。可先重新整理影片頁，再打開擴充功能重試。',
    faqTwoQ: '為什麼需要登入？', faqTwoA: '部分字幕介面僅對已登入用戶開放。請先在目前 Chrome 瀏覽器登入 Bilibili，再重新開啟擴充功能。',
    faqMediaQ: '可以下載目前影片和音訊嗎？', faqMediaA: '可以。在彈窗的「影音下載」區域選擇畫質與模式，即可將影片+音訊、僅音訊或僅影片儲存至本機。',
    faqUpdateQ: '如何更新到最新版？', faqUpdateA: '點擊彈窗底部的「檢查更新/更新」。若有新版本，會下載最新安裝包並開啟更新指引，依步驟重新載入即可。',
    faqThreeQ: 'TXT 和 SRT 有什麼差別？', faqThreeA: 'TXT 只保留文字內容，適合閱讀與 AI 筆記；SRT 保留時間軸，適合匯入播放器或剪輯軟體。',
    faqFourQ: '下載的檔案在哪裡？', faqFourA: '預設會儲存至 Chrome 的下載資料夾。若有開啟「每次下載前詢問儲存位置」，則會出現存檔視窗。',
    footerText: '開源、輕量，支援字幕匯出與影音下載。', footerClose: '關閉說明頁', themeToLight: '切換至淺色外觀', themeToDark: '切換至深色外觀',
  }),
  en: Object.freeze({
    brandSub: 'Help & about', navStart: 'Quick start', navInstall: 'Install', navFaq: 'FAQ',
    eyebrow: 'KEN EASY · BILICC WORKFLOW', heroTitle: 'Save Bilibili CC subtitles with ease.',
    heroLead: 'Open a video to export CC subtitles or download the current media, including audio, to your computer.',
    chipTxt: 'TXT plain text', chipSrt: 'SRT captions', chipFast: 'Subs / media', heroCta: 'See the three-step guide', heroBadge: 'Subtitles + media',
    startTitle: 'Your first export in three steps', startLead: 'No link copying and no manual subtitle hunting.',
    stepOneTitle: 'Open a video page', stepOneBody: 'Open a Bilibili video with a BV ID in Chrome and wait for the page to finish loading.',
    stepTwoTitle: 'Extract subtitles', stepTwoBody: 'Open the extension, confirm the current video, then click Extract subtitles.',
    stepThreeTitle: 'Choose a format', stepThreeBody: 'Pick TXT or SRT beside a subtitle track. Chrome saves the file to its download folder.',
    screensTitle: 'Find your way around the popup', screensLead: 'Use these screenshots to locate each part of the workflow.',
    screenCaptionOne: 'Subtitle tracks: save each available track as TXT or SRT.', screenCaptionTwo: 'Animated demo: open the extension from a video page and download subtitles.',
    calloutOneTitle: 'Current video', calloutOneBody: 'Shows the title, BV ID, and duration so you can confirm the page.',
    calloutTwoTitle: 'Subtitle tracks', calloutTwoBody: 'Each available language appears as its own track here.',
    calloutThreeTitle: 'Export format', calloutThreeBody: 'TXT is best for reading and editing; SRT keeps the timeline for players.',
    calloutFourTitle: 'Subtitle preview', calloutFourBody: 'Check the opening lines before downloading the selected track.',
    installTitle: 'How do I install it?', installLead: 'Chrome extensions downloaded from GitHub are loaded through Developer mode.',
    installOne: 'Download and extract KenEasy-BiliCC-Exporter-manual-install.zip.', installTwo: 'Open chrome://extensions/ in Chrome.',
    installThree: 'Enable Developer mode, then choose Load unpacked.', installFour: 'Select the extracted chrome-extension folder and pin the extension.',
    tipLabel: 'TIP', tipTitle: 'Pin it to the toolbar', tipBody: 'Use Chrome’s puzzle-piece menu to pin KenEasy BiliCC Exporter. It will then be ready whenever you open a video.',
    faqTitle: 'Common questions', faqLead: 'Most issues are related to the current video’s subtitle availability.',
    faqOneQ: 'Why does it say there are no subtitles?', faqOneA: 'The video may not have CC subtitles, or the page may not have loaded them yet. Refresh the video page and try again.',
    faqTwoQ: 'Why is sign-in required?', faqTwoA: 'Some subtitle endpoints are available only to signed-in users. Sign in to Bilibili in this Chrome profile and retry.',
    faqMediaQ: 'Can I download the current video and audio?', faqMediaA: 'Yes. Use the Media download section in the popup to save video + audio, audio only, or video only.',
    faqUpdateQ: 'How do I update to the latest version?', faqUpdateA: 'Click Check for updates / Update in the popup footer. If a newer release exists, the package downloads and an install guide opens.',
    faqThreeQ: 'What is the difference between TXT and SRT?', faqThreeA: 'TXT keeps only the words for reading or editing. SRT keeps timestamps for video players and editing tools.',
    faqFourQ: 'Where are downloaded files saved?', faqFourA: 'Chrome uses its normal Downloads folder unless “Ask where to save each file” is enabled.',
    footerText: 'Open source and lightweight for subtitle export and media download.', footerClose: 'Close help', themeToLight: 'Switch to light appearance', themeToDark: 'Switch to dark appearance',
  }),
  ja: Object.freeze({
    brandSub: 'ヘルプと概要', navStart: 'クイックスタート', navInstall: 'インストール', navFaq: 'よくある質問',
    eyebrow: 'KEN EASY · BILICC WORKFLOW', heroTitle: 'BilibiliのCC字幕や動画を、手軽にローカル保存。',
    heroLead: '動画ページを開くだけで、CC字幕のエクスポートや動画・音声をまとめてPCにダウンロードできます。',
    chipTxt: 'TXT テキスト', chipSrt: 'SRT 字幕', chipFast: '字幕 / 動画', heroCta: '使い方を見る', heroBadge: '字幕＋動画保存',
    startTitle: '3ステップで簡単エクスポート', startLead: 'URLのコピーも字幕APIの手動検索も不要です。',
    stepOneTitle: '動画ページを開く', stepOneBody: 'ChromeでBV番号の付いたBilibili動画ページを開き、読み込み完了を待ちます。',
    stepTwoTitle: '字幕を抽出', stepTwoBody: '拡張機能のアイコンをクリックし、動画情報を確認後「字幕を抽出」をクリックします。',
    stepThreeTitle: '形式を選択', stepThreeBody: '字幕トラック右側のTXTまたはSRTを選択すると、Chromeのダウンロードフォルダに保存されます。',
    screensTitle: 'ポップアップ画面の機能紹介', screensLead: '画面構成を確認してスムーズにご利用いただけます。',
    screenCaptionOne: '字幕トラック一覧：トラックごとにTXTまたはSRT形式で保存できます。', screenCaptionTwo: '動作デモ：動画再生ページから拡張機能を開き字幕を保存。',
    calloutOneTitle: '現在の動画', calloutOneBody: 'タイトル、BV番号、再生時間を表示し、対象ページを確認できます。',
    calloutTwoTitle: '字幕トラック', calloutTwoBody: '日本語、中国語、英語など利用可能な言語がここに一覧表示されます。',
    calloutThreeTitle: '出力形式', calloutThreeBody: 'TXTはAI要約や読書・編集に、SRTは動画プレイヤーや編集ソフトに最適です。',
    calloutFourTitle: '字幕プレビュー', calloutFourBody: 'ダウンロード前に先頭の数行を確認できます。',
    installTitle: 'インストール方法', installLead: 'GitHubからダウンロードしたzipファイルはデベロッパーモードから読み込みます。',
    installOne: 'KenEasy-BiliCC-Exporter-manual-install.zip をダウンロードして解凍します。', installTwo: 'Chromeのアドレスバーで chrome://extensions/ を開きます。',
    installThree: '右上の「デベロッパーモード」を有効にし、「パッケージ化されていない拡張機能を読み込む」をクリックします。', installFour: '解凍した chrome-extension フォルダを選択し、ツールバーに固定します。',
    tipLabel: 'ヒント', tipTitle: 'ツールバーにピン留め', tipBody: 'Chromeの拡張機能メニューからKenEasyをピン留めしておくと、動画を開いた時に素早く使えます。',
    faqTitle: '困ったときは', faqLead: '多くの問題は動画側の字幕配信状態に関連しています。',
    faqOneQ: '字幕が表示されないのはなぜですか？', faqOneA: '対象動画にCC字幕が存在しないか、ページでまだ読み込まれていません。ページを再読み込み後にお試しください。',
    faqTwoQ: 'なぜログインが必要なのですか？', faqTwoA: '一部の字幕APIはログイン済みユーザーにのみ提供されます。現在のChromeでBilibiliにログイン後にお試しください。',
    faqMediaQ: '動画や音声も保存できますか？', faqMediaA: 'はい。「メディアダウンロード」から画質とモードを選択し、動画+音声、音声のみ、または動画のみを保存できます。',
    faqUpdateQ: '最新版への更新方法は？', faqUpdateA: 'ポップアップ下部の「更新を確認」をクリックすると、最新パッケージがダウンロードされ手順が表示されます。',
    faqThreeQ: 'TXTとSRTの違いは何ですか？', faqThreeA: 'TXTは文字のみを保存し要約や学習に適しています。SRTはタイムスタンプを保持し再生プレイヤーに適しています。',
    faqFourQ: '保存先はどこですか？', faqFourA: 'Chromeの通常の「ダウンロード」フォルダに保存されます。',
    footerText: 'オープンソース＆軽量、字幕抽出と動画保存に対応。', footerClose: '閉じる', themeToLight: 'ライトモードに切替', themeToDark: 'ダークモードに切替',
  }),
  ko: Object.freeze({
    brandSub: '도움말 및 정보', navStart: '빠른 시작', navInstall: '설치 방법', navFaq: '자주 묻는 질문',
    eyebrow: 'KEN EASY · BILICC WORKFLOW', heroTitle: 'Bilibili CC 자막과 영상을 간편하게 저장하세요.',
    heroLead: '동영상 페이지를 열면 CC 자막 추출 또는 현재 영상(오디오 포함)을 컴퓨터에 다운로드할 수 있습니다.',
    chipTxt: 'TXT 텍스트', chipSrt: 'SRT 자막', chipFast: '자막 / 영상', heroCta: '3단계 가이드 보기', heroBadge: '자막 + 영상 다운로드',
    startTitle: '3단계로 끝내는 자막 추출', startLead: '링크를 복사하거나 별도의 API를 찾을 필요가 없습니다.',
    stepOneTitle: '동영상 페이지 열기', stepOneBody: 'Chrome에서 BV 번호가 있는 Bilibili 동영상 페이지를 열고 로딩이 완료될 때까지 기다립니다.',
    stepTwoTitle: '자막 추출 클릭', stepTwoBody: '확장 프로그램 아이콘을 클릭하여 비디오를 확인한 후 「자막 추출」을 누릅니다.',
    stepThreeTitle: '포맷 선택 및 저장', stepThreeBody: '자막 트랙 우측에서 TXT 또는 SRT를 선택하면 Chrome 다운로드 폴더로 자동 저장됩니다.',
    screensTitle: '팝업 화면 기능 둘러보기', screensLead: '스크린샷을 통해 단계별 기능을 확인해 보세요.',
    screenCaptionOne: '자막 트랙 목록: 각 트랙을 TXT 또는 SRT 형식으로 개별 저장할 수 있습니다.', screenCaptionTwo: '애니메이션 데모: 비디오 페이지에서 확장 프로그램을 열어 자막을 다운로드합니다.',
    calloutOneTitle: '현재 동영상', calloutOneBody: '제목, BV 번호, 재생 시간을 표시하여 올바른 페이지인지 확인합니다.',
    calloutTwoTitle: '자막 트랙', calloutTwoBody: '한국어, 중국어, 영어 등 사용 가능한 언어가 여기에 표시됩니다.',
    calloutThreeTitle: '내보내기 포맷', calloutThreeBody: 'TXT는 읽기 및 AI 요약 정리에 적합하며, SRT는 영상 재생기에 적합합니다.',
    calloutFourTitle: '자막 미리보기', calloutFourBody: '다운로드 전에 시작 부분의 자막 내용을 미리 확인할 수 있습니다.',
    installTitle: '수동 설치 방법', installLead: 'GitHub에서 다운로드한 파일은 Chrome 개발자 모드를 통해 로드합니다.',
    installOne: 'KenEasy-BiliCC-Exporter-manual-install.zip 파일을 다운로드하고 압축을 풉니다.', installTwo: 'Chrome 주소창에 chrome://extensions/ 를 입력합니다.',
    installThree: '우측 상단의 「개발자 모드」를 켜고 「압축해제된 확장 프로그램을 로드합니다」를 클릭합니다.', installFour: '압축을 푼 chrome-extension 폴더를 선택하고 툴바에 고정합니다.',
    tipLabel: '팁', tipTitle: '툴바에 고정하여 사용하기', tipBody: 'Chrome 퍼즐 조각 메뉴에서 KenEasy를 고정해 두면 동영상을 볼 때 언제든 바로 실행할 수 있습니다.',
    faqTitle: '문제 해결', faqLead: '대부분의 문제는 동영상 페이지의 자막 상태와 관련이 있습니다.',
    faqOneQ: '자막이 없다고 표시되는 이유는 무엇인가요?', faqOneA: '해당 영상에 CC 자막이 없거나 페이지에서 아직 로드되지 않았을 수 있습니다. 새로고침 후 다시 시도해 보세요.',
    faqTwoQ: '로그인이 필요한 이유는 무엇인가요?', faqTwoA: '일부 자막 API는 로그인한 사용자에게만 열려 있습니다. 현재 브라우저에서 Bilibili에 로그인한 후 다시 시도해 주세요.',
    faqMediaQ: '동영상과 오디오도 다운로드할 수 있나요?', faqMediaA: '네. 팝업의 「미디어 다운로드」 영역에서 화질과 모드를 선택하여 비디오+오디오, 오디오만, 또는 비디오만 저장할 수 있습니다.',
    faqUpdateQ: '최신 버전으로 업데이트하려면 어떻게 하나요?', faqUpdateA: '팝업 하단의 「업데이트 확인」을 누르면 최신 설치 패키지가 다운로드되고 안내 페이지가 열립니다.',
    faqThreeQ: 'TXT와 SRT의 차이점은 무엇인가요?', faqThreeA: 'TXT는 텍스트만 보관하여 AI 학습 및 노트에 적합하며, SRT는 타임스탬프를 유지하여 영상 플레이어에 적합합니다.',
    faqFourQ: '다운로드된 파일은 어디에 저장되나요?', faqFourA: 'Chrome의 기본 다운로드 폴더에 저장됩니다.',
    footerText: '오픈 소스 및 초경량 자막 추출 & 영상 다운로더.', footerClose: '도움말 닫기', themeToLight: '라이트 모드로 전환', themeToDark: '다크 모드로 전환',
  }),
});

function browserLanguage() {
  const urlLang = new URLSearchParams(location.search).get('lang');
  if (urlLang) return normalizeLang(urlLang);
  try {
    const saved = localStorage.getItem('keneasy_bilicc_help_language') || localStorage.getItem('keneasy_bilicc_ui_language');
    if (saved && saved !== 'auto') return normalizeLang(saved);
  } catch (_) {}
  const language = typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage ? chrome.i18n.getUILanguage() : navigator.language;
  return normalizeLang(language);
}

function normalizeLang(lang) {
  const lower = String(lang || 'en').toLowerCase().replace('-', '_');
  if (lower.startsWith('zh_tw') || lower.startsWith('zh_hk')) return 'zh_TW';
  if (lower.startsWith('zh')) return 'zh';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('ko')) return 'ko';
  return 'en';
}

function setLanguage(language) {
  const next = normalizeLang(language);
  const copy = HELP_COPY[next] || HELP_COPY.en;
  document.documentElement.lang = next === 'zh' ? 'zh-CN' : next === 'zh_TW' ? 'zh-TW' : next;
  document.title = `KenEasy BiliCC Exporter — ${next === 'zh' ? '使用帮助' : next === 'zh_TW' ? '使用說明' : next === 'ja' ? 'ヘルプ' : next === 'ko' ? '도움말' : 'Help'}`;
  document.querySelectorAll('[data-help]').forEach((node) => {
    const value = copy[node.dataset.help];
    if (value !== undefined) node.textContent = value;
  });
  document.querySelectorAll('[data-help-lang]').forEach((button) => {
    const isActive = button.dataset.helpLang === next || (button.dataset.helpLang === 'zh' && next === 'zh');
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  globalThis.KenEasyTheme?.setLabels({ toLight: copy.themeToLight, toDark: copy.themeToDark });
  try { localStorage.setItem('keneasy_bilicc_help_language', next); } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-help-lang]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.helpLang)));
  document.getElementById('closeHelp')?.addEventListener('click', () => window.close());
  const version = typeof chrome !== 'undefined' && chrome.runtime?.getManifest ? chrome.runtime.getManifest().version : '3.0.0';
  const versionNode = document.getElementById('helpVersion');
  if (versionNode) versionNode.textContent = `v${version}`;
  setLanguage(browserLanguage());
}, { once: true });
