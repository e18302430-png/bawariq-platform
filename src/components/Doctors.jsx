import React from "react";
import { UserRound } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import Reveal from "./Reveal.jsx";

export default function Doctors() {
  const { t } = useLanguage();
  const placeholders = Array.from({ length: t.doctors.count });

  return (
    <section id="doctors" className="bg-surface px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Reveal as="p" className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">
            {t.doctors.kicker}
          </Reveal>
          <Reveal as="h2" delay={100} className="text-balance mt-4 font-arabic text-3xl font-bold text-ink sm:text-4xl">
            {t.doctors.title}
          </Reveal>
          <Reveal as="p" delay={180} className="mt-4 leading-relaxed text-ink-soft">
            {t.doctors.lead}
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {placeholders.map((_, index) => (
            <Reveal
              key={index}
              delay={index * 80}
              className="rounded-2xl border border-ink/8 bg-surface-alt p-6 text-center"
            >
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink/5 text-ink-soft/60">
                <UserRound className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-arabic text-sm font-semibold text-ink-soft">{t.doctors.placeholderName}</h3>
              <p className="mt-1 text-xs text-ink-soft/70">{t.doctors.placeholderRole}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
