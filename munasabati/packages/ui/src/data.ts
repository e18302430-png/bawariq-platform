import { createContext, useContext, useSyncExternalStore } from "react";
import { createInitialDB, createLocalRepository, type DB, type Mutation, type Repository } from "@munasabati/core";

/** مستودع مؤجل: يحمّل مكتبة Supabase فقط عند تفعيل وضع الإنتاج (لا تُحمَّل في وضع التجربة) */
function deferredCloud(url: string, key: string, authMode: "phone" | "quick"): Repository {
  let inner: Repository | null = null;
  let resolveReady: (r: Repository) => void = () => {};
  const ready = new Promise<Repository>((r) => { resolveReady = r; });
  const listeners = new Set<() => void>();
  const empty: DB = { ...createInitialDB(), suppliers: [], venues: [], bookings: [] };
  const emit = () => listeners.forEach((l) => l());
  void import("@munasabati/cloud").then(({ createSupabaseRepository }) => { inner = createSupabaseRepository(url, key, authMode); inner.subscribe(emit); emit(); resolveReady(inner); });
  return {
    mode: "cloud",
    get: () => inner?.get() ?? empty,
    apply: (m) => inner?.apply(m),
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
    reset: () => inner?.reset(),
    uploadPhoto: (b) => (inner ? inner.uploadPhoto(b) : Promise.reject(new Error("لحظة، جاري الاتصال"))),
    get auth() { return inner?.auth; },
    // شاشة المنسق تعمل حتى قبل اكتمال تحميل مكتبة السحابة
    door: {
      load: async (k) => (await ready).door!.load(k),
      checkIn: async (k, c) => (await ready).door!.checkIn(k, c),
      post: async (k, f, t, kd) => (await ready).door!.post(k, f, t, kd),
    },
    invite: {
      load: async (c) => (await ready).invite!.load(c),
      rsvp: async (c, p) => (await ready).invite!.rsvp(c, p),
    },
    ready: () => inner?.ready?.() ?? false,
    error: () => inner?.error() ?? null,
  };
}

/**
 * اختيار مصدر البيانات:
 * - إذا وُجدت VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY: قاعدة بيانات حقيقية + دخول بالجوال.
 * - غير ذلك: وضع التجربة داخل المتصفح ببيانات أمثلة.
 */
const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
/** quick (افتراضي): دخول فوري بالاسم والجوال. phone: رمز SMS بعد ربط مزود رسائل في Supabase */
const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE as string | undefined) === "phone" ? "phone" : "quick";

export const repo: Repository = URL_ && KEY_ ? deferredCloud(URL_, KEY_, AUTH_MODE) : createLocalRepository();
export const isCloud = repo.mode === "cloud";

/** بيانات بديلة لشاشة واحدة (مثل دعوة ضيف قادمة من البوابة الآمنة بدل بيانات المستخدم) */
const DBOverride = createContext<DB | null>(null);
export const DBProvider = DBOverride.Provider;
export function useDB(): DB {
  const over = useContext(DBOverride);
  const db = useSyncExternalStore(repo.subscribe, repo.get, repo.get);
  return over ?? db;
}
/** اكتمل التحميل الأول؟ (محلياً دائماً نعم) */
export function useReady(): boolean {
  useSyncExternalStore(repo.subscribe, repo.get, repo.get);
  return !isCloud || (repo.ready?.() ?? true);
}

export const apply = (m: Mutation) => repo.apply(m);

/** يصغّر الصورة قبل الرفع (أقصى ضلع 1400px، JPEG) لتوفير المساحة وتسريع التحميل */
export async function resizeImage(file: File, max = 1400, quality = 0.82): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("فشل تجهيز الصورة"))), "image/jpeg", quality));
  } finally { URL.revokeObjectURL(url); }
}
