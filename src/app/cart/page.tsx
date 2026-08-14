"use client";

import Link from "next/link";
import { CupIllustration } from "@/components/ui/CupIllustration";
import { useCartStore, cartTotal } from "@/lib/cart-store";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = cartTotal(lines);

  return (
    <div className="mx-auto max-w-3xl px-5 pt-28 pb-24 sm:px-8 lg:pt-32">
      <h1 className="font-display text-4xl text-off-white sm:text-5xl">سلتك</h1>

      {lines.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="h-24 w-24 opacity-50">
            <CupIllustration theme="obsidian" />
          </div>
          <p className="text-off-white-dim">سلتك فاضية… وش طلع لك اليوم؟</p>
          <Link href="/cups" className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-obsidian">
            استكشف الباكيتات
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((line) => (
              <li key={`${line.productSlug}-${line.variantId}`} className="flex gap-4 py-6">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-obsidian-3 p-4">
                  <CupIllustration theme="gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-off-white">{line.name}</p>
                  <p className="text-sm text-off-white-dim">{line.variantLabel}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-full border border-line px-3 py-1.5">
                      <button
                        type="button"
                        aria-label="إنقاص الكمية"
                        onClick={() => setQuantity(line.productSlug, line.variantId, line.quantity - 1)}
                        className="h-6 w-6 text-off-white-dim hover:text-gold"
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-off-white">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="زيادة الكمية"
                        onClick={() => setQuantity(line.productSlug, line.variantId, line.quantity + 1)}
                        className="h-6 w-6 text-off-white-dim hover:text-gold"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-semibold text-gold">{line.price * line.quantity} ر.س</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(line.productSlug, line.variantId)}
                  className="self-start text-xs text-off-white-dim/70 hover:text-red-bright"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between text-lg">
            <span className="text-off-white">الإجمالي</span>
            <span className="font-bold text-gold">{total} ر.س</span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cups"
              className="flex-1 rounded-full border border-line py-3.5 text-center text-sm text-off-white-dim hover:border-gold hover:text-gold"
            >
              متابعة التسوق
            </Link>
            <Link
              href="/checkout"
              className="flex-1 rounded-full bg-gold py-3.5 text-center text-sm font-bold text-obsidian transition-transform hover:scale-[1.02]"
            >
              إتمام الطلب
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
