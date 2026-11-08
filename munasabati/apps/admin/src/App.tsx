import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CATEGORIES, CITIES, OCCASIONS, adminClients, adminDelete, setPromoted, trustOf, fmt, normPhone, sar, adminSetStatus, adminSetVerified, replyTicket, setAnnouncement, setTicketStatus,
  upsertSupplier, upsertVenue, type Booking, type BookingStatus, type Supplier, type Ticket, type Venue,
} from "@munasabati/core";
import {
  AppShell, Empty, ErrorBoundary, Icon, Media, Segmented, Sheet, StatusPill, Thread, TicketStatusPill, ToastProvider, TOPICS, AdminLogin, apply, isCloud, repo, useDB, useToast,
} from "@munasabati/ui";
import { BookingAdmin, Clients } from "./clients";
import { LiveBadge, LiveFeed, LiveToasts, useLive, type LiveEvent } from "./live";

/*
  لوحة إدارة مناسبتي (مخفية، بدون روابط من أي تطبيق).
  وضع التجربة: رمز دخول. وضع الإنتاج: تعتمد على صلاحية admin في قاعدة البيانات (سياسات RLS).
*/
const CODE = (import.meta.env.VITE_ADMIN_CODE as string | undefined) ?? "munasabati-admin";
const KEY = "mns.admin.ok";
const ago = (t: number) => { const m = Math.round((Date.now() - t) / 6e4); return m < 60 ? `قبل ${Math.max(1, m)} د` : m < 1440 ? `قبل ${Math.round(m / 60)} س` : `قبل ${Math.round(m / 1440)} يوم`; };

function Gate({ onOk }: { onOk: () => void }) {
  const [c, setC] = useState("");
  const [err, setErr] = useState(false);
  // قاعدة البيانات الحقيقية: دخول بحساب الإدارة (صلاحية admin في جدول profiles)
  if (isCloud) return (
    <div className="adm-gate">
      <div className="card stack adm-gate-card">
        <span className="avatar" style={{ width: 52, height: 52 }}><Icon name="ShieldCheck" size={24} /></span>
        <div><h1 style={{ fontSize: 24, fontWeight: 800 }}>إدارة مناسبتي</h1><p className="muted">منطقة خاصة بإدارة المنصة.</p></div>
        <AdminLogin onDone={onOk} />
      </div>
    </div>
  );
  return (
    <div className="adm-gate">
      <form className="card stack adm-gate-card" onSubmit={(e) => { e.preventDefault(); if (c === CODE) { try { sessionStorage.setItem(KEY, "1"); } catch { /* */ } onOk(); } else setErr(true); }}>
        <span className="avatar" style={{ width: 52, height: 52 }}><Icon name="ShieldCheck" size={24} /></span>
        <div><h1 style={{ fontSize: 24, fontWeight: 800 }}>إدارة مناسبتي</h1><p className="muted">منطقة خاصة بإدارة المنصة.</p></div>
        <div className="field"><label htmlFor="ac">رمز الدخول</label><input id="ac" type="password" className="input" autoFocus value={c} onChange={(e) => { setC(e.target.value); setErr(false); }} /></div>
        {err && <div className="pill bad" style={{ justifySelf: "start" }}>الرمز غير صحيح</div>}
        <button className="btn primary lg block" type="submit">دخول</button>
        {!isCloud && <p className="faint" style={{ fontSize: 12 }}>وضع التجربة. الرمز الافتراضي يُغيَّر عبر VITE_ADMIN_CODE عند النشر.</p>}
      </form>
    </div>
  );
}

/* ───── نظرة عامة ───── */
function Overview({ go, live }: { go: (t: string, id?: string) => void; live: LiveEvent[] }) {
  const db = useDB();
  const tickets = db.tickets ?? [];
  const stale = db.bookings.filter((b) => b.status === "new" && Date.now() - b.createdAt > 24 * 36e5);
  const openT = tickets.filter((t) => t.status === "open");
  const unverified = [...db.suppliers, ...db.venues].filter((x) => !x.verified && x.status !== "suspended");
  const urgent = tickets.filter((t) => t.urgent && t.status !== "closed");
  const cancels = db.bookings.filter((b) => b.cancelRequest);
  const day = Date.now() - 864e5;
  const morning: [string, number, string, string][] = [
    ["طلبات جديدة", db.bookings.filter((b) => !b.seed && b.createdAt > day).length, "CalendarPlus", "bookings"],
    ["من الخطة المقترحة", db.bookings.filter((b) => b.fromPlan && b.createdAt > day).length, "Sparkles", "bookings"],
    ["حجوزات مؤكدة", db.bookings.filter((b) => b.status === "confirmed" && !b.seed).length, "CheckCircle2", "bookings"],
    ["عملاء من الدعوات", adminClients(db).filter((c) => c.event?.source === "invite").length, "Send", "clients"],
  ];
  const feed = [
    ...db.bookings.map((b) => ({ at: b.createdAt, icon: "CalendarCheck", text: `طلب ${b.kind === "venue" ? "قاعة" : "مورد"} من ${b.clientName}`, go: () => go("bookings", b.id) })),
    ...tickets.map((t) => ({ at: t.updatedAt, icon: "LifeBuoy", text: `تذكرة: ${t.subject} · ${t.fromName}`, go: () => go("support", t.id) })),
  ].sort((a, b) => b.at - a.at).slice(0, 8);
  const tiles: [string, number, string, string][] = [
    ["العملاء", adminClients(db).length, "Users", "clients"],
    ["الطلبات", db.bookings.length, "CalendarCheck", "bookings"],
    ["الموردون", db.suppliers.length, "Store", "suppliers"],
    ["القاعات", db.venues.length, "Building2", "venues"],
    ["تذاكر مفتوحة", openT.length, "LifeBuoy", "support"],
  ];
  return (
    <>
      <div><span className="eyebrow">مركز التحكم</span><h1 className="page-title">نظرة عامة</h1></div>
      <section className="card">
        <div className="section-title"><h3>ملخص آخر ٢٤ ساعة</h3></div>
        <div className="adm-morning">{morning.map(([l, n, ic, t]) => <button key={l} onClick={() => go(t)}><Icon name={ic} size={16} /><b className="num">{n}</b><small>{l}</small></button>)}</div>
      </section>
      <LiveFeed feed={live} onOpen={(e) => go(e.tab, e.focus)} />
      <div className="stats">{tiles.map(([l, n, ic, t]) => <button key={l} className="card adm-tile" onClick={() => go(t)}><div className="stat-label"><Icon name={ic} size={15} /> {l}</div><div className="stat-value num">{n}</div></button>)}</div>
      <section className="card">
        <div className="section-title"><h3>يحتاج انتباهك</h3></div>
        <div className="list">
          {urgent.length > 0 && <button className="list-row adm-row adm-urgent" onClick={() => go("support", urgent[0].id)}><span className="avatar"><Icon name="ShieldAlert" size={18} /></span><div className="t"><b>{urgent.length} بلاغ طارئ من ليلة مناسبة</b><small>{urgent[0].subject}</small></div><Icon name="ChevronLeft" size={18} /></button>}
          {cancels.length > 0 && <button className="list-row adm-row" onClick={() => go("bookings", cancels[0].id)}><span className="avatar"><Icon name="CalendarX" size={18} /></span><div className="t"><b>{cancels.length} طلب إلغاء حجز مؤكد ينتظر قرارك</b><small>الحجز قائم لين توافق أو ترفض</small></div><Icon name="ChevronLeft" size={18} /></button>}
          {openT.length > 0 && <button className="list-row adm-row" onClick={() => go("support")}><span className="avatar"><Icon name="LifeBuoy" size={18} /></span><div className="t"><b>{openT.length} تذكرة دعم بانتظار ردك</b><small>أقدمها: {openT.at(-1)?.subject}</small></div><Icon name="ChevronLeft" size={18} /></button>}
          {stale.length > 0 && <button className="list-row adm-row" onClick={() => go("bookings")}><span className="avatar"><Icon name="Hourglass" size={18} /></span><div className="t"><b>{stale.length} طلب بدون رد من التاجر لأكثر من 24 ساعة</b><small>تواصل مع التجار أو أعد توجيه العملاء</small></div><Icon name="ChevronLeft" size={18} /></button>}
          {unverified.length > 0 && <button className="list-row adm-row" onClick={() => go("suppliers")}><span className="avatar"><Icon name="BadgeCheck" size={18} /></span><div className="t"><b>{unverified.length} حساب بانتظار التوثيق</b><small>راجع السجل التجاري ثم وثّق الحساب</small></div><Icon name="ChevronLeft" size={18} /></button>}
          {!openT.length && !stale.length && !unverified.length && !urgent.length && !cancels.length && <p className="muted">كل شي تحت السيطرة.</p>}
        </div>
      </section>
      <section className="card">
        <div className="section-title"><h3>آخر النشاط</h3></div>
        <div className="list">{feed.map((f, i) => <button key={i} className="list-row adm-row" onClick={f.go}><span className="avatar alt"><Icon name={f.icon} size={17} /></span><div className="t"><b>{f.text}</b><small>{ago(f.at)}</small></div></button>)}</div>
      </section>
    </>
  );
}

/* ───── الطلبات ───── */
function Bookings({ focus, go }: { focus?: string; go: (t: string, id?: string) => void }) {
  const db = useDB();
  const toast = useToast();
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(focus ?? null);
  const name = (b: Booking) => (b.kind === "venue" ? db.venues.find((v) => v.id === b.targetId)?.name : db.suppliers.find((s) => s.id === b.targetId)?.name) ?? "محذوف";
  const list = db.bookings.filter((b) => (status === "all" || b.status === status) && (!q || (b.clientName + name(b) + b.phone + b.city).includes(q))).sort((a, b) => b.createdAt - a.createdAt);
  const cur = db.bookings.find((b) => b.id === sel);
  return (
    <>
      <div><span className="eyebrow">كل الطلبات على المنصة</span><h1 className="page-title">الطلبات</h1></div>
      <div className="row wrap"><Segmented value={status} onChange={setStatus} options={[["all", "الكل"], ["new", "جديدة"], ["quoted", "عروض"], ["confirmed", "مؤكدة"], ["declined", "مرفوضة"]]} /><input className="input grow" style={{ minWidth: 200, width: "auto" }} placeholder="بحث: عميل، تاجر، جوال، مدينة" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" /></div>
      <section className="card" style={{ paddingBlock: 6 }}>
        {list.length ? <div className="list">{list.map((b) => (
          <button key={b.id} className="list-row adm-row" onClick={() => setSel(b.id)}>
            <span className="avatar"><Icon name={b.kind === "venue" ? "Building2" : "Store"} size={17} /></span>
            <div className="t"><b>{b.clientName} ← {name(b)}</b><small className="num">{OCCASIONS.find((o) => o.id === b.occasion)?.name} · {b.date} · {b.city} · {ago(b.createdAt)}</small></div>
            <StatusPill status={b.status} />
          </button>
        ))}</div> : <Empty icon="Inbox" title="لا توجد طلبات" />}
      </section>
      <Sheet open={!!cur} onClose={() => setSel(null)} title="تفاصيل الطلب">
        {cur && <div className="stack">
          <div className="adm-kv">
            <span>العميل</span><b>{cur.clientName}</b><span>الجوال</span><b className="num">{cur.phone}</b>
            <span>الجهة</span><b>{name(cur)}</b><span>المناسبة</span><b>{OCCASIONS.find((o) => o.id === cur.occasion)?.name}</b>
            <span>التاريخ</span><b className="num">{cur.date}</b><span>المدينة</span><b>{cur.city}</b>
            <span>الضيوف</span><b className="num">{fmt(cur.guests)}</b><span>ميزانية العميل</span><b className="num">{cur.budget ? sar(cur.budget) : "لم يحددها"}</b>
          </div>
          {cur.note && <div className="card flat tight" style={{ background: "var(--surface-2)" }}>{cur.note}</div>}
          <BookingAdmin b={cur} provider={name(cur)} onClient={() => go("clients", normPhone(cur.phone) || undefined)} />
          <Confirm label="حذف الطلب" onYes={() => { apply(adminDelete("booking", cur.id)); setSel(null); toast("تم حذف الطلب"); }} />
        </div>}
      </Sheet>
    </>
  );
}

function Confirm({ label, onYes }: { label: string; onYes: () => void }) {
  const [ask, setAsk] = useState(false);
  return ask
    ? <div className="row"><button className="btn grow adm-danger" onClick={onYes}>تأكيد: {label}</button><button className="btn ghost" onClick={() => setAsk(false)}>إلغاء</button></div>
    : <button className="btn ghost adm-danger-text" onClick={() => setAsk(true)}><Icon name="Trash2" size={16} /> {label}</button>;
}

/* ───── الحسابات (موردون وقاعات) ───── */
function Accounts({ kind, focus }: { kind: "supplier" | "venue"; focus?: string }) {
  const db = useDB();
  const toast = useToast();
  const items: (Supplier | Venue)[] = kind === "supplier" ? db.suppliers : db.venues;
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "unverified">("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(focus ?? null);
  const [edit, setEdit] = useState<{ name: string; city: string; about: string; phone: string } | null>(null);
  const list = items.filter((x) => (filter === "all" || (filter === "suspended" ? x.status === "suspended" : filter === "active" ? x.status !== "suspended" : !x.verified)) && (!q || (x.name + x.city).includes(q)));
  const cur = items.find((x) => x.id === sel);
  const count = (x: Supplier | Venue) => db.bookings.filter((b) => b.targetId === x.id).length;
  const save = () => {
    if (!cur || !edit) return;
    const patch = { ...edit, phone: normPhone(edit.phone) || undefined };
    if (kind === "supplier") apply(upsertSupplier({ ...(cur as Supplier), ...patch })); else apply(upsertVenue({ ...(cur as Venue), ...patch }));
    setEdit(null); toast("تم حفظ التعديل");
  };
  return (
    <>
      <div><span className="eyebrow">إدارة الحسابات</span><h1 className="page-title">{kind === "supplier" ? "الموردون" : "القاعات"}</h1></div>
      <div className="row wrap"><Segmented value={filter} onChange={setFilter} options={[["all", "الكل"], ["active", "نشط"], ["suspended", "معلّق"], ["unverified", "غير موثّق"]]} /><input className="input grow" style={{ minWidth: 200, width: "auto" }} placeholder="بحث بالاسم أو المدينة" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" /></div>
      <div className="grid-auto" style={{ ["--min" as string]: "280px" }}>
        {list.map((x) => (
          <button key={x.id} className="card adm-acc" onClick={() => setSel(x.id)}>
            <div className="adm-acc-art"><Media photos={x.photos} seed={x.id} hue={x.hue} kind={kind} /></div>
            <div className="stack" style={{ ["--gap" as string]: "6px", padding: "12px 14px 14px" }}>
              <div className="row between"><b className="display">{x.name}</b>{x.verified && <Icon name="BadgeCheck" size={17} className="brand" />}</div>
              <div className="row wrap" style={{ ["--gap" as string]: "6px" }}>
                <span className={"pill " + (x.status === "suspended" ? "bad" : "ok")}>{x.status === "suspended" ? "معلّق" : "نشط"}</span>
                <span className="tag">{x.city}</span><span className="tag num">{count(x)} طلب</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {!list.length && <Empty icon="Search" title="لا توجد حسابات بهذا الفلتر" />}
      <Sheet open={!!cur} onClose={() => { setSel(null); setEdit(null); }} title={cur?.name ?? ""}>
        {cur && (edit ? (
          <form className="form" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div className="field"><label htmlFor="ed-n">الاسم</label><input id="ed-n" className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="ed-c">المدينة</label><select id="ed-c" className="select" value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label htmlFor="ed-p">جوال التاجر (لإبلاغه بالطلبات على واتساب)</label><input id="ed-p" className="input num" dir="ltr" style={{ textAlign: "right" }} inputMode="tel" placeholder="05xxxxxxxx" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
            <div className="field"><label htmlFor="ed-a">النبذة</label><textarea id="ed-a" className="input" rows={5} value={edit.about} onChange={(e) => setEdit({ ...edit, about: e.target.value })} /></div>
            <div className="row"><button className="btn primary grow" type="submit">حفظ</button><button className="btn ghost" type="button" onClick={() => setEdit(null)}>إلغاء</button></div>
          </form>
        ) : (
          <div className="stack">
            <div className="adm-kv">
              <span>الحالة</span><b>{cur.status === "suspended" ? "معلّق" : "نشط"}</b>
              <span>التوثيق</span><b>{cur.verified ? "موثّق" : "غير موثّق"}</b>
              <span>المدينة</span><b>{cur.city}</b>
              <span>الطلبات</span><b className="num">{count(cur)}</b>
              {kind === "supplier" && <><span>الخدمات</span><b>{(cur as Supplier).cats.map((c) => CATEGORIES.find((k) => k.id === c)?.short).join("، ")}</b></>}
              {kind === "venue" && <><span>القاعات</span><b>{(cur as Venue).halls.map((h) => h.name).join("، ")}</b></>}
              {cur.phone && <><span>الجوال</span><b className="num">{cur.phone}</b></>}
            </div>
            <p className="muted" style={{ fontSize: 14 }}>{cur.about}</p>
            <div className="adm-actions">
              <button className="btn" onClick={() => { apply(adminSetVerified(kind, cur.id, !cur.verified)); toast(cur.verified ? "تم إلغاء التوثيق" : "تم توثيق الحساب"); }}><Icon name="BadgeCheck" size={16} /> {cur.verified ? "إلغاء التوثيق" : "توثيق الحساب"}</button>
              <button className="btn" onClick={() => { apply(adminSetStatus(kind, cur.id, cur.status === "suspended" ? "active" : "suspended")); toast(cur.status === "suspended" ? "تم تفعيل الحساب" : "تم تعليق الحساب"); }}><Icon name={cur.status === "suspended" ? "PlayCircle" : "PauseCircle"} size={16} /> {cur.status === "suspended" ? "تفعيل الحساب" : "تعليق الحساب"}</button>
              <button className="btn" onClick={() => setEdit({ name: cur.name, city: cur.city, about: cur.about, phone: cur.phone ?? "" })}><Icon name="Pencil" size={16} /> تعديل البيانات</button>
              <button className={"btn" + (cur.promoted ? " primary" : "")} onClick={() => { apply(setPromoted(kind, cur.id, !cur.promoted)); toast(cur.promoted ? "ألغينا الاختيار" : "صار الحساب مختاراً من مناسبتي"); }}><Icon name="Sparkles" size={16} /> {cur.promoted ? "إلغاء «مختار من مناسبتي»" : "اختيار «مختار من مناسبتي»"}</button>
            </div>
            {(() => { const t = trustOf(db, kind, cur.id); return <div className="row wrap" style={{ ["--gap" as string]: "6px" }}>{t.fast && <span className="pill ok">يرد بسرعة</span>}{t.committed && <span className="pill ok">ملتزم</span>}{t.cancels > 0 && <span className="pill warn">{t.cancels} طلب إلغاء</span>}</div>; })()}
            <Confirm label="حذف الحساب وطلباته" onYes={() => { apply(adminDelete(kind, cur.id)); setSel(null); toast("تم حذف الحساب"); }} />
          </div>
        ))}
      </Sheet>
    </>
  );
}

/* ───── الدعم ───── */
function Support({ focus }: { focus?: string }) {
  const db = useDB();
  const tickets = db.tickets ?? [];
  const [status, setStatus] = useState<"all" | Ticket["status"]>("open");
  const [from, setFrom] = useState<"all" | Ticket["from"]>("all");
  const [sel, setSel] = useState<string | null>(focus ?? null);
  const [reply, setReply] = useState("");
  const list = tickets.filter((t) => (status === "all" || t.status === status) && (from === "all" || t.from === from)).sort((a, b) => b.updatedAt - a.updatedAt);
  const cur = tickets.find((t) => t.id === sel);
  const FROM: Record<Ticket["from"], string> = { client: "عميل", supplier: "مورد", venue: "قاعة" };
  return (
    <>
      <div><span className="eyebrow">تذاكر العملاء والتجار</span><h1 className="page-title">الدعم</h1></div>
      <div className="row wrap">
        <Segmented value={status} onChange={setStatus} options={[["open", "بانتظار الرد"], ["answered", "تم الرد"], ["closed", "مغلقة"], ["all", "الكل"]]} />
        <Segmented value={from} onChange={setFrom} options={[["all", "الجميع"], ["client", "العملاء"], ["supplier", "الموردون"], ["venue", "القاعات"]]} />
      </div>
      <section className="card" style={{ paddingBlock: 6 }}>
        {list.length ? <div className="list">{list.map((t) => (
          <button key={t.id} className="list-row adm-row" onClick={() => setSel(t.id)}>
            <span className="avatar"><Icon name={TOPICS.find((x) => x[0] === t.topic)?.[2] ?? "MessageCircle"} size={17} /></span>
            <div className="t"><b>{t.subject}</b><small>{FROM[t.from]}: {t.fromName} · {ago(t.updatedAt)}</small></div>
            <TicketStatusPill s={t.status} />
          </button>
        ))}</div> : <Empty icon="LifeBuoy" title="لا توجد تذاكر هنا" />}
      </section>
      <Sheet open={!!cur} onClose={() => setSel(null)} title={cur?.subject ?? ""}>
        {cur && <div className="chat-wrap">
          <div className="row between wrap"><span className="muted">{FROM[cur.from]}: <b style={{ color: "var(--ink)" }}>{cur.fromName}</b> · {TOPICS.find((x) => x[0] === cur.topic)?.[1]}</span><TicketStatusPill s={cur.status} /></div>
          <Thread items={cur.messages.map((m) => ({ mine: m.from === "admin", text: m.text, at: m.at, who: m.from === "admin" ? "أنت (الإدارة)" : cur.fromName }))} />
          <div className="chips wrap">{["تم استلام طلبك، نتابع معك خلال ساعات.", "تم حل المشكلة، شكراً لصبرك.", "نحتاج رقم الطلب أو صورة للمشكلة."].map((r) => <button key={r} className="chip" onClick={() => setReply(r)}>{r}</button>)}</div>
          <form className="composer" onSubmit={(e) => { e.preventDefault(); if (reply.trim()) { apply(replyTicket(cur.id, "admin", reply.trim())); setReply(""); } }}>
            <label className="sr" htmlFor="rp">الرد</label>
            <input id="rp" className="input" placeholder="اكتب ردك" value={reply} onChange={(e) => setReply(e.target.value)} />
            <button className="icon-btn send" type="submit" aria-label="إرسال" disabled={!reply.trim()}><Icon name="SendHorizontal" size={18} /></button>
          </form>
          <button className="btn ghost" onClick={() => apply(setTicketStatus(cur.id, cur.status === "closed" ? "open" : "closed"))}>{cur.status === "closed" ? "إعادة فتح" : "إغلاق التذكرة"}</button>
        </div>}
      </Sheet>
    </>
  );
}

/* ───── الإعدادات ───── */
function Settings() {
  const db = useDB();
  const toast = useToast();
  const [text, setText] = useState(db.announcement ?? "");
  return (
    <>
      <div><span className="eyebrow">التحكم بالمنصة</span><h1 className="page-title">الإعدادات</h1></div>
      <section className="card form">
        <h3 className="card-title">إعلان عام</h3>
        <p className="muted" style={{ fontSize: 14 }}>يظهر أعلى تطبيق العميل وبوابتي الموردين والقاعات.</p>
        <label className="sr" htmlFor="an">نص الإعلان</label>
        <textarea id="an" className="input" placeholder="مثال: صيانة مجدولة الليلة من 2 إلى 3 صباحاً" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="row"><button className="btn primary" onClick={() => { apply(setAnnouncement(text)); toast(text.trim() ? "تم نشر الإعلان" : "تم إخفاء الإعلان"); }}>نشر</button>{db.announcement && <button className="btn ghost" onClick={() => { setText(""); apply(setAnnouncement("")); toast("تم إخفاء الإعلان"); }}>إخفاء الإعلان</button>}</div>
      </section>
      <section className="card stack">
        <h3 className="card-title">صلاحيات الإنتاج</h3>
        <p className="muted" style={{ fontSize: 14 }}>عند ربط Supabase تُطبَّق صلاحيات الإدارة من قاعدة البيانات: أي حساب بدور <b>admin</b> في جدول profiles يقدر يعلّق ويحذف ويعدّل كل الحسابات والطلبات (راجع supabase/schema.sql).</p>
      </section>
    </>
  );
}

/* ───── لوحة الأوامر Ctrl+K ───── */
function Palette({ open, onClose, go }: { open: boolean; onClose: () => void; go: (t: string, id?: string) => void }) {
  const db = useDB();
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setQ(""); }, [open]);
  const results = useMemo(() => {
    const all = [
      ...db.suppliers.map((x) => ({ t: "suppliers", id: x.id, label: x.name, sub: "مورد · " + x.city, icon: "Store" })),
      ...db.venues.map((x) => ({ t: "venues", id: x.id, label: x.name, sub: "قاعة · " + x.city, icon: "Building2" })),
      ...db.bookings.map((b) => ({ t: "bookings", id: b.id, label: b.clientName, sub: "طلب · " + b.date, icon: "CalendarCheck" })),
      ...(db.tickets ?? []).map((k) => ({ t: "support", id: k.id, label: k.subject, sub: "تذكرة · " + k.fromName, icon: "LifeBuoy" })),
    ];
    return (q ? all.filter((r) => (r.label + r.sub).includes(q)) : all).slice(0, 8);
  }, [db, q]);
  return (
    <AnimatePresence>
      {open && <>
        <motion.div className="sheet-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div className="palette" initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} role="dialog" aria-label="بحث سريع">
          <div className="palette-in"><Icon name="Search" size={18} /><input autoFocus placeholder="ابحث عن حساب أو طلب أو تذكرة…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "Enter" && results[0]) { go(results[0].t, results[0].id); onClose(); } }} aria-label="بحث" /><kbd>Esc</kbd></div>
          <div className="list">{results.map((r) => <button key={r.t + r.id} className="list-row adm-row" onClick={() => { go(r.t, r.id); onClose(); }}><span className="avatar alt"><Icon name={r.icon} size={16} /></span><div className="t"><b>{r.label}</b><small>{r.sub}</small></div></button>)}</div>
        </motion.div>
      </>}
    </AnimatePresence>
  );
}

function Panel() {
  const db = useDB();
  const [tab, setTab] = useState("overview");
  const [focus, setFocus] = useState<string | undefined>();
  const [pal, setPal] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal(true); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const go = (t: string, id?: string) => { setFocus(id); setTab(t); window.scrollTo({ top: 0 }); };
  const live = useLive(db);
  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: "LayoutDashboard" },
    { id: "bookings", label: "الطلبات", icon: "CalendarCheck", count: db.bookings.filter((b) => b.status === "new").length },
    { id: "clients", label: "العملاء", icon: "Users" },
    { id: "support", label: "الدعم", icon: "LifeBuoy", count: (db.tickets ?? []).filter((t) => t.status === "open").length },
    { id: "suppliers", label: "الموردون", icon: "Store" },
    { id: "venues", label: "القاعات", icon: "Building2" },
    { id: "settings", label: "الإعدادات", icon: "Settings" },
  ];
  return (
    <AppShell portal="الإدارة" tabs={tabs} active={tab} onChange={(t) => go(t)}
      actions={<><LiveBadge sound={live.sound} setSound={live.setSound} /><button className="btn sm ghost" onClick={() => setPal(true)}><Icon name="Search" size={15} /> بحث <kbd className="kbd">Ctrl K</kbd></button></>}
      footer={<button className="btn sm ghost" onClick={() => { try { sessionStorage.removeItem(KEY); } catch { /* */ } if (isCloud) void repo.auth?.signOut().then(() => location.reload()); else location.reload(); }}><Icon name="LogOut" size={15} /> خروج</button>}>
      <AnimatePresence mode="wait">
        <motion.div key={tab + (focus ?? "")} className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === "overview" && <Overview go={go} live={live.feed} />}
          {tab === "bookings" && <Bookings focus={focus} go={go} />}
          {tab === "clients" && <Clients focus={focus} go={go} />}
          {tab === "support" && <Support focus={focus} />}
          {tab === "suppliers" && <Accounts kind="supplier" focus={focus} />}
          {tab === "venues" && <Accounts kind="venue" focus={focus} />}
          {tab === "settings" && <Settings />}
        </motion.div>
      </AnimatePresence>
      <Palette open={pal} onClose={() => setPal(false)} go={go} />
      <LiveToasts items={live.toasts} onOpen={(e) => go(e.tab, e.focus)} onClose={live.dismiss} />
    </AppShell>
  );
}

function Main() {
  useDB();
  const [ok, setOk] = useState(() => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } });
  const allowed = isCloud ? repo.auth?.user()?.role === "admin" && !repo.auth?.needsNewPassword() : ok;
  return allowed ? <Panel /> : <Gate onOk={() => setOk(true)} />;
}

export default function App() { return <ErrorBoundary><ToastProvider><Main /></ToastProvider></ErrorBoundary>; }
