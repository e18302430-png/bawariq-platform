import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DB } from "@munasabati/core";
import { Icon } from "@munasabati/ui";

/*
  البث المباشر للإدارة: أي طلب أو تذكرة أو رسالة جديدة تُسمع فوراً.
  محلياً: تتزامن التبويبات عبر حدث storage. سحابياً: قناة Supabase Realtime على bookings و tickets.
*/

export type LiveKind = "booking" | "status" | "message" | "ticket" | "ticket-reply";
export interface LiveEvent { id: string; kind: LiveKind; title: string; sub: string; at: number; tab: string; focus: string }

const SOUND_KEY = "mns.admin.sound";
let ctx: AudioContext | null = null;
const audio = () => {
  try { ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); if (ctx.state === "suspended") void ctx.resume(); } catch { ctx = null; }
  return ctx;
};
/** نغمة جرس ناعمة مرسومة بالكامل في المتصفح (بدون ملفات صوت) */
function chime(kind: LiveKind) {
  const a = audio(); if (!a) return;
  const notes = kind === "booking" ? [659.25, 987.77, 1318.5] : kind === "ticket" ? [880, 739.99, 880] : kind === "status" ? [523.25, 783.99] : [1174.66];
  const t0 = a.currentTime + 0.02;
  notes.forEach((f, i) => {
    const t = t0 + i * 0.13;
    for (const [mult, vol] of [[1, 0.2], [2, 0.05], [3.01, 0.025]] as const) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "sine"; o.frequency.value = f * mult;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + 1.2);
    }
  });
}

const ICON: Record<LiveKind, string> = { booking: "BellRing", status: "RefreshCw", message: "MessageCircle", ticket: "LifeBuoy", "ticket-reply": "MessagesSquare" };

function diff(prev: DB, db: DB): LiveEvent[] {
  const out: LiveEvent[] = [];
  const name = (k: string, id: string) => (k === "venue" ? db.venues.find((v) => v.id === id)?.name : db.suppliers.find((s) => s.id === id)?.name) ?? "";
  const before = new Map(prev.bookings.map((b) => [b.id, b]));
  for (const b of db.bookings) {
    const p = before.get(b.id);
    if (!p) { out.push({ id: "b" + b.id, kind: "booking", title: `طلب جديد من ${b.clientName}`, sub: `إلى ${name(b.kind, b.targetId)} · ${b.city} · ${b.date}`, at: Date.now(), tab: "bookings", focus: b.id }); continue; }
    if (p.status !== b.status) out.push({ id: "s" + b.id + b.status, kind: "status", title: `${name(b.kind, b.targetId)}: ${b.status === "quoted" ? "أرسل عرض سعر" : b.status === "confirmed" ? "تم تأكيد الحجز" : b.status === "declined" ? "اعتذر عن الطلب" : "طلب جديد"}`, sub: `للعميل ${b.clientName}`, at: Date.now(), tab: "bookings", focus: b.id });
    if (b.messages.length > p.messages.length) { const m = b.messages.at(-1)!; out.push({ id: "m" + b.id + b.messages.length, kind: "message", title: `رسالة من ${m.from === "client" ? b.clientName : name(b.kind, b.targetId)}`, sub: m.text.slice(0, 80), at: Date.now(), tab: "bookings", focus: b.id }); }
  }
  const tb = new Map((prev.tickets ?? []).map((t) => [t.id, t]));
  for (const t of db.tickets ?? []) {
    const p = tb.get(t.id);
    if (!p) { out.push({ id: "t" + t.id, kind: "ticket", title: `تذكرة دعم من ${t.fromName}`, sub: t.subject, at: Date.now(), tab: "support", focus: t.id }); continue; }
    const userMsgs = (x: typeof t) => x.messages.filter((m) => m.from === "user").length;
    if (userMsgs(t) > userMsgs(p)) out.push({ id: "r" + t.id + t.messages.length, kind: "ticket-reply", title: `رد جديد من ${t.fromName}`, sub: t.messages.at(-1)!.text.slice(0, 80), at: Date.now(), tab: "support", focus: t.id });
  }
  return out;
}

export function useLive(db: DB) {
  const prev = useRef(db);
  const [feed, setFeed] = useState<LiveEvent[]>([]);
  const [toasts, setToasts] = useState<LiveEvent[]>([]);
  const [unseen, setUnseen] = useState(0);
  const [sound, setSoundState] = useState(() => { try { return localStorage.getItem(SOUND_KEY) !== "0"; } catch { return true; } });
  const soundRef = useRef(sound); soundRef.current = sound;

  // تفعيل الصوت مع أول لمسة (سياسة المتصفحات)
  useEffect(() => { const on = () => audio(); window.addEventListener("pointerdown", on, { once: true }); window.addEventListener("keydown", on, { once: true }); return () => { window.removeEventListener("pointerdown", on); window.removeEventListener("keydown", on); }; }, []);

  useEffect(() => {
    const ev = diff(prev.current, db); prev.current = db;
    if (!ev.length) return;
    setFeed((f) => [...ev.reverse(), ...f].slice(0, 60));
    setToasts((t) => [...ev, ...t].slice(0, 3));
    if (document.hidden) setUnseen((n) => n + ev.length);
    const top = ev.find((e) => e.kind === "booking") ?? ev.find((e) => e.kind === "ticket") ?? ev[0];
    if (soundRef.current) chime(top.kind);
    navigator.vibrate?.(top.kind === "booking" ? [80, 60, 80] : 50);
    try { if (document.hidden && "Notification" in window && Notification.permission === "granted") new Notification(top.title, { body: top.sub, tag: top.id, icon: "favicon.png" }); } catch { /* */ }
    ev.forEach((e) => setTimeout(() => setToasts((t) => t.filter((x) => x.id !== e.id)), 7000));
  }, [db]);

  useEffect(() => { const v = () => { if (!document.hidden) setUnseen(0); }; document.addEventListener("visibilitychange", v); return () => document.removeEventListener("visibilitychange", v); }, []);
  useEffect(() => { document.title = (unseen ? `(${unseen}) ` : "") + "مناسبتي · الإدارة"; }, [unseen]);

  const setSound = (v: boolean) => {
    setSoundState(v); try { localStorage.setItem(SOUND_KEY, v ? "1" : "0"); } catch { /* */ }
    if (v) { chime("message"); try { if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission(); } catch { /* */ } }
  };
  const dismiss = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));
  return { feed, toasts, sound, setSound, dismiss, test: () => chime("booking") };
}

export function LiveBadge({ sound, setSound }: { sound: boolean; setSound: (v: boolean) => void }) {
  return (
    <button className={"btn sm ghost live-badge" + (sound ? " on" : "")} onClick={() => setSound(!sound)} aria-pressed={sound} title={sound ? "كتم صوت التنبيهات" : "تشغيل صوت التنبيهات"}>
      <span className="live-dot" /> مباشر <Icon name={sound ? "Volume2" : "VolumeX"} size={15} />
    </button>
  );
}

export function LiveToasts({ items, onOpen, onClose }: { items: LiveEvent[]; onOpen: (e: LiveEvent) => void; onClose: (id: string) => void }) {
  return (
    <div className="live-toasts" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {items.map((e) => (
          <motion.div key={e.id} layout className={"live-toast " + e.kind} initial={{ opacity: 0, y: -24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: -40 }} transition={{ type: "spring", stiffness: 420, damping: 32 }}>
            <button className="lt-main" onClick={() => { onOpen(e); onClose(e.id); }}>
              <span className="lt-ico"><Icon name={ICON[e.kind]} size={18} /></span>
              <span className="lt-t"><b>{e.title}</b><small>{e.sub}</small></span>
            </button>
            <button className="icon-btn sm" aria-label="إغلاق" onClick={() => onClose(e.id)}><Icon name="X" size={14} /></button>
            <i className="lt-timer" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function LiveFeed({ feed, onOpen }: { feed: LiveEvent[]; onOpen: (e: LiveEvent) => void }) {
  return (
    <section className="card stack live-feed">
      <div className="row between"><h2 className="display" style={{ fontSize: 18, margin: 0 }}><span className="live-dot" /> البث المباشر</h2><small className="muted">يتحدث لحظياً بدون تحديث الصفحة</small></div>
      {feed.length ? <div className="list">{feed.slice(0, 12).map((e) => (
        <button key={e.id} className="list-row adm-row" onClick={() => onOpen(e)}>
          <span className={"avatar lf-" + e.kind}><Icon name={ICON[e.kind]} size={16} /></span>
          <div className="t"><b>{e.title}</b><small>{e.sub}</small></div>
          <small className="muted num">{new Date(e.at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</small>
        </button>
      ))}</div> : <p className="muted" style={{ margin: 0 }}>بانتظار أول حدث… أي طلب أو تذكرة دعم جديدة بتظهر هنا فوراً مع تنبيه صوتي.</p>}
    </section>
  );
}
