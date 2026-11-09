// رابط الدعوة القصير: /i/<رمز الضيف>
// الواتساب ما يقرأ الصفحات اللي تتبني بالجافاسكربت، فهذي الدالة ترجع للواتساب بطاقة جاهزة بعنوان «دعوة لزواج فيصل»
// واسم الضيف وموعد المناسبة، والضيف نفسه يتحوّل فوراً لصفحة دعوته.
// المفتاح العام آمن (نفس الموجود في المتصفح)، والدالة invite_load ترجع دعوة هذا الضيف فقط.
const URL = process.env.SUPABASE_URL || "https://yejsuchjmomoaaphazre.supabase.co";
const KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllanN1Y2hqbW9tb2FhcGhhenJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNjM0NDksImV4cCI6MjEwOTczOTQ0OX0.8Bi2erIZuT6ozz9WLPfXkLms-e94F88nOr62ZCMYXM8";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const titleOf = (t) => { t = String(t || "").trim(); return t ? "دعوة " + (t.startsWith("ال") ? "لل" + t.slice(2) : "ل" + t) : "دعوة من مناسبتي"; };
const whenOf = (date, time) => {
  try {
    const d = new Date(`${date}T${time || "20:30"}:00+03:00`);
    const opt = { timeZone: "Asia/Riyadh" };
    const day = new Intl.DateTimeFormat("ar-SA", { ...opt, weekday: "long" }).format(d);
    const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { ...opt, day: "numeric", month: "long" }).format(d).replace(/\s*هـ$/, "");
    const clock = new Intl.DateTimeFormat("ar-SA", { ...opt, hour: "numeric", minute: "2-digit" }).format(d);
    return `يوم ${day} ${hijri} الساعة ${clock}`;
  } catch { return date || ""; }
};

export default async function handler(req, res) {
  const code = String(req.query.c || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 20);
  const host = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
  const target = `/client/#invite-${code}`;
  let title = "دعوة من مناسبتي", desc = "افتح دعوتك وأكّد حضورك.", image = `${host}/og.png`;
  try {
    if (code.length >= 4) {
      const r = await fetch(`${URL}/rest/v1/rpc/invite_load`, { method: "POST", headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" }, body: JSON.stringify({ c: code }) });
      const s = r.ok ? await r.json() : null;
      if (s && s.event) {
        title = titleOf(s.event.title) + " 💌";
        const first = String(s.guest?.name || "").split("،")[0].trim();
        desc = s.event.endedAt
          ? `${first ? `شكراً ${first}، ` : ""}${s.event.thanks || "نورتوا ليلتنا."}`
          : `${first ? `يا هلا والله ${first} 🤍 ` : ""}يشرّفنا حضورك ${whenOf(s.event.date, s.invite?.time)}${s.venue?.name ? ` في ${s.venue.name}` : ""}. افتح دعوتك وأكّد حضورك.`;
        const photo = s.venue?.photos?.[0];
        if (photo && /^https:\/\//.test(photo)) image = photo;
      }
    }
  } catch { /* نرجع البطاقة العامة */ }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  res.setHeader("X-Robots-Tag", "noindex");
  res.status(200).send(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="مناسبتي">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image)}"><meta property="og:url" content="${esc(host + "/i/" + code)}">
<meta name="twitter:card" content="summary_large_image"><meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0;url=${esc(target)}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fbf7f0;font-family:system-ui,sans-serif;color:#5a2a1a}</style>
</head><body><p>${esc(title)}</p><script>location.replace(${JSON.stringify(target)})</script></body></html>`);
}
