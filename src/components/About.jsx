import React, { useRef } from "react";
import { ShieldCheck, Stethoscope, HeartHandshake, Cpu } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useTravelProgress } from "../hooks/useScrollProgress.js";
import Reveal from "./Reveal.jsx";
import KineticText from "./visuals/KineticText.jsx";
import GeoPattern from "./visuals/GeoPattern.jsx";
import TiltCard from "./visuals/TiltCard.jsx";

const ICONS = [ShieldCheck, Stethoscope, HeartHandshake, Cpu];

export default function About() {
  const { t, reduceMotion } = useLanguage();
  const sectionRef = useRef(null);
  const progress = useTravelProgress(sectionRef);
  const titleProgress = reduceMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.15) / 0.35));
  const panelProgress = reduceMotion ? 1 : Math.min(1, Math.max(0, (progress - 0.1) / 0.5));

  return (
    <section id="about" ref={sectionRef} className="bg-surface-alt px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
          <div>
            <Reveal variant="start" as="p" className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">
              {t.about.kicker}
            </Reveal>
            <KineticText
              as="h2"
              text={t.about.title}
              progress={titleProgress}
              className="text-balance mt-4 block font-arabic text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl"
            />
          </div>
          <div>
            <Reveal variant="end" as="p" className="text-balance text-lg font-medium leading-relaxed text-ink">
              {t.about.lead}
            </Reveal>
            <Reveal variant="end" delay={120} as="p" className="mt-4 leading-relaxed text-ink-soft">
              {t.about.body}
            </Reveal>

            <div
              className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-primary-950 text-sand-400"
              style={{
                clipPath: `inset(0 ${(1 - panelProgress) * 100}% 0 0 round 1.5rem)`,
              }}
            >
              <GeoPattern progress={panelProgress} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-primary-950/30" />
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.values.map((value, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <Reveal key={value.title} delay={index * 90}>
                <TiltCard className="rounded-2xl border border-ink/8 bg-surface p-6 shadow-soft">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-arabic text-base font-semibold text-ink">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.desc}</p>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
