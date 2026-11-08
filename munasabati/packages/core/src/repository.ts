import { createInitialDB, type CheckInResult, type Mutation } from "./db";
import { SEED_SUPPLIERS, SEED_VENUES } from "./catalog";
import type { DB, Guest } from "./types";

/**
 * مستودع البيانات: واجهة موحدة تعتمد عليها كل التطبيقات.
 * - LocalRepository: للعرض والتجربة (التخزين في المتصفح، ومزامنة لحظية بين التطبيقات المفتوحة).
 * - لاحقاً: SupabaseRepository أو API خاص بنفس الواجهة، بدون تغيير أي شاشة.
 */
export interface AuthUser { id: string; phone: string; role?: "user" | "admin" }

export interface AuthAdapter {
  /** phone: رمز SMS (يحتاج مزود رسائل) · quick: دخول فوري بالاسم والجوال بدون رمز */
  mode: "phone" | "quick";
  user(): AuthUser | null;
  /** دخول فوري: جلسة آمنة على الجهاز مربوطة برقم الجوال */
  quickSignIn(phone: string, name?: string): Promise<AuthUser>;
  /** دخول الإدارة بالبريد وكلمة المرور */
  signInWithPassword(email: string, password: string): Promise<AuthUser>;
  /** يرسل رمز تحقق SMS للرقم السعودي (05xxxxxxxx) */
  sendOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, code: string): Promise<AuthUser>;
  signOut(): Promise<void>;
}

export interface DoorSnapshot { title: string; date: string; guests: Guest[]; program?: { title: string; time: string }[]; live?: number }
export interface DoorAdapter {
  load(key: string): Promise<DoorSnapshot | null>;
  checkIn(key: string, code: string): Promise<CheckInResult>;
}

export interface Repository {
  /** local: تجربة داخل المتصفح. cloud: قاعدة بيانات حقيقية مع دخول بالجوال */
  readonly mode: "local" | "cloud";
  get(): DB;
  apply(m: Mutation): void;
  subscribe(listener: () => void): () => void;
  reset(): void;
  /** يرفع صورة (مصغّرة مسبقاً) ويعيد رابطها */
  uploadPhoto(file: Blob): Promise<string>;
  auth?: AuthAdapter;
  /** شاشة المنسق عند الباب على جهاز آخر (سحابياً عبر دوال آمنة بمفتاح الرابط) */
  door?: DoorAdapter;
  /** آخر خطأ في الحفظ (مثلاً امتلاء التخزين أو انقطاع الاتصال) */
  error(): string | null;
}

const toDataURL = (b: Blob) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(b); });

const KEY = "munasabati.db.v2";

export function createLocalRepository(key = KEY): Repository {
  const listeners = new Set<() => void>();
  let state: DB = read() ?? createInitialDB();
  let lastError: string | null = null;

  function read(): DB | null {
    try {
      const raw = globalThis.localStorage?.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as DB) : null;
      if (parsed?.version !== 2) return null;
      parsed.tickets ??= [];
      // ترحيل: إزالة الأرقام التجريبية القديمة من النشاطات التجريبية (التاجر يدخل أرقامه بنفسه)
      const seedS = new Set(SEED_SUPPLIERS.map((x) => x.id)), seedV = new Set(SEED_VENUES.map((x) => x.id));
      if (!(parsed as DB & { _clean?: boolean })._clean) {
        parsed.suppliers = parsed.suppliers.map((x) => seedS.has(x.id) ? { ...x, priceFrom: undefined, rating: undefined, reviews: undefined, packages: x.packages.map((p) => ({ ...p, price: undefined })) } : x);
        parsed.venues = parsed.venues.map((x) => seedV.has(x.id) ? { ...x, rating: undefined, reviews: undefined, halls: x.halls.map((h) => ({ id: h.id, name: h.name })) } : x);
        parsed.bookings = parsed.bookings.map((b) => (b.seed ? { ...b, quote: undefined, estimate: 0 } : b));
        (parsed as DB & { _clean?: boolean })._clean = true;
      }
      // ترحيل: الميزانية صارت يحددها العميل بنفسه (إزالة التقديرات الآلية القديمة)
      if (!(parsed as DB & { _b2?: boolean })._b2) {
        if (parsed.client.event && parsed.client.event.budget == null) parsed.client.budget = parsed.client.budget.map((l) => ({ ...l, est: 0, paid: 0 }));
        (parsed as DB & { _b2?: boolean })._b2 = true;
      }
      // ترحيل: إضافة صور الهوية للنشاطات التجريبية المحفوظة قبل إضافتها
      parsed.suppliers = parsed.suppliers.map((x) => x.photos?.length ? x : { ...x, photos: SEED_SUPPLIERS.find((y) => y.id === x.id)?.photos });
      parsed.venues = parsed.venues.map((x) => x.photos?.length ? x : { ...x, photos: SEED_VENUES.find((y) => y.id === x.id)?.photos });
      // ترحيل قوالب الدعوة القديمة
      if (!["balad", "diriyah", "ula", "night", "ivory", "photo"].includes(parsed.client.invite.template)) parsed.client.invite = { ...parsed.client.invite, template: "diriyah" };
      if (parsed.client.invite.program?.some((x) => x.title === "السامر" && x.time === "21:30")) parsed.client.invite = { ...parsed.client.invite, program: parsed.client.invite.program.filter((x) => !(x.title === "السامر" && x.time === "21:30")) };
      if (!parsed.client.invite.program) parsed.client.invite = { ...parsed.client.invite, program: [{ title: "الاستقبال", time: "20:30" }, { title: "الزفّة", time: "23:00" }, { title: "العشاء", time: "00:00" }] };
      if (parsed.client.invite.message.startsWith("يتشرفون")) parsed.client.invite = { ...parsed.client.invite, message: "وبحضوركم تكتمل فرحتنا" };
      return parsed;
    } catch {
      return null;
    }
  }
  function write() {
    try { globalThis.localStorage?.setItem(key, JSON.stringify(state)); lastError = null; }
    catch { lastError = "مساحة التخزين في المتصفح ممتلئة. احذف بعض الصور."; }
  }
  const emit = () => listeners.forEach((l) => l());

  // مزامنة بين التطبيقات: طلب من تطبيق العميل يظهر فوراً في بوابة المورد المفتوحة
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key !== key) return;
      const next = read();
      if (next) { state = next; emit(); }
    });
  }

  return {
    mode: "local",
    get: () => state,
    apply(m) { state = m(state); write(); emit(); },
    subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
    reset() { state = createInitialDB(); write(); emit(); },
    uploadPhoto: toDataURL,
    error: () => lastError,
  };
}

export function createMemoryRepository(initial: DB = createInitialDB()): Repository {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    mode: "local",
    get: () => state,
    apply(m) { state = m(state); listeners.forEach((l) => l()); },
    subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
    reset() { state = createInitialDB(); listeners.forEach((l) => l()); },
    uploadPhoto: async () => "memory://photo",
    error: () => null,
  };
}
