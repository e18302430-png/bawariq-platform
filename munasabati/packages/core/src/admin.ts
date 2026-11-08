/*
  الإدارة هي الوسيط الفعلي بين العميل وكل الأطراف:
  ترى بيانات كل عميل كاملة (المناسبة، الميزانية، الضيوف، الطلبات، التذاكر) ولها حق التعديل والحذف على كل شيء.
*/
import { normPhone } from "./calc";
import type { Mutation } from "./db";
import type { Booking, ClientEvent, ClientRecord, DB, Ticket } from "./types";

export interface AdminClient {
  key: string;
  /** space = عنده مساحة في التطبيق؛ booking = معروف من طلباته فقط */
  source: "space" | "booking";
  spaceId?: string;
  name: string;
  phone: string;
  event?: ClientEvent;
  budget: number;
  allocated: number;
  paid: number;
  guests: number;
  confirmedGuests: number;
  tasks: [number, number];
  bookings: Booking[];
  tickets: Ticket[];
  lastActive: number;
}

const LOCAL = "local";
/** المساحات المتاحة للإدارة: سحابياً db.clients، ومحلياً مساحة هذا المتصفح */
export const spaces = (db: DB): ClientRecord[] => db.clients ?? (db.client.profile || db.client.event ? [{ id: LOCAL, data: db.client }] : []);

export function adminClients(db: DB): AdminClient[] {
  const out = new Map<string, AdminClient>();
  const blank = (key: string, name: string, phone: string): AdminClient => ({ key, source: "booking", name, phone, budget: 0, allocated: 0, paid: 0, guests: 0, confirmedGuests: 0, tasks: [0, 0], bookings: [], tickets: [], lastActive: 0 });
  for (const s of spaces(db)) {
    const c = s.data, phone = normPhone(c.profile?.phone ?? "");
    const key = phone || "space:" + s.id;
    const r = blank(key, c.profile?.name ?? "عميل", phone);
    Object.assign(r, {
      source: "space", spaceId: s.id, event: c.event ?? undefined,
      budget: c.event?.budget ?? 0, allocated: c.budget.reduce((a, b) => a + b.est, 0), paid: c.budget.reduce((a, b) => a + b.paid, 0),
      guests: c.guests.reduce((a, g) => a + g.count, 0), confirmedGuests: c.guests.filter((g) => g.status === "yes").reduce((a, g) => a + g.count, 0),
      tasks: [c.tasks.filter((t) => t.done).length, c.tasks.length], lastActive: s.updatedAt ?? 0,
    });
    out.set(key, r);
  }
  for (const b of db.bookings) {
    if (b.seed && !b.fromClient) continue;
    const phone = normPhone(b.phone);
    let r = out.get(phone) ?? (b.fromClient ? [...out.values()].find((x) => x.source === "space" && !x.phone) : undefined);
    if (!r) { r = blank(phone || "b:" + b.id, b.clientName, phone); out.set(r.key, r); }
    if (!r.phone && phone) r.phone = phone;
    r.bookings.push(b);
    r.lastActive = Math.max(r.lastActive, b.createdAt, b.messages.at(-1)?.at ?? 0);
    if (r.source === "booking") { r.budget = Math.max(r.budget, 0); r.guests = Math.max(r.guests, b.guests); }
  }
  for (const t of db.tickets ?? []) {
    if (t.from !== "client") continue;
    const r = [...out.values()].find((x) => x.spaceId === t.fromId || (t.fromId === "me" && x.spaceId === LOCAL) || x.name === t.fromName);
    if (r) { r.tickets.push(t); r.lastActive = Math.max(r.lastActive, t.updatedAt); }
  }
  return [...out.values()].sort((a, b) => b.lastActive - a.lastActive);
}

const patchSpace = (db: DB, spaceId: string | undefined, fn: (c: DB["client"]) => DB["client"]): DB => {
  if (!spaceId) return db;
  if (db.clients) return { ...db, clients: db.clients.map((s) => (s.id === spaceId ? { ...s, data: fn(s.data), updatedAt: Date.now() } : s)) };
  return spaceId === LOCAL ? { ...db, client: fn(db.client) } : db;
};

/** تعديل بيانات العميل: الاسم والجوال يتحدثان في مساحته وكل طلباته، وتفاصيل المناسبة في مساحته */
export const adminUpdateClient = (c: Pick<AdminClient, "phone" | "spaceId">, patch: { name?: string; phone?: string; event?: Partial<ClientEvent> }): Mutation => (db) => {
  const old = normPhone(c.phone);
  const phone = patch.phone != null ? normPhone(patch.phone) : undefined;
  let next: DB = {
    ...db,
    bookings: db.bookings.map((b) => (old && normPhone(b.phone) === old ? { ...b, ...(patch.name ? { clientName: patch.name } : {}), ...(phone ? { phone } : {}) } : b)),
  };
  next = patchSpace(next, c.spaceId, (cl) => ({
    ...cl,
    profile: cl.profile || patch.name || phone ? { name: patch.name ?? cl.profile?.name ?? "", phone: phone ?? cl.profile?.phone ?? "" } : cl.profile,
    event: cl.event && patch.event ? { ...cl.event, ...patch.event } : cl.event,
  }));
  return next;
};

/** حذف العميل نهائياً: طلباته وتذاكره ومساحته */
export const adminDeleteClient = (c: Pick<AdminClient, "phone" | "spaceId" | "bookings" | "tickets">): Mutation => (db) => {
  const ids = new Set(c.bookings.map((b) => b.id)), tids = new Set(c.tickets.map((t) => t.id));
  const next: DB = { ...db, bookings: db.bookings.filter((b) => !ids.has(b.id)), tickets: (db.tickets ?? []).filter((t) => !tids.has(t.id)) };
  if (!c.spaceId) return next;
  if (next.clients) return { ...next, clients: next.clients.filter((s) => s.id !== c.spaceId) };
  return c.spaceId === LOCAL ? { ...next, client: { ...next.client, profile: null, event: null, guests: [], budget: [], tasks: [], favorites: [] } } : next;
};

/** تعديل أي طلب: التاريخ، العدد، الميزانية، قيمة العرض، الملاحظات، الحالة، بيانات العميل */
export const adminUpdateBooking = (id: string, patch: Partial<Pick<Booking, "date" | "guests" | "budget" | "quote" | "note" | "status" | "clientName" | "phone" | "city">>): Mutation => (db) => ({
  ...db, bookings: db.bookings.map((b) => (b.id === id ? { ...b, ...patch, ...(patch.phone ? { phone: normPhone(patch.phone) } : {}) } : b)),
});
