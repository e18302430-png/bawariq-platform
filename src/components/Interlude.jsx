import React, { useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { usePinProgress } from "../hooks/useScrollProgress.js";
import KineticText from "./visuals/KineticText.jsx";
import ParticleScene from "./visuals/ParticleScene.jsx";

function StaticInterlude({ t }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => {
      video.currentTime = Math.min(video.duration * 0.6, video.duration - 0.05);
    };
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-primary-950 px-6 py-24 sm:px-8">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        src="/media/journey-pullback.mp4"
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-950/70 via-primary-950/40 to-primary-950/70" />
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <p className="text-balance font-arabic text-2xl font-bold leading-relaxed text-white sm:text-3xl">
          {t.interlude.line1}
        </p>
        <p className="text-balance mt-2 font-arabic text-2xl font-bold leading-relaxed text-sand-300 sm:text-3xl">
          {t.interlude.line2}
        </p>
      </div>
    </section>
  );
}

function ease(t) {
  return 1 - (1 - t) ** 3;
}

function CinematicInterlude({ t, dir }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const progress = usePinProgress(wrapRef);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.play().catch(() => {});
  }, []);

  // Stage A (0 -> 0.62): the card grows from a small tilted floating window to full-bleed.
  const grow = ease(Math.max(0, Math.min(1, progress / 0.62)));
  // Stage B (0.55 -> 1): text + vignette settle once it's full-bleed.
  const settle = Math.max(0, Math.min(1, (progress - 0.55) / 0.45));

  const sign = dir === "rtl" ? -1 : 1;
  const scale = 0.36 + grow * 0.64;
  const translateX = sign * (1 - grow) * 20;
  const translateY = (1 - grow) * 12;
  const rotateZ = sign * (1 - grow) * 7;
  const rotateY = -sign * (1 - grow) * 24;
  const radius = (1 - grow) * 30;
  const shadow = 1 - grow;

  const line1Window = Math.max(0, Math.min(1, progress / 0.16));
  const line1Fade = Math.max(0, Math.min(1, (progress - 0.32) / 0.16));
  const line1Opacity = line1Window * (1 - line1Fade);

  const line2Progress = Math.max(0, Math.min(1, (settle - 0.25) / 0.65));
  const ambientOpacity = Math.max(0, 1 - grow * 1.4);

  return (
    <div ref={wrapRef} className="relative" style={{ height: "260svh" }}>
      <section
        className="scene-sticky flex min-h-[100svh] items-center justify-center overflow-hidden bg-primary-950"
        style={{ perspective: "1600px" }}
      >
        <ParticleScene mode="arcs" progress={ambientOpacity * 0.8} className="opacity-70" />

        <div
          className="absolute inset-0"
          style={{
            transform: `translate3d(${translateX}vw, ${translateY}vh, 0) rotate(${rotateZ}deg) rotateY(${rotateY}deg) scale(${scale})`,
            borderRadius: `${radius}px`,
            overflow: "hidden",
            boxShadow:
              shadow > 0.05
                ? `0 ${40 * shadow}px ${90 * shadow}px -20px rgba(5,26,19,${0.55 * shadow}), 0 0 0 ${1.5 * shadow}px rgba(207,174,96,${0.35 * shadow})`
                : "none",
            willChange: "transform",
          }}
        >
          <div className="card-idle h-full w-full">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src="/media/journey-pullback.mp4"
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
            />
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-b from-primary-950/50 via-transparent to-primary-950/75"
            style={{ opacity: 0.5 + settle * 0.5 }}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 start-6 z-10 flex w-[min(85vw,24rem)] items-center sm:start-14"
          style={{
            opacity: line1Opacity,
            transform: `translateY(${(1 - line1Window) * 14}px)`,
          }}
        >
          <p className="text-balance text-start font-arabic text-xl font-bold leading-relaxed text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-2xl">
            {t.interlude.line1}
          </p>
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center sm:px-8">
          <KineticText
            as="p"
            text={t.interlude.line2}
            progress={line2Progress}
            className="text-balance block font-arabic text-2xl font-bold leading-relaxed text-sand-300 drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] sm:text-3xl"
          />
        </div>
      </section>
    </div>
  );
}

export default function Interlude() {
  const { t, dir, reduceMotion } = useLanguage();
  return reduceMotion ? <StaticInterlude t={t} /> : <CinematicInterlude t={t} dir={dir} />;
}
