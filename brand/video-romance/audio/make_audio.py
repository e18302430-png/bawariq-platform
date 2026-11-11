"""موسيقى فيلم «ليلتي» (كلها مولّدة هنا، بدون مقاطع خارجية).
بيانو وأوتار ناعمة، نبض قلب وإشعارات في لحظة الخوف، صمت، لمعة الشعار، طبول زفة مع دخول البشوت،
صمت قبل الممشى ثم انفجار أوتار، وختام. التوقيتات تطابق index.html."""
import wave, numpy as np
SR, DUR = 48000, 33.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
LOGO, ZAFFA, GROOM, SILENT, AISLE, END = 12.9, 16.4, 19.4, (22.4, 23.0), 23.0, 30.0

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

# ── ١) البداية: ذكرى ودفء (لا صغير ← فا ← دو ← صول) ──
CH = [(0.0, [57, 60, 64]), (2.1, [53, 57, 60]), (4.2, [48, 52, 55]), (6.3, [55, 59, 62])]
for a, ns in CH: add(a, pad(ns, 2.6), .22)
ARP = [69, 72, 76, 72, 65, 69, 72, 69, 64, 67, 72, 67, 62, 67, 71, 74]
for i, n0 in enumerate(ARP): add(.15 + i * .525, piano(n0 + 12 * (i % 4 == 2), 2.0, .85 if i % 4 == 0 else .55), .16, .35 + .3 * (i % 2))
add(4.2, chime(84, 3.5), .05, .7)

# ── ٢) الخوف: الألوان تبرد، قلب يدق ويتسارع، إشعارات، ثم صمت ──
add(8.2, pad([45, 48, 52, 53], 4.6, .4), .25)
beat, at = .9, 8.4
while at < 12.3:
    add(at, heart(), .55); at += beat; beat = max(.42, beat * .9)
for a in (9.3, 9.8, 10.25, 10.7, 11.1): add(a, ping(), .22, .3 + .4 * rng.random())
add(10.3, riser(2.1), .35)

# ── ٣) «لين جات مناسبتي»: نفَس، ثم لمعة ونور ──
add(12.9, pad([45, 52], 1.0, .2), .12)
add(13.5, chime(81, 3.5), .3, .45); add(13.5, chime(88, 3.0), .14, .6); add(13.5, shimmer(3.0), .6)
add(13.5, pad([53, 57, 60, 65], 3.2), .28)
add(13.5, boom(2.0), .35)
for i, n0 in enumerate([77, 76, 72, 69]): add(14.3 + i * .4, piano(n0, 1.8, .7), .14, .6)
add(15.2, riser(1.2), .3)

# ── ٤) الزفة: دخول البشوت (طبل، تصفيق، دف) ──
B = .42
add(ZAFFA, boom(2.2), .8); add(ZAFFA, shimmer(1.5), .5)
for k in range(int((GROOM - ZAFFA) / B) + 1):
    a = ZAFFA + k * B
    if a >= GROOM + .1: break
    if k % 4 in (0, 3): add(a, doum(), .7)
    if k % 4 in (1, 2): add(a, tak(), .4, .6)
    if k % 2 == 1: add(a, clap(), .45, .4)
    add(a + B / 2, tar(), .25, .7)
add(ZAFFA, pad([50, 53, 57], 3.2, 1.3), .2)
for i, n0 in enumerate([74, 77, 76, 74, 72, 74]): add(ZAFFA + .2 + i * .42 * 1, piano(n0, .9, .6), .1, .5)

# ── ٥) العريس: الأوتار ترجع، دافية ──
add(GROOM, pad([48, 52, 55, 59], 3.2), .26)
for i, n0 in enumerate([76, 79, 83, 79, 76, 72]): add(GROOM + .1 + i * .5, piano(n0, 2.0, .6), .14, .4 + .2 * (i % 2))
add(21.3, riser(1.1), .25)

# ── ٦) صمت قصير، ثم الممشى: انفجار أوتار ولمعة ──
add(AISLE, boom(2.6), .6)
add(AISLE, pad([41, 53, 57, 60, 64], 4.4, 1.4), .42)
add(AISLE, shimmer(4.0), .9); add(AISLE, chime(84, 4.0), .22, .55)
MEL = [(0, 76), (.75, 74), (1.25, 72), (2.0, 77), (2.75, 76), (3.4, 72)]
for d, n0 in MEL: add(AISLE + .3 + d, piano(n0 + 12, 2.4, .8), .16, .45)
add(27.0, pad([48, 52, 55, 60], 3.2), .3)
for i, n0 in enumerate([72, 76, 79, 84]): add(27.0 + i * .55, piano(n0, 2.2, .6), .14, .4 + .2 * (i % 2))

# ── ٧) الختام: الشعار ──
add(END, boom(2.2), .45); add(END, shimmer(3.0), .7)
add(END, pad([45, 57, 60, 64, 69], 3.0, 1.1), .38)
add(END, chime(81, 3.0), .3, .45); add(END + .6, chime(88, 2.4), .14, .6)

# الصمت فعلاً صامت، وخفوت في النهاية
def gate(a, b, fade=.08):
    i0, i1, f = int(a * SR), int(b * SR), int(fade * SR)
    for ch in (L, R):
        ch[i0:i1] *= 0
        ch[i0 - f:i0] *= np.linspace(1, 0, f)
gate(12.45, 12.9)
gate(SILENT[0], SILENT[1] - .02)
fo = int(1.2 * SR)
for ch in (L, R): ch[-fo:] *= np.linspace(1, 0, fo) ** 2

# صدى بسيط (غرفة ناعمة)
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
