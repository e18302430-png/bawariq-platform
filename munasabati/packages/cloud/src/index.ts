import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  createInitialDB, type AuthAdapter, type AuthUser, type Booking, type CheckInResult, type Guest, type InviteSnapshot, type ClientSpace, type DB, type Mutation, type Repository, type Supplier, type Ticket, type Venue,
} from "@munasabati/core";

/**
 * مستودع سحابي (Supabase): نفس واجهة المستودع المحلي، فالشاشات ما تتغير.
 * - يحمّل البيانات المسموحة للمستخدم حسب سياسات RLS.
 * - كل عملية تُطبَّق فوراً على الشاشة، ثم تُحفظ التغييرات فقط (diff) في قاعدة البيانات.
 * - طلبات الحجز تصل لحظياً عبر Realtime.
 */

type Row<T> = { id: string; owner_id?: string | null; data: T };

const toIntl = (p: string) => "+966" + p.replace(/\D/g, "").replace(/^0/, "");

/** الحساب بالجوال وكلمة المرور: بريد داخلي ثابت لكل رقم (ما يُرسل له أي بريد) */
const phoneLocal = (p: string) => { let d = p.replace(/\D/g, ""); if (d.startsWith("966")) d = "0" + d.slice(3); if (d.length === 9 && d.startsWith("5")) d = "0" + d; return d; };
const phoneEmail = (p: string) => `966${phoneLocal(p).replace(/^0/, "")}@munasabati.app`;

export function createSupabaseRepository(url: string, anonKey: string, authMode: "phone" | "quick" = "quick"): Repository {
  const sb: SupabaseClient = createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const empty = createInitialDB();
  let state: DB = { ...empty, suppliers: [], venues: [], bookings: [], tickets: [] };
  let user: AuthUser | null = null;
  let lastError: string | null = null;

  const fail = (msg: string) => (e: unknown) => { lastError = `${msg}: ${(e as Error)?.message ?? e}`; emit(); };

  let loaded = false;
  async function load() {
    const { data: s } = await sb.auth.getSession();
    user = s.session?.user ? { id: s.session.user.id, phone: s.session.user.phone || (s.session.user.user_metadata?.phone as string | undefined) || "", anon: !!s.session.user.is_anonymous } : null;
    const [sup, ven, bk, space, busy, tk, st] = await Promise.all([
      sb.from("suppliers").select("id, owner_id, data"),
      sb.from("venues").select("id, owner_id, data"),
      user ? sb.from("bookings").select("id, data, status").order("created_at", { ascending: false }) : Promise.resolve({ data: [] as { id: string; data: Booking; status: string }[], error: null }),
      user ? sb.from("client_spaces").select("data").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      sb.from("busy_days").select("kind, target_id, hall_id, event_date"),
      user ? sb.from("tickets").select("id, data, status").order("updated_at", { ascending: false }) : Promise.resolve({ data: [] as { id: string; data: Ticket; status: Ticket["status"] }[], error: null }),
      sb.from("settings").select("key, value").in("key", ["announcement", "support_phone"]),
    ]);
    // الإدارة: كل مساحات العملاء (سياسة RLS تسمح بها للمدير فقط)
    const role = user ? (await sb.from("profiles").select("role").eq("id", user.id).maybeSingle()).data?.role : null;
    if (user) user.role = role === "admin" ? "admin" : "user";
    const allSpaces = role === "admin" ? (await sb.from("client_spaces").select("user_id, data, updated_at")).data ?? [] : null;
    const suppliers = ((sup.data ?? []) as Row<Supplier>[]).map((r) => ({ ...r.data, id: r.id }));
    const venues = ((ven.data ?? []) as Row<Venue>[]).map((r) => ({ ...r.data, id: r.id }));
    const owned = (rows: Row<unknown>[] | null) => (rows ?? []).find((r) => r.owner_id && r.owner_id === user?.id)?.id ?? null;
    const ownedIds = new Set([...(sup.data ?? []), ...(ven.data ?? [])].filter((r) => r.owner_id && r.owner_id === user?.id).map((r) => r.id as string));
    const real = ((bk.data ?? []) as { id: string; data: Booking; status: Booking["status"] }[]).map((r) => ({ ...r.data, id: r.id, status: r.status }));
    // أيام محجوزة لدى الآخرين (بدون بياناتهم) حتى لا يُحجز نفس اليوم مرتين
    const blockedByOthers: Booking[] = ((busy.data ?? []) as { kind: Booking["kind"]; target_id: string; hall_id: string | null; event_date: string }[])
      .filter((r) => !ownedIds.has(r.target_id))
      .map((r, i) => ({ id: `busy-${i}`, kind: r.kind, targetId: r.target_id, hallId: r.hall_id ?? undefined, clientName: "", phone: "", occasion: "wedding", city: "", date: r.event_date, guests: 0, note: "", status: "confirmed", estimate: 0, createdAt: 0, messages: [], seed: true }));
    state = {
      ...state,
      client: (space.data?.data as ClientSpace | undefined) ?? empty.client,
      suppliers, venues,
      bookings: [...real, ...blockedByOthers.filter((b) => !real.some((x) => x.targetId === b.targetId && x.date === b.date && x.status === "confirmed"))],
      sessions: { supplierId: owned(sup.data as Row<unknown>[]), venueId: owned(ven.data as Row<unknown>[]) },
      tickets: ((tk.data ?? []) as { id: string; data: Ticket; status: Ticket["status"] }[]).map((r) => ({ ...r.data, id: r.id, status: r.status })),
      announcement: ((st.data ?? []) as { key: string; value: string }[]).find((r) => r.key === "announcement")?.value || undefined,
      supportPhone: ((st.data ?? []) as { key: string; value: string }[]).find((r) => r.key === "support_phone")?.value || undefined,
      clients: allSpaces ? (allSpaces as { user_id: string; data: ClientSpace; updated_at: string }[]).map((r) => ({ id: r.user_id, data: r.data, updatedAt: Date.parse(r.updated_at) })) : undefined,
    };
    loaded = true;
    lastError = sup.error?.message ?? ven.error?.message ?? null;
    emit();
  }

  async function persist(prev: DB, next: DB) {
    if (!user) return;
    const uid = user.id;
    const jobs: PromiseLike<unknown>[] = [];
    if (prev.client !== next.client) {
      jobs.push(sb.from("client_spaces").upsert({ user_id: uid, data: next.client, updated_at: new Date().toISOString() }).then(({ error }) => { if (error) throw error; }));
    }
    const diff = <T extends { id: string }>(a: T[], b: T[]) => b.filter((x) => a.find((y) => y.id === x.id) !== x);
    for (const s of diff(prev.suppliers, next.suppliers)) {
      const isNew = !prev.suppliers.some((x) => x.id === s.id);
      jobs.push(sb.from("suppliers").upsert({ id: s.id, data: s, status: s.status ?? "active", updated_at: new Date().toISOString(), ...(isNew ? { owner_id: uid } : {}) }).then(({ error }) => { if (error) throw error; }));
    }
    for (const v of diff(prev.venues, next.venues)) {
      const isNew = !prev.venues.some((x) => x.id === v.id);
      jobs.push(sb.from("venues").upsert({ id: v.id, data: v, status: v.status ?? "active", updated_at: new Date().toISOString(), ...(isNew ? { owner_id: uid } : {}) }).then(({ error }) => { if (error) throw error; }));
    }
    for (const b of diff(prev.bookings, next.bookings).filter((x) => !x.id.startsWith("busy-"))) {
      const isNew = !prev.bookings.some((x) => x.id === b.id);
      const row = { id: b.id, kind: b.kind, target_id: b.targetId, status: b.status, event_date: b.date, data: b, updated_at: new Date().toISOString() };
      jobs.push((isNew ? sb.from("bookings").insert({ ...row, client_id: uid }) : sb.from("bookings").update(row).eq("id", b.id)).then(({ error }) => { if (error) throw error; }));
    }
    for (const t of diff(prev.tickets ?? [], next.tickets ?? [])) {
      jobs.push(sb.from("tickets").upsert({ id: t.id, status: t.status, data: t, updated_at: new Date().toISOString(), ...(!(prev.tickets ?? []).some((x) => x.id === t.id) ? { user_id: uid } : {}) }).then(({ error }) => { if (error) throw error; }));
    }
    for (const kind of ["suppliers", "venues"] as const) {
      for (const x of (prev[kind] as { id: string }[]).filter((p) => !(next[kind] as { id: string }[]).some((n) => n.id === p.id))) jobs.push(sb.from(kind).delete().eq("id", x.id).then(({ error }) => { if (error) throw error; }));
    }
    for (const b of prev.bookings.filter((p) => !p.id.startsWith("busy-") && !next.bookings.some((n) => n.id === p.id))) jobs.push(sb.from("bookings").delete().eq("id", b.id).then(({ error }) => { if (error) throw error; }));
    // تعديلات وحذف الإدارة على مساحات العملاء
    if (next.clients && prev.clients) {
      for (const c of next.clients.filter((x) => prev.clients!.find((y) => y.id === x.id) !== x)) jobs.push(sb.from("client_spaces").update({ data: c.data, updated_at: new Date().toISOString() }).eq("user_id", c.id).then(({ error }) => { if (error) throw error; }));
      for (const c of prev.clients.filter((p) => !next.clients!.some((n) => n.id === p.id))) jobs.push(sb.from("client_spaces").delete().eq("user_id", c.id).then(({ error }) => { if (error) throw error; }));
    }
    if (prev.supportPhone !== next.supportPhone) jobs.push(sb.from("settings").upsert({ key: "support_phone", value: next.supportPhone ?? "" }).then(({ error }) => { if (error) throw error; }));
    if (prev.announcement !== next.announcement) jobs.push(sb.from("settings").upsert({ key: "announcement", value: next.announcement ?? "" }).then(({ error }) => { if (error) throw error; }));
    await Promise.all(jobs).then(() => { lastError = null; }, fail("تعذّر الحفظ"));
  }

  // تحديث لحظي: أي تغيير على الطلبات المسموح بها يعيد تحميلها
  sb.channel("live").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => { void load(); })
    .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => { void load(); })
    .on("postgres_changes", { event: "*", schema: "public", table: "client_spaces" }, () => { void load(); }).subscribe();
  let recovering = false;
  sb.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") recovering = true; void load(); });
  void load().catch((e) => { loaded = true; fail("تعذّر الاتصال")(e); emit(); });

  const auth: AuthAdapter = {
    mode: authMode,
    user: () => user,
    async quickSignIn(phone, name) {
      const local = phone.replace(/\D/g, "");
      const { data, error } = await sb.auth.signInAnonymously({ options: { data: { phone: local, name } } });
      if (error || !data.user) throw new Error(error?.message ?? "تعذّر الدخول");
      await sb.from("profiles").upsert({ id: data.user.id, phone: local, ...(name ? { name } : {}) });
      user = { id: data.user.id, phone: local };
      await load();
      return user;
    },
    async resetPassword(email, redirectTo) {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw new Error("تعذّر إرسال الرابط. حاول بعد دقيقة.");
    },
    needsNewPassword: () => recovering,
    async updatePassword(password) {
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      recovering = false;
      await load();
    },
    async signUpPhone(phone, password, name) {
      const local = phoneLocal(phone);
      const { data, error } = await sb.auth.signUp({ email: phoneEmail(phone), password, options: { data: { phone: local, name } } });
      if (error) throw new Error(/registered|exists/i.test(error.message) ? "هذا الرقم مسجّل من قبل. اختر «دخول» واكتب كلمة المرور." : /password/i.test(error.message) ? "كلمة المرور لازم تكون ٦ أحرف أو أكثر." : "تعذّر إنشاء الحساب. حاول مرة ثانية.");
      if (!data.session) throw new Error("تم إنشاء الحساب. اختر «دخول» واكتب كلمة المرور.");
      await sb.from("profiles").upsert({ id: data.user!.id, phone: local, ...(name ? { name } : {}) });
      await load();
      return user!;
    },
    async signInPhone(phone, password) {
      const { error } = await sb.auth.signInWithPassword({ email: phoneEmail(phone), password });
      if (error) throw new Error("الرقم أو كلمة المرور غير صحيحة.");
      await load();
      return user!;
    },
    async adminSetPassword(phone, password) {
      const { data, error } = await sb.rpc("admin_set_password", { p_phone: phone, p_password: password });
      if (error) throw new Error(error.message.includes("short") ? "كلمة المرور لازم تكون ٦ أحرف أو أكثر." : "تعذّر تعيين كلمة المرور.");
      if (!data) throw new Error("ما لقينا حساباً بهذا الرقم. صاحب الرقم لازم يسوي حساب بكلمة مرور أولاً.");
    },
    async adminLinkOwner(kind, id, phone) {
      const { data, error } = await sb.rpc("admin_link_owner", { p_kind: kind, p_id: id, p_phone: phone });
      if (error) throw new Error("تعذّر الربط.");
      if (!data) throw new Error("ما لقينا حساباً بهذا الرقم. صاحب الرقم لازم يسوي حساب بكلمة مرور أولاً.");
      await load();
    },
    async signInWithPassword(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) throw new Error("البريد أو كلمة المرور غير صحيحة");
      user = { id: data.user.id, phone: "" };
      await load();
      return user!;
    },
    async sendOtp(phone) {
      const { error } = await sb.auth.signInWithOtp({ phone: toIntl(phone) });
      if (error) throw new Error(error.message);
    },
    async verifyOtp(phone, code) {
      const { data, error } = await sb.auth.verifyOtp({ phone: toIntl(phone), token: code, type: "sms" });
      if (error || !data.user) throw new Error(error?.message ?? "رمز غير صحيح");
      user = { id: data.user.id, phone: data.user.phone ?? "" };
      await load();
      return user;
    },
    async signOut() { await sb.auth.signOut(); user = null; await load(); },
  };

  // شاشة المنسق: تقرأ وتسجل الدخول بمفتاح الرابط فقط (دوال security definer، بدون كشف بقية بيانات العميل)
  const invite = {
    async load(code: string) {
      const { data, error } = await sb.rpc("invite_load", { c: code });
      if (error || !data || !(data as { guest?: unknown }).guest) return null;
      return data as InviteSnapshot;
    },
    async rsvp(code: string, patch: { status: Guest["status"]; count?: number; diet?: string }) {
      const { data, error } = await sb.rpc("invite_rsvp", { c: code, st: patch.status, cnt: patch.count ?? null, dt: patch.diet ?? null });
      if (error || !data) return null;
      return data as Guest;
    },
  };
  const door = {
    async load(key: string) {
      const { data, error } = await sb.rpc("door_load", { k: key });
      if (error || !data) return null;
      return data as { title: string; date: string; guests: Guest[] };
    },
    async checkIn(key: string, code: string) {
      const { data, error } = await sb.rpc("door_checkin", { k: key, c: code });
      if (error || !data) return { ok: false as const, reason: "unknown" as const };
      return data as CheckInResult;
    },
  };

  return {
    mode: "cloud",
    door,
    invite,
    ready: () => loaded,
    get: () => state,
    apply(m: Mutation) { const prev = state; state = m(state); emit(); void persist(prev, state); },
    subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
    reset() { const prev = state; state = { ...state, client: empty.client }; emit(); void persist(prev, state); },
    async uploadPhoto(file) {
      if (!user) throw new Error("سجّل الدخول أولاً");
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error } = await sb.storage.from("media").upload(path, file, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (error) throw new Error(error.message);
      return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
    },
    auth,
    error: () => lastError,
  };
}
