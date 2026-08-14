"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { analytics } from "@/lib/analytics";
import { EASE_SIGNATURE } from "@/lib/motion";

// PLACEHOLDER shape teasers — replace with real shape names/photos before launch.
const TEASERS = [
  { kind: "شكل مثير", text: "شكل يخلي ضيوفك يسألون وين جبتها." },
  { kind: "تصميم غريب", text: "تصميم متطور ما شفته بأي مكان ثاني." },
  { kind: "الأكثر تميزًا", text: "الشكل اللي الكل بيسأل عنه بالحفلة." },
  { kind: "مفاجأة الباكيت", text: "كل باكيت فيه خلطة أشكال مختلفة." },
];

export function RevealExperience() {
  const [revealed, setRevealed] = useState(false);
  const [teaser] = useState(() => TEASERS[Math.floor(Math.random() * TEASERS.length)]);

  return (
    <section id="reveal" className="relative bg-obsidian py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
        <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">جرّب الفكرة</p>
        <h2 className="font-display text-4xl text-off-white sm:text-5xl">
          وش ممكن يطلع لك؟
        </h2>
        <p className="mt-4 text-off-white-dim">
          يمكن باكيتك القادم يحمل شكل ما توقعته. جرّب الآن.
        </p>

        <div className="relative mx-auto mt-10 h-64 max-w-sm [perspective:1200px]">
          <motion.div
            className="relative h-full w-full [transform-style:preserve-3d]"
            animate={{ rotateY: revealed ? 180 : 0 }}
            transition={{ duration: 0.7, ease: EASE_SIGNATURE }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-obsidian-3 [backface-visibility:hidden]">
              <span className="text-4xl">؟</span>
              <button
                type="button"
                onClick={() => {
                  setRevealed(true);
                  analytics.revealInteraction(teaser.kind);
                }}
                className="rounded-full bg-gold px-8 py-3 text-sm font-bold text-obsidian transition-transform hover:scale-105"
              >
                اكشف
              </button>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-gold/40 bg-gradient-to-b from-red-deep to-obsidian-3 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <span className="mb-2 block text-xs tracking-[0.3em] text-gold-soft uppercase">
                      {teaser.kind}
                    </span>
                    <p className="font-display text-xl text-off-white">{teaser.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {revealed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-sm text-off-white-dim"
          >
            كل باكيت فيه ٢٥ شكل مختلف. جاهز تطلب باكيتك؟
          </motion.p>
        )}
      </div>
    </section>
  );
}
