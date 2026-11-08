// يولّد أيقونات التطبيق (PWA) وصورة المشاركة من الشعار، لكل تطبيق داخل public/
// التشغيل: node scripts/gen-brand-assets.cjs  (يتطلب playwright)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "packages/ui/src/Logo.tsx"), "utf8");
const LOGO = src.match(/LOGO_SVG = `([^`]+)`/)[1];

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
  const square = (s, pad) => `<div style="width:${s}px;height:${s}px;display:grid;place-items:center;background:#120a1c"><div style="width:${s - pad * 2}px;height:${s - pad * 2}px">${LOGO.replace("<svg", '<svg width="100%" height="100%"')}</div></div>`;
  const tmp = path.join(root, "node_modules/.brand");
  fs.mkdirSync(tmp, { recursive: true });
  await shot(LOGO.replace("<svg", '<svg width="512" height="512"'), 512, 512, path.join(tmp, "icon-512.png"));
  await shot(LOGO.replace("<svg", '<svg width="192" height="192"'), 192, 192, path.join(tmp, "icon-192.png"));
  await shot(square(512, 70), 512, 512, path.join(tmp, "maskable-512.png"));
  await shot(LOGO.replace("<svg", '<svg width="180" height="180"'), 180, 180, path.join(tmp, "apple-touch-icon.png"));
  await p.setContent("");
  await shot(`<div style="width:1200px;height:630px;display:flex;align-items:center;gap:56px;padding:0 90px;box-sizing:border-box;color:#fff;font-family:system-ui;direction:rtl;background:radial-gradient(900px 600px at 85% 10%,#FF8A4C,transparent 60%),radial-gradient(900px 700px at 20% 90%,#7A1FA2,transparent 60%),#E5195E">
    <div style="width:220px;height:220px;flex:none">${LOGO.replace("<svg", '<svg width="220" height="220"')}</div>
    <div><div style="font-size:120px;font-weight:800;line-height:1">مناسبتي</div><div style="font-size:42px;opacity:.9;margin-top:22px">من الفكرة لآخر ضيف</div></div></div>`, 1200, 630, path.join(tmp, "og.png"));
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
