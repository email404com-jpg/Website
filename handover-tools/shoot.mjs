import { chromium } from "/home/claude/site-src/node_modules/playwright/index.mjs";
const [,, outDir, ...widths] = process.argv;
const browser = await chromium.launch({ headless: true, executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"] });
for (const w of widths.map(Number)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 800 : 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", m => { if (m.type()==="error") errs.push(m.text()); });
  page.on("pageerror", e => errs.push(String(e)));
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/home-${w}-fold.png` });
  // scroll through to trigger reveals
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(220); }
  await page.waitForTimeout(900); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/home-${w}-full.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(w, "height", h, "hOverflow", overflow, "errors", JSON.stringify(errs));
  await ctx.close();
}
await browser.close();
