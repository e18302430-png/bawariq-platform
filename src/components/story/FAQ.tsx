"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// PLACEHOLDER copy — confirm shipping timelines / return policy specifics before launch.
const FAQ_ITEMS = [
  {
    q: "ليه السعر رخيص كذا؟",
    a: "لأننا مصنع ونبيعك مباشر بدون وسطاء وتجار جملة — نفس الجودة بسعر المصنع.",
  },
  {
    q: "وش يميز أشكال الأكواب؟",
    a: "كل باكيت فيه ٢٥ كوب بتصاميم متطورة ومثيرة — ما تعرف وش بيطلع لك إلا وأنت تفتح الباكيت.",
  },
  {
    q: "الأشكال تتكرر بين الباكيتات؟",
    a: "نحرص نوزع خلطة أشكال متنوعة بكل باكيت — كل باكيت تجربة مستقلة.",
  },
  {
    q: "الشحن كم ياخذ؟",
    a: "الشحن يشمل جميع مناطق المملكة. مدة التوصيل تختلف حسب المنطقة — التفاصيل عند إتمام الطلب.",
  },
  {
    q: "أقدر أطلب كميات أكبر للمحلات أو المناسبات؟",
    a: "أكيد، تقدر تطلب أكثر من باكيت بنفس الصفحة — وللكميات الكبيرة جدًا تواصل معنا مباشرة.",
  },
  {
    q: "أقدر أستبدل الباكيت؟",
    a: "نعم، حسب سياسة الاستبدال والإرجاع المعلنة عند الشراء.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-obsidian-2 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="mb-3 text-center text-sm tracking-[0.3em] text-gold uppercase">
          أسئلة شائعة
        </p>
        <h2 className="mb-10 text-center font-display text-4xl text-off-white sm:text-5xl">
          كل اللي تبغى تعرفه
        </h2>

        <div className="divide-y divide-line rounded-2xl border border-line bg-obsidian-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                >
                  <span className="font-medium text-off-white">{item.q}</span>
                  <span
                    className={`shrink-0 text-xl text-gold transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.45, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-off-white-dim">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
