import React, { useMemo } from "react";

export default function PathReveal({ progress = 0, steps = 6, className = "" }) {
  const width = 1600;
  const height = 360;

  const { d, points } = useMemo(() => {
    const pts = Array.from({ length: steps }, (_, i) => ({
      x: (i / (steps - 1)) * (width - 160) + 80,
      y: height / 2 + Math.sin(i * 1.4) * 100,
    }));
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i += 1) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const cx = (prev.x + cur.x) / 2;
      path += ` Q ${cx} ${prev.y} ${cur.x} ${cur.y}`;
    }
    return { d: path, points: pts };
  }, [steps]);

  const dashTotal = width * 1.3;
  const dashOffset = (1 - Math.max(0, Math.min(1, progress))) * dashTotal;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path d={d} fill="none" stroke="rgba(192,154,67,0.2)" strokeWidth="2" />
      <path
        d={d}
        fill="none"
        stroke="#CFAE60"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={dashTotal}
        strokeDashoffset={dashOffset}
      />
      {points.map((p, i) => {
        const active = progress >= i / (steps - 1) - 0.04;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={active ? 7 : 4}
            fill={active ? "#CFAE60" : "rgba(251,250,247,0.35)"}
            style={{ transition: "r 0.4s ease, fill 0.4s ease" }}
          />
        );
      })}
    </svg>
  );
}
