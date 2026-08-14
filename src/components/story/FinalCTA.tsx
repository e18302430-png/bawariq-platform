"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CupIllustration } from "@/components/ui/CupIllustration";
import { fadeUp } from "@/lib/motion";
import { trustSignals } from "@/lib/products";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-obsidian py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,rgba(201,162,75,0.12),transparent_70%)]" />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 h-40 w-40 sm:h-48 sm:w-48"
        >
          <CupIllustration theme="gold" animated />
        </motion.div>

        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="font-display text-4xl leading-tight text-off-white sm:text-6xl"
        >
          باقي تعرف وش طلع لك.
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-8"
        >
          <Link
            href="/cups"
            className="inline-block rounded-full bg-gold px-10 py-4 text-base font-bold text-obsidian transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            اكتشف كوبك
          </Link>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-off-white-dim"
        >
          {trustSignals.map((signal) => (
            <li key={signal.label}>{signal.label}</li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
