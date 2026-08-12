import React, { useEffect, useState } from "react";
import { Menu, X, Globe, Accessibility, Activity, PhoneCall } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { NAV_KEYS, scrollToId } from "../nav.js";

export default function Header() {
  const { lang, t, toggleLang, reduceMotion, setReduceMotion } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNav = (id) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-surface/90 backdrop-blur-md shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => handleNav("hero")}
          className="flex items-center gap-2.5 shrink-0"
          aria-label={t.nav.home}
        >
          <span
            className={`grid h-10 w-10 place-items-center rounded-full border transition-colors ${
              scrolled ? "border-primary-700 text-primary-700" : "border-white/60 text-white"
            }`}
          >
            <Activity className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span
            className={`font-arabic text-[15px] font-semibold leading-tight sm:text-base ${
              scrolled ? "text-ink" : "text-white"
            }`}
          >
            {t.hero.eyebrow}
          </span>
        </button>

        <nav className="hidden items-center gap-3 2xl:flex" aria-label={t.nav.home}>
          {NAV_KEYS.map(([key, id]) => (
            <button
              key={id}
              type="button"
              onClick={() => handleNav(id)}
              className={`whitespace-nowrap text-[13px] font-medium transition-colors hover:text-sand-500 ${
                scrolled ? "text-ink-soft" : "text-white/90"
              }`}
            >
              {t.nav[key]}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReduceMotion(!reduceMotion)}
            aria-pressed={reduceMotion}
            title={t.a11y.reduceMotion}
            className={`hidden h-9 w-9 place-items-center rounded-full border transition-colors sm:grid ${
              reduceMotion ? "border-sand-500 text-sand-600 bg-sand-50" : scrolled ? "border-ink/15 text-ink-soft" : "border-white/40 text-white"
            }`}
          >
            <Accessibility className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className={`flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
              scrolled ? "border-ink/15 text-ink-soft" : "border-white/40 text-white"
            }`}
            aria-label={t.a11y.langToggle}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className={lang === "ar" ? "opacity-100" : "opacity-50"}>{t.langSwitch.ar}</span>
            <span aria-hidden="true" className="opacity-40">
              |
            </span>
            <span className={lang === "en" ? "opacity-100" : "opacity-50"}>{t.langSwitch.en}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav("emergency")}
            className="hidden items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-soft transition-transform hover:scale-[1.03] sm:flex"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            {t.nav.emergency}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={`grid h-10 w-10 place-items-center rounded-full border 2xl:hidden ${
              scrolled ? "border-ink/15 text-ink" : "border-white/40 text-white"
            }`}
            aria-label={t.a11y.openMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] 2xl:hidden">
          <button
            type="button"
            aria-label={t.a11y.closeMenu}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 end-0 flex w-[85%] max-w-sm flex-col bg-surface px-6 py-5 shadow-2xl animate-[reveal-from-end_0.35s_ease-out]">
            <div className="flex items-center justify-between">
              <span className="font-arabic text-base font-semibold text-ink">{t.hero.eyebrow}</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t.a11y.closeMenu}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label={t.nav.home}>
              {NAV_KEYS.map(([key, id]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNav(id)}
                  className="rounded-xl px-3 py-3 text-start text-base font-medium text-ink-soft transition-colors hover:bg-primary-50 hover:text-primary-800"
                >
                  {t.nav[key]}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 border-t border-ink/10 pt-4">
              <button
                type="button"
                onClick={toggleLang}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 px-3 py-2.5 text-sm font-semibold text-ink-soft"
              >
                <Globe className="h-4 w-4" />
                {lang === "ar" ? t.langSwitch.en : t.langSwitch.ar}
              </button>
              <button
                type="button"
                onClick={() => setReduceMotion(!reduceMotion)}
                aria-pressed={reduceMotion}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${
                  reduceMotion ? "border-sand-500 text-sand-600 bg-sand-50" : "border-ink/15 text-ink-soft"
                }`}
                title={t.a11y.reduceMotion}
              >
                <Accessibility className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleNav("emergency")}
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white"
            >
              <PhoneCall className="h-4 w-4" />
              {t.nav.emergency}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
