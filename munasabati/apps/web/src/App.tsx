import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { INVITE_TIERS, OCCASIONS, type Occasion } from "@munasabati/core";
import { BRAND, Icon, Logo, LogoMark, Reveal, ScrollNav, ThemeToggle, photoUrl } from "@munasabati/ui";
import { LiveFilm } from "./LiveFilm";
import { Concierge } from "./Concierge";
import { CinemaFX } from "./CinemaFX";
import { HeroTalk, shouldTalk } from "./HeroTalk";
import { REELS, Reels, ReelViewer, VENUE_REEL } from "./Reels";
import wcDiriyah from "./assets/film/watercolor-diriyah.webp";
import stillDesert from "./assets/film/f5-desert.webp";

// كل بوابة تطبيق مستقل يُنشر منفصلاً. الروابط قابلة للتغيير عند النشر على نطاقات مختلفة.
const LINKS = {
  client: import.meta.env.VITE_CLIENT_URL ?? "client/index.html",
  vendors: import.meta.env.VITE_VENDORS_URL ?? "vendors/index.html",
  venues: import.meta.env.VITE_VENUES_URL ?? "venues/index.html",
};

const HERO_WORD: Record<string, string> = { wedding: "زواجك", milka: "ملكتك", grad: "تخرّجك", aqiqa: "عقيقتك", family: "لمّتكم", corp: "حفل شركتك", birthday: "عيد ميلادك" };
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
      {[["قصر الندى", "الخبر · قسم رجال ونساء", "v1"], ["دار اللؤلؤ", "الخبر · قاعتان", "v3"]].map(([n, m, k]) => (
        <div key={n as string} className="ms-card" style={{ padding: 0, overflow: "hidden" }}>
          <img src={photoUrl(`media:${k}`, true)} alt="" style={{ height: 82, width: "100%", objectFit: "cover", display: "block", borderBottom: `3px solid ${occ.palette[1]}` }} />
          <div style={{ padding: 10 }}><div className="row between"><b className="display" style={{ fontSize: 13 }}>{n}</b><span className="brand" style={{ fontWeight: 600, fontSize: 10.5, display: "inline-flex", gap: 3, alignItems: "center" }}><Icon name="BadgeCheck" size={12} /> موثّق</span></div><div className="row between faint" style={{ fontSize: 11 }}><span>{m}</span><span style={{ color: "var(--ink)", fontWeight: 600 }}>السعر عند الطلب</span></div></div>
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
          <span className="ai-tag">صورة مولّدة بالذكاء الاصطناعي</span>
          <div className="b-seal"><span>ع</span></div>
          <div className="b-text"><b>دعوة تنفتح بيد ضيفك</b><span>ظرف بلوحة مائية وختم شمع ذهبي، يفتحه ضيفك بلمسة ويقول: «وش هالفخامة!»</span></div>
        </Reveal>
        <Reveal className="b-card b-scratch" delay={0.05}>
          <div className="b-foil"><span>اكشط لتعرف الموعد ✦</span></div>
          <div className="b-text"><b>اكشط وشوف الموعد</b><span>طبقة ذهبية يكشطها الضيف بصبعه، وتطلع القصاصات تحتفل معه.</span></div>
        </Reveal>
        <Reveal className="b-card b-scan" delay={0.1}>
          <div className="b-scanbox"><i /><i /><i /><i /><motion.span className="b-laser" animate={{ top: ["14%", "84%", "14%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} /></div>
          <div className="b-text"><b>الدخول بالكاميرا</b><span>المنسق يمسح رمز الضيف بالجوال، ويعرف قسمه وكم معه، بدون زحمة عند الباب.</span></div>
        </Reveal>
        <Reveal className="b-card b-chat" delay={0.05}>
          <div className="b-bubbles">
            <span className="in">هل يتوفر بث مباشر لقسم النساء؟</span>
            <span className="out">أكيد، نضيفه للباقة ونرسل لك العرض الآن.</span>
            <span className="in">ممتاز، بانتظاركم 🤍</span>
          </div>
          <div className="b-text"><b>كل مورد له محادثته</b><span>لا ضياع بين الأرقام والقروبات. كل طلب وكلامه في مكان واحد.</span></div>
        </Reveal>
        <Reveal className="b-card b-journey" delay={0.1}>
          <ol className="b-steps">{["الخطة", "القاعة", "التجهيزات", "الدعوات", "يوم المناسبة"].map((t, i) => <li key={t} className={i < 2 ? "done" : i === 2 ? "now" : ""}><i>{i < 2 ? "✓" : i + 1}</i>{t}</li>)}</ol>
          <div className="b-text"><b>خمس خطوات وبس</b><span>كل مرة خطوة وحدة واضحة قدامك. ما تحتار وش تسوي بعدين.</span></div>
        </Reveal>
        <Reveal className="b-card b-film" delay={0.15}>
          <img src={stillDesert} alt="" loading="lazy" />
          <span className="ai-tag">صورة مولّدة بالذكاء الاصطناعي</span>
          <div className="b-text"><b>كل مناسبة لها طابعها</b><span>زواج، ملكة، تخرّج، عقيقة، أو لمّة أهل. الشكل يتغير على حسب مناسبتك.</span></div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───── البداية السريعة: المناسبة والتاريخ والضيوف والمدينة، وتدخل التطبيق والإجابات جاهزة ───── */
const sarFmt = (n: number) => Math.round(n).toLocaleString("en-US");
function Partners() {
  const [kind, setKind] = useState<"venue" | "vendor">("venue");
  const isV = kind === "venue";
  const [price, setPrice] = useState(25000);
  const [extra, setExtra] = useState(3);
  useEffect(() => { setPrice(isV ? 25000 : 6000); setExtra(isV ? 3 : 4); }, [isV]);
  const pct = isV ? 3 : 10;
  const [reel, setReel] = useState(false);
  const month = price * extra, cost = Math.round((month * pct) / 100), year = (month - cost) * 12;
  const FACTS: [string, string, string][] = [
    ["BadgePercent", "صفر اشتراك وصفر رسوم مقدمة", `تدفع نسبة بسيطة (${isV ? "٣٪ للقاعات" : "١٠٪ للموردين"}) على الحجز اللي يتأكد بس. ما جاك حجز؟ ما تدفع شي.`],
    ["UserCheck", "عميل جاد ومؤكد", "ما يوصلك رقم العميل إلا بعد ما يقفل موعده ويدفع رسوم التأكيد."],
    ["CalendarCheck", "أيامك الفاضية تتعبى", "نوصّلك طلبات بالتاريخ والميزانية وعدد الضيوف، وأنت تختار."],
    ["FileSignature", "عقد إلكتروني وفاتورة", "كل حجز له عقد موقّع وشهادة، فما فيه خلاف ولا ضياع."],
  ];
  return (
    <section className="sec container partners" id="partners">
      <Reveal className="sec-head">
        <span className="eyebrow">للقاعات والموردين</span>
        <h2>نجيب لك العميل… <span className="grad-text">وتدفع بس لما تكسب</span></h2>
        <p>ما فيه اشتراك ولا رسوم تسجيل. نوصّلك عملاء جاهزين بميزانيتهم، ونستلم نسبتنا بس لما يتأكد الحجز: <b>٣٪ للقاعات</b> و<b>١٠٪ للموردين</b>، تنخصم من سعرك والعميل ما يدفع زيادة.</p>
      </Reveal>
      <div className="pt-grid">
        <div className="pt-facts">{FACTS.map(([ic, t, d], i) => <Reveal key={t} delay={i * 0.05} className="pt-fact"><span><Icon name={ic} size={20} /></span><div><b>{t}</b><small>{d}</small></div></Reveal>)}</div>
        <Reveal className="pt-calc" delay={0.1}>
          <div className="pt-tabs" role="tablist">
            <button role="tab" aria-selected={isV} className={isV ? "on" : ""} onClick={() => setKind("venue")}><Icon name="Building2" size={16} /> عندي قاعة</button>
            <button role="tab" aria-selected={!isV} className={!isV ? "on" : ""} onClick={() => setKind("vendor")}><Icon name="Store" size={16} /> أنا مورّد</button>
          </div>
          <label className="pt-row"><span>{isV ? "سعر ليلتك" : "متوسط سعر الحجز"}</span><b className="num">{sarFmt(price)} ر.س</b>
            <input type="range" min={isV ? 5000 : 1000} max={isV ? 120000 : 40000} step={isV ? 1000 : 500} value={price} onChange={(e) => setPrice(+e.target.value)} aria-label="السعر" /></label>
          <label className="pt-row"><span>{isV ? "ليالي فاضية نعبيها لك بالشهر" : "حجوزات زيادة بالشهر"}</span><b className="num">{extra}</b>
            <input type="range" min={1} max={isV ? 12 : 20} step={1} value={extra} onChange={(e) => setExtra(+e.target.value)} aria-label="العدد" /></label>
          <div className="pt-out">
            <div><small>حجوزات إضافية بالشهر</small><b className="num">{sarFmt(month)}</b><i>ر.س</i></div>
            <div className="big"><small>صافي لك بالسنة بعد نسبتنا</small><b className="num">{sarFmt(year)}</b><i>ر.س</i></div>
          </div>
          <div className="pt-cut"><span>نسبة مناسبتي بالشهر ({pct}٪ من الحجوزات المؤكدة فقط)</span><b className="num">{sarFmt(cost)} ر.س</b></div>
          <small className="pt-note">حسبة توضيحية من أرقامك. النسبة على الحجوزات اللي جبناها لك وتأكدت فقط.</small>
          {isV && <button type="button" className="btn ghost block" onClick={() => setReel(true)}><Icon name="PlayCircle" size={17} /> شاهد فيديو القاعات (٣٠ ثانية)</button>}
          <a className="btn primary lg block" href={isV ? LINKS.venues : LINKS.vendors}>{isV ? "سجّل قاعتك مجاناً" : "سجّل كمورد مجاناً"} <Icon name="ArrowLeft" size={17} /></a>
        </Reveal>
      </div>
      <AnimatePresence>{reel && <ReelViewer list={[VENUE_REEL]} start={0} onClose={() => setReel(false)} />}</AnimatePresence>
    </section>
  );
}

/* ───── الواجهة الرئيسية ───── */
/** الصفحة مطبوعة مسبقاً في HTML؟ إذن لا نعيد حركات الدخول (يستلمها React كما هي بدون وميض) */
const SSG = typeof document !== "undefined" && !!document.getElementById("root")?.firstElementChild;

function Hero({ occ, onPick }: { occ: Occasion; onPick: (o: Occasion) => void }) {
  const [film, setFilm] = useState(false);
  const [talk, setTalk] = useState(false);
  useEffect(() => { if (shouldTalk()) setTalk(true); }, []);
  // الصورة الأولى تظهر فوراً من HTML، ثم يبدأ الفيلم الحي فوقها
  const onFilmReady = () => { const boot = document.getElementById("boot-hero"); if (boot) { boot.style.transition = "opacity .6s"; boot.style.opacity = "0"; setTimeout(() => boot.remove(), 700); } };
  const doors: [string, string, string, string][] = [
    [LINKS.client, "Heart", "عندي مناسبة", "خطط واحجز وأرسل الدعوات"],
    [LINKS.vendors, "Store", "أنا مورّد", "كوشة، تصوير، ضيافة، صوت…"],
    [LINKS.venues, "Building2", "عندي قاعة", "أدر الحجوزات والأسعار"],
  ];
  return (
    <div className="hero-frame" id="top">
      <section className={"hero" + (talk ? " is-talking" : "")}>
        <div className="hero-video-box"><LiveFilm onReady={onFilmReady} /></div>
        <div className="hero-shade" />
        <nav className="hero-nav" aria-label="التنقل">
          <div className="logo"><Logo size={28} light animated /></div>
          <div className="links"><a href="#how">كيف نشتغل</a><a href="#invites">الدعوات</a><a href="#partners">للقاعات والموردين</a></div>
          <div style={{ flex: 1 }} />
          <a className="btn glass sm" href={LINKS.client}>ادخل التطبيق</a>
        </nav>
        <div className="hero-body">
          <span className="live"><i /> {BRAND.goal}</span>
          <AnimatePresence mode="wait" initial={false}>{talk ? <HeroTalk key="talk" onDone={() => setTalk(false)} /> : <motion.div key="main" className="hero-main" initial={SSG ? false : { opacity: 0, y: 24, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <h1>
            <span className="word-slot">
              <AnimatePresence mode="wait" initial={!SSG}>
                <motion.span key={occ.id} initial={{ opacity: 0, y: 30, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -24, filter: "blur(10px)" }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>{HERO_WORD[occ.id]}،</motion.span>
              </AnimatePresence>
            </span>
            <br />علينا من الألف للياء.
          </h1>
          <p className="lead">قل لنا ميزانيتك بس. منسقتك تختار لك القاعة وتنسق كل شي ضمنها، وأنت تدفع نفس السعر بدون أي زيادة.</p>
          <Concierge onOcc={(id) => { const o = OCCASIONS.find((x) => x.id === id); if (o) onPick(o); }} />
          </motion.div>}</AnimatePresence>
          <div className="hero-mini">
            {!talk && <button className="hero-link talk-replay" onClick={() => setTalk(true)}><Icon name="MessageCircle" size={15} /> اسمع منسقتك من جديد</button>}
            <button className="play-film" onClick={() => setFilm(true)}><span><Icon name="Play" size={16} fill="currentColor" /></span>شاهد الفيلم</button>
            {doors.slice(1).map(([href, ic, t]) => <a key={t} href={href} className="hero-link"><Icon name={ic} size={15} /> {t}</a>)}
            <a href={LINKS.client} className="hero-link"><Icon name="LogIn" size={15} /> عندي حساب</a>
          </div>
        </div>
      </section>
      <AnimatePresence>{film && <ReelViewer list={REELS} start={0} onClose={() => setFilm(false)} />}</AnimatePresence>
    </div>
  );
}

/** شريط التوقيع: هوية فاخرة بالأسود والذهبي مباشرة بعد الفيلم */
const SIG_WORDS = ["زواج", "ملكة", "تخرج", "عقيقة", "اجتماع عائلي", "حفل شركة", "كوشة", "تصوير", "ضيافة", "صوت وإضاءة", "بث مباشر", "خيام", "استيدج"];
const PROMISES: [string, string, string][] = [
  ["ShieldCheck", "كلهم موثّقين", "كل قاعة ومورد نراجعه بأنفسنا قبل ما يطلع لك"],
  ["MessagesSquare", "منسقتك معك", "هي اللي تكلم القاعة والموردين عنك، وتحفظ حقك"],
  ["Wallet", "ميزانيتك أنت تحددها", "تقولها مرة وحدة، ونمشي عليها في كل شي"],
  ["Sparkles", "ولا ريال زيادة عليك", "تدفع سعر القاعة والمورد نفسه، وموعدك مقفول بعقد"],
];
function Signature() {
  return (
    <section className="sig" aria-label="لماذا مناسبتي">
      <div className="sig-marquee" aria-hidden="true"><div>{[...SIG_WORDS, ...SIG_WORDS].map((w, i) => <span key={i}>{w}<i>✦</i></span>)}</div></div>
      <div className="container sig-grid">
        {PROMISES.map(([ic, t, d], i) => (
          <Reveal key={t} delay={i * 0.06} className="sig-item">
            <span className="sig-ico"><Icon name={ic} size={20} /></span>
            <b>{t}</b><small>{d}</small>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Invites() {
  return (
    <section className="sec container" id="invites">
      <Reveal className="sec-head">
        <span className="eyebrow">الدعوات</span>
        <h2>دعوة سينمائية… <span className="grad-text">بسعر فنجان قهوة</span></h2>
        <p>ظرف يفتحه ضيفك بلمسة، ورد بضغطة، ورمز دخول عند الباب. مجانية لين ١٠٠ ضيف، وبعدها بأسعار رمزية.</p>
      </Reveal>
      <div className="inv-tiers">{INVITE_TIERS.map((t, i) => (
        <Reveal key={t.id} delay={i * 0.06} className={"inv-tier" + (t.id === "plus" ? " hot" : "")}>
          {t.id === "plus" && <span className="inv-tag">الأكثر اختياراً</span>}
          <b>{t.name}</b>
          <div className="inv-price">{t.price ? <><span className="num">{t.price}</span><small>ريال · مرة وحدة</small></> : <span>مجاناً</span>}</div>
          <ul>{t.perks.map((p) => <li key={p}><Icon name="Check" size={15} />{p}</li>)}</ul>
        </Reveal>
      ))}</div>
    </section>
  );
}

const STEPS = [
  { t: "قل لنا ميزانيتك", d: "المناسبة وعدد الضيوف والميزانية. دقيقة وحدة، بدون ما تدوّر بين عشرات القاعات.", s: (o: Occasion) => <MiniPlan occ={o} /> },
  { t: "نختار لك ٣ قاعات", d: "منسقتك تختار ٣ خيارات ضمن ميزانيتك، بالصور والجولة ٣٦٠. تزورها أنت والأهل وتختارون براحتكم.", s: (o: Occasion) => <MiniMarket occ={o} /> },
  { t: "ننسق كل التجهيزات", d: "الكوشة والتصوير والضيافة والصوت. نتفاوض نيابة عنك، وكل شي بعقد واضح وبنفس سعر التاجر.", s: () => <MiniPrep /> },
  { t: "دعوات شبه مجانية", d: "لكل ضيف رابط دعوة خاص على الواتساب. يرد بضغطة، ويوصله رمز دخول خاص فيه.", s: (o: Occasion) => <MiniInvite occ={o} /> },
  { t: "ليلتك… ونحن معك", d: "منسق مناسبتي يتابع الموردين ليلة الحفل، ويستقبل ضيوفك بالاسم عند الباب.", s: () => <MiniDoor /> },
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
    <section className="sec container" id="how">
      <Reveal className="sec-head"><span className="eyebrow">كيف نشتغل</span><h2>أنت تحتفل… <span className="grad-text">واحنا نشتغل</span></h2><p>من أول رسالة لين آخر ضيف يطلع من القاعة، منسقة وحدة تعرف كل تفاصيل مناسبتك.</p></Reveal>
      <div className="story">
        <div className="story-steps">
          {STEPS.map((s, i) => (
            <div key={s.t} ref={(el) => { refs.current[i] = el; }} data-i={i} className={"story-step" + (active === i ? " on" : "")}>
              <span className="n num">{i + 1} / 5</span>
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
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    if (locked) return;
    const t = setInterval(() => setOcc((o) => OCCASIONS[(OCCASIONS.indexOf(o) + 1) % OCCASIONS.length]), 4200);
    return () => clearInterval(t);
  }, [locked]);

  return (
    <>
      <CinemaFX />
      <Hero occ={occ} onPick={(o) => { setOcc(o); setLocked(true); }} />
      <Signature />
      <Reels />
      <Story occ={occ} />
      <Features />
      <Invites />
      <Partners />
      <section className="container" style={{ paddingBottom: 20 }}>
        <Reveal className="final lux">
          <div className="lux-seal" aria-hidden="true"><LogoMark size={64} animated /></div>
          <span className="lux-eyebrow">✦ بدون أي رسوم زيادة عليك ✦</span>
          <h2>جاهز؟<br /><span className="gold-text">خلّنا نبدأ فرحتك.</span></h2>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <a className="btn lg lux-btn" href="#top">قل لنا ميزانيتك <Icon name="ArrowLeft" size={18} /></a>
            <a className="btn glass lg" href={LINKS.venues}>سجّل قاعتك</a>
          </div>
        </Reveal>
      </section>
      <ScrollNav bottom="24px" />
      <footer className="container footer">
        <div className="row"><Logo size={24} /><span>{BRAND.goal}</span></div>
        <LegalFooter />
        <small className="faint" style={{ display: "block", fontSize: 12.5 }}>الصور والفيلم التوضيحية في هذه الصفحة مولّدة بالذكاء الاصطناعي، وما تمثل قاعة أو مورد حقيقي.</small>
        <nav><a href={LINKS.client}>تطبيق العميل</a><a href={LINKS.vendors}>بوابة الموردين</a><a href={LINKS.venues}>بوابة القاعات</a><a href="./terms.html">الشروط والأحكام</a><a href="./privacy.html">الخصوصية</a><a href="./cancellation.html">سياسة الإلغاء</a><a href="./about.html">من نحن</a></nav>
        <ThemeToggle />
      </footer>
    </>
  );
}

/** بيانات المنشأة النظامية من إعدادات الإدارة (قراءة عامة، بدون تحميل بقية البيانات) */
function LegalFooter() {
  const [line, setLine] = useState("");
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined, key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) return;
    fetch(`${url}/rest/v1/settings?key=eq.legal&select=value`, { headers: { apikey: key } }).then((r) => r.json()).then((rows: { value: string }[]) => {
      const l = rows?.[0] && JSON.parse(rows[0].value);
      if (l?.entity) setLine([l.entity, l.cr && `سجل تجاري ${l.cr}`, l.vat && `الرقم الضريبي ${l.vat}`, l.ecom && `موثّق في المركز السعودي للأعمال ${l.ecom}`, l.address, l.email, l.phone].filter(Boolean).join(" · "));
    }).catch(() => {});
  }, []);
  return line ? <small className="legal-line" style={{ display: "block" }}>{line}</small> : null;
}
