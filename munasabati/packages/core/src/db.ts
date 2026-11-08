import { SAMPLE_GUESTS, SAMPLE_TASKS, SEED_SUPPLIERS, SEED_VENUES } from "./catalog";
import { estimateBudget, inviteCode, isoDay, shiftDate, uid, DAY } from "./calc";
import type { Booking, BookingStatus, BudgetLine, ClientEvent, DB, Guest, Message, Supplier, Task, Venue } from "./types";

/* ───────────────── البيانات الأولية ───────────────── */

function seedBookings(now = Date.now()): Booking[] {
  const d = (n: number) => isoDay(new Date(now + n * DAY));
  type Row = Omit<Booking, "id" | "createdAt" | "messages" | "seed" | "estimate"> & { estimate?: number };
  const base = (b: Row, i: number): Booking => ({
    estimate: b.quote ?? 0, ...b, id: `seed-${i}`, createdAt: now - i * 5 * 36e5, messages: [], seed: true,
  });
  const rows: Row[] = [
    { kind: "supplier", targetId: "s1", clientName: "عبدالله العتيبي (مثال)", phone: "0551112233", occasion: "wedding", city: "الرياض", date: d(21), guests: 600, note: "نحتاج كوشة رئيسية وبث مباشر لقسم النساء", status: "new", packageId: "p2", estimate: 24000 },
    { kind: "supplier", targetId: "s1", clientName: "نورة الشهري (مثال)", phone: "0502223344", occasion: "milka", city: "الرياض", date: d(9), guests: 180, note: "ملكة في البيت، نبي إضاءة وكوشة صغيرة", status: "quoted", quote: 9500 },
    { kind: "supplier", targetId: "s1", clientName: "شركة أفق (مثال)", phone: "0533334455", occasion: "corp", city: "الرياض", date: d(34), guests: 350, note: "استيدج وشاشتين ومولد احتياطي", status: "confirmed", quote: 31000 },
    { kind: "supplier", targetId: "s1", clientName: "فيصل القحطاني (مثال)", phone: "0544445566", occasion: "grad", city: "الخرج", date: d(48), guests: 120, note: "خيمة وسجاد وضيافة", status: "confirmed", quote: 12500 },
    { kind: "venue", targetId: "v1", hallId: "a", clientName: "سلطان الدوسري (مثال)", phone: "0555556677", occasion: "wedding", city: "الرياض", date: d(15), guests: 820, note: "حجز القسمين", status: "confirmed", quote: 65000 },
    { kind: "venue", targetId: "v1", hallId: "a", clientName: "ماجد الحربي (مثال)", phone: "0566667788", occasion: "wedding", city: "الرياض", date: d(27), guests: 700, note: "هل يتوفر مطبخ للذبائح؟", status: "new", estimate: 65000 },
    { kind: "venue", targetId: "v1", hallId: "b", clientName: "هند العمري (مثال)", phone: "0577778899", occasion: "milka", city: "الرياض", date: d(6), guests: 300, note: "ملكة، قسم نساء فقط", status: "confirmed", quote: 26000 },
    { kind: "venue", targetId: "v1", hallId: "b", clientName: "بدر السهلي (مثال)", phone: "0588889900", occasion: "grad", city: "الرياض", date: d(40), guests: 260, note: "حفل تخرج للعائلة", status: "quoted", quote: 24000 },
  ];
  return rows.map(base);
}

export function createInitialDB(): DB {
  return {
    version: 2,
    client: { profile: null, event: null, guests: [], budget: [], tasks: [], favorites: [], invite: { template: "night", message: "وبحضوركم تكتمل فرحتنا", time: "20:30" } },
    suppliers: structuredClone(SEED_SUPPLIERS),
    venues: structuredClone(SEED_VENUES),
    bookings: seedBookings(),
    sessions: { supplierId: null, venueId: null },
  };
}

/* ───────────────── العمليات (دوال نقية قابلة للاختبار) ───────────────── */

export type Mutation = (db: DB) => DB;

export interface NewEventInput extends Omit<ClientEvent, "id"> { hostName: string; phone?: string; /** أمثلة ضيوف للتجربة (تُعطّل في الإنتاج) */ samples?: boolean }

export const createEvent = (input: NewEventInput): Mutation => (db) => {
  const { hostName, phone = "", samples = true, ...ev } = input;
  const plan = estimateBudget(ev.guests, ev.tier);
  const guests: Guest[] = !samples ? [] : SAMPLE_GUESTS.map(([name, section, side, status, count], i) => ({
    id: uid("g"), name, phone: `05${String(50000000 + i * 1234567).slice(0, 8)}`, section, side, status, count, code: inviteCode(), checkedIn: false, sample: true,
  }));
  return {
    ...db,
    client: {
      ...db.client,
      profile: { name: hostName, phone },
      event: { id: uid("e"), ...ev },
      guests,
      tasks: SAMPLE_TASKS.map(([title, who, before, done]) => ({ id: uid("t"), title, who, due: shiftDate(ev.date, -before), done })),
      budget: plan.lines.map((l) => ({ id: uid("b"), ...l, paid: l.cat === "venue" ? Math.round(l.est * 0.3) : 0 })),
    },
  };
};

export const patchClient = (patch: Partial<DB["client"]>): Mutation => (db) => ({ ...db, client: { ...db.client, ...patch } });

export const updateEvent = (patch: Partial<ClientEvent>): Mutation => (db) =>
  db.client.event ? { ...db, client: { ...db.client, event: { ...db.client.event, ...patch } } } : db;

export const addGuest = (g: Pick<Guest, "name" | "phone" | "section" | "side" | "count">): Mutation => (db) => ({
  ...db, client: { ...db.client, guests: [{ id: uid("g"), code: inviteCode(), status: "pending", checkedIn: false, ...g }, ...db.client.guests] },
});

export const updateGuest = (id: string, patch: Partial<Guest>): Mutation => (db) => ({
  ...db, client: { ...db.client, guests: db.client.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)) },
});

export const removeGuest = (id: string): Mutation => (db) => ({ ...db, client: { ...db.client, guests: db.client.guests.filter((g) => g.id !== id) } });

/** مسح رمز الدخول عند البوابة */
export type CheckInResult = { ok: true; guest: Guest } | { ok: false; reason: "unknown" | "already" | "declined"; guest?: Guest };
export function checkIn(db: DB, raw: string): { db: DB; result: CheckInResult } {
  const code = raw.trim().toUpperCase().replace(/^MNS-/, "");
  const g = db.client.guests.find((x) => x.code === code);
  if (!g) return { db, result: { ok: false, reason: "unknown" } };
  if (g.checkedIn) return { db, result: { ok: false, reason: "already", guest: g } };
  if (g.status === "no") return { db, result: { ok: false, reason: "declined", guest: g } };
  const next = updateGuest(g.id, { checkedIn: true, status: "yes" })(db);
  return { db: next, result: { ok: true, guest: { ...g, checkedIn: true, status: "yes" } } };
}

export const toggleFavorite = (id: string): Mutation => (db) => {
  const f = db.client.favorites;
  return { ...db, client: { ...db.client, favorites: f.includes(id) ? f.filter((x) => x !== id) : [...f, id] } };
};

export const createBooking = (b: Omit<Booking, "id" | "createdAt" | "messages" | "status">): Mutation => (db) => ({
  ...db, bookings: [{ ...b, id: uid("bk"), createdAt: Date.now(), messages: [], status: "new" }, ...db.bookings],
});

export const setBookingStatus = (id: string, status: BookingStatus, extra: { quote?: number; message?: Omit<Message, "at"> } = {}): Mutation => (db) => ({
  ...db,
  bookings: db.bookings.map((b) => b.id !== id ? b : {
    ...b, status, quote: extra.quote ?? b.quote,
    messages: extra.message ? [...b.messages, { ...extra.message, at: Date.now() }] : b.messages,
  }),
});

/** العميل يقبل عرض السعر: يتأكد الحجز ويُضاف المبلغ لميزانيته */
export const acceptQuote = (id: string, label: string): Mutation => (db) => {
  const b = db.bookings.find((x) => x.id === id);
  if (!b || b.status !== "quoted") return db;
  const next = setBookingStatus(id, "confirmed", { message: { from: "client", text: "تم قبول العرض" } })(db);
  return { ...next, client: { ...next.client, budget: [...next.client.budget, { id: uid("b"), label, cat: b.kind, est: b.quote ?? b.estimate, paid: 0 }] } };
};

export const upsertSupplier = (s: Supplier): Mutation => (db) => ({
  ...db, suppliers: db.suppliers.some((x) => x.id === s.id) ? db.suppliers.map((x) => (x.id === s.id ? s : x)) : [...db.suppliers, s],
});

export const upsertVenue = (v: Venue): Mutation => (db) => ({
  ...db, venues: db.venues.some((x) => x.id === v.id) ? db.venues.map((x) => (x.id === v.id ? v : x)) : [...db.venues, v],
});

export const setSession = (patch: Partial<DB["sessions"]>): Mutation => (db) => ({ ...db, sessions: { ...db.sessions, ...patch } });

/* ───── المهام والميزانية ───── */
export const addTask = (t: Omit<Task, "id" | "done">): Mutation => (db) => ({ ...db, client: { ...db.client, tasks: [...db.client.tasks, { ...t, id: uid("t"), done: false }] } });
export const toggleTask = (id: string): Mutation => (db) => ({ ...db, client: { ...db.client, tasks: db.client.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) } });
export const removeTask = (id: string): Mutation => (db) => ({ ...db, client: { ...db.client, tasks: db.client.tasks.filter((t) => t.id !== id) } });
export const addBudget = (b: Omit<BudgetLine, "id">): Mutation => (db) => ({ ...db, client: { ...db.client, budget: [...db.client.budget, { ...b, id: uid("b") }] } });
export const updateBudget = (id: string, patch: Partial<BudgetLine>): Mutation => (db) => ({ ...db, client: { ...db.client, budget: db.client.budget.map((b) => (b.id === id ? { ...b, ...patch } : b)) } });
export const removeBudget = (id: string): Mutation => (db) => ({ ...db, client: { ...db.client, budget: db.client.budget.filter((b) => b.id !== id) } });
export const clearSampleGuests: Mutation = (db) => ({ ...db, client: { ...db.client, guests: db.client.guests.filter((g) => !g.sample) } });
