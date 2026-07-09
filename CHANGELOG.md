# Changelog

## 1.0.3 - 2026-07-09

Brand rename release.

- Renames the extension to `KenEasy BiliCC Exporter`.
- Moves runtime branding, message namespaces, and subtitle-cache prefixes into shared brand configuration.
- Refreshes documentation, package naming, and project preview assets for the new name.

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
