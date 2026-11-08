// يولّد أيقونات التطبيق (PWA) وصورة المشاركة: حرف "م" بخط الهوية، بدون شعار رسومي
// التشغيل: node scripts/gen-brand-assets.cjs  (يتطلب playwright)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const APPS = {
  web: { name: "مناسبتي", short: "مناسبتي", desc: "منصة المناسبات السعودية", color: "#E5195E" },
  client: { name: "مناسبتي", short: "مناسبتي", desc: "خطط مناسبتك واحجز وأرسل الدعوات", color: "#E5195E" },
  vendors: { name: "مناسبتي للموردين", short: "موردين", desc: "بوابة الموردين في مناسبتي", color: "#FF7A2E" },
  venues: { name: "مناسبتي للقاعات", short: "قاعات", desc: "بوابة أصحاب القاعات في مناسبتي", color: "#17A897" },
};
const FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alexandria:wght@500;800&display=block">';
const BG = "radial-gradient(120% 120% at 80% 0%, #FF8A4C 0%, #E5195E 45%, #6A1B9A 100%)";
const icon = (s, radius, inset = 0) => `<div style="width:${s}px;height:${s}px;display:grid;place-items:center;background:${inset ? "#140a1f" : "transparent"}">
  <div style="width:${s - inset * 2}px;height:${s - inset * 2}px;border-radius:${radius}px;background:${BG};display:grid;place-items:center;font-family:Alexandria;font-weight:800;color:#fff;font-size:${(s - inset * 2) * 0.62}px;line-height:1;padding-bottom:${(s - inset * 2) * 0.1}px;box-sizing:border-box">م</div></div>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const tmp = path.join(root, "node_modules/.brand");
  fs.mkdirSync(tmp, { recursive: true });
  const shot = async (html, w, h, file, transparent = false) => {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<html><head>${FONT}</head><body style="margin:0;background:transparent">${html}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: file, omitBackground: transparent });
  };
  await shot(icon(512, 112), 512, 512, path.join(tmp, "icon-512.png"), true);
  await shot(icon(192, 42), 192, 192, path.join(tmp, "icon-192.png"), true);
  await shot(icon(512, 0, 0).replace("border-radius:0px", "border-radius:0"), 512, 512, path.join(tmp, "maskable-512.png"));
  await shot(icon(180, 0), 180, 180, path.join(tmp, "apple-touch-icon.png"));
  await shot(icon(64, 14), 64, 64, path.join(tmp, "favicon.png"), true);
  await shot(`<div style="width:1200px;height:630px;display:flex;flex-direction:column;justify-content:center;padding:0 110px;box-sizing:border-box;color:#fff;font-family:Alexandria;direction:rtl;background:radial-gradient(700px 520px at 85% 15%,rgba(255,122,61,.7),transparent 65%),radial-gradient(800px 600px at 5% 110%,rgba(106,27,154,.85),transparent 60%),#140a1f">
    <div style="font-size:150px;font-weight:800;line-height:1;letter-spacing:-4px">مناسبتي</div>
    <div style="font-size:44px;font-weight:500;opacity:.88;margin-top:30px">من الفكرة لآخر ضيف</div>
    <div style="margin-top:44px;display:flex;gap:14px;font-size:24px;font-weight:500">${["قاعات", "تجهيزات", "دعوات", "ضيافة"].map((t) => `<span style="padding:10px 22px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25)">${t}</span>`).join("")}</div></div>`, 1200, 630, path.join(tmp, "og.png"));
  await b.close();

  for (const [app, m] of Object.entries(APPS)) {
    const pub = path.join(root, "apps", app, "public");
    fs.mkdirSync(pub, { recursive: true });
    for (const f of ["icon-512.png", "icon-192.png", "maskable-512.png", "apple-touch-icon.png", "favicon.png", "og.png"]) fs.copyFileSync(path.join(tmp, f), path.join(pub, f));
    try { fs.unlinkSync(path.join(pub, "favicon.svg")); } catch { /* */ }
    fs.writeFileSync(path.join(pub, "manifest.webmanifest"), JSON.stringify({
      name: m.name, short_name: m.short, description: m.desc, lang: "ar", dir: "rtl", start_url: "./", scope: "./", display: "standalone",
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
