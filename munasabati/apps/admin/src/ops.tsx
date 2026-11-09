import { useState } from "react";
import { OPS_QUICK, fmt, normPhone, postOp, shiftDate, spaces, today, type ClientRecord, type DB, type OpsMsg } from "@munasabati/core";
import { Empty, Icon, OpsFeed, apply, useDB } from "@munasabati/ui";

/*
  غرفة العمليات: كل مناسبة الليلة (أو قريبة) مع الحضور لحظياً، البرنامج، الموردين،
  وغرفة التنسيق المباشرة مع صاحب المناسبة والمنسق العام ومنسقي الأقسام.
*/
const opsOf = (db: DB, r: ClientRecord) => (db.ops ?? []).filter((o) => !o.owner || o.owner === r.id || r.id === "local");

export function liveRooms(db: DB) {
  const t = today(), from = shiftDate(t, -1), to = shiftDate(t, 2), dayAgo = Date.now() - 864e5;
  return spaces(db)
    .filter((r) => r.data.event && ((r.data.event.date >= from && r.data.event.date <= to) || opsOf(db, r).some((o) => o.at > dayAgo)))
    .sort((a, b) => rank(a) - rank(b) || a.data.event!.date.localeCompare(b.data.event!.date));
  function rank(r: ClientRecord) { const e = r.data.event!; return e.endedAt ? 2 : e.date === t ? 0 : 1; }
}

/** تنبيهات عاجلة لم تُعالج: آخر ساعتين، من غير الإدارة */
export const openAlerts = (db: DB) => (db.ops ?? []).filter((o) => o.kind === "alert" && o.from !== "admin" && o.at > Date.now() - 2 * 36e5).length;

export function OpsRoom() {
  const db = useDB();
  const rooms = liveRooms(db);
  const [sel, setSel] = useState<string | null>(null);
  const cur = rooms.find((r) => r.id === sel) ?? rooms[0];
  return (
    <>
      <div><span className="eyebrow"><span className="live-dot-c" /> مباشر</span><h1 className="page-title">غرفة العمليات</h1><p className="page-sub">المناسبات الليلة والقريبة. تابع الحضور، وكلّم صاحب المناسبة والمنسقين مباشرة.</p></div>
      {!rooms.length ? <section className="card"><Empty icon="Radio" title="ما فيه مناسبات الليلة">أول ما تقرب مناسبة أو يرسل منسق تنبيه، تظهر هنا.</Empty></section> : <>
        <div className="ops-rooms" role="tablist" aria-label="المناسبات">{rooms.map((r) => {
          const e = r.data.event!, alerts = opsOf(db, r).filter((o) => o.kind === "alert" && o.at > Date.now() - 2 * 36e5).length;
          return <button key={r.id} role="tab" aria-selected={cur?.id === r.id} className={"ops-room" + (cur?.id === r.id ? " on" : "")} onClick={() => setSel(r.id)}>
            <span className={"pill " + (e.endedAt ? "neutral" : e.date === today() ? "ok" : "info")}>{e.endedAt ? "انتهت" : e.date === today() ? "الليلة" : e.date}</span>
            <b>{e.title}</b><small>{r.data.profile?.name ?? "عميل"} · {e.city}</small>
            {alerts > 0 && <span className="ops-alert-n"><Icon name="TriangleAlert" size={12} /> {alerts}</span>}
          </button>;
        })}</div>
        {cur && <Room r={cur} />}
      </>}
    </>
  );
}

function Room({ r }: { r: ClientRecord }) {
  const db = useDB();
  const c = r.data, e = c.event!;
  const sum = (l: typeof c.guests) => l.reduce((a, g) => a + g.count, 0);
  const yes = c.guests.filter((g) => g.status === "yes"), inside = c.guests.filter((g) => g.checkedIn);
  const sec = (s: "men" | "women") => `${sum(inside.filter((g) => g.section === s))} / ${sum(yes.filter((g) => g.section === s))}`;
  const program = c.invite.program ?? [];
  const live = program[Math.min(c.liveIndex ?? 0, Math.max(0, program.length - 1))];
  const phone = normPhone(c.profile?.phone ?? "");
  const vendors = db.bookings.filter((b) => b.status === "confirmed" && phone && normPhone(b.phone) === phone && b.date === e.date);
  const name = (kind: string, id: string) => (kind === "venue" ? db.venues.find((v) => v.id === id)?.name : db.suppliers.find((s) => s.id === id)?.name) ?? "";
  const send = (text: string, kind: OpsMsg["kind"]) => apply(postOp({ from: "admin", text, kind, owner: r.id === "local" ? undefined : r.id }));
  return (
    <div className="ops-grid">
      <div className="stack">
        <section className="card stack">
          <div className="row between wrap"><div><b className="display" style={{ fontSize: 18 }}>{e.title}</b><div className="muted" style={{ fontSize: 13.5 }}>{c.profile?.name} · <span className="num" dir="ltr">{c.profile?.phone}</span> · {e.city} · {e.date}</div></div>
            {c.profile?.phone && <a className="btn sm" href={`https://wa.me/${phone.replace(/^0/, "966")}`} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={15} /> واتساب العميل</a>}</div>
          <div className="la-split">
            <div><small>الحضور</small><b className="num">{fmt(sum(inside))} <span className="faint">/ {fmt(sum(yes))}</span></b></div>
            <div><small>الرجال</small><b className="num">{sec("men")}</b></div>
            <div><small>النساء</small><b className="num">{sec("women")}</b></div>
            <div><small>كبار الضيوف</small><b className="num">{inside.filter((g) => g.vip).length} / {c.guests.filter((g) => g.vip).length}</b></div>
          </div>
          {e.endedAt ? <div className="pill ok" style={{ justifySelf: "start" }}><Icon name="PartyPopper" size={13} /> ختم الليلة</div>
            : live ? <div className="st-now light"><Icon name="Radio" size={15} /> الآن: <b>{live.title}</b></div> : null}
          {!c.doorKey && !e.endedAt && <small className="faint">ما فعّل الاستقبال الذكي للحين، فالمنسقون ما انضموا.</small>}
        </section>
        {vendors.length > 0 && <section className="card">
          <div className="section-title"><h3>موردين الليلة</h3></div>
          <div className="list">{vendors.map((b) => <div key={b.id} className="list-row"><span className="avatar"><Icon name={b.kind === "venue" ? "Building2" : "Store"} size={16} /></span><div className="t"><b>{name(b.kind, b.targetId)}</b><small>{b.rating ? `تقييم العميل ${"★".repeat(b.rating.stars)}` : b.vendorStatus === "ready" ? "جاهز" : b.vendorStatus ? "يجهّز" : "مؤكد"}</small></div></div>)}</div>
        </section>}
      </div>
      <OpsFeed ops={opsOf(db, r)} me="admin" quick={OPS_QUICK.admin} onSend={send} sub="رسالتك توصل لصاحب المناسبة وكل المنسقين فوراً" />
    </div>
  );
}
