import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OCCASIONS, patchClient, updateEvent, updateGuest, type Guest, type InviteTemplate } from "@munasabati/core";
import { Empty, Icon, QR, Segmented, apply, photoUrl, useDB, useToast } from "@munasabati/ui";

/* ═══════════ الدعوات: قوالب فاخرة + تجربة فتح الظرف للضيف ═══════════ */

export const inviteUrl = (code: string) => `${location.href.split("#")[0]}#invite-${code}`;
/** رسالة الواتساب: رابط الدعوة فقط، بدون أي نص إضافي */
export const waLink = (g: Pick<Guest, "phone" | "code">) => `https://wa.me/${g.phone ? "966" + g.phone.replace(/^0/, "") : ""}?text=${encodeURIComponent(inviteUrl(g.code))}`;

const TEMPLATES: { id: InviteTemplate; name: string; desc: string }[] = [
  { id: "night", name: "ليل", desc: "أسود وذهب" },
  { id: "ivory", name: "عاج", desc: "ورق عاجي" },
  { id: "photo", name: "صورة", desc: "صورة القاعة" },
];
const OCC_LINE: Record<string, string> = { wedding: "يتشرفون بدعوتكم لحضور حفل زواج", milka: "يتشرفون بدعوتكم لحضور حفل ملكة", grad: "يسعدنا حضوركم حفل تخرّج", aqiqa: "يسعدنا حضوركم عقيقة", family: "يسعدنا حضوركم", corp: "يسعدنا حضوركم حفل" };

function useEventInfo() {
  const db = useDB();
  const e = db.client.event;
  if (!e) return null;
  const venueBooking = db.bookings.find((b) => b.fromClient && b.kind === "venue" && b.status === "confirmed");
  const venue = venueBooking ? db.venues.find((v) => v.id === venueBooking.targetId) : undefined;
  const d = new Date(`${e.date}T12:00:00`);
  const time = db.client.invite.time ?? "20:30";
  return {
    e, venue, time,
    occ: OCCASIONS.find((o) => o.id === e.occasion)!,
    day: d.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { weekday: "long" }),
    num: d.getDate(),
    month: d.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { month: "long", year: "numeric" }),
    hijri: d.toLocaleDateString("ar-SA-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "long", year: "numeric" }),
    place: venue ? `${venue.name}، ${venue.district}` : e.city,
    photo: venue?.photos?.[0] ? photoUrl(venue.photos[0]) : photoUrl("media:v1"),
    timeLabel: (() => { const [h, m] = time.split(":").map(Number); const pm = h >= 12; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${pm ? "مساءً" : "صباحاً"}`; })(),
  };
}

/** نمط هندسي إسلامي رفيع (نجمة ثمانية متكررة) */
function Pattern({ color, opacity }: { color: string; opacity: number }) {
  return (
    <svg className="inv-pattern" aria-hidden="true" style={{ opacity }}>
      <defs>
        <pattern id={"p" + color.replace(/\W/g, "")} width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth=".6">
            <rect x="16" y="16" width="24" height="24" /><rect x="16" y="16" width="24" height="24" transform="rotate(45 28 28)" />
            <circle cx="28" cy="28" r="5" /><path d="M0 0L16 16M56 0L40 16M0 56L16 40M56 56L40 40" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#p${color.replace(/\W/g, "")})`} />
    </svg>
  );
}

export function InviteCard({ template, guest, showPass = false }: { template?: InviteTemplate; guest?: Guest | null; showPass?: boolean }) {
  const db = useDB();
  const t = template ?? db.client.invite.template;
  const info = useEventInfo();
  if (!info) return null;
  return (
    <div className={"inv inv-" + t}>
      {t === "photo" && <div className="inv-bgimg"><img src={info.photo} alt="" /></div>}
      {t !== "photo" && <Pattern color={t === "night" ? "#d9b46a" : "#b89a6a"} opacity={t === "night" ? 0.16 : 0.22} />}
      <div className="inv-frame" />
      <div className="inv-body">
        <div className="inv-basmala">بسم الله الرحمن الرحيم</div>
        <div className="inv-lead">{OCC_LINE[info.e.occasion] ?? db.client.invite.message}</div>
        <div className="inv-names">{info.e.title}</div>
        <div className="inv-orn" aria-hidden="true"><i /><svg viewBox="0 0 20 20" width="14" height="14"><path d="M10 0l2.4 7.6L20 10l-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z" fill="currentColor" /></svg><i /></div>
        <div className="inv-date">
          <span>{info.day}</span>
          <b className="num">{info.num}</b>
          <span>{info.month}</span>
        </div>
        <div className="inv-hijri num">{info.hijri}</div>
        <div className="inv-meta"><span className="num">{info.timeLabel}</span><span className="dot" /><span>{info.place}</span></div>
        {db.client.invite.message && <div className="inv-msg">{db.client.invite.message}</div>}
        {guest && <div className="inv-guest">دعوة خاصة لـ <b>{guest.name}</b>{guest.count > 1 ? ` و${guest.count - 1} مرافق` : ""}</div>}
        {guest && showPass && (
          <div className="inv-pass">
            <div className="qr"><QR text={"MNS-" + guest.code} size={220} /></div>
            <div><small>بطاقة الدخول</small><b className="num">{guest.code}</b><small>{guest.section === "men" ? "قسم الرجال" : "قسم النساء"}</small></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───── شاشة صاحب المناسبة: التصميم والإرسال ───── */
export function Invites() {
  const db = useDB();
  const toast = useToast();
  const { invite } = db.client;
  const [filter, setFilter] = useState<"all" | "pending" | "yes">("all");
  const list = db.client.guests.filter((g) => filter === "all" || g.status === filter);
  const replied = db.client.guests.filter((g) => g.status !== "pending").length;
  const copy = async (g: Guest) => { try { await navigator.clipboard.writeText(inviteUrl(g.code)); toast("تم نسخ الرابط"); } catch { toast(g.code); } };

  return (
    <>
      <div className="row between wrap"><div><h1 className="page-title">الدعوات</h1><p className="page-sub num">{replied} من {db.client.guests.length} ردّوا</p></div></div>
      <div className="inv-studio">
        <div className="inv-stage"><InviteCard /></div>
        <section className="card stack" style={{ alignContent: "start" }}>
          <div className="field"><span className="label">القالب</span>
            <div className="tpl-row">
              {TEMPLATES.map((t) => (
                <button key={t.id} className={"tpl" + (invite.template === t.id ? " on" : "")} onClick={() => apply(patchClient({ invite: { ...invite, template: t.id } }))} aria-pressed={invite.template === t.id}>
                  <span className={"tpl-swatch tpl-" + t.id} />
                  <b>{t.name}</b><small>{t.desc}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="field"><label htmlFor="i-t">الأسماء على البطاقة</label><input id="i-t" className="input" value={db.client.event!.title} onChange={(e) => apply(updateEvent({ title: e.target.value }))} /></div>
          <div className="form-2">
            <div className="field"><label htmlFor="i-time">وقت الحفل</label><input id="i-time" type="time" className="input num" value={invite.time ?? "20:30"} onChange={(e) => apply(patchClient({ invite: { ...invite, time: e.target.value } }))} /></div>
            <div className="field"><label htmlFor="i-d">التاريخ</label><input id="i-d" type="date" className="input num" value={db.client.event!.date} onChange={(e) => e.target.value && apply(updateEvent({ date: e.target.value }))} /></div>
          </div>
          <div className="field"><label htmlFor="i-m">سطر إضافي (اختياري)</label><input id="i-m" className="input" placeholder="مثال: وبحضوركم تكتمل الفرحة" value={invite.message} onChange={(e) => apply(patchClient({ invite: { ...invite, message: e.target.value } }))} /></div>
        </section>
      </div>

      <section className="card" style={{ paddingBlock: 6 }}>
        <div className="row between wrap" style={{ marginTop: 14, marginBottom: 6 }}>
          <h3 className="card-title">إرسال الروابط</h3>
          <Segmented value={filter} onChange={setFilter} options={[["all", "الكل"], ["pending", "لم يردّوا"], ["yes", "مؤكدين"]]} />
        </div>
        <p className="faint" style={{ fontSize: 12.5 }}>يوصل الضيف رابط دعوته فقط على الواتساب.</p>
        {list.length ? <div className="list">{list.map((g) => (
          <div key={g.id} className="list-row">
            <span className={"avatar" + (g.section === "women" ? " alt" : "")}>{g.name[0]}</span>
            <div className="t"><b>{g.name}</b><small style={{ color: g.status === "yes" ? "var(--ok)" : g.status === "no" ? "var(--bad)" : undefined }}>{g.status === "yes" ? "سيحضر" : g.status === "no" ? "اعتذر" : "لم يرد"}</small></div>
            <a className="btn sm wa-btn" href={waLink(g)} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={15} /> واتساب</a>
            <button className="icon-btn sm" aria-label="نسخ الرابط" onClick={() => copy(g)}><Icon name="Link" size={15} /></button>
            <a className="icon-btn sm" aria-label="معاينة صفحة الضيف" href={"#invite-" + g.code}><Icon name="Eye" size={15} /></a>
          </div>
        ))}</div> : <Empty icon="Users" title="لا يوجد ضيوف هنا" />}
      </section>
    </>
  );
}

/* ───── صفحة الضيف: ظرف يُفتح ثم البطاقة ───── */
function useCountdown(iso: string, time: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const d = Math.max(0, new Date(`${iso}T${time}:00`).getTime() - now);
  return [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
}

export function GuestInvite({ code }: { code: string }) {
  const db = useDB();
  const g = db.client.guests.find((x) => x.code === code);
  const [opened, setOpened] = useState(false);
  const [count, setCount] = useState(g?.count ?? 1);
  const ev = db.client.event;
  const info = useEventInfo();
  const [d, h, m, s] = useCountdown(ev?.date ?? "2030-01-01", db.client.invite.time ?? "20:30");
  const sparks = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ x: (Math.sin(i * 12.9898) * 0.5 + 0.5) * 100, d: 0.4 + (i % 7) * 0.12, s: 4 + (i % 4) * 3 })), []);

  if (!g || !ev || !info) return <div className="container" style={{ paddingBlock: 60 }}><Empty icon="MailX" title="الدعوة غير موجودة">تأكد من الرابط أو تواصل مع صاحب المناسبة.</Empty></div>;
  const first = g.name.split(/[،,\s]/)[0];
  const start = new Date(`${ev.date}T${db.client.invite.time ?? "20:30"}:00`);
  const fmtCal = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${fmtCal(start)}/${fmtCal(new Date(start.getTime() + 4 * 36e5))}&location=${encodeURIComponent(info.place)}`;
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.place)}`;

  return (
    <div className="guest-page">
      <div className="guest-bg" />
      <div className="guest-in">
        <motion.p className="guest-hi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>حيّاك يا <b>{first}</b></motion.p>
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.button key="env" className="envelope" onClick={() => setOpened(true)} initial={{ opacity: 0, y: 30, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: -40, scale: 0.92 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} aria-label="افتح الدعوة">
              <span className="env-back" />
              <span className="env-flap" />
              <span className="env-seal"><span>م</span></span>
              <span className="env-to">إلى: {g.name}</span>
              <span className="env-cta"><Icon name="Hand" size={16} /> اضغط لفتح الدعوة</span>
            </motion.button>
          ) : (
            <motion.div key="card" className="guest-card" initial={{ opacity: 0, y: 80, scale: 0.88, rotateX: -18 }} animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
              <div className="sparks" aria-hidden="true">{sparks.map((p, i) => <motion.i key={i} style={{ left: `${p.x}%`, width: p.s, height: p.s }} initial={{ y: 0, opacity: 1 }} animate={{ y: -320 - i * 6, opacity: 0 }} transition={{ duration: 1.6, delay: p.d * 0.4, ease: "easeOut" }} />)}</div>
              <InviteCard guest={g} showPass={g.status === "yes"} />
            </motion.div>
          )}
        </AnimatePresence>

        {opened && (
          <motion.div className="guest-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="g-cd num">{[[d, "يوم"], [h, "ساعة"], [m, "دقيقة"], [s, "ثانية"]].map(([v, l]) => <div key={l as string}><b>{String(v).padStart(2, "0")}</b><small>{l}</small></div>)}</div>
            {g.status === "pending" ? (
              <div className="g-rsvp">
                <div className="row between"><span>عدد الحضور</span>
                  <div className="stepper"><button onClick={() => setCount((c) => Math.max(1, c - 1))} aria-label="أقل">−</button><b className="num">{count}</b><button onClick={() => setCount((c) => Math.min(20, c + 1))} aria-label="أكثر">+</button></div>
                </div>
                <div className="row"><button className="btn white lg grow" onClick={() => apply(updateGuest(g.id, { status: "yes", count }))}>بحضر إن شاء الله</button><button className="btn glass lg" onClick={() => apply(updateGuest(g.id, { status: "no" }))}>أعتذر</button></div>
              </div>
            ) : (
              <div className="g-done">{g.status === "yes" ? <><Icon name="CheckCircle2" size={20} /> بانتظارك. اعرض بطاقة الدخول عند الباب.</> : <>شكراً لردك، نتمنى نشوفك قريب.</>}<button onClick={() => apply(updateGuest(g.id, { status: "pending" }))}>تغيير</button></div>
            )}
            <div className="row"><a className="btn glass grow" href={map} target="_blank" rel="noreferrer"><Icon name="MapPin" size={16} /> الموقع</a><a className="btn glass grow" href={cal} target="_blank" rel="noreferrer"><Icon name="CalendarPlus" size={16} /> أضف للتقويم</a></div>
          </motion.div>
        )}
        <a className="g-back" href="#home">للتجربة: ارجع للوحة صاحب المناسبة</a>
      </div>
    </div>
  );
}
