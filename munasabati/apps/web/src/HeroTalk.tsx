import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, LogoMark } from "@munasabati/ui";

/* ═══════════ «منسقتك تكلمك»: مقدمة الواجهة ═══════════
   شخصية مناسبتي تسولف مع الزائر بلهجتنا: كلام يطلع كلمة كلمة مثل الكلام، وموجة صوت تتحرك،
   وصوت «سوالف» اختياري (مولّد بالمتصفح). بعدها تسلّمه لمعالج الميزانية. تشتغل مرة بالجلسة. */

const LINES: { t: string; hold?: number; big?: boolean }[] = [
  { t: "هلا والله 👋", big: true },
  { t: "عندك مناسبة… وضايع بين القاعات والموردين والقروبات؟" },
  { t: "لا تشيل هم." , big: true },
  { t: "أنا منسقتك في مناسبتي." },
  { t: "قل لي ميزانيتك بس…" },
  { t: "وأختار لك ٣ قاعات تناسبك خلال ٢٤ ساعة." },
  { t: "وأرتب الكوشة والتصوير والضيافة والدعوات… من الألف للياء." },
  { t: "وتدفع نفس السعر، ولا ريال زيادة." , big: true },
  { t: "يلا نبدأ؟ 🤍", big: true, hold: 900 },
];
const WORD_MS = 210, GAP_MS = 850;

/** صوت «سوالف» ناعم: نغمات قصيرة مع كل كلمة (بدون أي تسجيل صوتي) */
function useBlips() {
  const ac = useRef<AudioContext | null>(null);
  const on = useRef(false);
  const enable = () => { on.current = true; if (!ac.current) ac.current = new AudioContext(); void ac.current.resume(); };
  const disable = () => { on.current = false; };
  const blip = (k: number) => {
    const c = ac.current; if (!on.current || !c) return;
    const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    const base = [523, 587, 659, 698, 784][k % 5] * (0.92 + Math.random() * 0.16);
    o.type = "triangle"; o.frequency.setValueAtTime(base, c.currentTime); o.frequency.exponentialRampToValueAtTime(base * 0.86, c.currentTime + .09);
    f.type = "lowpass"; f.frequency.value = 2200;
    g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(.06, c.currentTime + .012); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + .11);
    o.connect(f).connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + .13);
  };
  return { enable, disable, blip, isOn: () => on.current };
}

export function HeroTalk({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(0);
  const [words, setWords] = useState(0);
  const [sound, setSound] = useState(false);
  const [talking, setTalking] = useState(true);
  const b = useBlips();
  const done = useRef(false);
  const finish = () => { if (done.current) return; done.current = true; try { sessionStorage.setItem("mns-talk", "1"); } catch { /* */ } onDone(); };

  useEffect(() => {
    const cur = LINES[line]; if (!cur) { finish(); return; }
    const n = cur.t.split(" ").length;
    if (words < n) { setTalking(true); const id = setTimeout(() => { setWords((w) => w + 1); b.blip(words + line); }, words === 0 ? 120 : WORD_MS); return () => clearTimeout(id); }
    setTalking(false);
    const id = setTimeout(() => { if (line + 1 >= LINES.length) finish(); else { setLine(line + 1); setWords(0); } }, GAP_MS + (cur.hold ?? 0) + n * 40);
    return () => clearTimeout(id);
  }, [line, words]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = LINES[Math.min(line, LINES.length - 1)];
  const shown = cur.t.split(" ");
  const toggle = () => { if (sound) { b.disable(); setSound(false); } else { b.enable(); setSound(true); } };

  return (
    <motion.div className="talk" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <div className="talk-who">
        <span className={"talk-avatar" + (talking ? " on" : "")}><LogoMark size={46} animated /><i /><i /></span>
        <div><b>منسقتك من مناسبتي</b><span className="talk-wave" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6].map((k) => <i key={k} className={talking ? "on" : ""} style={{ animationDelay: `${k * 0.09}s` }} />)}</span></div>
      </div>
      <div className="talk-stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p key={line} className={"talk-line" + (cur.big ? " big" : "")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -14, filter: "blur(8px)" }} transition={{ duration: 0.35 }}>
            {shown.map((w, i) => (
              <span key={i}><motion.span initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={i < words ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(6px)" }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>{i < shown.length - 1 ? " " : ""}</span>
            ))}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="talk-foot">
        <div className="talk-prog" aria-hidden="true">{LINES.map((_, i) => <i key={i} className={i < line ? "done" : i === line ? "now" : ""} />)}</div>
        <button className="talk-btn" onClick={toggle} aria-pressed={sound} aria-label={sound ? "اكتم الصوت" : "شغّل الصوت"}><Icon name={sound ? "Volume2" : "VolumeX"} size={16} />{sound ? "الصوت شغال" : "شغّل الصوت"}</button>
        <button className="talk-btn" onClick={finish}>تخطي <Icon name="ArrowLeft" size={15} /></button>
      </div>
    </motion.div>
  );
}

/** هل نعرض المقدمة؟ (مرة بالجلسة، وما نعرضها مع تقليل الحركة) */
export const shouldTalk = () => {
  try { if (sessionStorage.getItem("mns-talk")) return false; } catch { /* */ }
  return typeof matchMedia === "undefined" || !matchMedia("(prefers-reduced-motion: reduce)").matches;
};
