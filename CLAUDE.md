# CLAUDE.md — KenEasy BiliCC Exporter

Chrome MV3 extension that exports Bilibili CC subtitles as TXT/SRT.

## Project layout

```text
chrome-extension/     # Load this folder in Chrome (unpacked)
assets/               # README / store screenshots & demo gif
scratch/              # Maintainer scripts only
  zip_extension.py              # tracked — builds store + manual zips
  generate_brand_assets.py      # tracked — brand assets helper
  *                             # other scripts stay local (gitignored)
```

## Hard rules (do not break)

1. **Never commit secrets**
   - `*.pem`, `*.p12`, `*.key`, `.env`, credentials — blocked by `.gitignore`
   - Signing key lives in the **parent workspace**, not this repo:
     `../chrome-extension.pem`
2. **Never put secrets inside `chrome-extension/`**
   - Packaging ships everything under that folder (minus skip rules)
   - `scratch/zip_extension.py` also skips pem/key/secret-looking names
3. **Do not `git init` in the parent workspace**
   - Parent `开源软件1` is a multi-project workspace; this folder is the git root
4. **Do not commit raw personal recordings**
   - `Screen Recording*.mp4` is ignored; polished `UseDemo.mp4` / `assets/*` are intentional
5. **Keep the extension dependency-free**
   - No npm/build step for the shipped extension unless product direction changes

## Safe commit checklist

Before `git add` / commit / push:

```text
[ ] git status — no .pem / .env / unexpected binaries
[ ] Only intentional media: assets/* , UseDemo.mp4
[ ] Release zips regenerated only when shipping: python scratch/zip_extension.py
[ ] No absolute machine paths introduced in tracked scripts
[ ] Version bump consistent if releasing: manifest.json + README badges + CHANGELOG
```

Quick secret scan (PowerShell, run from project root):

```powershell
git status --short
git ls-files | Select-String -Pattern '\.(pem|p12|key|pfx)$|\.env|secret|credential'
Get-ChildItem -Recurse -File chrome-extension | Where-Object {
  $_.Extension -match '\.(pem|p12|key|pfx)$' -or $_.Name -match 'secret|credential|\.env'
}
```

## Daily workflow

| Task | Command / path |
| --- | --- |
| Open project | work inside `01-KenEasy-BiliCC-Exporter` (this folder) |
| Load unpacked | Chrome → `chrome-extension/` |
| Rebuild zips | `python scratch/zip_extension.py` |
| Brand assets | `python scratch/generate_brand_assets.py` |

## What may be uploaded (GitHub)

| Allowed | Not allowed |
| --- | --- |
| Extension source under `chrome-extension/` | Private keys / `.pem` |
| Docs, LICENSE, CHANGELOG | `.env` / tokens / cookies |
| Intentional demo media (`assets/`, `UseDemo.mp4`) | Raw screen recordings |
| Tracked packaging scripts | Ad-hoc local scratch experiments |
| Release zips when intentionally shipping | Random large dumps / personal notes |

## Architecture touchpoints

- `brand-config.js` — product naming / prefixes
- `content-main.js` — page world observation
- `content.js` — isolated bridge + cache
- `background.js` — API / WBI / subtitle JSON
- `popup.js` — UI, TXT/SRT, downloads

Prefer small, layered changes; keep page access, messaging, API, and UI separated.

## Release notes for maintainers

1. Update `chrome-extension/manifest.json` version
2. Update README badges + `CHANGELOG.md`
3. `python scratch/zip_extension.py`
4. Commit intentional files only; tag `vX.Y.Z` when publishing
5. Upload **store** zip to CWS; attach **manual-install** zip on GitHub Release
