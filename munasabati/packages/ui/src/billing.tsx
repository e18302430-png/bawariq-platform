import { useState } from "react";
import { CREDIT_PACKS, FEATURED_PRICE, VENUE_PLAN, cancelVenueSub, claimVenueSub, creditsOf, payoutFor, pricingOf, requestTopUp, sar, type Supplier, type Venue } from "@munasabati/core";
import { Icon } from "./icons";
import { useToast } from "./components";
import { apply, useDB } from "./data";

/* ═══════════ دخل مناسبتي من التجار: اشتراك القاعات ورصيد عروض الموردين ═══════════
   التحويل لحساب مناسبتي مقابل خدمة مناسبتي نفسها (اشتراك أو رصيد)، مو فلوس عملاء. */

function BankRows({ refCode }: { refCode: string }) {
  const db = useDB();
  const toast = useToast();
  const copy = async (t: string, w: string) => { try { await navigator.clipboard.writeText(t); toast(`نسخنا ${w}`); } catch { toast(t); } };
  if (!db.bank?.iban) return <div className="req-step"><Icon name="Info" size={15} /> بيانات التحويل توصلك من الإدارة على الواتساب.</div>;
  return (
    <div className="pay-rows">
      <div><small>البنك</small><b>{db.bank.name}</b></div>
      <div><small>اسم المستفيد</small><b>{db.bank.holder}</b></div>
      <div><small>الآيبان</small><b className="num" dir="ltr">{db.bank.iban}</b><button className="icon-btn sm" aria-label="نسخ الآيبان" onClick={() => void copy(db.bank!.iban, "الآيبان")}><Icon name="Copy" size={14} /></button></div>
      <div><small>الرقم المرجعي</small><b className="num" dir="ltr">{refCode}</b><button className="icon-btn sm" aria-label="نسخ الرقم المرجعي" onClick={() => void copy(refCode, "الرقم المرجعي")}><Icon name="Copy" size={14} /></button></div>
    </div>
  );
}

/** رصيد العروض للمورد: الرصيد، الباقات، الطلب المعلق، والسجل */
export function WalletPanel({ s }: { s: Supplier }) {
  const toast = useToast();
  const [pick, setPick] = useState<string>("m");
  const credits = creditsOf(s), pend = s.wallet?.pending;
  const ref = "MNS-W-" + s.id.slice(-5).toUpperCase();
  return (
    <div className="stack">
      <div><h1 className="page-title">رصيد العروض</h1><p className="page-sub">ما فيه عمولة على حجوزاتك. تدفع بس على كل عميل جاد ترسل له عرض، ومهما كبر الحجز سعرك كله لك.</p></div>
      <section className="wallet-hero">
        <div><small>رصيدك الحالي</small><b className="num">{credits}</b><span>عرض</span></div>
        <ul>
          <li><Icon name="Check" size={15} /> العرض الأول على الطلب يخصم رصيد واحد، والتعديل مجاني</li>
          <li><Icon name="Check" size={15} /> الطلبات توصلك جاهزة: التاريخ والضيوف والميزانية</li>
          <li><Icon name="Check" size={15} /> صفر عمولة: العميل يدفع لك سعرك كامل مباشرة</li>
        </ul>
      </section>
      {pend ? (
        <section className="card stack">
          <div className="row between wrap"><b className="display">طلب شحن قيد المراجعة</b><span className="pill brand num">{pend.credits} عرض · {sar(pend.amount)}</span></div>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>حوّل المبلغ واكتب الرقم المرجعي، ونضيف الرصيد أول ما نأكد الاستلام.</p>
          <BankRows refCode={ref} />
        </section>
      ) : (
        <section className="card stack">
          <b className="display">اشحن رصيدك</b>
          <div className="packs">{CREDIT_PACKS.map((p) => (
            <button key={p.id} className={"pack" + (pick === p.id ? " on" : "")} onClick={() => setPick(p.id)} aria-pressed={pick === p.id}>
              {"tag" in p && <span className="pack-tag">{p.tag}</span>}
              <b className="num">{p.credits}</b><small>عرض</small>
              <span className="num">{sar(p.price)}</span>
              <em className="num">{Math.round(p.price / p.credits)} ر.س للعرض</em>
            </button>
          ))}</div>
          <button className="btn primary lg block" onClick={() => { apply(requestTopUp(s.id, pick)); toast("سجّلنا طلبك. حوّل المبلغ ونضيف الرصيد"); }}><Icon name="Coins" size={17} /> اطلب الشحن</button>
        </section>
      )}
      <section className="card row wrap between">
        <div><b className="display">ظهور مميّز</b><div className="muted" style={{ fontSize: 13.5 }}>تطلع أول في الاقتراحات والبحث بشارة «مختار».</div></div>
        <span className="pill neutral num">{sar(FEATURED_PRICE)} بالشهر · اطلبه من الدعم</span>
      </section>
      {!!s.wallet?.log?.length && <section className="card" style={{ paddingBlock: 6 }}><div className="list">{[...s.wallet.log].reverse().slice(0, 12).map((l, i) => (
        <div key={i} className="list-row"><span className={"avatar" + (l.delta > 0 ? "" : " alt")}><Icon name={l.delta > 0 ? "Plus" : "Send"} size={15} /></span><div className="t"><b>{l.why}</b><small className="num">{new Date(l.at).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn")}</small></div><b className="num" style={{ color: l.delta > 0 ? "var(--ok)" : undefined }}>{l.delta > 0 ? "+" : ""}{l.delta}</b></div>
      ))}</div></section>}
    </div>
  );
}

/** اشتراك القاعة الشهري */
export function VenueSubCard({ v }: { v: Venue }) {
  const toast = useToast();
  const [askCancel, setAskCancel] = useState(false);
  const st = v.sub?.plan ?? "trial";
  const ref = "MNS-V-" + v.id.slice(-5).toUpperCase();
  const label = st === "active" ? `فعّال لين ${v.sub?.until}` : st === "overdue" ? "متوقف: قاعتك ما تظهر للعملاء" : `فترة تجربة مجانية${v.sub?.until ? ` لين ${v.sub.until}` : ""}`;
  return (
    <section className={"card stack sub-card " + st}>
      <div className="row between wrap"><div><b className="display">اشتراك مناسبتي</b><div className="muted" style={{ fontSize: 13.5 }}>صفر عمولة على حجوزاتك. اشتراك ثابت يشمل الطلبات والتقويم والجولة ٣٦٠ والعقود ودخول الضيوف.</div></div><span className={"pill " + (st === "active" ? "ok" : st === "overdue" ? "bad" : "brand")}>{label}</span></div>
      <div className="row wrap" style={{ alignItems: "baseline", ["--gap" as string]: "6px" }}><b className="num" style={{ fontSize: 30 }}>{VENUE_PLAN.price}</b><span className="muted">ر.س بالشهر · أول {Math.round(VENUE_PLAN.trialDays / 30)} شهور مجاناً للقاعات المؤسسة</span></div>
      {v.sub?.claimedAt && st !== "active" ? <div className="req-step"><Icon name="Hourglass" size={15} /> استلمنا إشعار تحويلك، ونفعّل الاشتراك خلال ساعات.</div> : (
        <details className="sub-pay"><summary><Icon name="CreditCard" size={15} /> ادفع الاشتراك</summary>
          <BankRows refCode={ref} />
          <button className="btn primary block" onClick={() => { apply(claimVenueSub(v.id)); toast("وصلنا إشعارك، ونفعّل اشتراكك قريب"); }}><Icon name="CheckCircle2" size={16} /> حوّلت الاشتراك ({sar(VENUE_PLAN.price)})</button>
        </details>
      )}
      {v.sub?.cancelAt ? (
        <div className="req-step"><Icon name="Info" size={15} /> ألغيت التجديد. اشتراكك يبقى فعالاً لنهاية المدة المدفوعة وما ينجدد. <button className="btn sm" onClick={() => { apply(cancelVenueSub(v.id, true)); toast("رجّعنا التجديد"); }}>تراجع عن الإلغاء</button></div>
      ) : !askCancel ? (
        <button className="btn sm ghost" style={{ justifySelf: "start", color: "var(--bad)" }} onClick={() => setAskCancel(true)}><Icon name="X" size={14} /> إلغاء الاشتراك</button>
      ) : (
        <div className="row wrap"><span className="muted" style={{ fontSize: 13.5 }}>متأكد؟ يبقى فعالاً لنهاية المدة المدفوعة، وبعدها قاعتك ما تظهر للعملاء.</span>
          <button className="btn sm" style={{ color: "var(--bad)" }} onClick={() => { apply(cancelVenueSub(v.id)); setAskCancel(false); toast("ألغينا التجديد. نرسل لك تأكيد"); }}>نعم، ألغِ الاشتراك</button>
          <button className="btn sm ghost" onClick={() => setAskCancel(false)}>تراجع</button></div>
      )}
    </section>
  );
}

/** رابط الدفع الخاص بالتاجر: يظهر للعميل بعد تأكيد الحجز، فالفلوس تروح للتاجر مباشرة */
export function PayLinkField({ value, onSave }: { value?: string; onSave: (v: string | undefined) => void }) {
  const toast = useToast();
  const [v, setV] = useState(value ?? "");
  const ok = !v || /^https:\/\/\S+$/.test(v.trim());
  return (
    <div className="field">
      <label htmlFor="pay-link">رابط الدفع الخاص فيك (اختياري)</label>
      <div className="row"><input id="pay-link" className="input grow num" dir="ltr" placeholder="https://..." value={v} onChange={(e) => setV(e.target.value)} />
        <button type="button" className="btn" disabled={!ok} onClick={() => { onSave(v.trim() || undefined); toast(v.trim() ? "حفظنا رابط الدفع" : "شلنا رابط الدفع"); }}>حفظ</button></div>
      <small className="faint" style={{ fontSize: 12.5 }}>رابط من بنكك أو بوابتك (مثل رابط دفع STC Pay أو ميسر). يظهر للعميل بعد ما يأكد الحجز، ويدفع لك مباشرة.</small>
    </div>
  );
}

/** شراكة التاجر مع مناسبتي: نسبة على الحجز المؤكد فقط. لا اشتراك ولا رسوم مقدمة */
export function PartnerShare({ kind, payLink, onPayLink }: { kind: "venue" | "supplier"; payLink?: string; onPayLink: (v: string | undefined) => void }) {
  const db = useDB();
  const pct = pricingOf(db, kind).vendorPct;
  const ex = 20000, cut = ex - payoutFor(ex, pricingOf(db, kind));
  return (
    <div className="stack">
      <div><h1 className="page-title">شراكتك مع مناسبتي</h1><p className="page-sub">ما فيه اشتراك ولا رسوم مقدمة. تدفع بس لما يتأكد حجز جبناه لك.</p></div>
      <section className="wallet-hero">
        <div><small>نسبة الشراكة</small><b className="num">{pct}٪</b><span>من الحجز المؤكد فقط</span></div>
        <ul>
          <li><Icon name="Check" size={15} /> صفر اشتراك، صفر رسوم تسجيل، وصفر على الطلبات اللي ما تتأكد</li>
          <li><Icon name="Check" size={15} /> العميل يدفع سعرك نفسه بدون أي إضافة منا</li>
          <li><Icon name="Check" size={15} /> نستلم نسبتنا من العميل كـ«رسوم تأكيد الحجز» وتنخصم من سعرك، والباقي يوصلك مباشرة</li>
          <li><Icon name="Check" size={15} /> نوصلك العميل جاهز: الميزانية والتاريخ والضيوف، ومنسقنا يتابع معك للنهاية</li>
        </ul>
      </section>
      <section className="card row between wrap"><span className="muted">مثال: حجز بسعر <b className="num">{sar(ex)}</b></span><span>نصيب مناسبتي <b className="num">{sar(cut)}</b> · يوصلك <b className="num" style={{ color: "var(--ok)" }}>{sar(ex - cut)}</b></span></section>
      <section className="card"><PayLinkField value={payLink} onSave={onPayLink} /></section>
    </div>
  );
}
