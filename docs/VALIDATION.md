# Validation

The skill and browser tool were verified with original, synthetic examples. These checks do not imply any application backend or real-user validation.

- Python: 5 tests pass for source-only records, local preview copying, duplicate IDs, unsafe URLs, path/symlink escapes, and input-directory protection.
- Browser: 16 checks pass for choosing, notes, search/tag filters, comparison, zoom, Escape, focus, refresh persistence, export/import across contexts, atomic rejection, literal text rendering, and responsive widths of 1440, 820 and 390 pixels. No JavaScript errors.
- Skill: official Codex skill validator passes; a temporary-directory installation succeeds and refuses overwriting an existing installation.
- Sources: only links and credits from selected creators are redistributed. Preview images and the 3D showcase are original.

Reproduce locally:

```sh
npm ci
npm run gallery
python3 -m unittest discover -s tests -v
npx playwright install chromium
node scripts/verify-gallery.mjs
npx prettier --check README.md README.zh-CN.md docs skills demo scripts/*.mjs examples/*.json package.json .github/workflows/check.yml
```

Optional `CHROMIUM_PATH` selects an existing Chromium. The browser script starts and closes its own loopback server. Reports/screenshots go to the ignored `out/verification/` directory. GitHub Actions repeats the Python, browser and formatting checks.

The original film's render settings and browser errors are recorded in `media/video-metadata.json`; inspect the completed MP4 and keyframes before release. The final H.264/AAC MP4 decodes at exactly 32 seconds and 1280×720/24 fps; the original stereo score peaks at -18.1 dB. All five keyframes were inspected, and Chromium playback and seeking to 28 seconds succeeded. The interactive scene’s theme changes its glass from jade to blue, and dragging changes the camera. The 390px showcase has no horizontal overflow and no JavaScript errors. Render timings on software graphics are not production GPU performance measurements.
