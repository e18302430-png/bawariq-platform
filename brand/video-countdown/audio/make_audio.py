"""صوت فيديو العد التنازلي (كله مولّد هنا). تكات ساعة تتسارع، نبض، ضربة وختم مع كل مهمة،
تسارع الساعات، صمت، انفجار «الليلة.»، إيقاع احتفالي، وختام. التوقيتات تطابق index.html."""
import wave, numpy as np
SR, DUR = 48000, 30.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(4)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
DAYS = [4.0, 7.0, 10.0, 13.0, 15.8]
HOURS = [18.4, 18.8, 19.15, 19.45, 19.72]
SILENT, NIGHT, END = (20.3, 20.8), 20.8, 25.5

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

# ── تكات الساعة: تبدأ ثانية بثانية وتتسارع لين الصمت ──
at, gap, hi = .0, 1.0, True
while at < SILENT[0] - .02:
    add(at, tick(hi), .5, .4 if hi else .6); hi = not hi
    gap = 1.0 if at < 4 else (.5 if at < 13 else (.25 if at < 18.4 else .12)); at += gap
# نبض قلب تحت التكات
hb, g = .5, 1.0
while hb < SILENT[0] - .3:
    add(hb, heart(), .45); hb += g; g = max(.42, g * .97)
# خلفية منخفضة تتصاعد
dr = (np.sin(2 * np.pi * 55 * t) + .4 * np.sin(2 * np.pi * 82.4 * t)) * np.clip(t / SILENT[0], 0, 1) ** 1.6 * (t < SILENT[0]) * .1
L += dr; R += dr
add(.4, boom(1.2), .7)                           # ضربة «٢١»
add(1.6, stamp(), .4)                             # «وما حجزت شي؟»
# ── كل يوم: انتقال + ضربة + ختم + نغمة ──
for i, d in enumerate(DAYS):
    add(d - .3, whoosh(.4), .5); add(d, boom(1.0), .6); add(d + .6, stamp(), .7); add(d + .65, chime(76 + [0, 2, 4, 5, 7][i]), .1)
# ── الساعات: ضربات أسرع، وارتفاع ──
for h in HOURS: add(h, kick(.25), .7); add(h, whoosh(.2), .3)
add(18.3, riser(2.0, .5), .7)
L[int(SILENT[0] * SR):int(NIGHT * SR)] = 0; R[int(SILENT[0] * SR):int(NIGHT * SR)] = 0
# ── «الليلة.»: انفجار، وإيقاع احتفالي ──
add(NIGHT, boom(2.4), 1.0); add(NIGHT, crash(2.8), .7); add(NIGHT, kick(), 1.0)
CH = [(NIGHT, 53), (NIGHT + 2, 56), (NIGHT + 4, 49)]
e = np.clip((t - NIGHT) / .05, 0, 1) * np.clip((END + .2 - t) / .3, 0, 1)
for s, r in CH:
    ee = e * (t >= s) * (t < s + 2.05)
    for n in (r, r + 4 if r == 56 else r + 3, r + 7, r + 12):
        ph = 2 * np.pi * note(n) * t; sig = (np.sin(ph) + .25 * np.sin(2 * ph)) * ee * .03
        L += sig; R += sig
b = NIGHT; k = 0
while b < END - .01:
    add(b, kick(), .8)
    if k % 2: add(b, snare(), .5)
    add(b, hat(), .45, .35); add(b + .25, hat(), .35, .65)
    b += .5; k += 1
add(END - 1.0, riser(1.0, .5), .6)
# ── الختام ──
add(END, boom(2.6), 1.0); add(END, crash(3.0), .6); add(END, kick(), 1.0)
e = np.clip((t - END) / .2, 0, 1) * (t >= END)
for n in (41, 53, 60, 65, 68, 72):
    ph = 2 * np.pi * note(n) * t; sig = (np.sin(ph) + .2 * np.sin(2 * ph)) * e * .034
    L += sig; R += sig
add(END + .3, chime(77, 3.2), .09); add(END + .8, chime(84, 3.0), .07)

fade = np.clip(t / .02, 0, 1) * np.clip((DUR - t) / 1.8, 0, 1)
st = np.stack([L * fade, R * fade], axis=1); st *= 10 ** (-3 / 20) / np.abs(st).max()
with wave.open("mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix.wav", DUR)
