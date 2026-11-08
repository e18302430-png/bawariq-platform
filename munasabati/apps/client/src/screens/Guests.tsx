import { useState } from "react";
import { RELATIONS, addGuest, clearSampleGuests, greetingFor, removeGuest, updateGuest, type Guest, type RSVP } from "@munasabati/core";
import { Empty, Icon, Segmented, Sheet, apply, useDB, useToast } from "@munasabati/ui";
import { waLink } from "./Invite";

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
  const [g, setG] = useState({ name: "", phone: "", section: "men" as Guest["section"], side: "groom" as Guest["side"], count: 1, relation: undefined as Guest["relation"], vip: false });
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
            <div className="t"><b>{x.vip && <Icon name="Star" size={13} style={{ color: "#c99a4c", marginInlineEnd: 4 }} />}{x.name}</b><small className="num">{x.section === "men" ? "رجال" : "نساء"} · {x.count} {x.count > 1 ? "أشخاص" : "شخص"} · {x.phone}</small></div>
            <span className={"pill " + RSVP_LABEL[x.status][0]}>{RSVP_LABEL[x.status][1]}</span>
          </button>
        ))}</div> : <Empty icon="Users" title="لا يوجد ضيوف هنا">غيّر الفلتر أو أضف ضيف جديد.</Empty>}
      </section>

      <Sheet open={adding} onClose={() => setAdding(false)} title="ضيف جديد">
        <form className="form" onSubmit={(e) => { e.preventDefault(); apply(addGuest(g)); setG({ ...g, name: "", phone: "", count: 1, relation: undefined, vip: false }); setAdding(false); toast("تمت إضافة الضيف"); }}>
          <div className="field"><label htmlFor="ng-n">الاسم</label><input id="ng-n" className="input" required value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} /></div>
          <div className="form-2">
            <div className="field"><label htmlFor="ng-p">الجوال</label><input id="ng-p" className="input num" inputMode="tel" placeholder="05xxxxxxxx" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></div>
            <div className="field"><label htmlFor="ng-c">العدد مع المرافقين</label><input id="ng-c" type="number" min={1} max={20} className="input num" value={g.count} onChange={(e) => setG({ ...g, count: +e.target.value || 1 })} /></div>
          </div>
          <div className="field"><span className="label">القسم</span><Segmented value={g.section} onChange={(v) => setG({ ...g, section: v })} options={[["men", "قسم الرجال"], ["women", "قسم النساء"]]} /></div>
          <div className="field"><span className="label">الطرف</span><Segmented value={g.side} onChange={(v) => setG({ ...g, side: v })} options={[["groom", "أهل العريس"], ["bride", "أهل العروس"]]} /></div>
          <div className="field"><label htmlFor="ng-r">صلة القرابة <span className="faint">(تغيّر عبارة الترحيب في دعوته)</span></label><select id="ng-r" className="select" value={g.relation ?? ""} onChange={(e) => setG({ ...g, relation: (e.target.value || undefined) as Guest["relation"] })}><option value="">بدون</option>{RELATIONS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select></div>
          <label className="row" style={{ ["--gap" as string]: "8px", fontSize: 14.5 }}><input type="checkbox" checked={g.vip} onChange={(e) => setG({ ...g, vip: e.target.checked })} /> ضيف كبير (ينبّهك المنسق أول ما يوصل)</label>
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
          <div className="field"><label htmlFor="eg-r">صلة القرابة</label><select id="eg-r" className="select" value={edit.relation ?? ""} onChange={(e) => { const relation = (e.target.value || undefined) as Guest["relation"]; apply(updateGuest(edit.id, { relation })); setEdit({ ...edit, relation }); }}><option value="">بدون</option>{RELATIONS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select><small className="muted">ترحيب الدعوة: «{greetingFor(edit)}»</small></div>
          <label className="row" style={{ ["--gap" as string]: "8px", fontSize: 14.5 }}><input type="checkbox" checked={!!edit.vip} onChange={(e) => { apply(updateGuest(edit.id, { vip: e.target.checked })); setEdit({ ...edit, vip: e.target.checked }); }} /> ضيف كبير</label>
          {edit.diet && <div className="card flat tight" style={{ background: "var(--surface-2)", fontSize: 14 }}><b>ملاحظة أكل:</b> {edit.diet}</div>}
          <div className="row"><span className="muted grow">رمز الدخول</span><b className="num" style={{ letterSpacing: ".25em" }}>{edit.code}</b></div>
          <div className="row">
            <a className="btn grow" href={waLink(edit)} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={16} /> إرسال واتساب</a>
            <a className="btn grow" href={"#invite-" + edit.code}><Icon name="Eye" size={16} /> صفحة الضيف</a>
          </div>
          <button className="btn ghost" style={{ color: "var(--bad)" }} onClick={() => { apply(removeGuest(edit.id)); setEdit(null); }}><Icon name="Trash2" size={16} /> حذف الضيف</button>
        </div>}
      </Sheet>
    </>
  );
}
