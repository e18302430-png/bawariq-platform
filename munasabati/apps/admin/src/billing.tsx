import { CREDIT_PACKS, INVITE_TIERS, VENUE_PLAN, adminSetInviteTier, approveTopUp, confirmVenueSub, creditsOf, rejectTopUp, sar, setVenueSub, spaces } from "@munasabati/core";
import { Empty, Icon, apply, useDB, useToast } from "@munasabati/ui";

/* ═══════════ دخل مناسبتي: اشتراكات القاعات، رصيد الموردين، باقات الدعوات ═══════════ */
export function Billing() {
  const db = useDB();
  const toast = useToast();
  const topups = db.suppliers.filter((s) => s.wallet?.pending);
  const invites = spaces(db).filter((s) => s.data.invitePlan);
  const venueClaims = db.venues.filter((v) => v.sub?.claimedAt && v.sub.plan !== "active");
  const active = db.venues.filter((v) => v.sub?.plan === "active").length;
  const mrr = active * VENUE_PLAN.price;
  const spent = db.suppliers.reduce((n, s) => n + (s.wallet?.spent ?? 0), 0);
  const pendingCount = topups.length + invites.length + venueClaims.length;
  return (
    <div className="stack">
      <div><h1 className="page-title">الفوترة والدخل</h1><p className="page-sub">مناسبتي ما تستلم فلوس العملاء. دخلنا من اشتراك القاعات، ورصيد عروض الموردين، وباقات الدعوات.</p></div>
      <div className="stats">
        <div className="card"><div className="stat-label"><Icon name="Building2" size={15} /> قاعات مشتركة</div><div className="stat-value">{active}</div><div className="stat-sub num">{sar(mrr)} شهرياً</div></div>
        <div className="card"><div className="stat-label"><Icon name="Send" size={15} /> عروض أرسلها الموردين</div><div className="stat-value">{spent}</div><div className="stat-sub">رصيد مستهلك</div></div>
        <div className="card"><div className="stat-label"><Icon name="Hourglass" size={15} /> بانتظار تأكيدك</div><div className="stat-value brand">{pendingCount}</div><div className="stat-sub">تحويلات تحتاج مراجعة</div></div>
      </div>

      <section className="card stack"><h3 className="card-title">شحن رصيد الموردين</h3>
        {topups.length ? <div className="list">{topups.map((s) => { const p = s.wallet!.pending!; return (
          <div key={s.id} className="list-row" style={{ flexWrap: "wrap" }}>
            <span className="avatar"><Icon name="Store" size={16} /></span>
            <div className="t"><b>{s.name}</b><small className="num">{p.credits} عرض · {sar(p.amount)} · الرصيد الحالي {creditsOf(s)} · مرجع MNS-W-{s.id.slice(-5).toUpperCase()}</small></div>
            <button className="btn sm primary" onClick={() => { apply(approveTopUp(s.id)); toast(`أضفنا ${p.credits} عرض لـ${s.name}`); }}><Icon name="Check" size={14} /> استلمت المبلغ</button>
            <button className="btn sm ghost" onClick={() => apply(rejectTopUp(s.id))}>رفض</button>
          </div>); })}</div> : <Empty icon="Coins" title="ما فيه طلبات شحن" />}
        <small className="faint">الباقات: {CREDIT_PACKS.map((p) => `${p.credits} عرض بـ${p.price}`).join(" · ")}</small>
      </section>

      <section className="card stack"><h3 className="card-title">اشتراكات القاعات ({sar(VENUE_PLAN.price)} بالشهر)</h3>
        <div className="list">{db.venues.map((v) => { const st = v.sub?.plan ?? "trial"; return (
          <div key={v.id} className="list-row" style={{ flexWrap: "wrap" }}>
            <span className="avatar"><Icon name="Building2" size={16} /></span>
            <div className="t"><b>{v.name}</b><small style={{ color: st === "active" ? "var(--ok)" : st === "overdue" ? "var(--bad)" : undefined }}>{st === "active" ? `فعّال لين ${v.sub?.until}` : st === "overdue" ? "متأخر (مخفية عن العملاء)" : `تجربة${v.sub?.until ? ` لين ${v.sub.until}` : ""}`}{v.sub?.claimedAt && st !== "active" ? " · بلّغت إنها حوّلت" : ""}</small></div>
            <button className="btn sm primary" onClick={() => { apply(confirmVenueSub(v.id)); toast(`فعّلنا اشتراك ${v.name} شهر`); }}><Icon name="Check" size={14} /> استلمت شهر</button>
            {st !== "trial" && <button className="btn sm ghost" onClick={() => { const d = new Date(); d.setDate(d.getDate() + VENUE_PLAN.trialDays); apply(setVenueSub(v.id, { plan: "trial", until: d.toISOString().slice(0, 10) })); }}>تجربة {Math.round(VENUE_PLAN.trialDays / 30)} شهور</button>}
            {st !== "overdue" && <button className="btn sm ghost" style={{ color: "var(--bad)" }} onClick={() => { apply(setVenueSub(v.id, { ...(v.sub ?? { plan: "trial" }), plan: "overdue", claimedAt: undefined })); toast(`أوقفنا ظهور ${v.name}`); }}>إيقاف</button>}
          </div>); })}</div>
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
