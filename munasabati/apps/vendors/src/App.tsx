import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { hasAgreement, normPhone, CATEGORIES, CITIES, OCCASIONS, fmt, sar, setSession, uid, upsertSupplier, type CategoryId, type Package, type Supplier } from "@munasabati/core";
import { AppShell, BRAND, PartnerAgreementGate, SupportCenter, Empty, Gate, Icon, Media, NextAction, PhoneAuth, PhotoManager, isCloud, repo, Inbox, KPIs, MonthBoard, RevenueChart, Segmented, Sheet, StatusPill, ToastProvider, apply, useDB, useToast, Splash, useReady, SignedInBar, hasAccount, RequestAlerts } from "@munasabati/ui";

const PALETTE: [string, string, string, string] = ["#FFC93D", "#FF7A2E", "#C2185B", "#2A0B1E"];
const HOME = import.meta.env.VITE_HOME_URL ?? "../index.html";

function Login() {
  const db = useDB();
  const toast = useToast();
  const [mode, setMode] = useState<"demo" | "join">(isCloud ? "join" : "demo");
  const [, force] = useState(0);
  const signedIn = !isCloud || hasAccount();
  const [f, setF] = useState({ name: "", cat: "kosha" as CategoryId, city: "الدمام", phone: repo.auth?.user()?.phone ?? "", cr: "" });
  const demos = db.suppliers.filter((s) => ["s1", "s2"].includes(s.id) || s.custom);
  const join = (e: React.FormEvent) => {
    e.preventDefault();
    const s: Supplier = { id: uid("s"), name: f.name, city: f.city, area: f.city, cats: [f.cat], hue: Math.floor(Math.random() * 360), tags: ["جديد على مناسبتي"], about: "عرّف العملاء بخدماتك من صفحة الملف التعريفي.", packages: [], phone: normPhone(f.phone || repo.auth?.user()?.phone || "") || undefined, custom: true };
    apply(upsertSupplier(s)); apply(setSession({ supplierId: s.id })); toast("تم إنشاء حسابك");
  };
  return (
    <Gate palette={PALETTE} tagline={BRAND.portals.vendors} eyebrow="بوابة الموردين" title={<>طلبات جاهزة،<br />تصلك مباشرة.</>} lead="لمزودي الكوشة والتصوير والصوت والإضاءة والبث المباشر والضيافة والخيام والمولدات والاستيدج."
      features={[["Inbox", "صندوق طلبات", "التاريخ وعدد الضيوف ونوع المناسبة في كل طلب"], ["Package", "باقاتك بأسعارك", "عدّلها متى ما تبي وتظهر للعميل فوراً"], ["TrendingUp", "تقارير الإيرادات", "معدل التحويل ومتوسط قيمة الحجز"]]}>
      {signedIn && <div><h2 style={{ fontSize: 26, fontWeight: 800 }}>أهلاً بك</h2><p className="muted">{isCloud ? "سجّل دخولك برقم جوالك لإدارة نشاطك." : "ادخل بحساب تجريبي أو سجّل نشاطك."}</p></div>}
      {!signedIn ? <PhoneAuth initialMode="login" onDone={() => force((x) => x + 1)} /> : <>
      {isCloud && <SignedInBar />}
      {!isCloud && <Segmented value={mode} onChange={setMode} options={[["demo", "دخول تجريبي"], ["join", "سجّل نشاطك"]]} />}
      {mode === "demo" ? (
        <div className="stack" style={{ ["--gap" as string]: "10px" }}>
          {demos.map((s) => (
            <button key={s.id} className="demo-acc" onClick={() => apply(setSession({ supplierId: s.id }))}>
              <div className="th"><Media photos={s.photos} seed={s.id} hue={s.hue} kind="supplier" /></div>
              <div className="grow"><b className="display" style={{ display: "block" }}>{s.name}</b><small className="muted">{s.cats.length > 1 ? "تجهيز متكامل" : CATEGORIES.find((c) => c.id === s.cats[0])?.name} · {s.city}</small></div>
              <Icon name="ArrowLeft" size={18} />
            </button>
          ))}
        </div>
      ) : (
        <form className="form" onSubmit={join}>
          <div className="field"><label htmlFor="j-n">اسم النشاط</label><input id="j-n" className="input" required placeholder="مثال: مؤسسة الفرح للتجهيزات" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="form-2">
            <div className="field"><label htmlFor="j-c">الخدمة الرئيسية</label><select id="j-c" className="select" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value as CategoryId })}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="field"><label htmlFor="j-city">المدينة</label><select id="j-city" className="select" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="field"><label htmlFor="j-p">الجوال</label><input id="j-p" className="input num" dir="ltr" style={{ textAlign: "right" }} inputMode="tel" placeholder="05xxxxxxxx" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div className="field"><label htmlFor="j-cr">السجل التجاري أو وثيقة العمل الحر</label><input id="j-cr" className="input num" placeholder="10 أرقام" value={f.cr} onChange={(e) => setF({ ...f, cr: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></div>
          <button className="btn primary lg block" type="submit">أنشئ حسابي</button>
        </form>
      )}
      </>}
      <a className="faint" style={{ fontSize: 13, textAlign: "center" }} href={HOME}>موقع مناسبتي</a>
    </Gate>
  );
}

function Overview({ s, go }: { s: Supplier; go: (t: string) => void }) {
  const db = useDB();
  const mine = db.bookings.filter((b) => b.kind === "supplier" && b.targetId === s.id && b.status !== "review");
  const upcoming = mine.filter((b) => b.status === "confirmed" && b.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <>
      <div className="row between wrap"><div><span className="eyebrow">حياك</span><h1 className="page-title">{s.name}</h1></div></div>
      <NextAction items={[
        { when: mine.some((b) => b.status === "new"), icon: "Inbox", title: `عندك ${mine.filter((b) => b.status === "new").length} طلب جديد`, sub: "الرد خلال ساعتين يرفع ترتيبك في نتائج البحث.", cta: "رد على الطلبات", go: () => go("requests") },
        { when: !(s.photos?.length), icon: "ImagePlus", title: "أضف صور أعمالك", sub: "النشاطات اللي فيها صور حقيقية تستقبل طلبات أكثر.", cta: "أضف الصور", go: () => go("profile"), tone: "info" },
        { when: !s.packages.length, icon: "Package", title: "أضف باقاتك وأسعارك", sub: "العميل يحجز أسرع لما يشوف سعراً واضحاً.", cta: "أضف باقة", go: () => go("packages"), tone: "info" },
        { when: upcoming.some((b) => (new Date(b.date).getTime() - Date.now()) / 864e5 <= 7), icon: "CalendarClock", title: `عندك مناسبة بتاريخ ${upcoming[0]?.date ?? ""}`, sub: `${upcoming[0]?.clientName ?? ""} · جهّز الفريق والمعدات.`, cta: "التقويم", go: () => go("calendar"), tone: "info" },
      ]} />
      <KPIs bookings={mine} />
      <div className="grid-auto" style={{ ["--min" as string]: "320px" }}>
        <section className="card"><div className="section-title"><h3>الإيرادات المؤكدة</h3><span className="faint" style={{ fontSize: 12 }}>حسب شهر المناسبة</span></div><RevenueChart bookings={mine} /></section>
        <section className="card">
          <div className="section-title"><h3>المناسبات القادمة</h3><button className="btn sm ghost" onClick={() => go("calendar")}>التقويم</button></div>
          {upcoming.length ? <div className="list">{upcoming.slice(0, 4).map((b) => <div key={b.id} className="list-row"><span className="avatar">{b.clientName[0]}</span><div className="t"><b>{b.clientName}</b><small className="num">{b.date} · {fmt(b.guests)} ضيف · {OCCASIONS.find((o) => o.id === b.occasion)?.name}</small></div><b className="num display" style={{ fontSize: 13 }}>{sar(b.quote ?? b.estimate)}</b></div>)}</div> : <Empty icon="CalendarHeart" title="لا توجد مناسبات مؤكدة قادمة" />}
        </section>
      </div>
      <section className="card row wrap"><span className="rate num" style={{ fontSize: 16 }}><Icon name="Star" size={16} style={{ color: "#f5a524", fill: "#f5a524" }} /> {s.reviews ? s.rating : "جديد"}</span><span className="muted grow" style={{ minWidth: 200 }}>الرد على الطلبات خلال ساعتين يرفع ظهورك في نتائج البحث.</span><button className="btn sm" onClick={() => go("profile")}>حسّن ملفك</button></section>
    </>
  );
}

function Packages({ s }: { s: Supplier }) {
  const toast = useToast();
  const [edit, setEdit] = useState<(Package & { text: string }) | null>(null);
  const save = (e: React.FormEvent) => {
    e.preventDefault(); if (!edit) return;
    const p: Package = { id: edit.id, name: edit.name, price: edit.price ? +edit.price : undefined, items: edit.text.split("\n").map((x) => x.trim()).filter(Boolean) };
    const packages = s.packages.some((x) => x.id === p.id) ? s.packages.map((x) => (x.id === p.id ? p : x)) : [...s.packages, p];
    const priced = packages.map((x) => x.price).filter((x): x is number => !!x);
    apply(upsertSupplier({ ...s, packages, priceFrom: priced.length ? Math.min(...priced) : undefined })); setEdit(null); toast("تم حفظ الباقة");
  };
  return (
    <>
      <div className="row between wrap"><div><h1 className="page-title">الباقات والأسعار</h1><p className="page-sub">تظهر للعملاء في صفحتك فوراً.</p></div><button className="btn primary" onClick={() => setEdit({ id: uid("p"), name: "", price: 0, items: [], text: "" })}><Icon name="Plus" size={16} /> باقة</button></div>
      {!s.packages.length && <section className="card"><Empty icon="Package" title="ما أضفت باقات للحين">الباقات الواضحة ترفع طلبات الحجز.</Empty></section>}
      <div className="grid-auto">
        {s.packages.map((p) => (
          <section key={p.id} className="card stack" style={{ ["--gap" as string]: "10px", alignContent: "start" }}>
            <div className="row between"><b className="display" style={{ fontSize: 16 }}>{p.name}</b><div className="row" style={{ ["--gap" as string]: "6px" }}><button className="icon-btn sm" aria-label="تعديل" onClick={() => setEdit({ ...p, text: p.items.join("\n") })}><Icon name="Pencil" size={15} /></button><button className="icon-btn sm" aria-label="حذف" onClick={() => apply(upsertSupplier({ ...s, packages: s.packages.filter((x) => x.id !== p.id) }))}><Icon name="Trash2" size={15} /></button></div></div>
            <b className="display num" style={{ fontSize: 24 }}>{sar(p.price)}</b>
            <ul style={{ margin: 0, padding: "0 18px 0 0", color: "var(--muted)", fontSize: 14 }}>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        ))}
      </div>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title="الباقة">
        {edit && <form className="form" onSubmit={save}>
          <div className="field"><label htmlFor="p-n">اسم الباقة</label><input id="p-n" className="input" required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="p-p">السعر (ر.س)</label><input id="p-p" type="number" min={0} required className="input num" value={edit.price} onChange={(e) => setEdit({ ...edit, price: +e.target.value })} /></div>
          <div className="field"><label htmlFor="p-i">المحتويات (سطر لكل بند)</label><textarea id="p-i" className="input" rows={5} placeholder={"كوشة رئيسية\nإضاءة\nمصور 4 ساعات"} value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} /></div>
          <button className="btn primary lg block" type="submit">حفظ</button>
        </form>}
      </Sheet>
    </>
  );
}

function Profile({ s }: { s: Supplier }) {
  const toast = useToast();
  const [f, setF] = useState({ name: s.name, city: s.city, area: s.area, about: s.about, tags: s.tags.join("، "), cats: s.cats });
  const toggle = (c: CategoryId) => setF((x) => ({ ...x, cats: x.cats.includes(c) ? x.cats.filter((y) => y !== c) : [...x.cats, c] }));
  return (
    <>
      <div><h1 className="page-title">الملف التعريفي</h1><p className="page-sub">هذا اللي يشوفه العميل في تطبيق مناسبتي.</p></div>
      <form className="card form" onSubmit={(e) => { e.preventDefault(); apply(upsertSupplier({ ...s, ...f, photos: s.photos, cats: f.cats.length ? f.cats : s.cats, tags: f.tags.split(/[,،]/).map((x) => x.trim()).filter(Boolean) })); toast("تم تحديث ملفك"); }}>
        <div className="form-2">
          <div className="field"><label htmlFor="f-n">الاسم التجاري</label><input id="f-n" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="f-c">المدينة</label><select id="f-c" className="select" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="field full"><label htmlFor="f-a">نطاق الخدمة</label><input id="f-a" className="input" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></div>
          <div className="field full"><label htmlFor="f-b">نبذة</label><textarea id="f-b" className="input" rows={5} value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} /></div>
        </div>
        <div className="field"><span className="label">الخدمات اللي تقدمها</span><div className="chips wrap">{CATEGORIES.map((c) => <button type="button" key={c.id} className={"chip" + (f.cats.includes(c.id) ? " on" : "")} onClick={() => toggle(c.id)} aria-pressed={f.cats.includes(c.id)}><Icon name={c.icon} size={15} />{c.name}</button>)}</div></div>
        <PhotoManager photos={s.photos} onChange={(photos) => apply(upsertSupplier({ ...s, photos }))} />
        <div className="field"><label htmlFor="f-t">مميزات قصيرة (افصل بفاصلة)</label><input id="f-t" className="input" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></div>
        <button className="btn primary lg" type="submit">حفظ التغييرات</button>
      </form>
    </>
  );
}

function Portal({ s }: { s: Supplier }) {
  const db = useDB();
  const [tab, setTab] = useState("overview");
  const mine = db.bookings.filter((b) => b.kind === "supplier" && b.targetId === s.id && b.status !== "review");
  const openRequests = useCallback(() => setTab("requests"), []);
  const tabs = [
    { id: "overview", label: "اللوحة", icon: "LayoutDashboard" },
    { id: "requests", label: "الطلبات", icon: "Inbox", count: mine.filter((b) => b.status === "new").length },
    { id: "calendar", label: "التقويم", icon: "CalendarDays" },
    { id: "packages", label: "الباقات", icon: "Package" },
    { id: "profile", label: "الملف التعريفي", icon: "Store" },
    { id: "support", label: "الدعم", icon: "LifeBuoy", count: (db.tickets ?? []).filter((t) => t.from === "supplier" && t.fromId === s.id && t.status === "answered").length },
  ];
  return (
    <AppShell portal="بوابة الموردين" tabs={tabs} active={tab} onChange={setTab} footer={<><button className="btn sm ghost" onClick={() => (isCloud ? void repo.auth?.signOut() : apply(setSession({ supplierId: null })))}><Icon name="LogOut" size={15} /> تسجيل الخروج</button><a className="side-legal" href="../privacy.html" target="_blank" rel="noreferrer">الخصوصية والشروط</a></>}>
      <RequestAlerts bookings={mine} onOpen={openRequests} />
      <AnimatePresence initial={false}>
        <motion.div key={tab} className="page" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}>
          {s.status === "suspended" && <div className="suspended-bar"><Icon name="ShieldAlert" size={18} /> حسابك معلّق مؤقتاً ولا يظهر للعملاء. تواصل مع الدعم.</div>}
          {tab === "overview" && <Overview s={s} go={setTab} />}
          {tab === "requests" && <Inbox bookings={mine} defaultQuote={(b) => s.packages.find((p) => p.id === b.packageId)?.price ?? b.estimate ?? s.priceFrom}
            quoteTemplate={(b) => { const p = s.packages.find((x) => x.id === b.packageId); return `حياكم الله، يسعدنا نكون جزء من فرحتكم. العرض يشمل ${p ? p.items.join("، ") : "التجهيز حسب طلبكم"}.`; }} />}
          {tab === "calendar" && <><div><h1 className="page-title">التقويم</h1><p className="page-sub">المناسبات المؤكدة والطلبات قيد الانتظار.</p></div><MonthBoard bookings={mine} /><section className="card" style={{ paddingBlock: 6 }}><div className="list">{mine.filter((b) => b.status !== "declined").sort((a, b) => a.date.localeCompare(b.date)).map((b) => <div key={b.id} className="list-row"><b className="num display" style={{ width: 92 }}>{b.date}</b><div className="t"><b>{b.clientName}</b><small>{fmt(b.guests)} ضيف · {b.city}</small></div><StatusPill status={b.status} /></div>)}</div></section></>}
          {tab === "packages" && <Packages s={s} />}
          {tab === "profile" && <Profile s={s} />}
          {tab === "support" && <SupportCenter from="supplier" fromId={s.id} fromName={s.name} />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

function Main() {
  const db = useDB();
  const ready = useReady();
  const s = db.suppliers.find((x) => x.id === db.sessions.supplierId);
  if (!ready) return <Splash />;
  if (!s) return <Login />;
  // قبل أي طلب: التاجر يوقّع اتفاقية الشراكة (التواصل والدفع عبر مناسبتي فقط)
  return hasAgreement(s) ? <Portal s={s} /> : <PartnerAgreementGate kind="supplier" id={s.id} name={s.name} />;
}

export default function App() { return <ToastProvider><Main /></ToastProvider>; }
