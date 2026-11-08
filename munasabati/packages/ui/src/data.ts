import { useSyncExternalStore } from "react";
import { createLocalRepository, type DB, type Mutation, type Repository } from "@munasabati/core";
import { createSupabaseRepository } from "@munasabati/cloud";

/**
 * اختيار مصدر البيانات:
 * - إذا وُجدت VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY: قاعدة بيانات حقيقية + دخول بالجوال.
 * - غير ذلك: وضع التجربة داخل المتصفح ببيانات أمثلة.
 */
const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const repo: Repository = URL_ && KEY_ ? createSupabaseRepository(URL_, KEY_) : createLocalRepository();
export const isCloud = repo.mode === "cloud";

export function useDB(): DB {
  return useSyncExternalStore(repo.subscribe, repo.get, repo.get);
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
