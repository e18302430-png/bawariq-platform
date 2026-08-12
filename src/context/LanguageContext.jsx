import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { content } from "../i18n/content.js";

const DIR_BY_LANG = { ar: "rtl", en: "ltr" };
const LangContext = createContext(null);

function readInitialLang() {
  try {
    const stored = localStorage.getItem("anak_lang");
    if (stored === "ar" || stored === "en") return stored;
  } catch {
    /* localStorage unavailable */
  }
  return "ar";
}

function readInitialReduceMotion() {
  try {
    const stored = localStorage.getItem("anak_reduce_motion");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    /* localStorage unavailable */
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLang);
  const [reduceMotion, setReduceMotionState] = useState(readInitialReduceMotion);

  const dir = DIR_BY_LANG[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  const setLang = (next) => {
    setLangState(next);
    try {
      localStorage.setItem("anak_lang", next);
    } catch {
      /* ignore */
    }
  };

  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  const setReduceMotion = (next) => {
    setReduceMotionState(next);
    try {
      localStorage.setItem("anak_reduce_motion", next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const value = useMemo(
    () => ({
      lang,
      dir,
      t: content[lang],
      setLang,
      toggleLang,
      reduceMotion,
      setReduceMotion,
    }),
    [lang, dir, reduceMotion]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
