import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, Reveal } from "@munasabati/ui";

/* ═══════════ أفلام مناسبتي: شريط ريلز عمودي + عارض قصص بملء الشاشة ═══════════
   المعاينة صامتة وتشتغل لما تظهر بالشاشة، والضغط يفتح العارض بالصوت (التالي/السابق/إغلاق). */

export type Reel = { id: string; title: string; sub: string; ai: boolean };
export const REELS: Reel[] = [
  { id: "budget", title: "قل لنا ميزانيتك", sub: "مناسبتي في ٣٠ ثانية", ai: true },
  { id: "lailati", title: "ليلتي", sub: "لكل بنت تحلم بليلتها", ai: true },
  { id: "golden-door", title: "ريم والباب الذهبي", sub: "حكاية قبل النوم", ai: true },
  { id: "mukhtafi", title: "مختفي", sub: "قصة بحبكة ما تتوقعها", ai: true },
  { id: "countdown", title: "العد التنازلي", sub: "٢١ يوم… وما حجزت شي؟", ai: true },
  { id: "lights", title: "١٢٠ نور", sub: "فيلم مرسوم بالكود", ai: false },
];
export const VENUE_REEL: Reel = { id: "venues", title: "لأصحاب القاعات", sub: "٣٪ على الحجز المؤكد فقط", ai: false };
const src = (id: string) => `./media/reels/${id}.mp4`, poster = (id: string) => `./media/reels/${id}.webp`;

function Preview({ r, onOpen, i }: { r: Reel; onOpen: () => void; i: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !reduce) { v.preload = "auto"; void v.play().catch(() => {}); } else v.pause(); }, { threshold: 0.6 });
    io.observe(v); return () => io.disconnect();
  }, []);
  return (
    <Reveal delay={i * 0.05} className="reel">
      <button className="reel-btn" onClick={onOpen} aria-label={`شغّل فيلم ${r.title}`}>
        <video ref={ref} src={src(r.id)} poster={poster(r.id)} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
        <span className="reel-shade" />
        {r.ai && <span className="reel-ai">مولّد بالذكاء الاصطناعي</span>}
        <span className="reel-play"><Icon name="Play" size={18} fill="currentColor" /></span>
        <span className="reel-txt"><b>{r.title}</b><small>{r.sub}</small></span>
      </button>
    </Reveal>
  );
}

/** عارض القصص بملء الشاشة */
export function ReelViewer({ list, start, onClose }: { list: Reel[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const [prog, setProg] = useState(0);
  const v = useRef<HTMLVideoElement>(null);
  const r = list[i];
  const next = () => (i < list.length - 1 ? setI(i + 1) : onClose());
  const prev = () => setI(Math.max(0, i - 1));
  useEffect(() => { setProg(0); const el = v.current; if (el) { el.currentTime = 0; void el.play().catch(() => {}); } }, [i]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") next(); if (e.key === "ArrowRight") prev(); };
    addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  });
  return (
    <motion.div className="rv" role="dialog" aria-modal="true" aria-label={`فيلم ${r.title}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="rv-frame">
        <div className="rv-bars" aria-hidden="true">{list.map((x, j) => <i key={x.id}><b style={{ width: `${j < i ? 100 : j === i ? prog * 100 : 0}%` }} /></i>)}</div>
        <div className="rv-head"><b>{r.title}</b>{r.ai && <span className="reel-ai static">مولّد بالذكاء الاصطناعي</span>}<button className="rv-x" onClick={onClose} aria-label="إغلاق"><Icon name="X" size={20} /></button></div>
        <AnimatePresence mode="wait">
          <motion.video key={r.id} ref={v} src={src(r.id)} poster={poster(r.id)} playsInline autoPlay controls={false}
            onTimeUpdate={(e) => setProg(e.currentTarget.currentTime / (e.currentTarget.duration || 1))} onEnded={next}
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }} />
        </AnimatePresence>
        <button className="rv-tap prev" onClick={prev} aria-label="الفيلم السابق" />
        <button className="rv-tap next" onClick={next} aria-label="الفيلم التالي" />
        {i === 0 && list[0].id === "budget" && <a className="btn lg white rv-cta" href="#top" onClick={onClose}>قل لنا ميزانيتك <Icon name="ArrowLeft" size={17} /></a>}
      </div>
    </motion.div>
  );
}

export function Reels() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="sec container" id="films">
      <Reveal className="sec-head"><span className="eyebrow">أفلام مناسبتي</span><h2>شوفها… <span className="grad-text">وحسّ فيها</span></h2><p>أفلام قصيرة صنعناها لك. اضغط على أي فيلم وشغّله بالصوت.</p></Reveal>
      <div className="reels" role="list">{REELS.map((r, i) => <Preview key={r.id} r={r} i={i} onOpen={() => setOpen(i)} />)}</div>
      <AnimatePresence>{open != null && <ReelViewer list={REELS} start={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
