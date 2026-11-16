import { INVITE_TIERS, adminSetInviteTier, confirmPaid, pricingOf, platformTake, sar, spaces } from "@munasabati/core";
import { Empty, Icon, apply, useDB, useToast } from "@munasabati/ui";

/* ═══════════ دخل مناسبتي: نسبة الشراكة على الحجوزات المؤكدة + باقات الدعوات ═══════════
   النسبة تُحصَّل من العميل كـ«رسوم تأكيد الحجز» (جزء من سعر التاجر)، وبعد استلامها يفتح التواصل. */
export function Billing() {
  const db = useDB();
  const toast = useToast();
  const invites = spaces(db).filter((s) => s.data.invitePlan);
  const conf = db.bookings.filter((b) => b.status === "confirmed" && b.quote);
  const due = conf.filter((b) => b.pay?.stage !== "paid" && platformTake(b) > 0);
  const paid = conf.filter((b) => b.pay?.stage === "paid");
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const month = paid.filter((b) => (b.pay?.paidAt ?? 0) >= monthStart.getTime()).reduce((n, b) => n + platformTake(b), 0);
  const dueSum = due.reduce((n, b) => n + platformTake(b), 0);
  const nameOf = (k: string, id: string) => (k === "venue" ? db.venues.find((v) => v.id === id)?.name : db.suppliers.find((x) => x.id === id)?.name) ?? "";
  const pv = pricingOf(db, "venue").vendorPct, ps = pricingOf(db, "supplier").vendorPct;
  return (
    <div className="stack">
      <div><h1 className="page-title">الفوترة والدخل</h1><p className="page-sub">نسبة الشراكة على الحجز المؤكد فقط: القاعات {pv}٪ والموردين {ps}٪، تنخصم من سعر التاجر وتُحصَّل من العميل كرسوم تأكيد. وباقات الدعوات.</p></div>
      <div className="stats">
        <div className="card"><div className="stat-label"><Icon name="Wallet" size={15} /> دخل هذا الشهر</div><div className="stat-value num">{month ? sar(month) : "0 ر.س"}</div><div className="stat-sub">رسوم تأكيد مستلمة</div></div>
        <div className="card"><div className="stat-label"><Icon name="Hourglass" size={15} /> بانتظار الاستلام</div><div className="stat-value brand num">{due.length}</div><div className="stat-sub num">{dueSum ? sar(dueSum) : "—"}</div></div>
        <div className="card"><div className="stat-label"><Icon name="CheckCircle2" size={15} /> حجوزات مؤكدة</div><div className="stat-value num">{conf.length}</div><div className="stat-sub">كل الوقت</div></div>
      </div>

      <section className="card stack"><h3 className="card-title">رسوم تأكيد بانتظار الاستلام</h3>
        {due.length ? <div className="list">{due.map((b) => (
          <div key={b.id} className="list-row" style={{ flexWrap: "wrap" }}>
            <span className="avatar"><Icon name={b.kind === "venue" ? "Building2" : "Store"} size={16} /></span>
            <div className="t"><b>{b.clientName} ← {nameOf(b.kind, b.targetId)}</b><small className="num">{b.date} · السعر {sar(b.clientPrice)} · نسبتنا {sar(platformTake(b))} · مرجع MNS-{b.id.slice(-6).toUpperCase()}</small></div>
            <button className="btn sm primary" onClick={() => { apply(confirmPaid(b.id)); toast("استلمنا الرسوم، وفتحنا التواصل بين الطرفين"); }}><Icon name="Check" size={14} /> استلمت الرسوم</button>
          </div>))}</div> : <Empty icon="Wallet" title="ما فيه رسوم معلقة" />}
        <small className="faint">بعد «استلمت الرسوم» يوصل للعميل رقم التاجر والمبلغ الباقي، ويوصل للتاجر رقم العميل. وأصدر فاتورة النسبة للتاجر من مزوّد الفوترة.</small>
      </section>

      <section className="card stack"><h3 className="card-title">طلبات باقات الدعوات</h3>
        {invites.length ? <div className="list">{invites.map((s) => { const want = INVITE_TIERS.find((t) => t.id === s.data.invitePlan!.want)!; return (
          <div key={s.id} className="list-row" style={{ flexWrap: "wrap" }}>
            <span className="avatar"><Icon name="Mail" size={16} /></span>
            <div className="t"><b>{s.data.profile?.name ?? "عميل"} · {s.data.event?.title}</b><small className="num">باقة {want.name} · {sar(want.price)} · مرجع MNS-I-{s.id.slice(-5).toUpperCase()}</small></div>
            <button className="btn sm primary" onClick={() => { apply(adminSetInviteTier(s.id, want.id)); toast(`فعّلنا باقة ${want.name}`); }}><Icon name="Check" size={14} /> استلمت وفعّل</button>
            <button className="btn sm ghost" onClick={() => apply(adminSetInviteTier(s.id, null))}>رفض</button>
          </div>); })}</div> : <Empty icon="Mail" title="ما فيه طلبات باقات" />}
      </section>
    </div>
  );
}
