"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { analytics } from "@/lib/analytics";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const VIDEO_SRC = "/video/hero-source.mp4";
const POSTER_SRC = "/images/hero-poster.jpg";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || reducedMotion) return;

    // Only ask the video to play once it's actually visible — never block
    // first paint or interaction on it.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay can be blocked by the browser — poster stays visible, no error UI needed.
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-obsidian"
      aria-hidden="true"
    >
      <Image
        src={POSTER_SRC}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn(
          "object-cover transition-opacity duration-700 ease-out",
          videoReady && !videoFailed ? "opacity-0" : "opacity-100"
        )}
      />

      {!videoFailed && !reducedMotion && (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
            videoReady ? "opacity-100" : "opacity-0"
          )}
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          onCanPlay={() => setVideoReady(true)}
          onPlaying={() => {
            if (!hasPlayed) {
              setHasPlayed(true);
              analytics.playHeroVideo();
            }
          }}
          onError={() => setVideoFailed(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-obsidian/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-transparent to-transparent" />
    </div>
  );
}
