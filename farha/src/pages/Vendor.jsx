import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, Counter, Art, Stars, Modal } from "../components/ui";
import { CATEGORIES, CITIES, OCCASIONS, sar, fmt } from "../data";
import { useStore, useVendor, useToast, uid } from "../store";
import { StatusPill } from "./Market";

const TABS = [
  ["overview", "لوحة القيادة", "LayoutDashboard"],
  ["requests", "الطلبات", "Inbox"],
  ["calendar", "التقويم", "CalendarDays"],
  ["packages", "الباقات والأسعار", "Package"],
  ["profile", "الملف التعريفي", "Store"],
  ["plan", "اشتراكي", "Gem"],
];

export default function Vendor() {
  const { state } = useStore();
  if (!state.vendor) return <VendorGate />;
  return <VendorApp id={state.vendor.vendorId} />;
}

function VendorGate() {
  const { dispatch } = useStore();
  const toast = useToast();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", type: "vendor", cat: "kosha", city: "الرياض", phone: "", cr: "" });
  const demos = ["v1", "h1"];
  const register = (e) => {
    e.preventDefault();
    const id = uid("c");
    dispatch({ type: "addVendor", vendor: { id, type: f.type === "hall" ? "hall" : "vendor", cat: f.type === "hall" ? "halls" : f.cat, cats: f.type === "hall" ? ["halls"] : [f.cat], name: f.name, city: f.city, area: f.city, price: f.type === "hall" ? 30000 : 5000, capacity: 500, menCap: 250, womenCap: 250, rating: 5, reviews: 0, hue: Math.floor(Math.random() * 360), tags: ["جديد على فرحة"], about: "عرّف عملاءك بخدماتك من صفحة الملف التعريفي.", packages: [], phone: f.phone, cr: f.cr } });
    toast("تم إنشاء حسابك. أكمل ملفك التعريفي");
  };
  return (
    <div className="wrap" style={{ paddingBlock: 50 }}>
      <div className="split" style={{ alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <span className="eyebrow">بوابة التاجر</span>
          <h1 style={{ fontSize: "clamp(30px,4vw,48px)" }}>كبّر نشاطك مع <span className="display gold">فرحة</span></h1>
          <p className="muted" style={{ maxWidth: "48ch", fontSize: 16 }}>لأصحاب القاعات وقصور الأفراح ومزودي التجهيز: استقبل طلبات الحجز، أرسل عروض الأسعار، وأدر تقويمك وباقاتك من مكان واحد.</p>
          <ul className="feature-list">
            <li><span className="ic"><Icon name="Inbox" size={18} /></span><div><b>طلبات جاهزة للرد</b><span>كل طلب يوصلك بالتاريخ وعدد الضيوف ونوع المناسبة والملاحظات.</span></div></li>
            <li><span className="ic"><Icon name="CalendarDays" size={18} /></span><div><b>تقويم توفر واحد</b><span>الأيام المؤكدة تنقفل تلقائياً للعملاء، فلا يتكرر الحجز.</span></div></li>
            <li><span className="ic"><Icon name="TrendingUp" size={18} /></span><div><b>تقارير الإيرادات</b><span>تعرف معدل التحويل ومتوسط قيمة الحجز وأكثر باقاتك طلباً.</span></div></li>
          </ul>
        </div>
        <div className="card" style={{ padding: 24, display: "grid", gap: 16, borderColor: "var(--line)" }}>
          <div className="seg" style={{ justifySelf: "start" }}><button className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>دخول تجريبي</button><button className={mode === "join" ? "on" : ""} onClick={() => setMode("join")}>سجّل نشاطك</button></div>
          {mode === "login" ? (
            <>
              <p className="muted" style={{ fontSize: 14 }}>اختر حساباً تجريبياً لتشوف اللوحة بطلبات وحجوزات أمثلة:</p>
              {demos.map((id) => <DemoAccount key={id} id={id} onPick={() => dispatch({ type: "vendorLogin", vendorId: id })} />)}
            </>
          ) : (
            <form className="form-grid" onSubmit={register}>
              <div className="field full"><label htmlFor="vj-name">اسم النشاط التجاري</label><input id="vj-name" className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="مثال: مؤسسة الفرح للتجهيزات" /></div>
              <div className="field"><label htmlFor="vj-type">نوع النشاط</label><select id="vj-type" className="select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="vendor">مزود خدمة</option><option value="hall">قاعة أو قصر أفراح</option></select></div>
              {f.type === "vendor" && <div className="field"><label htmlFor="vj-cat">الخدمة الرئيسية</label><select id="vj-cat" className="select" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}>{CATEGORIES.filter((c) => c.id !== "halls").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
              <div className="field"><label htmlFor="vj-city">المدينة</label><select id="vj-city" className="select" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="field"><label htmlFor="vj-phone">جوال التواصل</label><input id="vj-phone" className="input num" inputMode="tel" required pattern="05\d{8}" title="رقم يبدأ بـ 05 ومكون من 10 أرقام" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })} placeholder="05xxxxxxxx" /></div>
              <div className="field full"><label htmlFor="vj-cr">رقم السجل التجاري أو وثيقة العمل الحر</label><input id="vj-cr" className="input num" value={f.cr} onChange={(e) => setF({ ...f, cr: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })} placeholder="10 أرقام" /></div>
              <button className="btn gold full" type="submit">أنشئ حسابي</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function DemoAccount({ id, onPick }) {
  const v = useVendor(id);
  return (
    <button className="match" onClick={onPick} style={{ textAlign: "start", width: "100%", background: "var(--ink-2)" }}>
      <div className="thumb"><Art seed={v.id} hue={v.hue} kind={v.type} /></div>
      <div style={{ minWidth: 0 }}><b>{v.name}</b><div className="faint" style={{ fontSize: 12 }}>{v.type === "hall" ? "قاعة أفراح" : "مزود تجهيز متكامل"} · {v.city}</div></div>
      <span className="pct"><Icon name="ArrowLeft" size={18} className="gold" /></span>
    </button>
  );
}

function VendorApp({ id }) {
  const v = useVendor(id);
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState("overview");
  React.useEffect(() => { if (!v) dispatch({ type: "vendorLogout" }); }, [v, dispatch]);
  if (!v) return null;
  const reqs = state.requests.filter((r) => r.vendorId === id);
  const newCount = reqs.filter((r) => r.status === "new").length;
  return (
    <div className="app-shell">
      <aside className="side">
        <div className="who" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flex: "none" }}><Art seed={v.id} hue={v.hue} kind={v.type} /></div>
          <div style={{ minWidth: 0 }}><b>{v.name}</b><small>{v.type === "hall" ? "حساب قاعة" : "حساب مزود"} · {v.city}</small></div>
        </div>
        <nav aria-label="أقسام بوابة التاجر">
          {TABS.map(([t, l, ic]) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}><Icon name={ic} size={18} /> {l}{t === "requests" && newCount > 0 && <span className="badge num">{newCount}</span>}</button>)}
        </nav>
        <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
          <a className="btn sm" href={"#venue-" + v.id}><Icon name="Eye" size={15} /> صفحتي كما يراها العميل</a>
          <button className="btn sm ghost" onClick={() => dispatch({ type: "vendorLogout" })}><Icon name="LogOut" size={15} /> تسجيل الخروج</button>
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <div className="mobile-tabs">{TABS.map(([t, l]) => <button key={t} className={"chip" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>{l}{t === "requests" && newCount > 0 ? ` (${newCount})` : ""}</button>)}<button className="chip" onClick={() => dispatch({ type: "vendorLogout" })}>خروج</button></div>
        <main className="main">
          <AnimatePresence mode="wait">
            <motion.div key={tab} className="main-inner" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
              {tab === "overview" && <VOverview v={v} reqs={reqs} setTab={setTab} />}
              {tab === "requests" && <VRequests v={v} reqs={reqs} />}
              {tab === "calendar" && <VCalendar reqs={reqs} />}
              {tab === "packages" && <VPackages v={v} />}
              {tab === "profile" && <VProfile v={v} />}
              {tab === "plan" && <VPlan />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function RevenueChart({ data }) {
  const W = 520, H = 150, P = 24;
  const max = Math.max(...data.map((d) => d.v), 1);
  const x = (i) => P + (i * (W - P * 2)) / (data.length - 1);
  const y = (val) => H - P - (val / max) * (H - P * 2);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)} ${y(d.v)}`).join(" ");
  const area = `${line} L${x(data.length - 1)} ${H - P} L${x(0)} ${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark" role="img" aria-label="الإيرادات الشهرية">
      <defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9c98b" stopOpacity=".35" /><stop offset="1" stopColor="#e9c98b" stopOpacity="0" /></linearGradient></defs>
      {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={P} x2={W - P} y1={P + k * (H - P * 2)} y2={P + k * (H - P * 2)} stroke="#f4ede3" strokeOpacity=".06" />)}
      <path d={area} fill="url(#rv)" />
      <path d={line} fill="none" stroke="#e9c98b" strokeWidth="2.2" strokeLinejoin="round" />
      {data.map((d, i) => <text key={i} x={x(i)} y={H - 6} fill="#6f6680" fontSize="10" textAnchor="middle">{d.l}</text>)}
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].v)} r="5" fill="#e9c98b" stroke="#0f0b17" strokeWidth="2" />
      <text x={x(data.length - 1)} y={y(data[data.length - 1].v) - 12} fill="#f4ede3" fontSize="11" textAnchor="middle" fontWeight="700">{fmt(data[data.length - 1].v / 1000)}k</text>
    </svg>
  );
}

function VOverview({ v, reqs, setTab }) {
  const confirmed = reqs.filter((r) => r.status === "confirmed");
  const revenue = confirmed.reduce((s, r) => s + (r.quote || 0), 0);
  const conv = reqs.length ? Math.round((confirmed.length / reqs.length) * 100) : 0;
  const avg = confirmed.length ? revenue / confirmed.length : 0;
  const upcoming = confirmed.filter((r) => r.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date));
  const months = useMemo(() => {
    const out = []; const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const fromReqs = confirmed.filter((r) => r.date.slice(0, 7) === key).reduce((s, r) => s + (r.quote || 0), 0);
      const base = [22000, 31000, 27000, 44000, 39000, 36000][5 - i] || 0; // سجل تاريخي تجريبي
      out.push({ l: d.toLocaleDateString("ar-SA-u-ca-gregory", { month: "short" }), v: base + fromReqs });
    }
    return out;
  }, [confirmed]);
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">حياك {v.name}</span><h1>لوحة القيادة</h1><p className="muted">ملخص طلباتك وحجوزاتك وإيراداتك.</p></div><button className="btn gold" onClick={() => setTab("requests")}><Icon name="Inbox" size={16} /> الطلبات الجديدة ({reqs.filter((r) => r.status === "new").length})</button></div>
      <div className="kpis">
        <div className="card kpi"><small><Icon name="Inbox" size={14} /> طلبات جديدة</small><b className="num rose"><Counter value={reqs.filter((r) => r.status === "new").length} /></b><div className="sub">بانتظار ردك</div></div>
        <div className="card kpi"><small><Icon name="CalendarCheck" size={14} /> حجوزات مؤكدة</small><b className="num"><Counter value={confirmed.length} /></b><div className="sub num">معدل التحويل {conv}%</div></div>
        <div className="card kpi"><small><Icon name="Coins" size={14} /> إيرادات مؤكدة</small><b className="num gold"><Counter value={revenue} /></b><div className="sub">ريال سعودي</div></div>
        <div className="card kpi"><small><Icon name="Receipt" size={14} /> متوسط قيمة الحجز</small><b className="num"><Counter value={avg} /></b><div className="sub">ريال سعودي</div></div>
      </div>
      <div className="grid-2">
        <div className="card"><div className="card-head"><h3>الإيرادات آخر 6 أشهر</h3><span className="faint" style={{ fontSize: 12 }}>أرقام تجريبية + حجوزاتك المؤكدة</span></div><RevenueChart data={months} /></div>
        <div className="card">
          <div className="card-head"><h3>المناسبات القادمة</h3><button className="btn sm ghost" onClick={() => setTab("calendar")}>التقويم</button></div>
          {upcoming.length ? upcoming.slice(0, 4).map((r) => (
            <div key={r.id} className="task"><span className="icon-btn" style={{ color: "var(--gold)" }}><Icon name="CalendarHeart" size={16} /></span><div className="t"><div>{r.clientName}</div><small className="num">{r.date} · {fmt(r.guests)} ضيف · {OCCASIONS.find((o) => o.id === r.type)?.name}</small></div><b className="num" style={{ fontSize: 13 }}>{sar(r.quote)}</b></div>
          )) : <p className="muted">ما عندك مناسبات مؤكدة قادمة.</p>}
        </div>
      </div>
      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Stars value={v.rating} count={v.reviews} />
        <span className="muted" style={{ flex: 1, minWidth: 200 }}>تقييمك يرفع ظهورك في نتائج البحث. الرد على الطلبات خلال ساعتين يرفع ترتيبك أكثر.</span>
        <button className="btn sm" onClick={() => setTab("profile")}>حسّن ملفك</button>
      </div>
    </>
  );
}

function VRequests({ v, reqs }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState("new");
  const [quoting, setQuoting] = useState(null);
  const [q, setQ] = useState({ amount: "", msg: "" });
  const list = reqs.filter((r) => filter === "all" || r.status === filter).sort((a, b) => b.createdAt - a.createdAt);
  const counts = (s) => reqs.filter((r) => r.status === s).length;
  const openQuote = (r) => {
    const pkg = v.packages?.find((p) => p.id === r.packageId);
    setQ({ amount: r.estimate || pkg?.price || v.price, msg: `حياكم الله، يسعدنا نكون جزء من فرحتكم. العرض يشمل ${pkg ? pkg.items.join("، ") : "التجهيز حسب الطلب"}.` });
    setQuoting(r);
  };
  const sendQuote = (e) => {
    e.preventDefault();
    dispatch({ type: "updateRequest", id: quoting.id, patch: { status: "quoted", quote: +q.amount }, message: { from: "vendor", text: q.msg, at: Date.now() } });
    setQuoting(null); toast("تم إرسال عرض السعر للعميل");
  };
  const ago = (t) => { const m = Math.round((Date.now() - t) / 6e4); return m < 60 ? `قبل ${m || 1} دقيقة` : m < 1440 ? `قبل ${Math.round(m / 60)} ساعة` : `قبل ${Math.round(m / 1440)} يوم`; };
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">صندوق الطلبات</span><h1>الطلبات</h1></div>
        <div className="seg">{[["new", "جديدة"], ["quoted", "عروض مرسلة"], ["confirmed", "مؤكدة"], ["declined", "مرفوضة"], ["all", "الكل"]].map(([k, l]) => <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}{k !== "all" ? ` ${counts(k)}` : ""}</button>)}</div>
      </div>
      {!list.length && <div className="card empty">لا توجد طلبات في هذا القسم.</div>}
      <div style={{ display: "grid", gap: 12 }}>
        {list.map((r) => (
          <motion.div key={r.id} layout className="req">
            <div className="top"><b>{r.clientName}</b><StatusPill s={r.status} />{r.mine && <span className="pill info">من لوحة العميل</span>}<span style={{ flex: 1 }} /><span className="faint" style={{ fontSize: 12 }}>{ago(r.createdAt)}</span></div>
            <div className="meta num"><span><Icon name="PartyPopper" size={14} /> {OCCASIONS.find((o) => o.id === r.type)?.name}</span><span><Icon name="CalendarDays" size={14} /> {r.date}</span><span><Icon name="Users" size={14} /> {fmt(r.guests)} ضيف</span><span><Icon name="MapPin" size={14} /> {r.city}</span>{r.phone && <span><Icon name="Phone" size={14} /> {r.phone}</span>}</div>
            {r.note && <div className="bubble" style={{ fontSize: 14, maxWidth: "100%" }}>{r.note}</div>}
            {r.status === "new" && (
              <div className="acts">
                <button className="btn sm gold" onClick={() => openQuote(r)}><Icon name="Send" size={14} /> أرسل عرض سعر</button>
                <button className="btn sm" onClick={() => { dispatch({ type: "updateRequest", id: r.id, patch: { status: "confirmed", quote: r.estimate || v.price }, message: { from: "vendor", text: "تم تأكيد الحجز مباشرة", at: Date.now() } }); toast("تم تأكيد الحجز"); }}>تأكيد مباشر</button>
                <button className="btn sm ghost" onClick={() => dispatch({ type: "updateRequest", id: r.id, patch: { status: "declined" }, message: { from: "vendor", text: "نعتذر، التاريخ غير متاح", at: Date.now() } })}>اعتذار</button>
              </div>
            )}
            {r.status === "quoted" && <div className="acts"><span className="muted">عرضك: <b className="gold num">{sar(r.quote)}</b> · بانتظار رد العميل</span><span style={{ flex: 1 }} /><button className="btn sm" onClick={() => { dispatch({ type: "updateRequest", id: r.id, patch: { status: "confirmed" } }); toast("تم تأكيد الحجز"); }}>العميل وافق هاتفياً</button></div>}
            {r.status === "confirmed" && <div className="acts"><span className="muted">قيمة الحجز: <b className="gold num">{sar(r.quote)}</b></span></div>}
          </motion.div>
        ))}
      </div>
      <Modal open={!!quoting} onClose={() => setQuoting(null)} title={quoting ? "عرض سعر لـ " + quoting.clientName : ""}>
        <form style={{ display: "grid", gap: 12 }} onSubmit={sendQuote}>
          <div className="field"><label htmlFor="q-amt">المبلغ (ر.س)</label><input id="q-amt" type="number" min="0" required className="input num" value={q.amount} onChange={(e) => setQ({ ...q, amount: e.target.value })} /></div>
          <div className="field"><label htmlFor="q-msg">رسالة للعميل</label><textarea id="q-msg" rows="4" className="input" value={q.msg} onChange={(e) => setQ({ ...q, msg: e.target.value })} /></div>
          <div className="faint" style={{ fontSize: 12 }}>شامل ضريبة القيمة المضافة 15%: <span className="num">{sar((+q.amount || 0) * 1.15)}</span></div>
          <button className="btn gold" type="submit">إرسال العرض</button>
        </form>
      </Modal>
    </>
  );
}

function VCalendar({ reqs }) {
  const [offset, setOffset] = useState(0);
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + offset);
  const y = base.getFullYear(), m = base.getMonth();
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const byDay = {};
  reqs.filter((r) => r.status !== "declined").forEach((r) => { (byDay[r.date] = byDay[r.date] || []).push(r); });
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">التوفر</span><h1>التقويم</h1><p className="muted">الأيام المؤكدة تنقفل تلقائياً في صفحتك للعملاء.</p></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="icon-btn" onClick={() => setOffset((o) => o - 1)} aria-label="الشهر السابق"><Icon name="ChevronRight" size={16} /></button>
          <b style={{ minWidth: 130, textAlign: "center" }}>{base.toLocaleDateString("ar-SA-u-ca-gregory", { month: "long", year: "numeric" })}</b>
          <button className="icon-btn" onClick={() => setOffset((o) => o + 1)} aria-label="الشهر التالي"><Icon name="ChevronLeft" size={16} /></button>
        </div>
      </div>
      <div className="card">
        <div className="month">
          {["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map((d) => <div key={d} className="h">{d}</div>)}
          {Array.from({ length: first }, (_, i) => <div key={"b" + i} className="d blank" />)}
          {Array.from({ length: days }, (_, i) => {
            const iso = new Date(Date.UTC(y, m, i + 1)).toISOString().slice(0, 10);
            return (
              <div key={iso} className={"d" + (iso === today ? " today" : "")}>
                <span className="num faint">{i + 1}</span>
                {(byDay[iso] || []).map((r) => <span key={r.id} className={"ev" + (r.status === "confirmed" ? "" : " new")} title={r.clientName}>{r.clientName.split(" ")[0]}</span>)}
              </div>
            );
          })}
        </div>
        <div className="split-legend" style={{ justifyContent: "flex-start", gap: 18, marginTop: 14 }}><span className="gold">■ مؤكد</span><span className="rose">■ طلب أو عرض قيد الانتظار</span></div>
      </div>
    </>
  );
}

function VPackages({ v }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  const pkgs = v.packages || [];
  const save = (e) => {
    e.preventDefault();
    const p = { ...edit, price: +edit.price, items: edit.itemsText.split("\n").map((s) => s.trim()).filter(Boolean) };
    delete p.itemsText;
    const next = pkgs.some((x) => x.id === p.id) ? pkgs.map((x) => (x.id === p.id ? p : x)) : [...pkgs, p];
    dispatch({ type: "vendorEdit", id: v.id, patch: { packages: next, price: Math.min(...next.map((x) => x.price)) } });
    setEdit(null); toast("تم حفظ الباقة");
  };
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">ما تقدمه للعملاء</span><h1>الباقات والأسعار</h1></div><button className="btn gold" onClick={() => setEdit({ id: uid("p"), name: "", price: "", itemsText: "" })}><Icon name="Plus" size={16} /> باقة جديدة</button></div>
      {!pkgs.length && <div className="card empty">ما أضفت باقات للحين. الباقات الواضحة ترفع طلبات الحجز.</div>}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {pkgs.map((p) => (
          <div key={p.id} className="card" style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{p.name}</b><div style={{ display: "flex", gap: 6 }}><button className="icon-btn" aria-label="تعديل" onClick={() => setEdit({ ...p, itemsText: p.items.join("\n") })}><Icon name="Pencil" size={15} /></button><button className="icon-btn" aria-label="حذف" onClick={() => dispatch({ type: "vendorEdit", id: v.id, patch: { packages: pkgs.filter((x) => x.id !== p.id) } })}><Icon name="Trash2" size={15} /></button></div></div>
            <b className="gold num" style={{ fontSize: 22 }}>{sar(p.price)}</b>
            <ul style={{ margin: 0, paddingRight: 18, color: "var(--muted)", fontSize: 14 }}>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
          </div>
        ))}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="الباقة">
        {edit && <form style={{ display: "grid", gap: 12 }} onSubmit={save}>
          <div className="field"><label htmlFor="p-name">اسم الباقة</label><input id="p-name" className="input" required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="p-price">السعر (ر.س)</label><input id="p-price" type="number" min="0" required className="input num" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} /></div>
          <div className="field"><label htmlFor="p-items">المحتويات (سطر لكل بند)</label><textarea id="p-items" rows="5" className="input" value={edit.itemsText} onChange={(e) => setEdit({ ...edit, itemsText: e.target.value })} placeholder={"كوشة رئيسية\nإضاءة\nمصور 4 ساعات"} /></div>
          <button className="btn gold" type="submit">حفظ</button>
        </form>}
      </Modal>
    </>
  );
}

function VProfile({ v }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [f, setF] = useState({ name: v.name, about: v.about, city: v.city, area: v.area || "", tags: v.tags.join("، "), cats: v.cats || [v.cat] });
  const save = (e) => { e.preventDefault(); dispatch({ type: "vendorEdit", id: v.id, patch: { ...f, tags: f.tags.split(/[,،]/).map((s) => s.trim()).filter(Boolean), cat: f.cats[0] || v.cat } }); toast("تم تحديث ملفك"); };
  const toggleCat = (c) => setF((x) => ({ ...x, cats: x.cats.includes(c) ? x.cats.filter((y) => y !== c) : [...x.cats, c] }));
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">واجهتك أمام العملاء</span><h1>الملف التعريفي</h1></div><a className="btn" href={"#venue-" + v.id}><Icon name="Eye" size={16} /> معاينة صفحتي</a></div>
      <form className="card form-grid" onSubmit={save}>
        <div className="field"><label htmlFor="vp-name">الاسم التجاري</label><input id="vp-name" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="vp-city">المدينة</label><select id="vp-city" className="select" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="field full"><label htmlFor="vp-area">نطاق الخدمة</label><input id="vp-area" className="input" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></div>
        <div className="field full"><label htmlFor="vp-about">نبذة عنك</label><textarea id="vp-about" rows="5" className="input" value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} /></div>
        {v.type !== "hall" && <div className="field full"><label>الخدمات اللي تقدمها</label><div className="occasion-row">{CATEGORIES.filter((c) => c.id !== "halls").map((c) => <button type="button" key={c.id} className={"chip" + (f.cats.includes(c.id) ? " on" : "")} onClick={() => toggleCat(c.id)}><Icon name={c.icon} size={14} /> {c.name}</button>)}</div></div>}
        <div className="field full"><label htmlFor="vp-tags">مميزات قصيرة (افصل بفاصلة)</label><input id="vp-tags" className="input" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></div>
        <button className="btn gold" type="submit">حفظ التغييرات</button>
      </form>
    </>
  );
}

function VPlan() {
  const toast = useToast();
  const plans = [
    ["أساسي", 0, ["ملف تعريفي وظهور في البحث", "حتى 10 طلبات شهرياً", "عمولة 8% على الحجز المؤكد"]],
    ["احترافي", 299, ["طلبات غير محدودة", "تقويم وباقات وتقارير", "عمولة 5%", "شارة مزود موثق"], true],
    ["قاعات وقصور", 999, ["كل مزايا الاحترافي", "نظام تأكيد أعداد الضيوف لعملائك", "شاشة استقبال QR عند البوابة", "عمولة 3% ومدير حساب"]],
  ];
  return (
    <>
      <div className="main-head"><div><span className="eyebrow">نموذج الاشتراك</span><h1>اشتراكي</h1><p className="muted">بدون عمولة على أول 10 حجوزات لكل تاجر جديد.</p></div></div>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {plans.map(([n, p, items, hot]) => (
          <div key={n} className="card" style={{ display: "grid", gap: 12, alignContent: "start", borderColor: hot ? "var(--gold-2)" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><b>{n}</b>{hot && <span className="pill ok">الأكثر اختياراً</span>}</div>
            <div><span className="num" style={{ fontSize: 30, fontWeight: 700 }}>{p ? fmt(p) : "مجاني"}</span>{p > 0 && <span className="muted"> ر.س / شهرياً</span>}</div>
            <ul style={{ margin: 0, paddingRight: 18, color: "var(--muted)", fontSize: 14, display: "grid", gap: 4 }}>{items.map((i) => <li key={i}>{i}</li>)}</ul>
            <button className={"btn" + (hot ? " gold" : "")} disabled={!p} onClick={() => toast("الدفع الإلكتروني يتفعّل مع الإطلاق الرسمي")}>{p ? "ترقية" : "باقتك الحالية"}</button>
          </div>
        ))}
      </div>
    </>
  );
}
