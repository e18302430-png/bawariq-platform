import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Icon, LogoMark } from "@munasabati/ui";
import { arabicVoice, speak, stopSpeech } from "./voice";

/* ═══════════ «منسقتك تكلمك»: مقدمة الواجهة ═══════════
   تتكلم بصوت عربي حقيقي من جوال الزائر (Web Speech، مجاني)، والكلمات تظهر مع الكلام،
   وتحتها فراش موسيقي هادي. لو الجهاز ما فيه صوت عربي: خط زمني ثابت مع موسيقى متزامنة (talk.m4a).
   الصوت ينفتح بلمسة ختم الباب. الرسم يتحدث فقط لما تتغير كلمة أو جملة (خفيف على الجوال). */

type Line = { at: number; t: string; big?: boolean };
const LINES: Line[] = [
  { at: 0.4, t: "هلا والله 👋", big: true },
  { at: 2.6, t: "عندك مناسبة… وضايع بين القاعات والموردين؟" },
  { at: 6.6, t: "لا تشيل هم.", big: true },
  { at: 8.8, t: "أنا منسقتك في مناسبتي." },
  { at: 11.0, t: "قل لي ميزانيتك بس…" },
  { at: 13.4, t: "وأختار لك ٣ قاعات تناسبك خلال ٢٤ ساعة." },
  { at: 16.6, t: "وأرتب الكوشة والتصوير والضيافة والدعوات." },
  { at: 20.4, t: "وتدفع نفس السعر، ولا ريال زيادة.", big: true },
  { at: 23.6, t: "يلا نبدأ؟ 🤍", big: true },
];
const WORD = 0.21, END = 26.0;

declare global { interface Window { __mnsTalk?: HTMLAudioElement; __mnsBed?: HTMLAudioElement; __mnsTalkStarted?: boolean; __mnsGateOpen?: boolean; __mnsMuted?: boolean } }

export function HeroTalk({ onDone }: { onDone: () => void }) {
  const [li, setLi] = useState(-1);
  const [wi, setWi] = useState(0);       // كم كلمة ظاهرة من الجملة الحالية
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const prog = useRef<HTMLElement>(null);
  const done = useRef(false);
  const stops = useRef<(() => void)[]>([]);
  const finish = () => {
    if (done.current) return; done.current = true;
    stops.current.forEach((f) => f()); stopSpeech(); window.__mnsTalk?.pause();
    const bed = window.__mnsBed; if (bed) { const fade = setInterval(() => { bed.volume = Math.max(0, bed.volume - 0.05); if (bed.volume <= 0.01) { bed.pause(); clearInterval(fade); } }, 60); }
    try { sessionStorage.setItem("mns-talk", "1"); } catch { /* */ }
    onDone();
  };

  useEffect(() => {
    let cancelled = false;
    const setProg = (x: number) => { if (prog.current) prog.current.style.width = `${Math.min(1, x) * 100}%`; };

    /** الوضع ١: صوت حقيقي */
    const runVoice = async (v: SpeechSynthesisVoice) => {
      const bed = window.__mnsBed ?? (window.__mnsBed = new Audio("./media/bed.m4a"));
      bed.loop = true; bed.volume = 0.32; window.__mnsTalkStarted = true; void bed.play().catch(() => {});
      for (let i = 0; i < LINES.length && !cancelled; i++) {
        setLi(i); setWi(0); setSpeaking(true); setProg(i / LINES.length);
        const n = LINES[i].t.split(" ").length;
        await new Promise<void>((res) => {
          let shown = 0; const show = (k: number) => { if (k + 1 > shown) { shown = k + 1; setWi(shown); } };
          // كشف احتياطي بالوقت (بعض الأصوات ما تبلّغ عن الكلمات)، والكلام الفعلي يسبقه لو بلّغ
          const tick = window.setInterval(() => show(Math.min(n - 1, shown)), 340);
          const stop = speak(LINES[i].t, v, { onWord: show, onEnd: () => { clearInterval(tick); setWi(n); setSpeaking(false); setTimeout(res, LINES[i].big ? 520 : 380); } });
          stops.current.push(() => { clearInterval(tick); stop(); res(); });
        });
      }
      setProg(1); if (!cancelled) setTimeout(finish, 150);
    };

    /** الوضع ٢: موسيقى متزامنة بخط زمني ثابت */
    const runTrack = () => {
      const a = window.__mnsTalk ?? (window.__mnsTalk = new Audio("./media/talk.m4a"));
      const t0 = performance.now(); let raf = 0, lastL = -2, lastW = -1;
      const clock = () => (!a.paused && a.currentTime > 0 ? a.currentTime : (performance.now() - t0) / 1000);
      window.__mnsTalkStarted = true; a.currentTime = 0; void a.play().catch(() => {
        const g = () => { a.currentTime = Math.max(0, clock()); void a.play().catch(() => {}); };
        addEventListener("pointerdown", g, { once: true }); addEventListener("touchend", g, { once: true });
      });
      const loop = () => {
        const c = clock(); if (c >= END) { finish(); return; }
        const l = LINES.reduce((k, x, i) => (c >= x.at - 0.05 ? i : k), -1);
        const words = l >= 0 ? LINES[l].t.split(" ").length : 0;
        const w = l >= 0 ? Math.min(words, Math.floor((c - LINES[l].at) / WORD) + 1) : 0;
        if (l !== lastL) { lastL = l; setLi(l); }
        if (w !== lastW) { lastW = w; setWi(w); setSpeaking(w < words); }
        setProg(c / END); raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      stops.current.push(() => { cancelAnimationFrame(raf); a.pause(); });
    };

    const start = async () => { const v = await arabicVoice(); if (cancelled) return; if (v) void runVoice(v); else runTrack(); };
    const gate = document.getElementById("gate");
    if (gate && !window.__mnsGateOpen) addEventListener("mns-gate-open", () => setTimeout(() => void start(), 600), { once: true }); else void start();
    return () => { cancelled = true; stops.current.forEach((f) => f()); stopSpeech(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const line = li >= 0 ? LINES[li] : null;
  const words = line ? line.t.split(" ") : [];
  const toggle = () => {
    const m = !muted; setMuted(m); window.__mnsMuted = m;
    [window.__mnsTalk, window.__mnsBed].forEach((a) => { if (a) a.muted = m; });
    if (m) stopSpeech();
  };

  return (
    <motion.div className="talk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} style={{ position: "relative" }}>
      <div className="talk-who">
        <span className={"talk-avatar" + (speaking ? " on" : "")}><LogoMark size={36} animated /><i /></span>
        <span className="talk-name">منسقتك من مناسبتي</span>
        <span className="talk-wave" aria-hidden="true">{Array.from({ length: 7 }, (_, k) => <i key={k} className={speaking ? "on" : ""} style={{ animationDelay: `${(k % 4) * 0.09}s` }} />)}</span>
      </div>
      <p className={"talk-line" + (line?.big ? " big" : "")} aria-live="polite" key={li}>
        {words.map((w, i) => (
          <span key={i} className={"tw" + (i < wi ? " in" : "") + (i === wi - 1 && speaking ? " now" : "")}>{w}{i < words.length - 1 ? " " : ""}</span>
        ))}
      </p>
      <div className="talk-foot">
        <div className="talk-prog" aria-hidden="true"><b ref={prog} /></div>
        <button className="talk-btn" onClick={toggle} aria-pressed={!muted} aria-label={muted ? "شغّل الصوت" : "اكتم الصوت"}><Icon name={muted ? "VolumeX" : "Volume2"} size={16} /></button>
        <button className="talk-btn" onClick={finish}>تخطي <Icon name="ArrowLeft" size={15} /></button>
      </div>
    </motion.div>
  );
}

/** نعرض المقدمة مرة بالجلسة، وما نعرضها مع «تقليل الحركة» */
export const shouldTalk = () => {
  try { if (sessionStorage.getItem("mns-talk")) return false; } catch { /* */ }
  return typeof matchMedia === "undefined" || !matchMedia("(prefers-reduced-motion: reduce)").matches;
};
