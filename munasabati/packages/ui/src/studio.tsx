import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./icons";
import { repo } from "./data";

/* ═══════════ استوديو مناسبتي: صور بالذكاء الاصطناعي بقوالب ثابتة ═══════════
   بدون كتابة حرة، بدون أشخاص أو وجوه، بدون رفع صور. يمر عبر /api/studio (المفتاح في الخادم). */

export const STUDIO_STYLES: [string, string][] = [["najdi", "نجدي"], ["desert", "ليل الصحراء"], ["gold", "ذهبي فاخر"], ["floral", "ورد"], ["sea", "بحر الخليج"], ["islamic", "زخرفة إسلامية"]];
export const STUDIO_PALETTES: [string, string, string][] = [["rose", "وردي", "#e8b4bc"], ["gold", "ذهبي", "#d9b26a"], ["emerald", "زمردي", "#2f7d62"], ["navy", "كحلي", "#1f2a4d"], ["ivory", "عاجي", "#efe6d6"], ["lilac", "ليلكي", "#b9a6d9"]];
export const STUDIO_SPACES: [string, string][] = [["kosha", "الكوشة"], ["tables", "الطاولات"], ["entrance", "المدخل"], ["stage", "المسرح"]];
export type StudioFeature = "invite-art" | "decor";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const api = (p = "") => (/\/(client|vendors|venues|admin)\//.test(location.pathname) ? "../api/studio" : "./api/studio") + p;

/** يولّد صورة ويرجع رابطها الدائم (ينتظر لين تجهز، حتى دقيقتين) */
export async function generateArt(feature: StudioFeature, preset: { style: string; palette: string; space?: string }): Promise<string> {
  const token = await repo.auth?.token?.();
  if (!token) throw new Error("سجّل الدخول أولاً عشان تستخدم الاستوديو");
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const r = await fetch(api(), { method: "POST", headers: h, body: JSON.stringify({ feature, preset }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "ما قدرنا نبدأ");
  for (let i = 0; i < 40; i++) {
    await wait(3000);
    const p = await fetch(api(`?id=${encodeURIComponent(d.id)}&req=${encodeURIComponent(d.req)}`), { headers: h }).then((x) => x.json()).catch(() => ({ status: "pending" }));
    if (p.status === "done" && p.url) return p.url as string;
    if (p.status === "failed") throw new Error("ما ضبطت الصورة، جرّب طابع ثاني");
  }
  throw new Error("أخذت وقت طويل، جرّب مرة ثانية");
}

/** وسم إلزامي على أي صورة مولّدة */
export function AiTag({ label = "مولّدة بالذكاء الاصطناعي" }: { label?: string }) {
  return <span className="ai-badge" aria-label={label}><Icon name="Sparkles" size={11} /> {label}</span>;
}

/** لوحة الاستوديو: طابع + لون (+ مكان للديكور) ← توليد ← اختيار */
export function StudioPanel({ feature, onUse, title, sub }: { feature: StudioFeature; onUse?: (url: string) => void; title: string; sub: string }) {
  const [style, setStyle] = useState("najdi");
  const [palette, setPalette] = useState("gold");
  const [space, setSpace] = useState("kosha");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [shots, setShots] = useState<string[]>([]);
  const go = async () => {
    setBusy(true); setErr("");
    try { const url = await generateArt(feature, { style, palette, space: feature === "decor" ? space : undefined }); setShots((s) => [url, ...s].slice(0, 8)); }
    catch (e) { setErr((e as Error).message); }
    setBusy(false);
  };
  return (
    <section className="card stack studio">
      <div className="row between wrap"><div><h3 className="card-title"><Icon name="Sparkles" size={17} /> {title}</h3><p className="muted" style={{ margin: 0, fontSize: 13.5 }}>{sub}</p></div><AiTag label="بالذكاء الاصطناعي" /></div>
      {feature === "decor" && <div className="st-row"><span className="st-l">المكان</span><div className="st-chips">{STUDIO_SPACES.map(([id, l]) => <button key={id} className={"chip" + (space === id ? " on" : "")} aria-pressed={space === id} onClick={() => setSpace(id)}>{l}</button>)}</div></div>}
      <div className="st-row"><span className="st-l">الطابع</span><div className="st-chips">{STUDIO_STYLES.map(([id, l]) => <button key={id} className={"chip" + (style === id ? " on" : "")} aria-pressed={style === id} onClick={() => setStyle(id)}>{l}</button>)}</div></div>
      <div className="st-row"><span className="st-l">الألوان</span><div className="st-chips">{STUDIO_PALETTES.map(([id, l, c]) => <button key={id} className={"chip st-sw" + (palette === id ? " on" : "")} aria-pressed={palette === id} onClick={() => setPalette(id)}><i style={{ background: c }} />{l}</button>)}</div></div>
      <button className="btn primary block" disabled={busy} onClick={() => void go()}>{busy ? <><span className="st-spin" aria-hidden="true" /> نرسم لك… (حوالي ٣٠ ثانية)</> : <><Icon name="Sparkles" size={16} /> ارسمها لي</>}</button>
      {err && <p className="field-err" role="alert" style={{ margin: 0 }}>{err}</p>}
      <AnimatePresence initial={false}>{shots.length > 0 && <motion.div className={"st-grid " + feature} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {shots.map((u) => (
          <motion.figure key={u} initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <img src={u} alt="تصميم مولّد بالذكاء الاصطناعي" loading="lazy" />
            <AiTag />
            <figcaption>
              {onUse && <button className="btn sm white" onClick={() => onUse(u)}><Icon name="Check" size={14} /> استخدمها</button>}
              <a className="btn sm glass" href={u} target="_blank" rel="noreferrer" download><Icon name="Download" size={14} /> نزّلها</a>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>}</AnimatePresence>
      <small className="faint" style={{ fontSize: 12 }}>تصاميم توضيحية بدون أشخاص، وما نرسل أي بيانات شخصية لمزود التوليد. عدد محاولات محدود يومياً.</small>
    </section>
  );
}
