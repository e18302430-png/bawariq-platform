// ---------------------------------------------------------------------------
// PLACEHOLDER PRODUCT DATA
// Prices, SKUs, stock labels and content excerpts below are placeholders for
// layout/design purposes only. Replace with real catalog data (pricing,
// inventory, shipping, legal copy) before launch — do not treat these numbers
// as final commercial decisions.
// ---------------------------------------------------------------------------

export type ContentTeaser = {
  kind: "معلومة" | "فزورة" | "نكتة" | "حظك اليوم" | "سؤال" | "تحدي";
  hint: string;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  story: string;
  price: number; // PLACEHOLDER — SAR
  compareAtPrice?: number; // PLACEHOLDER
  badge?: string;
  colorTheme: "red" | "gold" | "obsidian";
  image: string;
  gallery: string[];
  variants: { id: string; label: string }[];
  contentTeasers: ContentTeaser[];
  isBestseller?: boolean;
};

export const products: Product[] = [
  {
    slug: "kaif-halak",
    name: "كيف حالك اليوم؟",
    tagline: "كوب يفتح لك حديث كل صباح.",
    story:
      "لكل شخص يبدأ يومه بسؤال… هذا الكوب يسألك أنت أولًا، ويترك لك مساحة تكتشف فيها شيئًا جديدًا مع كل رشفة.",
    price: 89,
    compareAtPrice: 119,
    badge: "الأكثر طلبًا",
    colorTheme: "red",
    image: "/images/products/cup-01.jpg",
    gallery: ["/images/products/cup-01.jpg", "/images/products/cup-01-alt.jpg"],
    variants: [
      { id: "classic", label: "أسود كلاسيك" },
      { id: "gold-rim", label: "حافة ذهبية" },
    ],
    contentTeasers: [
      { kind: "سؤال", hint: "سؤال يخليك تفكر قبل أول رشفة." },
      { kind: "حظك اليوم", hint: "توقع صغير يفتح يومك بطاقة مختلفة." },
    ],
    isBestseller: true,
  },
  {
    slug: "wesh-talla3-lak",
    name: "وش طلع لك؟",
    tagline: "كل كوب مفاجأة… وكل مفاجأة حكاية.",
    story:
      "صمم لمن يحب الفضول اليومي. لا تعرف وش بينتظرك إلا بعد ما تصب قهوتك — تجربة تتكرر ولا تتشابه.",
    price: 95,
    colorTheme: "gold",
    image: "/images/products/cup-02.jpg",
    gallery: ["/images/products/cup-02.jpg", "/images/products/cup-02-alt.jpg"],
    variants: [
      { id: "classic", label: "أسود كلاسيك" },
      { id: "matte-red", label: "أحمر مطفي" },
    ],
    contentTeasers: [
      { kind: "فزورة", hint: "فزورة قصيرة تكسر روتين الصباح." },
      { kind: "تحدي", hint: "تحدي يومي بسيط بينك وبين نفسك." },
    ],
  },
  {
    slug: "le-nasib",
    name: "للأصدقاء بس",
    tagline: "هدية بينكم… مو مجرد كوب.",
    story:
      "لحظات الأصدقاء تحتاج شيء يذكرهم فيها كل يوم. كوب يحمل نكتة أو موقف يرجعهم لأجمل الذكريات.",
    price: 89,
    colorTheme: "obsidian",
    image: "/images/products/cup-03.jpg",
    gallery: ["/images/products/cup-03.jpg", "/images/products/cup-03-alt.jpg"],
    variants: [
      { id: "duo", label: "طقم صديقين" },
      { id: "solo", label: "كوب واحد" },
    ],
    contentTeasers: [
      { kind: "نكتة", hint: "نكتة ما تنقال إلا بين الأصدقاء." },
      { kind: "معلومة", hint: "معلومة غريبة تسولف فيها بعد." },
    ],
  },
  {
    slug: "sabah-alkhair",
    name: "صباح الخير يا فخامة",
    tagline: "روتينك الصباحي… بلمسة فخمة.",
    price: 99,
    colorTheme: "red",
    image: "/images/products/cup-04.jpg",
    gallery: ["/images/products/cup-04.jpg", "/images/products/cup-04-alt.jpg"],
    story:
      "لمن يبدأ يومه بجدية وطموح. رسالة تحفيزية قصيرة في كل كوب تدفعك تبدأ يومك بطاقة مختلفة.",
    variants: [
      { id: "classic", label: "أسود كلاسيك" },
      { id: "gold-rim", label: "حافة ذهبية" },
    ],
    contentTeasers: [{ kind: "معلومة", hint: "جرعة تحفيز صغيرة قبل أول اجتماع." }],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

// PLACEHOLDER — replace with real shipping/return policy copy.
export const trustSignals = [
  { label: "شحن سريع لجميع مناطق المملكة", icon: "shipping" },
  { label: "دفع آمن 100%", icon: "secure" },
  { label: "استبدال خلال 7 أيام", icon: "return" },
] as const;
