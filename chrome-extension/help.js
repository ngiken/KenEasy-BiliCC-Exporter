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
    faqMediaQ: '可以下载当前视频和音频吗？', faqMediaA: '可以。在弹窗的“视频下载”区域选择清晰度与模式，即可把视频+音频、仅音频或仅视频保存到本机。', faqUpdateQ: '如何更新到最新版？', faqUpdateA: '点击弹窗底部的“检查更新/更新”。若有新版本，会下载最新安装包并打开更新指引，按步骤重新加载扩展即可。', faqThreeQ: 'TXT 和 SRT 有什么区别？', faqThreeA: 'TXT 只保留字幕文字，适合阅读和二次编辑；SRT 保留时间轴，适合导入视频播放器或剪辑软件。',
    faqFourQ: '下载的文件在哪里？', faqFourA: '默认会保存到 Chrome 的下载目录。如果浏览器启用了“每次下载前询问保存位置”，会出现保存位置选择框。',
    footerText: '开源、轻量，支持字幕导出与视频下载。', footerClose: '关闭帮助页', themeToLight: '切换到浅色外观', themeToDark: '切换到深色外观',
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
    faqMediaQ: 'Can I download the current video and audio?', faqMediaA: 'Yes. Use the Media download section in the popup to save video + audio, audio only, or video only.', faqUpdateQ: 'How do I update to the latest version?', faqUpdateA: 'Click Check for updates / Update in the popup footer. If a newer release exists, the package downloads and an install guide opens.', faqThreeQ: 'What is the difference between TXT and SRT?', faqThreeA: 'TXT keeps only the words for reading or editing. SRT keeps timestamps for video players and editing tools.',
    faqFourQ: 'Where are downloaded files saved?', faqFourA: 'Chrome uses its normal Downloads folder unless “Ask where to save each file” is enabled.',
    footerText: 'Open source and lightweight for subtitle export and media download.', footerClose: 'Close help', themeToLight: 'Switch to light appearance', themeToDark: 'Switch to dark appearance',
  }),
});

function browserLanguage() {
  const language = typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage ? chrome.i18n.getUILanguage() : navigator.language;
  return language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

function getInitialLanguage() {
  try { return localStorage.getItem('keneasy_bilicc_help_language') || browserLanguage(); } catch (_) { return browserLanguage(); }
}

function setLanguage(language) {
  const next = language === 'en' ? 'en' : 'zh';
  const copy = HELP_COPY[next];
  document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
  document.title = `KenEasy BiliCC Exporter — ${next === 'zh' ? '使用帮助' : 'Help'}`;
  document.querySelectorAll('[data-help]').forEach((node) => {
    const value = copy[node.dataset.help];
    if (value !== undefined) node.textContent = value;
  });
  document.querySelectorAll('[data-help-lang]').forEach((button) => {
    button.classList.toggle('active', button.dataset.helpLang === next);
    button.setAttribute('aria-pressed', String(button.dataset.helpLang === next));
  });
  globalThis.KenEasyTheme?.setLabels({ toLight: copy.themeToLight, toDark: copy.themeToDark });
  try { localStorage.setItem('keneasy_bilicc_help_language', next); } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-help-lang]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.helpLang)));
  document.getElementById('closeHelp')?.addEventListener('click', () => window.close());
  const version = typeof chrome !== 'undefined' && chrome.runtime?.getManifest ? chrome.runtime.getManifest().version : '1.1.0';
  const versionNode = document.getElementById('helpVersion');
  if (versionNode) versionNode.textContent = `v${version}`;
  setLanguage(getInitialLanguage());
}, { once: true });
