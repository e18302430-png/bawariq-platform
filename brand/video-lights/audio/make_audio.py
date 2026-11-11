"""صوت فيلم «١٢٠ نور» (كله مولّد هنا). نبض إلكتروني ناعم، رنّة لكل دعوة توصل، قلوب، نجوم المورّدين،
أنهار النور، غوص، ألعاب نارية، وختام. التوقيتات تطابق index.html."""
import wave, numpy as np
SR, DUR = 48000, 34.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(120)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
T = dict(send=2.8, reply=9.0, vend=14.0, flow=19.5, dive=23.5, fire=24.6, logo=27.6)
VEND_AT = [14.3, 15.3, 16.3, 17.3]

def add(at, sig, g=1.0, pan=0.5):
    i0 = int(at * SR)
    if i0 >= N or i0 < 0: return
    s = sig[: N - i0] * g
    L[i0:i0 + len(s)] += s * (1 - pan); R[i0:i0 + len(s)] += s * pan
def fft_lp(x, hz):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f > hz] *= np.exp(-(f[f > hz] - hz) / (hz * .3)); return np.fft.irfft(X, len(x))
def fft_hp(x, hz):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f < hz] = 0; return np.fft.irfft(X, len(x))
def env(n, a, r):
    e = np.ones(n); ia, ir = int(a * SR), int(r * SR)
    if ia: e[:ia] = np.linspace(0, 1, ia) ** 2
    if ir: e[-ir:] *= np.linspace(1, 0, ir) ** 2
    return e

def piano(n0, ln=2.2, v=1.0):
    x = np.arange(int(ln * SR)) / SR; f = note(n0)
    s = sum(np.sin(2 * np.pi * f * m * x * (1 + .0004 * m * m)) * a * np.exp(-x * (1.6 + m * .9)) for m, a in ((1, 1), (2, .45), (3, .22), (4, .1), (5, .05)))
    return s * (1 - np.exp(-x * 400)) * v
def pad(notes, ln, bright=1.0):
    x = np.arange(int(ln * SR)) / SR; s = np.zeros(len(x))
    for n0 in notes:
        for d in (-.12, 0, .12):  # أوتار: ثلاث نسخ بانحراف بسيط
            f = note(n0 + d * .1)
            s += sum(np.sin(2 * np.pi * f * m * x + rng.random() * 6) * a for m, a in ((1, 1), (2, .3 * bright), (3, .12 * bright)))
    s *= (1 + .15 * np.sin(2 * np.pi * 5.2 * x))  # فيبراتو خفيف
    return s / (len(notes) * 3) * env(len(x), min(1.4, ln * .4), min(1.2, ln * .35))
def kick(d=.4, g=1.4):
    x = np.arange(int(d * SR)) / SR; f = 45 + 100 * np.exp(-x * 28)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 7) * g)
def heart():
    return np.concatenate([kick(.22, 1.1) * .8, np.zeros(int(.14 * SR)), kick(.22, 1.1) * .5])
def boom(ln=2.0):
    x = np.arange(int(ln * SR)) / SR; f = 30 + 70 * np.exp(-x * 5)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 1.8) * 1.8)
def ping():
    x = np.arange(int(.35 * SR)) / SR
    return (np.sin(2 * np.pi * 1760 * x) + .5 * np.sin(2 * np.pi * 2637 * x)) * np.exp(-x * 14) * .5
def chime(n0, ln=3.0):
    x = np.arange(int(ln * SR)) / SR
    return sum(np.sin(2 * np.pi * note(n0) * m * x) * a * np.exp(-x * (1.2 + m)) for m, a in ((1, 1), (2.76, .35), (5.4, .15)))
def shimmer(ln=3.0):
    n = rng.standard_normal(int(ln * SR)); n = fft_hp(n, 6000); x = np.arange(len(n)) / SR
    return n * np.exp(-x * 1.4) * (1 - np.exp(-x * 30)) * .25
def riser(ln):
    n = rng.standard_normal(int(ln * SR)); x = np.arange(len(n)) / SR
    lo, hi = fft_lp(n, 600), fft_lp(n, 5000); k = (x / ln) ** 2
    return (lo * (1 - k) + hi * k) * k * .8
def doum():  # طبل الزفة الغليظ
    x = np.arange(int(.45 * SR)) / SR; f = 70 + 60 * np.exp(-x * 25)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9) * 1.6)
def tak():
    x = np.arange(int(.15 * SR)) / SR; n = fft_hp(rng.standard_normal(len(x)), 1500)
    return (n * .6 + np.sin(2 * np.pi * 420 * x) * .7) * np.exp(-x * 40)
def clap():
    x = np.arange(int(.2 * SR)) / SR; n = fft_hp(rng.standard_normal(len(x)), 900)
    e = sum(np.exp(-np.clip(x - d, 0, None) * 60) * (x >= d) for d in (0, .011, .022))
    return n * e * .5
def tar():  # رنين دف
    x = np.arange(int(.3 * SR)) / SR; n = fft_hp(rng.standard_normal(len(x)), 5000)
    return n * np.exp(-x * 12) * .35


PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91]
def pluck(n0, ln=.6, v=1.0):
    x = np.arange(int(ln * SR)) / SR; f = note(n0)
    return (np.sin(2 * np.pi * f * x) + .3 * np.sin(4 * np.pi * f * x)) * np.exp(-x * 9) * (1 - np.exp(-x * 600)) * v
def whoosh(ln=1.0):
    n = rng.standard_normal(int(ln * SR)); x = np.arange(len(n)) / SR
    lo, hi = fft_lp(n, 700), fft_lp(n, 4500); k = np.sin(np.pi * x / ln) ** 2
    return (lo * (1 - x / ln) + hi * (x / ln)) * k * .5
def whistle(ln=.45):
    x = np.arange(int(ln * SR)) / SR; f = 900 + 1800 * x / ln
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * .12 * env(len(x), .05, .1)
def pop():
    x = np.arange(int(1.4 * SR)) / SR; n = fft_lp(rng.standard_normal(len(x)), 3000); k = kick(.4, 1.3)
    return np.tanh(n * np.exp(-x * 9) * 2) * .7 + np.pad(k, (0, len(x) - len(k))) * .5
def crackle(ln=1.0):
    s = np.zeros(int(ln * SR))
    for _ in range(50):
        i = int(rng.random() * (len(s) - 400)); s[i:i + 300] += fft_hp(rng.standard_normal(300), 3000) * np.exp(-np.arange(300) / 40) * rng.random()
    return s * .4

# ── البداية: بيت واحد، نبض هادي، ثم نقرة الإرسال ──
add(0.0, pad([45, 52, 57], 3.0, .4), .2)
for k in range(5): add(.3 + k * .5, kick(.3, 1.0), .2)
add(0.5, chime(81, 2.0), .1, .6)
add(1.9, chime(88, 1.6), .25); add(1.9, kick(.4, 1.3), .4); add(1.9, shimmer(1.2), .4)
add(2.2, riser(.6), .3)

# ── الدعوات: الكاميرا ترجع والأنوار تجري، ورنّة لكل بيت توصله ──
add(T["send"], whoosh(1.6), .6); add(T["send"], boom(1.8), .4)
add(T["send"], pad([45, 52, 57, 61, 64], 6.4, 1.0), .26)
rr = np.random.default_rng(5)
for k in range(120): add(T["send"] + 1.0 + rr.random() ** .7 * 3.8, pluck(PENTA[int(rr.integers(0, 10))], .6, .8), .06, rr.random())
BPM = 60 / 112
b = T["send"]
while b < T["dive"]:
    add(b, kick(.3, 1.1), .28)
    add(b + BPM / 2, shimmer(.15), .12, .6)
    b += BPM

# ── الردود: قلوب ورنّات أعلى ──
add(T["reply"], pad([41, 48, 53, 57, 64], 5.0, 1.0), .24)
for k in range(110): add(T["reply"] + .2 + rr.random() * 3.6, pluck(PENTA[int(rr.integers(3, 10))] + 12, .4, .6), .045, rr.random())
for k, n0 in enumerate([76, 79, 81, 84]): add(T["reply"] + .3 + k * 1.0, piano(n0, 2.0, .6), .12, .4)

# ── المورّدين: كل واحد نجمة لها جرس ──
add(T["vend"], pad([48, 55, 60, 64, 67], 5.6, 1.1), .26)
for k, a in enumerate(VEND_AT):
    add(a - .2, whoosh(.5), .3, .3 + .15 * k); add(a, chime([84, 88, 91, 96][k], 2.4), .26, .3 + .15 * k); add(a, kick(.4, 1.2), .35)
add(18.2, riser(1.3), .4)

# ── ليلة الخميس: أنهار من النور ──
add(T["flow"], boom(2.2), .55); add(T["flow"], whoosh(2.0), .5)
add(T["flow"], pad([43, 50, 55, 59, 62, 67], 4.2, 1.3), .34)
for k in range(98): add(T["flow"] + .8 + rr.random() * 2.6, pluck(PENTA[int(rr.integers(0, 10))], .5, .6), .04, rr.random())
add(22.3, riser(1.2), .6)

# ── الغوص والانفجار ──
add(T["dive"], whoosh(1.1), .7)
add(T["fire"], boom(2.6), 1.0); add(T["fire"], shimmer(3.0), .8)
add(T["fire"], pad([33, 45, 52, 57, 61, 64], 3.2, 1.5), .42)
for k, d in enumerate([.15, .45, .8, 1.15, 1.45, 1.75, 2.05, 2.35]):
    add(T["fire"] + d - .45, whistle(.45), 1.0, .2 + .08 * k); add(T["fire"] + d, pop(), .45, .2 + .08 * k); add(T["fire"] + d + .2, crackle(.9), .5, .8 - .08 * k)

# ── الأنوار تصير الشعار ──
add(T["logo"], whoosh(1.4), .5); add(T["logo"], riser(1.4), .35)
L0 = T["logo"] + 1.5
add(L0, boom(2.4), .6); add(L0, shimmer(3.0), .7)
add(L0, pad([38, 50, 57, 62, 66, 69], 4.2, 1.2), .4)
add(L0 + .1, chime(86, 3.0), .3, .45); add(L0 + .5, chime(93, 2.4), .14, .6)
for k, n0 in enumerate([74, 78, 81, 86]): add(L0 + .6 + k * .2, piano(n0, 2.2, .6), .1, .4)

fo = int(1.2 * SR)
for ch in (L, R): ch[-fo:] *= np.linspace(1, 0, fo) ** 2
def verb(x):
    y = x.copy()
    for d, g in ((.031, .35), (.047, .3), (.071, .25), (.113, .2), (.167, .15)):
        k = int(d * SR); y[k:] += x[:-k] * g
    return y
L, R = verb(L), verb(R)
m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * .9, R / m * .9
with wave.open("mix.wav", "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.stack([L, R], 1) * 32767).astype("<i2").tobytes())
print("ok", DUR)
