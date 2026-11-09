import React, { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, animate, useDragControls } from "framer-motion";
import { createPortal } from "react-dom";
import { Icon } from "./icons";
import { photoUrl } from "./media";
import { useDB } from "./data";
import { AnnouncementBar } from "./support";
import { BRAND, LogoMark } from "./Logo";
import { isoDay, seeded, type BookingStatus } from "@munasabati/core";

/* ───── عدّاد رقمي متحرك ───── */
export function Counter({ value, format = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n)) }: { value: number; format?: (n: number) => string }) {
  const mv = useMotionValue(value);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1], onUpdate: setShown });
    return () => c.stop();
  }, [value, mv]);
  return <span className="num">{format(shown)}</span>;
}

/* ───── ظهور عند التمرير (يبدأ من حالة مرئية جزئياً) ───── */
export function Reveal({ children, delay = 0, className, style }: { children: ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div className={className} style={style} initial={{ opacity: 0.35, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/* ───── تنبيهات ───── */
const ToastCtx = createContext<(t: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, text }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} className="toast" initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
              <Icon name="CheckCircle2" size={17} /> {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ───── نافذة سفلية (تُسحب للإغلاق على الجوال) ───── */
/** قفل تمرير الصفحة خلف النوافذ المنبثقة بعدّاد: نافذتان فوق بعض ما تتركان الصفحة مقفلة بالغلط */
let scrollLocks = 0;
function lockScroll() { if (scrollLocks++ === 0) document.documentElement.classList.add("scroll-locked"); }
function unlockScroll() { scrollLocks = Math.max(0, scrollLocks - 1); if (scrollLocks === 0) document.documentElement.classList.remove("scroll-locked"); }

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const wide = typeof window !== "undefined" && window.matchMedia("(min-width: 720px)").matches;
  // السحب للإغلاق من المقبض والعنوان فقط، حتى يبقى المحتوى قابلاً للتمرير على الجوال
  const drag = useDragControls();
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    lockScroll();
    return () => { window.removeEventListener("keydown", k); unlockScroll(); };
  }, [open, onClose]);
  // نرسم النافذة مباشرة في body: حاوية الصفحة المتحركة (will-change) تكسر position: fixed فتطلع النافذة تحت الشاشة لما الصفحة متمررة
  const node = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="sheet-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="sheet" role="dialog" aria-modal="true" aria-label={title}
            initial={wide ? { opacity: 0, scale: 0.94, x: "-50%", y: "-46%" } : { y: "100%" }}
            animate={wide ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" } : { y: 0 }}
            exit={wide ? { opacity: 0, scale: 0.96, x: "-50%", y: "-48%" } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            drag={wide ? false : "y"} dragControls={drag} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) onClose(); }}
          >
            <div className="sheet-grab" onPointerDown={(e) => !wide && drag.start(e)}>
              <div className="sheet-handle" />
              <div className="sheet-head"><h3>{title}</h3><button className="icon-btn sm" onClick={onClose} onPointerDown={(e) => e.stopPropagation()} aria-label="إغلاق"><Icon name="X" size={17} /></button></div>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
  return typeof document !== "undefined" ? createPortal(node, document.body) : node;
}

/* ───── مفتاح اختيار متعدد بمؤشر منزلق ───── */
export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: [T, string][]; label?: string }) {
  const id = useId();
  return (
    <div className="seg" role="tablist" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} role="tab" aria-selected={value === v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>
          {value === v && <motion.span layoutId={"seg" + id} className="seg-thumb" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
          {l}
        </button>
      ))}
    </div>
  );
}

const STATUS: Record<BookingStatus, [string, string]> = {
  review: ["neutral", "عند الإدارة"], new: ["warn", "بانتظار عرض السعر"], quoted: ["info", "عرض سعر"], confirmed: ["ok", "مؤكد"], declined: ["bad", "معتذر"],
};
export function StatusPill({ status, labels }: { status: BookingStatus; labels?: Partial<Record<BookingStatus, string>> }) {
  const [c, l] = STATUS[status];
  return <span className={"pill " + c}>{labels?.[status] ?? l}</span>;
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return <div className="empty"><span className="ico"><Icon name={icon} size={28} /></span><b style={{ color: "var(--ink)", fontSize: 16 }}>{title}</b>{children}</div>;
}

/* ───── تقويم اختيار يوم ───── */
export function Calendar({ busy, value, onPick, maxMonths = 6 }: { busy: Set<string>; value?: string; onPick: (iso: string) => void; maxMonths?: number }) {
  const [offset, setOffset] = useState(() => {
    if (!value) return 0;
    const v = new Date(value), n = new Date();
    return Math.max(0, (v.getFullYear() - n.getFullYear()) * 12 + v.getMonth() - n.getMonth());
  });
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + offset);
  const y = base.getFullYear(), m = base.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const t = isoDay(new Date());
  return (
    <div>
      <div className="cal-head">
        <button className="icon-btn sm" onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} aria-label="الشهر السابق"><Icon name="ChevronRight" size={16} /></button>
        <b className="display" style={{ fontSize: 14.5 }}>{base.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { month: "long", year: "numeric" })}</b>
        <button className="icon-btn sm" onClick={() => setOffset((o) => Math.min(maxMonths, o + 1))} aria-label="الشهر التالي"><Icon name="ChevronLeft" size={16} /></button>
      </div>
      <div className="cal">
        {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((d) => <div key={d} className="h">{d}</div>)}
        {Array.from({ length: first }, (_, i) => <div key={"b" + i} />)}
        {Array.from({ length: days }, (_, i) => {
          const iso = isoDay(new Date(Date.UTC(y, m, i + 1)));
          const wd = new Date(Date.UTC(y, m, i + 1)).getUTCDay();
          const past = iso < t, isBusy = busy.has(iso);
          const cls = ["d num", past ? "past" : isBusy ? "busy" : "", value === iso ? "sel" : "", iso === t ? "today" : "", wd >= 4 && wd <= 6 ? "weekend" : ""].join(" ");
          return <button key={iso} className={cls} disabled={past || isBusy} onClick={() => onPick(iso)} aria-label={iso + (isBusy ? " محجوز" : "")} aria-pressed={value === iso}>{i + 1}</button>;
        })}
      </div>
    </div>
  );
}

/* ───── رمز QR ───── */
export function QR({ text, size = 240 }: { text: string; size?: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    // تحميل مكتبة QR عند الحاجة فقط
    import("qrcode").then((Q) => Q.toDataURL(text, { margin: 1, width: size, color: { dark: "#121016", light: "#ffffff" } })).then((u) => live && setSrc(u)).catch(() => live && setSrc(""));
    return () => { live = false; };
  }, [text, size]);
  return src ? <img src={src} alt={`رمز الدخول ${text}`} style={{ width: "100%", height: "100%", display: "block" }} /> : null;
}

/* ───── رسم توليدي بديل للصور (لكل قاعة ومورد هوية لونية خاصة) ───── */
export function Art({ seed, hue, kind = "venue", rounded = 0 }: { seed: string; hue: number; kind?: "venue" | "supplier"; rounded?: number }) {
  const rnd = seeded(seed);
  const gid = "a" + seed.replace(/[^a-z0-9]/gi, "");
  const blobs = Array.from({ length: 4 }, (_, i) => ({ x: rnd() * 400, y: rnd() * 260, r: 90 + rnd() * 120, h: (hue - i * 26 - rnd() * 18 + 720) % 360 }));
  const lights = Array.from({ length: 26 }, () => ({ x: rnd() * 400, y: rnd() * 140, r: rnd() * 1.6 + 0.4, o: rnd() * 0.7 + 0.2 }));
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true" style={{ display: "block", borderRadius: rounded }}>
      <defs>
        <filter id={gid + "b"} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="38" /></filter>
        <linearGradient id={gid + "s"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".45" /></linearGradient>
      </defs>
      <rect width="400" height="260" fill={`hsl(${hue} 55% 18%)`} />
      <g filter={`url(#${gid}b)`}>{blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={`hsl(${b.h} 78% ${48 + i * 5}%)`} opacity=".9" />)}</g>
      {lights.map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={l.r} fill="#fff" opacity={l.o * 0.8} />)}
      {kind === "venue" ? (
        <g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.4">
          <path d="M120 260 V150 Q200 40 280 150 V260" />
          <path d="M150 260 V160 Q200 86 250 160 V260" strokeOpacity=".3" />
          <path d="M40 260 V185 Q80 128 120 185" strokeOpacity=".25" /><path d="M280 185 Q320 128 360 185 V260" strokeOpacity=".25" />
        </g>
      ) : (
        <g fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1.4" transform="translate(200 128)">
          <rect x="-46" y="-46" width="92" height="92" rx="4" transform="rotate(45)" />
          <rect x="-46" y="-46" width="92" height="92" rx="4" />
          <circle r="16" strokeOpacity=".4" />
        </g>
      )}
      <rect width="400" height="260" fill={`url(#${gid}s)`} />
    </svg>
  );
}

/* ───── تبديل الوضع الليلي ───── */
export function ThemeToggle() {
  const [mode, setMode] = useState<"light" | "dark" | null>(() => { try { return (localStorage.getItem("mns.theme") as "light" | "dark" | null) ?? null; } catch { return null; } });
  useEffect(() => {
    if (mode) document.documentElement.setAttribute("data-theme", mode); else document.documentElement.removeAttribute("data-theme");
    try { if (mode) localStorage.setItem("mns.theme", mode); } catch { /* */ }
  }, [mode]);
  const isDark = mode ? mode === "dark" : typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return <button className="icon-btn" onClick={() => setMode(isDark ? "light" : "dark")} aria-label={isDark ? "الوضع النهاري" : "الوضع الليلي"}><Icon name={isDark ? "Sun" : "Moon"} size={18} /></button>;
}

/* ───── زر تمرير عائم: ينزل لأسفل الصفحة أو يرجع لأعلاها (يظهر فقط في الصفحات الطويلة) ───── */
export function ScrollNav({ bottom }: { bottom?: string }) {
  const [st, setSt] = useState<"none" | "down" | "up">("none");
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = document.scrollingElement ?? document.documentElement;
      const long = el.scrollHeight > innerHeight * 1.35;
      setSt(!long ? "none" : el.scrollTop > innerHeight * 0.6 ? "up" : "down");
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    const ro = new ResizeObserver(on); ro.observe(document.body);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);
  const go = () => {
    const el = document.scrollingElement ?? document.documentElement;
    if (st === "up") window.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: Math.min(el.scrollTop + innerHeight * 0.85, el.scrollHeight), behavior: "smooth" });
  };
  return (
    <AnimatePresence>
      {st !== "none" && (
        <motion.button key="sn" className="scroll-nav" style={bottom ? { bottom } : undefined} onClick={go} aria-label={st === "up" ? "ارجع لأعلى الصفحة" : "انزل لتحت"}
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ type: "spring", stiffness: 420, damping: 28 }}>
          <motion.span animate={{ rotate: st === "up" ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} style={{ display: "grid" }}><Icon name="ChevronDown" size={20} /></motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ───── غلاف التطبيق: شريط جانبي على الكمبيوتر وشريط سفلي عائم على الجوال ───── */
export interface ShellTab { id: string; label: string; icon: string; count?: number; /** عنوان المجموعة في القائمة الجانبية وقائمة «المزيد» */ group?: string }

/** يجمع التبويبات المتتالية حسب group مع الحفاظ على الترتيب */
const grouped = (tabs: ShellTab[]) => tabs.reduce<{ group?: string; items: ShellTab[] }[]>((acc, t) => {
  const last = acc[acc.length - 1];
  if (last && last.group === t.group) last.items.push(t); else acc.push({ group: t.group, items: [t] });
  return acc;
}, []);

export function AppShell({ portal, tabs, active, onChange, actions, children, footer, sideTop }: {
  portal: string; tabs: ShellTab[]; active: string; onChange: (id: string) => void; actions?: ReactNode; children: ReactNode; footer?: ReactNode;
  /** بطاقة أعلى القائمة الجانبية (مثل ملخص المناسبة) */
  sideTop?: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [more, setMore] = useState(false);
  const prog = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const el = document.scrollingElement ?? document.documentElement;
      const max = el.scrollHeight - innerHeight;
      setScrolled(el.scrollTop > 6);
      if (prog.current) prog.current.style.transform = `scaleX(${max > 40 ? Math.min(1, el.scrollTop / max) : 0})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  const go = (id: string) => { onChange(id); setMore(false); window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); };
  const primary = tabs.length > 5 ? tabs.slice(0, 4) : tabs;
  const rest = tabs.length > 5 ? tabs.slice(4) : [];
  const moreActive = rest.some((t) => t.id === active);
  const restCount = rest.reduce((s, t) => s + (t.count ?? 0), 0);
  return (
    <div className="shell">
      <aside className="shell-side" aria-label="القائمة">
        <div className="logo"><LogoMark size={34} /><span>{BRAND.name}<span className="portal">{portal}</span></span></div>
        {sideTop}
        <nav className="side-nav">
          {grouped(tabs).map((g, gi) => (
            <div key={gi} className="side-group">
              {g.group && <span className="side-h">{g.group}</span>}
              {g.items.map((t) => (
                <button key={t.id} className={"side-link" + (active === t.id ? " on" : "")} onClick={() => go(t.id)} aria-current={active === t.id ? "page" : undefined}>
                  {active === t.id && <motion.span layoutId="side-thumb" className="nav-thumb" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <Icon name={t.icon} size={19} /> {t.label}{t.count ? <span className="count num">{t.count}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="side-foot">{footer}<LegalLine /></div>
      </aside>
      <div className="shell-main">
        <header className={"appbar" + (scrolled ? " scrolled" : "")}>
          <span ref={prog} className="scroll-prog" aria-hidden="true" />
          <div className="container appbar-in">
            <div className="logo mobile-only row" style={{ ["--gap" as string]: "8px" }}><LogoMark size={26} /><span>مناسبتي <span className="faint" style={{ fontSize: 12, fontWeight: 500 }}>{portal}</span></span></div>
            <div className="grow" />
            {actions}
            <ThemeToggle />
          </div>
        </header>
        <main className="container"><AnnouncementBar />{children}</main>
      </div>
      <ScrollNav />
      <nav className="bottom-nav" aria-label="التنقل">
        {primary.map((t) => (
          <button key={t.id} className={active === t.id ? "on" : ""} onClick={() => go(t.id)} aria-current={active === t.id ? "page" : undefined}>
            {active === t.id && <motion.span layoutId="nav-thumb" className="nav-thumb" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <Icon name={t.icon} size={21} /><span>{t.label}</span>{t.count ? <span className="dot num">{t.count}</span> : null}
          </button>
        ))}
        {rest.length > 0 && (
          <button className={moreActive ? "on" : ""} onClick={() => setMore(true)}>
            {moreActive && <motion.span layoutId="nav-thumb" className="nav-thumb" />}
            <Icon name="LayoutGrid" size={21} /><span>المزيد</span>{restCount ? <span className="dot num">{restCount}</span> : null}
          </button>
        )}
      </nav>
      <Sheet open={more} onClose={() => setMore(false)} title="المزيد">
        <div className="more-groups">
          {grouped(rest).map((g, gi) => (
            <div key={gi} className="stack" style={{ ["--gap" as string]: "8px" }}>
              {g.group && <span className="side-h">{g.group}</span>}
              <div className="more-grid">
                {g.items.map((t) => (
                  <button key={t.id} className={"more-tile" + (active === t.id ? " on" : "")} onClick={() => go(t.id)}>
                    <span className="avatar"><Icon name={t.icon} size={20} /></span><b className="display">{t.label}</b>{t.count ? <span className="pill brand num">{t.count}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gap: 8, marginTop: 16 }}>{footer}<LegalLine /></div>
      </Sheet>
    </div>
  );
}

/* ───── مؤشر المسافة الافتراضية لعناصر الصفحة ───── */
export function useInView<T extends Element>(opts?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), opts);
    io.observe(ref.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView] as const;
}

/* ───── صورة حقيقية إن وُجدت، وإلا رسم الهوية التوليدي ───── */
export function Media({ photos, seed, hue, kind = "venue", alt = "", small = true }: { photos?: string[]; seed: string; hue: number; kind?: "venue" | "supplier"; alt?: string; small?: boolean }) {
  const src = photos?.[0] ? photoUrl(photos[0], small) : "";
  return src
    ? <img src={src} alt={alt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    : <Art seed={seed} hue={hue} kind={kind} />;
}

/** شاشة تحميل قصيرة بهوية مناسبتي (بدل وميض صفحة الدخول قبل التحقق من الجلسة) */
export function Splash({ dark = false }: { dark?: boolean }) {
  return (
    <div className={"splash" + (dark ? " dark" : "")} role="status" aria-label="جاري التحميل">
      <span className="splash-mark"><LogoMark size={92} animated /></span>
      <b>{BRAND.name}</b>
      <small>{BRAND.goal}</small>
      <i aria-hidden="true"><span /></i>
    </div>
  );
}

/** بيانات المنشأة النظامية وروابط الشروط: تظهر في كل التطبيقات (نظام التجارة الإلكترونية) */
export function LegalLine() {
  const l = useDB().legal;
  const base = typeof location !== "undefined" && /\/(client|vendors|venues|admin)\//.test(location.pathname) ? "../" : "./";
  return (
    <div className="legal-line">
      {l?.entity && <span>{l.entity}{l.cr ? ` · سجل تجاري ${l.cr}` : ""}{l.vat ? ` · الرقم الضريبي ${l.vat}` : ""}{l.address ? ` · ${l.address}` : ""}</span>}
      <span><a href={base + "privacy.html"} target="_blank" rel="noreferrer">الخصوصية والشروط</a> · <a href={base + "cancellation.html"} target="_blank" rel="noreferrer">سياسة الإلغاء والاسترجاع</a></span>
    </div>
  );
}
