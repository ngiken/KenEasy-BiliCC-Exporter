<div align="center">
  <img src="assets/github-preview.png" alt="KenEasy BiliCC Exporter" width="100%">

  <h1>KenEasy BiliCC Exporter</h1>

  <p>
    Export Bilibili CC subtitles from the current video page as <code>TXT</code> or <code>SRT</code>.
  </p>

  <p>
    <a href="README.zh-CN.md">中文</a>
    ·
    English
    ·
    <a href="CHANGELOG.md">Changelog</a>
  </p>

  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-1.0.3-fb7299">
    <img alt="Manifest" src="https://img.shields.io/badge/manifest-v3-00aeec">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-27c499">
  </p>
</div>

## Overview

KenEasy BiliCC Exporter is a small Chrome extension for Bilibili video pages. It detects the active `BV` video, finds available CC subtitle tracks, and saves them as plain text or standard SRT files.

![KenEasy BiliCC Exporter popup demo](assets/popup-demo.png)

## Highlights

| Capability | Details |
| --- | --- |
| Bilibili page detection | Reads the active video page and resolves `BV`, `aid`, and `cid`. |
| Subtitle discovery | Uses page-observed subtitle data first, then falls back to Bilibili web APIs. |
| Export formats | Saves subtitle tracks as `TXT` or `SRT` with UTF-8 BOM for Windows compatibility. |
| Store-ready footprint | Keeps the extension dependency-free and small for Chrome Web Store packaging. |

## Demo

![KenEasy BiliCC Exporter usage demo](assets/use-demo.gif)

Full usage video: [UseDemo.mp4](UseDemo.mp4)

## Install Locally

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select the `chrome-extension` folder.
5. Open a Bilibili video URL like `https://www.bilibili.com/video/BV...`, then click the KenEasy BiliCC Exporter icon.

## Package

Zip the contents of the `chrome-extension` folder, not the parent folder:

```bash
python scratch/zip_extension.py
```

The generated package is:

```text
KenEasy-BiliCC-Exporter.zip
```

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
  Owns UI state, cache preference, TXT/SRT conversion, preview, and downloads.
```

This keeps page access, extension messaging, API rules, and UI behavior separated so the project can stay maintainable as it grows.

## Project Files

```text
chrome-extension/
  manifest.json
  brand-config.js
  popup.html
  popup.js
  background.js
  content.js
  content-main.js
  icons/
assets/
UseDemo.mp4
KenEasy-BiliCC-Exporter.zip
KenEasy-BiliCC-Exporter.crx
scratch/zip_extension.py
```

## License

MIT
