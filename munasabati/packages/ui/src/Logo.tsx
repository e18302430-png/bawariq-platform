import { useId } from "react";

/**
 * شعار مناسبتي: "البوابة النجدية".
 * شرفات نجدية مثلثة، شريط سدو، فتحات التهوية المثلثة، وباب مقوّس تتوهج فيه نجمة الفرح.
 * ألوان غروب الصحراء: زعفران ← مرجاني ← وردي ← بنفسجي.
 */
const BODY = "M14 92V24L21 10L28 24L35 10L42 24L50 8L58 24L65 10L72 24L79 10L86 24V92ZM38 92V60C38 48 43.5 41 50 37C56.5 41 62 48 62 60V92ZM22 31L26 28L30 31L26 34ZM34 31L38 28L42 31L38 34ZM46 31L50 28L54 31L50 34ZM58 31L62 28L66 31L62 34ZM70 31L74 28L78 31L74 34ZM23 56L28 47L33 56ZM67 56L72 47L77 56Z";
const STAR = "M50 59L52.6 66.4L60 69L52.6 71.6L50 79L47.4 71.6L40 69L47.4 66.4Z";
const STOPS: [string, string][] = [["0", "#FFB547"], [".35", "#FF5A3C"], [".7", "#E5195E"], ["1", "#6A1B9A"]];

export function LogoMark({ size = 30, mono }: { size?: number; mono?: string }) {
  const id = "lg" + useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="شعار مناسبتي" style={{ flex: "none", display: "block" }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{STOPS.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient></defs>
      <path d={BODY} fill={mono ?? `url(#${id})`} fillRule="evenodd" />
      <path d={STAR} fill={mono ? mono : "#FFD27A"} />
    </svg>
  );
}

export function Logo({ size = 30, sub }: { size?: number; sub?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.3 }}>
      <LogoMark size={size} />
      <span style={{ display: "grid", lineHeight: 1.05 }}>
        <span style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: size * 0.72, letterSpacing: "-0.02em" }}>مناسبتي</span>
        {sub && <span style={{ fontSize: Math.max(10.5, size * 0.36), opacity: 0.7, fontWeight: 500 }}>{sub}</span>}
      </span>
    </span>
  );
}

const grad = `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${STOPS.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
/** الشعار وحده (شفاف) */
export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${grad}</defs><path d="${BODY}" fill="url(#g)" fill-rule="evenodd"/><path d="${STAR}" fill="#FFD27A"/></svg>`;
/** أيقونة التطبيق: الشعار على خلفية ليلية */
export const APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${grad}<radialGradient id="r" cx=".5" cy=".75" r=".6"><stop offset="0" stop-color="#3a1240"/><stop offset="1" stop-color="#140a1f"/></radialGradient></defs><rect width="100" height="100" rx="22" fill="url(#r)"/><g transform="translate(15 13) scale(.7)"><path d="${BODY}" fill="url(#g)" fill-rule="evenodd"/><path d="${STAR}" fill="#FFD27A"/></g></svg>`;
