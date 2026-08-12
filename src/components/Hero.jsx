import React, { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { usePinProgress } from "../hooks/useScrollProgress.js";
import { useMagnetic } from "../hooks/useMagnetic.js";
import KineticText from "./visuals/KineticText.jsx";

function scrollToId(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Hero() {
  const { t, reduceMotion } = useLanguage();
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const progress = usePinProgress(wrapRef);
  const primaryCtaRef = useMagnetic(0.25);
  const secondaryCtaRef = useMagnetic(0.25);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const textOut = Math.min(1, progress / 0.88);
  const textOpacity = reduceMotion ? 1 : 1 - textOut;
  const textShift = reduceMotion ? 0 : -textOut * 46;
  const textScale = reduceMotion ? 1 : 1 - textOut * 0.08;
  const videoScale = reduceMotion ? 1 : 1 + progress * 0.14;
  const overlayBoost = reduceMotion ? 0 : progress * 0.3;
  const hintOpacity = reduceMotion ? 1 : Math.max(0, 1 - progress / 0.12);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) video.pause();
    else video.play().catch(() => {});
  }, [reduceMotion]);

  return (
    <div ref={wrapRef} id="hero" className="relative" style={{ height: "125svh" }}>
      <section className="scene-sticky flex items-center bg-primary-950">
        <div className="absolute inset-0" style={{ transform: `scale(${videoScale})`, willChange: "transform" }}>
          <video
            ref={videoRef}
            className="h-full w-full object-cover opacity-70"
            src="/media/hero-pulse.mp4"
            autoPlay={!reduceMotion}
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-primary-950/80 via-primary-950/55 to-primary-950"
            style={{ opacity: 1 - overlayBoost * 0.4 }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(5,26,19,0.55)_75%)]" />
          <div className="absolute inset-0 bg-primary-950" style={{ opacity: overlayBoost }} />
        </div>

        <div
          className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-24 text-center sm:px-8"
          style={{
            opacity: textOpacity,
            transform: `translateY(${textShift}px) scale(${textScale})`,
            willChange: "transform, opacity",
          }}
        >
          <p
            className="font-arabic text-sm font-semibold uppercase tracking-[0.25em] text-sand-300 sm:text-base"
            style={{
              opacity: reduceMotion || mounted ? 1 : 0,
              transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s, filter 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s",
              filter: reduceMotion || mounted ? "blur(0px)" : "blur(6px)",
            }}
          >
            {t.hero.eyebrow}
          </p>

          <KineticText
            as="h1"
            text={t.hero.headline}
            mode="mount"
            progress={reduceMotion || mounted ? 1 : 0}
            className="text-balance mt-5 block font-arabic text-4xl font-bold leading-[1.15] text-white sm:text-6xl lg:text-7xl"
          />

          <p
            className="text-balance mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg"
            style={{
              opacity: reduceMotion || mounted ? 1 : 0,
              transform: reduceMotion || mounted ? "translateY(0px)" : "translateY(14px)",
              transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.62s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.62s",
            }}
          >
            {t.hero.subtext}
          </p>

          <div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{
              opacity: reduceMotion || mounted ? 1 : 0,
              transform: reduceMotion || mounted ? "translateY(0px)" : "translateY(14px)",
              transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.82s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.82s",
            }}
          >
            <button
              ref={primaryCtaRef}
              type="button"
              onClick={() => scrollToId("appointments")}
              className="w-full rounded-full bg-sand-500 px-7 py-3.5 text-sm font-bold text-primary-950 shadow-soft transition-transform hover:scale-[1.03] sm:w-auto"
            >
              {t.hero.ctaPrimary}
            </button>
            <button
              ref={secondaryCtaRef}
              type="button"
              onClick={() => scrollToId("services")}
              className="w-full rounded-full border border-white/35 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              {t.hero.ctaSecondary}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollToId("pillars")}
          className="absolute inset-x-0 bottom-7 z-10 mx-auto flex w-fit flex-col items-center gap-1.5 text-white/70"
          style={{ opacity: hintOpacity }}
        >
          <span className="text-xs font-medium">{t.hero.scrollHint}</span>
          <ChevronDown className={`h-5 w-5 ${reduceMotion ? "" : "animate-bounce"}`} />
        </button>
      </section>
    </div>
  );
}
