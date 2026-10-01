import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { startServer } from "./serve.mjs";
const server = await startServer(0);
const url = `http://127.0.0.1:${server.address().port}/demo/gallery/`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
  args: ["--disable-gpu", "--enable-unsafe-swiftshader"],
});
const results = [];
const errors = [];
const check = (name, value) => {
  assert.ok(value, name);
  results.push(name);
};
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.waitForFunction(
    () => document.querySelectorAll(".card").length === 2,
  );
  check(
    "Two original preview images load",
    await page
      .locator(".preview-button img")
      .evaluateAll((imgs) =>
        imgs.every((i) => i.complete && i.naturalWidth > 0),
      ),
  );
  await page.getByRole("button", { name: "喜欢 29", exact: true }).click();
  check(
    "Choice retains keyboard focus",
    await page.evaluate(
      () => document.activeElement?.getAttribute("aria-label") === "喜欢 29",
    ),
  );
  await page
    .getByRole("textbox", { name: "29 选择理由" })
    .fill("喜欢玻璃材质；布局继续找");
  await page.getByRole("button", { name: "喜欢 30", exact: true }).click();
  await page.getByRole("textbox", { name: "30 选择理由" }).fill("喜欢明亮暖色");
  await page.locator("#search").fill("29");
  check(
    "Search narrows references",
    (await page.locator(".card").count()) === 1,
  );
  await page.locator("#search").fill("");
  const tag = await page.locator("#tag option").nth(1).getAttribute("value");
  await page.locator("#tag").selectOption(tag);
  check(
    "Tag filter narrows references",
    (await page.locator(".card").count()) > 0,
  );
  await page.locator("#tag").selectOption("");
  await page.locator("#compare").click();
  check(
    "Comparison displays selected previews",
    (await page.locator("dialog[open] .compare-grid img").count()) === 2,
  );
  await page.keyboard.press("Escape");
  check(
    "Escape closes modal",
    (await page.locator("dialog[open]").count()) === 0,
  );
  await page.locator(".preview-button").first().click();
  check(
    "Zoom opens original preview",
    (await page.locator("dialog[open] #preview-body img").count()) === 1,
  );
  await page.locator("#close-preview").click();
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#export").click();
  const download = await downloadPromise;
  const data = JSON.parse(await fs.readFile(await download.path(), "utf8"));
  check(
    "Export preserves stable IDs and reasons",
    data.choices.length === 2 &&
      data.choices[0].id === 29 &&
      data.choices[0].notes.includes("玻璃"),
  );
  await page.reload();
  check(
    "Refresh restores choices and notes",
    (
      await page.getByRole("textbox", { name: "29 选择理由" }).inputValue()
    ).includes("玻璃"),
  );
  const context2 = await browser.newContext({
    viewport: { width: 820, height: 1000 },
  });
  const imported = await context2.newPage();
  imported.on("pageerror", (e) => errors.push(e.message));
  await imported.goto(url);
  const upload = (value) =>
    imported.locator("#import").setInputFiles({
      name: "decisions.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(value)),
    });
  await upload(data);
  await imported.waitForFunction(() =>
    document.querySelector("#summary").textContent.includes("喜欢 2"),
  );
  check(
    "Export imports into a fresh browser context",
    (await imported
      .getByRole("button", { name: "喜欢 29", exact: true })
      .getAttribute("aria-pressed")) === "true",
  );
  await upload({
    schema_version: 1,
    choices: [
      { id: 29, value: "skip", notes: "should not commit" },
      { id: 30, value: "INVALID", notes: "" },
    ],
  });
  await imported.waitForFunction(() =>
    document.querySelector("#toast").textContent.includes("导入失败"),
  );
  check(
    "Malformed import is rejected atomically",
    (await imported
      .getByRole("button", { name: "喜欢 29", exact: true })
      .getAttribute("aria-pressed")) === "true",
  );
  await upload({
    schema_version: 1,
    choices: [
      {
        id: 29,
        value: "like",
        notes: '<img src=x onerror="window.pwned=true">',
      },
    ],
  });
  await imported.waitForFunction(() =>
    document.querySelector("#toast").textContent.includes("已导入"),
  );
  await imported.locator("#compare").click();
  check(
    "Imported notes remain literal text",
    await imported.evaluate(
      () =>
        !window.pwned &&
        document
          .querySelector(".compare-grid figcaption")
          .textContent.includes("<img"),
    ),
  );
  await imported.keyboard.press("Escape");
  await fs.mkdir("out/verification", { recursive: true });
  await page.screenshot({
    path: "out/verification/gallery-desktop.png",
    fullPage: true,
  });
  for (const width of [820, 390]) {
    await imported.setViewportSize({ width, height: 900 });
    check(
      `No horizontal overflow at ${width}px`,
      await imported.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  await imported.screenshot({
    path: "out/verification/gallery-mobile.png",
    fullPage: true,
  });
  await imported.locator("#liked-only").check();
  await imported
    .getByRole("button", { name: "不喜欢 29", exact: true })
    .click();
  check(
    "Filtered-out choice moves focus to filter",
    await imported.evaluate(() => document.activeElement.id === "liked-only"),
  );
  check("No browser JavaScript errors", errors.length === 0);
  const report = {
    checks: results,
    pageErrors: errors,
    evidence:
      "Local synthetic gallery, Playwright Chromium; no external business services",
  };
  await fs.writeFile(
    "out/verification/gallery-report.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
