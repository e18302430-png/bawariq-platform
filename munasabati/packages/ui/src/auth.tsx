import { useState } from "react";
import { Icon } from "./icons";
import { repo } from "./data";

/** دخول برقم الجوال ورمز SMS (يعمل في وضع قاعدة البيانات الحقيقية) */
export function PhoneAuth({ onDone, title = "سجّل دخولك برقم جوالك", initialPhone = "" }: { onDone: () => void; title?: string; initialPhone?: string }) {
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const auth = repo.auth;
  if (!auth) return null;
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
