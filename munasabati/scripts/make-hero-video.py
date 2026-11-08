"""يصنع فيديو الترحيب السينمائي من صور الهوية (حركة كاميرا بطيئة وانتقالات ناعمة).
التشغيل: python3 scripts/make-hero-video.py  ← يكتب apps/web/public/media/hero.mp4 و hero.webm و hero-poster.webp
"""
import math, os, subprocess
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "media-src")
OUT = os.path.join(ROOT, "apps/web/public/media")
os.makedirs(OUT, exist_ok=True)

W, H, FPS = 1280, 720, 30
SHOT, FADE = 2.9, 0.8  # ثواني لكل لقطة، ومدة الانتقال
# (الصورة، اتجاه الحركة: zoom-in/zoom-out + انزياح)
SHOTS = [("v1", 1, (0, 0)), ("s1", -1, (0.04, 0)), ("v3", 1, (-0.04, 0)), ("v6", -1, (0, 0.03)),
         ("s3", 1, (0.03, 0)), ("v7", -1, (-0.03, 0)), ("s7", 1, (0, -0.02)), ("v5", -1, (0.03, 0))]

imgs = {}
for k, _, _ in SHOTS:
    im = Image.open(os.path.join(SRC, f"{k}.jpg")).convert("RGB")
    w, h = im.size
    t = W / H
    if w / h > t: nw = int(h * t); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = int(w / t); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    imgs[k] = im.resize((int(W * 1.25), int(H * 1.25)), Image.LANCZOS)

ease = lambda x: 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, x)))

def frame(k, direction, pan, p):
    """p من 0 إلى 1 داخل اللقطة. تكبير 1.0→1.14 (أو العكس) مع انزياح خفيف"""
    src = imgs[k]
    z = 1 + 0.14 * (p if direction > 0 else 1 - p)
    sw, sh = src.size
    cw, ch = sw / (1.25 * z), sh / (1.25 * z)
    cx = sw / 2 + pan[0] * sw * (p - 0.5)
    cy = sh / 2 + pan[1] * sh * (p - 0.5)
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return src.resize((W, H), Image.BICUBIC, box=box)

step = SHOT - FADE
total = step * len(SHOTS)  # حلقة متصلة: آخر لقطة تذوب في الأولى
n = int(total * FPS)
ff = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-"]
mp4 = subprocess.Popen(ff + ["-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", os.path.join(OUT, "hero.mp4")], stdin=subprocess.PIPE)

for f in range(n):
    t = f / FPS
    i = int(t // step)
    local = t - i * step
    k, d, pan = SHOTS[i % len(SHOTS)]
    img = frame(k, d, pan, (local + FADE) / SHOT)
    if local < FADE:  # ذوبان من اللقطة السابقة
        pk, pd, ppan = SHOTS[(i - 1) % len(SHOTS)]
        prev = frame(pk, pd, ppan, (step + local + FADE) / SHOT if i > 0 else (local + step + FADE) / SHOT)
        img = Image.blend(prev, img, ease(local / FADE))
    if f == int(1.2 * FPS):
        img.save(os.path.join(OUT, "hero-poster.webp"), "WEBP", quality=70)
    mp4.stdin.write(img.tobytes())
mp4.stdin.close(); mp4.wait()

subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(OUT, "hero.mp4"), "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40", "-row-mt", "1", "-an", os.path.join(OUT, "hero.webm")], check=True)
for f in ("hero.mp4", "hero.webm", "hero-poster.webp"):
    print(f, round(os.path.getsize(os.path.join(OUT, f)) / 1024), "KB")
print(f"{total:.1f}s @ {W}x{H}")
