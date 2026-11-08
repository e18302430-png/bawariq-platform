# دليل الإطلاق الفعلي

المنصة تعمل بوضعين:
- **وضع التجربة** (الافتراضي): بيانات أمثلة داخل المتصفح، للعرض والتطوير.
- **وضع الإنتاج**: قاعدة بيانات Supabase حقيقية، دخول برقم الجوال ورمز SMS، ورفع صور حقيقي. يتفعّل تلقائياً بمجرد إضافة متغيرين.

## 1) قاعدة البيانات (Supabase) — 15 دقيقة

1. أنشئ مشروعاً في supabase.com (اختر أقرب منطقة، مثل Frankfurt أو Mumbai، إلى أن يتوفر خيار داخل المملكة).
2. من **SQL Editor** الصق محتوى `supabase/schema.sql` وشغّله. ينشئ الجداول وسياسات الحماية وحاوية الصور.
3. من **Authentication ← Providers ← Phone** فعّل الدخول بالجوال واربط مزود SMS (Twilio أو Vonage أو MessageBird).
   - للسعودية: سجّل اسم المرسل (Sender ID) لدى هيئة الاتصالات والفضاء والتقنية عبر مزود الرسائل.
4. من **Project Settings ← API** انسخ `Project URL` و`anon public key`.

## 2) النشر (Vercel) — أربعة مشاريع مستقلة

لكل تطبيق مشروع منفصل على Vercel من نفس المستودع:

| المشروع | Build Command | Output Directory | النطاق المقترح |
|---|---|---|---|
| الموقع | `npm run build -w @munasabati/web` | `apps/web/dist` | munasabati.sa |
| العميل | `npm run build -w @munasabati/client` | `apps/client/dist` | app.munasabati.sa |
| الموردين | `npm run build -w @munasabati/vendors` | `apps/vendors/dist` | vendors.munasabati.sa |
| القاعات | `npm run build -w @munasabati/venues` | `apps/venues/dist` | venues.munasabati.sa |

- **Root Directory:** `munasabati`، و **Install Command:** `npm install`.
- **Environment Variables** لكل مشروع:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_HOME_URL=https://munasabati.sa
VITE_CLIENT_URL=https://app.munasabati.sa
VITE_VENDORS_URL=https://vendors.munasabati.sa
VITE_VENUES_URL=https://venues.munasabati.sa
```

مفتاح `anon` آمن في الواجهة لأن الحماية مطبقة بسياسات RLS في قاعدة البيانات.

## 3) قبل استقبال أول عميل

- [ ] اسم النطاق (munasabati.sa أو بديل متاح) عبر مسجّل معتمد للنطاقات السعودية.
- [ ] سجل تجاري أو وثيقة عمل حر، وحساب بنكي تجاري.
- [ ] صفحتا **سياسة الخصوصية** و**الشروط والأحكام** متوافقتان مع نظام حماية البيانات الشخصية.
- [ ] تسجيل أول الموردين والقاعات بأنفسهم من البوابات، ورفع صور حقيقية لأعمالهم.
- [ ] تجربة رحلة كاملة: عميل يطلب ← مورد يرسل عرض ← العميل يقبل.

## 4) المرحلة التالية

| الميزة | الأداة المقترحة |
|---|---|
| إرسال الدعوات وتذكيرات الحجز بالواتساب تلقائياً | WhatsApp Business API عبر Unifonic أو Twilio |
| العربون والدفع داخل المنصة | Moyasar أو Tap (بدون الاحتفاظ بأموال العملاء) |
| الفوترة الإلكترونية للعمولات والاشتراكات | مزود متوافق مع هيئة الزكاة والضريبة والجمارك |
| مسح رموز الدخول بالكاميرا | تطبيق جوال (React Native) أو مكتبة مسح في الويب مع إذن الكاميرا |
| لوحة إدارة للمنصة (اعتماد الموردين، البلاغات) | تطبيق خامس `apps/admin` على نفس النواة |
