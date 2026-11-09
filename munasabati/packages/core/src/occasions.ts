import type { CategoryId, OccasionId, ProgramItem } from "./types";

/*
  نظام مستقل لكل مناسبة: هدفها، وبنودها، وتوزيع ميزانيتها، وبرنامجها، ونص دعوتها، ومهام العائلة.
  العميل يختار نوع المناسبة، وكل شي بعدها يتشكّل عليها تلقائياً.
*/
export type PlanCat = "venue" | CategoryId | "other";
export type Place = "hall" | "istiraha" | "home";

export interface OccasionProfile {
  id: OccasionId;
  /** هدف المناسبة بجملة: يظهر للعميل في كل مكان */
  goal: string;
  /** نوع المكان الأنسب، والخيارات المتاحة للعميل */
  places: Place[];
  venueLabel: string;
  /** المناسبة فيها قسم رجال وقسم نساء */
  sections: boolean;
  guests: { def: number; min: number; max: number; step: number };
  /** ميزانية مقترحة للبداية (يقدر العميل يغيرها) */
  budgetHint: number;
  /** توزيع الميزانية على البنود (مجموعها ١) */
  split: { cat: PlanCat; label: string; pct: number }[];
  /** البنود الأساسية اللي نتابعها في رحلة العميل */
  essentials: { cat: CategoryId; label: string }[];
  program: ProgramItem[];
  inviteMessage: string;
  /** [المهمة، مين، كم يوم قبل] */
  tasks: [string, string, number][];
}

export const PLACE_LABEL: Record<Place, string> = { hall: "قاعة", istiraha: "استراحة", home: "في البيت" };

export const OCCASION_PROFILES: Record<OccasionId, OccasionProfile> = {
  wedding: {
    id: "wedding", goal: "ليلة العمر تمشي كاملة بلا تعب، من الكوشة لآخر ضيف",
    places: ["hall", "istiraha"], venueLabel: "القاعة", sections: true,
    guests: { def: 400, min: 50, max: 1500, step: 50 }, budgetHint: 120000,
    split: [
      { cat: "venue", label: "القاعة", pct: 0.32 }, { cat: "hosp", label: "العشاء والضيافة", pct: 0.27 },
      { cat: "kosha", label: "الكوشة والتنسيق", pct: 0.12 }, { cat: "photo", label: "التصوير", pct: 0.08 },
      { cat: "coffee", label: "القهوجية والصبابين", pct: 0.05 }, { cat: "av", label: "الصوت والإضاءة", pct: 0.05 },
      { cat: "beauty", label: "المكياج والتجميل", pct: 0.04 }, { cat: "cake", label: "الكيك والحلويات", pct: 0.03 },
      { cat: "gifts", label: "التوزيعات", pct: 0.02 }, { cat: "other", label: "الطوارئ", pct: 0.02 },
    ],
    essentials: [{ cat: "kosha", label: "الكوشة" }, { cat: "photo", label: "التصوير" }, { cat: "hosp", label: "الضيافة" }],
    program: [{ title: "الاستقبال", time: "20:30" }, { title: "الزفّة", time: "22:30" }, { title: "العشاء", time: "23:30" }],
    inviteMessage: "وبحضوركم تكتمل فرحتنا",
    tasks: [["تحديد قائمة الضيوف", "العائلة", 60], ["اختيار الفستان", "العروس", 45], ["تأكيد القاعة والعشاء", "العريس", 40], ["إرسال الدعوات", "العائلة", 21], ["تجربة المكياج", "العروس", 10], ["تأكيد الحضور النهائي", "العائلة", 3]],
  },
  milka: {
    id: "milka", goal: "ملكة أنيقة تفرحون فيها وتصوّرونها، بدون لف ودوران",
    places: ["istiraha", "hall", "home"], venueLabel: "المكان", sections: true,
    guests: { def: 120, min: 20, max: 400, step: 10 }, budgetHint: 35000,
    split: [
      { cat: "venue", label: "المكان", pct: 0.22 }, { cat: "hosp", label: "الضيافة والعشاء", pct: 0.25 },
      { cat: "kosha", label: "الكوشة والتنسيق", pct: 0.18 }, { cat: "photo", label: "التصوير", pct: 0.1 },
      { cat: "coffee", label: "القهوجية", pct: 0.07 }, { cat: "cake", label: "الكيك والشوكولاتة", pct: 0.07 },
      { cat: "beauty", label: "المكياج", pct: 0.05 }, { cat: "gifts", label: "التوزيعات", pct: 0.04 }, { cat: "other", label: "الطوارئ", pct: 0.02 },
    ],
    essentials: [{ cat: "kosha", label: "الكوشة" }, { cat: "photo", label: "التصوير" }, { cat: "cake", label: "الكيك" }],
    program: [{ title: "وصول الضيوف", time: "20:00" }, { title: "عقد القران", time: "21:00" }, { title: "تقطيع الكيك", time: "21:45" }, { title: "العشاء", time: "22:30" }],
    inviteMessage: "يسعدنا حضوركم ملكة أبنائنا",
    tasks: [["تحديد موعد المأذون", "العريس", 30], ["اختيار الكوشة والكيك", "العروس", 21], ["إرسال الدعوات", "العائلة", 14], ["تأكيد الضيافة", "العائلة", 5]],
  },
  grad: {
    id: "grad", goal: "حفلة تخرّج تليق بالتعب، صور حلوة وذكرى ما تنسى",
    places: ["istiraha", "hall", "home"], venueLabel: "المكان", sections: false,
    guests: { def: 60, min: 10, max: 300, step: 10 }, budgetHint: 12000,
    split: [
      { cat: "venue", label: "المكان", pct: 0.18 }, { cat: "kosha", label: "الديكور والتنسيق", pct: 0.27 },
      { cat: "cake", label: "الكيك والحلويات", pct: 0.13 }, { cat: "photo", label: "التصوير", pct: 0.15 },
      { cat: "hosp", label: "الضيافة", pct: 0.15 }, { cat: "gifts", label: "التوزيعات", pct: 0.07 }, { cat: "av", label: "الصوت", pct: 0.03 }, { cat: "other", label: "الطوارئ", pct: 0.02 },
    ],
    essentials: [{ cat: "kosha", label: "الديكور" }, { cat: "cake", label: "الكيك" }, { cat: "photo", label: "التصوير" }],
    program: [{ title: "الاستقبال", time: "19:30" }, { title: "زفّة الخريج", time: "20:30" }, { title: "تقطيع الكيك", time: "21:00" }, { title: "العشاء", time: "21:30" }],
    inviteMessage: "تخرّجنا، وفرحتنا ما تكمل إلا بكم",
    tasks: [["اختيار ثيم الحفلة", "الخريج", 21], ["حجز التصوير", "العائلة", 14], ["إرسال الدعوات", "العائلة", 10], ["تجهيز الكيك والتوزيعات", "العائلة", 4]],
  },
  aqiqa: {
    id: "aqiqa", goal: "عقيقة مرتبة، ذبائحها جاهزة وضيوفك مرتاحين",
    places: ["istiraha", "home", "hall"], venueLabel: "المكان", sections: true,
    guests: { def: 100, min: 20, max: 500, step: 10 }, budgetHint: 20000,
    split: [
      { cat: "venue", label: "المكان", pct: 0.18 }, { cat: "hosp", label: "الذبائح والضيافة", pct: 0.45 },
      { cat: "coffee", label: "القهوجية", pct: 0.1 }, { cat: "kosha", label: "التنسيق والطاولات", pct: 0.1 },
      { cat: "photo", label: "التصوير", pct: 0.07 }, { cat: "gifts", label: "توزيعات المولود", pct: 0.08 }, { cat: "other", label: "الطوارئ", pct: 0.02 },
    ],
    essentials: [{ cat: "hosp", label: "الذبائح" }, { cat: "coffee", label: "القهوجية" }, { cat: "gifts", label: "التوزيعات" }],
    program: [{ title: "الاستقبال", time: "19:30" }, { title: "العشاء", time: "21:00" }],
    inviteMessage: "رزقنا الله مولوداً، ويسعدنا تشريفكم عقيقته",
    tasks: [["تحديد عدد الذبائح", "الأب", 14], ["حجز المكان", "الأب", 12], ["إرسال الدعوات", "العائلة", 7], ["تجهيز التوزيعات", "الأم", 3]],
  },
  birthday: {
    id: "birthday", goal: "عيد ميلاد مبهج بثيم حلو وكيكة يتكلمون عنها",
    places: ["home", "istiraha", "hall"], venueLabel: "المكان", sections: false,
    guests: { def: 30, min: 5, max: 200, step: 5 }, budgetHint: 6000,
    split: [
      { cat: "venue", label: "المكان", pct: 0.15 }, { cat: "kosha", label: "الديكور والبالونات", pct: 0.3 },
      { cat: "cake", label: "الكيك والحلويات", pct: 0.2 }, { cat: "photo", label: "التصوير", pct: 0.12 },
      { cat: "hosp", label: "الضيافة", pct: 0.13 }, { cat: "gifts", label: "التوزيعات", pct: 0.08 }, { cat: "other", label: "الطوارئ", pct: 0.02 },
    ],
    essentials: [{ cat: "kosha", label: "الديكور" }, { cat: "cake", label: "الكيك" }, { cat: "photo", label: "التصوير" }],
    program: [{ title: "وصول الضيوف", time: "18:00" }, { title: "الألعاب", time: "18:45" }, { title: "تقطيع الكيك", time: "19:30" }],
    inviteMessage: "تعالوا نحتفل سوا، فرحتنا تكبر فيكم",
    tasks: [["اختيار الثيم", "العائلة", 14], ["طلب الكيك", "العائلة", 7], ["إرسال الدعوات", "العائلة", 7], ["تجهيز التوزيعات", "العائلة", 2]],
  },
  family: {
    id: "family", goal: "عزيمة كريمة وجلسة مريحة، والضيافة على أصولها",
    places: ["home", "istiraha", "hall"], venueLabel: "المكان", sections: true,
    guests: { def: 50, min: 10, max: 400, step: 10 }, budgetHint: 10000,
    split: [
      { cat: "venue", label: "المكان", pct: 0.22 }, { cat: "hosp", label: "العشاء والضيافة", pct: 0.42 },
      { cat: "coffee", label: "القهوجية", pct: 0.12 }, { cat: "tents", label: "الجلسات والخيام", pct: 0.1 },
      { cat: "av", label: "الصوت والإضاءة", pct: 0.05 }, { cat: "gifts", label: "الطيب والتوزيعات", pct: 0.06 }, { cat: "other", label: "الطوارئ", pct: 0.03 },
    ],
    essentials: [{ cat: "hosp", label: "العشاء" }, { cat: "coffee", label: "القهوجية" }],
    program: [{ title: "الاستقبال", time: "19:30" }, { title: "العشاء", time: "21:00" }],
    inviteMessage: "يسعدنا تشريفكم، والمجلس ما يحلى إلا بكم",
    tasks: [["تحديد المعازيم", "العائلة", 10], ["حجز الضيافة", "العائلة", 7], ["إرسال الدعوات", "العائلة", 5]],
  },
  corp: {
    id: "corp", goal: "فعالية شركة احترافية تمشي بالدقيقة وتبيّض الوجه",
    places: ["hall", "istiraha"], venueLabel: "القاعة", sections: false,
    guests: { def: 150, min: 20, max: 2000, step: 10 }, budgetHint: 60000,
    split: [
      { cat: "venue", label: "القاعة", pct: 0.3 }, { cat: "hosp", label: "الضيافة والعشاء", pct: 0.25 },
      { cat: "stage", label: "المسرح والتجهيز", pct: 0.12 }, { cat: "av", label: "الصوت والشاشات", pct: 0.12 },
      { cat: "photo", label: "التصوير", pct: 0.08 }, { cat: "live", label: "البث المباشر", pct: 0.05 },
      { cat: "gifts", label: "الهدايا", pct: 0.05 }, { cat: "other", label: "الطوارئ", pct: 0.03 },
    ],
    essentials: [{ cat: "av", label: "الصوت والشاشات" }, { cat: "hosp", label: "الضيافة" }, { cat: "photo", label: "التصوير" }],
    program: [{ title: "التسجيل والاستقبال", time: "18:00" }, { title: "الكلمة الافتتاحية", time: "18:30" }, { title: "الفقرات", time: "19:00" }, { title: "العشاء", time: "20:30" }],
    inviteMessage: "يسرّنا دعوتكم لحضور فعاليتنا",
    tasks: [["اعتماد الميزانية", "الإدارة", 30], ["تأكيد المتحدثين والفقرات", "الفعاليات", 14], ["إرسال الدعوات", "الفعاليات", 10], ["بروفة الصوت والشاشات", "الفعاليات", 1]],
  },
};

export const profileOf = (id?: OccasionId) => OCCASION_PROFILES[id ?? "wedding"] ?? OCCASION_PROFILES.wedding;
