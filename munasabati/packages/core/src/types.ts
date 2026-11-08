/** نموذج النطاق (Domain Model) المشترك بين كل تطبيقات مناسبتي */

export type OccasionId = "wedding" | "milka" | "grad" | "aqiqa" | "family" | "corp";
export type CategoryId = "kosha" | "tents" | "photo" | "av" | "live" | "hosp" | "power" | "stage";
export type Section = "men" | "women";
export type TierId = "eco" | "mid" | "lux";
export type BookingStatus = "new" | "quoted" | "confirmed" | "declined";
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
}

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
}

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
  tasks: Task[];
  favorites: string[];
  invite: { template: InviteTemplate; message: string; time?: string; couple?: string; program?: ProgramItem[] };
}

/** تذكرة دعم: من العميل أو المورد أو صاحب القاعة إلى إدارة المنصة */
export type TicketStatus = "open" | "answered" | "closed";
export interface Ticket {
  id: string;
  from: "client" | "supplier" | "venue";
  fromId: string;
  fromName: string;
  topic: "booking" | "payment" | "account" | "technical" | "other";
  subject: string;
  status: TicketStatus;
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

export interface DB {
  version: 2;
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
