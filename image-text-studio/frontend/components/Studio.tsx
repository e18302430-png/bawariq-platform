"use client";
import clsx from "clsx";
import {
  Download,
  Eye,
  ImagePlus,
  Languages,
  Layers,
  Moon,
  Redo2,
  Replace,
  ScanText,
  SquareDashedMousePointer,
  Sun,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as api from "@/lib/api";
import { useHistory } from "@/lib/history";
import { useI18n } from "@/lib/i18n";
import type { Block, Edit, EditMap, ExportFormat, FontInfo, ImageMeta, Rule } from "@/lib/types";
import Canvas, { type ViewMode } from "./Canvas";
import { BatchDialog, ExportDialog, FindReplaceDialog } from "./Dialogs";
import Inspector from "./Inspector";
import Uploader from "./Uploader";

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const d = !dark;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    try {
      localStorage.setItem("its-theme", d ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };
  return { dark, toggle };
}

export default function Studio() {
  const { t, lang, setLang } = useI18n();
  const theme = useTheme();
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const hist = useHistory<EditMap>({});
  const edits = hist.value;
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("edited");
  const [preview, setPreview] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [dialog, setDialog] = useState<null | "find" | "batch" | "export">(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    api.fonts().then(setFonts).catch(() => {});
  }, []);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3500);
  };

  const onFile = useCallback(
    async (f: File) => {
      if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) {
        setError("PNG / JPG / WEBP");
        return;
      }
      setUploading(true);
      setError("");
      try {
        const m = await api.detect(f);
        setMeta(m);
        hist.reset({});
        setSelected(null);
        setPreview(null);
        setView("edited");
        flash(t.detected(m.blocks.length));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setUploading(false);
      }
    },
    [hist, t],
  );

  // لصق صورة من الحافظة
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith("image/"));
      const f = item?.getAsFile();
      if (f && !(e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        onFile(new File([f], f.name || "pasted.png", { type: f.type }));
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFile]);

  // المعاينة الحية: كل تغيير في التعديلات يُرسم على الخادم (مع إلغاء الطلب السابق)
  const editList = useMemo(() => Object.values(edits), [edits]);
  useEffect(() => {
    if (!meta) return;
    if (!editList.length) {
      setPreview(null);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setRendering(true);
      try {
        const maxSide = Math.min(Math.max(meta.width, meta.height), 2560);
        const { blob } = await api.render(meta.image_id, editList, {
          format: "webp",
          quality: 92,
          maxSide,
          signal: ac.signal,
        });
        const url = URL.createObjectURL(blob);
        setPreview((old) => {
          if (old) setTimeout(() => URL.revokeObjectURL(old), 1000);
          return url;
        });
      } catch (e) {
        if ((e as Error).name !== "AbortError") flash(`${t.error}: ${(e as Error).message}`);
      } finally {
        if (abortRef.current === ac) setRendering(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [editList, meta, t]);

  const blocks = meta?.blocks ?? [];
  const block = blocks.find((b) => b.id === selected) ?? null;

  const changeEdit = useCallback(
    (b: Block, patch: Partial<Edit> | null, merge = false) => {
      const next = { ...edits };
      if (patch === null) delete next[b.id];
      else {
        const prev: Edit = edits[b.id] ?? { block_id: b.id, text: b.text };
        next[b.id] = { ...prev, ...patch, block_id: b.id };
      }
      hist.set(next, merge);
    },
    [edits, hist],
  );

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const typing = e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement;
      if (mod && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) hist.redo();
        else hist.undo();
      } else if (mod && e.key.toLowerCase() === "y" && !typing) {
        e.preventDefault();
        hist.redo();
      } else if (e.key === "Escape") {
        setSelected(null);
        setAddMode(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hist]);

  const onAddQuad = async (quad: number[][]) => {
    if (!meta) return;
    setAddMode(false);
    try {
      const b: Block = await api.addBlock(meta.image_id, quad);
      setMeta({ ...meta, blocks: [...meta.blocks, b] });
      setSelected(b.id);
    } catch (e) {
      flash(`${t.error}: ${(e as Error).message}`);
    }
  };

  const onFindReplace = async (rules: Rule[]) => {
    if (!meta) return 0;
    const out = await api.findReplace(meta.image_id, rules, editList);
    const next: EditMap = {};
    out.forEach((e) => (next[e.block_id] = e));
    const changed = out.filter((e) => edits[e.block_id]?.text !== e.text).length;
    hist.set(next);
    return changed;
  };

  const onExport = async (fmt: ExportFormat, q: number) => {
    if (!meta) return;
    const { blob } = await api.render(meta.image_id, editList, { format: fmt, quality: q });
    const stem = meta.name.replace(/\.[^.]+$/, "") || "image";
    api.download(blob, `${stem}-edited.${fmt === "jpeg" ? "jpg" : fmt}`);
  };

  const onUploadFont = async (f: File) => {
    try {
      const info = await api.uploadFont(f);
      setFonts((fs) => [...fs, info]);
      if (block) changeEdit(block, { font_id: info.id });
    } catch (e) {
      flash(`${t.error}: ${(e as Error).message}`);
    }
  };

  const header = (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-slate-200 bg-white/80 px-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:px-4">
      <div className="flex items-center gap-2 font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
          <ScanText size={18} />
        </span>
        <span className="hidden sm:inline">{t.appName}</span>
      </div>
      {meta && (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
          <button className="icon-btn" onClick={hist.undo} disabled={!hist.canUndo} title={`${t.undo} (Ctrl+Z)`}>
            <Undo2 size={18} />
          </button>
          <button className="icon-btn" onClick={hist.redo} disabled={!hist.canRedo} title={`${t.redo} (Ctrl+Shift+Z)`}>
            <Redo2 size={18} />
          </button>
          <div className="mx-1 hidden rounded-lg bg-slate-100 p-0.5 text-xs dark:bg-slate-800 md:flex">
            {(["edited", "compare", "original"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={clsx(
                  "rounded-md px-2.5 py-1.5",
                  view === v ? "bg-white shadow-sm dark:bg-slate-700" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
                )}
              >
                {v === "edited" ? t.edited : v === "compare" ? t.compare : t.original}
              </button>
            ))}
          </div>
          <button className="icon-btn md:hidden" onClick={() => setView(view === "original" ? "edited" : "original")} title={t.original}>
            <Eye size={18} />
          </button>
        </>
      )}
      <div className="ms-auto flex items-center gap-1">
        {meta && (
          <>
            <button className={clsx("icon-btn", addMode && "bg-amber-100 text-amber-700 dark:bg-amber-500/20")} onClick={() => setAddMode((a) => !a)} title={t.addBlock}>
              <SquareDashedMousePointer size={18} />
            </button>
            <button className="icon-btn" onClick={() => setDialog("find")} title={t.findReplace}>
              <Replace size={18} />
            </button>
          </>
        )}
        <button className={clsx("icon-btn", meta && "hidden sm:inline-flex")} onClick={() => setDialog("batch")} title={t.batch}>
          <Layers size={18} />
        </button>
        <button className={clsx("icon-btn", meta && "hidden sm:inline-flex")} onClick={() => setLang(lang === "ar" ? "en" : "ar")} title={t.lang}>
          <Languages size={18} />
        </button>
        <button className={clsx("icon-btn", meta && "hidden sm:inline-flex")} onClick={theme.toggle} title={t.theme}>
          {theme.dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {meta && (
          <>
            <button className="icon-btn" onClick={() => setMeta(null)} title={t.newImage}>
              <ImagePlus size={18} />
            </button>
            <button className="btn-primary ms-1" onClick={() => setDialog("export")}>
              <Download size={16} />
              <span className="hidden sm:inline">{t.export}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );

  return (
    <div className="flex h-dvh flex-col">
      {header}
      {!meta ? (
        <main className="flex-1 overflow-y-auto">
          <Uploader onFile={onFile} busy={uploading} error={error} />
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col md:flex-row">
          <section className="relative min-h-[45vh] flex-1 bg-slate-100 dark:bg-slate-900/60">
            <Canvas
              width={meta.width}
              height={meta.height}
              blocks={blocks}
              edits={edits}
              originalSrc={api.originalUrl(meta.image_id)}
              previewSrc={preview}
              view={view}
              selectedId={selected}
              onSelect={setSelected}
              addMode={addMode}
              onAddQuad={onAddQuad}
              busy={rendering}
            />
          </section>
          <aside className="flex max-h-[55vh] w-full shrink-0 flex-col border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:max-h-none md:w-[370px] md:border-s">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>
                  {t.texts} ({blocks.length})
                </span>
                {meta.timing && <span className="font-normal tabular-nums">{meta.timing.total.toFixed(1)}s</span>}
              </div>
              {blocks.length === 0 ? (
                <p className="text-sm text-slate-500">{t.noTexts}</p>
              ) : (
                <ul className="max-h-44 space-y-1 overflow-y-auto">
                  {blocks.map((b) => {
                    const e = edits[b.id];
                    return (
                      <li key={b.id}>
                        <button
                          onClick={() => setSelected(b.id)}
                          className={clsx(
                            "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-start text-sm",
                            b.id === selected ? "bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200" : "hover:bg-slate-50 dark:hover:bg-slate-900",
                          )}
                        >
                          <span
                            className={clsx(
                              "h-2 w-2 shrink-0 rounded-full",
                              e ? (e.remove ? "bg-rose-400" : "bg-emerald-500") : "bg-slate-300 dark:bg-slate-600",
                            )}
                          />
                          <span className="min-w-0 flex-1 truncate" dir="auto">
                            {e && !e.remove ? e.text : b.text || "—"}
                          </span>
                          {e && <span className="text-[10px] text-slate-400">{e.remove ? t.removed : t.modified}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {block ? (
                <Inspector
                  key={block.id}
                  block={block}
                  edit={edits[block.id]}
                  fonts={fonts}
                  onChange={(p, merge) => changeEdit(block, p, merge)}
                  onUploadFont={onUploadFont}
                  onDeleteBlock={async () => {
                    await api.deleteBlock(meta.image_id, block.id);
                    const next = { ...edits };
                    delete next[block.id];
                    hist.set(next);
                    setMeta({ ...meta, blocks: meta.blocks.filter((x) => x.id !== block.id) });
                    setSelected(null);
                  }}
                />
              ) : (
                <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
                  {lang === "ar" ? "انقر على أي نص في الصورة أو في القائمة لتعديله." : "Click any text on the image or in the list to edit it."}
                  <br />
                  <span className="text-xs">{t.shortcuts}</span>
                </p>
              )}
            </div>
          </aside>
        </main>
      )}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-xl dark:bg-white dark:text-slate-900">
          {toast}
        </div>
      )}
      {dialog === "find" && <FindReplaceDialog onClose={() => setDialog(null)} onApply={onFindReplace} />}
      {dialog === "export" && <ExportDialog onClose={() => setDialog(null)} onExport={onExport} />}
      {dialog === "batch" && <BatchDialog onClose={() => setDialog(null)} />}
    </div>
  );
}
