# Validation and actual limits

The checks below use independent **fictional data and original assets**. They verify tools and a synthetic workflow, not independent agent decisions, a real backend, production usage or real-user satisfaction.

## Completed checks

- 15 Python regressions: safe gallery input/copy boundaries, duplicate IDs, cross-project decisions, reassigned sources, rejected/historical ID reservation, raw-note preservation without automatic acceptance, overwrite protection, portable script invocation, preview relocation and executable public walkthrough.
- 19 gallery browser checks: choices and focus, optional reasons, filters, preview/compare, Escape, export/import, persistence, malformed/cross-project/reassigned/duplicate rejection, literal note rendering and responsive widths 1440/820/390. No JavaScript errors.
- 9 showcase checks: actual WebGL canvas, theme change, same-page native video, playback/seek to 28 seconds, pause on close, byte-range delivery and 820/390 widths. No JavaScript errors.
- 5 round-transition checks: liked sources pinned alongside new concepts, original reasons imported, omitted rejection reported, negative evidence saved and no browser errors. The rehearsal runs in a temporary directory and removes its generated files.
- Actual public GitHub README: a fresh anonymous Chromium found the native player, played the 32-second film and sought to 19 seconds without leaving the repository page. No video error. See `validation-report.json` and reproduce with `node scripts/verify-github-player.mjs`.
- Official Codex skill frontmatter/scaffold validation passes. That validator does not evaluate design judgment.
- New film: original sculpture, original sound and two newly generated fictional COMMONPLACE concepts. Keyframes were inspected. H.264/AAC, 1280×720, 24 fps, 32 seconds. GitHub native-attachment publication is distinct from storing the MP4 in Git.

## Reproduce

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run check
npx prettier --check README.md README.zh-CN.md CONTRIBUTING.md docs skills demo scripts/*.mjs examples/*.json package.json .github/workflows/check.yml
```

Python 3.10+ suffices for the skill tools alone. Node 20+ and Playwright are only required for showcase/browser checks. CHROMIUM_PATH can select an existing test browser; reports/screenshots are generated under ignored out/verification. CI repeats all tool/browser checks.

The current installed skill matches the published skill package; its previous version was backed up before updating. The initial Linux CI preview-loading race was corrected by waiting for image decoding before assertions.

## Source and behavioral evidence

The 16-item library contains original source links, not third-party images. On 2026-10-01 creator/product pages were checked through text access. Login-only UI and interactions were not exercised. Poolsuite required JavaScript, Igloo returned no readable interface content and Readymag failed in that access path; those limits are explicit in their records. This is a research seed, not a finished visually verified reference gallery.

The two COMMONPLACE concepts were generated with built-in imagegen and viewed. They are not code-native interfaces or complete meshes. The WebGL film is an independently coded sculpture, not a claim of pixel-perfect concept implementation.

The raw-request scenarios and scoring criteria in EVALUATION.md are an evaluation protocol. No independent-agent or real-user study has been completed. The synthetic walkthrough tests data continuity and usable tool commands. Future claims of agent/user success must include actual recorded outputs and consented evidence.
