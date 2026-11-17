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
    // مؤشر مخصص خفيف (ماوس فقط): يتحرك مع الماوس بدون حلقة رسم دائمة
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cur = document.querySelector<HTMLElement>(".aw-cursor");
    const onMove = (e: PointerEvent) => { if (!cur) return; cur.classList.add("on"); cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; cur.classList.toggle("big", !!(e.target as HTMLElement)?.closest?.("a, button, input, [role=link]")); };
    if (fine && cur) addEventListener("pointermove", onMove, { passive: true });
    return () => { removeEventListener("scroll", onScroll); io.disconnect(); removeEventListener("pointermove", onMove); };
  }, []);
  return <><div className="cine-bars" aria-hidden="true"><i /><i /></div><div className="aw-cursor" aria-hidden="true" /></>;
}
