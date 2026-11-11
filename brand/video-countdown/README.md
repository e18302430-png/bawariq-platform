# «العد التنازلي لليلة العمر»: فيديو مناسبتي (9:16 · 30 ثانية)

**الملف النهائي:** `munasabati-countdown-9x16.mp4`
- 1080×1920، و30 إطار بالثانية، و900 إطار.
- الصورة: H.264 (Main 4.1)، و7 ميجابت بالثانية، عشان يشتغل على أي جوال.
- الصوت: AAC بتردد 48 كيلوهرتز، وارتفاعه -14.5 LUFS، وأعلى قمة -2.4 dBFS.

## القصة
| الوقت | المشهد |
|---|---|
| 0–4 | «باقي على ليلة العمر: ٢١ يوم»، و«وما حجزت شي؟»، والساعة تتك |
| 4–18.3 | الرقم يلف (٢١ ← ١٤ ← ٧ ← ٣ ← ١)، وكل يوم تنحل مهمة بختم ذهبي: القاعة محجوزة، الكوشة تتجهز، الدعوات وصلت للضيوف، الضيافة مؤكدة، العربون محفوظ عبر المنصة |
| 18.4–20.3 | الساعات تتسارع: ٢٤ ← ١٢ ← ٦ ← ٣ ← ١ |
| 20.3–20.8 | سواد وصمت |
| 20.8–25.5 | «الليلة.» تنفجر بأضواء القاعة، و«وأنت… ولا شلت هم.» |
| 25.5–30 | الشعار + «مناسبتك علينا.» + الرابط |

- **الخلفيات:** تدخل بـ8 شرائح أفقية تنزلق من الجهتين.
- **الصور:** من هوية المنصة، والدعوة صورة حقيقية من المنصة.
- **الموسيقى:** مولّدة بالكود.

## التعديل
- **الأيام والمهام:** `DAYS`.
- **الساعات:** `HOURS`.
- **التوقيت:** `SILENT` و`NIGHT` و`END`.
- **الصوت:** `audio/make_audio.py` (نفس الأوقات).

## إعادة التصدير
```bash
cd audio && python3 make_audio.py && ffmpeg -y -i mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=disabled,loudnorm=I=-14:TP=-2:LRA=11,aresample=192000,alimiter=limit=0.68:attack=1:release=50:level=disabled,aresample=48000" -c:a pcm_s16le mix_master.wav && cd ..
```
```bash
python3 -m http.server 4314 &
```
```bash
node render.cjs
```
```bash
ffmpeg -y -framerate 30 -i frames/f%04d.jpg -i audio/mix_master.wav -map 0:v -map 1:a -c:v libx264 -profile:v main -level:v 4.1 -preset slow -b:v 7M -maxrate 9M -bufsize 14M -pix_fmt yuv420p -r 30 -fps_mode cfr -g 60 -c:a aac -b:a 160k -ar 48000 -ac 2 -movflags +faststart -t 30 munasabati-countdown-9x16.mp4
```
