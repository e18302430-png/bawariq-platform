// Minimal line-art cup mark used across the site wherever real product
// photography isn't available yet — a deliberate brand illustration style,
// not a broken-image fallback. Swap for studio photography per SKU at launch.
import { cn } from "@/lib/cn";

const THEME_STROKE: Record<"red" | "gold" | "obsidian", string> = {
  red: "var(--color-red-bright)",
  gold: "var(--color-gold)",
  obsidian: "var(--color-off-white-dim)",
};

export function CupIllustration({
  theme = "gold",
  className,
  animated = false,
}: {
  theme?: "red" | "gold" | "obsidian";
  className?: string;
  animated?: boolean;
}) {
  const stroke = THEME_STROKE[theme];

  return (
    <svg
      viewBox="0 0 200 240"
      className={cn("h-full w-full", className)}
      fill="none"
      aria-hidden="true"
    >
      <g className={animated ? "origin-bottom motion-safe:animate-[float_6s_ease-in-out_infinite]" : ""}>
        <path
          d="M50 70h100l-8 108a20 20 0 0 1-20 18H78a20 20 0 0 1-20-18L50 70Z"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M150 82h14a18 18 0 0 1 0 36h-11"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse cx="100" cy="70" rx="50" ry="10" stroke={stroke} strokeWidth="2.5" />
        <path
          d="M76 96q12 10 0 20q-12 10 0 20"
          stroke={stroke}
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M92 40q6 10 0 16M100 34q6 12 0 20M108 40q6 10 0 16"
          stroke={stroke}
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
