import React from "react";
import { Building2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import Reveal from "./Reveal.jsx";
import GeoPattern from "./visuals/GeoPattern.jsx";

export default function Departments() {
  const { t } = useLanguage();
  const placeholders = Array.from({ length: t.departments.count });

  return (
    <section id="departments" className="bg-surface-alt px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Reveal as="p" className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">
            {t.departments.kicker}
          </Reveal>
          <Reveal as="h2" delay={100} className="text-balance mt-4 font-arabic text-3xl font-bold text-ink sm:text-4xl">
            {t.departments.title}
          </Reveal>
          <Reveal as="p" delay={180} className="mt-4 leading-relaxed text-ink-soft">
            {t.departments.lead}
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((_, index) => (
            <Reveal key={index} delay={index * 70}>
              <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-dashed border-ink/15 bg-surface p-6 text-primary-700/25">
                <GeoPattern progress={0.6} className="absolute inset-0 h-full w-full" />
                <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink/5 text-ink-soft">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="relative z-10">
                  <h3 className="font-arabic text-base font-semibold text-ink-soft">{t.departments.placeholderTitle}</h3>
                  <p className="mt-1 text-sm text-ink-soft/70">{t.departments.placeholderDesc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
