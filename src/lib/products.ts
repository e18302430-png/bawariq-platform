// ---------------------------------------------------------------------------
// PLACEHOLDER PRODUCT DATA
// Prices, SKUs, stock labels and shape descriptions below are placeholders for
// layout/design purposes only. Replace with real catalog data (pricing,
// inventory, shipping, legal copy, real shape names/photos) before launch —
// do not treat these numbers as final commercial decisions.
// ---------------------------------------------------------------------------

export const PACK_SIZE = 25; // cups per pack

export type ShapeTeaser = {
  kind: "شكل مثير" | "تصميم غريب" | "الأكثر تميزًا" | "مفاجأة الباكيت";
  hint: string;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  story: string;
  price: number; // PLACEHOLDER — SAR per pack of 25
  compareAtPrice?: number; // PLACEHOLDER
  badge?: string;
  colorTheme: "red" | "gold" | "obsidian";
  image: string;
  gallery: string[];
  variants: { id: string; label: string }[];
  shapeTeasers: ShapeTeaser[];
  isBestseller?: boolean;
};

export const products: Product[] = [
  {
    slug: "tashkila-mashkala",
    name: "التشكيلة المشكلة",
    tagline: "٢٥ شكل مختلف… ما تعرف وش بيطلع لك.",
    story:
      "كل باكيت فيه خلطة أشكال مثيرة ما تتكرر بنفس الترتيب. تفتح الباكيت ما تعرف وش بيطلع لك — هذا هو الإحساس اللي نبيعه.",
    price: 9.99,
    compareAtPrice: 19.99,
    badge: "الأكثر مبيعًا",
    colorTheme: "gold",
    image: "/images/products/pack-01.jpg",
    gallery: ["/images/products/pack-01.jpg"],
    variants: [
      { id: "classic", label: "تغليف كلاسيك" },
      { id: "gold-box", label: "تغليف ذهبي" },
    ],
    shapeTeasers: [
      { kind: "شكل مثير", hint: "شكل يخلي ضيوفك يسألون وين جبتها." },
      { kind: "مفاجأة الباكيت", hint: "كل باكيت فيه خلطة أشكال مختلفة." },
    ],
    isBestseller: true,
  },
  {
    slug: "tashkila-hafalat",
    name: "تشكيلة الحفلات",
    tagline: "أشكال تفرقع الجو في أي مناسبة.",
    story:
      "مصممة عشان تكون نجمة الطاولة في أي حفلة أو تجمع. ٢٥ كوب بأشكال متطورة تلفت الأنظار من أول ثانية.",
    price: 9.99,
    colorTheme: "red",
    image: "/images/products/pack-02.jpg",
    gallery: ["/images/products/pack-02.jpg"],
    variants: [
      { id: "classic", label: "تغليف كلاسيك" },
      { id: "gold-box", label: "تغليف ذهبي" },
    ],
    shapeTeasers: [
      { kind: "تصميم غريب", hint: "تصميم ما شفته بأي مكان ثاني." },
      { kind: "الأكثر تميزًا", hint: "الشكل اللي الكل بيسأل عنه بالحفلة." },
    ],
  },
  {
    slug: "tashkila-yawmi",
    name: "تشكيلة اليومي",
    tagline: "أشكال مثيرة تكسر روتين القهوة اليومي.",
    story:
      "لمن يبغى يكسر روتين الكاسة العادية كل يوم. أشكال متطورة تحول لحظة القهوة اليومية لشيء تتحمس له.",
    price: 9.99,
    colorTheme: "obsidian",
    image: "/images/products/pack-03.jpg",
    gallery: ["/images/products/pack-03.jpg"],
    variants: [
      { id: "classic", label: "تغليف كلاسيك" },
      { id: "gold-box", label: "تغليف ذهبي" },
    ],
    shapeTeasers: [{ kind: "شكل مثير", hint: "شكل مختلف كل ما تفتح باكيت جديد." }],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

// Quick quantity presets shown on the product page / sticky bar — pure
// convenience shortcuts (linear pricing, no hidden bundle math).
export const QUANTITY_PRESETS = [
  { packs: 1, label: "باكيت وحدة" },
  { packs: 3, label: "٣ باكيتات" },
  { packs: 5, label: "٥ باكيتات" },
] as const;

// PLACEHOLDER — replace with real shipping/return policy copy.
export const trustSignals = [
  { label: "توصيل سريع لجميع مناطق المملكة", icon: "shipping" },
  { label: "بيع مباشر من المصنع بدون وسطاء", icon: "factory" },
  { label: "دفع آمن 100%", icon: "secure" },
  { label: "استبدال خلال 7 أيام", icon: "return" },
] as const;
