/** نموذج النطاق (Domain Model) المشترك بين كل تطبيقات مناسبتي */

export type OccasionId = "wedding" | "milka" | "grad" | "aqiqa" | "birthday" | "family" | "corp";
export type CategoryId = "kosha" | "tents" | "photo" | "av" | "live" | "hosp" | "power" | "stage" | "cake" | "coffee" | "beauty" | "gifts";
export type Section = "men" | "women";
export type TierId = "eco" | "mid" | "lux";
/** review = عند الإدارة للمراجعة (التاجر ما يشوفه) · new = أرسلته الإدارة للتاجر يطلب عرض سعر */
export type BookingStatus = "review" | "new" | "quoted" | "confirmed" | "declined";
export type RSVP = "pending" | "yes" | "no";

export interface Occasion {
  id: OccasionId;
  name: string;
  hint: string;
  /** ألوان التدرج الحي في الواجهة لكل مناسبة */
  palette: [string, string, string, string];
}

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  icon: string;
}

export interface Package {
  id: string;
  name: string;
  /** يدخله المورد؛ فارغ = "عند الطلب" */
  price?: number;
  items: string[];
}

/** حالة الحساب: الإدارة تقدر تعلّق الحساب فيختفي من المنصة */
export type AccountStatus = "active" | "suspended";

/** مورّد خدمات التجهيز (كوشة، تصوير، صوت…) */
export interface Supplier {
  id: string;
  name: string;
  city: string;
  area: string;
  cats: CategoryId[];
  /** كل الأرقام يدخلها التاجر بنفسه (فارغة = لم تُحدد بعد) */
  priceFrom?: number;
  rating?: number;
  reviews?: number;
  status?: AccountStatus;
  verified?: boolean;
  hue: number;
  tags: string[];
  about: string;
  packages: Package[];
  phone?: string;
  /** روابط صور حقيقية يرفعها المورد (الأولى غلاف) */
  photos?: string[];
  featured?: boolean;
  /** مختار من الإدارة: يظهر أولاً في الاقتراحات والبحث */
  promoted?: boolean;
  /** اتفاقية الشراكة مع مناسبتي (لازم قبل استقبال الطلبات) */
  agreement?: PartnerAgreement;
  custom?: boolean;
}

/** قاعة داخل منشأة (قد يكون للمنشأة أكثر من قاعة) */
export interface Hall {
  id: string;
  name: string;
  menCap?: number;
  womenCap?: number;
  weekdayPrice?: number;
  weekendPrice?: number;
}

/** منشأة أفراح يملكها صاحب قاعة */
export interface Venue {
  id: string;
  name: string;
  city: string;
  district: string;
  hue: number;
  rating?: number;
  reviews?: number;
  status?: AccountStatus;
  verified?: boolean;
  tags: string[];
  about: string;
  halls: Hall[];
  /** أيام مغلقة يدوياً من صاحب القاعة (صيانة أو حجز خارجي) */
  blocked: string[];
  /** روابط صور حقيقية يرفعها صاحب القاعة (الأولى غلاف) */
  photos?: string[];
  phone?: string;
  /** مختار من الإدارة: يظهر أولاً في الاقتراحات والبحث */
  promoted?: boolean;
  /** اتفاقية الشراكة مع مناسبتي (لازم قبل استقبال الطلبات) */
  agreement?: PartnerAgreement;
  custom?: boolean;
}

export interface Message {
  /** admin = إدارة مناسبتي (الوسيط بين الطرفين) */
  from: "client" | "provider" | "admin";
  text: string;
  at: number;
}

export interface Booking {
  id: string;
  kind: "supplier" | "venue";
  /** معرّف المورد أو المنشأة */
  targetId: string;
  hallId?: string;
  packageId?: string;
  clientName: string;
  phone: string;
  occasion: OccasionId;
  city: string;
  date: string;
  guests: number;
  note: string;
  status: BookingStatus;
  estimate: number;
  quote?: number;
  createdAt: number;
  messages: Message[];
  /** أنشأه العميل من تطبيق العميل (ليس مثالاً) */
  fromClient?: boolean;
  seed?: boolean;
  /** ميزانية العميل المخصصة لهذا البند (يحددها العميل) */
  budget?: number;
  /** فئة الخدمة المطلوبة (للاقتراح والإسناد البديل) */
  cat?: string;
  /** أُنشئ من الخطة المقترحة */
  fromPlan?: boolean;
  /** أُعيد إسناده من طلب سابق (الإدارة) */
  reassignedFrom?: string;
  /** التاجر طلب إلغاء حجز مؤكد: لا يُلغى إلا بقرار الإدارة */
  cancelRequest?: { reason: string; at: number };
  /** آخر مرة أبلغت فيها الإدارة التاجر بالطلب عبر واتساب */
  notifiedAt?: number;
  /** حالة التاجر يوم المناسبة */
  vendorStatus?: VendorStatus;
  /** تقييم العميل بعد ختم الليلة */
  rating?: { stars: number; note?: string; at: number };
  /** سعر مناسبتي للعميل (شامل خدمة المنصة). سعر التاجر الصافي هو quote، وكل طرف يشوف سعره بس */
  clientPrice?: number;
  /** حق المورد بعد خصم نسبة مناسبتي من سعره (يتثبت لحظة إرسال السعر) */
  payout?: number;
  /** الدفع عبر مناسبتي: العميل يحوّل العربون لحساب المنصة، والمنصة تحوّل للتاجر بعد ختم الليلة */
  pay?: { stage: "due" | "claimed" | "paid"; claimedAt?: number; paidAt?: number; payoutAt?: number };
  /** محاولات مشاركة رقم أو حساب في المحادثة (انخفت تلقائياً) */
  leaks?: number;
  /** متابعة منسق مناسبتي ليلة المناسبة: العميل يشوف حالة المورد بعد تأكيد المنسق فقط */
  check?: { state: "arrived" | "ready" | "issue"; note?: string; at: number };
}

export interface ClientEvent {
  id: string;
  occasion: OccasionId;
  city: string;
  date: string;
  guests: number;
  menRatio: number;
  tier: TierId;
  title: string;
  /** الميزانية الكلية يحددها العميل بنفسه (فارغة = لم تحدد) */
  budget?: number;
  /** طابع الإلهام الذي اختاره العميل (يوجّه الاقتراحات) */
  style?: StyleId[];
  /** وين المناسبة: قاعة أو استراحة أو في البيت (في البيت = ما نقترح قاعات) */
  place?: "hall" | "istiraha" | "home";
  /** من وين جاء العميل (مثلاً invite = من دعوة ضيف) */
  source?: "invite" | "direct";
  /** منسق مناسبتي (من فريق الإدارة) المعيّن لهذي المناسبة */
  coordinator?: { name: string; phone: string; at: number };
  /** وقت ختم الليلة: بعدها تتحول الدعوات لرسالة شكر وتتوقف شاشات المنسقين */
  endedAt?: number;
  /** رسالة الشكر للضيوف (تظهر في دعوة كل ضيف بعد ختم الليلة) */
  thanks?: string;
}

export type StyleId = "royal" | "najdi" | "modern" | "nature" | "cinema" | "cozy";
export type VendorStatus = "onway" | "arrived" | "setup" | "ready";

export interface Guest {
  id: string;
  name: string;
  phone: string;
  section: Section;
  side: "groom" | "bride";
  status: RSVP;
  count: number;
  code: string;
  checkedIn: boolean;
  sample?: boolean;
  /** صلة القرابة: تغيّر عبارة الترحيب في الدعوة */
  relation?: Relation;
  /** ضيف كبير: ينبَّه صاحب المناسبة عند وصوله */
  vip?: boolean;
  /** ملاحظة أكل أو حساسية يكتبها الضيف */
  diet?: string;
  /** وقت الدخول */
  checkedAt?: number;
}

export type Relation = "uncle" | "maternal-uncle" | "aunt" | "maternal-aunt" | "brother" | "sister" | "friend" | "colleague" | "relative";

export interface BudgetLine {
  id: string;
  label: string;
  cat: string;
  est: number;
  paid: number;
}

export interface Task {
  id: string;
  title: string;
  who: string;
  due: string;
  done: boolean;
}

/** لوحات مائية (balad جدة التاريخية، diriyah الدرعية، ula العُلا) وقوالب كلاسيكية */
export type InviteTemplate = "balad" | "diriyah" | "ula" | "night" | "ivory" | "photo";
export interface ProgramItem { title: string; time: string }

export interface ClientSpace {
  profile: { name: string; phone: string } | null;
  event: ClientEvent | null;
  guests: Guest[];
  budget: BudgetLine[];
  /** مفتاح رابط المنسق عند الباب (يُلغى ويُجدد من العميل) */
  doorKey?: string;
  tasks: Task[];
  favorites: string[];
  invite: { template: InviteTemplate; message: string; time?: string; couple?: string; program?: ProgramItem[]; kids?: boolean };
  /** تفضيلات يتعلمها النظام من اختيارات العميل: اللي اختاره واللي رفضه */
  prefs?: { liked: string[]; dismissed: string[] };
  /** الفقرة الجارية الآن من برنامج الليلة (يتحكم بها العميل) */
  liveIndex?: number;
}

/** تذكرة دعم: من العميل أو المورد أو صاحب القاعة إلى إدارة المنصة */
/** مفتوحة · تم الرد · أُعيد فتحها · مغلقة (الإغلاق من الإدارة فقط وبسبب) */
export type TicketStatus = "open" | "answered" | "reopened" | "closed";
export interface Ticket {
  id: string;
  from: "client" | "supplier" | "venue";
  fromId: string;
  fromName: string;
  topic: "booking" | "payment" | "account" | "technical" | "other";
  subject: string;
  status: TicketStatus;
  /** بلاغ طارئ ليلة المناسبة */
  urgent?: boolean;
  /** سبب الإغلاق (تكتبه الإدارة) */
  closedReason?: string;
  messages: { from: "user" | "admin"; text: string; at: number }[];
  createdAt: number;
  updatedAt: number;
}

/** مساحة عميل كما تراها الإدارة (سحابياً: كل صفوف client_spaces) */
export interface ClientRecord {
  id: string;
  data: DB["client"];
  updatedAt?: number;
}

/** غرفة التنسيق ليلة المناسبة: العميل والإدارة والمنسق العام ومنسقو الأقسام */
export type OpsFrom = "client" | "admin" | "all" | "men" | "women";
export interface OpsMsg {
  id: string;
  /** صاحب المناسبة (سحابياً: معرّف حساب العميل) */
  owner?: string;
  from: OpsFrom;
  text: string;
  /** msg رسالة · alert تنبيه عاجل · done ختم الليلة */
  kind: "msg" | "alert" | "done";
  at: number;
}

/** اتفاقية الشراكة: التاجر وصاحب القاعة يوقعونها داخل المنصة */
export interface PartnerAgreement { v: number; at: number; by: string }

export interface DB {
  version: 2;
  /** سياسة التسعير: نسبة مناسبتي، الحد الأدنى، العربون، والتسعير التلقائي */
  pricing?: { feePct: number; vendorPct?: number; minFee: number; depositPct: number; auto: boolean; steps?: { from: string; feePct: number; vendorPct?: number }[] };
  /** بيانات المنشأة النظامية (نظام التجارة الإلكترونية يطلب ظهورها في المنصة) */
  legal?: { entity: string; cr: string; vat: string; address: string; email: string };
  /** حساب مناسبتي البنكي لتحويل العربون */
  bank?: { name: string; iban: string; holder: string };
  /** غرفة التنسيق: رسائل ليلة المناسبة */
  ops?: OpsMsg[];
  /** رقم واتساب الإدارة (لمن نسي كلمة المرور أو يحتاج مساعدة) */
  supportPhone?: string;
  /** للإدارة فقط: مساحات كل العملاء (في الوضع المحلي تُشتق من db.client) */
  clients?: ClientRecord[];
  tickets: Ticket[];
  /** إعلان من الإدارة يظهر أعلى كل التطبيقات */
  announcement?: string;
  client: ClientSpace;
  suppliers: Supplier[];
  venues: Venue[];
  bookings: Booking[];
  /** جلسات الدخول: كل بوابة لها جلستها المستقلة */
  sessions: { supplierId: string | null; venueId: string | null };
}
