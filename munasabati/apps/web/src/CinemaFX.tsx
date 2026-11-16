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
    return () => { removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);
  return <><div className="cine-grain" aria-hidden="true" /><div className="cine-bars" aria-hidden="true"><i /><i /></div></>;
}
