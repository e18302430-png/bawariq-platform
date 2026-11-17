"use client";
import { Download, Plus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import * as api from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { ExportFormat, Rule } from "@/lib/types";

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function RuleEditor({ rules, setRules }: { rules: Rule[]; setRules: (r: Rule[]) => void }) {
  const { t } = useI18n();
  const upd = (i: number, p: Partial<Rule>) => setRules(rules.map((r, j) => (j === i ? { ...r, ...p } : r)));
  return (
    <div className="space-y-3">
      {rules.map((r, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-2">
            <input dir="auto" className="field" placeholder={t.find} value={r.find} onChange={(e) => upd(i, { find: e.target.value })} />
            <input dir="auto" className="field" placeholder={t.replaceWith} value={r.replace} onChange={(e) => upd(i, { replace: e.target.value })} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={!!r.case_sensitive} onChange={(e) => upd(i, { case_sensitive: e.target.checked })} />
              {t.matchCase}
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={!!r.whole_word} onChange={(e) => upd(i, { whole_word: e.target.checked })} />
              {t.wholeWord}
            </label>
            {rules.length > 1 && (
              <button className="ms-auto text-rose-500" onClick={() => setRules(rules.filter((_, j) => j !== i))}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
      <button className="btn-ghost" onClick={() => setRules([...rules, { find: "", replace: "" }])}>
        <Plus size={15} /> {t.addRule}
      </button>
    </div>
  );
}

export function FindReplaceDialog({ onClose, onApply }: { onClose: () => void; onApply: (rules: Rule[]) => Promise<number> }) {
  const { t } = useI18n();
  const [rules, setRules] = useState<Rule[]>([{ find: "", replace: "" }]);
  const [msg, setMsg] = useState("");
  return (
    <Modal title={t.findReplace} onClose={onClose}>
      <RuleEditor rules={rules} setRules={setRules} />
      <div className="mt-5 flex items-center gap-3">
        <button
          className="btn-primary"
          disabled={!rules.some((r) => r.find)}
          onClick={async () => setMsg(t.replacedN(await onApply(rules.filter((r) => r.find))))}
        >
          {t.replaceAll}
        </button>
        {msg && <span className="text-sm text-emerald-600 dark:text-emerald-400">{msg}</span>}
      </div>
    </Modal>
  );
}

export function ExportDialog({
  onClose,
  onExport,
  hasAlpha,
}: {
  onClose: () => void;
  onExport: (fmt: ExportFormat, q: number) => Promise<void>;
  hasAlpha?: boolean;
}) {
  const { t } = useI18n();
  const [fmt, setFmt] = useState<ExportFormat>("png");
  const [q, setQ] = useState(95);
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={t.export} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {(["png", "jpeg", "webp"] as ExportFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFmt(f)}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold uppercase ${fmt === f ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" : "border-slate-200 dark:border-slate-700"}`}
            >
              {f === "jpeg" ? "JPG" : f}
            </button>
          ))}
        </div>
        {fmt !== "png" && (
          <label className="block text-sm">
            <span className="mb-1 flex justify-between text-xs text-slate-500">
              <span>{t.quality}</span>
              <span className="tabular-nums">{q}{q >= 100 && fmt === "webp" ? " (lossless)" : ""}</span>
            </span>
            <input type="range" min={60} max={100} value={q} onChange={(e) => setQ(+e.target.value)} className="w-full accent-brand-500" />
          </label>
        )}
        {hasAlpha && fmt === "jpeg" && <p className="text-xs text-amber-600">JPG لا يدعم الشفافية / JPG drops transparency</p>}
        <button
          className="btn-primary w-full justify-center"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onExport(fmt, q);
              onClose();
            } finally {
              setBusy(false);
            }
          }}
        >
          <Download size={16} /> {busy ? t.exporting : t.download}
        </button>
      </div>
    </Modal>
  );
}

export function BatchDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [items, setItems] = useState<{ name: string; id?: string; status: "wait" | "ok" | "err"; n?: number }[]>([]);
  const [rules, setRules] = useState<Rule[]>([{ find: "", replace: "" }]);
  const [fmt, setFmt] = useState<ExportFormat>("png");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const add = async (files: FileList) => {
    const list = Array.from(files);
    const start = items.length;
    setItems((it) => [...it, ...list.map((f) => ({ name: f.name, status: "wait" as const }))]);
    for (let i = 0; i < list.length; i++) {
      try {
        const m = await api.detect(list[i]);
        setItems((it) => it.map((x, j) => (j === start + i ? { ...x, id: m.image_id, status: "ok", n: m.blocks.length } : x)));
      } catch {
        setItems((it) => it.map((x, j) => (j === start + i ? { ...x, status: "err" } : x)));
      }
    }
  };
  const ids = items.filter((i) => i.id).map((i) => i.id!);

  return (
    <Modal title={t.batch} onClose={onClose}>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.batchHint}</p>
      <button className="btn-ghost" onClick={() => ref.current?.click()}>
        <Plus size={15} /> {t.addImages}
      </button>
      <input ref={ref} type="file" multiple accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => e.target.files && add(e.target.files)} />
      {items.length > 0 && (
        <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800">
              <span className="truncate">{it.name}</span>
              <span className="text-xs text-slate-500">
                {it.status === "wait" ? <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /> : it.status === "ok" ? `✓ ${it.n}` : "✗"}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5">
        <RuleEditor rules={rules} setRules={setRules} />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <select className="field w-28" value={fmt} onChange={(e) => setFmt(e.target.value as ExportFormat)}>
          <option value="png">PNG</option>
          <option value="jpeg">JPG</option>
          <option value="webp">WEBP</option>
        </select>
        <button
          className="btn-primary flex-1 justify-center"
          disabled={busy || !ids.length || !rules.some((r) => r.find) || items.some((i) => i.status === "wait")}
          onClick={async () => {
            setBusy(true);
            setErr("");
            try {
              api.download(await api.batch(ids, rules.filter((r) => r.find), fmt), "batch-edited.zip");
            } catch (e) {
              setErr(String((e as Error).message));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Download size={16} /> {busy ? "…" : `${t.runBatch} (${ids.length} ${t.images})`}
        </button>
      </div>
      {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}
    </Modal>
  );
}
