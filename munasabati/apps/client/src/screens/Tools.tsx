import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  acceptQuote, addBudget, addTask, checkIn, claimPaid, depositFor, pricingOf, enableDoor, fmt, normCode, openTicket, setLiveIndex, postOp, OPS_QUICK, endEvent, reopenEvent, DEFAULT_THANKS, removeBudget, removeTask, sar, setBookingStatus, setTotalBudget, toggleTask, today, updateBudget,
  type Booking, type CheckInResult, type DoorSnapshot, type OpsMsg,
} from "@munasabati/core";
import { BookingChat, Counter, Empty, Icon, OpsFeed, Sheet, StatusPill, apply, repo, useDB, useOpsAlerts, useToast } from "@munasabati/ui";
import { go } from "../nav";

/* ───── الحجوزات ───── */
export function Bookings() {
  const db = useDB();
  const toast = useToast();
  const mine = db.bookings.filter((b) => b.fromClient);
  const nameOf = (kind: string, id: string) => (kind === "venue" ? db.venues.find((v) => v.id === id)?.name : db.suppliers.find((s) => s.id === id)?.name) ?? "";
  return (
    <>
      <div className="row between wrap"><div><h1 className="page-title">حجوزاتي</h1><p className="page-sub">طلباتك مع القاعات والموردين وردودهم.</p></div><button className="btn primary" onClick={() => go("plan")}><Icon name="Sparkles" size={16} /> اقتراحاتي</button></div>
      {!mine.length && <section className="card"><Empty icon="CalendarSearch" title="ما عندك طلبات للحين">جهّزنا لك اقتراحات على ذوقك وميزانيتك. اختر اللي يعجبك وأرسله للإدارة.<button className="btn primary" style={{ marginTop: 6 }} onClick={() => go("plan")}>شوف اقتراحاتي</button></Empty></section>}
      <div className="stack">
        {mine.map((b) => (
          <motion.section key={b.id} layout className="card stack" style={{ ["--gap" as string]: "12px" }}>
            <div className="row">
              <span className="avatar"><Icon name={b.kind === "venue" ? "Building2" : "Store"} size={18} /></span>
              <div className="grow"><b className="display" style={{ display: "block" }}>{nameOf(b.kind, b.targetId)}</b><small className="muted num">{b.date} · {fmt(b.guests)} ضيف</small></div>
              <StatusPill status={b.status} />
            </div>
            {b.note && <div className="muted" style={{ fontSize: 13.5 }}>{b.note}</div>}
            {b.cancelRequest && <div className="card flat tight" style={{ background: "var(--surface-2)", fontSize: 14 }}><b>التاجر طلب إلغاء الحجز</b><div className="muted">الإدارة تراجع الطلب الآن، وحجزك قائم لين قرارها. لو تمت الموافقة نرشّح لك بديلاً مباشرة.</div></div>}
            {b.status === "confirmed" && b.vendorStatus && (b.kind !== "venue" || b.vendorStatus === "ready") && <div className="vstat-view"><Icon name="Radio" size={15} /> {b.kind === "venue" ? <b>القاعة جاهزة لاستقبالكم</b> : <>حالة التاجر: <b>{VLABEL[b.vendorStatus]}</b></>}</div>}
            <div className="row"><BookingChat booking={b} me="client" other={nameOf(b.kind, b.targetId)} /></div>
            {b.messages.filter((m) => m.from !== "client").map((m, i) => <div key={i} className={"card flat tight" + (m.from === "admin" ? " admin-note" : "")} style={{ background: "var(--surface-2)", fontSize: 14 }}><b className="display" style={{ fontSize: 12.5, display: "block", color: m.from === "admin" ? "var(--brand)" : "var(--muted)" }}>{m.from === "admin" ? "إدارة مناسبتي" : `رد ${nameOf(b.kind, b.targetId)}`}</b>{m.text}</div>)}
            {b.status === "quoted" && !b.clientPrice && <div className="req-step"><Icon name="Hourglass" size={15} /> وصلنا عرض التاجر، ونجهّز لك سعر مناسبتي النهائي.</div>}
            {b.status === "quoted" && !!b.clientPrice && (
              <div className="row wrap">
                <span className="grow">سعر مناسبتي: <b className="num display" style={{ fontSize: 18 }}>{sar(b.clientPrice)}</b><small className="muted" style={{ display: "block", fontSize: 12.5 }}>شامل التنسيق والمتابعة لين ليلة المناسبة</small></span>
                <button className="btn sm ghost" onClick={() => apply(setBookingStatus(b.id, "declined", { message: { from: "client", text: "اعتذر العميل" } }))}>رفض</button>
                <button className="btn sm primary" onClick={() => { apply(acceptQuote(b.id, nameOf(b.kind, b.targetId))); toast("تم تأكيد الحجز وإضافته للميزانية"); }}>اقبل العرض</button>
              </div>
            )}
            {b.status === "confirmed" && <PayBox b={b} name={nameOf(b.kind, b.targetId)} />}
            {b.status === "review" && <div className="req-step"><Icon name="ShieldCheck" size={15} /> طلبك عند الإدارة. بنراجعه ونطلب لك عرض السعر من التاجر.</div>}
            {b.status === "new" && <div className="req-step"><Icon name="Hourglass" size={15} /> طلبنا عرض السعر من التاجر، وبيوصلك هنا أول ما يرد.</div>}
          </motion.section>
        ))}
      </div>
    </>
  );
}

const VLABEL = { onway: "في الطريق", arrived: "وصل الموقع", setup: "يجهّز الآن", ready: "جاهز" } as const;

/** العربون عبر مناسبتي: تحويل بنكي لحساب المنصة برقم مرجعي، والإدارة تأكد الاستلام */
function PayBox({ b, name }: { b: Booking; name: string }) {
  const db = useDB();
  const toast = useToast();
  const p = pricingOf(db);
  const dep = depositFor(b, p);
  const ref = "MNS-" + b.id.slice(-6).toUpperCase();
  const copy = async (t: string, what: string) => { try { await navigator.clipboard.writeText(t); toast(`نسخنا ${what}`); } catch { toast(t); } };
  if (!b.clientPrice) return null;
  if (b.pay?.stage === "paid") return <div className="pay-ok"><Icon name="ShieldCheck" size={17} /> العربون مستلم، وحجزك مع {name} مؤكد ومضمون عبر مناسبتي.</div>;
  if (b.pay?.stage === "claimed") return <div className="req-step"><Icon name="Hourglass" size={15} /> استلمنا إشعار تحويلك، ونأكد الاستلام خلال ساعات.</div>;
  return (
    <div className="paybox">
      <div className="row between wrap"><b className="display">ثبّت حجزك بالعربون</b><span className="pill brand num">{p.depositPct}٪ = {sar(dep)}</span></div>
      <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>حوّل العربون لحساب مناسبتي، واكتب الرقم المرجعي في التحويل. مناسبتي تحفظ حقك وحق التاجر، والباقي ({sar((b.clientPrice ?? 0) - dep)}) قبل المناسبة.</p>
      {db.bank?.iban ? <div className="pay-rows">
        <div><small>البنك</small><b>{db.bank.name}</b></div>
        <div><small>اسم المستفيد</small><b>{db.bank.holder}</b></div>
        <div><small>الآيبان</small><b className="num" dir="ltr">{db.bank.iban}</b><button className="icon-btn sm" aria-label="نسخ الآيبان" onClick={() => void copy(db.bank!.iban, "الآيبان")}><Icon name="Copy" size={14} /></button></div>
        <div><small>الرقم المرجعي</small><b className="num" dir="ltr">{ref}</b><button className="icon-btn sm" aria-label="نسخ الرقم المرجعي" onClick={() => void copy(ref, "الرقم المرجعي")}><Icon name="Copy" size={14} /></button></div>
      </div> : <div className="req-step"><Icon name="Info" size={15} /> بيانات الحساب توصلك من الإدارة في محادثة الطلب.</div>}
      <button className="btn primary block" onClick={() => { apply(claimPaid(b.id)); toast("وصلنا إشعارك، ونأكد الاستلام قريب"); }}><Icon name="CheckCircle2" size={16} /> حوّلت العربون</button>
    </div>
  );
}
/* ───── الميزانية ───── */
export function Budget() {
  const db = useDB();
  const toast = useToast();
  const [n, setN] = useState({ label: "", est: "" });
  const lines = db.client.budget;
  const total = db.client.event?.budget ?? 0;
  const est = lines.reduce((s, b) => s + b.est, 0), paid = lines.reduce((s, b) => s + b.paid, 0);
  const base = total || est;
  const left = total - est;
  const colors = ["var(--brand)", "var(--info)", "var(--ok)", "var(--warn)", "var(--brand-2)", "#8e7cff", "#2ab7ca"];
  return (
    <>
      <div><h1 className="page-title">الميزانية</h1><p className="page-sub">أنت تحدد ميزانيتك، وكل طلب ترسله للتاجر يوصله معه المبلغ المخصص له.</p></div>
      <section className="card budget-hero">
        <label className="stat-label" htmlFor="b-total">ميزانيتك الكلية</label>
        <div className="bh-total">
          <input id="b-total" className="num" inputMode="numeric" placeholder="اكتب المبلغ" value={total ? fmt(total) : ""} onChange={(e) => apply(setTotalBudget(+e.target.value.replace(/\D/g, "").slice(0, 9) || undefined))} />
          <span className="faint">ر.س</span>
          <div className="grow" />
          <button className="btn sm" disabled={!total} onClick={() => { apply(setTotalBudget(total, true)); toast("وزّعنا ميزانيتك على البنود"); }}><Icon name="Sparkles" size={15} /> وزّعها تلقائياً</button>
        </div>
        <div className="bh-meter">
          <div><small>موزّع على البنود</small><b className="num">{est ? sar(est) : "—"}</b></div>
          <div className={left < 0 ? "over" : ""}><small>{left < 0 ? "تجاوزت بـ" : "متبقي"}</small><b className="num">{!total ? "—" : left ? sar(Math.abs(left)) : "0 ر.س"}</b></div>
          <div><small>المدفوع</small><b className="num">{paid ? sar(paid) : "—"}</b></div>
        </div>
        <div style={{ display: "flex", height: 14, borderRadius: 10, overflow: "hidden", background: "var(--bg-2)", gap: 2 }}>{lines.map((b, i) => <i key={b.id} title={b.label} style={{ width: `${base ? (b.est / base) * 100 : 0}%`, background: colors[i % colors.length] }} />)}</div>
        <div className="row wrap" style={{ ["--gap" as string]: "12px", fontSize: 12.5 }}>{lines.map((b, i) => <span key={b.id} className="row" style={{ ["--gap" as string]: "5px" }}><i style={{ width: 9, height: 9, borderRadius: 3, background: colors[i % colors.length] }} />{b.label}</span>)}</div>
      </section>
      <section className="card" style={{ paddingBlock: 6 }}>
        <div className="list">{lines.map((b) => (
          <div key={b.id} className="list-row" style={{ flexWrap: "wrap" }}>
            <div className="t" style={{ minWidth: 140 }}><b>{b.label}</b><div className="bar ok" style={{ height: 5, marginTop: 6 }}><i style={{ width: `${b.est ? Math.min(100, (b.paid / b.est) * 100) : 0}%` }} /></div></div>
            <div className="field" style={{ width: 120 }}><label htmlFor={"e" + b.id}>المخصص</label><input id={"e" + b.id} type="number" className="input num" style={{ minHeight: 40 }} placeholder="0" value={b.est || ""} onChange={(e) => apply(updateBudget(b.id, { est: +e.target.value }))} /></div>
            <div className="field" style={{ width: 120 }}><label htmlFor={"p" + b.id}>المدفوع</label><input id={"p" + b.id} type="number" className="input num" style={{ minHeight: 40 }} placeholder="0" value={b.paid || ""} onChange={(e) => apply(updateBudget(b.id, { paid: +e.target.value }))} /></div>
            <button className="icon-btn sm" aria-label={"حذف " + b.label} onClick={() => apply(removeBudget(b.id))}><Icon name="Trash2" size={15} /></button>
          </div>
        ))}</div>
        <form className="row wrap" style={{ paddingBlock: 14 }} onSubmit={(e) => { e.preventDefault(); if (!n.label) return; apply(addBudget({ label: n.label, est: +n.est || 0, paid: 0, cat: "other" })); setN({ label: "", est: "" }); }}>
          <label className="sr" htmlFor="nb-l">بند جديد</label><input id="nb-l" className="input grow" style={{ width: "auto", minWidth: 160 }} placeholder="بند جديد: فستان، شبكة، هدايا…" value={n.label} onChange={(e) => setN({ ...n, label: e.target.value })} />
          <label className="sr" htmlFor="nb-e">المبلغ</label><input id="nb-e" className="input num" style={{ width: 120 }} type="number" placeholder="المبلغ" value={n.est} onChange={(e) => setN({ ...n, est: e.target.value })} />
          <button className="btn primary" type="submit"><Icon name="Plus" size={16} /> إضافة</button>
        </form>
      </section>
    </>
  );
}

/* ───── مهام العائلة ───── */
export function Tasks() {
  const db = useDB();
  const [open, setOpen] = useState(false);
  const [t, setT] = useState({ title: "", who: "", due: db.client.event!.date });
  const people = [...new Set(db.client.tasks.map((x) => x.who))];
  const [who, setWho] = useState("all");
  const list = db.client.tasks.filter((x) => who === "all" || x.who === who).sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due));
  const done = db.client.tasks.filter((x) => x.done).length;
  return (
    <>
      <div className="row between wrap"><div><h1 className="page-title">مهام العائلة</h1><p className="page-sub num">{done} من {db.client.tasks.length} منجزة</p></div><button className="btn primary" onClick={() => setOpen(true)}><Icon name="Plus" size={16} /> مهمة</button></div>
      <div className="bar" style={{ height: 10 }}><i style={{ width: `${db.client.tasks.length ? (done / db.client.tasks.length) * 100 : 0}%` }} /></div>
      <div className="chips">{["all", ...people].map((p) => <button key={p} className={"chip" + (who === p ? " on" : "")} onClick={() => setWho(p)}>{p === "all" ? "الكل" : p}</button>)}</div>
      <section className="card" style={{ paddingBlock: 6 }}>
        <div className="list">
          <AnimatePresence initial={false}>
            {list.map((x) => {
              const late = !x.done && x.due < today();
              return (
                <motion.div key={x.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="list-row">
                  <button className={"check" + (x.done ? " on" : "")} onClick={() => apply(toggleTask(x.id))} aria-label={x.done ? "إلغاء" : "تم"} aria-pressed={x.done}><Icon name="Check" size={14} /></button>
                  <div className="t" style={{ opacity: x.done ? 0.5 : 1 }}><b style={{ textDecoration: x.done ? "line-through" : undefined }}>{x.title}</b><small>{x.who} · <span className="num" style={{ color: late ? "var(--bad)" : undefined }}>{x.due}{late ? " · متأخرة" : ""}</span></small></div>
                  <button className="icon-btn sm" aria-label="حذف" onClick={() => apply(removeTask(x.id))}><Icon name="Trash2" size={15} /></button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
      <Sheet open={open} onClose={() => setOpen(false)} title="مهمة جديدة">
        <form className="form" onSubmit={(e) => { e.preventDefault(); if (!t.title) return; apply(addTask({ ...t, who: t.who || "أنا" })); setT({ ...t, title: "" }); setOpen(false); }}>
          <div className="field"><label htmlFor="t-t">المهمة</label><input id="t-t" className="input" required placeholder="مثال: استلام الكوشة" value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} /></div>
          <div className="field"><label htmlFor="t-w">المسؤول</label><input id="t-w" className="input" list="people" placeholder="مثال: خالد (الأخ)" value={t.who} onChange={(e) => setT({ ...t, who: e.target.value })} /><datalist id="people">{people.map((p) => <option key={p} value={p} />)}</datalist></div>
          <div className="field"><label htmlFor="t-d">الموعد</label><input id="t-d" type="date" className="input num" value={t.due} onChange={(e) => setT({ ...t, due: e.target.value })} /></div>
          <button className="btn primary lg block" type="submit">إضافة</button>
        </form>
      </Sheet>
    </>
  );
}

/* ───── يوم المناسبة: استقبال الضيوف ───── */
const REASON: Record<"unknown" | "already" | "declined" | "section", string> = { unknown: "الرمز غير موجود في قائمة الدعوات", already: "دخل مسبقاً", declined: "معتذر عن الحضور، تأكد من صاحب الدعوة", section: "" };
const SEC = { men: "قسم الرجال", women: "قسم النساء" } as const;
export const doorUrl = (key: string, section?: "men" | "women") => `${location.href.split("#")[0]}#door-${key}${section ? "-" + section : ""}`;

/* ───── يوم المناسبة (عند العميل): متابعة الحضور لحظياً + روابط المنسقين. المسح نفسه عند المنسق ───── */
export function Door() {
  const db = useDB();
  const toast = useToast();
  const key = db.client.doorKey;
  const inside = db.client.guests.filter((g) => g.checkedIn);
  const cnt = (s: "men" | "women", list = inside) => list.filter((g) => g.section === s).reduce((a, g) => a + g.count, 0);
  const expected = db.client.guests.filter((g) => g.status === "yes");
  const total = cnt("men", expected) + cnt("women", expected);
  const arrived = cnt("men") + cnt("women");
  const share = async (url: string) => {
    try { if (navigator.share) { await navigator.share({ url }); return; } } catch { return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank", "noopener");
  };
  const copy = async (url: string) => { try { await navigator.clipboard.writeText(url); toast("تم نسخ الرابط"); } catch { toast(url); } };
  const links: [string, "men" | "women" | undefined, string][] = [["منسق قسم الرجال", "men", "User"], ["منسقة قسم النساء", "women", "UserRound"], ["منسق لكل الأقسام", undefined, "Users"]];
  return (
    <>
      <div><h1 className="page-title">يوم المناسبة</h1><p className="page-sub">المنسق يستقبل ضيوفك عند الباب بمسح رمز دعوتهم، وأنت تتابع الحضور لحظة بلحظة.</p></div>
      <section className="card live-arrivals">
        <div className="row between"><span className="eyebrow"><span className="live-dot-c" /> الحضور الآن</span><span className="pill neutral num">{inside.length} من {db.client.guests.length} دعوة</span></div>
        <div className="la-big num"><Counter value={arrived} /><small>من {total || "—"} مؤكد</small></div>
        <span className="bar" style={{ height: 8 }}><i style={{ width: `${total ? Math.min(100, (arrived / total) * 100) : 0}%` }} /></span>
        <div className="la-split">
          <div><small>{SEC.men}</small><b className="num"><Counter value={cnt("men")} /> <span className="faint">/ {cnt("men", expected)}</span></b></div>
          <div><small>{SEC.women}</small><b className="num"><Counter value={cnt("women")} /> <span className="faint">/ {cnt("women", expected)}</span></b></div>
        </div>
      </section>

      <NightOps />

      <section className="card stack">
        <div><h3 className="display" style={{ margin: 0 }}>روابط المنسقين</h3><p className="muted" style={{ margin: "4px 0 0", fontSize: 14 }}>أرسل الرابط للمنسق أو الحارس. يفتح عنده شاشة استقبال فيها مسح بالكاميرا وقائمة الضيوف فقط، بدون ميزانيتك أو طلباتك.</p></div>
        {!key ? <button className="btn primary lg block" onClick={() => { apply(enableDoor()); toast("جهّزنا روابط الاستقبال"); }}><Icon name="ScanLine" size={18} /> فعّل الاستقبال الذكي</button> : <>
          <div className="list">{links.map(([label, sec, ic]) => (
            <div key={label} className="list-row door-link">
              <span className="avatar"><Icon name={ic} size={17} /></span>
              <div className="t"><b>{label}</b><small>{sec ? `يسجل ضيوف ${SEC[sec]} فقط، وينبّه لو جاه ضيف القسم الثاني` : "يسجل كل الضيوف"}</small></div>
              <div className="row" style={{ ["--gap" as string]: "6px" }}>
                <button className="icon-btn sm" aria-label={"إرسال رابط " + label} onClick={() => void share(doorUrl(key, sec))}><Icon name="Send" size={15} /></button>
                <button className="icon-btn sm" aria-label={"نسخ رابط " + label} onClick={() => void copy(doorUrl(key, sec))}><Icon name="Copy" size={15} /></button>
                <a className="icon-btn sm" aria-label={"معاينة شاشة " + label} href={"#door-" + key + (sec ? "-" + sec : "")}><Icon name="Eye" size={15} /></a>
              </div>
            </div>
          ))}</div>
          <button className="btn ghost sm" onClick={() => { apply(enableDoor(true)); toast("ألغينا الروابط القديمة وجهّزنا روابط جديدة"); }}><Icon name="RotateCcw" size={15} /> إلغاء الروابط الحالية وإنشاء روابط جديدة</button>
        </>}
      </section>

      <section className="card door-how">
        <div className="section-title"><h3>كيف يشتغل الاستقبال الذكي؟</h3></div>
        <ol>
          <li><span className="num">1</span><div><b>ضيفك يفتح دعوته</b><small>يطلع له رمز دخول خاص فيه اسمه وقسمه وعدد مرافقيه.</small></div></li>
          <li><span className="num">2</span><div><b>المنسق يمسح الرمز بالكاميرا</b><small>يعرف فوراً القسم وعدد المرافقين، ويرفض الرمز المكرر أو المعتذر.</small></div></li>
          <li><span className="num">3</span><div><b>أنت تتابع من جوالك</b><small>عدد الحاضرين في كل قسم يتحدث لحظياً، وتعرف وقت تبدأ العشاء.</small></div></li>
        </ol>
      </section>

      <section className="card">
        <div className="section-title"><h3>آخر الواصلين</h3></div>
        {inside.length ? <div className="list">{[...inside].reverse().slice(0, 10).map((g) => <div key={g.id} className="list-row"><span className={"avatar" + (g.section === "women" ? " alt" : "")}>{g.name[0]}</span><div className="t"><b>{g.name}</b><small>{g.section === "men" ? "رجال" : "نساء"}</small></div><span className="num faint">{g.count}</span></div>)}</div> : <p className="muted" style={{ margin: 0 }}>ما وصل أحد للحين. أول ما يمسح المنسق دعوة بتظهر هنا.</p>}
      </section>
    </>
  );
}

/* ───── غرفة عمليات الليلة: البرنامج، الموردين، كبار الضيوف، الطوارئ، والتقرير ───── */
function NightOps() {
  const db = useDB();
  const toast = useToast();
  const e = db.client.event!;
  const program = db.client.invite.program ?? [];
  const li = Math.min(db.client.liveIndex ?? 0, Math.max(0, program.length - 1));
  const vendors = db.bookings.filter((b) => b.fromClient && b.status === "confirmed");
  const name = (kind: string, id: string) => (kind === "venue" ? db.venues.find((v) => v.id === id)?.name : db.suppliers.find((s) => s.id === id)?.name) ?? "";
  const vips = db.client.guests.filter((g) => g.vip);
  const [sos, setSos] = useState(false);
  const [sosText, setSosText] = useState("");
  const past = e.date < today();
  const yes = db.client.guests.filter((g) => g.status === "yes");
  const came = db.client.guests.filter((g) => g.checkedIn);
  const noShow = yes.filter((g) => !g.checkedIn);
  const sum = (l: typeof yes) => l.reduce((a, g) => a + g.count, 0);
  const diets = db.client.guests.filter((g) => g.diet);
  const ops = db.ops ?? [];
  useOpsAlerts(ops, "client");
  return (
    <>
      {program.length > 0 && <section className="card stack">
        <div className="row between"><h3 className="display" style={{ margin: 0 }}>برنامج الليلة</h3><span className="pill neutral">يظهر عند المنسقين والضيوف</span></div>
        <div className="prog-now"><small>الآن</small><b className="display">{program[li].title}</b>{program[li + 1] && <span className="muted">التالي: {program[li + 1].title} · {program[li + 1].time}</span>}</div>
        <div className="row" style={{ ["--gap" as string]: "8px" }}>
          <button className="btn sm" disabled={li === 0} onClick={() => apply(setLiveIndex(li - 1))}><Icon name="ArrowRight" size={15} /> السابقة</button>
          <button className="btn sm primary grow" disabled={li >= program.length - 1} onClick={() => { apply(setLiveIndex(li + 1)); toast(`بدأت: ${program[li + 1].title}`); }}>ابدأ الفقرة التالية <Icon name="ArrowLeft" size={15} /></button>
        </div>
      </section>}

      <EndNight />

      <OpsFeed ops={ops} me="client" quick={OPS_QUICK.client} onSend={(text, kind) => apply(postOp({ from: "client", text, kind }))}
        sub={db.client.doorKey ? "أنت والإدارة والمنسق العام ومنسقو الأقسام في مكان واحد" : "فعّل الاستقبال الذكي تحت عشان ينضم لك المنسقون"} />

      {vendors.length > 0 && <section className="card">
        <div className="section-title"><h3>الموردين الليلة</h3></div>
        <div className="list">{vendors.map((b) => <div key={b.id} className="list-row"><span className="avatar"><Icon name={b.kind === "venue" ? "Building2" : "Store"} size={16} /></span><div className="t"><b>{name(b.kind, b.targetId)}</b><small>{b.kind === "venue" ? (b.vendorStatus === "ready" ? "القاعة جاهزة لاستقبالكم" : "محجوزة لك") : b.vendorStatus ? VLABEL[b.vendorStatus] : "لم يحدّث حالته بعد"}</small></div><span className={"pill " + (b.vendorStatus === "ready" ? "ok" : b.vendorStatus ? "info" : "neutral")}>{b.vendorStatus === "ready" ? (b.kind === "venue" ? "جاهزة" : "جاهز") : b.kind === "venue" ? "مؤكدة" : b.vendorStatus ? "في الطريق للجاهزية" : "بانتظار"}</span></div>)}</div>
      </section>}

      {vips.length > 0 && <section className="card">
        <div className="section-title"><h3>كبار الضيوف</h3><span className="faint" style={{ fontSize: 12.5 }}>ينبّهك المنسق أول ما يوصلون</span></div>
        <div className="list">{vips.map((g) => <div key={g.id} className="list-row"><span className="avatar" style={{ background: "linear-gradient(135deg,#fff1c9,#e7c27a 45%,#b8863d)", color: "#3a2208" }}><Icon name="Star" size={15} /></span><div className="t"><b>{g.name}</b><small>{g.section === "men" ? "رجال" : "نساء"}</small></div><span className={"pill " + (g.checkedIn ? "ok" : "neutral")}>{g.checkedIn ? "وصل" : "لم يصل"}</span></div>)}</div>
      </section>}

      {diets.length > 0 && <section className="card">
        <div className="section-title"><h3>ملاحظات الأكل من الضيوف</h3></div>
        <div className="list">{diets.map((g) => <div key={g.id} className="list-row"><div className="t"><b>{g.name}</b><small>{g.diet}</small></div></div>)}</div>
      </section>}

      {(past || e.endedAt) && <section className="card stack">
        <h3 className="display" style={{ margin: 0 }}>تقرير ليلتك</h3>
        <div className="la-split">
          <div><small>حضروا</small><b className="num">{sum(came)}</b></div>
          <div><small>أكدوا وما حضروا</small><b className="num">{sum(noShow)}</b></div>
          <div><small>اعتذروا</small><b className="num">{sum(db.client.guests.filter((g) => g.status === "no"))}</b></div>
          <div><small>كبار الضيوف الحاضرين</small><b className="num">{vips.filter((g) => g.checkedIn).length} / {vips.length}</b></div>
        </div>
      </section>}

      <section className="card sos">
        <div className="grow"><b className="display">صار شي طارئ؟</b><small className="muted">مورد ما وصل، أو مشكلة في القاعة. يوصل بلاغك للإدارة فوراً بأولوية قصوى.</small></div>
        {!sos ? <button className="btn sos-btn" onClick={() => setSos(true)}><Icon name="ShieldAlert" size={17} /> بلاغ طارئ</button>
          : <form className="row wrap" style={{ width: "100%" }} onSubmit={(ev) => { ev.preventDefault(); apply(openTicket({ from: "client", fromId: "me", fromName: db.client.profile?.name ?? "عميل", topic: "booking", subject: `بلاغ طارئ: ${e.title}`, text: sosText.trim() || "بلاغ طارئ من غرفة العمليات", urgent: true })); setSos(false); setSosText(""); toast("وصل بلاغك للإدارة الآن"); }}>
            <label className="sr" htmlFor="sos-t">وش صار؟</label>
            <input id="sos-t" className="input grow" style={{ minWidth: 180, width: "auto" }} placeholder="وش صار؟ (اختياري)" value={sosText} onChange={(ev) => setSosText(ev.target.value)} autoFocus />
            <button className="btn sos-btn" type="submit">أرسل الآن</button>
          </form>}
      </section>
    </>
  );
}

/* ───── ختم الليلة بعد العشاء: شكر الضيوف، تقييم الموردين، وإبلاغ الفريق ───── */
function EndNight() {
  const db = useDB();
  const toast = useToast();
  const e = db.client.event!;
  const program = db.client.invite.program ?? [];
  const li = Math.min(db.client.liveIndex ?? 0, Math.max(0, program.length - 1));
  const vendors = db.bookings.filter((b) => b.fromClient && b.status === "confirmed");
  const name = (kind: string, id: string) => (kind === "venue" ? db.venues.find((v) => v.id === id)?.name : db.suppliers.find((s) => s.id === id)?.name) ?? "";
  const [open, setOpen] = useState(false);
  const [party, setParty] = useState(false);
  const [thanks, setThanks] = useState(e.thanks ?? DEFAULT_THANKS);
  const [rate, setRate] = useState<Record<string, number>>(() => Object.fromEntries(vendors.map((b) => [b.id, b.rating?.stars ?? 5])));
  const came = db.client.guests.filter((g) => g.checkedIn).reduce((a, g) => a + g.count, 0);
  const dinner = program.findIndex((p) => /عشاء|العشا/.test(p.title));
  const afterDinner = (dinner >= 0 && li >= dinner) || (program.length > 0 && li >= program.length - 1) || e.date <= today();
  const host = db.client.profile?.name ?? "";
  const shareThanks = async () => {
    const text = `${e.thanks ?? thanks}${host ? `\n— ${host}` : ""}`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch { return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };
  const finish = () => { apply(endEvent({ thanks, ratings: rate })); setOpen(false); setParty(true); setTimeout(() => setParty(false), 4200); };

  if (e.endedAt) return (
    <section className="card end-done">
      <AnimatePresence>{party && <Confetti />}</AnimatePresence>
      <span className="end-ico"><Icon name="PartyPopper" size={26} /></span>
      <div className="grow">
        <span className="eyebrow">ختمنا الليلة</span>
        <h3 className="display" style={{ margin: "2px 0 6px" }}>مبروك، انتهت ليلتك على خير</h3>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>حضر <b className="num">{fmt(came)}</b> ضيف. دعوة كل ضيف صارت تعرض رسالة شكرك، وشاشات المنسقين توقفت، والإدارة وصلها الختم.</p>
      </div>
      <div className="row wrap" style={{ ["--gap" as string]: "8px" }}>
        <button className="btn primary" onClick={() => void shareThanks()}><Icon name="Send" size={16} /> أرسل الشكر للضيوف</button>
        <button className="btn ghost sm" onClick={() => { apply(reopenEvent()); toast("رجّعنا الليلة مفتوحة"); }}>تراجع عن الختم</button>
      </div>
    </section>
  );

  return (
    <>
      <section className={"card end-cta" + (afterDinner ? " hot" : "")}>
        <span className="end-ico"><Icon name="Moon" size={24} /></span>
        <div className="grow">
          <b className="display">{afterDinner ? "خلص العشاء؟ اختم ليلتك" : "ختم الليلة (بعد العشاء)"}</b>
          <small className="muted">رسالة شكر توصل لكل ضيف في دعوته، تقييم سريع للموردين، وتبليغ المنسقين والإدارة إن الليلة انتهت.</small>
        </div>
        <button className={"btn" + (afterDinner ? " primary" : "")} onClick={() => setOpen(true)}><Icon name="Sparkles" size={16} /> اختم الليلة</button>
      </section>
      <Sheet open={open} onClose={() => setOpen(false)} title="ختم الليلة">
        <div className="stack">
          <div className="la-split">
            <div><small>حضروا</small><b className="num">{fmt(came)}</b></div>
            <div><small>كبار الضيوف</small><b className="num">{db.client.guests.filter((g) => g.vip && g.checkedIn).length} / {db.client.guests.filter((g) => g.vip).length}</b></div>
          </div>
          {vendors.length > 0 && <div className="field"><span className="label">كيف كانوا الليلة؟ (يوصل تقييمك للإدارة)</span>
            <div className="list">{vendors.map((b) => <div key={b.id} className="list-row"><div className="t"><b>{name(b.kind, b.targetId)}</b></div>
              <div className="stars" role="radiogroup" aria-label={"تقييم " + name(b.kind, b.targetId)}>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={rate[b.id] === n} className={n <= (rate[b.id] ?? 0) ? "on" : ""} onClick={() => setRate({ ...rate, [b.id]: n })} aria-label={`${n} من 5`}><Icon name="Star" size={20} /></button>)}</div>
            </div>)}</div>
          </div>}
          <div className="field"><label htmlFor="th">رسالة الشكر لضيوفك</label><textarea id="th" className="input" rows={4} value={thanks} onChange={(ev) => setThanks(ev.target.value)} /><small className="faint">تظهر لكل ضيف لما يفتح رابط دعوته.</small></div>
          <button className="btn primary lg block" onClick={finish}><Icon name="PartyPopper" size={18} /> اختم الليلة</button>
        </div>
      </Sheet>
    </>
  );
}

function Confetti() {
  const bits = Array.from({ length: 36 }, (_, i) => i);
  const colors = ["#b8863d", "#e7c27a", "#7a1f3f", "#f4d6df", "#3dd39b", "#ffffff"];
  return (
    <motion.div className="end-confetti" aria-hidden="true" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {bits.map((i) => <motion.i key={i} style={{ left: `${(i * 29) % 100}%`, background: colors[i % colors.length] }} initial={{ y: -20, rotate: 0, opacity: 1 }} animate={{ y: 420, rotate: 360 + i * 40, opacity: [1, 1, 0] }} transition={{ duration: 2.4 + (i % 5) * 0.3, delay: (i % 7) * 0.08, ease: "easeIn" }} />)}
    </motion.div>
  );
}

/* ───── شاشة المنسق عند الباب (رابط مستقل يفتحه المنسق على جواله) ───── */
const beep = (ok: boolean) => {
  try {
    const W = window as unknown as { __ac?: AudioContext; webkitAudioContext?: typeof AudioContext };
    const ac = (W.__ac ??= new (window.AudioContext || W.webkitAudioContext!)());
    const t = ac.currentTime;
    (ok ? [880, 1318.5] : [220, 196]).forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = ok ? "sine" : "square"; o.frequency.value = f; g.gain.setValueAtTime(0, t + i * 0.11); g.gain.linearRampToValueAtTime(ok ? 0.18 : 0.06, t + i * 0.11 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 0.3); o.connect(g).connect(ac.destination); o.start(t + i * 0.11); o.stop(t + i * 0.11 + 0.32); });
  } catch { /* */ }
};

export function DoorStation({ k, section }: { k: string; section?: "men" | "women" }) {
  const db = useDB();
  const local = !!db.client.doorKey && db.client.doorKey === k;
  const [remote, setRemote] = useState<DoorSnapshot | null | undefined>(undefined);
  const [code, setCode] = useState("");
  const [q, setQ] = useState("");
  const [manual, setManual] = useState(false);
  const [res, setRes] = useState<(CheckInResult & { at: number }) | null>(null);
  const me: "all" | "men" | "women" = section ?? "all";
  const pull = useRef<() => void>(() => {});
  useEffect(() => {
    if (local || !repo.door) return;
    let alive = true;
    pull.current = () => { void repo.door!.load(k).then((s) => alive && setRemote(s)).catch(() => alive && setRemote(null)); };
    pull.current(); const t = setInterval(() => pull.current(), 4000);
    return () => { alive = false; clearInterval(t); };
  }, [k, local]);
  useEffect(() => { document.title = "استقبال الضيوف · مناسبتي"; }, []);

  const ops = (local ? db.ops ?? [] : remote?.ops ?? []);
  useOpsAlerts(ops, me);

  const valid = local || (remote !== null && !!repo.door);
  if (!valid || (!local && remote === undefined && repo.door)) {
    return (
      <div className="station center">
        {(!local && remote === undefined && repo.door) ? <div className="gen-orb" /> : <>
          <Icon name="ShieldAlert" size={40} />
          <h1 className="display">الرابط غير صالح</h1>
          <p>انتهت صلاحية رابط الاستقبال أو تم إلغاؤه. اطلب رابطاً جديداً من صاحب المناسبة.</p>
        </>}
      </div>
    );
  }
  const title = local ? db.client.event?.title ?? "المناسبة" : remote!.title;
  const endedAt = local ? db.client.event?.endedAt : remote!.endedAt;
  const guests = local ? db.client.guests : remote!.guests;
  const program = local ? db.client.invite.program ?? [] : remote!.program ?? [];
  const live = program[Math.min(local ? db.client.liveIndex ?? 0 : remote!.live ?? 0, Math.max(0, program.length - 1))];
  const mine = section ? guests.filter((g) => g.section === section) : guests;
  const inside = mine.filter((g) => g.checkedIn);
  const expected = mine.filter((g) => g.status === "yes");
  const sum = (l: typeof guests) => l.reduce((a, g) => a + g.count, 0);
  const post = async (text: string, kind: OpsMsg["kind"]) => {
    if (local) { apply(postOp({ from: me, text, kind })); return; }
    const ok = await repo.door!.post(k, me, text, kind === "alert" ? "alert" : "msg");
    if (ok) pull.current();
  };

  // ختم الليلة: الشاشة تتحول لملخص وتتوقف الكاميرا
  if (endedAt) {
    return (
      <div className="station center st-ended">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="st-ended-ico"><Icon name="PartyPopper" size={44} /></motion.div>
        <h1 className="display">انتهت الليلة</h1>
        <p>شكراً على تعبك{section ? ` في ${SEC[section]}` : ""}. صاحب المناسبة ختم الليلة.</p>
        <div className="st-ended-stats num"><div><b>{sum(inside)}</b><small>دخلوا</small></div><div><b>{sum(expected)}</b><small>مؤكد</small></div><div><b>{inside.filter((g) => g.vip).length}</b><small>كبار الضيوف</small></div></div>
        <div style={{ width: "100%", maxWidth: 520 }}><OpsFeed dark ops={ops} me={me} quick={[["شكراً، تشرفنا بخدمتكم", "msg"]]} onSend={post} title="غرفة التنسيق" /></div>
      </div>
    );
  }

  const scan = async (raw: string, force = false) => {
    if (!raw.trim()) return;
    let result: CheckInResult;
    const g = guests.find((x) => x.code === normCode(raw));
    if (g && section && g.section !== section && !g.checkedIn && !force) result = { ok: false, reason: "section", guest: g };
    else if (local) { const out = checkIn(repo.get(), raw); if (out.result.ok) apply(() => out.db); result = out.result; }
    else { result = await repo.door!.checkIn(k, raw); if (result.ok) setRemote((s) => s && { ...s, guests: s.guests.map((x) => (x.code === result.guest!.code ? { ...x, checkedIn: true, status: "yes" } : x)) }); }
    beep(result.ok);
    try { navigator.vibrate?.(result.ok ? 70 : [40, 60, 40]); } catch { /* */ }
    setRes({ ...result, at: Date.now() }); setCode("");
    // ضيف كبير وصل: ننبه صاحب المناسبة والفريق تلقائياً
    if (result.ok && result.guest.vip) void post(`وصل ضيف كبير: ${result.guest.name} (${SEC[result.guest.section]})`, "msg");
  };
  const found = q.trim() ? mine.filter((g) => g.name.includes(q.trim()) && !g.checkedIn).slice(0, 6) : [];

  return (
    <div className="station">
      <header className="st-head">
        <div><span className="st-eyebrow"><span className="live-dot-c" /> {section ? `استقبال ${SEC[section]}` : "المنسق العام · كل الأقسام"}</span><h1 className="display">{title}</h1></div>
        <div className="st-count num"><b><Counter value={sum(inside)} /></b><small>من {sum(expected)}</small></div>
      </header>
      {live && <div className="st-now"><Icon name="Radio" size={15} /> الآن: <b>{live.title}</b></div>}

      {manual ? null : <CameraGate onCode={(c) => { void scan(c); }} onManual={() => setManual(true)} />}

      <section className="scanner compact">
        {manual && <button className="btn white" onClick={() => setManual(false)}><Icon name="Camera" size={17} /> رجّع الكاميرا</button>}
        <form className="row" style={{ width: "100%", maxWidth: 420 }} onSubmit={(e) => { e.preventDefault(); void scan(code); }}>
          <label className="sr" htmlFor="sc">رمز الدعوة</label>
          <input id="sc" className="input num grow" placeholder="أو اكتب رمز الدعوة" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
          <button className="btn glass" type="submit">تحقق</button>
        </form>
        <AnimatePresence mode="wait">
          {res && (
            <motion.div key={res.at} className={"scan-res " + (res.ok ? "ok" : res.reason === "section" ? "warn" : "bad")} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 26 }}>
              <Icon name={res.ok ? "CheckCircle2" : res.reason === "section" ? "ArrowLeftRight" : "XCircle"} size={30} style={{ color: res.ok ? "#3dd39b" : res.reason === "section" ? "#ffc35c" : "#ff6b62" }} />
              <div className="grow">
                <b className="display">{res.ok ? `أهلاً ${res.guest.name}` : res.reason === "section" ? `${res.guest!.name}: ضيف ${SEC[res.guest!.section]}` : `${res.guest?.name ?? ""} ${REASON[res.reason]}`}</b>
                {res.ok && res.guest.vip && <div className="st-vip"><Icon name="Star" size={13} /> ضيف كبير: رحّب فيه، وبلّغنا صاحب المناسبة تلقائياً</div>}
                {res.guest && <div style={{ fontSize: 13, opacity: 0.8 }}>{!res.ok && res.reason === "section" ? `وجّهه لمدخل ${SEC[res.guest.section]}` : `${SEC[res.guest.section]} · ${res.guest.count} ${res.guest.count > 1 ? "أشخاص" : "شخص"}`}</div>}
              </div>
              {!res.ok && res.reason === "section" && <button className="btn sm white" onClick={() => void scan(res.guest!.code, true)}>دخّله هنا</button>}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <OpsFeed dark ops={ops} me={me} quick={OPS_QUICK.coord} onSend={post} sub="صاحب المناسبة والإدارة وباقي المنسقين يشوفون رسالتك فوراً" />

      <section className="st-card">
        <label className="st-label" htmlFor="st-q"><Icon name="Search" size={15} /> ضيف نسي جواله؟ ابحث باسمه</label>
        <input id="st-q" className="input" placeholder="اسم الضيف" value={q} onChange={(e) => setQ(e.target.value)} />
        {found.length > 0 && <div className="list">{found.map((g) => (
          <div key={g.id} className="list-row"><span className={"avatar" + (g.section === "women" ? " alt" : "")}>{g.name[0]}</span><div className="t"><b>{g.name}</b><small>{SEC[g.section]} · {g.count} {g.count > 1 ? "أشخاص" : "شخص"}{g.status === "no" ? " · معتذر" : ""}</small></div><button className="btn sm white" onClick={() => { void scan(g.code); setQ(""); }}>تسجيل دخول</button></div>
        ))}</div>}
      </section>

      <section className="st-card">
        <span className="st-label">آخر الداخلين</span>
        {inside.length ? <div className="list">{[...inside].reverse().slice(0, 8).map((g) => <div key={g.id} className="list-row"><span className={"avatar" + (g.section === "women" ? " alt" : "")}>{g.name[0]}</span><div className="t"><b>{g.name}</b><small>{SEC[g.section]}</small></div><span className="num">{g.count}</span></div>)}</div> : <p style={{ opacity: 0.6, margin: 0 }}>ما دخل أحد للحين.</p>}
      </section>
      <p className="st-foot">شاشة استقبال من <b>مناسبتي</b> · لا تعرض أي بيانات مالية</p>
    </div>
  );
}

/* ───── الكاميرا عند المنسق: نطلب الإذن أول ما تفتح الشاشة، وما نكمل بدونها ─────
   المسح يشتغل على كل الجوالات: BarcodeDetector المدمج (Chrome/Android) وإلا مكتبة jsQR (آيفون وغيره) */
type CamState = "starting" | "ask" | "denied" | "unsupported" | "insecure" | "live" | "error";
type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };
const UA = typeof navigator !== "undefined" ? navigator.userAgent : "";
const IOS = /iPhone|iPad|iPod/i.test(UA) || (/Macintosh/.test(UA) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1);
const IN_APP = /FBAN|FBAV|Instagram|Snapchat|Line\/|TikTok|; wv\)/i.test(UA);

function CameraGate({ onCode, onManual }: { onCode: (code: string) => void; onManual: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CamState>("starting");
  const [torch, setTorch] = useState<null | boolean>(null);
  const [hit, setHit] = useState(0);
  const stream = useRef<MediaStream | null>(null);
  const last = useRef({ code: "", at: 0 });
  const cb = useRef(onCode); cb.current = onCode;

  const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; };
  const start = async () => {
    if (!window.isSecureContext) { setState("insecure"); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setState("unsupported"); return; }
    setState("starting");
    try {
      stop();
      const s = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } });
      stream.current = s;
      const v = video.current; if (v) { v.srcObject = s; v.setAttribute("playsinline", "true"); await v.play().catch(() => {}); }
      const track = s.getVideoTracks()[0];
      const caps = (track.getCapabilities?.() ?? {}) as { torch?: boolean; focusMode?: string[] };
      setTorch(caps.torch ? false : null);
      if (caps.focusMode?.includes("continuous")) void track.applyConstraints({ advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet] }).catch(() => {});
      setState("live");
    } catch (e) {
      const n = (e as DOMException)?.name;
      setState(n === "NotAllowedError" || n === "SecurityError" ? "denied" : n === "NotFoundError" || n === "OverconstrainedError" ? "unsupported" : "error");
    }
  };

  // أول ما تفتح الشاشة: نطلب الكاميرا مباشرة (المتصفح يعرض نافذة الإذن)
  useEffect(() => {
    let perm: PermissionStatus | null = null;
    const onPerm = () => { if (perm?.state === "granted") void start(); else if (perm?.state === "denied") { stop(); setState("denied"); } };
    void (async () => {
      try { perm = await navigator.permissions?.query({ name: "camera" as PermissionName }); perm?.addEventListener("change", onPerm); } catch { /* سفاري القديم */ }
      if (perm?.state === "denied") setState("denied"); else void start();
    })();
    // الجوال يقفل الكاميرا لما تطلع من الصفحة: نرجعها تلقائياً لما ترجع
    const vis = () => { if (document.hidden) stop(); else if (perm?.state !== "denied") void start(); };
    document.addEventListener("visibilitychange", vis);
    return () => { stop(); perm?.removeEventListener("change", onPerm); document.removeEventListener("visibilitychange", vis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // قراءة الرمز من الفيديو
  useEffect(() => {
    if (state !== "live") return;
    let alive = true, timer = 0;
    const W = window as unknown as { BarcodeDetector?: (new (o: { formats: string[] }) => Detector) & { getSupportedFormats?: () => Promise<string[]> } };
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let detect: ((v: HTMLVideoElement) => Promise<string | undefined>) | null = null;
    void (async () => {
      const formats = await W.BarcodeDetector?.getSupportedFormats?.().catch(() => []) ?? [];
      if (W.BarcodeDetector && formats.includes("qr_code")) {
        const d = new W.BarcodeDetector({ formats: ["qr_code"] });
        detect = async (v) => (await d.detect(v))[0]?.rawValue;
      } else {
        const jsQR = (await import("jsqr")).default;
        let turn = 0;
        detect = async (v) => {
          if (!ctx || !v.videoWidth) return undefined;
          // نبدّل بين الإطار كامل (رمز قريب يملأ الشاشة) والمربع اللي في النص مكبّر (رمز بعيد)
          const vw = v.videoWidth, vh = v.videoHeight, full = turn++ % 2 === 0;
          const side = full ? 0 : Math.min(vw, vh) * 0.62;
          const [sx, sy, sw, sh] = full ? [0, 0, vw, vh] : [(vw - side) / 2, (vh - side) / 2, side, side];
          const k = Math.min(1, 640 / Math.max(sw, sh)), w = Math.round(sw * k), h = Math.round(sh * k);
          canvas.width = w; canvas.height = h;
          ctx.drawImage(v, sx, sy, sw, sh, 0, 0, w, h);
          return jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "attemptBoth" })?.data;
        };
      }
      const tick = async () => {
        if (!alive) return;
        const v = video.current;
        if (v && v.readyState >= 2 && detect) {
          try {
            const raw = await detect(v);
            if (raw && (raw !== last.current.code || Date.now() - last.current.at > 2500)) { last.current = { code: raw, at: Date.now() }; setHit(Date.now()); cb.current(raw); }
          } catch { /* إطار غير جاهز */ }
        }
        timer = window.setTimeout(tick, 180);
      };
      void tick();
    })();
    return () => { alive = false; clearTimeout(timer); };
  }, [state]);

  const toggleTorch = () => {
    const track = stream.current?.getVideoTracks()[0]; if (!track || torch === null) return;
    void track.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] }).then(() => setTorch(!torch)).catch(() => setTorch(null));
  };

  if (state === "live" || state === "starting") return (
    <section className="cam-live">
      <video ref={video} playsInline muted autoPlay />
      <div className={"cam-frame" + (hit && Date.now() - hit < 700 ? " hit" : "")} aria-hidden="true"><i /><i /><i /><i /><motion.span className="laser" animate={{ top: ["14%", "84%", "14%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} /></div>
      <div className="cam-bar">
        <span>{state === "starting" ? "نشغّل الكاميرا…" : "وجّه الكاميرا على رمز الدعوة"}</span>
        {torch !== null && <button className={"icon-btn sm" + (torch ? " on" : "")} onClick={toggleTorch} aria-pressed={torch} aria-label="الفلاش"><Icon name={torch ? "FlashlightOff" : "Flashlight"} size={16} /></button>}
      </div>
    </section>
  );

  // شاشة إلزامية: المنسق لازم يسمح بالكاميرا
  return (
    <section className="cam-gate">
      <video ref={video} playsInline muted hidden />
      <span className="cam-gate-ico"><Icon name={state === "denied" ? "CameraOff" : "Camera"} size={30} /></span>
      <h2 className="display">{state === "denied" ? "الكاميرا مقفلة" : state === "insecure" ? "افتح الرابط الآمن" : state === "unsupported" ? "ما لقينا كاميرا" : "شاشة الاستقبال تحتاج الكاميرا"}</h2>
      <p>{state === "denied" ? "عشان تمسح دعوات الضيوف بسرعة، لازم تسمح للمتصفح بالكاميرا:" : state === "insecure" ? "الكاميرا تشتغل فقط على رابط يبدأ بـ https. افتح الرابط اللي وصلك كما هو." : state === "unsupported" ? "هذا الجهاز أو المتصفح ما فيه كاميرا متاحة. جرّب جوال ثاني أو متصفح Chrome أو Safari." : "اضغط الزر وبعدين «سماح» في النافذة اللي تطلع."}</p>
      {state === "denied" && <ol className="cam-steps">
        {IN_APP && <li>أنت فاتح الرابط من داخل تطبيق. افتحه في <b>{IOS ? "Safari" : "Chrome"}</b> من قائمة المشاركة أو ⋮</li>}
        {IOS ? <>
          <li>اضغط <b>«aA»</b> أو أيقونة الإعدادات يسار شريط العنوان</li>
          <li>اختر <b>إعدادات موقع الويب</b> ثم <b>الكاميرا ← سماح</b></li>
          <li>أو من <b>الإعدادات ← Safari ← الكاميرا ← سماح</b></li>
        </> : <>
          <li>اضغط <b>القفل 🔒</b> أو أيقونة الإعدادات جنب الرابط</li>
          <li>اختر <b>الأذونات ← الكاميرا ← سماح</b></li>
        </>}
        <li>ارجع هنا واضغط الزر تحت</li>
      </ol>}
      <div className="stack" style={{ width: "100%", maxWidth: 340 }}>
        {state === "denied" && IOS
          ? <button className="btn white lg block" onClick={() => location.reload()}><Icon name="RotateCcw" size={18} /> سمحت، حدّث الصفحة</button>
          : <button className="btn white lg block" onClick={() => void start()}><Icon name="Camera" size={18} /> {state === "denied" ? "سمحت، جرّب مرة ثانية" : "اسمح بالكاميرا"}</button>}
        <button className="btn ghost sm cam-skip" onClick={onManual}>الكاميرا خربانة؟ استقبل بكتابة الرمز أو اسم الضيف</button>
      </div>
    </section>
  );
}
