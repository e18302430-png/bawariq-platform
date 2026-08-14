"use client";

import { useState } from "react";
import Link from "next/link";
import { CupIllustration } from "@/components/ui/CupIllustration";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { analytics } from "@/lib/analytics";

// PLACEHOLDER shipping fee + payment methods — replace with real
// shipping-rate logic and a real payment gateway integration before launch.
const SHIPPING_FEE = 20;

export default function CheckoutPage() {
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const subtotal = cartTotal(lines);
  const total = lines.length ? subtotal + SHIPPING_FEE : 0;

  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");

  if (lines.length === 0 && !placed) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-5 pt-32 pb-24 text-center">
        <div className="h-20 w-20 opacity-50">
          <CupIllustration theme="obsidian" />
        </div>
        <p className="text-off-white-dim">سلتك فاضية حالياً.</p>
        <Link href="/cups" className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-obsidian">
          استكشف الباكيتات
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-5 pt-32 pb-24 text-center">
        <div className="h-24 w-24">
          <CupIllustration theme="gold" animated />
        </div>
        <h1 className="font-display text-3xl text-off-white">تم استلام طلبك!</h1>
        <p className="text-off-white-dim">
          راح تعرف وش طلع لك قريبًا. تفاصيل الطلب وصلتك — استنى التوصيل.
        </p>
        <Link href="/" className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-obsidian">
          الرجوع للرئيسية
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPlacing(true);
    // Simulated order placement — wire to a real payment/order API before launch.
    const orderId = `WTL-${Date.now().toString().slice(-6)}`;
    window.setTimeout(() => {
      analytics.purchase(orderId, total);
      clear();
      setPlacing(false);
      setPlaced(true);
    }, 500);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pt-28 pb-24 sm:px-8 lg:pt-32">
      <h1 className="mb-8 font-display text-3xl text-off-white sm:text-4xl">إتمام الطلب</h1>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          <fieldset className="space-y-4">
            <legend className="mb-1 text-sm font-semibold text-gold">بيانات التواصل</legend>
            <Field label="الاسم الكامل" name="name" type="text" required />
            <Field label="رقم الجوال" name="phone" type="tel" required />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-1 text-sm font-semibold text-gold">عنوان الشحن</legend>
            <Field label="المدينة" name="city" type="text" required />
            <Field label="العنوان التفصيلي" name="address" type="text" required />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold text-gold">طريقة الدفع</legend>
            <PaymentOption
              id="cod"
              label="الدفع عند الاستلام"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            <PaymentOption
              id="card"
              label="بطاقة ائتمانية (قريبًا)"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
              disabled
            />
          </fieldset>

          <button
            type="submit"
            disabled={placing}
            className="w-full rounded-full bg-gold py-4 text-sm font-bold text-obsidian transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {placing ? "جارٍ تأكيد الطلب..." : `تأكيد الطلب — ${total} ر.س`}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-line bg-obsidian-3 p-6">
          <h2 className="mb-4 font-display text-lg text-off-white">ملخص الطلب</h2>
          <ul className="space-y-3 text-sm">
            {lines.map((line) => (
              <li key={`${line.productSlug}-${line.variantId}`} className="flex justify-between text-off-white-dim">
                <span>
                  {line.name} <span className="text-off-white-dim/60">×{line.quantity}</span>
                </span>
                <span>{line.price * line.quantity} ر.س</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-off-white-dim">
              <span>المجموع الفرعي</span>
              <span>{subtotal} ر.س</span>
            </div>
            <div className="flex justify-between text-off-white-dim">
              <span>الشحن</span>
              <span>{SHIPPING_FEE} ر.س</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold text-off-white">
              <span>الإجمالي</span>
              <span className="text-gold">{total} ر.س</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-off-white-dim">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-line bg-obsidian-2 px-4 py-3 text-off-white outline-none transition-colors focus:border-gold"
      />
    </label>
  );
}

function PaymentOption({
  id,
  label,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
        checked ? "border-gold" : "border-line"
      } ${disabled ? "opacity-40" : "cursor-pointer"}`}
    >
      <input
        id={id}
        type="radio"
        name="payment"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 accent-[color:var(--color-gold)]"
      />
      <span className="text-sm text-off-white">{label}</span>
    </label>
  );
}
