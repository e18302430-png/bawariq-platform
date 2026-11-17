import { useEffect } from "react";

/* ═══════════ لمسة سينمائية خفيفة ═══════════
   أرقام فصول للأقسام (CSS فقط) ومؤشر ماوس مخصص بالكمبيوتر. بدون أي شي يشتغل مع التمرير (عشان السلاسة). */
export function CinemaFX() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("cine");
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = document.querySelector<HTMLElement>(".aw-cursor");
    const onMove = (e: PointerEvent) => { if (!cur) return; cur.classList.add("on"); cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; cur.classList.toggle("big", !!(e.target as HTMLElement)?.closest?.("a, button, input, [role=link]")); };
    if (fine && cur) addEventListener("pointermove", onMove, { passive: true });
    return () => removeEventListener("pointermove", onMove);
  }, []);
  return <div className="aw-cursor" aria-hidden="true" />;
}
