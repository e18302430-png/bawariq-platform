import React, { useMemo, useRef } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { usePinProgress } from "../hooks/useScrollProgress.js";
import ParticleScene from "./visuals/ParticleScene.jsx";

const MODES = ["arcs", "lattice", "silhouette"];

function pulse(local) {
  if (local <= 0) return 0;
  if (local >= 1) return 0;
  if (local < 0.3) return local / 0.3;
  if (local > 0.7) return (1 - local) / 0.3;
  return 1;
}

function StaticPillars({ t }) {
  return (
    <section id="pillars" className="relative bg-surface px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">
          {t.pillars.kicker}
        </p>
        <div className="mt-6 divide-y divide-ink/8 sm:mt-10">
          {t.pillars.items.map((item) => (
            <div key={item.word} className="flex flex-col items-center py-10 text-center sm:py-14">
              <span className="font-arabic text-5xl font-bold text-primary-800 sm:text-7xl lg:text-8xl">
                {item.word}
              </span>
              <p className="text-balance mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CinematicPillars({ t }) {
  const wrapRef = useRef(null);
  const progress = usePinProgress(wrapRef);
  const items = t.pillars.items;
  const stage = progress * items.length;

  const weights = useMemo(
    () => items.map((_, i) => pulse(Math.max(0, Math.min(1, stage - i)))),
    [stage, items]
  );
  const activeIndex = Math.max(0, Math.min(items.length - 1, Math.floor(Math.min(items.length - 0.001, stage))));

  return (
    <div ref={wrapRef} id="pillars" className="relative" style={{ height: "320svh" }}>
      <section className="scene-sticky relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-surface px-6 py-20 sm:px-8">
        {items.map((item, i) => {
          if (weights[i] <= 0.01) return null;
          return <ParticleScene key={item.word} mode={MODES[i % MODES.length]} progress={weights[i]} className="opacity-90" />;
        })}

        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sand-600">{t.pillars.kicker}</p>

          <div className="relative mt-8 flex h-[220px] items-center justify-center sm:h-[260px]">
            {items.map((item, i) => {
              const w = weights[i];
              const scale = 0.72 + w * 0.28;
              return (
                <div
                  key={item.word}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{
                    opacity: w,
                    transform: `scale(${scale})`,
                    filter: `blur(${(1 - w) * 8}px)`,
                    pointerEvents: w > 0.5 ? "auto" : "none",
                  }}
                >
                  <span className="font-arabic text-5xl font-bold text-primary-800 sm:text-7xl lg:text-8xl">
                    {item.word}
                  </span>
                  <p className="text-balance mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {items.map((item, i) => (
              <span
                key={item.word}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === activeIndex ? "28px" : "8px",
                  backgroundColor: i === activeIndex ? "#C09A43" : "rgba(11,31,27,0.15)",
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Pillars() {
  const { t, reduceMotion } = useLanguage();
  return reduceMotion ? <StaticPillars t={t} /> : <CinematicPillars t={t} />;
}
