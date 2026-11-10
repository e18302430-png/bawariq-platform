import { useEffect, useMemo, useState } from "react";
import { today, type Lead, type LeadOccasion, type LeadStatus } from "@munasabati/core";
import { Empty, Icon, isCloud, repo, useToast } from "@munasabati/ui";

/*
  رادار العملاء: وكيل بحث يمسح المصادر العامة كل صباح ويجيب فرص حقيقية
  (ناس تسأل عن قاعة أو منسقة، شركات تعلن حفلات، موردين جدد للضم).
  الإدارة تشوف الفرص هنا مرتبة بالحرارة، وترد من المصدر نفسه.
*/

export const OCC: Record<LeadOccasion, { label: string; icon: string }> = {
  wedding: { label: "زواج", icon: "Heart" },
  milka: { label: "ملكة", icon: "Gem" },
  grad: { label: "تخرج", icon: "GraduationCap" },
  aqiqa: { label: "عقيقة", icon: "Baby" },
  birthday: { label: "عيد ميلاد", icon: "Cake" },
  family: { label: "عزيمة", icon: "Users" },
  corp: { label: "شركات", icon: "Briefcase" },
  other: { label: "أخرى", icon: "Sparkles" },
};
const KIND: Record<Lead["kind"], { label: string; cls: string }> = {
  person: { label: "عميل يدوّر", cls: "ok" },
  business: { label: "جهة / شركة", cls: "info" },
  vendor: { label: "مورد للضم", cls: "warn" },
  venue: { label: "قاعة / فندق للضم", cls: "warn" },
  signal: { label: "مؤشر طلب", cls: "neutral" },
};
type SecId = "clients" | "venues" | "vendors" | "orgs";
const SECTIONS: { id: SecId; label: string; icon: string; hint: string; kinds: Lead["kind"][] }[] = [
  { id: "clients", label: "العملاء", icon: "UserCheck", hint: "أهم قسم: عملاء طلبوا عرض من مساعد المنصة، وناس تسأل عن مناسبة في الإنترنت", kinds: ["person"] },
  { id: "venues", label: "القاعات والفنادق", icon: "Building2", hint: "قاعات واستراحات وفنادق تسوي زواجات في الشرقية، نضمها للمنصة", kinds: ["venue"] },
  { id: "vendors", label: "الموردين", icon: "Store", hint: "منسقين، كوش، تصوير، ضيافة… نضمهم كموردين", kinds: ["vendor"] },
  { id: "orgs", label: "الشركات والجهات", icon: "Briefcase", hint: "حفلات شركات وفعاليات قادمة ومؤشرات طلب", kinds: ["business", "signal"] },
];
const CITY_LIST = ["الدمام", "الخبر", "الظهران", "القطيف", "الجبيل", "الأحساء"];
const STATUS: { id: LeadStatus | "all"; label: string }[] = [
  { id: "new", label: "جديدة" }, { id: "contacted", label: "تواصلت" }, { id: "won", label: "صارت عميل" }, { id: "skip", label: "مو مناسبة" }, { id: "all", label: "الكل" },
];

const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 6e4));
  if (m < 60) return m <= 1 ? "الحين" : `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.round(h / 24);
  return d === 1 ? "أمس" : `قبل ${d} أيام`;
};
const daysOld = (d?: string | null) => (d ? Math.round((new Date(today()).getTime() - new Date(d).getTime()) / 864e5) : null);
const wa = (phone: string, text?: string | null) => `https://wa.me/966${phone.replace(/^0/, "")}${text ? "?text=" + encodeURIComponent(text) : ""}`;
const heat = (s: number) => (s >= 80 ? "hot" : s >= 60 ? "warm" : "cool");

const SAMPLE: Lead[] = [
  { id: "s1", url: "https://example.com/1", foundAt: new Date(Date.now() - 2 * 36e5).toISOString(), postedAt: today(), occasion: "wedding", city: "الخبر", kind: "person", title: "تسأل عن قاعة نسائية تكفي ٣٠٠ في الخبر لشهر ٢", summary: "منشور عام: تبي قاعة وكوشة وتسأل عن الأسعار.", source: "منتدى", score: 88, reply: "هلا والله! نقدر نرتب لك القاعة والكوشة بعرض واحد واضح. اطلبي عرضك مجاناً من مناسبتي 🤍", status: "new" },
  { id: "s2", url: "https://example.com/2", foundAt: new Date(Date.now() - 5 * 36e5).toISOString(), postedAt: today(), occasion: "corp", city: "الظهران", kind: "business", title: "شركة تعلن حفل تكريم موظفين نهاية الشهر", summary: "إعلان عام عن حفل سنوي، فرصة عرض تنظيم متكامل.", source: "أخبار", score: 74, reply: "السلام عليكم، مناسبتي تنظم حفلات الشركات في الشرقية بعرض واحد ومنسق متابع. يسعدنا نرسل لكم عرض.", status: "new" },
  { id: "s3", url: "https://example.com/3", foundAt: new Date(Date.now() - 26 * 36e5).toISOString(), postedAt: null, occasion: "other", city: "الدمام", kind: "vendor", title: "قاعة جديدة افتتحت في الدمام", summary: "فرصة ضم القاعة للمنصة.", source: "خرائط", score: 61, reply: "مبروك الافتتاح! نحب نضم قاعتكم لمناسبتي: طلبات جاهزة بدون اشتراك.", status: "new" },
];

export function Radar() {
  const toast = useToast();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [occ, setOcc] = useState<LeadOccasion | "all">("all");
  const [st, setSt] = useState<LeadStatus | "all">("new");
  const [sort, setSort] = useState<"heat" | "new">("heat");
  const [sec, setSec] = useState<SecId>("clients");
  const [city, setCity] = useState<string>("all");

  const load = async () => {
    setErr(null);
    if (!isCloud || !repo.radar) { setLeads(SAMPLE); return; }
    try { setLeads(await repo.radar.list()); } catch (e) { setErr((e as Error).message); setLeads([]); }
  };
  useEffect(() => { void load(); }, []);

  const all = leads ?? [];
  const fresh = all.filter((l) => Date.now() - new Date(l.foundAt).getTime() < 864e5).length;
  const hot = all.filter((l) => l.status === "new" && l.score >= 80).length;
  const won = all.filter((l) => l.status === "won").length;
  const last = all.reduce<string | null>((m, l) => (!m || l.foundAt > m ? l.foundAt : m), null);

  const S = SECTIONS.find((x) => x.id === sec)!;
  const inSec = (l: Lead, x = S) => x.kinds.includes(l.kind);
  const secNew = (x: (typeof SECTIONS)[number]) => all.filter((l) => inSec(l, x) && l.status === "new").length;
  const pool = all.filter((l) => inSec(l) && (st === "all" || l.status === st));
  const shown = useMemo(() => pool
    .filter((l) => (occ === "all" || l.occasion === occ) && (city === "all" || (l.city ?? "").includes(city)))
    .sort((a, b) => (Number(!!b.phone) - Number(!!a.phone)) || (sort === "heat" ? b.score - a.score : 0) || b.foundAt.localeCompare(a.foundAt)), [pool, occ, city, sort]);
  const occCount = (o: LeadOccasion) => pool.filter((l) => l.occasion === o).length;
  const cityCount = (c: string) => pool.filter((l) => (l.city ?? "").includes(c)).length;
  const ready = shown.filter((l) => l.phone), rest = shown.filter((l) => !l.phone);
  const goSec = (x: SecId) => { setSec(x); setOcc("all"); setCity("all"); };

  const setStatus = async (l: Lead, status: LeadStatus) => {
    setLeads((cur) => (cur ?? []).map((x) => (x.id === l.id ? { ...x, status } : x)));
    if (isCloud && repo.radar && !(await repo.radar.update(l.id, { status }))) { toast("ما انحفظ، جرّب مرة ثانية"); void load(); return; }
    toast(status === "won" ? "مبروك! صارت عميل 🎉" : status === "contacted" ? "تمام، انحطت في «تواصلت»" : "انشالت من الجديدة");
  };
  const copy = async (t?: string | null) => {
    if (!t) return;
    try { await navigator.clipboard.writeText(t); toast("انسخ الرد، الصقه في المصدر"); } catch { toast("ما قدرت أنسخ، انسخه يدوي"); }
  };

  return (
    <>
      <div className="radar-hero">
        <div className="radar-scope" aria-hidden="true"><span className="sweep" /><i style={{ top: "28%", left: "62%" }} /><i style={{ top: "60%", left: "30%" }} /><i style={{ top: "40%", left: "44%" }} /></div>
        <div className="radar-head">
          <span className="eyebrow"><span className="live-dot-c" /> الوكيل شغّال</span>
          <h1 className="page-title">رادار العملاء</h1>
          <p className="page-sub">الوكيل يمسح المصادر العامة في الشرقية كل ٣ ساعات على مدار اليوم، ومساعد المنصة يجيب طلبات العملاء مباشرة. كل شي مرتب في ٤ أقسام بالأسفل.</p>
          <div className="radar-stats">
            <div><b className="num">{fresh}</b><small>فرص آخر ٢٤ ساعة</small></div>
            <div className="hot"><b className="num">{hot}</b><small>ساخنة تنتظرك</small></div>
            <div><b className="num">{won}</b><small>صارت عملاء</small></div>
            <div><b>{last ? ago(last) : "—"}</b><small>آخر مسح</small></div>
          </div>
        </div>
      </div>

      {!isCloud && <p className="radar-demo"><Icon name="Info" size={15} /> وضع التجربة: هذي أمثلة توضيحية. في المنصة الحقيقية تظهر الفرص اللي جابها الوكيل.</p>}
      {err && <p className="radar-demo bad"><Icon name="TriangleAlert" size={15} /> ما قدرت أحمّل الفرص: {err}</p>}

      <div className="radar-secs" role="tablist" aria-label="أقسام الرادار">{SECTIONS.map((x) => (
        <button key={x.id} role="tab" aria-selected={sec === x.id} className={"radar-sec " + x.id + (sec === x.id ? " on" : "")} onClick={() => goSec(x.id)}>
          <span className="rs-ic"><Icon name={x.icon} size={20} /></span>
          <span className="rs-t"><b>{x.label}</b><small>{secNew(x)} جديدة</small></span>
          {x.id === "clients" && <span className="rs-star">الأهم</span>}
        </button>
      ))}</div>
      <p className="radar-hint"><Icon name={S.icon} size={15} /> {S.hint}</p>

      <div className="radar-bar">
        <div className="seg" role="tablist" aria-label="الحالة">{STATUS.map((s) => <button key={s.id} role="tab" aria-selected={st === s.id} className={st === s.id ? "on" : ""} onClick={() => setSt(s.id)}>{s.label}</button>)}</div>
        <div className="seg" aria-label="الترتيب"><button className={sort === "heat" ? "on" : ""} onClick={() => setSort("heat")}><Icon name="Zap" size={13} /> الأسخن</button><button className={sort === "new" ? "on" : ""} onClick={() => setSort("new")}><Icon name="Clock" size={13} /> الأحدث</button></div>
        <button className="btn sm ghost" onClick={() => void load()}><Icon name="RefreshCw" size={14} /> تحديث</button>
      </div>
      {sec === "clients" || sec === "orgs" ? <div className="chips">
        <button className={"chip" + (occ === "all" ? " on" : "")} onClick={() => setOcc("all")}>كل المناسبات</button>
        {(Object.keys(OCC) as LeadOccasion[]).filter((o) => occCount(o) > 0).map((o) => <button key={o} className={"chip" + (occ === o ? " on" : "")} onClick={() => setOcc(o)}><Icon name={OCC[o].icon} size={14} /> {OCC[o].label} <span className="num">{occCount(o)}</span></button>)}
      </div> : <div className="chips">
        <button className={"chip" + (city === "all" ? " on" : "")} onClick={() => setCity("all")}>كل المدن</button>
        {CITY_LIST.map((c) => <button key={c} className={"chip" + (city === c ? " on" : "")} onClick={() => setCity(c)}><Icon name="MapPin" size={14} /> {c} <span className="num">{cityCount(c)}</span></button>)}
      </div>}

      {leads === null ? <section className="card"><Empty icon="Loader" title="لحظة…">أجيب آخر الفرص.</Empty></section>
        : !shown.length ? <section className="card"><Empty icon="Target" title="ما فيه شي هنا للحين">{sec === "clients" ? "طلبات مساعد المنصة تظهر هنا أول بأول، والوكيل يضيف اللي يلقاه كل ٣ ساعات. جرّب «الكل»." : "الوكيل يضيف كل ٣ ساعات. جرّب «الكل» أو مدينة ثانية."}</Empty></section>
        : <>{sec === "clients" && ready.length > 0 && <h2 className="radar-group"><Icon name="Zap" size={16} /> عملاء جاهزين: طلبوا عرض بأنفسهم <span className="num">{ready.length}</span></h2>}
        {[ready, rest].map((list, gi) => list.length === 0 ? null : <div key={gi}>
        {sec === "clients" && gi === 1 && <h2 className="radar-group muted"><Icon name="Search" size={16} /> يدوّرون في الإنترنت <span className="num">{list.length}</span></h2>}
        <div className="radar-list">{list.map((l) => {
          const age = daysOld(l.postedAt);
          return <article key={l.id} className={"radar-card " + heat(l.score) + (l.status !== "new" ? " done" : "")}>
            <div className="rc-top">
              <span className="rc-occ"><Icon name={OCC[l.occasion].icon} size={16} /></span>
              <div className="rc-meta">
                {l.phone ? <span className="pill brand"><Icon name="Zap" size={12} /> عميل جاهز</span> : <span className={"pill " + KIND[l.kind].cls}>{KIND[l.kind].label}</span>}
                <span className="pill neutral"><Icon name="MapPin" size={12} /> {l.city || "الشرقية"}</span>
                {age != null && <span className={"pill " + (age <= 2 ? "ok" : "neutral")}><Icon name="CalendarDays" size={12} /> {age <= 0 ? "نُشر اليوم" : age === 1 ? "نُشر أمس" : `نُشر قبل ${age} أيام`}</span>}
              </div>
              <div className="rc-heat" title={`الحرارة ${l.score}/100`}><b className="num">{l.score}</b><span><i style={{ width: l.score + "%" }} /></span></div>
            </div>
            <h3>{l.title}</h3>
            {l.summary && <p className="rc-sum">{l.summary}</p>}
            {l.reply && <div className="rc-reply"><small>رد مقترح</small><p>{l.reply}</p></div>}
            <div className="rc-foot">
              <small className="muted">{l.phone ? <><b className="rc-phone num" dir="ltr">{l.phone}</b> · طلب بنفسه {ago(l.foundAt)}</> : <>{l.source || "مصدر عام"} · انمسك {ago(l.foundAt)}</>}</small>
              <div className="rc-act">
                {l.phone ? <>
                  <a className="btn sm brand" href={wa(l.phone, l.reply)} target="_blank" rel="noopener noreferrer"><Icon name="MessageCircle" size={14} /> واتساب</a>
                  <a className="btn sm soft" href={"tel:" + l.phone}><Icon name="Phone" size={14} /> اتصال</a>
                </> : <>
                  <a className="btn sm brand" href={l.url} target="_blank" rel="noopener noreferrer"><Icon name="Link" size={14} /> افتح المصدر</a>
                  {l.reply && <button className="btn sm soft" onClick={() => void copy(l.reply)}><Icon name="Copy" size={14} /> انسخ الرد</button>}
                </>}
                {l.status !== "contacted" && <button className="btn sm ghost" onClick={() => void setStatus(l, "contacted")}><Icon name="Send" size={14} /> تواصلت</button>}
                {l.status !== "won" && <button className="btn sm ghost" onClick={() => void setStatus(l, "won")}><Icon name="PartyPopper" size={14} /> صارت عميل</button>}
                {l.status !== "skip" && <button className="btn sm ghost" aria-label="مو مناسبة" onClick={() => void setStatus(l, "skip")}><Icon name="X" size={14} /></button>}
              </div>
            </div>
          </article>;
        })}</div></div>)}</>}
      <p className="radar-note"><Icon name="ShieldCheck" size={14} /> الوكيل يجمع منشورات عامة فقط، وما يحفظ أرقام جوالات. الأرقام اللي تشوفها هنا من عملاء طلبوا عرض بأنفسهم من مساعد المنصة ووافقوا على التواصل.</p>
    </>
  );
}
