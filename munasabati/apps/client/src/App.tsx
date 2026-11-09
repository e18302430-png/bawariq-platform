import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell, ErrorBoundary, Icon, ScreenSkeleton, ToastProvider, hasAccount, isCloud, repo, useDB, type ShellTab, Splash, useReady } from "@munasabati/ui";
import { go } from "./nav";
import type { OccasionId } from "@munasabati/core";

// كل شاشة تُحمَّل عند فتحها فقط (تقسيم الكود) لتسريع أول تحميل
const Onboarding = lazy(() => import("./Onboarding"));
const Home = lazy(() => import("./screens/Home"));
const Explore = lazy(() => import("./screens/Explore").then((m) => ({ default: m.Explore })));
const Detail = lazy(() => import("./screens/Explore").then((m) => ({ default: m.Detail })));
const Guests = lazy(() => import("./screens/Guests").then((m) => ({ default: m.Guests })));
const Invites = lazy(() => import("./screens/Invite").then((m) => ({ default: m.Invites })));
const GuestInvite = lazy(() => import("./screens/Invite").then((m) => ({ default: m.GuestInvite })));
const Bookings = lazy(() => import("./screens/Tools").then((m) => ({ default: m.Bookings })));
const Budget = lazy(() => import("./screens/Tools").then((m) => ({ default: m.Budget })));
const Door = lazy(() => import("./screens/Tools").then((m) => ({ default: m.Door })));
const DoorStation = lazy(() => import("./screens/Tools").then((m) => ({ default: m.DoorStation })));
const Plan = lazy(() => import("./screens/Plan"));
const Tasks = lazy(() => import("./screens/Tools").then((m) => ({ default: m.Tasks })));
// تحميل كل الشاشات مسبقاً في وقت الفراغ بعد أول عرض: التنقل يصير فورياً
const prefetch = () => [import("./screens/Plan"), import("./screens/Home"), import("./screens/Explore"), import("./screens/Guests"), import("./screens/Invite"), import("./screens/Tools")];
if (typeof window !== "undefined") {
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
  window.addEventListener("load", () => idle(() => { void Promise.all(prefetch()); }));
}

const Support = lazy(() => import("@munasabati/ui").then((m) => ({ default: () => <m.SupportCenter from="client" fromId="me" fromName={m.repo.get().client.profile?.name ?? "عميل"} /> })));


/** التنقل بين الشاشات: صفحة جديدة تبدأ من فوق، والرجوع (زر الرجوع) يرجّعك لنفس مكانك فيها */
const scrollMemory = new Map<string, number>();
function useHash() {
  const read = () => location.hash.replace(/^#/, "") || "home";
  const [h, setH] = useState(read);
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let back = false, current = read();
    const onPop = () => { back = true; };
    const on = () => {
      scrollMemory.set(current, window.scrollY);
      const next = read(); current = next;
      const y = back ? scrollMemory.get(next) ?? 0 : 0;
      back = false;
      setH(next);
      // ننتظر رسم الشاشة الجديدة ثم نضبط مكان التمرير بدون حركة
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior })));
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", on);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("hashchange", on); };
  }, []);
  return h;
}

function Main() {
  const db = useDB();
  const ready = useReady();
  const route = useHash();
  if (route.startsWith("invite-")) return <Suspense fallback={<div className="guest-page" />}><GuestInvite code={route.slice(7)} /></Suspense>;
  // شاشة المنسق عند الباب: #door-<مفتاح>[-men|-women]
  const dm = route.match(/^door-([a-z0-9]{10,})(?:-(men|women))?$/);
  if (dm) return <Suspense fallback={<div className="station" />}><DoorStation k={dm[1]} section={dm[2] as "men" | "women" | undefined} /></Suspense>;
  if (!ready) return <Splash dark />;
  // ضيف ضغط «ابدأ مناسبتك» من دعوة: #start-<نوع المناسبة>
  const st = route.match(/^start-(\w+)$/);
  if (!db.client.event) return <Suspense fallback={<div className="onb" />}><Onboarding preset={st?.[1] as OccasionId | undefined} source={st ? "invite" : undefined} /></Suspense>;

  const quotes = db.bookings.filter((b) => b.fromClient && b.status === "quoted").length;
  const tabs: ShellTab[] = [
    { id: "home", label: "رحلتي", icon: "Route", group: "رحلتي" },
    { id: "plan", label: "اقتراحاتي", icon: "Sparkles", group: "رحلتي" },
    { id: "bookings", label: "حجوزاتي", icon: "CalendarCheck", count: quotes, group: "رحلتي" },
    { id: "guests", label: "الضيوف", icon: "Users", group: "الضيوف والدعوات" },
    { id: "invites", label: "الدعوات", icon: "Send", group: "الضيوف والدعوات" },
    { id: "door", label: "يوم المناسبة", icon: "ScanLine", group: "الضيوف والدعوات" },
    { id: "budget", label: "الميزانية", icon: "Wallet", group: "التنظيم" },
    { id: "tasks", label: "مهام العائلة", icon: "ListChecks", group: "التنظيم" },
    { id: "explore", label: "استكشف بنفسك", icon: "Compass", group: "المزيد" },
    { id: "support", label: "الدعم", icon: "LifeBuoy", count: (db.tickets ?? []).filter((t) => t.from === "client" && t.status === "answered").length, group: "المزيد" },
  ];
  const ev = db.client.event;
  const daysLeft = Math.max(0, Math.ceil((new Date(ev.date + "T00:00:00").getTime() - Date.now()) / 864e5));
  const detail = route.match(/^(venue|supplier)-(.+)$/);
  const exploreCat = route.startsWith("explore-") ? route.slice(8) : undefined;
  const active = detail || exploreCat ? "explore" : tabs.some((t) => t.id === route) ? route : "home";

  return (
    <AppShell
      portal="لأصحاب المناسبات" tabs={tabs} active={active} onChange={go}
      sideTop={<a className="side-event" href="#home" style={{ background: "linear-gradient(135deg, #3a1726, #7a1f3f 55%, #b8863d)" }}><small>مناسبتك</small><b>{ev.title}</b><span className="se-days"><strong className="num">{daysLeft}</strong><small>يوم باقي · {ev.city}</small></span></a>}
      footer={<>
        <a className="btn sm" href={import.meta.env.VITE_HOME_URL ?? "../index.html"}><Icon name="Globe" size={15} /> موقع مناسبتي</a>
        {isCloud && hasAccount() && <LogoutButton />}
        <ResetButton />
        {isCloud && hasAccount() && <DeleteAccount />}
        <a className="side-legal" href="../privacy.html" target="_blank" rel="noreferrer">الخصوصية والشروط</a>
      </>}
    >
      <ErrorBoundary key={route}>
      <Suspense fallback={<ScreenSkeleton />}>
      <AnimatePresence initial={false}>
        <motion.div key={route} className="page" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}>
          {detail ? <Detail kind={detail[1] as "venue" | "supplier"} id={detail[2]} />
            : active === "explore" ? <Explore initialCat={exploreCat} />
            : active === "plan" ? <Plan />
            : active === "guests" ? <Guests />
            : active === "invites" ? <Invites />
            : active === "budget" ? <Budget />
            : active === "tasks" ? <Tasks />
            : active === "bookings" ? <Bookings />
            : active === "door" ? <Door />
            : active === "support" ? <Support />
            : <Home />}
        </motion.div>
      </AnimatePresence>
      </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}

/** تسجيل الخروج: بياناته محفوظة في حسابه، ويرجع يدخل برقم جواله وكلمة المرور من أي جهاز */
function LogoutButton() {
  const [ask, setAsk] = useState(false);
  const phone = repo.auth?.user()?.phone;
  return ask
    ? <div className="stack" style={{ ["--gap" as string]: "6px" }}><small className="muted" style={{ fontSize: 12.5 }}>مناسبتك محفوظة في حسابك. ترجع تدخل برقمك{phone ? ` ${phone}` : ""} وكلمة المرور.</small>
        <div className="row"><button className="btn sm grow" onClick={() => { void repo.auth?.signOut().then(() => { location.hash = ""; location.reload(); }); }}>تأكيد الخروج</button><button className="btn sm ghost" onClick={() => setAsk(false)}>إلغاء</button></div></div>
    : <button className="btn sm ghost" onClick={() => setAsk(true)}><Icon name="LogOut" size={15} /> تسجيل الخروج</button>;
}

/** حذف الحساب وكل البيانات الشخصية نهائياً (حق المستخدم) */
function DeleteAccount() {
  const [ask, setAsk] = useState(false);
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!ask) return <button className="btn sm ghost" style={{ color: "var(--bad)" }} onClick={() => setAsk(true)}><Icon name="UserX" size={15} /> احذف حسابي وبياناتي</button>;
  return (
    <div className="stack" style={{ ["--gap" as string]: "6px" }}>
      <small style={{ fontSize: 12.5, color: "var(--bad)" }}>ينحذف حسابك ومناسبتك وضيوفك ودعواتك نهائياً، وما نقدر نرجعها. حجوزاتك مع التجار تبقى بدون اسمك ورقمك.</small>
      <label className="sr" htmlFor="del-w">اكتب «احذف» للتأكيد</label>
      <input id="del-w" className="input" placeholder="اكتب: احذف" value={word} onChange={(e) => setWord(e.target.value)} />
      {err && <small style={{ color: "var(--bad)" }}>{err}</small>}
      <div className="row"><button className="btn sm grow" style={{ color: "var(--bad)" }} disabled={word.trim() !== "احذف" || busy} onClick={() => { setBusy(true); setErr(""); void repo.auth?.deleteAccount?.().then(() => { location.hash = ""; location.reload(); }, (e: Error) => { setErr(e.message); setBusy(false); }); }}>{busy ? "لحظة…" : "احذف نهائياً"}</button><button className="btn sm ghost" onClick={() => { setAsk(false); setWord(""); }}>إلغاء</button></div>
    </div>
  );
}

function ResetButton() {
  const [ask, setAsk] = useState(false);
  return ask
    ? <div className="stack" style={{ ["--gap" as string]: "6px" }}><small style={{ fontSize: 12.5, color: "var(--bad)" }}>تنحذف مناسبتك الحالية وضيوفها نهائياً، وتبدأ مناسبة جديدة بنفس الحساب.</small>
        <div className="row"><button className="btn sm grow" style={{ color: "var(--bad)" }} onClick={() => { repo.reset(); go("home"); }}>تأكيد الحذف والبدء من جديد</button><button className="btn sm ghost" onClick={() => setAsk(false)}>إلغاء</button></div></div>
    : <button className="btn sm ghost" onClick={() => setAsk(true)}><Icon name="RotateCcw" size={15} /> ابدأ مناسبة جديدة</button>;
}

export default function App() {
  return <ErrorBoundary><ToastProvider><Main /></ToastProvider></ErrorBoundary>;
}
