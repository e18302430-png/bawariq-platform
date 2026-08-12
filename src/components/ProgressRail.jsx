import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { NAV_KEYS, scrollToId } from "../nav.js";

export default function ProgressRail() {
  const { t } = useLanguage();
  const [active, setActive] = useState("hero");
  const ratiosRef = useRef({});

  useEffect(() => {
    const sections = NAV_KEYS.map(([, id]) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratiosRef.current[entry.target.id] = entry.intersectionRatio;
        });
        let bestId = active;
        let bestRatio = 0;
        NAV_KEYS.forEach(([, id]) => {
          const ratio = ratiosRef.current[id] || 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestRatio > 0) setActive(bestId);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav
      aria-label={t.nav.home}
      className="fixed inset-y-0 end-5 z-40 hidden flex-col items-end justify-center gap-3 xl:flex"
    >
      {NAV_KEYS.map(([key, id]) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => scrollToId(id)}
            className="group flex items-center gap-2.5"
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className="max-w-0 overflow-hidden whitespace-nowrap rounded-full bg-ink/85 px-0 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:max-w-[10rem] group-hover:px-2.5 group-hover:opacity-100"
            >
              {t.nav[key]}
            </span>
            <span
              className={`block shrink-0 rounded-full shadow-sm transition-all duration-300 ${
                isActive
                  ? "h-2.5 w-2.5 bg-sand-500 ring-2 ring-sand-500/30"
                  : "h-2 w-2 bg-white ring-1 ring-ink/20 group-hover:bg-sand-200"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
