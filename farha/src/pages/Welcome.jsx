import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, Counter, Magnetic, Tilt, Art, QR, Footer } from "../components/ui";
import ParticleWord from "../components/ParticleWord";
import { OCCASIONS, CITIES, TIERS, CATEGORIES, VENDORS, estimateBudget, hospitality, sar, fmt } from "../data";
import { useStore, go, shiftDate } from "../store";

const OCC_ICONS = { wedding: "Gem", milka: "Heart", grad: "GraduationCap", aqiqa: "Baby", family: "Users", corp: "Briefcase" };
const CAT_DESC = {
  halls: "قاعات بقسمين منفصلين، تقارن السعة والسعر والتوفر لحظياً",
  kosha: "كوشات رئيسية وطاولات رجالية بتصاميم تختارها قبل التنفيذ",
  tents: "خيام تراثية وبيوت شعر وسجاد وطاولات للمناسبات الخارجية",
  photo: "استديوهات تصوير ومصورات لقسم النساء وفيديو سينمائي",
  av: "سماعات احترافية وشاشات LED وإضاءة معمارية",
  live: "بث مباشر للأهل البعيدين وللقسم الآخر",
  hosp: "مفروشات وقهوجية وصبابين وضيافة كاملة",
  power: "مولدات صامتة احتياطية مع فني طوال الحفل",
  stage: "استيدج ومسرح وتجهيز كامل للفقرات",
};

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "صباح الفرح";
  if (h >= 12 && h < 17) return "نهارك سعيد";
  return "مساء الفرح";
}
const daysTo = (iso) => Math.max(0, Math.ceil((new Date(iso) - new Date()) / 864e5));

/* شاشة افتتاح قصيرة: نجمة نجدية تُرسم بالذهب ثم تنفتح الصفحة */
function Curtain({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2300); return () => clearTimeout(t); }, [onDone]);
  const star = "M100 8 L127 73 L192 100 L127 127 L100 192 L73 127 L8 100 L73 73 Z";
  return (
    <motion.div className="curtain" initial={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(10px)" }} transition={{ duration: .7 }}>
      <div>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <path className="star" d={star} />
          <rect className="star s2" x="44" y="44" width="112" height="112" transform="rotate(45 100 100)" />
          <circle className="star" cx="100" cy="100" r="30" />
        </svg>
        <div className="word">فرحة</div>
      </div>
      <button className="skip" onClick={onDone}>تخطي</button>
    </motion.div>
  );
}

/* القاعة الحية: كل نقطة تمثل 8 ضيوف وتضيء حسب العدد والتقسيم */
function HallViz({ guests, menRatio }) {
  const men = Math.round(guests * menRatio), women = guests - men;
  const cols = 12, rows = 8, per = 8;
  const dots = (n, x0, color) => Array.from({ length: cols * rows }, (_, i) => {
    const on = i < Math.ceil(n / per);
    const cx = x0 + (i % cols) * 11 + 6, cy = 30 + Math.floor(i / cols) * 11;
    return <circle key={i} cx={cx} cy={cy} r={on ? 3.2 : 1.6} fill={on ? color : "#3a3149"} style={{ transition: `all .4s cubic-bezier(.2,.8,.2,1) ${(i % cols) * 12}ms` }} />;
  });
  return (
    <div className="hall-viz">
      <svg viewBox="0 0 290 128" role="img" aria-label={`${men} رجال و ${women} نساء`}>
        <text x="282" y="16" fill="#a99fb6" fontSize="10" textAnchor="start" direction="rtl">قسم الرجال</text>
        <text x="132" y="16" fill="#a99fb6" fontSize="10" textAnchor="start" direction="rtl">قسم النساء</text>
        {dots(men, 150, "#e9c98b")}
        <line x1="145" y1="22" x2="145" y2="118" stroke="#e9c98b" strokeOpacity=".25" strokeDasharray="3 3" />
        {dots(women, 4, "#e09aae")}
      </svg>
      <div className="split-legend num"><span className="gold">{fmt(men)} رجال</span><span>كل نقطة = 8 ضيوف</span><span className="rose">{fmt(women)} نساء</span></div>
    </div>
  );
}

const Q = ({ children }) => <motion.div className="bubble" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{children}</motion.div>;
const A = ({ children }) => <motion.div className="bubble me" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}>{children}</motion.div>;

function Concierge({ onWord }) {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ type: "", city: "الرياض", date: shiftDate(new Date().toISOString(), 75), guests: 450, menRatio: 0.5, tier: "mid", name: "", phone: "" });
  const [thinking, setThinking] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const occ = OCCASIONS.find((o) => o.id === f.type);
  const total = 6;

  useEffect(() => { if (occ) onWord(occ.word); }, [occ, onWord]);

  const next = () => {
    if (step === 4) {
      setThinking(true);
      setTimeout(() => { setThinking(false); setStep(5); if (f.name) onWord(f.name.split(" ")[0]); }, 1500);
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const men = Math.round(f.guests * f.menRatio), women = f.guests - men;
  const plan = useMemo(() => estimateBudget(f), [f]);
  const hosp = useMemo(() => hospitality({ men, women }), [men, women]);
  const matches = useMemo(() => VENDORS.filter((v) => v.type === "hall")
    .map((v) => {
      let s = 60;
      if (v.city === f.city) s += 22;
      if (v.capacity >= f.guests) s += 10; else s -= 25;
      if (v.capacity < f.guests * 1.6) s += 4;
      s += (v.rating - 4.5) * 8;
      return { v, s: Math.max(40, Math.min(99, Math.round(s))) };
    }).sort((a, b) => b.s - a.s).slice(0, 3), [f.city, f.guests]);

  const start = () => {
    dispatch({ type: "createEvent", user: { name: f.name || "ضيفنا", phone: f.phone }, event: { type: f.type || "wedding", city: f.city, date: f.date, guests: f.guests, menRatio: f.menRatio, tier: f.tier, title: `${occ?.name || "زواج"} ${f.name ? f.name.split(" ")[0] : ""}`.trim() } });
    go("my");
  };

  // عميل عائد
  if (state.event && step === 0 && !f.type) {
    const e = state.event;
    const o = OCCASIONS.find((x) => x.id === e.type);
    const yes = state.guests.filter((g) => g.status === "yes").reduce((s, g) => s + g.count, 0);
    const paid = state.budget.reduce((s, b) => s + (b.paid || 0), 0), est = state.budget.reduce((s, b) => s + b.est, 0);
    const done = state.tasks.filter((t) => t.done).length;
    return (
      <div className="concierge" id="concierge">
        <div className="c-head"><div className="c-avatar">ف</div><div><b>مساعد فرحة</b><small>● متصل الآن</small></div></div>
        <div className="c-body" style={{ gap: 12 }}>
          <div className="bubble">أهلاً من جديد يا {state.user?.name || "ضيفنا"}. هذا ملخص {o?.name || "مناسبتك"} حتى الآن:</div>
          <div className="plan-grid">
            <div className="plan-tile wide"><div><small>باقي على المناسبة</small><b className="num"><Counter value={daysTo(e.date)} /> يوم</b></div><Icon name="CalendarHeart" size={34} className="gold" /></div>
            <div className="plan-tile"><small>ضيوف مؤكدين</small><b><Counter value={yes} /></b></div>
            <div className="plan-tile"><small>المهام المنجزة</small><b className="num">{done}/{state.tasks.length}</b></div>
            <div className="plan-tile wide" style={{ display: "block" }}><small>المدفوع من الميزانية</small><b className="num">{sar(paid)} <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>من {sar(est)}</span></b><div className="bar" style={{ marginTop: 8 }}><i style={{ width: `${est ? (paid / est) * 100 : 0}%` }} /></div></div>
          </div>
          <div className="c-foot" style={{ marginTop: "auto" }}>
            <button className="btn ghost sm" onClick={() => set("type", "wedding")}>خطط لمناسبة جديدة</button>
            <div className="spacer" />
            <Magnetic><button className="btn gold" onClick={() => go("my")}>كمّل من حيث وقفت <Icon name="ArrowLeft" size={16} /></button></Magnetic>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="concierge" id="concierge">
      <div className="c-head">
        <div className="c-avatar">ف</div>
        <div><b>مساعد فرحة</b><small>● يخطط معك خلال دقيقة</small></div>
        <div className="c-progress" aria-label={`الخطوة ${step + 1} من ${total}`}>{Array.from({ length: total }, (_, i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
      </div>
      <div className="c-body">
        <AnimatePresence mode="wait">
          <motion.div key={thinking ? "t" : step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: .3 }} style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            {thinking ? (
              <>
                <Q>لحظة، أجهز لك خطة {occ?.name} كاملة…</Q>
                <div className="bubble" style={{ width: "fit-content" }}><span className="typing"><i /><i /><i /></span></div>
                <div className="faint" style={{ fontSize: 13, marginTop: 8 }}>أحسب الميزانية والضيافة وأطابق القاعات في {f.city}</div>
              </>
            ) : step === 0 ? (
              <>
                <Q>{greeting()}! أنا مساعدك في فرحة. وش المناسبة اللي نجهز لها؟</Q>
                <div className="choice-grid">
                  {OCCASIONS.map((o) => (
                    <button key={o.id} className={"choice" + (f.type === o.id ? " on" : "")} onClick={() => { set("type", o.id); setTimeout(() => setStep(1), 260); }}>
                      <span className="ic"><Icon name={OCC_ICONS[o.id]} /></span><b>{o.name}</b><small>{o.hint}</small>
                    </button>
                  ))}
                </div>
              </>
            ) : step === 1 ? (
              <>
                <A>{occ?.name}</A>
                <Q>مبروك مقدماً 🤍 في أي مدينة، ومتى التاريخ المتوقع؟</Q>
                <div className="occasion-row">{CITIES.map((c) => <button key={c} className={"chip" + (f.city === c ? " on" : "")} onClick={() => set("city", c)}>{c}</button>)}</div>
                <div className="field" style={{ marginTop: 6 }}>
                  <label htmlFor="c-date">تاريخ المناسبة</label>
                  <input id="c-date" type="date" className="input num" value={f.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => set("date", e.target.value)} />
                </div>
                <div className="occasion-row">{[[30, "بعد شهر"], [90, "بعد 3 أشهر"], [180, "بعد 6 أشهر"]].map(([d, l]) => <button key={d} className="chip" onClick={() => set("date", shiftDate(new Date().toISOString(), d))}>{l}</button>)}</div>
              </>
            ) : step === 2 ? (
              <>
                <A>{f.city}، بعد {daysTo(f.date)} يوم</A>
                <Q>كم عدد الضيوف المتوقع؟ حرّك المؤشر وشوف القاعة تمتلي.</Q>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}><span className="big-num gold"><Counter value={f.guests} duration={300} /></span><span className="muted">ضيف</span></div>
                <label className="sr" htmlFor="c-guests">عدد الضيوف</label>
                <input id="c-guests" type="range" min="50" max="1500" step="10" value={f.guests} onChange={(e) => set("guests", +e.target.value)} />
                <label className="faint" htmlFor="c-ratio" style={{ fontSize: 12.5 }}>نسبة الرجال إلى النساء</label>
                <input id="c-ratio" type="range" min="0.1" max="0.9" step="0.05" value={f.menRatio} onChange={(e) => set("menRatio", +e.target.value)} />
                <HallViz guests={f.guests} menRatio={f.menRatio} />
              </>
            ) : step === 3 ? (
              <>
                <A>{fmt(f.guests)} ضيف</A>
                <Q>وش مستوى التجهيز اللي يناسبك؟</Q>
                <div className="choice-grid">
                  {TIERS.map((t) => {
                    const est = estimateBudget({ guests: f.guests, tier: t.id }).total;
                    return (
                      <button key={t.id} className={"choice" + (f.tier === t.id ? " on" : "")} onClick={() => set("tier", t.id)}>
                        <span className="ic"><Icon name={t.id === "lux" ? "Crown" : t.id === "mid" ? "Sparkles" : "Leaf"} /></span>
                        <b>{t.name}</b><small>{t.desc}</small><small className="gold num">≈ {sar(est)}</small>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : step === 4 ? (
              <>
                <A>{TIERS.find((t) => t.id === f.tier)?.name}</A>
                <Q>آخر شيء: وش اسمك؟ عشان أجهز لوحتك الخاصة.</Q>
                <div className="field"><label htmlFor="c-name">الاسم</label><input id="c-name" className="input" placeholder="مثال: عبدالله" value={f.name} onChange={(e) => set("name", e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()} autoFocus /></div>
                <div className="field"><label htmlFor="c-phone">رقم الجوال (اختياري)</label><input id="c-phone" className="input num" inputMode="tel" placeholder="05xxxxxxxx" value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))} /></div>
                <div className="faint" style={{ fontSize: 12 }}><Icon name="Lock" size={12} /> بياناتك تبقى عندك ولا نشاركها مع أي مزود بدون موافقتك.</div>
              </>
            ) : (
              <>
                <Q>خطتك جاهزة يا {f.name || "ضيفنا"} ✨</Q>
                <div className="plan-grid">
                  <div className="plan-tile wide"><div><small>الميزانية التقديرية</small><b className="gold"><Counter value={plan.total} /> <span style={{ fontSize: 14 }}>ر.س</span></b></div><Icon name="Wallet" size={30} className="gold" /></div>
                  <div className="plan-tile"><small>ذبائح تقريباً</small><b><Counter value={hosp.sheep} /></b></div>
                  <div className="plan-tile"><small>قهوة سعودية</small><b><Counter value={hosp.coffee} /> كجم</b></div>
                  <div className="plan-tile"><small>قهوجية وصبابين</small><b><Counter value={hosp.servers} /></b></div>
                  <div className="plan-tile"><small>باقي على الموعد</small><b><Counter value={daysTo(f.date)} /> يوم</b></div>
                </div>
                <div className="faint" style={{ fontSize: 12.5, marginTop: 4 }}>أنسب القاعات في {f.city} لـ {fmt(f.guests)} ضيف:</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {matches.map(({ v, s }) => (
                    <a key={v.id} className="match" href={"#venue-" + v.id}>
                      <div className="thumb"><Art seed={v.id} hue={v.hue} /></div>
                      <div style={{ minWidth: 0 }}><b style={{ fontSize: 14 }}>{v.name}</b><div className="faint" style={{ fontSize: 12 }}>{v.city} · سعة {fmt(v.capacity)}</div></div>
                      <div className="pct"><b className="num">{s}%</b>تطابق</div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        {!thinking && step > 0 && (
          <div className="c-foot">
            <button className="btn ghost sm" onClick={back}><Icon name="ArrowRight" size={15} /> رجوع</button>
            <div className="spacer" />
            {step < 5
              ? <Magnetic><button className="btn gold" onClick={next} disabled={step === 4 && !f.name.trim()}>{step === 4 ? "جهّز خطتي" : "التالي"} <Icon name="ArrowLeft" size={16} /></button></Magnetic>
              : <Magnetic><button className="btn gold" onClick={start}>افتح لوحة مناسبتي <Icon name="ArrowLeft" size={16} /></button></Magnetic>}
          </div>
        )}
      </div>
    </div>
  );
}

function InviteShowcase() {
  const [name, setName] = useState("عبدالله و نورة");
  const [flip, setFlip] = useState(false);
  useEffect(() => { const t = setInterval(() => setFlip((x) => !x), 4200); return () => clearInterval(t); }, []);
  return (
    <div className="split">
      <div>
        <div className="sec-head" style={{ marginBottom: 0 }}>
          <span className="eyebrow">الدعوات الذكية</span>
          <h2>دعوة تعرف <span className="ruq">ضيفك</span> باسمه</h2>
          <p>كل ضيف يوصله رابط دعوة خاص على الواتساب. يرد بضغطة، ويوصله رمز دخول خاص فيه، وأنت تشوف العدد يتحدّث لحظة بلحظة.</p>
        </div>
        <ul className="feature-list">
          <li><span className="ic"><Icon name="MessageCircle" size={18} /></span><div><b>تأكيد الحضور من الواتساب</b><span>بدون تطبيق ولا تسجيل للضيف. رابط واحد ورد واحد.</span></div></li>
          <li><span className="ic"><Icon name="ScanLine" size={18} /></span><div><b>دخول برمز QR لكل ضيف</b><span>الحارس يمسح الرمز عند الباب ويعرف القسم وعدد المرافقين.</span></div></li>
          <li><span className="ic"><Icon name="ShieldCheck" size={18} /></span><div><b>خصوصية قسم النساء</b><span>دعوات قسم النساء وبياناته ما يشوفها إلا المسؤولة عنه.</span></div></li>
        </ul>
        <div className="field" style={{ marginTop: 24, maxWidth: 360 }}>
          <label htmlFor="inv-name">جرّب: اكتب اسمي العريسين</label>
          <input id="inv-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={28} />
        </div>
      </div>
      <div className="invite-stage">
        <div className={"invite-card" + (flip ? " flip" : "")} onClick={() => setFlip((x) => !x)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setFlip((x) => !x)} aria-label="اقلب بطاقة الدعوة">
          <div className="invite-face tpl-najd">
            <div className="frame" />
            <div className="small">بسم الله الرحمن الرحيم</div>
            <div style={{ margin: "18px 0 6px", fontSize: 13, opacity: .8 }}>يتشرفون بدعوتكم لحضور حفل زواج</div>
            <div className="names">{name || "…"}</div>
            <div style={{ marginTop: 18, fontSize: 13 }} className="num">الخميس 18 ديسمبر · 8:30 مساءً</div>
            <div className="small" style={{ marginTop: 6 }}>قصر الندى · الرياض</div>
            <div className="small" style={{ marginTop: 22 }}>اضغط على البطاقة لقلبها</div>
          </div>
          <div className="invite-face back tpl-najd">
            <div className="frame" />
            <div className="small">بطاقة دخول خاصة</div>
            <div style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 16px" }}>أ. خالد الدوسري</div>
            <div className="qr"><QR text="FARHA-K7Q2M" /></div>
            <div className="num" style={{ marginTop: 14, letterSpacing: ".2em", fontWeight: 600 }}>K7Q2M</div>
            <div className="small" style={{ marginTop: 6 }}>قسم الرجال · 3 مرافقين</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Welcome() {
  const [showCurtain, setShowCurtain] = useState(() => { try { return !sessionStorage.getItem("farha.seen"); } catch { return false; } });
  const [word, setWord] = useState("فرحة");
  const [locked, setLocked] = useState(false);
  const heroRef = useRef(null);
  const { state } = useStore();

  const hideCurtain = React.useCallback(() => { setShowCurtain(false); try { sessionStorage.setItem("farha.seen", "1"); } catch { /* */ } }, []);
  const lockWord = React.useCallback((w) => { setLocked(true); setWord(w); }, []);

  useEffect(() => {
    if (locked) return;
    const words = ["فرحة", ...OCCASIONS.slice(0, 4).map((o) => o.word)];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % words.length; setWord(words[i]); }, 3400);
    return () => clearInterval(t);
  }, [locked]);

  const onMove = (e) => {
    const el = heroRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const ev = state.event;

  return (
    <>
      <AnimatePresence>{showCurtain && <Curtain onDone={hideCurtain} />}</AnimatePresence>

      <section className="hero" ref={heroRef} onMouseMove={onMove}>
        <div className="wrap hero-grid">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: showCurtain ? 2.1 : .1, ease: [.2, .8, .2, 1] }}>
            <span className="greet">
              <span className="dot"><Icon name={new Date().getHours() >= 5 && new Date().getHours() < 17 ? "Sun" : "Moon"} size={14} /></span>
              {ev ? <>أهلاً من جديد {state.user?.name}، باقي <b className="gold num">{daysTo(ev.date)}</b> يوم على فرحتك</> : <>{greeting()}، حياك في فرحة</>}
            </span>
            <h1>كل تفاصيل <span className="ruq">فرحتك</span><br />في مكان واحد</h1>
            <p className="lead">قاعات، كوشة، تصوير، ضيافة، صوت وإضاءة، بث مباشر، ودعوات ذكية. خطط لمناسبتك مع أهلك في لوحة وحدة، واحجز من مزودين موثوقين في كل مدن المملكة.</p>

            <div className="word-stage"><ParticleWord word={word} /></div>
            <div className="occasion-row" role="group" aria-label="اختر المناسبة">
              {OCCASIONS.slice(0, 5).map((o) => (
                <button key={o.id} className={"chip" + (word === o.word ? " on" : "")} onMouseEnter={() => lockWord(o.word)} onFocus={() => lockWord(o.word)} onClick={() => lockWord(o.word)}>{o.name}</button>
              ))}
            </div>

            <div className="hero-cta">
              <Magnetic><button className="btn gold lg" onClick={() => document.getElementById("concierge")?.scrollIntoView({ behavior: "smooth", block: "center" })}>خطط مناسبتك في دقيقة <Icon name="Sparkles" size={18} /></button></Magnetic>
              <Magnetic><a className="btn lg ghost" href="#explore">تصفح القاعات <Icon name="ArrowLeft" size={18} /></a></Magnetic>
            </div>
            <div className="trust">
              <span><Icon name="BadgeCheck" size={15} /> مزودون موثقون</span>
              <span><Icon name="Users" size={15} /> قسم رجال وقسم نساء</span>
              <span><Icon name="MessageCircle" size={15} /> تأكيد حضور بالواتساب</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, delay: showCurtain ? 2.3 : .25, ease: [.2, .8, .2, 1] }} style={{ minWidth: 0 }}>
            <Concierge onWord={lockWord} />
          </motion.div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="track">
          {[0, 1].map((k) => <span key={k}>{CATEGORIES.map((c) => c.short).join("  ✦  ")}</span>)}
        </div>
      </div>

      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">كل ما تحتاجه المناسبة</span>
            <h2>من <span className="ruq">الكوشة</span> إلى مولد الكهرباء</h2>
            <p>تسع فئات تغطي تجهيز المناسبة من أولها لآخرها. قارن العروض واحجز، وتابع كل مزود من نفس اللوحة.</p>
          </div>
          <div className="svc-grid">
            {CATEGORIES.map((c) => {
              const n = VENDORS.filter((v) => v.cat === c.id || v.cats?.includes(c.id)).length;
              return (
                <Tilt key={c.id} className="svc" onClick={() => go("explore")} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && go("explore")} style={{ cursor: "pointer" }}>
                  <span className="count num">{n} مزود</span>
                  <span className="ic"><Icon name={c.icon} size={22} /></span>
                  <h3>{c.name}</h3>
                  <p>{CAT_DESC[c.id]}</p>
                </Tilt>
              );
            })}
            <Tilt className="svc" style={{ background: "linear-gradient(135deg, rgba(233,201,139,.16), rgba(224,154,174,.08))", borderColor: "rgba(233,201,139,.3)", cursor: "pointer" }} onClick={() => go("vendor")} role="link" tabIndex={0}>
              <span className="ic"><Icon name="Store" size={22} /></span>
              <h3>تقدم خدمة للمناسبات؟</h3>
              <p>سجّل نشاطك واستقبل الطلبات من العملاء مباشرة.</p>
            </Tilt>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">كيف تشتغل فرحة</span>
            <h2>أربع خطوات من الفكرة إلى <span className="ruq">ليلة العمر</span></h2>
          </div>
          <div className="steps">
            {[
              ["احكي للمساعد عن مناسبتك", "نوع المناسبة والمدينة والعدد والمستوى. يطلع لك ميزانية تقديرية وخطة ضيافة خلال دقيقة."],
              ["قارن واحجز", "قاعات ومزودين بأسعار واضحة وتقويم توفر حقيقي. اطلب عرض سعر أو احجز مباشرة."],
              ["جهّز مع أهلك", "وزّع المهام على العائلة، وتابع الميزانية والدفعات، وأرسل الدعوات بالواتساب."],
              ["استقبل ضيوفك", "وضع يوم المناسبة: مسح رموز الدخول عند الباب وعدّاد حضور مباشر لكل قسم."],
            ].map(([t, d], i) => (
              <motion.div key={i} className="step" initial={{ opacity: .3, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * .12, duration: .6 }}>
                <span className="n num">{i + 1}</span><h3>{t}</h3><p>{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="block"><div className="wrap"><InviteShowcase /></div></section>

      <section className="block" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <div className="vendor-band split">
            <div>
              <span className="eyebrow">لأصحاب القاعات ومزودي الخدمات</span>
              <h2 style={{ fontSize: "clamp(26px,3.2vw,40px)", marginTop: 10 }}>عملاؤك يدورونك هنا. <span className="display gold">استقبلهم</span></h2>
              <p className="muted" style={{ marginTop: 12, maxWidth: "48ch" }}>لوحة تحكم كاملة: طلبات الحجز، وعروض الأسعار، وتقويم التوفر، والباقات، والإيرادات. بدون عمولة على أول 10 حجوزات.</p>
              <div className="hero-cta"><Magnetic><a className="btn gold" href="#vendor">افتح بوابة التاجر <Icon name="ArrowLeft" size={16} /></a></Magnetic></div>
            </div>
            <div className="mini-dash" aria-hidden="true">
              {state.requests.filter((r) => r.vendorId === "v1").slice(0, 3).map((r, i) => (
                <motion.div key={r.id} className="mini-row" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * .15 }}>
                  <span className="icon-btn" style={{ color: "var(--gold)" }}><Icon name={OCC_ICONS[r.type] || "Calendar"} size={17} /></span>
                  <div className="who"><b>{r.clientName}</b><small className="num">{r.city} · {fmt(r.guests)} ضيف · {r.date}</small></div>
                  <span className={"pill " + (r.status === "confirmed" ? "ok" : r.status === "quoted" ? "info" : "wait")}>{r.status === "confirmed" ? "مؤكد" : r.status === "quoted" ? "عرض مرسل" : "طلب جديد"}</span>
                </motion.div>
              ))}
              <div className="mini-row"><div className="who"><small>إيرادات مؤكدة هذا الشهر</small><b className="gold num" style={{ fontSize: 22 }}>{sar(state.requests.filter((r) => r.vendorId === "v1" && r.status === "confirmed").reduce((s, r) => s + (r.quote || 0), 0))}</b></div><Icon name="TrendingUp" className="rose" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" style={{ textAlign: "center" }}>
        <div className="wrap" style={{ display: "grid", justifyItems: "center", gap: 18 }}>
          <span className="display gold" style={{ fontSize: "clamp(40px,6vw,76px)", lineHeight: 1.2 }}>فرحتك تبدأ من هنا</span>
          <p className="muted" style={{ maxWidth: "52ch" }}>خطة كاملة لمناسبتك خلال دقيقة، مجاناً وبدون تسجيل.</p>
          <Magnetic><button className="btn gold lg" onClick={() => document.getElementById("concierge")?.scrollIntoView({ behavior: "smooth", block: "center" })}>ابدأ الآن <Icon name="Sparkles" size={18} /></button></Magnetic>
        </div>
      </section>
      <Footer />
    </>
  );
}
