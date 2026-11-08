import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { normPhone, CITIES, OCCASIONS, fmt, hallCapacity, isoDay, sar, setSession, uid, upsertVenue, type Hall, type Venue } from "@munasabati/core";
import { AppShell, NextAction, SupportCenter, Empty, Gate, Icon, Media, PhoneAuth, PhotoManager, isCloud, repo, Inbox, KPIs, MonthBoard, RevenueChart, Segmented, Sheet, ToastProvider, apply, useDB, useToast } from "@munasabati/ui";

const PALETTE: [string, string, string, string] = ["#86F2CF", "#17A897", "#0E4F6E", "#06192A"];
const HOME = import.meta.env.VITE_HOME_URL ?? "../index.html";

function Login() {
  const db = useDB();
  const toast = useToast();
  const [mode, setMode] = useState<"demo" | "join">(isCloud ? "join" : "demo");
  const [, force] = useState(0);
  const signedIn = !isCloud || !!repo.auth?.user();
  const [f, setF] = useState({ name: "", city: "الرياض", district: "", phone: "", men: 0, women: 0, wd: 0, we: 0 });
  const demos = db.venues.filter((v) => ["v1", "v3"].includes(v.id) || v.custom);
  const join = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Venue = { id: uid("v"), name: f.name, city: f.city, district: f.district || f.city, hue: Math.floor(Math.random() * 360), tags: ["جديد على مناسبتي"], about: "عرّف العرسان بقاعتك من صفحة الملف التعريفي.", halls: [{ id: "a", name: "القاعة الرئيسية", menCap: f.men || undefined, womenCap: f.women || undefined, weekdayPrice: f.wd || undefined, weekendPrice: f.we || undefined }], blocked: [], custom: true, phone: normPhone(f.phone || repo.auth?.user()?.phone || "") || undefined };
    apply(upsertVenue(v)); apply(setSession({ venueId: v.id })); toast("تم تسجيل قاعتك");
  };
  return (
    <Gate palette={PALETTE} eyebrow="بوابة أصحاب القاعات" title={<>قاعتك محجوزة<br />طول الموسم.</>} lead="أدر قاعاتك وأقسامها وأسعار أيام الأسبوع والويكند، واستقبل طلبات الحجز من العرسان مباشرة."
      features={[["Building2", "أكثر من قاعة", "لكل قاعة قسم رجال وقسم نساء وسعة وسعر"], ["CalendarRange", "تقويم إشغال", "أغلق أيام الصيانة والحجوزات الخارجية بضغطة"], ["TrendingUp", "تسعير الويكند", "سعر مختلف للخميس والجمعة والسبت تلقائياً"]]}>
      <div><h2 style={{ fontSize: 26, fontWeight: 800 }}>أهلاً بك</h2><p className="muted">{isCloud ? "سجّل دخولك برقم جوالك لإدارة قاعتك." : "ادخل بحساب تجريبي أو سجّل قاعتك."}</p></div>
      {!signedIn ? <PhoneAuth onDone={() => force((x) => x + 1)} /> : <>
      {!isCloud && <Segmented value={mode} onChange={setMode} options={[["demo", "دخول تجريبي"], ["join", "سجّل قاعتك"]]} />}
      {mode === "demo" ? (
        <div className="stack" style={{ ["--gap" as string]: "10px" }}>
          {demos.map((v) => (
            <button key={v.id} className="demo-acc" onClick={() => apply(setSession({ venueId: v.id }))}>
              <div className="th"><Media photos={v.photos} seed={v.id} hue={v.hue} /></div>
              <div className="grow"><b className="display" style={{ display: "block" }}>{v.name}</b><small className="muted">{v.halls.length} {v.halls.length > 1 ? "قاعات" : "قاعة"} · {v.city}</small></div>
              <Icon name="ArrowLeft" size={18} />
            </button>
          ))}
        </div>
      ) : (
        <form className="form" onSubmit={join}>
          <div className="field"><label htmlFor="j-n">اسم القاعة أو القصر</label><input id="j-n" className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="form-2">
            <div className="field"><label htmlFor="j-c">المدينة</label><select id="j-c" className="select" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label htmlFor="j-d">الحي</label><input id="j-d" className="input" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} /></div>
            <div className="field"><label htmlFor="j-m">سعة قسم الرجال</label><input id="j-m" type="number" min={0} className="input num" value={f.men || ""} placeholder="أدخل السعة" onChange={(e) => setF({ ...f, men: +e.target.value })} /></div>
            <div className="field"><label htmlFor="j-w">سعة قسم النساء</label><input id="j-w" type="number" min={0} className="input num" value={f.women || ""} placeholder="أدخل السعة" onChange={(e) => setF({ ...f, women: +e.target.value })} /></div>
          </div>
          <div className="field"><label htmlFor="j-p">الجوال</label><input id="j-p" className="input num" inputMode="tel" required pattern="05\d{8}" title="رقم يبدأ بـ 05 ومكون من 10 أرقام" placeholder="05xxxxxxxx" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></div>
          <button className="btn primary lg block" type="submit">سجّل قاعتي</button>
        </form>
      )}
      </>}
      <a className="faint" style={{ fontSize: 13, textAlign: "center" }} href={HOME}>موقع مناسبتي</a>
    </Gate>
  );
}

function Overview({ v, go }: { v: Venue; go: (t: string) => void }) {
  const db = useDB();
  const mine = db.bookings.filter((b) => b.kind === "venue" && b.targetId === v.id);
  const occupancy = useMemo(() => {
    const now = new Date(); const y = now.getFullYear(), m = now.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    const weekends = Array.from({ length: days }, (_, i) => new Date(Date.UTC(y, m, i + 1))).filter((d) => [4, 5, 6].includes(d.getUTCDay())).map(isoDay);
    return v.halls.map((h) => {
      const booked = new Set(mine.filter((b) => b.status === "confirmed" && (b.hallId ?? "a") === h.id && b.date.slice(0, 7) === isoDay(now).slice(0, 7)).map((b) => b.date));
      const wkBooked = weekends.filter((d) => booked.has(d)).length;
      return { h, booked: booked.size, pct: Math.round((wkBooked / Math.max(1, weekends.length)) * 100), weekends: weekends.length, wkBooked };
    });
  }, [v.halls, mine]);
  const upcoming = mine.filter((b) => b.status === "confirmed" && b.date >= isoDay(new Date())).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <>
      <div className="row between wrap"><div><span className="eyebrow">حياك</span><h1 className="page-title">{v.name}</h1></div></div>
      <NextAction items={[
        { when: mine.some((b) => b.status === "new"), icon: "Inbox", title: `عندك ${mine.filter((b) => b.status === "new").length} طلب حجز جديد`, sub: "العرسان يحجزون أول قاعة ترد عليهم.", cta: "رد على الطلبات", go: () => go("bookings") },
        { when: !(v.photos?.length), icon: "ImagePlus", title: "أضف صور قاعتك", sub: "الصور الحقيقية أول شي يقارنه العرسان.", cta: "أضف الصور", go: () => go("profile"), tone: "info" },
        { when: upcoming.some((b) => (new Date(b.date).getTime() - Date.now()) / 864e5 <= 7), icon: "CalendarClock", title: `حفلة قادمة بتاريخ ${upcoming[0]?.date ?? ""}`, sub: `${upcoming[0]?.clientName ?? ""} · ${fmt(upcoming[0]?.guests ?? 0)} ضيف.`, cta: "التقويم", go: () => go("calendar"), tone: "info" },
        { when: occupancy.some((o) => o.pct < 50), icon: "TrendingUp", title: "ليالي ويكند فاضية هالشهر", sub: `${occupancy.filter((o) => o.pct < 50).map((o) => o.h.name).join("، ")} · جرّب سعر ويكند أنسب.`, cta: "الأسعار", go: () => go("halls"), tone: "info" },
      ]} />
      <KPIs bookings={mine} />
      <section className="card">
        <div className="section-title"><h3>إشغال ليالي الويكند هذا الشهر</h3><button className="btn sm ghost" onClick={() => go("halls")}>إدارة القاعات</button></div>
        <div className="stack" style={{ ["--gap" as string]: "14px" }}>
          {occupancy.map(({ h, pct, wkBooked, weekends }) => (
            <div key={h.id}>
              <div className="row between" style={{ marginBottom: 6 }}><b className="display">{h.name}</b><span className="num muted">{wkBooked}/{weekends} ليلة · <b style={{ color: "var(--ink)" }}>{pct}%</b></span></div>
              <div className="bar info" style={{ height: 10 }}><i style={{ width: `${pct}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
      <div className="grid-auto" style={{ ["--min" as string]: "320px" }}>
        <section className="card"><div className="section-title"><h3>الإيرادات المؤكدة</h3></div><RevenueChart bookings={mine} /></section>
        <section className="card">
          <div className="section-title"><h3>الحفلات القادمة</h3><button className="btn sm ghost" onClick={() => go("calendar")}>التقويم</button></div>
          {upcoming.length ? <div className="list">{upcoming.slice(0, 4).map((b) => <div key={b.id} className="list-row"><span className="avatar alt">{b.clientName[0]}</span><div className="t"><b>{b.clientName}</b><small className="num">{b.date} · {v.halls.find((h) => h.id === (b.hallId ?? "a"))?.name} · {OCCASIONS.find((o) => o.id === b.occasion)?.name}</small></div><b className="num display" style={{ fontSize: 13 }}>{fmt(b.guests)} ضيف</b></div>)}</div> : <Empty icon="CalendarHeart" title="لا توجد حفلات مؤكدة قادمة" />}
        </section>
      </div>
    </>
  );
}

function Halls({ v }: { v: Venue }) {
  const toast = useToast();
  const [edit, setEdit] = useState<Hall | null>(null);
  const save = (e: React.FormEvent) => {
    e.preventDefault(); if (!edit) return;
    const halls = v.halls.some((h) => h.id === edit.id) ? v.halls.map((h) => (h.id === edit.id ? edit : h)) : [...v.halls, edit];
    apply(upsertVenue({ ...v, halls })); setEdit(null); toast("تم حفظ القاعة");
  };
  return (
    <>
      <div className="row between wrap"><div><h1 className="page-title">قاعاتي والأسعار</h1><p className="page-sub">سعر الويكند يُطبّق تلقائياً على الخميس والجمعة والسبت.</p></div><button className="btn primary" onClick={() => setEdit({ id: uid("h"), name: "" })}><Icon name="Plus" size={16} /> قاعة</button></div>
      <div className="grid-auto" style={{ ["--min" as string]: "300px" }}>
        {v.halls.map((h) => (
          <section key={h.id} className="card stack" style={{ ["--gap" as string]: "14px" }}>
            <div className="row"><span className="avatar alt"><Icon name="DoorOpen" size={18} /></span><b className="display grow" style={{ fontSize: 17 }}>{h.name}</b><button className="icon-btn sm" aria-label="تعديل" onClick={() => setEdit(h)}><Icon name="Pencil" size={15} /></button>{v.halls.length > 1 && <button className="icon-btn sm" aria-label="حذف" onClick={() => apply(upsertVenue({ ...v, halls: v.halls.filter((x) => x.id !== h.id) }))}><Icon name="Trash2" size={15} /></button>}</div>
            <div className="form-2" style={{ gap: 10 }}>
              <div className="card flat tight" style={{ background: "var(--surface-2)" }}><div className="stat-label">قسم الرجال</div><b className="display num" style={{ fontSize: 22 }}>{fmt(h.menCap)}</b></div>
              <div className="card flat tight" style={{ background: "var(--surface-2)" }}><div className="stat-label">قسم النساء</div><b className="display num" style={{ fontSize: 22 }}>{fmt(h.womenCap)}</b></div>
              <div className="card flat tight" style={{ background: "var(--surface-2)" }}><div className="stat-label">وسط الأسبوع</div><b className="display num" style={{ fontSize: 18 }}>{sar(h.weekdayPrice)}</b></div>
              <div className="card flat tight" style={{ background: "var(--info-soft)", borderColor: "transparent" }}><div className="stat-label">الويكند</div><b className="display num" style={{ fontSize: 18 }}>{sar(h.weekendPrice)}</b></div>
            </div>
            <div className="muted num" style={{ fontSize: 13 }}>السعة الكلية {fmt(hallCapacity(h))} ضيف</div>
          </section>
        ))}
      </div>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title="بيانات القاعة">
        {edit && <form className="form" onSubmit={save}>
          <div className="field"><label htmlFor="h-n">اسم القاعة</label><input id="h-n" className="input" required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          <div className="form-2">
            <div className="field"><label htmlFor="h-m">سعة الرجال</label><input id="h-m" type="number" min={0} className="input num" value={edit.menCap ?? ""} placeholder="أدخل الرقم" onChange={(e) => setEdit({ ...edit, menCap: e.target.value ? +e.target.value : undefined })} /></div>
            <div className="field"><label htmlFor="h-w">سعة النساء</label><input id="h-w" type="number" min={0} className="input num" value={edit.womenCap ?? ""} placeholder="أدخل الرقم" onChange={(e) => setEdit({ ...edit, womenCap: e.target.value ? +e.target.value : undefined })} /></div>
            <div className="field"><label htmlFor="h-wd">سعر وسط الأسبوع</label><input id="h-wd" type="number" min={0} className="input num" value={edit.weekdayPrice ?? ""} placeholder="أدخل الرقم" onChange={(e) => setEdit({ ...edit, weekdayPrice: e.target.value ? +e.target.value : undefined })} /></div>
            <div className="field"><label htmlFor="h-we">سعر الويكند</label><input id="h-we" type="number" min={0} className="input num" value={edit.weekendPrice ?? ""} placeholder="أدخل الرقم" onChange={(e) => setEdit({ ...edit, weekendPrice: e.target.value ? +e.target.value : undefined })} /></div>
          </div>
          <button className="btn primary lg block" type="submit">حفظ</button>
        </form>}
      </Sheet>
    </>
  );
}

function Calendar({ v }: { v: Venue }) {
  const db = useDB();
  const [hall, setHall] = useState(v.halls[0]?.id ?? "a");
  const mine = db.bookings.filter((b) => b.kind === "venue" && b.targetId === v.id && (b.hallId ?? "a") === hall);
  const toggle = (iso: string) => apply(upsertVenue({ ...v, blocked: v.blocked.includes(iso) ? v.blocked.filter((d) => d !== iso) : [...v.blocked, iso] }));
  return (
    <>
      <div><h1 className="page-title">التقويم والإغلاق</h1><p className="page-sub">اضغط أي يوم فاضي لإغلاقه أمام العملاء (صيانة أو حجز خارج المنصة).</p></div>
      {v.halls.length > 1 && <Segmented value={hall} onChange={setHall} label="القاعة" options={v.halls.map((h) => [h.id, h.name] as [string, string])} />}
      <MonthBoard bookings={mine} blocked={v.blocked} onToggleBlock={toggle} />
    </>
  );
}

function Profile({ v }: { v: Venue }) {
  const toast = useToast();
  const [f, setF] = useState({ name: v.name, city: v.city, district: v.district, about: v.about, tags: v.tags.join("، ") });
  return (
    <>
      <div><h1 className="page-title">الملف التعريفي</h1><p className="page-sub">هذا اللي يشوفه العرسان في تطبيق مناسبتي.</p></div>
      <form className="card form" onSubmit={(e) => { e.preventDefault(); apply(upsertVenue({ ...v, ...f, tags: f.tags.split(/[,،]/).map((x) => x.trim()).filter(Boolean) })); toast("تم تحديث الملف"); }}>
        <div className="form-2">
          <div className="field"><label htmlFor="p-n">الاسم</label><input id="p-n" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="p-c">المدينة</label><select id="p-c" className="select" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="field full"><label htmlFor="p-d">الحي</label><input id="p-d" className="input" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} /></div>
          <div className="field full"><label htmlFor="p-a">نبذة</label><textarea id="p-a" className="input" rows={5} value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} /></div>
          <div className="full"><PhotoManager photos={v.photos} onChange={(photos) => apply(upsertVenue({ ...v, photos }))} /></div>
          <div className="field full"><label htmlFor="p-t">المميزات (افصل بفاصلة)</label><input id="p-t" className="input" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></div>
        </div>
        <button className="btn primary lg" type="submit">حفظ التغييرات</button>
      </form>
    </>
  );
}

function Portal({ v }: { v: Venue }) {
  const db = useDB();
  const [tab, setTab] = useState("overview");
  const mine = db.bookings.filter((b) => b.kind === "venue" && b.targetId === v.id);
  const tabs = [
    { id: "overview", label: "اللوحة", icon: "LayoutDashboard" },
    { id: "bookings", label: "الحجوزات", icon: "Inbox", count: mine.filter((b) => b.status === "new").length },
    { id: "calendar", label: "التقويم", icon: "CalendarRange" },
    { id: "halls", label: "القاعات", icon: "DoorOpen" },
    { id: "profile", label: "الملف التعريفي", icon: "Building2" },
    { id: "support", label: "الدعم", icon: "LifeBuoy", count: (db.tickets ?? []).filter((t) => t.from === "venue" && t.fromId === v.id && t.status === "answered").length },
  ];
  const hallName = (id?: string) => v.halls.find((h) => h.id === (id ?? "a"))?.name ?? "";
  return (
    <AppShell portal="بوابة القاعات" tabs={tabs} active={tab} onChange={setTab} footer={<><button className="btn sm ghost" onClick={() => (isCloud ? void repo.auth?.signOut() : apply(setSession({ venueId: null })))}><Icon name="LogOut" size={15} /> تسجيل الخروج</button><a className="side-legal" href="../privacy.html" target="_blank" rel="noreferrer">الخصوصية والشروط</a></>}>
      <AnimatePresence initial={false}>
        <motion.div key={tab} className="page" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}>
          {v.status === "suspended" && <div className="suspended-bar"><Icon name="ShieldAlert" size={18} /> حسابك معلّق مؤقتاً ولا يظهر للعملاء. تواصل مع الدعم.</div>}
          {tab === "overview" && <Overview v={v} go={setTab} />}
          {tab === "bookings" && <Inbox bookings={mine}
            describe={(b) => <span className="row" style={{ ["--gap" as string]: "5px" }}><Icon name="DoorOpen" size={14} />{hallName(b.hallId)}</span>}
            defaultQuote={(b) => b.estimate || (v.halls.find((h) => h.id === (b.hallId ?? "a"))?.weekdayPrice ?? 0)}
            quoteTemplate={(b) => `حياكم الله، ${hallName(b.hallId)} متاحة يوم ${b.date}. السعر يشمل القسمين والكوشة الأساسية وخدمة الضيافة.`} />}
          {tab === "calendar" && <Calendar v={v} />}
          {tab === "halls" && <Halls v={v} />}
          {tab === "profile" && <Profile v={v} />}
          {tab === "support" && <SupportCenter from="venue" fromId={v.id} fromName={v.name} />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

function Main() {
  const db = useDB();
  const v = db.venues.find((x) => x.id === db.sessions.venueId);
  return v ? <Portal v={v} /> : <Login />;
}

export default function App() { return <ToastProvider><Main /></ToastProvider>; }
