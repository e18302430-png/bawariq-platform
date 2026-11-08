import { daysUntil } from "./calc";
import type { CategoryId, DB } from "./types";

/**
 * رحلة العميل: خمس مراحل ثابتة، وفي كل لحظة "خطوة تالية" واحدة فقط.
 * كل حالة محسوبة من البيانات الفعلية (حجوزات، ضيوف، تاريخ) وليست يدوية.
 */
export type StageId = "plan" | "venue" | "prep" | "invite" | "day";
export type StageStatus = "done" | "active" | "waiting" | "todo";

export interface Stage {
  id: StageId;
  n: number;
  title: string;
  /** وصف قصير للحالة الحالية */
  summary: string;
  status: StageStatus;
  progress: number; // 0..1
  cta?: { label: string; route: string };
  /** للتجهيزات: حالة كل خدمة أساسية */
  checklist?: { cat: CategoryId; label: string; state: "confirmed" | "pending" | "none" }[];
}

export const ESSENTIALS: { cat: CategoryId; label: string }[] = [
  { cat: "kosha", label: "الكوشة" },
  { cat: "photo", label: "التصوير" },
  { cat: "hosp", label: "الضيافة" },
];

export function journey(db: DB, now = Date.now()): Stage[] {
  const e = db.client.event;
  const mine = db.bookings.filter((b) => b.fromClient);
  const venue = mine.filter((b) => b.kind === "venue");
  const sup = mine.filter((b) => b.kind === "supplier");
  const guests = db.client.guests;
  const days = e ? daysUntil(e.date, now) : 999;

  const stages: Stage[] = [];

  stages.push({ id: "plan", n: 1, title: "الخطة", status: e ? "done" : "active", progress: e ? 1 : 0,
    summary: e ? `${e.budget ? "ميزانيتك محددة" : "حدد ميزانيتك"} · ${db.client.tasks.length} مهام للعائلة` : "حدد نوع المناسبة والعدد والميزانية",
    cta: e ? { label: "راجع الميزانية", route: "budget" } : { label: "ابدأ الخطة", route: "home" } });

  const vConfirmed = venue.find((b) => b.status === "confirmed");
  const vQuoted = venue.find((b) => b.status === "quoted");
  const vNew = venue.find((b) => b.status === "new" || b.status === "review");
  const vName = (id: string) => db.venues.find((v) => v.id === id)?.name ?? "القاعة";
  stages.push(vConfirmed
    ? { id: "venue", n: 2, title: "القاعة", status: "done", progress: 1, summary: `${vName(vConfirmed.targetId)} · محجوزة` }
    : vQuoted
      ? { id: "venue", n: 2, title: "القاعة", status: "active", progress: 0.66, summary: `وصلك عرض سعر من ${vName(vQuoted.targetId)}`, cta: { label: "راجع العرض واقبله", route: "bookings" } }
      : vNew
        ? { id: "venue", n: 2, title: "القاعة", status: "waiting", progress: 0.33, summary: vNew.status === "review" ? `طلبك لـ ${vName(vNew.targetId)} عند الإدارة، وبنطلب لك عرض السعر` : `طلبنا عرض سعر من ${vName(vNew.targetId)}، وبيوصلك هنا`, cta: { label: "تابع طلباتك", route: "bookings" } }
        : { id: "venue", n: 2, title: "القاعة", status: "todo", progress: 0, summary: "اقترحنا لك قاعات على ذوقك وميزانيتك، اختر اللي يعجبك", cta: { label: "اختر من اقتراحاتك", route: "plan" } });

  const supplierCats = (id: string) => db.suppliers.find((s) => s.id === id)?.cats ?? [];
  const checklist = ESSENTIALS.map(({ cat, label }) => {
    const rel = sup.filter((b) => (b.cat ? b.cat === cat : supplierCats(b.targetId).includes(cat)));
    const state = rel.some((b) => b.status === "confirmed") ? "confirmed" : rel.some((b) => b.status !== "declined") ? "pending" : "none";
    return { cat, label, state } as const;
  });
  const prepDone = checklist.filter((c) => c.state === "confirmed").length;
  const prepQuote = sup.find((b) => b.status === "quoted");
  const missing = checklist.find((c) => c.state === "none");
  stages.push({
    id: "prep", n: 3, title: "التجهيزات", checklist, progress: prepDone / ESSENTIALS.length,
    status: prepDone === ESSENTIALS.length ? "done" : prepQuote ? "active" : missing ? (checklist.some((c) => c.state !== "none") ? "active" : "todo") : "waiting",
    summary: prepDone === ESSENTIALS.length ? "الكوشة والتصوير والضيافة مؤكدة" : prepQuote ? "وصلك عرض سعر من مورد" : `${prepDone} من ${ESSENTIALS.length} خدمات أساسية مؤكدة`,
    cta: prepQuote ? { label: "راجع عرض المورد", route: "bookings" } : missing ? { label: `اطلب ${missing.label} من خطتك`, route: "plan" } : undefined,
  });

  const total = guests.length;
  const responded = guests.filter((g) => g.status !== "pending").length;
  const ratio = total ? responded / total : 0;
  stages.push({
    id: "invite", n: 4, title: "الدعوات", progress: ratio,
    status: total && ratio >= 0.8 ? "done" : total ? "active" : "todo",
    summary: total ? `${responded} من ${total} ردّوا على الدعوة` : "أضف ضيوفك وأرسل لهم الدعوات",
    cta: total ? { label: ratio >= 0.8 ? "شوف قائمة الضيوف" : "أرسل الدعوات بالواتساب", route: ratio >= 0.8 ? "guests" : "invites" } : { label: "أضف الضيوف", route: "guests" },
  });

  const inside = guests.filter((g) => g.checkedIn).length;
  stages.push({
    id: "day", n: 5, title: "يوم المناسبة", progress: total ? inside / Math.max(1, guests.filter((g) => g.status === "yes").length) : 0,
    status: e && days === 0 && inside > 0 ? "active" : "todo",
    summary: days === 0 ? "اليوم يومك! افتح شاشة الاستقبال" : days <= 7 ? `باقي ${days} أيام · جهّز شاشة الاستقبال` : `باقي ${days} يوم`,
    cta: { label: "روابط المنسقين والحضور", route: "door" },
  });

  return stages;
}

export function nextStage(stages: Stage[], db: DB, now = Date.now()): Stage {
  const days = db.client.event ? daysUntil(db.client.event.date, now) : 999;
  if (days <= 1) return stages.find((s) => s.id === "day")!;
  // بالترتيب: أول مرحلة تحتاج تصرّف منك (نشطة أو لم تبدأ)، ثم ما ينتظر رد الآخرين
  return stages.find((s) => s.id !== "day" && (s.status === "active" || s.status === "todo")) ?? stages.find((s) => s.status === "waiting") ?? stages[4];
}
