import React from "react";
import { useReveal } from "../hooks/useReveal.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import Reveal from "./Reveal.jsx";

function PillarWord({ word, desc, index }) {
  const [ref, isVisible] = useReveal({ threshold: 0.4 });
  return (
    <div ref={ref} className="flex flex-col items-center py-10 text-center sm:py-14">
      <span
        className={`pillar-word font-arabic text-5xl font-bold text-primary-800 sm:text-7xl lg:text-8xl ${
          isVisible ? "is-visible" : ""
        }`}
        style={isVisible ? { animationDelay: `${index * 90}ms` } : undefined}
      >
        {word}
      </span>
      <p className="text-balance mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">{desc}</p>
    </div>
  );
}

export default function Pillars() {
  const { t } = useLanguage();
  return (
    <section id="pillars" className="relative bg-surface px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal as="p" className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">
          {t.pillars.kicker}
        </Reveal>
        <div className="mt-6 divide-y divide-ink/8 sm:mt-10">
          {t.pillars.items.map((item, index) => (
            <PillarWord key={item.word} word={item.word} desc={item.desc} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
