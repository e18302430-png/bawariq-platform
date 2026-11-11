"""صوت فيديو «من الفوضى للباب» (كله مولّد هنا، بدون ملفات من برّا).
الفوضى: نبض قلب يتسارع وإشعار مع كل رسالة. التجمد: صمت. الباب: ارتفاع لامع. الطيران: ضربة وإيقاع 120.
التوقيتات تطابق T في index.html. التشغيل: python3 make_audio.py"""
import wave, numpy as np
SR, DUR = 48000, 30.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(5)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
T = {"freeze": 4.8, "draw": 5.0, "fly": 6.4, "s2": 12.4, "s3": 18.4, "s4": 23.4, "end": 27.4}

def add(at, sig, g=1.0, pan=0.5):
    i0 = int(at * SR)
    if i0 >= N or i0 < 0: return
    s = sig[: N - i0] * g
    L[i0:i0 + len(s)] += s * (1 - pan); R[i0:i0 + len(s)] += s * pan

def lp(x, k):
    y = np.empty_like(x); a = 0.0
    for i in range(len(x)): a += k * (x[i] - a); y[i] = a
    return y
def kick(d=.32):
    x = np.arange(int(d * SR)) / SR; f = 45 + 95 * np.exp(-x * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)
def heart():
    a = kick(.25) * .8; b = np.zeros(int(.18 * SR)); return np.concatenate([a, b, kick(.25) * .5])
def clap():
    x = np.arange(int(.16 * SR)) / SR; n = rng.standard_normal(len(x)); n = n - lp(n, .08)
    return n * np.exp(-x * 26) * .55
def hat(o=False):
    x = np.arange(int((.12 if o else .04) * SR)) / SR; n = rng.standard_normal(len(x)); n = n - lp(n, .45)
    return n * np.exp(-x * (25 if o else 90)) * .22
def boom(d=1.3):
    x = np.arange(int(d * SR)) / SR; f = 30 + 75 * np.exp(-x * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.4)
def riser(ln, top=.35):
    x = np.arange(int(ln * SR)) / SR; n = rng.standard_normal(len(x)); ks = np.linspace(.01, top, len(x))
    y = np.empty_like(n); a = 0.0
    for i in range(len(n)): a += ks[i] * (n[i] - a); y[i] = a
    return y * (x / ln) ** 2
def ping(n0):
    x = np.arange(int(.35 * SR)) / SR
    return (np.sin(2 * np.pi * note(n0) * x) * np.exp(-x * 14) + .6 * np.sin(2 * np.pi * note(n0 + 7) * x) * np.exp(-x * 18) * (x > .06))
def bell(n0, ln=2.4):
    x = np.arange(int(ln * SR)) / SR
    return sum(np.sin(2 * np.pi * note(n0) * m * x) * a for m, a in ((1, 1), (2, .4), (3, .15))) * np.exp(-x * 2.3)

# ── ١) الفوضى ──
at, gap = .2, .85
while at < T["freeze"] - .1:
    add(at, heart(), .55); at += gap; gap = max(.3, gap * .86)
for i in range(24):
    add(.15 + 4.4 * np.sqrt(i / 24), ping(81 + (i * 5) % 7), .09, .3 + .4 * ((i * 37) % 10) / 10)
dr = (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t)) * np.clip(t / T["freeze"], 0, 1) ** 2 * (t < T["freeze"]) * .12
L += dr; R += dr
add(T["freeze"] - 1.6, riser(1.6, .25), .35)
for w in (1.0, 2.2, 3.4): add(w, boom(.8), .45); add(w, kick(), .6)
# ── ٢) صمت عند التجمد، ثم ارتفاع لامع مع رسم الباب ──
L[int(T["freeze"] * SR):int(T["draw"] * SR)] = 0; R[int(T["freeze"] * SR):int(T["draw"] * SR)] = 0
add(T["freeze"], boom(.25), .12)
for k in range(10):
    add(T["draw"] + k * .13, ping(84 + [0, 3, 7, 10, 12, 15, 19, 22, 24, 27][k]), .05, .3 + .04 * k)
add(T["draw"], riser(1.4, .45), .55)
add(T["draw"] + .95, bell(89), .06)
# ── ٣) الطيران من الباب: ضربة، والإيقاع يبدأ ──
add(T["fly"], boom(1.6), .9); add(T["fly"], kick(), 1.0)
CH = [(6.4, 53), (10.4, 49), (14.4, 56), (18.4, 51), (22.4, 53), (26.4, 49)]
root = lambda a: [r for s, r in CH if s <= a][-1]
b = T["fly"]; k = 0
while b < T["end"] - 1e-6:
    add(b, kick(), .85)
    if k % 2: add(b, clap(), .5)
    add(b, hat(), .5, .35); add(b + .25, hat(k % 4 == 3), .45, .65)
    for off in (0, .25):
        x = np.arange(int(.22 * SR)) / SR; f = note(root(b) - 24)
        add(b + off, (np.sin(2 * np.pi * f * x) + .25 * np.sin(4 * np.pi * f * x)) * np.exp(-x * 9) * (1 - np.exp(-x * 400)), .42)
    b += .5; k += 1
for s, r in CH:
    e = np.clip((t - s) / .4, 0, 1) * np.clip((s + 4.2 - t) / .6, 0, 1) * (t < T["end"]) * (t >= T["fly"])
    for n in (r, r + 3, r + 7, r + 12):
        ph = 2 * np.pi * note(n) * t; sig = (np.sin(ph) + .2 * np.sin(2 * ph)) * e * .026
        L += sig; R += sig
mel = [65, 68, 72, 70, 68, 65, 63, 65]
for bar in np.arange(T["fly"], T["end"] - .5, 4):
    for i, n in enumerate(mel):
        a = bar + i * .5
        if a >= T["end"] - .5: break
        nn = n if root(a) in (53, 56) else n - 1
        x = np.arange(int(.45 * SR)) / SR
        add(a, np.sin(2 * np.pi * note(nn) * x) * np.exp(-x * 6), .065, .4 + .2 * (i % 2))
# ── الأبواب بين المشاهد ──
for s in ("s2", "s3", "s4"):
    add(T[s] - .55, riser(.55, .4), .4); add(T[s], boom(.7), .55)
add(T["s3"] + 2.1, bell(84), .06); add(T["s3"] + 2.15, bell(91), .04)
add(T["end"] - 1.0, riser(1.0, .5), .6)
add(T["end"], boom(1.8), .9); add(T["end"], kick(), 1.0)
e = np.clip((t - T["end"]) / .3, 0, 1) * (t >= T["end"])
for n in (53, 60, 65, 68, 72):
    ph = 2 * np.pi * note(n) * t; sig = (np.sin(ph) + .15 * np.sin(2 * ph)) * e * .034
    L += sig; R += sig
add(T["end"] + .2, bell(77, 3.5), .07); add(T["end"] + .7, bell(84, 3.5), .05)

fade = np.clip(t / .03, 0, 1) * np.clip((DUR - t) / 1.6, 0, 1)
st = np.stack([L * fade, R * fade], axis=1); st *= 10 ** (-3 / 20) / np.abs(st).max()
with wave.open("mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix.wav", DUR)
