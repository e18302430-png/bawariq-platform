import { useState } from "react";
import { OCCASIONS, addGuest, clearSampleGuests, patchClient, removeGuest, updateEvent, updateGuest, type ClientSpace, type Guest, type RSVP } from "@munasabati/core";
import { Empty, Icon, MeshGradient, QR, Segmented, Sheet, apply, useDB, useToast } from "@munasabati/ui";

const inviteUrl = (code: string) => `${location.href.split("#")[0]}#invite-${code}`;
const RSVP_LABEL: Record<RSVP, [string, string]> = { yes: ["ok", "مؤكد"], pending: ["warn", "بانتظار الرد"], no: ["bad", "معتذر"] };

export function Guests() {
  const db = useDB();
  const toast = useToast();
  const guests = db.client.guests;
  const [status, setStatus] = useState<"all" | RSVP>("all");
  const [section, setSection] = useState<"all" | "men" | "women">("all");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [g, setG] = useState({ name: "", phone: "", section: "men" as Guest["section"], side: "groom" as Guest["side"], count: 1 });
  const [edit, setEdit] = useState<Guest | null>(null);

  const list = guests.filter((x) => (status === "all" || x.status === status) && (section === "all" || x.section === section) && (!q || x.name.includes(q) || x.phone.includes(q)));
  const count = (s: RSVP) => guests.filter((x) => x.status === s).reduce((a, b) => a + b.count, 0);
  const samples = guests.some((x) => x.sample);

  const importBulk = () => {
    const rows = bulkText.split("\n").map((l) => l.split(/[,،\t]/).map((s) => s.trim())).filter((r) => r[0]);
    rows.forEach(([name, phone = "", sec = ""]) => apply(addGuest({ name, phone: phone.replace(/\D/g, ""), section: /نساء|ن|women/.test(sec) ? "women" : "men", side: "groom", count: 1 })));
    toast(`تمت إضافة ${rows.length} ضيف`); setBulk(false); setBulkText("");
  };

  return (
    <>
      <div className="row between wrap">
        <div><h1 className="page-title">الضيوف</h1><p className="page-sub num">{guests.length} دعوة · {count("yes")} مؤكد · {count("pending")} بانتظار · {count("no")} معتذر</p></div>
        <div className="row"><button className="btn" onClick={() => setBulk(true)}><Icon name="Upload" size={16} /> استيراد</button><button className="btn primary" onClick={() => setAdding(true)}><Icon name="UserPlus" size={16} /> ضيف</button></div>
      </div>
      {samples && <div className="card flat tight row" style={{ background: "var(--warn-soft)", borderColor: "transparent" }}><Icon name="Info" size={18} style={{ color: "var(--warn)" }} /><span className="grow" style={{ fontSize: 13.5 }}>هذي الأسماء أمثلة للتجربة.</span><button className="btn sm" onClick={() => apply(clearSampleGuests)}>احذف الأمثلة</button></div>}
      <div className="search"><Icon name="Search" size={18} /><label className="sr" htmlFor="g-q">بحث</label><input id="g-q" className="input" placeholder="ابحث بالاسم أو الجوال" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="row wrap" style={{ ["--gap" as string]: "8px" }}>
        <Segmented value={status} onChange={setStatus} label="الحالة" options={[["all", "الكل"], ["yes", "مؤكد"], ["pending", "بانتظار"], ["no", "معتذر"]]} />
        <Segmented value={section} onChange={setSection} label="القسم" options={[["all", "القسمين"], ["men", "رجال"], ["women", "نساء"]]} />
      </div>
      <section className="card" style={{ paddingBlock: 6 }}>
        {list.length ? <div className="list">{list.map((x) => (
          <button key={x.id} className="list-row" style={{ border: 0, borderBottom: "1px solid var(--line)", background: "transparent", textAlign: "start", width: "100%" }} onClick={() => setEdit(x)}>
            <span className={"avatar" + (x.section === "women" ? " alt" : "")}>{x.name[0]}</span>
            <div className="t"><b>{x.name}</b><small className="num">{x.section === "men" ? "رجال" : "نساء"} · {x.count} {x.count > 1 ? "أشخاص" : "شخص"} · {x.phone}</small></div>
            <span className={"pill " + RSVP_LABEL[x.status][0]}>{RSVP_LABEL[x.status][1]}</span>
          </button>
        ))}</div> : <Empty icon="Users" title="لا يوجد ضيوف هنا">غيّر الفلتر أو أضف ضيف جديد.</Empty>}
      </section>

      <Sheet open={adding} onClose={() => setAdding(false)} title="ضيف جديد">
        <form className="form" onSubmit={(e) => { e.preventDefault(); apply(addGuest(g)); setG({ ...g, name: "", phone: "", count: 1 }); setAdding(false); toast("تمت إضافة الضيف"); }}>
          <div className="field"><label htmlFor="ng-n">الاسم</label><input id="ng-n" className="input" required value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} /></div>
          <div className="form-2">
            <div className="field"><label htmlFor="ng-p">الجوال</label><input id="ng-p" className="input num" inputMode="tel" placeholder="05xxxxxxxx" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></div>
            <div className="field"><label htmlFor="ng-c">العدد مع المرافقين</label><input id="ng-c" type="number" min={1} max={20} className="input num" value={g.count} onChange={(e) => setG({ ...g, count: +e.target.value || 1 })} /></div>
          </div>
          <div className="field"><span className="label">القسم</span><Segmented value={g.section} onChange={(v) => setG({ ...g, section: v })} options={[["men", "قسم الرجال"], ["women", "قسم النساء"]]} /></div>
          <div className="field"><span className="label">الطرف</span><Segmented value={g.side} onChange={(v) => setG({ ...g, side: v })} options={[["groom", "أهل العريس"], ["bride", "أهل العروس"]]} /></div>
          <button className="btn primary lg block" type="submit">إضافة</button>
        </form>
      </Sheet>

      <Sheet open={bulk} onClose={() => setBulk(false)} title="استيراد قائمة">
        <div className="form">
          <p className="muted" style={{ fontSize: 14 }}>الصق القائمة من Excel أو من الملاحظات، سطر لكل ضيف: <b style={{ color: "var(--ink)" }}>الاسم، الجوال، القسم</b></p>
          <label className="sr" htmlFor="bulk">القائمة</label>
          <textarea id="bulk" className="input" rows={7} placeholder={"سعد العتيبي، 0551234567، رجال\nنورة الحربي، 0509876543، نساء"} value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
          <button className="btn primary lg block" disabled={!bulkText.trim()} onClick={importBulk}>استيراد</button>
        </div>
      </Sheet>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.name ?? ""}>
        {edit && <div className="form">
          <div className="field"><span className="label">حالة الحضور</span><Segmented value={edit.status} onChange={(v) => { apply(updateGuest(edit.id, { status: v })); setEdit({ ...edit, status: v }); }} options={[["pending", "بانتظار"], ["yes", "مؤكد"], ["no", "معتذر"]]} /></div>
          <div className="row"><span className="muted grow">رمز الدخول</span><b className="num" style={{ letterSpacing: ".25em" }}>{edit.code}</b></div>
          <div className="row">
            <a className="btn grow" href={`https://wa.me/${edit.phone ? "966" + edit.phone.replace(/^0/, "") : ""}?text=${encodeURIComponent(`السلام عليكم ${edit.name}\n${db.client.invite.message}\nأكد حضورك من الرابط:\n${inviteUrl(edit.code)}`)}`} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={16} /> إرسال واتساب</a>
            <a className="btn grow" href={"#invite-" + edit.code}><Icon name="Eye" size={16} /> صفحة الضيف</a>
          </div>
          <button className="btn ghost" style={{ color: "var(--bad)" }} onClick={() => { apply(removeGuest(edit.id)); setEdit(null); }}><Icon name="Trash2" size={16} /> حذف الضيف</button>
        </div>}
      </Sheet>
    </>
  );
}

const TPL: Record<ClientSpace["invite"]["template"], { name: string; palette: [string, string, string, string] }> = {
  silk: { name: "حرير", palette: ["#FF7A4D", "#E5195E", "#7A1FA2", "#1A0A2B"] },
  henna: { name: "حنّاء", palette: ["#FFF1EC", "#FFD9CC", "#F5B8A6", "#E89A88"] },
  oasis: { name: "واحة", palette: ["#86F2CF", "#17A897", "#0E4F6E", "#06192A"] },
};

function InviteCard({ guest, live = false }: { guest?: Guest | null; live?: boolean }) {
  const db = useDB();
  const e = db.client.event!;
  const t = db.client.invite.template;
  const occ = OCCASIONS.find((o) => o.id === e.occasion)!;
  return (
    <div className={"invite-card " + t} style={live ? undefined : { background: `linear-gradient(160deg, ${TPL[t].palette.join(", ")})` }}>
      {live && <MeshGradient palette={TPL[t].palette} style={{ position: "absolute", inset: 0, zIndex: -1 }} />}
      <div className="frame" />
      <div style={{ fontSize: 12.5, opacity: 0.85 }}>بسم الله الرحمن الرحيم</div>
      <div style={{ fontSize: 13.5, opacity: 0.9, margin: "14px 0 6px", maxWidth: "26ch" }}>{db.client.invite.message}</div>
      <div className="names">{e.title || occ.name}</div>
      <div className="num" style={{ fontSize: 14, marginTop: 10 }}>{new Date(e.date).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { weekday: "long", day: "numeric", month: "long" })} · 8:30 مساءً</div>
      <div style={{ fontSize: 13, opacity: 0.85 }}>{e.city}</div>
      {guest && <><div className="qr"><QR text={"MNS-" + guest.code} /></div><div className="num" style={{ letterSpacing: ".3em", fontWeight: 700, marginTop: 8 }}>{guest.code}</div></>}
    </div>
  );
}

export function Invites() {
  const db = useDB();
  const toast = useToast();
  const [preview, setPreview] = useState<Guest | null>(null);
  const pending = db.client.guests.filter((g) => g.status === "pending");
  const copy = async (g: Guest) => { try { await navigator.clipboard.writeText(inviteUrl(g.code)); toast("تم نسخ رابط الدعوة"); } catch { toast(`رمز الدعوة: ${g.code}`); } };
  return (
    <>
      <div><h1 className="page-title">الدعوات</h1><p className="page-sub">صمّم البطاقة وأرسل لكل ضيف رابطه الخاص.</p></div>
      <div className="home-grid">
        <section className="card stack">
          <div className="field"><span className="label">التصميم</span>
            <div className="tpl-pick">{(Object.keys(TPL) as (keyof typeof TPL)[]).map((k) => <button key={k} className={db.client.invite.template === k ? "on" : ""} style={{ background: `linear-gradient(160deg, ${TPL[k].palette.join(", ")})` }} onClick={() => apply(patchClient({ invite: { ...db.client.invite, template: k } }))} aria-label={TPL[k].name} aria-pressed={db.client.invite.template === k} />)}</div>
          </div>
          <div className="field"><label htmlFor="i-t">العنوان على البطاقة</label><input id="i-t" className="input" value={db.client.event!.title} onChange={(e) => apply(updateEvent({ title: e.target.value }))} /></div>
          <div className="field"><label htmlFor="i-m">نص الدعوة</label><textarea id="i-m" className="input" value={db.client.invite.message} onChange={(e) => apply(patchClient({ invite: { ...db.client.invite, message: e.target.value } }))} /></div>
        </section>
        <InviteCard live />
      </div>
      <section className="card" style={{ paddingBlock: 6 }}>
        <div className="section-title" style={{ marginTop: 14 }}><h3>الإرسال</h3><span className="pill warn num">{pending.length} بانتظار الرد</span></div>
        <div className="list">{db.client.guests.map((g) => (
          <div key={g.id} className="list-row">
            <span className={"avatar" + (g.section === "women" ? " alt" : "")}>{g.name[0]}</span>
            <div className="t"><b>{g.name}</b><small className={"num"} style={{ color: g.status === "yes" ? "var(--ok)" : g.status === "no" ? "var(--bad)" : undefined }}>{RSVP_LABEL[g.status][1]}</small></div>
            <a className="icon-btn sm" aria-label="واتساب" href={`https://wa.me/${g.phone ? "966" + g.phone.replace(/^0/, "") : ""}?text=${encodeURIComponent(`السلام عليكم ${g.name}\n${db.client.invite.message}\n${inviteUrl(g.code)}`)}`} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={16} /></a>
            <button className="icon-btn sm" aria-label="نسخ الرابط" onClick={() => copy(g)}><Icon name="Copy" size={16} /></button>
            <button className="icon-btn sm" aria-label="معاينة" onClick={() => setPreview(g)}><Icon name="Eye" size={16} /></button>
          </div>
        ))}</div>
      </section>
      <Sheet open={!!preview} onClose={() => setPreview(null)} title={preview ? `دعوة ${preview.name}` : ""}>
        {preview && <InviteCard guest={preview} />}
      </Sheet>
    </>
  );
}

/** صفحة الدعوة كما يراها الضيف */
export function GuestInvite({ code }: { code: string }) {
  const db = useDB();
  const g = db.client.guests.find((x) => x.code === code);
  const [count, setCount] = useState(g?.count ?? 1);
  if (!g || !db.client.event) return <div className="container" style={{ paddingBlock: 60 }}><Empty icon="MailX" title="الدعوة غير موجودة">تأكد من الرابط أو تواصل مع صاحب المناسبة.</Empty></div>;
  return (
    <div className="container" style={{ paddingBlock: "28px 60px", maxWidth: 460, display: "grid", gap: 18 }}>
      <div className="muted" style={{ textAlign: "center", fontSize: 14 }}>دعوة خاصة لـ <b style={{ color: "var(--ink)" }}>{g.name}</b></div>
      <InviteCard guest={g.status === "yes" ? g : null} live />
      {g.status === "pending" ? (
        <section className="card stack">
          <b className="display" style={{ fontSize: 18 }}>بتشرفنا بحضورك؟</b>
          <div className="field"><label htmlFor="r-c">عدد الحضور مع المرافقين</label><input id="r-c" type="number" min={1} max={20} className="input num" value={count} onChange={(e) => setCount(+e.target.value || 1)} /></div>
          <div className="row"><button className="btn primary lg grow" onClick={() => apply(updateGuest(g.id, { status: "yes", count }))}>أكيد بحضر</button><button className="btn lg grow" onClick={() => apply(updateGuest(g.id, { status: "no" }))}>أعتذر</button></div>
        </section>
      ) : (
        <section className="card stack" style={{ textAlign: "center", justifyItems: "center" }}>
          <b className="display" style={{ fontSize: 18 }}>{g.status === "yes" ? "تم تأكيد حضورك 🤍" : "شكراً لردك"}</b>
          <p className="muted">{g.status === "yes" ? "اعرض رمز الدخول للحارس عند الباب." : "نتمنى نشوفك في مناسبة قادمة."}</p>
          <button className="btn sm ghost" onClick={() => apply(updateGuest(g.id, { status: "pending" }))}>تغيير الرد</button>
        </section>
      )}
      <a className="faint" style={{ textAlign: "center", fontSize: 12.5 }} href="#home">للتجربة: ارجع للوحة صاحب المناسبة</a>
    </div>
  );
}
