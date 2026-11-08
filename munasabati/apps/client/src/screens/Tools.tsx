import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  acceptQuote, addBudget, addTask, checkIn, enableDoor, fmt, normCode, openTicket, setLiveIndex, hospitality, removeBudget, removeTask, sar, setBookingStatus, setTotalBudget, toggleTask, today, updateBudget,
  type CheckInResult, type DoorSnapshot,
} from "@munasabati/core";
import { BookingChat, Counter, Empty, Icon, Segmented, Sheet, StatusPill, apply, repo, useDB, useToast } from "@munasabati/ui";
import { go } from "../nav";

/* ───── الحجوزات ───── */
export function Bookings() {
  const db = useDB();
  const toast = useToast();
  const mine = db.bookings.filter((b) => b.fromClient);
  const nameOf = (kind: string, id: string) => (kind === "venue" ? db.venues.find((v) => v.id === id)?.name : db.suppliers.find((s) => s.id === id)?.name) ?? "";
  return (
    <>
      <div className="row between wrap"><div><h1 className="page-title">حجوزاتي</h1><p className="page-sub">طلباتك مع القاعات والموردين وردودهم.</p></div><button className="btn primary" onClick={() => go("plan")}><Icon name="Sparkles" size={16} /> خطتي المقترحة</button></div>
      {!mine.length && <section className="card"><Empty icon="CalendarSearch" title="ما عندك طلبات للحين">جهّزنا لك خطة على ذوقك وميزانيتك. أرسل الطلبات كلها بضغطة.<button className="btn primary" style={{ marginTop: 6 }} onClick={() => go("plan")}>شوف خطتي</button></Empty></section>}
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
            {b.status === "confirmed" && b.vendorStatus && <div className="vstat-view"><Icon name="Radio" size={15} /> حالة التاجر: <b>{VLABEL[b.vendorStatus]}</b></div>}
            <div className="row"><BookingChat booking={b} me="client" other={nameOf(b.kind, b.targetId)} /></div>
            {b.messages.filter((m) => m.from !== "client").map((m, i) => <div key={i} className={"card flat tight" + (m.from === "admin" ? " admin-note" : "")} style={{ background: "var(--surface-2)", fontSize: 14 }}><b className="display" style={{ fontSize: 12.5, display: "block", color: m.from === "admin" ? "var(--brand)" : "var(--muted)" }}>{m.from === "admin" ? "إدارة مناسبتي" : `رد ${nameOf(b.kind, b.targetId)}`}</b>{m.text}</div>)}
            {b.status === "quoted" && (
              <div className="row wrap">
                <span className="grow">عرض السعر: <b className="num display" style={{ fontSize: 18 }}>{sar(b.quote ?? 0)}</b></span>
                <button className="btn sm ghost" onClick={() => apply(setBookingStatus(b.id, "declined", { message: { from: "client", text: "اعتذر العميل" } }))}>رفض</button>
                <button className="btn sm primary" onClick={() => { apply(acceptQuote(b.id, nameOf(b.kind, b.targetId))); toast("تم تأكيد الحجز وإضافته للميزانية"); }}>اقبل العرض</button>
              </div>
            )}
            {b.status === "new" && <div className="faint" style={{ fontSize: 13 }}>بانتظار الرد. للتجربة: افتح {b.kind === "venue" ? <a className="brand" href={import.meta.env.VITE_VENUES_URL ?? "../venues/index.html"}>بوابة القاعات</a> : <a className="brand" href={import.meta.env.VITE_VENDORS_URL ?? "../vendors/index.html"}>بوابة الموردين</a>} ورد على الطلب.</div>}
          </motion.section>
        ))}
      </div>
    </>
  );
}

const VLABEL = { onway: "في الطريق", arrived: "وصل الموقع", setup: "يجهّز الآن", ready: "جاهز" } as const;
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

/* ───── حاسبة الضيافة ───── */
export function Hosp() {
  const db = useDB();
  const e = db.client.event!;
  const yesOf = (s: "men" | "women") => db.client.guests.filter((g) => g.status === "yes" && g.section === s).reduce((a, g) => a + g.count, 0);
  const [basis, setBasis] = useState<"expected" | "confirmed">("expected");
  const [style, setStyle] = useState<"traditional" | "buffet">("traditional");
  const [men, setMen] = useState(Math.round(e.guests * e.menRatio));
  const [women, setWomen] = useState(e.guests - Math.round(e.guests * e.menRatio));
  const M = basis === "confirmed" ? yesOf("men") : men, W = basis === "confirmed" ? yesOf("women") : women;
  const h = hospitality(M, W, style);
  const tiles: [string, number, string, string][] = [
    ["Beef", h.sheep, "ذبيحة", style === "traditional" ? "ذبيحة لكل 8 رجال و9 نساء" : "ذبيحة لكل 8 رجال"],
    ["Wheat", h.rice, "كجم رز", "220 جرام للشخص"], ["Coffee", h.coffee, "كجم قهوة", "3 فناجين للضيف"], ["Cherry", h.dates, "كجم تمر", "40 جرام للضيف"],
    ["Cake", h.sweets, "قطعة حلا", "قطعة ونص للضيف"], ["CupSoda", h.water, "كرتون ماء", "عبوتين للضيف"], ["Users", h.servers, "قهوجي وصباب", "واحد لكل 70 ضيف بكل قسم"], ["Armchair", h.tables, "طاولة نساء", "10 كراسي للطاولة"],
  ];
  return (
    <>
      <div><h1 className="page-title">حاسبة الضيافة</h1><p className="page-sub">تقديرات استرشادية للكميات. راجعها مع الطباخ قبل الطلب.</p></div>
      <section className="card stack">
        <div className="row wrap"><Segmented value={basis} onChange={setBasis} label="الأساس" options={[["expected", "العدد المتوقع"], ["confirmed", `المؤكدين (${yesOf("men") + yesOf("women")})`]]} /><Segmented value={style} onChange={setStyle} label="العشاء" options={[["traditional", "ذبائح للقسمين"], ["buffet", "بوفيه للنساء"]]} /></div>
        {basis === "expected" && <div className="form-2">
          <div className="field"><label htmlFor="h-m">رجال</label><input id="h-m" type="number" min={0} className="input num" value={men} onChange={(ev) => setMen(+ev.target.value)} /></div>
          <div className="field"><label htmlFor="h-w">نساء</label><input id="h-w" type="number" min={0} className="input num" value={women} onChange={(ev) => setWomen(+ev.target.value)} /></div>
        </div>}
      </section>
      <div className="calc-grid">{tiles.map(([ic, v, u, hint]) => <div key={u} className="calc-tile"><span className="ci"><Icon name={ic} size={19} /></span><b><Counter value={v} /></b><div className="display" style={{ fontWeight: 600 }}>{u}</div><small>{hint}</small></div>)}</div>
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

      {vendors.length > 0 && <section className="card">
        <div className="section-title"><h3>الموردين الليلة</h3></div>
        <div className="list">{vendors.map((b) => <div key={b.id} className="list-row"><span className="avatar"><Icon name={b.kind === "venue" ? "Building2" : "Store"} size={16} /></span><div className="t"><b>{name(b.kind, b.targetId)}</b><small>{b.vendorStatus ? VLABEL[b.vendorStatus] : "لم يحدّث حالته بعد"}</small></div><span className={"pill " + (b.vendorStatus === "ready" ? "ok" : b.vendorStatus ? "info" : "neutral")}>{b.vendorStatus === "ready" ? "جاهز" : b.vendorStatus ? "في الطريق للجاهزية" : "بانتظار"}</span></div>)}</div>
      </section>}

      {vips.length > 0 && <section className="card">
        <div className="section-title"><h3>كبار الضيوف</h3><span className="faint" style={{ fontSize: 12.5 }}>ينبّهك المنسق أول ما يوصلون</span></div>
        <div className="list">{vips.map((g) => <div key={g.id} className="list-row"><span className="avatar" style={{ background: "linear-gradient(135deg,#fff1c9,#e7c27a 45%,#b8863d)", color: "#3a2208" }}><Icon name="Star" size={15} /></span><div className="t"><b>{g.name}</b><small>{g.section === "men" ? "رجال" : "نساء"}</small></div><span className={"pill " + (g.checkedIn ? "ok" : "neutral")}>{g.checkedIn ? "وصل" : "لم يصل"}</span></div>)}</div>
      </section>}

      {diets.length > 0 && <section className="card">
        <div className="section-title"><h3>ملاحظات الأكل من الضيوف</h3></div>
        <div className="list">{diets.map((g) => <div key={g.id} className="list-row"><div className="t"><b>{g.name}</b><small>{g.diet}</small></div></div>)}</div>
      </section>}

      {past && <section className="card stack">
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
  const [cam, setCam] = useState(false);
  const [res, setRes] = useState<(CheckInResult & { at: number }) | null>(null);
  useEffect(() => {
    if (local || !repo.door) return;
    let alive = true;
    const pull = () => repo.door!.load(k).then((s) => alive && setRemote(s)).catch(() => alive && setRemote(null));
    void pull(); const t = setInterval(pull, 5000);
    return () => { alive = false; clearInterval(t); };
  }, [k, local]);
  useEffect(() => { document.title = "استقبال الضيوف · مناسبتي"; }, []);

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
  const guests = local ? db.client.guests : remote!.guests;
  const program = local ? db.client.invite.program ?? [] : remote!.program ?? [];
  const live = program[Math.min(local ? db.client.liveIndex ?? 0 : remote!.live ?? 0, Math.max(0, program.length - 1))];
  const mine = section ? guests.filter((g) => g.section === section) : guests;
  const inside = mine.filter((g) => g.checkedIn);
  const expected = mine.filter((g) => g.status === "yes");
  const sum = (l: typeof guests) => l.reduce((a, g) => a + g.count, 0);

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
  };
  const found = q.trim() ? mine.filter((g) => g.name.includes(q.trim()) && !g.checkedIn).slice(0, 6) : [];

  return (
    <div className="station">
      <header className="st-head">
        <div><span className="st-eyebrow"><span className="live-dot-c" /> استقبال الضيوف{section ? ` · ${SEC[section]}` : ""}</span><h1 className="display">{title}</h1></div>
        <div className="st-count num"><b><Counter value={sum(inside)} /></b><small>من {sum(expected)}</small></div>
      </header>
      {live && <div className="st-now"><Icon name="Radio" size={15} /> الآن: <b>{live.title}</b></div>}

      <section className="scanner">
        <div className="frame-box"><i /><i /><i /><i /><motion.span className="laser" animate={{ top: ["12%", "86%", "12%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} /></div>
        <button className="btn white lg" onClick={() => setCam(true)}><Icon name="Camera" size={18} /> امسح دعوة الضيف</button>
        <form className="row" style={{ width: "100%", maxWidth: 360 }} onSubmit={(e) => { e.preventDefault(); void scan(code); }}>
          <label className="sr" htmlFor="sc">رمز الدعوة</label>
          <input id="sc" className="input num grow" placeholder="أو اكتب رمز الدعوة" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
          <button className="btn glass" type="submit">تحقق</button>
        </form>
        {cam && <CameraScanner onCode={(c) => { void scan(c); }} onClose={() => setCam(false)} />}
        <AnimatePresence mode="wait">
          {res && (
            <motion.div key={res.at} className={"scan-res " + (res.ok ? "ok" : res.reason === "section" ? "warn" : "bad")} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 26 }}>
              <Icon name={res.ok ? "CheckCircle2" : res.reason === "section" ? "ArrowLeftRight" : "XCircle"} size={30} style={{ color: res.ok ? "#3dd39b" : res.reason === "section" ? "#ffc35c" : "#ff6b62" }} />
              <div className="grow">
                <b className="display">{res.ok ? `أهلاً ${res.guest.name}` : res.reason === "section" ? `${res.guest!.name}: ضيف ${SEC[res.guest!.section]}` : `${res.guest?.name ?? ""} ${REASON[res.reason]}`}</b>
                {res.ok && res.guest.vip && <div className="st-vip"><Icon name="Star" size={13} /> ضيف كبير: رحّب فيه وبلّغ صاحب المناسبة</div>}
                {res.guest && <div style={{ fontSize: 13, opacity: 0.8 }}>{!res.ok && res.reason === "section" ? `وجّهه لمدخل ${SEC[res.guest.section]}` : `${SEC[res.guest.section]} · ${res.guest.count} ${res.guest.count > 1 ? "أشخاص" : "شخص"}`}</div>}
              </div>
              {!res.ok && res.reason === "section" && <button className="btn sm white" onClick={() => void scan(res.guest!.code, true)}>دخّله هنا</button>}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

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

/* ───── مسح QR بالكاميرا (BarcodeDetector المدمج في المتصفح، بدون مكتبات) ───── */
type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };
function CameraScanner({ onCode, onClose }: { onCode: (code: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");
  const last = useRef({ code: "", at: 0 });
  useEffect(() => {
    let stream: MediaStream | null = null, timer = 0, alive = true;
    const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
    if (!BD) { setErr("المسح بالكاميرا يحتاج متصفح Chrome على الجوال. استخدم إدخال الرمز يدوياً."); return; }
    const detector = new BD({ formats: ["qr_code"] });
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment" }, audio: false }).then((s) => {
      if (!alive) { s.getTracks().forEach((t) => t.stop()); return; }
      stream = s; const v = video.current!; v.srcObject = s; void v.play();
      const tick = async () => {
        if (!alive) return;
        try {
          const found = await detector.detect(v);
          const raw = found[0]?.rawValue;
          if (raw && (raw !== last.current.code || Date.now() - last.current.at > 2500)) { last.current = { code: raw, at: Date.now() }; onCode(raw); }
        } catch { /* إطار غير جاهز */ }
        timer = window.setTimeout(tick, 280);
      };
      void tick();
    }).catch(() => setErr("ما قدرنا نفتح الكاميرا. اسمح للمتصفح باستخدامها أو أدخل الرمز يدوياً."));
    return () => { alive = false; clearTimeout(timer); stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="cam">
      {err ? <p className="cam-err">{err}</p> : <video ref={video} playsInline muted />}
      <div className="cam-frame" aria-hidden="true"><i /><i /><i /><i /></div>
      <button className="btn white sm cam-close" onClick={onClose}><Icon name="X" size={15} /> إغلاق الكاميرا</button>
    </div>
  );
}
