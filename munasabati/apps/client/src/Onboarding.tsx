import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CITIES, OCCASIONS, TIERS, PLACE_LABEL, STYLES, createEvent, daysUntil, fmt, profileOf, splitBudget, suggestPlan, shiftDate, today,
  type OccasionId, type Place, type StyleId, type TierId,
} from "@munasabati/core";
import { Counter, Icon, LogoMark, Media, MeshGradient, PhoneAuth, apply, hasAccount, isCloud, repo, useDB } from "@munasabati/ui";

const OCC_ICON: Record<OccasionId, string> = { wedding: "Gem", milka: "Heart", grad: "GraduationCap", aqiqa: "Baby", birthday: "Cake", family: "Users", corp: "Briefcase" };
/** ترحيب يناسب كل مناسبة */
const CHEER: Record<OccasionId, string> = { wedding: "مبروك مقدماً 🤍", milka: "مبروك مقدماً 🤍", grad: "ألف مبروك التخرّج 🎓", aqiqa: "يتربّى في عزّكم 🤍", birthday: "كل عام وأنتم بخير 🎈", family: "حيّاكم الله 🤍", corp: "خلّنا نرتّبها باحتراف" };
const PLACE_ICON: Record<Place, string> = { hall: "Building2", istiraha: "TreePalm", home: "Home" };
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
  const [login, setLogin] = useState(false);
  const [f, setF] = useState({ occasion: (preset ?? "wedding") as OccasionId, place: profileOf(preset).places[0] as Place, style: [] as StyleId[], city: "الدمام", date: shiftDate(today(), 75), guests: profileOf(preset).guests.def, menRatio: 0.5, tier: "mid" as TierId, budget: "", name: "", phone: "" });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const occ = OCCASIONS.find((o) => o.id === f.occasion)!;
  const prof = profileOf(f.occasion);
  // اختيار المناسبة يجهّز كل شي عليها: العدد المتوقع ونوع المكان
  const pickOccasion = (id: OccasionId) => { const p = profileOf(id); setF((x) => ({ ...x, occasion: id, place: p.places[0], guests: p.guests.def })); };
  const budget = +f.budget.replace(/\D/g, "") || 0;
  // معاينة الخطة المقترحة قبل الحفظ: نفس محرك الاقتراح على مناسبة مؤقتة
  const preview = useMemo(() => suggestPlan({ ...db, client: { ...db.client, budget: [], event: { id: "tmp", occasion: f.occasion, place: f.place, city: f.city, date: f.date, guests: f.guests, menRatio: f.menRatio, tier: f.tier, title: "", budget: budget || undefined, style: f.style } } }, { budget: budget || undefined, style: f.style }), [db, f.occasion, f.place, f.city, f.date, f.guests, f.menRatio, f.tier, budget, f.style]);

  useEffect(() => {
    if (step !== 7) return;
    const t = setTimeout(() => setStep(8), 1900);
    return () => clearTimeout(t);
  }, [step]);

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = (demo = false) => {
    if (isCloud && !hasAccount()) { setNeedAuth(true); return; }
    create(demo);
  };
  const create = (demo: boolean) => apply(createEvent({ samples: !isCloud,
    occasion: f.occasion, place: f.place, city: f.city, date: f.date, guests: f.guests, menRatio: f.menRatio, tier: f.tier, budget: budget || undefined, style: f.style.length ? f.style : undefined, source: source ?? "direct",
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
          {step > 0 && step !== 7 ? <button className="btn glass sm" onClick={back} aria-label="رجوع"><Icon name="ArrowRight" size={16} /></button> : <div className="logo row" style={{ ["--gap" as string]: "8px" }}><LogoMark size={28} mono="#fff" />مناسبتي</div>}
          <div className="grow" />
          {step < 7 && !isCloud && <button className="btn glass sm" onClick={() => finish(true)}>جرّب لوحة تجريبية</button>}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} className="onb-body" initial={{ opacity: 0, y: 26, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -18, filter: "blur(6px)" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            {step === 0 && <>
              <span className="onb-mark"><LogoMark size={86} animated /></span>
              <span className="onb-sub">{greeting()} 👋</span>
              <h1 className="onb-q" style={{ fontSize: "clamp(40px, 11vw, 64px)" }}>مناسبتك<br />علينا.</h1>
              <span className="onb-goal"><Icon name="Sparkles" size={14} /> من الفكرة لآخر ضيف</span>
              <p className="onb-sub" style={{ maxWidth: "34ch" }}>زواج، ملكة، تخرّج، عقيقة، عيد ميلاد، عزيمة أو حفلة شركة. قل لنا وش مناسبتك وميزانيتك، والباقي علينا: نجيب لك أفضل الموردين بعروض حقيقية، ونمسك معك الليلة لآخر ضيف.</p>
            </>}

            {step === 1 && <>
              <h2 className="onb-q">وش المناسبة اللي<br />نجهز لها؟</h2>
              <div className="onb-grid">
                {OCCASIONS.map((o) => (
                  <button key={o.id} className={"onb-opt" + (f.occasion === o.id ? " on" : "")} onClick={() => { pickOccasion(o.id); setTimeout(next, 320); }} aria-pressed={f.occasion === o.id}>
                    <span className="oi"><Icon name={OCC_ICON[o.id]} size={20} /></span><b>{o.name}</b><small>{o.hint}</small>
                  </button>
                ))}
              </div>
            </>}

            {step === 2 && <>
              <h2 className="onb-q">{CHEER[f.occasion]}<br />وين ومتى؟</h2>
              <span className="onb-goal"><Icon name="Target" size={14} /> {prof.goal}</span>
              <div className="onb-chips" role="group" aria-label="مكان المناسبة">{prof.places.map((p) => <button key={p} className={"onb-chip" + (f.place === p ? " on" : "")} onClick={() => set("place", p)} aria-pressed={f.place === p}><Icon name={PLACE_ICON[p]} size={14} /> {PLACE_LABEL[p]}</button>)}</div>
              <div className="onb-chips">{CITIES.map((c) => <button key={c} className={"onb-chip" + (f.city === c ? " on" : "")} onClick={() => set("city", c)} aria-pressed={f.city === c}>{c}</button>)}</div>
              <label className="sr" htmlFor="o-date">تاريخ المناسبة</label>
              <input id="o-date" type="date" className="onb-input num" value={f.date} min={today()} onChange={(e) => e.target.value && set("date", e.target.value)} />
              <div className="onb-chips">{[[30, "بعد شهر"], [90, "بعد 3 أشهر"], [180, "بعد 6 أشهر"]].map(([d, l]) => <button key={d} className="onb-chip" onClick={() => set("date", shiftDate(today(), d as number))}>{l}</button>)}</div>
            </>}

            {step === 3 && <>
              <h2 className="onb-q">كم ضيف تتوقع؟</h2>
              <div className="onb-big num"><Counter value={f.guests} /></div>
              <label className="sr" htmlFor="o-g">عدد الضيوف</label>
              <input id="o-g" type="range" min={prof.guests.min} max={prof.guests.max} step={prof.guests.step} value={f.guests} onChange={(e) => set("guests", +e.target.value)} />
              {prof.sections && <>
                <label htmlFor="o-r" style={{ fontSize: 13, opacity: 0.85 }}>نسبة الرجال والنساء</label>
                <input id="o-r" type="range" min={0.1} max={0.9} step={0.05} value={f.menRatio} onChange={(e) => set("menRatio", +e.target.value)} />
                <Seats guests={f.guests} menRatio={f.menRatio} />
              </>}
            </>}

            {step === 4 && <>
              <h2 className="onb-q">كم ميزانيتك؟</h2>
              <p className="onb-sub" style={{ marginTop: -6 }}>أنت تحددها، ونحن نوزعها على البنود ونرشّح لك ما يناسبها.</p>
              <label className="sr" htmlFor="o-b">الميزانية بالريال</label>
              <div className="budget-input">
                <input id="o-b" className="onb-input num" inputMode="numeric" placeholder={`مثلاً ${fmt(prof.budgetHint)}`} value={budget ? fmt(budget) : ""} onChange={(e) => set("budget", e.target.value.replace(/\D/g, "").slice(0, 9))} autoFocus />
                <span>ر.س</span>
              </div>
              <div className="split-bars" aria-hidden={!budget}>
                {(() => { const lines = splitBudget(budget || 100000, f.occasion, f.place).slice(0, 7); const top = Math.max(...lines.map((l) => l.est), 1); return lines.map((l) => (
                  <div key={l.cat} className="split-row">
                    <span>{l.label}</span>
                    <i><motion.b initial={false} animate={{ scaleX: budget ? l.est / top : 0.04 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} /></i>
                    <b className="num">{budget ? fmt(l.est) : "—"}</b>
                  </div>
                )); })()}
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
              <span style={{ fontSize: 13, opacity: 0.8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="Lock" size={14} /> بياناتك ما تنشارك مع أي مورد إلا بطلبك. <a href="../privacy.html" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>الخصوصية والشروط</a></span>
            </>}

            {step === 7 && <div className="stack" style={{ justifyItems: "center", textAlign: "center", ["--gap" as string]: "22px" }}>
              <div className="gen-orb" />
              <h2 className="onb-q" style={{ fontSize: 30 }}>نجهز خطتك يا {f.name.split(" ")[0]}…</h2>
              <motion.div className="onb-sub" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.8, times: [0, 0.2, 0.8, 1] }}>نوزع ميزانيتك على بنود {occ.name} ونطابق أفضل الموردين في {f.city}</motion.div>
            </div>}

            {step === 8 && <>
              <h2 className="onb-q" style={{ fontSize: "clamp(28px, 7vw, 40px)" }}>خطة {occ.name} جاهزة ✨</h2>
              <span className="onb-goal"><Icon name="Target" size={14} /> {prof.goal}</span>
              <div className="plan-tiles">
                <div className="plan-tile wide"><small>ميزانيتك</small>{budget ? <b className="num"><Counter value={budget} /> <span style={{ fontSize: 15 }}>ر.س</span></b> : <b style={{ fontSize: 18 }}>تحددها لاحقاً</b>}</div>
                <div className="plan-tile"><small>باقي على الموعد</small><b><Counter value={daysUntil(f.date)} /> يوم</b></div>
                <div className="plan-tile"><small>ضيوفك</small><b><Counter value={f.guests} /></b></div>
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

        <ScrollHint step={step} />
        {login && !needAuth && (
          <div className="card" style={{ color: "var(--ink)", marginBottom: 12 }}>
            <PhoneAuth title="أهلاً بعودتك" initialMode="login" onDone={() => setLogin(false)} />
            <button className="btn ghost sm" style={{ marginTop: 6 }} onClick={() => setLogin(false)}>رجوع</button>
          </div>
        )}
        {needAuth && (
          <div className="card" style={{ color: "var(--ink)", marginBottom: 12 }}>
            <PhoneAuth title="آخر خطوة: سوّ حسابك عشان نحفظ مناسبتك" initialPhone={f.phone} initialName={f.name} onDone={() => { setNeedAuth(false); if (!repo.get().client.event) create(false); }} />
          </div>
        )}
        {step !== 7 && step !== 1 && !needAuth && !login && (
          <div className="onb-foot">
            {step === 8
              ? <button className="btn white lg" onClick={() => { finish(); location.hash = "plan"; }}>شوف اقتراحاتي <Icon name="ArrowLeft" size={18} /></button>
              : <button className="btn white lg" onClick={next} disabled={!canNext}>{step === 0 ? "يلا نبدأ" : step === 6 ? "جهّز اقتراحاتي" : step === 5 && !f.style.length ? "تخطّ" : "التالي"} <Icon name="ArrowLeft" size={18} /></button>}
          </div>
        )}
        {step === 0 && isCloud && !login && !needAuth && (
          <button className="btn glass sm" style={{ alignSelf: "center", marginTop: 4 }} onClick={() => setLogin(true)}>عندي حساب · تسجيل الدخول</button>
        )}
      </div>
    </div>
  );
}

/** سهم صغير يظهر لما يكون في الخطوة محتوى تحت، ويختفي لما توصل للأسفل */
function ScrollHint({ step }: { step: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let el: HTMLElement | null = null;
    const check = () => { if (el) setShow(el.scrollHeight - el.clientHeight - el.scrollTop > 24); };
    const t = setTimeout(() => { el = document.querySelector(".onb-body"); if (!el) return; check(); el.addEventListener("scroll", check, { passive: true }); }, 520);
    window.addEventListener("resize", check);
    return () => { clearTimeout(t); el?.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, [step]);
  return (
    <AnimatePresence>
      {show && <motion.button key="sh" className="onb-more" aria-label="انزل لباقي الخطوة" onClick={() => document.querySelector(".onb-body")?.scrollBy({ top: 240, behavior: "smooth" })}
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: [0, 4, 0] }} exit={{ opacity: 0 }} transition={{ y: { repeat: Infinity, duration: 1.6 }, opacity: { duration: 0.3 } }}>
        <Icon name="ChevronDown" size={18} />
      </motion.button>}
    </AnimatePresence>
  );
}
