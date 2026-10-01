import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

// Optional publication check against the actual public GitHub page.
// A fresh anonymous browser is used; no user browser session or credentials.
const repository =
  "https://github.com/yanghongliang1010-stack/frontend-style-discovery";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : { channel: "chrome" }),
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto(repository, {
    waitUntil: "load",
    timeout: 90000,
  });
  const video = page.locator(".markdown-body video").first();
  await video.waitFor({ state: "visible", timeout: 90000 });
  // GitHub replaces server-rendered README content during client hydration.
  for (let attempt = 0; ; attempt++) {
    try {
      await video.scrollIntoViewIfNeeded();
      break;
    } catch (error) {
      if (attempt >= 2 || !error.message.includes("not attached")) throw error;
      await page.waitForTimeout(500);
    }
  }
  const result = await video.evaluate(async (v) => {
    const waitEvent = (event, trigger) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error(`GitHub video ${event} timed out`));
        }, 30000);
        const done = () => {
          cleanup();
          resolve();
        };
        const fail = () => {
          cleanup();
          reject(new Error(`GitHub video error ${v.error?.code || 0}`));
        };
        const cleanup = () => {
          clearTimeout(timer);
          v.removeEventListener(event, done);
          v.removeEventListener("error", fail);
        };
        v.addEventListener(event, done);
        v.addEventListener("error", fail);
        if (v.error) fail();
        else trigger?.();
      });
    if (v.readyState < 1) await waitEvent("loadedmetadata");
    await waitEvent("seeked", () => {
      v.currentTime = 19;
    });
    v.muted = false;
    v.volume = 1;
    await v.play();
    return {
      duration: v.duration,
      currentTime: v.currentTime,
      playing: !v.paused,
      controls: v.controls,
      unmuted: !v.muted && v.volume > 0,
      source: v.currentSrc,
      error: v.error?.code || null,
    };
  });
  assert.ok(
    result.duration >= 31.9 &&
      result.playing &&
      result.controls &&
      result.unmuted &&
      !result.error,
  );
  assert.ok(result.currentTime >= 19);
  assert.ok(page.url().startsWith(repository));
  await fs.mkdir("out/verification", { recursive: true });
  await video.screenshot({ path: "out/verification/github-inline-player.png" });
  await fs.writeFile(
    "out/verification/github-player-report.json",
    JSON.stringify(
      { repository, ...result, samePage: true, anonymousAccess: true },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      { repository, ...result, samePage: true, anonymousAccess: true },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
