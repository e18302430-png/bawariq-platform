# تشغيل مناسبتي على Vercel مع قاعدة البيانات

كل الإعدادات جاهزة في المشروع (`vercel.json`). الخطوات كلها من المتصفح، بدون كتابة كود.

## ١. انشر المنصة على Vercel
1. ادخل vercel.com وسجّل بحساب GitHub.
2. **Add New → Project**، واختر المستودع `bawariq-platform`.
3. في **Root Directory** اختر مجلد `munasabati`. باقي الإعدادات تُقرأ تلقائياً من `vercel.json`.
4. اضغط **Deploy**. بعد دقيقتين يصير عندك رابط مثل `munasabati.vercel.app`.

المنصة تشتغل الحين بوضع التجربة (البيانات داخل متصفح كل جهاز).

## ٢. أضف قاعدة البيانات من داخل Vercel
1. في مشروعك على Vercel: **Storage → Create Database → Supabase**، واختر أقرب منطقة (Frankfurt).
2. اضغط **Connect Project** واختر مشروع مناسبتي. Vercel يضيف مفاتيح قاعدة البيانات للمشروع تلقائياً، والمنصة تقرأها بدون أي إعداد.

## ٣. جهّز الجداول (مرة وحدة)
1. من صفحة قاعدة البيانات في Vercel اضغط **Open in Supabase**.
2. **SQL Editor → New query**، والصق محتوى الملف `supabase/schema.sql` كاملاً، واضغط **Run**.
3. (اختياري) الصق `supabase/seed.sql` واضغط **Run** عشان تظهر قاعات وموردون أمثلة لين يسجل التجار الحقيقيين. تقدر تحذفهم من لوحة الإدارة.

## ٤. فعّل الدخول السريع
**Authentication → Sign In / Providers → Allow anonymous sign-ins** ← فعّلها واحفظ.
العميل والتاجر يدخلون بالاسم والجوال فوراً. لما تربط مزود رسائل SMS لاحقاً، أضف في Vercel متغير `VITE_AUTH_MODE` بقيمة `phone` ويصير الدخول برمز تحقق.

## ٥. أنشئ حساب الإدارة
1. **Authentication → Users → Add user → Create new user**: بريدك وكلمة مرور قوية، وفعّل **Auto Confirm User**.
2. في **SQL Editor** شغّل (غيّر البريد لبريدك):
   ```sql
   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'بريدك@example.com');
   ```

## ٦. أعد النشر
في Vercel: **Deployments → آخر نشر → Redeploy**. من هنا كل شي حقيقي:
- طلبات العميل توصل لجوال التاجر وللإدارة مباشرة.
- لوحة الإدارة: `رابطك/admin/` بالبريد وكلمة المرور.
- رابط المنسق يشتغل من أي جوال.
- كل تعديل تدفعه على GitHub ينشر نفسه تلقائياً.

## الروابط بعد النشر
| الصفحة | الرابط |
|---|---|
| صفحة الترحيب | `/` |
| تطبيق العميل | `/client/` |
| بوابة الموردين | `/vendors/` |
| بوابة القاعات | `/venues/` |
| الإدارة (مخفية) | `/admin/` |
