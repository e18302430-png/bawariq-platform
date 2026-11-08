import { useId } from "react";

/**
 * شعار مناسبتي: باب مقوّس نجدي (مدخل المناسبة) تعلوه نجمة الفرح،
 * على مربع بزوايا ناعمة بتدرج الهوية (مرجاني ← وردي ← بنفسجي).
 */
export function LogoMark({ size = 30, mono = false }: { size?: number; mono?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="شعار مناسبتي" style={{ flex: "none", display: "block" }}>
      <defs>
        <linearGradient id={`g${id}`} x1="8" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF8A4C" />
          <stop offset=".5" stopColor="#E5195E" />
          <stop offset="1" stopColor="#7A1FA2" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={mono ? "currentColor" : `url(#g${id})`} />
      <path d="M19 52V31.5C19 24.04 24.82 18 32 18s13 6.04 13 13.5V52" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M27 52V36a5 5 0 0 1 10 0v16" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 5.5l2.1 4.4 4.4 2.1-4.4 2.1L32 18.5l-2.1-4.4-4.4-2.1 4.4-2.1z" fill="#fff" />
    </svg>
  );
}

export function Logo({ size = 30, sub }: { size?: number; sub?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.32 }}>
      <LogoMark size={size} />
      <span style={{ display: "grid", lineHeight: 1.1 }}>
        <span style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: size * 0.68, letterSpacing: "-0.02em" }}>مناسبتي</span>
        {sub && <span style={{ fontSize: Math.max(10.5, size * 0.38), opacity: 0.7, fontWeight: 500 }}>{sub}</span>}
      </span>
    </span>
  );
}

/** نفس الشعار كنص SVG (للأيقونة والـ favicon وصورة المشاركة) */
export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="8" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF8A4C"/><stop offset=".5" stop-color="#E5195E"/><stop offset="1" stop-color="#7A1FA2"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="url(#g)"/><path d="M19 52V31.5C19 24.04 24.82 18 32 18s13 6.04 13 13.5V52" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M27 52V36a5 5 0 0 1 10 0v16" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3.5" stroke-linecap="round"/><path d="M32 5.5l2.1 4.4 4.4 2.1-4.4 2.1L32 18.5l-2.1-4.4-4.4-2.1 4.4-2.1z" fill="#fff"/></svg>`;
