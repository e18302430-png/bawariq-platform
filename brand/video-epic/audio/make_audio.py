"""موسيقى تريلر لفيديو مناسبتي (كلها مولّدة هنا، بدون ملفات من برّا).
طبول تايكو للومضات، نغمات «براام» ثقيلة للخطاف، سقوط إيقاع عند 5 ث، إيقاع حديث 120، لحظة هادية 22–26، وختام ضخم.
التوقيتات تطابق index.html. التشغيل: python3 make_audio.py"""
import wave, numpy as np
SR, DUR = 48000, 30.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(9)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)

def add(at, sig, g=1.0, pan=0.5):
    i0 = int(at * SR)
    if i0 >= N or i0 < 0: return
    s = sig[: N - i0] * g
    L[i0:i0 + len(s)] += s * (1 - pan); R[i0:i0 + len(s)] += s * pan
def lp(x, k):
    y = np.empty_like(x); a = 0.0
    for i in range(len(x)): a += k * (x[i] - a); y[i] = a
    return y
def lp_sweep(x, k0, k1):
    ks = np.linspace(k0, k1, len(x)); y = np.empty_like(x); a = 0.0
    for i in range(len(x)): a += ks[i] * (x[i] - a); y[i] = a
    return y
def env(n, a, d):  # هجوم سريع وانطفاء
    x = np.arange(n) / SR; return np.clip(x / a, 0, 1) * np.exp(-x / d)
def taiko():
    x = np.arange(int(1.0 * SR)) / SR; f = 48 + 60 * np.exp(-x * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 4.5)
    n = rng.standard_normal(len(x)); click = lp(n, .25) * np.exp(-x * 60) * .6
    return np.tanh((body + click) * 1.6)
def braam(root=24, ln=1.6):
    n = int(ln * SR); x = np.arange(n) / SR; s = np.zeros(n)
    for m, g in ((0, 1), (12, .7), (19, .45), (24, .3)):
        for det in (-.004, .004):
            ph = (note(root + m) * (1 + det) * x) % 1.0; s += (2 * ph - 1) * g
    s = lp_sweep(s, .02, .12) * env(n, .03, .9)
    return np.tanh(s * .9) * .7
def boom(ln=1.8):
    x = np.arange(int(ln * SR)) / SR; f = 28 + 80 * np.exp(-x * 5)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 1.9) * 1.8)
def crash(ln=2.2):
    x = np.arange(int(ln * SR)) / SR; n = rng.standard_normal(len(x)); n = n - lp(n, .3)
    return n * np.exp(-x * 2.2) * .35
def riser(ln, top=.4):
    x = np.arange(int(ln * SR)) / SR; n = rng.standard_normal(len(x))
    return lp_sweep(n, .01, top) * (x / ln) ** 2.2
def whoosh(ln=.45):
    x = np.arange(int(ln * SR)) / SR; n = rng.standard_normal(len(x))
    e = np.sin(np.pi * x / ln) ** 2; return lp_sweep(n, .03, .2) * e * .8
def kick():
    x = np.arange(int(.35 * SR)) / SR; f = 42 + 110 * np.exp(-x * 30)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 7) * 1.5)
def snare():
    x = np.arange(int(.25 * SR)) / SR; n = rng.standard_normal(len(x)); n = n - lp(n, .1)
    tone = np.sin(2 * np.pi * 190 * x) * np.exp(-x * 30)
    return (n * np.exp(-x * 18) * .7 + tone * .4)
def hat(o=False):
    x = np.arange(int((.1 if o else .035) * SR)) / SR; n = rng.standard_normal(len(x)); n = n - lp(n, .5)
    return n * np.exp(-x * (28 if o else 110)) * .25
def sub(f0, ln):
    x = np.arange(int(ln * SR)) / SR
    return np.tanh(np.sin(2 * np.pi * f0 * x) * 1.3) * np.clip(x / .01, 0, 1) * np.exp(-x * 1.2)
def bell(n0, ln=2.6):
    x = np.arange(int(ln * SR)) / SR
    return sum(np.sin(2 * np.pi * note(n0) * m * x) * a for m, a in ((1, 1), (2, .35), (3, .12))) * np.exp(-x * 2.2)

# ── الافتتاح: تايكو على كل ومضة ──
for a in (.2, .7, 1.2, 1.6, 1.9):
    add(a, taiko(), .9); add(a, whoosh(.25), .25)
add(1.9, riser(.6, .35), .5)
# ── الخطاف: براام ثقيل على كل كلمة ──
add(2.5, braam(24), 1.0); add(2.5, boom(1.2), .7); add(2.5, crash(1.5), .5)
add(3.75, braam(22), 1.0); add(3.75, boom(1.2), .7)
add(4.1, riser(.7, .5), .6)
L[int(4.8 * SR):int(5.0 * SR)] = 0; R[int(4.8 * SR):int(5.0 * SR)] = 0        # صمت قبل السقوط
# ── السقوط: انفجار ──
add(5.0, boom(2.2), 1.0); add(5.0, braam(17, 2.2), .9); add(5.0, crash(2.6), .7); add(5.0, kick(), 1.0)
# ── الإيقاع الحديث من 5 إلى 22 ──
CH = [(5, 41), (9, 37), (13, 44), (17, 39), (21, 41)]                 # Fm Db Ab Eb (جذور منخفضة)
root = lambda a: [r for s, r in CH if s <= a][-1]
bar = 5.0
while bar < 22 - 1e-6:
    for off in (0, .75, 1.25):                                         # كيك بنمط حديث
        if bar + off < 22: add(bar + off, kick(), .9)
    add(bar + 1.0, snare(), .75)
    for i in range(16):                                                # هاي هات سريعة، وتتسارع قبل الانتقالات
        h = bar + i * .125
        if h >= 22: break
        roll = any(abs(h - (fs - .5)) < .26 for fs in (7, 10, 13, 16, 19, 22))
        add(h, hat(i % 8 == 6), .5 if i % 2 == 0 else .32, .35 + .3 * (i % 3) / 2)
        if roll: add(h + .0625, hat(), .3, .6)
    add(bar, sub(note(root(bar)), 1.9), .55)
    bar += 2.0
for s, r in CH:                                                        # خلفية مظلمة
    e = np.clip((t - s) / .3, 0, 1) * np.clip((s + 4.2 - t) / .5, 0, 1) * (t < 22) * (t >= 5)
    for n in (r + 24, r + 27, r + 31):
        ph = 2 * np.pi * note(n) * t; sig = (np.sin(ph) + .25 * np.sin(2 * ph)) * e * .03
        L += sig; R += sig
# ضربات المميزات: دخول بالكاميرا ثم ضربة
for fs in (7, 10, 13, 16, 19):
    add(fs - .45, whoosh(.45), .55, .45); add(fs, boom(.9), .55); add(fs, crash(1.0), .25)
    add(fs + 1.0, taiko(), .45)
# ── اللحظة الهادية 22–26: نغمات جرس فوق خلفية دافئة ──
add(21.6, whoosh(.5), .5); add(22.0, boom(1.4), .6)
e = np.clip((t - 22) / .6, 0, 1) * np.clip((26 - t) / .3, 0, 1)
for n in (53, 56, 60, 65):
    ph = 2 * np.pi * note(n) * t; sig = np.sin(ph) * e * .045
    L += sig; R += sig
for i, n in enumerate((72, 75, 77, 80, 77, 75)):
    add(22.3 + i * .5, bell(n, 1.8), .07, .4 + .1 * (i % 3))
hb = 22.4
while hb < 25.6: add(hb, kick(), .35); add(hb + .25, kick(), .2); hb += 1.0
add(24.9, riser(1.1, .55), .75)
# ── الختام: أضخم ضربة، ثم رنين ──
add(26.0, boom(2.6), 1.0); add(26.0, braam(17, 3.0), .95); add(26.0, crash(3.0), .7); add(26.0, kick(), 1.0)
e = np.clip((t - 26) / .2, 0, 1) * (t >= 26)
for n in (41, 53, 60, 65, 68, 72):
    ph = 2 * np.pi * note(n) * t; sig = (np.sin(ph) + .2 * np.sin(2 * ph)) * e * .035
    L += sig; R += sig
add(26.4, bell(77, 3.4), .08); add(27.0, bell(84, 3.0), .06)

fade = np.clip(t / .02, 0, 1) * np.clip((DUR - t) / 1.8, 0, 1)
st = np.stack([L * fade, R * fade], axis=1); st *= 10 ** (-3 / 20) / np.abs(st).max()
with wave.open("mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix.wav", DUR)
