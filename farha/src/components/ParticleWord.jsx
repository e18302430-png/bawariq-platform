import React, { useEffect, useRef } from "react";

/*
  كلمة من ضوء: آلاف الجزيئات الذهبية تتشكل على هيئة الكلمة (بخط الرقعة)،
  تتفرق عند مرور المؤشر وتعود، وتعيد التشكل كلما تغيرت الكلمة.
*/
export default function ParticleWord({ word, font = '700 1px "Aref Ruqaa"' }) {
  const ref = useRef(null);
  const st = useRef({ parts: [], mouse: { x: -999, y: -999 }, w: 0, h: 0, dpr: 1, word: "" });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const s = st.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf, alive = true;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      s.dpr = Math.min(2, window.devicePixelRatio || 1);
      s.w = r.width; s.h = r.height;
      canvas.width = r.width * s.dpr; canvas.height = r.height * s.dpr;
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      if (s.word) shape(s.word);
    };

    const sample = (text) => {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.floor(s.w)); off.height = Math.max(1, Math.floor(s.h));
      const o = off.getContext("2d");
      let size = s.h * 0.82;
      o.font = font.replace("1px", size + "px");
      const tw = o.measureText(text).width;
      if (tw > s.w * 0.92) size *= (s.w * 0.92) / tw;
      o.font = font.replace("1px", size + "px");
      o.direction = "rtl"; o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff";
      o.fillText(text, s.w / 2, s.h * 0.5);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const gap = s.w < 500 ? 2 : 3;
      const pts = [];
      for (let y = 0; y < off.height; y += gap)
        for (let x = 0; x < off.width; x += gap)
          if (data[(y * off.width + x) * 4 + 3] > 140) pts.push([x + (Math.random() - .5), y + (Math.random() - .5)]);
      for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
      return pts;
    };

    const shape = (text) => {
      s.word = text;
      const pts = sample(text);
      const need = Math.max(pts.length + 120, s.parts.length);
      while (s.parts.length < need) {
        s.parts.push({ x: Math.random() * s.w, y: Math.random() * s.h, vx: 0, vy: 0, tx: 0, ty: 0, free: true, size: Math.random() * 1.3 + .9, tw: Math.random() * Math.PI * 2 });
      }
      s.parts.forEach((p, i) => {
        if (i < pts.length) { p.tx = pts[i][0]; p.ty = pts[i][1]; p.free = false; }
        else { p.free = true; p.tx = Math.random() * s.w; p.ty = Math.random() * s.h; }
        if (reduce) { p.x = p.tx; p.y = p.ty; }
      });
    };

    const draw = (t) => {
      if (!alive) return;
      ctx.clearRect(0, 0, s.w, s.h);
      ctx.globalCompositeOperation = "lighter";
      const m = s.mouse;
      for (const p of s.parts) {
        if (!reduce) {
          const dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy;
          if (d2 < 4200) { const f = (4200 - d2) / 4200 * 2.4; const d = Math.sqrt(d2) || 1; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
          const k = p.free ? 0.0016 : 0.022;
          p.vx += (p.tx - p.x) * k; p.vy += (p.ty - p.y) * k;
          if (p.free) { p.vx += Math.sin(t / 1400 + p.tw) * 0.02; p.vy += Math.cos(t / 1700 + p.tw) * 0.02; }
          p.vx *= 0.86; p.vy *= 0.86;
          p.x += p.vx; p.y += p.vy;
        }
        const g = p.x / (s.w || 1);
        const tw = 0.55 + 0.45 * Math.sin(t / 500 + p.tw);
        const a = p.free ? 0.25 * tw : 0.65 + 0.35 * tw;
        // من الوردي إلى الذهبي على عرض الكلمة
        const r = 233 + (224 - 233) * g, gg = 201 + (154 - 201) * g, b = 139 + (174 - 139) * g;
        ctx.fillStyle = `rgba(${r | 0},${gg | 0},${b | 0},${a})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      s.mouse.x = pt.clientX - r.left; s.mouse.y = pt.clientY - r.top;
    };
    const onLeave = () => { s.mouse.x = -999; s.mouse.y = -999; };
    const onClick = () => { // انفجار ضوئي ثم عودة
      for (const p of s.parts) { p.vx += (Math.random() - .5) * 26; p.vy += (Math.random() - .5) * 26; }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove, { passive: true });
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("touchend", onLeave);
    canvas.addEventListener("click", onClick);
    s.shape = shape;
    resize();
    (document.fonts?.load ? document.fonts.load(font.replace("1px", "80px"), "فرحة").catch(() => {}) : Promise.resolve()).then(() => { if (alive) shape(s.pending || word); });
    raf = requestAnimationFrame(draw);
    return () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("mouseleave", onLeave); canvas.removeEventListener("touchend", onLeave);
      canvas.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = st.current;
    s.pending = word;
    if (s.shape && s.w && word !== s.word) s.shape(word);
  }, [word]);

  return <canvas ref={ref} role="img" aria-label={`كلمة ${word} مرسومة بالضوء`} title="مرّر المؤشر أو اضغط" />;
}
