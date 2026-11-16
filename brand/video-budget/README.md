# «قل لنا ميزانيتك»: فيلم مناسبتي للنموذج الجديد (9:16 · 30 ثانية)

**الملف النهائي:** `munasabati-budget-9x16.mp4` (1080×1920، 30 إطار، H.264 + AAC). ونسخة الموقع المضغوطة في `munasabati/apps/web/public/media/reels/budget.mp4`.

## القصة
| الوقت | المشهد |
|---|---|
| 0–3.6 | فوضى: رسائل القاعات والموردين وقروب العيلة تتكدس، والعداد «٤٧ قاعة · ٢١٣ رسالة» |
| 3.6–4.0 | سواد وصمت |
| 4.0–5.6 | «خلّها علينا.» بانفجار ضوء، والرسائل تطير |
| 5.6–11.8 | «قل لنا ميزانيتك بس»: العداد يوصل ٨٠,٠٠٠ ريال، وتوزيع الميزانية بالبنود |
| 11.8–18.3 | «٣ خيارات ضمنها خلال ٢٤ ساعة»: ثلاث قاعات، واحدة تتختار وختم «تم الحجز ✓» |
| 18.3–23.9 | «ونرتب الباقي»: الكوشة، التصوير، الضيافة، الدعوات، كل وحدة بختم |
| 23.9–26.8 | «وتدفع… نفس السعر.» «بدون أي زيادة عليك» |
| 26.8–30 | الشعار + «مناسبتك علينا.» + الرابط |

- **الصور:** صور توضيحية مولّدة بالذكاء الاصطناعي (مكتوب عليها في مشهد الخيارات، وفي الموقع).
- **الموسيقى والمؤثرات:** مولّدة بالكود في `audio/make_audio.py` (بدون أي حقوق خارجية).

## إعادة التصدير
```bash
cd audio && python3 make_audio.py && ffmpeg -y -i mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=disabled,loudnorm=I=-14:TP=-2:LRA=11,aresample=192000,alimiter=limit=0.68:attack=1:release=50:level=disabled,aresample=48000" -c:a pcm_s16le mix_master.wav && cd ..
```
```bash
python3 -m http.server 4315 &
```
```bash
PORT=4315 node render.cjs
```
```bash
ffmpeg -y -framerate 30 -i frames/f%04d.jpg -i audio/mix_master.wav -map 0:v -map 1:a -c:v libx264 -profile:v main -level:v 4.1 -preset slow -b:v 7M -maxrate 9M -bufsize 14M -pix_fmt yuv420p -r 30 -fps_mode cfr -g 60 -c:a aac -b:a 160k -ar 48000 -ac 2 -movflags +faststart -t 30 munasabati-budget-9x16.mp4
```
