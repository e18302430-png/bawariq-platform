import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ═══════════ مؤثرات الدعوة السينمائية: مقدمة فيلم، غبار ذهبي، بتلات، موسيقى مولّدة، صوت الختم، قلوب ═══════════
   كل الأصوات مولّدة بالمتصفح (Web Audio)، فلا ملفات صوت ولا حقوق. وتحترم «تقليل الحركة» في الجوال. */

export const reducedMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───── الصوت ───── */
let ctx: AudioContext | null = null;
const audio = () => {
  if (!ctx) { const A = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; if (!A) return null; ctx = new A(); }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};
const hz = (n: number) => 440 * 2 ** ((n - 69) / 12);
function bell(a: AudioContext, out: AudioNode, n: number, at: number, gain = 0.18, len = 2.6) {
  [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([m, g]) => {
    const o = a.createOscillator(), v = a.createGain();
    o.type = "sine"; o.frequency.value = hz(n) * m;
    v.gain.setValueAtTime(0, at); v.gain.linearRampToValueAtTime(gain * g, at + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, at + len / (1 + m * 0.4));
    o.connect(v).connect(out); o.start(at); o.stop(at + len);
  });
}
/** صوت كسر الختم: نقرة شمع ثم أجراس صاعدة */
export function playSeal() {
  const a = audio(); if (!a) return;
  const t = a.currentTime, out = a.createGain(); out.gain.value = 0.9; out.connect(a.destination);
  const buf = a.createBuffer(1, a.sampleRate * 0.12, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (a.sampleRate * 0.012));
  const src = a.createBufferSource(), f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1800;
  src.buffer = buf; src.connect(f).connect(out); src.start(t);
  [81, 85, 88, 93].forEach((n, i) => bell(a, out, n, t + 0.18 + i * 0.13, 0.14));
}
/** نغمة فرح عند «بحضر» */
export function playYes() {
  const a = audio(); if (!a) return;
  const t = a.currentTime, out = a.createGain(); out.gain.value = 0.8; out.connect(a.destination);
  [76, 81, 85, 88, 93].forEach((n, i) => bell(a, out, n, t + i * 0.09, 0.12, 2));
}

/** موسيقى رومانسية هادية تتولد باستمرار: وسادة أوتار + بيانو أربيجيو على تسلسل كوردات */
export function useAmbient() {
  const [on, setOn] = useState(false);
  const st = useRef<{ out: GainNode; timer: number; next: number; step: number } | null>(null);
  useEffect(() => () => stop(), []);
  const CH = [[57, 61, 64, 69], [54, 57, 61, 66], [50, 54, 57, 62], [52, 56, 59, 64]];
  function schedule() {
    const a = ctx, s = st.current; if (!a || !s) return;
    while (s.next < a.currentTime + 1.2) {
      const bar = Math.floor(s.step / 8) % CH.length, k = s.step % 8, ch = CH[bar], at = s.next;
      if (k === 0) ch.forEach((n) => { // وسادة
        const o = a.createOscillator(), v = a.createGain(), f = a.createBiquadFilter();
        o.type = "sawtooth"; o.frequency.value = hz(n - 12); f.type = "lowpass"; f.frequency.value = 900;
        v.gain.setValueAtTime(0, at); v.gain.linearRampToValueAtTime(0.018, at + 1.2); v.gain.linearRampToValueAtTime(0, at + 4.2);
        o.connect(f).connect(v).connect(s.out); o.start(at); o.stop(at + 4.3);
      });
      const n = [ch[0], ch[1], ch[2], ch[3], ch[2] + 12, ch[3], ch[2], ch[1]][k];
      bell(a, s.out, n + 12, at, k === 0 ? 0.06 : 0.04, 2.4);
      s.next += 0.5; s.step++;
    }
  }
  function start() {
    const a = audio(); if (!a || st.current) return;
    const out = a.createGain(); out.gain.setValueAtTime(0, a.currentTime); out.gain.linearRampToValueAtTime(0.9, a.currentTime + 2);
    const dl = a.createDelay(); dl.delayTime.value = 0.33; const fb = a.createGain(); fb.gain.value = 0.28;
    out.connect(a.destination); out.connect(dl); dl.connect(fb).connect(dl); dl.connect(a.destination);
    st.current = { out, timer: window.setInterval(schedule, 300), next: a.currentTime + 0.1, step: 0 };
    schedule(); setOn(true);
  }
  function stop() {
    const s = st.current; if (!s) return; clearInterval(s.timer);
    if (ctx) { s.out.gain.cancelScheduledValues(ctx.currentTime); s.out.gain.setTargetAtTime(0, ctx.currentTime, 0.4); }
    st.current = null; setOn(false);
  }
  return { on, start, stop, toggle: () => (st.current ? stop() : start()) };
}

/* ───── غبار ذهبي (للمقدمة) وبتلات ورد (لصفحة الدعوة) ───── */
export function Particles({ kind, density = 1 }: { kind: "dust" | "petals"; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (reducedMotion()) return;
    const c = ref.current!, x = c.getContext("2d")!; let raf = 0, w = 0, h = 0;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener("resize", size);
    const N = Math.round((kind === "dust" ? 46 : 18) * density);
    const ps = Array.from({ length: N }, (_, i) => ({ x: Math.random(), y: Math.random(), s: Math.random(), r: Math.random() * 6, v: 0.3 + Math.random() * 0.7, i }));
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = (now - t0) / 1000; x.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (kind === "dust") {
          const px = (p.x * w + Math.sin(t * 0.4 + p.i) * 24) % w, py = (((p.y - t * 0.02 * p.v) % 1) + 1) % 1 * h, r = 0.6 + p.s * 1.6;
          const a = 0.25 + 0.6 * Math.abs(Math.sin(t * (0.6 + p.v) + p.i));
          const g = x.createRadialGradient(px, py, 0, px, py, r * 5); g.addColorStop(0, `rgba(255,228,170,${a})`); g.addColorStop(1, "rgba(255,228,170,0)");
          x.fillStyle = g; x.beginPath(); x.arc(px, py, r * 5, 0, 7); x.fill();
        } else {
          const px = p.x * w + Math.sin(t * 0.7 + p.i) * 40, py = (((p.y + t * 0.035 * p.v) % 1.1) - 0.05) * h, s = 7 + p.s * 9;
          x.save(); x.translate(px, py); x.rotate(t * (0.5 + p.v) + p.r); x.scale(1, 0.5 + 0.5 * Math.sin(t * 2 + p.i));
          x.globalAlpha = 0.55; x.fillStyle = p.i % 3 ? "#f4b8c5" : "#fbe3e8";
          x.beginPath(); x.ellipse(0, 0, s, s * 0.6, 0, 0, 7); x.fill(); x.restore();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, [kind, density]);
  return <canvas ref={ref} className={"fx-" + kind} aria-hidden="true" />;
}

/* ───── مقدمة الفيلم: سطور تظهر وحدة وحدة على أسود بإطار سينمائي، ثم الظرف ───── */
export function FilmIntro({ lines, names, onDone }: { lines: string[]; names: string; onDone: () => void }) {
  const [i, setI] = useState(0);
  const total = lines.length + 1;
  useEffect(() => {
    if (reducedMotion()) { onDone(); return; }
    if (i >= total) { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }
    const t = setTimeout(() => setI((v) => v + 1), i === 0 ? 900 : 2100);
    return () => clearTimeout(t);
  }, [i, total, onDone]);
  const cur = i - 1;
  return (
    <motion.div className="film" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.9 } }} onClick={onDone} role="button" aria-label="تخطي المقدمة" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onDone()}>
      <Particles kind="dust" />
      <motion.i className="film-bar t" initial={{ y: "-100%" }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
      <motion.i className="film-bar b" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
      <div className="film-stage">
        <AnimatePresence mode="wait">
          {cur >= 0 && cur < lines.length && (
            <motion.p key={cur} className="film-line" initial={{ opacity: 0, y: 18, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -12, filter: "blur(8px)" }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>{lines[cur]}</motion.p>
          )}
          {cur >= lines.length && (
            <motion.div key="names" className="film-names" initial={{ opacity: 0, scale: 1.12, filter: "blur(14px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}>
              <span>{names}</span><i aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="film-skip">اضغط للتخطي</span>
    </motion.div>
  );
}

/* ───── انفجار شرار ذهبي من الختم ───── */
export function SealBurst({ fire }: { fire: number }) {
  if (!fire) return null;
  return (
    <div className="seal-burst" key={fire} aria-hidden="true">
      {Array.from({ length: 26 }, (_, i) => { const a = (i / 26) * Math.PI * 2, d = 90 + (i % 5) * 28; return <motion.i key={i} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, scale: 0.3 }} transition={{ duration: 0.9 + (i % 3) * 0.2, ease: "easeOut" }} />; })}
    </div>
  );
}

/* ───── قلوب تطلع عند «بحضر» ───── */
export function Hearts({ fire }: { fire: number }) {
  if (!fire) return null;
  return (
    <div className="hearts" key={fire} aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <motion.span key={i} style={{ left: `${(i * 41) % 100}%`, fontSize: 14 + (i % 4) * 7 }} initial={{ y: 0, opacity: 0, scale: 0.4 }} animate={{ y: -420 - (i % 5) * 60, opacity: [0, 1, 1, 0], scale: 1, x: (i % 2 ? 1 : -1) * (10 + (i % 6) * 8) }} transition={{ duration: 2 + (i % 4) * 0.3, delay: (i % 7) * 0.06, ease: "easeOut" }}>♥</motion.span>
      ))}
    </div>
  );
}
