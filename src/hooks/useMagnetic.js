import { useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";

export function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  const { reduceMotion } = useLanguage();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion) return undefined;
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return undefined;

    const onMove = (e) => {
      const rect = node.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      node.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => {
      node.style.transform = "";
    };

    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);
    return () => {
      node.removeEventListener("mousemove", onMove);
      node.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, reduceMotion]);

  return ref;
}
