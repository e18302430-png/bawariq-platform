import { useEffect, useState } from "react";

function rafScrollWatcher(node, compute, setProgress) {
  let raf = null;
  const update = () => {
    raf = null;
    setProgress(compute(node));
  };
  const onScroll = () => {
    if (raf == null) raf = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (raf != null) cancelAnimationFrame(raf);
  };
}

/**
 * Progress 0 -> 1 across a pinned (position: sticky) section's scroll range:
 * 0 when the wrapper's top reaches the viewport top, 1 when its bottom does.
 */
export function usePinProgress(ref) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    return rafScrollWatcher(node, (el) => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / total));
    }, setProgress);
  }, [ref]);
  return progress;
}

/**
 * Progress 0 -> 1 as an element travels through the viewport
 * (0 when it enters at the bottom, 1 when it exits at the top).
 */
export function useTravelProgress(ref) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    return rafScrollWatcher(node, (el) => {
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      return Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));
    }, setProgress);
  }, [ref]);
  return progress;
}

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
