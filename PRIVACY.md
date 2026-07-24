# Privacy Policy for KenEasy BiliCC Exporter

**Last updated:** 2026-07-24

## Overview
KenEasy BiliCC Exporter is a Chrome extension that helps users export Bilibili CC subtitles and download the currently open Bilibili video (including audio) to their own computer.

This extension processes media and subtitle data only for the page you are currently viewing. It does **not** sell user data and does **not** use advertising trackers.

## Data the extension accesses
When you use the extension on a bilibili.com video page, it may read:

- The current page URL and video identifiers needed to locate the video
- Publicly available subtitle / CC data for the current video
- Public media stream metadata needed to download the current video and audio
- Basic extension settings stored locally in Chrome

## Data storage
The extension may store the following locally in your browser using Chrome storage.local:

- Update-check cache (last check time and latest version result)
- UI preferences such as theme / language related settings

These values stay on your device. They are not uploaded to a KenEasy backend, because this extension does not operate a KenEasy account server.

## Downloads
When you click export or download actions, files are saved through the browser download system to the location you choose or to your default download folder. Downloaded subtitle and media files remain under your control.

## Network requests
Depending on the feature you use, the extension may contact:

- ilibili.com and related Bilibili media / API hosts, to read the current video, subtitles, and stream information
- pi.github.com and GitHub release asset hosts, only for optional update checks and package download links

No analytics SDK, advertising network, or third-party tracking pixel is bundled in the extension.

## Permissions explanation
- ctiveTab: interact with the currently open Bilibili tab when you use the popup
- downloads: save subtitle and media files, and optional update packages
- storage: remember local preferences and update-check cache
- declarativeNetRequestWithHostAccess: set required request headers so media downloads from Bilibili CDN can succeed
- Host permissions for Bilibili domains: read the current video page, subtitle, and media resources
- Host permissions for GitHub domains: check the latest release version for non-store / dual-distribution update flow

## Children
This extension is not directed at children and does not knowingly collect personal information from children.

## Changes
If this privacy policy changes, the updated version will be published in the project repository.

## Contact
Project repository: https://github.com/ngiken/KenEasy-BiliCC-Exporter

If you have privacy questions, please open an issue in the repository.
