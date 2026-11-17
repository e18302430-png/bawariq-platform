/* ═══════════ صوت المنسقة: الصوت العربي المدمج في جوال الزائر ═══════════
   مجاني وبدون أي مفتاح: Web Speech API. بالآيفون صوت «ماجد» السعودي (ar-SA)، وبالأندرويد صوت قوقل العربي.
   المتصفحات تسمح بالكلام بعد أول لمسة (لمسة ختم الباب)، فنفتحه هناك. */

let picked: SpeechSynthesisVoice | null | undefined;
const synth = () => (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null);

/** نختار أفضل صوت عربي: السعودي أول، بعدين الخليجي، بعدين أي عربي */
export function arabicVoice(): Promise<SpeechSynthesisVoice | null> {
  const s = synth(); if (!s) return Promise.resolve(null);
  if (picked !== undefined) return Promise.resolve(picked);
  const choose = () => {
    const vs = s.getVoices(); if (!vs.length) return undefined;
    const rank = (v: SpeechSynthesisVoice) => (v.lang === "ar-SA" ? 0 : /^ar-(AE|KW|QA|BH|OM)/.test(v.lang) ? 1 : v.lang.startsWith("ar") ? 2 : 9) + (v.localService ? 0 : 0.5);
    const best = vs.filter((v) => v.lang.toLowerCase().startsWith("ar")).sort((a, b) => rank(a) - rank(b))[0];
    return best ?? null;
  };
  const now = choose(); if (now !== undefined) { picked = now; return Promise.resolve(now); }
  return new Promise((res) => {
    const done = () => { const v = choose(); picked = v ?? null; res(picked); };
    s.addEventListener("voiceschanged", done, { once: true });
    setTimeout(() => { if (picked === undefined) done(); }, 1500);
  });
}

/** لازم يتنادى داخل لمسة المستخدم: يفتح الكلام بالآيفون */
export function unlockSpeech() { const s = synth(); if (!s) return; try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; s.speak(u); } catch { /* */ } }

const clean = (t: string) => t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/…/g, "، ").replace(/\s+/g, " ").trim();

/** تقول الجملة، وتبلّغ عن كل كلمة تنقال، وتنتهي حتى لو المتصفح ما بلّغ */
export function speak(text: string, v: SpeechSynthesisVoice, opts: { onWord?: (i: number) => void; onEnd?: () => void } = {}) {
  const s = synth(); if (!s) { opts.onEnd?.(); return () => {}; }
  const said = clean(text), words = text.split(" ");
  let ended = false, timer = 0;
  const end = () => { if (ended) return; ended = true; clearTimeout(timer); opts.onEnd?.(); };
  const u = new SpeechSynthesisUtterance(said);
  u.voice = v; u.lang = v.lang; u.rate = 0.98; u.pitch = 1.04; u.volume = 1;
  // نحوّل موضع الحرف المنطوق لرقم الكلمة المعروضة
  const starts: number[] = []; let acc = 0; said.split(" ").forEach((w) => { starts.push(acc); acc += w.length + 1; });
  u.onboundary = (e) => { if (e.name && e.name !== "word") return; let k = 0; while (k + 1 < starts.length && starts[k + 1] <= e.charIndex) k++; opts.onWord?.(Math.min(words.length - 1, k)); };
  u.onend = end; u.onerror = end;
  timer = window.setTimeout(end, 1500 + words.length * 650); // احتياط لو ما وصل onend
  s.cancel(); s.speak(u);
  return () => { ended = true; clearTimeout(timer); s.cancel(); };
}

export const stopSpeech = () => { try { synth()?.cancel(); } catch { /* */ } };
