/*
  الخطة المقترحة: العميل يختار طابع الإلهام ويكتب ميزانيته فقط، ونحن نقترح له كل شيء.
  لكل بند في الميزانية نرتّب القاعات والموردين حسب: المدينة، والطابع، والميزانية المخصصة (إن أدخل التاجر سعره)،
  والتوثيق، والثقة، واختيار الإدارة. السعر غير المعروف لا يستبعد التاجر.
*/
import { busyDays, hallCapacity, hallPrice, isWeekend, splitBudget } from "./calc";
import { createBooking, type Mutation } from "./db";
import type { Booking, CategoryId, DB, StyleId, Supplier, Venue } from "./types";

export interface Style { id: StyleId; name: string; hint: string; photo: string; words: string[] }
export const STYLES: Style[] = [
  { id: "royal", name: "ملكي فخم", hint: "ذهب وإضاءة وكوشة شامخة", photo: "media:v1", words: ["قصر", "فاخر", "فخم", "كوشة", "إضاءة", "استيدج", "مسرح", "ملكي", "متكامل"] },
  { id: "najdi", name: "نجدي تراثي", hint: "بيوت شعر ومشبّات وسجاد", photo: "media:v6", words: ["نجدي", "تراث", "خيام", "خيمة", "شعر", "مشب", "سجاد", "مجلس", "جلسات أرضية"] },
  { id: "modern", name: "عصري أنيق", hint: "خطوط نظيفة وشاشات وتصميم ثلاثي", photo: "media:v2", words: ["معاصر", "عصري", "LED", "شاشات", "3D", "تصميم", "أنيق"] },
  { id: "nature", name: "طبيعة وإطلالة", hint: "حديقة وبحر وجبال", photo: "media:v7", words: ["حديقة", "إطلالة", "خارجية", "بحر", "بحرية", "جبل", "جبلية", "جلسات خارجية"] },
  { id: "cinema", name: "توثيق سينمائي", hint: "فيلم ودرون وبث للأهل", photo: "media:s2", words: ["سينمائي", "فيديو", "درون", "بث", "تصوير", "مصورات"] },
  { id: "cozy", name: "عائلي دافئ", hint: "ضيافة أصيلة وأجواء قريبة", photo: "media:s3", words: ["عائلية", "دافئ", "ضيافة", "قهوة", "تمور", "مرنة", "مناسب", "صبابين"] },
];

/** البنود التي نقترح لها (القاعة + خدمات الموردين) */
export const PLAN_CATS: { cat: "venue" | CategoryId; label: string; icon: string }[] = [
  { cat: "venue", label: "القاعة", icon: "Building2" },
  { cat: "hosp", label: "العشاء والضيافة", icon: "Coffee" },
  { cat: "kosha", label: "الكوشة والتنسيق", icon: "Crown" },
  { cat: "photo", label: "التصوير", icon: "Camera" },
  { cat: "av", label: "الصوت والإضاءة", icon: "Speaker" },
];

export interface Pick {
  kind: "venue" | "supplier";
  id: string;
  name: string;
  city: string;
  photos?: string[];
  hue: number;
  score: number;
  reasons: string[];
  /** السعر الذي أدخله التاجر (إن وجد) */
  price?: number;
  over?: boolean;
  hallId?: string;
  promoted?: boolean;
}
export interface PlanLine { cat: string; label: string; icon: string; budget?: number; picks: Pick[] }

const text = (x: { name: string; tags: string[]; about: string }) => `${x.name} ${x.tags.join(" ")} ${x.about}`;
const styleHits = (t: string, styles: StyleId[]) => STYLES.filter((s) => styles.includes(s.id) && s.words.some((w) => t.includes(w)));

/** مؤشرات الثقة من سجل الطلبات (بدون أرقام ظاهرة للعميل) */
export function trustOf(db: DB, kind: "venue" | "supplier", id: string) {
  const mine = db.bookings.filter((b) => b.kind === kind && b.targetId === id && !b.seed);
  const answered = mine.filter((b) => b.messages.some((m) => m.from === "provider"));
  const firstReply = answered.map((b) => (b.messages.find((m) => m.from === "provider")!.at - b.createdAt) / 36e5);
  const fast = firstReply.length >= 2 && firstReply.filter((h) => h <= 3).length / firstReply.length >= 0.7;
  const cancels = mine.filter((b) => b.cancelRequest).length;
  const committed = mine.filter((b) => b.status === "confirmed").length >= 2 && cancels === 0;
  return { fast, committed, cancels, score: (fast ? 8 : 0) + (committed ? 8 : 0) - cancels * 15 };
}

export function trustBadges(db: DB, kind: "venue" | "supplier", id: string, verified?: boolean) {
  const t = trustOf(db, kind, id);
  return [verified && "موثّق", t.fast && "يرد بسرعة", t.committed && "ملتزم بالمواعيد"].filter(Boolean) as string[];
}

function rankVenues(db: DB, city: string, guests: number, date: string, styles: StyleId[], budget?: number, exclude: string[] = []): Pick[] {
  return db.venues.filter((v) => v.status !== "suspended" && !exclude.includes(v.id)).map((v: Venue) => {
    const reasons: string[] = []; let s = 50;
    if (v.city === city) { s += 30; reasons.push("في مدينتك"); } else s -= 40;
    const fit = v.halls.find((h) => (hallCapacity(h) || Infinity) >= guests && !busyDays(v.id, db.bookings, v.blocked, h.id, true).has(date)) ?? v.halls.find((h) => !busyDays(v.id, db.bookings, v.blocked, h.id, true).has(date));
    if (!fit) s -= 60; else if (date) reasons.push("متاحة في تاريخك");
    const cap = fit ? hallCapacity(fit) : 0;
    if (cap && cap >= guests) { s += 8; reasons.push("تتسع لضيوفك"); }
    const hits = styleHits(text(v), styles); if (hits.length) { s += 12 * hits.length; reasons.push(`تشبه طابع ${hits[0].name}`); }
    const price = fit ? hallPrice(fit, date) : undefined;
    let over = false;
    if (price && budget) { if (price <= budget) { s += 18; reasons.push("ضمن ميزانيتك"); } else if (price > budget * 1.15) { s -= 25; over = true; } }
    if (v.verified) { s += 6; reasons.push("موثّقة"); }
    if (v.promoted) s += 10;
    s += trustOf(db, "venue", v.id).score;
    return { kind: "venue" as const, id: v.id, name: v.name, city: v.city, photos: v.photos, hue: v.hue, score: s, reasons, price, over, hallId: fit?.id, promoted: v.promoted };
  }).filter((p) => p.score > 0).sort((a, b) => b.score - a.score);
}

function rankSuppliers(db: DB, cat: string, city: string, styles: StyleId[], budget?: number, exclude: string[] = []): Pick[] {
  return db.suppliers.filter((x) => x.status !== "suspended" && x.cats.includes(cat as CategoryId) && !exclude.includes(x.id)).map((x: Supplier) => {
    const reasons: string[] = []; let s = 50;
    if (x.city === city) { s += 26; reasons.push("في مدينتك"); } else if (x.area.includes("المملكة") || x.area.includes(city)) { s += 14; reasons.push("يغطي مدينتك"); } else s -= 30;
    const hits = styleHits(text(x), styles); if (hits.length) { s += 12 * hits.length; reasons.push(`يشبه طابع ${hits[0].name}`); }
    const price = x.priceFrom;
    let over = false;
    if (price && budget) { if (price <= budget) { s += 18; reasons.push("ضمن ميزانيتك"); } else if (price > budget * 1.15) { s -= 25; over = true; } }
    if (x.cats.length <= 2) { s += 12; reasons.push("متخصص"); }
    if (x.verified) { s += 6; reasons.push("موثّق"); }
    if (x.promoted) s += 10;
    s += trustOf(db, "supplier", x.id).score;
    return { kind: "supplier" as const, id: x.id, name: x.name, city: x.city, photos: x.photos, hue: x.hue, score: s, reasons, price, over, promoted: x.promoted };
  }).filter((p) => p.score > 0).sort((a, b) => b.score - a.score);
}

/** الخطة الكاملة حسب طابع العميل وميزانيته */
export function suggestPlan(db: DB, opts?: { budget?: number; style?: StyleId[] }): PlanLine[] {
  const e = db.client.event;
  if (!e) return [];
  const total = opts?.budget ?? e.budget;
  const styles = opts?.style ?? e.style ?? [];
  const split = splitBudget(total);
  const alloc = (cat: string) => db.client.budget.find((l) => l.cat === cat && l.est > 0)?.est ?? split.find((l) => l.cat === cat)?.est ?? undefined;
  // تنويع: نفس المورد ما يتصدر أكثر من بند إذا فيه بديل مناسب
  const used = new Set<string>();
  return PLAN_CATS.map(({ cat, label, icon }) => {
    const budget = total ? (opts?.budget ? split.find((l) => l.cat === cat)?.est : alloc(cat)) || undefined : undefined;
    const ranked = cat === "venue" ? rankVenues(db, e.city, e.guests, e.date, styles, budget) : rankSuppliers(db, cat, e.city, styles, budget);
    const fresh = ranked.filter((p) => !used.has(p.id)), seen = ranked.filter((p) => used.has(p.id));
    const picks = fresh.length && (!seen.length || fresh[0].score >= seen[0].score - 30) ? [...fresh, ...seen] : ranked;
    if (picks[0]) used.add(picks[0].id);
    return { cat, label, icon, budget, picks };
  });
}

/** بديل لتاجر لم يرد أو طلب إلغاء: نفس الفئة والمدينة، غير المستبعدين */
export function alternativesFor(db: DB, b: Booking, exclude: string[] = []): Pick[] {
  const ex = [b.targetId, ...exclude];
  if (b.kind === "venue") return rankVenues(db, b.city, b.guests, b.date, db.client.event?.style ?? [], b.budget, ex).slice(0, 4);
  const cat = b.cat ?? db.suppliers.find((s) => s.id === b.targetId)?.cats[0] ?? "kosha";
  return rankSuppliers(db, cat, b.city, db.client.event?.style ?? [], b.budget, ex).slice(0, 4);
}

/** إرسال كل طلبات الخطة دفعة واحدة، كل طلب بميزانيته وطابع العميل */
export const requestPlan = (chosen: { line: PlanLine; pick: Pick }[], who: { name: string; phone: string }): Mutation => (db) => {
  const e = db.client.event!;
  const styles = (e.style ?? []).map((id) => STYLES.find((s) => s.id === id)?.name).filter(Boolean).join("، ");
  return chosen.reduce((acc, { line, pick }) => createBooking({
    kind: pick.kind, targetId: pick.id, hallId: pick.hallId, clientName: who.name, phone: who.phone, occasion: e.occasion, city: e.city, date: e.date, guests: e.guests,
    note: [`طلب ${line.label} من الخطة المقترحة`, styles && `الطابع المفضل: ${styles}`, e.date && isWeekend(e.date) ? "التاريخ نهاية أسبوع" : ""].filter(Boolean).join(" · "),
    estimate: pick.price ?? 0, fromClient: true, budget: line.budget, cat: line.cat, fromPlan: true,
  })(acc), db);
};
