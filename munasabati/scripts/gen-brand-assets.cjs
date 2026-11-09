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
// أيقونة التطبيق من الشعار نفسه (Logo.tsx): البوابة والمدار على خلفية ليلية
const logoSrc = fs.readFileSync(path.join(__dirname, "../packages/ui/src/Logo.tsx"), "utf8");
const P = (n) => logoSrc.match(new RegExp(`const ${n} = "([^"]+)"`))[1];
const markSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD27A"/><stop offset=".3" stop-color="#FF7A3D"/><stop offset=".65" stop-color="#E5195E"/><stop offset="1" stop-color="#6A1B9A"/></linearGradient><linearGradient id="o" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#E5195E"/></linearGradient><clipPath id="f"><rect x="0" y="66" width="120" height="60"/></clipPath></defs><g transform="rotate(-14 60 66)"><path d="${P("ORBIT")}" fill="none" stroke="url(#o)" stroke-width="2.4" opacity=".4"/></g><path d="${P("ARCH")}" fill="url(#g)" fill-rule="evenodd"/><rect x="18" y="106" width="84" height="4.5" rx="2.25" fill="url(#g)"/><path d="${P("DOOR_SPARK")}" fill="#FFD27A"/><path d="${P("SPARK")}" fill="#FFD27A"/><g clip-path="url(#f)"><g transform="rotate(-14 60 66)"><path d="${P("ORBIT")}" fill="none" stroke="url(#o)" stroke-width="2.4"/></g></g><g transform="rotate(-14 60 66)"><circle cx="110" cy="66" r="3.6" fill="#FFD27A"/></g></svg>`;
const icon = (s, radius, inset = 0) => `<div style="width:${s}px;height:${s}px;display:grid;place-items:center;background:${inset ? "#120818" : "transparent"}"><div style="width:${s - inset * 2}px;height:${s - inset * 2}px;border-radius:${radius}px;background:radial-gradient(70% 70% at 50% 70%,#3a1240,#120818);display:grid;place-items:center">${markSvg(Math.round((s - inset * 2) * 0.74))}</div></div>`;
const iconOld = (s, radius, inset = 0) => `<div style="width:${s}px;height:${s}px;display:grid;place-items:center;background:${inset ? "#140a1f" : "transparent"}">
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
    <div style="display:flex;align-items:center;gap:34px">${markSvg(170)}<div style="font-size:140px;font-weight:800;line-height:1;letter-spacing:-4px">مناسبتي</div></div>
    <div style="font-size:46px;font-weight:500;opacity:.9;margin-top:64px">مناسبتك علينا… من الفكرة لآخر ضيف</div>
    <div style="margin-top:44px;display:flex;gap:14px;font-size:24px;font-weight:500">${["زواج", "ملكة", "تخرّج", "عقيقة", "عيد ميلاد", "شركات"].map((t) => `<span style="padding:10px 22px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25)">${t}</span>`).join("")}</div></div>`, 1200, 630, path.join(tmp, "og.png"));
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
