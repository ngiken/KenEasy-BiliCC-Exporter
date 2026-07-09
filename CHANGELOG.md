# Changelog

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
