"""صوت فيلم «ريم والباب الذهبي» (كله مولّد هنا). تكات وقلق، باب سحري، قصر يطلع من الرمل، دعوات طايرة،
قهوة تنصب، ورد يتفتح، زفة، ممشى، ألعاب نارية، صحوة، وختام. التوقيتات تطابق index.html."""
import wave, numpy as np
SR, DUR = 48000, 37.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(21)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
T = dict(door=4.2, portal=7.2, palace=8.0, env=11.6, coffee=15.2, kosha=18.6, zaffa=22.0, aisle=25.0, fire=27.4, wake=30.0, end=33.6)

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


def whoosh(ln=1.0):
    n = rng.standard_normal(int(ln * SR)); x = np.arange(len(n)) / SR
    lo, hi = fft_lp(n, 700), fft_lp(n, 4500); k = np.sin(np.pi * x / ln) ** 2
    return (lo * (1 - x / ln) + hi * (x / ln)) * k * .5
def tick():
    x = np.arange(int(.05 * SR)) / SR
    return (np.sin(2 * np.pi * 3000 * x) * .6 + fft_hp(rng.standard_normal(len(x)), 3000) * .4) * np.exp(-x * 160)
def rumble(ln):
    n = fft_lp(rng.standard_normal(int(ln * SR)), 120); x = np.arange(len(n)) / SR
    return n / (np.abs(n).max() + 1e-9) * np.exp(-x * 1.2) * (1 - np.exp(-x * 20))
def pour(ln=1.8):
    n = rng.standard_normal(int(ln * SR)); x = np.arange(len(n)) / SR
    b = fft_hp(fft_lp(n, 2600), 700) * (1 + .5 * np.sin(2 * np.pi * 13 * x))
    return b * env(len(n), .15, .4) * .5
def whistle(ln=.5):
    x = np.arange(int(ln * SR)) / SR; f = 900 + 1800 * x / ln
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * .15 * env(len(x), .05, .1)
def pop():
    x = np.arange(int(1.4 * SR)) / SR; n = fft_lp(rng.standard_normal(len(x)), 3000)
    k = kick(.4, 1.3); return np.tanh(n * np.exp(-x * 9) * 2) * .8 + np.pad(k, (0, len(x) - len(k))) * .5
def crackle(ln=1.2):
    s = np.zeros(int(ln * SR))
    for _ in range(60):
        i = int(rng.random() * (len(s) - 400)); s[i:i + 300] += fft_hp(rng.standard_normal(300), 3000) * np.exp(-np.arange(300) / 40) * rng.random()
    return s * .4

# ── ١) ٣٠ يوم وألف شي: تكات تتسارع، نبض، وكل سؤال له نقرة ──
add(0.3, boom(1.6), .4)
at, b = 0.6, .5
while at < 4.0: add(at, tick(), .3, .3 + .4 * (int(at * 10) % 2)); at += b; b = max(.12, b * .9)
for k in range(10): add(1.6 + k * .2, ping(), .12, .2 + .06 * k)
add(0.0, pad([40, 47, 52], 4.2, .4), .2)
hb = 1.4
while hb < 4.0: add(hb, kick(.3, 1.1), .35); hb += .55
add(2.4, riser(1.75), .45)
add(3.6, whoosh(.6), .5)

# ── ٢) الباب الذهبي ──
add(T["door"], boom(2.2), .6); add(T["door"], shimmer(3.0), .7)
add(T["door"], pad([45, 52, 57, 61, 64], 3.2, 1.2), .3)
for k, n0 in enumerate([81, 85, 88, 93]): add(T["door"] + .3 + k * .35, chime(n0, 2.4), .14, .3 + .15 * k)
add(T["door"] + 1.2, pad([45, 57, 64, 69], 2.0, .8), .2)
add(T["portal"] - .6, riser(1.4), .55); add(T["portal"], whoosh(.8), .6)

# ── ٣) القصر يطلع من الرمل ──
P0 = T["palace"]
add(P0, boom(3.0), .9); add(P0, rumble(3.4), .7); add(P0, shimmer(2.5), .5)
add(P0, pad([38, 45, 50, 54, 57], 3.8, 1.4), .38)
for k, n0 in enumerate([62, 66, 69, 74]): add(P0 + .5 + k * .5, piano(n0 + 12, 2.0, .7), .12, .4)
add(T["env"] - .6, riser(.8), .3)

# ── ٤) الدعوات تطير ──
E0 = T["env"]
for k in range(5): add(E0 - .1 + k * .45, whoosh(.9), .35, .2 + .15 * k)
add(E0, pad([43, 50, 55, 59, 62], 3.8, 1.0), .28)
for k in range(24): add(E0 + 1.6 + rng.random() * 2.4, chime(88 + int(rng.integers(0, 3)) * 4, .8), .05, rng.random())
add(E0 + .3, shimmer(3.0), .3)

# ── ٥) القهوة تصب نفسها ──
C0 = T["coffee"]
add(C0, pour(2.2), .55, .6); add(C0, pad([40, 47, 52, 56, 59], 3.6), .3)
for k, n0 in enumerate([76, 80, 83, 88, 83, 80]): add(C0 + .4 + k * .45, piano(n0, 1.8, .6), .12, .35 + .1 * (k % 3))
add(C0 + .2, chime(84, 3.0), .1, .7)

# ── ٦) الكوشة تتفتح ──
K0 = T["kosha"]
add(K0, shimmer(3.0), .7); add(K0, pad([41, 48, 53, 57, 64], 3.6, 1.1), .32)
for k, n0 in enumerate([65, 69, 72, 76, 77, 81, 84, 88, 89, 93]): add(K0 + .1 + k * .06, piano(n0, 1.6, .5), .1, .3 + .04 * k)
add(K0 + 1.0, chime(89, 2.6), .14, .5)
add(T["zaffa"] - 1.0, riser(1.0), .35)

# ── ٧) الزفة ──
Z0, B = T["zaffa"], .42
add(Z0, boom(2.2), .8)
for k in range(int(3.0 / B) + 1):
    a = Z0 + k * B
    if a >= T["aisle"]: break
    if k % 4 in (0, 3): add(a, doum(), .7)
    if k % 4 in (1, 2): add(a, tak(), .4, .6)
    if k % 2 == 1: add(a, clap(), .45, .4)
    add(a + B / 2, tar(), .25, .7)
add(Z0, pad([50, 53, 57], 3.0, 1.3), .2)

# ── ٨) الممشى ──
A0 = T["aisle"]
add(A0, boom(2.0), .5); add(A0, shimmer(2.6), .6)
add(A0, pad([41, 53, 57, 60, 64], 2.8, 1.3), .4)
for d, n0 in [(0, 76), (.6, 74), (1.0, 72), (1.6, 77), (2.1, 76)]: add(A0 + .2 + d, piano(n0 + 12, 2.2, .8), .15, .45)

# ── ٩) الألعاب النارية ──
F0 = T["fire"]
add(F0, pad([45, 52, 57, 61, 64, 69], 2.8, 1.4), .38)
for k, d in enumerate([.2, .6, 1.0, 1.35, 1.7, 2.0, 2.3]):
    add(F0 + d - .5, whistle(.5), 1.0, .2 + .1 * k); add(F0 + d, pop(), .5, .2 + .1 * k); add(F0 + d + .2, crackle(1.0), .6, .8 - .1 * k)

# ── ١٠) الصحوة: سكون، نغمة واحدة، والبطاقة تنزل ──
W0 = T["wake"]
add(W0, shimmer(2.0), .35); add(W0 + .1, piano(76, 3.0, .7), .18, .5); add(W0 + .9, piano(81, 3.0, .6), .14, .55)
add(W0 + 1.25, kick(.3, 1.0), .25)
add(W0 + 1.4, chime(88, 2.0), .12); add(W0 + 2.2, chime(93, 2.0), .12)
add(W0, pad([57, 64, 69, 73], 3.6, .7), .18)
add(T["end"] - .7, riser(.7), .3)

# ── ١١) الختام ──
N0 = T["end"]
add(N0, boom(2.4), .7); add(N0, shimmer(3.0), .7)
add(N0, pad([38, 50, 57, 62, 66, 69], 3.4, 1.2), .4)
add(N0 + .1, chime(86, 3.0), .3, .45); add(N0 + .5, chime(93, 2.4), .14, .6)
for k, n0 in enumerate([74, 78, 81, 86]): add(N0 + .6 + k * .2, piano(n0, 2.2, .6), .1, .4)

def gate(a, b, fade=.05):
    i0, i1, f = int(a * SR), int(b * SR), int(fade * SR)
    for ch in (L, R):
        ch[i0:i1] *= 0; ch[i0 - f:i0] *= np.linspace(1, 0, f)
gate(4.12, T["door"])
gate(W0 - .08, W0)
fo = int(1.3 * SR)
for ch in (L, R): ch[-fo:] *= np.linspace(1, 0, fo) ** 2
def verb(x):
    y = x.copy()
    for d, g in ((.029, .35), (.043, .3), (.067, .25), (.101, .2), (.149, .15)):
        k = int(d * SR); y[k:] += x[:-k] * g
    return y
L, R = verb(L), verb(R)
m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * .9, R / m * .9
with wave.open("mix.wav", "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.stack([L, R], 1) * 32767).astype("<i2").tobytes())
print("ok", DUR)
