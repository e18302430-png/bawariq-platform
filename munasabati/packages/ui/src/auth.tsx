import { useState } from "react";
import { Icon } from "./icons";
import { normPhone, validPhone } from "@munasabati/core";
import { repo } from "./data";

/** دخول برقم الجوال ورمز SMS (يعمل في وضع قاعدة البيانات الحقيقية) */
export function PhoneAuth({ onDone, title = "سجّل دخولك برقم جوالك", initialPhone = "" }: { onDone: () => void; title?: string; initialPhone?: string }) {
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const auth = repo.auth;
  if (!auth) return <p className="muted" style={{ textAlign: "center" }}>لحظة، جاري الاتصال…</p>;
  if (auth.mode === "quick") return <QuickAuth onDone={onDone} title={title} initialPhone={initialPhone} />;
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await auth.sendOtp(phone); setSent(true); } catch (x) { setErr((x as Error).message || "تعذّر إرسال الرمز. تأكد من الرقم وحاول مرة ثانية."); } finally { setBusy(false); }
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await auth.verifyOtp(phone, code); onDone(); } catch { setErr("الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزاً جديداً."); } finally { setBusy(false); }
  };
  return (
    <form className="form" onSubmit={sent ? verify : send}>
      <b className="display" style={{ fontSize: 18 }}>{sent ? "أدخل رمز التحقق" : title}</b>
      {!sent ? (
        <div className="field"><label htmlFor="pa-phone">رقم الجوال</label><input id="pa-phone" className="input num" inputMode="tel" autoComplete="tel" required pattern="05\d{8}" title="رقم يبدأ بـ 05 ومكون من 10 أرقام" placeholder="05xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} /></div>
      ) : (
        <div className="field"><label htmlFor="pa-code">الرمز المرسل إلى <span className="num">{phone}</span></label><input id="pa-code" className="input num" inputMode="numeric" autoComplete="one-time-code" required pattern="\d{6}" maxLength={6} style={{ letterSpacing: ".5em", textAlign: "center", fontSize: 22, fontWeight: 700 }} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} autoFocus /></div>
      )}
      {err && <div className="card flat tight" style={{ background: "var(--bad-soft)", color: "var(--bad)", borderColor: "transparent", fontSize: 13.5 }}>{err}</div>}
      <button className="btn primary lg block" type="submit" disabled={busy}>{busy ? "لحظة…" : sent ? "تحقق ودخول" : "أرسل رمز التحقق"}</button>
      {sent && <button type="button" className="btn ghost sm" onClick={() => { setSent(false); setCode(""); }}><Icon name="ArrowRight" size={15} /> تغيير الرقم</button>}
      <span className="faint" style={{ fontSize: 12.5, display: "flex", gap: 6, alignItems: "center" }}><Icon name="Lock" size={13} /> نستخدم رقمك للدخول والتواصل بخصوص حجوزاتك فقط.</span>
    </form>
  );
}

/** دخول فوري بالاسم والجوال (بدون رمز SMS): جلسة آمنة محفوظة على الجهاز */
function QuickAuth({ onDone, title, initialPhone }: { onDone: () => void; title: string; initialPhone: string }) {
  const [phone, setPhone] = useState(initialPhone);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ok = validPhone(phone);
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) { setErr("اكتب رقم جوال سعودي مثل 05xxxxxxxx"); return; }
    setBusy(true); setErr("");
    try { await repo.auth!.quickSignIn(normPhone(phone), name.trim() || undefined); onDone(); } catch (x) { setErr((x as Error).message || "تعذّر الدخول. حاول مرة ثانية."); } finally { setBusy(false); }
  };
  return (
    <form className="form" onSubmit={go} noValidate>
      <b className="display" style={{ fontSize: 18 }}>{title}</b>
      <div className="field"><label htmlFor="qa-n">الاسم</label><input id="qa-n" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="qa-p">رقم الجوال</label><input id="qa-p" dir="ltr" style={{ textAlign: "right" }} className="input num" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      {err && <div className="card flat tight" style={{ background: "var(--bad-soft)", color: "var(--bad)", borderColor: "transparent", fontSize: 13.5 }}>{err}</div>}
      <button className="btn primary lg block" type="submit" disabled={busy}>{busy ? "لحظة…" : "دخول"}</button>
      <span className="faint" style={{ fontSize: 12.5, display: "flex", gap: 6, alignItems: "center" }}><Icon name="Lock" size={13} /> نستخدم رقمك للتواصل بخصوص حجوزاتك فقط.</span>
    </form>
  );
}

/** دخول الإدارة بالبريد وكلمة المرور (في وضع قاعدة البيانات) */
export function AdminLogin({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const auth = repo.auth;
  if (!auth) return <p className="muted" style={{ textAlign: "center" }}>لحظة، جاري الاتصال…</p>;
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { const u = await auth.signInWithPassword(email, pass); if (repo.auth?.user()?.role !== "admin" && u.role !== "admin") { setErr("هذا الحساب ليس حساب إدارة."); await auth.signOut(); return; } onDone(); }
    catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <form className="form" onSubmit={go}>
      <div className="field"><label htmlFor="al-e">البريد</label><input id="al-e" className="input" dir="ltr" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field"><label htmlFor="al-p">كلمة المرور</label><input id="al-p" className="input" dir="ltr" type="password" autoComplete="current-password" required value={pass} onChange={(e) => setPass(e.target.value)} /></div>
      {err && <div className="card flat tight" style={{ background: "var(--bad-soft)", color: "var(--bad)", borderColor: "transparent", fontSize: 13.5 }}>{err}</div>}
      <button className="btn primary lg block" type="submit" disabled={busy}>{busy ? "لحظة…" : "دخول الإدارة"}</button>
    </form>
  );
}
