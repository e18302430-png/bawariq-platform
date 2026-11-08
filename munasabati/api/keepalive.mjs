// مهمة يومية تلقائية (Vercel Cron): طلب قراءة خفيف لقاعدة البيانات حتى لا يُوقف Supabase المشروع المجاني لقلة النشاط.
// المفتاح العام آمن (نفس المفتاح الموجود في المتصفح، والحماية بسياسات RLS).
const URL = process.env.SUPABASE_URL || "https://yejsuchjmomoaaphazre.supabase.co";
const KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllanN1Y2hqbW9tb2FhcGhhenJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNjM0NDksImV4cCI6MjEwOTczOTQ0OX0.8Bi2erIZuT6ozz9WLPfXkLms-e94F88nOr62ZCMYXM8";

export default async function handler(req, res) {
  const started = Date.now();
  try {
    const r = await fetch(URL + "/rest/v1/suppliers?select=id&limit=1", { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
    res.setHeader("Cache-Control", "no-store");
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, ms: Date.now() - started, at: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e), at: new Date().toISOString() });
  }
}
