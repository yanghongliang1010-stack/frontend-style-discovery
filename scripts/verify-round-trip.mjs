import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

// Browser-level round transition: a synthetic rehearsal, not a real-user test.
const root = await fs.mkdtemp(path.join(os.tmpdir(), "discovery-round-"));
let browser;
let server;
const checks = [];
try {
  const skill = path.resolve("skills/frontend-style-discovery/scripts");
  execFileSync("python3", [
    path.join(skill, "advance_round.py"),
    path.resolve("examples/reference-library.json"),
    path.resolve("examples/walkthrough/additions.json"),
    "--decisions",
    path.resolve("examples/walkthrough/choices.json"),
    "--output",
    path.join(root, "round-2"),
  ]);
  execFileSync("python3", [
    path.join(skill, "build_gallery.py"),
    path.join(root, "round-2/references.json"),
    "--output",
    path.join(root, "gallery"),
  ]);
  const http = await import("node:http");
  server = http.createServer(async (req, res) => {
    try {
      const name = new URL(req.url, "http://localhost").pathname;
      const file = path.resolve(
        root,
        "gallery",
        "." + (name === "/" ? "/index.html" : name),
      );
      if (!file.startsWith(path.join(root, "gallery") + path.sep))
        return res.writeHead(403).end();
      const type =
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".png": "image/png",
        }[path.extname(file)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type }).end(await fs.readFile(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(
    () => document.querySelectorAll(".card").length === 4,
  );
  assert.equal(await page.locator(".pin").count(), 2);
  checks.push("Liked original sources remain pinned beside new concepts");
  await page
    .locator("#import")
    .setInputFiles("examples/walkthrough/choices.json");
  await page.waitForFunction(() =>
    document.querySelector("#summary").textContent.includes("喜欢 2"),
  );
  assert.equal(
    await page.getByRole("textbox", { name: "10 选择理由" }).inputValue(),
    "喜欢材质表达，不要整个品牌站布局",
  );
  checks.push("Raw reasons survive import into another round");
  assert.ok(
    (await page.locator("#toast").textContent()).includes("1 项不属于本轮"),
  );
  checks.push("Omitted rejected references are reported explicitly");
  const preserved = JSON.parse(
    await fs.readFile(
      path.join(root, "round-2/previous-decisions.json"),
      "utf8",
    ),
  );
  assert.equal(preserved.choices.find((c) => c.id === 1).value, "skip");
  checks.push("Rejected choices survive in the preserved decision file");
  assert.equal(errors.length, 0);
  checks.push("No round-transition browser errors");
  await fs.mkdir("out/verification", { recursive: true });
  await page.screenshot({
    path: "out/verification/round-2.png",
    fullPage: true,
  });
  await fs.writeFile(
    "out/verification/round-trip-report.json",
    JSON.stringify(
      {
        checks,
        evidence:
          "Synthetic fictional collection example; no independent agent or real users",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ checks }, null, 2));
} finally {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  await fs.rm(root, { recursive: true, force: true });
}
