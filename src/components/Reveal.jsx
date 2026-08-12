import React from "react";
import { useReveal } from "../hooks/useReveal.js";

const VARIANT_CLASS = {
  rise: "reveal",
  start: "reveal-start",
  end: "reveal-end",
};

export default function Reveal({
  as: Tag = "div",
  variant = "rise",
  delay = 0,
  threshold,
  className = "",
  children,
  ...rest
}) {
  const [ref, isVisible] = useReveal(threshold ? { threshold } : undefined);
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.rise;

  return (
    <Tag
      ref={ref}
      className={`${variantClass} ${isVisible ? "is-visible" : ""} ${className}`}
      style={isVisible && delay ? { animationDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
