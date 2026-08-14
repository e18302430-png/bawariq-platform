"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CupIllustration } from "@/components/ui/CupIllustration";
import { useCartStore, cartTotal } from "@/lib/cart-store";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = cartTotal(lines);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="سلة المشتريات"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 start-0 z-[70] flex w-full max-w-md flex-col border-e border-line bg-obsidian shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-xl text-off-white">سلتك</h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="إغلاق السلة"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-off-white hover:border-gold hover:text-gold"
              >
                ✕
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="h-24 w-24 opacity-50">
                  <CupIllustration theme="obsidian" />
                </div>
                <p className="text-off-white-dim">سلتك فاضية… وش طلع لك اليوم؟</p>
                <Link
                  href="/cups"
                  onClick={closeDrawer}
                  className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-obsidian"
                >
                  استكشف الباكيتات
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  {lines.map((line) => (
                    <li
                      key={`${line.productSlug}-${line.variantId}`}
                      className="flex gap-4 border-b border-line pb-4"
                    >
                      <div className="h-16 w-16 shrink-0 rounded-lg bg-obsidian-3 p-3">
                        <CupIllustration theme="gold" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-off-white">{line.name}</p>
                        <p className="text-xs text-off-white-dim">{line.variantLabel}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-line px-2 py-1">
                            <button
                              type="button"
                              aria-label="إنقاص الكمية"
                              onClick={() =>
                                setQuantity(line.productSlug, line.variantId, line.quantity - 1)
                              }
                              className="h-6 w-6 text-off-white-dim hover:text-gold"
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-sm text-off-white">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="زيادة الكمية"
                              onClick={() =>
                                setQuantity(line.productSlug, line.variantId, line.quantity + 1)
                              }
                              className="h-6 w-6 text-off-white-dim hover:text-gold"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-gold">
                            {line.price * line.quantity} ر.س
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`حذف ${line.name}`}
                        onClick={() => removeItem(line.productSlug, line.variantId)}
                        className="self-start text-xs text-off-white-dim/70 hover:text-red-bright"
                      >
                        حذف
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line px-6 py-5">
                  <div className="mb-4 flex items-center justify-between text-off-white">
                    <span>الإجمالي</span>
                    <span className="font-bold text-gold">{total} ر.س</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/checkout"
                      onClick={closeDrawer}
                      className="rounded-full bg-gold py-3.5 text-center text-sm font-bold text-obsidian transition-transform hover:scale-[1.02]"
                    >
                      إتمام الطلب
                    </Link>
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="rounded-full border border-line py-3.5 text-center text-sm text-off-white-dim hover:border-gold hover:text-gold"
                    >
                      متابعة التسوق
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
