"use client";
import clsx from "clsx";
import { AlignCenter, AlignLeft, AlignRight, Eraser, RotateCcw, SlidersHorizontal, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Align, Block, Edit, Fit, FontInfo } from "@/lib/types";
import FontPicker from "./FontPicker";

interface Props {
  block: Block;
  edit: Edit | undefined;
  fonts: FontInfo[];
  onChange: (patch: Partial<Edit> | null, merge?: boolean) => void;
  onUploadFont: (f: File) => void;
  onDeleteBlock: () => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="field flex items-center gap-2 py-1.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
      />
      <input
        value={value}
        onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && onChange(e.target.value)}
        className="w-full bg-transparent font-mono text-xs uppercase outline-none"
        dir="ltr"
      />
    </div>
  );
}

function Num({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 2000,
  suffix = "px",
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="field flex items-center gap-1 py-1.5" dir="ltr">
      <input
        type="number"
        value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="w-full bg-transparent text-sm tabular-nums outline-none"
      />
      <span className="text-xs text-slate-400">{suffix}</span>
    </div>
  );
}

export default function Inspector({ block, edit, fonts, onChange, onUploadFont, onDeleteBlock }: Props) {
  const { t } = useI18n();
  const [adv, setAdv] = useState(false);
  const st = block.style;
  const v = <K extends keyof Edit>(k: K, d: NonNullable<Edit[K]>): NonNullable<Edit[K]> =>
    (edit && edit[k] !== undefined && edit[k] !== null ? edit[k] : d) as NonNullable<Edit[K]>;
  const text = edit ? edit.text : block.text;
  const shadow = edit && "shadow" in edit ? edit.shadow : st.shadow;
  const gradient = edit && "gradient" in edit ? edit.gradient : st.gradient;
  const align = v("align", st.align);
  const fit = v("fit", "shrink" as Fit);
  const conf = Math.round(block.ocr.confidence * 100);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">{t.detectedText}</span>
          <span className="flex items-center gap-2">
            <span
              className={clsx(
                "rounded px-1.5 py-0.5 tabular-nums",
                conf >= 80
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : conf >= 55
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
              )}
              title={block.ocr.engine}
            >
              {t.confidence} {conf}%
            </span>
          </span>
        </div>
        <div
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          dir="auto"
        >
          {block.text || "—"}
        </div>
      </div>

      <Row label={t.newText}>
        <textarea
          autoFocus
          dir="auto"
          rows={2}
          value={edit?.remove ? "" : text}
          placeholder={t.newTextPh}
          onChange={(e) => onChange({ text: e.target.value, remove: false }, true)}
          className="field min-h-[72px] resize-y text-base leading-7"
        />
      </Row>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn-ghost justify-center"
          onClick={() => onChange(edit?.remove ? { remove: false } : { remove: true, text: "" })}
        >
          {edit?.remove ? <Undo2 size={15} /> : <Eraser size={15} />}
          {edit?.remove ? t.restore : t.erase}
        </button>
        <button type="button" className="btn-ghost justify-center" disabled={!edit} onClick={() => onChange(null)}>
          <RotateCcw size={15} />
          {t.reset}
        </button>
      </div>

      <Row label={t.font}>
        <FontPicker
          value={v("font_id", st.font_id)}
          fonts={fonts}
          candidates={st.font_candidates}
          onChange={(id) => onChange({ font_id: id })}
          onUpload={onUploadFont}
        />
      </Row>

      <div className="grid grid-cols-2 gap-3">
        <Row label={t.size}>
          <Num value={v("size_px", st.size_px)} min={2} max={4000} step={0.5} onChange={(n) => onChange({ size_px: n }, true)} />
        </Row>
        <Row label={t.color}>
          <ColorInput value={v("color", st.color)} onChange={(c) => onChange({ color: c, gradient: null }, true)} />
        </Row>
      </div>

      <Row label={t.align}>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(
            [
              ["right", AlignRight, t.alignRight],
              ["center", AlignCenter, t.alignCenter],
              ["left", AlignLeft, t.alignLeft],
            ] as [Align, typeof AlignRight, string][]
          ).map(([a, Icon, label]) => (
            <button
              key={a}
              type="button"
              title={label}
              onClick={() => onChange({ align: a })}
              className={clsx(
                "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs",
                align === a ? "bg-white shadow-sm dark:bg-slate-700" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </Row>

      <Row label={t.fit}>
        <select className="field" value={fit} onChange={(e) => onChange({ fit: e.target.value as Fit })}>
          <option value="shrink">{t.fitShrink}</option>
          <option value="fill">{t.fitFill}</option>
          <option value="none">{t.fitNone}</option>
        </select>
      </Row>

      <button
        type="button"
        onClick={() => setAdv((a) => !a)}
        className="flex w-full items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        <SlidersHorizontal size={15} /> {t.advanced}
        <span className="ms-auto text-xs text-slate-400">{adv ? "−" : "+"}</span>
      </button>

      {adv && (
        <div className="space-y-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <Row label={`${t.stroke} (px)`}>
              <Num value={v("stroke_width_px", st.stroke_width_px)} max={100} step={0.5} onChange={(n) => onChange({ stroke_width_px: n }, true)} />
            </Row>
            <Row label={t.stroke}>
              <ColorInput value={v("stroke_color", st.stroke_color)} onChange={(c) => onChange({ stroke_color: c }, true)} />
            </Row>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={!!gradient}
                onChange={(e) =>
                  onChange({ gradient: e.target.checked ? { from: v("color", st.color), to: "#000000", axis: "v" } : null })
                }
              />
              {t.gradient}
            </label>
            {gradient && (
              <div className="grid grid-cols-2 gap-3">
                <ColorInput value={gradient.from} onChange={(c) => onChange({ gradient: { ...gradient, from: c } }, true)} />
                <ColorInput value={gradient.to} onChange={(c) => onChange({ gradient: { ...gradient, to: c } }, true)} />
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={!!shadow}
                onChange={(e) =>
                  onChange({
                    shadow: e.target.checked
                      ? { dx_px: 2, dy_px: 2, blur_px: 2, color: "#000000", opacity: 0.6 }
                      : null,
                  })
                }
              />
              {t.shadow}
            </label>
            {shadow && (
              <div className="grid grid-cols-3 gap-2">
                <Num value={shadow.dx_px} min={-200} max={200} step={0.5} suffix="x" onChange={(n) => onChange({ shadow: { ...shadow, dx_px: n } }, true)} />
                <Num value={shadow.dy_px} min={-200} max={200} step={0.5} suffix="y" onChange={(n) => onChange({ shadow: { ...shadow, dy_px: n } }, true)} />
                <Num value={shadow.blur_px} max={100} step={0.5} suffix="blur" onChange={(n) => onChange({ shadow: { ...shadow, blur_px: n } }, true)} />
                <div className="col-span-3">
                  <ColorInput value={shadow.color} onChange={(c) => onChange({ shadow: { ...shadow, color: c } }, true)} />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Row label={t.blur}>
              <Num value={v("blur_px", st.blur_px)} max={20} step={0.1} onChange={(n) => onChange({ blur_px: n }, true)} />
            </Row>
            <Row label={t.opacity}>
              <Num value={v("opacity", st.opacity) * 100} max={100} suffix="%" onChange={(n) => onChange({ opacity: n / 100 }, true)} />
            </Row>
          </div>
          <Row label={t.offset}>
            <div className="grid grid-cols-2 gap-2">
              <Num value={v("dx", 0)} min={-2000} max={2000} step={0.5} suffix="x" onChange={(n) => onChange({ dx: n }, true)} />
              <Num value={v("dy", 0)} min={-2000} max={2000} step={0.5} suffix="y" onChange={(n) => onChange({ dy: n }, true)} />
            </div>
          </Row>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {t.match}: {Math.round(block.match_score * 100)}% · {block.angle.toFixed(1)}°
            </span>
            {block.manual && (
              <button type="button" onClick={onDeleteBlock} className="flex items-center gap-1 text-rose-500 hover:text-rose-600">
                <Trash2 size={13} /> {t.removeBlock}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
