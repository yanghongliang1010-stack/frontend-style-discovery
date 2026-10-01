# Contributing

Changes should make discovery or implementation more usable across different products, not enforce one fashionable style.

- For a workflow change, add a raw-request evaluation scenario and explain the observable improvement.
- For tool behavior, add a regression covering the actual failure (cross-project import, ID reassignment, round continuity, path handling, etc.).
- Reference contributions need original URL, creator, type and honest verification state. Do not upload third-party images without redistribution rights.
- Examples must be fictional/original or explicitly cleared for public release; omit private project content and conversations.
- Explain what was tested: tool regression, browser run, agent evaluation or real-user feedback.

Run `npm ci --ignore-scripts`, `npm run check` after installing Chromium with `npx playwright install chromium`. Python tools alone require Python 3.10+; Node 20+ is only for the showcase and browser checks. Set CHROMIUM_PATH if using an existing test browser. See [validation](docs/VALIDATION.md) for evidence and limits.

Video playback checks use installed Google Chrome or CHROMIUM_PATH; bundled Chromium may omit H.264/AAC codecs. CI installs Chrome in its disposable runner, and media waits have explicit timeouts. See [Playwright media codec guidance](https://playwright.dev/docs/browsers#media-codecs).
