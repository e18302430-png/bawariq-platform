"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CupIllustration } from "@/components/ui/CupIllustration";
import { StickyBuyBar } from "./StickyBuyBar";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import type { Product } from "@/lib/products";
import { trustSignals } from "@/lib/products";
import { useCartStore } from "@/lib/cart-store";
import { analytics } from "@/lib/analytics";
import { fadeUp } from "@/lib/motion";
import { useRouter } from "next/navigation";

export function ProductDetail({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  return (
    <div className="bg-obsidian">
      <ViewTracker event={{ product: product.slug, name: product.name }} />

      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-28 pb-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-32">
        {/* Visual — DESIRE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-24 flex aspect-square items-center justify-center self-start rounded-3xl border border-line bg-gradient-to-b from-obsidian-3 to-obsidian p-16"
        >
          <CupIllustration theme={product.colorTheme} animated />
        </motion.div>

        <div>
          {product.badge && (
            <span className="mb-4 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-obsidian">
              {product.badge}
            </span>
          )}

          {/* DESIRE */}
          <h1 className="font-display text-4xl leading-tight text-off-white sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-gold-soft">{product.tagline}</p>
          <p className="mt-5 leading-relaxed text-off-white-dim">{product.story}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-gold">{product.price} ر.س</span>
            {product.compareAtPrice && (
              <span className="text-off-white-dim/60 line-through">
                {product.compareAtPrice} ر.س
              </span>
            )}
          </div>

          {/* UNDERSTANDING */}
          <div className="mt-8 border-t border-line pt-8">
            <p className="mb-3 text-sm font-semibold text-off-white">اختر النوع</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setVariantId(variant.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    variantId === variant.id
                      ? "border-gold bg-gold text-obsidian font-bold"
                      : "border-line text-off-white-dim hover:border-gold hover:text-gold"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-obsidian-3 p-5">
              <p className="mb-2 text-sm font-semibold text-gold">وش ممكن يطلع لك؟</p>
              <ul className="space-y-1 text-sm text-off-white-dim">
                {product.contentTeasers.map((teaser) => (
                  <li key={teaser.hint}>
                    <span className="text-off-white">{teaser.kind}:</span> {teaser.hint}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <p className="text-sm font-semibold text-off-white">الكمية</p>
              <div className="flex items-center gap-3 rounded-full border border-line px-3 py-1.5">
                <button
                  type="button"
                  aria-label="إنقاص الكمية"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-6 w-6 text-off-white-dim hover:text-gold"
                >
                  −
                </button>
                <span className="w-4 text-center text-off-white">{quantity}</span>
                <button
                  type="button"
                  aria-label="زيادة الكمية"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-6 w-6 text-off-white-dim hover:text-gold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* PURCHASE */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={() => addItem(product, variantId, quantity)}
              className="flex-1 rounded-full border border-gold px-8 py-4 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-obsidian"
            >
              أضف للسلة
            </button>
            <button
              type="button"
              onClick={() => {
                addItem(product, variantId, quantity);
                analytics.beginCheckout(product.price * quantity, quantity);
                router.push("/checkout");
              }}
              className="flex-1 rounded-full bg-gold px-8 py-4 text-sm font-bold text-obsidian transition-transform hover:scale-[1.02]"
            >
              اشترِ الآن
            </button>
          </motion.div>

          {/* TRUST */}
          <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-off-white-dim">
            {trustSignals.map((signal) => (
              <li key={signal.label} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {signal.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <StickyBuyBar product={product} variantId={variantId} quantity={quantity} />
    </div>
  );
}
