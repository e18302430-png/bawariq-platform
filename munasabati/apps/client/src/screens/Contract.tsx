import { useState } from "react";
import { depositFor, pricingOf, sar, signContract, fmt, type Booking } from "@munasabati/core";
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
  const p = pricingOf(db);
  const c = b.contract;
  const price = c?.price ?? b.clientPrice ?? 0, deposit = c?.deposit ?? depositFor(b, p), date = c?.date ?? b.date;
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
          <dt>السعر الإجمالي</dt><dd className="num"><b>{sar(price)}</b> <small>(شامل خدمة مناسبتي)</small></dd>
          <dt>العربون ({p.depositPct}٪)</dt><dd className="num">{sar(deposit)}</dd>
          <dt>المتبقي</dt><dd className="num">{sar(price - deposit)} <small>قبل المناسبة</small></dd>
        </dl>
      </section>

      <section><h4>البنود</h4>
        <ol className="ct-terms">
          <li>يُدفع العربون لحساب مناسبتي فقط، ومناسبتي تحفظه ولا تحوّله لمقدم الخدمة إلا بعد ختم ليلة المناسبة.</li>
          <li>يلتزم مقدم الخدمة بالتاريخ والتفاصيل المذكورة أعلاه، وأي تعديل يكون بموافقة الطرفين عبر محادثة الطلب في المنصة.</li>
          <li>إذا اعتذر مقدم الخدمة أو ألغى، يسترجع العميل عربونه كاملاً، وترشّح له مناسبتي بديلاً مناسباً.</li>
          <li>إلغاء العميل يخضع <a href="../cancellation.html" target="_blank" rel="noreferrer">لسياسة الإلغاء والاسترجاع</a> المعلنة في المنصة.</li>
          <li>كل التواصل والدفع يكون عبر مناسبتي، حفاظاً على حق الطرفين وضمان المتابعة.</li>
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
