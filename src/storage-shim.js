import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("⚠️ لم يتم ضبط متغيرات Supabase في إعدادات Vercel.");
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");

function getClientId() {
  let id = localStorage.getItem("bq_client_id");
  if (!id) {
    id = "client-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("bq_client_id", id);
  }
  return id;
}

const SHARED_SCOPE = "shared";

async function get(key, shared = false) {
  const scope = shared ? SHARED_SCOPE : getClientId();
  const { data, error } = await supabase
    .from("kv_store").select("value")
    .eq("store_key", key).eq("scope", scope).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("not found");
  return { key, value: data.value, shared };
}

async function set(key, value, shared = false) {
  const scope = shared ? SHARED_SCOPE : getClientId();
  const { error } = await supabase.from("kv_store").upsert(
    { store_key: key, scope, value, updated_at: new Date().toISOString() },
    { onConflict: "store_key,scope" }
  );
  if (error) throw error;
  return { key, value, shared };
}

async function del(key, shared = false) {
  const scope = shared ? SHARED_SCOPE : getClientId();
  const { error } = await supabase.from("kv_store").delete()
    .eq("store_key", key).eq("scope", scope);
  if (error) throw error;
  return { key, deleted: true, shared };
}

async function list(prefix = "", shared = false) {
  const scope = shared ? SHARED_SCOPE : getClientId();
  let query = supabase.from("kv_store").select("store_key").eq("scope", scope);
  if (prefix) query = query.like("store_key", `${prefix}%`);
  const { data, error } = await query;
  if (error) throw error;
  return { keys: (data || []).map((r) => r.store_key), prefix, shared };
}

window.storage = { get, set, delete: del, list };
