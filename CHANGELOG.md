# Changelog

## 3.0.0 - 2026-10-09

Major media downloader modernization, 10-usage milestone star prompt & zero-anxiety streaming engine release.

- **10-Usage Milestone & Open-Source Star Prompt Modal**: Added a delightful, non-intrusive milestone dialog triggering after 10 successful subtitle or media downloads, politely inviting users to support the project with a GitHub Star (`⭐ MILESTONE REACHED`). Features responsive GitHub jump, "Maybe later" snooze, and permanent state persistence.

- **Live Multi-Metric Download Dashboard**: Replaced the static, vague progress bar with an industry-grade live metrics board displaying real-time transfer speed (MB/s), transferred/total bytes (`loaded / total MB`), and dynamic rolling ETA estimation (`remaining seconds/minutes`), giving users complete visibility and peace of mind during large video downloads.
- **Root-Cause Resolution of the 18% Progress Stagnation**: Re-engineered the underlying stream reader in `media-download-service.js`. Implemented an adaptive asymptotic progression heuristic that ensures steady forward progress even when Bilibili CDN omits Content-Length headers or delivers chunked encoding, permanently eliminating the issue where downloads appeared frozen at 18%.
- **Rolling-Window Speedometer**: Added an in-memory 1.5-second rolling window speedometer calculating exponential weighted transfer velocity and reliable ETA without fluctuating wildly across momentary network spikes.
- **5-Stage Transparent Pipeline Visualization**: Upgraded the coarse 3-step indicator into a clear 5-stage pipeline (Stream Resolution → Video Track Fetch → Audio Track Fetch → Local Zero-Loss MP4 Remuxing → Local Storage), accurately mapping workload distribution (video track receiving 64% of total progress span).
- **Background Safe Assurance & Desktop Notifications**: Integrated Chrome `notifications` permission and API. Users are clearly assured that closing the popup or switching tabs will not interrupt downloads; upon completion, a native desktop notification automatically alerts the user.
- **Job Cancellation Control**: Added a dedicated "Cancel Download" (`取消下载`) button powered by browser `AbortController` and Service Worker job tracking, allowing users to safely abort in-flight transfers and reclaim system memory and bandwidth at any moment.
- **Optimized Memory Footprint for Page Context**: Refactored `content-main.js` binary fallback using native browser `FileReader.readAsDataURL` instead of synchronous string chunking, eliminating main-thread freezes and memory bloat on large media streams.
- **Visual Vitality & Micro-Animations**: Introduced an active breathing pulse beacon (Live Activity Pulse Wave) and shimmering progress bar styling (`progress-bar-shimmer`) to deliver immediate visual feedback of active network transfer.
- **Mode-Adaptive Pipeline Pruning**: Dynamically hides video download and remuxing stages when "Audio only" mode is selected, keeping the 5-stage pipeline contextually accurate and eliminating user confusion.
- **Completion File Pill & Primary Action Promotion**: Showcases a clean file pill badge (`#mediaSavedFilePill`) upon download completion displaying the exact saved filename, and automatically promotes the return button to primary visual focus (`.btn-primary`).
- **Active Background Job Indicator**: Added a prominent live beacon indicator on the main card when returning from a background download, complete with real-time percentage and a one-click "View Progress" shortcut back into the live dashboard.
- **Audio-Only Filename Sanitization**: Strips unnecessary video resolution tags (e.g. `1080P`, `480P`) when downloading in audio-only mode, outputting clean `${title} - audio.m4a` filenames.
- **Zero Layout Shifting**: Aligned `.download-header-row .status-visual` precisely with the 42px spinner, eliminating the 24px vertical jump when transitioning between downloading and done states.

## 2.0.4 - 2026-10-02

Subtitle format expansion, anonymous WBI resilience & Git hygiene release.

- **Anonymous & Unauthenticated WBI Signing Resilience**: Resolved an issue where Bilibili's `/x/web-interface/nav` returns `code: -101` for anonymous visitors. The extension now safely extracts WBI keys directly from `navData.data.wbi_img` regardless of login state, restoring signed subtitle requests for all users.
- **WBI Key In-Memory Caching**: Implemented a 1-hour in-memory cache for WBI key pairs in the background service worker, eliminating redundant network roundtrips on every download or extraction request.
- **WAF 412 Defense on Video Detail**: Hardened `getVideoInfo` by prioritizing page-context retrieval with active session cookies and natural referrers, protecting against Bilibili anti-crawler HTTP 412 challenge blocks in background contexts.
- **Expanded Subtitle Formats (VTT & JSON)**: Added WebVTT (`.vtt`) format support for HTML5 video players and structured JSON (`.json`) export for LLM summarization and transcript processing pipelines.
- **One-Click Subtitle Text Copy**: Added an instant "Copy" button to track lists with micro-feedback (`已复制✓`), allowing users to immediately copy subtitle text to clipboard without saving a file.
- **Git Hygiene**: Untracked large video recordings (`assets/videos/*.mp4`) from Git and reinforced `.gitignore` rules in compliance with workspace standards.

## 2.0.3 - 2026-09-03

Minor optimization & robustness release.

- **SRT Timestamp Milliseconds Rollover Fix**: Resolved an edge-case timestamp calculation bug in `toSrtTime()` where sub-second fractional values rounding up to 1000ms generated `,1000` instead of properly advancing the seconds field.
- **IndexedDB Connection Lifecycle & Resource Cleanliness**: Ensured `db.close()` is consistently invoked across IndexedDB read/write transactions in `media-download-service.js` and `offscreen.js`, eliminating memory handle leaks and potential database lock contention.
- **Cross-Origin Window Message Boundary**: Hardened message listeners in `content.js` and `content-main.js` with explicit `event.source === window` origin verification to prevent foreign embedded frames from spoofing communication channels.
- **Version Alignment**: Synced runtime version fallback and manifest definitions to 2.0.3.

## 2.0.2 - 2026-08-23

Chrome Web Store compliance & permissions security refinement.

- **Minimal Permission Security Refinement**: Cleaned up legacy wildcard host permissions (`https://*/*`, `http://*/*`) from `manifest.json`, strictly restricting declarativeNetRequest and host access to verified Bilibili API endpoints, CDN hosts, and GitHub release endpoints.
- **Store Policy Alignment**: Refined store listing metadata and permission justification documentation according to latest Chrome Web Store Developer Program policies.
- **Automated Store Package Syncing**: Enhanced packaging pipeline to keep local zip artifacts synchronized with store submission assets.

## 2.0.1 - 2026-08-15

Smart update channel decoupling & refreshed demonstration showcase.

- **Store-Aware Update Channel Decoupling**: Automatically detects whether the extension was installed via Chrome Web Store or unpacked developer mode; suppresses manual zip update prompts for store users so Chrome can handle background auto-updates smoothly.
- **Refreshed Core Feature Demonstration Videos**: Replaced legacy single-video demo with 3 dedicated walkthrough screen recordings in crisp MP4 format:
  1. Subtitle extraction & export workflow (`demo-subtitle-export.mp4`)
  2. High-definition video & audio download (`demo-media-download.mp4`)
  3. Persistent background download & interruption-free state recovery (`demo-persistent-background-download.mp4`)

## 2.0.0 - 2026-08-15

Major milestone: Fully stable, safe, and resilient end-to-end media downloader with persistent state restoration.

- **Resilient Media Download Architecture**: Implements an Offscreen Document DOM bridge + IndexedDB chunk storage for seamless, Manifest V3 compliant `URL.createObjectURL` and browser downloads without service worker memory limits.
- **Universal CDN Anti-Hotlinking Bypass**: Re-engineered `declarativeNetRequest` rules with Service Worker request matching (`tabIds: [-1]`), attaching required `Referer` and desktop `User-Agent` while eliminating cross-origin CORS conflicts for all Bilibili CDN domains and edge IPs.
- **Persistent Background State Restoration**: Download progress, phase states, and active jobs are now tracked in background service worker cache; reopening or navigating away from the popup dynamically restores live progress.
- **Enhanced Download Completion UX**: Added visual download complete indicators, clear "已下载完毕" status display, and a dedicated dismiss/return button so users can seamlessly dismiss the downloading screen without restarting the extension.
- **Pure Local fMP4 Remuxing**: Zero-dependency local merging of separated high-definition video and audio tracks directly in the browser into a standard playable MP4 file.

Download reliability and UI contrast fix.

- Fixes Bilibili media CDN `HTTP 403` by enforcing `Referer: https://www.bilibili.com` through declarativeNetRequest rules (extension fetch cannot set Referer directly).
- Adds page-context binary download fallback plus backup stream URL retries.
- Improves dark/light text contrast so labels and selects stay readable.
- Shows a clear toast when update check finds the installed version is already latest.

## 1.3.0 - 2026-07-24

One-click update and refreshed media assets.

- Adds a layered GitHub release update checker with one-click package download.
- Shows an update banner and footer update button when a newer version is available.
- Opens a local update guide after downloading the latest manual-install zip.
- Refreshes README/help preview images, usage gif, and demo video to match the current popup UI (media download + update).

## 1.2.0 - 2026-07-24

Media download release.

- Adds current-video media download with selectable quality and mode (`Video + audio`, `Audio only`, `Video only`).
- Resolves Bilibili playurl streams through ordered, data-driven strategies (DASH first, single-file MP4 fallback).
- Downloads video/audio tracks separately when needed and remuxes them locally into one playable MP4 without external dependencies.
- Extends host permissions for Bilibili media CDNs and keeps subtitle export behavior intact.

## 1.1.0 - 2026-07-15

Visual refresh and built-in help release.

- Aligns the popup with the shared KenEasy light/dark visual system while retaining the original extension icon.
- Adds a packaged Help & About page with screenshots, an animated usage guide, installation steps, format guidance, and common questions.
- Adds Chinese and English help content, reusable design tokens, and a shared appearance controller.
- Keeps subtitle discovery, conversion, and download behavior unchanged.

## 1.0.4 - 2026-07-09

Filename improvement release.

- Builds downloaded subtitle filenames from both the video title and subtitle language.
- Uses the human-readable subtitle language name when available, then falls back to the language code.
- Keeps video title and language as separate filename parts so long titles do not remove the language label.

## 1.0.3 - 2026-07-09

Brand rename release.

- Renames the extension to `KenEasy BiliCC Exporter`.
- Moves runtime branding, message namespaces, and subtitle-cache prefixes into shared brand configuration.
- Refreshes documentation, package naming, and project preview assets for the new name.
- Clarifies local installation with a manual-install package because Chrome blocks direct GitHub CRX installs.

## 1.0.2 - 2026-07-08

Small maintenance update for popup stability and release metadata.

- Uses the localized video-info completion message during subtitle extraction.
- Reads the popup footer version from the extension manifest instead of a hard-coded value.
- Updates the documented current version to match the extension package.

## 1.0.1 - 2026-07-07

Maintenance release for the GitHub distribution package.

- Bumps the Chrome extension version to `1.0.1`.
- Refreshes the packaged extension upload artifact.
- Adds release notes so GitHub releases and local documentation describe the same package.
- Keeps the existing layered architecture and requested permissions unchanged.

## 1.0.0 - 2026-06-24

Initial public release.

- Exports Bilibili CC subtitles from the active video page as `TXT` or `SRT`.
- Uses page-observed subtitle metadata first, then falls back to Bilibili web APIs.
- Includes English and Simplified Chinese documentation and extension localization.
