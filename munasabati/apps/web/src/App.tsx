import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CATEGORIES, OCCASIONS, hospitality, type Occasion } from "@munasabati/core";
import { Counter, Icon, LogoMark, MeshGradient, Reveal, ThemeToggle, photoUrl } from "@munasabati/ui";

// كل بوابة تطبيق مستقل يُنشر منفصلاً. الروابط قابلة للتغيير عند النشر على نطاقات مختلفة.
const LINKS = {
  client: import.meta.env.VITE_CLIENT_URL ?? "client/index.html",
  vendors: import.meta.env.VITE_VENDORS_URL ?? "vendors/index.html",
  venues: import.meta.env.VITE_VENUES_URL ?? "venues/index.html",
};

const HERO_WORD: Record<string, string> = { wedding: "زواجك", milka: "ملكتك", grad: "تخرّجك", aqiqa: "عقيقتك", family: "لمّتكم", corp: "حفل شركتك" };
const grad = (o: Occasion) => `linear-gradient(135deg, ${o.palette[0]}, ${o.palette[1]} 45%, ${o.palette[2]} 80%, ${o.palette[3]})`;

/* ───── شاشات الجوال المصغرة ───── */
function MiniHome({ occ }: { occ: Occasion }) {
  return (
    <div className="ms">
      <div className="row between"><div><div className="faint" style={{ fontSize: 11 }}>مساء الخير</div><div className="ms-hello">عبدالله 👋</div></div><span className="avatar" style={{ width: 32, height: 32, borderRadius: 11, fontSize: 12 }}>ع</span></div>
      <motion.div className="ms-hero" animate={{ background: grad(occ) }} transition={{ duration: 1.2 }}>
        <div style={{ fontSize: 11, opacity: 0.9 }}>{occ.name} · الرياض</div>
        <div className="display" style={{ fontWeight: 800, fontSize: 18 }}>باقي على ليلتك</div>
        <div className="ms-cd num">{[["42", "يوم"], ["08", "ساعة"], ["31", "دقيقة"]].map(([v, l]) => <div key={l}><b>{v}</b><small>{l}</small></div>)}</div>
      </motion.div>
      <div className="ms-grid">
        <div className="ms-tile"><small>ضيوف مؤكدين</small><b className="num">312</b><div className="bar" style={{ height: 5, marginTop: 4 }}><i style={{ width: "68%" }} /></div></div>
        <div className="ms-tile"><small>المدفوع</small><b className="num">48k</b><div className="bar ok" style={{ height: 5, marginTop: 4 }}><i style={{ width: "34%" }} /></div></div>
      </div>
      <div className="ms-card">
        <b className="display" style={{ fontSize: 12.5 }}>المهام القادمة</b>
        {["اختيار تصميم الكوشة", "الاتفاق مع القهوجية"].map((t, i) => <div key={t} className="ms-row"><span className="check" style={{ width: 18, height: 18, borderRadius: 6 }} /><span className="grow">{t}</span><span className="faint num">{i ? "14" : "6"} يوم</span></div>)}
      </div>
      <div className="ms-nav">{["House", "Compass", "Users", "CalendarCheck", "LayoutGrid"].map((n, i) => <span key={n} className={i === 0 ? "on" : ""}><Icon name={n} size={18} /></span>)}</div>
    </div>
  );
}
function MiniPlan({ occ }: { occ: Occasion }) {
  return (
    <div className="ms" style={{ background: grad(occ), color: "#fff" }}>
      <div style={{ display: "flex", gap: 4 }}>{[1, 1, 1, 0, 0].map((on, i) => <i key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: on ? "#fff" : "rgba(255,255,255,.3)" }} />)}</div>
      <div className="display" style={{ fontWeight: 800, fontSize: 24, lineHeight: 1.2, marginTop: 12 }}>كم ضيف تتوقع؟</div>
      <div className="display num" style={{ fontWeight: 800, fontSize: 54, lineHeight: 1 }}>450</div>
      <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,.3)" }}><div style={{ width: "40%", height: "100%", borderRadius: 6, background: "#fff" }} /></div>
      <div className="ms-grid" style={{ marginTop: 6 }}>
        {[["رجال", "225"], ["نساء", "225"], ["ذبائح", "54"], ["قهوة", "13 كجم"]].map(([l, v]) => <div key={l} style={{ background: "rgba(255,255,255,.16)", borderRadius: 14, padding: 10, backdropFilter: "blur(6px)" }}><small style={{ opacity: 0.85, fontSize: 10.5 }}>{l}</small><b className="display num" style={{ display: "block", fontSize: 17 }}>{v}</b></div>)}
      </div>
      <div style={{ marginTop: "auto", background: "#fff", color: "#121016", borderRadius: 999, padding: "12px", textAlign: "center", fontFamily: "var(--f-display)", fontWeight: 700 }}>التالي</div>
    </div>
  );
}
function MiniMarket({ occ }: { occ: Occasion }) {
  return (
    <div className="ms">
      <div className="ms-hello">استكشف</div>
      <div className="ms-card" style={{ padding: "9px 12px", color: "var(--faint)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="Search" size={14} /> قاعات، كوشة، تصوير…</div>
      <div style={{ display: "flex", gap: 6 }}>{["قاعات", "كوشة", "تصوير", "ضيافة"].map((c, i) => <span key={c} className={"chip" + (i === 0 ? " on" : "")} style={{ minHeight: 28, padding: "0 10px", fontSize: 11 }}>{c}</span>)}</div>
      {[["قصر الندى", "الرياض · حتى 900", "65,000", "v1"], ["دار اللؤلؤ", "جدة · حتى 1,200", "88,000", "v3"]].map(([n, m, p, k]) => (
        <div key={n as string} className="ms-card" style={{ padding: 0, overflow: "hidden" }}>
          <img src={photoUrl(`media:${k}`, true)} alt="" style={{ height: 82, width: "100%", objectFit: "cover", display: "block", borderBottom: `3px solid ${occ.palette[1]}` }} />
          <div style={{ padding: 10 }}><div className="row between"><b className="display" style={{ fontSize: 13 }}>{n}</b><span className="brand num" style={{ fontWeight: 600 }}>★ 4.9</span></div><div className="row between faint" style={{ fontSize: 11 }}><span>{m}</span><span className="num" style={{ color: "var(--ink)", fontWeight: 600 }}>{p} ر.س</span></div></div>
        </div>
      ))}
    </div>
  );
}
function MiniInvite({ occ }: { occ: Occasion }) {
  return (
    <div className="ms" style={{ alignItems: "center", justifyContent: "center", background: grad(occ), color: "#fff", textAlign: "center" }}>
      <div style={{ fontSize: 11, opacity: 0.9 }}>دعوة خاصة لـ</div>
      <div className="display" style={{ fontWeight: 800, fontSize: 20 }}>خالد الدوسري</div>
      <div style={{ width: 132, height: 132, background: "#fff", borderRadius: 20, padding: 12, marginTop: 8, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {Array.from({ length: 49 }, (_, i) => <i key={i} style={{ background: (i * 7 + (i % 5) * 3) % 3 === 0 || [0, 1, 7, 8, 5, 6, 12, 13, 35, 36, 42, 43].includes(i) ? "#121016" : "transparent", borderRadius: 2 }} />)}
      </div>
      <div className="num" style={{ letterSpacing: ".3em", fontWeight: 700, marginTop: 6 }}>K7Q2M</div>
      <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 14 }}>
        <div style={{ flex: 1, background: "#fff", color: "#121016", borderRadius: 999, padding: 10, fontFamily: "var(--f-display)", fontWeight: 700 }}>أكيد بحضر</div>
        <div style={{ flex: 1, background: "rgba(255,255,255,.18)", borderRadius: 999, padding: 10 }}>أعتذر</div>
      </div>
    </div>
  );
}
function MiniDoor() {
  return (
    <div className="ms">
      <div className="ms-hello">استقبال الضيوف</div>
      <div className="ms-grid">
        <div className="ms-tile"><small>قسم الرجال</small><b className="num">186<span className="faint" style={{ fontSize: 11 }}> / 240</span></b></div>
        <div className="ms-tile"><small>قسم النساء</small><b className="num">203<span className="faint" style={{ fontSize: 11 }}> / 260</span></b></div>
      </div>
      <div style={{ borderRadius: 22, background: "#121016", height: 150, display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ width: 96, height: 96, border: "2.5px solid #fff", borderRadius: 18, opacity: 0.9 }} />
        <motion.div style={{ position: "absolute", left: "30%", right: "30%", height: 2, background: "var(--brand)", boxShadow: "0 0 14px var(--brand)" }} animate={{ top: ["28%", "70%", "28%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
      </div>
      <div className="ms-card" style={{ background: "var(--ok-soft)", borderColor: "transparent", display: "flex", gap: 8, alignItems: "center" }}><Icon name="CheckCircle2" size={20} style={{ color: "var(--ok)" }} /><div><b className="display">أهلاً تركي المطيري</b><div className="faint" style={{ fontSize: 11 }}>قسم الرجال · 4 أشخاص</div></div></div>
    </div>
  );
}

function Phone({ children, tilt = true }: { children: ReactNode; tilt?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 18 });
  useEffect(() => {
    if (!tilt) return;
    const on = (e: PointerEvent) => { mx.set(e.clientX / window.innerWidth - 0.5); my.set(e.clientY / window.innerHeight - 0.5); };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [tilt, mx, my]);
  return (
    <motion.div ref={ref} className="phone" style={tilt ? { rotateX: rx, rotateY: ry } : undefined}>
      <div className="phone-notch" />
      <div className="phone-screen">{children}</div>
    </motion.div>
  );
}

function FloatCard({ style, icon, color, title, sub, delay, className = "" }: { style: React.CSSProperties; icon: string; color: string; title: string; sub: string; delay: number; className?: string }) {
  return (
    <motion.div className={"float-card " + className} style={style} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }} transition={{ opacity: { delay, duration: 0.6 }, scale: { delay, duration: 0.6 }, y: { delay: delay + 0.6, duration: 5, repeat: Infinity, ease: "easeInOut" } }}>
      <span className="fi" style={{ background: color + "22", color }}><Icon name={icon} size={18} /></span>
      <div><b>{title}</b><small>{sub}</small></div>
    </motion.div>
  );
}


const REEL: [string, string, string][] = [
  ["v1", "قصر الندى · الرياض", "قاعة بقسمين وكوشة بارتفاع 7 أمتار"],
  ["s1", "تجهيز متكامل", "كوشة وإضاءة وشاشات وبث مباشر من مورد واحد"],
  ["v6", "خيمة رجال ومشبّات · القصيم", "مجالس تراثية للمناسبات الكبيرة"],
  ["s3", "الضيافة السعودية", "قهوجية وصبابين وتمور فاخرة"],
  ["v3", "دار اللؤلؤ · جدة", "إطلالة بحرية وممر زفة 40 متر"],
  ["s7", "استيدج وكوشات", "تصميم ثلاثي الأبعاد قبل التنفيذ"],
  ["v7", "قاعة غيم · أبها", "حفلة فوق الضباب"],
];

function Reel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused) return; const t = setTimeout(() => setI((x) => (x + 1) % REEL.length), 5200); return () => clearTimeout(t); }, [i, paused]);
  const [k, title, sub] = REEL[i];
  return (
    <section className="container sec" style={{ paddingTop: 30 }}>
      <Reveal className="sec-head"><span className="eyebrow">من داخل المنصة</span><h2>قاعات وتجهيزات <span className="grad-text">تستاهل فرحتك</span></h2></Reveal>
      <div className="reel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <AnimatePresence initial={false}>
          <motion.img key={k} src={photoUrl(`media:${k}`)} alt={title} className="reel-img"
            initial={{ opacity: 0, scale: 1.14 }} animate={{ opacity: 1, scale: 1.02 }} exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.1 }, scale: { duration: 7, ease: "linear" } }} />
        </AnimatePresence>
        <div className="reel-shade" />
        <div className="reel-bars">{REEL.map((_, n) => <button key={n} onClick={() => setI(n)} aria-label={`الصورة ${n + 1}`}><motion.i initial={false} animate={{ scaleX: n < i ? 1 : n === i ? 1 : 0 }} transition={{ duration: n === i && !paused ? 5.2 : 0.3, ease: "linear" }} /></button>)}</div>
        <AnimatePresence mode="wait">
          <motion.div key={title} className="reel-cap" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
            <h3>{title}</h3><p>{sub}</p>
          </motion.div>
        </AnimatePresence>
        <a className="btn white reel-cta" href={LINKS.client}>تصفح في التطبيق <Icon name="ArrowLeft" size={17} /></a>
      </div>
    </section>
  );
}

/* ───── الواجهة الرئيسية ───── */
function Hero({ occ, setOcc }: { occ: Occasion; setOcc: (o: Occasion, manual?: boolean) => void }) {
  return (
    <div className="hero-frame">
      <section className="hero">
        <MeshGradient palette={occ.palette} />
        <nav className="hero-nav" aria-label="التنقل">
          <div className="logo"><LogoMark />مناسبتي</div>
          <div className="links"><a href={LINKS.client}>لأصحاب المناسبات</a><a href={LINKS.vendors}>للموردين</a><a href={LINKS.venues}>لأصحاب القاعات</a><a href="#story">كيف تعمل</a></div>
          <div style={{ flex: 1 }} />
          <a className="btn glass sm" href={LINKS.client}>ادخل التطبيق</a>
        </nav>
        <div className="hero-body">
          <div>
            <span className="live"><i /> منصة المناسبات السعودية</span>
            <h1>
              <span className="word-slot">
                <AnimatePresence mode="wait">
                  <motion.span key={occ.id} initial={{ opacity: 0, y: 30, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -24, filter: "blur(10px)" }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>{HERO_WORD[occ.id]}،</motion.span>
                </AnimatePresence>
              </span>
              <br />من الفكرة لآخر ضيف.
            </h1>
            <p className="lead">خطط مناسبتك مع أهلك، احجز القاعة والكوشة والتصوير والضيافة من موردين موثوقين، وأرسل الدعوات بالواتساب. كل شيء في تطبيق واحد.</p>
            <div className="occ-row" role="group" aria-label="نوع المناسبة">
              {OCCASIONS.map((o) => <button key={o.id} className={"occ" + (o.id === occ.id ? " on" : "")} onClick={() => setOcc(o, true)} aria-pressed={o.id === occ.id}>{o.name}</button>)}
            </div>
            <div className="hero-cta">
              <a className="btn white lg" href={LINKS.client}>خطط مناسبتك مجاناً <Icon name="ArrowLeft" size={18} /></a>
              <a className="btn glass lg" href={LINKS.vendors}>أنا مزود خدمة</a>
            </div>
          </div>
          <div className="phone-stage">
            <Phone><MiniHome occ={occ} /></Phone>
            <FloatCard style={{ top: "12%", insetInlineEnd: "calc(50% + 110px)" }} icon="UserCheck" color="#0f9e70" title="أكّد حضوره" sub="خالد الدوسري · 3 أشخاص" delay={0.6} className="hide-sm" />
            <FloatCard style={{ top: "46%", insetInlineStart: "calc(50% + 100px)" }} icon="BadgeDollarSign" color="#5550e6" title="عرض سعر جديد" sub="باقة الفرح · 24,000 ر.س" delay={0.9} className="hide-sm" />
            <FloatCard style={{ bottom: "8%", insetInlineEnd: "calc(50% + 70px)" }} icon="Coffee" color="#e5195e" title="54 ذبيحة · 13 كجم قهوة" sub="حسب الضيوف المؤكدين" delay={1.2} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Portals({ occ }: { occ: Occasion }) {
  return (
    <section className="sec container" id="portals">
      <Reveal className="sec-head">
        <span className="eyebrow">ثلاث منصات مستقلة</span>
        <h2>لكل طرف <span className="grad-text">منصته الخاصة</span></h2>
        <p>العائلات والموردين وأصحاب القاعات. كل طرف له تطبيقه ودخوله وأدواته، وكلها متصلة ببعض: الطلب يوصل للمورد لحظة إرساله.</p>
      </Reveal>
      <div className="portals">
        <Reveal><a className="portal feature" href={LINKS.client}>
          <MeshGradient palette={occ.palette} />
          <span className="badge-ind">تطبيق العميل</span>
          <span className="p-ico"><Icon name="Heart" size={24} /></span>
          <h3>لأصحاب المناسبات</h3>
          <p>من أول فكرة إلى آخر ضيف يدخل الباب.</p>
          <ul>{["مساعد يخطط معك ويحسب الميزانية والضيافة", "ضيوف بقسمين ودعوات واتساب برمز QR", "مهام للعائلة وحجوزات وعروض أسعار", "شاشة استقبال الضيوف يوم المناسبة"].map((t) => <li key={t}><Icon name="Check" size={16} />{t}</li>)}</ul>
          <span className="btn white go">ابدأ مجاناً <Icon name="ArrowLeft" size={17} /></span>
        </a></Reveal>
        <Reveal delay={0.08}><a className="portal" href={LINKS.vendors}>
          <span className="badge-ind">بوابة الموردين</span>
          <span className="p-ico"><Icon name="Store" size={24} /></span>
          <h3>للموردين</h3>
          <p>كوشة، تصوير، صوت وإضاءة، بث مباشر، ضيافة، خيام، مولدات، واستيدج.</p>
          <ul>{["صندوق طلبات وعروض أسعار", "باقات وأسعار تعدلها بنفسك", "تقويم وإيرادات ومعدل تحويل"].map((t) => <li key={t}><Icon name="Check" size={16} />{t}</li>)}</ul>
          <span className="btn primary go">افتح بوابة الموردين</span>
        </a></Reveal>
        <Reveal delay={0.16}><a className="portal" href={LINKS.venues}>
          <span className="badge-ind">بوابة القاعات</span>
          <span className="p-ico"><Icon name="Building2" size={24} /></span>
          <h3>لأصحاب القاعات</h3>
          <p>أدر قاعاتك وأقسامها وأسعار أيام الأسبوع والويكند من مكان واحد.</p>
          <ul>{["أكثر من قاعة بقسم رجال وقسم نساء", "تقويم إشغال وإغلاق أيام", "تسعير ذكي للويكند والمواسم"].map((t) => <li key={t}><Icon name="Check" size={16} />{t}</li>)}</ul>
          <span className="btn primary go">افتح بوابة القاعات</span>
        </a></Reveal>
      </div>
    </section>
  );
}

const STEPS = [
  { t: "خطط في دقيقة", d: "المساعد يسألك عن المناسبة والمدينة والعدد، ويطلع لك ميزانية تقديرية وكميات الضيافة وأنسب القاعات.", s: (o: Occasion) => <MiniPlan occ={o} /> },
  { t: "قارن واحجز", d: "قاعات وموردين بأسعار واضحة وتقويم توفر حقيقي. اطلب عرض سعر، والمورد يرد عليك داخل التطبيق.", s: (o: Occasion) => <MiniMarket occ={o} /> },
  { t: "ادعُ ضيوفك", d: "لكل ضيف رابط دعوة خاص على الواتساب. يرد بضغطة، ويوصله رمز دخول خاص فيه.", s: (o: Occasion) => <MiniInvite occ={o} /> },
  { t: "استقبلهم بالاسم", d: "شاشة الحارس عند الباب تمسح الرمز وتعرف القسم وعدد المرافقين، والعدّاد يتحدث لحظياً.", s: () => <MiniDoor /> },
];

function Story({ occ }: { occ: Occasion }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); }), { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);
  return (
    <section className="sec container" id="story">
      <Reveal className="sec-head"><span className="eyebrow">كيف تعمل</span><h2>أربع خطوات إلى <span className="grad-text">ليلة العمر</span></h2></Reveal>
      <div className="story">
        <div className="story-steps">
          {STEPS.map((s, i) => (
            <div key={s.t} ref={(el) => { refs.current[i] = el; }} data-i={i} className={"story-step" + (active === i ? " on" : "")}>
              <span className="n num">الخطوة {i + 1} من 4</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              <div className="inline-phone"><Phone tilt={false}>{s.s(occ)}</Phone></div>
            </div>
          ))}
        </div>
        <div className="story-sticky">
          <Phone>
            <AnimatePresence mode="popLayout">
              <motion.div key={active} style={{ position: "absolute", inset: 0 }} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.45 }}>
                {STEPS[active].s(occ)}
              </motion.div>
            </AnimatePresence>
          </Phone>
        </div>
      </div>
    </section>
  );
}

function CalcBand() {
  const [g, setG] = useState(450);
  const h = useMemo(() => hospitality(Math.round(g / 2), g - Math.round(g / 2)), [g]);
  return (
    <section className="sec container" style={{ paddingTop: 0 }}>
      <Reveal className="calc-band">
        <div className="stack" style={{ ["--gap" as string]: "14px" }}>
          <span className="eyebrow">مبني للعادات السعودية</span>
          <h2 style={{ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 800, letterSpacing: "-.03em" }}>كم ذبيحة تحتاج؟ <span className="grad-text">جرّب بنفسك</span></h2>
          <p className="muted">حرّك العدد وشوف الكميات تتغير. التطبيق يحسبها تلقائياً من الضيوف المؤكدين لكل قسم.</p>
          <div className="big-guests num"><Counter value={g} /> <span className="muted" style={{ fontSize: 18, fontWeight: 500, letterSpacing: 0 }}>ضيف</span></div>
          <label className="sr" htmlFor="calc-g">عدد الضيوف</label>
          <input id="calc-g" type="range" min={50} max={1500} step={10} value={g} onChange={(e) => setG(+e.target.value)} />
        </div>
        <div className="calc-tiles">
          {[["ذبيحة تقريباً", h.sheep], ["كجم قهوة سعودية", h.coffee], ["قهوجي وصباب", h.servers], ["كجم رز", h.rice]].map(([l, v]) => (
            <div key={l} className="calc-tile"><small>{l}</small><b><Counter value={v as number} /></b></div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default function App() {
  const [occ, setOccState] = useState<Occasion>(OCCASIONS[0]);
  const manual = useRef(false);
  const setOcc = (o: Occasion, m = false) => { if (m) manual.current = true; setOccState(o); };
  useEffect(() => {
    const t = setInterval(() => { if (!manual.current) setOccState((o) => OCCASIONS[(OCCASIONS.indexOf(o) + 1) % OCCASIONS.length]); }, 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Hero occ={occ} setOcc={setOcc} />
      <div className="marquee" aria-label="خدمات التجهيز">
        <div className="track">{[0, 1].map((k) => CATEGORIES.map((c) => <span key={k + c.id} className="item" aria-hidden={k === 1}><span><Icon name={c.icon} size={18} /></span>{c.name}</span>))}</div>
      </div>
      <Reel />
      <Portals occ={occ} />
      <Story occ={occ} />
      <CalcBand />
      <section className="container" style={{ paddingBottom: 20 }}>
        <Reveal className="final">
          <MeshGradient palette={OCCASIONS[2].palette} />
          <span className="live"><i /> مجاناً لأصحاب المناسبات</span>
          <h2>جاهز؟<br />خلّنا نبدأ فرحتك.</h2>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <a className="btn white lg" href={LINKS.client}>ابدأ الآن</a>
            <a className="btn glass lg" href={LINKS.venues}>سجّل قاعتك</a>
          </div>
        </Reveal>
      </section>
      <footer className="container footer">
        <div className="row"><LogoMark /><b className="display" style={{ color: "var(--ink)" }}>مناسبتي</b><span>نسخة تجريبية · الأسماء والأسعار أمثلة</span></div>
        <nav><a href={LINKS.client}>تطبيق العميل</a><a href={LINKS.vendors}>بوابة الموردين</a><a href={LINKS.venues}>بوابة القاعات</a></nav>
        <ThemeToggle />
      </footer>
    </>
  );
}
