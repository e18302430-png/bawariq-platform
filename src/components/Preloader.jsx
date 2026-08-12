import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";

const EXIT_AFTER_MS = 1300;
const DONE_AFTER_MS = 1900;

export default function Preloader({ onDone }) {
  const { t, reduceMotion } = useLanguage();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      onDone();
      return undefined;
    }
    document.body.style.overflow = "hidden";
    const exitTimer = setTimeout(() => setExiting(true), EXIT_AFTER_MS);
    const doneTimer = setTimeout(() => {
      document.body.style.overflow = "";
      onDone();
    }, DONE_AFTER_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      role="status"
      aria-label={t.a11y.loading}
      className={`fixed inset-0 z-[300] flex flex-col items-center justify-center bg-primary-950 transition-transform duration-[650ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        exiting ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <svg width="220" height="56" viewBox="0 0 300 60" className="text-sand-400" aria-hidden="true">
        <path
          d="M0,30 L70,30 L85,8 L100,52 L112,22 L124,30 L300,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 600,
            strokeDashoffset: 600,
            animation: "preload-draw 1000ms cubic-bezier(0.65,0,0.35,1) 150ms forwards",
          }}
        />
      </svg>
      <p
        className="mt-5 font-arabic text-base font-semibold tracking-wide text-white opacity-0"
        style={{ animation: "preload-fade 700ms ease-out 500ms forwards" }}
      >
        {t.hero.eyebrow}
      </p>
    </div>
  );
}
