"use client";

import { motion } from "framer-motion";
import { CupIllustration } from "@/components/ui/CupIllustration";
import { fadeUp, staggerChildren } from "@/lib/motion";

const POINTS = [
  { title: "تصميم يوقف عينك.", side: "top-[6%] start-[6%]" },
  { title: "محتوى يخليك تبتسم.", side: "top-[8%] end-[4%]" },
  { title: "فكرة تخليك تنتظر كوبك.", side: "bottom-[14%] start-[2%]" },
  { title: "هدية لها معنى.", side: "bottom-[10%] end-[8%]" },
];

export function ExperienceSection() {
  return (
    <section id="experience" className="relative overflow-hidden bg-obsidian-2 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-3 text-sm tracking-[0.3em] text-gold uppercase"
        >
          ليش هذا الكوب؟
        </motion.p>

        <div className="relative mx-auto mt-10 flex h-[420px] max-w-md items-center justify-center sm:h-[480px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="h-56 w-56 sm:h-64 sm:w-64"
          >
            <CupIllustration theme="gold" animated />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerChildren(0.12, 0.2)}
            className="pointer-events-none absolute inset-0"
          >
            {POINTS.map((point) => (
              <motion.div
                key={point.title}
                variants={fadeUp}
                className={`absolute max-w-[9.5rem] text-sm text-off-white sm:text-base ${point.side}`}
              >
                <span className="mb-2 block h-1.5 w-1.5 rounded-full bg-gold" />
                {point.title}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
