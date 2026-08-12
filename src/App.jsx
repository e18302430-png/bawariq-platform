import React, { useEffect, useState } from "react";
import { LanguageProvider, useLanguage } from "./context/LanguageContext.jsx";
import Preloader from "./components/Preloader.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Pillars from "./components/Pillars.jsx";
import Interlude from "./components/Interlude.jsx";
import About from "./components/About.jsx";
import Services from "./components/Services.jsx";
import Emergency from "./components/Emergency.jsx";
import Departments from "./components/Departments.jsx";
import Doctors from "./components/Doctors.jsx";
import Journey from "./components/Journey.jsx";
import Appointments from "./components/Appointments.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import Cursor from "./components/Cursor.jsx";
import ProgressRail from "./components/ProgressRail.jsx";

function DocumentMeta() {
  const { t, lang } = useLanguage();
  useEffect(() => {
    document.title = t.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t.meta.description);
  }, [t, lang]);
  return null;
}

function Page() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  return (
    <>
      <DocumentMeta />
      {loading && <Preloader onDone={() => setLoading(false)} />}
      <Cursor />
      <ProgressRail />
      <a href="#main" className="skip-link rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white">
        {t.a11y.skipToContent}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Pillars />
        <Interlude />
        <About />
        <Services />
        <Emergency />
        <Departments />
        <Doctors />
        <Journey />
        <Appointments />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Page />
    </LanguageProvider>
  );
}
