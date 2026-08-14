"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerChildren } from "@/lib/motion";

// PLACEHOLDER STRUCTURE — no fabricated reviews. Wire this up to real
// verified-purchase review data before launch; ship empty rather than fake.
export type Review = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  productName?: string;
};

export function Reviews({ reviews = [] }: { reviews?: Review[] }) {
  return (
    <section className="bg-obsidian-2 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-12 max-w-xl"
        >
          <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">آراء حقيقية</p>
          <h2 className="font-display text-4xl text-off-white sm:text-5xl">وش قالوا عن الباكيت؟</h2>
        </motion.div>

        {reviews.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerChildren(0.08)}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {reviews.map((review, index) => (
              <motion.figure
                key={index}
                variants={fadeUp}
                className="rounded-2xl border border-line bg-obsidian-3 p-6"
              >
                <div className="mb-3 flex gap-1 text-gold" aria-label={`${review.rating} من 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < review.rating} />
                  ))}
                </div>
                <blockquote className="text-off-white-dim">{review.text}</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-off-white">
                  {review.author}
                  {review.productName && (
                    <span className="text-off-white-dim/70 font-normal"> — {review.productName}</span>
                  )}
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
            <p className="text-off-white-dim">
              التقييمات قادمة قريبًا — كن أول من يشارك تجربته مع باكيتك.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"}>
      <path
        d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5Z"
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.2}
      />
    </svg>
  );
}
