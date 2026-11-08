import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  acceptQuote, addBudget, addTask, checkIn, fmt, hospitality, removeBudget, removeTask, sar, setBookingStatus, toggleTask, today, updateBudget,
  type CheckInResult,
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
      <div className="row between wrap"><div><h1 className="page-title">حجوزاتي</h1><p className="page-sub">طلباتك مع القاعات والموردين وردودهم.</p></div><button className="btn primary" onClick={() => go("explore")}><Icon name="Plus" size={16} /> طلب جديد</button></div>
      {!mine.length && <section className="card"><Empty icon="CalendarSearch" title="ما عندك طلبات للحين">اختر قاعة أو مورد، حدد اليوم، وأرسل الطلب.<button className="btn primary" style={{ marginTop: 6 }} onClick={() => go("explore")}>استكشف</button></Empty></section>}
      <div className="stack">
        {mine.map((b) => (
          <motion.section key={b.id} layout className="card stack" style={{ ["--gap" as string]: "12px" }}>
            <div className="row">
              <span className="avatar"><Icon name={b.kind === "venue" ? "Building2" : "Store"} size={18} /></span>
              <div className="grow"><b className="display" style={{ display: "block" }}>{nameOf(b.kind, b.targetId)}</b><small className="muted num">{b.date} · {fmt(b.guests)} ضيف</small></div>
              <StatusPill status={b.status} />
            </div>
            {b.note && <div className="muted" style={{ fontSize: 13.5 }}>{b.note}</div>}
            <div className="row"><BookingChat booking={b} me="client" other={nameOf(b.kind, b.targetId)} /></div>
            {b.messages.filter((m) => m.from === "provider").map((m, i) => <div key={i} className="card flat tight" style={{ background: "var(--surface-2)", fontSize: 14 }}><b className="display" style={{ fontSize: 12.5, display: "block", color: "var(--muted)" }}>رد {nameOf(b.kind, b.targetId)}</b>{m.text}</div>)}
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

/* ───── الميزانية ───── */
export function Budget() {
  const db = useDB();
  const [n, setN] = useState({ label: "", est: "" });
  const lines = db.client.budget;
  const est = lines.reduce((s, b) => s + b.est, 0), paid = lines.reduce((s, b) => s + b.paid, 0);
  const colors = ["var(--brand)", "var(--info)", "var(--ok)", "var(--warn)", "var(--brand-2)", "#8e7cff", "#2ab7ca"];
  return (
    <>
      <div><h1 className="page-title">الميزانية</h1><p className="page-sub">الأرقام الأولية تقديرية. عدّلها حسب العروض اللي توصلك.</p></div>
      <section className="card stack">
        <div className="row between wrap"><div><div className="stat-label">المدفوع من الميزانية</div><div className="stat-value"><Counter value={paid} /> <span className="faint" style={{ fontSize: 15, fontWeight: 500 }}>/ {sar(est)}</span></div></div><span className="pill brand num">{est ? Math.round((paid / est) * 100) : 0}%</span></div>
        <div style={{ display: "flex", height: 14, borderRadius: 10, overflow: "hidden", background: "var(--bg-2)", gap: 2 }}>{lines.map((b, i) => <i key={b.id} title={b.label} style={{ width: `${est ? (b.est / est) * 100 : 0}%`, background: colors[i % colors.length] }} />)}</div>
        <div className="row wrap" style={{ ["--gap" as string]: "12px", fontSize: 12.5 }}>{lines.map((b, i) => <span key={b.id} className="row" style={{ ["--gap" as string]: "5px" }}><i style={{ width: 9, height: 9, borderRadius: 3, background: colors[i % colors.length] }} />{b.label}</span>)}</div>
      </section>
      <section className="card" style={{ paddingBlock: 6 }}>
        <div className="list">{lines.map((b) => (
          <div key={b.id} className="list-row" style={{ flexWrap: "wrap" }}>
            <div className="t" style={{ minWidth: 140 }}><b>{b.label}</b><div className="bar ok" style={{ height: 5, marginTop: 6 }}><i style={{ width: `${b.est ? Math.min(100, (b.paid / b.est) * 100) : 0}%` }} /></div></div>
            <div className="field" style={{ width: 120 }}><label htmlFor={"e" + b.id}>التقدير</label><input id={"e" + b.id} type="number" className="input num" style={{ minHeight: 40 }} value={b.est} onChange={(e) => apply(updateBudget(b.id, { est: +e.target.value }))} /></div>
            <div className="field" style={{ width: 120 }}><label htmlFor={"p" + b.id}>المدفوع</label><input id={"p" + b.id} type="number" className="input num" style={{ minHeight: 40 }} value={b.paid} onChange={(e) => apply(updateBudget(b.id, { paid: +e.target.value }))} /></div>
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
const REASON = { unknown: "الرمز غير موجود في قائمة الدعوات", already: "دخل مسبقاً", declined: "معتذر عن الحضور، تأكد من صاحب الدعوة" };

export function Door() {
  const db = useDB();
  const [code, setCode] = useState("");
  const [res, setRes] = useState<(CheckInResult & { at: number }) | null>(null);
  const inside = db.client.guests.filter((g) => g.checkedIn);
  const cnt = (s: "men" | "women", list = inside) => list.filter((g) => g.section === s).reduce((a, g) => a + g.count, 0);
  const expected = db.client.guests.filter((g) => g.status === "yes");
  const scan = (raw: string) => {
    const { db: next, result } = checkIn(repo.get(), raw);
    if (result.ok) apply(() => next);
    try { navigator.vibrate?.(result.ok ? 60 : [40, 60, 40]); } catch { /* */ }
    setRes({ ...result, at: Date.now() }); setCode("");
  };
  const [cam, setCam] = useState(false);
  const simulate = () => {
    const g = db.client.guests.find((x) => !x.checkedIn && x.status === "yes") ?? db.client.guests.find((x) => !x.checkedIn && x.status === "pending");
    if (g) scan(g.code);
  };
  return (
    <>
      <div><h1 className="page-title">يوم المناسبة</h1><p className="page-sub">شاشة الحارس عند الباب: امسح الرمز أو اكتبه.</p></div>
      <div className="stats">
        <div className="card"><div className="stat-label">داخل قسم الرجال</div><div className="stat-value brand"><Counter value={cnt("men")} /></div><div className="stat-sub num">من {cnt("men", expected)} مؤكد</div></div>
        <div className="card"><div className="stat-label">داخل قسم النساء</div><div className="stat-value" style={{ color: "var(--info)" }}><Counter value={cnt("women")} /></div><div className="stat-sub num">من {cnt("women", expected)} مؤكدة</div></div>
        <div className="card"><div className="stat-label">إجمالي الحضور</div><div className="stat-value"><Counter value={cnt("men") + cnt("women")} /></div></div>
        <div className="card"><div className="stat-label">دعوات دخلت</div><div className="stat-value num">{inside.length}/{db.client.guests.length}</div></div>
      </div>
      <div className="home-grid">
        <section className="scanner">
          <div className="frame-box"><i /><i /><i /><i /><motion.span className="laser" animate={{ top: ["12%", "86%", "12%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} /></div>
          <form className="row" style={{ width: "100%", maxWidth: 360 }} onSubmit={(e) => { e.preventDefault(); if (code.trim()) scan(code); }}>
            <label className="sr" htmlFor="sc">رمز الدعوة</label>
            <input id="sc" className="input num grow" placeholder="رمز الدعوة" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
            <button className="btn white" type="submit">تحقق</button>
          </form>
          <div className="row" style={{ justifyContent: "center" }}>
            <button className="btn white sm" onClick={() => setCam(true)}><Icon name="Camera" size={15} /> مسح بالكاميرا</button>
            <button className="btn glass sm" onClick={simulate}>محاكاة مسح ضيف</button>
          </div>
          {cam && <CameraScanner onCode={(c) => { scan(c); }} onClose={() => setCam(false)} />}
          <AnimatePresence mode="wait">
            {res && (
              <motion.div key={res.at} className={"scan-res " + (res.ok ? "ok" : "bad")} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 26 }}>
                <Icon name={res.ok ? "CheckCircle2" : "XCircle"} size={30} style={{ color: res.ok ? "#3dd39b" : "#ff6b62" }} />
                <div><b className="display">{res.ok ? `أهلاً ${res.guest.name}` : `${res.guest?.name ?? ""} ${REASON[res.reason]}`}</b>{res.guest && <div style={{ fontSize: 13, opacity: 0.75 }}>{res.guest.section === "men" ? "قسم الرجال" : "قسم النساء"} · {res.guest.count} {res.guest.count > 1 ? "أشخاص" : "شخص"}</div>}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <section className="card">
          <div className="section-title"><h3>آخر الداخلين</h3></div>
          {inside.length ? <div className="list">{[...inside].reverse().slice(0, 8).map((g) => <div key={g.id} className="list-row"><span className={"avatar" + (g.section === "women" ? " alt" : "")}>{g.name[0]}</span><div className="t"><b>{g.name}</b><small>{g.section === "men" ? "رجال" : "نساء"}</small></div><span className="num faint">{g.count}</span></div>)}</div> : <p className="muted">ما دخل أحد للحين.</p>}
        </section>
      </div>
    </>
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
