"use client";
import clsx from "clsx";
import { Check, ChevronDown, Search, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fontFileUrl } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { FontCandidate, FontInfo } from "@/lib/types";

const loaded = new Set<string>();

/** يحمّل الخط في المتصفح لعرض اسمه بشكله الحقيقي. */
export function useFontFace(id: string | undefined) {
  useEffect(() => {
    if (!id || loaded.has(id) || typeof document === "undefined") return;
    loaded.add(id);
    const ff = new FontFace(`its-${id}`, `url(${fontFileUrl(id)})`);
    ff.load()
      .then((f) => document.fonts.add(f))
      .catch(() => loaded.delete(id));
  }, [id]);
}

function FontRow({ f, active, score, onPick }: { f: FontInfo; active: boolean; score?: number; onPick: () => void }) {
  useFontFace(f.id);
  return (
    <button
      type="button"
      onClick={onPick}
      className={clsx(
        "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-start hover:bg-slate-100 dark:hover:bg-slate-800",
        active && "bg-brand-50 dark:bg-brand-500/15",
      )}
    >
      <span className="w-4 shrink-0">{active && <Check size={14} className="text-brand-500" />}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] leading-6" style={{ fontFamily: `its-${f.id}, inherit` }}>
          {f.script === "arabic" ? "أبجد هوز — " : ""}
          {f.family}
        </span>
        <span className="block text-[11px] text-slate-400">
          {f.family} · {f.weight}
          {f.custom ? " · custom" : ""}
        </span>
      </span>
      {score !== undefined && (
        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          {Math.round(score * 100)}%
        </span>
      )}
    </button>
  );
}

export default function FontPicker({
  value,
  fonts,
  candidates,
  onChange,
  onUpload,
}: {
  value: string;
  fonts: FontInfo[];
  candidates: FontCandidate[];
  onChange: (id: string) => void;
  onUpload: (f: File) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const byId = useMemo(() => Object.fromEntries(fonts.map((f) => [f.id, f])), [fonts]);
  const cur = byId[value];
  useFontFace(value);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const filt = (f: FontInfo) => !q || f.family.toLowerCase().includes(q.toLowerCase());
  const groups: [string, FontInfo[]][] = [
    [t.arabicFonts, fonts.filter((f) => f.script === "arabic" && !f.custom && filt(f))],
    [t.latinFonts, fonts.filter((f) => f.script === "latin" && !f.custom && filt(f))],
    ["Custom", fonts.filter((f) => f.custom && filt(f))],
  ];
  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="field flex w-full items-center justify-between gap-2 text-start"
      >
        <span className="truncate" style={{ fontFamily: `its-${value}, inherit` }}>
          {cur ? `${cur.family} · ${cur.weight}` : value}
        </span>
        <ChevronDown size={15} className="shrink-0 text-slate-400" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 dark:border-slate-800">
            <Search size={14} className="text-slate-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="…"
              className="w-full bg-transparent py-2.5 text-sm outline-none"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-1.5">
            {candidates.length > 0 && !q && (
              <>
                <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold text-slate-400">{t.suggested}</div>
                {candidates
                  .filter((c) => byId[c.id])
                  .map((c) => (
                    <FontRow key={`c-${c.id}`} f={byId[c.id]} score={c.score} active={c.id === value} onPick={() => pick(c.id)} />
                  ))}
              </>
            )}
            {groups.map(([label, list]) =>
              list.length ? (
                <div key={label}>
                  <div className="px-2.5 pb-1 pt-3 text-[11px] font-semibold text-slate-400">{label}</div>
                  {list.map((f) => (
                    <FontRow key={f.id} f={f} active={f.id === value} onPick={() => pick(f.id)} />
                  ))}
                </div>
              ) : null,
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 border-t border-slate-100 py-2.5 text-sm text-brand-600 hover:bg-slate-50 dark:border-slate-800 dark:text-brand-400 dark:hover:bg-slate-800"
          >
            <Upload size={14} /> {t.uploadFont}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".ttf,.otf"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
