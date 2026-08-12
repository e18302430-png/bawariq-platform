import React from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import Reveal from "./Reveal.jsx";

export default function Journey() {
  const { t } = useLanguage();

  return (
    <section id="journey" className="bg-primary-950 px-6 py-20 sm:px-8 sm:py-28">
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
          <div className="absolute top-6 hidden h-px bg-white/15 lg:block lg:inset-x-6" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
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
