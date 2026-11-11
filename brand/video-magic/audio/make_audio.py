"""موسيقى فيلم «سحر» (كلها مولّدة هنا). أجراس ولمعات مع كل شكل تتكون منه الذرات، أوتار تكبر،
نبض يتسارع، صمت، انفجار، قلب، وختام بالشعار. التوقيتات تطابق index.html."""
import wave, numpy as np
SR, DUR = 48000, 32.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
MORPHS = [2.6, 5.2, 8.2, 11.2, 14.2, 17.2, 20.2]
BURST, HEART, LOGO = 22.4, 23.3, 26.4

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


def whoosh(ln=1.1):
    n = rng.standard_normal(int(ln * SR)); x = np.arange(len(n)) / SR
    lo, hi = fft_lp(n, 700), fft_lp(n, 4000); k = np.sin(np.pi * x / ln) ** 2
    return (lo * (1 - x / ln) + hi * (x / ln)) * k * .5

# ── الشرارة: لمعة تلف، وجرس صغير ──
add(0.2, shimmer(2.6), .35, .3); add(0.3, chime(93, 2.2), .08, .7); add(1.2, chime(88, 2.0), .07, .3)
add(0.0, pad([45, 52], 2.8, .3), .14)
add(1.4, riser(1.2), .25)
add(2.6, boom(1.6), .5); add(2.6, shimmer(2.0), .5)

# ── كل شكل: سحبة هوا + جرس على نغمة من السلم، والأوتار تتصاعد ──
SC = [69, 72, 76, 74, 77, 79, 81]
CHORDS = [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 64], [41, 48, 57, 60]]
for k, a in enumerate(MORPHS[:-1]):
    add(a - .1, whoosh(1.2), .45, .3 + .4 * (k % 2))
    add(a + .9, chime(SC[k] + 12, 2.6), .22, .4 + .2 * (k % 2)); add(a + .9, chime(SC[k] + 19, 2.2), .08, .6)
    add(a + .9, shimmer(1.6), .3)
    add(a, pad(CHORDS[k], 3.2, .8 + k * .1), .16 + k * .02)
    if k >= 1: add(a + .9, kick(.5, 1.2), .35)
    for j, n0 in enumerate([SC[k], SC[k] + 3, SC[k] + 7, SC[k] + 12]):
        add(a + 1.0 + j * .28, piano(n0, 1.4, .5), .08, .3 + .1 * j)
# نبض يتسارع لين الانفجار
at, b = 6.0, .75
while at < MORPHS[-1]:
    add(at, kick(.3, 1.0), .18); at += b; b = max(.375, b * .985)

# ── كل شي ينكمش لنقطة: سحب، تصاعد، ثم صمت ──
add(MORPHS[-1] - .1, whoosh(1.4), .5)
add(20.4, riser(2.0), .55)
add(20.2, pad([33, 45], 2.2, .2), .25)

# ── الانفجار ──
add(BURST, boom(2.8), .9); add(BURST, shimmer(3.5), .9)
add(BURST, pad([33, 45, 52, 57, 61, 64], 4.0, 1.5), .45)
add(BURST, chime(81, 3.5), .3, .4); add(BURST + .05, chime(88, 3.0), .2, .6)
# القلب: بيانو دافي
for j, n0 in enumerate([76, 81, 85, 88, 85, 81]): add(HEART + .3 + j * .4, piano(n0, 2.0, .7), .12, .35 + .1 * (j % 3))
add(HEART, pad([45, 52, 57, 61], 3.2), .25)
add(25.2, riser(1.2), .3)

# ── الشعار ──
add(LOGO, whoosh(1.2), .5)
add(LOGO + .9, boom(2.4), .6); add(LOGO + .9, shimmer(3.0), .7)
add(LOGO + .9, pad([38, 50, 57, 62, 66, 69], 4.6, 1.2), .4)
add(LOGO + .9, chime(86, 3.5), .3, .45); add(LOGO + 1.3, chime(93, 3.0), .15, .6)
for j, n0 in enumerate([74, 78, 81, 86]): add(LOGO + 1.1 + j * .22, piano(n0, 2.4, .6), .1, .4)

def gate(a, b, fade=.06):
    i0, i1, f = int(a * SR), int(b * SR), int(fade * SR)
    for ch in (L, R):
        ch[i0:i1] *= 0; ch[i0 - f:i0] *= np.linspace(1, 0, f)
gate(22.05, BURST)
fo = int(1.4 * SR)
for ch in (L, R): ch[-fo:] *= np.linspace(1, 0, fo) ** 2
def verb(x):
    y = x.copy()
    for d, g in ((.029, .35), (.043, .3), (.067, .26), (.101, .2), (.149, .16), (.211, .12)):
        k = int(d * SR); y[k:] += x[:-k] * g
    return y
L, R = verb(L), verb(R)
m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * .9, R / m * .9
with wave.open("mix.wav", "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.stack([L, R], 1) * 32767).astype("<i2").tobytes())
print("ok", DUR)
