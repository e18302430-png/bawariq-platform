import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CITIES, OCCASIONS, fmt, splitBudget, type OccasionId } from "@munasabati/core";
import { Icon, LogoMark, sendLead } from "@munasabati/ui";
import { arabicVoice, speak, stopSpeech } from "./voice";

/* ═══════════ «سالفة مع منسقتك»: معالج الميزانية كمحادثة ═══════════
   المنسقة تسأل، والعميل يجاوب بلمسة، وترد عليه برد شخصي باللهجة السعودية، بصوت «سوالف» مع كل كلمة. */

const WHEN: [string, string][] = [["month", "خلال شهر"], ["3m", "خلال ٣ شهور"], ["6m", "خلال ٦ شهور"], ["later", "لسه ما حددنا"]];
const CONGRATS: Record<string, string> = {
  wedding: "ألف مبروك 🤍 الله يتمم لكم على خير", milka: "مبروك الملكة! الله يتمم بخير 🤍", grad: "مبروك التخرج! تستاهل الفرحة 🎓",
  aqiqa: "الله يحفظه ويجعله من مواليد السعادة 🤍", birthday: "كل عام وهو بخير 🎂", family: "يا حلو لمّة الأهل 🤍", corp: "تمام، نخليها فخمة وتليق بالشركة 👌",
};
type Msg = { who: "bot" | "me"; t: string };
type Step = "occ" | "guests" | "when" | "budget" | "city" | "contact" | "done";

/** ردود المنسقة: تنقال بالصوت العربي المدمج بالجوال لو موجود، والكلمات تظهر مع الكلام */
function BotLine({ t, onDone }: { t: string; onDone?: () => void }) {
  const words = t.split(" ");
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true, stop = () => {}, tick = 0;
    const end = () => { if (!alive) return; clearInterval(tick); setN(words.length); setTimeout(() => alive && onDone?.(), 280); };
    const typing = setTimeout(() => {
      void arabicVoice().then((v) => {
        if (!alive) return;
        tick = window.setInterval(() => setN((x) => Math.min(words.length, x + 1)), v ? 330 : 150);
        if (v && !window.__mnsMuted) stop = speak(t, v, { onWord: (k) => setN((x) => Math.max(x, k + 1)), onEnd: end });
        else setTimeout(end, words.length * 150 + 200);
      });
    }, 220);
    return () => { alive = false; clearTimeout(typing); clearInterval(tick); stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <span>{n === 0 ? <i className="ch-typing"><b /><b /><b /></i> : words.map((w, i) => <span key={i} className={"ch-w" + (i < n ? " in" : "")}>{w}{i < words.length - 1 ? " " : ""}</span>)}</span>;
}

export function ConciergeChat({ onOcc }: { onOcc?: (id: OccasionId) => void }) {
  const h = new Date().getHours();
  const greet = h >= 4 && h < 12 ? "صباح الخير ☀️" : h < 17 ? "يا هلا 👋" : "مساء الخير 🌙";
  const [msgs, setMsgs] = useState<Msg[]>([{ who: "bot", t: `${greet} خلّنا نبدأ: وش المناسبة؟` }]);
  const [shown, setShown] = useState(0); // كم رسالة من المنسقة انكتبت كاملة
  const [step, setStep] = useState<Step>("occ");
  const [f, setF] = useState({ occ: "" as OccasionId | "", guests: 300, when: "", budget: 80000, city: "الدمام", name: "", phone: "", consent: false, mkt: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const split = useMemo(() => splitBudget(f.budget, (f.occ || "wedding") as OccasionId).slice(0, 3), [f.budget, f.occ]);
  const totalBots = msgs.filter((m) => m.who === "bot").length;
  // الأزرار تطلع أول ما يبدأ السؤال (آخر رسالة)، بدون انتظار نهاية الكلام
  const ready = shown >= totalBots - 1;
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" });
    // نخلي أدوات الجواب ظاهرة في الشاشة (خصوصاً بالجوال)
    if (step !== "occ" && root.current) { const r = root.current.getBoundingClientRect(); if (r.bottom > innerHeight - 8) scrollBy({ top: r.bottom - innerHeight + 24, behavior: "smooth" }); }
  }, [msgs, shown, step]);

  const say = (me: string, bots: string[], next: Step) => {
    stopSpeech(); setShown(msgs.filter((m) => m.who === "bot").length); // جاوب قبل ما تكمل؟ نوقف الكلام ونكمل
    setMsgs((m) => [...m, { who: "me", t: me }, ...bots.map((t) => ({ who: "bot" as const, t }))]);
    setStep(next); setErr("");
  };
  const per = Math.round(f.budget / Math.max(1, f.guests));
  const ph = f.phone.replace(/\D/g, "").replace(/^966/, "0");

  const submit = async () => {
    if (f.name.trim().length < 2) return setErr("اكتب اسمك");
    if (!/^05\d{8}$/.test(ph)) return setErr("الرقم يبدأ بـ 05 ومن ١٠ أرقام");
    if (!f.consent) return setErr("وافق على تواصلنا معك بخصوص طلبك");
    setBusy(true); setErr("");
    try {
      await sendLead({ name: f.name.trim(), phone: ph, consent: true, marketing: f.mkt, consent_at: new Date().toISOString(), via: "concierge", occasion: f.occ || "other", guests: String(f.guests), city: f.city, when: WHEN.find((w) => w[0] === f.when)?.[1] ?? "", budget: String(f.budget), priority: "تنسيق كامل من الألف للياء", estimate: `${fmt(f.budget)} ريال` });
      // نحفظ إجاباته عشان تطبيق العميل ما يسأله مرة ثانية (نفس الجهاز)
      try { localStorage.setItem("mns-brief", JSON.stringify({ occ: f.occ, guests: f.guests, when: f.when, budget: f.budget, city: f.city, name: f.name.trim(), phone: ph, sentAt: Date.now() })); } catch { /* */ }
      const first = f.name.trim().split(" ")[0];
      say(`${f.name.trim()} · ${ph}`, [`تم يا ${first}! 🤍`, `منسقتك بتكلمك واتساب خلال ساعتين، وترسل لك ٣ قاعات ضمن ${fmt(f.budget)} ريال خلال ٢٤ ساعة.`, "وتدفع نفس السعر، ولا ريال زيادة. خلها علينا 💫"], "done");
    } catch { setErr("ما وصل الطلب، جرّب مرة ثانية أو كلمنا واتساب"); }
    setBusy(false);
  };

  let b = -1;
  return (
    <div ref={root} className="ch" role="log" aria-label="محادثة مع منسقتك" aria-live="polite">
      <div className="ch-head"><span className="ch-av"><LogoMark size={26} animated /></span><div><b>منسقتك</b><small>{ready ? "متصلة الحين" : "تكتب…"}</small></div></div>
      <div className="ch-body" ref={box}>
        {msgs.map((m, i) => {
          if (m.who === "me") return <motion.p key={i} className="ch-me" initial={{ opacity: 0, y: 10, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }}>{m.t}</motion.p>;
          b++; if (b > shown) return null;
          return <motion.p key={i} className="ch-bot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{b === shown ? <BotLine t={m.t} onDone={() => setShown((x) => x + 1)} /> : m.t}</motion.p>;
        })}
      </div>
      <AnimatePresence mode="wait">{ready && step !== "done" && (
        <motion.div key={step} className="ch-ctl" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .3 }}>
          {step === "occ" && <div className="ch-chips">{OCCASIONS.map((o) => <button key={o.id} className="ch-chip" onClick={() => { setF({ ...f, occ: o.id }); onOcc?.(o.id); say(o.name, [CONGRATS[o.id] ?? "حلو! 🤍", "كم ضيف تتوقعون تقريباً؟"], "guests"); }}>{o.name}</button>)}</div>}
          {step === "guests" && <div className="ch-slide"><b className="num">{fmt(f.guests)} <small>ضيف</small></b><input type="range" min={20} max={1500} step={10} value={f.guests} onChange={(e) => setF({ ...f, guests: +e.target.value })} aria-label="عدد الضيوف" /><button className="ch-go" onClick={() => say(`${fmt(f.guests)} ضيف`, [f.guests >= 500 ? `ما شاء الله، ${fmt(f.guests)} ضيف! نبي قاعة كبيرة وفخمة 👌` : `حلو، ${fmt(f.guests)} ضيف.`, "ومتى تقريباً؟"], "when")}>تمام <Icon name="ArrowLeft" size={15} /></button></div>}
          {step === "when" && <div className="ch-chips">{WHEN.map(([id, l]) => <button key={id} className="ch-chip" onClick={() => { setF({ ...f, when: id }); say(l, [id === "month" ? "قريب! لا تشيل هم، نلحق 💪" : "زين، الوقت معنا.", "وكم ميزانيتك كاملة؟ (تقريباً)"], "budget"); }}>{l}</button>)}</div>}
          {step === "budget" && <div className="ch-slide"><b className="num">{fmt(f.budget)} <small>ريال</small></b><input type="range" min={10000} max={600000} step={5000} value={f.budget} onChange={(e) => setF({ ...f, budget: +e.target.value })} aria-label="الميزانية" />
            <div className="ch-split">{split.map((l) => <span key={l.cat}>{l.label} <b className="num">{fmt(l.est)}</b></span>)}</div>
            <button className="ch-go" onClick={() => say(`${fmt(f.budget)} ريال`, [`ممتازة! يعني تقريباً ${fmt(per)} ريال للضيف 👌`, "في أي مدينة؟"], "city")}>تمام <Icon name="ArrowLeft" size={15} /></button></div>}
          {step === "city" && <div className="ch-chips">{CITIES.slice(0, 6).map((c) => <button key={c} className="ch-chip" onClick={() => { setF({ ...f, city: c }); say(c, [`${c}، أعرف قاعاتها زين 😉`, "آخر شي: اسمك ورقمك، وأرسل لك الخيارات واتساب."], "contact"); }}>{c}</button>)}</div>}
          {step === "contact" && <div className="ch-form">
            <label className="sr" htmlFor="ch-n">الاسم</label><input id="ch-n" className="ch-in" placeholder="اسمك" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value.slice(0, 60) })} />
            <label className="sr" htmlFor="ch-p">الجوال</label><input id="ch-p" className="ch-in num" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.slice(0, 16) })} />
            <label className="ch-ok"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> موافق تتواصلون معي بخصوص طلبي (<a href="./privacy.html" target="_blank" rel="noopener">الخصوصية</a>)</label>
            <label className="ch-ok faint"><input type="checkbox" checked={f.mkt} onChange={(e) => setF({ ...f, mkt: e.target.checked })} /> (اختياري) أبي توصلني عروض وأفكار</label>
            <button className="ch-go big" disabled={busy} onClick={() => void submit()}>{busy ? "لحظة…" : <>رتّبوها لي <Icon name="Sparkles" size={16} /></>}</button>
            {err && <p className="ch-err" role="alert">{err}</p>}
          </div>}
        </motion.div>
      )}</AnimatePresence>
      {step === "done" && ready && <motion.div className="ch-ctl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <a className="ch-go big" href={(import.meta.env.VITE_CLIENT_URL as string | undefined) ?? "client/index.html"}>تابع مناسبتك في تطبيقك <Icon name="ArrowLeft" size={15} /></a>
        <small style={{ display: "block", marginTop: 8, fontSize: 12.5, opacity: .8 }}>خطتك جاهزة فيه: الميزانية والضيوف والدعوات، وتشوف ردود منسقتك أول بأول.</small>
      </motion.div>}
    </div>
  );
}
