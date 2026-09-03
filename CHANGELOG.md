# Changelog

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
