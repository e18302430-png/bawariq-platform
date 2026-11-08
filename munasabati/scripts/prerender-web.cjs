// يطبع الواجهة الأولى لصفحة الهبوط داخل index.html وقت البناء:
// تظهر الصفحة كاملة (العنوان والأبواب) من أول لحظة قبل تحميل الجافاسكربت، ثم يستلمها React بدون وميض.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const dist = path.join(__dirname, "../apps/web/dist");
const file = path.join(dist, "index.html");
let chromium;
try { ({ chromium } = require("playwright")); } catch { console.warn("prerender: playwright غير متوفر، تم التخطي"); process.exit(0); }

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".mp4": "video/mp4", ".json": "application/json", ".webmanifest": "application/manifest+json" };
const server = http.createServer((req, res) => {
  const p = path.join(dist, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
  if (!p.startsWith(dist) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(p)] ?? "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const html = fs.readFileSync(file, "utf8").replace(/<div id="root"([^>]*)>[\s\S]*?<\/div>\s*<!--ssg-end-->/, '<div id="root"$1></div>');
  fs.writeFileSync(file, html);
  const b = await chromium.launch();
  try {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await p.goto(`http://localhost:${port}/index.html`);
    await p.waitForSelector(".doors .door");
    await p.waitForTimeout(1600); // انتهاء حركات الدخول وقبل تبديل الكلمة
    const inner = await p.evaluate(() => {
      const root = document.getElementById("root").cloneNode(true);
      root.querySelectorAll("canvas").forEach((c) => { c.removeAttribute("width"); c.removeAttribute("height"); c.classList.remove("ready"); });
      root.querySelectorAll(".film-modal").forEach((x) => x.remove());
      return root.innerHTML;
    });
    let out = html.replace(/<div id="root"([^>]*)><\/div>/, `<div id="root"$1>${inner}</div><!--ssg-end-->`);
    // الصورة الاحتياطية لم تعد لازمة: الواجهة نفسها مطبوعة
    out = out.replace(/\s*<!-- أول صورة[^>]*-->\s*<div id="boot-hero"[^>]*><\/div>/, "");
    fs.writeFileSync(file, out);
    console.log(`prerender: ${Math.round(inner.length / 1024)}KB من الواجهة مطبوعة في index.html`);
  } finally { await b.close(); server.close(); }
})().catch((e) => { console.error("prerender failed:", e.message); process.exit(1); });
