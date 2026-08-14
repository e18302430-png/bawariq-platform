"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { CupIllustration } from "@/components/ui/CupIllustration";
import { analytics } from "@/lib/analytics";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const SCENES = [
  { lines: ["كل يوم تبدأ", "بنفس الشيء."], sub: "" },
  { lines: ["قهوة."], sub: "روتين يتكرر… بلا مفاجآت." },
  { lines: ["لكن ليه", "تكون نفس التجربة؟"], sub: "" },
  { lines: ["هنا تبدأ", "الحكاية."], sub: "وهنا تبدأ التجربة." },
];

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value > 0.02 && !started) {
      setStarted(true);
      analytics.scrollStoryStart();
    }
    if (value > 0.96 && !completed) {
      setCompleted(true);
      analytics.scrollStoryComplete();
    }
  });

  const rotate = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-8, 8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 1.2]);
  const cupOpacity = useTransform(scrollYProgress, [0, 0.06, 0.94, 1], [0, 1, 1, 0.85]);
  const themeIndex = useTransform(scrollYProgress, [0, 1], [0, 2]);
  const [theme, setTheme] = useState<"gold" | "red" | "obsidian">("gold");

  useMotionValueEvent(themeIndex, "change", (v) => {
    const themes: ("gold" | "red" | "obsidian")[] = ["gold", "red", "gold"];
    setTheme(themes[Math.min(themes.length - 1, Math.max(0, Math.round(v)))]);
  });

  return (
    <section
      id="idea"
      ref={containerRef}
      className="relative bg-obsidian"
      style={{ height: `${SCENES.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: cupOpacity, rotate, scale }}
          className="pointer-events-none absolute h-[46vh] w-[46vh] max-h-80 max-w-80 sm:h-[52vh] sm:w-[52vh]"
        >
          <CupIllustration theme={theme} />
        </motion.div>

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
          {SCENES.map((scene, index) => (
            <Scene
              key={index}
              index={index}
              total={SCENES.length}
              progress={scrollYProgress}
              lines={scene.lines}
              sub={scene.sub}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center gap-2">
          {SCENES.map((_, index) => (
            <ProgressDot key={index} index={index} total={SCENES.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Scene({
  index,
  total,
  progress,
  lines,
  sub,
}: {
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  lines: string[];
  sub: string;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const fadeIn = start + (end - start) * 0.12;
  const fadeOut = end - (end - start) * 0.18;

  const opacity = useTransform(progress, [start, fadeIn, fadeOut, end], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, fadeIn, fadeOut, end], [24, 0, 0, -24]);

  return (
    <motion.div style={{ opacity, y }} className="absolute flex flex-col items-center gap-3">
      <h2 className="font-display text-4xl leading-tight text-off-white sm:text-6xl">
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </h2>
      {sub && <p className="text-base text-gold-soft sm:text-lg">{sub}</p>}
    </motion.div>
  );
}

function ProgressDot({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const width = useTransform(progress, [start, (start + end) / 2, end], [8, 24, 8]);

  return <motion.span style={{ width }} className="h-1.5 rounded-full bg-off-white/40" />;
}
