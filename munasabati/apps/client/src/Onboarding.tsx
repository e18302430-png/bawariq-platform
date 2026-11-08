import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CITIES, OCCASIONS, TIERS, BUDGET_SPLIT, STYLES, createEvent, daysUntil, fmt, suggestPlan, hospitality, shiftDate, today,
  type OccasionId, type StyleId, type TierId,
} from "@munasabati/core";
import { Counter, Icon, Media, MeshGradient, PhoneAuth, apply, isCloud, repo, useDB } from "@munasabati/ui";

const OCC_ICON: Record<OccasionId, string> = { wedding: "Gem", milka: "Heart", grad: "GraduationCap", aqiqa: "Baby", family: "Users", corp: "Briefcase" };
const greeting = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? "صباح الخير" : h < 17 ? "نهارك سعيد" : "مساء الخير"; };
const STEPS = 9;

/** مقاعد القاعة الحية: كل نقطة = 8 ضيوف */
function Seats({ guests, menRatio }: { guests: number; menRatio: number }) {
  const men = Math.round(guests * menRatio), women = guests - men, cols = 12, rows = 8;
  const dots = (n: number, x0: number) => Array.from({ length: cols * rows }, (_, i) => {
    const on = i < Math.ceil(n / 8);
    return <circle key={i} cx={x0 + (i % cols) * 11 + 6} cy={26 + Math.floor(i / cols) * 11} r={on ? 3.4 : 1.5} fill="#fff" opacity={on ? 1 : 0.28} style={{ transition: `all .45s cubic-bezier(.22,1,.36,1) ${(i % cols) * 14}ms` }} />;
  });
  return (
    <div className="seats">
      <svg viewBox="0 0 290 120" role="img" aria-label={`${men} رجال و ${women} نساء`}>
        <text x="284" y="13" fill="#fff" fillOpacity=".8" fontSize="10.5">قسم الرجال</text>
        <text x="136" y="13" fill="#fff" fillOpacity=".8" fontSize="10.5">قسم النساء</text>
        {dots(men, 150)}
        <line x1="145" y1="18" x2="145" y2="114" stroke="#fff" strokeOpacity=".35" strokeDasharray="3 4" />
        {dots(women, 4)}
      </svg>
      <div className="row between num" style={{ fontSize: 13, marginTop: 8, opacity: 0.92 }}><b>{fmt(men)} رجال</b><span style={{ opacity: 0.7 }}>كل نقطة = 8 ضيوف</span><b>{fmt(women)} نساء</b></div>
    </div>
  );
}

export default function Onboarding({ preset, source }: { preset?: OccasionId; source?: "invite" } = {}) {
  const db = useDB();
  const [step, setStep] = useState(0);
  const [needAuth, setNeedAuth] = useState(false);
  const [f, setF] = useState({ occasion: (preset ?? "wedding") as OccasionId, style: [] as StyleId[], city: "الرياض", date: shiftDate(today(), 75), guests: 450, menRatio: 0.5, tier: "mid" as TierId, budget: "", name: "", phone: "" });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const occ = OCCASIONS.find((o) => o.id === f.occasion)!;
  const men = Math.round(f.guests * f.menRatio);
  const budget = +f.budget.replace(/\D/g, "") || 0;
  const hosp = useMemo(() => hospitality(men, f.guests - men), [men, f.guests]);
  // معاينة الخطة المقترحة قبل الحفظ: نفس محرك الاقتراح على مناسبة مؤقتة
  const preview = useMemo(() => suggestPlan({ ...db, client: { ...db.client, budget: [], event: { id: "tmp", occasion: f.occasion, city: f.city, date: f.date, guests: f.guests, menRatio: f.menRatio, tier: f.tier, title: "", budget: budget || undefined, style: f.style } } }, { budget: budget || undefined, style: f.style }), [db, f.occasion, f.city, f.date, f.guests, f.menRatio, f.tier, budget, f.style]);

  useEffect(() => {
    if (step !== 7) return;
    const t = setTimeout(() => setStep(8), 1900);
    return () => clearTimeout(t);
  }, [step]);

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = (demo = false) => {
    if (isCloud && !repo.auth?.user()) { setNeedAuth(true); return; }
    create(demo);
  };
  const create = (demo: boolean) => apply(createEvent({ samples: !isCloud,
    occasion: f.occasion, city: f.city, date: f.date, guests: f.guests, menRatio: f.menRatio, tier: f.tier, budget: budget || undefined, style: f.style.length ? f.style : undefined, source: source ?? "direct",
    title: `${occ.name} ${demo ? "عبدالله" : f.name.split(" ")[0]}`.trim(), hostName: demo ? "عبدالله" : f.name.trim() || "ضيفنا", phone: f.phone,
  }));

  const canNext = step !== 6 || f.name.trim().length > 1;

  return (
    <div className="onb">
      <MeshGradient palette={occ.palette} />
      <div className="onb-in">
        <div className="onb-bars" aria-hidden="true">
          {Array.from({ length: STEPS }, (_, i) => <i key={i}><motion.b initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} /></i>)}
        </div>
        <div className="onb-top">
          {step > 0 && step !== 7 ? <button className="btn glass sm" onClick={back} aria-label="رجوع"><Icon name="ArrowRight" size={16} /></button> : <div className="logo">مناسبتي</div>}
          <div className="grow" />
          {step < 7 && !isCloud && <button className="btn glass sm" onClick={() => finish(true)}>جرّب لوحة تجريبية</button>}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} className="onb-body" initial={{ opacity: 0, y: 26, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -18, filter: "blur(6px)" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            {step === 0 && <>
              <span className="onb-sub">{greeting()} 👋</span>
              <h1 className="onb-q" style={{ fontSize: "clamp(40px, 11vw, 64px)" }}>حيّاك في<br />مناسبتي.</h1>
              <p className="onb-sub" style={{ maxWidth: "34ch" }}>اختر ذوقك واكتب ميزانيتك، ونقترح لك كل شيء: القاعة، والكوشة، والتصوير، والضيافة، وأنسب القاعات في مدينتك.</p>
            </>}

            {step === 1 && <>
              <h2 className="onb-q">وش المناسبة اللي<br />نجهز لها؟</h2>
              <div className="onb-grid">
                {OCCASIONS.map((o) => (
                  <button key={o.id} className={"onb-opt" + (f.occasion === o.id ? " on" : "")} onClick={() => { set("occasion", o.id); setTimeout(next, 320); }} aria-pressed={f.occasion === o.id}>
                    <span className="oi"><Icon name={OCC_ICON[o.id]} size={20} /></span><b>{o.name}</b><small>{o.hint}</small>
                  </button>
                ))}
              </div>
            </>}

            {step === 2 && <>
              <h2 className="onb-q">مبروك مقدماً 🤍<br />وين ومتى؟</h2>
              <div className="onb-chips">{CITIES.map((c) => <button key={c} className={"onb-chip" + (f.city === c ? " on" : "")} onClick={() => set("city", c)} aria-pressed={f.city === c}>{c}</button>)}</div>
              <label className="sr" htmlFor="o-date">تاريخ المناسبة</label>
              <input id="o-date" type="date" className="onb-input num" value={f.date} min={today()} onChange={(e) => e.target.value && set("date", e.target.value)} />
              <div className="onb-chips">{[[30, "بعد شهر"], [90, "بعد 3 أشهر"], [180, "بعد 6 أشهر"]].map(([d, l]) => <button key={d} className="onb-chip" onClick={() => set("date", shiftDate(today(), d as number))}>{l}</button>)}</div>
            </>}

            {step === 3 && <>
              <h2 className="onb-q">كم ضيف تتوقع؟</h2>
              <div className="onb-big num"><Counter value={f.guests} /></div>
              <label className="sr" htmlFor="o-g">عدد الضيوف</label>
              <input id="o-g" type="range" min={50} max={1500} step={10} value={f.guests} onChange={(e) => set("guests", +e.target.value)} />
              <label htmlFor="o-r" style={{ fontSize: 13, opacity: 0.85 }}>نسبة الرجال والنساء</label>
              <input id="o-r" type="range" min={0.1} max={0.9} step={0.05} value={f.menRatio} onChange={(e) => set("menRatio", +e.target.value)} />
              <Seats guests={f.guests} menRatio={f.menRatio} />
            </>}

            {step === 4 && <>
              <h2 className="onb-q">كم ميزانيتك؟</h2>
              <p className="onb-sub" style={{ marginTop: -6 }}>أنت تحددها، ونحن نوزعها على البنود ونرشّح لك ما يناسبها.</p>
              <label className="sr" htmlFor="o-b">الميزانية بالريال</label>
              <div className="budget-input">
                <input id="o-b" className="onb-input num" inputMode="numeric" placeholder="اكتب ميزانيتك" value={budget ? fmt(budget) : ""} onChange={(e) => set("budget", e.target.value.replace(/\D/g, "").slice(0, 9))} autoFocus />
                <span>ر.س</span>
              </div>
              <div className="split-bars" aria-hidden={!budget}>
                {BUDGET_SPLIT.map((l) => (
                  <div key={l.cat} className="split-row">
                    <span>{l.label}</span>
                    <i><motion.b initial={false} animate={{ scaleX: budget ? l.pct / 0.35 : 0.04 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} /></i>
                    <b className="num">{budget ? fmt(Math.round((budget * l.pct) / 100) * 100) : "—"}</b>
                  </div>
                ))}
              </div>
              <div className="onb-chips">
                {TIERS.map((t) => <button key={t.id} className={"onb-chip" + (f.tier === t.id ? " on" : "")} onClick={() => set("tier", t.id)} aria-pressed={f.tier === t.id}><Icon name={t.id === "lux" ? "Crown" : t.id === "mid" ? "Sparkles" : "Leaf"} size={14} /> {t.name}</button>)}
              </div>
              {!budget && <span style={{ fontSize: 13, opacity: 0.8 }}>ما حددت بعد؟ تقدر تتخطى وتضيفها لاحقاً من صفحة الميزانية.</span>}
            </>}

            {step === 5 && <>
              <h2 className="onb-q">وش الطابع<br />اللي يشبهك؟</h2>
              <p className="onb-sub" style={{ marginTop: -6 }}>اختر لين ثلاث صور تحبها، ونرشّح لك القاعة والتجهيز على ذوقك وميزانيتك.</p>
              <div className="mood-grid">
                {STYLES.map((m) => { const on = f.style.includes(m.id); return (
                  <button key={m.id} className={"mood" + (on ? " on" : "")} aria-pressed={on} onClick={() => set("style", on ? f.style.filter((x) => x !== m.id) : [...f.style, m.id].slice(-3))}>
                    <Media photos={[m.photo]} seed={m.id} hue={30} alt="" />
                    <span className="mood-t"><b>{m.name}</b><small>{m.hint}</small></span>
                    {on && <span className="mood-ck"><Icon name="Check" size={15} /></span>}
                  </button>
                ); })}
              </div>
            </>}

            {step === 6 && <>
              <h2 className="onb-q">آخر شيء:<br />وش نناديك؟</h2>
              <label className="sr" htmlFor="o-name">الاسم</label>
              <input id="o-name" className="onb-input" placeholder="اسمك" value={f.name} onChange={(e) => set("name", e.target.value)} onKeyDown={(e) => e.key === "Enter" && canNext && next()} autoFocus />
              <label className="sr" htmlFor="o-phone">رقم الجوال</label>
              <input id="o-phone" className="onb-input num" inputMode="tel" placeholder="رقم الجوال (اختياري) 05xxxxxxxx" value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
              <span style={{ fontSize: 13, opacity: 0.8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="Lock" size={14} /> بياناتك ما تنشارك مع أي مورد إلا بموافقتك.</span>
            </>}

            {step === 7 && <div className="stack" style={{ justifyItems: "center", textAlign: "center", ["--gap" as string]: "22px" }}>
              <div className="gen-orb" />
              <h2 className="onb-q" style={{ fontSize: 30 }}>نجهز خطتك يا {f.name.split(" ")[0]}…</h2>
              <motion.div className="onb-sub" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.8, times: [0, 0.2, 0.8, 1] }}>نوزع ميزانيتك ونحسب الضيافة ونطابق القاعات في {f.city}</motion.div>
            </div>}

            {step === 8 && <>
              <h2 className="onb-q" style={{ fontSize: "clamp(28px, 7vw, 40px)" }}>خطتك جاهزة ✨</h2>
              <div className="plan-tiles">
                <div className="plan-tile wide"><small>ميزانيتك</small>{budget ? <b className="num"><Counter value={budget} /> <span style={{ fontSize: 15 }}>ر.س</span></b> : <b style={{ fontSize: 18 }}>تحددها لاحقاً</b>}</div>
                <div className="plan-tile"><small>باقي على الموعد</small><b><Counter value={daysUntil(f.date)} /> يوم</b></div>
                <div className="plan-tile"><small>ذبائح تقريباً</small><b><Counter value={hosp.sheep} /></b></div>
              </div>
              <span style={{ fontSize: 13, opacity: 0.85 }}>اخترنا لك على {f.style.length ? "ذوقك و" : ""}ميزانيتك في {f.city}</span>
              <div className="stack" style={{ ["--gap" as string]: "8px" }}>
                {preview.filter((l) => l.picks[0]).slice(0, 4).map((l) => (
                  <div key={l.cat} className="match">
                    <div className="th"><Media photos={l.picks[0].photos} seed={l.picks[0].id} hue={l.picks[0].hue} alt={l.picks[0].name} /></div>
                    <div style={{ minWidth: 0 }}><span style={{ fontSize: 11.5, opacity: 0.75 }}>{l.label}</span><b className="display" style={{ display: "block", fontSize: 14.5 }}>{l.picks[0].name}</b><span style={{ fontSize: 12, opacity: 0.8 }}>{l.picks[0].reasons.slice(0, 2).join(" · ")}</span></div>
                    {l.budget ? <div className="sc"><b className="num">{fmt(l.budget)}</b>مخصص</div> : null}
                  </div>
                ))}
              </div>
            </>}
          </motion.div>
        </AnimatePresence>

        {needAuth && (
          <div className="card" style={{ color: "var(--ink)", marginBottom: 12 }}>
            <PhoneAuth title="آخر خطوة: أكّد رقم جوالك عشان نحفظ مناسبتك" initialPhone={f.phone} initialName={f.name} onDone={() => { setNeedAuth(false); create(false); }} />
          </div>
        )}
        {step !== 7 && step !== 1 && !needAuth && (
          <div className="onb-foot">
            {step === 8
              ? <button className="btn white lg" onClick={() => { finish(); location.hash = "plan"; }}>شوف خطتي واطلب بضغطة <Icon name="ArrowLeft" size={18} /></button>
              : <button className="btn white lg" onClick={next} disabled={!canNext}>{step === 0 ? "يلا نبدأ" : step === 6 ? "جهّز خطتي" : step === 5 && !f.style.length ? "تخطّ" : "التالي"} <Icon name="ArrowLeft" size={18} /></button>}
          </div>
        )}
      </div>
    </div>
  );
}
