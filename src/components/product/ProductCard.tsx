"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CupIllustration } from "@/components/ui/CupIllustration";
import type { Product } from "@/lib/products";
import { analytics } from "@/lib/analytics";
import { EASE_SIGNATURE } from "@/lib/motion";

const THEME_BG: Record<Product["colorTheme"], string> = {
  red: "from-red-deep via-obsidian to-obsidian",
  gold: "from-[#3a2c10] via-obsidian to-obsidian",
  obsidian: "from-obsidian-3 via-obsidian to-obsidian",
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE_SIGNATURE, delay: index * 0.06 }}
      className="group"
    >
      <Link
        href={`/products/${product.slug}`}
        onClick={() => analytics.selectProduct(product.slug, product.name)}
        className="block"
      >
        <div
          className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-b ${THEME_BG[product.colorTheme]} border border-line transition-colors group-hover:border-gold/50`}
        >
          {product.badge && (
            <span className="absolute end-4 top-4 z-10 rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-obsidian">
              {product.badge}
            </span>
          )}

          <div className="absolute inset-0 flex items-center justify-center p-10 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-1">
            <CupIllustration theme={product.colorTheme} />
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-sm text-off-white-dim">{product.tagline}</p>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-off-white">{product.name}</h3>
            <p className="mt-1 text-sm text-off-white-dim">{product.tagline}</p>
          </div>
          <div className="shrink-0 text-end">
            <p className="font-bold text-gold">{product.price} ر.س</p>
            {product.compareAtPrice && (
              <p className="text-xs text-off-white-dim/60 line-through">
                {product.compareAtPrice} ر.س
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
