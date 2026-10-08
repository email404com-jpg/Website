import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.QA_URL ?? "http://127.0.0.1:3100";
const OUT = process.env.QA_OUT ?? "/tmp/qa";
const WIDTHS = [320, 360, 375, 390, 414, 768, 1024, 1280, 1440];

fs.mkdirSync(OUT, { recursive: true });

const report = { viewports: {}, interactions: {}, consoleErrors: [] };

const browser = await chromium.launch({
  args: [
    "--disable-gpu",
    "--disable-accelerated-2d-canvas",
    "--use-angle=swiftshader",
  ],
});

async function open(width) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    isMobile: width <= 480,
    hasTouch: width <= 480,
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: BASE,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const failed = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) =>
    failed.push(`${request.url()} :: ${request.failure()?.errorText}`),
  );
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failed.push(`${response.url()} :: HTTP ${response.status()}`);
    }
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);

  return { context, page, consoleErrors, failed };
}

for (const width of WIDTHS) {
  const { context, page, consoleErrors, failed } = await open(width);

  const audit = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [];
    const smallTargets = [];
    const images = [];
    const nameless = [];

    for (const el of document.querySelectorAll("body *")) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.right > vw + 1 || rect.left < -1) {
        offenders.push({
          tag: el.tagName,
          cls: String(el.className).slice(0, 70),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
        });
      }
    }

    for (const img of Array.from(document.images)) {
      images.push({
        src: img.currentSrc || img.src,
        loaded: img.complete && img.naturalWidth > 0,
      });
    }

    for (const el of document.querySelectorAll("a, button")) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const name =
        el.getAttribute("aria-label") || el.textContent?.trim() || "";
      if (!name) nameless.push({ tag: el.tagName, cls: String(el.className) });
      if (window.innerWidth <= 480 && rect.height < 44) {
        smallTargets.push({
          tag: el.tagName,
          name: name.slice(0, 32),
          h: Math.round(rect.height),
        });
      }
    }

    const statusText = document.querySelector("#status")?.innerText ?? "";

    return {
      clientWidth: vw,
      scrollWidth: document.documentElement.scrollWidth,
      offenders: offenders.slice(0, 12),
      smallTargets,
      images,
      nameless,
      statusText: statusText.replace(/\s+/g, " ").slice(0, 220),
      bodyHeight: document.body.scrollHeight,
    };
  });

  await page.screenshot({ path: `${OUT}/w${width}.png`, fullPage: true });

  report.viewports[width] = {
    ...audit,
    consoleErrors,
    failed,
    horizontalOverflow: audit.scrollWidth > audit.clientWidth + 1,
  };

  if (width === 375) {
    const menu = "#mobile-menu";
    await page.click("header button[aria-controls='mobile-menu']");
    await page.waitForTimeout(200);
    const opened = await page.isVisible(menu);
    await page.screenshot({ path: `${OUT}/menu-open.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    const closedByEscape = !(await page.isVisible(menu));
    report.interactions.mobileMenu = { opened, closedByEscape };

    await page.click("header button[aria-controls='mobile-menu']");
    await page.waitForTimeout(150);
    await page.click(`${menu} a[href='#modes']`);
    await page.waitForTimeout(250);
    report.interactions.mobileMenuClosedOnNavigate = !(await page.isVisible(
      menu,
    ));

    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.click("button:has-text('Copy address')");
    await page.waitForTimeout(250);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    report.interactions.copyAddress = clip;
  }

  if (width === 1440) {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      return {
        tag: el.tagName,
        text: (el.textContent || "").trim().slice(0, 30),
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    report.interactions.keyboardFocus = focus;
  }

  await context.close();
}

{
  const { context, page } = await open(1200);
  await page.screenshot({
    path: `${OUT}/og.png`,
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  await context.close();
}

await browser.close();

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
