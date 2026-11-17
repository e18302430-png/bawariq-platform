"""فراش موسيقي هادي تحت صوت المنسقة (٣٢ ثانية، يتكرر بسلاسة). بدون نغمات كلمات عشان ما يتعارض مع الكلام."""
import wave, numpy as np
SR, DUR = 48000, 32.0
N = int(SR * DUR); t = np.arange(N) / SR
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)
L = np.zeros(N); R = np.zeros(N)
CH = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]
seg = DUR / len(CH)
for i, ch in enumerate(CH):
    s, e = i * seg, (i + 1) * seg
    env = np.clip((t - s) / 2.0, 0, 1) * np.clip((e + 2.0 - t) / 2.0, 0, 1) * (t >= s - 0.01) * (t < e + 2.0)
    for n in ch:
        ph = 2 * np.pi * note(n) * t; sig = (np.sin(ph) + .3 * np.sin(2.003 * ph) + .1 * np.sin(3.01 * ph)) * env * .02 * (1 + .25 * np.sin(2 * np.pi * .15 * t + n))
        L += sig * 1.05; R += sig * .95
# تكملة الحلقة: آخر أكورد يذوب في أولها
for n in CH[0]:
    env = np.clip((t - (DUR - 2.0)) / 2.0, 0, 1)
    ph = 2 * np.pi * note(n) * t; sig = (np.sin(ph) + .3 * np.sin(2.003 * ph)) * env * .02; L += sig; R += sig
b = .3
while b < DUR:
    x = np.arange(int(.25 * SR)) / SR; f = 45 + 55 * np.exp(-x * 30)
    k = np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)) * .16
    i0 = int(b * SR); L[i0:i0 + len(k)] += k[: N - i0]; R[i0:i0 + len(k)] += k[: N - i0]; b += 1.0
st = np.stack([L, R], axis=1); st *= 10 ** (-6 / 20) / np.abs(st).max()
with wave.open("bed.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("bed.wav")
