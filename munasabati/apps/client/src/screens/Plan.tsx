import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STYLES, fmt, learnPref, normPhone, patchClient, requestPlan, sar, setTotalBudget, suggestPlan, updateEvent, validPhone, type Pick, type PlanLine } from "@munasabati/core";
import { Icon, Media, Sheet, StatusPill, apply, useDB, useToast } from "@munasabati/ui";
import { go } from "../nav";

/*
  اقتراحاتي: العميل يتصفح لكل بند اقتراحات على ذوقه وميزانيته، ويختار اللي يعجبه (أو يرفض اللي ما يناسبه).
  النظام يتعلم من اختياراته ويرتب له الباقي. ما فيه أسعار ولا شي إجباري:
  الطلب يروح للإدارة، والإدارة تطلب عرض السعر الحقيقي من التاجر ويوصل للعميل.
*/
export default function Plan() {
  const db = useDB();
  const toast = useToast();
  const e = db.client.event!;
  const plan = useMemo(() => suggestPlan(db), [db]);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [budgetText, setBudgetText] = useState(e.budget ? fmt(e.budget) : "");
  const [ask, setAsk] = useState(false);
  const [who, setWho] = useState({ name: db.client.profile?.name ?? "", phone: db.client.profile?.phone ?? "" });
  const styles = e.style ?? [];

  const requested = (l: PlanLine) => db.bookings.find((b) => b.fromClient && b.status !== "declined" && (l.cat === "venue" ? b.kind === "venue" : b.cat === l.cat));
  const chosen = plan.flatMap((l) => { const p = l.picks.find((x) => x.id === picked[l.cat]); return p && !requested(l) ? [{ line: l, pick: p }] : []; });

  const choose = (l: PlanLine, p: Pick) => {
    const on = picked[l.cat] === p.id;
    setPicked((s) => { const n = { ...s }; if (on) delete n[l.cat]; else n[l.cat] = p.id; return n; });
    apply(learnPref(p.id, on ? "clear" : "like"));
  };
  const dismiss = (l: PlanLine, p: Pick) => {
    if (picked[l.cat] === p.id) setPicked((s) => { const n = { ...s }; delete n[l.cat]; return n; });
    apply(learnPref(p.id, "dismiss"));
    toast("شلناه من اقتراحاتك، ونتعلم من ذوقك");
  };
  const send = () => {
    const name = who.name.trim() || db.client.profile?.name || "";
    if (name.length < 2 || !validPhone(who.phone)) { setAsk(true); return; }
    if (!db.client.profile?.phone || !db.client.profile?.name) apply(patchClient({ profile: { name, phone: normPhone(who.phone) } }));
    apply(requestPlan(chosen, { name, phone: normPhone(who.phone) }));
    setAsk(false); setPicked({});
    toast(`وصلت ${chosen.length > 1 ? `طلباتك (${chosen.length})` : "طلبك"} للإدارة. بنطلب لك عرض السعر ويوصلك هنا`);
    setTimeout(() => go("bookings"), 700);
  };
  const saveBudget = () => { const n = +budgetText.replace(/\D/g, "") || undefined; if (n !== e.budget) { apply(setTotalBudget(n, true)); toast(n ? "رتبنا الاقتراحات على ميزانيتك" : "شلنا الميزانية"); } };

  return (
    <>
      <div><span className="eyebrow">على ذوقك وميزانيتك</span><h1 className="page-title">اقتراحاتي</h1><p className="page-sub">اختر اللي يعجبك من كل بند، أو اترك البند. كل ما اخترت أو رفضت، نفهم ذوقك أكثر.</p></div>

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

      <div className="how-strip">
        <span><b>١</b> اختر</span><Icon name="ChevronLeft" size={14} />
        <span><b>٢</b> الإدارة تطلب عرض السعر</span><Icon name="ChevronLeft" size={14} />
        <span><b>٣</b> العرض يوصلك هنا</span>
      </div>

      <div className="plan-lines">
        {plan.map((l) => {
          const done = requested(l);
          return (
            <section key={l.cat} className={"card plan-line" + (done ? " done" : "")}>
              <header className="pl-head">
                <span className="pl-ico"><Icon name={l.icon} size={18} /></span>
                <div className="grow"><b className="display">{l.label}</b><small className="muted num">{l.budget ? `ميزانيتك لهذا البند ${sar(l.budget)}` : "بدون ميزانية محددة"}</small></div>
                {done && <StatusPill status={done.status} />}
              </header>
              {done ? (
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>طلبك مسجّل. تابعه من <a href="#bookings">حجوزاتي</a>.</p>
              ) : l.picks.length ? (
                <div className="sugg-row" role="list">
                  <AnimatePresence initial={false}>
                    {l.picks.slice(0, 6).map((p) => {
                      const on = picked[l.cat] === p.id;
                      return (
                        <motion.article key={p.id} role="listitem" layout className={"sugg" + (on ? " on" : "")} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}>
                          <button className="sugg-ph" onClick={() => go(`${p.kind}-${p.id}`)} aria-label={"تفاصيل " + p.name}>
                            <Media photos={p.photos} seed={p.id} hue={p.hue} kind={p.kind} alt={p.name} />
                            {p.promoted && <span className="pill pl-promo">مختار من مناسبتي</span>}
                            {on && <span className="sugg-check"><Icon name="Check" size={16} /></span>}
                          </button>
                          <div className="sugg-body">
                            <b className="display">{p.name}</b>
                            <div className="pl-why">{p.reasons.slice(0, 3).map((r) => <span key={r}><Icon name="Check" size={12} />{r}</span>)}</div>
                            <div className="sugg-act">
                              <button className={"btn sm" + (on ? " primary" : "")} onClick={() => choose(l, p)} aria-pressed={on}>{on ? <><Icon name="CheckCircle2" size={15} /> اخترته</> : "اختر"}</button>
                              <button className="icon-btn sm" onClick={() => dismiss(l, p)} aria-label={"مو مناسب: " + p.name} title="مو مناسب"><Icon name="X" size={15} /></button>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : <p className="muted" style={{ margin: 0, fontSize: 14 }}>ما عندنا للحين اقتراحات لهذا البند في {e.city}. بنبلغك أول ما ينضم مورد.</p>}
            </section>
          );
        })}
      </div>

      <AnimatePresence>
        {chosen.length > 0 && (
          <motion.div className="plan-send" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <button className="btn primary lg block" onClick={send}><Icon name="Send" size={18} /> أرسل {chosen.length > 1 ? `${chosen.length} طلبات` : "طلبك"} للإدارة</button>
            <small className="muted">الإدارة تراجع طلبك وتطلب لك عرض السعر الحقيقي من التاجر. بدون أي دفع أو التزام.</small>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={ask} onClose={() => setAsk(false)} title="عشان يوصلك العرض">
        <form className="form" onSubmit={(ev) => { ev.preventDefault(); send(); }} noValidate>
          <div className="field"><label htmlFor="pl-n">اسمك</label><input id="pl-n" className="input" value={who.name} onChange={(ev) => setWho({ ...who, name: ev.target.value })} /></div>
          <div className="field"><label htmlFor="pl-p">جوالك</label><input id="pl-p" dir="ltr" style={{ textAlign: "right" }} className={"input num" + (who.phone && !validPhone(who.phone) ? " bad" : "")} inputMode="tel" placeholder="05xxxxxxxx" value={who.phone} onChange={(ev) => setWho({ ...who, phone: ev.target.value })} />{who.phone && !validPhone(who.phone) && <span className="field-err">رقم جوال سعودي مثل 05xxxxxxxx</span>}</div>
          <div className="form-submit"><button className="btn primary lg block" type="submit"><Icon name="Send" size={17} /> أرسل</button></div>
        </form>
      </Sheet>
    </>
  );
}
