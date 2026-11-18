import { useEffect, useRef, useState } from "react";
import { CITIES, OCCASIONS, fmt, splitBudget, type OccasionId } from "@munasabati/core";
import { Icon, LogoMark, sendLead } from "@munasabati/ui";
import { sayQueue, stopSpeech } from "./voice";

/* ═══════════ «سالفة مع منسقتك»: سريعة لأقصى حد ═══════════
   - الرد يطلع فوراً كامل (بدون كتابة حرف حرف)، والصوت يقرأه بالخلفية بدون ما ينتظره العميل
   - كل سؤال جوابه ضغطة وحدة (أزرار جاهزة بدل السلايدر)
   - بطاقة صلبة بدون ضبابية (الضبابية فوق الفيلم المتحرك أغلى شي على كرت الشاشة)، وحركات CSS خفيفة فقط */

type Step = "occ" | "guests" | "when" | "budget" | "city" | "contact" | "done";
type Msg = { id: number; who: "bot" | "me"; t: string };
const ORDER: Step[] = ["occ", "guests", "when", "budget", "city", "contact"];
const WHEN: [string, string][] = [["month", "خلال شهر"], ["3m", "خلال ٣ شهور"], ["6m", "خلال ٦ شهور"], ["later", "لسه ما حددنا"]];
const GUESTS = [100, 200, 300, 500, 800, 1200];
const BUDGETS = [30000, 50000, 80000, 120000, 200000, 300000];
const CONGRATS: Record<string, string> = {
  wedding: "ألف مبروك 🤍 الله يتمم لكم على خير", milka: "مبروك الملكة! الله يتمم بخير 🤍", grad: "مبروك التخرج! تستاهل الفرحة 🎓",
  aqiqa: "الله يحفظه ويجعله من مواليد السعادة 🤍", birthday: "كل عام وهو بخير 🎂", family: "يا حلو لمّة الأهل 🤍", corp: "تمام، نخليها فخمة وتليق بالشركة 👌",
};
const k = (n: number) => (n >= 1000 ? `${fmt(n / 1000)} ألف` : fmt(n));

export function ConciergeChat({ onOcc }: { onOcc?: (id: OccasionId) => void }) {
  const h = new Date().getHours();
  const greet = h >= 4 && h < 12 ? "صباح الخير ☀️" : h < 17 ? "يا هلا 👋" : "مساء الخير 🌙";
  const id = useRef(1);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, who: "bot", t: `${greet} وش المناسبة؟` }]);
  const [step, setStep] = useState<Step>("occ");
  const [f, setF] = useState({ occ: "" as OccasionId | "", guests: 0, when: "", budget: 0, city: "", name: "", phone: "", consent: false, mkt: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const body = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const b = body.current; if (b) b.scrollTop = b.scrollHeight;
    if (step !== "occ" && root.current) { const r = root.current.getBoundingClientRect(); if (r.bottom > innerHeight - 8) scrollBy({ top: r.bottom - innerHeight + 20, behavior: "smooth" }); }
  }, [msgs, step]);
  useEffect(() => () => stopSpeech(), []);

  /** جواب العميل ← ردها فوراً، والصوت بالخلفية */
  const answer = (me: string, bots: string[], next: Step, patch: Partial<typeof f>) => {
    setF((x) => ({ ...x, ...patch })); setErr("");
    setMsgs((m) => [...m, { id: id.current++, who: "me", t: me }, ...bots.map((t) => ({ id: id.current++, who: "bot" as const, t }))]);
    setStep(next); sayQueue(bots);
  };

  const submit = async () => {
    const ph = f.phone.replace(/\D/g, "").replace(/^966/, "0");
    if (f.name.trim().length < 2) return setErr("اكتب اسمك");
    if (!/^05\d{8}$/.test(ph)) return setErr("الرقم يبدأ بـ 05 ومن ١٠ أرقام");
    if (!f.consent) return setErr("وافق على تواصلنا معك بخصوص طلبك");
    setBusy(true); setErr("");
    try {
      await sendLead({ name: f.name.trim(), phone: ph, consent: true, marketing: f.mkt, consent_at: new Date().toISOString(), via: "concierge", occasion: f.occ || "other", guests: String(f.guests), city: f.city, when: WHEN.find((w) => w[0] === f.when)?.[1] ?? "", budget: String(f.budget), priority: "تنسيق كامل من الألف للياء", estimate: `${fmt(f.budget)} ريال` });
      try { localStorage.setItem("mns-brief", JSON.stringify({ occ: f.occ, guests: f.guests, when: f.when, budget: f.budget, city: f.city, name: f.name.trim(), phone: ph, sentAt: Date.now() })); } catch { /* */ }
      const first = f.name.trim().split(" ")[0];
      answer(`${f.name.trim()} · ${ph}`, [`تم يا ${first}! 🤍`, `منسقتك بتكلمك واتساب خلال ساعتين، وترسل لك ٣ قاعات ضمن ${k(f.budget)} ريال.`], "done", {});
    } catch { setErr("ما وصل الطلب، جرّب مرة ثانية أو كلمنا واتساب"); }
    setBusy(false);
  };

  const at = ORDER.indexOf(step);
  const per = f.guests ? Math.round(f.budget / f.guests) : 0;
  const split = f.budget ? splitBudget(f.budget, (f.occ || "wedding") as OccasionId).slice(0, 3) : [];

  return (
    <div ref={root} className="cx" aria-label="محادثة مع منسقتك">
      <div className="cx-head">
        <span className="cx-av"><LogoMark size={24} /><i aria-hidden="true" /></span>
        <div className="cx-who"><b>منسقتك</b><small>متصلة الحين</small></div>
        {step !== "done" && <div className="cx-steps" aria-label={`السؤال ${at + 1} من ${ORDER.length}`}>{ORDER.map((s, i) => <i key={s} className={i < at ? "done" : i === at ? "now" : ""} />)}</div>}
      </div>
      <div className="cx-body" ref={body} role="log" aria-live="polite">
        {msgs.map((m) => <p key={m.id} className={m.who === "bot" ? "cx-bot" : "cx-me"}>{m.t}</p>)}
      </div>
      {step !== "done" && <div className="cx-ctl" key={step}>
        {step === "occ" && <div className="cx-opts">{OCCASIONS.map((o) => <button key={o.id} className="cx-opt" onClick={() => { onOcc?.(o.id); answer(o.name, [CONGRATS[o.id] ?? "حلو! 🤍", "كم ضيف تقريباً؟"], "guests", { occ: o.id }); }}>{o.name}</button>)}</div>}
        {step === "guests" && <div className="cx-opts">{GUESTS.map((g, i) => <button key={g} className="cx-opt" onClick={() => answer(i === GUESTS.length - 1 ? `${fmt(g)}+ ضيف` : `${fmt(g)} ضيف`, [g >= 500 ? `ما شاء الله، ${fmt(g)} ضيف! نبي قاعة فخمة 👌` : `حلو، ${fmt(g)} ضيف.`, "ومتى تقريباً؟"], "when", { guests: g })}>{fmt(g)}{i === GUESTS.length - 1 ? "+" : ""}</button>)}</div>}
        {step === "when" && <div className="cx-opts">{WHEN.map(([w, l]) => <button key={w} className="cx-opt" onClick={() => answer(l, [w === "month" ? "قريب! لا تشيل هم، نلحق 💪" : "زين، الوقت معنا.", "وكم ميزانيتك كاملة تقريباً؟"], "budget", { when: w })}>{l}</button>)}</div>}
        {step === "budget" && <div className="cx-opts">{BUDGETS.map((b2, i) => <button key={b2} className="cx-opt" onClick={() => answer(`${k(b2)} ريال${i === BUDGETS.length - 1 ? "+" : ""}`, [`ممتازة! يعني تقريباً ${fmt(Math.round(b2 / Math.max(1, f.guests)))} ريال للضيف 👌`, "في أي مدينة؟"], "city", { budget: b2 })}>{k(b2)}{i === BUDGETS.length - 1 ? "+" : ""}</button>)}</div>}
        {step === "city" && <>
          {split.length > 0 && <div className="cx-split">{split.map((l) => <span key={l.cat}>{l.label} <b className="num">{k(l.est)}</b></span>)}{per > 0 && <span>للضيف <b className="num">{fmt(per)}</b></span>}</div>}
          <div className="cx-opts">{CITIES.slice(0, 6).map((c) => <button key={c} className="cx-opt" onClick={() => answer(c, [`${c}، أعرف قاعاتها زين 😉`, "آخر شي: اسمك ورقمك، وأرسل لك الخيارات واتساب."], "contact", { city: c })}>{c}</button>)}</div>
        </>}
        {step === "contact" && <div className="cx-form">
          <div className="cx-row">
            <label className="sr" htmlFor="cx-n">الاسم</label><input id="cx-n" className="cx-in" placeholder="اسمك" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value.slice(0, 60) })} />
            <label className="sr" htmlFor="cx-p">الجوال</label><input id="cx-p" className="cx-in num" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.slice(0, 16) })} />
          </div>
          <label className="cx-ok"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> موافق تتواصلون معي بخصوص طلبي (<a href="./privacy.html" target="_blank" rel="noopener">الخصوصية</a>)</label>
          <label className="cx-ok faint"><input type="checkbox" checked={f.mkt} onChange={(e) => setF({ ...f, mkt: e.target.checked })} /> (اختياري) أبي توصلني عروض وأفكار</label>
          <button className="cx-go" disabled={busy} onClick={() => void submit()}>{busy ? "لحظة…" : <>رتّبوها لي <Icon name="Sparkles" size={16} /></>}</button>
          {err && <p className="cx-err" role="alert">{err}</p>}
        </div>}
      </div>}
      {step === "done" && <div className="cx-ctl">
        <a className="cx-go" href={(import.meta.env.VITE_CLIENT_URL as string | undefined) ?? "client/index.html"}>تابع مناسبتك في تطبيقك <Icon name="ArrowLeft" size={15} /></a>
        <small className="cx-note">خطتك جاهزة فيه: الميزانية والضيوف والدعوات، وتشوف ردود منسقتك أول بأول.</small>
      </div>}
    </div>
  );
}
