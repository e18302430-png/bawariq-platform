"use client";
import clsx from "clsx";
import { ImageUp, ScanText, Sparkles, Type } from "lucide-react";
import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function Uploader({ onFile, busy, error }: { onFile: (f: File) => void; busy: boolean; error?: string }) {
  const { t, lang } = useI18n();
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const steps =
    lang === "ar"
      ? [
          [ScanText, "اكتشاف ذكي", "يكتشف كل النصوص العربية والإنجليزية حتى المائلة والصغيرة"],
          [Type, "مطابقة الشكل", "الخط والحجم واللون والحدود والظل تُستخرج تلقائيًا"],
          [Sparkles, "استبدال غير مرئي", "يمسح الأصل ويعيد بناء الخلفية ثم يرسم الجديد في مكانه"],
        ]
      : [
          [ScanText, "Smart detection", "Finds Arabic & English text, even rotated or tiny"],
          [Type, "Style matching", "Font, size, color, stroke and shadow extracted automatically"],
          [Sparkles, "Invisible replace", "Erases the original, rebuilds the background, draws the new text in place"],
        ];
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-10 sm:py-16">
      <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.tagline}</h1>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && ref.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={clsx(
          "mt-10 flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-16 text-center transition",
          over
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60",
        )}
      >
        {busy ? (
          <>
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            <p className="mt-5 text-lg font-medium">{t.analyzing}</p>
          </>
        ) : (
          <>
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
              <ImageUp size={30} />
            </span>
            <p className="mt-5 text-lg font-semibold">{t.dropTitle}</p>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t.dropHint}</p>
          </>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
      <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
        {steps.map(([Icon, title, desc], i) => {
          const I = Icon as typeof ScanText;
          return (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <I size={20} className="text-brand-500" />
              <p className="mt-3 font-semibold">{title as string}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{desc as string}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
