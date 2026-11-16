"""صوت فيلم «قل لنا ميزانيتك» (كله مولّد هنا). فوضى رسائل تتسارع، صمت، ضربة «خلّها علينا.»،
عدّاد الميزانية، الخيارات والختم، المهام، «نفس السعر.» بإيقاع احتفالي، والختام. التوقيتات تطابق index.html."""
import wave, numpy as np
SR, DUR = 48000, 30.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
FREEZE, HAND, BUDGET, OPTS, PICK, STAMP, TASKS, PRICE, END = 3.6, 4.0, 5.6, 11.8, 15.2, 16.0, 18.3, 23.9, 26.8
TASK_AT = [18.5, 19.8, 21.1, 22.4]
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
def tick(hi=True):
    x = np.arange(int(.05 * SR)) / SR; f = 3200 if hi else 2400
    n = rng.standard_normal(len(x)); n = n - lp(n, .3)
    return (np.sin(2 * np.pi * f * x) * .6 + n * .4) * np.exp(-x * 160)
def kick(d=.35, g=1.5):
    x = np.arange(int(d * SR)) / SR; f = 42 + 110 * np.exp(-x * 30)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 7) * g)
def heart():
    return np.concatenate([kick(.22, 1.2) * .8, np.zeros(int(.16 * SR)), kick(.22, 1.2) * .5])
def boom(ln=1.6):
    x = np.arange(int(ln * SR)) / SR; f = 28 + 80 * np.exp(-x * 5)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2) * 1.8)
def stamp():
    x = np.arange(int(.25 * SR)) / SR; n = rng.standard_normal(len(x)); n = lp(n, .15)
    return np.tanh((n * np.exp(-x * 40) * 1.5 + np.sin(2 * np.pi * 120 * x) * np.exp(-x * 25)) * 1.2)
def chime(n0, ln=1.6):
    x = np.arange(int(ln * SR)) / SR
    return sum(np.sin(2 * np.pi * note(n0) * m * x) * a for m, a in ((1, 1), (2, .4), (3, .15))) * np.exp(-x * 2.8)
def whoosh(ln=.45):
    x = np.arange(int(ln * SR)) / SR; n = rng.standard_normal(len(x))
    return lp_sweep(n, .03, .22) * np.sin(np.pi * x / ln) ** 2 * .8
def riser(ln, top=.45):
    x = np.arange(int(ln * SR)) / SR; n = rng.standard_normal(len(x))
    return lp_sweep(n, .01, top) * (x / ln) ** 2.2
def crash(ln=2.4):
    x = np.arange(int(ln * SR)) / SR; n = rng.standard_normal(len(x)); n = n - lp(n, .3)
    return n * np.exp(-x * 2.0) * .35
def snare():
    x = np.arange(int(.22 * SR)) / SR; n = rng.standard_normal(len(x)); n = n - lp(n, .1)
    return n * np.exp(-x * 18) * .7 + np.sin(2 * np.pi * 200 * x) * np.exp(-x * 30) * .4
def hat():
    x = np.arange(int(.035 * SR)) / SR; n = rng.standard_normal(len(x)); n = n - lp(n, .5)
    return n * np.exp(-x * 110) * .25


def pop(f=1400):
    x = np.arange(int(.09 * SR)) / SR; fr = f * (1 + 1.5 * np.exp(-x * 60))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * 45) * .7

# ── الفوضى: إشعار مع كل رسالة، نبض متوتر يتصاعد ──
for i in range(20):
    add(.45 + i * .15, pop(1100 + (i % 5) * 180), .35 + .02 * i, .3 + (i % 3) * .2)
hb, g = .3, .7
while hb < FREEZE - .1:
    add(hb, kick(.2, 1.3), .5); hb += g; g = max(.25, g * .9)
dr = (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 58.3 * t)) * np.clip(t / FREEZE, 0, 1) ** 1.5 * (t < FREEZE) * .12
L += dr; R += dr
add(1.6, riser(2.0, .4), .5)
L[int(FREEZE * SR):int(HAND * SR)] = 0; R[int(FREEZE * SR):int(HAND * SR)] = 0
# ── «خلّها علينا.» ──
add(HAND, boom(2.2), 1.0); add(HAND, crash(2.6), .55); add(HAND, kick(), 1.0)
e = np.clip((t - HAND) / .05, 0, 1) * np.clip((BUDGET - t) / .4, 0, 1) * (t >= HAND)
for n in (53, 57, 60, 65):
    ph = 2 * np.pi * note(n) * t; s = (np.sin(ph) + .25 * np.sin(2 * ph)) * e * .03; L += s; R += s
# ── الميزانية: نبض هادئ + ارتفاع مع العدّاد + نغمة مع كل بند ──
b = BUDGET
while b < OPTS - .3:
    add(b, kick(.3, 1.1), .45); add(b + .25, hat(), .3, .4); b += .5
add(BUDGET + .4, riser(1.9, .45), .55)
add(BUDGET + 2.3, boom(1.0), .7); add(BUDGET + 2.3, stamp(), .4)
for i in range(4): add(BUDGET + 2.9 + i * .45, chime(72 + [0, 4, 7, 12][i], 1.2), .1)
# ── الخيارات ──
for i in range(3): add(OPTS + .55 + i * .35, whoosh(.4), .5, .3 + i * .2)
add(OPTS, boom(1.0), .55)
add(PICK, whoosh(.5), .5); add(STAMP, stamp(), .9); add(STAMP, boom(1.4), .8); add(STAMP + .05, chime(79, 2.0), .12)
b = OPTS + .5
while b < TASKS - .2:
    add(b, kick(.28, 1.2), .5)
    add(b + .25, hat(), .3, .6); b += .5
# ── المهام ──
for i, a in enumerate(TASK_AT):
    add(a - .2, whoosh(.35), .45); add(a + .45, stamp(), .7); add(a + .5, chime(76 + [0, 2, 4, 7][i]), .1)
b = TASKS
k = 0
while b < PRICE - .3:
    add(b, kick(), .7)
    if k % 2: add(b, snare(), .4)
    add(b, hat(), .35, .35); add(b + .25, hat(), .3, .65); b += .5; k += 1
add(PRICE - 1.2, riser(1.2, .5), .6)
# ── «نفس السعر.» ──
add(PRICE + .8, boom(2.4), 1.0); add(PRICE + .8, crash(2.6), .65); add(PRICE + .8, kick(), 1.0)
e = np.clip((t - PRICE - .8) / .05, 0, 1) * np.clip((END + .2 - t) / .3, 0, 1)
for n in (56, 60, 63, 68):
    ph = 2 * np.pi * note(n) * t; s = (np.sin(ph) + .25 * np.sin(2 * ph)) * e * .03; L += s; R += s
b = PRICE + .8
while b < END - .01:
    add(b, kick(), .8); add(b + .25, hat(), .35, .6); b += .5
# ── الختام ──
add(END, boom(2.6), 1.0); add(END, crash(3.0), .6); add(END, kick(), 1.0)
e = np.clip((t - END) / .2, 0, 1) * (t >= END)
for n in (41, 53, 60, 65, 68, 72):
    ph = 2 * np.pi * note(n) * t; s = (np.sin(ph) + .2 * np.sin(2 * ph)) * e * .034; L += s; R += s
add(END + .3, chime(77, 3.0), .09); add(END + .8, chime(84, 2.8), .07)

fade = np.clip(t / .02, 0, 1) * np.clip((DUR - t) / 1.8, 0, 1)
st = np.stack([L * fade, R * fade], axis=1); st *= 10 ** (-3 / 20) / np.abs(st).max()
with wave.open("mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix.wav", DUR)
