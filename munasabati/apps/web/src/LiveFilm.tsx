import { useEffect, useRef, useState } from "react";
import f1 from "./assets/film/f1-wedding.webp";
import f2 from "./assets/film/f2-milka.webp";
import f3 from "./assets/film/f3-coffee.webp";
import f4 from "./assets/film/f4-rooftop.webp";
import f5 from "./assets/film/f5-desert.webp";

/**
 * فيلم حي يُرسم في المتصفح (بدل فيديو مضغوط):
 * صور أصلية حادة + حركة كاميرا بطيئة + انتقال بشق ضوئي + حياة داخل كل مشهد.
 * المؤثرات مرسومة مسبقاً (sprites) فيبقى سلساً حتى على الجوال.
 */
type FX = "dust" | "candles" | "steam" | "city" | "sparks";
const SCENES: { src: string; tint: string; fx: FX; ax: number; ay: number }[] = [
  { src: f1, tint: "#ff8a3d", fx: "dust", ax: 0.5, ay: 0.4 },
  { src: f2, tint: "#ff5c93", fx: "candles", ax: 0.5, ay: 0.85 },
  { src: f3, tint: "#ffb547", fx: "steam", ax: 0.47, ay: 0.6 },
  { src: f4, tint: "#7b86ff", fx: "city", ax: 0.5, ay: 0.4 },
  { src: f5, tint: "#ff7a2e", fx: "sparks", ax: 0.5, ay: 0.6 },
];
const HOLD = 4.6, TRANS = 1.1, SEG = HOLD + TRANS;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const rand = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

function sprite(color: string, size = 64) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const x = c.getContext("2d")!; const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color); g.addColorStop(0.35, color.replace(/[\d.]+\)$/, "0.45)")); g.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
  x.fillStyle = g; x.fillRect(0, 0, size, size); return c;
}

export function LiveFilm({ onReady }: { onReady?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current!;
    const x = canvas.getContext("2d", { alpha: false })!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    const density = small ? 0.5 : 1;
    const imgs: (HTMLImageElement | null)[] = SCENES.map(() => null);
    const S = { gold: sprite("rgba(255,214,150,1)"), warm: sprite("rgba(255,190,120,1)"), pink: sprite("rgba(255,170,200,1)"), white: sprite("rgba(255,240,225,1)"), blue: sprite("rgba(140,170,255,1)"), fire: sprite("rgba(255,150,60,1)") };
    let W = 0, H = 0, raf = 0, visible = true, t0 = performance.now();

    SCENES.forEach((s, i) => { const im = new Image(); im.decoding = "async"; im.onload = () => { imgs[i] = im; if (i === 0) { setReady(true); onReady?.(); } }; im.src = s.src; });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.imageSmoothingQuality = "high";
    };
    const cover = (im: HTMLImageElement, s: number, dx: number) => {
      const r = Math.max(W / im.width, H / im.height) * s;
      const w = im.width * r, h = im.height * r, ox = (W - w) / 2 + dx * W, oy = (H - h) / 2;
      x.drawImage(im, ox, oy, w, h);
      return (u: number, v: number) => [ox + u * w, oy + v * h] as const;
    };
    const dot = (img: HTMLCanvasElement, px: number, py: number, r: number, a: number) => { if (a <= 0.01) return; x.globalAlpha = Math.min(1, a); x.drawImage(img, px - r, py - r, r * 2, r * 2); };

    const fx = (sc: (typeof SCENES)[number], t: number, map: (u: number, v: number) => readonly [number, number], k: number) => {
      x.save(); x.globalCompositeOperation = "screen";
      const [cx, cy] = map(sc.ax, sc.ay); const R = rand(sc.fx.length * 977 + 13); const m = Math.min(W, H) / 1080;
      const N = (n: number) => Math.round(n * density);
      if (sc.fx === "dust") for (let i = 0; i < N(140); i++) { const bx = R() * W, by = R() * H, sp = 8 + R() * 22, ph = R() * 6.28, sz = (R() * 2.2 + 0.6) * m * 5; dot(S.gold, bx + Math.sin(t * 0.6 + ph) * 30 * m, ((by - t * sp * m) % H + H) % H, sz, (0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.2 + ph))) * 0.6 * k); }
      if (sc.fx === "candles") { for (let i = 0; i < N(70); i++) { const px = R() * W, py = H * (0.55 + R() * 0.45), ph = R() * 6.28, sz = (6 + R() * 16) * m * 3, f = 7 + R() * 5; dot(S.warm, px, py, sz, (0.16 + 0.2 * (0.55 + 0.45 * Math.sin(t * f + ph) * Math.sin(t * 3.1 + ph * 2))) * k); } for (let i = 0; i < N(30); i++) { const bx = R() * W, by = R() * H, sp = 10 + R() * 14, sz = (R() * 3 + 1) * m * 5; dot(S.pink, bx + Math.sin(t + i) * 20 * m, (by + t * sp * m) % H, sz, 0.25 * k); } }
      if (sc.fx === "steam") { for (let i = 0; i < 26; i++) { const life = (t * 0.55 + i / 26) % 1, ph = i * 1.7, j = (R() - 0.5) * W * 0.012; dot(S.white, cx + Math.sin(life * 5 + ph + t * 0.8) * Math.min(W, H) * 0.035 * (0.4 + life) + j, cy - life * Math.min(W, H) * 0.42, Math.min(W, H) * (0.025 + life * 0.07), 0.18 * Math.sin(Math.PI * life) * k); } }
      if (sc.fx === "city") { for (let i = 0; i < N(160); i++) { const px = R() * W, py = H * (0.18 + R() * 0.32), ph = R() * 6.28, sz = (R() * 1.6 + 0.6) * m * 4, sp = 2 + R() * 4, blue = R() > 0.7; dot(blue ? S.blue : S.gold, px, py, sz, (0.2 + 0.5 * (0.5 + 0.5 * Math.sin(t * sp + ph))) * k); } }
      if (sc.fx === "sparks") { for (let i = 0; i < N(90); i++) { const sp = 0.35 + R() * 0.4, off = R(), ph = R() * 6.28, dx = (R() - 0.5) * Math.min(W, H) * 0.08, sz = (2 + R() * 3) * m * 3; const life = (t * sp + off) % 1; dot(S.fire, cx + dx + Math.sin(life * 6 + ph) * Math.min(W, H) * 0.04 * life, cy - life * Math.min(W, H) * 0.55, sz, (1 - life) * 0.9 * k); } dot(S.fire, cx, cy, Math.min(W, H) * 0.22, 0.22 * k); }
      x.restore();
    };
    const grade = (tint: string) => {
      x.save();
      const v = x.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.6);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(4,2,8,.6)");
      x.fillStyle = v; x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = "soft-light"; x.globalAlpha = 0.22; x.fillStyle = tint; x.fillRect(0, 0, W, H);
      x.restore();
    };
    const scene = (i: number, local: number, k = 1) => {
      const im = imgs[i]; if (!im) return false;
      const p = clamp(local / SEG);
      const map = cover(im, 1.04 + 0.1 * p, (i % 2 ? -0.012 : 0.012) * p);
      grade(SCENES[i].tint);
      fx(SCENES[i], local + i * 7, map, k);
      return true;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !imgs[0]) return;
      const t = reduce ? 1 : (now - t0) / 1000;
      const loaded = imgs.filter(Boolean).length;
      const order = SCENES.map((_, i) => i).filter((i) => imgs[i]);
      const u = t % (SEG * order.length), n = Math.floor(u / SEG), local = u - n * SEG;
      const i = order[n % order.length], j = order[(n + 1) % order.length];
      x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
      if (local < HOLD || loaded < 2) { scene(i, local); return; }
      const p = ease((local - HOLD) / TRANS);
      scene(i, local);
      x.fillStyle = `rgba(5,2,9,${0.45 * clamp(p * 2)})`; x.fillRect(0, 0, W, H);
      const half = (W / 2) * p * 1.02;
      x.save(); x.beginPath(); x.rect(W / 2 - half, 0, half * 2, H); x.clip(); scene(j, (local - HOLD) * 0.3); x.restore();
      const edge = Math.min(W, H) * 0.07 * (1 - p * 0.6);
      x.save(); x.globalCompositeOperation = "screen";
      for (const sx of [W / 2 - half, W / 2 + half]) { const g = x.createLinearGradient(sx - edge, 0, sx + edge, 0); g.addColorStop(0, "rgba(255,200,140,0)"); g.addColorStop(0.5, `rgba(255,236,205,${0.95 * (1 - p * 0.7)})`); g.addColorStop(1, "rgba(255,200,140,0)"); x.fillStyle = g; x.fillRect(sx - edge, 0, edge * 2, H); }
      x.globalAlpha = Math.sin(Math.PI * p) * 0.28; x.fillStyle = SCENES[j].tint; x.fillRect(0, 0, W, H);
      x.restore();
    };
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);
    const vis = () => { if (document.hidden) visible = false; else { visible = true; } };
    document.addEventListener("visibilitychange", vis);
    resize(); t0 = performance.now(); raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", vis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} className={"live-film" + (ready ? " ready" : "")} aria-hidden="true" />;
}
