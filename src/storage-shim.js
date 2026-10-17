// ═══════════════════════════════════════════════════════════════
// جسر التخزين (نسخة محسّنة): نفس واجهة window.storage، لكن:
//  • لا ينهار التطبيق لو متغيرات Supabase ناقصة (يعطي خطأ واضحاً بدل شاشة بيضاء)
//  • مهلة 12 ثانية لكل طلب — لو المشروع نايم/الشبكة ضعيفة يفشل بسرعة ويعيد التطبيق المحاولة
//  • "not found" فقط عند غياب السجل فعلاً (لا يُخلط مع فشل الاتصال)
// ═══════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const URL_ = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const KEY_ = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
const CONFIGURED = /^https:\/\/.+\.supabase\.co\/?$/.test(URL_) && KEY_.length > 30;
if (!CONFIGURED) console.error("bq: متغيرات VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY غير صحيحة أو ناقصة في Vercel.");

const withTimeout = (ms) => (url, opts = {}) => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { ...opts, signal: ctl.signal }).finally(() => clearTimeout(t));
};

const supabase = CONFIGURED
  ? createClient(URL_, KEY_, { auth: { persistSession: false }, global: { fetch: withTimeout(12000) } })
  : null;

const need = () => { if (!supabase) throw new Error("supabase-not-configured"); return supabase; };

function getClientId() {
  try {
    let id = localStorage.getItem("bq_client_id");
    if (!id) { id = "client-" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("bq_client_id", id); }
    return id;
  } catch { return "client-anon"; }
}
const scopeOf = (shared) => (shared ? "shared" : getClientId());

async function get(key, shared = false) {
  const { data, error } = await need().from("kv_store").select("value").eq("store_key", key).eq("scope", scopeOf(shared)).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("not found");
  return { key, value: data.value, shared };
}
async function set(key, value, shared = false) {
  const { error } = await need().from("kv_store").upsert(
    { store_key: key, scope: scopeOf(shared), value, updated_at: new Date().toISOString() },
    { onConflict: "store_key,scope" });
  if (error) throw error;
  return { key, value, shared };
}
async function del(key, shared = false) {
  const { error } = await need().from("kv_store").delete().eq("store_key", key).eq("scope", scopeOf(shared));
  if (error) throw error;
  return { key, deleted: true, shared };
}
async function list(prefix = "", shared = false) {
  let q = need().from("kv_store").select("store_key").eq("scope", scopeOf(shared));
  if (prefix) q = q.like("store_key", `${prefix}%`);
  const { data, error } = await q;
  if (error) throw error;
  return { keys: (data || []).map((r) => r.store_key), prefix, shared };
}

window.storage = { get, set, delete: del, list };
