"use client";
import { useEffect, useState } from "react";
import { dicts, I18nCtx, type Lang } from "@/lib/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  useEffect(() => {
    try {
      const l = localStorage.getItem("its-lang");
      if (l === "en" || l === "ar") setLangState(l);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("its-lang", l);
    } catch {
      /* ignore */
    }
  };
  return <I18nCtx.Provider value={{ t: dicts[lang], lang, setLang }}>{children}</I18nCtx.Provider>;
}
