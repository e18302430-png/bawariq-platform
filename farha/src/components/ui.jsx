import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Armchair, ArrowLeft, ArrowRight, Baby, BadgeCheck, Beef, Briefcase, Building2, Cake, Calendar, CalendarCheck, CalendarDays, CalendarHeart, CalendarSearch, Camera, Check, CheckCircle2, Cherry, ChevronLeft, ChevronRight, Coffee, Coins, Copy, Crown, CupSoda, Eye, Gem, GraduationCap, Heart, Inbox, Info, Layers, LayoutDashboard, Leaf, ListChecks, Lock, LogOut, MapPin, Menu, MessageCircle, Moon, Package, PartyPopper, Pencil, Phone, Plus, Radio, Receipt, RotateCcw, ScanLine, Search, SearchX, Send, ShieldCheck, Sparkles, Speaker, Star, StickyNote, Store, Sun, Tent, Theater, Trash2, TrendingUp, Upload, User, UserCheck, UserPlus, Users, Wallet, Wheat, X, XCircle, Zap } from "lucide-react";
const I = { Armchair, ArrowLeft, ArrowRight, Baby, BadgeCheck, Beef, Briefcase, Building2, Cake, Calendar, CalendarCheck, CalendarDays, CalendarHeart, CalendarSearch, Camera, Check, CheckCircle2, Cherry, ChevronLeft, ChevronRight, Coffee, Coins, Copy, Crown, CupSoda, Eye, Gem, GraduationCap, Heart, Inbox, Info, Layers, LayoutDashboard, Leaf, ListChecks, Lock, LogOut, MapPin, Menu, MessageCircle, Moon, Package, PartyPopper, Pencil, Phone, Plus, Radio, Receipt, RotateCcw, ScanLine, Search, SearchX, Send, ShieldCheck, Sparkles, Speaker, Star, StickyNote, Store, Sun, Tent, Theater, Trash2, TrendingUp, Upload, User, UserCheck, UserPlus, Users, Wallet, Wheat, X, XCircle, Zap };
import { useStore, go } from "../store";

export const Icon = ({ name, size = 20, ...p }) => {
  const C = I[name] || I.Sparkles;
  return <C size={size} strokeWidth={1.7} {...p} />;
};

/* عدّاد متحرك للأرقام */
export function Counter({ value, duration = 900, format = (n) => new Intl.NumberFormat("en-US").format(Math.round(n)) }) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - k, 4);
      setV(a + (value - a) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value, duration]);
  return <span className="num">{format(v)}</span>;
}

/* زر مغناطيسي: يميل نحو المؤشر */
export function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return <span ref={ref} onMouseMove={move} onMouseLeave={leave} style={{ display: "inline-flex", transition: "transform .35s cubic-bezier(.2,.8,.2,1)" }}>{children}</span>;
}

/* بطاقة تميل ثلاثياً مع ضوء يتبع المؤشر */
export function Tilt({ className = "", children, max = 8, ...p }) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-4px)`;
    el.style.setProperty("--px", `${px * 100}%`);
    el.style.setProperty("--py", `${py * 100}%`);
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return <div ref={ref} className={className} onMouseMove={move} onMouseLeave={leave} {...p}>{children}</div>;
}

/* رسم توليدي بديل للصور: أقواس وثريات وأضواء لكل قاعة أو مزود */
export function Art({ seed = "x", hue = 40, kind = "hall" }) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1664525 + 1013904223) >>> 0) / 4294967296);
  const lights = Array.from({ length: 34 }, () => ({ x: rnd() * 400, y: rnd() * 150, r: rnd() * 1.8 + 0.4, o: rnd() * 0.7 + 0.2 }));
  const arches = kind === "hall" ? 5 : 3;
  const gid = "g" + seed;
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 45% 22%)`} />
          <stop offset="1" stopColor={`hsl(${(hue + 300) % 360} 35% 9%)`} />
        </linearGradient>
        <radialGradient id={gid + "l"} cx=".5" cy=".35" r=".6">
          <stop offset="0" stopColor={`hsl(${hue} 80% 75%)`} stopOpacity=".55" />
          <stop offset="1" stopColor={`hsl(${hue} 80% 60%)`} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill={`url(#${gid})`} />
      <rect width="400" height="250" fill={`url(#${gid}l)`} />
      {lights.map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={l.r} fill={`hsl(${hue} 90% 85%)`} opacity={l.o} />)}
      {Array.from({ length: arches }, (_, i) => {
        const w = 400 / arches, x = i * w, cx = x + w / 2;
        return <path key={i} d={`M${x + 8} 250 V150 Q${cx} ${70 + (i % 2) * 14} ${x + w - 8} 150 V250`} fill="none" stroke={`hsl(${hue} 60% 70%)`} strokeOpacity=".35" strokeWidth="1.2" />;
      })}
      {kind === "hall" && (
        <g stroke={`hsl(${hue} 70% 78%)`} strokeOpacity=".6" fill="none">
          <line x1="200" y1="0" x2="200" y2="46" />
          <path d="M170 46 Q200 76 230 46 Z" fill={`hsl(${hue} 80% 75%)`} fillOpacity=".25" />
          {[-22, -11, 0, 11, 22].map((d) => <line key={d} x1={200 + d} y1="56" x2={200 + d * 1.2} y2={72 - Math.abs(d) * 0.3} />)}
        </g>
      )}
      {kind !== "hall" && (
        <g fill="none" stroke={`hsl(${hue} 70% 78%)`} strokeOpacity=".55" transform="translate(200 112)">
          <polygon points="0,-46 13,-13 46,0 13,13 0,46 -13,13 -46,0 -13,-13" />
          <rect x="-24" y="-24" width="48" height="48" transform="rotate(45)" />
          <circle r="8" fill={`hsl(${hue} 80% 75%)`} fillOpacity=".35" />
        </g>
      )}
      <rect y="210" width="400" height="40" fill={`hsl(${hue} 30% 6%)`} opacity=".55" />
    </svg>
  );
}

/* رمز QR حقيقي */
export function QR({ text, size = 220 }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(text, { margin: 1, width: size, color: { dark: "#1a1222", light: "#ffffff" } }).then(setSrc).catch(() => setSrc(""));
  }, [text, size]);
  return src ? <img src={src} alt={`رمز دخول: ${text}`} /> : null;
}

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="إغلاق"><Icon name="X" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Stars({ value, count }) {
  return <span className="stars"><Icon name="Star" size={14} fill="currentColor" /> {value.toFixed(1)}{count != null && <span className="faint" style={{ fontWeight: 400 }}>({count})</span>}</span>;
}

const NAV = [
  ["home", "الرئيسية"],
  ["explore", "القاعات والخدمات"],
  ["my", "مناسبتي"],
  ["vendor", "بوابة التاجر"],
  ["study", "دراسة السوق"],
];

export function TopBar({ route }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const active = (r) => route === r || (r === "explore" && route.startsWith("venue-"));
  useEffect(() => setOpen(false), [route]);
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <a href="#home" className="brand" aria-label="فرحة - الرئيسية">
            <span className="mark">فرحة</span>
            <span className="hide-sm"><small>منصة المناسبات السعودية</small></span>
          </a>
          <nav className="nav" aria-label="التنقل الرئيسي">
            {NAV.map(([r, l]) => <a key={r} href={"#" + r} className={active(r) ? "on" : ""}>{l}</a>)}
          </nav>
          <div className="spacer" />
          {state.event
            ? <a className="btn sm hide-sm" href="#my"><Icon name="CalendarHeart" size={16} /> {state.user?.name || "مناسبتي"}</a>
            : <a className="btn sm gold hide-sm" href="#home" onClick={() => setTimeout(() => document.getElementById("concierge")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50)}>ابدأ مناسبتك</a>}
          <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-label="القائمة" aria-expanded={open}><Icon name={open ? "X" : "Menu"} size={18} /></button>
        </div>
      </header>
      {open && (
        <div className="drawer">
          {NAV.map(([r, l]) => <a key={r} href={"#" + r} className={active(r) ? "gold" : ""}>{l}</a>)}
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="brand"><span className="mark">فرحة</span><span className="faint">كل تفاصيل فرحتك في مكان واحد</span></div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <a href="#explore">القاعات والخدمات</a>
          <a href="#vendor">انضم كتاجر</a>
          <a href="#study">دراسة السوق</a>
        </div>
        <div>نسخة تجريبية. الأسماء والأسعار المعروضة أمثلة للعرض.</div>
      </div>
    </footer>
  );
}

export const navTo = go;
