import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { startServer } from "./serve.mjs";
const server = await startServer(0);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
  args: ["--disable-gpu", "--enable-unsafe-swiftshader"],
});
const checks = [],
  errors = [];
const check = (name, value) => {
  assert.ok(value, name);
  checks.push(name);
};
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  const base = `http://127.0.0.1:${server.address().port}`;
  await page.goto(`${base}/demo/`);
  await page.waitForFunction(() => window.showcaseReady);
  check(
    "Original WebGL scene renders",
    (await page.locator("#scene canvas").count()) === 1,
  );
  await page.locator("#theme").click();
  check(
    "Theme changes",
    (await page.locator("body").getAttribute("data-theme")) === "warm",
  );
  await page.locator("#open-film").click();
  check(
    "Film opens in same-page native player",
    (await page.locator("#film[open] video").count()) === 1,
  );
  const playback = await page.locator("video").evaluate(async (video) => {
    if (video.readyState < 1)
      await new Promise((resolve, reject) => {
        video.addEventListener("loadedmetadata", resolve, { once: true });
        video.addEventListener("error", reject, { once: true });
      });
    const duration = video.duration;
    video.currentTime = 28;
    await new Promise((resolve) =>
      video.addEventListener("seeked", resolve, { once: true }),
    );
    video.muted = true;
    await video.play();
    return {
      duration,
      time: video.currentTime,
      playing: !video.paused,
      error: video.error,
    };
  });
  check(
    "H264 film plays and seeks to 28 seconds",
    Math.abs(playback.duration - 32) < 0.1 &&
      playback.time >= 28 &&
      playback.playing &&
      !playback.error,
  );
  await page.keyboard.press("Escape");
  check(
    "Closing player pauses audio/video",
    await page.locator("video").evaluate((v) => v.paused),
  );
  const response = await fetch(`${base}/media/frontend-style-discovery.mp4`, {
    headers: { Range: "bytes=0-99" },
  });
  check(
    "Range delivery supports seeking",
    response.status === 206 &&
      (await response.arrayBuffer()).byteLength === 100,
  );
  for (const width of [820, 390]) {
    await page.setViewportSize({ width, height: 900 });
    check(
      `Showcase fits ${width}px`,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  check("No showcase JavaScript errors", !errors.length);
  await fs.mkdir("out/verification", { recursive: true });
  await fs.writeFile(
    "out/verification/showcase-report.json",
    JSON.stringify(
      {
        checks,
        errors,
        playback,
        scope: "Original local synthetic showcase, not a connected product",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ checks, playback }, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
