"""صوت فيلم «مختفي» (كله مولّد هنا). بيانو حزين ورسايل بدون رد، صمت، ليلة الزواج، باب ينفتح على نور،
ورد أبيض، الممشى، اهتزاز الجوال ورده، علامات الصح، وختام. التوقيتات تطابق index.html."""
import wave, numpy as np
SR, DUR = 48000, 37.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(33)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
MSG, SEEN, TYPE = [1.6, 2.9, 4.3, 5.9], 7.0, (7.6, 8.9)
T = dict(dress=10.2, mom=13.6, night=17.0, hall=18.4, aisle=22.4, groom=25.6, reply=26.6, hands=32.0, end=33.6)

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


def sent():
    x = np.arange(int(.18 * SR)) / SR; f = 600 + 900 * x / .18
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 22) * .5
def ding():
    return chime(88, 1.2) * .7 + chime(93, 1.2) * .3
def buzz(ln=.9):
    x = np.arange(int(ln * SR)) / SR
    return np.sin(2 * np.pi * 150 * x) * (np.sin(2 * np.pi * 7 * x) > 0) * env(len(x), .01, .05) * .5
def tap():
    x = np.arange(int(.05 * SR)) / SR
    return fft_hp(rng.standard_normal(len(x)), 2000) * np.exp(-x * 120) * .3

# ── ١) رسايل بدون رد: بيانو حزين بطيء ──
add(0.0, pad([45, 52, 57], 4.0, .3), .16)
SAD = [(0.4, 69), (1.6, 72), (2.8, 71), (4.0, 67), (5.2, 69), (6.4, 64), (7.6, 65)]
for a, n0 in SAD: add(a, piano(n0, 2.6, .7), .16, .45); add(a, piano(n0 - 12, 2.6, .5), .1, .55)
add(2.8, pad([41, 48, 53, 57], 4.0, .3), .16); add(6.4, pad([40, 47, 52, 56], 3.0, .3), .16)
for a in MSG: add(a, sent(), .3, .7)
add(SEEN, tap(), .5)
for k in range(8): add(TYPE[0] + .2 + k * .15, tap(), .15, .3)
# الصمت بعد ما يختفي «يكتب…»

# ── ٢) الفستان وأمها: أوتار حزينة ──
add(T["dress"], pad([45, 52, 57, 60], 3.6, .5), .24)
for k, n0 in enumerate([76, 74, 72, 71, 69]): add(T["dress"] + .3 + k * .65, piano(n0, 2.2, .6), .13, .4)
add(T["mom"], pad([41, 48, 53, 57], 3.4, .5), .24)
for k, n0 in enumerate([72, 69, 67, 65, 64]): add(T["mom"] + .3 + k * .62, piano(n0, 2.2, .6), .13, .55)

# ── ٣) ليلة الزواج: قلب، تصاعد، الباب ينفتح على نور ──
for k in range(3): add(T["night"] - .1 + k * .55, heart(), .5)
add(T["night"], riser(1.4), .5)
H = T["hall"]
add(H, boom(2.4), .6); add(H, shimmer(3.0), .5)
add(H, pad([48, 55, 60, 64, 67], 4.0, 1.0), .34)
add(H + 2.0, shimmer(3.0), .8); add(H + 2.0, chime(84, 3.0), .25, .4); add(H + 2.05, chime(91, 2.6), .12, .6)
for k, n0 in enumerate([72, 76, 79, 84, 88]): add(H + 2.0 + k * .1, piano(n0, 1.8, .5), .1, .3 + .1 * k)

# ── ٤) الممشى والجدة ──
A = T["aisle"]
add(A, pad([41, 53, 57, 60, 64], 3.4, 1.2), .36)
for d, n0 in [(0, 76), (.7, 74), (1.2, 72), (1.9, 77), (2.5, 76)]: add(A + .2 + d, piano(n0 + 12, 2.4, .8), .15, .45)

# ── ٥) العريس، ثم الجوال يهتز: ردّه ──
G = T["groom"]
add(G, pad([43, 50, 55, 59], 2.0, .8), .22)
RP = T["reply"]
add(RP - .1, buzz(.9), .6, .5); add(RP + .25, ding(), .3, .5)
add(RP + 1.65, ding(), .25, .5)
add(RP + .3, pad([48, 55, 60, 64, 71], 5.2, .9), .28)
for k in range(3): add(RP + 2.2 + k * .55, chime(84 + [0, 4, 7][k], 1.6), .25, .35 + .15 * k); add(RP + 2.2 + k * .55, tap(), .4)
add(RP + 4.0, shimmer(2.0), .6); add(RP + 4.0, chime(91, 2.4), .25, .5); add(RP + 4.0, kick(.4, 1.1), .3)
for k, n0 in enumerate([76, 79, 84, 79, 76, 72]): add(RP + .6 + k * .7, piano(n0, 2.0, .5), .1, .4)

# ── ٦) يده بيدها، ثم الختام ──
add(T["hands"], pad([45, 52, 57, 61, 64], 2.0, 1.0), .3)
for k, n0 in enumerate([81, 85, 88]): add(T["hands"] + .2 + k * .4, piano(n0, 2.0, .6), .13, .45)
E = T["end"]
add(E, boom(2.4), .6); add(E, shimmer(3.0), .7)
add(E, pad([38, 50, 57, 62, 66, 69], 3.4, 1.2), .4)
add(E + .1, chime(86, 3.0), .3, .45); add(E + .5, chime(93, 2.4), .14, .6)

fo = int(1.3 * SR)
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
