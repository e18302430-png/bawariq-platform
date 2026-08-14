"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroVideo } from "./HeroVideo";
import { EASE_SIGNATURE } from "@/lib/motion";

export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[560px] w-full items-end overflow-hidden bg-obsidian">
      <HeroVideo />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_SIGNATURE, delay: 0.2 }}
          className="mb-4 text-sm tracking-[0.3em] text-gold-soft uppercase"
        >
          بوارق
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_SIGNATURE, delay: 0.35 }}
          className="font-display text-5xl leading-[1.1] text-off-white sm:text-7xl lg:text-8xl"
        >
          وش طلع لك؟
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_SIGNATURE, delay: 0.5 }}
          className="mt-5 max-w-md text-lg text-off-white-dim sm:text-xl"
        >
          مو كل كوب… مجرد كوب.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_SIGNATURE, delay: 0.65 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/cups"
            className="rounded-full bg-gold px-8 py-4 text-sm font-bold text-obsidian transition-transform hover:scale-[1.03] active:scale-[0.98] sm:text-base"
          >
            اكتشف كوبك
          </Link>
          <Link
            href="#idea"
            className="rounded-full border border-off-white/30 px-8 py-4 text-sm font-bold text-off-white transition-colors hover:border-gold hover:text-gold sm:text-base"
          >
            شوف كيف الفكرة
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute inset-x-0 bottom-6 z-10 flex justify-center"
      >
        <div className="flex flex-col items-center gap-2 text-off-white/60">
          <span className="text-[11px] tracking-[0.25em] uppercase">انزل تكتشف</span>
          <span className="h-8 w-px animate-pulse bg-off-white/40" />
        </div>
      </motion.div>
    </section>
  );
}
