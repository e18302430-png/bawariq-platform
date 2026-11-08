import { useMemo, useState } from "react";
import { adminSetStatus, duesOf, markCommissionPaid, sar, setCommission, type Due } from "@munasabati/core";
import { Empty, Icon, Segmented, Sheet, apply, useDB, useToast } from "@munasabati/ui";

/*
  دخل المنصة: مناسبتي مجانية بالكامل للعميل والتاجر في الاستخدام.
  الدخل = عمولة تحددها الإدارة على قيمة الحجوزات المؤكدة عبر المنصة، يسددها التاجر بتحويل بنكي بعد المناسبة.
  الحماية: إخفاء أرقام التواصل في المحادثة، والمبلغ المتفق عليه من العميل للمطابقة، وتعليق المتأخر عن السداد.
*/
type Row = { kind: "supplier" | "venue"; id: string; name: string; status?: string; dues: Due[] };
const sum = (l: Due[]) => l.reduce((a, d) => a + (d.amount ?? 0), 0);

export function Finance({ go }: { go: (t: string, id?: string) => void }) {
  const db = useDB();
  const toast = useToast();
  const [f, setF] = useState({ rate: String(db.commission?.rate ?? ""), grace: String(db.commission?.graceDays ?? ""), bank: db.commission?.bank ?? "" });
  const [filter, setFilter] = useState<"open" | "claimed" | "overdue" | "all">("open");
  const [sel, setSel] = useState<string | null>(null);
  const rows: Row[] = useMemo(() => [
    ...db.suppliers.map((s) => ({ kind: "supplier" as const, id: s.id, name: s.name, status: s.status, dues: duesOf(db, "supplier", s.id) })),
    ...db.venues.map((v) => ({ kind: "venue" as const, id: v.id, name: v.name, status: v.status, dues: duesOf(db, "venue", v.id) })),
  ].filter((r) => r.dues.length), [db]);
  const all = rows.flatMap((r) => r.dues);
  const by = (st: Due["state"][]) => all.filter((d) => st.includes(d.state));
  const shown = rows.filter((r) => filter === "all" || r.dues.some((d) => (filter === "open" ? d.state === "due" || d.state === "overdue" || d.state === "claimed" : d.state === filter)));
  const mismatch = db.bookings.filter((b) => b.status === "confirmed" && b.clientAmount && b.quote && b.clientAmount > b.quote);
  const cur = rows.find((r) => r.kind + r.id === sel);

  return (
    <>
      <div><span className="eyebrow">المنصة مجانية للعميل · الدخل من عمولة التجار</span><h1 className="page-title">المالية</h1></div>

      <section className="card stack">
        <b className="display">إعدادات العمولة</b>
        <form className="form-2" onSubmit={(e) => { e.preventDefault(); apply(setCommission({ rate: +f.rate || undefined, graceDays: +f.grace || undefined, bank: f.bank.trim() || undefined })); toast("حفظنا إعدادات العمولة"); }}>
          <div className="field"><label htmlFor="fc-r">نسبة العمولة من قيمة الحجز المؤكد (%)</label><input id="fc-r" className="input num" inputMode="decimal" placeholder="اكتب النسبة" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value.replace(/[^\d.]/g, "") })} /></div>
          <div className="field"><label htmlFor="fc-g">مهلة السداد بعد المناسبة (أيام)</label><input id="fc-g" className="input num" inputMode="numeric" placeholder="اكتب عدد الأيام" value={f.grace} onChange={(e) => setF({ ...f, grace: e.target.value.replace(/\D/g, "") })} /></div>
          <div className="field full"><label htmlFor="fc-b">بيانات الحساب البنكي (تظهر للتجار)</label><input id="fc-b" className="input" dir="ltr" style={{ textAlign: "right" }} placeholder="اسم البنك · IBAN" value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></div>
          <div className="full"><button className="btn primary" type="submit">حفظ</button></div>
        </form>
        {!db.commission?.rate && <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>حدد النسبة عشان تبدأ المستحقات تظهر للتجار.</p>}
      </section>

      <div className="stats">
        <div className="card"><div className="stat-label">مستحق الآن</div><div className="stat-value num">{sum(by(["due", "overdue"])) ? sar(sum(by(["due", "overdue"]))) : "—"}</div></div>
        <div className="card"><div className="stat-label">متأخر عن المهلة</div><div className="stat-value num" style={{ color: by(["overdue"]).length ? "var(--bad)" : undefined }}>{sum(by(["overdue"])) ? sar(sum(by(["overdue"]))) : "—"}</div><div className="stat-sub">{by(["overdue"]).length} حجز</div></div>
        <div className="card"><div className="stat-label">حوّلوا وبانتظار تأكيدك</div><div className="stat-value num">{sum(by(["claimed"])) ? sar(sum(by(["claimed"]))) : "—"}</div></div>
        <div className="card"><div className="stat-label">تم تحصيله</div><div className="stat-value num">{sum(by(["paid"])) ? sar(sum(by(["paid"]))) : "—"}</div></div>
      </div>

      {mismatch.length > 0 && <section className="card stack" style={{ borderColor: "var(--warn)" }}>
        <b className="display"><Icon name="ShieldAlert" size={16} /> فرق بين عرض التاجر والمبلغ اللي ذكره العميل</b>
        <div className="list">{mismatch.map((b) => (
          <button key={b.id} className="list-row adm-row" onClick={() => go("bookings", b.id)}><div className="t"><b>{b.clientName}</b><small className="num">العرض {sar(b.quote)} · العميل ذكر {sar(b.clientAmount)}</small></div><Icon name="ChevronLeft" size={16} /></button>
        ))}</div>
        <small className="muted">العمولة تُحسب على المبلغ الأعلى تلقائياً.</small>
      </section>}

      <Segmented value={filter} onChange={setFilter} options={[["open", "تحتاج متابعة"], ["claimed", "حوّلوا"], ["overdue", "متأخرة"], ["all", "الكل"]]} />
      <section className="card" style={{ paddingBlock: 6 }}>
        {shown.length ? <div className="list">{shown.map((r) => {
          const open = r.dues.filter((d) => d.state === "due" || d.state === "overdue"), claimed = r.dues.filter((d) => d.state === "claimed"), late = r.dues.filter((d) => d.state === "overdue");
          return (
            <button key={r.kind + r.id} className="list-row adm-row" onClick={() => setSel(r.kind + r.id)}>
              <span className="avatar"><Icon name={r.kind === "venue" ? "Building2" : "Store"} size={16} /></span>
              <div className="t"><b>{r.name}{r.status === "suspended" ? " · معلّق" : ""}</b><small className="num">{open.length ? `مستحق ${sar(sum(open))}` : "لا مستحق الآن"}{claimed.length ? ` · حوّل ${sar(sum(claimed))}` : ""}</small></div>
              {late.length > 0 ? <span className="pill bad">متأخر</span> : claimed.length > 0 ? <span className="pill info">بانتظار تأكيدك</span> : <span className="pill neutral">{r.dues.length} حجز</span>}
            </button>
          );
        })}</div> : <Empty icon="Receipt" title="ما فيه مستحقات هنا">العمولة تظهر بعد تأكيد أي حجز عبر المنصة.</Empty>}
      </section>

      <Sheet open={!!cur} onClose={() => setSel(null)} title={cur ? `مستحقات ${cur.name}` : ""}>
        {cur && <div className="stack">
          <div className="list">{cur.dues.map((d) => (
            <div key={d.booking.id} className="list-row">
              <div className="t"><b>{d.booking.clientName}</b><small className="num">{d.booking.date} · القيمة {d.value ? sar(d.value) : "لم تُحدد"}</small></div>
              <div style={{ textAlign: "end" }}><b className="num">{d.amount ? sar(d.amount) : "—"}</b>
                <div className="row" style={{ ["--gap" as string]: "4px", justifyContent: "flex-end" }}>
                  {d.state !== "paid" ? <button className="btn sm" onClick={() => { apply(markCommissionPaid([d.booking.id])); toast("تم تسجيل السداد"); }}>تأكيد السداد</button> : <button className="btn sm ghost" onClick={() => apply(markCommissionPaid([d.booking.id], false))}>تراجع</button>}
                </div>
              </div>
            </div>
          ))}</div>
          {cur.dues.some((d) => d.state === "claimed" || d.state === "due" || d.state === "overdue") && <button className="btn primary" onClick={() => { apply(markCommissionPaid(cur.dues.filter((d) => d.state !== "paid" && d.state !== "upcoming").map((d) => d.booking.id))); toast("تم تسجيل سداد الكل"); }}>تأكيد سداد كل المستحق</button>}
          {cur.dues.some((d) => d.state === "overdue") && cur.status !== "suspended" && <button className="btn ghost adm-danger-text" onClick={() => { apply(adminSetStatus(cur.kind, cur.id, "suspended")); toast("علّقنا الحساب لحين السداد"); }}><Icon name="PauseCircle" size={16} /> تعليق الحساب لحين السداد</button>}
          {cur.status === "suspended" && <button className="btn" onClick={() => { apply(adminSetStatus(cur.kind, cur.id, "active")); toast("تم تفعيل الحساب"); }}><Icon name="PlayCircle" size={16} /> تفعيل الحساب</button>}
        </div>}
      </Sheet>
    </>
  );
}
