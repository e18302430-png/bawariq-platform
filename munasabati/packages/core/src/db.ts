import { SAMPLE_GUESTS, SAMPLE_TASKS, SEED_SUPPLIERS, SEED_VENUES } from "./catalog";
import { splitBudget, inviteCode, isoDay, shiftDate, uid, DAY } from "./calc";
import type { AccountStatus, Booking, BookingStatus, BudgetLine, ClientEvent, DB, Guest, Message, Relation, Supplier, Task, Ticket, Venue } from "./types";

/* ───────────────── البيانات الأولية ───────────────── */

function seedBookings(now = Date.now()): Booking[] {
  const d = (n: number) => isoDay(new Date(now + n * DAY));
  type Row = Omit<Booking, "id" | "createdAt" | "messages" | "seed" | "estimate"> & { estimate?: number };
  const base = (b: Row, i: number): Booking => ({
    estimate: 0, ...b, id: `seed-${i}`, createdAt: now - i * 5 * 36e5, messages: [], seed: true,
  });
  const rows: Row[] = [
    { kind: "supplier", targetId: "s1", clientName: "عبدالله العتيبي (مثال)", phone: "0551112233", occasion: "wedding", city: "الرياض", date: d(21), guests: 600, note: "نحتاج كوشة رئيسية وبث مباشر لقسم النساء", status: "new", packageId: "p2" },
    { kind: "supplier", targetId: "s1", clientName: "نورة الشهري (مثال)", phone: "0502223344", occasion: "milka", city: "الرياض", date: d(9), guests: 180, note: "ملكة في البيت، نبي إضاءة وكوشة صغيرة", status: "quoted" },
    { kind: "supplier", targetId: "s1", clientName: "شركة أفق (مثال)", phone: "0533334455", occasion: "corp", city: "الرياض", date: d(34), guests: 350, note: "استيدج وشاشتين ومولد احتياطي", status: "confirmed" },
    { kind: "supplier", targetId: "s1", clientName: "فيصل القحطاني (مثال)", phone: "0544445566", occasion: "grad", city: "الخرج", date: d(48), guests: 120, note: "خيمة وسجاد وضيافة", status: "confirmed" },
    { kind: "venue", targetId: "v1", hallId: "a", clientName: "سلطان الدوسري (مثال)", phone: "0555556677", occasion: "wedding", city: "الرياض", date: d(15), guests: 820, note: "حجز القسمين", status: "confirmed" },
    { kind: "venue", targetId: "v1", hallId: "a", clientName: "ماجد الحربي (مثال)", phone: "0566667788", occasion: "wedding", city: "الرياض", date: d(27), guests: 700, note: "هل يتوفر مطبخ للذبائح؟", status: "new" },
    { kind: "venue", targetId: "v1", hallId: "b", clientName: "هند العمري (مثال)", phone: "0577778899", occasion: "milka", city: "الرياض", date: d(6), guests: 300, note: "ملكة، قسم نساء فقط", status: "confirmed" },
    { kind: "venue", targetId: "v1", hallId: "b", clientName: "بدر السهلي (مثال)", phone: "0588889900", occasion: "grad", city: "الرياض", date: d(40), guests: 260, note: "حفل تخرج للعائلة", status: "quoted" },
  ];
  return rows.map(base);
}

export function createInitialDB(): DB {
  return {
    version: 2,
    client: { profile: null, event: null, guests: [], budget: [], tasks: [], favorites: [], invite: { template: "diriyah", message: "وبحضوركم تكتمل فرحتنا", time: "20:30", program: [{ title: "الاستقبال", time: "20:30" }, { title: "الزفّة", time: "23:00" }, { title: "العشاء", time: "00:00" }] } },
    suppliers: structuredClone(SEED_SUPPLIERS),
    venues: structuredClone(SEED_VENUES),
    bookings: seedBookings(),
    tickets: [],
    sessions: { supplierId: null, venueId: null },
  };
}

/* ───────────────── العمليات (دوال نقية قابلة للاختبار) ───────────────── */

export type Mutation = (db: DB) => DB;

export interface NewEventInput extends Omit<ClientEvent, "id"> { hostName: string; phone?: string; /** أمثلة ضيوف للتجربة (تُعطّل في الإنتاج) */ samples?: boolean }

export const createEvent = (input: NewEventInput): Mutation => (db) => {
  const { hostName, phone = "", samples = true, ...ev } = input;
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
      budget: splitBudget(ev.budget).map((l) => ({ id: uid("b"), ...l, paid: 0 })),
    },
  };
};

export const patchClient = (patch: Partial<DB["client"]>): Mutation => (db) => ({ ...db, client: { ...db.client, ...patch } });

export const updateEvent = (patch: Partial<ClientEvent>): Mutation => (db) =>
  db.client.event ? { ...db, client: { ...db.client, event: { ...db.client.event, ...patch } } } : db;

export const addGuest = (g: Pick<Guest, "name" | "phone" | "section" | "side" | "count"> & Partial<Pick<Guest, "relation" | "vip">>): Mutation => (db) => ({
  ...db, client: { ...db.client, guests: [{ id: uid("g"), code: inviteCode(), status: "pending", checkedIn: false, ...g }, ...db.client.guests] },
});

export const updateGuest = (id: string, patch: Partial<Guest>): Mutation => (db) => ({
  ...db, client: { ...db.client, guests: db.client.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)) },
});

export const removeGuest = (id: string): Mutation => (db) => ({ ...db, client: { ...db.client, guests: db.client.guests.filter((g) => g.id !== id) } });

/** مسح رمز الدخول عند البوابة */
export type CheckInResult = { ok: true; guest: Guest } | { ok: false; reason: "unknown" | "already" | "declined" | "section"; guest?: Guest };
export const normCode = (raw: string) => raw.trim().toUpperCase().replace(/^.*#INVITE-/, "").replace(/^MNS-/, "");
/** تسجيل دخول ضيف عند الباب. section: قسم المنسق (ضيف القسم الآخر يُوجَّه بدل تسجيله) */
export function checkIn(db: DB, raw: string, section?: Guest["section"]): { db: DB; result: CheckInResult } {
  const code = normCode(raw);
  const g = db.client.guests.find((x) => x.code === code);
  if (!g) return { db, result: { ok: false, reason: "unknown" } };
  if (section && g.section !== section && !g.checkedIn) return { db, result: { ok: false, reason: "section", guest: g } };
  if (g.checkedIn) return { db, result: { ok: false, reason: "already", guest: g } };
  if (g.status === "no") return { db, result: { ok: false, reason: "declined", guest: g } };
  const next = updateGuest(g.id, { checkedIn: true, status: "yes", checkedAt: Date.now() })(db);
  return { db: next, result: { ok: true, guest: { ...g, checkedIn: true, status: "yes", checkedAt: Date.now() } } };
}

/** رابط المنسق: يُنشأ مرة، ويمكن إلغاؤه وتجديده (الرابط القديم يتوقف فوراً) */
const doorKeyGen = () => Array.from({ length: 12 }, () => "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 31)]).join("");
export const enableDoor = (rotate = false): Mutation => (db) => (db.client.doorKey && !rotate ? db : { ...db, client: { ...db.client, doorKey: doorKeyGen() } });

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
/** العميل يحدد ميزانيته الكلية؛ redistribute يوزعها على البنود الأساسية بالنسب الذكية */
export const setTotalBudget = (total: number | undefined, redistribute = false): Mutation => (db) => {
  if (!db.client.event) return db;
  const event = { ...db.client.event, budget: total && total > 0 ? total : undefined };
  if (!redistribute) return { ...db, client: { ...db.client, event } };
  const split = splitBudget(event.budget);
  const lines = db.client.budget.map((l) => { const s = split.find((x) => x.cat === l.cat); return s ? { ...l, est: s.est } : l; });
  const missing = split.filter((s) => !lines.some((l) => l.cat === s.cat)).map((s) => ({ id: uid("b"), ...s, paid: 0 }));
  return { ...db, client: { ...db.client, event, budget: [...lines, ...missing] } };
};

export const addBudget = (b: Omit<BudgetLine, "id">): Mutation => (db) => ({ ...db, client: { ...db.client, budget: [...db.client.budget, { ...b, id: uid("b") }] } });
export const updateBudget = (id: string, patch: Partial<BudgetLine>): Mutation => (db) => ({ ...db, client: { ...db.client, budget: db.client.budget.map((b) => (b.id === id ? { ...b, ...patch } : b)) } });
export const removeBudget = (id: string): Mutation => (db) => ({ ...db, client: { ...db.client, budget: db.client.budget.filter((b) => b.id !== id) } });
export const clearSampleGuests: Mutation = (db) => ({ ...db, client: { ...db.client, guests: db.client.guests.filter((g) => !g.sample) } });

/* ───── الدعم الفني ───── */
export const openTicket = (t: Pick<Ticket, "from" | "fromId" | "fromName" | "topic" | "subject"> & { text: string; urgent?: boolean }): Mutation => (db) => {
  const now = Date.now();
  const { text, ...rest } = t;
  return { ...db, tickets: [{ ...rest, id: uid("tk"), status: "open", messages: [{ from: "user", text, at: now }], createdAt: now, updatedAt: now }, ...(db.tickets ?? [])] };
};
export const replyTicket = (id: string, from: "user" | "admin", text: string): Mutation => (db) => ({
  ...db, tickets: (db.tickets ?? []).map((t) => t.id !== id ? t : { ...t, status: from === "admin" ? "answered" : "open", updatedAt: Date.now(), messages: [...t.messages, { from, text, at: Date.now() }] }),
});
export const setTicketStatus = (id: string, status: Ticket["status"]): Mutation => (db) => ({ ...db, tickets: (db.tickets ?? []).map((t) => (t.id === id ? { ...t, status, updatedAt: Date.now() } : t)) });

/* ───── محادثة الطلب بين العميل والتاجر ───── */
export const bookingMessage = (id: string, from: Message["from"], text: string): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id === id ? { ...b, messages: [...b.messages, { from, text, at: Date.now() }] } : b)),
});

/* ───── حماية الالتزام: إلغاء الحجز المؤكد يمر بالإدارة، والإسناد لتاجر بديل ───── */
export const requestCancel = (id: string, reason: string): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id === id ? { ...b, cancelRequest: { reason, at: Date.now() }, messages: [...b.messages, { from: "provider" as const, text: `طلب إلغاء الحجز: ${reason}`, at: Date.now() }] } : b)),
});
export const resolveCancel = (id: string, approve: boolean, note?: string): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id !== id ? b : {
    ...b, cancelRequest: undefined, status: approve ? ("declined" as const) : b.status,
    messages: [...b.messages, { from: "admin" as const, text: note || (approve ? "وافقت الإدارة على إلغاء الحجز، ونرشّح لك بديلاً مناسباً." : "رفضت الإدارة طلب الإلغاء. الحجز قائم ونتابع التزام التاجر."), at: Date.now() }],
  })),
});
export const reassignBooking = (id: string, to: { kind: "venue" | "supplier"; id: string; hallId?: string; name: string }): Mutation => (db) => {
  const b = db.bookings.find((x) => x.id === id);
  if (!b) return db;
  const now = Date.now();
  const copy: Booking = { ...b, id: uid("bk"), kind: to.kind, targetId: to.id, hallId: to.hallId, status: "new", quote: undefined, cancelRequest: undefined, vendorStatus: undefined, reassignedFrom: b.id, createdAt: now,
    messages: [{ from: "admin", text: "طلب محوّل من إدارة مناسبتي نيابة عن العميل. نرجو الرد بعرضك.", at: now }] };
  return { ...db, bookings: [copy, ...db.bookings.map((x) => (x.id !== id ? x : { ...x, status: "declined" as const, cancelRequest: undefined, messages: [...x.messages, { from: "admin" as const, text: `حوّلت الإدارة طلبك إلى ${to.name} لضمان خدمتك في موعدك.`, at: now }] }))] };
};
export const setVendorStatus = (id: string, vendorStatus: Booking["vendorStatus"]): Mutation => (db) => ({ ...db, bookings: db.bookings.map((b) => (b.id === id ? { ...b, vendorStatus } : b)) });
/** حساب مختار من الإدارة: يظهر أولاً بشارة «مختار من مناسبتي» (بدون أي رسوم) */
export const setPromoted = (kind: "supplier" | "venue", id: string, promoted: boolean): Mutation => (db) => kind === "supplier"
  ? { ...db, suppliers: db.suppliers.map((x) => (x.id === id ? { ...x, promoted } : x)) }
  : { ...db, venues: db.venues.map((x) => (x.id === id ? { ...x, promoted } : x)) };

/* ───── الضيوف وليلة المناسبة ───── */
export const DEFAULT_INVITE: DB["client"]["invite"] = { template: "diriyah", message: "وبحضوركم تكتمل فرحتنا", time: "20:30", program: [{ title: "الاستقبال", time: "20:30" }, { title: "الزفّة", time: "23:00" }, { title: "العشاء", time: "00:00" }] };
/** حذف الدعوة: يرجع التصميم للأصل ويلغي كل الروابط المرسلة (رموز جديدة لكل الضيوف، والقديمة تتوقف) */
export const resetInvite = (): Mutation => (db) => ({ ...db, client: { ...db.client, invite: { ...DEFAULT_INVITE }, guests: db.client.guests.map((g) => ({ ...g, code: inviteCode() })) } });
/** رابط دعوة جديد لضيف واحد (القديم يتوقف) */
export const renewGuestCode = (id: string): Mutation => (db) => ({ ...db, client: { ...db.client, guests: db.client.guests.map((g) => (g.id === id ? { ...g, code: inviteCode() } : g)) } });
/** عبارة الترحيب في الدعوة حسب صلة القرابة */
export const RELATIONS: [Relation, string, string][] = [
  ["uncle", "عم", "عمّي الغالي"], ["maternal-uncle", "خال", "خالي الغالي"], ["aunt", "عمّة", "عمّتي الغالية"], ["maternal-aunt", "خالة", "خالتي الغالية"],
  ["brother", "أخ", "أخوي الغالي"], ["sister", "أخت", "أختي الغالية"], ["friend", "صديق", "صديقي العزيز"], ["colleague", "زميل", "الزميل العزيز"], ["relative", "قريب", "قريبنا الغالي"],
];
export const greetingFor = (g: Pick<Guest, "relation" | "section">) => RELATIONS.find((r) => r[0] === g.relation)?.[2] ?? (g.section === "women" ? "ضيفتنا الغالية" : "ضيفنا الغالي");
export const setLiveIndex = (i: number): Mutation => (db) => ({ ...db, client: { ...db.client, liveIndex: Math.max(0, i) } });

/* ───── صلاحيات الإدارة ───── */
export const adminSetStatus = (kind: "supplier" | "venue", id: string, status: AccountStatus): Mutation => (db) => kind === "supplier"
  ? { ...db, suppliers: db.suppliers.map((x) => (x.id === id ? { ...x, status } : x)) }
  : { ...db, venues: db.venues.map((x) => (x.id === id ? { ...x, status } : x)) };
export const adminSetVerified = (kind: "supplier" | "venue", id: string, verified: boolean): Mutation => (db) => kind === "supplier"
  ? { ...db, suppliers: db.suppliers.map((x) => (x.id === id ? { ...x, verified } : x)) }
  : { ...db, venues: db.venues.map((x) => (x.id === id ? { ...x, verified } : x)) };
export const adminDelete = (kind: "supplier" | "venue" | "booking", id: string): Mutation => (db) => kind === "supplier"
  ? { ...db, suppliers: db.suppliers.filter((x) => x.id !== id), bookings: db.bookings.filter((b) => !(b.kind === "supplier" && b.targetId === id)) }
  : kind === "venue"
    ? { ...db, venues: db.venues.filter((x) => x.id !== id), bookings: db.bookings.filter((b) => !(b.kind === "venue" && b.targetId === id)) }
    : { ...db, bookings: db.bookings.filter((b) => b.id !== id) };
export const setAnnouncement = (text: string): Mutation => (db) => ({ ...db, announcement: text.trim() || undefined });
/** الحسابات الظاهرة للعملاء: المعلّقة تختفي */
export const isActive = (x: { status?: AccountStatus }) => x.status !== "suspended";
