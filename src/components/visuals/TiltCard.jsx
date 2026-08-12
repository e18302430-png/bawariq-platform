import React, { useRef } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function TiltCard({ as: Tag = "div", className = "", strength = 8, children, ...rest }) {
  const ref = useRef(null);
  const { reduceMotion } = useLanguage();

  const onMove = (e) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(700px) rotateX(${(-py * strength).toFixed(2)}deg) rotateY(${(px * strength).toFixed(2)}deg) translateZ(6px)`;
  };

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "";
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card transition-transform duration-200 ease-out ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
