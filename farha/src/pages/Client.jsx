import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, Counter, QR, Modal } from "../components/ui";
import { OCCASIONS, TIERS, CATEGORIES, hospitality, sar, fmt } from "../data";
import { useStore, useToast, go, shiftDate, findVendor } from "../store";
import { StatusPill } from "./Market";

const TABS = [
  ["overview", "نظرة عامة", "LayoutDashboard"],
  ["guests", "الضيوف", "Users"],
  ["invites", "الدعوات", "Send"],
  ["budget", "الميزانية", "Wallet"],
  ["hosp", "حاسبة الضيافة", "Coffee"],
  ["tasks", "مهام العائلة", "ListChecks"],
  ["bookings", "الحجوزات", "CalendarCheck"],
  ["door", "يوم المناسبة", "ScanLine"],
];

const inviteUrl = (code) => `${location.href.split("#")[0]}#invite-${code}`;
const safeGet = (k) => { try { return sessionStorage.getItem(k); } catch { return null; } };

export default function Client() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState(() => { const t = safeGet("farha.tab"); try { sessionStorage.removeItem("farha.tab"); } catch { /* */ } return t || "overview"; });

  if (!state.event) {
    return (
      <div className="wrap" style={{ paddingBlock: 80, display: "grid", justifyItems: "center", textAlign: "center", gap: 16 }}>
        <span className="display gold" style={{ fontSize: 56 }}>مناسبتي</span>
        <p className="muted" style={{ maxWidth: "46ch" }}>ما عندك مناسبة للحين. خلّ المساعد يجهز لك خطة خلال دقيقة، أو افتح لوحة تجريبية مليانة أمثلة.</p>
        <div className="hero-cta" style={{ justifyContent: "center" }}>
          <button className="btn gold" onClick={() => { go("home"); setTimeout(() => document.getElementById("concierge")?.scrollIntoView({ behavior: "smooth", block: "center" }), 120); }}>ابدأ مع المساعد <Icon name="Sparkles" size={16} /></button>
          <button className="btn" onClick={() => dispatch({ type: "createEvent", user: { name: "عبدالله", phone: "" }, event: { type: "wedding", city: "الرياض", date: shiftDate(new Date().toISOString(), 60), guests: 500, menRatio: 0.5, tier: "mid", title: "زواج عبدالله (تجريبي)" } })}>افتح لوحة تجريبية</button>
        </div>
      </div>
    );
  }

  const newQuotes = state.requests.filter((r) => r.mine && r.status === "quoted").length;
  const occ = OCCASIONS.find((o) => o.id === state.event.type);

  return (
    <div className="app-shell">
      <aside className="side">
        <div className="who">
          <small>{occ?.name} · {state.event.city}</small>
          <b>{state.event.title || "مناسبتي"}</b>
          <small className="num">{state.event.date}</small>
        </div>
        <nav aria-label="أقسام لوحة المناسبة">
          {TABS.map(([id, l, ic]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
              <Icon name={ic} size={18} /> {l}{id === "bookings" && newQuotes > 0 && <span className="badge num">{newQuotes}</span>}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
          <a className="btn sm" href="#explore"><Icon name="Store" size={15} /> تصفح المزودين</a>
          <ResetBtn />
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <div className="mobile-tabs">{TABS.map(([id, l]) => <button key={id} className={"chip" + (tab === id ? " on" : "")} onClick={() => setTab(id)}>{l}</button>)}</div>
        <main className="main">
          <AnimatePresence mode="wait">
            <motion.div key={tab} className="main-inner" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
              {tab === "overview" && <Overview setTab={setTab} />}
              {tab === "guests" && <Guests />}
              {tab === "invites" && <Invites />}
              {tab === "budget" && <Budget />}
              {tab === "hosp" && <Hosp />}
              {tab === "tasks" && <Tasks />}
              {tab === "bookings" && <Bookings />}
              {tab === "door" && <Door />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function ResetBtn() {
  const { dispatch } = useStore();
  const [ask, setAsk] = useState(false);
  return ask
    ? <div style={{ display: "flex", gap: 6 }}><button className="btn sm" style={{ flex: 1, color: "var(--danger)" }} onClick={() => { dispatch({ type: "reset" }); go("home"); }}>تأكيد الحذف</button><button className="btn sm ghost" onClick={() => setAsk(false)}>إلغاء</button></div>
    : <button className="btn sm ghost" onClick={() => setAsk(true)}><Icon name="RotateCcw" size={15} /> ابدأ من جديد</button>;
}

function useCountdown(iso) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const target = new Date(iso + "T20:00:00").getTime();
  const d = Math.max(0, target - now);
  return { d: Math.floor(d / 864e5), h: Math.floor(d / 36e5) % 24, m: Math.floor(d / 6e4) % 60, s: Math.floor(d / 1e3) % 60 };
}

function Overview({ setTab }) {
  const { state } = useStore();
  const e = state.event;
  const cd = useCountdown(e.date);
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
  const invited = sum(state.guests, (g) => g.count);
  const yes = sum(state.guests.filter((g) => g.status === "yes"), (g) => g.count);
  const yesMen = sum(state.guests.filter((g) => g.status === "yes" && g.section === "men"), (g) => g.count);
  const yesWomen = yes - yesMen;
  const est = sum(state.budget, (b) => b.est), paid = sum(state.budget, (b) => b.paid || 0);
  const nextTasks = state.tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
  const bookings = state.requests.filter((r) => r.mine);
  const tier = TIERS.find((t) => t.id === e.tier);

  return (
    <>
      <div className="main-head">
        <div><span className="eyebrow">حياك يا {state.user?.name}</span><h1>{e.title || "مناسبتي"}</h1><p className="muted">{e.city} · {fmt(e.guests)} ضيف متوقع · مستوى {tier?.name}</p></div>
        <div className="hero-cta" style={{ marginTop: 0 }}><button className="btn" onClick={() => setTab("invites")}><Icon name="Send" size={16} /> أرسل الدعوات</button><a className="btn gold" href="#explore"><Icon name="Plus" size={16} /> احجز خدمة</a></div>
      </div>

      <div className="card" style={{ background: "linear-gradient(135deg, rgba(233,201,139,.12), rgba(224,154,174,.06)), var(--surface)", borderColor: "var(--line)" }}>
        <div className="card-head"><h3>العد التنازلي لليلة الفرح</h3><span className="muted num">{e.date}</span></div>
        <div className="countdown num">
          {[[cd.d, "يوم"], [cd.h, "ساعة"], [cd.m, "دقيقة"], [cd.s, "ثانية"]].map(([v, l]) => <div key={l}><b className="gold">{String(v).padStart(2, "0")}</b><small>{l}</small></div>)}
        </div>
      </div>

      <div className="kpis">
        <div className="card kpi"><small><Icon name="UserCheck" size={14} /> ضيوف مؤكدين</small><b><Counter value={yes} /> <span className="faint" style={{ fontSize: 14, fontWeight: 400 }}>/ {fmt(invited)}</span></b><div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${invited ? (yes / invited) * 100 : 0}%` }} /></div></div>
        <div className="card kpi"><small><Icon name="Wallet" size={14} /> المدفوع</small><b className="num">{sar(paid)}</b><div className="sub num">من {sar(est)}</div></div>
        <div className="card kpi"><small><Icon name="ListChecks" size={14} /> المهام</small><b className="num">{state.tasks.filter((t) => t.done).length}/{state.tasks.length}</b><div className="sub">منجزة</div></div>
        <div className="card kpi"><small><Icon name="CalendarCheck" size={14} /> الحجوزات</small><b className="num">{bookings.filter((b) => b.status === "confirmed").length}/{bookings.length}</b><div className="sub">مؤكدة</div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>المهام القادمة</h3><button className="btn sm ghost" onClick={() => setTab("tasks")}>الكل</button></div>
          {nextTasks.length ? nextTasks.map((t) => <TaskRow key={t.id} t={t} />) : <p className="muted">كل المهام منجزة. ما شاء الله!</p>}
        </div>
        <div className="card">
          <div className="card-head"><h3>الحضور حسب القسم</h3><button className="btn sm ghost" onClick={() => setTab("guests")}>الضيوف</button></div>
          <div style={{ display: "grid", gap: 14 }}>
            <div><div className="split-legend" style={{ marginTop: 0 }}><span>قسم الرجال</span><span className="num gold">{yesMen}</span></div><div className="bar"><i style={{ width: `${yes ? (yesMen / Math.max(yes, 1)) * 100 : 0}%` }} /></div></div>
            <div><div className="split-legend" style={{ marginTop: 0 }}><span>قسم النساء</span><span className="num rose">{yesWomen}</span></div><div className="bar rose"><i style={{ width: `${yes ? (yesWomen / Math.max(yes, 1)) * 100 : 0}%` }} /></div></div>
            <div className="mini-row"><Icon name="Coffee" className="gold" /><div className="who"><b>{hospitality({ men: yesMen || Math.round(e.guests * e.menRatio), women: yesWomen || e.guests - Math.round(e.guests * e.menRatio) }).sheep} ذبيحة تقريباً</b><small>حسب {yes ? "المؤكدين" : "العدد المتوقع"}</small></div><button className="btn sm ghost" onClick={() => setTab("hosp")}>التفاصيل</button></div>
          </div>
        </div>
      </div>
    </>
  );
}

function TaskRow({ t }) {
  const { dispatch } = useStore();
  const late = !t.done && t.due < new Date().toISOString().slice(0, 10);
  return (
    <div className={"task" + (t.done ? " done" : "")}>
      <button className={"check" + (t.done ? " on" : "")} onClick={() => dispatch({ type: "toggleTask", id: t.id })} aria-label={t.done ? "إلغاء الإنجاز" : "تم الإنجاز"}>{t.done && <Icon name="Check" size={14} />}</button>
      <div className="t"><div>{t.title}</div><small><Icon name="User" size={11} /> {t.who} · <span className={"num" + (late ? " rose" : "")}>{t.due}{late ? " (متأخرة)" : ""}</span></small></div>
    </div>
  );
}

function Guests() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [section, setSection] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [g, setG] = useState({ name: "", phone: "", section: "men", side: "groom", count: 1 });
  const [bulkText, setBulkText] = useState("");

  const list = state.guests.filter((x) => (filter === "all" || x.status === filter) && (section === "all" || x.section === section) && (!q || x.name.includes(q) || x.phone?.includes(q)));
  const c = (st) => state.guests.filter((x) => x.status === st).length;
  const hasSamples = state.guests.some((x) => x.sample);

  const importBulk = () => {
    const rows = bulkText.split("\n").map((l) => l.split(/[,،\t]/).map((s) => s.trim())).filter((r) => r[0]);
    rows.forEach(([name, phone, sec]) => dispatch({ type: "addGuest", guest: { name, phone: phone || "", section: /نساء|women|ن/.test(sec || "") ? "women" : "men", side: "groom" } }));
    toast(`تمت إضافة ${rows.length} ضيف`);
    setBulk(false); setBulkText("");
  };

  return (
    <>
      <div className="main-head">
        <div><span className="eyebrow">قائمة الضيوف</span><h1>الضيوف</h1><p className="muted num">{state.guests.length} دعوة · {c("yes")} مؤكد · {c("pending")} بانتظار الرد · {c("no")} معتذر</p></div>
        <div className="hero-cta" style={{ marginTop: 0 }}>
          {hasSamples && <button className="btn sm ghost" onClick={() => dispatch({ type: "clearSamples" })}>حذف الأمثلة</button>}
          <button className="btn" onClick={() => setBulk(true)}><Icon name="Upload" size={16} /> استيراد قائمة</button>
          <button className="btn gold" onClick={() => setOpen(true)}><Icon name="UserPlus" size={16} /> ضيف جديد</button>
        </div>
      </div>
      {hasSamples && <div className="mini-row"><Icon name="Info" size={18} className="gold" /><div className="who"><small>الأسماء الحالية أمثلة لتجربة اللوحة. احذفها وأضف ضيوفك الحقيقيين.</small></div></div>}
      <div className="card">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          <div className="seg">{[["all", "الكل"], ["yes", "مؤكد"], ["pending", "بانتظار"], ["no", "معتذر"]].map(([k, l]) => <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>)}</div>
          <div className="seg">{[["all", "القسمين"], ["men", "رجال"], ["women", "نساء"]].map(([k, l]) => <button key={k} className={section === k ? "on" : ""} onClick={() => setSection(k)}>{l}</button>)}</div>
          <label className="sr" htmlFor="g-q">بحث في الضيوف</label>
          <input id="g-q" className="input" style={{ flex: "1 1 180px", width: "auto" }} placeholder="بحث بالاسم أو الجوال" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>الضيف</th><th>القسم</th><th>الطرف</th><th>العدد</th><th>الحالة</th><th>الرمز</th><th></th></tr></thead>
            <tbody>
              {list.map((x) => (
                <tr key={x.id}>
                  <td><b style={{ fontWeight: 500 }}>{x.name}</b><div className="faint num" style={{ fontSize: 12 }}>{x.phone}</div></td>
                  <td><span className={"pill " + (x.section === "men" ? "wait" : "info")}>{x.section === "men" ? "رجال" : "نساء"}</span></td>
                  <td className="muted">{x.side === "groom" ? "أهل العريس" : "أهل العروس"}</td>
                  <td className="num">{x.count}</td>
                  <td>
                    <label className="sr" htmlFor={"st-" + x.id}>الحالة</label>
                    <select id={"st-" + x.id} className="select" style={{ padding: "5px 10px", width: "auto" }} value={x.status} onChange={(e) => dispatch({ type: "updateGuest", id: x.id, patch: { status: e.target.value } })}>
                      <option value="pending">بانتظار</option><option value="yes">مؤكد</option><option value="no">معتذر</option>
                    </select>
                  </td>
                  <td className="num faint" style={{ letterSpacing: ".1em" }}>{x.code}</td>
                  <td><button className="icon-btn" onClick={() => dispatch({ type: "removeGuest", id: x.id })} aria-label={"حذف " + x.name}><Icon name="Trash2" size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <div className="empty">لا يوجد ضيوف بهذا الفلتر.</div>}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة ضيف">
        <form className="form-grid" onSubmit={(e) => { e.preventDefault(); dispatch({ type: "addGuest", guest: { ...g, count: +g.count } }); setG({ ...g, name: "", phone: "", count: 1 }); setOpen(false); toast("تمت إضافة الضيف"); }}>
          <div className="field full"><label htmlFor="ng-name">الاسم</label><input id="ng-name" className="input" required value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="ng-phone">الجوال</label><input id="ng-phone" className="input num" inputMode="tel" placeholder="05xxxxxxxx" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })} /></div>
          <div className="field"><label htmlFor="ng-count">العدد مع المرافقين</label><input id="ng-count" type="number" min="1" max="20" className="input num" value={g.count} onChange={(e) => setG({ ...g, count: e.target.value })} /></div>
          <div className="field"><label htmlFor="ng-sec">القسم</label><select id="ng-sec" className="select" value={g.section} onChange={(e) => setG({ ...g, section: e.target.value })}><option value="men">رجال</option><option value="women">نساء</option></select></div>
          <div className="field"><label htmlFor="ng-side">الطرف</label><select id="ng-side" className="select" value={g.side} onChange={(e) => setG({ ...g, side: e.target.value })}><option value="groom">أهل العريس</option><option value="bride">أهل العروس</option></select></div>
          <button className="btn gold full" type="submit">إضافة</button>
        </form>
      </Modal>
      <Modal open={bulk} onClose={() => setBulk(false)} title="استيراد قائمة ضيوف">
        <p className="muted" style={{ fontSize: 14 }}>الصق القائمة من Excel أو من ملاحظات الجوال: سطر لكل ضيف بالشكل <b className="gold">الاسم، الجوال، القسم</b></p>
        <label className="sr" htmlFor="bulk">القائمة</label>
        <textarea id="bulk" className="input" rows="7" placeholder={"سعد العتيبي، 0551234567، رجال\nنورة الحربي، 0509876543، نساء"} value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
        <button className="btn gold" onClick={importBulk} disabled={!bulkText.trim()}>استيراد</button>
      </Modal>
    </>
  );
}

function InviteCard({ tpl, event, user, message, guest }) {
  const occ = OCCASIONS.find((o) => o.id === event.type);
  return (
    <div className="invite-card" style={{ width: "min(320px, 100%)" }}>
      <div className={"invite-face tpl-" + tpl} style={{ position: "relative", inset: "auto", height: "100%" }}>
        <div className="frame" />
        <div className="small">بسم الله الرحمن الرحيم</div>
        <div className="small" style={{ margin: "14px 0 4px" }}>{message}</div>
        <div className="names" style={{ color: tpl === "najd" ? "var(--gold)" : "inherit", fontSize: 36 }}>{event.title || `${occ?.name} ${user?.name || ""}`}</div>
        <div className="num" style={{ marginTop: 10, fontSize: 13 }}>{new Date(event.date).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { weekday: "long", day: "numeric", month: "long" })} · 8:30 مساءً</div>
        <div className="small">{event.city}</div>
        {guest && <><div className="qr" style={{ width: 110, height: 110, marginTop: 14 }}><QR text={"FARHA-" + guest.code} /></div><div className="small num" style={{ marginTop: 6, letterSpacing: ".2em" }}>{guest.code}</div></>}
      </div>
    </div>
  );
}

function Invites() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [preview, setPreview] = useState(null);
  const { template, message } = state.invite;
  const pending = state.guests.filter((g) => g.status === "pending");
  const waText = (g) => encodeURIComponent(`السلام عليكم ${g.name}،\n${message}\n${state.event.title}\nالتاريخ: ${state.event.date}\nأكد حضورك من الرابط:\n${inviteUrl(g.code)}`);
  const copy = async (g) => {
    try { await navigator.clipboard.writeText(inviteUrl(g.code)); toast("تم نسخ رابط الدعوة"); }
    catch { toast("ما قدرنا ننسخ تلقائياً. الرابط: " + g.code); }
  };
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">الدعوات الذكية</span><h1>الدعوات</h1><p className="muted">صمم الدعوة، وأرسل لكل ضيف رابطه الخاص على الواتساب.</p></div></div>
      <div className="grid-2e">
        <div className="card" style={{ display: "grid", gap: 16 }}>
          <div className="field"><label>التصميم</label>
            <div className="tpl-pick">
              {[["najd", "نجدي ليلي"], ["rose", "وردي"], ["sand", "رملي"]].map(([id, l]) => (
                <button key={id} className={"tpl-" + id + (template === id ? " on" : "")} onClick={() => dispatch({ type: "invite", patch: { template: id } })} aria-label={l} title={l} />
              ))}
            </div>
          </div>
          <div className="field"><label htmlFor="inv-msg">نص الدعوة</label><textarea id="inv-msg" className="input" rows="3" value={message} onChange={(e) => dispatch({ type: "invite", patch: { message: e.target.value } })} /></div>
          <div className="field"><label htmlFor="inv-title">عنوان المناسبة على البطاقة</label><input id="inv-title" className="input" value={state.event.title} onChange={(e) => dispatch({ type: "updateEvent", patch: { title: e.target.value } })} /></div>
        </div>
        <div className="invite-stage" style={{ padding: 0 }}><InviteCard tpl={template} event={state.event} user={state.user} message={message} /></div>
      </div>
      <div className="card">
        <div className="card-head"><h3>إرسال الدعوات <span className="faint num" style={{ fontWeight: 400, fontSize: 13 }}>({pending.length} بانتظار الرد)</span></h3></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>الضيف</th><th>الحالة</th><th>إجراءات</th></tr></thead>
            <tbody>
              {state.guests.map((g) => (
                <tr key={g.id}>
                  <td>{g.name}<div className="faint num" style={{ fontSize: 12 }}>{g.phone}</div></td>
                  <td><StatusPill s={g.status === "yes" ? "confirmed" : g.status === "no" ? "declined" : "new"} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <a className="btn sm" href={`https://wa.me/${g.phone ? "966" + g.phone.replace(/^0/, "") : ""}?text=${waText(g)}`} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={14} /> واتساب</a>
                      <button className="btn sm ghost" onClick={() => copy(g)}><Icon name="Copy" size={14} /> نسخ الرابط</button>
                      <button className="btn sm ghost" onClick={() => setPreview(g)}><Icon name="Eye" size={14} /> معاينة</button>
                      <a className="btn sm ghost" href={"#invite-" + g.code}>صفحة الضيف</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview ? "دعوة " + preview.name : ""}>
        {preview && <div className="invite-stage" style={{ padding: 0 }}><InviteCard tpl={template} event={state.event} user={state.user} message={message} guest={preview} /></div>}
      </Modal>
    </>
  );
}

function Donut({ parts }) {
  const total = parts.reduce((s, p) => s + p.v, 0) || 1;
  const colors = ["#e9c98b", "#e09aae", "#8fc7a8", "#b9a2e6", "#f2c46b", "#7fb6d9", "#c9a25e"];
  let acc = 0;
  const R = 54, C = 2 * Math.PI * R;
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
      <svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="توزيع الميزانية">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#261e35" strokeWidth="16" />
        {parts.map((p, i) => {
          const len = (p.v / total) * C;
          const el = <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={colors[i % colors.length]} strokeWidth="16" strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" />;
          acc += len; return el;
        })}
        <text x="70" y="66" textAnchor="middle" fill="#a99fb6" fontSize="10">الإجمالي</text>
        <text x="70" y="84" textAnchor="middle" fill="#f4ede3" fontSize="14" fontWeight="700">{fmt(total / 1000)}k</text>
      </svg>
      <div style={{ display: "grid", gap: 6, fontSize: 13, flex: 1, minWidth: 160 }}>
        {parts.map((p, i) => <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}><i style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length] }} /><span style={{ flex: 1 }}>{p.label}</span><span className="num muted">{Math.round((p.v / total) * 100)}%</span></div>)}
      </div>
    </div>
  );
}

function Budget() {
  const { state, dispatch } = useStore();
  const [n, setN] = useState({ label: "", est: "" });
  const est = state.budget.reduce((s, b) => s + b.est, 0), paid = state.budget.reduce((s, b) => s + (b.paid || 0), 0);
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">الميزانية والدفعات</span><h1>الميزانية</h1><p className="muted">الأرقام الأولية تقديرية من المساعد. عدّلها حسب العروض اللي توصلك.</p></div></div>
      <div className="kpis">
        <div className="card kpi"><small>الميزانية الكلية</small><b className="num">{sar(est)}</b></div>
        <div className="card kpi"><small>المدفوع</small><b className="num gold">{sar(paid)}</b></div>
        <div className="card kpi"><small>المتبقي</small><b className="num rose">{sar(est - paid)}</b></div>
        <div className="card kpi"><small>نسبة الإنجاز المالي</small><b className="num">{est ? Math.round((paid / est) * 100) : 0}%</b><div className="bar" style={{ marginTop: 8 }}><i style={{ width: `${est ? (paid / est) * 100 : 0}%` }} /></div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>البنود</h3></div>
          <div className="tbl-wrap">
            <table className="tbl" style={{ minWidth: 520 }}>
              <thead><tr><th>البند</th><th>التقدير</th><th>المدفوع</th><th></th></tr></thead>
              <tbody>
                {state.budget.map((b) => (
                  <tr key={b.id}>
                    <td>{b.label}<div className="bar" style={{ marginTop: 6, height: 4 }}><i style={{ width: `${b.est ? Math.min(100, ((b.paid || 0) / b.est) * 100) : 0}%` }} /></div></td>
                    <td><label className="sr" htmlFor={"be-" + b.id}>التقدير</label><input id={"be-" + b.id} className="input num" style={{ padding: "6px 10px", width: 110 }} type="number" value={b.est} onChange={(e) => dispatch({ type: "updateBudget", id: b.id, patch: { est: +e.target.value } })} /></td>
                    <td><label className="sr" htmlFor={"bp-" + b.id}>المدفوع</label><input id={"bp-" + b.id} className="input num" style={{ padding: "6px 10px", width: 110 }} type="number" value={b.paid || 0} onChange={(e) => dispatch({ type: "updateBudget", id: b.id, patch: { paid: +e.target.value } })} /></td>
                    <td><button className="icon-btn" onClick={() => dispatch({ type: "removeBudget", id: b.id })} aria-label={"حذف " + b.label}><Icon name="Trash2" size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }} onSubmit={(e) => { e.preventDefault(); if (!n.label) return; dispatch({ type: "addBudget", item: { label: n.label, est: +n.est || 0, cat: "other" } }); setN({ label: "", est: "" }); }}>
            <label className="sr" htmlFor="nb-l">بند جديد</label><input id="nb-l" className="input" style={{ flex: "2 1 160px", width: "auto" }} placeholder="بند جديد: فستان، شبكة، هدايا…" value={n.label} onChange={(e) => setN({ ...n, label: e.target.value })} />
            <label className="sr" htmlFor="nb-e">المبلغ</label><input id="nb-e" className="input num" style={{ flex: "1 1 100px", width: "auto" }} type="number" placeholder="المبلغ" value={n.est} onChange={(e) => setN({ ...n, est: e.target.value })} />
            <button className="btn gold" type="submit"><Icon name="Plus" size={16} /> إضافة</button>
          </form>
        </div>
        <div className="card"><div className="card-head"><h3>التوزيع</h3></div><Donut parts={state.budget.map((b) => ({ label: b.label, v: b.est }))} /></div>
      </div>
    </>
  );
}

function Hosp() {
  const { state } = useStore();
  const e = state.event;
  const yesMen = state.guests.filter((g) => g.status === "yes" && g.section === "men").reduce((s, g) => s + g.count, 0);
  const yesWomen = state.guests.filter((g) => g.status === "yes" && g.section === "women").reduce((s, g) => s + g.count, 0);
  const [basis, setBasis] = useState("expected");
  const [style, setStyle] = useState("traditional");
  const [men, setMen] = useState(Math.round(e.guests * e.menRatio));
  const [women, setWomen] = useState(e.guests - Math.round(e.guests * e.menRatio));
  const M = basis === "confirmed" ? yesMen : men, W = basis === "confirmed" ? yesWomen : women;
  const h = hospitality({ men: M, women: W, style });
  const tiles = [
    ["Beef", h.sheep, "ذبيحة", "تقريباً ذبيحة لكل 8 رجال" + (style === "traditional" ? " و9 نساء" : "")],
    ["Wheat", h.rice, "كجم رز", "حوالي 220 جرام للشخص"],
    ["Coffee", h.coffee, "كجم قهوة", "3 فناجين للضيف تقريباً"],
    ["Cherry", h.dates, "كجم تمر", "40 جرام للضيف"],
    ["Cake", h.sweets, "قطعة حلا", "قطعة ونص للضيف"],
    ["CupSoda", h.water, "كرتون ماء", "عبوتين للضيف"],
    ["Users", h.servers, "قهوجي وصباب", "واحد لكل 70 ضيف في كل قسم"],
    ["Armchair", h.tables, "طاولة نساء", "10 كراسي لكل طاولة"],
  ];
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">ميزة خاصة بفرحة</span><h1>حاسبة الضيافة</h1><p className="muted">تقديرات استرشادية تساعدك تطلب الكميات الصح من المطبخ والمزودين. راجعها مع الطباخ قبل الطلب.</p></div></div>
      <div className="card" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field"><label>احسب على أساس</label><div className="seg"><button className={basis === "expected" ? "on" : ""} onClick={() => setBasis("expected")}>العدد المتوقع</button><button className={basis === "confirmed" ? "on" : ""} onClick={() => setBasis("confirmed")}>المؤكدين فقط ({yesMen + yesWomen})</button></div></div>
        <div className="field"><label>نوع العشاء</label><div className="seg"><button className={style === "traditional" ? "on" : ""} onClick={() => setStyle("traditional")}>ذبائح للقسمين</button><button className={style === "buffet" ? "on" : ""} onClick={() => setStyle("buffet")}>بوفيه للنساء</button></div></div>
        {basis === "expected" && <>
          <div className="field" style={{ width: 120 }}><label htmlFor="h-men">رجال</label><input id="h-men" type="number" min="0" className="input num" value={men} onChange={(ev) => setMen(+ev.target.value)} /></div>
          <div className="field" style={{ width: 120 }}><label htmlFor="h-women">نساء</label><input id="h-women" type="number" min="0" className="input num" value={women} onChange={(ev) => setWomen(+ev.target.value)} /></div>
        </>}
      </div>
      <div className="calc-grid">
        {tiles.map(([ic, v, unit, hint]) => (
          <motion.div key={unit} className="calc-tile" layout>
            <Icon name={ic} className="ic" />
            <b className="num"><Counter value={v} /></b>
            <div style={{ fontWeight: 600 }}>{unit}</div>
            <small>{hint}</small>
          </motion.div>
        ))}
      </div>
    </>
  );
}

function Tasks() {
  const { state, dispatch } = useStore();
  const [t, setT] = useState({ title: "", who: "", due: state.event.date });
  const people = [...new Set(state.tasks.map((x) => x.who))];
  const [who, setWho] = useState("all");
  const list = state.tasks.filter((x) => who === "all" || x.who === who).sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due));
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">غرفة عمليات العائلة</span><h1>مهام العائلة</h1><p className="muted">وزّع المهام على أهلك وتابع مين خلّص ومين متأخر.</p></div></div>
      <div className="grid-2">
        <div className="card">
          <div className="occasion-row" style={{ marginBottom: 10 }}>
            <button className={"chip" + (who === "all" ? " on" : "")} onClick={() => setWho("all")}>الكل</button>
            {people.map((p) => <button key={p} className={"chip" + (who === p ? " on" : "")} onClick={() => setWho(p)}>{p}</button>)}
          </div>
          {list.map((x) => <div key={x.id} style={{ display: "flex", alignItems: "center" }}><div style={{ flex: 1, minWidth: 0 }}><TaskRow t={x} /></div><button className="icon-btn" onClick={() => dispatch({ type: "removeTask", id: x.id })} aria-label="حذف المهمة"><Icon name="Trash2" size={15} /></button></div>)}
        </div>
        <form className="card" style={{ display: "grid", gap: 12, alignContent: "start" }} onSubmit={(e) => { e.preventDefault(); if (!t.title) return; dispatch({ type: "addTask", task: { ...t, who: t.who || "أنا" } }); setT({ ...t, title: "" }); }}>
          <h3>مهمة جديدة</h3>
          <div className="field"><label htmlFor="t-title">المهمة</label><input id="t-title" className="input" placeholder="مثال: استلام الكوشة" value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} /></div>
          <div className="field"><label htmlFor="t-who">المسؤول</label><input id="t-who" className="input" list="people" placeholder="مثال: خالد (الأخ)" value={t.who} onChange={(e) => setT({ ...t, who: e.target.value })} /><datalist id="people">{people.map((p) => <option key={p} value={p} />)}</datalist></div>
          <div className="field"><label htmlFor="t-due">الموعد</label><input id="t-due" type="date" className="input num" value={t.due} onChange={(e) => setT({ ...t, due: e.target.value })} /></div>
          <button className="btn gold" type="submit"><Icon name="Plus" size={16} /> أضف المهمة</button>
        </form>
      </div>
    </>
  );
}

function Bookings() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const mine = state.requests.filter((r) => r.mine);
  const accept = (r) => {
    const v = findVendor(state, r.vendorId);
    dispatch({ type: "updateRequest", id: r.id, patch: { status: "confirmed" }, message: { from: "client", text: "تم قبول العرض", at: Date.now() } });
    dispatch({ type: "addBudget", item: { label: v?.name || "حجز", est: r.quote || r.estimate || 0, paid: 0, cat: v?.cat || "other" } });
    toast("تم تأكيد الحجز وإضافته للميزانية");
  };
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">طلباتك مع المزودين</span><h1>الحجوزات</h1><p className="muted">كل طلب ترسله يظهر هنا، ومعه عرض السعر لما يرد المزود.</p></div><a className="btn gold" href="#explore"><Icon name="Plus" size={16} /> طلب جديد</a></div>
      {!mine.length && <div className="card empty"><Icon name="CalendarSearch" size={36} /><p style={{ marginTop: 10 }}>ما أرسلت أي طلب للحين. تصفح القاعات والمزودين واختر التاريخ.</p><a className="btn gold" style={{ marginTop: 16 }} href="#explore">تصفح السوق</a></div>}
      <div style={{ display: "grid", gap: 12 }}>
        {mine.map((r) => {
          const v = findVendor(state, r.vendorId);
          const cat = CATEGORIES.find((c) => c.id === v?.cat);
          return (
            <div key={r.id} className="req">
              <div className="top"><Icon name={cat?.icon || "Store"} className="gold" /><b>{v?.name}</b><StatusPill s={r.status} /><span style={{ flex: 1 }} /><a className="btn sm ghost" href={"#venue-" + r.vendorId}>صفحة المزود</a></div>
              <div className="meta num"><span><Icon name="CalendarDays" size={14} /> {r.date}</span><span><Icon name="Users" size={14} /> {fmt(r.guests)} ضيف</span>{r.note && <span><Icon name="StickyNote" size={14} /> {r.note}</span>}</div>
              {(r.messages || []).filter((m) => m.from === "vendor").map((m, i) => <div key={i} className="bubble" style={{ fontSize: 14 }}>{m.text}</div>)}
              {r.status === "quoted" && (
                <div className="acts">
                  <span>عرض السعر: <b className="gold num">{sar(r.quote)}</b></span><span style={{ flex: 1 }} />
                  <button className="btn sm ghost" onClick={() => dispatch({ type: "updateRequest", id: r.id, patch: { status: "declined" }, message: { from: "client", text: "اعتذر العميل عن العرض", at: Date.now() } })}>رفض</button>
                  <button className="btn sm gold" onClick={() => accept(r)}>اقبل العرض</button>
                </div>
              )}
              {r.status === "new" && <div className="faint" style={{ fontSize: 13 }}>بانتظار رد المزود. للتجربة: افتح <a className="gold" href="#vendor">بوابة التاجر</a> وسجل دخول كـ {v?.name} ورد على الطلب.</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Door() {
  const { state, dispatch } = useStore();
  const [codeIn, setCodeIn] = useState("");
  const [result, setResult] = useState(null);
  const inside = state.guests.filter((g) => g.checkedIn);
  const count = (sec) => inside.filter((g) => g.section === sec).reduce((s, g) => s + g.count, 0);
  const expected = (sec) => state.guests.filter((g) => g.status === "yes" && g.section === sec).reduce((s, g) => s + g.count, 0);

  const scan = (raw) => {
    const c = raw.trim().toUpperCase().replace(/^FARHA-/, "");
    const g = state.guests.find((x) => x.code === c);
    if (!g) return setResult({ ok: false, text: "الرمز غير موجود في قائمة الدعوات" });
    if (g.checkedIn) return setResult({ ok: false, text: `${g.name} دخل مسبقاً`, g });
    if (g.status === "no") return setResult({ ok: false, text: `${g.name} معتذر عن الحضور. تأكد من صاحب الدعوة`, g });
    dispatch({ type: "updateGuest", id: g.id, patch: { checkedIn: true, status: "yes" } });
    setResult({ ok: true, text: `أهلاً ${g.name}`, g });
    setCodeIn("");
  };
  const simulate = () => {
    const g = state.guests.find((x) => !x.checkedIn && x.status === "yes") || state.guests.find((x) => !x.checkedIn && x.status !== "no");
    if (g) scan(g.code); else setResult({ ok: false, text: "كل الضيوف المؤكدين دخلوا" });
  };

  return (
    <>
      <div className="main-head"><div><span className="eyebrow">وضع يوم المناسبة</span><h1>استقبال الضيوف</h1><p className="muted">شاشة الحارس عند الباب: امسح رمز الدعوة أو اكتبه، والعدّاد يتحدّث لكل قسم.</p></div></div>
      <div className="kpis">
        <div className="card kpi"><small>داخل قسم الرجال</small><b className="num gold"><Counter value={count("men")} /></b><div className="sub num">من {expected("men")} مؤكد</div></div>
        <div className="card kpi"><small>داخل قسم النساء</small><b className="num rose"><Counter value={count("women")} /></b><div className="sub num">من {expected("women")} مؤكدة</div></div>
        <div className="card kpi"><small>إجمالي الحضور</small><b className="num"><Counter value={count("men") + count("women")} /></b></div>
        <div className="card kpi"><small>دعوات دخلت</small><b className="num">{inside.length}/{state.guests.length}</b></div>
      </div>
      <div className="grid-2">
        <div className="scan-box">
          <Icon name="ScanLine" size={46} className="gold" />
          <form style={{ display: "flex", gap: 8, width: "100%", maxWidth: 380 }} onSubmit={(e) => { e.preventDefault(); scan(codeIn); }}>
            <label className="sr" htmlFor="scan-code">رمز الدعوة</label>
            <input id="scan-code" className="input num" style={{ letterSpacing: ".2em", textAlign: "center" }} placeholder="رمز الدعوة" value={codeIn} onChange={(e) => setCodeIn(e.target.value)} />
            <button className="btn gold" type="submit">تحقق</button>
          </form>
          <button className="btn sm ghost" onClick={simulate}>محاكاة مسح ضيف</button>
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key={result.text + Date.now()} className={"scan-result " + (result.ok ? "ok" : "bad")} initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} style={{ width: "100%", maxWidth: 380, textAlign: "start" }}>
                <Icon name={result.ok ? "CheckCircle2" : "XCircle"} size={30} style={{ color: result.ok ? "var(--sage)" : "var(--danger)" }} />
                <div><b>{result.text}</b>{result.g && <div className="muted" style={{ fontSize: 13 }}>{result.g.section === "men" ? "قسم الرجال" : "قسم النساء"} · {result.g.count} {result.g.count > 1 ? "أشخاص" : "شخص"}</div>}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="card">
          <div className="card-head"><h3>آخر الداخلين</h3></div>
          {inside.length ? [...inside].reverse().slice(0, 8).map((g) => <div key={g.id} className="task"><span className={"pill " + (g.section === "men" ? "wait" : "info")}>{g.section === "men" ? "رجال" : "نساء"}</span><div className="t">{g.name}</div><span className="num faint">{g.count}</span></div>) : <p className="muted">ما دخل أحد للحين.</p>}
        </div>
      </div>
    </>
  );
}

/* صفحة الدعوة كما يراها الضيف */
export function GuestInvite({ code }) {
  const { state, dispatch } = useStore();
  const g = state.guests.find((x) => x.code === code);
  const [count, setCount] = useState(g?.count || 1);
  if (!g || !state.event) return <div className="invite-page"><div className="card empty">هذه الدعوة غير موجودة أو انتهت صلاحيتها.<br /><a className="gold" href="#home">الصفحة الرئيسية</a></div></div>;
  return (
    <div className="invite-page">
      <div style={{ display: "grid", gap: 20, justifyItems: "center", width: "100%", maxWidth: 420 }}>
        <span className="faint" style={{ fontSize: 13 }}>دعوة خاصة لـ <b className="gold">{g.name}</b></span>
        <InviteCard tpl={state.invite.template} event={state.event} user={state.user} message={state.invite.message} guest={g.status === "yes" ? g : null} />
        {g.status === "pending" ? (
          <div className="card" style={{ width: "100%", display: "grid", gap: 12 }}>
            <b>هل ستشرفنا بالحضور؟</b>
            <div className="field"><label htmlFor="rsvp-c">عدد الحضور مع المرافقين</label><input id="rsvp-c" type="number" min="1" max="20" className="input num" value={count} onChange={(e) => setCount(+e.target.value)} /></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn gold" style={{ flex: 1 }} onClick={() => dispatch({ type: "updateGuest", id: g.id, patch: { status: "yes", count } })}>أكيد بحضر</button>
              <button className="btn" style={{ flex: 1 }} onClick={() => dispatch({ type: "updateGuest", id: g.id, patch: { status: "no" } })}>أعتذر</button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ width: "100%", textAlign: "center" }}>
            {g.status === "yes" ? <><b className="gold">تم تأكيد حضورك 🤍</b><p className="muted" style={{ fontSize: 14 }}>اعرض رمز الدخول للحارس عند الباب.</p></> : <><b>شكراً لردك</b><p className="muted" style={{ fontSize: 14 }}>نتمنى نشوفك في مناسبة قادمة.</p></>}
            <button className="btn sm ghost" style={{ marginTop: 10 }} onClick={() => dispatch({ type: "updateGuest", id: g.id, patch: { status: "pending" } })}>غيّر ردك</button>
          </div>
        )}
        <a href="#my" className="faint" style={{ fontSize: 12 }}>(للعرض: ارجع للوحة صاحب المناسبة)</a>
      </div>
    </div>
  );
}
