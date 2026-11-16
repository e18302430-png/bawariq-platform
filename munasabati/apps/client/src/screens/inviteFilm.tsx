import { useRef, useState } from "react";
import { Icon, useToast } from "@munasabati/ui";

/* ═══════════ فيديو الدعوة: فيلم قصير (١٤ ثانية) يتصنع في الجوال نفسه ═══════════
   ظرف بختم شمع ← الختم ينكسر ← اللوحة والأسماء ← الموعد والمكان ← «تشرفنا بحضوركم».
   يتصوّر من لوحة رسم (canvas) بموسيقى مولّدة بالكود، بدون أي خادم أو تكلفة، ويتشارك على الواتساب. */

export type FilmInfo = { couple: string; line: string; day: string; num: number; month: string; hijri: string; time: string; place: string; img: string; tint: string; deep: string; ai: boolean };
const W = 720, H = 1280, DUR = 14, FPS = 30;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const back = (x: number) => { const c = 1.8; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const p = (t: number, a: number, b: number, e = eo) => e(clamp((t - a) / (b - a)));
const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; });

/** يرسم إطار واحد من الفيلم */
function draw(c: CanvasRenderingContext2D, t: number, f: FilmInfo, img: HTMLImageElement | null, sparks: { x: number; y: number; r: number; s: number }[]) {
  c.save();
  c.fillStyle = "#0b0710"; c.fillRect(0, 0, W, H);
  c.direction = "rtl"; c.textAlign = "center"; c.textBaseline = "middle";
  const open = p(t, 2.6, 3.4), reveal = p(t, 3.2, 4.4);

  // اللوحة (تتكشف بعد كسر الختم، بتقريب بطيء)
  if (img && reveal > 0) {
    const sc = 1.18 - 0.12 * p(t, 3.2, DUR, (x) => x), iw = img.width, ih = img.height, k = Math.max(W / iw, H / ih) * sc;
    c.globalAlpha = reveal; c.drawImage(img, (W - iw * k) / 2, (H - ih * k) / 2, iw * k, ih * k);
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(8,5,12,.55)"); g.addColorStop(.35, "rgba(8,5,12,.15)"); g.addColorStop(.62, "rgba(8,5,12,.35)"); g.addColorStop(1, "rgba(8,5,12,.85)");
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
  }
  // شرارات ذهبية
  sparks.forEach((s) => { const y = (s.y - t * s.s * 40 + H * 2) % H; c.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t * 2 + s.x)); c.fillStyle = "#ffd98a"; c.beginPath(); c.arc(s.x, y, s.r, 0, Math.PI * 2); c.fill(); });
  c.globalAlpha = 1;

  // الظرف والختم (قبل الكشف)
  if (open < 1) {
    const ei = p(t, 0.2, 1.1, back), ex = W / 2, ey = H / 2, ew = 560, eh = 380;
    c.globalAlpha = 1 - open; c.translate(ex, ey + (1 - ei) * 200 + open * 120); c.scale(.85 + .15 * ei, .85 + .15 * ei);
    c.fillStyle = f.tint; c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 50; c.fillRect(-ew / 2, -eh / 2, ew, eh); c.shadowBlur = 0;
    c.fillStyle = f.deep; c.beginPath(); c.moveTo(-ew / 2, eh / 2); c.lineTo(0, 10); c.lineTo(ew / 2, eh / 2); c.closePath(); c.fill();
    // الغطاء ينفتح
    const fl = open; c.save(); c.scale(1, 1 - 2 * fl); c.fillStyle = f.deep; c.beginPath(); c.moveTo(-ew / 2, -eh / 2); c.lineTo(0, 30); c.lineTo(ew / 2, -eh / 2); c.closePath(); c.fill(); c.restore();
    // الختم
    const crack = p(t, 2.2, 2.6);
    const sg = c.createRadialGradient(-20, 10, 10, 0, 30, 90); sg.addColorStop(0, "#e9c27a"); sg.addColorStop(.6, "#b8862f"); sg.addColorStop(1, "#7a5418");
    c.globalAlpha = (1 - open) * (1 - crack); c.fillStyle = sg; c.beginPath(); c.arc(0, 30, 86 * (1 + .25 * crack), 0, Math.PI * 2); c.fill();
    c.fillStyle = "#5a3a0c"; c.font = "800 64px Alexandria, 'IBM Plex Sans Arabic', sans-serif"; c.fillText(f.couple.trim()[0] ?? "♥", 0, 34);
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
    // نبض «اضغط»
    c.globalAlpha = clamp(p(t, .9, 1.4) - p(t, 2, 2.3)); c.fillStyle = "rgba(255,240,215,.9)"; c.font = "600 34px 'IBM Plex Sans Arabic', sans-serif"; c.fillText("لك دعوة خاصة 💌", W / 2, H / 2 + 300); c.globalAlpha = 1;
  }
  // ومضة كسر الختم
  const fl = t >= 2.4 && t < 3.1 ? 1 - (t - 2.4) / 0.7 : 0;
  if (fl > 0) { const rg = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 700); rg.addColorStop(0, `rgba(255,236,190,${fl})`); rg.addColorStop(1, "rgba(255,236,190,0)"); c.fillStyle = rg; c.fillRect(0, 0, W, H); }

  // النصوص
  const txt = (s: string, y: number, size: number, a: number, weight = 800, color = "#fff", font = "Alexandria") => {
    if (a <= 0) return; c.globalAlpha = a; c.fillStyle = color; c.font = `${weight} ${size}px ${font}, 'IBM Plex Sans Arabic', sans-serif`;
    c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 24; c.fillText(s, W / 2, y + (1 - a) * 30, W - 80); c.shadowBlur = 0; c.globalAlpha = 1;
  };
  const out1 = 1 - p(t, 8.6, 9.1);
  txt(f.line, 330, 36, p(t, 4.2, 4.8) * out1, 600, "#ffe7b8", "IBM Plex Sans Arabic");
  const nk = p(t, 4.8, 5.6, back);
  c.save(); c.translate(W / 2, 520); c.scale(.8 + .2 * nk, .8 + .2 * nk); c.translate(-W / 2, -520);
  const parts = f.couple.split(/\s+و\s+|\s*&\s*/);
  if (parts.length === 2) { txt(parts[0], 470, 84, nk * out1); txt("و", 560, 44, nk * out1, 600, "#ffd27a"); txt(parts[1], 650, 84, nk * out1); }
  else txt(f.couple, 540, 88, nk * out1);
  c.restore();
  // خط ذهبي
  const ln = p(t, 5.6, 6.6) * out1; if (ln > 0) { c.strokeStyle = "#ffd27a"; c.lineWidth = 3; c.globalAlpha = ln; c.beginPath(); c.moveTo(W / 2 - 160 * ln, 760); c.lineTo(W / 2 + 160 * ln, 760); c.stroke(); c.globalAlpha = 1; }

  // الموعد والمكان
  const out2 = 1 - p(t, 12, 12.4);
  const dk = p(t, 9.1, 9.8, back);
  txt(f.day, 380, 44, p(t, 9.0, 9.5) * out2, 600, "#ffe7b8", "IBM Plex Sans Arabic");
  c.save(); c.translate(W / 2, 520); c.scale(.6 + .4 * dk, .6 + .4 * dk); c.translate(-W / 2, -520); txt(String(f.num), 520, 220, dk * out2, 800); c.restore();
  txt(f.month, 680, 44, p(t, 9.6, 10.1) * out2, 700);
  txt(f.hijri, 745, 32, p(t, 9.9, 10.4) * out2, 600, "#ffe7b8", "IBM Plex Sans Arabic");
  txt(`🕗 ${f.time}`, 860, 38, p(t, 10.3, 10.8) * out2, 700, "#fff", "IBM Plex Sans Arabic");
  txt(`📍 ${f.place}`, 925, 38, p(t, 10.7, 11.2) * out2, 700, "#fff", "IBM Plex Sans Arabic");

  // الختام
  const ek = p(t, 12.3, 13, back);
  txt("تشرّفنا بحضوركم", 560, 76, ek);
  txt("أكّد حضورك من رابط دعوتك 🤍", 660, 34, p(t, 12.8, 13.3), 600, "#ffe7b8", "IBM Plex Sans Arabic");

  // علامات ثابتة
  c.globalAlpha = 0.75; c.fillStyle = "#fff"; c.font = "700 24px Alexandria, sans-serif"; c.fillText("مناسبتي", W / 2, H - 60);
  if (f.ai && reveal > 0) { c.font = "600 18px 'IBM Plex Sans Arabic', sans-serif"; c.textAlign = "right"; c.fillText("خلفية مولّدة بالذكاء الاصطناعي", W - 30, 40); }
  c.globalAlpha = 1;
  const fade = 1 - p(t, DUR - 0.5, DUR); if (fade < 1) { c.fillStyle = `rgba(0,0,0,${1 - fade})`; c.fillRect(0, 0, W, H); }
  c.restore();
}

/** موسيقى ناعمة (بيانو وأجراس) تتصنع بالمتصفح، ومتزامنة مع الختم والكشف */
function music(ac: AudioContext, dest: AudioNode, t0: number) {
  const tone = (f: number, at: number, len: number, g: number, type: OscillatorType = "sine") => {
    const o = ac.createOscillator(), v = ac.createGain(); o.type = type; o.frequency.value = f;
    v.gain.setValueAtTime(0, t0 + at); v.gain.linearRampToValueAtTime(g, t0 + at + .02); v.gain.exponentialRampToValueAtTime(.0001, t0 + at + len);
    o.connect(v).connect(dest); o.start(t0 + at); o.stop(t0 + at + len + .05);
  };
  const n = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
  // نبض هادئ قبل الختم
  [0.3, 1.1, 1.9].forEach((a) => tone(n(57), a, 1.2, .05));
  // كسر الختم: جرس + ارتفاع
  tone(n(84), 2.4, 2.5, .12); tone(n(91), 2.45, 2.2, .06);
  // لحن الكشف (سلم شرقي ناعم)
  const mel = [72, 74, 76, 77, 79, 77, 76, 74, 76, 72, 71, 72];
  mel.forEach((m, i) => { tone(n(m), 3.4 + i * .75, 1.6, .07, "triangle"); tone(n(m + 12), 3.4 + i * .75, .8, .02); });
  // أكوردات خلفية
  [[3.4, [48, 55, 60]], [6.4, [45, 52, 57]], [9.4, [41, 48, 53]], [12.2, [43, 50, 55, 60]]].forEach(([a, ch]) => (ch as number[]).forEach((m) => tone(n(m), a as number, 3.2, .035)));
  tone(n(84), 12.3, 2, .08); tone(n(88), 12.5, 1.8, .05);
}

export function InviteFilmButton({ info }: { info: FilmInfo }) {
  const toast = useToast();
  const cv = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"idle" | "rec" | "done">("idle");
  const [pct, setPct] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");

  const make = async () => {
    const canvas = cv.current!; const c = canvas.getContext("2d")!;
    if (!("MediaRecorder" in window) || !canvas.captureStream) { toast("جوالك ما يدعم تصوير الفيديو، جرّب من متصفح كروم أو سفاري الحديث"); return; }
    setState("rec"); setPct(0);
    try { await document.fonts.ready; } catch { /* */ }
    const img = await loadImg(info.img).catch(() => null);
    let seed = 3; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const sparks = Array.from({ length: 40 }, () => ({ x: rnd() * W, y: rnd() * H, r: 1 + rnd() * 2.5, s: .5 + rnd() }));
    const ac = new AudioContext(); const dest = ac.createMediaStreamDestination();
    const stream = new MediaStream([...canvas.captureStream(FPS).getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const types = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
    const mime = types.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 5_000_000 } : undefined);
    const chunks: Blob[] = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const stopped = new Promise<void>((r) => (rec.onstop = () => r()));
    draw(c, 0, info, img, sparks);
    rec.start(250); const start = performance.now(); music(ac, dest, ac.currentTime + .05);
    await new Promise<void>((resolve) => {
      const tick = () => { const t = (performance.now() - start) / 1000; draw(c, Math.min(t, DUR), info, img, sparks); setPct(Math.min(1, t / DUR)); if (t < DUR + .2) requestAnimationFrame(tick); else resolve(); };
      requestAnimationFrame(tick);
    });
    rec.stop(); await stopped; void ac.close();
    const type = rec.mimeType || mime || "video/webm", ext = type.includes("mp4") ? "mp4" : "webm";
    const blob = new Blob(chunks, { type });
    const f = new File([blob], `دعوة-${info.couple.replace(/\s+/g, "-")}.${ext}`, { type });
    if (url) URL.revokeObjectURL(url);
    setFile(f); setUrl(URL.createObjectURL(blob)); setState("done");
  };
  const share = async () => {
    if (!file) return;
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: "دعوة", text: "دعوتك 🤍" }); return; } catch { /* أُلغيت */ } }
    const a = document.createElement("a"); a.href = url; a.download = file.name; a.click(); toast("نزّلنا الفيديو، أرسله من الاستوديو للواتساب");
  };

  return (
    <section className="card stack film-card">
      <div className="row between wrap"><div><h3 className="card-title"><Icon name="Clapperboard" size={17} /> فيديو الدعوة</h3><p className="muted" style={{ margin: 0, fontSize: 13.5 }}>فيلم قصير ١٤ ثانية بموسيقى: الظرف ينفتح، والأسماء، والموعد. أرسله في قروبات العيلة والستوري.</p></div></div>
      <canvas ref={cv} width={W} height={H} className={"film-cv" + (state === "done" ? " hide" : "")} aria-label="معاينة فيديو الدعوة" />
      {state === "done" && url && <video className="film-out" src={url} controls playsInline />}
      {state === "rec" && <div className="film-prog" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}><b style={{ width: `${pct * 100}%` }} /><span>نصوّر فيلمك… خلك على الصفحة ({Math.round(pct * DUR)}/{DUR} ث)</span></div>}
      <div className="row wrap">
        {state !== "rec" && <button className="btn primary" onClick={() => void make()}><Icon name="Clapperboard" size={16} /> {state === "done" ? "صوّره من جديد" : "صوّر فيديو الدعوة"}</button>}
        {state === "done" && <button className="btn" onClick={() => void share()}><Icon name="Share2" size={16} /> أرسله</button>}
      </div>
    </section>
  );
}
