import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { usePinProgress } from "../hooks/useScrollProgress.js";
import KineticText from "./visuals/KineticText.jsx";

function StaticInterlude({ t }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => {
      video.currentTime = Math.min(video.duration * 0.65, video.duration - 0.05);
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

function CinematicInterlude({ t }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const progress = usePinProgress(wrapRef);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const onLoaded = () => setReady(true);
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready || !video.duration) return;
    const target = Math.min(progress * video.duration, video.duration - 0.03);
    if (Math.abs(video.currentTime - target) > 0.02) {
      video.currentTime = target;
    }
  }, [progress, ready]);

  const irisRadius = 16 + progress * 78;
  const videoScale = 1.35 - progress * 0.35;
  const darkVeil = Math.max(0, 0.55 - progress * 0.55);

  const line1T = Math.max(0, Math.min(1, (progress - 0.08) / 0.28));
  const line1Out = Math.max(0, Math.min(1, (progress - 0.42) / 0.18));
  const line1Opacity = line1T * (1 - line1Out);

  const line2T = Math.max(0, Math.min(1, (progress - 0.62) / 0.3));

  return (
    <div ref={wrapRef} className="relative" style={{ height: "230svh" }}>
      <section className="scene-sticky flex min-h-[100svh] items-center justify-center overflow-hidden bg-primary-950">
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `circle(${irisRadius}% at 50% 50%)`, willChange: "clip-path" }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: `scale(${videoScale})`, willChange: "transform" }}
            src="/media/journey-pullback.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-primary-950" style={{ opacity: darkVeil }} />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-950/55 via-transparent to-primary-950/70" />

        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center sm:px-8">
          <p
            className="text-balance font-arabic text-2xl font-bold leading-relaxed text-white sm:text-3xl"
            style={{ opacity: line1Opacity, transform: `translateY(${(1 - line1T) * 16}px)` }}
          >
            {t.interlude.line1}
          </p>
          <KineticText
            as="p"
            text={t.interlude.line2}
            progress={line2T}
            className="text-balance mt-2 block font-arabic text-2xl font-bold leading-relaxed text-sand-300 sm:text-3xl"
          />
        </div>
      </section>
    </div>
  );
}

export default function Interlude() {
  const { t, reduceMotion } = useLanguage();
  return reduceMotion ? <StaticInterlude t={t} /> : <CinematicInterlude t={t} />;
}
