import { useEffect, useRef } from "react";

/**
 * حرير لوني حي (WebGL): تدرج متدفق بأربعة ألوان مع تشويه ضوضائي وحبيبات خفيفة.
 * الألوان تنتقل بنعومة عند تغيير palette (مثلاً عند اختيار نوع المناسبة)،
 * ويتفاعل التدفق قليلاً مع حركة المؤشر أو اللمس.
 */
const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `
precision highp float;
uniform vec2 r;uniform float t;uniform vec2 m;
uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;vec2 p=uv;p.x*=r.x/r.y;
  float s=t*.045;
  vec2 q=vec2(fbm(p*1.3+s),fbm(p*1.3-s+vec2(5.2,1.3)));
  vec2 w=vec2(fbm(p*1.1+q*1.8+vec2(1.7,9.2)+s*.8),fbm(p*1.1+q*1.8+vec2(8.3,2.8)-s*.6));
  w+=(m-.5)*.25;
  float a=smoothstep(.15,.85,w.x);float b=smoothstep(.1,.9,w.y+uv.y*.35);
  vec3 col=mix(mix(c3,c2,a),mix(c1,c0,a),b);
  col=mix(col,c3,smoothstep(.55,1.15,1.-uv.y)*.35);
  float silk=pow(abs(sin((w.x+w.y)*6.2831+t*.12)),18.)*.12;col+=silk;
  float g=h(gl_FragCoord.xy+fract(t))*.06-.03;col+=g;
  gl_FragColor=vec4(col,1.);
}`;

const hex = (c: string): [number, number, number] => {
  const v = parseInt(c.replace("#", ""), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
};

export function MeshGradient({ palette, className, style }: { palette: [string, string, string, string]; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const target = useRef(palette.map(hex));
  target.current = palette.map(hex);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    const fallback = () => { canvas.style.background = `linear-gradient(135deg, ${palette[0]}, ${palette[1]} 45%, ${palette[2]} 75%, ${palette[3]})`; };
    if (!gl) { fallback(); return; }
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { fallback(); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uR = U("r"), uT = U("t"), uM = U("m"), uc = [U("c0"), U("c1"), U("c2"), U("c3")];

    const cur = target.current.map((c) => [...c] as [number, number, number]);
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, visible = true;
    const start = performance.now() - Math.random() * 20000;

    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr * 0.75));
      canvas.height = Math.max(1, Math.floor(h * dpr * 0.75));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) cur[i][k] += (target.current[i][k] - cur[i][k]) * 0.035;
      mouse.x += (mouse.tx - mouse.x) * 0.04; mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, reduce ? 12 : (now - start) / 1000);
      gl.uniform2f(uM, mouse.x, mouse.y);
      uc.forEach((u, i) => gl.uniform3fv(u, cur[i]));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width; mouse.ty = 1 - (e.clientY - r.top) / r.height;
    };
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    resize();
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener("pointermove", onMove); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} className={className} style={{ display: "block", width: "100%", height: "100%", ...style }} aria-hidden="true" />;
}
