import { useMemo, useState } from "react";
import {
  CITIES, OCCASIONS, adminClients, adminDeleteClient, adminUpdateBooking, adminUpdateClient, alternativesFor, bookingMessage, forwardToVendor, markNotified, reassignBooking, rejectRequest, resolveCancel, fmt, normPhone, sar, pricingOf, clientPriceFor, priceForClient, confirmPaid, markPayout, depositFor, today,
  type AdminClient, type Booking, type BookingStatus,
} from "@munasabati/core";
import { Composer, Empty, Icon, Segmented, Sheet, StatusPill, Thread, TicketStatusPill, apply, repo, useDB, useToast } from "@munasabati/ui";

const ago = (t: number) => { if (!t) return "—"; const m = Math.round((Date.now() - t) / 6e4); return m < 60 ? `قبل ${Math.max(1, m)} د` : m < 1440 ? `قبل ${Math.round(m / 60)} س` : `قبل ${Math.round(m / 1440)} يوم`; };
const wa = (phone: string) => `https://wa.me/966${normPhone(phone).replace(/^0/, "")}`;
const digits = (v: string) => +v.replace(/\D/g, "") || undefined;

function Confirm({ label, onYes }: { label: string; onYes: () => void }) {
  const [ask, setAsk] = useState(false);
  return ask
    ? <div className="row"><button className="btn grow adm-danger" onClick={onYes}>تأكيد: {label}</button><button className="btn ghost" onClick={() => setAsk(false)}>إلغاء</button></div>
    : <button className="btn ghost adm-danger-text" onClick={() => setAsk(true)}><Icon name="Trash2" size={16} /> {label}</button>;
}

/* ───── العملاء: الإدارة ترى كل بيانات العميل ولها حق التعديل والحذف ───── */
export function Clients({ focus, go }: { focus?: string; go: (t: string, id?: string) => void }) {
  const db = useDB();
  const toast = useToast();
  const list = useMemo(() => adminClients(db), [db]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "event" | "pending">("all");
  const [sel, setSel] = useState<string | null>(focus ?? null);
  const [edit, setEdit] = useState<null | { name: string; phone: string; date: string; city: string; guests: string; budget: string }>(null);
  const name = (b: Booking) => (b.kind === "venue" ? db.venues.find((v) => v.id === b.targetId)?.name : db.suppliers.find((s) => s.id === b.targetId)?.name) ?? "محذوف";
  const shown = list.filter((c) => (!q || (c.name + c.phone + (c.event?.city ?? "")).includes(q))
    && (filter === "all" || (filter === "active" && c.bookings.some((b) => b.status !== "declined")) || (filter === "event" && !!c.event) || (filter === "pending" && c.bookings.some((b) => b.status === "new"))));
  const cur = list.find((c) => c.key === sel);

  const save = (c: AdminClient) => {
    if (!edit) return;
    apply(adminUpdateClient(c, { name: edit.name.trim() || undefined, phone: edit.phone || undefined, event: c.event ? { date: edit.date || c.event.date, city: edit.city || c.event.city, guests: digits(edit.guests) ?? c.event.guests, budget: digits(edit.budget) } : undefined }));
    setEdit(null); toast("تم حفظ بيانات العميل");
    const np = normPhone(edit.phone); if (np && np !== c.phone) setSel(np);
  };

  return (
    <>
      <div><span className="eyebrow">الإدارة هي الوسيط بين العميل وكل الأطراف</span><h1 className="page-title">العملاء</h1></div>
      <div className="row wrap">
        <Segmented value={filter} onChange={setFilter} options={[["all", `الكل (${list.length})`], ["pending", "بانتظار رد"], ["active", "لديهم طلبات"], ["event", "مناسبة مسجلة"]]} />
        <input className="input grow" style={{ minWidth: 200, width: "auto" }} placeholder="بحث: اسم، جوال، مدينة" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث في العملاء" />
      </div>
      {shown.length ? <div className="cl-grid">{shown.map((c) => {
        const occ = OCCASIONS.find((o) => o.id === (c.event?.occasion ?? c.bookings[0]?.occasion));
        const pending = c.bookings.filter((b) => b.status === "review" || b.status === "new").length;
        return (
          <button key={c.key} className="card cl-card" onClick={() => { setSel(c.key); setEdit(null); }}>
            <div className="row" style={{ ["--gap" as string]: "12px" }}>
              <span className="cl-av">{c.name.trim().charAt(0) || "؟"}</span>
              <div className="grow" style={{ minWidth: 0 }}><b className="display" style={{ display: "block" }}>{c.name}</b><small className="muted num">{c.phone || "بدون رقم"} · {ago(c.lastActive)}</small></div>
              {pending > 0 && <span className="pill warn num">{pending} بانتظار رد</span>}
            </div>
            <div className="cl-meta num">
              {occ && <span><Icon name="PartyPopper" size={13} />{occ.name}</span>}
              {(c.event?.date ?? c.bookings[0]?.date) && <span><Icon name="CalendarDays" size={13} />{c.event?.date ?? c.bookings[0]?.date}</span>}
              {(c.event?.city ?? c.bookings[0]?.city) && <span><Icon name="MapPin" size={13} />{c.event?.city ?? c.bookings[0]?.city}</span>}
              <span><Icon name="Wallet" size={13} />{c.budget ? sar(c.budget) : "ميزانية غير محددة"}</span>
              <span><Icon name="CalendarCheck" size={13} />{c.bookings.length} طلب</span>
            </div>
          </button>
        );
      })}</div> : <Empty icon="Users" title="لا يوجد عملاء بعد">أول ما يسجل عميل مناسبته أو يرسل طلباً سيظهر هنا بكل بياناته.</Empty>}

      <Sheet open={!!cur} onClose={() => { setSel(null); setEdit(null); }} title="ملف العميل">
        {cur && <div className="stack">
          <div className="row" style={{ ["--gap" as string]: "12px" }}>
            <span className="cl-av lg">{cur.name.trim().charAt(0) || "؟"}</span>
            <div className="grow"><h3 className="display" style={{ margin: 0 }}>{cur.name}</h3><small className="muted num">{cur.phone || "بدون رقم"} · {cur.source === "space" ? "مسجّل في التطبيق" : "معروف من طلباته"}</small></div>
          </div>
          {cur.phone && <div className="row wrap">
            <a className="btn sm" href={`tel:${cur.phone}`}><Icon name="Phone" size={15} /> اتصال</a>
            <a className="btn sm" href={wa(cur.phone)} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={15} /> واتساب</a>
            <button className="btn sm" onClick={() => setEdit({ name: cur.name, phone: cur.phone, date: cur.event?.date ?? "", city: cur.event?.city ?? "", guests: String(cur.event?.guests ?? ""), budget: String(cur.event?.budget ?? "") })}><Icon name="Pencil" size={15} /> تعديل</button>
          </div>}
          {!cur.phone && <button className="btn sm" onClick={() => setEdit({ name: cur.name, phone: "", date: cur.event?.date ?? "", city: cur.event?.city ?? "", guests: String(cur.event?.guests ?? ""), budget: String(cur.event?.budget ?? "") })}><Icon name="Pencil" size={15} /> تعديل</button>}

          {cur.source === "space" && cur.phone && <AccountTools phone={cur.phone} />}
          {edit && <form className="card flat stack" style={{ background: "var(--surface-2)" }} onSubmit={(e) => { e.preventDefault(); save(cur); }}>
            <div className="form-2">
              <div className="field"><label htmlFor="ce-n">الاسم</label><input id="ce-n" className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
              <div className="field"><label htmlFor="ce-p">الجوال</label><input id="ce-p" dir="ltr" style={{ textAlign: "right" }} className="input num" inputMode="tel" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
              {cur.event && <>
                <div className="field"><label htmlFor="ce-d">تاريخ المناسبة</label><input id="ce-d" type="date" className="input num" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></div>
                <div className="field"><label htmlFor="ce-c">المدينة</label><select id="ce-c" className="select" value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div className="field"><label htmlFor="ce-g">عدد الضيوف</label><input id="ce-g" className="input num" inputMode="numeric" value={edit.guests} onChange={(e) => setEdit({ ...edit, guests: e.target.value })} /></div>
                <div className="field"><label htmlFor="ce-b">الميزانية</label><input id="ce-b" className="input num" inputMode="numeric" placeholder="غير محددة" value={edit.budget} onChange={(e) => setEdit({ ...edit, budget: e.target.value })} /></div>
              </>}
            </div>
            <div className="row"><button className="btn primary" type="submit">حفظ</button><button className="btn ghost" type="button" onClick={() => setEdit(null)}>إلغاء</button></div>
            <small className="muted">تعديل الاسم والجوال يتحدث في مساحة العميل وكل طلباته عند التجار.</small>
          </form>}

          {cur.event && <section className="card flat tight stack" style={{ background: "var(--surface-2)" }}>
            <b className="display">المناسبة</b>
            <div className="adm-kv num">
              <span>النوع</span><b>{OCCASIONS.find((o) => o.id === cur.event!.occasion)?.name}</b>
              <span>التاريخ</span><b>{cur.event.date}</b><span>المدينة</span><b>{cur.event.city}</b>
              <span>الضيوف المتوقعون</span><b>{fmt(cur.event.guests)}</b>
              <span>قائمة الضيوف</span><b>{fmt(cur.guests)} · مؤكد {fmt(cur.confirmedGuests)}</b>
              <span>الميزانية</span><b>{cur.budget ? sar(cur.budget) : "لم يحددها"}</b>
              <span>موزّع / مدفوع</span><b>{cur.allocated ? sar(cur.allocated) : "—"} / {cur.paid ? sar(cur.paid) : "—"}</b>
              <span>مهام العائلة</span><b>{cur.tasks[0]} من {cur.tasks[1]}</b>
            </div>
          </section>}

          <div className="field"><span className="label">الطلبات ({cur.bookings.length})</span>
            {cur.bookings.length ? <div className="list">{cur.bookings.map((b) => (
              <button key={b.id} className="list-row adm-row" onClick={() => go("bookings", b.id)}>
                <span className="avatar"><Icon name={b.kind === "venue" ? "Building2" : "Store"} size={16} /></span>
                <div className="t"><b>{name(b)}</b><small className="num">{b.date} · {fmt(b.guests)} ضيف{b.budget ? ` · ميزانية ${sar(b.budget)}` : ""}</small></div>
                <StatusPill status={b.status} />
              </button>
            ))}</div> : <p className="muted" style={{ margin: 0 }}>لا توجد طلبات بعد.</p>}
          </div>
          {cur.tickets.length > 0 && <div className="field"><span className="label">تذاكر الدعم</span><div className="list">{cur.tickets.map((t) => (
            <button key={t.id} className="list-row adm-row" onClick={() => go("support", t.id)}><span className="avatar"><Icon name="LifeBuoy" size={16} /></span><div className="t"><b>{t.subject}</b><small>{ago(t.updatedAt)}</small></div><TicketStatusPill s={t.status} /></button>
          ))}</div></div>}
          <Confirm label="حذف العميل وكل بياناته وطلباته" onYes={() => { apply(adminDeleteClient(cur)); setSel(null); toast("تم حذف العميل"); }} />
        </div>}
      </Sheet>
    </>
  );
}

/* ───── مراجعة طلب العميل قبل إرساله للتاجر ───── */
function ReviewBox({ b, provider }: { b: Booking; provider: string }) {
  const toast = useToast();
  const [note, setNote] = useState("");
  const [reject, setReject] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <div className="card flat stack review-box">
      <b><Icon name="ShieldCheck" size={16} /> طلب جديد من العميل بانتظار مراجعتك</b>
      <span className="muted" style={{ fontSize: 13.5 }}>التاجر ما يشوف الطلب لين ترسله له. بعدها يرسل عرض سعره، والعرض يوصل للعميل تلقائياً.</span>
      {!reject ? <>
        <label className="sr" htmlFor={"rv-n" + b.id}>ملاحظة للتاجر</label>
        <textarea id={"rv-n" + b.id} className="input" rows={2} placeholder={`ملاحظة لـ ${provider} (اختياري)`} value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="row wrap">
          <button className="btn primary grow" onClick={() => { apply(forwardToVendor(b.id, note)); toast(`أرسلنا الطلب لـ ${provider} يطلب عرض سعر`); }}><Icon name="Send" size={16} /> أرسله للتاجر واطلب عرض سعر</button>
          <button className="btn ghost" onClick={() => setReject(true)}>اعتذار للعميل</button>
        </div>
      </> : <>
        <label className="sr" htmlFor={"rv-r" + b.id}>سبب الاعتذار</label>
        <textarea id={"rv-r" + b.id} className="input" rows={2} placeholder="سبب الاعتذار (يوصل للعميل)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="row"><button className="btn grow" style={{ color: "var(--bad)" }} disabled={reason.trim().length < 3} onClick={() => { apply(rejectRequest(b.id, reason)); toast("أبلغنا العميل بالاعتذار"); }}>تأكيد الاعتذار</button><button className="btn ghost" onClick={() => setReject(false)}>تراجع</button></div>
      </>}
    </div>
  );
}

/* ───── أدوات الحساب: كلمة مرور جديدة لمن نسيها، وربط القاعة أو المورد بحساب صاحبه ───── */
export function AccountTools({ kind, id, phone }: { kind?: "supplier" | "venue"; id?: string; phone: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [ph, setPh] = useState(phone);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const auth = repo.auth;
  if (!auth) return null;
  const run = async (fn: () => Promise<void>, ok: string) => { setBusy(true); try { await fn(); toast(ok); } catch (x) { toast((x as Error).message); } finally { setBusy(false); } };
  const genPw = () => setPw(String(Math.floor(100000 + Math.random() * 900000)));
  if (!open) return <button className="btn sm" style={{ justifySelf: "start" }} onClick={() => setOpen(true)}><Icon name="Lock" size={15} /> الدخول وكلمة المرور</button>;
  return (
    <div className="card flat stack" style={{ background: "var(--surface-2)" }}>
      <b>حساب صاحب {kind === "venue" ? "القاعة" : kind === "supplier" ? "النشاط" : "الحساب"}</b>
      <div className="field"><label htmlFor={"at-p" + (id ?? "")}>جواله</label><input id={"at-p" + (id ?? "")} className="input num" dir="ltr" style={{ textAlign: "right" }} inputMode="tel" placeholder="05xxxxxxxx" value={ph} onChange={(e) => setPh(e.target.value)} /></div>
      <div className="field"><label htmlFor={"at-w" + (id ?? "")}>كلمة مرور جديدة (لمن نسيها)</label>
        <div className="row" style={{ ["--gap" as string]: "6px" }}><input id={"at-w" + (id ?? "")} className="input num grow" dir="ltr" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="٦ أحرف أو أكثر" /><button type="button" className="btn sm ghost" onClick={genPw}>اقترح</button></div>
      </div>
      <div className="row wrap">
        <button className="btn sm primary" disabled={busy || !normPhone(ph) || pw.length < 6} onClick={() => void run(() => auth.adminSetPassword(normPhone(ph), pw), "تم تعيين كلمة المرور. أرسلها لصاحب الحساب")}>تعيين كلمة المرور</button>
        {pw.length >= 6 && normPhone(ph) && <a className="btn sm wa-notify" href={`${wa(ph)}?text=${encodeURIComponent(`كلمة مرورك الجديدة في مناسبتي: ${pw}\nادخل برقم جوالك وهذي الكلمة، وتقدر تغيّرها بعدين.`)}`} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={15} /> أرسلها بواتساب</a>}
        {kind && id && <button className="btn sm" disabled={busy || !normPhone(ph)} onClick={() => void run(() => auth.adminLinkOwner(kind, id, normPhone(ph)), "ربطنا الحساب بصاحبه")}><Icon name="Link" size={15} /> اربط {kind === "venue" ? "القاعة" : "النشاط"} بحساب هذا الجوال</button>}
      </div>
      <small className="muted">الربط يرجّع {kind === "venue" ? "القاعة" : "النشاط"} لصاحبها لو سجّل بحساب جديد. صاحب الجوال لازم يكون مسوّي حساب بكلمة مرور.</small>
    </div>
  );
}

/* ───── إبلاغ التاجر أو صاحب القاعة بالطلب عبر واتساب (رسالة جاهزة برابط بوابته) ───── */
export function NotifyVendor({ b, provider }: { b: Booking; provider: string }) {
  const db = useDB();
  const toast = useToast();
  const phone = (b.kind === "venue" ? db.venues.find((v) => v.id === b.targetId)?.phone : db.suppliers.find((s) => s.id === b.targetId)?.phone) ?? "";
  if (!normPhone(phone).match(/^05\d{8}$/)) return <span className="pill neutral" title="أضف جوال التاجر من تعديل حسابه">ما فيه جوال للتاجر</span>;
  const base = location.href.split("#")[0].replace(/admin\/(index\.html)?$/, "");
  const occ = OCCASIONS.find((o) => o.id === b.occasion)?.name ?? "مناسبة";
  const text = [`السلام عليكم ${provider}`, "وصلك طلب جديد عبر منصة مناسبتي 🎉", `${occ} · ${b.city} · ${b.date} · ${fmt(b.guests)} ضيف${b.budget ? ` · ميزانية العميل ${sar(b.budget)}` : ""}`, `للرد على الطلب افتح بوابتك: ${base}${b.kind === "venue" ? "venues/" : "vendors/"}`].join("\n");
  return (
    <a className="btn sm wa-notify" href={`${wa(phone)}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" onClick={() => { apply(markNotified(b.id)); toast("فتحنا واتساب برسالة جاهزة للتاجر"); }}>
      <Icon name="MessageCircle" size={15} /> {b.notifiedAt ? `أبلغته ${ago(b.notifiedAt)} · ذكّره` : "بلّغ التاجر بواتساب"}
    </a>
  );
}

/* ───── أدوات الوسيط داخل الطلب: تعديل أي حقل + رسالة من الإدارة للطرفين ───── */
const QUICK = ["تم استلام طلبك، ونتابعه مع التاجر الآن.", "نرجو من التاجر إرسال عرض السعر خلال 24 ساعة.", "تم تعديل موعد الحجز بالاتفاق بين الطرفين.", "تم تأكيد الحجز من الإدارة."];
export function BookingAdmin({ b, provider, onClient }: { b: Booking; provider: string; onClient?: () => void }) {
  const toast = useToast();
  const db = useDB();
  const [alt, setAlt] = useState(false);
  const alts = alt ? alternativesFor(db, b) : [];
  const [f, setF] = useState<null | { clientName: string; phone: string; date: string; guests: string; budget: string; quote: string; note: string }>(null);
  return (
    <div className="stack">
      <div className="row wrap" style={{ ["--gap" as string]: "6px" }}>
        {b.fromPlan && <span className="pill brand">من الخطة المقترحة</span>}
        {b.reassignedFrom && <span className="pill info">محوّل من الإدارة</span>}
        {b.rating && <span className={"pill " + (b.rating.stars >= 4 ? "ok" : b.rating.stars >= 3 ? "warn" : "bad")}>تقييم العميل {"★".repeat(b.rating.stars)}</span>}
        {b.vendorStatus && b.kind === "venue" && b.vendorStatus === "ready" && <span className="pill ok">القاعة بلّغت العميل إنها جاهزة</span>}
        {!!b.leaks && <span className="pill bad"><Icon name="ShieldAlert" size={13} /> {b.leaks} محاولة مشاركة رقم أو حساب (انخفت)</span>}
        {b.vendorStatus && b.kind !== "venue" && <span className="pill ok">التاجر: {({ onway: "في الطريق", arrived: "وصل", setup: "يجهّز", ready: "جاهز" } as const)[b.vendorStatus]}</span>}
      </div>
      {b.status === "review" && <ReviewBox b={b} provider={provider} />}
      <MoneyBox b={b} />
      {b.cancelRequest && <div className="card flat stack" style={{ background: "var(--surface-2)", borderColor: "var(--warn)" }}>
        <b><Icon name="CalendarX" size={16} /> التاجر يطلب إلغاء الحجز</b>
        <span className="muted" style={{ fontSize: 14 }}>السبب: {b.cancelRequest.reason}</span>
        <div className="row wrap">
          <button className="btn sm" onClick={() => { apply(resolveCancel(b.id, false)); toast("رفضنا الإلغاء وأبلغنا الطرفين"); }}>رفض: الحجز قائم</button>
          <button className="btn sm primary" onClick={() => { apply(resolveCancel(b.id, true)); setAlt(true); toast("وافقنا. اختر بديلاً للعميل"); }}>موافقة وترشيح بديل</button>
        </div>
      </div>}
      {(b.status === "new" || b.status === "declined" || b.cancelRequest) && <div className="stack" style={{ ["--gap" as string]: "8px" }}>
        {!alt ? <button className="btn sm" style={{ justifySelf: "start" }} onClick={() => setAlt(true)}><Icon name="RefreshCw" size={15} /> إسناد لتاجر بديل</button> : <>
          <span className="label">بدائل مناسبة لنفس البند والمدينة والتاريخ</span>
          {alts.length ? <div className="list">{alts.map((a) => (
            <div key={a.id} className="list-row"><div className="t"><b>{a.name}</b><small>{a.reasons.slice(0, 3).join(" · ")}</small></div><button className="btn sm primary" onClick={() => { apply(reassignBooking(b.id, { kind: a.kind, id: a.id, hallId: a.hallId, name: a.name })); setAlt(false); toast(`حوّلنا الطلب إلى ${a.name}`); }}>حوّل له</button></div>
          ))}</div> : <p className="muted" style={{ margin: 0 }}>ما فيه بديل متاح حالياً بنفس المواصفات.</p>}
        </>}
      </div>}
      <div className="row wrap">
        <button className="btn sm" onClick={() => setF({ clientName: b.clientName, phone: b.phone, date: b.date, guests: String(b.guests), budget: String(b.budget ?? ""), quote: String(b.quote ?? ""), note: b.note })}><Icon name="Pencil" size={15} /> تعديل الطلب</button>
        <NotifyVendor b={b} provider={provider} />
        {onClient && <button className="btn sm" onClick={onClient}><Icon name="UserCheck" size={15} /> ملف العميل</button>}
        {b.phone && <a className="btn sm" href={wa(b.phone)} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={15} /> واتساب العميل</a>}
      </div>
      {f && <form className="card flat stack" style={{ background: "var(--surface-2)" }} onSubmit={(e) => {
        e.preventDefault();
        apply(adminUpdateBooking(b.id, { clientName: f.clientName.trim() || b.clientName, phone: f.phone || b.phone, date: f.date || b.date, guests: digits(f.guests) ?? b.guests, budget: digits(f.budget), quote: digits(f.quote), note: f.note }));
        setF(null); toast("تم تعديل الطلب");
      }}>
        <div className="form-2">
          <div className="field"><label htmlFor="be-n">اسم العميل</label><input id="be-n" className="input" value={f.clientName} onChange={(e) => setF({ ...f, clientName: e.target.value })} /></div>
          <div className="field"><label htmlFor="be-p">الجوال</label><input id="be-p" dir="ltr" style={{ textAlign: "right" }} className="input num" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div className="field"><label htmlFor="be-d">التاريخ</label><input id="be-d" type="date" className="input num" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          <div className="field"><label htmlFor="be-g">الضيوف</label><input id="be-g" className="input num" inputMode="numeric" value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value })} /></div>
          <div className="field"><label htmlFor="be-b">ميزانية العميل</label><input id="be-b" className="input num" inputMode="numeric" placeholder="غير محددة" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} /></div>
          <div className="field"><label htmlFor="be-q">قيمة العرض</label><input id="be-q" className="input num" inputMode="numeric" placeholder="لم يُرسل" value={f.quote} onChange={(e) => setF({ ...f, quote: e.target.value })} /></div>
          <div className="field full"><label htmlFor="be-o">ملاحظات</label><textarea id="be-o" className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
        </div>
        <div className="row"><button className="btn primary" type="submit">حفظ التعديل</button><button className="btn ghost" type="button" onClick={() => setF(null)}>إلغاء</button></div>
      </form>}
      <div className="field">
        <span className="label">المحادثة (أنت وسيط فيها: رسالتك تظهر للعميل و{provider})</span>
        <Thread items={b.messages.map((m) => ({ mine: m.from === "admin", text: m.text, at: m.at, who: m.from === "provider" ? provider : m.from === "client" ? b.clientName : "الإدارة" }))} mine="لا توجد رسائل بعد" />
        <div className="chips wrap" style={{ margin: "6px 0" }}>{QUICK.map((t) => <button key={t} type="button" className="chip" onClick={() => { apply(bookingMessage(b.id, "admin", t)); toast("أُرسلت للطرفين"); }}>{t}</button>)}</div>
        <Composer onSend={(t) => { apply(bookingMessage(b.id, "admin", t)); toast("أُرسلت للطرفين"); }} placeholder="رسالة من الإدارة للطرفين" />
      </div>
      <div className="field"><span className="label">تغيير الحالة</span><Segmented value={b.status} onChange={(v: BookingStatus) => { apply(adminUpdateBooking(b.id, { status: v })); toast("تم تحديث الحالة"); }} options={[["review", "للمراجعة"], ["new", "عند التاجر"], ["quoted", "عرض"], ["confirmed", "مؤكد"], ["declined", "مرفوض"]]} /></div>
    </div>
  );
}

/** فلوس الطلب: سعر التاجر الصافي، سعر العميل، ربح مناسبتي، والعربون والتحويل للتاجر */
function MoneyBox({ b }: { b: Booking }) {
  const db = useDB();
  const toast = useToast();
  const p = pricingOf(db);
  const [price, setPrice] = useState(String(b.clientPrice ?? (b.quote ? clientPriceFor(b.quote, p) : "")));
  if (!b.quote && !b.clientPrice) return null;
  const margin = (b.clientPrice ?? 0) - (b.quote ?? 0);
  const ended = b.date < today();
  return (
    <div className="card flat stack money-box">
      <div className="money-row">
        <div><small>سعر التاجر (صافي)</small><b className="num">{b.quote ? sar(b.quote) : "—"}</b></div>
        <div><small>سعر العميل</small><b className="num">{b.clientPrice ? sar(b.clientPrice) : "ما اعتمد"}</b></div>
        <div className={margin > 0 ? "win" : ""}><small>ربح مناسبتي</small><b className="num">{b.clientPrice && b.quote ? sar(margin) : "—"}</b></div>
      </div>
      {b.status === "quoted" && <div className="row wrap" style={{ ["--gap" as string]: "8px" }}>
        <label className="sr" htmlFor={"cp" + b.id}>سعر العميل</label>
        <input id={"cp" + b.id} className="input num grow" style={{ width: "auto", minWidth: 140 }} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} />
        <button className="btn sm primary" disabled={!+price} onClick={() => { apply(priceForClient(b.id, +price)); toast("وصل السعر للعميل"); }}>{b.clientPrice ? "عدّل سعر العميل" : "أرسل السعر للعميل"}</button>
      </div>}
      {b.status === "confirmed" && <div className="row wrap" style={{ ["--gap" as string]: "8px" }}>
        <span className="grow" style={{ fontSize: 14 }}>
          {b.pay?.payoutAt ? <><Icon name="CheckCircle2" size={14} /> حوّلت للتاجر حقه</>
            : b.pay?.stage === "paid" ? <><Icon name="ShieldCheck" size={14} /> العربون مستلم ({sar(depositFor(b, p))})</>
            : b.pay?.stage === "claimed" ? <><Icon name="Bell" size={14} /> العميل يقول حوّل العربون {sar(depositFor(b, p))}، تأكد من الحساب (المرجع MNS-{b.id.slice(-6).toUpperCase()})</>
            : <><Icon name="Clock" size={14} /> بانتظار عربون العميل ({sar(depositFor(b, p))})</>}
        </span>
        {b.pay?.stage === "claimed" && <button className="btn sm primary" onClick={() => { apply(confirmPaid(b.id)); toast("أكّدنا الاستلام وبلّغنا التاجر"); }}>أكّد استلام العربون</button>}
        {b.pay?.stage !== "paid" && b.pay?.stage !== "claimed" && <button className="btn sm" onClick={() => { apply(confirmPaid(b.id)); toast("سجّلنا الاستلام"); }}>استلمت المبلغ</button>}
        {b.pay?.stage === "paid" && !b.pay?.payoutAt && <button className="btn sm" disabled={!ended} title={ended ? "" : "بعد المناسبة"} onClick={() => { apply(markPayout(b.id)); toast("سجّلنا تحويل حق التاجر"); }}>حوّلت للتاجر {b.quote ? sar(b.quote) : ""}</button>}
      </div>}
    </div>
  );
}
