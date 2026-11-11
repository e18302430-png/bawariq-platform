"""صوت فيلم «ساعة الصفر» (كله مولّد هنا). رنة جوال، صدمة الإلغاء، قلب وتكات، ركض، صمت، إشعارات العروض،
أمل يكبر، تكات تتسارع للصفر، صمت، انفجار الزفة، وختام. التوقيتات تطابق index.html."""
import wave, numpy as np
SR, DUR = 48000, 38.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(300)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
T = dict(ring=2.4, cancel=3.6, panic=6.6, run=9.4, dark=12.0, app=13.2, hall=17.2, rush=21.0, guests=24.6, zero=28.0, zaffa=29.0, men=32.4, end=34.4)

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


def tick(hi=True):
    x = np.arange(int(.05 * SR)) / SR; f = 3200 if hi else 2400
    return (np.sin(2 * np.pi * f * x) * .6 + fft_hp(rng.standard_normal(len(x)), 3000) * .4) * np.exp(-x * 160)
def ring(ln=1.2):
    x = np.arange(int(ln * SR)) / SR
    return (np.sin(2 * np.pi * 1300 * x) + np.sin(2 * np.pi * 1650 * x)) * .25 * (np.sin(2 * np.pi * 20 * x) > 0) * ((x % .6) < .4)
def shatter(ln=1.4):
    n = fft_hp(rng.standard_normal(int(ln * SR)), 2500); x = np.arange(len(n)) / SR
    return n * np.exp(-x * 4) * (1 + .6 * np.sin(2 * np.pi * 31 * x)) * .5
def tinnitus(ln=2.4):
    x = np.arange(int(ln * SR)) / SR
    return np.sin(2 * np.pi * 6200 * x) * .05 * env(len(x), .05, 1.4)
def whoosh(ln=.6):
    n = rng.standard_normal(int(ln * SR)); x = np.arange(len(n)) / SR
    return fft_lp(n, 3000) * np.sin(np.pi * x / ln) ** 2 * .5
def ding():
    return chime(88, 1.2) * .7 + chime(93, 1.2) * .3

# ── ١) هدوء، ثم الجوال يرن ──
add(0.0, pad([52, 59, 64], 3.6, .6), .2)
for k, n0 in enumerate([76, 79, 83, 79]): add(.3 + k * .55, piano(n0, 1.6, .5), .1, .4)
add(T["ring"], ring(1.2), .45, .6)

# ── ٢) «الحجز ملغي»: ضربة، تكسّر، طنين ──
C = T["cancel"] + .2
add(C, boom(2.6), 1.0); add(C, shatter(1.4), .7); add(C, tinnitus(2.6), 1.0)
add(C, pad([40, 41, 47], 2.8, .3), .3)

# ── ٣) الذعر: قلب وتكات ──
for k in range(10): add(T["panic"] + k * .55, heart(), .55)
for k in range(28): add(T["panic"] + k * .2, tick(k % 2 == 0), .25, .5)
add(T["panic"], pad([40, 46, 52], 5.4, .5), .25)

# ── ٤) الركض: إيقاع سريع، كل الأرقام مقفلة ──
for k in range(16):
    a = T["run"] + k * .16
    add(a, kick(.18, 1.3) if k % 2 == 0 else tak(), .5 if k % 2 == 0 else .3, .5)
add(T["run"], riser(2.5), .5)

# ── ٥) ظلام: صمت، نغمة وحدة ──
add(T["dark"] + .2, piano(57, 3.0, .7), .25); add(T["dark"] + .2, pad([33, 45], 1.2, .2), .2)

# ── ٦) مناسبتي: إشعارات العروض وأمل يكبر ──
A = T["app"]
add(A, pad([45, 52, 57, 61], 4.2, .8), .26)
add(A + .3, ding(), .3, .5)
for k, a in enumerate([A + 1.0, A + 1.5, A + 2.0]): add(a, chime(84 + [0, 4, 7][k], 1.4), .3, .4 + .1 * k); add(a, kick(.3, 1.0), .25)
for k in range(16): add(A + k * .25, tick(k % 2 == 0), .1, .5)
BPM = 60 / 120
b = A + 2.0
while b < T["zero"] - .2:
    add(b, kick(.3, 1.1), .32)
    add(b + BPM / 2, tak(), .15, .6)
    b += BPM

# ── ٧) القاعة على البحر ──
add(T["hall"], boom(2.0), .5); add(T["hall"], shimmer(2.6), .6)
add(T["hall"], pad([41, 53, 57, 60, 64], 4.0, 1.1), .32)
for k, n0 in enumerate([72, 76, 79, 84]): add(T["hall"] + .3 + k * .45, piano(n0, 1.8, .6), .12, .4)

# ── ٨) الورد والضيافة في الطريق ──
add(T["rush"] - .1, whoosh(.6), .5)
add(T["rush"], pad([43, 55, 59, 62, 67], 3.8, 1.1), .3)
for k in range(14): add(T["rush"] + .2 + k * .25, tak(), .2, .3 + .03 * k)

# ── ٩) الدعوة وصلت، والتكات تتسارع للصفر ──
G = T["guests"]
add(G + .5, ding(), .35)
add(G, pad([45, 57, 61, 64, 69], 3.4, 1.2), .3)
a, d = G, .5
while a < T["zero"] - .05: add(a, tick(True), .35); a += d; d = max(.07, d * .86)
add(G + .8, riser(2.6), .6)

# ── ١٠) الصفر: صمت تام، ثم انفجار الزفة ──
add(T["zero"], tick(False), .6)
Z, B = T["zaffa"], .42
add(Z, boom(2.6), 1.0); add(Z, shimmer(2.0), .7)
add(Z, pad([38, 50, 54, 57, 62], 5.4, 1.4), .34)
for k in range(int((T["end"] - Z) / B) + 1):
    a = Z + k * B
    if a >= T["end"]: break
    if k % 4 in (0, 3): add(a, doum(), .75)
    if k % 4 in (1, 2): add(a, tak(), .42, .6)
    if k % 2 == 1: add(a, clap(), .5, .4)
    add(a + B / 2, tar(), .28, .7)

# ── ١١) الختام ──
E = T["end"]
add(E, boom(2.4), .7); add(E, shimmer(3.0), .7)
add(E, pad([38, 50, 57, 62, 66, 69], 3.6, 1.2), .4)
add(E + .1, chime(86, 3.0), .3, .45); add(E + .5, chime(93, 2.4), .14, .6)
for k, n0 in enumerate([74, 78, 81, 86]): add(E + .6 + k * .2, piano(n0, 2.2, .6), .1, .4)

def gate(a, b, fade=.04):
    i0, i1, f = int(a * SR), int(b * SR), int(fade * SR)
    for ch in (L, R):
        ch[i0:i1] *= 0; ch[i0 - f:i0] *= np.linspace(1, 0, f)
gate(T["dark"], T["dark"] + .2)
gate(T["zero"] + .1, T["zaffa"])
fo = int(1.2 * SR)
for ch in (L, R): ch[-fo:] *= np.linspace(1, 0, fo) ** 2
def verb(x):
    y = x.copy()
    for d, g in ((.031, .3), (.047, .26), (.071, .22), (.113, .18), (.167, .13)):
        k = int(d * SR); y[k:] += x[:-k] * g
    return y
L, R = verb(L), verb(R)
m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * .9, R / m * .9
with wave.open("mix.wav", "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.stack([L, R], 1) * 32767).astype("<i2").tobytes())
print("ok", DUR)
