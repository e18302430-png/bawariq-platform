"""موسيقى «منسقتك تكلمك» في واجهة مناسبتي (كلها مولّدة هنا، بدون أي حقوق خارجية).
نغمة لكل كلمة على إيقاع الكلام، نفَس قبل كل جملة، ضربة وبريق مع الجمل الكبيرة، وختام بأكورد.
التوقيتات تطابق LINES في munasabati/apps/web/src/HeroTalk.tsx."""
import wave, numpy as np
SR, DUR = 48000, 27.5
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(21)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
WORD = 0.21
LINES = [(0.4, 3, True), (2.6, 8, False), (6.6, 3, True), (8.8, 4, False), (11.0, 4, False), (13.4, 8, False), (16.6, 9, False), (20.4, 7, True), (23.6, 3, True)]
END = 26.0
def add(at, sig, g=1.0, pan=.5):
    i0 = int(at * SR)
    if i0 >= N or i0 < 0: return
    s = sig[:N - i0] * g; L[i0:i0 + len(s)] += s * (1 - pan); R[i0:i0 + len(s)] += s * pan
def lp(x, k):
    y = np.empty_like(x); a = 0.0
    for i in range(len(x)): a += k * (x[i] - a); y[i] = a
    return y
def lp_sweep(x, k0, k1):
    ks = np.linspace(k0, k1, len(x)); y = np.empty_like(x); a = 0.0
    for i in range(len(x)): a += ks[i] * (x[i] - a); y[i] = a
    return y
def pluck(f, ln=.45):
    x = np.arange(int(ln * SR)) / SR
    return (np.sin(2 * np.pi * f * x) + .35 * np.sin(4 * np.pi * f * x) + .12 * np.sin(6 * np.pi * f * x)) * np.exp(-x * 9) * (1 - np.exp(-x * 400))
def bell(f, ln=2.4):
    x = np.arange(int(ln * SR)) / SR
    return sum(np.sin(2 * np.pi * f * m * x) * a * np.exp(-x * d) for m, a, d in ((1, 1, 2.2), (2.76, .35, 3.5), (5.4, .15, 5)))
def boom(ln=1.8):
    x = np.arange(int(ln * SR)) / SR; f = 30 + 70 * np.exp(-x * 6)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.4) * 1.6)
def whoosh(ln=.6):
    x = np.arange(int(ln * SR)) / SR; n = rng.standard_normal(len(x))
    return lp_sweep(n, .02, .2) * np.sin(np.pi * x / ln) ** 2
def breath(ln=.5):
    x = np.arange(int(ln * SR)) / SR; n = rng.standard_normal(len(x)); n = lp(n, .08)
    return n * np.sin(np.pi * x / ln) ** 2 * .5
def shimmer(ln=2.0):
    x = np.arange(int(ln * SR)) / SR; out = np.zeros(len(x))
    for k in range(14):
        f = note(84 + [0, 2, 4, 7, 9][k % 5] + 12 * (k % 2)); st = int(k * .08 * SR)
        seg = np.sin(2 * np.pi * f * x[: len(x) - st]) * np.exp(-x[: len(x) - st] * 4)
        out[st:] += seg * .12
    return out
# ── فراش هادئ (pad) يتنفس، يتغير الأكورد مع المقاطع ──
CH = [(0, [50, 57, 62, 66]), (6.6, [47, 54, 59, 62]), (11.0, [43, 50, 55, 59]), (16.6, [45, 52, 57, 61]), (20.4, [50, 57, 62, 66, 69])]
for i, (s, ch) in enumerate(CH):
    e_ = CH[i + 1][0] if i + 1 < len(CH) else DUR
    env = np.clip((t - s) / 1.2, 0, 1) * np.clip((e_ + .8 - t) / 1.2, 0, 1) * (t >= s)
    for n_ in ch:
        ph = 2 * np.pi * note(n_) * t; sig = (np.sin(ph) + .3 * np.sin(2.003 * ph)) * env * .018 * (1 + .25 * np.sin(2 * np.pi * .2 * t))
        L += sig * 1.05; R += sig * .95
# نبض خفيف مثل القلب
b = .4
while b < END:
    x = np.arange(int(.25 * SR)) / SR; f = 45 + 60 * np.exp(-x * 30)
    add(b, np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)) , .22); b += .857
# ── الجمل ──
SCALE = [62, 64, 66, 69, 71, 74, 76, 78]
for li, (s, n_words, big) in enumerate(LINES):
    add(s - .45, breath(.5), .55); add(s - .3, whoosh(.5), .35, .3 + .4 * (li % 2))
    if big: add(s, boom(1.6), .55); add(s + .05, shimmer(2.0), .9); add(s, bell(note(SCALE[li % 8] + 12), 2.6), .07)
    for w in range(n_words):
        pitch = note(SCALE[(li * 3 + w * 2) % len(SCALE)])
        add(s + .12 + w * WORD, pluck(pitch), .07 + (.03 if big else 0), .35 + .3 * ((w % 3) / 2))
# ── الختام: «يلا نبدأ؟» ──
x = np.arange(int(2.0 * SR)) / SR; n = rng.standard_normal(len(x))
add(23.6 - 2.0, lp_sweep(n, .01, .35) * (x / 2.0) ** 2.2, .5)
add(23.6, boom(2.6), .9)
e_ = np.clip((t - 23.6) / .1, 0, 1) * (t >= 23.6)
for n_ in (38, 50, 57, 62, 66, 69, 74):
    ph = 2 * np.pi * note(n_) * t; sig = (np.sin(ph) + .25 * np.sin(2 * ph)) * e_ * .03 * np.exp(-(t - 23.6).clip(0) * .35)
    L += sig; R += sig
add(23.7, bell(note(86), 3.2), .1); add(24.1, bell(note(90), 3.0), .07)
fade = np.clip(t / .05, 0, 1) * np.clip((DUR - t) / 1.4, 0, 1)
st = np.stack([L * fade, R * fade], axis=1); st *= 10 ** (-3 / 20) / np.abs(st).max()
with wave.open("talk.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("talk.wav", DUR)
