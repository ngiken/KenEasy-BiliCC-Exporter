# Chrome Web Store Publish Guide

For KenEasy BiliCC Exporter

## Do you need code changes first?

No major rewrite is needed. The package is already store-ready.

Recommended prep only:
1. Use KenEasy-BiliCC-Exporter-store.zip (manifest.json at zip root)
2. Publish PRIVACY.md and use it as Privacy Policy URL
3. Prepare 1-5 screenshots
4. Fill permission justifications
5. Keep version 1.3.1 for first store release, or bump if you prefer

### Update behavior after store install
- Chrome Web Store installs are auto-updated by Chrome itself
- The in-extension Check Update button still works:
  - store install: prefers chrome.runtime.requestUpdateCheck
  - load unpacked: falls back to GitHub zip download guide
- You do NOT need a new self-extract auto-updater for store users

## 1. Build package

`ash
python scratch/zip_extension.py
`

Upload this file only:
- KenEasy-BiliCC-Exporter-store.zip

Do not upload:
- KenEasy-BiliCC-Exporter-manual-install.zip
- any .pem private key

## 2. Developer Dashboard

1. Open https://chrome.google.com/webstore/devconsole
2. Sign in with the paid developer account
3. Click New item
4. Upload KenEasy-BiliCC-Exporter-store.zip

## 3. Listing copy

### Name
KenEasy BiliCC Exporter

### Summary
EN: Export Bilibili CC subtitles (TXT/SRT) and download the current video with audio.
ZH: Export Bilibili / B-site CC subtitles (TXT/SRT) and download the current video with audio.

### Detailed description
KenEasy BiliCC Exporter helps you:
- Export Bilibili CC / closed captions as TXT or SRT
- Download the currently open Bilibili video, including audio
- Keep a small dependency-free popup workflow
- Check for updates

How to use:
1. Open a bilibili.com video page
2. Click the extension icon
3. Export subtitles and/or download media

Notes:
- Works on the current video page only
- No account system
- No ads / trackers
- Store-installed copies are updated by Chrome automatically

### Category
Productivity or Tools

### Language
English + Chinese (Simplified)

## 4. Privacy policy URL

After PRIVACY.md is on GitHub main:
https://github.com/ngiken/KenEasy-BiliCC-Exporter/blob/main/PRIVACY.md

## 5. Screenshots

Minimum:
- Screenshot 1: popup main UI (assets/popup-demo.png)
- Screenshot 2: subtitle export
- Screenshot 3: media download progress/result

Common size: 1280x800 or 640x400
Icon already included: chrome-extension/icons/icon128.png

## 6. Permission justifications

activeTab: Required to access the URL, title, and DOM of the currently active Bilibili video tab when the user clicks the extension popup, enabling the extraction of subtitle and video data.

storage: Required to store local user preferences such as preferred export format (SRT/TXT), preferred video quality, and UI theme mode (light/dark). No personal user data is collected.

downloads: Required to save the exported subtitle files (.srt/.txt) and processed video/audio media files directly to the user's local default downloads folder.

declarativeNetRequestWithHostAccess: Required to safely append or modify request headers (such as Referer and User-Agent) when requesting subtitle/media chunks from Bilibili API endpoints, preventing playback/download request rejection.

offscreen: Required to perform background audio/video stream muxing and parsing tasks in an isolated offscreen document without freezing or degrading the performance of the main background service worker.

Host permissions (bilibili / bilivideo / hdslb / biliapi): Required to communicate with Bilibili subtitle APIs and fetch media streams from official Bilibili content delivery networks to parse captions and download the selected video.

Host permissions (github): Used only for optional version checks and release asset links for manual-install users.

## 7. Single purpose
This extension provides a dedicated tool for Bilibili users to export CC subtitles and download the corresponding video/audio from the currently active video page for offline study, translation, and local backup.

## 8. Distribution & Compliance (Red Nickel Policy)
- Visibility: Public
- Regions: all or your target markets
- Compliance Note: Do not include promotional or status words (such as "Free", "#1", "Premium", "Best", "Recommended") in store titles, short summaries, or promotional tiles/screenshots.

## 9. After approval
1. You get a Chrome Web Store URL
2. Put Install from Chrome Web Store in README
3. Later releases: bump manifest version -> rebuild zip -> upload in dashboard -> also publish GitHub release for manual users

## Checklist
- [ ] store zip has manifest.json at root
- [ ] no private key in package
- [ ] privacy policy public URL ready
- [ ] screenshots ready
- [ ] permission justifications filled
- [ ] single purpose filled
- [ ] submit for review
