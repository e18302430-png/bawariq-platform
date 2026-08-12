import React, { useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

const GOLD = [192, 154, 67];
const EMERALD = [63, 154, 115];
const EMERALD_LIGHT = [111, 179, 150];

function rgba([r, g, b], a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function buildSilhouetteTargets(width, height, count) {
  const path = new Path2D();
  const cx = width / 2;
  const headR = height * 0.09;
  const headCy = height * 0.22;
  path.arc(cx, headCy, headR, 0, Math.PI * 2);
  path.moveTo(cx - height * 0.14, height * 0.36);
  path.quadraticCurveTo(cx, height * 0.3, cx + height * 0.14, height * 0.36);
  path.lineTo(cx + height * 0.1, height * 0.86);
  path.quadraticCurveTo(cx, height * 0.92, cx - height * 0.1, height * 0.86);
  path.closePath();

  const canvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(1, 1) : document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const points = [];
  let attempts = 0;
  while (points.length < count && attempts < count * 40) {
    attempts += 1;
    const x = Math.random() * width;
    const y = height * 0.08 + Math.random() * height * 0.86;
    if (ctx.isPointInPath(path, x, y)) points.push({ x, y });
  }
  while (points.length < count) {
    points.push({ x: cx + (Math.random() - 0.5) * height * 0.2, y: height * 0.5 + (Math.random() - 0.5) * height * 0.4 });
  }
  return points;
}

function makeParticles(mode, width, height) {
  if (mode === "silhouette") {
    const count = 220;
    const targets = buildSilhouetteTargets(width, height, count);
    return targets.map((t) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      tx: t.x,
      ty: t.y,
      r: 1 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? GOLD : EMERALD_LIGHT,
    }));
  }

  if (mode === "lattice") {
    const cols = 11;
    const rows = 7;
    const points = [];
    for (let i = 0; i <= cols; i += 1) {
      for (let j = 0; j <= rows; j += 1) {
        points.push({
          x: (i / cols) * width + (Math.random() - 0.5) * 18,
          y: (j / rows) * height + (Math.random() - 0.5) * 18,
          gx: i,
          gy: j,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    return { cols, rows, points };
  }

  // arcs
  const arcs = Array.from({ length: 6 }, (_, i) => ({
    baseY: height * (0.2 + (i / 6) * 0.6),
    amp: height * (0.04 + Math.random() * 0.05),
    speed: 0.15 + Math.random() * 0.15,
    phase: Math.random() * Math.PI * 2,
    color: i % 2 === 0 ? GOLD : EMERALD_LIGHT,
    width: 1 + Math.random() * 1.5,
  }));
  return arcs;
}

function draw(ctx, mode, data, width, height, t, progress) {
  ctx.clearRect(0, 0, width, height);

  if (mode === "arcs") {
    data.forEach((arc) => {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const y = arc.baseY + Math.sin(x * 0.006 + t * arc.speed + arc.phase) * arc.amp * (0.4 + progress * 0.6);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(arc.color, 0.16 + progress * 0.22);
      ctx.lineWidth = arc.width;
      ctx.shadowBlur = 14;
      ctx.shadowColor = rgba(arc.color, 0.3);
      ctx.stroke();
    });
    return;
  }

  if (mode === "lattice") {
    const { cols, rows, points } = data;
    const get = (i, j) => points[i * (rows + 1) + j];
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i += 1) {
      for (let j = 0; j <= rows; j += 1) {
        const p = get(i, j);
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.6 - (i + j) * 0.35);
        const right = i < cols ? get(i + 1, j) : null;
        const down = j < rows ? get(i, j + 1) : null;
        ctx.strokeStyle = rgba(EMERALD, 0.08 + progress * 0.14 * pulse);
        if (right) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(right.x, right.y);
          ctx.stroke();
        }
        if (down) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(down.x, down.y);
          ctx.stroke();
        }
      }
    }
    points.forEach((p, idx) => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.6 + idx * 0.15);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4 + pulse * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = rgba(EMERALD_LIGHT, 0.25 + progress * 0.35 * pulse);
      ctx.shadowBlur = 8;
      ctx.shadowColor = rgba(EMERALD_LIGHT, 0.4);
      ctx.fill();
    });
    return;
  }

  // silhouette
  data.forEach((p, idx) => {
    const settle = Math.min(1, progress * 1.4);
    const x = p.x + (p.tx - p.x) * settle;
    const y = p.y + (p.ty - p.y) * settle;
    const jitter = Math.sin(t * 0.8 + p.phase) * 1.6 * settle;
    ctx.beginPath();
    ctx.arc(x + jitter, y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(p.color, 0.25 + settle * 0.55);
    ctx.shadowBlur = 6;
    ctx.shadowColor = rgba(p.color, 0.5);
    ctx.fill();
  });
}

export default function ParticleScene({ mode = "arcs", progress = 0.6, className = "" }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const { reduceMotion } = useLanguage();
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let data = null;
    let raf = null;
    let start = performance.now();

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.max(1, width * dpr);
      canvas.height = Math.max(1, height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      data = makeParticles(mode, width, height);
    };

    const ro = new ResizeObserver(() => size());
    ro.observe(wrap);
    size();

    const frame = (now) => {
      const t = (now - start) / 1000;
      draw(ctx, mode, data, width, height, t, progressRef.current);
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    };

    if (reduceMotion) {
      draw(ctx, mode, data, width, height, 0, Math.max(progressRef.current, 0.85));
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [mode, reduceMotion]);

  return (
    <div ref={wrapRef} className={`pointer-events-none absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
