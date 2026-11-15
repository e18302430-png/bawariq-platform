import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icons";
import { photoUrl } from "./media";
import { repo, resizeImage } from "./data";
import { useToast } from "./components";

/* ═══════════ جولة ٣٦٠° داخل القاعة ═══════════
   عارض WebGL خفيف بدون مكتبات: صورة بانوراما كروية (نسبة ٢:١) تُلف على كرة والكاميرا في وسطها.
   سحب بالإصبع أو الماوس، تقريب بإصبعين أو العجلة، وحركة الجوال (الجايروسكوب) اختيارية. */

export interface TourScene { src: string; label: string }

const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p; gl_Position = vec4(p, 0., 1.); }`;
// لكل بكسل: نحسب اتجاه الشعاع من الكاميرا، ونحوّله لإحداثيات الصورة الكروية
const FS = `precision highp float; varying vec2 v; uniform sampler2D t; uniform float yaw, pitch, fov, asp;
void main(){
  float f = tan(fov * .5);
  vec3 d = normalize(vec3(v.x * f * asp, v.y * f, -1.));
  float cp = cos(pitch), sp = sin(pitch);
  d = vec3(d.x, d.y * cp + d.z * sp, -d.y * sp + d.z * cp);
  float cy = cos(yaw), sy = sin(yaw);
  d = vec3(d.x * cy - d.z * sy, d.y, d.x * sy + d.z * cy);
  float u = atan(d.x, -d.z) / 6.2831853 + .5;
  float w = acos(clamp(d.y, -1., 1.)) / 3.1415927;
  gl_FragColor = texture2D(t, vec2(u, w));
}`;

function Viewer({ src, onReady }: { src: string; onReady?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [gyro, setGyro] = useState(false);
  const gyroRef = useRef(false);
  gyroRef.current = gyro;
  // نحفظ onReady في مرجع: لو تغيّرت الدالة ما نعيد بناء WebGL (إعادة البناء كانت تفقد السياق وتبيّض الصورة)
  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  useEffect(() => {
    const c = ref.current!; const gl = c.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    const sh = (type: number, s: string) => { const o = gl.createShader(type)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(pr, n);
    const tex = gl.createTexture(); let ready = false;
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true; readyRef.current?.();
    };
    img.src = photoUrl(src);
    // حالة الكاميرا: تدور ببطء لين يلمس العميل الشاشة
    let yaw = 0, pitch = 0, fov = 1.35, vy = 0, vp = 0, idle = true, raf = 0;
    const lim = () => { pitch = Math.max(-0.75, Math.min(0.75, pitch)); fov = Math.max(0.6, Math.min(1.75, fov)); };
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); c.width = c.clientWidth * d; c.height = c.clientHeight * d; gl.viewport(0, 0, c.width, c.height); };
    size(); addEventListener("resize", size);
    const pts = new Map<number, { x: number; y: number }>(); let pinch = 0;
    const down = (e: PointerEvent) => { idle = false; c.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); };
    const move = (e: PointerEvent) => {
      const p0 = pts.get(e.pointerId); if (!p0) return;
      if (pts.size === 2) {
        const [a, b] = [...pts.values()]; const d0 = Math.hypot(a.x - b.x, a.y - b.y);
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const [a2, b2] = [...pts.values()]; const d1 = Math.hypot(a2.x - b2.x, a2.y - b2.y);
        if (pinch) fov *= d0 / d1; pinch = 1; lim(); return;
      }
      const k = fov / c.clientHeight;
      vy = -(e.clientX - p0.x) * k; vp = (e.clientY - p0.y) * k;
      yaw += vy; pitch += vp; lim();
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const up = (e: PointerEvent) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; };
    const wheel = (e: WheelEvent) => { e.preventDefault(); idle = false; fov *= 1 + e.deltaY * 0.001; lim(); };
    let g0: { a: number; b: number } | null = null;
    const ori = (e: DeviceOrientationEvent) => {
      if (!gyroRef.current || e.alpha == null || e.beta == null) { g0 = null; return; }
      if (!g0) g0 = { a: e.alpha - (yaw * 180) / Math.PI, b: 0 };
      yaw = ((e.alpha - g0.a) * Math.PI) / 180; pitch = ((e.beta - 80) * Math.PI) / 180; lim(); idle = false;
    };
    c.addEventListener("pointerdown", down); c.addEventListener("pointermove", move); c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up); c.addEventListener("wheel", wheel, { passive: false });
    addEventListener("deviceorientation", ori);
    const loop = () => {
      if (!pts.size) { if (idle) yaw += 0.0012; else { yaw += vy; pitch += vp; vy *= 0.92; vp *= 0.92; lim(); } }
      if (ready) {
        gl.uniform1f(U("yaw"), yaw); gl.uniform1f(U("pitch"), pitch); gl.uniform1f(U("fov"), fov); gl.uniform1f(U("asp"), c.width / c.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); removeEventListener("deviceorientation", ori); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, [src]);
  const askGyro = async () => {
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (!gyro && D.requestPermission) { try { if ((await D.requestPermission()) !== "granted") return; } catch { return; } }
    setGyro((g) => !g);
  };
  return (
    <>
      <canvas ref={ref} className="pano-canvas" aria-label="صورة ٣٦٠ درجة، اسحب للتلفّت" />
      <button type="button" className={"pano-gyro" + (gyro ? " on" : "")} onClick={() => void askGyro()} aria-pressed={gyro}><Icon name="Smartphone" size={16} /> {gyro ? "حرّك جوالك" : "تحكّم بحركة الجوال"}</button>
    </>
  );
}

/** نافذة الجولة بملء الشاشة مع التنقل بين أركان القاعة */
export function TourModal({ scenes, title, onClose }: { scenes: TourScene[]; title: string; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState(true);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); addEventListener("keydown", k); document.body.style.overflow = "hidden"; const t = setTimeout(() => setHint(false), 3500); return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; clearTimeout(t); }; }, [onClose]);
  const s = scenes[i];
  return createPortal(
    <div className="pano" role="dialog" aria-modal="true" aria-label={`جولة ٣٦٠ في ${title}`}>
      <Viewer key={s.src} src={s.src} onReady={() => setLoading(false)} />
      {loading && <div className="pano-load"><Icon name="Loader" size={22} /> نجهّز الجولة…</div>}
      <div className="pano-top">
        <div><b>{title}</b><small>جولة ٣٦٠° · {s.label}</small></div>
        <button type="button" className="pano-x" onClick={onClose} aria-label="إغلاق الجولة"><Icon name="X" size={20} /></button>
      </div>
      {hint && <div className="pano-hint" aria-hidden="true"><Icon name="Hand" size={22} /> اسحب للتلفّت داخل القاعة</div>}
      {scenes.length > 1 && <div className="pano-scenes">{scenes.map((x, k) => <button key={k} type="button" className={k === i ? "on" : ""} onClick={() => { setLoading(true); setI(k); }}><img src={photoUrl(x.src, true)} alt="" />{x.label}</button>)}</div>}
    </div>,
    document.body,
  );
}

/** زر «ادخل القاعة ٣٦٠°» يفتح الجولة */
export function TourButton({ scenes, title, compact = false }: { scenes?: TourScene[]; title: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!scenes?.length) return null;
  return (
    <>
      <button type="button" className={"tour-btn" + (compact ? " compact" : "")} onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
        <span className="tour-orb" aria-hidden="true"><Icon name="Rotate3d" size={compact ? 14 : 18} /></span>
        {compact ? "٣٦٠°" : <span><b>ادخل القاعة ٣٦٠°</b><small>تجوّل فيها كأنك واقف داخلها</small></span>}
      </button>
      {open && <TourModal scenes={scenes} title={title} onClose={() => setOpen(false)} />}
    </>
  );
}

const SPOTS = ["القاعة", "الكوشة", "المدخل", "قسم الرجال", "قسم النساء", "الحديقة"];
/** صاحب القاعة يرفع صور ٣٦٠ (بانوراما كروية ٢:١) ويسمّي كل ركن */
export function TourManager({ tour = [], onChange, max = 4 }: { tour?: TourScene[]; onChange: (t: TourScene[]) => void; max?: number }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const add = async (files: FileList | null) => {
    const f = files?.[0]; if (!f) return;
    setBusy(true);
    try {
      const ratio = await new Promise<number>((res) => { const u = URL.createObjectURL(f); const i = new Image(); i.onload = () => { res(i.width / i.height); URL.revokeObjectURL(u); }; i.onerror = () => res(0); i.src = u; });
      if (ratio < 1.9 || ratio > 2.1) toast("الصورة مو بانوراما ٣٦٠ (لازم عرضها ضعف طولها). بنرفعها، بس الأفضل تصورها بوضع ٣٦٠");
      const url = await repo.uploadPhoto(await resizeImage(f, repo.mode === "local" ? 2048 : 4096, 0.85));
      onChange([...tour, { src: url, label: SPOTS.find((x) => !tour.some((t) => t.label === x)) ?? "ركن" }]);
      toast(repo.error() ?? "أضفنا صورة الجولة");
    } catch (e) { toast((e as Error).message || "تعذّر رفع الصورة"); } finally { setBusy(false); }
  };
  return (
    <div className="tour-mgr">
      <div className="row between wrap"><span className="label">جولة ٣٦٠° ({tour.length}/{max})</span>{tour.length > 0 && <button type="button" className="btn sm" onClick={() => setPreview(true)}><Icon name="Rotate3d" size={15} /> معاينة الجولة</button>}</div>
      <p className="faint" style={{ margin: 0, fontSize: 12.5 }}>صوّر من وسط القاعة بكاميرا ٣٦٠ أو بوضع «Photo Sphere / ٣٦٠» في الجوال. القاعات اللي فيها جولة تطلع بشارة «جولة ٣٦٠°» وتجيب طلبات أكثر.</p>
      <div className="tour-list">
        {tour.map((t, i) => (
          <div key={t.src.slice(-30) + i} className="tour-item">
            <img src={photoUrl(t.src, true)} alt="" />
            <label className="sr" htmlFor={"tr-l" + i}>اسم الركن</label>
            <select id={"tr-l" + i} className="select" value={t.label} onChange={(e) => onChange(tour.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))}>{[...new Set([t.label, ...SPOTS])].map((x) => <option key={x}>{x}</option>)}</select>
            <button type="button" className="icon-btn sm" aria-label="حذف صورة الجولة" onClick={() => onChange(tour.filter((_, k) => k !== i))}><Icon name="Trash2" size={15} /></button>
          </div>
        ))}
        {tour.length < max && (
          <label className="photo-add tour-add" aria-busy={busy}>
            <input type="file" accept="image/*" className="sr" onChange={(e) => { void add(e.target.files); e.target.value = ""; }} disabled={busy} />
            <Icon name={busy ? "Loader" : "Rotate3d"} size={24} /><span>{busy ? "جاري الرفع…" : "أضف صورة ٣٦٠"}</span>
          </label>
        )}
      </div>
      {preview && <TourModal scenes={tour} title="معاينة جولتك" onClose={() => setPreview(false)} />}
    </div>
  );
}
