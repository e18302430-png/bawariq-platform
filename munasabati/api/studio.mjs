// استوديو مناسبتي: بوابة خادم واحدة لتوليد الصور بالذكاء الاصطناعي (عبر MuAPI)
// - المفتاح في متغير البيئة MUAPI_KEY فقط، وما يوصل للمتصفح أبداً
// - قوالب ثابتة فقط: العميل يختار «طابع» و«لون» من قائمة، وما فيه أي كتابة حرة
// - كل قالب يمنع الأشخاص والوجوه والكتابة، وما نقبل رفع صور من العملاء
// - لازم تسجيل دخول، وحد يومي لكل مستخدم وسقف يومي للمنصة (studio_claim في studio.sql)
// - الصورة تنحفظ في تخزين مناسبتي (روابط المزود تنتهي)، وتُعلَّم «مولّدة بالذكاء الاصطناعي» في الواجهة
const SB = process.env.SUPABASE_URL || "https://yejsuchjmomoaaphazre.supabase.co";
const ANON = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllanN1Y2hqbW9tb2FhcGhhenJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNjM0NDksImV4cCI6MjEwOTczOTQ0OX0.8Bi2erIZuT6ozz9WLPfXkLms-e94F88nOr62ZCMYXM8";
const MU = "https://api.muapi.ai/api/v1";
const MODEL = process.env.STUDIO_MODEL || "flux-dev-image";

const STYLES = {
  najdi: "Najdi heritage architecture, mud-brick arches and triangular window motifs, palm fronds, soft dawn light",
  desert: "Arabian desert at night, rolling sand dunes, starry sky, crescent moon, glowing lanterns on the sand",
  gold: "luxurious gold arabesque ornaments and fine filigree frame on ivory paper, subtle foil texture",
  floral: "lush roses, peonies and baby's breath, elegant flower arch, loose watercolor petals",
  sea: "Arabian Gulf seaside at sunset, traditional wooden dhow on calm water, soft reflections",
  islamic: "Islamic geometric star pattern, mosaic tiles and a pointed arch window, symmetrical and refined",
};
const PALETTES = {
  rose: "blush pink, dusty rose and cream", gold: "champagne gold, warm ivory and sand", emerald: "emerald green, gold and ivory",
  navy: "midnight navy, silver and soft gold", ivory: "ivory white, pearl and pale beige", lilac: "soft lilac, lavender and pearl white",
};
const SPACES = {
  kosha: "a wedding kosha stage with a decorated sofa centerpiece", tables: "elegant banquet tables with centerpieces and place settings",
  entrance: "a grand venue entrance walkway with floral arches", stage: "an event hall stage with drapery and floral installations",
};
const SAFE = "absolutely no people, no humans, no faces, no hands, no silhouettes, no text, no letters, no words, no watermark";

function build(feature, p) {
  const style = STYLES[p?.style], pal = PALETTES[p?.palette];
  if (!style || !pal) return null;
  if (feature === "invite-art") return { prompt: `Elegant watercolor illustration for a luxury Saudi invitation card background. ${style}. Color palette: ${pal}. Calm composition with generous empty space in the center for text, delicate paper texture, high detail, refined and celebratory. ${SAFE}.`, width: 768, height: 1024 };
  if (feature === "decor") { const sp = SPACES[p?.space]; if (!sp) return null; return { prompt: `Photorealistic interior design concept render of ${sp} for a Saudi celebration. Theme: ${style}. Color palette: ${pal}. Warm cinematic lighting, empty venue before guests arrive, editorial architectural photography. ${SAFE}.`, width: 1024, height: 768 }; }
  return null;
}

const sbFetch = (path, jwt, init = {}) => fetch(`${SB}${path}`, { ...init, headers: { apikey: ANON, Authorization: `Bearer ${jwt}`, "Content-Type": "application/json", ...(init.headers || {}) } });
const fail = (res, code, msg) => res.status(code).json({ error: msg });
const MSG = { "login required": "سجّل الدخول أولاً", "studio off": "الاستوديو متوقف مؤقتاً", "daily cap": "وصلنا حد اليوم، جرّب بكرة", "user cap": "استخدمت محاولاتك لليوم، جرّب بكرة", "admin only": "للإدارة فقط" };

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const key = process.env.MUAPI_KEY;
  if (!key) return fail(res, 503, "الاستوديو قريباً");
  const jwt = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!jwt || jwt === ANON) return fail(res, 401, MSG["login required"]);
  const u = await sbFetch("/auth/v1/user", jwt).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!u?.id) return fail(res, 401, MSG["login required"]);

  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const feature = String(body.feature || "");
      const preset = { style: String(body.preset?.style || ""), palette: String(body.preset?.palette || ""), space: body.preset?.space ? String(body.preset.space) : undefined };
      const job = build(feature, preset);
      if (!job) return fail(res, 400, "اختيار غير صحيح");
      const c = await sbFetch("/rest/v1/rpc/studio_claim", jwt, { method: "POST", body: JSON.stringify({ p_feature: feature, p_preset: preset }) });
      if (!c.ok) { const e = await c.json().catch(() => ({})); const m = Object.keys(MSG).find((k) => String(e.message || "").includes(k)); return fail(res, 429, m ? MSG[m] : "ما قدرنا نبدأ"); }
      const id = await c.json();
      const r = await fetch(`${MU}/${MODEL}`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": key }, body: JSON.stringify(job) });
      const d = await r.json().catch(() => ({}));
      const rid = d.request_id || d.id;
      if (!r.ok || !rid) { await sbFetch("/rest/v1/rpc/studio_done", jwt, { method: "POST", body: JSON.stringify({ p_id: id, p_request: null, p_url: null, p_status: "failed" }) }); return fail(res, 502, "المزود ما رد، جرّب بعد شوي"); }
      await sbFetch("/rest/v1/rpc/studio_done", jwt, { method: "POST", body: JSON.stringify({ p_id: id, p_request: rid, p_url: null, p_status: "pending" }) });
      return res.status(200).json({ id, req: rid });
    }

    // GET ?id=&req= : فحص واحد للنتيجة (المتصفح يعيد كل ٣ ثواني)
    const id = String(req.query.id || "").replace(/[^a-f0-9-]/gi, ""), rid = String(req.query.req || "").replace(/[^A-Za-z0-9_-]/g, "");
    if (!id || !rid) return fail(res, 400, "طلب ناقص");
    const r = await fetch(`${MU}/predictions/${rid}/result`, { headers: { "x-api-key": key } });
    const d = await r.json().catch(() => ({}));
    const st = String(d.status || "").toLowerCase();
    if (["failed", "error", "cancelled", "canceled"].includes(st)) { await sbFetch("/rest/v1/rpc/studio_done", jwt, { method: "POST", body: JSON.stringify({ p_id: id, p_request: null, p_url: null, p_status: "failed" }) }); return res.status(200).json({ status: "failed" }); }
    const out = d.outputs?.[0] || d.url || d.output?.url;
    if (!["completed", "succeeded", "success"].includes(st) || !out) return res.status(200).json({ status: "pending" });
    // ننسخ الصورة لتخزين مناسبتي في مجلد المستخدم
    const img = await fetch(out);
    const type = img.headers.get("content-type") || "image/jpeg";
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
    const path = `${u.id}/ai-${id}.${ext}`;
    const up = await fetch(`${SB}/storage/v1/object/media/${path}`, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${jwt}`, "Content-Type": type, "Cache-Control": "31536000", "x-upsert": "true" }, body: Buffer.from(await img.arrayBuffer()) });
    const url = up.ok ? `${SB}/storage/v1/object/public/media/${path}` : out;
    await sbFetch("/rest/v1/rpc/studio_done", jwt, { method: "POST", body: JSON.stringify({ p_id: id, p_request: null, p_url: url, p_status: "done" }) });
    return res.status(200).json({ status: "done", url });
  } catch {
    return fail(res, 500, "صار خطأ، جرّب مرة ثانية");
  }
}
