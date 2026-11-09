import { SAMPLE_GUESTS, SEED_SUPPLIERS, SEED_VENUES } from "./catalog";
import { splitBudget, inviteCode, isoDay, shiftDate, uid, DAY } from "./calc";
import { profileOf } from "./occasions";
import type { AccountStatus, Booking, BookingStatus, BudgetLine, ClientEvent, DB, Guest, Message, OpsMsg, Relation, Supplier, Task, Ticket, Venue } from "./types";

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
      tasks: profileOf(ev.occasion).tasks.map(([title, who, before]) => ({ id: uid("t"), title, who, due: shiftDate(ev.date, -before), done: false })),
      budget: splitBudget(ev.budget, ev.occasion, ev.place).map((l) => ({ id: uid("b"), ...l, paid: 0 })),
      // الدعوة والبرنامج على نوع المناسبة
      invite: { ...DEFAULT_INVITE, message: profileOf(ev.occasion).inviteMessage, program: profileOf(ev.occasion).program, time: profileOf(ev.occasion).program[0]?.time ?? DEFAULT_INVITE.time },
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
export const normCode = (raw: string) => raw.trim().toUpperCase().replace(/^.*#INVITE-/, "").replace(/^.*\/I\//, "").replace(/^MNS-/, "");
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
  // طلب العميل يروح للإدارة أولاً للمراجعة، والإدارة ترسله للتاجر يطلب عرض سعر
  ...db, bookings: [{ ...b, id: uid("bk"), createdAt: Date.now(), messages: [], status: b.fromClient ? "review" : "new" }, ...db.bookings],
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
  const price = b.clientPrice ?? b.quote ?? b.estimate;
  return { ...next, bookings: next.bookings.map((x) => (x.id === id ? { ...x, pay: x.pay ?? { stage: "due" as const } } : x)), client: { ...next.client, budget: [...next.client.budget, { id: uid("b"), label, cat: b.kind, est: price, paid: 0 }] } };
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
  const split = splitBudget(event.budget, event.occasion, event.place);
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
  ...db, tickets: (db.tickets ?? []).map((t) => t.id !== id ? t : { ...t, status: from === "admin" ? "answered" : t.status === "closed" || t.status === "answered" ? "reopened" : t.status, closedReason: from === "user" ? undefined : t.closedReason, updatedAt: Date.now(), messages: [...t.messages, { from, text, at: Date.now() }] }),
});
/** إغلاق التذكرة: من الإدارة فقط، ومع رد وسبب */
export const closeTicket = (id: string, reason: string, reply: string): Mutation => (db) => ({
  ...db, tickets: (db.tickets ?? []).map((t) => t.id !== id ? t : { ...t, status: "closed", closedReason: reason.trim(), updatedAt: Date.now(), messages: [...t.messages, { from: "admin" as const, text: reply.trim(), at: Date.now() }] }),
});
/** إعادة فتح تذكرة مغلقة (للمستخدم برسالة، أو للإدارة) */
export const reopenTicket = (id: string, from: "user" | "admin", text: string): Mutation => (db) => ({
  ...db, tickets: (db.tickets ?? []).map((t) => t.id !== id ? t : { ...t, status: "reopened", closedReason: undefined, updatedAt: Date.now(), messages: text.trim() ? [...t.messages, { from, text: text.trim(), at: Date.now() }] : t.messages }),
});
export const setTicketStatus = (id: string, status: Ticket["status"]): Mutation => (db) => ({ ...db, tickets: (db.tickets ?? []).map((t) => (t.id === id ? { ...t, status, updatedAt: Date.now() } : t)) });

/* ───── محادثة الطلب بين العميل والتاجر ───── */
/** رسالة في الطلب: أرقام التواصل تنخفي تلقائياً (إلا من الإدارة)، والإدارة تتنبّه للمحاولة */
export const bookingMessage = (id: string, from: Message["from"], text: string): Mutation => (db) => {
  const m = from === "admin" ? { text, hit: false } : maskContacts(text);
  return { ...db, bookings: db.bookings.map((b) => (b.id === id ? { ...b, leaks: (b.leaks ?? 0) + (m.hit ? 1 : 0), messages: [...b.messages, { from, text: m.text, at: Date.now() }] } : b)) };
};

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
  const copy: Booking = { ...b, id: uid("bk"), kind: to.kind, targetId: to.id, hallId: to.hallId, status: "new" as const, quote: undefined, cancelRequest: undefined, vendorStatus: undefined, reassignedFrom: b.id, createdAt: now,
    messages: [{ from: "admin", text: "طلب محوّل من إدارة مناسبتي نيابة عن العميل. نرجو الرد بعرضك.", at: now }] };
  return { ...db, bookings: [copy, ...db.bookings.map((x) => (x.id !== id ? x : { ...x, status: "declined" as const, cancelRequest: undefined, messages: [...x.messages, { from: "admin" as const, text: `حوّلت الإدارة طلبك إلى ${to.name} لضمان خدمتك في موعدك.`, at: now }] }))] };
};
export const markNotified = (id: string): Mutation => (db) => ({ ...db, bookings: db.bookings.map((b) => (b.id === id ? { ...b, notifiedAt: Date.now() } : b)) });
/** الإدارة توافق على طلب العميل وترسله للتاجر يطلب عرض سعر */
export const forwardToVendor = (id: string, note?: string): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id !== id ? b : { ...b, status: "new" as const, messages: [...b.messages, { from: "admin" as const, text: note?.trim() || "طلب من إدارة مناسبتي: نرجو إرسال عرض سعر لهذا الطلب.", at: Date.now() }] })),
});
/** الإدارة ترفض الطلب قبل إرساله (مثلاً بيانات ناقصة أو التاريخ غير متاح) مع سبب يوصل للعميل */
export const rejectRequest = (id: string, reason: string): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id !== id ? b : { ...b, status: "declined" as const, messages: [...b.messages, { from: "admin" as const, text: reason.trim() || "اعتذرت الإدارة عن هذا الطلب.", at: Date.now() }] })),
});
/** يتعلم من العميل: اختار (يعجبني) أو رفض (مو مناسب) */
export const learnPref = (id: string, kind: "like" | "dismiss" | "clear"): Mutation => (db) => {
  const p = db.client.prefs ?? { liked: [], dismissed: [] };
  const liked = p.liked.filter((x) => x !== id), dismissed = p.dismissed.filter((x) => x !== id);
  if (kind === "like") liked.push(id); if (kind === "dismiss") dismissed.push(id);
  return { ...db, client: { ...db.client, prefs: { liked, dismissed } } };
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
export const setSupportPhone = (phone: string): Mutation => (db) => ({ ...db, supportPhone: phone.replace(/\D/g, "") || undefined });
export const setLegal = (l: NonNullable<DB["legal"]>): Mutation => (db) => ({ ...db, legal: { entity: l.entity.trim(), cr: l.cr.replace(/\D/g, ""), vat: l.vat.replace(/\D/g, ""), address: l.address.trim(), email: l.email.trim() } });
/** نسخة الشروط اللي يوافق عليها المستخدم وقت إنشاء الحساب */
export const TERMS_VERSION = 1;
export const setPricing = (p: NonNullable<DB["pricing"]>): Mutation => (db) => ({ ...db, pricing: { feePct: Math.max(0, Math.min(60, p.feePct)), minFee: Math.max(0, p.minFee), depositPct: Math.max(0, Math.min(100, p.depositPct)), auto: !!p.auto } });
export const setBank = (b: NonNullable<DB["bank"]>): Mutation => (db) => ({ ...db, bank: { name: b.name.trim(), holder: b.holder.trim(), iban: b.iban.replace(/\s/g, "").toUpperCase() } });
/** الحسابات الظاهرة للعملاء: المعلّقة تختفي */
export const isActive = (x: { status?: AccountStatus }) => x.status !== "suspended";

/* ───── غرفة التنسيق وختم الليلة ───── */
export const OPS_NAME: Record<OpsMsg["from"], string> = { client: "صاحب المناسبة", admin: "إدارة مناسبتي", all: "المنسق العام", men: "منسق الرجال", women: "منسقة النساء" };
/** رسائل جاهزة بضغطة لكل طرف */
export const OPS_QUICK: Record<"coord" | "client" | "admin", [string, OpsMsg["kind"]][]> = {
  coord: [["القسم امتلأ تقريباً", "alert"], ["نحتاج كراسي إضافية", "alert"], ["وصل ضيف كبير", "msg"], ["الضيوف اكتملوا تقريباً، نبدأ العشاء؟", "msg"], ["أحتاج مساعدة عند الباب", "alert"]],
  client: [["ابدأوا العشاء", "msg"], ["تأخير ١٥ دقيقة", "msg"], ["رحّبوا بكبار الضيوف عند الباب", "msg"], ["شكراً لكم، شغل ممتاز", "msg"]],
  admin: [["الإدارة تتابع معكم الآن", "msg"], ["تواصلنا مع المورد وهو في الطريق", "msg"], ["تم حل المشكلة", "msg"]],
};
export const postOp = (m: { from: OpsMsg["from"]; text: string; kind?: OpsMsg["kind"]; owner?: string }): Mutation => (db) => {
  const text = m.text.trim().slice(0, 280);
  if (!text) return db;
  return { ...db, ops: [...(db.ops ?? []), { id: uid("op"), owner: m.owner, from: m.from, text, kind: m.kind ?? "msg", at: Date.now() }].slice(-300) };
};
export const DEFAULT_THANKS = "شكراً من القلب على حضوركم ومشاركتكم فرحتنا. نورتوا ليلتنا، وجعلها الله في ميزان حسناتكم.";
/** ختم الليلة: يحفظ رسالة الشكر وتقييمات الموردين، ويبلغ المنسقين والإدارة */
export const endEvent = (o: { thanks: string; ratings: Record<string, number> }): Mutation => (db) => {
  if (!db.client.event) return db;
  const at = Date.now();
  const next: DB = {
    ...db,
    client: { ...db.client, event: { ...db.client.event, endedAt: at, thanks: o.thanks.trim() || DEFAULT_THANKS } },
    bookings: db.bookings.map((b) => (o.ratings[b.id] ? { ...b, rating: { stars: Math.max(1, Math.min(5, Math.round(o.ratings[b.id]))), at } } : b)),
  };
  return postOp({ from: "client", text: "انتهت الليلة. شكراً لكل الفريق على تعبكم 🤍", kind: "done" })(next);
};
/** تراجع عن ختم الليلة (لو ضغطها بالغلط) */
export const reopenEvent = (): Mutation => (db) => (db.client.event ? { ...db, client: { ...db.client, event: { ...db.client.event, endedAt: undefined } } } : db);

/* ───── رسالة الدعوة في الواتساب (باللهجة السعودية) ───── */
/** «دعوة لزواج فيصل» */
export const inviteTitle = (title: string) => { const t = title.trim(); return "دعوة " + (t.startsWith("ال") ? "لل" + t.slice(2) : "ل" + t); };
/** «يوم الخميس ٢٣ رجب الساعة ٨:٣٠ م» (التاريخ هجري) */
export const inviteWhen = (date: string, time?: string) => {
  try {
    const d = new Date(`${date}T${time ?? "20:30"}:00`);
    const day = new Intl.DateTimeFormat("ar-SA", { weekday: "long" }).format(d);
    const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long" }).format(d).replace(/\s*هـ$/, "");
    const clock = time ? ` الساعة ${new Intl.DateTimeFormat("ar-SA", { hour: "numeric", minute: "2-digit" }).format(d)}` : "";
    return `يوم ${day} ${hijri}${clock}`;
  } catch { return date; }
};
export const inviteMessage = (e: Pick<ClientEvent, "title" | "date">, g: Pick<Guest, "name" | "relation" | "section">, url: string, time?: string) => {
  const first = g.name.split("،")[0].trim();
  const who = g.relation ? `${greetingFor(g)} ${first}` : first;
  const what = e.title.trim();
  return `يا هلا والله ${who} 🤍\nيشرّفنا حضورك في ${what}، ${inviteWhen(e.date, time)}.\nدعوتك هنا، افتحها وأكّد حضورك 👇\n${url}`;
};

/* ───── حماية المنصة: التسعير، الدفع عبر مناسبتي، الاتفاقية، وإخفاء أرقام التواصل ───── */
export const DEFAULT_PRICING: NonNullable<DB["pricing"]> = { feePct: 15, minFee: 300, depositPct: 30, auto: true };
export const pricingOf = (db: Pick<DB, "pricing">) => ({ ...DEFAULT_PRICING, ...(db.pricing ?? {}) });
/** سعر العميل من سعر التاجر الصافي: النسبة أو الحد الأدنى (الأكبر)، مقرّب لأقرب ١٠ */
export const clientPriceFor = (net: number, p: NonNullable<DB["pricing"]> = DEFAULT_PRICING) =>
  net > 0 ? Math.round(Math.max(net * (1 + p.feePct / 100), net + p.minFee) / 10) * 10 : 0;
export const depositFor = (b: Pick<Booking, "clientPrice">, p: NonNullable<DB["pricing"]> = DEFAULT_PRICING) => Math.round(((b.clientPrice ?? 0) * p.depositPct) / 100 / 10) * 10;

/** التاجر يرسل سعره الصافي. مع التسعير التلقائي يوصل العميل سعر مناسبتي على طول */
export const sendQuote = (id: string, net: number, text: string): Mutation => (db) => {
  const p = pricingOf(db);
  return {
    ...db,
    bookings: db.bookings.map((b) => b.id !== id ? b : {
      ...b, status: "quoted" as const, quote: net, clientPrice: p.auto ? clientPriceFor(net, p) : undefined,
      messages: text.trim() ? [...b.messages, { from: "provider" as const, text: maskContacts(text).text, at: Date.now() }] : b.messages,
    }),
  };
};
/** الإدارة تعتمد سعر العميل (لو التسعير التلقائي مطفي، أو تبي تعدّله) */
export const priceForClient = (id: string, price: number): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id !== id ? b : { ...b, clientPrice: Math.max(0, Math.round(price)), messages: [...b.messages, { from: "admin" as const, text: "عرض السعر جاهز، راجعه وأكّد حجزك.", at: Date.now() }] })),
});
/** العميل يقول إنه حوّل العربون */
export const claimPaid = (id: string): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id !== id ? b : { ...b, pay: { ...(b.pay ?? { stage: "due" }), stage: "claimed" as const, claimedAt: Date.now() } })),
});
/** الإدارة تأكد استلام العربون، والتاجر يتطمن إن الحجز مدفوع */
export const confirmPaid = (id: string): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id !== id ? b : { ...b, pay: { ...(b.pay ?? { stage: "due" }), stage: "paid" as const, paidAt: Date.now() }, messages: [...b.messages, { from: "admin" as const, text: "استلمنا العربون عبر مناسبتي، والحجز مؤكد ومضمون.", at: Date.now() }] })),
});
/** الإدارة حوّلت للتاجر مستحقاته (بعد ختم الليلة) */
export const markPayout = (id: string): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id !== id ? b : { ...b, pay: { ...(b.pay ?? { stage: "paid" }), payoutAt: Date.now() }, messages: [...b.messages, { from: "admin" as const, text: "حوّلنا لك مستحقاتك عن هذا الحجز. شكراً لك.", at: Date.now() }] })),
});

/** اتفاقية الشراكة: نسخة واحدة يوقعها كل تاجر وصاحب قاعة */
export const AGREEMENT_VERSION = 1;
export const AGREEMENT_CLAUSES: [string, string][] = [
  ["التواصل عبر مناسبتي فقط", "كل تواصل مع عملاء مناسبتي يكون داخل المنصة. ما أطلب رقم العميل، وما أعطيه رقمي أو حساباتي، وما أتواصل معه من برّا."],
  ["الدفع عبر مناسبتي فقط", "العميل يدفع لمناسبتي، ومناسبتي تحوّل لي سعري الصافي. ما أستلم أي مبلغ من العميل مباشرة."],
  ["سعري صافي لي", "السعر اللي أرسله في العرض هو صافي حقي. مناسبتي تضيف خدمتها وتعرض على العميل سعرها."],
  ["عدم التجاوز ١٢ شهر", "أي عميل وصلني عن طريق مناسبتي، ما أتعامل معه مباشرة لمدة ١٢ شهر من آخر حجز. لو صار، تستحق مناسبتي رسومها كاملة على هذا التعامل، ولها إيقاف حسابي."],
  ["الالتزام بالحجز", "ألتزم بالحجز المؤكد. الإلغاء يمر بالإدارة، والإدارة تقدر تحوّل الطلب لتاجر بديل."],
  ["المستحقات بعد المناسبة", "مستحقاتي تتحوّل لي بعد ما تنتهي المناسبة (ختم الليلة)، أو حسب الاتفاق مع الإدارة."],
];
export const acceptAgreement = (kind: "supplier" | "venue", id: string, by: string): Mutation => (db) => {
  const agreement = { v: AGREEMENT_VERSION, at: Date.now(), by: by.trim() };
  return kind === "supplier"
    ? { ...db, suppliers: db.suppliers.map((s) => (s.id === id ? { ...s, agreement } : s)) }
    : { ...db, venues: db.venues.map((v) => (v.id === id ? { ...v, agreement } : v)) };
};
export const hasAgreement = (x?: { agreement?: { v: number } }) => !!x?.agreement && x.agreement.v >= AGREEMENT_VERSION;

/** يخفي أي رقم جوال أو بريد أو رابط أو حساب تواصل من رسائل العميل والتاجر */
export function maskContacts(text: string): { text: string; hit: boolean } {
  let hit = false;
  const mark = "•••• (التواصل عبر مناسبتي)";
  const rules: RegExp[] = [
    /(?:https?:\/\/|www\.)\S+/gi,
    /\b(?:wa\.me|t\.me|snapchat\.com|instagram\.com|tiktok\.com|x\.com|twitter\.com)\/?\S*/gi,
    /[\w.+-]+@[\w-]+\.[\w.]+/g,
    /(?:واتس(?:اب)?|وتس|whats?app|سناب(?:شات)?|snap(?:chat)?|انستا(?:قرام|غرام|جرام)?|insta(?:gram)?|تيك ?توك|tiktok|تلقرام|تيليجرام|telegram)\s*[:：]?\s*@?[\w.؀-ۿ-]{2,}/gi,
    /@[A-Za-z0-9_.]{3,}/g,
    /(?:\+|00)?[0-9٠-٩][0-9٠-٩\s\-–.]{6,}[0-9٠-٩]/g,
  ];
  let out = text;
  for (const r of rules) out = out.replace(r, (m) => {
    // الأرقام القصيرة (مبالغ، أعداد ضيوف) والتواريخ ما نخفيها: نخفي ٩ أرقام وأكثر (أرقام الجوال)
    if (/^[+0-9٠-٩\s\-–.]+$/.test(m)) {
      const digits = m.replace(/[^0-9٠-٩]/g, "");
      if (digits.length < 9 || /^\s*[0-9٠-٩]{4}[-–.][0-9٠-٩]{1,2}[-–.][0-9٠-٩]{1,2}\s*$/.test(m)) return m;
    }
    hit = true; return mark;
  });
  return { text: out, hit };
}
