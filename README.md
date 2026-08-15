<div align="center">
  <img src="assets/github-preview.png" alt="KenEasy BiliCC Exporter" width="100%">

  <h1>KenEasy BiliCC Exporter</h1>

  <p>
    Export Bilibili CC subtitles from the current video page as <code>TXT</code> or <code>SRT</code>, and download high-definition video & audio with background persistent state recovery.
  </p>

  <p>
    <a href="README.zh-CN.md">中文</a>
    ·
    English
    ·
    <a href="CHANGELOG.md">Changelog</a>
  </p>

  <p>
    <a href="https://chromewebstore.google.com/detail/keneasy-bilicc-exporter/nifdbandikjjmgkagghonjjckmpccgng"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome_Web_Store-Available-4285F4?logo=googlechrome&logoColor=white"></a>
    <img alt="Version" src="https://img.shields.io/badge/version-2.0.1-fb7299">
    <img alt="Manifest" src="https://img.shields.io/badge/manifest-v3-00aeec">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-27c499">
  </p>
</div>

## 🚀 Installation

### Option 1: Chrome Web Store (Recommended)

Install directly with one click from the official store for automatic updates without manual file extraction:

👉 **[Get KenEasy BiliCC Exporter on Chrome Web Store](https://chromewebstore.google.com/detail/keneasy-bilicc-exporter/nifdbandikjjmgkagghonjjckmpccgng)**

### Option 2: Manual Installation (Developer Mode)

If you cannot access the Chrome Web Store:

1. Download `KenEasy-BiliCC-Exporter-manual-install.zip` from the [Latest Release](https://github.com/ngiken/KenEasy-BiliCC-Exporter/releases/latest).
2. Extract the zip file.
3. Open `chrome://extensions/` in Chrome.
4. Enable **Developer mode** in the top right.
5. Click **Load unpacked**.
6. Select the extracted `KenEasy-BiliCC-Exporter` folder.
7. Open a Bilibili video URL (`https://www.bilibili.com/video/BV...`), then click the KenEasy BiliCC Exporter icon.

## 🎬 Video Demos & Core Features

Explore all core workflows through step-by-step real operation screen recordings:

| Feature & Workflow | Walkthrough Video | Highlights |
| :--- | :--- | :--- |
| **1. CC Subtitle Extraction & Export** | 📺 **[Watch Demo (MP4)](assets/videos/demo-subtitle-export.mp4)** | Automatically detects all CC subtitle tracks on the active Bilibili video; preview content and export to standard `SRT` or clean `TXT` (UTF-8 BOM). |
| **2. High-Definition Media Download** | 📺 **[Watch Demo (MP4)](assets/videos/demo-media-download.mp4)** | Select quality (1080P, 720P, etc.) and mode (Video+Audio / Audio-only); merges separated tracks in browser locally into a standard MP4 file. |
| **3. Persistent Background Download & State Recovery** | 📺 **[Watch Demo (MP4)](assets/videos/demo-persistent-background-download.mp4)** | Managed by the background Service Worker — navigate away or close the popup at any time without losing download progress; reopening seamlessly restores status. |

## Highlights

| Capability | Details |
| --- | --- |
| Bilibili page detection | Reads the active video page and resolves `BV`, `aid`, and `cid`. |
| Subtitle discovery | Uses page-observed subtitle data first, then falls back to Bilibili web APIs. |
| Export formats | Saves subtitle tracks as `TXT` or `SRT` with UTF-8 BOM for Windows compatibility. |
| Video / audio download | Saves the current Bilibili video with audio (or audio-only) to your computer. |
| Background persistence | Background Service Worker + Offscreen DOM keeps active downloads alive across popup closes. |
| Smart updates | Store users receive silent auto-updates; developer unpacked users enjoy GitHub release checks. |
| Store-ready footprint | Keeps the extension dependency-free and small for Chrome Web Store packaging. |

## Built-in Help & About

Use the **Help & guide** link at the bottom of the popup to open the extension's built-in help page. It includes:

- A three-step subtitle export guide
- Annotated popup screenshots
- A complete animated usage demo
- Chrome Developer mode installation steps
- TXT / SRT format guidance and common questions

The help page uses only packaged local assets, supports Chinese and English, and follows the same light/dark appearance setting as the popup.

## Package

Zip the contents of the `chrome-extension` folder, not the parent folder:

```bash
python scratch/zip_extension.py
```

Privacy policy: [PRIVACY.md](PRIVACY.md)

Store publish checklist: [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md)

## Architecture

The extension is intentionally layered, decoupled, rule-based, and data-driven.

```text
brand-config.js
  Shared product naming, message namespaces, log prefixes, and storage prefixes.

content-main.js
  Runs in the page world, observes Bilibili player/subtitle responses, and performs same-page fetches.

content.js
  Runs in the isolated extension world, bridges popup/background messages, and caches subtitle hints.

background.js
  Owns Bilibili API calls, WBI signing, subtitle JSON loading, and error normalization.

popup.js
  Owns UI state, cache preference, TXT/SRT conversion, preview, downloads, and update actions.

update-config.js / update-service.js
  Data-driven GitHub release checks and package download strategies.
```

## Friends / 友情链接

- [LINUX DO](https://linux.do)

## License

MIT
