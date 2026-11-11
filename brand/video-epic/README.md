# تريلر مناسبتي (9:16 · 30 ثانية)

**الملف النهائي:** `munasabati-trailer-9x16.mp4`
- 1080×1920، و30 إطار بالثانية، و900 إطار.
- الصورة: H.264، بصيغة yuv420p، و15 ميجابت بالثانية.
- الصوت: AAC بتردد 48 كيلوهرتز، وارتفاعه -15.4 LUFS، وأعلى قمة -2.8 dBFS.

## البناء (120 نبضة بالدقيقة)
| الوقت | المشهد | التقنية |
|---|---|---|
| 0–2.5 | ومضات سينمائية تتسارع (قاعة، قهوة، ملكة، سطح، صحراء) | قطع على طبول التايكو + انقسام ألوان + ومضة |
| 2.5–4.8 | «ليلة العمر» (الحروف محشوة بصورة القاعة) ← «ما تتعاد.» | ضربة كلمة + براام + اهتزاز كاميرا |
| 4.8–5.0 | سواد وصمت | قبل السقوط |
| 5.0–7.0 | انفجار ضوء + أشعة + الشعار ← «خلّها علينا» | سقوط الإيقاع |
| 7–22 | القاعة تنحجز · الكوشة تنبني · الضيافة تجهز · الدعوات توصل · الميزانية واضحة | دفعة كاميرا سريعة ثم بطيئة، ودخول داخل الصورة مع ضبابية حركة وانقسام ألوان |
| 22–26 | «وأنت؟» ← «مع أهلك.» | لحظة هادية، وأجراس |
| 26–30 | الشعار + «مناسبتك علينا.» + الرابط | أضخم ضربة + رنين |

- **اللقطات السينمائية:** من صور هوية المنصة (`img/`).
- **البطاقتين:** الدعوة والميزانية، صور حقيقية من المنصة.
- **الموسيقى:** مولّدة بالكود (`audio/make_audio.py`).
- **التعليق الصوتي:** ما فيه.

## المعاينة والتعديل
```bash
cd brand/video-epic && python3 -m http.server 4313
```
- **الكلمات:** عناصر `.word` في `index.html`.
- **التوقيت:** `TEASE` و`HOOK` و`FEAT` و`PAY` و`END`.
- **الصور:** خلفيات `.still`.
- **شدة المؤثرات:** قيم `blur` و`split` و`flash` داخل `render()`.

## إعادة التصدير
```bash
cd audio && python3 make_audio.py && ffmpeg -y -i mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=disabled,loudnorm=I=-14:TP=-2:LRA=11,aresample=192000,alimiter=limit=0.68:attack=1:release=50:level=disabled,aresample=48000" -c:a pcm_s16le mix_master.wav && cd ..
```
```bash
python3 -m http.server 4313 &
```
```bash
node render.cjs
```
```bash
ffmpeg -y -framerate 30 -i frames/f%04d.jpg -i audio/mix_master.wav -map 0:v -map 1:a -c:v libx264 -profile:v high -preset slow -b:v 15M -maxrate 18M -bufsize 30M -pix_fmt yuv420p -r 30 -fps_mode cfr -c:a aac -b:a 192k -ar 48000 -movflags +faststart -t 30 munasabati-trailer-9x16.mp4
```
