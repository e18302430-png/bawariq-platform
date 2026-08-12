import React from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

/**
 * Word-level (not character-level) staggered reveal. Arabic requires letters
 * within a word to stay in the same text run for correct contextual shaping,
 * so we only ever split on whitespace, never on individual characters.
 *
 * mode="scroll": `progress` is a continuously-swept 0..1 scroll value; each
 * word's reveal is derived directly from it (no CSS transition, so it tracks
 * the scroll position with zero lag).
 * mode="mount": `progress` flips once from 0 to 1; the stagger is expressed
 * as real CSS transition-delay per word so it animates over time.
 */
export default function KineticText({ text, progress = 1, as: Tag = "span", className = "", stagger = 0.09, mode = "scroll" }) {
  const { reduceMotion } = useLanguage();
  const words = text.split(" ");

  if (reduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const revealed = progress >= 1;

  return (
    <Tag className={className}>
      {words.map((word, i) => {
        const marginInlineEnd = i < words.length - 1 ? "0.28em" : 0;
        let style;

        if (mode === "mount") {
          const delay = `${(i * stagger).toFixed(2)}s`;
          style = {
            opacity: revealed ? 1 : 0,
            filter: revealed ? "blur(0px)" : "blur(6px)",
            transform: revealed ? "translateY(0px)" : "translateY(18px)",
            transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}, filter 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}`,
            marginInlineEnd,
          };
        } else {
          const start = i * stagger;
          const local = Math.max(0, Math.min(1, (progress - start) / (1 - stagger || 1)));
          const eased = 1 - (1 - local) ** 3;
          style = {
            opacity: eased,
            filter: `blur(${(1 - eased) * 6}px)`,
            transform: `translateY(${(1 - eased) * 18}px)`,
            marginInlineEnd,
          };
        }

        return (
          <span key={`${word}-${i}`} className="split-char" style={style}>
            {word}
          </span>
        );
      })}
    </Tag>
  );
}
