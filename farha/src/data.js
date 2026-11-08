// بيانات تجريبية: كل الأسماء والأسعار هنا أمثلة للعرض فقط، وليست جهات حقيقية.

export const OCCASIONS = [
  { id: "wedding", name: "زواج", word: "زواج", hint: "حفل الزفاف بقسميه" },
  { id: "milka", name: "ملكة", word: "ملكة", hint: "عقد القران والشبكة" },
  { id: "grad", name: "تخرّج", word: "تخرّج", hint: "حفلة تخرج أو نجاح" },
  { id: "aqiqa", name: "عقيقة", word: "عقيقة", hint: "استقبال المولود" },
  { id: "family", name: "اجتماع عائلي", word: "لمّة", hint: "عزيمة أو لمة عائلية" },
  { id: "corp", name: "مناسبة شركة", word: "شركات", hint: "حفل أو ملتقى موظفين" },
];

export const CITIES = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "القصيم", "أبها", "تبوك"];

export const TIERS = [
  { id: "eco", name: "اقتصادي", mult: 0.7, desc: "الأساسيات بجودة ممتازة" },
  { id: "mid", name: "متوسط", mult: 1, desc: "الخيار الأكثر طلباً" },
  { id: "lux", name: "فاخر", mult: 1.7, desc: "تفاصيل فاخرة بلا تنازل" },
];

// فئات الخدمات (مأخوذة من خدمات التجهيز التي أرسلتها)
export const CATEGORIES = [
  { id: "halls", name: "القاعات وقصور الأفراح", short: "قاعات", icon: "Building2" },
  { id: "kosha", name: "الكوشة والطاولات الرجالية", short: "كوشة", icon: "Crown" },
  { id: "tents", name: "الخيام والسجاد والطاولات", short: "خيام", icon: "Tent" },
  { id: "photo", name: "استديو التصوير", short: "تصوير", icon: "Camera" },
  { id: "av", name: "السماعات والشاشات والإضاءة", short: "صوت وإضاءة", icon: "Speaker" },
  { id: "live", name: "البث المباشر", short: "بث مباشر", icon: "Radio" },
  { id: "hosp", name: "المفروشات والضيافة", short: "ضيافة", icon: "Coffee" },
  { id: "power", name: "مولدات الكهرباء", short: "مولدات", icon: "Zap" },
  { id: "stage", name: "الاستيدج وتجهيز المسرح", short: "استيدج", icon: "Theater" },
];

export const VENDORS = [
  // ── القاعات ──
  { id: "h1", type: "hall", cat: "halls", name: "قصر الندى", city: "الرياض", area: "حي الملقا", capacity: 900, menCap: 450, womenCap: 450, price: 65000, perGuest: 0, rating: 4.9, reviews: 212, hue: 38, tags: ["قسمين منفصلين", "مواقف 400 سيارة", "مطبخ داخلي"], about: "قاعة بقسمين مستقلين بمداخل منفصلة، وكوشة رئيسية بارتفاع 7 أمتار، وإضاءة معمارية قابلة للبرمجة." },
  { id: "h2", type: "hall", cat: "halls", name: "قاعة سدرة الأفراح", city: "الرياض", area: "طريق الملك سلمان", capacity: 600, menCap: 300, womenCap: 300, price: 42000, perGuest: 0, rating: 4.7, reviews: 138, hue: 330, tags: ["قسمين منفصلين", "جناح عروس", "بوفيه مفتوح"], about: "تصميم نجدي معاصر، وجناح خاص للعروس، وخدمة ضيافة متكاملة من نفس القاعة." },
  { id: "h3", type: "hall", cat: "halls", name: "دار اللؤلؤ", city: "جدة", area: "أبحر الشمالية", capacity: 1200, menCap: 500, womenCap: 700, price: 88000, perGuest: 0, rating: 4.8, reviews: 301, hue: 200, tags: ["إطلالة بحرية", "قسمين منفصلين", "ممر زفة 40م"], about: "إطلالة على البحر، وممر زفة طويل، وقسم نساء واسع بسقف مرتفع وثريات كريستال." },
  { id: "h4", type: "hall", cat: "halls", name: "قاعة الريحان", city: "جدة", area: "حي الروضة", capacity: 450, menCap: 200, womenCap: 250, price: 29000, perGuest: 0, rating: 4.5, reviews: 96, hue: 150, tags: ["سعر مناسب", "مواقف", "قسمين"], about: "قاعة متوسطة الحجم مناسبة للملكة والمناسبات العائلية، بأسعار مرنة أيام الأسبوع." },
  { id: "h5", type: "hall", cat: "halls", name: "قصر الواحة", city: "الدمام", area: "حي الشاطئ", capacity: 800, menCap: 350, womenCap: 450, price: 52000, perGuest: 0, rating: 4.7, reviews: 154, hue: 25, tags: ["حديقة خارجية", "قسمين منفصلين", "مسرح"], about: "حديقة خارجية للاستقبال، ومسرح ثابت مجهز، وقسم رجال بطابع مجلس شرقي." },
  { id: "h6", type: "hall", cat: "halls", name: "استراحة المجلس الكبير", city: "القصيم", area: "بريدة - طريق الملك عبدالعزيز", capacity: 700, menCap: 400, womenCap: 300, price: 24000, perGuest: 0, rating: 4.6, reviews: 88, hue: 45, tags: ["خيمة رجال", "مشبّات", "ذبائح من المطبخ"], about: "استراحة واسعة بخيمة رجال تقليدية ومشبّات، مع إمكانية الطبخ في الموقع." },
  { id: "h7", type: "hall", cat: "halls", name: "قاعة غيم", city: "أبها", area: "حي المنسك", capacity: 500, menCap: 250, womenCap: 250, price: 31000, perGuest: 0, rating: 4.8, reviews: 72, hue: 260, tags: ["إطلالة جبلية", "جلسات خارجية", "قسمين"], about: "قاعة على المرتفعات بإطلالة على الضباب، وجلسات خارجية دافئة في الصيف." },
  { id: "h8", type: "hall", cat: "halls", name: "قاعة الحرمين للمناسبات", city: "مكة المكرمة", area: "العوالي", capacity: 650, menCap: 300, womenCap: 350, price: 39000, perGuest: 0, rating: 4.6, reviews: 120, hue: 15, tags: ["قسمين منفصلين", "مصليات", "مواقف"], about: "قاعة مجهزة بقسمين ومصليات، وقريبة من الطرق الرئيسية." },

  // ── مزود تجهيز متكامل (مبني على وصف خدماتك) ──
  { id: "v1", type: "vendor", cat: "kosha", cats: ["kosha", "tents", "photo", "av", "live", "hosp", "power", "stage"], name: "بوارق لتجهيز المناسبات", city: "الرياض", area: "يغطي كل مناطق المملكة", price: 18000, rating: 4.9, reviews: 64, hue: 40, featured: true,
    tags: ["تجهيز متكامل", "فريق ميداني", "بث مباشر"],
    about: "نوفر خدمات تنسيق وتجهيز قاعات الأفراح والمناسبات بأعلى مستوى من الاحترافية: الكوشة والطاولات الرجالية، الخيام والسجاد والطاولات، استديو التصوير، السماعات والشاشات والإضاءة، البث المباشر، المفروشات والضيافة، مولدات الكهرباء، والاستيدج وتجهيز المسرح. تجهيز متكامل لجميع المناسبات والأفراح، مع الاهتمام بأدق التفاصيل.",
    packages: [
      { id: "p1", name: "باقة الملكة", price: 9500, items: ["كوشة نصف دائرية", "إضاءة دافئة", "مصور فوتوغرافي 4 ساعات", "ضيافة قهوة وتمر"] },
      { id: "p2", name: "باقة الفرح المتكامل", price: 24000, items: ["كوشة رئيسية وطاولات رجالية", "صوتيات وشاشتين LED", "استديو تصوير وفيديو", "بث مباشر للأهل", "مولد احتياطي"] },
      { id: "p3", name: "باقة القصر", price: 46000, items: ["استيدج ومسرح مخصص", "خيمة رجال وسجاد", "إضاءة معمارية متحركة", "فريق تصوير كامل ودرون", "ضيافة فاخرة وصبابين", "مولدين وفني طوال الحفل"] },
    ] },
  { id: "v2", type: "vendor", cat: "photo", cats: ["photo"], name: "عدسة المساء", city: "جدة", area: "جدة ومكة", price: 6500, rating: 4.8, reviews: 143, hue: 300, tags: ["مصورات نساء", "فيديو سينمائي", "تسليم 10 أيام"], about: "فريق تصوير نسائي لقسم النساء، وفيديو سينمائي قصير للعرسان." },
  { id: "v3", type: "vendor", cat: "hosp", cats: ["hosp"], name: "دلّة وفنجال", city: "الرياض", area: "الرياض والخرج", price: 4200, rating: 4.9, reviews: 210, hue: 30, tags: ["قهوجية وصبابين", "تمور فاخرة", "زي موحد"], about: "قهوجية وصبابين بزي موحد، وقهوة سعودية بالهيل والزعفران، وتمور مختارة." },
  { id: "v4", type: "vendor", cat: "av", cats: ["av", "live"], name: "صدى للصوتيات", city: "الدمام", area: "المنطقة الشرقية", price: 7800, rating: 4.6, reviews: 77, hue: 210, tags: ["شاشات LED", "بث مباشر", "منسق صوت"], about: "أنظمة صوت احترافية، وشاشات LED، وبث مباشر للضيوف خارج القاعة." },
  { id: "v5", type: "vendor", cat: "tents", cats: ["tents", "hosp"], name: "بيت الشَّعَر", city: "القصيم", area: "القصيم وحائل", price: 5500, rating: 4.7, reviews: 59, hue: 20, tags: ["خيام تراثية", "سجاد يدوي", "مشبّات"], about: "خيام تراثية وبيوت شعر، وسجاد يدوي، وجلسات أرضية للمناسبات الخارجية." },
  { id: "v6", type: "vendor", cat: "power", cats: ["power"], name: "طاقة المناسبات", city: "الرياض", area: "الوسطى", price: 2800, rating: 4.5, reviews: 41, hue: 55, tags: ["مولدات صامتة", "فني مرافق", "احتياطي"], about: "مولدات صامتة بقدرات مختلفة، مع فني مرافق طوال الحفل." },
  { id: "v7", type: "vendor", cat: "stage", cats: ["stage", "kosha"], name: "استيدج نجد", city: "الرياض", area: "الرياض والقصيم", price: 12000, rating: 4.8, reviews: 66, hue: 345, tags: ["تصميم 3D قبل التنفيذ", "مسارح متنقلة", "كوشات"], about: "نصمم لك الكوشة والمسرح ثلاثي الأبعاد قبل التنفيذ، وننفذ خلال 24 ساعة." },
];

export const vendorById = (id) => VENDORS.find((v) => v.id === id);

// تقدير التكاليف (استرشادي)
export function estimateBudget({ guests, tier }) {
  const t = TIERS.find((x) => x.id === tier) || TIERS[1];
  const g = Math.max(50, guests);
  const lines = [
    { cat: "halls", label: "القاعة", est: Math.round((18000 + g * 45) * t.mult) },
    { cat: "hosp", label: "العشاء والضيافة", est: Math.round(g * 95 * t.mult) },
    { cat: "kosha", label: "الكوشة والتنسيق", est: Math.round(9000 * t.mult) },
    { cat: "photo", label: "التصوير", est: Math.round(7000 * t.mult) },
    { cat: "av", label: "الصوت والإضاءة", est: Math.round(5000 * t.mult) },
    { cat: "other", label: "الدعوات والهدايا والطوارئ", est: Math.round(g * 12 * t.mult + 3000) },
  ];
  return { lines, total: lines.reduce((s, l) => s + l.est, 0) };
}

// حاسبة الضيافة (أرقام استرشادية تقريبية)
export function hospitality({ men, women, style = "traditional" }) {
  const total = men + women;
  const sheep = Math.ceil(men / 8) + (style === "traditional" ? Math.ceil(women / 9) : 0);
  return {
    sheep,
    rice: Math.ceil(total * 0.22),          // كجم
    coffee: Math.ceil((total * 3) / 110),    // كجم قهوة (3 فناجين للشخص)
    dates: Math.ceil(total * 0.04),          // كجم
    sweets: Math.ceil(total * 1.5),          // قطعة
    water: Math.ceil((total * 2) / 40),      // كرتون (40 عبوة)
    servers: Math.max(2, Math.ceil(men / 70)) + Math.max(2, Math.ceil(women / 70)),
    tables: Math.ceil(women / 10),
  };
}

export const SAMPLE_GUESTS = [
  ["أبو عبدالله - سعد العتيبي", "men", "groom", "yes", 3],
  ["خالد الدوسري", "men", "groom", "yes", 1],
  ["فهد القحطاني", "men", "bride", "pending", 2],
  ["محمد الشهري", "men", "groom", "no", 1],
  ["تركي المطيري", "men", "bride", "yes", 4],
  ["عبدالرحمن الغامدي", "men", "groom", "pending", 1],
  ["أم فيصل", "women", "bride", "yes", 3],
  ["نورة الحربي", "women", "bride", "yes", 2],
  ["سارة الزهراني", "women", "groom", "pending", 1],
  ["هيا السبيعي", "women", "bride", "yes", 5],
  ["العنود الشمري", "women", "groom", "no", 1],
  ["ريم العنزي", "women", "bride", "pending", 2],
];

export const SAMPLE_TASKS = [
  ["تأكيد حجز القاعة ودفع العربون", "العريس", 40, true],
  ["اختيار تصميم الكوشة", "العروس", 30, false],
  ["إرسال الدعوات لقائمة أهل العروس", "أم العروس", 25, false],
  ["الاتفاق مع القهوجية", "خالد (الأخ)", 14, false],
  ["تجهيز قائمة الأغاني والزفة", "العروس", 10, false],
  ["استلام الشبكة", "العريس", 7, false],
];

export const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));
export const sar = (n) => `${fmt(n)} ر.س`;
