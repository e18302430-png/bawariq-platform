import React from "react";
import { Siren } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import Reveal from "./Reveal.jsx";

function scrollToId(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Emergency() {
  const { t } = useLanguage();
  return (
    <section id="emergency" className="bg-red-700 px-6 py-8 sm:px-8">
      <Reveal className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/15 text-white">
            <Siren className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-arabic text-lg font-bold text-white">{t.emergency.title}</h2>
            <p className="mt-0.5 text-sm text-white/85">{t.emergency.desc}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => scrollToId("contact")}
          className="shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-red-700 transition-transform hover:scale-[1.03]"
        >
          {t.emergency.cta}
        </button>
      </Reveal>
    </section>
  );
}
