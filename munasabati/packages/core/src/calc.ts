import { profileOf, type Place } from "./occasions";
import type { OccasionId } from "./types";
import { TIERS } from "./catalog";
import type { Booking, Hall, TierId, Venue } from "./types";

export const DAY = 864e5;

export const fmt = (n?: number) => (n == null ? "—" : new Intl.NumberFormat("en-US").format(Math.round(n || 0)));
/** المبلغ بالريال، أو "عند الطلب" إذا ما أدخله التاجر */
export const sar = (n?: number) => (n ? `${fmt(n)} ر.س` : "عند الطلب");
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);
export const today = () => isoDay(new Date());

export function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDay(d);
}

export function daysUntil(iso: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((new Date(`${iso}T20:00:00`).getTime() - now) / DAY));
}

/** الجمعة والسبت (وليلة الخميس) تحسب بسعر نهاية الأسبوع */
export function isWeekend(iso: string): boolean {
  const day = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return day === 4 || day === 5 || day === 6;
}

/** الأرقام كلها يدخلها صاحب القاعة؛ 0 أو undefined تعني "لم تُحدد بعد" */
export const hallCapacity = (h: Hall) => (h.menCap ?? 0) + (h.womenCap ?? 0);
export const hallPrice = (h: Hall, iso: string): number | undefined => (isWeekend(iso) ? h.weekendPrice ?? h.weekdayPrice : h.weekdayPrice ?? h.weekendPrice);
export const venueCapacity = (v: Venue) => Math.max(0, ...v.halls.map(hallCapacity));
export const venueFrom = (v: Venue): number | undefined => { const p = v.halls.map((h) => h.weekdayPrice).filter((x): x is number => !!x); return p.length ? Math.min(...p) : undefined; };
/** نص السعر للعرض: الرقم إن أدخله التاجر، وإلا "عند الطلب" */
export const priceText = (n?: number) => (n ? `${fmt(n)} ر.س` : "السعر عند الطلب");

export function estimateBudget(guests: number, tier: TierId) {
  const t = TIERS.find((x) => x.id === tier) ?? TIERS[1];
  const g = Math.max(50, guests);
  const lines = [
    { cat: "venue", label: "القاعة", est: Math.round((18000 + g * 45) * t.mult) },
    { cat: "hosp", label: "العشاء والضيافة", est: Math.round(g * 95 * t.mult) },
    { cat: "kosha", label: "الكوشة والتنسيق", est: Math.round(9000 * t.mult) },
    { cat: "photo", label: "التصوير", est: Math.round(7000 * t.mult) },
    { cat: "av", label: "الصوت والإضاءة", est: Math.round(5000 * t.mult) },
    { cat: "other", label: "الدعوات والهدايا والطوارئ", est: Math.round(g * 12 * t.mult + 3000) },
  ];
  return { lines, total: lines.reduce((s, l) => s + l.est, 0) };
}

/** توزيع ذكي لميزانية يحددها العميل: نسب فقط، والمبلغ من العميل */
export const BUDGET_SPLIT: { cat: string; label: string; pct: number }[] = [
  { cat: "venue", label: "القاعة", pct: 0.35 },
  { cat: "hosp", label: "العشاء والضيافة", pct: 0.3 },
  { cat: "kosha", label: "الكوشة والتنسيق", pct: 0.12 },
  { cat: "photo", label: "التصوير", pct: 0.08 },
  { cat: "av", label: "الصوت والإضاءة", pct: 0.06 },
  { cat: "other", label: "الدعوات والهدايا والطوارئ", pct: 0.09 },
];
/** توزيع الميزانية حسب نوع المناسبة (الزواج افتراضياً) */
export function splitBudget(total?: number, occasion?: OccasionId, place?: Place) {
  const t = Math.max(0, total ?? 0);
  const split = occasion ? profileOf(occasion).split : BUDGET_SPLIT;
  // في البيت: ما فيه قاعة، ونوزع نصيبها على باقي البنود بنفس نسبها
  const lines = place === "home" ? split.filter((l) => l.cat !== "venue") : split;
  const sum = lines.reduce((a, l) => a + l.pct, 0) || 1;
  return lines.map(({ cat, label, pct }) => ({ cat, label, est: Math.round((t * pct) / sum / 100) * 100 }));
}
/** ميزانية العميل المخصصة لفئة (القاعة أو خدمة مورد) */
export function budgetFor(lines: { cat: string; est: number }[], cat: string) {
  const l = lines.find((x) => x.cat === cat) ?? (cat === "venue" ? undefined : lines.find((x) => x.cat === "other"));
  return l && l.est > 0 ? l.est : undefined;
}

/** حاسبة الضيافة: تقديرات استرشادية تقريبية للعادات السعودية */
export function hospitality(men: number, women: number, style: "traditional" | "buffet" = "traditional") {
  const total = men + women;
  return {
    sheep: Math.ceil(men / 8) + (style === "traditional" ? Math.ceil(women / 9) : 0),
    rice: Math.ceil(total * 0.22),
    coffee: Math.ceil((total * 3) / 110),
    dates: Math.ceil(total * 0.04),
    sweets: Math.ceil(total * 1.5),
    water: Math.ceil((total * 2) / 40),
    servers: (men ? Math.max(2, Math.ceil(men / 70)) : 0) + (women ? Math.max(2, Math.ceil(women / 70)) : 0),
    tables: Math.ceil(women / 10),
  };
}

/** مطابقة المنشآت مع احتياج العميل (0 إلى 99) */
export function matchVenues(venues: Venue[], city: string, guests: number) {
  return venues
    .map((v) => {
      const cap = venueCapacity(v);
      let s = 60;
      if (v.city === city) s += 25;
      if (cap) { s += cap >= guests ? 10 : -25; if (cap < guests * 1.6) s += 4; }
      if (v.verified) s += 5;
      return { venue: v, score: Math.max(40, Math.min(99, Math.round(s))) };
    })
    .sort((a, b) => b.score - a.score);
}

/** مولد أرقام شبه عشوائية ثابت حسب النص (للرسوم والأيام المحجوزة التجريبية) */
export function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return () => ((h = (Math.imul(h, 1664525) + 1013904223) >>> 0) / 4294967296);
}

/** الأيام غير المتاحة: حجوزات مؤكدة + أيام مغلقة (+ سجل تجريبي ثابت في وضع التجربة فقط) */
export function busyDays(targetId: string, bookings: Booking[], blocked: string[] = [], hallId?: string, demo = true): Set<string> {
  const set = new Set<string>(blocked);
  if (demo) {
    const rnd = seeded(targetId + (hallId ?? ""));
    const start = new Date();
    for (let i = 1; i < 120; i++) if (rnd() < 0.18) set.add(isoDay(new Date(start.getTime() + i * DAY)));
  }
  bookings
    .filter((b) => b.targetId === targetId && b.status === "confirmed" && (!hallId || b.hallId === hallId))
    .forEach((b) => set.add(b.date));
  return set;
}

export const inviteCode = () => Math.random().toString(36).slice(2, 7).toUpperCase().replace(/[O0I1]/g, "K");
/** توحيد رقم الجوال السعودي: يقبل 05xxxxxxxx أو 5xxxxxxxx أو +9665xxxxxxxx أو 009665xxxxxxxx ويُرجع 05xxxxxxxx */
export function normPhone(raw: string) {
  let d = (raw || "").replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c))).replace(/\D/g, "");
  if (d.startsWith("00966")) d = d.slice(5); else if (d.startsWith("966")) d = d.slice(3);
  if (d.length === 9 && d.startsWith("5")) d = "0" + d;
  return d;
}
export const validPhone = (raw: string) => /^05\d{8}$/.test(normPhone(raw));

export const uid = (p = "") => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
