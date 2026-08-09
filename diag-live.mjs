import { chromium } from "playwright";
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const B = "https://vipaaka.vercel.app";
const b = await chromium.launch();

// ---------- 2. accessible name of the brand mark ----------
{
  const ctx = await b.newContext({viewport:{width:1440,height:900}});
  const p = await ctx.newPage();
  await p.goto(B, {waitUntil:"networkidle"});
  const names = await p.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll('a[aria-label*="home" i], header a')) {
      out.push({ label: a.getAttribute("aria-label"), text: a.innerText.replace(/\s+/g," ").trim().slice(0,40) });
    }
    return out.slice(0,3);
  });
  console.log("=== 2. BRAND MARK (raw) ===");
  names.forEach(n => console.log(`   aria-label=${JSON.stringify(n.label)}  innerText=${JSON.stringify(n.text)}`));
  const acc = await p.locator("header a").first().evaluate(el => el.textContent);
  console.log("   textContent:", JSON.stringify(acc));
  await ctx.close();
}

// ---------- 3. countdown in SSR HTML ----------
{
  const res = await fetch(`${B}/film`);
  const html = await res.text();
  console.log("\n=== 3. /film SERVER HTML ===");
  for (const t of ["DAYS","HOURS","MINUTES","SECONDS","Out now","Releasing","15 August","Reviews open when"]) {
    console.log(`   contains ${JSON.stringify(t).padEnd(22)} ${html.includes(t)}`);
  }
  const between = html.match(/film-poster[\s\S]{0,4000}?REVIEWS|film-poster[\s\S]{0,4000}?Reviews/i);
  const strip = between ? between[0].replace(/<[^>]+>/g," ").replace(/\s+/g," ").slice(-220) : "(not found)";
  console.log("   text just before 'Reviews':", JSON.stringify(strip));
}

// ---------- 4. actual _next/image widths requested ----------
console.log("\n=== 4. REAL IMAGE REQUESTS ===");
for (const [label, w, h, dpr] of [["mobile 390 dpr3",390,844,3],["desktop 1440 dpr1",1440,900,1],["desktop 1440 dpr2",1440,900,2]]) {
  const ctx = await b.newContext({viewport:{width:w,height:h}, deviceScaleFactor:dpr, isMobile:w<500, hasTouch:w<500});
  const p = await ctx.newPage();
  const reqs = [];
  p.on("request", r => {
    const u = r.url();
    if (u.includes("/_next/image")) {
      const url = new URL(u);
      reqs.push({ f: decodeURIComponent(url.searchParams.get("url")||"").split("/").pop(), w: url.searchParams.get("w") });
    }
  });
  for (const route of ["/","/film"]) {
    await p.goto(B+route, {waitUntil:"networkidle"});
    await sleep(1200);
  }
  const seen = {};
  reqs.forEach(r => { (seen[r.f] ??= new Set()).add(r.w); });
  console.log(`  ${label}:`);
  for (const [f, ws] of Object.entries(seen)) console.log(`     ${f.padEnd(22)} w=${[...ws].join(",")}`);
  await ctx.close();
}
await b.close();
