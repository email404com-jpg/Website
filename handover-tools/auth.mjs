import { chromium } from "/home/claude/site-src/node_modules/playwright/index.mjs";
const b = await chromium.launch({ headless:true, executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args:["--no-sandbox","--disable-gpu"] });
const ctx = await b.newContext({ viewport:{width:1440,height:500} });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:3100/",{waitUntil:"networkidle"});
await p.screenshot({path:"/tmp/claude-0/shots/v2/auth-out.png",clip:{x:900,y:0,width:540,height:70}});
// mock logged-in session
await p.route("**/api/auth/session", r=>r.fulfill({json:{user:{name:"JackNW",image:"http://127.0.0.1:3100/icon.png"},expires:"2099-01-01T00:00:00.000Z"}}));
await p.reload({waitUntil:"networkidle"});
await p.click('button[aria-label^="Account menu"]'); await p.waitForTimeout(300);
await p.screenshot({path:"/tmp/claude-0/shots/v2/auth-in.png",clip:{x:900,y:0,width:540,height:200}});
console.log(await p.locator('[role=menuitem]').innerText());
await b.close();
