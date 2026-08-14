"use client";

import { motion } from "framer-motion";
import { products } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { fadeUp } from "@/lib/motion";

export function ProductShowcase() {
  return (
    <section id="collection" className="relative bg-obsidian py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-12 max-w-xl"
        >
          <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">التشكيلة</p>
          <h2 className="font-display text-4xl text-off-white sm:text-5xl">
            كل باكيت… ٢٥ شكل مختلف.
          </h2>
          <p className="mt-4 text-off-white-dim">
            ٩.٩٩ ريال بس للباكيت الواحد. اختر التشكيلة اللي تناسبك.
          </p>
        </motion.div>
      </div>

      <div className="scrollbar-none flex gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:mx-auto lg:max-w-7xl lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
        {products.map((product, index) => (
          <div key={product.slug} className="w-[72vw] shrink-0 xs:w-[64vw] sm:w-[38vw] lg:w-auto">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
