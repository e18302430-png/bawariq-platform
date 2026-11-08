import { useEffect, useState } from "react";
import { OCCASIONS, TIERS, fmt, matchVenues, sar, hospitality, venueFrom, toggleTask } from "@munasabati/core";
import { Counter, Icon, Media, MeshGradient, StatusPill, apply, useDB } from "@munasabati/ui";
import { go } from "../nav";

function useCountdown(iso: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const d = Math.max(0, new Date(`${iso}T20:00:00`).getTime() - now);
  return [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
}

const greet = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? "صباح الخير" : h < 17 ? "نهارك سعيد" : "مساء الخير"; };

export default function Home() {
  const db = useDB();
  const e = db.client.event!;
  const occ = OCCASIONS.find((o) => o.id === e.occasion)!;
  const [d, h, m, s] = useCountdown(e.date);
  const sum = <T,>(a: T[], f: (x: T) => number) => a.reduce((x, y) => x + f(y), 0);
  const guests = db.client.guests;
  const invited = sum(guests, (g) => g.count);
  const yes = sum(guests.filter((g) => g.status === "yes"), (g) => g.count);
  const yesMen = sum(guests.filter((g) => g.status === "yes" && g.section === "men"), (g) => g.count);
  const est = sum(db.client.budget, (b) => b.est), paid = sum(db.client.budget, (b) => b.paid);
  const tasks = db.client.tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);
  const myBookings = db.bookings.filter((b) => b.fromClient);
  const quotes = myBookings.filter((b) => b.status === "quoted");
  const recs = matchVenues(db.venues, e.city, e.guests).slice(0, 5);
  const hosp = hospitality(yesMen || Math.round(e.guests * e.menRatio), (yes - yesMen) || e.guests - Math.round(e.guests * e.menRatio));

  return (
    <>
      <div className="hello">
        <div className="grow"><div className="muted" style={{ fontSize: 14 }}>{greet()}</div><h1>{db.client.profile?.name} 👋</h1></div>
        <span className="avatar" style={{ width: 46, height: 46, fontSize: 18 }}>{db.client.profile?.name?.[0] ?? "م"}</span>
      </div>

      <section className="event-card">
        <MeshGradient palette={occ.palette} />
        <div className="meta"><span className="pill" style={{ background: "rgba(255,255,255,.2)", color: "#fff", backdropFilter: "blur(10px)" }}>{occ.name} · {e.city}</span><span className="num" style={{ opacity: 0.9 }}>{e.date}</span></div>
        <div><div style={{ opacity: 0.88, fontSize: 14 }}>{e.title}</div><h2>باقي على ليلتك</h2></div>
        <div className="cd num" aria-label={`باقي ${d} يوم`}>
          {[[d, "يوم"], [h, "ساعة"], [m, "دقيقة"], [s, "ثانية"]].map(([v, l]) => <div key={l}><b>{String(v).padStart(2, "0")}</b><small>{l}</small></div>)}
        </div>
      </section>

      {quotes.length > 0 && (
        <button className="card row" style={{ textAlign: "start", background: "var(--info-soft)", borderColor: "transparent", boxShadow: "none" }} onClick={() => go("bookings")}>
          <span className="avatar alt"><Icon name="BadgeDollarSign" /></span>
          <span className="grow"><b className="display" style={{ display: "block" }}>وصلك {quotes.length === 1 ? "عرض سعر جديد" : `${quotes.length} عروض أسعار`}</b><small className="muted">راجع العرض واقبله بضغطة</small></span>
          <Icon name="ChevronLeft" />
        </button>
      )}

      <div className="quick">
        {[["guests", "الضيوف", "Users", "var(--brand)"], ["invites", "الدعوات", "Send", "var(--info)"], ["explore", "احجز", "Compass", "var(--ok)"], ["door", "يوم المناسبة", "ScanLine", "var(--warn)"]].map(([id, l, ic, c]) => (
          <button key={id} onClick={() => go(id)}><span className="qi" style={{ background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c }}><Icon name={ic} size={21} /></span>{l}</button>
        ))}
      </div>

      <div className="stats">
        <div className="card"><div className="stat-label"><Icon name="UserCheck" size={15} /> ضيوف مؤكدين</div><div className="stat-value"><Counter value={yes} /><span className="faint" style={{ fontSize: 14, fontWeight: 500 }}> / {fmt(invited)}</span></div><div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${invited ? (yes / invited) * 100 : 0}%` }} /></div></div>
        <div className="card"><div className="stat-label"><Icon name="Wallet" size={15} /> المدفوع</div><div className="stat-value"><Counter value={paid} /></div><div className="stat-sub num">من {sar(est)}</div></div>
        <div className="card"><div className="stat-label"><Icon name="ListChecks" size={15} /> المهام</div><div className="stat-value num">{db.client.tasks.filter((t) => t.done).length}/{db.client.tasks.length}</div><div className="stat-sub">منجزة</div></div>
        <div className="card"><div className="stat-label"><Icon name="Beef" size={15} /> ذبائح تقريباً</div><div className="stat-value"><Counter value={hosp.sheep} /></div><div className="stat-sub">مستوى {TIERS.find((t) => t.id === e.tier)?.name}</div></div>
      </div>

      <div className="home-grid">
        <section className="card">
          <div className="section-title"><h3>المهام القادمة</h3><button className="btn sm ghost" onClick={() => go("tasks")}>الكل</button></div>
          <div className="list">
            {tasks.length ? tasks.map((t) => (
              <div key={t.id} className="list-row">
                <button className={"check" + (t.done ? " on" : "")} onClick={() => apply(toggleTask(t.id))} aria-label="تم"><Icon name="Check" size={14} /></button>
                <div className="t"><b>{t.title}</b><small>{t.who} · <span className="num">{t.due}</span></small></div>
              </div>
            )) : <p className="muted">كل المهام منجزة 🎉</p>}
          </div>
        </section>
        <section className="card">
          <div className="section-title"><h3>آخر الحجوزات</h3><button className="btn sm ghost" onClick={() => go("bookings")}>الكل</button></div>
          {myBookings.length ? <div className="list">{myBookings.slice(0, 3).map((b) => {
            const name = b.kind === "venue" ? db.venues.find((v) => v.id === b.targetId)?.name : db.suppliers.find((x) => x.id === b.targetId)?.name;
            return <div key={b.id} className="list-row"><span className="avatar"><Icon name={b.kind === "venue" ? "Building2" : "Store"} size={18} /></span><div className="t"><b>{name}</b><small className="num">{b.date}</small></div><StatusPill status={b.status} /></div>;
          })}</div> : <div className="stack" style={{ ["--gap" as string]: "12px" }}><p className="muted">ما أرسلت أي طلب حجز للحين.</p><button className="btn soft" onClick={() => go("explore")}>تصفح القاعات والموردين</button></div>}
        </section>
      </div>

      <section>
        <div className="section-title"><h3>قاعات تناسب مناسبتك</h3><button className="btn sm ghost" onClick={() => go("explore")}>عرض الكل</button></div>
        <div className="hscroll">
          {recs.map(({ venue, score }) => (
            <button key={venue.id} className="vcard" onClick={() => go("venue-" + venue.id)}>
              <div className="art"><Media photos={venue.photos} seed={venue.id} hue={venue.hue} alt={venue.name} /><div className="over"><span className="pill num">{score}% تطابق</span></div></div>
              <div className="body">
                <div className="row between"><h3>{venue.name}</h3><span className="rate num"><Icon name="Star" size={13} />{venue.rating}</span></div>
                <div className="m"><span><Icon name="MapPin" size={13} />{venue.city}</span><span className="num">من {fmt(venueFrom(venue))} ر.س</span></div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
