import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { OCCASIONS, bookingMessage, fmt, isoDay, requestCancel, sar, setBookingStatus, setVendorStatus, type Booking } from "@munasabati/core";
import { Icon } from "./icons";
import { Counter, Empty, Segmented, Sheet, StatusPill, useToast } from "./components";
import { MeshGradient } from "./MeshGradient";
import { photoUrl } from "./media";
import { BookingChat } from "./support";
import { apply, repo, resizeImage } from "./data";

/* مكونات مشتركة بين بوابة الموردين وبوابة القاعات */

export function RevenueChart({ bookings }: { bookings: Booking[] }) {
  const data = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, k) => {
      const i = k - 3; // 3 أشهر ماضية + الحالي + شهرين قادمة
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = isoDay(d).slice(0, 7);
      const v = bookings.filter((b) => b.status === "confirmed" && b.date.slice(0, 7) === key).reduce((s, b) => s + (b.quote ?? b.estimate), 0);
      return { l: d.toLocaleDateString("ar-SA-u-ca-gregory", { month: "short" }), v, now: i === 0 };
    });
  }, [bookings]);
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, alignItems: "end", height: 180 }} role="img" aria-label="الإيرادات المؤكدة حسب الشهر">
      {data.map((d, i) => (
        <div key={i} style={{ display: "grid", gap: 6, justifyItems: "center", height: "100%", alignContent: "end" }}>
          <span className="num faint" style={{ fontSize: 11 }}>{d.v ? `${fmt(d.v / 1000)}k` : ""}</span>
          <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (d.v / max) * 120)}px` }} transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }} style={{ width: "100%", maxWidth: 46, borderRadius: 12, background: d.now ? "var(--brand)" : "color-mix(in srgb, var(--brand) 28%, var(--bg-2))" }} />
          <span style={{ fontSize: 12, color: d.now ? "var(--ink)" : "var(--muted)", fontWeight: d.now ? 700 : 500 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}

export function KPIs({ bookings }: { bookings: Booking[] }) {
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const revenue = confirmed.reduce((s, b) => s + (b.quote ?? b.estimate), 0);
  const conv = bookings.length ? Math.round((confirmed.length / bookings.length) * 100) : 0;
  return (
    <div className="stats">
      <div className="card"><div className="stat-label"><Icon name="Inbox" size={15} /> طلبات جديدة</div><div className="stat-value brand"><Counter value={bookings.filter((b) => b.status === "new").length} /></div><div className="stat-sub">بانتظار ردك</div></div>
      <div className="card"><div className="stat-label"><Icon name="CalendarCheck" size={15} /> مؤكدة</div><div className="stat-value"><Counter value={confirmed.length} /></div><div className="stat-sub num">تحويل {conv}%</div></div>
      <div className="card"><div className="stat-label"><Icon name="Coins" size={15} /> الإيرادات المؤكدة</div><div className="stat-value"><Counter value={revenue} /></div><div className="stat-sub">ريال سعودي</div></div>
      <div className="card"><div className="stat-label"><Icon name="Receipt" size={15} /> متوسط الحجز</div><div className="stat-value"><Counter value={confirmed.length ? revenue / confirmed.length : 0} /></div><div className="stat-sub">ريال سعودي</div></div>
    </div>
  );
}

const ago = (t: number) => { const m = Math.round((Date.now() - t) / 6e4); return m < 60 ? `قبل ${Math.max(1, m)} د` : m < 1440 ? `قبل ${Math.round(m / 60)} س` : `قبل ${Math.round(m / 1440)} يوم`; };

export function Inbox({ bookings, defaultQuote, describe, quoteTemplate }: {
  bookings: Booking[]; defaultQuote: (b: Booking) => number; describe?: (b: Booking) => ReactNode; quoteTemplate: (b: Booking) => string;
}) {
  const toast = useToast();
  const [filter, setFilter] = useState<"new" | "quoted" | "confirmed" | "declined" | "all">("new");
  const [quoting, setQuoting] = useState<Booking | null>(null);
  const [q, setQ] = useState({ amount: 0, msg: "" });
  const list = bookings.filter((b) => filter === "all" || b.status === filter).sort((a, b) => b.createdAt - a.createdAt);
  const c = (s: string) => bookings.filter((b) => b.status === s).length;
  return (
    <>
      <div className="row between wrap"><div><h1 className="page-title">الطلبات</h1><p className="page-sub">ردّك السريع يرفع ترتيبك في نتائج البحث.</p></div></div>
      <Segmented value={filter} onChange={setFilter} label="تصفية" options={[["new", `جديدة ${c("new")}`], ["quoted", `عروض ${c("quoted")}`], ["confirmed", `مؤكدة ${c("confirmed")}`], ["declined", "مرفوضة"], ["all", "الكل"]]} />
      {!list.length && <section className="card"><Empty icon="Inbox" title="لا توجد طلبات هنا" /></section>}
      <div className="stack">
        {list.map((b) => (
          <motion.section key={b.id} layout className="card stack" style={{ ["--gap" as string]: "12px" }}>
            <div className="row">
              <span className="avatar">{b.clientName[0]}</span>
              <div className="grow"><b className="display" style={{ display: "block" }}>{b.clientName}</b><small className="muted">{ago(b.createdAt)}{b.fromPlan ? " · من خطة العميل المقترحة" : b.fromClient ? " · من تطبيق العميل" : ""}{b.reassignedFrom ? " · محوّل من الإدارة" : ""}</small></div>
              <StatusPill status={b.status} />
            </div>
            <div className="row wrap muted num" style={{ fontSize: 13, ["--gap" as string]: "14px" }}>
              <span className="row" style={{ ["--gap" as string]: "5px" }}><Icon name="PartyPopper" size={14} />{OCCASIONS.find((o) => o.id === b.occasion)?.name}</span>
              <span className="row" style={{ ["--gap" as string]: "5px" }}><Icon name="CalendarDays" size={14} />{b.date}</span>
              <span className="row" style={{ ["--gap" as string]: "5px" }}><Icon name="Users" size={14} />{fmt(b.guests)} ضيف</span>
              <span className="row" style={{ ["--gap" as string]: "5px" }}><Icon name="Phone" size={14} />{b.phone}</span>
              {describe?.(b)}
            </div>
            {b.budget ? <div className="client-budget"><Icon name="Wallet" size={16} /><span>ميزانية العميل لهذا البند</span><b className="num">{sar(b.budget)}</b></div> : null}
            {b.note && <div className="card flat tight" style={{ background: "var(--surface-2)", fontSize: 14 }}>{b.note}</div>}
            <div className="row"><BookingChat booking={b} me="provider" other={b.clientName} /></div>
            {b.status === "new" && <div className="row wrap">
              <button className="btn primary sm" onClick={() => { setQ({ amount: defaultQuote(b), msg: quoteTemplate(b) }); setQuoting(b); }}><Icon name="Send" size={15} /> أرسل عرض سعر</button>
              <button className="btn sm" onClick={() => { apply(setBookingStatus(b.id, "confirmed", { quote: defaultQuote(b), message: { from: "provider", text: "تم تأكيد الحجز" } })); toast("تم تأكيد الحجز"); }}>تأكيد مباشر</button>
              <button className="btn sm ghost" onClick={() => apply(setBookingStatus(b.id, "declined", { message: { from: "provider", text: "نعتذر، اليوم غير متاح" } }))}>اعتذار</button>
            </div>}
            {b.status === "quoted" && <div className="row wrap"><span className="grow muted">عرضك: <b className="num display" style={{ color: "var(--ink)" }}>{sar(b.quote ?? 0)}</b> · بانتظار العميل</span><button className="btn sm" onClick={() => { apply(setBookingStatus(b.id, "confirmed")); toast("تم تأكيد الحجز"); }}>العميل وافق هاتفياً</button></div>}
            {b.status === "confirmed" && <div className="muted">قيمة الحجز: <b className="num display" style={{ color: "var(--ink)" }}>{sar(b.quote ?? b.estimate)}</b></div>}
            {b.status === "confirmed" && b.rating && <div className="pill ok" style={{ justifySelf: "start" }}>تقييم العميل لليلة: {"★".repeat(b.rating.stars)}</div>}
            {b.status === "confirmed" && !b.rating && <ConfirmedTools b={b} />}
          </motion.section>
        ))}
      </div>
      <Sheet open={!!quoting} onClose={() => setQuoting(null)} title={quoting ? `عرض سعر لـ ${quoting.clientName}` : ""}>
        <form className="form" onSubmit={(e) => { e.preventDefault(); if (!quoting || !(q.amount > 0)) return; apply(setBookingStatus(quoting.id, "quoted", { quote: q.amount, message: { from: "provider", text: q.msg } })); setQuoting(null); toast("وصل العرض للعميل"); }}>
          <div className="field"><label htmlFor="q-a">المبلغ (ر.س)</label><input id="q-a" type="number" min={1} required className="input num" style={{ fontSize: 22, fontWeight: 700 }} value={q.amount || ""} placeholder="اكتب السعر" onChange={(e) => setQ({ ...q, amount: +e.target.value })} /></div>
          <div className="faint num" style={{ fontSize: 13 }}>شامل ضريبة القيمة المضافة 15%: {sar(q.amount * 1.15)}</div>
          <div className="field"><label htmlFor="q-m">رسالة للعميل</label><textarea id="q-m" className="input" rows={4} value={q.msg} onChange={(e) => setQ({ ...q, msg: e.target.value })} /></div>
          <button className="btn primary lg block" type="submit" disabled={!(q.amount > 0)}>إرسال العرض</button>
        </form>
      </Sheet>
    </>
  );
}

/** تقويم شهري للحجوزات، مع إمكانية إغلاق أيام (للقاعات) */
export function MonthBoard({ bookings, blocked = [], onToggleBlock, label }: { bookings: Booking[]; blocked?: string[]; onToggleBlock?: (iso: string) => void; label?: (b: Booking) => string }) {
  const [offset, setOffset] = useState(0);
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + offset);
  const y = base.getFullYear(), m = base.getMonth();
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  const t = isoDay(new Date());
  const by: Record<string, Booking[]> = {};
  bookings.filter((b) => b.status !== "declined").forEach((b) => { (by[b.date] ||= []).push(b); });
  return (
    <section className="card">
      <div className="cal-head" style={{ marginBottom: 14 }}>
        <button className="icon-btn sm" onClick={() => setOffset((o) => o - 1)} aria-label="الشهر السابق"><Icon name="ChevronRight" size={16} /></button>
        <b className="display">{base.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { month: "long", year: "numeric" })}</b>
        <button className="icon-btn sm" onClick={() => setOffset((o) => o + 1)} aria-label="الشهر التالي"><Icon name="ChevronLeft" size={16} /></button>
      </div>
      <div className="month-board">
        {["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"].map((d) => <div key={d} className="mh">{d}</div>)}
        {Array.from({ length: first }, (_, i) => <div key={"b" + i} />)}
        {Array.from({ length: days }, (_, i) => {
          const iso = isoDay(new Date(Date.UTC(y, m, i + 1)));
          const isBlocked = blocked.includes(iso);
          const evs = by[iso] ?? [];
          return (
            <button key={iso} className={"md" + (iso === t ? " today" : "") + (isBlocked ? " blocked" : "")} onClick={() => onToggleBlock && iso >= t && !evs.some((e) => e.status === "confirmed") && onToggleBlock(iso)} disabled={!onToggleBlock} aria-label={`${iso}${isBlocked ? " مغلق" : ""}`}>
              <span className="num">{i + 1}</span>
              {isBlocked && <span className="ev off">مغلق</span>}
              {evs.map((e) => <span key={e.id} className={"ev" + (e.status === "confirmed" ? "" : " pend")}>{label ? label(e) : e.clientName.split(" ")[0]}</span>)}
            </button>
          );
        })}
      </div>
      <div className="row wrap" style={{ ["--gap" as string]: "14px", fontSize: 12.5, marginTop: 14 }}>
        <span className="row" style={{ ["--gap" as string]: "5px" }}><i className="lg-dot" style={{ background: "var(--brand)" }} />مؤكد</span>
        <span className="row" style={{ ["--gap" as string]: "5px" }}><i className="lg-dot" style={{ background: "var(--warn)" }} />قيد الانتظار</span>
        {onToggleBlock && <span className="row" style={{ ["--gap" as string]: "5px" }}><i className="lg-dot" style={{ background: "var(--faint)" }} />مغلق (اضغط اليوم للإغلاق أو الفتح)</span>}
      </div>
    </section>
  );
}

/** حالة التاجر يوم المناسبة وطلب الإلغاء (يمر بالإدارة) */
const VSTEPS: [NonNullable<Booking["vendorStatus"]>, string, string][] = [["onway", "طلعنا", "Truck"], ["arrived", "وصلنا", "MapPin"], ["setup", "نركّب", "Wrench"], ["ready", "جاهز", "CheckCircle2"]];
export function ConfirmedTools({ b }: { b: Booking }) {
  const toast = useToast();
  const [cancel, setCancel] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <div className="stack" style={{ ["--gap" as string]: "10px" }}>
      {b.kind === "venue" ? (
        // القاعة جاهزة أصلاً: ما فيه «طلعنا/وصلنا»، بس رسالة للعميل إن القاعة جاهزة لاستقبالهم
        b.vendorStatus === "ready"
          ? <div className="row" style={{ ["--gap" as string]: "8px", color: "var(--ok)", fontSize: 14 }}><Icon name="CheckCircle2" size={17} /> بلّغت العميل إن القاعة جاهزة</div>
          : <button className="btn sm primary" style={{ justifySelf: "start" }} onClick={() => { apply(setVendorStatus(b.id, "ready")); apply(bookingMessage(b.id, "provider", "القاعة جاهزة لاستقبالكم، حياكم الله ✨")); toast("وصلت رسالة «القاعة جاهزة» للعميل"); }}><Icon name="Send" size={15} /> أرسل للعميل: القاعة جاهزة</button>
      ) : <div className="field"><span className="label">حالتك يوم المناسبة (يشوفها العميل لحظياً)</span>
        <div className="vstat">{VSTEPS.map(([k, l, ic]) => <button key={k} className={b.vendorStatus === k ? "on" : ""} aria-pressed={b.vendorStatus === k} onClick={() => { apply(setVendorStatus(b.id, k)); toast(`تم: ${l}`); }}><Icon name={ic} size={16} />{l}</button>)}</div>
      </div>}
      {b.cancelRequest ? <div className="card flat tight" style={{ background: "var(--surface-2)", fontSize: 14 }}><b>طلب الإلغاء عند الإدارة</b><div className="muted">الحجز قائم لين قرار الإدارة. السبب: {b.cancelRequest.reason}</div></div>
        : cancel ? <form className="row wrap" onSubmit={(e) => { e.preventDefault(); if (reason.trim().length < 3) return; apply(requestCancel(b.id, reason.trim())); setCancel(false); toast("أرسلنا طلب الإلغاء للإدارة"); }}>
          <label className="sr" htmlFor={"cr" + b.id}>سبب الإلغاء</label>
          <input id={"cr" + b.id} className="input grow" style={{ minWidth: 180, width: "auto" }} placeholder="سبب الإلغاء (يصل للإدارة)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button className="btn sm" type="submit">إرسال</button><button className="btn sm ghost" type="button" onClick={() => setCancel(false)}>تراجع</button>
        </form>
        : <button className="btn sm ghost" style={{ justifySelf: "start" }} onClick={() => setCancel(true)}>طلب إلغاء الحجز</button>}
    </div>
  );
}

/** شاشة الدخول للبوابات: هوية بصرية حية ونموذج تسجيل */
export function Gate({ palette, eyebrow, title, lead, features, children }: { palette: [string, string, string, string]; eyebrow: string; title: ReactNode; lead: string; features: [string, string, string][]; children: ReactNode }) {
  return (
    <div className="gate">
      <div className="gate-art">
        <MeshGradient palette={palette} />
        <div className="gate-art-in">
          <div className="row" style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 20 }}>مناسبتي</div>
          <div className="stack" style={{ ["--gap" as string]: "16px" }}>
            <span className="live-pill">{eyebrow}</span>
            <h1 className="gate-title">{title}</h1>
            <p style={{ opacity: 0.88, fontSize: 16.5, maxWidth: "40ch" }}>{lead}</p>
          </div>
          <div className="gate-feats">{features.map(([ic, t, d]) => <div key={t} className="gate-feat"><Icon name={ic} size={19} /><div><b>{t}</b><small>{d}</small></div></div>)}</div>
        </div>
      </div>
      <div className="gate-form"><div className="gate-form-in">{children}</div></div>
    </div>
  );
}

/** إدارة صور النشاط: رفع، حذف، واختيار صورة الغلاف */
export function PhotoManager({ photos = [], onChange, max = 8 }: { photos?: string[]; onChange: (p: string[]) => void; max?: number }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const room = Math.max(0, max - photos.length);
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, room)) urls.push(await repo.uploadPhoto(await resizeImage(f, repo.mode === "local" ? 1000 : 1600, repo.mode === "local" ? 0.72 : 0.84)));
      onChange([...photos, ...urls]);
      const err = repo.error();
      toast(err ?? `تمت إضافة ${urls.length} صورة`);
    } catch (e) { toast((e as Error).message || "تعذّر رفع الصورة"); } finally { setBusy(false); }
  };
  return (
    <div className="stack" style={{ ["--gap" as string]: "12px" }}>
      <div className="row between"><span className="label">صور النشاط ({photos.length}/{max}) · الصورة الأولى هي الغلاف</span></div>
      <div className="photo-grid">
        {photos.map((p, i) => (
          <div key={p.slice(-40) + i} className="photo-cell">
            <img src={photoUrl(p, true)} alt={`صورة ${i + 1}`} />
            {i === 0 && <span className="pill" style={{ position: "absolute", top: 8, right: 8, background: "#fff", color: "#121016" }}>الغلاف</span>}
            <div className="photo-acts">
              {i > 0 && <button type="button" className="icon-btn sm" aria-label="اجعلها الغلاف" onClick={() => onChange([p, ...photos.filter((_, k) => k !== i)])}><Icon name="Star" size={15} /></button>}
              <button type="button" className="icon-btn sm" aria-label="حذف الصورة" onClick={() => onChange(photos.filter((_, k) => k !== i))}><Icon name="Trash2" size={15} /></button>
            </div>
          </div>
        ))}
        {photos.length < max && (
          <label className="photo-add" aria-busy={busy}>
            <input type="file" accept="image/*" multiple className="sr" onChange={(e) => { void add(e.target.files); e.target.value = ""; }} disabled={busy} />
            <Icon name={busy ? "Loader" : "ImagePlus"} size={26} />
            <span>{busy ? "جاري الرفع…" : "أضف صور"}</span>
          </label>
        )}
      </div>
    </div>
  );
}

/** الخطوة التالية للتاجر: إجراء واحد واضح أعلى اللوحة (أول شرط متحقق بالترتيب) */
export interface ActionItem { when: boolean; icon: string; title: string; sub: string; cta: string; go: () => void; tone?: "brand" | "info" | "ok" }
export function NextAction({ items }: { items: ActionItem[] }) {
  const a = items.find((x) => x.when);
  if (!a) return (
    <section className="next-action ok">
      <span className="na-ico"><Icon name="CheckCircle2" size={22} /></span>
      <div className="grow"><span className="eyebrow">كل شي تمام</span><b>ما عندك شي يحتاج تصرّف الآن</b><small>بنبلغك أول ما يوصلك طلب جديد.</small></div>
    </section>
  );
  return (
    <motion.section key={a.title} className={"next-action " + (a.tone ?? "brand")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="na-ico"><Icon name={a.icon} size={22} /></span>
      <div className="grow"><span className="eyebrow">الخطوة التالية</span><b>{a.title}</b><small>{a.sub}</small></div>
      <button className="btn primary" onClick={a.go}>{a.cta} <Icon name="ArrowLeft" size={16} /></button>
    </motion.section>
  );
}

/* ───── تنبيه التاجر وصاحب القاعة لحظياً: طلب جديد من الإدارة أو رسالة جديدة (صوت + إشعار + عدّاد على التبويب) ───── */
let alertCtx: AudioContext | null = null;
export function ding() {
  try {
    const W = window as unknown as { webkitAudioContext?: typeof AudioContext };
    alertCtx ??= new (window.AudioContext || W.webkitAudioContext!)();
    if (alertCtx.state === "suspended") void alertCtx.resume();
    const t = alertCtx.currentTime + 0.02;
    [659.25, 987.77, 1318.5].forEach((f, i) => {
      const o = alertCtx!.createOscillator(), g = alertCtx!.createGain();
      o.frequency.value = f; g.gain.setValueAtTime(0, t + i * 0.12); g.gain.linearRampToValueAtTime(0.16, t + i * 0.12 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 1);
      o.connect(g).connect(alertCtx!.destination); o.start(t + i * 0.12); o.stop(t + i * 0.12 + 1.1);
    });
  } catch { /* الصوت غير متاح */ }
}
export function RequestAlerts({ bookings, onOpen }: { bookings: Booking[]; onOpen: () => void }) {
  const toast = useToast();
  const seen = useRef<Map<string, number> | null>(null);
  const [unseen, setUnseen] = useState(0);
  useEffect(() => { const on = () => { try { alertCtx ??= new AudioContext(); void alertCtx.resume(); } catch { /* */ } }; window.addEventListener("pointerdown", on, { once: true }); return () => window.removeEventListener("pointerdown", on); }, []);
  useEffect(() => {
    const now = new Map(bookings.map((b) => [b.id, b.messages.length]));
    if (!seen.current) { seen.current = now; return; }
    const fresh = bookings.filter((b) => !seen.current!.has(b.id) && b.status === "new");
    const msgs = bookings.filter((b) => seen.current!.has(b.id) && (now.get(b.id) ?? 0) > (seen.current!.get(b.id) ?? 0) && b.messages.at(-1)?.from !== "provider");
    seen.current = now;
    if (!fresh.length && !msgs.length) return;
    ding();
    try { navigator.vibrate?.([70, 50, 70]); } catch { /* */ }
    toast(fresh.length ? `وصلك طلب جديد من ${fresh[0].clientName} يطلب عرض سعر` : `رسالة جديدة في طلب ${msgs[0].clientName}`);
    if (document.hidden) setUnseen((n) => n + fresh.length + msgs.length);
    try { if (document.hidden && "Notification" in window && Notification.permission === "granted") new Notification("مناسبتي: طلب جديد", { body: fresh[0]?.clientName ?? msgs[0]?.clientName }); } catch { /* */ }
    if (fresh.length) onOpen();
  }, [bookings, toast, onOpen]);
  useEffect(() => { const v = () => { if (!document.hidden) setUnseen(0); }; document.addEventListener("visibilitychange", v); return () => document.removeEventListener("visibilitychange", v); }, []);
  useEffect(() => { const base = document.title.replace(/^\(\d+\)\s*/, ""); document.title = (unseen ? `(${unseen}) ` : "") + base; }, [unseen]);
  return null;
}
