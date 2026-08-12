import React, { useRef } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { usePinProgress } from "../hooks/useScrollProgress.js";
import Reveal from "./Reveal.jsx";
import PathReveal from "./visuals/PathReveal.jsx";

function VerticalJourney({ t, className = "", id }) {
  return (
    <section id={id} className={`bg-primary-950 px-6 py-20 sm:px-8 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Reveal as="p" className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-400">
            {t.journey.kicker}
          </Reveal>
          <Reveal as="h2" delay={100} className="text-balance mt-4 font-arabic text-3xl font-bold text-white sm:text-4xl">
            {t.journey.title}
          </Reveal>
          <Reveal as="p" delay={180} className="mt-4 leading-relaxed text-white/70">
            {t.journey.lead}
          </Reveal>
        </div>

        <div className="relative mt-16">
          <div className="absolute top-6 hidden h-px bg-white/15 sm:block sm:inset-x-6" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {t.journey.steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 90} className="relative">
                <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-sand-500 text-sm font-bold text-primary-950">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-arabic text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CinematicJourney({ t, dir }) {
  const wrapRef = useRef(null);
  const progress = usePinProgress(wrapRef);
  const steps = t.journey.steps;
  const sign = dir === "rtl" ? 1 : -1;
  const translate = sign * progress * (steps.length - 1) * 100;

  return (
    <div ref={wrapRef} className="relative hidden lg:block" style={{ height: `${100 + (steps.length - 1) * 85}vh` }}>
      <section className="scene-sticky flex min-h-[100svh] flex-col justify-center overflow-hidden bg-primary-950 px-6 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-3xl shrink-0 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-400">{t.journey.kicker}</p>
          <h2 className="text-balance mt-3 font-arabic text-3xl font-bold text-white sm:text-4xl">{t.journey.title}</h2>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] opacity-70">
          <PathReveal progress={progress} steps={steps.length} className="h-full w-full" />
        </div>

        <div className="relative mt-10 h-[220px] overflow-hidden">
          <div
            className="flex h-full"
            style={{ width: `${steps.length * 100}%`, transform: `translateX(${translate}%)`, willChange: "transform" }}
          >
            {steps.map((step, index) => (
              <div key={step.title} className="flex h-full shrink-0 flex-col items-center justify-center px-10 text-center" style={{ width: `${100 / steps.length}%` }}>
                <span className="grid h-14 w-14 place-items-center rounded-full bg-sand-500 text-lg font-bold text-primary-950">
                  {index + 1}
                </span>
                <h3 className="mt-5 font-arabic text-2xl font-bold text-white sm:text-3xl">{step.title}</h3>
                <p className="text-balance mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Journey() {
  const { t, dir, reduceMotion } = useLanguage();

  if (reduceMotion) {
    return <VerticalJourney t={t} id="journey" />;
  }

  return (
    <div id="journey">
      <VerticalJourney t={t} className="lg:hidden" />
      <CinematicJourney t={t} dir={dir} />
    </div>
  );
}
