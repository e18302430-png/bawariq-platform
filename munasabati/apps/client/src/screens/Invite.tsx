import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OCCASIONS, greetingFor, patchClient, removeGuest, renewGuestCode, resetInvite, today, updateEvent, updateGuest, type DB, type Guest, type InviteTemplate, type ProgramItem } from "@munasabati/core";
import { DBProvider, Empty, Icon, QR, Segmented, Splash, apply, photoUrl, repo, useDB, useToast } from "@munasabati/ui";
import balad from "../assets/invite/balad.webp";
import baladSm from "../assets/invite/balad-sm.webp";
import diriyah from "../assets/invite/diriyah.webp";
import diriyahSm from "../assets/invite/diriyah-sm.webp";
import ula from "../assets/invite/ula.webp";
import ulaSm from "../assets/invite/ula-sm.webp";
import arch from "../assets/invite/arch.webp";

/* ═══════════ الدعوات: لوحات مائية سعودية + ظرف بختم + اكشط لتكشف ═══════════ */

export const inviteUrl = (code: string) => `${location.href.split("#")[0]}#invite-${code}`;
/** رسالة الواتساب: رابط الدعوة فقط، بدون أي نص إضافي */
export const waLink = (g: Pick<Guest, "phone" | "code">) => `https://wa.me/${g.phone ? "966" + g.phone.replace(/^0/, "") : ""}?text=${encodeURIComponent(inviteUrl(g.code))}`;

const WATERCOLOR: Partial<Record<InviteTemplate, { img: string; sm: string; tint: string; deep: string }>> = {
  balad: { img: balad, sm: baladSm, tint: "#5f8e93", deep: "#2f4f53" },
  diriyah: { img: diriyah, sm: diriyahSm, tint: "#c98a5e", deep: "#6b3b25" },
  ula: { img: ula, sm: ulaSm, tint: "#b07a8a", deep: "#5b3346" },
};
const TEMPLATES: { id: InviteTemplate; name: string; desc: string }[] = [
  { id: "diriyah", name: "الدرعية", desc: "غروب نجدي" },
  { id: "balad", name: "جدة التاريخية", desc: "رواشين وأبواب" },
  { id: "ula", name: "العُلا", desc: "صخور وسماء" },
  { id: "night", name: "ليل", desc: "أسود وذهب" },
  { id: "ivory", name: "عاج", desc: "ورق كلاسيكي" },
  { id: "photo", name: "صورة القاعة", desc: "من حجزك" },
];
const OCC_LINE: Record<string, string> = { wedding: "يتشرفون بدعوتكم لحضور حفل زواج", milka: "يتشرفون بدعوتكم لحضور حفل ملكة", grad: "يسعدنا حضوركم حفل تخرّج", aqiqa: "يسعدنا حضوركم عقيقة", family: "يسعدنا حضوركم", corp: "يسعدنا حضوركم حفل" };
const DEFAULT_PROGRAM: ProgramItem[] = [{ title: "الاستقبال", time: "20:30" }, { title: "الزفّة", time: "23:00" }, { title: "العشاء", time: "00:00" }];
const PROGRAM_ICON: Record<string, string> = { "الاستقبال": "DoorOpen", "السامر": "Drum", "العرضة": "Drum", "الزفّة": "Music", "العشاء": "UtensilsCrossed", "الملكة": "Heart" };

const time12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "مساءً" : h < 4 ? "بعد منتصف الليل" : "صباحاً"}`; };

function useEventInfo() {
  const db = useDB();
  const e = db.client.event;
  if (!e) return null;
  const inv = db.client.invite;
  const venueBooking = db.bookings.find((b) => b.fromClient && b.kind === "venue" && b.status === "confirmed");
  const venue = venueBooking ? db.venues.find((v) => v.id === venueBooking.targetId) : undefined;
  const d = new Date(`${e.date}T12:00:00`);
  const time = inv.time ?? "20:30";
  const couple = (inv.couple ?? e.title.replace(/^(زواج|ملكة|تخرّج|عقيقة|لمّة عائلية|مناسبة شركة)\s*/, "")).trim() || e.title;
  const initials = couple.split(/\s+و\s*|\s*&\s*|\s+/).filter((w) => w && w !== "و").slice(0, 2).map((w) => w.replace(/^ال/, "")[0]);
  return {
    e, venue, time, couple, initials,
    occ: OCCASIONS.find((o) => o.id === e.occasion)!,
    day: d.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { weekday: "long" }),
    num: d.getDate(),
    month: d.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { month: "long", year: "numeric" }),
    hijri: d.toLocaleDateString("ar-SA-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "long", year: "numeric" }),
    place: venue ? `${venue.name}، ${venue.district}` : e.city,
    photo: venue?.photos?.[0] ? photoUrl(venue.photos[0]) : photoUrl("media:v1"),
    timeLabel: time12(time),
    program: inv.program?.length ? inv.program : DEFAULT_PROGRAM,
  };
}

/** إكليل ذهبي بالحروف الأولى */
function Monogram({ initials, size = 120, color = "#b8893b" }: { initials: string[]; size?: number; color?: string }) {
  const leaves = Array.from({ length: 11 }, (_, i) => i);
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className="monogram">
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(60 60) scale(${side} 1)`} fill="none" stroke={color} strokeWidth="1.1">
          <path d="M-4 48 C-38 40 -52 8 -40 -30" />
          {leaves.map((i) => { const a = (-100 + i * 15) * (Math.PI / 180), r = 46; const x = Math.cos(a) * r * 0.92 - 4, y = -Math.sin(a) * r * 0.98; return <ellipse key={i} cx={x} cy={y} rx="3.2" ry="7" transform={`rotate(${-(a * 180) / Math.PI + 60} ${x} ${y})`} fill={color} fillOpacity=".18" />; })}
        </g>
      ))}
      <path d="M60 104 l3 -3 l3 3 l-3 3 z" fill={color} />
      <text x="60" y="66" textAnchor="middle" fontFamily="Aref Ruqaa, serif" fontSize="30" fontWeight="700" fill={color}>{initials.join(" | ")}</text>
    </svg>
  );
}

/* ───── ميل ثلاثي الأبعاد + لمعة ضوء (بالماوس أو اللمس، وبحركة الجوال عند النشر) ───── */
export function Tilt({ children, max = 9 }: { children: React.ReactNode; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!; let raf = 0; let tx = 0, ty = 0, cx = 0, cy = 0, lx = 50, ly = 30, clx = 50, cly = 30;
    const set = (px: number, py: number) => { tx = (py - 0.5) * -max; ty = (px - 0.5) * max; lx = px * 100; ly = py * 100; };
    const onMove = (e: PointerEvent) => { const r = el.getBoundingClientRect(); set(clamp01((e.clientX - r.left) / r.width), clamp01((e.clientY - r.top) / r.height)); };
    const onLeave = () => set(0.5, 0.35);
    const onTilt = (e: DeviceOrientationEvent) => { if (e.beta == null || e.gamma == null) return; set(clamp01(0.5 + e.gamma / 50), clamp01(0.5 + (e.beta - 45) / 50)); };
    const loop = () => {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; clx += (lx - clx) * 0.12; cly += (ly - cly) * 0.12;
      el.style.transform = `perspective(1100px) rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`;
      el.style.setProperty("--lx", clx.toFixed(1) + "%"); el.style.setProperty("--ly", cly.toFixed(1) + "%");
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", onMove); el.addEventListener("pointerleave", onLeave);
    window.addEventListener("deviceorientation", onTilt);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); window.removeEventListener("deviceorientation", onTilt); };
  }, [max]);
  return <div ref={ref} className="tilt">{children}<span className="tilt-light" aria-hidden="true" /></div>;
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ───── البطاقة (معاينة وصفحة الضيف) ───── */
export function InviteCard({ template, guest, showPass = false, scratch }: { template?: InviteTemplate; guest?: Guest | null; showPass?: boolean; scratch?: React.ReactNode }) {
  const db = useDB();
  const t = template ?? db.client.invite.template;
  const info = useEventInfo();
  if (!info) return null;
  const wc = WATERCOLOR[t];
  const dateBlock = (
    <div className="inv-date">
      <span>{info.day}</span>
      <b className="num">{info.num}</b>
      <span>{info.month}</span>
    </div>
  );

  if (wc) {
    return (
      <div className="wc-card" style={{ ["--wc-tint" as string]: wc.tint, ["--wc-deep" as string]: wc.deep }}>
        <img className="wc-scene" src={wc.img} alt="" loading="lazy" decoding="async" />
        <img className="wc-arch" src={arch} alt="" loading="lazy" decoding="async" />
        <div className="wc-body">
          <Monogram initials={info.initials} size={96} color={wc.deep} />
          <div className="wc-lead">{OCC_LINE[info.e.occasion]}</div>
          <div className="wc-names">{info.couple}</div>
          {scratch ?? dateBlock}
          <div className="wc-hijri num">{info.hijri}</div>
          <div className="wc-meta"><span className="num">{info.timeLabel}</span><i /><span>{info.place}</span></div>
          {db.client.invite.message && <div className="wc-msg">{db.client.invite.message}</div>}
          {guest && showPass && <Pass guest={guest} />}
        </div>
      </div>
    );
  }

  return (
    <div className={"inv inv-" + t}>
      {t === "photo" && <div className="inv-bgimg"><img src={info.photo} alt="" /></div>}
      {t !== "photo" && <Pattern color={t === "night" ? "#d9b46a" : "#b89a6a"} opacity={t === "night" ? 0.16 : 0.22} />}
      <div className="inv-frame" />
      <div className="inv-body">
        <div className="inv-basmala">بسم الله الرحمن الرحيم</div>
        <div className="inv-lead">{OCC_LINE[info.e.occasion]}</div>
        <div className="inv-names">{info.couple}</div>
        <div className="inv-orn" aria-hidden="true"><i /><svg viewBox="0 0 20 20" width="14" height="14"><path d="M10 0l2.4 7.6L20 10l-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z" fill="currentColor" /></svg><i /></div>
        {scratch ?? dateBlock}
        <div className="inv-hijri num">{info.hijri}</div>
        <div className="inv-meta"><span className="num">{info.timeLabel}</span><span className="dot" /><span>{info.place}</span></div>
        {db.client.invite.message && <div className="inv-msg">{db.client.invite.message}</div>}
        {guest && showPass && <Pass guest={guest} />}
      </div>
    </div>
  );
}

function Pass({ guest }: { guest: Guest }) {
  return (
    <div className="inv-pass">
      <div className="qr"><QR text={"MNS-" + guest.code} size={220} /></div>
      <div><small>بطاقة الدخول</small><b className="num">{guest.code}</b><small>{guest.section === "men" ? "قسم الرجال" : "قسم النساء"}{guest.count > 1 ? ` · ${guest.count} أشخاص` : ""}</small></div>
    </div>
  );
}

function Pattern({ color, opacity }: { color: string; opacity: number }) {
  const id = "p" + color.replace(/\W/g, "");
  return (
    <svg className="inv-pattern" aria-hidden="true" style={{ opacity }}>
      <defs><pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse"><g fill="none" stroke={color} strokeWidth=".6"><rect x="16" y="16" width="24" height="24" /><rect x="16" y="16" width="24" height="24" transform="rotate(45 28 28)" /><circle cx="28" cy="28" r="5" /><path d="M0 0L16 16M56 0L40 16M0 56L16 40M56 56L40 40" /></g></pattern></defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ───── اكشط لتكشف الموعد ───── */
function Scratch({ children, onReveal, tint }: { children: React.ReactNode; onReveal: () => void; tint: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const drawing = useRef(false);
  const moves = useRef(0);

  useEffect(() => {
    const c = ref.current!; const r = c.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = r.width * dpr; c.height = r.height * dpr;
    const x = c.getContext("2d")!; x.scale(dpr, dpr);
    const g = x.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, "#c9a35a"); g.addColorStop(0.35, "#f3dc9f"); g.addColorStop(0.55, "#b8893b"); g.addColorStop(0.8, "#f0d48f"); g.addColorStop(1, "#a97a32");
    x.fillStyle = g; x.fillRect(0, 0, r.width, r.height);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.18})`; x.fillRect(Math.random() * r.width, Math.random() * r.height, 1, 1); }
    x.fillStyle = "rgba(90,60,20,.75)"; x.font = "600 15px Alexandria, sans-serif"; x.textAlign = "center"; x.direction = "rtl";
    x.fillText("اكشط هنا لتعرف الموعد ✦", r.width / 2, r.height / 2 + 5);
  }, []);

  const check = () => {
    const c = ref.current; if (!c || done) return;
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data; let clear = 0;
    for (let i = 3; i < d.length; i += 64) if (d[i] < 40) clear++;
    if (clear / (d.length / 64) > 0.4) { setDone(true); onReveal(); }
  };
  const scratchAt = (e: React.PointerEvent) => {
    if (!drawing.current || done) return;
    const c = ref.current!; const r = c.getBoundingClientRect(); const x = c.getContext("2d")!;
    x.globalCompositeOperation = "destination-out";
    x.beginPath(); x.arc(e.clientX - r.left, e.clientY - r.top, 24, 0, Math.PI * 2); x.fill();
    if (++moves.current % 10 === 0) check();
  };

  return (
    <div className={"scratch" + (done ? " done" : "")} style={{ ["--wc-tint" as string]: tint }}>
      {children}
      <AnimatePresence>
        {!done && (
          <motion.canvas ref={ref} className="scratch-foil" exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.5 }}
            onPointerDown={(e) => { drawing.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); scratchAt(e); }}
            onPointerMove={scratchAt} onPointerUp={() => { drawing.current = false; check(); }} aria-label="اكشط لتكشف التاريخ" />
        )}
      </AnimatePresence>
      {!done && <button className="scratch-skip" onClick={() => { setDone(true); onReveal(); }}>اكشف مباشرة</button>}
    </div>
  );
}

function Confetti({ fire }: { fire: number }) {
  const bits = useMemo(() => Array.from({ length: 46 }, (_, i) => ({ x: (i * 37) % 100, r: (i * 53) % 360, d: 0.9 + (i % 5) * 0.25, c: ["#d9b46a", "#f3dc9f", "#e7a9b8", "#ffffff", "#b8893b"][i % 5], w: 6 + (i % 3) * 3 })), []);
  if (!fire) return null;
  return (
    <div className="confetti" key={fire} aria-hidden="true">
      {bits.map((b, i) => <motion.i key={i} style={{ left: `${b.x}%`, background: b.c, width: b.w, height: b.w * 0.45 }} initial={{ y: -30, opacity: 1, rotate: 0 }} animate={{ y: 560, opacity: [1, 1, 0], rotate: b.r * 3, x: (i % 2 ? 1 : -1) * (20 + (i % 7) * 10) }} transition={{ duration: b.d * 1.6, ease: "easeIn" }} />)}
    </div>
  );
}

/* ───── شاشة صاحب المناسبة: التصميم والإرسال ───── */
export function Invites() {
  const db = useDB();
  const toast = useToast();
  const { invite } = db.client;
  const info = useEventInfo();
  const [filter, setFilter] = useState<"all" | "pending" | "yes">("all");
  const [editing, setEditing] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [rowAsk, setRowAsk] = useState<string | null>(null);
  const list = db.client.guests.filter((g) => filter === "all" || g.status === filter);
  const replied = db.client.guests.filter((g) => g.status !== "pending").length;
  const program = invite.program?.length ? invite.program : DEFAULT_PROGRAM;
  const setInv = (patch: Partial<typeof invite>) => apply(patchClient({ invite: { ...invite, ...patch } }));
  const copy = async (g: Guest) => {
    const url = inviteUrl(g.code);
    // على الجوال: قائمة المشاركة الأصلية (واتساب، رسائل، سناب…)، وإلا نسخ الرابط
    try { if (navigator.share) { await navigator.share({ url }); return; } } catch { /* أُلغيت المشاركة */ return; }
    try { await navigator.clipboard.writeText(url); toast("تم نسخ الرابط"); } catch { toast(g.code); }
  };
  const sample = db.client.guests[0];

  return (
    <>
      <div className="row between wrap">
        <div><h1 className="page-title">الدعوات</h1><p className="page-sub num">{replied} من {db.client.guests.length} ردّوا</p></div>
        {sample && <a className="btn" href={"#invite-" + sample.code}><Icon name="Eye" size={16} /> جرّب تجربة الضيف</a>}
      </div>
      <div className="inv-studio">
        <div className="inv-stage"><Tilt><InviteCard /></Tilt></div>
        {!editing ? (
          <section className="card stack inv-summary" style={{ alignContent: "start" }}>
            <div className="row between"><b className="display" style={{ fontSize: 18 }}>دعوتك</b><span className="pill neutral">{TEMPLATES.find((t) => t.id === invite.template)?.name}</span></div>
            <dl className="inv-kv">
              <dt>العروسان</dt><dd>{invite.couple || info?.couple || "—"}</dd>
              <dt>التاريخ</dt><dd className="num">{db.client.event!.date} · {invite.time ?? "20:30"}</dd>
              <dt>البرنامج</dt><dd>{program.map((p) => `${p.title} ${p.time}`).join(" · ")}</dd>
              {invite.message && <><dt>سطر الختام</dt><dd>{invite.message}</dd></>}
              {invite.kids != null && <><dt>الأطفال</dt><dd>{invite.kids ? "مرحّب فيهم" : "للكبار فقط"}</dd></>}
            </dl>
            <button className="btn primary lg block" onClick={() => setEditing(true)}><Icon name="Pencil" size={17} /> تعديل الدعوة</button>
            {!askDelete ? <button className="btn ghost" style={{ color: "var(--bad)" }} onClick={() => setAskDelete(true)}><Icon name="Trash2" size={16} /> حذف الدعوة</button> : (
              <div className="card flat stack" style={{ background: "var(--bad-soft)", borderColor: "transparent" }}>
                <b>متأكد؟</b>
                <span style={{ fontSize: 13.5 }}>يرجع التصميم للأصل، وكل الروابط اللي أرسلتها للضيوف تتوقف. قائمة الضيوف تبقى، وتقدر ترسل لهم روابط جديدة.</span>
                <div className="row"><button className="btn grow" style={{ background: "var(--bad)", color: "#fff", borderColor: "transparent" }} onClick={() => { apply(resetInvite()); setAskDelete(false); toast("حذفنا الدعوة وألغينا الروابط القديمة"); }}>نعم، احذفها</button><button className="btn ghost" onClick={() => setAskDelete(false)}>تراجع</button></div>
              </div>
            )}
          </section>
        ) : (
        <section className="card stack" style={{ alignContent: "start" }}>
          <div className="field"><span className="label">التصميم</span>
            <div className="tpl-row">
              {TEMPLATES.map((t) => (
                <button key={t.id} className={"tpl" + (invite.template === t.id ? " on" : "")} onClick={() => setInv({ template: t.id })} aria-pressed={invite.template === t.id}>
                  {WATERCOLOR[t.id] ? <img className="tpl-swatch" src={WATERCOLOR[t.id]!.sm} alt="" /> : <span className={"tpl-swatch tpl-" + t.id} />}
                  <b>{t.name}</b><small>{t.desc}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="field"><label htmlFor="i-c">اسما العروسين</label><input id="i-c" className="input" placeholder="مثال: عبدالله ونورة" value={invite.couple ?? info?.couple ?? ""} onChange={(e) => setInv({ couple: e.target.value })} /></div>
          <div className="form-2">
            <div className="field"><label htmlFor="i-d">التاريخ</label><input id="i-d" type="date" className="input num" value={db.client.event!.date} onChange={(e) => e.target.value && apply(updateEvent({ date: e.target.value }))} /></div>
            <div className="field"><label htmlFor="i-time">بداية الحفل</label><input id="i-time" type="time" className="input num" value={invite.time ?? "20:30"} onChange={(e) => setInv({ time: e.target.value })} /></div>
          </div>
          <div className="field"><span className="label">برنامج الحفل</span>
            <div className="stack" style={{ ["--gap" as string]: "8px" }}>
              {program.map((p, i) => (
                <div key={i} className="row">
                  <label className="sr" htmlFor={"pg-t" + i}>الفقرة</label>
                  <input id={"pg-t" + i} className="input grow" value={p.title} onChange={(e) => setInv({ program: program.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })} />
                  <label className="sr" htmlFor={"pg-h" + i}>الوقت</label>
                  <input id={"pg-h" + i} type="time" className="input num" style={{ width: 130 }} value={p.time} onChange={(e) => setInv({ program: program.map((x, k) => (k === i ? { ...x, time: e.target.value } : x)) })} />
                  <button className="icon-btn sm" aria-label="حذف الفقرة" onClick={() => setInv({ program: program.filter((_, k) => k !== i) })}><Icon name="X" size={14} /></button>
                </div>
              ))}
              {program.length < 6 && <button className="btn sm ghost" style={{ justifySelf: "start" }} onClick={() => setInv({ program: [...program, { title: "فقرة جديدة", time: "22:00" }] })}><Icon name="Plus" size={14} /> فقرة</button>}
            </div>
          </div>
          <div className="field"><label htmlFor="i-m">سطر ختامي (اختياري)</label><input id="i-m" className="input" placeholder="مثال: وبحضوركم تكتمل فرحتنا" value={invite.message} onChange={(e) => setInv({ message: e.target.value })} /></div>
          <div className="field"><span className="label">الأطفال</span><Segmented value={invite.kids == null ? "none" : invite.kids ? "yes" : "no"} onChange={(v) => setInv({ kids: v === "none" ? undefined : v === "yes" })} options={[["none", "بدون ذكر"], ["yes", "مرحّب فيهم"], ["no", "للكبار فقط"]]} /></div>
          <div className="form-submit inv-done"><button className="btn primary lg block" onClick={() => { setEditing(false); toast("حفظنا دعوتك"); }}><Icon name="Check" size={17} /> تم</button></div>
        </section>
        )}
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
            <button className="icon-btn sm" aria-label={"خيارات دعوة " + g.name} aria-expanded={rowAsk === g.id} onClick={() => setRowAsk(rowAsk === g.id ? null : g.id)}><Icon name={rowAsk === g.id ? "X" : "MoreHorizontal"} size={15} /></button>
            {rowAsk === g.id && <div className="inv-row-menu">
              <button className="btn sm" onClick={() => { void copy(g); setRowAsk(null); }}><Icon name="Share2" size={14} /> مشاركة الرابط</button>
              <a className="btn sm" href={"#invite-" + g.code}><Icon name="Eye" size={14} /> معاينة</a>
              <button className="btn sm" onClick={() => { apply(renewGuestCode(g.id)); setRowAsk(null); toast(`رابط جديد لـ ${g.name.split(/[،,\s]/)[0]}، والقديم توقف`); }}><Icon name="RefreshCw" size={14} /> رابط جديد</button>
              <button className="btn sm" style={{ color: "var(--bad)" }} onClick={() => { apply(removeGuest(g.id)); setRowAsk(null); toast("حذفنا دعوة الضيف"); }}><Icon name="Trash2" size={14} /> حذف الدعوة</button>
            </div>}
          </div>
        ))}</div> : <Empty icon="Users" title="لا يوجد ضيوف هنا" />}
      </section>
    </>
  );
}

/* ───── صفحة الضيف: ظرف بلوحة مائية وختم ← البطاقة ← اكشط ← البرنامج والرد ───── */
function useCountdown(iso: string, time: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const d = Math.max(0, new Date(`${iso}T${time}:00`).getTime() - now);
  return [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
}

function GuestInviteView({ code, rsvp }: { code: string; rsvp: (id: string, patch: Partial<Guest>) => void }) {
  const db = useDB();
  const g = db.client.guests.find((x) => x.code === code);
  const info = useEventInfo();
  const [stage, setStage] = useState<"envelope" | "opening" | "open">("envelope");
  const [revealed, setRevealed] = useState(false);
  const [fire, setFire] = useState(0);
  const [count, setCount] = useState(g?.count ?? 1);
  const [diet, setDiet] = useState(g?.diet ?? "");
  const ev = db.client.event;
  const [d, h, m, s] = useCountdown(ev?.date ?? "2030-01-01", db.client.invite.time ?? "20:30");
  const reveal = useCallback(() => { setRevealed(true); setFire((f) => f + 1); }, []);

  if (!g || !ev || !info) return <div className="container" style={{ paddingBlock: 60 }}><Empty icon="MailX" title="الدعوة غير موجودة">تأكد من الرابط أو تواصل مع صاحب المناسبة.</Empty></div>;
  const t = db.client.invite.template;
  const wc = WATERCOLOR[t] ?? WATERCOLOR.diriyah!;
  const first = g.name.split(/[،,\s]/)[0];
  const start = new Date(`${ev.date}T${db.client.invite.time ?? "20:30"}:00`);
  const fmtCal = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(info.couple)}&dates=${fmtCal(start)}/${fmtCal(new Date(start.getTime() + 4 * 36e5))}&location=${encodeURIComponent(info.place)}`;
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.place)}`;
  const after = ev.date < today();
  const open = () => { if (stage !== "envelope") return; setStage("opening"); setTimeout(() => setStage("open"), 1150); };

  return (
    <div className="gx" style={{ ["--wc-tint" as string]: wc.tint, ["--wc-deep" as string]: wc.deep }}>
      <AnimatePresence>
        {stage !== "open" && (
          <motion.div key="env" className="gx-env" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <div className="gx-env-in">
              <Monogram initials={info.initials} size={110} color={wc.deep} />
              <div className={"gx-window" + (stage === "opening" ? " opening" : "")}><img src={wc.img} alt="" /></div>
              <div className={"gx-flaps" + (stage === "opening" ? " opening" : "")} aria-hidden="true"><i className="l" /><i className="r" /><i className="b" /></div>
              <motion.button className="gx-seal" onClick={open} aria-label="افتح الدعوة" animate={stage === "opening" ? { scale: [1, 1.15, 0], opacity: [1, 1, 0], rotate: [0, -8, 20] } : { scale: [1, 1.04, 1] }} transition={stage === "opening" ? { duration: 0.7 } : { duration: 2.2, repeat: Infinity }}>
                <span>{info.initials.join("")}</span>
              </motion.button>
              <div className="gx-env-text">
                <button className="gx-tap" onClick={open}>اضغط لفتح الدعوة</button>
                <div className="gx-orn" aria-hidden="true">✦</div>
                <div className="gx-to">إلى {greetingFor(g)} <b>{g.name}</b></div>
                <div className="gx-tagline">وبدأت حكايتنا</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === "open" && (
        <motion.main className="gx-page" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <Confetti fire={fire} />
          {ev.date === today() && info.program[db.client.liveIndex ?? 0] && <div className="gx-live"><span className="live-dot-c" /> الآن في الحفل: <b>{info.program[db.client.liveIndex ?? 0].title}</b></div>}
          {after && g.checkedIn && <section className="gx-sec gx-thanks"><h2 className="gx-h">شكراً لحضوركم</h2><p>نوّرتوا ليلتنا يا {first}، وحضوركم كان أجمل هدية.</p></section>}
          <p className="gx-hi">{greetingFor(g)} <b>{first}</b></p>
          <Tilt max={6}><InviteCard guest={g} showPass={g.status === "yes"} scratch={revealed ? undefined : (
            <Scratch onReveal={reveal} tint={wc.tint}>
              <div className="inv-date"><span>{info.day}</span><b className="num">{info.num}</b><span>{info.month}</span></div>
            </Scratch>
          )} /></Tilt>

          {!after && <section className="gx-sec">
            <h2 className="gx-h">باقي على الفرح</h2>
            <div className="gx-cd num">{[[d, "يوم"], [h, "ساعة"], [m, "دقيقة"], [s, "ثانية"]].map(([v, l]) => <div key={l as string}><b>{String(v).padStart(2, "0")}</b><small>{l}</small></div>)}</div>
          </section>}

          <section className="gx-sec">
            <h2 className="gx-h">برنامج الحفل</h2>
            <div className="gx-program">
              {info.program.map((p, i) => (
                <motion.div key={i} className="torn" initial={{ opacity: 0.35, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <span className="torn-ico"><Icon name={PROGRAM_ICON[p.title] ?? "Sparkles"} size={20} /></span>
                  <div className="grow"><b>{p.title}</b><small>{info.place}</small></div>
                  <span className="torn-time num">{time12(p.time)}</span>
                </motion.div>
              ))}
            </div>
            <div className="gx-note"><Icon name="Users" size={16} /> {g.section === "men" ? "دعوتك لقسم الرجال" : "دعوتك لقسم النساء"}</div>
            {db.client.invite.kids != null && <div className="gx-note"><Icon name="Baby" size={16} /> {db.client.invite.kids ? "أطفالكم يزيّنون فرحتنا" : "الدعوة للكبار فقط، ونسعد بتفهمكم"}</div>}
          </section>

          <section className="gx-sec">
            <h2 className="gx-h">{g.status === "pending" ? "تشرفنا بحضورك؟" : "ردّك"}</h2>
            {g.status === "pending" ? (
              <div className="gx-rsvp">
                <div className="row between"><span>عدد الحضور</span>
                  <div className="stepper"><button onClick={() => setCount((c) => Math.max(1, c - 1))} aria-label="أقل">−</button><b className="num">{count}</b><button onClick={() => setCount((c) => Math.min(20, c + 1))} aria-label="أكثر">+</button></div>
                </div>
                <label className="sr" htmlFor="gx-diet">ملاحظة أكل أو حساسية</label>
                <input id="gx-diet" className="input" placeholder="عندك حساسية أو نظام أكل خاص؟ (اختياري)" value={diet} onChange={(e) => setDiet(e.target.value.slice(0, 120))} />
                <button className="btn lg block gx-yes" onClick={() => { rsvp(g.id, { status: "yes", count, diet: diet.trim() || undefined }); setFire((f) => f + 1); }}>بحضر إن شاء الله</button>
                <button className="btn block ghost" onClick={() => rsvp(g.id, { status: "no" })}>أعتذر عن الحضور</button>
              </div>
            ) : (
              <div className="gx-done">{g.status === "yes" ? <><Icon name="CheckCircle2" size={20} /> بانتظارك. بطاقة الدخول على الدعوة فوق.</> : <>شكراً لردك.</>}<button onClick={() => rsvp(g.id, { status: "pending" })}>تغيير</button></div>
            )}
            <div className="row" style={{ marginTop: 12 }}><a className="btn grow" href={map} target="_blank" rel="noreferrer"><Icon name="MapPin" size={16} /> الموقع</a><a className="btn grow" href={cal} target="_blank" rel="noreferrer"><Icon name="CalendarPlus" size={16} /> أضف للتقويم</a></div>
          </section>

          {g.status !== "pending" && <a className="gx-made" href={`${location.href.split("#")[0]}#start-${ev.occasion}`}><span>سوّيت دعوتي من <b>مناسبتي</b></span><span className="gx-made-cta">ابدأ مناسبتك <Icon name="ArrowLeft" size={14} /></span></a>}
          <img className="gx-foot-art" src={wc.img} alt="" loading="lazy" />
          <a className="g-back" href="#home">للتجربة: ارجع للوحة صاحب المناسبة</a>
        </motion.main>
      )}
    </div>
  );
}


/* ───── دعوة الضيف: من بيانات صاحب المناسبة (نفس الجهاز) أو من البوابة الآمنة برمز الضيف (على جوال الضيف) ───── */
type Snap = NonNullable<Awaited<ReturnType<NonNullable<typeof repo.invite>["load"]>>>;
export function GuestInvite({ code }: { code: string }) {
  const db = useDB();
  const local = db.client.guests.some((x) => x.code === code);
  const [snap, setSnap] = useState<Snap | null | undefined>(undefined);
  useEffect(() => {
    if (local || !repo.invite) return;
    let alive = true;
    void repo.invite.load(code).then((s) => alive && setSnap(s));
    return () => { alive = false; };
  }, [code, local]);
  if (local || !repo.invite) return <GuestInviteView code={code} rsvp={(id, patch) => apply(updateGuest(id, patch))} />;
  if (snap === undefined) return <Splash />;
  if (snap === null) return <GuestInviteView code={code} rsvp={() => {}} />;
  const venueId = "invite-venue";
  const view: DB = {
    ...db,
    bookings: snap.venue ? [{ id: "invite-booking", kind: "venue", targetId: venueId, clientName: "", phone: "", occasion: snap.event!.occasion, city: snap.event!.city, date: snap.event!.date, guests: 0, note: "", status: "confirmed", estimate: 0, createdAt: 0, messages: [], fromClient: true }] : [],
    venues: snap.venue ? [{ id: venueId, name: snap.venue.name, district: snap.venue.district, city: snap.event!.city, hue: 30, tags: [], about: "", halls: [], blocked: [], photos: snap.venue.photos }] : [],
    client: { ...db.client, event: snap.event, invite: snap.invite, liveIndex: snap.liveIndex, guests: [snap.guest], profile: snap.host ? { name: snap.host, phone: "" } : db.client.profile },
  };
  const rsvp = (_id: string, patch: Partial<Guest>) => {
    setSnap((s) => (s ? { ...s, guest: { ...s.guest, ...patch } } : s));
    void repo.invite!.rsvp(code, { status: patch.status ?? snap.guest.status, count: patch.count, diet: patch.diet }).then((g) => g && setSnap((s) => (s ? { ...s, guest: { ...s.guest, ...g } } : s)));
  };
  return <DBProvider value={view}><GuestInviteView code={code} rsvp={rsvp} /></DBProvider>;
}
