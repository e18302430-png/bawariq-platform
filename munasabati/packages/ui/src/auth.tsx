import { useState } from "react";
import { Icon } from "./icons";
import { normPhone, validPhone } from "@munasabati/core";
import { repo } from "./data";

/** دخول برقم الجوال ورمز SMS (يعمل في وضع قاعدة البيانات الحقيقية) */
export function PhoneAuth({ onDone, title = "سجّل دخولك برقم جوالك", initialPhone = "", initialName = "", initialMode = "signup" }: { onDone: () => void; title?: string; initialPhone?: string; initialName?: string; initialMode?: "signup" | "login" }) {
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const auth = repo.auth;
  if (!auth) return <p className="muted" style={{ textAlign: "center" }}>لحظة، جاري الاتصال…</p>;
  if (auth.mode === "quick") return <QuickAuth onDone={onDone} title={title} initialPhone={initialPhone} initialName={initialName} initialMode={initialMode} />;
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

/** حساب بالجوال وكلمة مرور: يدخل به صاحبه من أي جهاز. نسيان كلمة المرور يُحل عبر الإدارة */
function QuickAuth({ onDone, title, initialPhone, initialName, initialMode }: { onDone: () => void; title: string; initialPhone: string; initialName: string; initialMode: "signup" | "login" }) {
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [phone, setPhone] = useState(initialPhone);
  const [name, setName] = useState(initialName);
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [forgot, setForgot] = useState(false);
  const auth = repo.auth!;
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validPhone(phone)) { setErr("اكتب رقم جوال سعودي مثل 05xxxxxxxx"); return; }
    if (pass.length < 6) { setErr("كلمة المرور لازم تكون ٦ أحرف أو أكثر."); return; }
    setBusy(true); setErr("");
    try {
      if (mode === "signup") await auth.signUpPhone(normPhone(phone), pass, name.trim() || undefined);
      else await auth.signInPhone(normPhone(phone), pass);
      onDone();
    } catch (x) { const m = (x as Error).message; setErr(m); if (m.includes("مسجّل من قبل")) setMode("login"); } finally { setBusy(false); }
  };
  const support = repo.get().supportPhone;
  const waMsg = encodeURIComponent(`السلام عليكم، نسيت كلمة المرور في مناسبتي. رقمي المسجّل: ${normPhone(phone) || "05"}`);
  return (
    <form className="form" onSubmit={go} noValidate>
      <b className="display" style={{ fontSize: 18 }}>{title}</b>
      <div className="seg-auth" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "on" : ""} onClick={() => { setMode("signup"); setErr(""); }}>حساب جديد</button>
        <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setErr(""); }}>عندي حساب</button>
      </div>
      {mode === "signup" && <div className="field"><label htmlFor="qa-n">الاسم</label><input id="qa-n" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>}
      <div className="field"><label htmlFor="qa-p">رقم الجوال</label><input id="qa-p" dir="ltr" style={{ textAlign: "right" }} className="input num" inputMode="tel" autoComplete="username" placeholder="05xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div className="field"><label htmlFor="qa-w">{mode === "signup" ? "اختر كلمة مرور (٦ أحرف أو أكثر)" : "كلمة المرور"}</label><input id="qa-w" dir="ltr" type="password" className="input" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={pass} onChange={(e) => setPass(e.target.value)} /></div>
      {err && <div className="card flat tight" style={{ background: "var(--bad-soft)", color: "var(--bad)", borderColor: "transparent", fontSize: 13.5 }}>{err}</div>}
      <button className="btn primary lg block" type="submit" disabled={busy}>{busy ? "لحظة…" : mode === "signup" ? "إنشاء الحساب" : "دخول"}</button>
      {mode === "login" && (!forgot
        ? <button type="button" className="btn ghost sm" onClick={() => setForgot(true)}>نسيت كلمة المرور؟</button>
        : <div className="card flat tight" style={{ background: "var(--surface-2)", fontSize: 13.5, display: "grid", gap: 8 }}>
            <span>تواصل مع إدارة مناسبتي، ويعيّنون لك كلمة مرور جديدة خلال دقائق.</span>
            {support ? <a className="btn sm" style={{ background: "#25d366", color: "#fff", borderColor: "transparent" }} href={`https://wa.me/966${support.replace(/^0/, "").replace(/^966/, "")}?text=${waMsg}`} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={15} /> راسل الإدارة على واتساب</a>
              : <span className="muted">رقم الإدارة يُضاف قريباً.</span>}
          </div>)}
      <span className="faint" style={{ fontSize: 12.5, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}><Icon name="Lock" size={13} /> نستخدم رقمك للتواصل بخصوص حجوزاتك فقط. <a href="../privacy.html" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>الخصوصية والشروط</a></span>
    </form>
  );
}

/** دخول الإدارة بالبريد وكلمة المرور (في وضع قاعدة البيانات) */
export function AdminLogin({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sentReset, setSentReset] = useState(false);
  const auth = repo.auth;
  if (!auth) return <p className="muted" style={{ textAlign: "center" }}>لحظة، جاري الاتصال…</p>;
  if (auth.needsNewPassword()) return <NewPassword onDone={onDone} />;
  const forgot = async () => {
    if (!email.includes("@")) { setErr("اكتب بريدك أولاً، ثم اضغط «نسيت كلمة المرور»."); return; }
    setBusy(true); setErr("");
    try { await auth.resetPassword(email, location.href.split("#")[0]); setSentReset(true); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
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
      {sentReset ? <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>أرسلنا رابط تعيين كلمة المرور إلى بريدك. افتحه من نفس الجهاز.</p>
        : <button type="button" className="btn ghost sm" onClick={() => void forgot()}>نسيت كلمة المرور؟</button>}
    </form>
  );
}

/** بعد فتح رابط الاستعادة من البريد: تعيين كلمة مرور جديدة */
function NewPassword({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <form className="form" onSubmit={async (e) => {
      e.preventDefault();
      if (pw.length < 8) { setErr("كلمة المرور لازم تكون ٨ أحرف أو أكثر."); return; }
      setBusy(true); setErr("");
      try { await repo.auth!.updatePassword(pw); onDone(); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
    }}>
      <b className="display" style={{ fontSize: 18 }}>اختر كلمة مرور جديدة</b>
      <div className="field"><label htmlFor="np-p">كلمة المرور الجديدة</label><input id="np-p" className="input" dir="ltr" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></div>
      {err && <div className="card flat tight" style={{ background: "var(--bad-soft)", color: "var(--bad)", borderColor: "transparent", fontSize: 13.5 }}>{err}</div>}
      <button className="btn primary lg block" type="submit" disabled={busy}>{busy ? "لحظة…" : "حفظ والدخول"}</button>
    </form>
  );
}
