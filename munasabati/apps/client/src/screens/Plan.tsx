import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { STYLES, fmt, normPhone, patchClient, requestPlan, sar, setTotalBudget, suggestPlan, updateEvent, validPhone, type Pick, type PlanLine } from "@munasabati/core";
import { Icon, Media, Sheet, StatusPill, apply, useDB, useToast } from "@munasabati/ui";
import { go } from "../nav";

/*
  خطتي المقترحة: العميل ما يبحث ولا يقارن. يختار ذوقه ويكتب ميزانيته،
  ونقترح له لكل بند أنسب قاعة أو مورد، ويرسل الطلبات كلها بضغطة واحدة مع ميزانية كل بند.
*/
export default function Plan() {
  const db = useDB();
  const toast = useToast();
  const e = db.client.event!;
  const plan = useMemo(() => suggestPlan(db), [db]);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const [skip, setSkip] = useState<Record<string, boolean>>({});
  const [budgetText, setBudgetText] = useState(e.budget ? fmt(e.budget) : "");
  const [ask, setAsk] = useState(false);
  const [who, setWho] = useState({ name: db.client.profile?.name ?? "", phone: db.client.profile?.phone ?? "" });

  const requested = (l: PlanLine) => db.bookings.find((b) => b.fromClient && b.status !== "declined" && (l.cat === "venue" ? b.kind === "venue" : b.cat === l.cat));
  const pickOf = (l: PlanLine): Pick | undefined => l.picks.length ? l.picks[(idx[l.cat] ?? 0) % l.picks.length] : undefined;
  const ready = plan.filter((l) => !requested(l) && !skip[l.cat] && pickOf(l));
  const styles = e.style ?? [];

  const send = () => {
    const name = who.name.trim() || db.client.profile?.name || "";
    if (name.length < 2 || !validPhone(who.phone)) { setAsk(true); return; }
    if (!db.client.profile?.phone || !db.client.profile?.name) apply(patchClient({ profile: { name, phone: normPhone(who.phone) } }));
    apply(requestPlan(ready.map((l) => ({ line: l, pick: pickOf(l)! })), { name, phone: normPhone(who.phone) }));
    setAsk(false);
    toast(`أرسلنا ${ready.length} طلبات، والإدارة تتابعها معك`);
    setTimeout(() => go("bookings"), 600);
  };
  const saveBudget = () => { const n = +budgetText.replace(/\D/g, "") || undefined; if (n !== e.budget) { apply(setTotalBudget(n, true)); toast(n ? "وزّعنا ميزانيتك من جديد" : "شلنا الميزانية"); } };

  return (
    <>
      <div><span className="eyebrow">على ذوقك وميزانيتك</span><h1 className="page-title">خطتك المقترحة</h1><p className="page-sub">اخترنا لك لكل بند الأنسب. غيّر أي اقتراح، وأرسل الطلبات كلها بضغطة.</p></div>

      <section className="card plan-ctl">
        <div className="field">
          <label htmlFor="pl-b">ميزانيتك الكلية</label>
          <div className="row" style={{ ["--gap" as string]: "8px" }}>
            <input id="pl-b" className="input num grow" inputMode="numeric" placeholder="اكتب ميزانيتك" value={budgetText} onChange={(ev) => setBudgetText(ev.target.value.replace(/\D/g, "") ? fmt(+ev.target.value.replace(/\D/g, "").slice(0, 9)) : "")} onBlur={saveBudget} onKeyDown={(ev) => ev.key === "Enter" && saveBudget()} />
            <span className="faint">ر.س</span>
          </div>
        </div>
        <div className="field">
          <span className="label">طابعك</span>
          <div className="chips wrap">{STYLES.map((s) => { const on = styles.includes(s.id); return <button key={s.id} className={"chip" + (on ? " on" : "")} aria-pressed={on} onClick={() => apply(updateEvent({ style: on ? styles.filter((x) => x !== s.id) : [...styles, s.id].slice(-3) }))}>{on && <Icon name="Check" size={14} />}{s.name}</button>; })}</div>
        </div>
      </section>

      <div className="plan-lines">
        {plan.map((l, i) => {
          const done = requested(l), p = pickOf(l), off = skip[l.cat];
          return (
            <motion.section key={l.cat} className={"card plan-line" + (off ? " off" : "") + (done ? " done" : "")} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <header className="pl-head">
                <span className="pl-ico"><Icon name={l.icon} size={18} /></span>
                <div className="grow"><b className="display">{l.label}</b><small className="muted num">{l.budget ? `مخصص ${sar(l.budget)}` : "بدون ميزانية محددة"}</small></div>
                {done ? <StatusPill status={done.status} /> : p && <button className="btn sm ghost" onClick={() => setSkip({ ...skip, [l.cat]: !off })}>{off ? "أضفه" : "ما أحتاجه"}</button>}
              </header>
              {done ? (
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>أرسلت طلبك. تابع الرد من <a href="#bookings">حجوزاتي</a>.</p>
              ) : p ? (
                <div className="pl-pick">
                  <div className="pl-ph"><Media photos={p.photos} seed={p.id} hue={p.hue} kind={p.kind} alt={p.name} />{p.promoted && <span className="pill pl-promo">مختار من مناسبتي</span>}</div>
                  <div className="pl-body">
                    <b className="display">{p.name}</b>
                    <div className="pl-why">{p.reasons.slice(0, 3).map((r) => <span key={r}><Icon name="Check" size={12} />{r}</span>)}</div>
                    <small className={p.over ? "pl-over" : "muted"}>{p.price ? `${sar(p.price)}${p.over ? " · أعلى من المخصص" : ""}` : "السعر عند الطلب"}</small>
                    <div className="row wrap" style={{ ["--gap" as string]: "6px", marginTop: 4 }}>
                      {l.picks.length > 1 && <button className="btn sm" onClick={() => setIdx({ ...idx, [l.cat]: (idx[l.cat] ?? 0) + 1 })}><Icon name="RefreshCw" size={14} /> اقتراح آخر</button>}
                      <button className="btn sm ghost" onClick={() => go(`${p.kind}-${p.id}`)}>التفاصيل</button>
                    </div>
                  </div>
                </div>
              ) : <p className="muted" style={{ margin: 0, fontSize: 14 }}>ما عندنا للحين مورد لهذا البند في {e.city}. بنبلغك أول ما ينضم.</p>}
            </motion.section>
          );
        })}
      </div>

      {ready.length > 0 && (
        <div className="plan-send">
          <button className="btn primary lg block" onClick={send}><Icon name="Send" size={18} /> أرسل {ready.length} {ready.length > 2 ? "طلبات" : ready.length === 2 ? "طلبين" : "طلب"} بضغطة</button>
          <small className="muted">كل طلب يوصل للتاجر مع ميزانية البند وطابعك. ما فيه أي دفع أو التزام قبل ما توافق على العرض.</small>
        </div>
      )}

      <Sheet open={ask} onClose={() => setAsk(false)} title="عشان يوصلك الرد">
        <form className="form" onSubmit={(ev) => { ev.preventDefault(); send(); }} noValidate>
          <div className="field"><label htmlFor="pl-n">اسمك</label><input id="pl-n" className="input" value={who.name} onChange={(ev) => setWho({ ...who, name: ev.target.value })} /></div>
          <div className="field"><label htmlFor="pl-p">جوالك</label><input id="pl-p" dir="ltr" style={{ textAlign: "right" }} className={"input num" + (who.phone && !validPhone(who.phone) ? " bad" : "")} inputMode="tel" placeholder="05xxxxxxxx" value={who.phone} onChange={(ev) => setWho({ ...who, phone: ev.target.value })} />{who.phone && !validPhone(who.phone) && <span className="field-err">رقم جوال سعودي مثل 05xxxxxxxx</span>}</div>
          <div className="form-submit"><button className="btn primary lg block" type="submit"><Icon name="Send" size={17} /> أرسل الطلبات</button></div>
        </form>
      </Sheet>
    </>
  );
}
