/** صور الهوية المولّدة للمنصة (WebP بحجمين). المرجع داخل البيانات بصيغة "media:<key>" */
const full = import.meta.glob("../media/*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const byKey: Record<string, string> = {};
for (const [path, url] of Object.entries(full)) byKey[path.split("/").pop()!.replace(".webp", "")] = url;

export function photoUrl(p: string, small = false): string {
  if (!p.startsWith("media:")) return p;
  const k = p.slice(6);
  return (small && byKey[`${k}-sm`]) || byKey[k] || "";
}

export const BRAND_MEDIA = Object.keys(byKey).filter((k) => !k.endsWith("-sm"));
