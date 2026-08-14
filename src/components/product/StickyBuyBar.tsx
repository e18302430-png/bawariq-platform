"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/products";
import { useCartStore } from "@/lib/cart-store";

/**
 * Two modes:
 * - `product` bound: shows price + quantity + add-to-cart for a specific PDP.
 * - browse mode (no product): a discreet CTA once the hero is scrolled past.
 */
export function StickyBuyBar({
  product,
  variantId,
  quantity = 1,
}: {
  product?: Product;
  variantId?: string;
  quantity?: number;
}) {
  const [visible, setVisible] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const threshold = window.innerHeight * 0.9;
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-obsidian/95 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
            {product ? (
              <>
                <div className="min-w-0">
                  <p className="truncate font-display text-base text-off-white sm:text-lg">
                    {product.name}
                  </p>
                  <p className="text-sm text-gold">{(product.price * quantity).toFixed(2)} ر.س</p>
                </div>
                <button
                  type="button"
                  onClick={() => addItem(product, variantId ?? product.variants[0].id, quantity)}
                  className="shrink-0 rounded-full bg-gold px-6 py-3 text-sm font-bold text-obsidian transition-transform hover:scale-[1.03] active:scale-[0.98] sm:px-8"
                >
                  أضف الباكيت للسلة
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-off-white-dim sm:text-base">
                  ٢٥ كوب بـ٩.٩٩ ريال — جاهز تعرف وش طلع لك؟
                </p>
                <a
                  href="/cups"
                  className="shrink-0 rounded-full bg-gold px-6 py-3 text-sm font-bold text-obsidian transition-transform hover:scale-[1.03] active:scale-[0.98] sm:px-8"
                >
                  اطلب الآن
                </a>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
