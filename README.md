# بوارق — Bawariq

متجر إلكتروني Premium لأكواب "بوارق" — تجربة قصصية مبنية بالكامل حول فكرة
"وش طلع لك؟"، مصممة للتحويل بأعلى احتمال ممكن.

## التقنيات

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion (scroll storytelling, micro-interactions)
- Zustand (سلة المشتريات)

## التشغيل محليًا

```bash
npm install
npm run dev
```

## البنية

- `src/app` — صفحات الموقع (الرئيسية، الأكواب، صفحة المنتج، السلة، الدفع)
- `src/components` — مكونات الواجهة (hero, story, product, cart, social, layout)
- `src/lib` — بيانات المنتجات (placeholder)، متجر السلة، نظام التحليلات، الخطوط، الحركة

## ملاحظات مهمة قبل الإطلاق

- **الأسعار وبيانات المنتجات** في `src/lib/products.ts` بيانات تجريبية (placeholder) — لازم تحديثها ببيانات حقيقية.
- **رسوم الشحن وطريقة الدفع** في `src/app/checkout/page.tsx` تجريبية — تحتاج ربط ببوابة دفع حقيقية ومنطق شحن فعلي.
- **صور المنتجات** حاليًا رسوم توضيحية (line-art SVG) بدل تصوير فوتوغرافي حقيقي — يفضل استبدالها بصور احترافية.
- **التقييمات ومحتوى UGC** فاضية عمدًا (لا توجد بيانات مزيفة) — جاهزة للربط بمصدر حقيقي.
- **الفيديو** في `public/video/hero-source.mp4` هو فيديو المنتج الأساسي (Hero) — الصورة المصغّرة (poster) في `public/images/hero-poster.jpg` مولّدة تصميميًا لحين توفر لقطة حقيقية من الفيديو.
- **رابط الموقع** (`SITE_URL`) في `layout.tsx` / `sitemap.ts` / `robots.ts` placeholder — يجب تحديثه بالدومين الفعلي.
