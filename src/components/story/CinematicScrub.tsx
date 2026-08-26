"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { analytics } from "@/lib/analytics";
import { WhatsAppIcon } from "@/components/whatsapp/WhatsAppButton";

const VIDEO_SRC = "/video/product-cinematic.mp4";
const POSTER_SRC = "/images/cinematic-poster.jpg";

const CHECKPOINTS = [
  { at: 0.06, text: "مصنعنا يبتكر." },
  { at: 0.32, text: "أشكال ما شفتها قبل." },
  { at: 0.58, text: "٢٥ شكل في كل باكيت." },
  { at: 0.82, text: "وش طلع لك؟" },
];

/**
 * Signature scroll-scrubbed video moment — the section is pinned for several
 * viewport heights while the video's own playback head is driven directly by
 * scroll progress, frame for frame, instead of playing on a timer. This is
 * the interaction Apple product pages are known for.
 */
export function CinematicScrub() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const video = videoRef.current;
    if (!video || !videoReady || reducedMotion) return;
    const duration = video.duration;
    if (!duration || Number.isNaN(duration)) return;
    const clamped = Math.min(1, Math.max(0, progress));
    video.currentTime = clamped * duration;
  });

  useEffect(() => {
    if (!reducedMotion || !videoRef.current) return;
    videoRef.current.play().catch(() => {});
  }, [reducedMotion]);

  const overlayOpacity = useTransform(scrollYProgress, [0, 0.04, 0.94, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative bg-obsidian"
      style={{ height: "320vh" }}
      aria-label="فيديو المنتج السينمائي"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-obsidian">
          <Image
            src={POSTER_SRC}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            aria-hidden="true"
          />
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="auto"
            loop={reducedMotion}
            poster={POSTER_SRC}
            onLoadedData={() => setVideoReady(true)}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-obsidian/50" />
        </div>

        <motion.div style={{ opacity: overlayOpacity }} className="relative z-10 h-full w-full">
          {CHECKPOINTS.map((checkpoint) => (
            <Checkpoint
              key={checkpoint.text}
              at={checkpoint.at}
              text={checkpoint.text}
              progress={scrollYProgress}
            />
          ))}
        </motion.div>

        <CtaReveal progress={scrollYProgress} />
      </div>
    </section>
  );
}

function Checkpoint({
  at,
  text,
  progress,
}: {
  at: number;
  text: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const window = 0.16;
  const opacity = useTransform(
    progress,
    [at, at + window * 0.3, at + window * 0.7, at + window],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    [at, at + window * 0.3, at + window * 0.7, at + window],
    [20, 0, 0, -20]
  );

  return (
    <motion.p
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-[18%] mx-auto max-w-2xl px-6 text-center font-display text-3xl text-off-white sm:bottom-1/2 sm:translate-y-1/2 sm:text-5xl"
    >
      {text}
    </motion.p>
  );
}

function CtaReveal({
  progress,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const opacity = useTransform(progress, [0.86, 0.94], [0, 1]);
  const y = useTransform(progress, [0.86, 0.94], [16, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-[8%] z-10 flex flex-wrap items-center justify-center gap-3 px-6 sm:bottom-16"
    >
      <Link
        href="/cups"
        className="rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-obsidian transition-transform hover:scale-[1.03]"
      >
        اطلب الباكيت الآن
      </Link>
      <a
        href={whatsappLink(WHATSAPP_DEFAULT_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => analytics.orderViaWhatsapp("cinematic_scrub")}
        className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
      >
        <WhatsAppIcon />
        واتساب
      </a>
    </motion.div>
  );
}
