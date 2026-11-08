import { TIERS } from "./catalog";
import type { Booking, Hall, TierId, Venue } from "./types";

export const DAY = 864e5;

export const fmt = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));
export const sar = (n: number) => `${fmt(n)} ر.س`;
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

export const hallCapacity = (h: Hall) => h.menCap + h.womenCap;
export const hallPrice = (h: Hall, iso: string) => (isWeekend(iso) ? h.weekendPrice : h.weekdayPrice);
export const venueCapacity = (v: Venue) => Math.max(...v.halls.map(hallCapacity));
export const venueFrom = (v: Venue) => Math.min(...v.halls.map((h) => h.weekdayPrice));

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
      if (v.city === city) s += 22;
      s += cap >= guests ? 10 : -25;
      if (cap < guests * 1.6) s += 4;
      s += (v.rating - 4.5) * 8;
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
export const uid = (p = "") => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
