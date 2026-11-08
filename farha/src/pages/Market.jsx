import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Icon, Art, Stars, Modal, Footer } from "../components/ui";
import { CATEGORIES, CITIES, OCCASIONS, sar, fmt } from "../data";
import { useStore, useVendor, useToast, go, allVendors } from "../store";

const priceLabel = (v) => (v.type === "hall" ? "للحفل" : "تبدأ من");

export function Explore() {
  const { state, dispatch } = useStore();
  const [cat, setCat] = useState("all");
  const [city, setCity] = useState(state.event?.city || "all");
  const [q, setQ] = useState("");
  const [guests, setGuests] = useState(state.event?.guests || 0);
  const [sort, setSort] = useState("match");
  const [favOnly, setFavOnly] = useState(false);

  const list = useMemo(() => {
    let r = allVendors(state).filter((v) => (cat === "all" || v.cat === cat || v.cats?.includes(cat)));
    if (city !== "all") r = r.filter((v) => v.city === city || v.area?.includes("كل مناطق"));
    if (q.trim()) r = r.filter((v) => (v.name + v.about + v.tags.join(" ") + v.city).includes(q.trim()));
    if (guests) r = r.filter((v) => v.type !== "hall" || v.capacity >= guests);
    if (favOnly) r = r.filter((v) => state.favorites.includes(v.id));
    const by = { match: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating, price: (a, b) => a.price - b.price, rating: (a, b) => b.rating - a.rating };
    return [...r].sort(by[sort]);
  }, [cat, city, q, guests, sort, favOnly, state.favorites]);

  return (
    <>
      <div className="wrap">
        <div className="page-head">
          <span className="eyebrow">السوق</span>
          <h1>القاعات وخدمات <span className="display gold">التجهيز</span></h1>
          <p className="muted">{state.event ? <>نعرض لك الأنسب لـ {fmt(state.event.guests)} ضيف في {state.event.city}. غيّر الفلاتر متى ما تبي.</> : "قارن الأسعار والتقييمات والتوفر، واطلب عرض سعر بضغطة."}</p>
        </div>
        <div className="filters">
          <div className="search">
            <Icon name="Search" size={17} />
            <label className="sr" htmlFor="m-q">بحث</label>
            <input id="m-q" className="input" placeholder="ابحث: كوشة، بث مباشر، إطلالة بحرية…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <label className="sr" htmlFor="m-city">المدينة</label>
          <select id="m-city" className="select" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="all">كل المدن</option>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <label className="sr" htmlFor="m-g">عدد الضيوف</label>
          <select id="m-g" className="select" value={guests} onChange={(e) => setGuests(+e.target.value)}>
            <option value={0}>أي عدد ضيوف</option>
            {[200, 400, 600, 800, 1000].map((g) => <option key={g} value={g}>{g}+ ضيف</option>)}
            {state.event && ![0, 200, 400, 600, 800, 1000].includes(state.event.guests) && <option value={state.event.guests}>{state.event.guests} ضيف (مناسبتي)</option>}
          </select>
          <label className="sr" htmlFor="m-sort">الترتيب</label>
          <select id="m-sort" className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="match">الأنسب</option><option value="price">الأقل سعراً</option><option value="rating">الأعلى تقييماً</option>
          </select>
          <button className={"chip" + (favOnly ? " on" : "")} onClick={() => setFavOnly((x) => !x)}><Icon name="Heart" size={14} /> المفضلة ({state.favorites.length})</button>
        </div>
        <div className="cat-row" role="group" aria-label="الفئات">
          <button className={"chip" + (cat === "all" ? " on" : "")} onClick={() => setCat("all")}>الكل</button>
          {CATEGORIES.map((c) => <button key={c.id} className={"chip" + (cat === c.id ? " on" : "")} onClick={() => setCat(c.id)}><Icon name={c.icon} size={14} /> {c.short}</button>)}
        </div>
        {list.length ? (
          <div className="v-grid">
            {list.map((v, i) => (
              <motion.a key={v.id} href={"#venue-" + v.id} className="v-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * .04 }}>
                <div className="art">
                  <Art seed={v.id} hue={v.hue} kind={v.type} />
                  {v.featured && <span className="badge pill ok" style={{ background: "rgba(15,11,23,.7)" }}><Icon name="BadgeCheck" size={13} /> تجهيز متكامل</span>}
                  <button className={"fav" + (state.favorites.includes(v.id) ? " on" : "")} aria-label="أضف للمفضلة" onClick={(e) => { e.preventDefault(); dispatch({ type: "toggleFav", id: v.id }); }}>
                    <Icon name="Heart" size={17} fill={state.favorites.includes(v.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="body">
                  <div className="row"><h3>{v.name}</h3><Stars value={v.rating} count={v.reviews} /></div>
                  <div className="meta">
                    <span><Icon name="MapPin" size={13} /> {v.city}</span>
                    {v.type === "hall" ? <span><Icon name="Users" size={13} /> حتى {fmt(v.capacity)}</span> : <span><Icon name="Layers" size={13} /> {(v.cats || [v.cat]).length} خدمات</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{v.tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}</div>
                  <div className="row" style={{ marginTop: "auto", paddingTop: 6 }}>
                    <span className="price num"><small>{priceLabel(v)} </small>{sar(v.price)}</span>
                    <span className="gold" style={{ fontSize: 13 }}>التفاصيل <Icon name="ArrowLeft" size={13} /></span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        ) : (
          <div className="empty"><Icon name="SearchX" size={36} /><p style={{ marginTop: 10 }}>ما لقينا نتائج بهذي الفلاتر. جرّب مدينة ثانية أو امسح البحث.</p></div>
        )}
      </div>
      <Footer />
    </>
  );
}

// أيام محجوزة شبه ثابتة لكل مزود + الأيام المؤكدة من الطلبات
function busyDays(vendorId, requests) {
  let h = 0; for (const c of vendorId) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  const set = new Set();
  const now = new Date();
  for (let i = 0; i < 90; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    if (h % 100 < 22) { const d = new Date(now); d.setDate(now.getDate() + i); set.add(d.toISOString().slice(0, 10)); }
  }
  requests.filter((r) => r.vendorId === vendorId && r.status === "confirmed").forEach((r) => set.add(r.date));
  return set;
}

export function MiniCal({ busy, value, onPick }) {
  const [offset, setOffset] = useState(0);
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + offset);
  const y = base.getFullYear(), m = base.getMonth();
  const first = new Date(y, m, 1).getDay(); // الأحد = 0
  const days = new Date(y, m + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const monthName = base.toLocaleDateString("ar-SA-u-ca-gregory", { month: "long", year: "numeric" });
  return (
    <div>
      <div className="card-head" style={{ marginBottom: 8 }}>
        <button className="icon-btn" onClick={() => setOffset((o) => Math.max(0, o - 1))} aria-label="الشهر السابق" disabled={offset === 0}><Icon name="ChevronRight" size={16} /></button>
        <b style={{ fontSize: 14 }}>{monthName}</b>
        <button className="icon-btn" onClick={() => setOffset((o) => Math.min(5, o + 1))} aria-label="الشهر التالي"><Icon name="ChevronLeft" size={16} /></button>
      </div>
      <div className="cal">
        {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((d) => <div key={d} className="h">{d}</div>)}
        {Array.from({ length: first }, (_, i) => <div key={"b" + i} />)}
        {Array.from({ length: days }, (_, i) => {
          const iso = new Date(Date.UTC(y, m, i + 1)).toISOString().slice(0, 10);
          const past = iso < today, isBusy = busy.has(iso);
          const cls = ["d", past ? "past" : isBusy ? "busy" : "free", value === iso ? "sel" : "", iso === today ? "today" : ""].join(" ");
          return <button key={iso} className={cls + " num"} disabled={past || isBusy} onClick={() => onPick(iso)} aria-label={iso + (isBusy ? " محجوز" : "")}>{i + 1}</button>;
        })}
      </div>
      <div className="split-legend" style={{ justifyContent: "flex-start", gap: 16 }}><span><span className="gold">■</span> اختيارك</span><span style={{ textDecoration: "line-through" }}>محجوز</span></div>
    </div>
  );
}

export function VenueDetail({ id }) {
  const v = useVendor(id);
  const { state, dispatch } = useStore();
  const toast = useToast();
  const busy = useMemo(() => busyDays(id, state.requests), [id, state.requests]);
  const [date, setDate] = useState(state.event?.date && !busy.has(state.event.date) ? state.event.date : "");
  const [pkg, setPkg] = useState(v?.packages?.[1]?.id || v?.packages?.[0]?.id || null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: state.user?.name || "", phone: state.user?.phone || "", guests: state.event?.guests || 300, type: state.event?.type || "wedding", note: "" });

  if (!v) return <div className="wrap empty">لم نجد هذا المزود. <a className="gold" href="#explore">ارجع للسوق</a></div>;
  const chosen = v.packages?.find((p) => p.id === pkg);
  const price = chosen ? chosen.price : v.price;
  const mine = state.requests.filter((r) => r.vendorId === v.id && !r.seed);

  const submit = (e) => {
    e.preventDefault();
    dispatch({ type: "request", req: { vendorId: v.id, clientName: form.name, phone: form.phone, type: form.type, city: state.event?.city || v.city, date, guests: +form.guests, note: [chosen ? `الباقة: ${chosen.name}` : "", form.note].filter(Boolean).join(" — "), packageId: pkg, estimate: price, mine: true } });
    setOpen(false);
    toast("وصل طلبك للمزود. بتوصلك الإشعارات في لوحة مناسبتك");
  };

  const reviews = [
    ["أم سلطان", 5, "التنظيم كان ممتاز والفريق وصل قبل الموعد بساعتين. الكوشة طلعت أحلى من التصميم."],
    ["عبدالعزيز م.", 5, "تعامل راقي والأسعار واضحة من البداية بدون مفاجآت."],
    ["ريم", 4, "كل شيء جميل، بس نتمنى خيارات أكثر للإضاءة الملونة."],
  ];

  return (
    <>
      <div className="wrap" style={{ paddingTop: 20 }}>
        <a href="#explore" className="muted" style={{ fontSize: 14, display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 14 }}><Icon name="ArrowRight" size={15} /> رجوع للسوق</a>
        <motion.div className="detail-hero" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .6 }}>
          <Art seed={v.id + "hero"} hue={v.hue} kind={v.type} />
          <div className="over">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>{v.tags.map((t) => <span key={t} className="tag" style={{ background: "rgba(15,11,23,.6)" }}>{t}</span>)}</div>
              <h1>{v.name}</h1>
              <div className="muted" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
                <span><Icon name="MapPin" size={14} /> {v.city} · {v.area}</span>
                <Stars value={v.rating} count={v.reviews} />
              </div>
            </div>
            <button className={"btn" + (state.favorites.includes(v.id) ? " gold" : "")} onClick={() => dispatch({ type: "toggleFav", id: v.id })}><Icon name="Heart" size={16} /> {state.favorites.includes(v.id) ? "في المفضلة" : "أضف للمفضلة"}</button>
          </div>
        </motion.div>

        <div className="detail-grid">
          <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
            <div className="card">
              <h3 style={{ marginBottom: 10 }}>عن {v.type === "hall" ? "القاعة" : "المزود"}</h3>
              <p className="muted">{v.about}</p>
              {v.type === "hall" && (
                <div className="kpis" style={{ marginTop: 16 }}>
                  <div className="kpi"><small>السعة الكاملة</small><b className="num">{fmt(v.capacity)}</b></div>
                  <div className="kpi"><small>قسم الرجال</small><b className="num gold">{fmt(v.menCap)}</b></div>
                  <div className="kpi"><small>قسم النساء</small><b className="num rose">{fmt(v.womenCap)}</b></div>
                  <div className="kpi"><small>السعر للحفل</small><b className="num">{fmt(v.price)}</b></div>
                </div>
              )}
              {v.cats && v.cats.length > 1 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                  {v.cats.map((c) => { const cc = CATEGORIES.find((x) => x.id === c); return <span key={c} className="chip" style={{ cursor: "default" }}><Icon name={cc.icon} size={14} /> {cc.name}</span>; })}
                </div>
              )}
            </div>

            {v.packages && (
              <div className="card">
                <div className="card-head"><h3>الباقات</h3><span className="faint" style={{ fontSize: 13 }}>اختر باقة لطلب عرض السعر</span></div>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                  {v.packages.map((p) => (
                    <button key={p.id} className={"pkg" + (pkg === p.id ? " on" : "")} onClick={() => setPkg(p.id)}>
                      <div className="row" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{p.name}</b>{pkg === p.id && <Icon name="CheckCircle2" size={18} className="gold" />}</div>
                      <b className="gold num" style={{ fontSize: 20 }}>{sar(p.price)}</b>
                      <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-head"><h3>آراء العملاء</h3><Stars value={v.rating} count={v.reviews} /></div>
              <p className="faint" style={{ fontSize: 12 }}>أمثلة توضيحية</p>
              {reviews.map(([n, r, t]) => (
                <div key={n} className="review">
                  <div style={{ display: "flex", justifyContent: "space-between" }}><b style={{ fontSize: 14 }}>{n}</b><span className="gold">{"★".repeat(r)}<span className="faint">{"★".repeat(5 - r)}</span></span></div>
                  <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="book-box">
            <div className="card" style={{ display: "grid", gap: 16, borderColor: "var(--line)" }}>
              <div><small className="muted">{chosen ? chosen.name : priceLabel(v)}</small><div className="num" style={{ fontSize: 30, fontWeight: 700 }}>{sar(price)}</div></div>
              <MiniCal busy={busy} value={date} onPick={setDate} />
              <button className="btn gold lg" disabled={!date} onClick={() => setOpen(true)}>{date ? `اطلب الحجز ليوم ${date}` : "اختر تاريخاً من التقويم"}</button>
              <div className="faint" style={{ fontSize: 12, display: "flex", gap: 6 }}><Icon name="ShieldCheck" size={14} /> لا يُخصم أي مبلغ قبل موافقتك على عرض السعر.</div>
              {mine.length > 0 && (
                <div style={{ display: "grid", gap: 8 }}>
                  <b style={{ fontSize: 13 }}>طلباتك مع هذا المزود</b>
                  {mine.map((r) => <div key={r.id} className="mini-row"><div className="who"><small className="num">{r.date} · {fmt(r.guests)} ضيف</small></div><StatusPill s={r.status} /></div>)}
                  <a className="btn sm" href="#my" onClick={() => sessionStorage.setItem("farha.tab", "bookings")}>تابع في لوحتي</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`طلب حجز: ${v.name}`}>
        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <div className="mini-row"><Icon name="CalendarDays" className="gold" /><div className="who"><b className="num">{date}</b><small>{chosen ? `${chosen.name} · ${sar(chosen.price)}` : sar(v.price)}</small></div></div>
          <div className="form-grid">
            <div className="field"><label htmlFor="b-name">الاسم</label><input id="b-name" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="b-phone">الجوال</label><input id="b-phone" className="input num" inputMode="tel" required pattern="05\d{8}" title="رقم يبدأ بـ 05 ومكون من 10 أرقام" placeholder="05xxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })} /></div>
            <div className="field"><label htmlFor="b-type">المناسبة</label><select id="b-type" className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{OCCASIONS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
            <div className="field"><label htmlFor="b-g">عدد الضيوف</label><input id="b-g" type="number" min="10" className="input num" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} /></div>
            <div className="field full"><label htmlFor="b-note">ملاحظات للمزود</label><textarea id="b-note" rows="3" className="input" placeholder="مثال: نحتاج بث مباشر لقسم النساء" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          <button className="btn gold" type="submit">أرسل الطلب</button>
        </form>
      </Modal>
      <Footer />
    </>
  );
}

export function StatusPill({ s }) {
  const map = { new: ["wait", "بانتظار الرد"], quoted: ["info", "وصل عرض سعر"], accepted: ["ok", "تم القبول"], confirmed: ["ok", "مؤكد"], declined: ["no", "معتذر"] };
  const [c, l] = map[s] || ["neutral", s];
  return <span className={"pill " + c}>{l}</span>;
}
