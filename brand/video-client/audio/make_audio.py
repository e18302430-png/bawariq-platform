"""موسيقى وإيقاع فيديو العميل (١٢٠ نبضة بالدقيقة)، كلها مولّدة هنا بدون ملفات من برّا.
التوقيتات تطابق الخط الزمني في index.html. التشغيل: python3 make_audio.py"""
import wave, numpy as np
SR, DUR, BEAT = 48000, 32.0, 0.5
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)

def add(at, sig, g=1.0, pan=0.5):
    """يضيف صوت عند وقت معين، مع توزيع بسيط بين اليسار واليمين"""
    i0 = int(at * SR)
    if i0 >= N: return
    s = sig[: N - i0] * g
    L[i0:i0 + len(s)] += s * (1 - pan)
    R[i0:i0 + len(s)] += s * pan

def lp(x, k):
    y = np.empty_like(x); a = 0.0
    for i in range(len(x)): a += k * (x[i] - a); y[i] = a
    return y

def kick():
    x = np.arange(int(.32 * SR)) / SR
    f = 45 + 95 * np.exp(-x * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)
def clap():
    x = np.arange(int(.16 * SR)) / SR
    n = rng.standard_normal(len(x)); n = n - lp(n, .08)
    return n * np.exp(-x * 26) * .55
def hat(o=False):
    x = np.arange(int((.12 if o else .04) * SR)) / SR
    n = rng.standard_normal(len(x)); n = n - lp(n, .45)
    return n * np.exp(-x * (25 if o else 90)) * .22
def boom():
    x = np.arange(int(1.2 * SR)) / SR
    f = 32 + 70 * np.exp(-x * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.6)
def riser(ln):
    x = np.arange(int(ln * SR)) / SR
    n = rng.standard_normal(len(x)); ks = np.linspace(.01, .35, len(x))
    y = np.empty_like(n); a = 0.0
    for i in range(len(n)): a += ks[i] * (n[i] - a); y[i] = a
    return y * (x / ln) ** 2 * .9
def bell(n0, ln=2.2):
    x = np.arange(int(ln * SR)) / SR
    return sum(np.sin(2 * np.pi * note(n0) * m * x) * a for m, a in ((1, 1), (2, .4), (3, .15))) * np.exp(-x * 2.4)

# ── الخطاف (٠–٤): ضربة قوية على كل كلمة، ثم «مناسبتك علينا.» ──
for at in (0, .5, 1, 1.5):
    add(at, kick(), .9); add(at, boom(), .35)
add(1.5, riser(.5), .25, .5)
add(2.0, boom(), .7); add(2.0, kick(), 1.0); add(2.0, clap(), .6)
add(2.5, kick(), .6); add(3.0, kick(), .7); add(3.5, kick(), .6)
add(3.3, riser(.7), .45)

# ── الإيقاع الأساسي من ٤ إلى ٢٧ ──
CH = [(4, 53), (8, 49), (12, 56), (16, 51), (20, 53), (24, 49)]    # Fm Db Ab Eb Fm Db
def root(at): return [r for s, r in CH if s <= at][-1]
b = 4.0
while b < 27 - 1e-6:
    k = int(round((b - 4) / BEAT))
    add(b, kick(), .85)
    if k % 2 == 1: add(b, clap(), .5)
    add(b, hat(), .5, .35); add(b + .25, hat(k % 4 == 3), .45, .65)
    # باص نابض على الثُمن
    for off in (0, .25):
        x = np.arange(int(.22 * SR)) / SR; f = note(root(b) - 24)
        bs = (np.sin(2 * np.pi * f * x) + .25 * np.sin(4 * np.pi * f * x)) * np.exp(-x * 9) * (1 - np.exp(-x * 400))
        add(b + off, bs, .42)
    b += BEAT
# أكوردات خلفية
for s, r in CH:
    e = np.clip((t - s) / .4, 0, 1) * np.clip((s + 4.2 - t) / .6, 0, 1) * (t < 27)
    for n in (r, r + 3, r + 7, r + 12):
        ph = 2 * np.pi * note(n) * t
        sig = (np.sin(ph) + .2 * np.sin(2 * ph)) * e * .028
        L += sig * 1.0; R += sig * 1.0
# لحن قصير يتكرر كل مقطعين
mel = [65, 68, 72, 70, 68, 65, 63, 65]
for bar in range(4, 27, 4):
    for i, n in enumerate(mel):
        at = bar + i * .5
        if at >= 26.5: break
        nn = n if root(at) in (53, 56) else n - 1
        x = np.arange(int(.45 * SR)) / SR
        add(at, np.sin(2 * np.pi * note(nn) * x) * np.exp(-x * 6), .07, .4 + .2 * (i % 2))

# ── لحظات الانتقال ──
add(9.6, riser(.4), .22); add(10.0, clap(), .5)                    # انتقال سريع للجانب
add(15.2, riser(.8), .5); add(16.0, boom(), .7)                     # الدخول داخل الدعوة
add(18.2, bell(84), .06); add(18.25, bell(91), .04)                 # فتح الدعوة
add(21.6, riser(.4), .25); add(22.0, clap(), .5)                    # الرجوع للجوال
add(26.0, riser(1.0), .6)                                           # قبل الختام
add(27.0, boom(), .85); add(27.0, kick(), 1.0)
# ── الختام: أكورد مفتوح وجرس ──
e = np.clip((t - 27) / .3, 0, 1) * (t >= 27)
for n in (53, 60, 65, 68, 72):
    ph = 2 * np.pi * note(n) * t
    sig = (np.sin(ph) + .15 * np.sin(2 * ph)) * e * .035
    L += sig; R += sig
add(27.2, bell(77, 3.5), .07); add(27.7, bell(84, 3.5), .05)

fade = np.clip(t / .05, 0, 1) * np.clip((DUR - t) / 1.8, 0, 1)
st = np.stack([L * fade, R * fade], axis=1)
st *= 10 ** (-3 / 20) / np.abs(st).max()
with wave.open("mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix.wav", DUR)
