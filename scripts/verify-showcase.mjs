import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { startServer } from "./serve.mjs";
const server = await startServer(0);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : { channel: "chrome" }),
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
    if (!video.canPlayType('video/mp4; codecs="avc1.640028, mp4a.40.2"'))
      throw new Error(
        "H.264/AAC playback requires an official Chrome binary; use CHROMIUM_PATH or installed Google Chrome.",
      );
    const waitEvent = (event, trigger) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanup();
          reject(
            new Error(
              `Video ${event} timed out; readyState=${video.readyState}, error=${video.error?.code || 0}`,
            ),
          );
        }, 15000);
        const done = () => {
          cleanup();
          resolve();
        };
        const fail = () => {
          cleanup();
          reject(new Error(`Video error ${video.error?.code || 0}`));
        };
        const cleanup = () => {
          clearTimeout(timer);
          video.removeEventListener(event, done);
          video.removeEventListener("error", fail);
        };
        video.addEventListener(event, done);
        video.addEventListener("error", fail);
        if (video.error) fail();
        else trigger?.();
      });
    if (video.readyState < 1) await waitEvent("loadedmetadata");
    const duration = video.duration;
    await waitEvent("seeked", () => {
      video.currentTime = 28;
    });
    video.muted = false;
    video.volume = 1;
    const context = new AudioContext();
    const source = context.createMediaElementSource(video);
    const analyser = context.createAnalyser();
    source.connect(analyser);
    analyser.connect(context.destination);
    await context.resume();
    await video.play();
    await new Promise((resolve) => setTimeout(resolve, 400));
    const samples = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(samples);
    const rms = Math.sqrt(
      samples.reduce((sum, n) => sum + n * n, 0) / samples.length,
    );
    return {
      duration,
      rms,
      audible: !video.muted && context.state === "running",
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
  check(
    "Original music decodes and plays unmuted",
    playback.audible && playback.rms > 0.001,
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
