import React from "react";
import { Siren, Stethoscope, ScanLine, FlaskConical, Pill } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import Reveal from "./Reveal.jsx";

const ICONS = [Siren, Stethoscope, ScanLine, FlaskConical, Pill];

export default function Services() {
  const { t } = useLanguage();
  return (
    <section id="services" className="bg-surface px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Reveal as="p" className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">
            {t.services.kicker}
          </Reveal>
          <Reveal as="h2" delay={100} className="text-balance mt-4 font-arabic text-3xl font-bold text-ink sm:text-4xl">
            {t.services.title}
          </Reveal>
          <Reveal as="p" delay={180} className="mt-4 leading-relaxed text-ink-soft">
            {t.services.lead}
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Reveal
                key={item.title}
                delay={index * 80}
                className="group rounded-2xl border border-ink/8 bg-surface-alt p-6 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-700 text-white transition-colors group-hover:bg-primary-800">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-arabic text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
