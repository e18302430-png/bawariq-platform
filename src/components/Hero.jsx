import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

function scrollToId(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Hero() {
  const { t, reduceMotion } = useLanguage();
  const videoRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [reduceMotion]);

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-primary-950"
    >
      <div className="absolute inset-0">
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
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/80 via-primary-950/55 to-primary-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(5,26,19,0.55)_75%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-24 text-center sm:px-8">
        <p
          className={`font-arabic text-sm font-semibold uppercase tracking-[0.25em] text-sand-300 sm:text-base ${
            mounted && !reduceMotion ? "animate-[headline-in_0.9s_cubic-bezier(0.16,1,0.3,1)_forwards]" : ""
          }`}
          style={{ animationDelay: "150ms", opacity: reduceMotion ? 1 : mounted ? undefined : 0 }}
        >
          {t.hero.eyebrow}
        </p>

        <h1
          className={`text-balance mt-5 font-arabic text-4xl font-bold leading-[1.15] text-white sm:text-6xl lg:text-7xl ${
            mounted && !reduceMotion ? "animate-[headline-in_1s_cubic-bezier(0.16,1,0.3,1)_forwards]" : ""
          }`}
          style={{ animationDelay: "380ms", opacity: reduceMotion ? 1 : mounted ? undefined : 0 }}
        >
          {t.hero.headline}
        </h1>

        <p
          className={`text-balance mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg ${
            mounted && !reduceMotion ? "animate-[headline-in_1s_cubic-bezier(0.16,1,0.3,1)_forwards]" : ""
          }`}
          style={{ animationDelay: "620ms", opacity: reduceMotion ? 1 : mounted ? undefined : 0 }}
        >
          {t.hero.subtext}
        </p>

        <div
          className={`mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row ${
            mounted && !reduceMotion ? "animate-[headline-in_1s_cubic-bezier(0.16,1,0.3,1)_forwards]" : ""
          }`}
          style={{ animationDelay: "820ms", opacity: reduceMotion ? 1 : mounted ? undefined : 0 }}
        >
          <button
            type="button"
            onClick={() => scrollToId("appointments")}
            className="w-full rounded-full bg-sand-500 px-7 py-3.5 text-sm font-bold text-primary-950 shadow-soft transition-transform hover:scale-[1.03] sm:w-auto"
          >
            {t.hero.ctaPrimary}
          </button>
          <button
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
      >
        <span className="text-xs font-medium">{t.hero.scrollHint}</span>
        <ChevronDown className={`h-5 w-5 ${reduceMotion ? "" : "animate-bounce"}`} />
      </button>
    </section>
  );
}
