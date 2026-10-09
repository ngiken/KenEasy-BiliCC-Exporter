# Chrome Web Store Listing & Publish Guide (v3.0.0)

> Complete multi-language store listings and submission guidelines for **KenEasy BiliCC Exporter v3.0.0**.
> Prepared for direct copy-pasting into the Google Chrome Web Store Developer Dashboard.

---

## 📦 1. Pre-Submission Checklist

1. **Upload Asset**: Upload `dist/KenEasy-BiliCC-Exporter-v3.0.0.zip` (manifest.json at the archive root).
2. **Category**: `Productivity` or `Photos & Video / Tools`.
3. **Privacy Policy URL**: `https://github.com/ngiken/KenEasy-BiliCC-Exporter/blob/main/PRIVACY.md`
4. **Account Requirements**: None. Zero login required for core features.
5. **Host Permissions Justification**:
   - `https://*.bilibili.com/*`, `https://*.bilivideo.com/*`, `https://*.bilivideo.cn/*`: Required to parse video info, fetch official subtitle files, and download fragmented media streams for client-side muxing.
   - `activeTab`: Required to inspect the current active Bilibili video page when opening popup.
   - `declarativeNetRequestWithHostAccess`: Required to safely append Bilibili Referer header to video chunk requests to bypass 403 anti-leech blocks.
   - `downloads`: Required to write subtitle and MP4/M4A files directly to local disk.
   - `notifications`: Required to send desktop notifications when long background downloads complete.
   - `offscreen`: Required to perform in-browser demuxing and remuxing without blocking UI threads.

---

## 🌐 2. Multi-Language Store Listings (All 5 Languages)

---

### 🇺🇸 English (EN)

**Title / Extension Name:**
```
KenEasy BiliCC Exporter - Subtitles & Media Downloader
```

**Summary (Short Description - max 132 chars):**
```
Export Bilibili CC subtitles (TXT/SRT/VTT/JSON) and download HD video & audio locally with real-time speed monitoring.
```

**Detailed Description:**
```markdown
KenEasy BiliCC Exporter V3.0 is a clean, lightweight, privacy-focused browser extension designed for Bilibili users. It operates directly on your active video tab, providing two industry-grade capabilities in one unified popup:

1. One-Click CC Subtitles Export (TXT / SRT / VTT / JSON + Direct Clipboard Copy)
2. High-Definition Media Download (1080P / 720P / 480P MP4 or Pure M4A Audio)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ WHAT MAKES KENEASY V3.0 STAND OUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 LIVE DOWNLOAD SPEEDOMETER & DYNAMIC ETA
Say goodbye to unresponsive download bars stuck at 18%! KenEasy V3.0 features an adaptive asymptotic calculation engine with a rolling 1500ms speedometer. Monitor real-time transfer velocity (MB/s), downloaded size, and accurate estimated remaining time (ETA).

🔄 5-STAGE TRANSPARENT PIPELINE
Every phase is visualized clearly in real time:
1. Stream Resolution → 2. Video Stream → 3. Audio Stream → 4. Local Remuxing → 5. File System Save.

🛡️ BACKGROUND PEACE OF MIND
Feel free to switch tabs, browse the web, or close the popup. Long video downloads continue uninterrupted in the background. A native desktop notification alerts you immediately when your file is ready in your Downloads folder.

📝 COMPLETE SUBTITLE WORKFLOW
• Auto-detects all official CC subtitles (bilingual, Chinese, English, Japanese, etc.).
• Export to 4 versatile formats:
  - TXT: Clean text, ideal for AI summarization, ChatGPT, Notion, or study notes.
  - SRT: Standard subtitle files for VLC, IINA, or PotPlayer.
  - VTT: Web-standard subtitle format.
  - JSON: Full structured data with millisecond timestamps for developers.
• 1-Click "Copy" button: Instantly copy the entire subtitle transcript to your clipboard.

🔒 100% PRIVATE & CLIENT-SIDE
• No login required: Extract subtitles and available streams instantly.
• No cloud uploading: All muxing and parsing runs 100% inside your browser.
• Zero ads, zero analytics trackers, zero data harvesting.

🎨 REFINED APPLE-GRADE AESTHETICS
• Sleek glassmorphic interface with fluid light and dark mode adaptation.
• Built-in multi-language switcher: English, 简体中文, 繁體中文, 日本語, 한국어.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 HOW TO USE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Navigate to any video page on bilibili.com (BV...).
2. Click the KenEasy BiliCC Exporter icon in your browser toolbar.
3. Choose your workflow:
   - Click "Extract subtitles" to preview tracks and save as TXT, SRT, VTT, or JSON.
   - Or select your preferred Quality (1080P, 720P...) and Mode (Video+Audio or Audio-only), then click "Download media".
4. Files are saved directly to your default browser Downloads folder.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 PRIVACY & OPEN SOURCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KenEasy is 100% open source under the MIT License.
GitHub Repository: https://github.com/ngiken/KenEasy-BiliCC-Exporter
```

---

### 🇨🇳 简体中文 (zh-CN)

**标题 / 扩展名称：**
```
KenEasy BiliCC Exporter - 哔哩哔哩字幕与高清视频下载器
```

**一句话简短说明（不超过 132 字符）：**
```
一键导出 B 站 CC 字幕（TXT/SRT/VTT/JSON），支持高清视频与音频极速下载，配备实时测速看板与后台托管。
```

**详细说明（Store Detailed Description）：**
```markdown
KenEasy BiliCC Exporter V3.0 是一款专为 Bilibili（哔哩哔哩）打造的高品味、轻量级、零登录媒体工具箱。无需配置复杂环境，在当前视频播放页一键唤起两大核心能力：

1. CC 字幕全能导出（TXT / SRT / VTT / JSON 四格式导出 + 一键复制全文）
2. 高清音视频极速下载（1080P / 720P / 480P 合成 MP4 或独立提取 M4A 音频）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ V3.0 重磅升级特性
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 实时大厂级测速看板与动态 ETA
彻底告别传统插件卡在 18% 不动、无生命体征的困扰！V3.0 引入自适应渐近推演算法与 1500ms 滑动窗口测速仪，实时呈现传输速度（MB/s）、已接收体积与动态预估剩余时间（ETA）。

🔄 五阶透明流水线
下载全过程环环相扣、清晰可见：
1. 解析媒体流 → 2. 拉取视频流 → 3. 拉取音频流 → 4. 本地合成 MP4 → 5. 落盘保存文件。纯音频模式下自动精简为两步，干净利落。

🛡️ 后台安心托管与桌面通知
下载大型视频时无需守在弹窗前！可随时关闭弹窗或切换其他标签页，后台任务稳定运行不受影响。下载完成时自动发送系统桌面通知，文件名一目了然。

📝 字幕提取与学习神器
• 自动识别视频内所有官方 CC 字幕轨道（中英双语、日语等多语种）。
• 4 种专业导出格式：
  - TXT：纯净文本，非常适合导入 ChatGPT、Kimi、Notion 做 AI 总结或双语笔记。
  - SRT：标准时间轴字幕，通用支持各类播放器与剪辑软件（剪映、PR、FCP）。
  - VTT：Web 标准字幕格式。
  - JSON：含毫秒时间戳的完整结构化数据，方便开发者二次处理。
• 独立「复制」按钮：轻点一下即可将字幕全文复制进剪贴板。

🔒 纯本地运行 · 极致隐私保护
• 零登录门槛：不依赖账号登录，即开即用。
• 100% 本地合成：音视频合并完全在浏览器沙箱内完成，绝不向第三方服务器上传任何视频数据。
• 零广告、零外链追踪、零多余权限滥用。

🎨 媲美原生系统的高级美学
• 苹果级毛玻璃质感，深浅色外观完美自适应。
• 内置快捷多语言切换：简体中文、繁體中文、English、日本語、한국어。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 使用步骤
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 打开任意 bilibili.com 视频页面（BV号）。
2. 点击浏览器工具栏上的 KenEasy 插件图标。
3. 按需选择功能：
   - 点击「提取字幕」：预览各语种字幕并导出为 TXT / SRT / VTT / JSON，或直接复制全文。
   - 自由选择「清晰度」（1080P、720P等）与「模式」（音视频合并或仅音频），点击「下载媒体」。
4. 导出的文件将直接保存到浏览器的本地下载目录中。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 开源与支持
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KenEasy 基于 MIT 协议完全开源，代码透明可信。
GitHub 开源仓库：https://github.com/ngiken/KenEasy-BiliCC-Exporter
```

---

### 🇭🇰 / 🇹🇼 繁體中文 (zh-TW / zh-HK)

**標題 / 擴充功能名稱：**
```
KenEasy BiliCC Exporter - Bilibili 字幕匯出與高畫質影音下載器
```

**簡介（Short Description）：**
```
一鍵匯出 B 站 CC 字幕（TXT/SRT/VTT/JSON），支援高畫質影片與音訊極速下載，配備即時測速儀與背景下載通知。
```

**詳細說明（Detailed Description）：**
```markdown
KenEasy BiliCC Exporter V3.0 是一款專為 Bilibili 打造的高品質、輕量級、免登入影音輔助工具。無需繁瑣配置，直接在目前影片播放頁面一鍵啟用兩大核心功能：

1. CC 字幕全能匯出（TXT / SRT / VTT / JSON 四種格式 + 一鍵複製全文至剪貼簿）
2. 高畫質影音下載（1080P / 720P / 480P 合成 MP4 或單獨擷取 M4A 音訊）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ V3.0 旗艦級重大更新
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 即時測速看板與動態 ETA 預估
徹底告別下載進度卡在 18% 毫無反應的焦慮！V3.0 採用自適應漸近推演演算法與 1500ms 滑動視窗測速器，精準顯示目前下載速度（MB/s）、已傳輸大小與預計剩餘時間（ETA）。

🔄 五階透明化流水線
下載階段全程可視化：
1. 解析串流 → 2. 拉取視訊軌 → 3. 拉取音訊軌 → 4. 本機合成 MP4 → 5. 儲存檔案至本機。純音訊模式自動精簡，流程一目了然。

🛡️ 背景安心下載與系統通知
下載長影片時無需一直開啟彈窗！可隨時關閉彈窗或切換至其他分頁，背景下載持續穩定進行。下載完成後主動發送桌面通知提醒，點擊即可查看。

📝 字幕學習與筆記好幫手
• 自動偵測影片的所有 CC 字幕軌道（中文、英文、日文等）。
• 4 種常用格式快速匯出：
  - TXT：乾淨純文字，適合餵給 AI（ChatGPT、Claude、Notion）產生精華摘要或筆記。
  - SRT：標準外掛字幕，相容各類播放器與剪輯軟體（Final Cut Pro、PR）。
  - VTT：網頁通用字幕格式。
  - JSON：含毫秒級時間戳記的完整結構化資料。
• 獨立「複製」按鍵：一按即可將字幕全文複製到剪貼簿。

🔒 100% 本機執行 · 尊重隱私
• 免登入帳號：無須綁定 B 站帳號即可使用基礎功能。
• 本機串流合成：音視訊合併完全在瀏覽器內部執行，絕不上傳任何個人或影片資料到外部伺服器。
• 無廣告、無第三方追蹤程式碼。

🎨 細緻優雅的介面設計
• 支援淺色與深色主題自適應，毛玻璃質感極致舒適。
• 內建即時多語言切換：繁體中文、簡體中文、English、日本語、한국어。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 使用教學
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 開啟任意 bilibili.com 影片頁面（BV...）。
2. 點擊瀏覽器工具列上的 KenEasy 圖示。
3. 選擇所需功能：
   - 點擊「擷取字幕」：預覽並下載 TXT / SRT / VTT / JSON 字幕，或點擊複製。
   - 選擇「畫質」（1080P、720P...）與「模式」（影音合一或僅音訊），點擊「下載影音」。
4. 檔案將直接儲存至本機預設的「下載」資料夾中。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 開源專案與回饋
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KenEasy 基於 MIT 授權條款開源，歡迎造訪 GitHub 交流與 Star 支持！
GitHub 專案位址：https://github.com/ngiken/KenEasy-BiliCC-Exporter
```

---

### 🇯🇵 日本語 (ja)

**タイトル / 拡張機能名：**
```
KenEasy BiliCC Exporter - Bilibili字幕・動画ダウンローダー
```

**概要（短い説明 - 132文字以内）：**
```
BilibiliのCC字幕（TXT/SRT/VTT/JSON）抽出と、高画質動画・音声のダウンロードツール。リアルタイム速度表示とバックグラウンド完了通知に対応。
```

**詳細説明（Detailed Description）：**
```markdown
KenEasy BiliCC Exporter V3.0 は、Bilibili（ビリビリ動画）向けの洗練された軽量・安全なブラウザ拡張機能です。ログイン不要で、動画再生ページからワンクリックで以下の2大機能を利用できます：

1. CC字幕のエクスポート（TXT / SRT / VTT / JSON 4形式対応 + クリップボードへのワンクリック全文コピー）
2. 高画質メディアのダウンロード（1080P / 720P / 480P MP4結合動画 または M4A音声のみ保存）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ V3.0 の注目機能
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 リアルタイム速度メーターと残り時間（ETA）表示
「プログレスバーが18%で止まって動いているか分からない」という不安を完全に解消！V3.0では適応型漸近計算アルゴリズムと1500msのスライディングウィンドウ速度測定器を搭載。毎秒の転送速度（MB/s）、転送済み容量、正確な推定残り時間をリアルタイムに表示します。

🔄 5段階の透明なパイプライン
処理の全工程を分かりやすく可視化：
1. 再生ストリーム解析 → 2. 映像取得 → 3. 音声取得 → 4. ローカルMP4結合 → 5. ファイル保存。音声のみモード時は自動で工程を最適化します。

🛡️ バックグラウンド安心ダウンロード & 完了通知
長時間の動画でもポップアップを開いたまま待つ必要はありません。ポップアップを閉じたり別タブを開いて作業してもダウンロードは継続。完了時にはデスクトップ通知でお知らせします。

📝 字幕抽出・学習・翻訳に最適
• 動画内に存在する公式CC字幕トラック（日本語、中国語、英語など）を自動検出。
• 4種類の出力フォーマット：
  - TXT：テキストのみ。ChatGPTやNotionでの要約、語学学習ノートに最適。
  - SRT：VLC、Premiere、Final Cut等で使える標準字幕ファイル。
  - VTT：ウェブ標準字幕フォーマット。
  - JSON：タイムスタンプ付きの構造化データ。
• ワンクリック「コピー」機能：ボタン一つで字幕全文をクリップボードにコピー可能。

🔒 100% ローカル処理・完全なプライバシー保護
• ログイン不要：アカウントなしですぐに使えます。
• 完全ローカル結合：動画・音声の合成はすべてブラウザ内部で行われ、外部サーバーへデータを送信することは一切ありません。
• 広告なし、トラッカーなし、安全なオープンソース。

🎨 上質なUIデザイン & 多言語対応
• 洗練されたグラスモーフィズムデザイン、ダーク/ライトテーマに自動適応。
• ツール内で簡単に言語切り替え可能：日本語、English、简体中文、繁體中文、한국어。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 使い方
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. bilibili.com の動画再生ページ（BV...）を開きます。
2. ツールバーの KenEasy アイコンをクリックします。
3. 用途に合わせて選択：
   - 「字幕を抽出」をクリックしてプレビュー・各形式で保存またはコピー。
   - 画質（1080P、720P等）とモード（動画+音声／音声のみ）を選び「メディアをダウンロード」をクリック。
4. ファイルはPCの通常の「ダウンロード」フォルダーに保存されます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 オープンソース
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MITライセンスのオープンソースプロジェクトです。
GitHub: https://github.com/ngiken/KenEasy-BiliCC-Exporter
```

---

### 🇰🇷 한국어 (ko)

**제목 / 확장 프로그램 이름：**
```
KenEasy BiliCC Exporter - Bilibili 자막 및 고화질 영상 다운로더
```

**요약（짧은 설명 - 132자 이내）：**
```
Bilibili CC 자막(TXT/SRT/VTT/JSON) 추출 및 고화질 영상·오디오 다운로드 도구. 실시간 전송 속도 모니터링과 백그라운드 완료 알림 지원.
```

**상세 설명（Detailed Description）：**
```markdown
KenEasy BiliCC Exporter V3.0은 Bilibili(빌리빌리) 이용자를 위한 가볍고 직관적인 미디어 확장 프로그램입니다. 별도의 로그인 없이 현재 동영상 페이지에서 원클릭으로 핵심 기능 2가지를 제공합니다:

1. CC 자막 내보내기 (TXT / SRT / VTT / JSON 4가지 포맷 + 클립보드 원클릭 전체 복사)
2. 고화질 미디어 다운로드 (1080P / 720P / 480P MP4 병합 동영상 또는 M4A 순수 오디오 추출)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ V3.0 핵심 업그레이드 기능
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 실시간 속도 계기판 및 동적 잔여 시간(ETA)
진행률 바가 18%에 멈춰서 다운로드 진행 여부를 알 수 없던 문제를 완벽하게 해결했습니다! V3.0은 적응형 점근 연산 알고리즘과 1500ms 롤링 윈도우 속도 측정기를 탑재하여 초당 전송 속도(MB/s), 전송된 용량, 예상 남은 시간을 실시간으로 안내합니다.

🔄 5단계 투명 파이프라인
다운로드 전 과정이 단계별로 표시됩니다:
1. 스트림 분석 → 2. 비디오 스트림 수신 → 3. 오디오 스트림 수신 → 4. 로컬 MP4 합성 → 5. 로컬 저장. 오디오 전용 모드에서는 불필요한 단계를 자동으로 축소합니다.

🛡️ 백그라운드 안심 다운로드 & 완료 알림
다운로드가 끝날 때까지 팝업 창을 켜둘 필요가 없습니다. 팝업을 닫거나 다른 탭에서 작업을 진행해도 백그라운드에서 정상 다운로드되며, 완료 시 시스템 데스크톱 알림이 전송됩니다.

📝 완벽한 자막 학습 및 번역 지원
• 동영상에 등록된 모든 공식 CC 자막 트랙(한국어, 중국어, 영어 등) 자동 감지.
• 4가지 다목적 파일 형식:
  - TXT: 순수 텍스트. ChatGPT 요약, 노션 정리, 외국어 공부에 최적.
  - SRT: 플레이어 및 영상 편집 프로그램(Premiere, Final Cut)에서 사용하는 표준 자막.
  - VTT: 웹 표준 자막 형식.
  - JSON: 밀리초 단위 타임스탬프가 포함된 구조화 데이터.
• 원클릭 「복사」 버튼: 한 번의 클릭으로 전체 자막 내용을 클립보드에 복사.

🔒 100% 로컬 처리 · 개인정보 보호
• 로그인 불필요: 번거로운 계정 연동 없이 즉시 사용 가능.
• 100% 클라이언트 사이드 변환: 비디오 및 오디오 합성이 브라우저 내부에서만 실행되며 외부 서버로 전송되지 않습니다.
• 광고 없음, 추적기 없음, 가벼운 무설치 구조.

🎨 프리미엄 글래스모피즘 디자인
• 시스템 라이트 및 다크 테마 자동 동기화.
• 직관적인 다국어 전환 기능 탑재: 한국어, English, 简体中文, 繁體中文, 日本語.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 사용 방법
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. bilibili.com 동영상 페이지(BV...)로 이동합니다.
2. 브라우저 툴바의 KenEasy 아이콘을 클릭합니다.
3. 원하는 작업 선택:
   - 「자막 추출」을 눌러 미리보기 및 TXT / SRT / VTT / JSON 저장 또는 복사.
   - 「화질」(1080P, 720P...) 및 「모드」(비디오+오디오 또는 오디오만)를 선택하고 「미디어 다운로드」 클릭.
4. 파일이 컴퓨터의 기본 「다운로드」 폴더로 즉시 저장됩니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 오픈 소스
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KenEasy는 MIT 라이선스 오픈 소스 프로젝트입니다.
GitHub 저장소: https://github.com/ngiken/KenEasy-BiliCC-Exporter
```
