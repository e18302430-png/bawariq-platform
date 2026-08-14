"use client";

import { motion } from "framer-motion";
import { CupIllustration } from "@/components/ui/CupIllustration";
import { fadeUp, staggerChildren } from "@/lib/motion";

// PLACEHOLDER — slots for real customer Instagram/TikTok UGC. No fabricated
// photos or handles; wire to the real social feed / CMS before launch.
const SLOTS = Array.from({ length: 6 });

export function UGC() {
  return (
    <section className="bg-obsidian py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">مجتمع بوارق</p>
            <h2 className="font-display text-4xl text-off-white sm:text-5xl">
              كوبك… على طريقتك.
            </h2>
          </div>
          <p className="text-off-white-dim">شارك تجربتك بوسم #بوارق</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerChildren(0.05)}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {SLOTS.map((_, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-line bg-obsidian-2 p-6"
            >
              <div className="h-12 w-12 opacity-40">
                <CupIllustration theme="obsidian" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
