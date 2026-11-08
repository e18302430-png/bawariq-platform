import { useMemo, useState } from "react";
import {
  CATEGORIES, CITIES, OCCASIONS, busyDays, createBooking, fmt, hallCapacity, hallPrice, isWeekend, sar, toggleFavorite,
  venueCapacity, venueFrom, type CategoryId, type OccasionId, type Supplier, type Venue,
} from "@munasabati/core";
import { Art, Calendar, Empty, Icon, Segmented, Sheet, StatusPill, apply, useDB, useToast } from "@munasabati/ui";
import { go } from "../nav";

type Item = { kind: "venue"; v: Venue } | { kind: "supplier"; v: Supplier };

export function Explore() {
  const db = useDB();
  const e = db.client.event!;
  const [cat, setCat] = useState<"venues" | CategoryId | "all">("all");
  const [city, setCity] = useState(e.city);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"best" | "price" | "rating">("best");
  const [favOnly, setFavOnly] = useState(false);

  const items = useMemo(() => {
    const venues: Item[] = db.venues.map((v) => ({ kind: "venue", v }));
    const sups: Item[] = db.suppliers.map((v) => ({ kind: "supplier", v }));
    let list = cat === "all" ? [...venues, ...sups] : cat === "venues" ? venues : sups.filter((s) => (s.v as Supplier).cats.includes(cat));
    if (city !== "all") list = list.filter((i) => i.v.city === city || (i.kind === "supplier" && i.v.area.includes("كل مناطق")));
    if (q.trim()) list = list.filter((i) => (i.v.name + i.v.about + i.v.tags.join(" ")).includes(q.trim()));
    if (favOnly) list = list.filter((i) => db.client.favorites.includes(i.v.id));
    const price = (i: Item) => (i.kind === "venue" ? venueFrom(i.v) : i.v.priceFrom);
    const by = { best: (a: Item, b: Item) => Number(!!(b.v as Supplier).featured) - Number(!!(a.v as Supplier).featured) || b.v.rating - a.v.rating, price: (a: Item, b: Item) => price(a) - price(b), rating: (a: Item, b: Item) => b.v.rating - a.v.rating };
    return list.sort(by[sort]);
  }, [db.venues, db.suppliers, db.client.favorites, cat, city, q, sort, favOnly]);

  return (
    <>
      <div><h1 className="page-title">استكشف</h1><p className="page-sub">قاعات وموردين لمناسبتك في {e.city} وغيرها.</p></div>
      <div className="search"><Icon name="Search" size={18} /><label className="sr" htmlFor="x-q">بحث</label><input id="x-q" className="input" placeholder="ابحث: كوشة، بث مباشر، إطلالة بحرية…" value={q} onChange={(ev) => setQ(ev.target.value)} /></div>
      <div className="chips" role="group" aria-label="الفئة">
        {([["all", "الكل", "LayoutGrid"], ["venues", "قاعات", "Building2"], ...CATEGORIES.map((c) => [c.id, c.short, c.icon])] as [string, string, string][]).map(([id, l, ic]) => (
          <button key={id} className={"chip" + (cat === id ? " on" : "")} onClick={() => setCat(id as typeof cat)} aria-pressed={cat === id}><Icon name={ic} size={15} />{l}</button>
        ))}
      </div>
      <div className="row wrap" style={{ ["--gap" as string]: "8px" }}>
        <label className="sr" htmlFor="x-city">المدينة</label>
        <select id="x-city" className="select" style={{ width: "auto", minHeight: 40, borderRadius: 999, fontSize: 14 }} value={city} onChange={(ev) => setCity(ev.target.value)}>
          <option value="all">كل المدن</option>{CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <Segmented value={sort} onChange={setSort} label="الترتيب" options={[["best", "الأنسب"], ["price", "الأقل سعراً"], ["rating", "الأعلى تقييماً"]]} />
        <button className={"chip" + (favOnly ? " on" : "")} onClick={() => setFavOnly((x) => !x)}><Icon name="Heart" size={15} />المفضلة</button>
      </div>
      {items.length ? (
        <div className="grid-auto" style={{ ["--min" as string]: "270px" }}>
          {items.map((i) => <ItemCard key={i.kind + i.v.id} item={i} fav={db.client.favorites.includes(i.v.id)} guests={e.guests} />)}
        </div>
      ) : <Empty icon="SearchX" title="ما لقينا نتائج">جرّب مدينة ثانية أو امسح البحث.</Empty>}
    </>
  );
}

function ItemCard({ item, fav, guests }: { item: Item; fav: boolean; guests: number }) {
  const v = item.v;
  const tooSmall = item.kind === "venue" && venueCapacity(item.v) < guests;
  return (
    <div className="vcard" role="link" tabIndex={0} onClick={() => go(`${item.kind}-${v.id}`)} onKeyDown={(e) => e.key === "Enter" && go(`${item.kind}-${v.id}`)}>
      <div className="art">
        <Art seed={v.id} hue={v.hue} kind={item.kind} />
        <div className="over">{item.kind === "supplier" && item.v.featured && <span className="pill"><Icon name="BadgeCheck" size={13} /> تجهيز متكامل</span>}{tooSmall && <span className="pill">السعة أقل من ضيوفك</span>}</div>
        <button className={"fav" + (fav ? " on" : "")} aria-label={fav ? "إزالة من المفضلة" : "أضف للمفضلة"} aria-pressed={fav} onClick={(e) => { e.stopPropagation(); apply(toggleFavorite(v.id)); }}><Icon name="Heart" size={18} fill={fav ? "currentColor" : "none"} /></button>
      </div>
      <div className="body">
        <div className="row between"><h3>{v.name}</h3><span className="rate num"><Icon name="Star" size={13} />{v.rating} <span className="faint" style={{ fontWeight: 400 }}>({v.reviews})</span></span></div>
        <div className="m">
          <span><Icon name="MapPin" size={13} />{v.city}</span>
          {item.kind === "venue" ? <span><Icon name="Users" size={13} />حتى {fmt(venueCapacity(item.v))}</span> : <span><Icon name="Layers" size={13} />{item.v.cats.length} خدمات</span>}
        </div>
        <div className="row between" style={{ marginTop: 4 }}>
          <span className="num" style={{ fontWeight: 700, fontFamily: "var(--f-display)" }}><span className="faint" style={{ fontWeight: 400, fontSize: 12 }}>يبدأ من </span>{sar(item.kind === "venue" ? venueFrom(item.v) : item.v.priceFrom)}</span>
          <Icon name="ArrowLeft" size={17} className="faint" />
        </div>
      </div>
    </div>
  );
}

export function Detail({ kind, id }: { kind: "venue" | "supplier"; id: string }) {
  const db = useDB();
  const toast = useToast();
  const e = db.client.event!;
  const venue = kind === "venue" ? db.venues.find((v) => v.id === id) : undefined;
  const supplier = kind === "supplier" ? db.suppliers.find((v) => v.id === id) : undefined;
  const v = venue ?? supplier;
  const [hallId, setHallId] = useState(venue?.halls.find((h) => hallCapacity(h) >= e.guests)?.id ?? venue?.halls[0]?.id);
  const [pkgId, setPkgId] = useState(supplier?.packages[1]?.id ?? supplier?.packages[0]?.id);
  const busy = useMemo(() => busyDays(id, db.bookings, venue?.blocked ?? [], hallId), [id, db.bookings, venue, hallId]);
  const [date, setDate] = useState(!busy.has(e.date) ? e.date : "");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: db.client.profile?.name ?? "", phone: db.client.profile?.phone ?? "", guests: e.guests, occasion: e.occasion as OccasionId, note: "" });

  if (!v) return <Empty icon="SearchX" title="ما لقينا هذي الصفحة"><button className="btn" onClick={() => go("explore")}>رجوع</button></Empty>;
  const hall = venue?.halls.find((h) => h.id === hallId);
  const pkg = supplier?.packages.find((p) => p.id === pkgId);
  const price = hall ? hallPrice(hall, date || e.date) : pkg?.price ?? supplier?.priceFrom ?? 0;
  const fav = db.client.favorites.includes(v.id);
  const mine = db.bookings.filter((b) => b.targetId === v.id && b.fromClient);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    apply(createBooking({
      kind, targetId: v.id, hallId, packageId: pkgId, clientName: form.name, phone: form.phone, occasion: form.occasion, city: e.city, date, guests: +form.guests,
      note: [pkg ? `الباقة: ${pkg.name}` : hall ? `القاعة: ${hall.name}` : "", form.note].filter(Boolean).join(" · "), estimate: price, fromClient: true,
    }));
    setOpen(false);
    toast("وصل طلبك. بنبلغك أول ما يرد");
  };

  return (
    <>
      <div className="detail-hero">
        <Art seed={v.id + "h"} hue={v.hue} kind={kind} />
        <div className="bar-top">
          <button className="icon-btn" onClick={() => history.length > 1 ? history.back() : go("explore")} aria-label="رجوع"><Icon name="ArrowRight" size={18} /></button>
          <button className="icon-btn" onClick={() => apply(toggleFavorite(v.id))} aria-label="المفضلة" aria-pressed={fav}><Icon name="Heart" size={18} fill={fav ? "#e5195e" : "none"} color={fav ? "#e5195e" : undefined} /></button>
        </div>
      </div>
      <div className="detail-grid">
        <div className="stack" style={{ minWidth: 0 }}>
          <div>
            <div className="row wrap" style={{ ["--gap" as string]: "6px", marginBottom: 8 }}>{v.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            <h1 className="page-title">{v.name}</h1>
            <div className="row wrap muted" style={{ fontSize: 14, marginTop: 4 }}><span className="row" style={{ ["--gap" as string]: "4px" }}><Icon name="MapPin" size={15} />{v.city} · {venue ? venue.district : supplier!.area}</span><span className="rate num"><Icon name="Star" size={14} />{v.rating} <span className="faint" style={{ fontWeight: 400 }}>({v.reviews} تقييم)</span></span></div>
          </div>
          <p className="muted" style={{ fontSize: 15.5 }}>{v.about}</p>

          {venue && <section className="card">
            <div className="section-title"><h3>اختر القاعة</h3><span className="faint" style={{ fontSize: 12.5 }}>السعر يتغير في الويكند</span></div>
            <div className="stack" style={{ ["--gap" as string]: "10px" }}>
              {venue.halls.map((h) => (
                <button key={h.id} className={"hall-opt" + (hallId === h.id ? " on" : "")} onClick={() => setHallId(h.id)} aria-pressed={hallId === h.id}>
                  <span className="avatar"><Icon name="DoorOpen" size={18} /></span>
                  <span className="grow"><b className="display" style={{ display: "block" }}>{h.name}</b><small className="muted num">رجال {fmt(h.menCap)} · نساء {fmt(h.womenCap)}{hallCapacity(h) < e.guests ? " · أصغر من عدد ضيوفك" : ""}</small></span>
                  <span className="num" style={{ textAlign: "end", fontSize: 13 }}><b style={{ display: "block", fontFamily: "var(--f-display)" }}>{fmt(h.weekdayPrice)}</b><span className="faint">ويكند {fmt(h.weekendPrice)}</span></span>
                </button>
              ))}
            </div>
          </section>}

          {supplier && <section className="card">
            <div className="section-title"><h3>الخدمات والباقات</h3></div>
            <div className="chips wrap" style={{ marginBottom: 14 }}>{supplier.cats.map((c) => { const cc = CATEGORIES.find((x) => x.id === c)!; return <span key={c} className="chip" style={{ cursor: "default" }}><Icon name={cc.icon} size={15} />{cc.name}</span>; })}</div>
            <div className="grid-auto" style={{ ["--min" as string]: "220px" }}>
              {supplier.packages.map((p) => (
                <button key={p.id} className={"pkg" + (pkgId === p.id ? " on" : "")} onClick={() => setPkgId(p.id)} aria-pressed={pkgId === p.id}>
                  <div className="row between"><b className="display">{p.name}</b>{pkgId === p.id && <Icon name="CheckCircle2" size={19} />}</div>
                  <b className="num display" style={{ fontSize: 22 }}>{sar(p.price)}</b>
                  <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
                </button>
              ))}
            </div>
          </section>}
        </div>

        <aside className="card book-card stack">
          <div><div className="stat-label">{hall ? `${hall.name}${date && isWeekend(date) ? " · سعر الويكند" : ""}` : pkg?.name ?? "يبدأ من"}</div><div className="stat-value num" style={{ fontSize: 30 }}>{sar(price)}</div></div>
          <Calendar busy={busy} value={date} onPick={setDate} />
          <button className="btn primary lg block" disabled={!date} onClick={() => setOpen(true)}>{date ? `اطلب الحجز · ${date}` : "اختر يوماً متاحاً"}</button>
          <div className="row faint" style={{ fontSize: 12.5, ["--gap" as string]: "6px" }}><Icon name="ShieldCheck" size={15} /> ما يُخصم أي مبلغ قبل موافقتك على عرض السعر.</div>
          {mine.length > 0 && <div className="list">{mine.map((b) => <div key={b.id} className="list-row"><div className="t"><b className="num">{b.date}</b><small>{fmt(b.guests)} ضيف</small></div><StatusPill status={b.status} /></div>)}</div>}
        </aside>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={`طلب حجز: ${v.name}`}>
        <form className="form" onSubmit={submit}>
          <div className="card flat tight row" style={{ background: "var(--surface-2)" }}><span className="avatar"><Icon name="CalendarDays" size={18} /></span><div className="grow"><b className="num display">{date}</b><div className="muted" style={{ fontSize: 13 }}>{hall?.name ?? pkg?.name} · {sar(price)}</div></div></div>
          <div className="form-2">
            <div className="field"><label htmlFor="b-n">الاسم</label><input id="b-n" className="input" required value={form.name} onChange={(ev) => setForm({ ...form, name: ev.target.value })} /></div>
            <div className="field"><label htmlFor="b-p">الجوال</label><input id="b-p" className="input num" inputMode="tel" required pattern="05\d{8}" title="رقم يبدأ بـ 05 ومكون من 10 أرقام" placeholder="05xxxxxxxx" value={form.phone} onChange={(ev) => setForm({ ...form, phone: ev.target.value.replace(/\D/g, "").slice(0, 10) })} /></div>
            <div className="field"><label htmlFor="b-o">المناسبة</label><select id="b-o" className="select" value={form.occasion} onChange={(ev) => setForm({ ...form, occasion: ev.target.value as OccasionId })}>{OCCASIONS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
            <div className="field"><label htmlFor="b-g">عدد الضيوف</label><input id="b-g" type="number" min={10} className="input num" value={form.guests} onChange={(ev) => setForm({ ...form, guests: +ev.target.value })} /></div>
            <div className="field full"><label htmlFor="b-note">ملاحظات</label><textarea id="b-note" className="input" placeholder="مثال: نحتاج بث مباشر لقسم النساء" value={form.note} onChange={(ev) => setForm({ ...form, note: ev.target.value })} /></div>
          </div>
          <button className="btn primary lg block" type="submit">أرسل الطلب</button>
        </form>
      </Sheet>
    </>
  );
}
