import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OCCASIONS, OCCASION_PROFILES, fmt, type OccasionId } from "@munasabati/core";
import { Icon } from "./icons";
import { LogoMark } from "./Logo";
import "./assistant.css";

/*
  مساعد مناسبتي: محادثة قصيرة بأزرار (بدون ذكاء اصطناعي ولا مفاتيح).
  يعرف نوع المناسبة وموعدها وعدد الضيوف والمدينة والأهم عند العميل،
  ويطلع له ميزانية تقديرية فوراً، وبعدها ياخذ اسمه وجواله بموافقته
  ويوصل الطلب للإدارة في الرادار كـ«عميل جاهز».
*/

const OCC_ICON: Record<OccasionId, string> = { wedding: "Heart", milka: "Gem", grad: "GraduationCap", aqiqa: "Baby", birthday: "Cake", family: "Users", corp: "Briefcase" };
const WHEN = ["هالشهر", "خلال ٣ شهور", "بعد ٣ شهور", "ما حددت للحين"];
const CITIES = ["الدمام", "الخبر", "الظهران", "القطيف", "الجبيل", "الأحساء"];
const PRIORITY: { id: string; label: string; icon: string; k: number }[] = [
  { id: "price", label: "أفضل سعر", icon: "Wallet", k: 0.85 },
  { id: "lux", label: "فخامة تبهر", icon: "Crown", k: 1.25 },
  { id: "calm", label: "تنظيم وراحة بال", icon: "ShieldCheck", k: 1 },
];
const STEPS = 6;

type Msg = { id: number; from: "bot" | "me"; node: ReactNode };
type Ans = { occ?: OccasionId; when?: string; guests?: number; city?: string; pri?: (typeof PRIORITY)[number] };

const round = (n: number, s: number) => Math.max(s, Math.round(n / s) * s);
export function estimate(occ: OccasionId, guests: number, k: number) {
  const p = OCCASION_PROFILES[occ];
  const mid = p.budgetHint * (0.4 + 0.6 * (guests / p.guests.def)) * k;
  const low = round(mid * 0.88, 1000), high = round(mid * 1.12, 1000);
  const parts = p.split.filter((s) => s.cat !== "other").slice(0, 6).map((s) => ({ label: s.label, amount: round(mid * s.pct, 500), pct: s.pct }));
  return { low, high, parts };
}
function guestOptions(occ: OccasionId) {
  const g = OCCASION_PROFILES[occ].guests;
  const c = (n: number) => Math.min(g.max, Math.max(g.min, round(n, g.step)));
  return [...new Set([c(g.def * 0.5), c(g.def), c(g.def * 1.6), c(g.def * 2.5)])];
}

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
async function sendLead(body: Record<string, unknown>) {
  if (!SUPA_URL || !SUPA_KEY) { await new Promise((r) => setTimeout(r, 700)); return true; }
  const r = await fetch(`${SUPA_URL}/rest/v1/rpc/assistant_lead`, { method: "POST", headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ p: body }) });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as { message?: string }).message || "fail"); }
  return true;
}

function Count({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const k = Math.min(1, (t - t0) / 900); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{fmt(v)}</>;
}

/** يفتح المساعد من أي زر في الصفحة */
export const openAssistant = () => window.dispatchEvent(new Event("mn-assistant-open"));

export function Assistant({ appUrl = "client/index.html", via = "site", fab = true, teaserOn = true }: { appUrl?: string; via?: "site" | "invite"; fab?: boolean; teaserOn?: boolean }) {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Ans>({});
  const [chips, setChips] = useState<ReactNode>(null);
  const [form, setForm] = useState<"none" | "contact" | "sending" | "done">("none");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [err, setErr] = useState("");
  const idRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    let seen = false; try { seen = sessionStorage.getItem("mn-assist-teaser") === "1"; } catch { /* */ }
    if (seen) return;
    if (!teaserOn) return;
    const t = setTimeout(() => setTeaser(true), 4500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing, chips, form]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const push = (from: Msg["from"], node: ReactNode) => setMsgs((m) => [...m, { id: ++idRef.current, from, node }]);
  const bot = (nodes: ReactNode[], then?: () => void) => {
    setChips(null);
    let i = 0;
    const next = () => {
      if (i >= nodes.length) { setTyping(false); then?.(); return; }
      setTyping(true);
      setTimeout(() => { push("bot", nodes[i++]); next(); }, 520 + Math.random() * 380);
    };
    next();
  };
  const me = (t: string) => push("me", t);

  const start = () => {
    if (started.current) return; started.current = true;
    bot([<>هلا والله 👋 أنا <b>مساعد مناسبتي</b>.</>, "خلني أطلع لك ميزانية مناسبتك في أقل من دقيقة، ببلاش. وش المناسبة؟"], askOcc);
  };
  const openPanel = () => { setOpen(true); setTeaser(false); try { sessionStorage.setItem("mn-assist-teaser", "1"); } catch { /* */ } setTimeout(start, 250); };
  useEffect(() => {
    const on = () => openPanel();
    window.addEventListener("mn-assistant-open", on);
    return () => window.removeEventListener("mn-assistant-open", on);
  });

  const askOcc = () => { setStep(1); setChips(<div className="as-grid">{OCCASIONS.map((o) => <button key={o.id} className="as-tile" onClick={() => pickOcc(o.id as OccasionId, o.name)}><span><Icon name={OCC_ICON[o.id as OccasionId]} size={18} /></span>{o.name}</button>)}</div>); };
  const pickOcc = (occ: OccasionId, label: string) => {
    me(label); setAns((a) => ({ ...a, occ }));
    bot([<>{OCCASION_PROFILES[occ].goal} ✨</>, "متى تقريباً؟"], () => { setStep(2); setChips(<div className="as-chips">{WHEN.map((w) => <button key={w} className="as-chip" onClick={() => pickWhen(occ, w)}>{w}</button>)}</div>); });
  };
  const pickWhen = (occ: OccasionId, w: string) => {
    me(w); setAns((a) => ({ ...a, when: w }));
    bot([w === "هالشهر" ? "يعني لازم نتحرك بسرعة، ولا تشيل هم 💪 كم ضيف تقريباً؟" : "ممتاز، كذا نلحق نختار براحتنا. كم ضيف تقريباً؟"], () => {
      setStep(3); setChips(<div className="as-chips">{guestOptions(occ).map((g) => <button key={g} className="as-chip" onClick={() => pickGuests(occ, g)}>حوالي <b className="num">{fmt(g)}</b></button>)}</div>);
    });
  };
  const pickGuests = (occ: OccasionId, g: number) => {
    me(`حوالي ${fmt(g)} ضيف`); setAns((a) => ({ ...a, guests: g }));
    bot(["وين بتكون؟"], () => { setStep(4); setChips(<div className="as-chips">{CITIES.map((c) => <button key={c} className="as-chip" onClick={() => pickCity(occ, g, c)}><Icon name="MapPin" size={13} /> {c}</button>)}</div>); });
  };
  const pickCity = (occ: OccasionId, g: number, c: string) => {
    me(c); setAns((a) => ({ ...a, city: c }));
    bot(["آخر سؤال: وش أهم شي عندك؟"], () => { setStep(5); setChips(<div className="as-chips">{PRIORITY.map((p) => <button key={p.id} className="as-chip" onClick={() => pickPri(occ, g, c, p)}><Icon name={p.icon} size={14} /> {p.label}</button>)}</div>); });
  };
  const pickPri = (occ: OccasionId, g: number, c: string, p: (typeof PRIORITY)[number]) => {
    me(p.label); setAns((a) => ({ ...a, pri: p }));
    const e = estimate(occ, g, p.k);
    const occName = OCCASIONS.find((o) => o.id === occ)?.name;
    bot(["لحظة أحسبها لك من أسعار السوق في الشرقية… 🧮", <EstimateCard key="e" title={`${occName} · ${fmt(g)} ضيف · ${c}`} e={e} />, "تبي عرض حقيقي بأسعار الموردين؟ منسقنا يرتبه لك ويكلمك اليوم، ببلاش وبدون أي التزام."], () => {
      setStep(6);
      setChips(<div className="as-chips"><button className="as-chip primary" onClick={() => wantOffer()}><Icon name="Sparkles" size={14} /> إيه أبي عرض</button><a className="as-chip" href={appUrl}><Icon name="ArrowLeft" size={14} /> أبدأ بنفسي في التطبيق</a></div>);
    });
  };
  const wantOffer = () => { me("إيه أبي عرض"); bot(["أبشر 🤍 بس اكتب لي اسمك ورقم جوالك."], () => setForm("contact")); };

  const submit = async () => {
    setErr("");
    const ph = phone.replace(/\D/g, "").replace(/^9665/, "05");
    if (name.trim().length < 2) return setErr("اكتب اسمك");
    if (!/^05\d{8}$/.test(ph)) return setErr("رقم الجوال لازم يبدأ بـ05 ويكون ١٠ أرقام");
    if (!consent) return setErr("لازم توافق على التواصل عشان نرسل لك العرض");
    setForm("sending");
    const e = ans.occ && ans.guests && ans.pri ? estimate(ans.occ, ans.guests, ans.pri.k) : null;
    try {
      await sendLead({ name: name.trim(), phone: ph, consent: true, occasion: ans.occ, guests: String(ans.guests ?? ""), city: ans.city, when: ans.when, priority: ans.pri?.label, via, estimate: e ? `${fmt(e.low)}–${fmt(e.high)} ريال` : "" });
      me(`${name.trim()} · ${ph}`);
      setForm("done");
      bot([<SuccessCard key="s" name={name.trim()} />], () => setChips(<div className="as-chips"><a className="as-chip primary" href={appUrl}><Icon name="ArrowLeft" size={14} /> افتح التطبيق وكمّل</a></div>));
    } catch (x) {
      setForm("contact");
      setErr((x as Error).message === "bad phone" ? "تأكد من رقم الجوال" : "صار خطأ بسيط، جرّب مرة ثانية");
    }
  };

  const restart = () => { setMsgs([]); setAns({}); setForm("none"); setStep(0); setName(""); setPhone(""); setErr(""); started.current = false; setTimeout(start, 100); };

  return (
    <>
      <AnimatePresence>
        {teaser && !open && (
          <motion.button className="as-teaser" initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={openPanel}>
            <b>كم تكلف مناسبتك؟ 👀</b><span>أحسبها لك في دقيقة</span>
            <span className="as-teaser-x" role="button" aria-label="إغلاق" onClick={(e) => { e.stopPropagation(); setTeaser(false); try { sessionStorage.setItem("mn-assist-teaser", "1"); } catch { /* */ } }}><Icon name="X" size={13} /></span>
          </motion.button>
        )}
      </AnimatePresence>
      {!open && fab && <button className="as-fab" aria-label="افتح مساعد مناسبتي" onClick={openPanel}><span className="as-fab-ring" /><LogoMark size={34} mono="#ffffff" /></button>}

      <AnimatePresence>
        {open && <>
          <motion.div className="as-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.section className="as-panel" role="dialog" aria-modal="true" aria-label="مساعد مناسبتي"
            initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ type: "spring", stiffness: 360, damping: 32 }}>
            <header className="as-head">
              <div className="as-ava"><LogoMark size={30} mono="#ffffff" /><i /></div>
              <div className="as-id"><b>مساعد مناسبتي</b><small><span className="as-on" /> متصل الحين · يرد في ثواني</small></div>
              <button className="as-icon" aria-label="ابدأ من جديد" onClick={restart}><Icon name="RotateCcw" size={17} /></button>
              <button className="as-icon" aria-label="إغلاق" onClick={() => setOpen(false)}><Icon name="X" size={19} /></button>
              <div className="as-prog"><i style={{ width: `${(step / STEPS) * 100}%` }} /></div>
            </header>
            <div className="as-list" ref={listRef} aria-live="polite">
              {msgs.map((m) => (
                <motion.div key={m.id} className={"as-row " + m.from} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }}>
                  {m.from === "bot" && <span className="as-mini"><LogoMark size={16} mono="#ffffff" /></span>}
                  <div className="as-bubble">{m.node}</div>
                </motion.div>
              ))}
              {typing && <div className="as-row bot"><span className="as-mini"><LogoMark size={16} mono="#ffffff" /></span><div className="as-bubble as-typing"><i /><i /><i /></div></div>}
            </div>
            <footer className="as-foot">
              {(form === "contact" || form === "sending") ? (
                <form className="as-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
                  <div className="as-inputs">
                    <input className="as-input" placeholder="اسمك" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus maxLength={60} />
                    <input className="as-input" placeholder="05xxxxxxxx" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" maxLength={14} />
                  </div>
                  <label className="as-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> موافق إن مناسبتي تتواصل معي بخصوص طلبي (<a href="privacy.html" target="_blank" rel="noopener">الخصوصية</a>)</label>
                  {err && <p className="as-err">{err}</p>}
                  <button className="as-send" disabled={form === "sending"}>{form === "sending" ? <><Icon name="Loader" size={16} className="spin" /> أرسل…</> : <><Icon name="SendHorizontal" size={16} /> أرسل وجهّزوا عرضي</>}</button>
                </form>
              ) : <AnimatePresence mode="wait">{chips && <motion.div key={step + form} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>{chips}</motion.div>}</AnimatePresence>}
              <small className="as-note">الأسعار تقديرية من متوسط السوق في الشرقية، والعرض الحقيقي من الموردين.</small>
            </footer>
          </motion.section>
        </>}
      </AnimatePresence>
    </>
  );
}

function EstimateCard({ title, e }: { title: string; e: ReturnType<typeof estimate> }) {
  const max = Math.max(...e.parts.map((p) => p.pct));
  return (
    <div className="as-est">
      <small>{title}</small>
      <div className="as-est-big"><span>من</span><b className="num"><Count to={e.low} /></b><span>إلى</span><b className="num"><Count to={e.high} /></b><em>ريال</em></div>
      <div className="as-bars">{e.parts.map((p, i) => (
        <div key={p.label} className="as-bar"><span>{p.label}</span><div><motion.i initial={{ width: 0 }} animate={{ width: `${(p.pct / max) * 100}%` }} transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} /></div><b className="num">{fmt(p.amount)}</b></div>
      ))}</div>
      <p>تقدير أولي، ويتغير حسب اختياراتك. ومناسبتي تحمي فلوسك: العربون عن طريق المنصة، وحق المورد بعد الليلة.</p>
    </div>
  );
}

function SuccessCard({ name }: { name: string }) {
  return (
    <div className="as-done">
      <div className="as-check"><Icon name="Check" size={26} /></div>
      <b>وصل طلبك يا {name} 🎉</b>
      <p>منسق مناسبتي بيكلمك اليوم على الواتساب ومعه عرض واضح. وأنت بأمان: ما راح نشارك رقمك مع أي أحد.</p>
      <div className="as-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ ["--i" as string]: i }} />)}</div>
    </div>
  );
}
