import React from "react";

export default function GeoPattern({ progress = 0, className = "", id = "mashrabiya" }) {
  const reveal = Math.max(0, Math.min(1, progress));
  const radius = 8 + reveal * 95;

  return (
    <svg viewBox="0 0 400 400" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id={id} width="42" height="42" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M21 1 L41 21 L21 41 L1 21 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
          <circle cx="21" cy="21" r="3.4" fill="currentColor" opacity="0.4" />
        </pattern>
        <radialGradient id={`${id}-grad`} cx="50%" cy="50%" r="50%">
          <stop offset={`${Math.max(0, radius - 18)}%`} stopColor="white" stopOpacity="1" />
          <stop offset={`${radius}%`} stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`}>
          <rect width="400" height="400" fill={`url(#${id}-grad)`} />
        </mask>
      </defs>
      <rect width="400" height="400" fill={`url(#${id})`} mask={`url(#${id}-mask)`} />
    </svg>
  );
}
