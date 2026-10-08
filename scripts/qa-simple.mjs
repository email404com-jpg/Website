import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://127.0.0.1:3100";
const OUT = "/tmp/qa";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
});
try {
  const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT, "w375.png"), fullPage: true });
  await context.close();
  console.log("ok");
} finally {
  await browser.close();
}
