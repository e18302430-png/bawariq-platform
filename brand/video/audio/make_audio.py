"""يولّد موسيقى الخلفية والمؤثرات للفيديو (كلها مولّدة هنا، بدون ملفات مرخّصة من برّا).
التوقيتات لازم تطابق CUES في index.html. التشغيل: python3 make_audio.py"""
import wave, numpy as np

SR, DUR = 48000, 30.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
CUES = {"s2": 4.6, "s3": 9.6, "s4": 14.6, "zero": 19.6, "cta": 25.2}

def note(n):  # رقم MIDI → تردد
    return 440.0 * 2 ** ((n - 69) / 12)

def env(start, length, a, r):
    e = np.zeros(N); i0, i1 = int(start * SR), min(N, int((start + length) * SR))
    x = (np.arange(i0, i1) - i0) / SR
    e[i0:i1] = np.clip(x / a, 0, 1) * np.clip((length - x) / r, 0, 1)
    return e

def soft_lowpass(x, k):  # فلتر بسيط من الدرجة الأولى
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += k * (x[i] - acc); y[i] = acc
    return y

L = np.zeros(N); R = np.zeros(N)

# ── الموسيقى: ٤ أكوردات دافئة (Am – F – C – G) ثم ختام على Am ──
chords = [(0.0, [57, 60, 64]), (7.5, [53, 57, 60]), (15.0, [48, 52, 55]), (22.5, [55, 59, 62])]
for i, (st, notes) in enumerate(chords):
    ln = 7.5 + 1.6 if i < 3 else DUR - st
    e = env(st, ln, 1.4, 1.6 if i < 3 else 2.2)
    for n in notes:
        f = note(n)
        for det, pan in ((-0.0025, 0.75), (0.0025, 0.25)):
            ph = 2 * np.pi * f * (1 + det) * t
            s = (np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)) * e * 0.055
            L += s * (1 - pan); R += s * pan
    b = np.sin(2 * np.pi * note(notes[0] - 12) * t) * e * 0.08   # باص ناعم
    L += b; R += b

# نقرات خفيفة متتابعة من نغمات الأكورد (تبدأ بعد الخطاف وتتوقف قبل الختام)
step = 0.625
k = 0
for st in np.arange(CUES["s2"], CUES["cta"] - 0.2, step):
    notes = [c for c in chords if c[0] <= st][-1][1]
    n = notes[k % 3] + 12; k += 1
    i0 = int(st * SR); ln = int(0.9 * SR); x = np.arange(min(ln, N - i0)) / SR
    pl = np.sin(2 * np.pi * note(n) * x) * np.exp(-x * 5.5) * 0.035
    pan = 0.35 if k % 2 else 0.65
    L[i0:i0 + len(x)] += pl * (1 - pan); R[i0:i0 + len(x)] += pl * pan

# صدى بسيط يعطي إحساس مساحة
def echo(x, d, g):
    y = x.copy(); s = int(d * SR); y[s:] += x[:-s] * g; return y
L, R = echo(L, 0.23, 0.28), echo(R, 0.31, 0.28)

music_l, music_r = L.copy(), R.copy()
fx_l = np.zeros(N); fx_r = np.zeros(N)

# ── مؤثرات: انتقال ناعم عند كل مشهد ──
noise = rng.standard_normal(N)
for c in ("s2", "s3", "s4", "zero", "cta"):
    mid = CUES[c]; a, ln = mid - 0.35, 0.7
    e = env(a, ln, 0.35, 0.35) ** 1.6
    i0, i1 = int(a * SR), int((a + ln) * SR)
    seg = noise[i0:i1].copy()
    # كتم الترددات العالية مع حركة: من كتيم إلى أفتح
    ks = np.linspace(0.02, 0.12, i1 - i0)
    acc = 0.0; out = np.empty_like(seg)
    for j in range(len(seg)):
        acc += ks[j] * (seg[j] - acc); out[j] = acc
    w = np.zeros(N); w[i0:i1] = out * 0.9
    fx_l += w * e * 0.85; fx_r += w * e * 1.0

# نقرة واجهة خفيفة عند ظهور الشرائح والبطاقات
def tick(at, g=0.05):
    i0 = int(at * SR); x = np.arange(int(0.05 * SR)) / SR
    s = np.sin(2 * np.pi * 1900 * x) * np.exp(-x * 120) * g
    fx_l[i0:i0 + len(x)] += s; fx_r[i0:i0 + len(x)] += s
for at in (CUES["s2"] + 1.1, CUES["s2"] + 1.55, CUES["s2"] + 2.0, CUES["s2"] + 2.3, CUES["s3"] + 1.6, CUES["s4"] + 1.6):
    tick(at)

# لمسة كشف: عند 0% وعند الختام
def bell(at, g):
    i0 = int(at * SR); x = np.arange(min(int(2.4 * SR), N - i0)) / SR
    s = sum(np.sin(2 * np.pi * f * x) * a for f, a in ((note(81), 1), (note(88), .5), (note(93), .25))) * np.exp(-x * 2.2) * g
    fx_l[i0:i0 + len(x)] += s; fx_r[i0:i0 + len(x)] += s
bell(CUES["zero"] + 0.25, 0.05)
bell(CUES["cta"] + 0.15, 0.045)

# ── المزج: الموسيقى خلفية هادية، والمؤثرات أوضح شوي ──
fade = np.clip(t / 0.4, 0, 1) * np.clip((DUR - t) / 1.6, 0, 1)
mix_l = (music_l * 1.0 + fx_l) * fade
mix_r = (music_r * 1.0 + fx_r) * fade
peak = max(np.abs(mix_l).max(), np.abs(mix_r).max())
gain = 10 ** (-3 / 20) / peak            # قمة -3 dBFS قبل التطبيع النهائي في ffmpeg
st = np.stack([mix_l * gain, mix_r * gain], axis=1)
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("mix.wav", DUR, "s, peak gain", round(20 * np.log10(gain), 1), "dB")
