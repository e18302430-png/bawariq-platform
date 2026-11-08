import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { OCCASIONS, type Occasion } from "@munasabati/core";
import { Icon, MeshGradient, Reveal, ThemeToggle, photoUrl } from "@munasabati/ui";
import { LiveFilm } from "./LiveFilm";
import wcDiriyah from "./assets/film/watercolor-diriyah.webp";
import stillDesert from "./assets/film/f5-desert.webp";

// كل بوابة تطبيق مستقل يُنشر منفصلاً. الروابط قابلة للتغيير عند النشر على نطاقات مختلفة.
const LINKS = {
  client: import.meta.env.VITE_CLIENT_URL ?? "client/index.html",
  vendors: import.meta.env.VITE_VENDORS_URL ?? "vendors/index.html",
  venues: import.meta.env.VITE_VENUES_URL ?? "venues/index.html",
};

const HERO_WORD: Record<string, string> = { wedding: "زواجك", milka: "ملكتك", grad: "تخرّجك", aqiqa: "عقيقتك", family: "لمّتكم", corp: "حفل شركتك" };
const grad = (o: Occasion) => `linear-gradient(135deg, ${o.palette[0]}, ${o.palette[1]} 45%, ${o.palette[2]} 80%, ${o.palette[3]})`;

/* ───── شاشات الجوال المصغرة ───── */
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
function MiniPrep() {
  const rows: [string, string, string, string][] = [["الكوشة", "مؤكدة · بوارق", "ok", "CheckCircle2"], ["التصوير", "عرض سعر وصلك", "warn", "Clock"], ["الضيافة", "لم تُحجز بعد", "neutral", "Circle"]];
  return (
    <div className="ms">
      <div className="ms-hello">التجهيزات</div>
      <div className="faint" style={{ fontSize: 11 }}>المرحلة 3 من 5 · 1 من 3 مؤكدة</div>
      <div className="bar" style={{ height: 6 }}><i style={{ width: "33%" }} /></div>
      <div className="ms-card">{rows.map(([t, d, c, ic]) => <div key={t} className="ms-row"><Icon name={ic} size={18} style={{ color: `var(--${c === "neutral" ? "faint" : c})` }} /><div className="grow"><b className="display" style={{ fontSize: 12.5 }}>{t}</b><div className="faint" style={{ fontSize: 10.5 }}>{d}</div></div></div>)}</div>
      <div style={{ marginTop: "auto", background: "var(--ink)", color: "var(--bg)", borderRadius: 999, padding: 12, textAlign: "center", fontFamily: "var(--f-display)", fontWeight: 700 }}>احجز الضيافة</div>
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


/* ───── ميزات حية بدل الكلام ───── */
function Features() {
  return (
    <section className="sec container" id="features">
      <Reveal className="sec-head"><span className="eyebrow">ليش مناسبتي</span><h2>تفاصيل تخلّي ضيوفك <span className="grad-text">يتكلمون عنها</span></h2></Reveal>
      <div className="bento">
        <Reveal className="b-card b-invite">
          <img src={wcDiriyah} alt="" loading="lazy" />
          <div className="b-seal"><span>ع</span></div>
          <div className="b-text"><b>دعوة تنفتح في يد ضيفك</b><span>ظرف بلوحة مائية سعودية وختم شمع ذهبي، يفتحه الضيف بلمسة.</span></div>
        </Reveal>
        <Reveal className="b-card b-scratch" delay={0.05}>
          <div className="b-foil"><span>اكشط لتعرف الموعد ✦</span></div>
          <div className="b-text"><b>اكشط لتكشف التاريخ</b><span>طبقة ذهبية يكشطها الضيف بإصبعه، وتنطلق القصاصات.</span></div>
        </Reveal>
        <Reveal className="b-card b-scan" delay={0.1}>
          <div className="b-scanbox"><i /><i /><i /><i /><motion.span className="b-laser" animate={{ top: ["14%", "84%", "14%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} /></div>
          <div className="b-text"><b>دخول بالكاميرا</b><span>الحارس يمسح رمز الضيف بكاميرا الجوال ويعرف قسمه وعدد مرافقيه.</span></div>
        </Reveal>
        <Reveal className="b-card b-chat" delay={0.05}>
          <div className="b-bubbles">
            <span className="in">هل يتوفر بث مباشر لقسم النساء؟</span>
            <span className="out">أكيد، نضيفه للباقة ونرسل لك العرض الآن.</span>
            <span className="in">ممتاز، بانتظاركم 🤍</span>
          </div>
          <div className="b-text"><b>محادثة مع كل مورد</b><span>كل طلب له محادثته الخاصة، بدون ضياع بين الأرقام والقروبات.</span></div>
        </Reveal>
        <Reveal className="b-card b-journey" delay={0.1}>
          <ol className="b-steps">{["الخطة", "القاعة", "التجهيزات", "الدعوات", "يوم المناسبة"].map((t, i) => <li key={t} className={i < 2 ? "done" : i === 2 ? "now" : ""}><i>{i < 2 ? "✓" : i + 1}</i>{t}</li>)}</ol>
          <div className="b-text"><b>رحلة واضحة من خمس مراحل</b><span>في كل لحظة خطوة تالية واحدة. ما تحتار وش تسوي.</span></div>
        </Reveal>
        <Reveal className="b-card b-film" delay={0.15}>
          <img src={stillDesert} alt="" loading="lazy" />
          <div className="b-text"><b>لكل مناسبة هويتها</b><span>زواج، ملكة، تخرّج، عقيقة، أو لمّة عائلية. التصميم يتغيّر مع مناسبتك.</span></div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───── الواجهة الرئيسية ───── */
function Hero({ occ }: { occ: Occasion }) {
  const [film, setFilm] = useState(false);
  // الصورة الأولى تظهر فوراً من HTML، ثم يبدأ الفيلم الحي فوقها
  const onFilmReady = () => { const boot = document.getElementById("boot-hero"); if (boot) { boot.style.transition = "opacity .6s"; boot.style.opacity = "0"; setTimeout(() => boot.remove(), 700); } };
  const doors: [string, string, string, string][] = [
    [LINKS.client, "Heart", "عندي مناسبة", "خطط واحجز وأرسل الدعوات"],
    [LINKS.vendors, "Store", "أنا مورّد", "كوشة، تصوير، ضيافة، صوت…"],
    [LINKS.venues, "Building2", "عندي قاعة", "أدر الحجوزات والأسعار"],
  ];
  return (
    <div className="hero-frame">
      <section className="hero">
        <div className="hero-video-box"><LiveFilm onReady={onFilmReady} /></div>
        <div className="hero-shade" />
        <nav className="hero-nav" aria-label="التنقل">
          <div className="logo">مناسبتي</div>
          <div className="links"><a href="#story">كيف تعمل</a><a href={LINKS.vendors}>للموردين</a><a href={LINKS.venues}>للقاعات</a></div>
          <div style={{ flex: 1 }} />
          <a className="btn glass sm" href={LINKS.client}>ادخل التطبيق</a>
        </nav>
        <div className="hero-body">
          <span className="live"><i /> منصة المناسبات السعودية</span>
          <h1>
            <span className="word-slot">
              <AnimatePresence mode="wait">
                <motion.span key={occ.id} initial={{ opacity: 0, y: 30, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -24, filter: "blur(10px)" }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>{HERO_WORD[occ.id]}،</motion.span>
              </AnimatePresence>
            </span>
            <br />من الفكرة لآخر ضيف.
          </h1>
          <p className="lead">خطوة بخطوة: القاعة، ثم التجهيزات، ثم الدعوات، حتى يوم المناسبة. كل شيء في تطبيق واحد.</p>
          <button className="play-film" onClick={() => setFilm(true)}><span><Icon name="Play" size={16} fill="currentColor" /></span>شاهد فيلم مناسبتي</button>
          <div className="doors">
            {doors.map(([href, ic, t, d], i) => (
              <motion.a key={t} href={href} className={"door" + (i === 0 ? " main" : "")} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <span className="door-ico"><Icon name={ic} size={22} /></span>
                <span className="grow"><b>{t}</b><small>{d}</small></span>
                <Icon name="ArrowLeft" size={19} />
              </motion.a>
            ))}
          </div>
        </div>
      </section>
      <AnimatePresence>
        {film && (
          <motion.div className="film-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilm(false)} role="dialog" aria-label="فيلم مناسبتي">
            <motion.video initial={{ scale: 0.92 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 28 }} src="./media/film.mp4" poster="./media/film-poster.webp" autoPlay controls playsInline onClick={(e) => e.stopPropagation()} />
            <button className="btn glass sm film-close" onClick={() => setFilm(false)} aria-label="إغلاق"><Icon name="X" size={16} /> إغلاق</button>
          </motion.div>
        )}
      </AnimatePresence>
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
  { t: "خطط في دقيقة", d: "خمسة أسئلة سريعة، وتطلع لك ميزانية تقديرية وكميات الضيافة وأنسب القاعات في مدينتك.", s: (o: Occasion) => <MiniPlan occ={o} /> },
  { t: "احجز القاعة", d: "قاعات بأسعار واضحة وتقويم توفر حقيقي. اطلب الحجز، وصاحب القاعة يرد بعرض سعر داخل التطبيق.", s: (o: Occasion) => <MiniMarket occ={o} /> },
  { t: "جهّز مناسبتك", d: "الكوشة والتصوير والضيافة. قائمة واضحة تعرف منها وش تأكد ووش باقي.", s: () => <MiniPrep /> },
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
      <Reveal className="sec-head"><span className="eyebrow">كيف تعمل</span><h2>خمس مراحل واضحة إلى <span className="grad-text">ليلة العمر</span></h2><p>نفس المسار تمشي عليه داخل التطبيق، وفي كل مرحلة خطوة واحدة تالية. ما تحتار.</p></Reveal>
      <div className="story">
        <div className="story-steps">
          {STEPS.map((s, i) => (
            <div key={s.t} ref={(el) => { refs.current[i] = el; }} data-i={i} className={"story-step" + (active === i ? " on" : "")}>
              <span className="n num">المرحلة {i + 1} من 5</span>
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

export default function App() {
  const [occ, setOcc] = useState<Occasion>(OCCASIONS[0]);
  useEffect(() => {
    const t = setInterval(() => setOcc((o) => OCCASIONS[(OCCASIONS.indexOf(o) + 1) % OCCASIONS.length]), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Hero occ={occ} />
      <Story occ={occ} />
      <Features />
      <Portals occ={occ} />
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
        <div className="row"><b className="display" style={{ color: "var(--ink)" }}>مناسبتي</b><span>نسخة تجريبية · الأسماء والأسعار أمثلة</span></div>
        <nav><a href={LINKS.client}>تطبيق العميل</a><a href={LINKS.vendors}>بوابة الموردين</a><a href={LINKS.venues}>بوابة القاعات</a></nav>
        <ThemeToggle />
      </footer>
    </>
  );
}
