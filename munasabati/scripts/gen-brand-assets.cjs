// يولّد أيقونات التطبيق (PWA) وصورة المشاركة من الشعار، لكل تطبيق داخل public/
// التشغيل: node scripts/gen-brand-assets.cjs  (يتطلب playwright)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "packages/ui/src/Logo.tsx"), "utf8");
// نعيد بناء النصوص من مكونات الملف (المسار والتدرج) عبر تقييم بسيط
const pick = (name) => src.match(new RegExp(`const ${name} = "([^"]+)"`))[1];
const BODY = pick("BODY"), STAR = pick("STAR");
const grad = '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB547"/><stop offset=".35" stop-color="#FF5A3C"/><stop offset=".7" stop-color="#E5195E"/><stop offset="1" stop-color="#6A1B9A"/></linearGradient>';
const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${grad}</defs><path d="${BODY}" fill="url(#g)" fill-rule="evenodd"/><path d="${STAR}" fill="#FFD27A"/></svg>`;
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${grad}<radialGradient id="r" cx=".5" cy=".75" r=".6"><stop offset="0" stop-color="#3a1240"/><stop offset="1" stop-color="#140a1f"/></radialGradient></defs><rect width="100" height="100" rx="22" fill="url(#r)"/><g transform="translate(15 13) scale(.7)"><path d="${BODY}" fill="url(#g)" fill-rule="evenodd"/><path d="${STAR}" fill="#FFD27A"/></g></svg>`;

const APPS = {
  web: { name: "مناسبتي", short: "مناسبتي", desc: "منصة المناسبات السعودية", start: "./", color: "#E5195E" },
  client: { name: "مناسبتي", short: "مناسبتي", desc: "خطط مناسبتك واحجز وأرسل الدعوات", start: "./", color: "#E5195E" },
  vendors: { name: "مناسبتي للموردين", short: "موردين", desc: "بوابة الموردين في مناسبتي", start: "./", color: "#FF7A2E" },
  venues: { name: "مناسبتي للقاعات", short: "قاعات", desc: "بوابة أصحاب القاعات في مناسبتي", start: "./", color: "#17A897" },
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const shot = async (html, w, h, file) => {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<html><body style="margin:0">${html}</body></html>`);
    await p.waitForTimeout(150);
    await p.screenshot({ path: file, omitBackground: false });
  };
  const square = (s, pad) => `<div style="width:${s}px;height:${s}px;display:grid;place-items:center;background:#140a1f"><div style="width:${s - pad * 2}px;height:${s - pad * 2}px">${LOGO.replace("<svg", '<svg width="100%" height="100%"')}</div></div>`;
  const tmp = path.join(root, "node_modules/.brand");
  fs.mkdirSync(tmp, { recursive: true });
  await shot(ICON.replace("<svg", '<svg width="512" height="512"'), 512, 512, path.join(tmp, "icon-512.png"));
  await shot(ICON.replace("<svg", '<svg width="192" height="192"'), 192, 192, path.join(tmp, "icon-192.png"));
  await shot(square(512, 90), 512, 512, path.join(tmp, "maskable-512.png"));
  await shot(ICON.replace("<svg", '<svg width="180" height="180"').replace('rx="22"', 'rx="0"'), 180, 180, path.join(tmp, "apple-touch-icon.png"));
  await p.setContent("");
  await p.setContent('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alexandria:wght@500;800&display=swap"><div style="font-family:Alexandria">.</div>');
  await p.waitForTimeout(1500);
  await p.setViewportSize({ width: 1200, height: 630 });
  await p.evaluate((html) => { document.body.innerHTML = html; document.body.style.margin = "0"; }, `<div style="width:1200px;height:630px;display:flex;align-items:center;gap:60px;padding:0 100px;box-sizing:border-box;color:#fff;font-family:Alexandria,system-ui;direction:rtl;background:radial-gradient(700px 500px at 82% 30%,rgba(255,90,60,.55),transparent 65%),radial-gradient(800px 600px at 10% 110%,rgba(106,27,154,.7),transparent 60%),#140a1f">
    <div style="width:250px;height:250px;flex:none;filter:drop-shadow(0 20px 60px rgba(255,90,60,.5))">${LOGO.replace("<svg", '<svg width="250" height="250"')}</div>
    <div><div style="font-size:136px;font-weight:800;line-height:1;letter-spacing:-3px">مناسبتي</div><div style="font-size:40px;font-weight:500;opacity:.85;margin-top:26px">من الفكرة لآخر ضيف</div></div></div>`);
  await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(tmp, "og.png") });
  await b.close();

  for (const [app, m] of Object.entries(APPS)) {
    const pub = path.join(root, "apps", app, "public");
    fs.mkdirSync(pub, { recursive: true });
    for (const f of ["icon-512.png", "icon-192.png", "maskable-512.png", "apple-touch-icon.png", "og.png"]) fs.copyFileSync(path.join(tmp, f), path.join(pub, f));
    fs.writeFileSync(path.join(pub, "favicon.svg"), LOGO);
    fs.writeFileSync(path.join(pub, "manifest.webmanifest"), JSON.stringify({
      name: m.name, short_name: m.short, description: m.desc, lang: "ar", dir: "rtl", start_url: m.start, scope: "./", display: "standalone",
      background_color: "#09080d", theme_color: m.color,
      icons: [
        { src: "icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    }, null, 2));
  }
  console.log("brand assets written");
})();
