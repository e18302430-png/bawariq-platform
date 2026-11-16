import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OCCASIONS, fmt, journey, nextStage, requestConcierge, sar, type Stage } from "@munasabati/core";
import { Counter, Icon, apply, sendLead, useDB, useToast } from "@munasabati/ui";
import f1 from "../assets/scenes/f1-wedding.webp";
import f2 from "../assets/scenes/f2-milka.webp";
import f4 from "../assets/scenes/f4-rooftop.webp";
import f5 from "../assets/scenes/f5-desert.webp";

/** صورة سينمائية لكل نوع مناسبة */
const SCENE: Record<string, string> = { wedding: f1, milka: f2, grad: f4, aqiqa: f2, family: f5, corp: f4 };
import { go } from "../nav";

function useCountdown(iso: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const d = Math.max(0, new Date(`${iso}T20:00:00`).getTime() - now);
  return [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
}

const greet = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? "صباح الخير" : h < 17 ? "نهارك سعيد" : "مساء الخير"; };
const STAGE_ICON: Record<Stage["id"], string> = { plan: "ClipboardList", venue: "Building2", prep: "Sparkles", invite: "Send", day: "ScanLine" };
const STATUS_LABEL: Record<Stage["status"], [string, string]> = { done: ["ok", "مكتملة"], active: ["info", "جارية"], waiting: ["warn", "بانتظار الرد"], todo: ["neutral", "لم تبدأ"] };

export default function Home() {
  const db = useDB();
  const e = db.client.event!;
  const occ = OCCASIONS.find((o) => o.id === e.occasion)!;
  const [d, h, m, s] = useCountdown(e.date);
  const stages = journey(db);
  const next = nextStage(stages, db);
  const doneCount = stages.filter((x) => x.status === "done").length;
  const yes = db.client.guests.filter((g) => g.status === "yes").reduce((a, g) => a + g.count, 0);
  const est = db.client.budget.reduce((a, b) => a + b.est, 0), paid = db.client.budget.reduce((a, b) => a + b.paid, 0);
  // «لوحة المناسبة» للعائلة: ملخص الخطة في رسالة واتساب واحدة للقروب
  const share = () => {
    const nameOf = (k: string, id: string) => (k === "venue" ? db.venues.find((v) => v.id === id)?.name : db.suppliers.find((s) => s.id === id)?.name) ?? "";
    const booked = db.bookings.filter((b) => b.fromClient && b.status === "confirmed").map((b) => `✓ ${nameOf(b.kind, b.targetId)}`);
    const asked = db.bookings.filter((b) => b.fromClient && ["new", "review", "quoted"].includes(b.status)).map((b) => `• ${nameOf(b.kind, b.targetId)} (بانتظار العرض)`);
    const text = [`✨ ${e.title}`, `📅 ${e.date} · ${e.city} · ${fmt(e.guests)} ضيف`, e.budget ? `💰 الميزانية: ${sar(e.budget)}` : "", booked.length || asked.length ? "\nالحجوزات:" : "", ...booked, ...asked, `\nباقي ${d} يوم ⏳`, "رأيكم؟ 🤍", "", `خططتها في مناسبتي: ${location.origin}`].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <>
      <div className="hello">
        <div className="grow"><div className="muted" style={{ fontSize: 14 }}>{greet()} {db.client.profile?.name}</div><h1>رحلة مناسبتك</h1></div>
        <button className="btn sm family-share" onClick={share}><Icon name="Users" size={15} /> شاركها مع العائلة</button>
        <div className="journey-ring" aria-label={`${doneCount} من 5 مراحل مكتملة`}>
          <svg viewBox="0 0 44 44"><defs><linearGradient id="jr-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f7e0a6" /><stop offset=".5" stopColor="#d9ae62" /><stop offset="1" stopColor="#9b6d2c" /></linearGradient></defs><circle cx="22" cy="22" r="19" /><motion.circle cx="22" cy="22" r="19" className="fg" stroke="url(#jr-g)" initial={{ pathLength: 0 }} animate={{ pathLength: doneCount / 5 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} /></svg>
          <b className="num">{doneCount}/5</b>
        </div>
      </div>

      <ConciergeCard />
      <section className="event-card compact">
        <img className="ec-photo" src={SCENE[occ.id] ?? f1} alt="" decoding="async" />
        <div className="meta"><span className="pill" style={{ background: "rgba(255,255,255,.2)", color: "#fff", backdropFilter: "blur(10px)" }}>{occ.name} · {e.city} · {fmt(e.guests)} ضيف</span><span className="num" style={{ opacity: 0.9 }}>{e.date}</span></div>
        <div className="ec-frame" aria-hidden="true" />
        <h2 className="ec-title">{e.title}</h2>
        <div className="cd num" aria-label={`باقي ${d} يوم`}>
          {[[d, "يوم"], [h, "ساعة"], [m, "دقيقة"], [s, "ثانية"]].map(([v, l]) => <div key={l}><b>{String(v).padStart(2, "0")}</b><small>{l}</small></div>)}
        </div>
      </section>

      {/* الخطوة التالية: إجراء واحد واضح */}
      <motion.section key={next.id + next.status} className="next-step" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <div className="row between"><span className="eyebrow">الخطوة التالية</span><span className="pill neutral num">المرحلة {next.n} من 5</span></div>
        <div className="row" style={{ ["--gap" as string]: "14px", alignItems: "flex-start" }}>
          <span className="ns-ico"><Icon name={STAGE_ICON[next.id]} size={24} /></span>
          <div className="grow"><h2>{next.title}</h2><p className="muted">{next.summary}</p></div>
        </div>
        {next.checklist && (
          <div className="chips wrap">
            {next.checklist.map((c) => (
              <button key={c.cat} className={"chip check-chip " + c.state} onClick={() => go(c.state === "none" ? "plan" : "bookings")}>
                <Icon name={c.state === "confirmed" ? "CheckCircle2" : c.state === "pending" ? "Clock" : "Circle"} size={15} />{c.label}
              </button>
            ))}
          </div>
        )}
        {next.cta && <button className="btn primary lg block" onClick={() => go(next.cta!.route)}>{next.cta.label} <Icon name="ArrowLeft" size={18} /></button>}
      </motion.section>

      {/* المراحل الخمس */}
      <section className="card" style={{ paddingBlock: 10 }}>
        <ol className="timeline">
          {stages.map((st) => (
            <li key={st.id} className={"tl " + st.status + (st.id === next.id ? " current" : "")}>
              <span className="tl-dot">{st.status === "done" ? <Icon name="Check" size={15} /> : <span className="num">{st.n}</span>}</span>
              <button className="tl-body" onClick={() => st.cta && go(st.cta.route)} disabled={!st.cta}>
                <span className="row between" style={{ ["--gap" as string]: "8px" }}><b className="display">{st.title}</b>{st.id === next.id ? <span className="pill brand">التالية</span> : <span className={"pill " + STATUS_LABEL[st.status][0]}>{STATUS_LABEL[st.status][1]}</span>}</span>
                <small className="muted">{st.summary}</small>
                {st.status !== "done" && st.progress > 0 && <span className="bar" style={{ height: 5, marginTop: 6 }}><i style={{ width: `${st.progress * 100}%` }} /></span>}
              </button>
            </li>
          ))}
        </ol>
      </section>

      <div className="mini-stats">
        <button onClick={() => go("guests")}><Icon name="UserCheck" size={17} /><span><b className="num"><Counter value={yes} /></b><small>ضيف مؤكد</small></span></button>
        <button onClick={() => go("budget")}><Icon name="Wallet" size={17} /><span>{(e.budget ?? est) ? <><b className="num">{sar(e.budget ?? est)}</b><small>{paid ? `مدفوع ${Math.round((paid / (e.budget ?? est)) * 100)}%` : "ميزانيتك"}</small></> : <><b>حدّدها</b><small>ميزانيتك</small></>}</span></button>
        <button onClick={() => go("tasks")}><Icon name="ListChecks" size={17} /><span><b className="num">{db.client.tasks.filter((t) => t.done).length}/{db.client.tasks.length}</b><small>مهام العائلة</small></span></button>
      </div>
    </>
  );
}

/** «خلّها علينا»: العميل يطلب منسقة تختار له ٣ قاعات ضمن ميزانيته وتنسق كل شي */
function ConciergeCard() {
  const db = useDB();
  const toast = useToast();
  const e = db.client.event!;
  const [phone, setPhone] = useState(db.client.profile?.phone ?? "");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  if (e.coordinator) return (
    <section className="cg-card on"><span className="cg-ico"><Icon name="HeartHandshake" size={20} /></span><div className="grow"><b>منسقتك {e.coordinator.name}</b><small>ترتب لك كل شي ضمن ميزانيتك</small></div>
      <a className="btn sm" href={`https://wa.me/966${e.coordinator.phone.replace(/\D/g, "").replace(/^0/, "")}`} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={15} /> واتساب</a></section>
  );
  if (e.concierge) return (
    <section className="cg-card on"><span className="cg-ico"><Icon name="Hourglass" size={20} /></span><div className="grow"><b>طلبك وصل، ومنسقتك بتتواصل معك</b><small>٣ خيارات قاعات ضمن ميزانيتك خلال ٢٤ ساعة على الواتساب</small></div></section>
  );
  const ph = phone.replace(/\D/g, "").replace(/^966/, "0"), valid = /^05\d{8}$/.test(ph);
  const send = async () => {
    if (!valid) { toast("اكتب رقم جوال صحيح يبدأ بـ 05"); return; }
    if (!ok) { toast("وافق على تواصلنا معك"); return; }
    setBusy(true);
    try {
      await sendLead({ name: db.client.profile?.name || e.title, phone: ph, consent: true, consent_at: new Date().toISOString(), via: "concierge", occasion: e.occasion, guests: String(e.guests), city: e.city, when: e.date, budget: String(e.budget ?? ""), priority: "تنسيق كامل من التطبيق", estimate: e.budget ? `${fmt(e.budget)} ريال` : "" });
      apply(requestConcierge()); toast("وصل طلبك. منسقتك بتكلمك قريب");
    } catch { toast("ما وصل الطلب، جرّب مرة ثانية"); }
    setBusy(false);
  };
  return (
    <section className="cg-card">
      <span className="cg-ico"><Icon name="Sparkles" size={20} /></span>
      <div className="grow"><b>خلّها علينا من الألف للياء</b><small>منسقة تختار لك ٣ قاعات ضمن {e.budget ? <b className="num">{fmt(e.budget)}</b> : "ميزانيتك"} وتنسق كل التجهيزات، وتدفع نفس السعر بدون زيادة.</small>
        <div className="cg-form">
          {!db.client.profile?.phone && <><label className="sr" htmlFor="cg-p">جوالك</label><input id="cg-p" className="input num" dir="ltr" inputMode="tel" placeholder="05xxxxxxxx" value={phone} onChange={(x) => setPhone(x.target.value.slice(0, 16))} /></>}
          <label className="cg-ok"><input type="checkbox" checked={ok} onChange={(x) => setOk(x.target.checked)} /> موافق إن مناسبتي تتواصل معي بخصوص طلبي</label>
          <button className="btn primary sm" disabled={busy} onClick={() => void send()}>{busy ? "لحظة…" : "رتّبوها لي"}</button>
        </div>
      </div>
    </section>
  );
}
