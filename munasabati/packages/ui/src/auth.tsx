import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./icons";
import { normPhone, validPhone } from "@munasabati/core";
import { repo } from "./data";

/** دخول برقم الجوال ورمز SMS (يعمل في وضع قاعدة البيانات الحقيقية) */
export function PhoneAuth({ onDone, title = "سجّل بجوالك وكلمة مرور، وادخل من أي جهاز", initialPhone = "", initialName = "", initialMode = "signup" }: { onDone: () => void; title?: string; initialPhone?: string; initialName?: string; initialMode?: "signup" | "login" }) {
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
  const [phone, setPhone] = useState(normPhone(initialPhone).replace(/^0/, ""));
  const [name, setName] = useState(initialName);
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [forgot, setForgot] = useState(false);
  const auth = repo.auth!;
  const full = "0" + phone.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9);
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validPhone(full)) { setErr("اكتب رقم جوال سعودي صحيح يبدأ بـ 5"); return; }
    if (pass.length < 6) { setErr("كلمة المرور لازم تكون ٦ أحرف أو أكثر."); return; }
    setBusy(true); setErr("");
    try {
      if (mode === "signup") await auth.signUpPhone(full, pass, name.trim() || undefined);
      else await auth.signInPhone(full, pass);
      onDone();
    } catch (x) { const m = (x as Error).message; setErr(m); if (m.includes("مسجّل من قبل")) setMode("login"); } finally { setBusy(false); }
  };
  const support = repo.get().supportPhone;
  const waMsg = encodeURIComponent(`السلام عليكم، نسيت كلمة المرور في مناسبتي. رقمي المسجّل: ${full}`);
  return (
    <form className="auth" onSubmit={go} noValidate>
      <div className="auth-head">
        <span className="auth-ico"><Icon name={mode === "signup" ? "UserPlus" : "Lock"} size={20} /></span>
        <div><b>{mode === "signup" ? "حساب جديد" : "أهلاً بعودتك"}</b><small>{mode === "signup" ? title : "ادخل برقم جوالك وكلمة المرور"}</small></div>
      </div>
      <div className="auth-tabs" role="tablist">
        {(["login", "signup"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? "on" : ""} onClick={() => { setMode(m); setErr(""); setForgot(false); }}>
            {mode === m && <motion.span layoutId="auth-thumb" className="auth-thumb" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span>{m === "login" ? "عندي حساب" : "حساب جديد"}</span>
          </button>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {mode === "signup" && (
          <motion.label key="n" className="auth-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <span className="sr">الاسم</span>
            <Icon name="User" size={18} />
            <input id="qa-n" autoComplete="name" placeholder="اسمك أو اسم نشاطك" value={name} onChange={(e) => setName(e.target.value)} />
          </motion.label>
        )}
      </AnimatePresence>
      <label className="auth-field phone">
        <span className="sr">رقم الجوال</span>
        <span className="auth-cc" dir="ltr">+966</span>
        <input id="qa-p" dir="ltr" inputMode="tel" autoComplete="username" placeholder="5X XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d٠-٩]/g, "").replace(/^0+/, "").slice(0, 9))} />
        <Icon name="Phone" size={18} />
      </label>
      <label className="auth-field">
        <span className="sr">كلمة المرور</span>
        <Icon name="Lock" size={18} />
        <input id="qa-w" dir="ltr" type={show ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={mode === "signup" ? "اختر كلمة مرور (٦ أحرف أو أكثر)" : "كلمة المرور"} value={pass} onChange={(e) => setPass(e.target.value)} />
        <button type="button" className="auth-eye" onClick={() => setShow(!show)} aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}><Icon name={show ? "EyeOff" : "Eye"} size={18} /></button>
      </label>
      {err && <div className="auth-err" role="alert"><Icon name="Info" size={15} /> {err}</div>}
      <button className="btn primary lg block auth-go" type="submit" disabled={busy}>{busy ? "لحظة…" : mode === "signup" ? "إنشاء الحساب" : "دخول"} {!busy && <Icon name="ArrowLeft" size={18} />}</button>
      {mode === "login" && (!forgot
        ? <button type="button" className="auth-link" onClick={() => setForgot(true)}>نسيت كلمة المرور؟</button>
        : <div className="auth-forgot">
            <span>تواصل مع إدارة مناسبتي، ويعيّنون لك كلمة مرور جديدة خلال دقائق.</span>
            {support ? <a className="btn sm auth-wa" href={`https://wa.me/966${support.replace(/^0/, "").replace(/^966/, "")}?text=${waMsg}`} target="_blank" rel="noreferrer"><Icon name="MessageCircle" size={15} /> راسل الإدارة على واتساب</a>
              : <span className="muted">رقم الإدارة يُضاف قريباً.</span>}
          </div>)}
      <span className="auth-note"><Icon name="ShieldCheck" size={13} /> رقمك للتواصل بخصوص حجوزاتك فقط · <a href="../privacy.html" target="_blank" rel="noreferrer">الخصوصية والشروط</a></span>
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

/** حساب حقيقي (بالجوال وكلمة المرور)؟ الجلسات القديمة بدون كلمة مرور لا تُحسب دخولاً */
export const hasAccount = () => { const u = repo.auth?.user(); return !!u && !u.anon; };

/** شريط «داخل برقم ...» مع تسجيل الخروج أو الدخول بحساب ثاني */
export function SignedInBar() {
  const u = repo.auth?.user();
  if (!u) return null;
  return (
    <div className="signed-bar">
      <Icon name="UserCheck" size={16} />
      <span className="grow">داخل برقم <b className="num" dir="ltr">{u.phone || "—"}</b></span>
      <button type="button" className="btn sm ghost" onClick={() => void repo.auth!.signOut()}>تسجيل خروج / حساب ثاني</button>
    </div>
  );
}
