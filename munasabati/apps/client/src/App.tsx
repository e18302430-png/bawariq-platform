import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell, ErrorBoundary, Icon, ScreenSkeleton, ToastProvider, repo, useDB, type ShellTab } from "@munasabati/ui";
import { go } from "./nav";

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
const Hosp = lazy(() => import("./screens/Tools").then((m) => ({ default: m.Hosp })));
const Tasks = lazy(() => import("./screens/Tools").then((m) => ({ default: m.Tasks })));


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
  if (!db.client.event) return <Suspense fallback={<div className="onb" />}><Onboarding /></Suspense>;

  const quotes = db.bookings.filter((b) => b.fromClient && b.status === "quoted").length;
  const tabs: ShellTab[] = [
    { id: "home", label: "رحلتي", icon: "Route" },
    { id: "explore", label: "استكشف", icon: "Compass" },
    { id: "bookings", label: "حجوزاتي", icon: "CalendarCheck", count: quotes },
    { id: "guests", label: "الضيوف", icon: "Users" },
    { id: "invites", label: "الدعوات", icon: "Send" },
    { id: "budget", label: "الميزانية", icon: "Wallet" },
    { id: "hosp", label: "حاسبة الضيافة", icon: "Coffee" },
    { id: "tasks", label: "مهام العائلة", icon: "ListChecks" },
    { id: "door", label: "يوم المناسبة", icon: "ScanLine" },
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
      <AnimatePresence mode="wait">
        <motion.div key={route} className="page" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          {detail ? <Detail kind={detail[1] as "venue" | "supplier"} id={detail[2]} />
            : active === "explore" ? <Explore initialCat={exploreCat} />
            : active === "guests" ? <Guests />
            : active === "invites" ? <Invites />
            : active === "budget" ? <Budget />
            : active === "hosp" ? <Hosp />
            : active === "tasks" ? <Tasks />
            : active === "bookings" ? <Bookings />
            : active === "door" ? <Door />
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
