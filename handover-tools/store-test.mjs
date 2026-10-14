import { chromium } from "/home/claude/site-src/node_modules/playwright/index.mjs";
const OUT="/tmp/claude-0/shots/store";
const BASE="http://store.localhost:3100";
const b = await chromium.launch({ headless:true, executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args:["--no-sandbox","--disable-gpu"] });
async function mk(w,h,loggedIn){
  const ctx = await b.newContext({ viewport:{width:w,height:h}, reducedMotion: "no-preference" });
  const p = await ctx.newPage();
  const errs=[]; p.on("console",m=>{ if(m.type()==="error") errs.push(m.text().slice(0,200)); }); p.on("pageerror",e=>errs.push(String(e).slice(0,200)));
  if (loggedIn) await ctx.addCookies([{name:"__Secure-authjs.session-token",value:"test-session-token",domain:"store.localhost",path:"/",secure:true,httpOnly:true}]);
  return {ctx,p,errs};
}
// logged out
{ const {ctx,p,errs}=await mk(1440,900,false); await p.goto(BASE+"/",{waitUntil:"networkidle"}); await p.waitForTimeout(1500);
  await p.screenshot({path:`${OUT}/hub-out-1440.png`}); console.log("logged-out errs",errs); await ctx.close(); }
// logged in desktop
{ const {ctx,p,errs}=await mk(1440,900,true);
  await p.goto(BASE+"/",{waitUntil:"networkidle"}); await p.waitForTimeout(1800);
  await p.screenshot({path:`${OUT}/hub-in-1440.png`});
  console.log("coin btn:", await p.locator('button[aria-haspopup=dialog]').innerText());
  await p.goto(BASE+"/practice",{waitUntil:"networkidle"}); await p.waitForTimeout(1800);
  await p.screenshot({path:`${OUT}/practice-1440.png`,fullPage:true});
  await p.goto(BASE+"/survival",{waitUntil:"networkidle"}); await p.waitForTimeout(1200); await p.screenshot({path:`${OUT}/survival-1440.png`});
  await p.goto(BASE+"/coins",{waitUntil:"networkidle"}); await p.waitForTimeout(1200); await p.screenshot({path:`${OUT}/coins-1440.png`});
  // dialog
  await p.goto(BASE+"/practice",{waitUntil:"networkidle"}); await p.waitForTimeout(1000);
  await p.click('button[aria-haspopup=dialog]'); await p.waitForTimeout(700);
  await p.screenshot({path:`${OUT}/dlg-menu.png`});
  for (const [name,shot] of [["How to earn coins","earn"],["AFK earn coins","afk"],["Buy coins","buy"]]) {
    await p.locator("dialog button",{hasText:name}).first().click(); await p.waitForTimeout(500); await p.screenshot({path:`${OUT}/dlg-${shot}.png`});
    await p.locator("dialog button",{hasText:"Coins menu"}).click(); await p.waitForTimeout(300);
  }
  await p.locator("dialog button",{hasText:"Link MC account"}).first().click(); await p.waitForTimeout(500);
  await p.screenshot({path:`${OUT}/dlg-link0.png`});
  await p.locator("dialog button",{hasText:"Generate link code"}).click(); await p.waitForTimeout(800);
  await p.screenshot({path:`${OUT}/dlg-link1.png`});
  const code = (await p.locator("dialog p.font-mono.text-accent-ink").innerText()).replace("/link ","").trim();
  console.log("code", code);
  // simulate the Minecraft server confirming
  const r = await fetch("http://127.0.0.1:3100/api/link/confirm",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer linkkey"},body:JSON.stringify({code,uuid:"069a79f444e94726a5befca90e38aaf5",username:"Notch"})});
  console.log("confirm", r.status, await r.text());
  await p.waitForTimeout(5500);
  await p.screenshot({path:`${OUT}/dlg-linked.png`});
  await p.keyboard.press("Escape"); await p.waitForTimeout(3000);
  console.log("coin btn after link:", await p.locator('button[aria-haspopup=dialog]').innerText());
  await p.screenshot({path:`${OUT}/practice-linked.png`,clip:{x:700,y:0,width:740,height:70}});
  // avatar menu
  await p.click('button[aria-label^="Account menu"]'); await p.waitForTimeout(300);
  await p.screenshot({path:`${OUT}/avatar-menu.png`,clip:{x:900,y:0,width:540,height:200}});
  console.log("logged-in errs",errs); await ctx.close(); }
// mobile
{ const {ctx,p,errs}=await mk(390,800,true);
  await p.goto(BASE+"/",{waitUntil:"networkidle"}); await p.waitForTimeout(1800); await p.screenshot({path:`${OUT}/hub-390.png`,fullPage:true});
  await p.goto(BASE+"/practice",{waitUntil:"networkidle"}); await p.waitForTimeout(1500);
  await p.click('button[aria-haspopup=dialog]'); await p.waitForTimeout(700); await p.screenshot({path:`${OUT}/dlg-menu-390.png`});
  console.log("mobile overflow", await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth), errs); await ctx.close(); }
await b.close();
