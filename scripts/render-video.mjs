import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./serve.mjs";
const root = fileURLToPath(new URL("..", import.meta.url));
const fps = 24,
  captureFps = 8,
  duration = 32,
  width = 1280,
  height = 720;
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const output = path.join(root, "media", "frontend-style-discovery.mp4");
const server = await startServer(0);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
  args: ["--disable-gpu", "--enable-unsafe-swiftshader"],
});
let encoder;
try {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/demo/?video=1`, {
    waitUntil: "networkidle",
  });
  await page.waitForFunction(() => window.showcaseReady);
  await page.evaluate(() => document.fonts.ready);
  for (const img of await page.locator("#concepts img").all())
    await img.evaluate((image) =>
      image.complete
        ? undefined
        : new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
          }),
    );
  const score = path.join(root, "media", "original-sound.wav");
  encoder = spawn(
    ffmpeg,
    [
      "-y",
      "-f",
      "image2pipe",
      "-vcodec",
      "mjpeg",
      "-r",
      String(captureFps),
      "-i",
      "pipe:0",
      "-i",
      score,
      "-vf",
      `minterpolate=fps=${fps}:mi_mode=mci:mc_mode=aobmc:vsbmc=1:scd=fdiff,tpad=stop_mode=clone:stop_duration=1`,
      "-r",
      String(fps),
      "-t",
      String(duration),
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "20",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-movflags",
      "+faststart",
      output,
    ],
    { stdio: ["pipe", "ignore", "pipe"] },
  );
  let log = "";
  let spawnError;
  encoder.on("error", (error) => {
    spawnError = error;
  });
  encoder.stderr.on("data", (chunk) => {
    log = (log + chunk.toString()).slice(-12000);
  });
  const done = once(encoder, "close");
  encoder.stdin.on("error", () => {});
  for (let frame = 0; frame < captureFps * duration; frame++) {
    if (spawnError || encoder.exitCode !== null)
      throw spawnError || new Error(log);
    await page.evaluate((time) => window.renderFrame(time), frame / captureFps);
    const buffer = await page.screenshot({ type: "jpeg", quality: 94 });
    if (!encoder.stdin.write(buffer)) await once(encoder.stdin, "drain");
    if (frame % (captureFps * 2) === 0)
      console.log(`Captured ${frame}/${captureFps * duration} frames`);
  }
  encoder.stdin.end();
  const [exitCode] = await done;
  if (exitCode !== 0 || errors.length)
    throw new Error(`Video failed: ${errors.join("; ")} ${log}`);
  await page.evaluate(() => window.renderFrame(28));
  await page.screenshot({ path: path.join(root, "media", "poster.png") });
  for (const time of [3, 7, 13, 19, 28]) {
    await page.evaluate((t) => window.renderFrame(t), time);
    await page.screenshot({
      path: path.join(root, "media", `frame-${time}.png`),
    });
  }
  await fs.writeFile(
    path.join(root, "media", "video-metadata.json"),
    JSON.stringify(
      {
        width,
        height,
        fps,
        duration,
        frames:
          Number([...log.matchAll(/frame=\s*(\d+)/g)].at(-1)?.[1]) || null,
        nominalFrames: fps * duration,
        captureFps,
        capturedFrames: captureFps * duration,
        scenePixelRatio: 1,
        interpolation: "FFmpeg minterpolate motion compensation to 24 fps",
        audio: "original stereo ambient score",
        graphics: "original procedural WebGL ribbon and glass sculpture",
        rendering: "deterministic Playwright Chromium / SwiftShader",
        pageErrors: errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Created ${path.basename(output)}`);
} finally {
  encoder?.kill();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
