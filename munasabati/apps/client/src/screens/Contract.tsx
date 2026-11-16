import { useState } from "react";
import { confirmFeeFor, depositFor, isDirectPay, pricingOf, sar, signContract, fmt, type Booking } from "@munasabati/core";
import { Icon, Sheet, apply, useDB, useToast } from "@munasabati/ui";

/* ═══════════ عقد الحجز الإلكتروني ═══════════
   عقد واضح بين العميل ومقدم الخدمة عبر مناسبتي: الأطراف، الخدمة، السعر، العربون، الإلغاء، والتزامات كل طرف.
   العميل يوقّع باسمه، فنثبت السعر والعربون والتاريخ وقت التوقيع (ولا يتعدل بعدها إلا عن طريق الإدارة). */

const KIND = { venue: "حجز قاعة", supplier: "خدمة مناسبة" } as const;
const dt = (ms: number) => new Date(ms).toLocaleString("ar-SA-u-ca-gregory-nu-latn", { dateStyle: "long", timeStyle: "short" });

export function ContractButton({ b, name }: { b: Booking; name: string }) {
  const [open, setOpen] = useState(false);
  if (!b.clientPrice) return null;
  return (
    <>
      <button className={"contract-btn" + (b.contract ? " signed" : "")} onClick={() => setOpen(true)}>
        <Icon name={b.contract ? "FileCheck2" : "FileSignature"} size={17} />
        <span><b>{b.contract ? "العقد موقّع" : "عقد الحجز الإلكتروني"}</b><small>{b.contract ? `وقّعته ${dt(b.contract.at)}` : "راجع البنود ووقّع باسمك قبل العربون"}</small></span>
        <Icon name="ChevronLeft" size={16} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="عقد الحجز الإلكتروني"><ContractBody b={b} name={name} onDone={() => setOpen(false)} /></Sheet>
    </>
  );
}

function ContractBody({ b, name, onDone }: { b: Booking; name: string; onDone: () => void }) {
  const db = useDB();
  const toast = useToast();
  const p = pricingOf(db, b.kind);
  const c = b.contract;
  const direct = isDirectPay(db);
  const price = c?.price ?? b.clientPrice ?? 0, deposit = c?.deposit ?? (direct ? confirmFeeFor(b, p) : depositFor(b, p)), date = c?.date ?? b.date;
  const free = direct && deposit === 0;
  const ref = "MNS-" + b.id.slice(-6).toUpperCase();
  const client = db.client.profile?.name || b.clientName || "العميل";
  const [sig, setSig] = useState(db.client.profile?.name ?? "");
  const [agree, setAgree] = useState(false);
  const ok = agree && sig.trim().length >= 3;

  return (
    <div className="contract" id="contract-print">
      <header className="ct-head">
        <div><small>رقم العقد</small><b className="num" dir="ltr">{ref}</b></div>
        <div className={"ct-stamp" + (c ? " on" : "")}>{c ? "موقّع" : "مسودة"}</div>
      </header>

      <section><h4>الأطراف</h4>
        <dl className="ct-kv">
          <dt>العميل</dt><dd>{client}</dd>
          <dt>مقدم الخدمة</dt><dd>{name}</dd>
          <dt>الوسيط والضامن</dt><dd>منصة مناسبتي</dd>
        </dl>
      </section>

      <section><h4>الخدمة</h4>
        <dl className="ct-kv">
          <dt>النوع</dt><dd>{KIND[b.kind]}</dd>
          <dt>تاريخ المناسبة</dt><dd className="num">{date}</dd>
          <dt>عدد الضيوف</dt><dd className="num">{fmt(b.guests)}</dd>
          {b.note && <><dt>التفاصيل</dt><dd>{b.note}</dd></>}
        </dl>
      </section>

      <section><h4>المبلغ</h4>
        <dl className="ct-kv">
          <dt>السعر الإجمالي</dt><dd className="num"><b>{sar(price)}</b> <small>{direct ? "(سعر مقدم الخدمة، بدون رسوم إضافية)" : "(شامل خدمة مناسبتي)"}</small></dd>
          {free ? <>
            <dt>رسوم مناسبتي</dt><dd className="num">0 ر.س <small>ما فيه أي رسوم على حجزك</small></dd>
            <dt>الدفع</dt><dd>لمقدم الخدمة مباشرة حسب اتفاقكما</dd>
          </> : direct ? <>
            <dt>رسوم تأكيد الحجز</dt><dd className="num">{sar(deposit)} <small>تُدفع لمناسبتي</small></dd>
            <dt>الباقي</dt><dd className="num">{sar(price - deposit)} <small>يُدفع لمقدم الخدمة مباشرة</small></dd>
          </> : <>
            <dt>العربون ({p.depositPct}٪)</dt><dd className="num">{sar(deposit)}</dd>
            <dt>المتبقي</dt><dd className="num">{sar(price - deposit)} <small>قبل المناسبة</small></dd>
          </>}
        </dl>
      </section>

      <section><h4>البنود</h4>
        <ol className="ct-terms">
          {free ? <>
            <li>لا تتقاضى مناسبتي أي رسوم على هذا الحجز، ولا تستلم أي مبلغ منه. يدفع العميل السعر أعلاه لمقدم الخدمة مباشرة حسب اتفاقهما، ويستلم منه فاتورة نظامية.</li>
            <li>يُنصح العميل بالدفع بعد توقيع هذا العقد وبوسيلة موثّقة (رابط الدفع الخاص بمقدم الخدمة أو تحويل بنكي باسمه).</li>
            <li>إذا اعتذر مقدم الخدمة أو ألغى لسبب لا يرجع للعميل، يرد كل ما استلمه كاملاً، وتتابع مناسبتي ذلك وترشّح بديلاً مناسباً.</li>
          </> : direct ? <>
            <li>يدفع العميل «رسوم تأكيد الحجز» لمناسبتي لقفل الموعد، وهي عمولة المنصة من سعر مقدم الخدمة وجزء من السعر الإجمالي أعلاه، ولا تُضاف على العميل. ويدفع الباقي لمقدم الخدمة مباشرة حسب اتفاقهما، ويستلم منه فاتورة.</li>
            <li>بعد تأكيد استلام الرسوم، تفتح مناسبتي التواصل المباشر بين الطرفين لإتمام الحجز.</li>
            <li>إذا اعتذر مقدم الخدمة أو ألغى، تُرد رسوم التأكيد للعميل كاملة، وترشّح له مناسبتي بديلاً مناسباً، ويرد مقدم الخدمة أي مبلغ استلمه.</li>
          </> : <li>يُدفع العربون لحساب مناسبتي فقط، ومناسبتي تحفظه ولا تحوّله لمقدم الخدمة إلا بعد ختم ليلة المناسبة.</li>}
          <li>يلتزم مقدم الخدمة بالتاريخ والتفاصيل المذكورة أعلاه، وأي تعديل يكون بموافقة الطرفين عبر محادثة الطلب في المنصة.</li>
          {!direct && <li>إذا اعتذر مقدم الخدمة أو ألغى، يسترجع العميل عربونه كاملاً، وترشّح له مناسبتي بديلاً مناسباً.</li>}
          {direct && !free && <li>إذا ألغى العميل الحجز عبر المنصة ثم حجز نفس الخدمة مع مقدم الخدمة مباشرة، لا تُرد رسوم التأكيد.</li>}
          <li>{free ? "إلغاء العميل يخضع لاتفاقه مع مقدم الخدمة، و" : "إلغاء العميل يخضع "}<a href="../cancellation.html" target="_blank" rel="noreferrer">لسياسة الإلغاء والاسترجاع</a> المعلنة في المنصة.</li>
          {!direct && <li>كل التواصل والدفع يكون عبر مناسبتي، حفاظاً على حق الطرفين وضمان المتابعة.</li>}
          <li>منسق مناسبتي يتابع مع مقدم الخدمة ليلة المناسبة، ويبلّغ العميل بحالته.</li>
        </ol>
      </section>

      {c ? (
        <section className="ct-signed">
          <Icon name="ShieldCheck" size={20} />
          <div><b>وقّعه {c.name}</b><small className="num">{dt(c.at)} · نسخة البنود {c.v}</small></div>
          <span className="ct-sig">{c.name}</span>
        </section>
      ) : (
        <section className="ct-sign">
          <label className="ct-agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> قرأت البنود وأوافق عليها</label>
          <div className="field"><label htmlFor="ct-sig">اكتب اسمك الكامل للتوقيع</label><input id="ct-sig" className="input ct-sig-in" value={sig} onChange={(e) => setSig(e.target.value.slice(0, 60))} placeholder="الاسم الكامل" /></div>
          <button className="btn primary lg block" disabled={!ok} onClick={() => { apply(signContract(b.id, sig)); toast("وقّعت العقد. نسخته محفوظة في حجزك"); onDone(); }}><Icon name="FileSignature" size={17} /> أوافق وأوقّع</button>
        </section>
      )}
      <button className="btn ghost block no-print" onClick={() => window.print()}><Icon name="Printer" size={16} /> طباعة أو حفظ PDF</button>
    </div>
  );
}
