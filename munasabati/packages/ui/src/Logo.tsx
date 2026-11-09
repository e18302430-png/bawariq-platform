import { useId } from "react";

/**
 * شعار مناسبتي: «البوابة والمدار».
 * بوابة مقوّسة (باب كل مناسبة) تعلوها نجمة الفرح، ويدور حولها مدار فيه نقطة مضيئة:
 * المنصة اللي تمسك كل تفاصيل مناسبتك وتدور فيها لين آخر ضيف.
 * ألوان الغروب السعودي: ذهبي ← مرجاني ← وردي ← بنفسجي.
 */
export const BRAND = {
  name: "مناسبتي",
  /** هدف المنصة بجملة واحدة */
  goal: "مناسبتك علينا… من الفكرة لآخر ضيف",
  promise: "أي مناسبة، بميزانيتك، بعروض حقيقية، وليلة منظمة لين آخر ضيف.",
  portals: {
    client: "مناسبتك علينا",
    vendors: "طلبات جاهزة، وفلوسك مضمونة",
    venues: "قاعتك مليانة طول الموسم",
    admin: "غرفة القيادة",
  },
} as const;

const ARCH = "M28 108V58A32 32 0 0 1 92 58V108ZM44 108V63A16 16 0 0 1 76 63V108Z";
const SPARK = "M60 7L63.4 16.6L73 20L63.4 23.4L60 33L56.6 23.4L47 20L56.6 16.6Z";
const DOOR_SPARK = "M60 78L62 84L68 86L62 88L60 94L58 88L52 86L58 84Z";
const ORBIT = "M10 66A50 15 0 1 0 110 66A50 15 0 1 0 10 66";
const STOPS: [string, string][] = [["0", "#FFD27A"], [".3", "#FF7A3D"], [".65", "#E5195E"], ["1", "#6A1B9A"]];

export function LogoMark({ size = 30, mono, animated }: { size?: number; mono?: string; animated?: boolean }) {
  const id = "lg" + useId().replace(/:/g, "");
  const fill = mono ?? `url(#${id}g)`;
  const gold = mono ?? "#FFD27A";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="شعار مناسبتي" style={{ flex: "none", display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">{STOPS.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient>
        <linearGradient id={`${id}o`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFD27A" /><stop offset="1" stopColor="#E5195E" /></linearGradient>
        <clipPath id={`${id}f`}><rect x="0" y="66" width="120" height="60" /></clipPath>
      </defs>
      {/* المدار من خلف البوابة */}
      <g transform="rotate(-14 60 66)"><path d={ORBIT} fill="none" stroke={mono ?? `url(#${id}o)`} strokeWidth="2.4" opacity={mono ? 0.45 : 0.4} /></g>
      <path d={ARCH} fill={fill} fillRule="evenodd" />
      <rect x="18" y="106" width="84" height="4.5" rx="2.25" fill={fill} />
      <path d={DOOR_SPARK} fill={gold} opacity={0.95}>
        {animated && <animate attributeName="opacity" values=".95;.35;.95" dur="2.4s" repeatCount="indefinite" />}
      </path>
      <path d={SPARK} fill={gold}>
        {animated && <animateTransform attributeName="transform" type="scale" additive="sum" values="1;1.12;1" dur="2.4s" repeatCount="indefinite" />}
      </path>
      {/* المدار من قدّام البوابة، ونقطته تدور */}
      <g clipPath={`url(#${id}f)`}><g transform="rotate(-14 60 66)"><path d={ORBIT} fill="none" stroke={mono ?? `url(#${id}o)`} strokeWidth="2.4" /></g></g>
      <g transform="rotate(-14 60 66)">
        <circle r="3.6" fill={gold} cx={animated ? 0 : 110} cy={animated ? 0 : 66}>
          {animated && <animateMotion dur="5.5s" repeatCount="indefinite" path={ORBIT} />}
        </circle>
      </g>
    </svg>
  );
}

/** الشعار كامل: العلامة + الاسم (+ جملة البوابة أو الهدف) */
export function Logo({ size = 30, sub, animated, light }: { size?: number; sub?: string; animated?: boolean; light?: boolean }) {
  return (
    <span className="brand-logo" style={{ display: "inline-flex", alignItems: "center", gap: size * 0.5, color: light ? "#fff" : undefined }}>
      <LogoMark size={size * 1.15} animated={animated} />
      <span style={{ display: "grid", lineHeight: 1.1 }}>
        <span style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: size * 0.74, letterSpacing: "-0.01em" }}>{BRAND.name}</span>
        {sub && <span style={{ fontSize: Math.max(10.5, size * 0.34), opacity: 0.75, fontWeight: 500 }}>{sub}</span>}
      </span>
    </span>
  );
}

const svgDefs = `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${STOPS.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient><linearGradient id="o" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#E5195E"/></linearGradient><clipPath id="f"><rect x="0" y="66" width="120" height="60"/></clipPath>`;
const svgBody = `<g transform="rotate(-14 60 66)"><path d="${ORBIT}" fill="none" stroke="url(#o)" stroke-width="2.4" opacity=".4"/></g><path d="${ARCH}" fill="url(#g)" fill-rule="evenodd"/><rect x="18" y="106" width="84" height="4.5" rx="2.25" fill="url(#g)"/><path d="${DOOR_SPARK}" fill="#FFD27A"/><path d="${SPARK}" fill="#FFD27A"/><g clip-path="url(#f)"><g transform="rotate(-14 60 66)"><path d="${ORBIT}" fill="none" stroke="url(#o)" stroke-width="2.4"/></g></g><g transform="rotate(-14 60 66)"><circle cx="110" cy="66" r="3.6" fill="#FFD27A"/></g>`;
/** الشعار وحده (شفاف) */
export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs>${svgDefs}</defs>${svgBody}</svg>`;
/** أيقونة التطبيق: الشعار على خلفية ليلية */
export const APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs>${svgDefs}<radialGradient id="r" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#3a1240"/><stop offset="1" stop-color="#120818"/></radialGradient></defs><rect width="120" height="120" rx="27" fill="url(#r)"/><g transform="translate(18 14) scale(.7)">${svgBody}</g></svg>`;
