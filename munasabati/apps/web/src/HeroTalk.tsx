import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Icon, LogoMark } from "@munasabati/ui";

/* ═══════════ «منسقتك تكلمك»: مقدمة الواجهة بأسلوب مواقع الجوائز ═══════════
   خط زمني ثابت متزامن مع موسيقى مولّدة بالكود (media/talk.m4a، مصدرها brand/video-talk/make_audio.py).
   الصوت ينفتح بلمسة ختم الباب عند الدخول (المتصفحات تمنع أي صوت قبل أول لمسة)،
   ولو ما فيه باب نشغله مباشرة، وإلا مع أول لمسة على الصفحة. */

type Line = { at: number; t: string; big?: boolean };
const LINES: Line[] = [
  { at: 0.4, t: "هلا والله 👋", big: true },
  { at: 2.6, t: "عندك مناسبة… وضايع بين القاعات والموردين والقروبات؟" },
  { at: 6.6, t: "لا تشيل هم.", big: true },
  { at: 8.8, t: "أنا منسقتك في مناسبتي." },
  { at: 11.0, t: "قل لي ميزانيتك بس…" },
  { at: 13.4, t: "وأختار لك ٣ قاعات تناسبك خلال ٢٤ ساعة." },
  { at: 16.6, t: "وأرتب الكوشة والتصوير والضيافة والدعوات… من الألف للياء." },
  { at: 20.4, t: "وتدفع نفس السعر، ولا ريال زيادة.", big: true },
  { at: 23.6, t: "يلا نبدأ؟ 🤍", big: true },
];
const WORD = 0.21, END = 26.0;

declare global { interface Window { __mnsTalk?: HTMLAudioElement; __mnsTalkStarted?: boolean; __mnsGateOpen?: boolean } }

export function HeroTalk({ onDone }: { onDone: () => void }) {
  const [now, setNow] = useState(-1);
  const [muted, setMuted] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const t0 = useRef(0);
  const done = useRef(false);
  const finish = () => { if (done.current) return; done.current = true; audio.current?.pause(); try { sessionStorage.setItem("mns-talk", "1"); } catch { /* */ } onDone(); };

  useEffect(() => {
    let raf = 0, started = false;
    const a = window.__mnsTalk ?? new Audio("./media/talk.m4a");
    window.__mnsTalk = a; audio.current = a; a.preload = "auto";
    const clock = () => (!a.paused && a.currentTime > 0 ? a.currentTime : (performance.now() - t0.current) / 1000);
    const loop = () => { const c = clock(); setNow(c); if (c >= END) { finish(); return; } raf = requestAnimationFrame(loop); };
    const tryPlay = (from: number) => { a.currentTime = from; window.__mnsTalkStarted = true; return a.play().then(() => true).catch(() => false); };
    const onGesture = () => { const c = (performance.now() - t0.current) / 1000; if (c < END) void tryPlay(c); off(); };
    const off = () => { ["pointerdown", "keydown", "touchend"].forEach((e) => removeEventListener(e, onGesture)); };
    const start = () => {
      if (started) return; started = true; t0.current = performance.now();
      void tryPlay(0).then((ok) => { if (!ok) ["pointerdown", "keydown", "touchend"].forEach((e) => addEventListener(e, onGesture, { once: true })); });
      raf = requestAnimationFrame(loop);
    };
    const gate = document.getElementById("gate");
    if (gate && !window.__mnsGateOpen) addEventListener("mns-gate-open", () => setTimeout(start, 650), { once: true }); else start();
    return () => { cancelAnimationFrame(raf); off(); a.pause(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const li = LINES.reduce((k, l, i) => (now >= l.at - 0.05 ? i : k), -1);
  const line = li >= 0 ? LINES[li] : null;
  const words = line ? line.t.split(" ") : [];
  const nextAt = li + 1 < LINES.length ? LINES[li + 1].at : END;
  const shownWords = line ? Math.floor((now - line.at) / WORD) + 1 : 0;
  const leaving = line ? now > nextAt - 0.35 : false;
  const speaking = !!line && shownWords <= words.length;
  const toggle = () => { const a = audio.current; if (!a) return; a.muted = !a.muted; setMuted(a.muted); if (a.paused) { a.currentTime = Math.max(0, now); void a.play().catch(() => {}); } };

  return (
    <motion.div className="talk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04, filter: "blur(14px)" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
      <div className="talk-who">
        <span className={"talk-avatar" + (speaking ? " on" : "")}><LogoMark size={40} animated /><i /><i /></span>
        <span className="talk-name">منسقتك من مناسبتي</span>
        <span className="talk-wave" aria-hidden="true">{Array.from({ length: 9 }, (_, k) => <i key={k} className={speaking ? "on" : ""} style={{ animationDelay: `${(k % 5) * 0.08}s` }} />)}</span>
      </div>
      <p className={"talk-line" + (line?.big ? " big" : "") + (leaving ? " out" : "")} aria-live="polite" key={li}>
        {words.map((w, i) => (
          <span key={i} className="tw"><span className={"twi" + (i < shownWords ? " in" : "") + (i === shownWords - 1 && speaking ? " now" : "")}>{w}</span>{i < words.length - 1 ? " " : ""}</span>
        ))}
      </p>
      <div className="talk-foot">
        <div className="talk-prog" aria-hidden="true"><b style={{ width: `${Math.max(0, Math.min(1, now / END)) * 100}%` }} /></div>
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
