import { useEffect } from "react";

/* ═══════════ لمسة المونتاج السينمائي ═══════════
   حبيبات فيلم، أشرطة سينما على الواجهة تنفتح مع النزول، وقطع ضوئي مع دخول كل قسم.
   كلها CSS خفيفة، وتنطفي مع «تقليل الحركة». */
export function CinemaFX() {
  useEffect(() => {
    const root = document.documentElement;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { root.classList.add("cine-static"); return; }
    root.classList.add("cine");
    const onScroll = () => root.style.setProperty("--bars", String(Math.max(0, 1 - scrollY / 420)));
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("cut-in"); io.unobserve(e.target); } }), { threshold: 0.18 });
    document.querySelectorAll(".sec, .sig, .final").forEach((el) => io.observe(el));
    // مؤشر مخصص + أزرار مغناطيسية (ماوس فقط)
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cur = document.querySelector<HTMLElement>(".aw-cursor");
    let mx = -100, my = -100, cx = -100, cy = -100, raf = 0;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY; cur?.classList.add("on");
      const hot = (e.target as HTMLElement)?.closest?.("a, button, input, [role=link]");
      cur?.classList.toggle("big", !!hot);
      document.querySelectorAll<HTMLElement>(".btn.lg, .cc-chip, .play-film, .fr-btn").forEach((el) => {
        const r = el.getBoundingClientRect(), dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2), d = Math.hypot(dx, dy);
        el.style.transform = d < 110 ? `translate(${dx * 0.18}px, ${dy * 0.22}px)` : "";
      });
    };
    const tick = () => { cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22; if (cur) cur.style.transform = `translate(${cx}px, ${cy}px)`; raf = requestAnimationFrame(tick); };
    if (fine && cur) { addEventListener("pointermove", onMove, { passive: true }); raf = requestAnimationFrame(tick); }
    return () => { removeEventListener("scroll", onScroll); io.disconnect(); removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return <><div className="cine-grain" aria-hidden="true" /><div className="cine-bars" aria-hidden="true"><i /><i /></div><div className="aw-cursor" aria-hidden="true" /></>;
}
