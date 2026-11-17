"use client";
import clsx from "clsx";
import { Maximize2, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Block, EditMap } from "@/lib/types";

export type ViewMode = "edited" | "original" | "compare";

interface Props {
  width: number;
  height: number;
  blocks: Block[];
  edits: EditMap;
  originalSrc: string;
  previewSrc: string | null;
  view: ViewMode;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  addMode: boolean;
  onAddQuad: (quad: number[][]) => void;
  busy: boolean;
}

interface Xf {
  s: number;
  x: number;
  y: number;
}

export default function Canvas(p: Props) {
  const { t } = useI18n();
  const wrap = useRef<HTMLDivElement>(null);
  const [xf, setXf] = useState<Xf>({ s: 1, x: 0, y: 0 });
  const [split, setSplit] = useState(50);
  const [hover, setHover] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const drag = useRef<{ mode: "pan" | "draw" | "split"; sx: number; sy: number; ox: number; oy: number } | null>(
    null,
  );

  const fit = useCallback(() => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const s = Math.min(r.width / p.width, r.height / p.height) * 0.94;
    setXf({ s, x: (r.width - p.width * s) / 2, y: (r.height - p.height * s) / 2 });
  }, [p.width, p.height]);

  useLayoutEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  const toImage = (cx: number, cy: number) => {
    const r = wrap.current!.getBoundingClientRect();
    return { x: (cx - r.left - xf.x) / xf.s, y: (cy - r.top - xf.y) / xf.s };
  };

  const zoomAt = (factor: number, cx?: number, cy?: number) => {
    const r = wrap.current!.getBoundingClientRect();
    const px = cx === undefined ? r.width / 2 : cx - r.left;
    const py = cy === undefined ? r.height / 2 : cy - r.top;
    setXf((o) => {
      const s = Math.min(Math.max(o.s * factor, 0.05), 16);
      const k = s / o.s;
      return { s, x: px - (px - o.x) * k, y: py - (py - o.y) * k };
    });
  };

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY);
      } else {
        setXf((o) => ({ ...o, x: o.x - e.deltaX, y: o.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (p.addMode && e.button === 0) {
      const q = toImage(e.clientX, e.clientY);
      drag.current = { mode: "draw", sx: q.x, sy: q.y, ox: 0, oy: 0 };
      setDraft({ x0: q.x, y0: q.y, x1: q.x, y1: q.y });
      return;
    }
    drag.current = { mode: "pan", sx: e.clientX, sy: e.clientY, ox: xf.x, oy: xf.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.mode === "pan") {
      setXf((o) => ({ ...o, x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }));
    } else if (d.mode === "draw") {
      const q = toImage(e.clientX, e.clientY);
      setDraft({ x0: d.sx, y0: d.sy, x1: q.x, y1: q.y });
    } else if (d.mode === "split") {
      const q = toImage(e.clientX, e.clientY);
      setSplit(Math.min(100, Math.max(0, (q.x / p.width) * 100)));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.mode === "draw" && draft) {
      const x0 = Math.max(0, Math.min(draft.x0, draft.x1));
      const x1 = Math.min(p.width, Math.max(draft.x0, draft.x1));
      const y0 = Math.max(0, Math.min(draft.y0, draft.y1));
      const y1 = Math.min(p.height, Math.max(draft.y0, draft.y1));
      setDraft(null);
      if (x1 - x0 > 6 && y1 - y0 > 6) {
        p.onAddQuad([
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ]);
      }
      return;
    }
    if (d.mode === "pan" && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 4) {
      p.onSelect(null);
    }
  };

  const showEdited = p.view !== "original" && p.previewSrc;
  const pts = (q: [number, number][]) => q.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div className="relative h-full w-full select-none overflow-hidden" dir="ltr">
      <div
        ref={wrap}
        className={clsx(
          "checker absolute inset-0 touch-none",
          p.addMode ? "cursor-crosshair" : drag.current?.mode === "pan" ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
          setDraft(null);
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left shadow-2xl"
          style={{
            width: p.width,
            height: p.height,
            transform: `translate(${xf.x}px, ${xf.y}px) scale(${xf.s})`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.originalSrc} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
          {showEdited && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.previewSrc!}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full"
              style={p.view === "compare" ? { clipPath: `inset(0 0 0 ${split}%)` } : undefined}
            />
          )}
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${p.width} ${p.height}`}
            preserveAspectRatio="none"
          >
            {p.view !== "compare" &&
              p.blocks.map((b) => {
                const e = p.edits[b.id];
                const sel = b.id === p.selectedId;
                const hov = b.id === hover;
                return (
                  <polygon
                    key={b.id}
                    points={pts(b.quad)}
                    className={clsx(
                      "cursor-pointer transition-[fill,stroke] duration-150",
                      sel
                        ? "fill-brand-500/10 stroke-brand-500"
                        : e
                          ? e.remove
                            ? "fill-rose-500/5 stroke-rose-400/80"
                            : "fill-emerald-500/5 stroke-emerald-400/80"
                          : hov
                            ? "fill-brand-400/15 stroke-brand-400"
                            : "fill-white/0 stroke-sky-400/70",
                    )}
                    style={{ strokeDasharray: sel || e ? undefined : "6 4" }}
                    strokeWidth={sel ? 2.5 : 1.5}
                    vectorEffect="non-scaling-stroke"
                    onPointerDown={(ev) => {
                      if (p.addMode) return;
                      ev.stopPropagation();
                      p.onSelect(b.id);
                    }}
                    onPointerEnter={() => setHover(b.id)}
                    onPointerLeave={() => setHover((h) => (h === b.id ? null : h))}
                  >
                    <title>{b.text}</title>
                  </polygon>
                );
              })}
            {draft && (
              <rect
                x={Math.min(draft.x0, draft.x1)}
                y={Math.min(draft.y0, draft.y1)}
                width={Math.abs(draft.x1 - draft.x0)}
                height={Math.abs(draft.y1 - draft.y0)}
                className="fill-amber-400/10 stroke-amber-500"
                strokeWidth={2}
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {p.view === "compare" && p.previewSrc && (
            <div
              className="absolute top-0 h-full cursor-ew-resize"
              style={{ left: `${split}%`, width: 0 }}
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.target as Element).setPointerCapture?.(e.pointerId);
                drag.current = { mode: "split", sx: 0, sy: 0, ox: 0, oy: 0 };
              }}
            >
              <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.25)]" />
              <div
                className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-lg"
                style={{ transform: `translate(-50%,-50%) scale(${1 / xf.s})` }}
              >
                <span>{t.original}</span>
                <span className="text-slate-300">|</span>
                <span>{t.edited}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2">
        <div className="pointer-events-auto flex items-center overflow-hidden rounded-lg border border-black/5 bg-white/90 text-slate-700 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-200">
          <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => zoomAt(1 / 1.25)} aria-label="zoom out">
            <Minus size={16} />
          </button>
          <button className="min-w-14 px-1 text-xs tabular-nums hover:bg-black/5 dark:hover:bg-white/10" onClick={fit} title={t.zoomFit}>
            {Math.round(xf.s * 100)}%
          </button>
          <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => zoomAt(1.25)} aria-label="zoom in">
            <Plus size={16} />
          </button>
          <button className="border-l border-black/5 p-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10" onClick={fit} aria-label={t.zoomFit}>
            <Maximize2 size={15} />
          </button>
        </div>
        {p.busy && (
          <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-panel dark:bg-slate-900/90 dark:text-slate-300">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            {t.rendering}
          </div>
        )}
      </div>
      {p.addMode && (
        <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg">
          {t.addBlockHint}
        </div>
      )}
    </div>
  );
}
