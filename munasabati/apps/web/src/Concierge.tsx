import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CITIES, OCCASIONS, fmt, splitBudget, type OccasionId } from "@munasabati/core";
import { Icon, sendLead } from "@munasabati/ui";

/* ═══════════ «قل لنا ميزانيتك، والباقي علينا» ═══════════
   الصفحة الرئيسية ما تعرض قاعات: العميل يكتب مناسبته وضيوفه وميزانيته،
   ومنسقة مناسبتي تختار له ٣ خيارات ضمن ميزانيته، يزورها ويختار، ونحجز وننسق للنهاية. */

const WHEN: [string, string][] = [["month", "خلال شهر"], ["3m", "خلال ٣ شهور"], ["6m", "خلال ٦ شهور"], ["later", "لسه ما حددنا"]];
const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE = {
  initial: (d: number) => ({ opacity: 0, x: d * -40, filter: "blur(10px)" }),
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (d: number) => ({ opacity: 0, x: d * 40, filter: "blur(10px)" }),
};
const TIMELINE: [string, string, string][] = [
  ["MessageCircle", "خلال ساعتين", "منسقتك تتواصل معك واتساب وتفهم ذوقك"],
  ["LayoutGrid", "خلال ٢٤ ساعة", "٣ خيارات قاعات ضمن ميزانيتك، مع الصور والجولة ٣٦٠"],
  ["MapPin", "تزور وتختار", "أنت والأهل تشوفون القاعة على الطبيعة قبل أي دفع"],
  ["Sparkles", "نحجز وننسق", "القاعة والكوشة والتصوير والضيافة والدعوات… لين آخر ضيف"],
];

export function Concierge({ onOcc }: { onOcc?: (id: OccasionId) => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [f, setF] = useState({ occ: "" as OccasionId | "", guests: 300, when: "", city: "الدمام", budget: 80000, name: "", phone: "", consent: false, mkt: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const split = useMemo(() => splitBudget(f.budget, (f.occ || "wedding") as OccasionId).slice(0, 4), [f.budget, f.occ]);
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); setErr(""); };
  const ph = f.phone.replace(/\D/g, "").replace(/^966/, "0");
  const okPhone = /^05\d{8}$/.test(ph);
  const perGuest = Math.round(f.budget / Math.max(1, f.guests));

  const submit = async () => {
    if (f.name.trim().length < 2) return setErr("اكتب اسمك");
    if (!okPhone) return setErr("رقم الجوال يبدأ بـ 05 ومن ١٠ أرقام");
    if (!f.consent) return setErr("وافق على تواصلنا معك بخصوص طلبك");
    setBusy(true); setErr("");
    try {
      await sendLead({
        name: f.name.trim(), phone: ph, consent: true, marketing: f.mkt, consent_at: new Date().toISOString(), via: "concierge",
        occasion: f.occ || "other", guests: String(f.guests), city: f.city, when: WHEN.find((w) => w[0] === f.when)?.[1] ?? "", budget: String(f.budget),
        priority: "تنسيق كامل من الألف للياء", estimate: `${fmt(f.budget)} ريال`,
      });
      setDone(true);
    } catch { setErr("ما وصل الطلب، جرّب مرة ثانية أو كلمنا واتساب"); }
    setBusy(false);
  };

  if (done) return (
    <motion.div className="cc cc-done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }}>
      <motion.span className="cc-check" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}><Icon name="Check" size={30} /></motion.span>
      <h3>وصلنا طلبك يا {f.name.trim().split(" ")[0]} 🤍</h3>
      <p className="cc-sub">ميزانيتك <b className="num">{fmt(f.budget)}</b> ريال لـ<b className="num">{fmt(f.guests)}</b> ضيف في {f.city}. خلها علينا.</p>
      <ol className="cc-time">{TIMELINE.map(([ic, t, d], i) => (
        <motion.li key={t} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.12, duration: 0.5, ease: EASE }}>
          <span><Icon name={ic} size={17} /></span><div><b>{t}</b><small>{d}</small></div>
        </motion.li>
      ))}</ol>
      <small className="cc-fine">ما تدفع لنا أي رسوم إضافية: تدفع سعر القاعة والموردين نفسه.</small>
    </motion.div>
  );

  return (
    <div className="cc" role="form" aria-label="ابدأ بميزانيتك">
      <div className="cc-top">
        <div className="cc-dots" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
        {step > 0 && <button className="cc-back" onClick={() => go(step - 1)} aria-label="رجوع"><Icon name="ArrowRight" size={16} /></button>}
      </div>
      <div className="cc-stage">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.42, ease: EASE }} className="cc-step">
            {step === 0 && <>
              <h3>وش المناسبة؟</h3>
              <div className="cc-chips">{OCCASIONS.map((o) => (
                <button key={o.id} className={"cc-chip" + (f.occ === o.id ? " on" : "")} aria-pressed={f.occ === o.id} onClick={() => { setF({ ...f, occ: o.id }); onOcc?.(o.id); setTimeout(() => go(1), 260); }}>{o.name}</button>
              ))}</div>
            </>}
            {step === 1 && <>
              <h3>كم ضيف تقريباً؟</h3>
              <div className="cc-big num" aria-live="polite">{fmt(f.guests)}<small>ضيف</small></div>
              <input className="cc-range" type="range" min={20} max={1500} step={10} value={f.guests} onChange={(e) => setF({ ...f, guests: +e.target.value })} aria-label="عدد الضيوف" />
              <span className="cc-label">ومتى؟</span>
              <div className="cc-chips">{WHEN.map(([id, l]) => <button key={id} className={"cc-chip sm" + (f.when === id ? " on" : "")} aria-pressed={f.when === id} onClick={() => setF({ ...f, when: id })}>{l}</button>)}</div>
              <button className="btn lg cc-next" onClick={() => go(2)}>التالي <Icon name="ArrowLeft" size={17} /></button>
            </>}
            {step === 2 && <>
              <h3>ميزانيتك كاملة؟</h3>
              <div className="cc-big num" aria-live="polite">{fmt(f.budget)}<small>ريال</small></div>
              <input className="cc-range" type="range" min={10000} max={600000} step={5000} value={f.budget} onChange={(e) => setF({ ...f, budget: +e.target.value })} aria-label="الميزانية" />
              <div className="cc-split" aria-label="توزيع تقريبي">{split.map((l) => (
                <div key={l.cat}><span>{l.label}</span><i><motion.b layout style={{ width: `${Math.min(100, (l.est / f.budget) * 100 * 2)}%` }} transition={{ type: "spring", stiffness: 200, damping: 26 }} /></i><em className="num">{fmt(l.est)}</em></div>
              ))}</div>
              <small className="cc-hint num">≈ {fmt(perGuest)} ريال للضيف · توزيع تقريبي، ومنسقتك تضبطه معك</small>
              <div className="cc-chips">{CITIES.slice(0, 6).map((c) => <button key={c} className={"cc-chip sm" + (f.city === c ? " on" : "")} aria-pressed={f.city === c} onClick={() => setF({ ...f, city: c })}>{c}</button>)}</div>
              <button className="btn lg cc-next" onClick={() => go(3)}>التالي <Icon name="ArrowLeft" size={17} /></button>
            </>}
            {step === 3 && <>
              <h3>وين نوصلك الخيارات؟</h3>
              <label className="sr" htmlFor="cc-n">الاسم</label>
              <input id="cc-n" className="cc-input" placeholder="اسمك" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value.slice(0, 60) })} />
              <label className="sr" htmlFor="cc-p">رقم الجوال (واتساب)</label>
              <input id="cc-p" className="cc-input num" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.slice(0, 16) })} />
              <label className="cc-check-row"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> موافق إن مناسبتي تتواصل معي بخصوص طلبي (<a href="./privacy.html" target="_blank" rel="noopener">الخصوصية</a>)</label>
              <label className="cc-check-row faint"><input type="checkbox" checked={f.mkt} onChange={(e) => setF({ ...f, mkt: e.target.checked })} /> (اختياري) أبي توصلني عروض وأفكار للمناسبات</label>
              <button className="btn lg cc-next cc-go" disabled={busy} onClick={() => void submit()}>{busy ? "لحظة…" : <>رتّبوها لي <Icon name="Sparkles" size={17} /></>}</button>
            </>}
          </motion.div>
        </AnimatePresence>
      </div>
      {err && <p className="cc-err" role="alert">{err}</p>}
    </div>
  );
}
