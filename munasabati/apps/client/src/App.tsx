import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell, ErrorBoundary, Icon, ScreenSkeleton, ToastProvider, repo, useDB, type ShellTab } from "@munasabati/ui";
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
const Hosp = lazy(() => import("./screens/Tools").then((m) => ({ default: m.Hosp })));
const Tasks = lazy(() => import("./screens/Tools").then((m) => ({ default: m.Tasks })));
// تحميل كل الشاشات مسبقاً في وقت الفراغ بعد أول عرض: التنقل يصير فورياً
const prefetch = () => [import("./screens/Plan"), import("./screens/Home"), import("./screens/Explore"), import("./screens/Guests"), import("./screens/Invite"), import("./screens/Tools")];
if (typeof window !== "undefined") {
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
  window.addEventListener("load", () => idle(() => { void Promise.all(prefetch()); }));
}

const Support = lazy(() => import("@munasabati/ui").then((m) => ({ default: () => <m.SupportCenter from="client" fromId="me" fromName={m.repo.get().client.profile?.name ?? "عميل"} /> })));


function useHash() {
  const read = () => location.hash.replace(/^#/, "") || "home";
  const [h, setH] = useState(read);
  useEffect(() => {
    const on = () => { setH(read()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return h;
}

function Main() {
  const db = useDB();
  const route = useHash();
  if (route.startsWith("invite-")) return <Suspense fallback={<div className="guest-page" />}><GuestInvite code={route.slice(7)} /></Suspense>;
  // شاشة المنسق عند الباب: #door-<مفتاح>[-men|-women]
  const dm = route.match(/^door-([a-z0-9]{10,})(?:-(men|women))?$/);
  if (dm) return <Suspense fallback={<div className="station" />}><DoorStation k={dm[1]} section={dm[2] as "men" | "women" | undefined} /></Suspense>;
  // ضيف ضغط «ابدأ مناسبتك» من دعوة: #start-<نوع المناسبة>
  const st = route.match(/^start-(\w+)$/);
  if (!db.client.event) return <Suspense fallback={<div className="onb" />}><Onboarding preset={st?.[1] as OccasionId | undefined} source={st ? "invite" : undefined} /></Suspense>;

  const quotes = db.bookings.filter((b) => b.fromClient && b.status === "quoted").length;
  const tabs: ShellTab[] = [
    { id: "home", label: "رحلتي", icon: "Route" },
    { id: "plan", label: "خطتي", icon: "Sparkles" },
    { id: "bookings", label: "حجوزاتي", icon: "CalendarCheck", count: quotes },
    { id: "guests", label: "الضيوف", icon: "Users" },
    { id: "explore", label: "استكشف بنفسك", icon: "Compass" },
    { id: "invites", label: "الدعوات", icon: "Send" },
    { id: "budget", label: "الميزانية", icon: "Wallet" },
    { id: "hosp", label: "حاسبة الضيافة", icon: "Coffee" },
    { id: "tasks", label: "مهام العائلة", icon: "ListChecks" },
    { id: "door", label: "يوم المناسبة", icon: "ScanLine" },
    { id: "support", label: "الدعم", icon: "LifeBuoy", count: (db.tickets ?? []).filter((t) => t.from === "client" && t.status === "answered").length },
  ];
  const detail = route.match(/^(venue|supplier)-(.+)$/);
  const exploreCat = route.startsWith("explore-") ? route.slice(8) : undefined;
  const active = detail || exploreCat ? "explore" : tabs.some((t) => t.id === route) ? route : "home";

  return (
    <AppShell
      portal="لأصحاب المناسبات" tabs={tabs} active={active} onChange={go}
      footer={<>
        <a className="btn sm" href={import.meta.env.VITE_HOME_URL ?? "../index.html"}><Icon name="Globe" size={15} /> موقع مناسبتي</a>
        <ResetButton />
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
            : active === "hosp" ? <Hosp />
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

function ResetButton() {
  const [ask, setAsk] = useState(false);
  return ask
    ? <div className="row"><button className="btn sm grow" style={{ color: "var(--bad)" }} onClick={() => { repo.reset(); go("home"); }}>تأكيد البدء من جديد</button><button className="btn sm ghost" onClick={() => setAsk(false)}>إلغاء</button></div>
    : <button className="btn sm ghost" onClick={() => setAsk(true)}><Icon name="RotateCcw" size={15} /> ابدأ مناسبة جديدة</button>;
}

export default function App() {
  return <ErrorBoundary><ToastProvider><Main /></ToastProvider></ErrorBoundary>;
}
