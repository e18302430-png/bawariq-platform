// Shared motion tokens — keep the whole site moving to one rhythm.
export const EASE_SIGNATURE = [0.22, 1, 0.36, 1] as const;
export const EASE_SOFT = [0.45, 0, 0.2, 1] as const;

export const DURATION = {
  fast: 0.18,
  base: 0.42,
  slow: 0.9,
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_SIGNATURE },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.slow, ease: EASE_SOFT },
  },
};

export const staggerChildren = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});
