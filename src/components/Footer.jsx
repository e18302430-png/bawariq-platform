import React from "react";
import { Activity, Siren } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

const NAV_KEYS = [
  ["home", "hero"],
  ["about", "about"],
  ["services", "services"],
  ["doctors", "doctors"],
  ["departments", "departments"],
  ["journey", "journey"],
  ["appointments", "appointments"],
  ["contact", "contact"],
];

function scrollToId(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-primary-950 px-6 pb-8 pt-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/30 text-white">
                <Activity className="h-4 w-4" />
              </span>
              <span className="font-arabic text-base font-semibold text-white">{t.hero.eyebrow}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">{t.footer.brandLine}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-sand-400">
              {t.footer.quickLinksTitle}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_KEYS.map(([key, id]) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(id)}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {t.nav[key]}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-sand-400">
              {t.footer.emergencyTitle}
            </h3>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Siren className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <p className="text-sm leading-relaxed text-white/75">{t.footer.emergencyDesc}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/45">
          {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
