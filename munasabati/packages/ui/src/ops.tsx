import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OPS_NAME, type OpsMsg } from "@munasabati/core";
import { Icon } from "./icons";
import { ding } from "./provider";
import { useToast } from "./components";

/*
  غرفة التنسيق ليلة المناسبة: نفس المكوّن عند صاحب المناسبة والمنسقين والإدارة.
  كل طرف يشوف الرسائل لحظياً، والتنبيه العاجل يرن ويهتز عند الكل.
*/
const TONE: Record<OpsMsg["from"], string> = { client: "c", admin: "a", all: "g", men: "m", women: "w" };
const ICON: Record<OpsMsg["from"], string> = { client: "Crown", admin: "ShieldCheck", all: "Radio", men: "User", women: "UserRound" };
const ago = (t: number) => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? "الآن" : m < 60 ? `قبل ${m} د` : `قبل ${Math.round(m / 60)} س`; };

/** يرن ويهتز ويعرض تنبيه لما توصل رسالة جديدة من طرف ثاني */
export function useOpsAlerts(ops: OpsMsg[], me: OpsMsg["from"]) {
  const toast = useToast();
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!seen.current) { seen.current = new Set(ops.map((o) => o.id)); return; }
    const fresh = ops.filter((o) => !seen.current!.has(o.id) && o.from !== me);
    ops.forEach((o) => seen.current!.add(o.id));
    if (!fresh.length) return;
    const last = fresh[fresh.length - 1];
    ding();
    try { navigator.vibrate?.(last.kind === "alert" ? [120, 60, 120, 60, 120] : [60]); } catch { /* */ }
    toast(`${last.kind === "alert" ? "⚠️ " : ""}${OPS_NAME[last.from]}: ${last.text}`);
  }, [ops, me, toast]);
}

export function OpsFeed({ ops, me, quick, onSend, title = "غرفة التنسيق", sub, dark }: {
  ops: OpsMsg[]; me: OpsMsg["from"]; quick: [string, OpsMsg["kind"]][]; onSend: (text: string, kind: OpsMsg["kind"]) => void | Promise<unknown>;
  title?: string; sub?: string; dark?: boolean;
}) {
  const [t, setT] = useState("");
  const [urgent, setUrgent] = useState(false);
  const list = ops.slice(-30);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = box.current; if (el) el.scrollTop = el.scrollHeight; }, [list.length]);
  const send = (text: string, kind: OpsMsg["kind"]) => { if (!text.trim()) return; void onSend(text.trim(), kind); };
  return (
    <section className={"ops" + (dark ? " dark" : "")}>
      <header className="ops-head">
        <span className="ops-live"><span className="live-dot-c" /> مباشر</span>
        <div className="grow"><b className="display">{title}</b>{sub && <small>{sub}</small>}</div>
        <div className="ops-who" aria-hidden="true">{(["client", "admin", "all", "men", "women"] as const).map((f) => <span key={f} className={"ops-dot " + TONE[f]} title={OPS_NAME[f]}><Icon name={ICON[f]} size={12} /></span>)}</div>
      </header>
      <div className="ops-list" ref={box} role="log" aria-live="polite">
        {list.length ? <AnimatePresence initial={false}>{list.map((o) => (
          <motion.div key={o.id} className={"ops-msg " + TONE[o.from] + (o.from === me ? " me" : "") + (o.kind === "alert" ? " alert" : "") + (o.kind === "done" ? " done" : "")} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <span className={"ops-dot " + TONE[o.from]}><Icon name={o.kind === "alert" ? "TriangleAlert" : o.kind === "done" ? "PartyPopper" : ICON[o.from]} size={12} /></span>
            <div className="grow"><small>{o.from === me ? "أنت" : OPS_NAME[o.from]} · {ago(o.at)}</small><p>{o.text}</p></div>
          </motion.div>
        ))}</AnimatePresence> : <p className="ops-empty">ما فيه رسائل للحين. أي تنبيه من المنسقين أو الإدارة يظهر هنا فوراً.</p>}
      </div>
      <div className="ops-quick">{quick.map(([q, k]) => <button key={q} type="button" className={"chip" + (k === "alert" ? " alert" : "")} onClick={() => send(q, k)}>{k === "alert" && <Icon name="TriangleAlert" size={13} />}{q}</button>)}</div>
      <form className="ops-form" onSubmit={(e) => { e.preventDefault(); send(t, urgent ? "alert" : "msg"); setT(""); setUrgent(false); }}>
        <button type="button" className={"icon-btn sm" + (urgent ? " on" : "")} aria-pressed={urgent} aria-label="تنبيه عاجل" title="تنبيه عاجل" onClick={() => setUrgent((u) => !u)}><Icon name="Siren" size={16} /></button>
        <label className="sr" htmlFor={"ops-" + me}>رسالة</label>
        <input id={"ops-" + me} className="input grow" placeholder={urgent ? "تنبيه عاجل للكل…" : "اكتب للفريق…"} value={t} onChange={(e) => setT(e.target.value)} autoComplete="off" />
        <button className="icon-btn send" type="submit" aria-label="إرسال" disabled={!t.trim()}><Icon name="SendHorizontal" size={18} /></button>
      </form>
    </section>
  );
}
