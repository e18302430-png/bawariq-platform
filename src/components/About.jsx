import React from "react";
import { ShieldCheck, Stethoscope, HeartHandshake, Cpu } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import Reveal from "./Reveal.jsx";

const ICONS = [ShieldCheck, Stethoscope, HeartHandshake, Cpu];

export default function About() {
  const { t } = useLanguage();
  return (
    <section id="about" className="bg-surface-alt px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
          <div>
            <Reveal variant="start" as="p" className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">
              {t.about.kicker}
            </Reveal>
            <Reveal
              variant="start"
              as="h2"
              delay={100}
              className="text-balance mt-4 font-arabic text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl"
            >
              {t.about.title}
            </Reveal>
          </div>
          <div>
            <Reveal variant="end" as="p" className="text-balance text-lg font-medium leading-relaxed text-ink">
              {t.about.lead}
            </Reveal>
            <Reveal variant="end" delay={120} as="p" className="mt-4 leading-relaxed text-ink-soft">
              {t.about.body}
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.values.map((value, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Reveal
                key={value.title}
                delay={index * 90}
                className="rounded-2xl border border-ink/8 bg-surface p-6 shadow-soft"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-arabic text-base font-semibold text-ink">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
