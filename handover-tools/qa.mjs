import { chromium } from "/home/claude/site-src/node_modules/playwright/index.mjs";
const browser = await chromium.launch({ headless: true, executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"] });
const routes = ["/","/coins","/status","/faq","/rules","/terms","/login","/nope"];
const widths = [320,360,375,390,414,768,1024,1280,1440];
const errs = {};
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type()==="error") (errs[w]??=[]).push(m.text().slice(0,160)); });
  page.on("pageerror", e => (errs[w]??=[]).push(String(e).slice(0,160)));
  const row = [];
  for (const r of routes) {
    const resp = await page.goto("http://127.0.0.1:3100"+r, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    row.push(`${r}:${resp.status()}/${o}`);
    if ((w===390||w===1440) && r!=="/") { await page.screenshot({ path: `/tmp/claude-0/shots/v2/p${r.replace("/","_")}-${w}.png` }); }
  }
  // touch targets on home
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
  const small = await page.evaluate(() => [...document.querySelectorAll("a,button")].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.height<40||r.width<40)&&getComputedStyle(e).visibility!=="hidden"}).map(e=>(e.textContent||e.getAttribute("aria-label")||"").trim().slice(0,24)+` ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
  console.log(w, row.join(" "), "small:", JSON.stringify(small.slice(0,6)));
  await ctx.close();
}
console.log("console errors:", JSON.stringify(errs));
// mobile menu
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
await page.click('button[aria-label="Open menu"]'); await page.waitForTimeout(400);
await page.screenshot({ path: "/tmp/claude-0/shots/v2/menu-390.png" });
await page.click('#mobile-menu a[href="/faq"]'); await page.waitForURL("**/faq"); console.log("menu nav ok ->", page.url());
// reduced motion + light theme
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const p2 = await ctx2.newPage(); await p2.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" }); await p2.waitForTimeout(500);
await p2.screenshot({ path: "/tmp/claude-0/shots/v2/reduced-1440.png" });
await p2.click('button[aria-label="Switch to light theme"]'); await p2.waitForTimeout(400);
await p2.evaluate(()=>window.scrollTo(0,1900)); await p2.waitForTimeout(800);
await p2.screenshot({ path: "/tmp/claude-0/shots/v2/light-1440.png" });
await browser.close();
