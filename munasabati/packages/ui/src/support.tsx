import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { bookingMessage, openTicket, replyTicket, setTicketStatus, type Booking, type Message, type Ticket } from "@munasabati/core";
import { Icon } from "./icons";
import { Empty, Segmented, Sheet, useToast } from "./components";
import { apply, useDB } from "./data";

export const TOPICS: [Ticket["topic"], string, string][] = [
  ["booking", "حجز أو طلب", "CalendarCheck"],
  ["payment", "دفع أو فاتورة", "Wallet"],
  ["account", "حسابي", "UserCog"],
  ["technical", "مشكلة تقنية", "Bug"],
  ["other", "شي ثاني", "MessageCircle"],
];
const STATUS: Record<Ticket["status"], [string, string]> = { open: ["warn", "بانتظار الرد"], answered: ["ok", "تم الرد"], closed: ["neutral", "مغلقة"] };
export const TicketStatusPill = ({ s }: { s: Ticket["status"] }) => <span className={"pill " + STATUS[s][0]}>{STATUS[s][1]}</span>;
const when = (t: number) => new Date(t).toLocaleString("ar-SA-u-ca-gregory-nu-latn", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** سلسلة رسائل بفقاعات (تُستخدم في الدعم ومحادثة الطلب) */
export function Thread({ items, mine }: { items: { mine: boolean; text: string; at: number; who?: string; admin?: boolean }[]; mine?: string }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [items.length]);
  if (!items.length) return <p className="muted" style={{ textAlign: "center", padding: 20 }}>{mine ?? "ابدأ المحادثة"}</p>;
  return (
    <div className="thread">
      {items.map((m, i) => (
        <motion.div key={i} className={"bubble" + (m.mine ? " me" : "") + (m.admin && !m.mine ? " admin" : "")} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          {m.admin && !m.mine ? <b className="who"><Icon name="ShieldCheck" size={12} /> إدارة مناسبتي</b> : m.who && <b className="who">{m.who}</b>}
          <span>{m.text}</span>
          <time>{when(m.at)}</time>
        </motion.div>
      ))}
      <div ref={end} />
    </div>
  );
}

export function Composer({ onSend, placeholder = "اكتب رسالتك" }: { onSend: (t: string) => void; placeholder?: string }) {
  const [t, setT] = useState("");
  return (
    <form className="composer" onSubmit={(e) => { e.preventDefault(); if (t.trim()) { onSend(t.trim()); setT(""); } }}>
      <label className="sr" htmlFor="cmp">{placeholder}</label>
      <input id="cmp" className="input" placeholder={placeholder} value={t} onChange={(e) => setT(e.target.value)} autoComplete="off" />
      <button className="icon-btn send" type="submit" aria-label="إرسال" disabled={!t.trim()}><Icon name="SendHorizontal" size={18} /></button>
    </form>
  );
}

/** محادثة الطلب بين العميل والتاجر */
export function BookingChat({ booking, me, other }: { booking: Booking; me: Message["from"]; other: string }) {
  const [open, setOpen] = useState(false);
  const unread = booking.messages.filter((m) => m.from !== me).length;
  return (
    <>
      <button className="btn sm" onClick={() => setOpen(true)}><Icon name="MessagesSquare" size={15} /> محادثة{unread ? <span className="pill brand num" style={{ padding: "0 7px" }}>{unread}</span> : null}</button>
      <Sheet open={open} onClose={() => setOpen(false)} title={`محادثة مع ${other}`}>
        <div className="chat-wrap">
          <div className="chat-guard"><Icon name="ShieldCheck" size={14} /> المحادثة بإشراف إدارة مناسبتي لحماية الطرفين</div>
          <Thread items={booking.messages.map((m) => ({ mine: m.from === me, text: m.text, at: m.at, admin: m.from === "admin" }))} mine="اسأل عن التفاصيل، الوقت، أو أي طلب خاص" />
          <Composer onSend={(t) => apply(bookingMessage(booking.id, me, t))} />
        </div>
      </Sheet>
    </>
  );
}

/** مركز الدعم: تذاكر المستخدم مع إدارة المنصة */
export function SupportCenter({ from, fromId, fromName }: { from: Ticket["from"]; fromId: string; fromName: string }) {
  const db = useDB();
  const toast = useToast();
  const mine = (db.tickets ?? []).filter((t) => t.from === from && t.fromId === fromId);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [f, setF] = useState({ topic: "booking" as Ticket["topic"], subject: "", text: "" });
  const cur = mine.find((t) => t.id === openId);

  return (
    <>
      <div className="row between wrap">
        <div><h1 className="page-title">الدعم</h1><p className="page-sub">فريق مناسبتي يرد عليك هنا.</p></div>
        <button className="btn primary" onClick={() => setCreating(true)}><Icon name="LifeBuoy" size={16} /> تذكرة جديدة</button>
      </div>
      <div className="grid-auto" style={{ ["--min" as string]: "150px" }}>
        {TOPICS.slice(0, 4).map(([id, l, ic]) => (
          <button key={id} className="topic-tile" onClick={() => { setF({ ...f, topic: id }); setCreating(true); }}>
            <span className="avatar"><Icon name={ic} size={18} /></span><b className="display">{l}</b>
          </button>
        ))}
      </div>
      <section className="card" style={{ paddingBlock: 6 }}>
        {mine.length ? <div className="list">{mine.map((t) => (
          <button key={t.id} className="list-row" style={{ width: "100%", background: "transparent", border: 0, borderBottom: "1px solid var(--line)", textAlign: "start" }} onClick={() => setOpenId(t.id)}>
            <span className="avatar"><Icon name={TOPICS.find((x) => x[0] === t.topic)?.[2] ?? "MessageCircle"} size={18} /></span>
            <div className="t"><b>{t.subject}</b><small>{t.messages.at(-1)?.from === "admin" ? "رد الدعم: " : ""}{t.messages.at(-1)?.text}</small></div>
            <TicketStatusPill s={t.status} />
          </button>
        ))}</div> : <Empty icon="LifeBuoy" title="ما عندك تذاكر">أي سؤال أو مشكلة، افتح تذكرة ويوصلك الرد هنا.</Empty>}
      </section>

      <Sheet open={creating} onClose={() => setCreating(false)} title="تذكرة دعم جديدة">
        <form className="form" onSubmit={(e) => {
          e.preventDefault();
          apply(openTicket({ from, fromId, fromName, topic: f.topic, subject: f.subject || TOPICS.find((x) => x[0] === f.topic)![1], text: f.text }));
          setF({ topic: "booking", subject: "", text: "" }); setCreating(false); toast("وصلت تذكرتك لفريق الدعم");
        }}>
          <div className="field"><span className="label">الموضوع</span><Segmented value={f.topic} onChange={(v) => setF({ ...f, topic: v })} options={TOPICS.map(([id, l]) => [id, l] as [Ticket["topic"], string])} /></div>
          <div className="field"><label htmlFor="tk-s">العنوان</label><input id="tk-s" className="input" placeholder="مثال: ما وصلني رد على طلب الحجز" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
          <div className="field"><label htmlFor="tk-t">التفاصيل</label><textarea id="tk-t" className="input" required rows={5} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></div>
          <button className="btn primary lg block" type="submit">إرسال</button>
        </form>
      </Sheet>

      <Sheet open={!!cur} onClose={() => setOpenId(null)} title={cur?.subject ?? ""}>
        {cur && <div className="chat-wrap">
          <div className="row between"><TicketStatusPill s={cur.status} />{cur.status !== "closed" ? <button className="btn sm ghost" onClick={() => apply(setTicketStatus(cur.id, "closed"))}>تم حل المشكلة</button> : null}</div>
          <Thread items={cur.messages.map((m) => ({ mine: m.from === "user", text: m.text, at: m.at, who: m.from === "admin" ? "فريق مناسبتي" : undefined }))} />
          {cur.status !== "closed" ? <Composer onSend={(t) => apply(replyTicket(cur.id, "user", t))} /> : <button className="btn" onClick={() => apply(setTicketStatus(cur.id, "open"))}>إعادة فتح التذكرة</button>}
        </div>}
      </Sheet>
    </>
  );
}

/** إعلان الإدارة أعلى التطبيقات */
export function AnnouncementBar() {
  const db = useDB();
  const [hide, setHide] = useState<string | null>(null);
  if (!db.announcement || hide === db.announcement) return null;
  return (
    <div className="announce" role="status"><Icon name="Megaphone" size={16} /><span className="grow">{db.announcement}</span><button className="icon-btn sm" aria-label="إخفاء" onClick={() => setHide(db.announcement!)}><Icon name="X" size={14} /></button></div>
  );
}
