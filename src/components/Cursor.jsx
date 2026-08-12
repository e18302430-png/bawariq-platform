import React, { useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Cursor() {
  const { reduceMotion } = useLanguage();
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) return undefined;
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return undefined;

    document.documentElement.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let hovering = false;
    let label = "";
    let raf;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      const interactive = e.target.closest("button, a, input, select, textarea, [data-cursor]");
      const labelled = e.target.closest("[data-cursor]");
      hovering = !!interactive;
      label = labelled?.getAttribute("data-cursor") || "";
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) scale(${hovering ? 2.1 : 1})`;
        ringRef.current.style.opacity = label === "hide" ? "0" : "1";
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
        labelRef.current.textContent = label && label !== "hide" ? label : "";
        labelRef.current.style.opacity = label && label !== "hide" ? "1" : "0";
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200] hidden md:block">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={labelRef} className="cursor-label" />
    </div>
  );
}
