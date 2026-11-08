import React, { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from "react";
import { SAMPLE_GUESTS, SAMPLE_TASKS, estimateBudget, VENDORS } from "./data";

/*
  طبقة البيانات: حالياً تُحفظ في المتصفح (localStorage) لغرض العرض.
  كل الدوال هنا مكتوبة بحيث يمكن استبدالها لاحقاً بـ Supabase أو أي API بدون تغيير الواجهات.
*/

const KEY = "farha.v1";
const uid = (p = "") => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
const code = () => Math.random().toString(36).slice(2, 7).toUpperCase();
const daysFromNow = (d) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);

const initial = {
  user: null,          // { name, phone }
  event: null,         // { id, type, city, date, guests, menRatio, tier, title }
  guests: [],
  budget: [],
  tasks: [],
  requests: [],        // طلبات الحجز وعروض الأسعار بين العميل والتاجر
  favorites: [],
  vendor: null,        // جلسة التاجر { vendorId }
  vendorEdits: {},     // تعديلات التاجر على ملفه وباقاته
  customVendors: [],   // تجار سجّلوا من بوابة التاجر
  invite: { template: "najd", message: "يتشرف بدعوتكم لحضور حفل زواجنا، وبحضوركم تكتمل فرحتنا." },
};

function seedRequests() {
  return [
      { vendorId: "v1", clientName: "عبدالله العتيبي (مثال)", type: "wedding", city: "الرياض", date: daysFromNow(21), guests: 600, note: "نحتاج كوشة رئيسية وبث مباشر لقسم النساء", status: "new" },
      { vendorId: "v1", clientName: "نورة الشهري (مثال)", type: "milka", city: "الرياض", date: daysFromNow(9), guests: 180, note: "ملكة في البيت، نبي إضاءة وكوشة صغيرة", status: "quoted", quote: 9500 },
      { vendorId: "v1", clientName: "شركة أفق (مثال)", type: "corp", city: "الرياض", date: daysFromNow(34), guests: 350, note: "استيدج وشاشتين ومولد احتياطي", status: "confirmed", quote: 31000 },
      { vendorId: "v1", clientName: "فيصل القحطاني (مثال)", type: "grad", city: "الخرج", date: daysFromNow(48), guests: 120, note: "خيمة وسجاد وضيافة", status: "confirmed", quote: 12500 },
      { vendorId: "h1", clientName: "سلطان الدوسري (مثال)", type: "wedding", city: "الرياض", date: daysFromNow(15), guests: 800, note: "حجز القسمين", status: "confirmed", quote: 65000 },
      { vendorId: "h1", clientName: "ماجد الحربي (مثال)", type: "wedding", city: "الرياض", date: daysFromNow(27), guests: 700, note: "هل يتوفر مطبخ للذبائح؟", status: "new" },
  ].map((r, i) => ({ ...r, id: "seed" + i, seed: true, createdAt: Date.now() - i * 36e5 * 5, messages: [] }));
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial, ...JSON.parse(raw) };
  } catch { /* التخزين غير متاح */ }
  return { ...initial, requests: seedRequests() };
}

function reducer(s, a) {
  switch (a.type) {
    case "createEvent": {
      const e = a.event;
      const plan = estimateBudget({ guests: e.guests, tier: e.tier });
      const guests = SAMPLE_GUESTS.map(([name, section, side, status, count]) => ({
        id: uid("g"), name, phone: "05" + Math.floor(10000000 + Math.random() * 89999999), section, side, status, count, code: code(), checkedIn: false, sample: true,
      }));
      const tasks = SAMPLE_TASKS.map(([title, who, before, done]) => ({
        id: uid("t"), title, who, due: shiftDate(e.date, -before), done,
      }));
      const budget = plan.lines.map((l) => ({ id: uid("b"), ...l, paid: l.cat === "halls" ? Math.round(l.est * 0.3) : 0 }));
      return { ...s, user: a.user || s.user, event: { id: uid("e"), ...e }, guests, tasks, budget };
    }
    case "updateEvent":
      return { ...s, event: { ...s.event, ...a.patch } };
    case "setUser":
      return { ...s, user: a.user };
    case "addGuest":
      return { ...s, guests: [{ id: uid("g"), code: code(), status: "pending", checkedIn: false, count: 1, ...a.guest }, ...s.guests] };
    case "updateGuest":
      return { ...s, guests: s.guests.map((g) => (g.id === a.id ? { ...g, ...a.patch } : g)) };
    case "removeGuest":
      return { ...s, guests: s.guests.filter((g) => g.id !== a.id) };
    case "clearSamples":
      return { ...s, guests: s.guests.filter((g) => !g.sample) };
    case "addBudget":
      return { ...s, budget: [...s.budget, { id: uid("b"), paid: 0, ...a.item }] };
    case "updateBudget":
      return { ...s, budget: s.budget.map((b) => (b.id === a.id ? { ...b, ...a.patch } : b)) };
    case "removeBudget":
      return { ...s, budget: s.budget.filter((b) => b.id !== a.id) };
    case "addTask":
      return { ...s, tasks: [...s.tasks, { id: uid("t"), done: false, ...a.task }] };
    case "toggleTask":
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, done: !t.done } : t)) };
    case "removeTask":
      return { ...s, tasks: s.tasks.filter((t) => t.id !== a.id) };
    case "toggleFav":
      return { ...s, favorites: s.favorites.includes(a.id) ? s.favorites.filter((x) => x !== a.id) : [...s.favorites, a.id] };
    case "request":
      return { ...s, requests: [{ id: uid("r"), status: "new", createdAt: Date.now(), messages: [], ...a.req }, ...s.requests] };
    case "updateRequest":
      return { ...s, requests: s.requests.map((r) => (r.id === a.id ? { ...r, ...a.patch, messages: a.message ? [...(r.messages || []), a.message] : r.messages } : r)) };
    case "addVendor":
      return { ...s, customVendors: [...s.customVendors, a.vendor], vendor: { vendorId: a.vendor.id } };
    case "vendorLogin":
      return { ...s, vendor: { vendorId: a.vendorId } };
    case "vendorLogout":
      return { ...s, vendor: null };
    case "vendorEdit":
      return { ...s, vendorEdits: { ...s.vendorEdits, [a.id]: { ...(s.vendorEdits[a.id] || {}), ...a.patch } } };
    case "invite":
      return { ...s, invite: { ...s.invite, ...a.patch } };
    case "reset":
      return { ...initial, requests: seedRequests() };
    default:
      return s;
  }
}

export function shiftDate(iso, days) {
  const d = new Date(iso || Date.now());
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* التخزين غير متاح */ }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

export function allVendors(state) {
  return [...VENDORS, ...(state.customVendors || [])].map((v) => ({ ...v, ...(state.vendorEdits[v.id] || {}) }));
}
export function findVendor(state, id) {
  return allVendors(state).find((v) => v.id === id) || null;
}
export function useVendor(id) {
  const { state } = useStore();
  return findVendor(state, id);
}
export { uid };

// توجيه بسيط عبر الهاش (#home, #explore, #venue-h1, #my, #vendor, #study, #invite-CODE)
export function useRoute() {
  const get = () => (typeof location !== "undefined" ? location.hash.replace(/^#/, "") : "") || "home";
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const on = () => { setRoute(get()); window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const go = (r) => { location.hash = r; };

// تنبيهات صغيرة
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((text) => {
    const id = Math.random();
    setItems((x) => [...x, { id, text }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => <div key={t.id} className="toast">{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
