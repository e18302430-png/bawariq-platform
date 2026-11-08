import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CITIES, OCCASIONS, SEED_VENUES, TIERS, createEvent, daysUntil, estimateBudget, fmt, hospitality, matchVenues, shiftDate, today,
  type OccasionId, type TierId,
} from "@munasabati/core";
import { Art, Counter, Icon, MeshGradient, apply } from "@munasabati/ui";

const OCC_ICON: Record<OccasionId, string> = { wedding: "Gem", milka: "Heart", grad: "GraduationCap", aqiqa: "Baby", family: "Users", corp: "Briefcase" };
const greeting = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? "صباح الخير" : h < 17 ? "نهارك سعيد" : "مساء الخير"; };
const STEPS = 8;

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

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ occasion: "wedding" as OccasionId, city: "الرياض", date: shiftDate(today(), 75), guests: 450, menRatio: 0.5, tier: "mid" as TierId, name: "", phone: "" });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const occ = OCCASIONS.find((o) => o.id === f.occasion)!;
  const men = Math.round(f.guests * f.menRatio);
  const plan = useMemo(() => estimateBudget(f.guests, f.tier), [f.guests, f.tier]);
  const hosp = useMemo(() => hospitality(men, f.guests - men), [men, f.guests]);
  const matches = useMemo(() => matchVenues(SEED_VENUES, f.city, f.guests).slice(0, 3), [f.city, f.guests]);

  useEffect(() => {
    if (step !== 6) return;
    const t = setTimeout(() => setStep(7), 1900);
    return () => clearTimeout(t);
  }, [step]);

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = (demo = false) => apply(createEvent({
    occasion: f.occasion, city: f.city, date: f.date, guests: f.guests, menRatio: f.menRatio, tier: f.tier,
    title: `${occ.name} ${demo ? "عبدالله" : f.name.split(" ")[0]}`.trim(), hostName: demo ? "عبدالله" : f.name.trim() || "ضيفنا", phone: f.phone,
  }));

  const canNext = step !== 5 || f.name.trim().length > 1;

  return (
    <div className="onb">
      <MeshGradient palette={occ.palette} />
      <div className="onb-in">
        <div className="onb-bars" aria-hidden="true">
          {Array.from({ length: STEPS }, (_, i) => <i key={i}><motion.b initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} /></i>)}
        </div>
        <div className="onb-top">
          {step > 0 && step !== 6 ? <button className="btn glass sm" onClick={back} aria-label="رجوع"><Icon name="ArrowRight" size={16} /></button> : <div className="logo"><span className="logo-mark" />مناسبتي</div>}
          <div className="grow" />
          {step < 6 && <button className="btn glass sm" onClick={() => finish(true)}>جرّب لوحة تجريبية</button>}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} className="onb-body" initial={{ opacity: 0, y: 26, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -18, filter: "blur(6px)" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            {step === 0 && <>
              <span className="onb-sub">{greeting()} 👋</span>
              <h1 className="onb-q" style={{ fontSize: "clamp(40px, 11vw, 64px)" }}>حيّاك في<br />مناسبتي.</h1>
              <p className="onb-sub" style={{ maxWidth: "34ch" }}>جاوب على 5 أسئلة سريعة، ونجهز لك خطة كاملة: الميزانية، والضيافة، وأنسب القاعات في مدينتك.</p>
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
              <h2 className="onb-q">وش مستوى<br />التجهيز؟</h2>
              <div className="stack" style={{ ["--gap" as string]: "10px" }}>
                {TIERS.map((t) => (
                  <button key={t.id} className={"onb-opt" + (f.tier === t.id ? " on" : "")} style={{ flexDirection: "row", alignItems: "center" }} onClick={() => set("tier", t.id)} aria-pressed={f.tier === t.id}>
                    <span className="oi"><Icon name={t.id === "lux" ? "Crown" : t.id === "mid" ? "Sparkles" : "Leaf"} size={20} /></span>
                    <span className="grow"><b style={{ display: "block" }}>{t.name}</b><small>{t.desc}</small></span>
                    <b className="num" style={{ fontSize: 14 }}>≈ {fmt(estimateBudget(f.guests, t.id).total / 1000)} ألف</b>
                  </button>
                ))}
              </div>
            </>}

            {step === 5 && <>
              <h2 className="onb-q">آخر شيء:<br />وش نناديك؟</h2>
              <label className="sr" htmlFor="o-name">الاسم</label>
              <input id="o-name" className="onb-input" placeholder="اسمك" value={f.name} onChange={(e) => set("name", e.target.value)} onKeyDown={(e) => e.key === "Enter" && canNext && next()} autoFocus />
              <label className="sr" htmlFor="o-phone">رقم الجوال</label>
              <input id="o-phone" className="onb-input num" inputMode="tel" placeholder="رقم الجوال (اختياري) 05xxxxxxxx" value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
              <span style={{ fontSize: 13, opacity: 0.8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="Lock" size={14} /> بياناتك ما تنشارك مع أي مورد إلا بموافقتك.</span>
            </>}

            {step === 6 && <div className="stack" style={{ justifyItems: "center", textAlign: "center", ["--gap" as string]: "22px" }}>
              <div className="gen-orb" />
              <h2 className="onb-q" style={{ fontSize: 30 }}>نجهز خطتك يا {f.name.split(" ")[0]}…</h2>
              <motion.div className="onb-sub" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.8, times: [0, 0.2, 0.8, 1] }}>نحسب الميزانية والضيافة ونطابق القاعات في {f.city}</motion.div>
            </div>}

            {step === 7 && <>
              <h2 className="onb-q" style={{ fontSize: "clamp(28px, 7vw, 40px)" }}>خطتك جاهزة ✨</h2>
              <div className="plan-tiles">
                <div className="plan-tile wide"><small>الميزانية التقديرية</small><b className="num"><Counter value={plan.total} /> <span style={{ fontSize: 15 }}>ر.س</span></b></div>
                <div className="plan-tile"><small>ذبائح تقريباً</small><b><Counter value={hosp.sheep} /></b></div>
                <div className="plan-tile"><small>قهوة سعودية</small><b><Counter value={hosp.coffee} /> كجم</b></div>
                <div className="plan-tile"><small>قهوجية وصبابين</small><b><Counter value={hosp.servers} /></b></div>
                <div className="plan-tile"><small>باقي على الموعد</small><b><Counter value={daysUntil(f.date)} /> يوم</b></div>
              </div>
              <span style={{ fontSize: 13, opacity: 0.85 }}>أنسب القاعات في {f.city} لـ {fmt(f.guests)} ضيف</span>
              <div className="stack" style={{ ["--gap" as string]: "8px" }}>
                {matches.map(({ venue, score }) => (
                  <div key={venue.id} className="match">
                    <div className="th"><Art seed={venue.id} hue={venue.hue} /></div>
                    <div style={{ minWidth: 0 }}><b className="display" style={{ display: "block", fontSize: 14.5 }}>{venue.name}</b><span style={{ fontSize: 12, opacity: 0.8 }}>{venue.city} · {venue.district}</span></div>
                    <div className="sc"><b className="num">{score}%</b>تطابق</div>
                  </div>
                ))}
              </div>
            </>}
          </motion.div>
        </AnimatePresence>

        {step !== 6 && step !== 1 && (
          <div className="onb-foot">
            {step === 7
              ? <button className="btn white lg" onClick={() => finish()}>افتح لوحة مناسبتي <Icon name="ArrowLeft" size={18} /></button>
              : <button className="btn white lg" onClick={next} disabled={!canNext}>{step === 0 ? "يلا نبدأ" : step === 5 ? "جهّز خطتي" : "التالي"} <Icon name="ArrowLeft" size={18} /></button>}
          </div>
        )}
      </div>
    </div>
  );
}
