import React, { useState, useEffect, useRef } from "react";
import {
  Crown, Car, UtensilsCrossed, Wallet, Users, Scale, ShieldCheck, Navigation,
  LayoutDashboard, ShoppingBag, MapPin, Store, ReceiptText, FileSignature, Gavel,
  BadgeCheck, CalendarClock, TrendingUp, TrendingDown, Bell, Search, LogOut, Menu, X,
  ChevronRight, Fingerprint, Lock, ArrowUpRight, Fuel, Timer, Flame, Star,
  CircleDollarSign, Clock, AlertTriangle, CheckCircle2, Settings, Building2,
  Languages, Download, SlidersHorizontal, Plus, User, KeyRound, Eye, EyeOff, Bike,
  UserPlus, Upload, CreditCard, Target, Percent, Route, Footprints, ImagePlus, Phone, Camera, Printer,
  CalendarDays, ClipboardList, Trash2, Megaphone, Mic, Square, PlayCircle, Send, Paperclip,
  MessageSquare, CheckCheck, Copy, Hash,
  HandCoins, ShieldAlert, Sparkles, Award, Rocket, Zap, Radio, ChevronLeft, Trophy, Medal, Plane,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

/* ═══════════  تصدير Excel عام  ═══════════ */
function exportToExcel(rows, filename, sheetName = "Sheet1") {
  try {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const arrBuf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const blob = new Blob([arrBuf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".xlsx") ? filename : filename + ".xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("exportToExcel failed:", err);
    return false;
  }
}

/* ═══════════  اللغات  ═══════════ */
const LANGS = [
  { code: "ar", name: "العربية", sub: "Arabic", dir: "rtl", mark: "ع" },
  { code: "en", name: "English", sub: "الإنجليزية", dir: "ltr", mark: "En" },
  { code: "ur", name: "اردو", sub: "Urdu", dir: "rtl", mark: "ار" },
];

const T = {
  ar: {
    brand: "بوارق الشرق", brand2: "للخدمات اللوجستية", tagline: "منصة إدارة توصيل طلبات المطاعم",
    langTitle: "اختر لغة العمل", langSub: "يمكنك تغييرها لاحقاً من الإعدادات", cont: "متابعة",
    deptTitle: "اختر إدارتك", enter: "دخول", members: "موظف", back: "رجوع",
    switchDept: "تغيير الإدارة", logout: "خروج", pass: "كلمة المرور", forgot: "نسيت كلمة المرور؟",
    secure: "اتصال مشفّر", demoNote: "بيئة تجريبية · كلمة المرور: 4 خانات أو أكثر",
    search: "ابحث عن طلب، مطعم، مندوب…", alerts: "التنبيهات", settings: "الإعدادات",
    live: "مباشر", welcome: "أهلاً بك", thisMonth: "هذا الشهر", export: "تصدير",
    filter: "تصفية", langLabel: "لغة الواجهة", motion: "تقليل الحركة",
    nav: { overview: "نظرة عامة", orders: "الطلبات", cars: "السيارات", zones: "الأحياء",
      restaurants: "المطاعم", invoices: "الفواتير", expenses: "المصروفات", payroll: "الرواتب",
      employees: "الموظفون", attendance: "الحضور", contracts: "العقود", cases: "القضايا",
      compliance: "الالتزام", approvals: "الموافقات", reports: "التقارير", settings: "الإعدادات",
      hiring: "توظيف المناديب", shifts: "أداء المناديب", tickets: "التذاكر", circulars: "التعاميم", pulse: "نبض المناديب", iqama: "الإقامات", payrollRuns: "مسيرات الرواتب", chat: "المراسلات", messages: "رسائل الإدارة", leaderboard: "لوحة الصدارة", audit: "سجل التتبع", hall: "قاعة المشاهير", charter: "اللائحة الداخلية", checklist: "قائمة التحقق", growth: "نمو الشركة", security: "الأمان", permissions: "خريطة الصلاحيات", mystory: "قصتي مع بوارق", invAnalysis: "تحليل الفواتير", equipCompliance: "الامتثال والمعدات" },
    k: { orders: "طلبات اليوم", avgTime: "متوسط التوصيل", onTime: "التوصيل في الوقت",
      activeReps: "مناديب في الوردية", partners: "مطاعم شريكة", rating: "تقييم العملاء",
      cod: "تحصيل نقدي", cancel: "نسبة الإلغاء", revenue: "الإيرادات", profit: "صافي الربح",
      expenses: "المصروفات", head: "إجمالي الموظفين", attend: "نسبة الحضور", hires: "تعيينات جديدة",
      contracts: "عقود سارية", cases: "قضايا مفتوحة", expiring: "عقود تنتهي قريباً",
      cars: "سيارات التوصيل", carsShift: "سيارات في الخدمة", carsMaint: "في الصيانة",
      fuel: "تكلفة الوقود", open: "فواتير مستحقة", overdue: "متأخرة السداد", cash: "السيولة",
      newOrders: "طلبات جديدة", lateOrders: "طلبات متأخرة", zones: "أحياء مغطاة",
      prepTime: "متوسط التحضير", pending: "بانتظار موافقتك", cities: "المدن", payrollC: "كتلة الرواتب" },
    c: { rev: "حركة الإيرادات", status: "الطلبات حسب الحالة", peak: "ساعات الذروة",
      zones: "الأحياء الأكثر طلباً", exp: "توزيع المصروفات", attend: "الحضور الأسبوعي",
      cases: "القضايا حسب النوع", cars: "حالة السيارات" },
    s: { new: "جديد", preparing: "قيد التحضير", picked: "تم الاستلام", on_way: "في الطريق",
      delivered: "تم التسليم", canceled: "ملغي", late: "متأخر", pending: "قيد المراجعة",
      approved: "معتمد", paid: "مدفوعة", overdue: "متأخرة", active: "ساري", expiring: "ينتهي قريباً",
      open: "مفتوحة", closed: "مغلقة", review: "مراجعة", present: "حاضر", leave: "إجازة",
      on_shift: "في الوردية", off_shift: "خارج الوردية", maint: "في الصيانة", idle: "متوقفة" },
    h: { order: "رقم الطلب", restaurant: "المطعم", zone: "الحي", status: "الحالة", rep: "المندوب",
      time: "الزمن", value: "قيمة الطلب", pay: "الدفع", plate: "اللوحة", car: "السيارة",
      last: "آخر صيانة", invoice: "رقم الفاتورة", amount: "المبلغ", due: "تاريخ الاستحقاق",
      employee: "الموظف", dept: "الإدارة", position: "المسمى", attendance: "الحضور",
      party: "الطرف الآخر", type: "النوع", start: "البداية", end: "النهاية", caseNo: "رقم القضية",
      court: "الجهة", subject: "الموضوع", hearing: "الجلسة القادمة", title: "الطلب",
      by: "مقدّم الطلب", urgency: "الأهمية" },
    u: { high: "عالية", medium: "متوسطة", low: "منخفضة" },
    approve: "اعتماد", reject: "رفض", sar: "ر.س", min: "دقيقة", orders: "طلب",
  },
  en: {
    brand: "Bawariq Al-Sharq", brand2: "Logistics Services", tagline: "Restaurant delivery operations platform",
    langTitle: "Choose your working language", langSub: "You can change this later in settings", cont: "Continue",
    deptTitle: "Choose your department", enter: "Sign in", members: "staff", back: "Back",
    switchDept: "Switch department", logout: "Sign out", pass: "Password", forgot: "Forgot password?",
    secure: "Encrypted connection", demoNote: "Demo environment · password: 4+ characters",
    search: "Search order, restaurant, rep…", alerts: "Alerts", settings: "Settings",
    live: "Live", welcome: "Welcome", thisMonth: "This month", export: "Export",
    filter: "Filter", langLabel: "Interface language", motion: "Reduce motion",
    nav: { overview: "Overview", orders: "Orders", cars: "Cars", zones: "Zones",
      restaurants: "Restaurants", invoices: "Invoices", expenses: "Expenses", payroll: "Payroll",
      employees: "People", attendance: "Attendance", contracts: "Contracts", cases: "Cases",
      compliance: "Compliance", approvals: "Approvals", reports: "Reports", settings: "Settings",
      hiring: "Rep Hiring", shifts: "Rep Performance", tickets: "Tickets", circulars: "Circulars", pulse: "Rep Pulse", iqama: "Residency", payrollRuns: "Payroll Runs", chat: "Messaging", messages: "Messages", leaderboard: "Leaderboard", audit: "Audit Log", hall: "Hall of Fame", charter: "Internal Charter", checklist: "Launch Checklist", growth: "Company Growth", security: "Security", permissions: "Permissions Map", mystory: "My Story", invAnalysis: "Invoice Analysis", equipCompliance: "Equipment Compliance" },
    k: { orders: "Orders today", avgTime: "Avg. delivery", onTime: "On-time delivery",
      activeReps: "Reps on shift", partners: "Partner restaurants", rating: "Customer rating",
      cod: "Cash collected", cancel: "Cancellation rate", revenue: "Revenue", profit: "Net profit",
      expenses: "Expenses", head: "Headcount", attend: "Attendance rate", hires: "New hires",
      contracts: "Active contracts", cases: "Open cases", expiring: "Expiring soon",
      cars: "Delivery cars", carsShift: "Cars on shift", carsMaint: "In service",
      fuel: "Fuel cost", open: "Open receivables", overdue: "Overdue", cash: "Cash position",
      newOrders: "New orders", lateOrders: "Late orders", zones: "Zones covered",
      prepTime: "Avg. prep time", pending: "Awaiting your approval", cities: "Cities", payrollC: "Payroll cost" },
    c: { rev: "Revenue movement", status: "Orders by status", peak: "Peak hours",
      zones: "Busiest zones", exp: "Expense breakdown", attend: "Weekly attendance",
      cases: "Cases by type", cars: "Car condition" },
    s: { new: "New", preparing: "Preparing", picked: "Picked up", on_way: "On the way",
      delivered: "Delivered", canceled: "Canceled", late: "Late", pending: "Under review",
      approved: "Approved", paid: "Paid", overdue: "Overdue", active: "Active", expiring: "Expiring",
      open: "Open", closed: "Closed", review: "In review", present: "Present", leave: "On leave",
      on_shift: "On shift", off_shift: "Off shift", maint: "In service", idle: "Idle" },
    h: { order: "Order no.", restaurant: "Restaurant", zone: "Zone", status: "Status", rep: "Rep",
      time: "Time", value: "Order value", pay: "Payment", plate: "Plate", car: "Car",
      last: "Last service", invoice: "Invoice no.", amount: "Amount", due: "Due date",
      employee: "Employee", dept: "Department", position: "Position", attendance: "Attendance",
      party: "Counterparty", type: "Type", start: "Start", end: "End", caseNo: "Case no.",
      court: "Authority", subject: "Subject", hearing: "Next hearing", title: "Request",
      by: "Requested by", urgency: "Priority" },
    u: { high: "High", medium: "Medium", low: "Low" },
    approve: "Approve", reject: "Reject", sar: "SAR", min: "min", orders: "orders",
  },
  ur: {
    brand: "بوارق الشرق", brand2: "لاجسٹک سروسز", tagline: "ریستوران ڈیلیوری آپریشنز پلیٹ فارم",
    langTitle: "کام کی زبان منتخب کریں", langSub: "بعد میں سیٹنگز سے تبدیل کر سکتے ہیں", cont: "آگے بڑھیں",
    deptTitle: "اپنا شعبہ منتخب کریں", enter: "داخل ہوں", members: "ملازم", back: "واپس",
    switchDept: "شعبہ بدلیں", logout: "باہر نکلیں", pass: "پاس ورڈ", forgot: "پاس ورڈ بھول گئے؟",
    secure: "محفوظ کنکشن", demoNote: "آزمائشی نظام · پاس ورڈ: 4 حروف یا زیادہ",
    search: "آرڈر، ریستوران یا نمائندہ تلاش کریں…", alerts: "اطلاعات", settings: "سیٹنگز",
    live: "براہِ راست", welcome: "خوش آمدید", thisMonth: "اس ماہ", export: "ایکسپورٹ",
    filter: "چھانٹیں", langLabel: "زبان", motion: "حرکت کم کریں",
    nav: { overview: "جائزہ", orders: "آرڈرز", cars: "گاڑیاں", zones: "علاقے",
      restaurants: "ریستوران", invoices: "انوائس", expenses: "اخراجات", payroll: "تنخواہ",
      employees: "ملازمین", attendance: "حاضری", contracts: "معاہدے", cases: "مقدمات",
      compliance: "ضابطے", approvals: "منظوریاں", reports: "رپورٹس", settings: "سیٹنگز",
      hiring: "نمائندہ بھرتی", shifts: "نمائندہ کارکردگی", tickets: "ٹکٹس", circulars: "سرکلرز", pulse: "نمائندہ نبض", iqama: "اقامہ", payrollRuns: "تنخواہ مسیر", chat: "پیغام رسانی", messages: "پیغامات", leaderboard: "لیڈر بورڈ", audit: "آڈٹ لاگ", hall: "شہرت کا ہال", charter: "اندرونی ضابطہ", checklist: "لانچ چیک لسٹ", growth: "کمپنی کی ترقی", security: "سیکیورٹی", permissions: "اختیارات کا نقشہ", mystory: "میری کہانی", invAnalysis: "انوائس تجزیہ", equipCompliance: "سازوسامان کی تعمیل" },
    k: { orders: "آج کے آرڈرز", avgTime: "اوسط ڈیلیوری", onTime: "وقت پر ڈیلیوری",
      activeReps: "شفٹ میں نمائندے", partners: "شراکت دار ریستوران", rating: "کسٹمر ریٹنگ",
      cod: "وصول شدہ رقم", cancel: "منسوخی کی شرح", revenue: "آمدنی", profit: "خالص منافع",
      expenses: "اخراجات", head: "کل ملازمین", attend: "حاضری کی شرح", hires: "نئی بھرتیاں",
      contracts: "فعال معاہدے", cases: "کھلے مقدمات", expiring: "جلد ختم ہونے والے",
      cars: "ڈیلیوری گاڑیاں", carsShift: "شفٹ میں گاڑیاں", carsMaint: "مرمت میں",
      fuel: "ایندھن کا خرچ", open: "واجب الادا رقم", overdue: "تاخیر شدہ", cash: "دستیاب رقم",
      newOrders: "نئے آرڈرز", lateOrders: "تاخیر شدہ آرڈرز", zones: "کور شدہ علاقے",
      prepTime: "اوسط تیاری وقت", pending: "آپ کی منظوری کے منتظر", cities: "شہر", payrollC: "تنخواہ لاگت" },
    c: { rev: "آمدنی کا رجحان", status: "حالت کے مطابق آرڈرز", peak: "مصروف اوقات",
      zones: "مصروف ترین علاقے", exp: "اخراجات کی تقسیم", attend: "ہفتہ وار حاضری",
      cases: "قسم کے مطابق مقدمات", cars: "گاڑیوں کی حالت" },
    s: { new: "نیا", preparing: "تیاری میں", picked: "اٹھا لیا", on_way: "راستے میں",
      delivered: "پہنچا دیا", canceled: "منسوخ", late: "تاخیر", pending: "زیرِ جائزہ",
      approved: "منظور", paid: "ادا شدہ", overdue: "تاخیر شدہ", active: "فعال", expiring: "جلد ختم",
      open: "کھلا", closed: "بند", review: "جائزہ", present: "حاضر", leave: "چھٹی",
      on_shift: "شفٹ میں", off_shift: "شفٹ سے باہر", maint: "مرمت میں", idle: "کھڑی" },
    h: { order: "آرڈر نمبر", restaurant: "ریستوران", zone: "علاقہ", status: "حالت", rep: "نمائندہ",
      time: "وقت", value: "آرڈر قیمت", pay: "ادائیگی", plate: "نمبر پلیٹ", car: "گاڑی",
      last: "آخری سروس", invoice: "انوائس نمبر", amount: "رقم", due: "آخری تاریخ",
      employee: "ملازم", dept: "شعبہ", position: "عہدہ", attendance: "حاضری",
      party: "دوسرا فریق", type: "قسم", start: "آغاز", end: "اختتام", caseNo: "مقدمہ نمبر",
      court: "ادارہ", subject: "موضوع", hearing: "اگلی سماعت", title: "درخواست",
      by: "درخواست دہندہ", urgency: "اہمیت" },
    u: { high: "زیادہ", medium: "درمیانی", low: "کم" },
    approve: "منظور", reject: "مسترد", sar: "ریال", min: "منٹ", orders: "آرڈر",
  },
};

/* ═══════════  الأقسام  ═══════════ */
const ROLES = [
  { id: "gm", icon: Crown, accent: "#E4B85C", glow: "228,184,92", staff: 6, shape: "octagon",
    ar: { t: "المدير العام", d: "الصورة الكاملة للعمليات والقرارات النهائية" },
    en: { t: "General Manager", d: "Whole-network view and final decisions" },
    ur: { t: "جنرل منیجر", d: "پورے نیٹ ورک کا منظر اور حتمی فیصلے" },
    nav: ["overview", "decisions", "invoices", "expenses", "repAccounting", "receiptsAdmin", "payrollRuns", "equipCompliance", "growth", "checklist", "leaderboard", "hall", "pulse", "audit", "permissions", "tickets", "chat", "circulars", "attendance", "settings"] },
  { id: "opsm", icon: Navigation, accent: "#5BC8E8", glow: "91,200,232", staff: 12, shape: "hex",
    ar: { t: "مدير التشغيل", d: "توزيع الأحياء وأداء المناديب والسيارات" },
    en: { t: "Operations Manager", d: "Zone coverage, rep and car performance" },
    ur: { t: "آپریشنز منیجر", d: "علاقے، نمائندے اور گاڑیوں کی کارکردگی" },
    nav: ["overview", "leaderboard", "hall", "pulse", "shifts", "cars", "hiring", "security", "audit", "permissions", "tickets", "chat", "circulars", "attendance", "settings"] },
  { id: "ops", icon: UtensilsCrossed, accent: "#FF9153", glow: "255,145,83", staff: 34, shape: "diamond",
    ar: { t: "إدارة التشغيل", d: "غرفة الطلبات: الإسناد والمتابعة اللحظية" },
    en: { t: "Operations", d: "Order room: dispatching and live tracking" },
    ur: { t: "آپریشنز شعبہ", d: "آرڈر روم: تقسیم اور لائیو ٹریکنگ" },
    nav: ["overview", "pulse", "shifts", "cars", "tickets", "chat", "permissions", "attendance", "settings"] },
  { id: "fin", icon: Wallet, accent: "#8B9BF7", glow: "139,155,247", staff: 9, shape: "circle",
    ar: { t: "الإدارة المالية", d: "عمولات المطاعم والتحصيل النقدي والرواتب" },
    en: { t: "Finance", d: "Restaurant commissions, cash collection, payroll" },
    ur: { t: "مالیات", d: "ریستوران کمیشن، نقد وصولی اور تنخواہ" },
    nav: ["overview", "repAccounting", "receiptsAdmin", "expenses", "payrollRuns", "tickets", "chat", "permissions", "attendance", "settings"] },
  { id: "hr", icon: Users, accent: "#C58BF2", glow: "197,139,242", staff: 8, shape: "shield",
    ar: { t: "الموارد البشرية", d: "المناديب والورديات والتوظيف والتطوير" },
    en: { t: "Human Resources", d: "Reps, shifts, hiring and development" },
    ur: { t: "انسانی وسائل", d: "نمائندے، شفٹیں، بھرتی اور تربیت" },
    nav: ["overview", "leaderboard", "hall", "hiring", "employees", "iqama", "attendance", "tickets", "chat", "circulars", "permissions", "settings"] },
  { id: "legal", icon: Scale, accent: "#E2789E", glow: "226,120,158", staff: 4, shape: "shieldTall",
    ar: { t: "الشؤون القانونية", d: "عقود المطاعم والمخالفات والالتزام" },
    en: { t: "Legal Affairs", d: "Restaurant contracts, violations, compliance" },
    ur: { t: "قانونی امور", d: "ریستوران معاہدے، خلاف ورزیاں اور ضابطے" },
    nav: ["overview", "charter", "contracts", "cases", "tickets", "compliance", "chat", "circulars", "permissions", "attendance", "settings"] },
];
const ADVISOR_ROLE = { id: "advisor", icon: Scale, accent: "#D8B4FE", glow: "216,180,254", staff: 2, shape: "shieldTall",
  ar: { t: "هيئة المستشارين", d: "الحلقة الوصل الحصرية مع المدير العام — اعتماد القرارات الاستراتيجية" },
  en: { t: "Advisory Board", d: "Exclusive link with the General Manager — strategic decision approval" },
  ur: { t: "مشاورتی بورڈ", d: "جنرل منیجر کے ساتھ خصوصی رابطہ — اسٹریٹجک فیصلوں کی منظوری" },
  nav: ["boardCouncil", "decisions", "repAccounting", "payrollRuns", "invoices", "expenses"] };
const REP = {
  id: "rep", icon: Car, accent: "#3FD8B4", glow: "63,216,180", staff: 128, shape: "chevron",
  ar: { t: "مندوب توصيل", d: "طلبات الوردية وإثبات التسليم" },
  en: { t: "Delivery Rep", d: "Shift orders and proof of delivery" },
  ur: { t: "ڈیلیوری نمائندہ", d: "شفٹ کے آرڈرز اور ثبوتِ ترسیل" },
  nav: ["riderHome", "myEarnings", "riderReceipts", "mystory", "leaderboard", "hall", "messages", "tickets", "circulars", "attendance", "settings"],
};
const ALL_ROLES = [...ROLES, REP, ADVISOR_ROLE];

const EMBLEM_CLIP = {
  octagon: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
  hex: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  circle: "circle(50% at 50% 50%)",
  shield: "polygon(50% 0%, 100% 18%, 100% 55%, 50% 100%, 0% 55%, 0% 18%)",
  shieldTall: "polygon(50% 0%, 100% 22%, 92% 78%, 50% 100%, 8% 78%, 0% 22%)",
  chevron: "polygon(50% 0%, 100% 30%, 100% 100%, 50% 78%, 0% 100%, 0% 30%)",
};
function Emblem({ role, size = 40 }) {
  const clip = EMBLEM_CLIP[role.shape] || EMBLEM_CLIP.circle;
  const Icon = role.icon;
  const inset = Math.max(2, Math.round(size * 0.09));
  return (
    <span className="relative shrink-0 crest-ring" style={{ width: size, height: size }}>
      <span className="absolute inset-0" style={{ clipPath: clip, background: `linear-gradient(155deg,rgba(${role.glow},.5),rgba(${role.glow},.06) 55%,rgba(${role.glow},.28))`, border: `1px solid rgba(${role.glow},.55)` }} />
      <span className="absolute" style={{ inset, clipPath: clip, background: `linear-gradient(155deg,rgba(0,0,0,.32),rgba(255,255,255,.05))`, boxShadow: `inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.45)` }} />
      <span className="absolute inset-0 grid place-items-center">
        <Icon size={Math.round(size * 0.44)} style={{ color: role.accent, filter: "drop-shadow(0 1px 1px rgba(0,0,0,.5))" }} />
      </span>
    </span>
  );
}

/* ═══════════  بيانات تجريبية  ═══════════ */
const ZN = {
  FSL: { ar: "الفيصلية", en: "Al-Faisaliyah", ur: "الفیصلیہ" },
  SHT: { ar: "الشاطئ", en: "Al-Shati", ur: "الشاطئ" },
  JLW: { ar: "الجلوية", en: "Al-Jalawiyah", ur: "الجلویہ" },
  NZH: { ar: "النزهة", en: "Al-Nuzha", ur: "النزہہ" },
  RYN: { ar: "الريان", en: "Al-Rayyan", ur: "الریان" },
  BDR: { ar: "بدر", en: "Badr", ur: "بدر" },
  OLY: { ar: "العليا", en: "Al-Olaya", ur: "العلیا" },
  MLQ: { ar: "الملقا", en: "Al-Malqa", ur: "الملقا" },
};
/* هذه سجلات تشغيلية فعلية، تبدأ فارغة وتُحفظ بشكل دائم — لا بيانات تجريبية */
const EXP_LABEL = {
  repPay: { ar: "أجور المناديب", en: "Rep wages", ur: "نمائندہ اجرت" },
  fuel: { ar: "وقود", en: "Fuel", ur: "ایندھن" },
  cars: { ar: "صيانة السيارات", en: "Car service", ur: "گاڑی سروس" },
  bags: { ar: "حافظات وتجهيزات", en: "Hot bags & kit", ur: "بیگ اور سامان" },
  insur: { ar: "تأمين", en: "Insurance", ur: "انشورنس" },
  tech: { ar: "تقنية وتطبيق", en: "Tech & app", ur: "ٹیک اور ایپ" },
  other: { ar: "أخرى", en: "Other", ur: "دیگر" },
};
/* ═══════════  توظيف ومتابعة المناديب  ═══════════ */
// المشرفون أصبحوا موظفين حقيقيين يُوظَّفون من الموارد البشرية (dept:"ops", isSupervisor:true)
function supervisorsOf(employees) {
  const real = (employees || []).filter((e) => e.dept === "ops" && e.isSupervisor && e.status !== "suspended")
    .map((e) => ({ id: e.id, ar: e.name, en: e.name, ur: e.name, photo: e.photo }));
  return real.length ? real : [{ id: "sup1", ar: "بلا مشرف بعد", en: "No supervisor yet", ur: "ابھی کوئی سپروائزر نہیں", photo: null }];
}
const EMP_TYPES = {
  kafala: { ar: "كفالة", en: "Sponsorship", ur: "کفالت" },
  ajeer: { ar: "أجير (عقد مؤقت)", en: "Contracted (Ajeer)", ur: "اجیر (عارضی)" },
};
const VEHICLES = {
  car: { ar: "سيارة", en: "Car", ur: "گاڑی" },
  bike: { ar: "دباب", en: "Motorcycle", ur: "موٹرسائیکل" },
};
const APPS = [
  { id: "hs", ar: "هنقرستيشن", en: "HungerStation", ur: "ہنگر اسٹیشن" },
  { id: "toyou", ar: "تويو", en: "ToYou", ur: "ٹو یو" },
  { id: "ninja", ar: "نينجا", en: "Ninja", ur: "نینجا" },
  { id: "jahez", ar: "جاهز", en: "Jahez", ur: "جاہز" },
  { id: "noon", ar: "نون مينتس", en: "Noon Minutes", ur: "نون منٹس" },
  { id: "lokit", ar: "لوكيت", en: "Lokit", ur: "لوکیٹ" },
  { id: "noonsm", ar: "نون سوبر مول", en: "Noon Super Mall", ur: "نون سپر مال" },
];

/* ═══════════  محرك التسعير ومحاسبة المناديب (بدون كيلومترات)  ═══════════ */
// تسعيرتان لكل تطبيق يضعهما المحاسب: (1) ما يدفعه التطبيق للشركة  (2) ما تدفعه الشركة للمندوب. لا توجد أرقام افتراضية.
const BLANK_PRICE = { mode: "unit", perOrder: "", fixedMonthly: 0, ordersBase: "", ordersTarget: "", perOrderDelta: "", tiers: [{ from: 0, rate: "" }] };
const getAppPrice = (pricing, appId) => (pricing && pricing.app && pricing.app[appId]) || null;
const getRepPrice = (pricing, appId) => (pricing && pricing.rep && pricing.rep[appId]) || null;
const r2 = (n) => Math.round((+n || 0) * 100) / 100;
function validPrice(p) {
  if (!p) return false;
  if (p.mode === "target") return +p.ordersBase > 0 && +p.ordersTarget > 0 && p.perOrderDelta !== "";
  if (p.mode === "tiers") return (p.tiers || []).length > 0 && (p.tiers || []).every((x) => x.rate !== "" && x.from !== "");
  return +p.perOrder > 0;
}
function monthFactor(month) {
  const now = riyadhNow().toISOString();
  if (month !== now.slice(0, 7)) return 1;
  const [y, m] = month.split("-").map(Number);
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Math.min(1, Math.max(1 / dim, +now.slice(8, 10) / dim));
}
function priceCalc(p, orders, f) {
  const n = (v) => +v || 0;
  f = f || 1;
  if (!p || !orders) return { orders: 0, fixed: 0, total: 0, configured: !!p };
  let o = 0;
  if (p.mode === "target") {
    o = n(p.ordersBase) * f + (orders - n(p.ordersTarget) * f) * n(p.perOrderDelta);
  } else if (p.mode === "tiers") {
    const tiers = (p.tiers || []).map((x) => ({ from: n(x.from), rate: n(x.rate) })).sort((a, b) => a.from - b.from);
    tiers.forEach((tr, i) => {
      const hi = i + 1 < tiers.length ? tiers[i + 1].from : Infinity;
      o += Math.max(0, Math.min(orders, hi) - tr.from) * tr.rate;
    });
  } else {
    o = orders * n(p.perOrder);
  }
  const fixed = n(p.fixedMonthly) * f;
  return { orders: r2(o), fixed, total: Math.max(0, r2(o + fixed)), configured: true };
}
// أرباح مندوب من الإدخال اليومي للمشرف (تُجمَّع حسب التطبيق ثم تُسعَّر بتسعيرة المندوب لذلك التطبيق)
function repMonthCalc(entries, rep, pricing, weekendFine, violationPenalty, f) {
  const byApp = {};
  entries.forEach((e) => {
    const a = e.app || rep.app || "hs";
    const g = byApp[a] || (byApp[a] = { orders: 0, hours: 0 });
    g.orders += e.orders || 0; g.hours += e.hours || 0;
  });
  const weekendCount = entries.reduce((s, e) => s + (e.weekendViolations || 0), 0);
  const appCount = entries.reduce((s, e) => s + (e.appViolations || 0), 0);
  const out = { byApp, weekendCount, appCount, weekendAuto: weekendCount * (+weekendFine || 0), appAuto: appCount * (+violationPenalty || 0), f };
  return finishRepCalc(out, rep, pricing);
}
function finishRepCalc(c, rep, pricing) {
  let gross = 0, orders = 0, hours = 0, main = null, mainO = -1, unpriced = false;
  Object.keys(c.byApp).forEach((a) => {
    const g = c.byApp[a], price = getRepPrice(pricing, a);
    if (!price) unpriced = true;
    g.pay = priceCalc(price, g.orders, c.f).total;
    gross += g.pay; orders += g.orders; hours += g.hours || 0;
    if (g.orders > mainO) { mainO = g.orders; main = a; }
  });
  return { ...c, gross: r2(gross), orders, hours, main: main || rep.app, unpriced };
}
// قراءة فاتورة التطبيق (Excel): صف لكل معرف مندوب — الطلبات + مجموع الدفعات والخصومات + الغرامات
async function parseStatement(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null });
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const row = rows[i] || [];
      const ci = row.findIndex((c) => typeof c === "string" && /completed_orders/i.test(c));
      const ri = row.findIndex((c) => typeof c === "string" && /rider_id/i.test(c));
      if (ci < 0 || ri < 0) continue;
      const money = [], pen = [];
      row.forEach((c, k) => { if (typeof c === "string" && k !== ci && k !== ri && /(payment|deduction|penalt)/i.test(c)) { money.push(k); if (/penalt/i.test(c)) pen.push(k); } });
      const out = []; let orders = 0, net = 0, penalties = 0;
      for (let j = i + 1; j < rows.length; j++) {
        const r = rows[j];
        if (!r || r[ri] == null || r[ri] === "" || typeof r[ci] !== "number") continue;
        const rn = money.reduce((s, k) => s + (typeof r[k] === "number" ? r[k] : 0), 0);
        const rp = pen.reduce((s, k) => s + (typeof r[k] === "number" && r[k] < 0 ? -r[k] : 0), 0);
        out.push({ id: String(r[ri]).trim(), orders: r[ci], net: r2(rn), penalties: r2(rp) });
        orders += r[ci]; net += rn; penalties += rp;
      }
      if (out.length) return { file: file.name, rows: out, orders, net: r2(net), penalties: r2(penalties), riders: out.length };
    }
  }
  return null;
}
const EMPTY_SETTLE_INPUTS = { appActual: {}, appFines: {}, fineOverride: {}, manual: [], appStatement: {} };
function computeSettlement(month, reps, reports, pricing, rawInputs, weekendFine, violationPenalty, expenses, receipts) {
  const inputs = { ...EMPTY_SETTLE_INPUTS, ...(rawInputs || {}) };
  const f = monthFactor(month);
  const stm = inputs.appStatement || {};
  const matched = {};
  const repLines = [];
  reps.forEach((r) => {
    const entries = monthEntriesFor(reports, r.id, month);
    const st = stm[r.app];
    const rid = String(r.riderId || "").trim();
    const row = st && rid ? st.rows.find((z) => z.id === rid) : null;
    if (!entries.length && r.status !== "active" && !row) return;
    let c = repMonthCalc(entries, r, pricing, weekendFine, violationPenalty, f);
    const recOrders = (c.byApp[r.app] || {}).orders || 0;
    let source = "daily", appAmtAuto = c.appAuto;
    if (row) {
      source = "invoice";
      matched[r.app] = (matched[r.app] || new Set()); matched[r.app].add(row.id);
      const byApp = { ...c.byApp, [r.app]: { orders: row.orders, hours: (c.byApp[r.app] || {}).hours || 0 } };
      c = finishRepCalc({ ...c, byApp, f: 1 }, r, pricing);
      appAmtAuto = row.penalties;
    }
    const fo = inputs.fineOverride[r.id] || {};
    const weekendAmt = fo.weekend != null ? +fo.weekend : c.weekendAuto;
    const appAmt = fo.app != null ? +fo.app : appAmtAuto;
    const manual = (inputs.manual || []).filter((m) => m.repId === r.id);
    const adds = manual.filter((m) => m.type === "add").reduce((s, m) => s + (+m.amount || 0), 0);
    const deds = manual.filter((m) => m.type === "deduct").reduce((s, m) => s + (+m.amount || 0), 0);
    const totalDed = weekendAmt + appAmt + deds;
    const reimb = r2((receipts || []).filter((q) => q.repId === r.id && q.status === "approved" && (q.date || "").startsWith(month)).reduce((sum, q) => sum + (+q.amount || 0), 0));
    repLines.push({ repId: r.id, riderId: rid, name: r.ar, en: r.en, empType: r.empType, app: c.main, byApp: c.byApp, source, unpriced: c.unpriced,
      orders: c.orders, recOrders, invOrders: row ? row.orders : null, invNet: row ? row.net : null, hours: c.hours,
      gross: c.gross, weekendCount: c.weekendCount, appCount: c.appCount, weekendAmt, appAmt, manualAdds: adds, manualDeds: deds, totalDed,
      reimb, net: r2(c.gross + adds + reimb - totalDed) });
  });
  const agg = {};
  reports.forEach((rp) => {
    if (!rp.date.startsWith(month)) return;
    rp.entries.forEach((e) => {
      const rep = reps.find((r) => r.id === e.id);
      const a = e.app || (rep && rep.app) || "hs";
      const g = agg[a] || (agg[a] = { orders: 0, reps: new Set() });
      g.orders += e.orders || 0; g.reps.add(e.id);
    });
  });
  Object.keys(stm).forEach((a) => { if (!agg[a]) agg[a] = { orders: 0, reps: new Set() }; });
  const appLines = Object.keys(agg).map((a) => {
    const g = agg[a], st = stm[a];
    const orders = st ? st.orders : g.orders;
    const appPrice = getAppPrice(pricing, a);
    const calc = priceCalc(appPrice, orders, st ? 1 : f).total;
    const hasActual = inputs.appActual[a] != null && inputs.appActual[a] !== "";
    const base = hasActual ? +inputs.appActual[a] : st ? st.net : calc;
    const fines = +inputs.appFines[a] || 0;
    const revenue = r2(base - fines);
    const repGross = repLines.reduce((s, l) => s + ((l.byApp[a] && l.byApp[a].pay) || 0), 0);
    const adjust = repLines.filter((l) => l.app === a).reduce((s, l) => s + (l.totalDed - l.manualAdds - (l.reimb || 0)), 0);
    const unmatched = st ? st.rows.filter((z) => !(matched[a] && matched[a].has(z.id))) : [];
    return { app: a, orders, recOrders: g.orders, reps: g.reps.size, calc, appPriced: !!appPrice, repPriced: !!getRepPrice(pricing, a), hasStatement: !!st, file: st ? st.file : "",
      invNet: st ? st.net : null, invPenalties: st ? st.penalties : null, actual: hasActual ? +inputs.appActual[a] : null, fines, revenue,
      repGross: r2(repGross), adjust: r2(adjust), margin: r2(revenue - repGross + adjust), unmatched };
  }).sort((p, q) => q.revenue - p.revenue);
  const totals = {
    revenue: r2(appLines.reduce((s, l) => s + l.revenue, 0)),
    repGross: r2(repLines.reduce((s, l) => s + l.gross, 0)),
    deductions: r2(repLines.reduce((s, l) => s + l.totalDed, 0)),
    additions: r2(repLines.reduce((s, l) => s + l.manualAdds, 0)),
    reimb: r2(repLines.reduce((s, l) => s + (l.reimb || 0), 0)),
    repNet: r2(repLines.reduce((s, l) => s + l.net, 0)),
  };
  totals.companyNet = r2(totals.revenue - totals.repNet);
  totals.expenses = r2((expenses || []).filter((e) => e.status === "approved" && (e.date || "").startsWith(month)).reduce((s, e) => s + (+e.v || 0), 0));
  totals.afterExpenses = r2(totals.companyNet - totals.expenses);
  return { repLines, appLines, totals };
}
// الهدف الشهري يأتي فقط من تسعيرة المندوب التي يضعها المحاسب (نمط الهدف) — لا يوجد رقم افتراضي
const monthTargetOf = (pricing, appId) => { const p = getRepPrice(pricing, appId); return p && p.mode === "target" && +p.ordersTarget > 0 ? +p.ordersTarget : null; };

const WHATS_NEW = {
  ar: [
    { icon: "Trophy", t: "لوحة الصدارة الشهرية", d: "أفضل 3 مناديب كل شهر مع مكافآت تلقائية وفرصة عمرة مجانية." },
    { icon: "Radio", t: "نبض المناديب المباشر", d: "من حجز شفته ومن فعّل بصمته الآن — لحظة بلحظة." },
    { icon: "ClipboardList", t: "سجل التتبع", d: "كل إجراء حساس (كلمات مرور، رواتب، تذاكر) مسجّل بالوقت والمسؤول." },
    { icon: "Download", t: "تصدير Excel", d: "الرواتب والحضور والتقارير — ملف Excel حقيقي بضغطة واحدة." },
    { icon: "MessageSquare", t: "المراسلات الداخلية", d: "شات بين الإدارات، ورسائل للمناديب بخاصية تم الاطلاع." },
    { icon: "ShieldAlert", t: "تنبيهات الإقامات", d: "متابعة تلقائية لتواريخ انتهاء الإقامة وإرسال الإنذارات." },
  ],
  en: [
    { icon: "Trophy", t: "Monthly Leaderboard", d: "Top 3 reps each month with automatic rewards and a free Umrah chance." },
    { icon: "Radio", t: "Live Rep Pulse", d: "Who booked a shift and who's clocked in right now — moment by moment." },
    { icon: "ClipboardList", t: "Audit Log", d: "Every sensitive action (passwords, payroll, tickets) recorded with time and owner." },
    { icon: "Download", t: "Excel export", d: "Payroll, attendance and reports — a real Excel file in one click." },
    { icon: "MessageSquare", t: "Internal messaging", d: "Chat between departments, and one-way messages to reps with a seen receipt." },
    { icon: "ShieldAlert", t: "Residency alerts", d: "Automatic tracking of Iqama expiry dates with timely warnings." },
  ],
  ur: [
    { icon: "Trophy", t: "ماہانہ لیڈر بورڈ", d: "ہر ماہ کے سرِفہرست 3 نمائندے، خودکار انعامات اور مفت عمرہ کا موقع۔" },
    { icon: "Radio", t: "نمائندوں کی براہ راست نبض", d: "کس نے شفٹ بک کی اور ابھی کون حاضر ہے — لمحہ بہ لمحہ۔" },
    { icon: "ClipboardList", t: "آڈٹ لاگ", d: "ہر حساس کارروائی (پاس ورڈ، تنخواہ، ٹکٹس) وقت اور ذمہ دار کے ساتھ درج۔" },
    { icon: "Download", t: "ایکسل ایکسپورٹ", d: "تنخواہ، حاضری اور رپورٹس — ایک کلک میں حقیقی ایکسل فائل۔" },
    { icon: "MessageSquare", t: "اندرونی پیغام رسانی", d: "شعبوں کے درمیان چیٹ، اور نمائندوں کو یک طرفہ پیغامات۔" },
    { icon: "ShieldAlert", t: "اقامہ الرٹس", d: "اقامہ ختم ہونے کی تاریخوں کی خودکار نگرانی اور بروقت انتباہ۔" },
  ],
};

const WHATS_NEW_ICONS = { Trophy, Radio, ClipboardList, Download, MessageSquare, ShieldAlert };

const STAFF_MOTIVATION = {
  ar: [
    "بوارق الشرق فريق واحد — كل قسم فينا يكمّل الثاني، وكل قرار يقربنا من التوسع.",
    "الشركات الكبرى تُبنى بقرارات صغيرة صحيحة كل يوم — وأنتم من يصنعها هنا.",
    "نجاحنا اليوم أساس تمددنا غداً إلى مدن جديدة — استمروا.",
    "كل عميل راضٍ وكل مندوب مدعوم هو لبنة في مستقبل بوارق الشرق.",
    "معاً نبني مؤسسة يفتخر بها كل من عمل فيها.",
    "القرار الصحيح اليوم هو الأساس الذي نكبر عليه غداً.",
  ],
  en: [
    "Bawariq Al-Sharq is one team — every department completes the other, and every decision brings us closer to growth.",
    "Great companies are built on small right decisions made every day — and that's you.",
    "Today's success is the foundation for tomorrow's expansion into new cities — keep going.",
    "Every satisfied customer and every supported rep is a building block of our future.",
    "Together we're building an organization everyone who worked here will be proud of.",
    "The right call today is the foundation we grow on tomorrow.",
  ],
  ur: [
    "بوارق الشرق ایک ٹیم ہے — ہر شعبہ دوسرے کی تکمیل کرتا ہے، اور ہر فیصلہ ہمیں ترقی کے قریب لے جاتا ہے۔",
    "بڑی کمپنیاں روزانہ چھوٹے درست فیصلوں سے بنتی ہیں — اور یہ آپ ہیں۔",
    "آج کی کامیابی کل نئے شہروں میں توسیع کی بنیاد ہے — جاری رکھیں۔",
    "ہر مطمئن کسٹمر اور ہر معاون نمائندہ ہمارے مستقبل کی اینٹ ہے۔",
    "مل کر ہم ایک ایسا ادارہ بنا رہے ہیں جس پر ہر کام کرنے والے کو فخر ہو۔",
    "آج کا درست فیصلہ وہ بنیاد ہے جس پر ہم کل ترقی کرتے ہیں۔",
  ],
};

const MOTIVATION = {
  ar: [
    "كل كيلومتر تقطعه اليوم يقرّبك من هدفك، استمر! 🚀",
    "أنت الوجه الأول لبوارق الشرق أمام كل عميل — فخورون فيك.",
    "طلب اليوم هو خطوة نحو راتب أفضل. يلا نكسر الرقم! 💪",
    "الانضباط في المواعيد يصنع الفارق — وأنت تصنعه كل يوم.",
    "أفضل المناديب لا يتوقفون عند الهدف، يتجاوزونه.",
    "سلامتك أولاً، وسرعتك ثانياً — وأنت بطل الاثنين.",
    "كل عميل راضٍ اليوم هو تقييم إضافي لمستقبلك معنا.",
    "مسافتك اليوم تُكتب في سجل إنجازك — اجعلها تستحق القراءة.",
  ],
  en: [
    "Every kilometer today moves you closer to your goal — keep going! 🚀",
    "You're the face of Bawariq Al-Sharq to every customer — we're proud of you.",
    "Today's order is a step toward a better paycheck. Let's break the record! 💪",
    "Punctuality makes the difference — and you make it every day.",
    "The best reps don't stop at the target, they go beyond it.",
    "Your safety first, your speed second — you're a champion at both.",
    "Every happy customer today is another point for your future here.",
    "Your distance today is written in your record of achievement — make it count.",
  ],
  ur: [
    "آج کا ہر کلومیٹر آپ کو ہدف کے قریب لے جاتا ہے — جاری رکھیں! 🚀",
    "آپ ہر کسٹمر کے سامنے بوارق الشرق کا چہرہ ہیں — ہمیں آپ پر فخر ہے۔",
    "آج کا آرڈر بہتر تنخواہ کی طرف ایک قدم ہے۔ ریکارڈ توڑتے ہیں! 💪",
    "وقت کی پابندی ہی فرق پیدا کرتی ہے — اور آپ یہ ہر روز کرتے ہیں۔",
    "بہترین نمائندے ہدف پر نہیں رکتے، اس سے آگے نکل جاتے ہیں۔",
    "پہلے حفاظت، پھر رفتار — آپ دونوں میں چیمپیئن ہیں۔",
    "آج کا ہر مطمئن کسٹمر آپ کے مستقبل کے لیے ایک اور نمبر ہے۔",
    "آج کا فاصلہ آپ کی کامیابی کے ریکارڈ میں لکھا جاتا ہے — اسے قیمتی بنائیں۔",
  ],
};

/* ═══════════  نظام التذاكر  ═══════════ */
const TICKET_TYPES = [
  { id: "advance", mode: "sequential", chain: ["hr", "fin", "gm"],
    ar: "طلب سلفة مالية", en: "Salary advance request", ur: "تنخواہ ایڈوانس درخواست", icon: HandCoins },
  { id: "leave", mode: "sequential", chain: ["hr", "opsm"],
    ar: "طلب إجازة", en: "Leave request", ur: "چھٹی کی درخواست", icon: CalendarDays },
  { id: "appointment", mode: "sequential", chain: ["ops", "opsm", "hr"],
    ar: "حجز موعد بالمكتب", en: "Office visit appointment", ur: "دفتر ملاقات کی بکنگ", icon: CalendarClock },
  { id: "dispute", mode: "sequential", chain: ["ops", "opsm"],
    ar: "اعتراض على إدخال يوم", en: "Dispute a day entry", ur: "اندراج پر اعتراض", icon: ClipboardList },
  { id: "urgent_supervisor", mode: "broadcast", to: ["ops"], confidential: false,
    ar: "أحتاج المشرف عاجلاً", en: "Need supervisor urgently", ur: "فوری سپروائزر درکار", icon: Radio },
  { id: "urgent_report", mode: "broadcast", to: ["opsm", "gm", "hr"], confidential: false,
    ar: "بلاغ عاجل", en: "Urgent report", ur: "فوری اطلاع", icon: AlertTriangle },
  { id: "confidential", mode: "broadcast", to: ["gm", "opsm"], confidential: true,
    ar: "شكوى سرية", en: "Confidential complaint", ur: "خفیہ شکایت", icon: ShieldAlert },
  { id: "conflict", mode: "broadcast", to: ["gm", "opsm"], confidential: true,
    ar: "مشكلة مع مندوب / مشرف", en: "Conflict with rep / supervisor", ur: "نمائندے/سپروائزر سے مسئلہ", icon: ShieldAlert },
  { id: "misconduct", mode: "broadcast", to: ["gm", "opsm"], confidential: true, legalEscalable: true,
    ar: "بلاغ سوء سلوك / تحقيق أمني", en: "Misconduct report / security investigation", ur: "بدسلوکی کی اطلاع / سیکیورٹی تحقیقات", icon: ShieldAlert },
];
function ticketTypeOf(id) { return TICKET_TYPES.find((t) => t.id === id); }
// المرحلة الحالية للتذكرة: القسم الذي يملك الكرة الآن، أو "resolved"/"rejected"
function ticketCurrentOwner(tk) {
  if (tk.status !== "open") return tk.status;
  if (tk.forwardedToLegal) return "legal";
  const tt = ticketTypeOf(tk.type);
  if (tt.mode === "broadcast") return "broadcast";
  return tt.chain[tk.stage] || "rep";
}
function ticketVisibleToRole(tk, roleId) {
  if (tk.forwardedToLegal && roleId === "legal") return true;
  const tt = ticketTypeOf(tk.type);
  if (tt.mode === "broadcast") return tt.to.includes(roleId);
  return tt.chain.includes(roleId);
}
const TICKET_AUTOCLOSE_HOURS = 72;
function ticketLastActivity(tk) {
  const log = tk.log || [];
  const lastAt = log.length ? log[log.length - 1].at : null;
  return lastAt || tk.createdAt;
}
function ticketHoursOpen(tk) {
  const last = ticketLastActivity(tk);
  if (!last) return 0;
  return (riyadhNow() - new Date(last)) / 3600000;
}

/* ═══════════  خطاف التخزين الدائم  ═══════════ */
/* ═══════════  توقيت الدمام/السعودية الثابت (UTC+3, بلا توقيت صيفي)  ═══════════ */
function riyadhNow() {
  // Date.now() هو أصلاً بتوقيت UTC بغض النظر عن جهاز المستخدم — نضيف فقط +3 ساعات (توقيت السعودية الثابت)
  return new Date(Date.now() + 3 * 3600000);
}
function riyadhToday() { return riyadhNow().toISOString().slice(0, 10); }
function riyadhTimeHM() { return riyadhNow().toISOString().slice(11, 16); }
function logAudit(setAuditLog, role, action, detail, actingEmployee) {
  const byName = actingEmployee && actingEmployee.id !== "generic" ? actingEmployee.name : null;
  setAuditLog((prev) => [{ id: "AUD-" + Date.now() + "-" + Math.floor(Math.random() * 999), by: role.id, byName, action, detail, at: riyadhNow().toISOString() }, ...prev].slice(0, 500));
}
function speak(text, lang) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : "en-US";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch { /* الجهاز لا يدعم النطق، تجاهل بصمت */ }
}

function usePersisted(key, initial) {
  const [state, setState] = useState(initial);
  const [syncStatus, setSyncStatus] = useState("loading"); // loading | ready | error | saveError
  const ready = useRef(false);
  useEffect(() => {
    let alive = true;
    let attempt = 0;
    const tryLoad = async () => {
      attempt++;
      try {
        const r = await window.storage.get(key, true);
        if (!alive) return;
        setState(r && r.value ? JSON.parse(r.value) : initial);
        setSyncStatus("ready");
        ready.current = true;
      } catch (e) {
        const notFound = e && String(e.message || e).includes("not found");
        if (notFound) {
          // مفتاح جديد فعلاً وما خُزّن فيه شي قبل — آمن نعتبره فاضياً
          if (alive) { setState(initial); setSyncStatus("ready"); ready.current = true; }
          return;
        }
        // فشل اتصال حقيقي (شبكة بطيئة، قاعدة البيانات كانت نايمة...) — نعيد المحاولة، ما نفترض إنها فاضية
        if (alive && attempt < 6) { setTimeout(tryLoad, Math.min(attempt * 1200, 6000)); }
        else if (alive) { setSyncStatus("error"); } // نوقف هنا بدل ما نسمح بالكتابة فوق بيانات حقيقية محتملة
      }
    };
    tryLoad();
    return () => { alive = false; };
    // eslint-disable-next-line
  }, []);
  const saveWithRetry = (k, payload, attempt = 1) => {
    window.storage.set(k, payload, true)
      .then(() => { if (syncStatusRef.current === "saveError") setSyncStatus("ready"); })
      .catch((err) => {
        console.error(`bq: فشل حفظ "${k}" — محاولة ${attempt}`, err);
        if (attempt < 3) { setTimeout(() => saveWithRetry(k, payload, attempt + 1), attempt * 1000); }
        else { setSyncStatus("saveError"); }
      });
  };
  const syncStatusRef = useRef(syncStatus);
  useEffect(() => { syncStatusRef.current = syncStatus; }, [syncStatus]);
  const update = (updater) => {
    if (!ready.current) {
      console.warn(`bq: تجاهلت محاولة حفظ "${key}" قبل اكتمال أول تحميل ناجح — حماية من الكتابة فوق بيانات حقيقية.`);
      return;
    }
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveWithRetry(key, JSON.stringify(next));
      return next;
    });
  };
  return [state, update, syncStatus];
}
function usePersonalFlag(key) {
  const [seen, setSeen] = useState(true); // افتراضياً true حتى يتأكد التحميل، لتفادي ومضة الظهور
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await window.storage.get(key, false);
        if (alive) setSeen(!!(r && r.value === "1"));
      } catch { if (alive) setSeen(false); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line
  }, [key]);
  const markSeen = () => {
    setSeen(true);
    window.storage.set(key, "1", false).catch(() => {});
  };
  return [seen, markSeen];
}
function usePersonalList(key) {
  const [list, setList] = useState([]);
  const ready = useRef(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await window.storage.get(key, false);
        if (alive) setList(r && r.value ? JSON.parse(r.value) : []);
      } catch { if (alive) setList([]); }
      finally { if (alive) ready.current = true; }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line
  }, [key]);
  const update = (updater) => {
    if (!ready.current) return;
    setList((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      window.storage.set(key, JSON.stringify(next), false).catch(() => {});
      return next;
    });
  };
  return [list, update];
}


const REP_SEED = [];
const REPORTS_SEED = [];

/* ═══════════  الأنماط  ═══════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
:root{
  --ink:#F5F6F8;--surface-0:#FFFFFF;--surface-1:#FFFFFF;--surface-2:#F5F6F8;--surface-3:#ECEEF2;
  --line:rgba(20,27,45,.09);--line-strong:rgba(20,27,45,.16);
  --gold:#B8862E;--gold2:#8A611E;--muted:rgba(30,38,58,.62);--muted-2:rgba(30,38,58,.42);
  --calm:#0FA579;--soft-bad:#D6584D;
  --ease-spring:cubic-bezier(.22,1,.36,1);--ease-out:cubic-bezier(.16,1,.3,1);
  --r-sm:12px;--r-md:18px;--r-lg:26px;--r-xl:32px;
  --e1:0 1px 2px rgba(20,27,45,.06);
  --e2:0 10px 26px -14px rgba(20,27,45,.16);
  --e3:0 28px 64px -28px rgba(20,27,45,.22);
}
.bq{font-family:'IBM Plex Sans Arabic','Inter',ui-sans-serif,system-ui,'Segoe UI',sans-serif;background:var(--ink);color:#12151D;-webkit-font-smoothing:antialiased;}
.bq[dir="ltr"]{font-family:'Inter','IBM Plex Sans Arabic',ui-sans-serif,system-ui,sans-serif;}
.num{font-family:'Space Grotesk',ui-monospace,SFMono-Regular,monospace;font-variant-numeric:tabular-nums;letter-spacing:-.02em;}
.glass{background:#FFFFFF;border:1px solid var(--line);box-shadow:var(--e2);}
.surface{background:var(--surface-1);border:1px solid var(--line);}
.gold-text{background:linear-gradient(100deg,#B8862E,#8A611E 60%,#5E4110);-webkit-background-clip:text;background-clip:text;color:transparent;}
.mesh{position:absolute;inset:0;pointer-events:none;background:
 radial-gradient(60% 40% at 80% 0%,rgba(184,134,46,.07),transparent 70%),
 radial-gradient(50% 36% at 6% 100%,rgba(15,165,121,.05),transparent 70%),
 #F5F6F8;}
.scene{perspective:1200px;perspective-origin:50% 40%;}
.card3d{transform-style:preserve-3d;transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s,opacity .4s;
  box-shadow:var(--e2);}
.card3d:hover{box-shadow:var(--e3);}
.h-display{font-weight:800;letter-spacing:-.01em;line-height:1.08;}
.h-section{font-weight:800;letter-spacing:-.005em;}
.label-caps{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}
.mesh-dept{position:absolute;inset:0;pointer-events:none;
  background:
   radial-gradient(58% 40% at 80% 0%,rgba(var(--dept-glow,184,134,46),.09),transparent 70%),
   radial-gradient(46% 34% at 4% 100%,rgba(var(--dept-glow,184,134,46),.04),transparent 70%),
   #F5F6F8;}
.crest-ring{filter:drop-shadow(0 3px 5px rgba(20,27,45,.16));}
.sheen{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(115deg,transparent 32%,rgba(20,27,45,.55) 48%,transparent 62%);transform:translateX(-120%);}
.card3d:hover .sheen{transform:translateX(120%);transition:transform 1.1s ease}
.rise{animation:rise .7s cubic-bezier(.16,1,.3,1) both}
@keyframes rise{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}
@media print{
  body *{visibility:hidden;}
  .print-area,.print-area *{visibility:visible;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact;}
  .print-area{position:absolute;inset-inline-start:0;top:0;width:100%;}
  .no-print{display:none !important;}
}
.drop{animation:drop .45s cubic-bezier(.16,1,.3,1) both;overflow:hidden}
@keyframes drop{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:420px;transform:none}}
.spin-slow{animation:spinY 16s linear infinite;transform-style:preserve-3d}
@keyframes spinY{to{transform:rotateY(360deg)}}
.pulse-dot{animation:pdot 1.8s ease-in-out infinite}
@keyframes pdot{0%,100%{opacity:1}50%{opacity:.55}}
.bar-in{animation:barIn 1s cubic-bezier(.16,1,.3,1) both}
@keyframes barIn{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.no-scrollbar::-webkit-scrollbar{display:none}
.no-scrollbar{scrollbar-width:none}
:focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:10px}
input,button,select{font-family:inherit}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
.reduce *{animation:none!important;transition:none!important}
.text-\\[9\\.5px\\]{font-size:9.5px}.text-\\[10px\\]{font-size:10px}.text-\\[10\\.5px\\]{font-size:10.5px}
.text-\\[11px\\]{font-size:11px}.text-\\[11\\.5px\\]{font-size:11.5px}.text-\\[12px\\]{font-size:12px}
.text-\\[12\\.5px\\]{font-size:12.5px}.text-\\[13px\\]{font-size:13px}.text-\\[13\\.5px\\]{font-size:13.5px}
.text-\\[14px\\]{font-size:14px}.text-\\[15px\\]{font-size:15px}.text-\\[16\\.5px\\]{font-size:16.5px}
.text-\\[17px\\]{font-size:17px}.text-\\[22px\\]{font-size:22px}.text-\\[26px\\]{font-size:26px}
.tracking-\\[\\.22em\\]{letter-spacing:.22em}
.w-\\[264px\\]{width:264px}.w-\\[280px\\]{width:280px}.max-w-\\[1400px\\]{max-width:1400px}
.active\\:scale-\\[\\.97\\]:active{transform:scale(.97)}
.text-start{text-align:start}.text-end{text-align:end}
@media(min-width:640px){.sm\\:text-\\[11px\\]{font-size:11px}.sm\\:text-\\[28px\\]{font-size:28px}}
@media(min-width:1024px){.lg\\:ms-\\[286px\\]{margin-inline-start:286px}}
.glass{border-radius:18px;box-shadow:0 1px 2px rgba(20,27,45,.04),0 12px 28px -18px rgba(20,27,45,.14);transition:box-shadow .25s,transform .25s}
.glass:hover{box-shadow:0 1px 2px rgba(20,27,45,.05),0 18px 36px -18px rgba(20,27,45,.2)}
.h-display{letter-spacing:-.02em}
@media(max-width:640px){input,select,textarea{font-size:16px!important;min-height:42px}}
button{transition:background-color .15s,filter .15s,transform .15s}
input:focus,select:focus{border-color:var(--gold)!important;box-shadow:0 0 0 3px rgba(184,134,46,.15)}
.hover\\:bg-white\\/5:hover{background:rgba(255,255,255,.06)}
`;

/* مشهد ثابت: مطعم + سيارة توصيل + مندوب */
function DeliveryScene() {
  return (
    <svg viewBox="0 0 1200 440" className="w-full h-auto block" role="img" aria-label="restaurant delivery scene">
      <defs>
        <linearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B465F"/><stop offset=".38" stopColor="#212A3A"/>
          <stop offset=".75" stopColor="#121826"/><stop offset="1" stopColor="#090D14"/>
        </linearGradient>
        <linearGradient id="glassG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8AA0BC" stopOpacity=".8"/><stop offset="1" stopColor="#131A26" stopOpacity=".95"/>
        </linearGradient>
        <linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F9E9BE"/><stop offset=".5" stopColor="#E4B85C"/><stop offset="1" stopColor="#9E6D1A"/>
        </linearGradient>
        <radialGradient id="tireG" cx=".38" cy=".32" r=".85">
          <stop offset="0" stopColor="#1D232C"/><stop offset="1" stopColor="#05070B"/>
        </radialGradient>
        <linearGradient id="rimG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E2E9F2"/><stop offset=".5" stopColor="#8E99A9"/><stop offset="1" stopColor="#454F5D"/>
        </linearGradient>
        <linearGradient id="roadG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E131C"/><stop offset="1" stopColor="#05070E"/>
        </linearGradient>
        <radialGradient id="glowG" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#E4B85C" stopOpacity=".26"/><stop offset="1" stopColor="#E4B85C" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="beamG" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#FFEFC6" stopOpacity=".42"/><stop offset="1" stopColor="#FFEFC6" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="shineG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0"/><stop offset=".4" stopColor="#fff" stopOpacity=".3"/>
          <stop offset=".62" stopColor="#fff" stopOpacity=".12"/><stop offset="1" stopColor="#fff" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="uniG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#33405A"/><stop offset=".55" stopColor="#1A2130"/><stop offset="1" stopColor="#0D121B"/>
        </linearGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
        <filter id="soft2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="18"/></filter>
      </defs>
      <rect x="0" y="360" width="1200" height="80" fill="url(#roadG)"/>
      <ellipse cx="620" cy="356" rx="430" ry="54" fill="url(#glowG)"/>
      <line x1="0" y1="360" x2="1200" y2="360" stroke="#E4B85C" strokeOpacity=".2"/>
      <g opacity=".35">
        <rect x="20" y="400" width="72" height="4" rx="2" fill="#8894A8"/>
        <rect x="180" y="400" width="72" height="4" rx="2" fill="#8894A8"/>
        <rect x="340" y="400" width="72" height="4" rx="2" fill="#8894A8"/>
        <rect x="500" y="400" width="72" height="4" rx="2" fill="#8894A8"/>
        <rect x="660" y="400" width="72" height="4" rx="2" fill="#8894A8"/>
        <rect x="820" y="400" width="72" height="4" rx="2" fill="#8894A8"/>
        <rect x="980" y="400" width="72" height="4" rx="2" fill="#8894A8"/>
        <rect x="1140" y="400" width="72" height="4" rx="2" fill="#8894A8"/>
      </g>
      <g>
        <rect x="34" y="172" width="228" height="188" rx="6" fill="#141B27"/>
        <rect x="34" y="172" width="228" height="188" rx="6" fill="none" stroke="#2C3648" strokeOpacity=".8"/>
        <rect x="26" y="164" width="244" height="16" rx="5" fill="#1C2432"/>
        <rect x="62" y="188" width="172" height="42" rx="8" fill="url(#goldG)"/>
        <g fill="#1A1204" opacity=".9" transform="translate(0,2)">
          <rect x="128" y="198" width="4" height="24" rx="2"/>
          <rect x="121" y="198" width="3" height="10" rx="1.5"/><rect x="127" y="196" width="3" height="12" rx="1.5"/><rect x="133" y="198" width="3" height="10" rx="1.5"/>
          <path d="M152 198 c8 0 8 12 0 12 l0 12 -4 0 0-24z"/>
          <rect x="150" y="198" width="4" height="24" rx="2"/>
        </g>
        <g>
          <path d="M40 240 h216 l14 30 H26 Z" fill="#B4472F"/>
          <path d="M40 240 h30 l-16 30 H26 Z" fill="#F0F4FA" opacity=".82"/>
          <path d="M100 240 h30 l-16 30 h-30 Z" fill="#F0F4FA" opacity=".82"/>
          <path d="M160 240 h30 l-16 30 h-30 Z" fill="#F0F4FA" opacity=".82"/>
          <path d="M220 240 h30 l-4 30 h-30 Z" fill="#F0F4FA" opacity=".82"/>
          <path d="M26 270 h244" stroke="#7C2F1E" strokeWidth="3"/>
        </g>
        <rect x="54" y="286" width="88" height="58" rx="5" fill="#FFE7B4" opacity=".85"/>
        <rect x="54" y="286" width="88" height="58" rx="5" fill="none" stroke="#8A6A2A" strokeOpacity=".6"/>
        <path d="M98 286 v58" stroke="#8A6A2A" strokeOpacity=".45" strokeWidth="2"/>
        <circle cx="76" cy="312" r="7" fill="#B4472F" opacity=".55"/>
        <rect x="66" y="326" width="24" height="4" rx="2" fill="#8A6A2A" opacity=".5"/>
        <rect x="166" y="278" width="70" height="82" rx="5" fill="#0E1420"/>
        <rect x="172" y="286" width="58" height="52" rx="4" fill="#FFE7B4" opacity=".55"/>
        <circle cx="228" cy="322" r="3" fill="#E4B85C"/>
        <rect x="150" y="352" width="112" height="8" rx="3" fill="#0A0E15"/>
      </g>
      <g transform="translate(196,0)">
      <g opacity=".5">
        <rect x="60" y="286" width="72" height="74" fill="#0C111A"/>
        <rect x="146" y="256" width="54" height="104" fill="#0A0F17"/>
        <rect x="600" y="242" width="86" height="118" fill="#0B1018"/>
        <rect x="700" y="278" width="62" height="82" fill="#090E15"/>
        <rect x="900" y="252" width="78" height="108" fill="#0A0F17"/>
        <g fill="#E4B85C" opacity=".28">
          <rect x="72" y="298" width="8" height="10"/><rect x="92" y="298" width="8" height="10"/>
          <rect x="72" y="322" width="8" height="10"/><rect x="112" y="322" width="8" height="10"/>
          <rect x="158" y="272" width="8" height="10"/><rect x="178" y="296" width="8" height="10"/>
          <rect x="614" y="258" width="9" height="11"/><rect x="640" y="258" width="9" height="11"/>
          <rect x="614" y="288" width="9" height="11"/><rect x="662" y="288" width="9" height="11"/>
          <rect x="640" y="318" width="9" height="11"/>
          <rect x="712" y="294" width="8" height="10"/><rect x="736" y="294" width="8" height="10"/>
          <rect x="914" y="268" width="9" height="11"/><rect x="944" y="268" width="9" height="11"/>
          <rect x="914" y="300" width="9" height="11"/><rect x="944" y="330" width="9" height="11"/>
        </g>
      </g>
      <ellipse cx="468" cy="354" rx="286" ry="14" fill="#000" opacity=".7" filter="url(#soft)"/>
      <ellipse cx="846" cy="358" rx="44" ry="7" fill="#000" opacity=".65" filter="url(#soft)"/>
      <path d="M184 250 L14 200 L14 312 L186 288 Z" fill="url(#beamG)"/>
      <g className="car">
        <g>
          <rect x="478" y="126" width="96" height="44" rx="8" fill="url(#goldG)"/>
          <rect x="478" y="126" width="96" height="44" rx="8" fill="none" stroke="#6E4A10" strokeOpacity=".55"/>
          <path d="M478 134 h96" stroke="#fff" strokeOpacity=".35" strokeWidth="2"/>
          <path d="M533 136 l-13 18 h8 l-2 13 14-19h-8.5z" fill="#171004" opacity=".9"/>
          <rect x="470" y="166" width="112" height="6" rx="3" fill="#0B0F17"/>
          <rect x="486" y="170" width="6" height="6" fill="#0B0F17"/><rect x="560" y="170" width="6" height="6" fill="#0B0F17"/>
        </g>
        <ellipse cx="526" cy="170" rx="70" ry="12" fill="#E4B85C" opacity=".18" filter="url(#soft)"/>
        <path d="M186 315 L283 315 A48 48 0 0 0 379 315 L621 315 A48 48 0 0 0 717 315 L742 315
                 C750 315 754 306 753 296 L752 238 C751 231 747 227 740 226 L668 227
                 C641 213 611 189 583 174 L577 170 L446 170 C439 170 435 172 432 177
                 L383 231 C330 233 250 240 200 248 C190 250 184 256 184 265 Z"
              fill="url(#bodyG)" stroke="#55617A" strokeOpacity=".5" strokeWidth="1.2"/>
        <path d="M196 252 C300 238 430 232 580 238 C650 241 710 248 748 258 L748 266
                 C700 256 630 249 560 246 C420 241 300 246 196 262 Z" fill="url(#shineG)" opacity=".8"/>
        <path d="M186 300 L748 300 L748 315 L186 315 Z" fill="#05070C" opacity=".5"/>
        <path d="M283 313 L621 313" stroke="#E4B85C" strokeOpacity=".18" strokeWidth="2"/>
        <path d="M452 178 L506 178 L506 226 L398 226 Z" fill="url(#glassG)"/>
        <path d="M518 178 L571 178 L638 224 L518 224 Z" fill="url(#glassG)"/>
        <path d="M452 178 L506 178 L506 188 L436 195 Z" fill="#fff" opacity=".16"/>
        <path d="M518 178 L571 178 L596 196 L518 197 Z" fill="#fff" opacity=".12"/>
        <rect x="506" y="176" width="12" height="52" fill="#161D2A"/>
        <path d="M508 230 L508 312" stroke="#080C12" strokeWidth="2" strokeOpacity=".85"/>
        <path d="M640 230 L640 312" stroke="#080C12" strokeWidth="1.6" strokeOpacity=".6"/>
        <rect x="462" y="246" width="24" height="6" rx="3" fill="#9AA5B5" opacity=".8"/>
        <rect x="536" y="246" width="24" height="6" rx="3" fill="#9AA5B5" opacity=".8"/>
        <circle cx="700" cy="262" r="9" fill="none" stroke="#0A0E15" strokeWidth="2" opacity=".7"/>
        <path d="M398 226 L370 218 L365 233 L396 240 Z" fill="#1B2231" stroke="#55617A" strokeOpacity=".55"/>
        <path d="M186 250 L232 244 L237 264 L188 272 Z" fill="#FFF6DE"/>
        <path d="M186 250 L232 244 L237 264 L188 272 Z" fill="none" stroke="#E4B85C" strokeOpacity=".75"/>
        <ellipse cx="208" cy="257" rx="30" ry="18" fill="#FFEFC6" opacity=".5" filter="url(#soft)"/>
        <path d="M184 278 C184 292 190 302 200 306 L240 300 L237 280 Z" fill="#080C13"/>
        <rect x="192" y="284" width="42" height="12" rx="5" fill="#131A26"/>
        <path d="M752 240 L753 268 L734 270 L732 240 Z" fill="#F2564B"/>
        <ellipse cx="746" cy="255" rx="16" ry="13" fill="#F2564B" opacity=".4" filter="url(#soft)"/>
        <g>
          <circle cx="331" cy="319" r="42" fill="url(#tireG)"/>
          <circle cx="331" cy="319" r="42" fill="none" stroke="#333B49" strokeWidth="2"/>
          <circle cx="331" cy="319" r="32" fill="#0A0E15"/>
          <g className="wheel">
            <circle cx="331" cy="319" r="24" fill="url(#rimG)"/>
            <g stroke="#0C1119" strokeWidth="5" strokeLinecap="round">
              <line x1="331" y1="319" x2="331" y2="298"/><line x1="331" y1="319" x2="351" y2="326"/>
              <line x1="331" y1="319" x2="339" y2="340"/><line x1="331" y1="319" x2="323" y2="340"/>
              <line x1="331" y1="319" x2="311" y2="326"/>
            </g>
            <circle cx="331" cy="319" r="6.5" fill="#D7DFE9"/>
          </g>
        </g>
        <g>
          <circle cx="669" cy="319" r="42" fill="url(#tireG)"/>
          <circle cx="669" cy="319" r="42" fill="none" stroke="#333B49" strokeWidth="2"/>
          <circle cx="669" cy="319" r="32" fill="#0A0E15"/>
          <g className="wheel">
            <circle cx="669" cy="319" r="24" fill="url(#rimG)"/>
            <g stroke="#0C1119" strokeWidth="5" strokeLinecap="round">
              <line x1="669" y1="319" x2="669" y2="298"/><line x1="669" y1="319" x2="689" y2="326"/>
              <line x1="669" y1="319" x2="677" y2="340"/><line x1="669" y1="319" x2="661" y2="340"/>
              <line x1="669" y1="319" x2="649" y2="326"/>
            </g>
            <circle cx="669" cy="319" r="6.5" fill="#D7DFE9"/>
          </g>
        </g>
        <path d="M282 320 A49 49 0 0 1 380 320" fill="none" stroke="#070B11" strokeWidth="8" strokeLinecap="round"/>
        <path d="M620 320 A49 49 0 0 1 718 320" fill="none" stroke="#070B11" strokeWidth="8" strokeLinecap="round"/>
      </g>
      <g className="rep">
        <path d="M828 248 L848 248 L845 352 L826 352 Z" fill="url(#uniG)"/>
        <path d="M850 248 L868 248 L871 352 L852 352 Z" fill="#0C1119"/>
        <rect x="818" y="350" width="30" height="10" rx="4" fill="#04070B"/>
        <rect x="848" y="350" width="30" height="10" rx="4" fill="#04070B"/>
        <path d="M824 180 C824 169 832 163 847 163 C862 163 872 169 872 180 L876 250 L820 250 Z" fill="url(#uniG)"/>
        <path d="M824 180 C824 169 832 163 847 163 L847 250 L820 250 Z" fill="#fff" opacity=".055"/>
        <rect x="830" y="192" width="20" height="9" rx="2" fill="#E4B85C" opacity=".75"/>
        <rect x="855" y="193" width="12" height="7" rx="2" fill="#E4B85C" opacity=".35"/>
        <path d="M824 182 C824 172 832 165 845 164" fill="none" stroke="#E4B85C" strokeOpacity=".45" strokeWidth="2"/>
        <path d="M862 174 C852 198 832 212 812 218" fill="none" stroke="#E4B85C" strokeOpacity=".6" strokeWidth="5"/>
        <path d="M834 152 C834 142 860 142 860 152 L858 158 C852 162 842 162 836 158 Z" fill="#20293A"/>
        <circle cx="847" cy="150" r="14" fill="#1C2432"/>
        <path d="M833 146 C833 133 861 133 861 146 Z" fill="#0E1420"/>
        <path d="M833 146 L814 150 L814 143 L833 141 Z" fill="#0E1420"/>
        <path d="M834 139 C837 132 857 132 860 139" fill="none" stroke="#E4B85C" strokeOpacity=".55" strokeWidth="2"/>
        <path d="M826 188 C808 196 798 208 795 221 L813 227 C816 214 824 206 833 202 Z" fill="#151C29"/>
        <g className="bag">
          <rect x="748" y="208" width="68" height="62" rx="9" fill="#161E2C" stroke="#E4B85C" strokeOpacity=".5"/>
          <rect x="748" y="208" width="68" height="15" rx="7" fill="#E4B85C" opacity=".26"/>
          <path d="M789 226 l-14 19 h8.5 l-2 13 14.5-20h-9z" fill="url(#goldG)"/>
          <rect x="758" y="254" width="48" height="6" rx="3" fill="#E4B85C" opacity=".32"/>
        </g>
        <path d="M813 227 C806 231 802 238 802 244 L816 246 C816 240 820 234 826 231 Z" fill="#28313F"/>
        <ellipse cx="812" cy="232" rx="9" ry="7" fill="#2E3949"/>
        <path d="M872 190 C880 202 882 218 878 232" fill="none" stroke="#3A4760" strokeWidth="9" strokeLinecap="round"/>
        <g>
          <rect x="872" y="228" width="15" height="24" rx="3" fill="#0B1018" stroke="#E4B85C" strokeOpacity=".5"/>
          <rect x="874" y="231" width="11" height="18" rx="2" fill="#8FE8D3" opacity=".55"/>
          <ellipse cx="879" cy="240" rx="16" ry="18" fill="#8FE8D3" opacity=".16" filter="url(#soft)"/>
        </g>
        <path d="M834 137 C837 131 857 131 860 137" fill="none" stroke="#F9E9BE" strokeOpacity=".5" strokeWidth="1.6"/>
        <path d="M824 180 C824 169 832 163 845 163" fill="none" stroke="#F9E9BE" strokeOpacity=".35" strokeWidth="1.6"/>
        <path d="M828 250 L826 350" stroke="#F9E9BE" strokeOpacity=".2" strokeWidth="1.6"/>
        <g className="steam" stroke="#fff" strokeOpacity=".2" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M766 200 C762 190 772 186 768 176"/>
          <path d="M784 198 C780 188 790 184 786 172"/>
          <path d="M802 202 C798 194 806 190 803 182"/>
        </g>
      </g>
      </g>
    </svg>
  );
}

/* ═══════════  الشعار  ═══════════ */
function Logo({ s = 44 }) {
  return (
    <div className="scene shrink-0" style={{ width: s, height: s }}>
      <div className="spin-slow relative w-full h-full grid place-items-center">
        <div className="absolute inset-0 rounded-full border" style={{ borderColor: "rgba(228,184,92,.35)", transform: "rotateX(72deg)" }} />
        <div className="absolute inset-1 rounded-full border" style={{ borderColor: "rgba(228,184,92,.22)", transform: "rotateY(68deg)" }} />
        <svg viewBox="0 0 24 24" width={s * 0.5} height={s * 0.5} style={{ filter: "drop-shadow(0 0 8px rgba(228,184,92,.65))" }}>
          <defs><linearGradient id="bqg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F7E3B0" /><stop offset="1" stopColor="#C08A22" />
          </linearGradient></defs>
          <path d="M13.6 2 5.2 13.4h5.1L9.2 22l9-11.9h-5.3z" fill="url(#bqg)" />
        </svg>
      </div>
    </div>
  );
}
function Wordmark({ t, s = 44, dark }) {
  return (
    <div className="flex items-center gap-3">
      <Logo s={s} />
      <div className="leading-tight">
        <div className="font-extrabold tracking-tight gold-text" style={{ fontSize: s * 0.42 }}>{t.brand}</div>
        <div className="text-[10px] tracking-[.22em] uppercase" style={{ color: dark ? "rgba(255,255,255,.5)" : "var(--muted)" }}>{t.brand2}</div>
      </div>
    </div>
  );
}

/* ═══════════  عناصر واجهة  ═══════════ */
const fmt = (n) => new Intl.NumberFormat("en-US").format(n);
const money = (n) => n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(0) + "K" : String(n);
const zn = (k, lang) => ZN[k][lang];

function useTilt(max = 8) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg) translateZ(12px)`;
  };
  const leave = () => { const el = ref.current; if (el) el.style.transform = ""; };
  return { ref, onMouseMove: move, onMouseLeave: leave };
}

function Chip({ children, tone = "n", sm }) {
  const map = { ok: "rgba(79,209,165,", warn: "rgba(228,184,92,", bad: "rgba(232,131,122,", info: "rgba(91,200,232,", hot: "rgba(255,145,83,", n: "rgba(30,38,58," };
  const c = map[tone] || map.n;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap ${sm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}`}
      style={{ background: c + ".10)", borderColor: c + ".28)", color: c + ".95)" }}>{children}</span>
  );
}
const TONE = {
  new: "info", preparing: "hot", picked: "info", on_way: "info", delivered: "ok",
  canceled: "n", late: "bad", pending: "warn", approved: "ok", paid: "ok", overdue: "bad",
  active: "ok", expiring: "warn", open: "info", closed: "n", review: "warn",
  present: "ok", leave: "warn", on_shift: "ok", off_shift: "n", maint: "warn", idle: "n",
};

function Panel({ title, extra, children, className = "" }) {
  return (
    <section className={`glass rounded-2xl relative overflow-hidden ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 pb-2">
          <h3 className="text-[13px] font-bold tracking-wide">{title}</h3>{extra}
        </header>
      )}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5">{children}</div>
    </section>
  );
}

function ProgressRing({ pct, size = 128, stroke = 11, accent, label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c - (clamped / 100) * c;
  return (
    <div className="relative grid place-items-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(20,27,45,.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`rgb(${accent})`} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="num text-[26px] font-extrabold leading-none">{Math.round(clamped)}%</div>
          {label && <div className="text-[9.5px] mt-1 font-semibold" style={{ color: "var(--muted)" }}>{label}</div>}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, unit, delta, icon: Icon, accent, sparkData }) {
  const up = (delta ?? 0) >= 0;
  const gid = "sp" + accent.replace(/,/g, "-");
  return (
    <div className="glass card3d rounded-2xl p-4 relative overflow-hidden">
      <div className="sheen" />
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold leading-tight" style={{ color: "var(--muted)" }}>{label}</span>
        <span className="grid place-items-center w-8 h-8 rounded-xl shrink-0" style={{ background: `rgba(${accent},.13)`, border: `1px solid rgba(${accent},.26)` }}>
          <Icon size={15} style={{ color: `rgb(${accent})` }} />
        </span>
      </div>
      <div className="mt-3 flex items-end gap-1.5">
        <span className="num text-[22px] sm:text-[28px] font-bold leading-none">{value}</span>
        {unit && <span className="text-[11px] mb-0.5" style={{ color: "var(--muted)" }}>{unit}</span>}
      </div>
      {delta != null && (
        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold" style={{ color: up ? "#4FD1A5" : "#E8837A" }}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span className="num">{up ? "+" : ""}{delta}%</span>
        </div>
      )}
      {sparkData && sparkData.length > 1 && (
        <div className="h-8 mt-2 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={`rgb(${accent})`} stopOpacity=".45" />
                <stop offset="1" stopColor={`rgb(${accent})`} stopOpacity="0" />
              </linearGradient></defs>
              <Area type="monotone" dataKey="v" stroke={`rgb(${accent})`} strokeWidth={1.6} fill={`url(#${gid})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Btn({ children, icon: Icon, onClick, variant = "ghost", full, accent, disabled }) {
  const styles = {
    gold: { background: "linear-gradient(100deg,#F7E3B0,#E4B85C 55%,#C08A22)", color: "#1A1204", border: "1px solid rgba(255,255,255,.25)", boxShadow: "0 10px 30px -12px rgba(228,184,92,.7)" },
    accent: { background: `linear-gradient(100deg,rgba(${accent},.95),rgba(${accent},.55))`, color: "#06090F", border: "1px solid rgba(255,255,255,.22)", boxShadow: `0 12px 32px -14px rgba(${accent},.9)` },
    ghost: { background: "rgba(20,27,45,.045)", color: "#12151D", border: "1px solid var(--line)" },
    danger: { background: "rgba(232,131,122,.10)", color: "#E8837A", border: "1px solid rgba(232,131,122,.3)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], transitionTimingFunction: "var(--ease-spring)", opacity: disabled ? .5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl text-[12.5px] font-bold transition-all duration-200 px-4 py-2.5 active:scale-[.96] hover:brightness-95 ${full ? "w-full" : ""}`}>
      {Icon && <Icon size={15} />}{children}
    </button>
  );
}

const AXIS = { stroke: "rgba(30,38,58,.5)", fontSize: 10, fontFamily: "Space Grotesk" };
const TIP = {
  contentStyle: { background: "#181B22", border: "1px solid rgba(20,27,45,.1)", borderRadius: 12, fontSize: 12, fontFamily: "Space Grotesk",
    boxShadow: "0 18px 40px -16px rgba(20,27,45,.35)", padding: "8px 12px" },
  labelStyle: { color: "rgba(20,27,45,.55)", fontWeight: 600, marginBottom: 2 }, itemStyle: { color: "#F5F6F8", fontWeight: 600 }, cursor: { fill: "rgba(20,27,45,.04)" },
};

/* ═══════════  تسميات إضافية  ═══════════ */
const EX = {
  ar: {
    gateSub: "اختر إدارتك ثم أدخل كلمة مرور الإدارة. تُفتح لوحة العمل حسب صلاحياتك.",
    enterPass: "أدخل كلمة المرور", deptPass: "كلمة مرور الإدارة",
    errPass: "كلمة المرور غير مكتملة — 4 خانات على الأقل.",
    errRep: "أدخل رقم هوية صحيح وكلمة المرور.",
    orRep: "أو دخول المناديب", repTitle: "دخول المندوب",
    repSub: "للمناديب والسائقين — الدخول برقم الهوية",
    nationalId: "رقم الهوية / الإقامة", repHint: "الدخول متاح خلال ساعات الوردية المسجلة",
    ordersToday: "طلبات الوردية", doneToday: "تم التسليم", inRoute: "قيد التوصيل",
    distance: "المسافة المقطوعة", cash: "تحصيل نقدي", rating: "تقييمك", myRoute: "طلبات الوردية",
    pod: "تأكيد تسليم الطلب", accept: "قبول الطلب", pickup: "الاستلام من المطعم",
    leaveToday: "في إجازة اليوم", openRoles: "وظائف مفتوحة", docsExp: "مستندات تنتهي",
    winRate: "نسبة كسب القضايا", compScore: "مؤشر الالتزام",
    newOrder: "طلب جديد", addRest: "إضافة مطعم", addEmp: "إضافة موظف", upDoc: "رفع مستند",
    reportsT: "التقارير المؤسسية", generate: "توليد", monthly: "شهري", quarterly: "ربع سنوي", yearly: "سنوي",
    repItems: ["أداء التوصيل والأحياء", "القوائم المالية", "تحليل أسطول السيارات", "دوران المناديب", "التزام عقود المطاعم"],
    compItems: [["تراخيص نشاط التوصيل", "سارية"], ["شهادات نقل الأغذية", "سارية"], ["فحص حافظات الحرارة", "تنتهي قريباً"], ["تأمين السيارات", "سارية"], ["حماية بيانات العملاء", "مراجعة"]],
    capacity: "الحمل", cities: ["الدمام", "الخبر", "الظهران", "الجبيل"],
    payrollNote: "تُصرف أجور المناديب أسبوعياً، ورواتب الإدارات في 25 من الشهر",
    role: "الدور الحالي", caseTypes: ["سلامة غذائية", "مرور", "عقود", "عمالية"],
    pay: { cash: "نقدي", card: "شبكة", online: "إلكتروني" },
    orders: "طلب", zoneReps: "مناديب", avgZone: "متوسط التوصيل",
    secTitle: "تغيير كلمة المرور", curPass: "كلمة المرور الحالية", newPass: "كلمة المرور الجديدة",
    cfPass: "تأكيد كلمة المرور", strength: "قوة كلمة المرور", weak: "ضعيفة", medium: "متوسطة", strong: "قوية",
    savePass: "تحديث كلمة المرور", errCur: "أدخل كلمة المرور الحالية.", errShort: "الجديدة يجب أن تكون 6 خانات أو أكثر.",
    errMatch: "التأكيد لا يطابق كلمة المرور الجديدة.", errSame: "الجديدة مطابقة للحالية — اختر كلمة مرور مختلفة.",
    okSaved: "تم تحديث كلمة المرور بنجاح", showPass: "إظهار كلمة المرور",
    secNote: "هذه كلمة مرور الإدارة، ويستخدمها جميع موظفي القسم. عند تغييرها يُبلَّغ أعضاء القسم تلقائياً.",
    secNoteRep: "هذه كلمة مرورك الشخصية المرتبطة برقم هويتك. لا تشاركها مع أحد.",
    lastChanged: "آخر تغيير", tips: "استخدم 8 خانات على الأقل مع أرقام ورموز.",

    hiringT: "توظيف المناديب", repDirectory: "سجل المناديب", addRepBtn: "رفع مندوب جديد",
    repName: "اسم المندوب", repPhone: "رقم الجوال", repNid: "رقم الهوية / الإقامة",
    repIdExpiry: "تاريخ انتهاء الهوية", repEmpType: "نوع التعاقد", repVehicle: "وسيلة التوصيل",
    repApp: "التطبيق", idPhoto: "صورة الهوية / الإقامة", licPhoto: "صورة الرخصة",
    uploadTap: "اضغط لرفع صورة", uploaded: "تم الرفع", submitRep: "إرسال للمراجعة",
    pendingReps: "بانتظار التفعيل", activeReps2: "مناديب نشطون", activateBtn: "تفعيل ونقل إلى التشغيل",
    chooseSup: "اختر المشرف المسؤول", confirmActivate: "تأكيد التفعيل",
    errRepName: "أدخل اسم المندوب.", errRepPhone: "رقم جوال غير صحيح (10 أرقام).",
    errRepNid: "رقم هوية غير صحيح (10 أرقام).", errRepExpiry: "أدخل تاريخ انتهاء صحيح.",
    errRepPhotos: "أرفق صورة الهوية والرخصة.", repAdded: "تم إرسال المندوب للمراجعة",
    repActivated: "تم تفعيل المندوب ونقله إلى التشغيل",
    shiftsT: "أداء المناديب", teamOf: "فريق", reportDate: "تاريخ التقرير",
    ordersCol: "الطلبات", hoursCol: "ساعات العمل", kmCol: "الكيلومترات", violCol: "المخالفات",
    targetCol: "تحقيق الهدف", tierCol: "التصنيف", saveReport: "حفظ التقرير",
    reportSaved: "تم حفظ التقرير وإرساله إلى قسم التقارير",
    tierExcellent: "ممتاز", tierGood: "جيد", tierImprove: "يحتاج تحسين", tierWeak: "ضعيف",
    dailyTargetLbl: "الهدف اليومي", ordersTarget: "طلب", kmTarget: "كم",
    perfAnalytics: "تحليل أداء المناديب", avgAchieve: "متوسط تحقيق الهدف",
    totalActiveReps: "مناديب نشطون", totalViolations: "إجمالي المخالفات", topPerformer: "الأعلى أداءً",
    needsAttention: "بحاجة لمتابعة", noPending: "لا يوجد مناديب بانتظار التفعيل",
    repReportsT: "تقارير المناديب", corpReportsT: "تقارير المؤسسة",
    searchRep: "ابحث باسم المندوب أو رقم الجوال…", noReports: "لا توجد تقارير محفوظة بعد",
    savedBy: "حفظه", repsCount: "عدد المناديب", viewReport: "عرض التفاصيل", hideReport: "إخفاء التفاصيل",
    globalNoMatch: "لا توجد نتائج مطابقة", searchResults: "نتائج البحث",
    repPassword: "كلمة مرور مبدئية للمندوب", errRepPass: "أدخل كلمة مرور مبدئية (4 خانات على الأقل).",
    errRepNotActive: "بيانات الدخول غير صحيحة أو الحساب غير مفعّل بعد.",
    errRepWrongPass: "كلمة المرور غير صحيحة.",
    shiftPickTitle: "قبل ما تبدأ، حدد شفتك", shiftPickSub: "اختر وقت بداية ونهاية شفت اليوم — تقدر تسجل شفت جديد أي وقت لاحقاً من القائمة.",
    shiftStart: "بداية الشفت", shiftEnd: "نهاية الشفت", confirmShift: "بدء الشفت والدخول",
    logNewShift: "تسجيل شفت جديد", shiftLogged: "تم تسجيل الشفت", myShifts: "شفتاتي المسجلة",
    motivHeadline: "استمر، أنت تصنع الفرق",
    tickets: "التذاكر", newTicket: "تذكرة جديدة", ticketType: "نوع الطلب", ticketMode: "طريقة الإدخال",
    ticketText: "كتابة", ticketVoice: "تسجيل صوتي", ticketBody: "تفاصيل الطلب",
    ticketBodyPh: "اكتب تفاصيل طلبك هنا…", recordStart: "بدء التسجيل", recordStop: "إيقاف التسجيل",
    recordPlay: "استماع", recordAgain: "إعادة التسجيل", micDenied: "تعذّر الوصول للميكروفون — جرّب الكتابة بدلاً من ذلك.",
    submitTicket: "إرسال التذكرة", ticketSent: "تم إرسال تذكرتك وستتم متابعتها",
    errTicketType: "اختر نوع الطلب.", errTicketBody: "اكتب تفاصيل الطلب أو سجّل رسالة صوتية.",
    myTickets: "تذاكري", inboxTickets: "التذاكر الواردة", noTickets: "لا توجد تذاكر بعد",
    stageSubmitted: "تم الإرسال", stageAt: "قيد المراجعة عند", stageResolved: "تم الاعتماد",
    stageRejected: "مرفوضة", confidentialBadge: "سرّية — لا يطّلع عليها إلا المدير العام ومدير الحركة والتشغيل",
    forwardNext: "اعتماد وتحويل للمرحلة التالية", resolveTicket: "اعتماد نهائي", rejectTicket: "رفض الطلب",
    replyPh: "أضف ملاحظة (اختياري)…", ticketFrom: "من", ticketAt: "بتاريخ",
    charterTitle: "لائحة حماية المندوب الداخلية",
    charterBody: "بوارق الشرق تضمن حق كل مندوب في بيئة عمل كريمة. أي إساءة أو تجاهل من مشرف أو مسؤول يُرفع مباشرة وسرياً للمدير العام ومدير الحركة والتشغيل، ويُتابع خلال 48 ساعة.",
    circulars: "التعاميم", newCircular: "تعميم جديد", circularTitle: "عنوان التعميم", circularBody: "نص التعميم",
    publishCircular: "نشر التعميم", noCirculars: "لا توجد تعاميم بعد", publishedBy: "صادر من",
    clockIn: "تسجيل حضور", clockOut: "تسجيل انصراف", clockedInAt: "وقت الحضور", clockedOutAt: "وقت الانصراف",
    notClockedIn: "لم يسجَّل حضورك اليوم", alreadyClockedIn: "تم تسجيل حضورك اليوم", myAttendanceLog: "سجل حضوري",
    allAttendance: "حضور جميع الإداريين", onDutyNow: "متواجدون الآن",
    payrollHR: "اعتماد رواتب المناديب", sendToFinance: "اعتماد وإرسال للمالية", sentToFinance: "تم الإرسال للمالية",
    awaitingHR: "بانتظار اعتماد الموارد البشرية", finalPayroll: "رواتب المناديب النهائية",
    ordersPart: "مكوّن الطلبات", kmPart: "مكوّن المسافة", fuelAllow: "صرفية بنزين",
    fuelAllowHint: "من 30 إلى 40 ر.س حسب تقدير الإدارة", totalSalary: "إجمالي الراتب",
    monthTarget: "الهدف الشهري", companyRevenue: "حسبة شركة التشغيل", perOrderRate: "لكل طلب",
    perKmRate: "لكل كم بعد الأول", netCompany: "صافي ربح المؤسسة", markFinalized: "اعتماد نهائي للشهر",
    gmOversight: "سيطرة كاملة", allDeptsSnapshot: "لمحة عن جميع الإدارات",
    noRecords: "لا توجد سجلات بعد — أضف أول سجل حقيقي.",
    addOrder: "إضافة طلب", addCar: "إضافة سيارة", addRestaurant: "إضافة مطعم", addInvoice: "إضافة فاتورة",
    addEmployeeBtn: "إضافة موظف إداري", addContract: "إضافة عقد", addCase: "إضافة قضية", addApproval: "إضافة طلب موافقة",
    orderRestaurant: "اسم المطعم", orderZone: "الحي", orderValue: "قيمة الطلب", orderPay: "طريقة الدفع",
    carPlate: "رقم اللوحة", carModel: "طراز السيارة", empName: "اسم الموظف", empDept: "الإدارة", empPosition: "المسمى الوظيفي",
    contractParty: "الطرف المتعاقد", contractType: "نوع العقد", contractValue: "قيمة العقد",
    caseSubject: "موضوع القضية", caseAuthority: "الجهة المختصة", approvalTitle: "عنوان الطلب", approvalAmount: "المبلغ",
    save: "حفظ", cancel: "إلغاء",
    pulseTitle: "نبض المناديب المباشر", pulseSub: "من حجز شفته، ومن فعّل بصمته الآن — لحظة بلحظة",
    onDutyLive: "متواجد الآن", bookedNotIn: "حجز الشفت ولم يفعّل البصمة بعد", noShiftToday: "لم يحجز شفتاً اليوم",
    shiftWindow: "الشفت المحجوز", clockStatus: "حالة البصمة", staffMotivHeadline: "فريق واحد، هدف واحد",
    fullControlNote: "لك صلاحية كاملة على كل الإدارات والمناديب من هذه المنصة.",
    iqamaT: "تنبيهات انتهاء الإقامات", iqamaSub: "تابع تواريخ انتهاء إقامات المناديب وأرسل الإنذارات في وقتها",
    daysLeft: "الأيام المتبقية", expired: "منتهية", critical: "حرجة", warning: "تحذير", healthy: "سليمة",
    sendAlert: "إرسال إنذار", alertSent: "تم الإرسال", lastAlert: "آخر إنذار", noExpiries: "لا توجد إقامات مسجّلة بعد",
    iqamaGmCard: "تنبيهات الإقامات", iqamaUrgentCount: "تحتاج متابعة عاجلة",
    payrollRunsT: "مسيرات الرواتب الشهرية", payrollRunsSub: "تُقفل تلقائياً في نهاية كل شهر وتُرسل للمدير العام لاعتمادها",
    closeMonth: "إقفال الشهر وإرسال للمدير العام", monthClosed: "تم إقفال الشهر وإرساله للاعتماد",
    runStatusSent: "بانتظار اعتماد المدير العام", runStatusApproved: "معتمد من المدير العام",
    approveRun: "اعتماد المسير", runArchive: "أرشيف المسيرات السابقة", noRuns: "لا توجد مسيرات رواتب بعد",
    forwardToBoardBtn: "إرسال لهيئة المستشارين", boardReviewT: "بانتظار اعتماد هيئة المستشارين", awaitingBoardLbl: "بانتظار قرار المستشارين",
    runId: "رقم المسير", runDate: "تاريخ الإقفال", alreadyClosedMonth: "هذا الشهر مُقفل مسبقاً.",
    hrOnlyHiring: "توظيف الموظفين الإداريين من اختصاص الموارد البشرية فقط.",
    dammamTime: "بتوقيت الدمام", empPhoto: "الصورة الشخصية", isSupervisorLbl: "مشرف تشغيل يدير مناديب",
    attachFile: "إرفاق ملف (أي نوع)", autoCloseHint: "تُغلق التذكرة تلقائياً بعد 72 ساعة بدون رد.",
    stageAutoClosed: "أُغلقت تلقائياً (تجاوزت 72 ساعة)", autoCloseNote: "أُغلقت هذه التذكرة تلقائياً لتجاوزها 72 ساعة بدون رد. إذا كنت تعترض، ارفع شكوى سرية أو بلاغاً عاجلاً:",
    objConfidential: "رفع شكوى سرية", objReport: "رفع بلاغ عاجل", viewAttachment: "عرض المرفق",
    chatT: "التواصل بين الإدارات", chatToRep: "مراسلة مندوب", chatWith: "المحادثة مع", chatSendPh: "اكتب رسالتك…",
    chatSend: "إرسال", chatNoMsgs: "لا توجد رسائل بعد", chatSelectDept: "اختر إدارة للمحادثة",
    repMsgsT: "رسائل الإدارة", repMsgFrom: "من", markSeen: "تم الاطلاع", seenAt: "تمت المشاهدة",
    seenBadge: "تمت المشاهدة", notSeenBadge: "لم يُطّلع عليها بعد", composeToRep: "اختر مندوباً",
    sendToRep: "إرسال للمندوب", invoiceAttach: "إرفاق مستند الفاتورة",
    lbTitle: "لوحة الصدارة الشهرية", lbSub: "أفضل 3 مناديب هذا الشهر — تُحدَّث لحظياً من أول يوم",
    lbFirst: "المركز الأول", lbSecond: "المركز الثاني", lbThird: "المركز الثالث",
    lbFirstDesc: "الأول في الطلبات والكيلومترات معاً", lbSecondDesc: "الأكثر كيلومترات", lbThirdDesc: "الأكثر التزاماً بالانضباط والسلوك والمواعيد",
    lbUmrah: "عمرة مجانية كاملة على حساب الشركة", lbUmrahHint: "لتحقيقه المركز الأول شهرين متتاليين",
    lbYourRank: "ترتيبك الحالي", lbNoData: "لا توجد بيانات أداء بعد هذا الشهر — ابدأ وسجّل اسمك في القمة",
    lbPickThird: "اختيار الأكثر التزاماً لهذا الشهر", lbSaveThird: "حفظ الاختيار", lbThirdSaved: "تم الحفظ",
    lbOrders: "طلب", lbKm: "كم", lbMotivate: "كل طلب وكل كيلومتر يقرّبك من القمة — الشهر ما خلص بعد!",
    lbHistoryNote: "يُحتسب بداية كل شهر من جديد", lbReward: "مكافأة الصدارة",
    auditT: "سجل التتبع", auditNoLogs: "لا توجد أحداث مسجّلة بعد", auditAction: "الإجراء", auditBy: "المسؤول", auditWhen: "الوقت",
    hallOfFameT: "قاعة المشاهير", hallOfFameSub: "المتصدّرون عبر الأشهر السابقة",
    atRiskT: "مناديب قد لا يحققون الهدف الشهري",
    bulkSelected: "محدد", bulkDelete: "حذف المحدد",
    backupT: "نسخة احتياطية كاملة", backupSub: "صدّر كل بيانات المنصة كملف واحد، أو استعد نسخة سابقة.",
    backupExport: "تصدير نسخة احتياطية", backupImport: "استيراد واستعادة", restoreGmOnly: "الاستعادة متاحة للمدير العام فقط.",
    restoreOk: "تم استعادة البيانات بنجاح", restoreErr: "الملف غير صالح أو تالف",
    declineAlert: "تراجع ملحوظ في الأداء مقارنة بمعدله المعتاد", searchGoTo: "الانتقال إلى",
    noSupervisorYet: "لا يوجد مشرف تشغيل مسجّل بعد — وظّف مشرفاً أولاً من الموارد البشرية.", pleaseChoose: "اختر المشرف…",
    repOf: "فريق", editRepT: "تعديل بيانات المندوب", actingAs: "أنت تعمل الآن باسم", chooseIdentity: "من أنت؟",
    chooseIdentitySub: "هذا القسم يُستخدم بأكثر من موظف — اختر اسمك لتظهر إجراءاتك موقّعة باسمك.",
    continueGeneric: "المتابعة كإداري عام", identitySaved: "تم تحديد هويتك لهذه الجلسة",
    empPassword: "كلمة المرور الشخصية", identityPassPh: "أدخل كلمة مرورك للتأكيد", errIdentityPass: "كلمة المرور غير صحيحة.",
    noPasswordSet: "بلا كلمة مرور",
    forwardedToLegalBadge: "أُحيلت للشؤون القانونية", forwardToLegal: "إحالة للشؤون القانونية",
    apptDateLbl: "تاريخ الموعد", apptTimeLbl: "وقت الموعد", errApptDate: "اختر تاريخ الموعد.",
    charterPageT: "اللائحة الداخلية للمناديب", charterPageSub: "السياسات والعقوبات المعتمدة — يديرها قسم الشؤون القانونية",
    weekendFineT: "غرامة غياب الويكند", weekendFineDesc: "قيمة الغرامة المستحقة عند التغيّب في أيام نهاية الأسبوع المحددة.",
    reputationT: "سوء سمعة المندوب", reputationDesc: "أي إساءة متكررة للسمعة أو سلوك مخالف يُوثَّق ويُحال للتحقيق.",
    investigationT: "التحقيق الأمني", investigationDesc: "عند ثبوت تورط في شيء مشبوه، يُحال الملف من المدير العام لفتح تحقيق رسمي.",
    routingT: "مسار البلاغات", routingDesc: "بلاغات المناديب تصل لمدير العام ومدير التشغيل أولاً، ثم تُوجَّه للشؤون القانونية للمتابعة.",
    addClauseBtn: "إضافة بند جديد", clauseTitleLbl: "عنوان البند", clauseBodyLbl: "نص البند", saveClause: "حفظ البند",
    fineAmountLbl: "قيمة الغرامة (ر.س)", saveFine: "حفظ القيمة", noClausesYet: "لا توجد بنود مضافة بعد",
    clockInConfirmed: "تم تسجيل حضورك بنجاح", clockOutConfirmed: "تم تسجيل انصرافك بنجاح",
    resetLaunchT: "تصفير المنصة قبل الإطلاق", resetLaunchSub: "يحذف كل المناديب والتقارير والتذاكر والرواتب والحضور والفواتير وكل سجل تشغيلي، ويعيد المنصة لبداية فارغة تماماً. لا يمس إعدادات اللائحة الداخلية.",
    resetLaunchWarn: "تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه. تأكد من أخذ نسخة احتياطية أولاً إذا كنت تحتاج أي بيانات حالية.",
    resetTypeLbl: 'اكتب RESET للتأكيد', resetLaunchBtn: "تصفير المنصة الآن", resetLaunchDone: "تم تصفير المنصة بنجاح — جاهزة للإطلاق من الصفر",
    servicesMapT: "خريطة خدماتك", startNow: "ابدأ الآن", checklistT: "قائمة التحقق قبل الإطلاق",
    ttsConfirm: "تم إرسال طلبك بنجاح", autoBackupNote: "نسخة احتياطية تلقائية أسبوعية",
    chkSupervisor: "تم توظيف مشرف تشغيل واحد على الأقل", chkActiveRep: "يوجد مندوب نشط واحد على الأقل",
    chkAllDepts: "كل الإدارات لها موظف واحد على الأقل", chkDailyReport: "تم حفظ تقرير أداء يومي واحد على الأقل",
    chkBackupDone: "تم أخذ نسخة احتياطية واحدة على الأقل", chkCircular: "تم نشر تعميم واحد على الأقل",
    chkFineSet: "غرامة الويكند مضبوطة", chkAllReady: "كل شي جاهز — المنصة مستعدة للإطلاق!",
    growthT: "نمو الشركة", growthSub: "تطور حقيقي عبر آخر 12 شهراً — مبني من بياناتك الفعلية فقط", growthMonths: "أشهر بها نشاط",
    growthRepsT: "نمو عدد المناديب", growthOrdersT: "الطلبات والكيلومترات شهرياً", growthRevenueT: "الإيرادات الشهرية (ألف ر.س)",
    apptSoonT: "موعد قريب", apptSoonNote: "موعد المندوب خلال أقل من ساعة",
    deptLockedErr: "تم قفل هذا القسم بعد محاولات دخول فاشلة متكررة. فقط مدير الحركة والتشغيل يقدر يفكّه.",
    deptPwNotSetErr: "كلمة مرور هذا القسم لم تُعيَّن بعد. يعيّنها مدير الحركة والتشغيل من صفحة «الأمان».",
    securityT: "الأمان", securitySub: "إدارة كلمات مرور الأقسام والقفل الأمني — حصراً لمدير الحركة والتشغيل",
    deptPwLbl: "كلمة مرور القسم", saveDeptPw: "حفظ كلمة المرور", lockedBadge: "مقفل", unlockBtn: "فك القفل", failsLbl: "محاولات فاشلة",
    suspendBtn: "إيقاف عن العمل", reactivateBtn: "إعادة تفعيل", suspendedBadge: "موقوف عن العمل",
    onlyOpsGm: "حصراً لمدير الحركة والتشغيل والمدير العام", resetRepPwT: "إعادة تعيين كلمة مرور مندوب",
    hiringFallbackNote: "متاحة أيضاً لمدير الحركة والتشغيل لضمان استمرارية التوظيف",
    permMapT: "خريطة الصلاحيات", permMapSub: "من له صلاحية إيش داخل المنصة — لكل إدارة تعرف حدودها من أول يوم",
    permYouHaveIt: "هذي الصلاحية عندك",
    myStoryT: "قصتي مع بوارق", storyOrders: "إجمالي الطلبات", storyKm: "إجمالي الكيلومترات", storyHours: "إجمالي ساعات العمل",
    storyMonths: "أشهر النشاط", storyWins: "مرات التصدر", storyThird: "الأكثر التزاماً", storySince: "معنا منذ",
    storyProud: "فخورون بك — تصدّرت لوحة الصدارة", storyProudEnd: "مرة!",
    customizeT: "تخصيص اللوحة",
    selfieRequired: "التقاط صورة للحضور", captureSelfie: "التقاط الصورة", retake: "إعادة المحاولة", confirmClockIn: "تأكيد الحضور",
    cameraDenied: "لا يمكن الوصول للكاميرا. الرجاء السماح بالوصول من إعدادات المتصفح.", cameraLoading: "جاري تشغيل الكاميرا…",
    selfieNote: "يتطلب تسجيل الحضور صورة سيلفي حية — لا يقبل رفع صورة من المعرض.",
    hoursSummaryT: "ملخص ساعات الحضور لكل الإدارات",
    violationPenaltyT: "غرامة المخالفة الواحدة",
    weekendViolCol: "مخالفة ويكند", appViolCol: "مخالفة تطبيق",
    appRevenueT: "إجمالي الربح لكل تطبيق", ajeerManualNote: "يُدخَل الراتب يدوياً", weekendFineLinked: "غرامة الويكند مرتبطة باللائحة الداخلية:",
    empTypeCol: "نوع التوظيف",
    payslipT: "قسيمة الراتب", payslipMonth: "الشهر", printBtn: "طباعة", printedOn: "تاريخ الطباعة", printPayslip: "طباعة قسيمة الراتب",
    totalDeductionLbl: "إجمالي الخصم",
    supReportedLbl: "أبلغ عنها المشرف", violationsVaryNote: "قيمة كل مخالفة تختلف من مندوب لآخر — اكتب المبلغ الفعلي بالريال لكل مندوب مباشرة، مو رقماً موحّداً.",
    manualPayrollNote: "راتب كل مندوب يُدخل يدوياً بالكامل — لا يوجد أي حساب تلقائي. اكتب المبلغ النهائي الصافي مباشرة لكل مندوب.",
    boardT: "مجلس المستشارين", boardSub: "الحلقة الوصل الحصرية مع المدير العام — تحليل شامل للشركة واعتماد القرارات الاستراتيجية النهائية",
    boardPendingNote: "توجد قرارات بانتظار مراجعتكم", boardPendingCount: "قراراً معلّقاً",
    boardActiveReps: "المناديب النشطون", boardMonthOrders: "طلبات الشهر", boardMonthExpenses: "مصروفات الشهر المعتمدة", boardLastPayroll: "آخر مسير رواتب معتمد",
    boardOfficeCost: "تكلفة الرواتب الإدارية", boardCompliance: "نسبة الامتثال بالمعدات",
    boardTgaWarn: "إجمالي غرامات هيئة النقل المسجّلة", boardDecisionsT: "القرارات بانتظار اعتماد المجلس",
    boardGoToPayroll: "لاتخاذ القرار (اعتماد أو رفض)، افتح صفحة «مسيرات الرواتب» من القائمة الجانبية.",
    boardApprovedHistoryT: "سجل القرارات المعتمدة", boardDecidedByLbl: "اعتمدها",
    financeReviewT: "مراجعة المالية قبل الإرسال", financeApproveBtn: "اعتماد وإرسال للمدير العام", nextStepBelowHint: "الخطوة التالية بلوحة «مراجعة المالية قبل الإرسال» بالأسفل",
    officeStaffSectionT: "الموظفون الإداريون",
    decisionsPendingNotif: "قرارات بانتظار موافقتك", payrollWaitingNotif: "مسيرات رواتب بانتظارك",
    expensesWaitingNotif: "مصروفات بانتظار اعتمادك", invoicesReviewNotif: "فواتير تطبيقات تحت المراجعة",
    legalForwardedNotif: "بلاغات محالة لكم تحتاج مراجعة", legalOpenCasesNotif: "قضايا مفتوحة", lockedDeptsNotif: "حسابات أقسام مقفلة",
    deptMsgsNotif: "رسائل جديدة من إدارات أخرى",
    invStatusReview: "تحت المراجعة", invStatusPaid: "تم الدفع", addAppInvoice: "رفع فاتورة تطبيق جديدة",
    invTotalExpenses: "إجمالي المصروفات المعتمدة", invTotalPayroll: "إجمالي الرواتب المعتمدة", invNetResultT: "الصافي النهائي (إيراد − مصروفات − رواتب)",
    decisionsT: "القرارات", decisionsSub: "لا يُعتمد أي قرار إلا بموافقة المدير العام وهيئة المستشارين معاً — إجباري للطرفين",
    newDecisionBtn: "قرار جديد", decisionTitleLbl: "عنوان القرار", decisionDescLbl: "التفاصيل",
    decisionsPendingT: "قرارات بانتظار الاعتماد الكامل", gmApprovalLbl: "موافقة المدير العام", boardApprovalLbl: "موافقة هيئة المستشارين",
    decisionDualNote: "لازم موافقة الطرفين معاً — موافقة طرف واحد ما تكفي لاعتماد القرار نهائياً.",
    decisionsFinalT: "القرارات المعتمدة نهائياً", decisionFinalizedLbl: "معتمد نهائياً",
    financeReviewNote: "راجع الأرقام جيداً قبل الإرسال — بعد الإرسال ما يرجع المسير لك للتعديل إلا برفضه من المدير العام أو المستشارين.",
    deptPwSelfT: "تغيير كلمة مرور قسمي", deptPwSelfSub: "الحالة الطبيعية: أنت تغيّر كلمة مرور قسمك بنفسك مباشرة، بدون حاجة لمدير الحركة والتشغيل.",
    deptPwCurrent: "كلمة المرور الحالية", deptPwNew: "كلمة المرور الجديدة", deptPwConfirm: "تأكيد كلمة المرور الجديدة", deptPwSaved: "تم تغيير كلمة مرور القسم بنجاح",
    errCurrentDeptPw: "كلمة المرور الحالية غير صحيحة.", errPassMatch: "كلمتا المرور غير متطابقتين.",
    invAnalysisT: "تحليل فواتير التطبيقات", invAnalysisSub: "سجّل فواتير تطبيقات التوصيل الشهرية وشوف الصورة المالية الحقيقية — ربح أو خسارة",
    profitLbl: "ربح هذا الشهر", lossLbl: "خسارة هذا الشهر", invNetIn: "صافي الوارد من التطبيقات", payrollOut: "رواتب المناديب المدفوعة",
    needsPayrollClosed: "لمقارنة الربح والخسارة، لازم تكون رواتب هذا الشهر مُقفلة من المالية أولاً.",
    riderUtilization: "نسبة المناديب النشطين", lowActiveWarn: "تحذير: نسبة المناديب النشطين منخفضة هذا الشهر",
    invByAppT: "الإيراد حسب التطبيق", invTrendT: "الاتجاه الشهري: وارد مقابل رواتب",
    addInvoiceBtn: "تسجيل فاتورة جديدة", invApp: "التطبيق", invMonth: "الشهر", invGrossExclVat: "المبلغ قبل الضريبة",
    invVat: "قيمة الضريبة", invCarRental: "خصم إيجار السيارات", invRidersTotal: "إجمالي المناديب على العقد", invRidersActive: "المناديب النشطون",
    invHistoryT: "سجل الفواتير المسجّلة",
    complianceT: "الامتثال والمعدات", complianceSub: "منع غرامات هيئة النقل عبر متابعة زي وأدوات كل مندوب",
    complianceRateLbl: "نسبة الامتثال الكامل", tgaFinesTotal: "إجمالي غرامات الهيئة", tgaFinesCount: "عدد المخالفات المسجّلة",
    lowComplianceWarn: "تحذير: نسبة الامتثال منخفضة جداً — كل مندوب ناقص معدات معرّض لغرامة فورية من الهيئة.",
    equipPerRepT: "حالة المعدات لكل مندوب", equipItem_shirt: "الزي", equipItem_helmet: "الخوذة", equipItem_bag: "الشنطة",
    equipValid: "متوفر", equipMissing: "ناقص", equipExpired: "منتهي",
    addFineBtn: "تسجيل مخالفة هيئة نقل", fineRepSelect: "المندوب", fineAmountLbl2: "قيمة الغرامة",
    fineReasonLbl: "سبب المخالفة", tgaFinesHistoryT: "سجل مخالفات الهيئة",
    errExpAmount: "أدخل مبلغاً صحيحاً أكبر من صفر.", errExpReason: "لازم تكتب سبباً واقعياً واضحاً (٨ أحرف على الأقل) — بدون سبب، ما يُسجّل المصروف.",
    errExpNeedsReceipt: "المبالغ فوق الحد المسموح تتطلب إرفاق صورة إيصال أو فاتورة.", expReceiptLbl: "صورة الإيصال / الفاتورة", viewPdfBtn: "عرض ملف PDF",
    expReasonLbl: "سبب الصرف (إلزامي)", expReasonPh: "مثال: تعبئة وقود سيارة رقم ٣ ليوم التسليم الطويل",
    expNeedsGm: "هذا المبلغ يتجاوز الحد — يحتاج اعتماد المدير العام قبل ما يُحتسب نهائياً.",
    expPendingGmT: "بانتظار اعتماد المدير العام", submittedByLbl: "قدّمه", expLedgerT: "سجل كل مصروف بالتفصيل",
    statusLbl: "الحالة", approvedLbl: "معتمد", rejectedLbl: "مرفوض", pendingLbl: "بانتظار الاعتماد",
    payslipProvisional: "لسه ما اعتُمد راتب هذا الشهر نهائياً — الأرقام مبدئية وممكن تتغيّر.",
    warnBefore: "متبقي", warnHours: "ساعة قبل الإغلاق التلقائي", lateForShift: "متأخر عن الشفت",
    sessionExpiredMsg: "انتهت جلستك تلقائياً بسبب عدم النشاط لحمايتك — سجّل الدخول مرة أخرى.",
    avgResolutionT: "متوسط زمن حل التذاكر لكل إدارة",
    pacingT: "تنبيه استباقي أسبوعي عن المعدل", pacingSub: "مقارنة أداء كل مندوب بالمعدل المتوقع حتى اليوم — نلحق الموقف قبل نهاية الشهر", pacingAllGood: "الكل يسير على المعدل المطلوب 👍",
  },
  en: {
    gateSub: "Pick your department, then enter its password. Your dashboard opens with your permissions.",
    enterPass: "Enter password", deptPass: "Department password",
    errPass: "Password is too short — at least 4 characters.",
    errRep: "Enter a valid ID number and password.",
    orRep: "Or rep sign in", repTitle: "Delivery rep sign in",
    repSub: "For reps and drivers — sign in with your ID number",
    nationalId: "ID / Iqama number", repHint: "Sign in is open during your scheduled shift hours",
    ordersToday: "Shift orders", doneToday: "Delivered", inRoute: "Out for delivery",
    distance: "Distance covered", cash: "Cash collected", rating: "Your rating", myRoute: "Shift orders",
    pod: "Confirm delivery", accept: "Accept order", pickup: "Pick up from restaurant",
    leaveToday: "On leave today", openRoles: "Open roles", docsExp: "Documents expiring",
    winRate: "Case win rate", compScore: "Compliance score",
    newOrder: "New order", addRest: "Add restaurant", addEmp: "Add employee", upDoc: "Upload document",
    reportsT: "Corporate reports", generate: "Generate", monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly",
    repItems: ["Delivery & zone performance", "Financial statements", "Car fleet analysis", "Rep turnover", "Restaurant contract compliance"],
    compItems: [["Delivery activity licences", "Active"], ["Food transport certificates", "Active"], ["Hot bag inspections", "Expiring"], ["Car insurance", "Active"], ["Customer data protection", "In review"]],
    capacity: "Load", cities: ["Dammam", "Khobar", "Dhahran", "Jubail"],
    payrollNote: "Rep wages are paid weekly; office salaries on the 25th",
    role: "Current role", caseTypes: ["Food safety", "Traffic", "Contracts", "Labour"],
    pay: { cash: "Cash", card: "Card", online: "Online" },
    orders: "orders", zoneReps: "reps", avgZone: "Avg. delivery",
    secTitle: "Change password", curPass: "Current password", newPass: "New password",
    cfPass: "Confirm password", strength: "Password strength", weak: "Weak", medium: "Medium", strong: "Strong",
    savePass: "Update password", errCur: "Enter your current password.", errShort: "New password must be 6+ characters.",
    errMatch: "Confirmation does not match the new password.", errSame: "New password matches the current one — pick a different one.",
    okSaved: "Password updated", showPass: "Show password",
    secNote: "This is the department password, shared by everyone in the department. Members are notified automatically when it changes.",
    secNoteRep: "This is your personal password tied to your ID number. Do not share it.",
    lastChanged: "Last changed", tips: "Use at least 8 characters with numbers and symbols.",

    hiringT: "Rep hiring", repDirectory: "Rep directory", addRepBtn: "Add new rep",
    repName: "Rep name", repPhone: "Phone number", repNid: "ID / Iqama number",
    repIdExpiry: "ID expiry date", repEmpType: "Employment type", repVehicle: "Delivery vehicle",
    repApp: "App", idPhoto: "ID / Iqama photo", licPhoto: "License photo",
    uploadTap: "Tap to upload photo", uploaded: "Uploaded", submitRep: "Submit for review",
    pendingReps: "Awaiting activation", activeReps2: "Active reps", activateBtn: "Activate & move to Operations",
    chooseSup: "Choose responsible supervisor", confirmActivate: "Confirm activation",
    errRepName: "Enter the rep's name.", errRepPhone: "Invalid phone number (10 digits).",
    errRepNid: "Invalid ID number (10 digits).", errRepExpiry: "Enter a valid expiry date.",
    errRepPhotos: "Attach the ID photo and license photo.", repAdded: "Rep submitted for review",
    repActivated: "Rep activated and moved to Operations",
    shiftsT: "Rep performance", teamOf: "Team of", reportDate: "Report date",
    ordersCol: "Orders", hoursCol: "Hours worked", kmCol: "Kilometers", violCol: "Violations",
    targetCol: "Target achieved", tierCol: "Tier", saveReport: "Save report",
    reportSaved: "Report saved and sent to Reports",
    tierExcellent: "Excellent", tierGood: "Good", tierImprove: "Needs improvement", tierWeak: "Weak",
    dailyTargetLbl: "Daily target", ordersTarget: "orders", kmTarget: "km",
    perfAnalytics: "Rep performance analytics", avgAchieve: "Avg. target achieved",
    totalActiveReps: "Active reps", totalViolations: "Total violations", topPerformer: "Top performer",
    needsAttention: "Needs attention", noPending: "No reps awaiting activation",
    repReportsT: "Rep reports", corpReportsT: "Corporate reports",
    searchRep: "Search by rep name or phone…", noReports: "No saved reports yet",
    savedBy: "Saved by", repsCount: "Reps count", viewReport: "View details", hideReport: "Hide details",
    globalNoMatch: "No matching results", searchResults: "Search results",
    repPassword: "Initial rep password", errRepPass: "Enter an initial password (4+ characters).",
    errRepNotActive: "Invalid credentials or account not activated yet.",
    errRepWrongPass: "Incorrect password.",
    shiftPickTitle: "Before you start, set your shift", shiftPickSub: "Pick today's shift start and end time — you can log a new shift anytime later from the menu.",
    shiftStart: "Shift start", shiftEnd: "Shift end", confirmShift: "Start shift & continue",
    logNewShift: "Log a new shift", shiftLogged: "Shift logged", myShifts: "My logged shifts",
    motivHeadline: "Keep going, you make the difference",
    tickets: "Tickets", newTicket: "New ticket", ticketType: "Request type", ticketMode: "Input method",
    ticketText: "Text", ticketVoice: "Voice recording", ticketBody: "Request details",
    ticketBodyPh: "Write your request details here…", recordStart: "Start recording", recordStop: "Stop recording",
    recordPlay: "Play", recordAgain: "Re-record", micDenied: "Couldn't access the microphone — try text instead.",
    submitTicket: "Submit ticket", ticketSent: "Your ticket was sent and will be followed up",
    errTicketType: "Choose a request type.", errTicketBody: "Write details or record a voice message.",
    myTickets: "My tickets", inboxTickets: "Inbox tickets", noTickets: "No tickets yet",
    stageSubmitted: "Submitted", stageAt: "Under review at", stageResolved: "Approved",
    stageRejected: "Rejected", confidentialBadge: "Confidential — visible only to the GM and Operations Manager",
    forwardNext: "Approve & forward", resolveTicket: "Final approval", rejectTicket: "Reject",
    replyPh: "Add a note (optional)…", ticketFrom: "From", ticketAt: "On",
    charterTitle: "Internal Rep Protection Charter",
    charterBody: "Bawariq Al-Sharq guarantees every rep's right to a dignified workplace. Any mistreatment or unresponsiveness from a supervisor or manager is escalated directly and confidentially to the GM and Operations Manager, and followed up within 48 hours.",
    circulars: "Circulars", newCircular: "New circular", circularTitle: "Circular title", circularBody: "Circular body",
    publishCircular: "Publish circular", noCirculars: "No circulars yet", publishedBy: "Issued by",
    clockIn: "Clock in", clockOut: "Clock out", clockedInAt: "Clocked in at", clockedOutAt: "Clocked out at",
    notClockedIn: "You haven't clocked in today", alreadyClockedIn: "You're clocked in today", myAttendanceLog: "My attendance log",
    allAttendance: "All staff attendance", onDutyNow: "Currently on duty",
    payrollHR: "Approve rep payroll", sendToFinance: "Approve & send to Finance", sentToFinance: "Sent to Finance",
    awaitingHR: "Awaiting HR approval", finalPayroll: "Final rep payroll", ordersPart: "Orders component",
    kmPart: "Distance component", fuelAllow: "Fuel allowance", fuelAllowHint: "30–40 SAR at management's discretion",
    totalSalary: "Total salary", monthTarget: "Monthly target", companyRevenue: "Operating company billing",
    perOrderRate: "per order", perKmRate: "per km after the first", netCompany: "Company net profit",
    markFinalized: "Finalize month",
    gmOversight: "Full oversight", allDeptsSnapshot: "Snapshot of all departments",
    noRecords: "No records yet — add the first real entry.",
    addOrder: "Add order", addCar: "Add car", addRestaurant: "Add restaurant", addInvoice: "Add invoice",
    addEmployeeBtn: "Add staff member", addContract: "Add contract", addCase: "Add case", addApproval: "Add approval request",
    orderRestaurant: "Restaurant name", orderZone: "Zone", orderValue: "Order value", orderPay: "Payment method",
    carPlate: "Plate number", carModel: "Car model", empName: "Employee name", empDept: "Department", empPosition: "Job title",
    contractParty: "Contracting party", contractType: "Contract type", contractValue: "Contract value",
    caseSubject: "Case subject", caseAuthority: "Authority", approvalTitle: "Request title", approvalAmount: "Amount",
    save: "Save", cancel: "Cancel",
    pulseTitle: "Live Rep Pulse", pulseSub: "Who booked a shift, and who's clocked in right now — moment by moment",
    onDutyLive: "On duty now", bookedNotIn: "Booked a shift, not clocked in yet", noShiftToday: "No shift booked today",
    shiftWindow: "Booked shift", clockStatus: "Clock status", staffMotivHeadline: "One team, one goal",
    fullControlNote: "You have full authority over every department and every rep from this platform.",
    iqamaT: "Residency Expiry Alerts", iqamaSub: "Track rep Iqama expiry dates and send timely warnings",
    daysLeft: "Days remaining", expired: "Expired", critical: "Critical", warning: "Warning", healthy: "Healthy",
    sendAlert: "Send alert", alertSent: "Sent", lastAlert: "Last alert", noExpiries: "No residency records yet",
    iqamaGmCard: "Residency alerts", iqamaUrgentCount: "Need urgent follow-up",
    payrollRunsT: "Monthly Payroll Runs", payrollRunsSub: "Closes automatically at month-end and is sent to the GM for approval",
    closeMonth: "Close month & send to GM", monthClosed: "Month closed and sent for approval",
    runStatusSent: "Awaiting GM approval", runStatusApproved: "Approved by GM",
    approveRun: "Approve run", runArchive: "Previous runs archive", noRuns: "No payroll runs yet",
    forwardToBoardBtn: "Send to Advisory Board", boardReviewT: "Awaiting Advisory Board approval", awaitingBoardLbl: "Awaiting board decision",
    runId: "Run ID", runDate: "Closed on", alreadyClosedMonth: "This month is already closed.",
    hrOnlyHiring: "Hiring administrative staff is HR's responsibility only.",
    dammamTime: "Dammam time", empPhoto: "Personal photo", isSupervisorLbl: "Operations supervisor (manages reps)",
    attachFile: "Attach file (any type)", autoCloseHint: "This ticket auto-closes after 72 hours with no reply.",
    stageAutoClosed: "Auto-closed (72h passed)", autoCloseNote: "This ticket was auto-closed after 72 hours with no reply. If you object, raise a confidential complaint or an urgent report:",
    objConfidential: "Raise confidential complaint", objReport: "Raise urgent report", viewAttachment: "View attachment",
    chatT: "Inter-department Chat", chatToRep: "Message a rep", chatWith: "Chatting with", chatSendPh: "Type your message…",
    chatSend: "Send", chatNoMsgs: "No messages yet", chatSelectDept: "Choose a department to chat with",
    repMsgsT: "Department messages", repMsgFrom: "From", markSeen: "Mark as seen", seenAt: "Seen at",
    seenBadge: "Seen", notSeenBadge: "Not seen yet", composeToRep: "Choose a rep",
    sendToRep: "Send to rep", invoiceAttach: "Attach invoice document",
    lbTitle: "Monthly Leaderboard", lbSub: "Top 3 reps this month — updated live from day one",
    lbFirst: "1st Place", lbSecond: "2nd Place", lbThird: "3rd Place",
    lbFirstDesc: "Leading in both orders and distance", lbSecondDesc: "Most distance covered", lbThirdDesc: "Most disciplined — conduct, shifts and punctuality",
    lbUmrah: "A fully company-paid Umrah trip", lbUmrahHint: "For holding 1st place two months running",
    lbYourRank: "Your current rank", lbNoData: "No performance data yet this month — be the first to top the board",
    lbPickThird: "Pick this month's most disciplined rep", lbSaveThird: "Save selection", lbThirdSaved: "Saved",
    lbOrders: "orders", lbKm: "km", lbMotivate: "Every order and every kilometer brings you closer to the top — the month isn't over yet!",
    lbHistoryNote: "Resets fresh at the start of each month", lbReward: "Leaderboard reward",
    auditT: "Audit Log", auditNoLogs: "No recorded events yet", auditAction: "Action", auditBy: "By", auditWhen: "Time",
    hallOfFameT: "Hall of Fame", hallOfFameSub: "Top performers across past months",
    atRiskT: "Reps at risk of missing this month's target",
    bulkSelected: "Selected", bulkDelete: "Delete selected",
    backupT: "Full Backup", backupSub: "Export all platform data as one file, or restore a previous backup.",
    backupExport: "Export backup", backupImport: "Import & restore", restoreGmOnly: "Restore is available to the GM only.",
    restoreOk: "Data restored successfully", restoreErr: "Invalid or corrupted file",
    declineAlert: "Noticeable decline vs. their usual average", searchGoTo: "Go to",
    noSupervisorYet: "No operations supervisor hired yet — hire one from HR first.", pleaseChoose: "Choose supervisor…",
    repOf: "Team", editRepT: "Edit rep details", actingAs: "You're acting as", chooseIdentity: "Who are you?",
    chooseIdentitySub: "This department is shared by more than one employee — pick your name so your actions are signed with it.",
    continueGeneric: "Continue as generic staff", identitySaved: "Your identity is set for this session",
    empPassword: "Personal password", identityPassPh: "Enter your password to confirm", errIdentityPass: "Incorrect password.",
    noPasswordSet: "No password set",
    forwardedToLegalBadge: "Escalated to Legal", forwardToLegal: "Escalate to Legal",
    apptDateLbl: "Appointment date", apptTimeLbl: "Appointment time", errApptDate: "Pick an appointment date.",
    charterPageT: "Internal Rep Bylaws", charterPageSub: "Approved policies and penalties — managed by Legal Affairs",
    weekendFineT: "Weekend Absence Fine", weekendFineDesc: "The fine owed for unexcused absence on designated weekend days.",
    reputationT: "Rep Reputation Misconduct", reputationDesc: "Any repeated reputational harm or policy violation is documented and referred for investigation.",
    investigationT: "Security Investigation", investigationDesc: "If involvement in suspicious activity is confirmed, the GM refers the case to open a formal investigation.",
    routingT: "Report Routing", routingDesc: "Rep reports reach the GM and Operations Manager first, then are escalated to Legal Affairs for follow-up.",
    addClauseBtn: "Add clause", clauseTitleLbl: "Clause title", clauseBodyLbl: "Clause text", saveClause: "Save clause",
    fineAmountLbl: "Fine amount (SAR)", saveFine: "Save amount", noClausesYet: "No clauses added yet",
    clockInConfirmed: "Check-in recorded successfully", clockOutConfirmed: "Check-out recorded successfully",
    resetLaunchT: "Reset Platform Before Launch", resetLaunchSub: "Deletes every rep, report, ticket, payroll record, attendance log, invoice, and operational record, returning the platform to a completely empty start. Charter settings are not affected.",
    resetLaunchWarn: "Warning: this action is final and cannot be undone. Export a backup first if you need any current data.",
    resetTypeLbl: "Type RESET to confirm", resetLaunchBtn: "Reset platform now", resetLaunchDone: "Platform reset successfully — ready to launch from zero",
    servicesMapT: "Your services map", startNow: "Start now", checklistT: "Pre-launch checklist",
    ttsConfirm: "Your request was sent successfully", autoBackupNote: "Automatic weekly backup",
    chkSupervisor: "At least one operations supervisor hired", chkActiveRep: "At least one active rep",
    chkAllDepts: "Every department has at least one employee", chkDailyReport: "At least one daily performance report saved",
    chkBackupDone: "At least one backup has been taken", chkCircular: "At least one circular published",
    chkFineSet: "Weekend fine is configured", chkAllReady: "Everything ready — the platform is set to launch!",
    growthT: "Company Growth", growthSub: "Real progress over the last 12 months — built entirely from your actual data", growthMonths: "Months with activity",
    growthRepsT: "Rep count growth", growthOrdersT: "Monthly orders & distance", growthRevenueT: "Monthly revenue (SAR thousands)",
    apptSoonT: "Upcoming appointment", apptSoonNote: "Rep appointment is within the hour",
    deptLockedErr: "This department is locked after repeated failed logins. Only the Operations Manager can unlock it.",
    deptPwNotSetErr: "This department has no password yet. The Operations Manager sets it from the Security page.",
    securityT: "Security", securitySub: "Manage department passwords and lockouts — Operations Manager only",
    deptPwLbl: "Department password", saveDeptPw: "Save password", lockedBadge: "Locked", unlockBtn: "Unlock", failsLbl: "Failed attempts",
    suspendBtn: "Suspend", reactivateBtn: "Reactivate", suspendedBadge: "Suspended",
    onlyOpsGm: "Operations Manager and GM only", resetRepPwT: "Reset a rep password",
    hiringFallbackNote: "Also available to the Operations Manager to ensure hiring continuity",
    permMapT: "Permissions Map", permMapSub: "Who can do what across the platform — so every department knows its limits from day one",
    permYouHaveIt: "You have this permission",
    myStoryT: "My Story with Bawariq", storyOrders: "Total orders", storyKm: "Total distance", storyHours: "Total hours worked",
    storyMonths: "Active months", storyWins: "Times topped leaderboard", storyThird: "Most disciplined", storySince: "With us since",
    storyProud: "We\u2019re proud of you — you topped the leaderboard", storyProudEnd: "time(s)!",
    customizeT: "Customize dashboard",
    selfieRequired: "Take an attendance photo", captureSelfie: "Capture photo", retake: "Retake", confirmClockIn: "Confirm check-in",
    cameraDenied: "Camera access denied. Please allow camera access in your browser settings.", cameraLoading: "Starting camera…",
    selfieNote: "Check-in requires a live selfie — gallery uploads are not accepted.",
    hoursSummaryT: "Attendance hours summary across all departments",
    violationPenaltyT: "Penalty per violation",
    weekendViolCol: "Weekend violation", appViolCol: "App violation",
    appRevenueT: "Total profit per delivery app", ajeerManualNote: "Salary entered manually", weekendFineLinked: "Weekend fine linked to the internal charter:",
    empTypeCol: "Employment type",
    payslipT: "Payslip", payslipMonth: "Month", printBtn: "Print", printedOn: "Printed on", printPayslip: "Print payslip",
    totalDeductionLbl: "Total deduction",
    supReportedLbl: "Supervisor reported", violationsVaryNote: "Each violation\u2019s value differs from one rep to another — enter the actual SAR amount per rep directly, not a fixed rate.",
    manualPayrollNote: "Every rep\u2019s salary is entered fully manually — no automatic calculation. Type the final net amount directly for each rep.",
    deptPwSelfT: "Change my department password", deptPwSelfSub: "Normal case: you change your own department password directly, no need for the Operations Manager.",
    deptPwCurrent: "Current password", deptPwNew: "New password", deptPwConfirm: "Confirm new password", deptPwSaved: "Department password changed successfully",
    errCurrentDeptPw: "Current password is incorrect.", errPassMatch: "Passwords do not match.",
    invAnalysisT: "App Invoice Analysis", invAnalysisSub: "Log monthly delivery-app invoices and see the real financial picture — profit or loss",
    profitLbl: "Profit this month", lossLbl: "Loss this month", invNetIn: "Net received from apps", payrollOut: "Rep payroll paid out",
    needsPayrollClosed: "To compare profit and loss, this month's payroll must be closed by Finance first.",
    riderUtilization: "Active rider ratio", lowActiveWarn: "Warning: active rider ratio is low this month",
    invByAppT: "Revenue by app", invTrendT: "Monthly trend: revenue vs. payroll",
    addInvoiceBtn: "Log a new invoice", invApp: "App", invMonth: "Month", invGrossExclVat: "Amount excl. VAT",
    invVat: "VAT amount", invCarRental: "Car rental deduction", invRidersTotal: "Total riders on contract", invRidersActive: "Active riders",
    invHistoryT: "Logged invoices history",
    complianceT: "Equipment Compliance", complianceSub: "Prevent Transport Authority fines by tracking each rep's uniform and gear",
    complianceRateLbl: "Full compliance rate", tgaFinesTotal: "Total authority fines", tgaFinesCount: "Fines logged",
    lowComplianceWarn: "Warning: compliance rate is very low — every rep missing gear is exposed to an immediate fine.",
    equipPerRepT: "Equipment status per rep", equipItem_shirt: "Shirt", equipItem_helmet: "Helmet", equipItem_bag: "Bag",
    equipValid: "Valid", equipMissing: "Missing", equipExpired: "Expired",
    addFineBtn: "Log a transport authority fine", fineRepSelect: "Rep", fineAmountLbl2: "Fine amount",
    fineReasonLbl: "Fine reason", tgaFinesHistoryT: "Authority fines history",
    payslipProvisional: "This month\u2019s payroll isn\u2019t finalized yet — figures are provisional and may change.",
    warnBefore: "", warnHours: "h left before auto-close", lateForShift: "Late for shift",
    sessionExpiredMsg: "Your session ended automatically due to inactivity, to protect you — please sign in again.",
    avgResolutionT: "Average ticket resolution time by department",
    pacingT: "Weekly proactive pacing alert", pacingSub: "Each rep's performance vs. the expected pace so far, to catch it before month-end", pacingAllGood: "Everyone is on pace 👍",
  },
  ur: {
    gateSub: "اپنا شعبہ منتخب کریں، پھر شعبے کا پاس ورڈ درج کریں۔ ڈیش بورڈ آپ کے اختیارات کے مطابق کھلے گا۔",
    enterPass: "پاس ورڈ درج کریں", deptPass: "شعبے کا پاس ورڈ",
    errPass: "پاس ورڈ بہت مختصر ہے — کم از کم 4 حروف۔",
    errRep: "درست شناختی نمبر اور پاس ورڈ درج کریں۔",
    orRep: "یا نمائندہ لاگ اِن", repTitle: "ڈیلیوری نمائندہ لاگ اِن",
    repSub: "نمائندوں اور ڈرائیوروں کے لیے — شناختی نمبر سے داخل ہوں",
    nationalId: "شناختی / اقامہ نمبر", repHint: "لاگ اِن مقررہ شفٹ اوقات میں دستیاب ہے",
    ordersToday: "شفٹ کے آرڈرز", doneToday: "پہنچا دیے", inRoute: "راستے میں",
    distance: "طے شدہ فاصلہ", cash: "وصول شدہ رقم", rating: "آپ کی ریٹنگ", myRoute: "شفٹ کے آرڈرز",
    pod: "ترسیل کی تصدیق", accept: "آرڈر قبول کریں", pickup: "ریستوران سے وصولی",
    leaveToday: "آج چھٹی پر", openRoles: "خالی عہدے", docsExp: "ختم ہونے والی دستاویزات",
    winRate: "مقدمات جیتنے کی شرح", compScore: "تعمیل اسکور",
    newOrder: "نیا آرڈر", addRest: "ریستوران شامل کریں", addEmp: "ملازم شامل کریں", upDoc: "دستاویز اپلوڈ",
    reportsT: "ادارہ جاتی رپورٹس", generate: "بنائیں", monthly: "ماہانہ", quarterly: "سہ ماہی", yearly: "سالانہ",
    repItems: ["ڈیلیوری اور علاقہ کارکردگی", "مالی گوشوارے", "گاڑیوں کا تجزیہ", "نمائندوں کی تبدیلی", "ریستوران معاہدوں کی پابندی"],
    compItems: [["ڈیلیوری لائسنس", "فعال"], ["فوڈ ٹرانسپورٹ سرٹیفکیٹ", "فعال"], ["ہاٹ بیگ معائنہ", "جلد ختم"], ["گاڑی انشورنس", "فعال"], ["کسٹمر ڈیٹا تحفظ", "جائزہ"]],
    capacity: "بوجھ", cities: ["دمام", "خبر", "ظہران", "جبیل"],
    payrollNote: "نمائندوں کی اجرت ہفتہ وار، دفتری تنخواہ 25 تاریخ کو",
    role: "موجودہ عہدہ", caseTypes: ["فوڈ سیفٹی", "ٹریفک", "معاہدے", "لیبر"],
    pay: { cash: "نقد", card: "کارڈ", online: "آن لائن" },
    orders: "آرڈر", zoneReps: "نمائندے", avgZone: "اوسط ڈیلیوری",
    secTitle: "پاس ورڈ تبدیل کریں", curPass: "موجودہ پاس ورڈ", newPass: "نیا پاس ورڈ",
    cfPass: "پاس ورڈ کی تصدیق", strength: "پاس ورڈ کی مضبوطی", weak: "کمزور", medium: "درمیانی", strong: "مضبوط",
    savePass: "پاس ورڈ اپ ڈیٹ کریں", errCur: "موجودہ پاس ورڈ درج کریں۔", errShort: "نیا پاس ورڈ 6 حروف یا زیادہ ہونا چاہیے۔",
    errMatch: "تصدیق نئے پاس ورڈ سے مطابقت نہیں رکھتی۔", errSame: "نیا پاس ورڈ موجودہ جیسا ہے — مختلف منتخب کریں۔",
    okSaved: "پاس ورڈ اپ ڈیٹ ہو گیا", showPass: "پاس ورڈ دکھائیں",
    secNote: "یہ شعبے کا پاس ورڈ ہے جو تمام اراکین استعمال کرتے ہیں۔ تبدیلی پر سب کو خودکار اطلاع جاتی ہے۔",
    secNoteRep: "یہ آپ کا ذاتی پاس ورڈ ہے جو آپ کے شناختی نمبر سے منسلک ہے۔ کسی سے شیئر نہ کریں۔",
    lastChanged: "آخری تبدیلی", tips: "کم از کم 8 حروف، اعداد اور علامات کے ساتھ۔",

    hiringT: "نمائندہ بھرتی", repDirectory: "نمائندہ فہرست", addRepBtn: "نیا نمائندہ شامل کریں",
    repName: "نمائندے کا نام", repPhone: "فون نمبر", repNid: "شناختی / اقامہ نمبر",
    repIdExpiry: "شناختی کارڈ کی میعاد", repEmpType: "ملازمت کی قسم", repVehicle: "ڈیلیوری گاڑی",
    repApp: "ایپ", idPhoto: "شناختی / اقامہ تصویر", licPhoto: "لائسنس تصویر",
    uploadTap: "تصویر اپلوڈ کے لیے دبائیں", uploaded: "اپلوڈ ہو گیا", submitRep: "جائزے کے لیے بھیجیں",
    pendingReps: "فعال ہونے کے منتظر", activeReps2: "فعال نمائندے", activateBtn: "فعال کریں اور آپریشنز میں منتقل کریں",
    chooseSup: "ذمہ دار سپروائزر منتخب کریں", confirmActivate: "فعال کرنے کی تصدیق",
    errRepName: "نمائندے کا نام درج کریں۔", errRepPhone: "غلط فون نمبر (10 ہندسے)۔",
    errRepNid: "غلط شناختی نمبر (10 ہندسے)۔", errRepExpiry: "درست میعاد تاریخ درج کریں۔",
    errRepPhotos: "شناختی اور لائسنس تصویر منسلک کریں۔", repAdded: "نمائندہ جائزے کے لیے بھیج دیا گیا",
    repActivated: "نمائندہ فعال ہو کر آپریشنز میں منتقل ہو گیا",
    shiftsT: "نمائندہ کارکردگی", teamOf: "ٹیم", reportDate: "رپورٹ کی تاریخ",
    ordersCol: "آرڈرز", hoursCol: "کام کے گھنٹے", kmCol: "کلومیٹر", violCol: "خلاف ورزیاں",
    targetCol: "ہدف کا حصول", tierCol: "درجہ", saveReport: "رپورٹ محفوظ کریں",
    reportSaved: "رپورٹ محفوظ ہو کر رپورٹس میں بھیج دی گئی",
    tierExcellent: "بہترین", tierGood: "اچھا", tierImprove: "بہتری درکار", tierWeak: "کمزور",
    dailyTargetLbl: "روزانہ ہدف", ordersTarget: "آرڈر", kmTarget: "کلومیٹر",
    perfAnalytics: "نمائندہ کارکردگی تجزیہ", avgAchieve: "اوسط ہدف حصول",
    totalActiveReps: "فعال نمائندے", totalViolations: "کل خلاف ورزیاں", topPerformer: "بہترین کارکردگی",
    needsAttention: "توجہ درکار", noPending: "کوئی نمائندہ فعال ہونے کا منتظر نہیں",
    repReportsT: "نمائندہ رپورٹس", corpReportsT: "ادارہ جاتی رپورٹس",
    searchRep: "نمائندے کے نام یا فون سے تلاش کریں…", noReports: "ابھی کوئی رپورٹ محفوظ نہیں",
    savedBy: "محفوظ کردہ از", repsCount: "نمائندوں کی تعداد", viewReport: "تفصیل دیکھیں", hideReport: "تفصیل چھپائیں",
    globalNoMatch: "کوئی مماثل نتیجہ نہیں", searchResults: "تلاش کے نتائج",
    repPassword: "نمائندے کا ابتدائی پاس ورڈ", errRepPass: "ابتدائی پاس ورڈ درج کریں (کم از کم 4 حروف)۔",
    errRepNotActive: "غلط معلومات یا اکاؤنٹ ابھی فعال نہیں۔",
    errRepWrongPass: "غلط پاس ورڈ۔",
    shiftPickTitle: "شروع کرنے سے پہلے، اپنی شفٹ منتخب کریں", shiftPickSub: "آج کی شفٹ کا آغاز اور اختتام منتخب کریں — بعد میں مینو سے نئی شفٹ کسی بھی وقت درج کر سکتے ہیں۔",
    shiftStart: "شفٹ کا آغاز", shiftEnd: "شفٹ کا اختتام", confirmShift: "شفٹ شروع کریں",
    logNewShift: "نئی شفٹ درج کریں", shiftLogged: "شفٹ درج ہو گئی", myShifts: "میری درج شفٹیں",
    motivHeadline: "جاری رکھیں، آپ فرق پیدا کرتے ہیں",
    tickets: "ٹکٹس", newTicket: "نیا ٹکٹ", ticketType: "درخواست کی قسم", ticketMode: "ان پٹ کا طریقہ",
    ticketText: "تحریر", ticketVoice: "صوتی ریکارڈنگ", ticketBody: "درخواست کی تفصیل",
    ticketBodyPh: "یہاں اپنی درخواست کی تفصیل لکھیں…", recordStart: "ریکارڈنگ شروع کریں", recordStop: "ریکارڈنگ روکیں",
    recordPlay: "سنیں", recordAgain: "دوبارہ ریکارڈ کریں", micDenied: "مائیکروفون تک رسائی ناکام — تحریر آزمائیں۔",
    submitTicket: "ٹکٹ بھیجیں", ticketSent: "آپ کا ٹکٹ بھیج دیا گیا اور اس کی پیروی ہوگی",
    errTicketType: "درخواست کی قسم منتخب کریں۔", errTicketBody: "تفصیل لکھیں یا صوتی پیغام ریکارڈ کریں۔",
    myTickets: "میرے ٹکٹس", inboxTickets: "موصول ٹکٹس", noTickets: "ابھی کوئی ٹکٹ نہیں",
    stageSubmitted: "بھیج دیا گیا", stageAt: "زیرِ جائزہ", stageResolved: "منظور شدہ",
    stageRejected: "مسترد", confidentialBadge: "خفیہ — صرف جنرل منیجر اور آپریشنز منیجر دیکھ سکتے ہیں",
    forwardNext: "منظور کریں اور آگے بھیجیں", resolveTicket: "حتمی منظوری", rejectTicket: "مسترد کریں",
    replyPh: "نوٹ شامل کریں (اختیاری)…", ticketFrom: "از", ticketAt: "بتاریخ",
    charterTitle: "نمائندے کے تحفظ کا اندرونی ضابطہ",
    charterBody: "بوارق الشرق ہر نمائندے کے باوقار کام کے ماحول کے حق کی ضمانت دیتا ہے۔ سپروائزر یا افسر کی جانب سے کسی بھی زیادتی یا لاتعلقی کی اطلاع براہ راست اور خفیہ طور پر جنرل منیجر اور آپریشنز منیجر کو دی جاتی ہے، اور 48 گھنٹوں میں پیروی کی جاتی ہے۔",
    circulars: "سرکلرز", newCircular: "نیا سرکلر", circularTitle: "سرکلر کا عنوان", circularBody: "سرکلر کا متن",
    publishCircular: "سرکلر شائع کریں", noCirculars: "ابھی کوئی سرکلر نہیں", publishedBy: "جاری کردہ",
    clockIn: "حاضری درج کریں", clockOut: "روانگی درج کریں", clockedInAt: "حاضری کا وقت", clockedOutAt: "روانگی کا وقت",
    notClockedIn: "آج آپ کی حاضری درج نہیں ہوئی", alreadyClockedIn: "آج آپ کی حاضری درج ہو چکی ہے", myAttendanceLog: "میرا حاضری ریکارڈ",
    allAttendance: "تمام عملے کی حاضری", onDutyNow: "اس وقت ڈیوٹی پر",
    payrollHR: "نمائندہ تنخواہ کی منظوری", sendToFinance: "منظور کریں اور مالیات کو بھیجیں", sentToFinance: "مالیات کو بھیج دیا گیا",
    awaitingHR: "انسانی وسائل کی منظوری کا انتظار", finalPayroll: "نمائندوں کی حتمی تنخواہ", ordersPart: "آرڈر جزو",
    kmPart: "فاصلہ جزو", fuelAllow: "ایندھن الاؤنس", fuelAllowHint: "انتظامیہ کی صوابدید پر 30 سے 40 ریال",
    totalSalary: "کل تنخواہ", monthTarget: "ماہانہ ہدف", companyRevenue: "آپریٹنگ کمپنی بلنگ",
    perOrderRate: "فی آرڈر", perKmRate: "پہلے کے بعد فی کلومیٹر", netCompany: "کمپنی خالص منافع",
    markFinalized: "مہینہ حتمی کریں",
    gmOversight: "مکمل نگرانی", allDeptsSnapshot: "تمام شعبوں کا جائزہ",
    noRecords: "ابھی کوئی ریکارڈ نہیں — پہلا حقیقی اندراج شامل کریں۔",
    addOrder: "آرڈر شامل کریں", addCar: "گاڑی شامل کریں", addRestaurant: "ریستوران شامل کریں", addInvoice: "انوائس شامل کریں",
    addEmployeeBtn: "عملہ شامل کریں", addContract: "معاہدہ شامل کریں", addCase: "مقدمہ شامل کریں", addApproval: "منظوری کی درخواست شامل کریں",
    orderRestaurant: "ریستوران کا نام", orderZone: "علاقہ", orderValue: "آرڈر کی قیمت", orderPay: "ادائیگی کا طریقہ",
    carPlate: "نمبر پلیٹ", carModel: "گاڑی کا ماڈل", empName: "ملازم کا نام", empDept: "شعبہ", empPosition: "عہدہ",
    contractParty: "معاہدہ فریق", contractType: "معاہدے کی قسم", contractValue: "معاہدے کی مالیت",
    caseSubject: "مقدمے کا موضوع", caseAuthority: "متعلقہ ادارہ", approvalTitle: "درخواست کا عنوان", approvalAmount: "رقم",
    save: "محفوظ کریں", cancel: "منسوخ کریں",
    pulseTitle: "نمائندوں کی براہ راست نبض", pulseSub: "کس نے شفٹ بک کی، اور ابھی کون حاضری میں ہے — لمحہ بہ لمحہ",
    onDutyLive: "ابھی حاضر", bookedNotIn: "شفٹ بک کی، ابھی حاضری درج نہیں کی", noShiftToday: "آج کوئی شفٹ بک نہیں کی",
    shiftWindow: "بک شدہ شفٹ", clockStatus: "حاضری کی حالت", staffMotivHeadline: "ایک ٹیم، ایک ہدف",
    fullControlNote: "اس پلیٹ فارم سے آپ کو ہر شعبے اور ہر نمائندے پر مکمل اختیار حاصل ہے۔",
    iqamaT: "اقامہ ختم ہونے کی اطلاعات", iqamaSub: "نمائندوں کے اقامہ ختم ہونے کی تاریخیں دیکھیں اور بروقت انتباہ بھیجیں",
    daysLeft: "باقی دن", expired: "ختم شدہ", critical: "نازک", warning: "انتباہ", healthy: "درست",
    sendAlert: "انتباہ بھیجیں", alertSent: "بھیج دیا گیا", lastAlert: "آخری انتباہ", noExpiries: "ابھی کوئی اقامہ ریکارڈ نہیں",
    iqamaGmCard: "اقامہ اطلاعات", iqamaUrgentCount: "فوری پیروی درکار",
    payrollRunsT: "ماہانہ تنخواہ مسیر", payrollRunsSub: "ہر ماہ کے آخر میں خودکار بند ہو کر جنرل منیجر کو منظوری کے لیے بھیجا جاتا ہے",
    closeMonth: "ماہ بند کریں اور جی ایم کو بھیجیں", monthClosed: "ماہ بند ہو کر منظوری کے لیے بھیج دیا گیا",
    runStatusSent: "جی ایم کی منظوری کا انتظار", runStatusApproved: "جی ایم سے منظور شدہ",
    approveRun: "مسیر منظور کریں", runArchive: "پرانے مسیروں کا ریکارڈ", noRuns: "ابھی کوئی تنخواہ مسیر نہیں",
    forwardToBoardBtn: "مشاورتی بورڈ کو بھیجیں", boardReviewT: "مشاورتی بورڈ کی منظوری کا انتظار", awaitingBoardLbl: "بورڈ کے فیصلے کا انتظار",
    runId: "مسیر نمبر", runDate: "بند ہونے کی تاریخ", alreadyClosedMonth: "یہ مہینہ پہلے ہی بند ہو چکا ہے۔",
    hrOnlyHiring: "انتظامی عملے کی بھرتی صرف انسانی وسائل کی ذمہ داری ہے۔",
    dammamTime: "دمام کے وقت کے مطابق", empPhoto: "ذاتی تصویر", isSupervisorLbl: "آپریشنز سپروائزر (نمائندوں کا انتظام)",
    attachFile: "فائل منسلک کریں (کوئی بھی قسم)", autoCloseHint: "یہ ٹکٹ 72 گھنٹے بغیر جواب کے خودکار بند ہو جائے گا۔",
    stageAutoClosed: "خودکار بند (72 گھنٹے گزر گئے)", autoCloseNote: "یہ ٹکٹ 72 گھنٹے بغیر جواب کے خودکار بند ہو گیا۔ اگر آپ کو اعتراض ہے تو خفیہ شکایت یا فوری اطلاع درج کریں:",
    objConfidential: "خفیہ شکایت درج کریں", objReport: "فوری اطلاع درج کریں", viewAttachment: "منسلکہ دیکھیں",
    chatT: "شعبہ جاتی گفتگو", chatToRep: "نمائندے کو پیغام", chatWith: "بات چیت", chatSendPh: "اپنا پیغام لکھیں…",
    chatSend: "بھیجیں", chatNoMsgs: "ابھی کوئی پیغام نہیں", chatSelectDept: "بات چیت کے لیے شعبہ منتخب کریں",
    repMsgsT: "شعبے کے پیغامات", repMsgFrom: "از", markSeen: "دیکھا گیا نشان زد کریں", seenAt: "دیکھنے کا وقت",
    seenBadge: "دیکھ لیا گیا", notSeenBadge: "ابھی نہیں دیکھا", composeToRep: "نمائندہ منتخب کریں",
    sendToRep: "نمائندے کو بھیجیں", invoiceAttach: "انوائس دستاویز منسلک کریں",
    lbTitle: "ماہانہ لیڈر بورڈ", lbSub: "اس ماہ کے سرِفہرست 3 نمائندے — پہلے دن سے براہ راست اپڈیٹ",
    lbFirst: "پہلی پوزیشن", lbSecond: "دوسری پوزیشن", lbThird: "تیسری پوزیشن",
    lbFirstDesc: "آرڈرز اور فاصلے دونوں میں سرِفہرست", lbSecondDesc: "سب سے زیادہ فاصلہ", lbThirdDesc: "نظم و ضبط، شفٹ اور وقت کی پابندی میں سب سے آگے",
    lbUmrah: "کمپنی کے خرچ پر مکمل عمرہ", lbUmrahHint: "مسلسل دو ماہ پہلی پوزیشن حاصل کرنے پر",
    lbYourRank: "آپ کی موجودہ پوزیشن", lbNoData: "اس ماہ ابھی کارکردگی کا ڈیٹا نہیں — سب سے پہلے سرِفہرست آئیں",
    lbPickThird: "اس ماہ کا سب سے نظم و ضبط والا نمائندہ منتخب کریں", lbSaveThird: "منتخب کریں", lbThirdSaved: "محفوظ ہو گیا",
    lbOrders: "آرڈر", lbKm: "کلومیٹر", lbMotivate: "ہر آرڈر اور ہر کلومیٹر آپ کو سرِفہرست کے قریب لے جاتا ہے — مہینہ ابھی ختم نہیں ہوا!",
    lbHistoryNote: "ہر مہینے کے آغاز پر نئے سرے سے شمار ہوتا ہے", lbReward: "لیڈر بورڈ انعام",
    auditT: "آڈٹ لاگ", auditNoLogs: "ابھی کوئی واقعہ درج نہیں", auditAction: "کارروائی", auditBy: "بذریعہ", auditWhen: "وقت",
    hallOfFameT: "شہرت کا ہال", hallOfFameSub: "گزشتہ مہینوں کے سرِفہرست کارکردگان",
    atRiskT: "اس ماہ ہدف سے چوکنے کے خطرے میں نمائندے",
    bulkSelected: "منتخب", bulkDelete: "منتخب حذف کریں",
    backupT: "مکمل بیک اپ", backupSub: "پلیٹ فارم کا تمام ڈیٹا ایک فائل کے طور پر برآمد کریں، یا پرانا بیک اپ بحال کریں۔",
    backupExport: "بیک اپ برآمد کریں", backupImport: "درآمد اور بحال کریں", restoreGmOnly: "بحالی صرف جنرل منیجر کے لیے دستیاب ہے۔",
    restoreOk: "ڈیٹا کامیابی سے بحال ہو گیا", restoreErr: "فائل غلط یا خراب ہے",
    declineAlert: "معمول کے اوسط کے مقابلے میں نمایاں کمی", searchGoTo: "جائیں",
    noSupervisorYet: "ابھی کوئی آپریشنز سپروائزر بھرتی نہیں ہوا — پہلے HR سے بھرتی کریں۔", pleaseChoose: "سپروائزر منتخب کریں…",
    repOf: "ٹیم", editRepT: "نمائندے کی تفصیل میں ترمیم", actingAs: "آپ اس وقت کام کر رہے ہیں بطور", chooseIdentity: "آپ کون ہیں؟",
    chooseIdentitySub: "یہ شعبہ ایک سے زیادہ ملازمین استعمال کرتے ہیں — اپنا نام منتخب کریں تاکہ آپ کے اقدامات آپ کے نام سے درج ہوں۔",
    continueGeneric: "عام عملے کے طور پر جاری رکھیں", identitySaved: "اس سیشن کے لیے آپ کی شناخت محفوظ ہو گئی",
    empPassword: "ذاتی پاس ورڈ", identityPassPh: "تصدیق کے لیے پاس ورڈ درج کریں", errIdentityPass: "غلط پاس ورڈ۔",
    noPasswordSet: "پاس ورڈ سیٹ نہیں",
    forwardedToLegalBadge: "قانونی امور کو بھیج دیا گیا", forwardToLegal: "قانونی امور کو بھیجیں",
    apptDateLbl: "ملاقات کی تاریخ", apptTimeLbl: "ملاقات کا وقت", errApptDate: "ملاقات کی تاریخ منتخب کریں۔",
    charterPageT: "نمائندوں کا اندرونی ضابطہ", charterPageSub: "منظور شدہ پالیسیاں اور جرمانے — قانونی امور کے زیرِ انتظام",
    weekendFineT: "ویک اینڈ غیر حاضری جرمانہ", weekendFineDesc: "مقررہ ویک اینڈ کے دنوں میں بلا اجازت غیر حاضری پر واجب الادا جرمانہ۔",
    reputationT: "نمائندے کی بدنامی", reputationDesc: "کوئی بھی بار بار بدنامی یا قوانین کی خلاف ورزی دستاویزی طور پر درج اور تحقیقات کے لیے بھیجی جاتی ہے۔",
    investigationT: "سیکیورٹی تحقیقات", investigationDesc: "مشکوک سرگرمی میں ملوث ہونے کی تصدیق پر، جنرل منیجر کیس کو باضابطہ تحقیقات کے لیے بھیجتا ہے۔",
    routingT: "اطلاعات کا راستہ", routingDesc: "نمائندوں کی اطلاعات پہلے جنرل منیجر اور آپریشنز منیجر کو ملتی ہیں، پھر قانونی امور کو بھیجی جاتی ہیں۔",
    addClauseBtn: "نیا شق شامل کریں", clauseTitleLbl: "شق کا عنوان", clauseBodyLbl: "شق کا متن", saveClause: "شق محفوظ کریں",
    fineAmountLbl: "جرمانے کی رقم (ریال)", saveFine: "رقم محفوظ کریں", noClausesYet: "ابھی کوئی شق شامل نہیں",
    clockInConfirmed: "آپ کی حاضری کامیابی سے درج ہو گئی", clockOutConfirmed: "آپ کی روانگی کامیابی سے درج ہو گئی",
    resetLaunchT: "لانچ سے پہلے پلیٹ فارم ری سیٹ کریں", resetLaunchSub: "تمام نمائندے، رپورٹس، ٹکٹس، تنخواہ کے ریکارڈ، حاضری، انوائسز اور آپریشنل ریکارڈ حذف کر دیتا ہے، اور پلیٹ فارم کو بالکل خالی حالت میں واپس لاتا ہے۔ ضابطے کی ترتیبات متاثر نہیں ہوتیں۔",
    resetLaunchWarn: "انتباہ: یہ عمل حتمی ہے اور واپس نہیں کیا جا سکتا۔ اگر آپ کو موجودہ ڈیٹا درکار ہے تو پہلے بیک اپ برآمد کریں۔",
    resetTypeLbl: "تصدیق کے لیے RESET لکھیں", resetLaunchBtn: "ابھی پلیٹ فارم ری سیٹ کریں", resetLaunchDone: "پلیٹ فارم کامیابی سے ری سیٹ ہو گیا — صفر سے لانچ کے لیے تیار",
    servicesMapT: "آپ کی خدمات کا نقشہ", startNow: "ابھی شروع کریں", checklistT: "لانچ سے پہلے چیک لسٹ",
    ttsConfirm: "آپ کی درخواست کامیابی سے بھیج دی گئی", autoBackupNote: "خودکار ہفتہ وار بیک اپ",
    chkSupervisor: "کم از کم ایک آپریشنز سپروائزر بھرتی ہوا", chkActiveRep: "کم از کم ایک فعال نمائندہ موجود ہے",
    chkAllDepts: "ہر شعبے میں کم از کم ایک ملازم ہے", chkDailyReport: "کم از کم ایک روزانہ کارکردگی رپورٹ محفوظ ہوئی",
    chkBackupDone: "کم از کم ایک بیک اپ لیا جا چکا ہے", chkCircular: "کم از کم ایک سرکلر شائع ہوا",
    chkFineSet: "ویک اینڈ جرمانہ مقرر ہے", chkAllReady: "سب کچھ تیار ہے — پلیٹ فارم لانچ کے لیے تیار ہے!",
    growthT: "کمپنی کی ترقی", growthSub: "پچھلے 12 مہینوں کی حقیقی پیش رفت — مکمل طور پر آپ کے اصل ڈیٹا سے بنایا گیا", growthMonths: "سرگرمی والے مہینے",
    growthRepsT: "نمائندوں کی تعداد میں اضافہ", growthOrdersT: "ماہانہ آرڈرز اور فاصلہ", growthRevenueT: "ماہانہ آمدنی (ہزار ریال)",
    apptSoonT: "آنے والی ملاقات", apptSoonNote: "نمائندے کی ملاقات ایک گھنٹے کے اندر ہے",
    deptLockedErr: "بار بار ناکام لاگ اِن کے بعد یہ شعبہ مقفل ہو گیا۔ صرف آپریشنز منیجر اسے کھول سکتا ہے۔",
    deptPwNotSetErr: "اس شعبے کا پاس ورڈ ابھی سیٹ نہیں ہوا۔ آپریشنز منیجر اسے سکیورٹی صفحے سے سیٹ کرتا ہے۔",
    securityT: "سیکیورٹی", securitySub: "شعبوں کے پاس ورڈ اور لاک کا انتظام — صرف آپریشنز منیجر کے لیے",
    deptPwLbl: "شعبے کا پاس ورڈ", saveDeptPw: "پاس ورڈ محفوظ کریں", lockedBadge: "مقفل", unlockBtn: "کھولیں", failsLbl: "ناکام کوششیں",
    suspendBtn: "معطل کریں", reactivateBtn: "دوبارہ فعال کریں", suspendedBadge: "معطل شدہ",
    onlyOpsGm: "صرف آپریشنز منیجر اور جنرل منیجر", resetRepPwT: "نمائندے کا پاس ورڈ ری سیٹ کریں",
    hiringFallbackNote: "بھرتی کے تسلسل کے لیے آپریشنز منیجر کو بھی دستیاب ہے",
    permMapT: "اختیارات کا نقشہ", permMapSub: "پلیٹ فارم میں کون کیا کر سکتا ہے — تاکہ ہر شعبہ پہلے دن سے اپنی حدود جانے",
    permYouHaveIt: "یہ اختیار آپ کے پاس ہے",
    myStoryT: "بوارق کے ساتھ میری کہانی", storyOrders: "کل آرڈرز", storyKm: "کل فاصلہ", storyHours: "کل کام کے گھنٹے",
    storyMonths: "فعال مہینے", storyWins: "لیڈر بورڈ میں سرِفہرست", storyThird: "سب سے نظم و ضبط والا", storySince: "ہمارے ساتھ منذ",
    storyProud: "ہمیں آپ پر فخر ہے — آپ لیڈر بورڈ میں سرِفہرست رہے", storyProudEnd: "بار!",
    customizeT: "ڈیش بورڈ ترتیب دیں",
    selfieRequired: "حاضری کی تصویر لیں", captureSelfie: "تصویر لیں", retake: "دوبارہ کوشش کریں", confirmClockIn: "حاضری کی تصدیق کریں",
    cameraDenied: "کیمرے تک رسائی مسترد۔ براہ کرم براؤزر کی سیٹنگز سے اجازت دیں۔", cameraLoading: "کیمرہ شروع ہو رہا ہے…",
    selfieNote: "حاضری کے لیے لائیو سیلفی درکار ہے — گیلری اپلوڈ قبول نہیں۔",
    hoursSummaryT: "تمام شعبوں میں حاضری کے گھنٹوں کا خلاصہ",
    violationPenaltyT: "فی خلاف ورزی جرمانہ",
    weekendViolCol: "ویک اینڈ خلاف ورزی", appViolCol: "ایپ خلاف ورزی",
    appRevenueT: "ہر ڈیلیوری ایپ کا کل منافع", ajeerManualNote: "تنخواہ دستی طور پر درج کی گئی", weekendFineLinked: "ویک اینڈ جرمانہ اندرونی ضابطے سے منسلک:",
    empTypeCol: "ملازمت کی قسم",
    payslipT: "تنخواہ کی پرچی", payslipMonth: "مہینہ", printBtn: "پرنٹ کریں", printedOn: "پرنٹ کی تاریخ", printPayslip: "تنخواہ کی پرچی پرنٹ کریں",
    totalDeductionLbl: "کل کٹوتی",
    supReportedLbl: "سپروائزر کی رپورٹ", violationsVaryNote: "ہر خلاف ورزی کی قیمت ہر نمائندے کے لیے مختلف ہوتی ہے — ہر نمائندے کے لیے اصل ریال کی رقم براہ راست درج کریں، مقررہ شرح نہیں۔",
    manualPayrollNote: "ہر نمائندے کی تنخواہ مکمل طور پر دستی طور پر درج کی جاتی ہے — کوئی خودکار حساب نہیں۔ ہر نمائندے کے لیے حتمی خالص رقم براہ راست لکھیں۔",
    deptPwSelfT: "میرے شعبے کا پاس ورڈ تبدیل کریں", deptPwSelfSub: "عام صورتحال: آپ اپنے شعبے کا پاس ورڈ خود براہ راست تبدیل کرتے ہیں، آپریشنز منیجر کی ضرورت نہیں۔",
    deptPwCurrent: "موجودہ پاس ورڈ", deptPwNew: "نیا پاس ورڈ", deptPwConfirm: "نئے پاس ورڈ کی تصدیق", deptPwSaved: "شعبے کا پاس ورڈ کامیابی سے تبدیل ہو گیا",
    errCurrentDeptPw: "موجودہ پاس ورڈ غلط ہے۔", errPassMatch: "پاس ورڈز مماثل نہیں ہیں۔",
    invAnalysisT: "ایپ انوائس تجزیہ", invAnalysisSub: "ماہانہ ڈیلیوری ایپ انوائسز درج کریں اور حقیقی مالی تصویر دیکھیں — منافع یا نقصان",
    profitLbl: "اس ماہ منافع", lossLbl: "اس ماہ نقصان", invNetIn: "ایپس سے موصول خالص رقم", payrollOut: "ادا شدہ نمائندہ تنخواہ",
    needsPayrollClosed: "منافع اور نقصان کا موازنہ کرنے کے لیے، اس ماہ کی تنخواہ پہلے مالیات سے بند ہونی چاہیے۔",
    riderUtilization: "فعال نمائندہ تناسب", lowActiveWarn: "انتباہ: اس ماہ فعال نمائندوں کا تناسب کم ہے",
    invByAppT: "ایپ کے مطابق آمدنی", invTrendT: "ماہانہ رجحان: آمدنی بمقابلہ تنخواہ",
    addInvoiceBtn: "نئی انوائس درج کریں", invApp: "ایپ", invMonth: "مہینہ", invGrossExclVat: "رقم بدون ٹیکس",
    invVat: "ٹیکس کی رقم", invCarRental: "گاڑی کرایہ کٹوتی", invRidersTotal: "معاہدے پر کل نمائندے", invRidersActive: "فعال نمائندے",
    invHistoryT: "درج شدہ انوائسز کی تاریخ",
    complianceT: "سازوسامان کی تعمیل", complianceSub: "ہر نمائندے کی وردی اور سامان کی نگرانی کر کے ٹرانسپورٹ اتھارٹی کے جرمانوں سے بچیں",
    complianceRateLbl: "مکمل تعمیل کی شرح", tgaFinesTotal: "اتھارٹی جرمانوں کی کل رقم", tgaFinesCount: "درج شدہ جرمانے",
    lowComplianceWarn: "انتباہ: تعمیل کی شرح بہت کم ہے — سامان کی کمی والا ہر نمائندہ فوری جرمانے کے خطرے میں ہے۔",
    equipPerRepT: "ہر نمائندے کے سامان کی حالت", equipItem_shirt: "وردی", equipItem_helmet: "ہیلمٹ", equipItem_bag: "بیگ",
    equipValid: "موجود", equipMissing: "غائب", equipExpired: "ختم شدہ",
    addFineBtn: "ٹرانسپورٹ اتھارٹی جرمانہ درج کریں", fineRepSelect: "نمائندہ", fineAmountLbl2: "جرمانے کی رقم",
    fineReasonLbl: "جرمانے کی وجہ", tgaFinesHistoryT: "اتھارٹی جرمانوں کی تاریخ",
    payslipProvisional: "اس مہینے کی تنخواہ ابھی حتمی نہیں ہوئی — اعداد و شمار عارضی ہیں اور تبدیل ہو سکتے ہیں۔",
    warnBefore: "باقی", warnHours: "گھنٹے خودکار بندش سے پہلے", lateForShift: "شفٹ میں تاخیر",
    sessionExpiredMsg: "آپ کی نشست غیرفعالیت کی وجہ سے خودکار ختم ہو گئی — براہ کرم دوبارہ لاگ ان کریں۔",
    avgResolutionT: "شعبے کے مطابق ٹکٹ حل کرنے کا اوسط وقت",
    pacingT: "ہفتہ وار پیش بندی الرٹ", pacingSub: "ہر نمائندے کی کارکردگی متوقع رفتار کے مقابلے میں، مہینہ ختم ہونے سے پہلے سنبھالیں", pacingAllGood: "سب مقررہ رفتار پر ہیں 👍",
  },
};

/* ═══════════  حقل إدخال  ═══════════ */
function GateField({ label, val, set, ph, Icon, type, accent, onEnter, af, tail }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold" style={{ color: "var(--muted)" }}>{label}</span>{tail}
      </span>
      <span className="flex items-center gap-2.5 rounded-xl px-3.5 py-3" style={{ background: "rgba(0,0,0,.28)", border: "1px solid var(--line)" }}>
        <Icon size={16} style={{ color: accent }} />
        <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} type={type} autoFocus={af}
          onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
          className="num flex-1 bg-transparent border-0 outline-none text-[15px] min-w-0" style={{ color: "#12151D" }} />
      </span>
    </label>
  );
}

/* ═══════════  شاشة اللغة  ═══════════ */
function LangScreen({ lang, setLang, next }) {
  const t = T[lang];
  return (
    <div className="min-h-full relative grid place-items-center px-5 py-12 overflow-hidden">
      <div className="mesh" />
      <div className="relative w-full max-w-md rise">
        <div className="mb-5"><BrandHero lang={lang} compact /></div>
        <div className="glass rounded-3xl p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-1">
            <Languages size={16} style={{ color: "var(--gold)" }} />
            <h1 className="text-[17px] h-section">{t.langTitle}</h1>
          </div>
          <p className="text-[12.5px] mb-5" style={{ color: "var(--muted)" }}>{t.langSub}</p>
          <div className="space-y-2.5">
            {LANGS.map((l) => {
              const on = l.code === lang;
              return (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 transition text-start"
                  style={{ background: on ? "rgba(228,184,92,.11)" : "rgba(20,27,45,.04)", border: `1px solid ${on ? "rgba(228,184,92,.45)" : "var(--line)"}`, boxShadow: on ? "0 12px 34px -18px rgba(228,184,92,.8)" : "none" }}>
                  <span className="num grid place-items-center w-10 h-10 rounded-xl text-[13px] font-bold shrink-0"
                    style={{ background: "rgba(20,27,45,.06)", border: "1px solid var(--line)", color: on ? "var(--gold2)" : "var(--muted)" }}>{l.mark}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-bold">{l.name}</span>
                    <span className="block text-[11px]" style={{ color: "var(--muted)" }}>{l.sub} · {l.dir.toUpperCase()}</span>
                  </span>
                  {on && <CheckCircle2 size={18} style={{ color: "var(--gold)" }} />}
                </button>
              );
            })}
          </div>
          <div className="mt-6"><Btn variant="gold" full icon={ChevronRight} onClick={next}>{t.cont}</Btn></div>
        </div>
        <p className="text-center text-[11px] mt-5" style={{ color: "rgba(30,38,58,.4)" }}>{t.tagline}</p>
      </div>
    </div>
  );
}

/* ═══════════  بوابة الدخول  ═══════════ */
/* ═══════════  شاشة اختيار الشفت (إلزامية قبل لوحة المندوب)  ═══════════ */
function LogShiftModal({ lang, role, onClose, onConfirm }) {
  const x = EX[lang];
  const [start, setStart] = useState("20:00");
  const [end, setEnd] = useState("03:00");
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center px-5" style={{ background: "rgba(3,5,10,.72)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="glass rounded-3xl p-6 w-full max-w-sm rise" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[15px] font-extrabold mb-1">{x.logNewShift}</h3>
        <p className="text-[12px] mb-4" style={{ color: "var(--muted)" }}>{x.shiftPickSub}</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.shiftStart}</span>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)}
              className="num w-full rounded-xl px-3 py-3 text-[14px] outline-none" style={{ background: "rgba(0,0,0,.28)", border: "1px solid var(--line)", color: "#12151D" }} />
          </label>
          <label className="block">
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.shiftEnd}</span>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)}
              className="num w-full rounded-xl px-3 py-3 text-[14px] outline-none" style={{ background: "rgba(0,0,0,.28)", border: "1px solid var(--line)", color: "#12151D" }} />
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <Btn full onClick={onClose}>{T[lang].back}</Btn>
          <Btn full variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => onConfirm(start, end)}>{x.confirmShift}</Btn>
        </div>
      </div>
    </div>
  );
}

function ShiftPickScreen({ lang, rep, onConfirm }) {
  const t = T[lang], x = EX[lang];
  const [start, setStart] = useState("13:00");
  const [end, setEnd] = useState("16:00");
  const quotes = MOTIVATION[lang];
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div className="min-h-full relative grid place-items-center px-5 py-10 overflow-hidden">
      <div className="mesh" />
      <div className="relative w-full max-w-md rise">
        <div className="flex justify-center mb-6"><Wordmark t={t} s={48} /></div>
        <div className="glass rounded-3xl p-6 sm:p-7">
          <div className="rounded-2xl p-3.5 mb-5 flex items-start gap-2.5" style={{ background: "rgba(63,216,180,.1)", border: "1px solid rgba(63,216,180,.28)" }}>
            <Rocket size={17} style={{ color: "#3FD8B4" }} className="mt-0.5 shrink-0" />
            <p className="text-[12.5px] leading-relaxed font-semibold">{quote}</p>
          </div>
          <h1 className="text-[17px] font-extrabold">{x.shiftPickTitle}</h1>
          {rep && <p className="text-[12.5px] mt-1" style={{ color: "#3FD8B4" }}>{lang === "en" ? rep.en : rep.ar}</p>}
          <p className="text-[12px] mt-1.5 mb-5" style={{ color: "var(--muted)" }}>{x.shiftPickSub}</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.shiftStart}</span>
              <span className="flex items-center gap-2 rounded-xl px-3 py-3" style={{ background: "rgba(0,0,0,.28)", border: "1px solid var(--line)" }}>
                <Clock size={15} style={{ color: "#3FD8B4" }} />
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="num flex-1 bg-transparent border-0 outline-none text-[14px]" style={{ color: "#12151D" }} />
              </span>
            </label>
            <label className="block">
              <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.shiftEnd}</span>
              <span className="flex items-center gap-2 rounded-xl px-3 py-3" style={{ background: "rgba(0,0,0,.28)", border: "1px solid var(--line)" }}>
                <Clock size={15} style={{ color: "#3FD8B4" }} />
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="num flex-1 bg-transparent border-0 outline-none text-[14px]" style={{ color: "#12151D" }} />
              </span>
            </label>
          </div>
          <div className="mt-5"><Btn variant="accent" accent="63,216,180" full icon={CheckCircle2} onClick={() => onConfirm(start, end)}>{x.confirmShift}</Btn></div>
        </div>
      </div>
    </div>
  );
}

function DeptGate({ lang, setLang, onEmployee, onRep, reps, employees, err: gateErr, setErr: setGateErr, sessionExpired, deptPasswords, deptSecurity, setDeptSecurity }) {
  const t = T[lang], x = EX[lang];
  const [open, setOpen] = useState(null);
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const [rep, setRep] = useState(false);
  const [nid, setNid] = useState(""); const [rpw, setRpw] = useState(""); const [rerr, setRerr] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = (id) => { setOpen(open === id ? null : id); setPw(""); setErr(""); setRep(false); };
  const goEmp = (id) => {
    const sec = deptSecurity[id] || { fails: 0, locked: false };
    if (sec.locked) { setErr(x.deptLockedErr); return; }
    if (!deptPasswords[id]) { setErr(x.deptPwNotSetErr); return; }
    if (pw !== deptPasswords[id]) {
      const fails = (sec.fails || 0) + 1;
      const locked = fails >= 5;
      setDeptSecurity((prev) => ({ ...prev, [id]: { fails, locked } }));
      setErr(locked ? x.deptLockedErr : x.errPass);
      return;
    }
    setDeptSecurity((prev) => ({ ...prev, [id]: { fails: 0, locked: false } }));
    setErr(""); setBusy(true); setTimeout(() => onEmployee(id), 500);
  };
  const goRep = () => {
    if (nid.trim().length < 6 || rpw.length < 4) { setRerr(x.errRep); return; }
    setRerr(""); setGateErr && setGateErr(""); setBusy(true);
    setTimeout(() => { setBusy(false); onRep(nid.trim(), rpw); }, 500);
  };
  const shownRerr = rerr || gateErr;

  return (
    <div className="min-h-full relative px-4 sm:px-5 py-7 sm:py-11 overflow-hidden">
      <div className="mesh" />
      <div className="relative max-w-5xl mx-auto">
        <div className="mb-5"><BrandHero lang={lang} reps={reps} /></div>
        <div className="flex items-center justify-end gap-3 mb-6 sm:mb-8">
          <div className="flex gap-1.5 items-center">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)} className="num px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition"
                style={{ background: lang === l.code ? "rgba(228,184,92,.15)" : "rgba(20,27,45,.04)", border: `1px solid ${lang === l.code ? "rgba(228,184,92,.42)" : "var(--line)"}`, color: lang === l.code ? "var(--gold2)" : "var(--muted)" }}>{l.mark}</button>
            ))}
            <button onClick={() => pick("advisor")} aria-label="." className="w-2 h-2 rounded-full ms-1 opacity-30 hover:opacity-70 transition" style={{ background: "var(--muted)" }} />
          </div>
        </div>
        {open === "advisor" && (
          <div className="rise mb-6 max-w-xs ms-auto glass rounded-2xl p-4" style={{ border: `1px solid rgba(${ADVISOR_ROLE.glow},.35)` }}>
            <GateField label={x.deptPass} val={pw} set={setPw} ph="••••••••" Icon={Lock} af type="password" accent={ADVISOR_ROLE.accent} onEnter={() => goEmp("advisor")} />
            {err && <p className="mt-2.5 text-[11px] flex items-start gap-1.5" style={{ color: "#E8837A" }}><AlertTriangle size={13} className="mt-px shrink-0" />{err}</p>}
            <div className="mt-3"><Btn variant="accent" accent={ADVISOR_ROLE.glow} full icon={Fingerprint} onClick={() => goEmp("advisor")}>{busy ? "…" : t.enter}</Btn></div>
          </div>
        )}

        {sessionExpired && (
          <div className="rise mb-6 rounded-2xl px-4 py-3 flex items-center gap-2.5" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.32)" }}>
            <Clock size={16} style={{ color: "#E8837A" }} />
            <p className="text-[12px] font-semibold" style={{ color: "#E8837A" }}>{x.sessionExpiredMsg}</p>
          </div>
        )}

        <div className="rise mb-7 grid gap-5 lg:grid-cols-5 items-center">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-px" style={{ background: "var(--gold)" }} />
              <span className="label-caps" style={{ color: "var(--gold)" }}>{t.tagline}</span>
            </div>
            <h1 className="text-[26px] sm:text-[28px] h-display">{t.deptTitle}</h1>
            <p className="text-[13px] mt-2 max-w-lg" style={{ color: "var(--muted)" }}>{x.gateSub}</p>
          </div>
          <div className="lg:col-span-3 glass rounded-3xl overflow-hidden relative">
            <DeliveryScene />
            <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none" style={{ background: "linear-gradient(to top,rgba(5,7,14,.9),transparent)" }} />
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {ROLES.map((role, i) => {
            const r = role[lang], Icon = role.icon, on = open === role.id, dim = open && !on;
            return (
              <div key={role.id} className="scene rise" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="card3d glass relative overflow-hidden rounded-3xl"
                  style={{ opacity: dim ? .45 : 1, borderColor: on ? `rgba(${role.glow},.5)` : "var(--line)", boxShadow: on ? `0 30px 70px -34px rgba(${role.glow},.85)` : `0 22px 50px -44px rgba(${role.glow},.7)`, transform: on ? "translateZ(24px)" : "none" }}>
                  <div className="sheen" />
                  <div className="absolute pointer-events-none rounded-full" style={{ width: 150, height: 150, insetInlineEnd: -50, top: -50, background: `radial-gradient(circle,rgba(${role.glow},.20),transparent 70%)` }} />
                  <button onClick={() => pick(role.id)} className="w-full text-start p-5 relative">
                    <div className="flex items-start justify-between gap-3">
                      <Emblem role={role} size={48} />
                      <span className="num text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(20,27,45,.05)", border: "1px solid var(--line)", color: "var(--muted)" }}>{employees.filter((e) => e.dept === role.id).length} {t.members}</span>
                    </div>
                    <h3 className="mt-4 text-[16.5px] h-section">{r.t}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--muted)" }}>{r.d}</p>
                    <div className="mt-4 pt-3.5 flex items-center justify-between" style={{ borderTop: "1px solid var(--line)" }}>
                      <span className="text-[11.5px] font-bold" style={{ color: role.accent }}>{on ? x.enterPass : t.enter}</span>
                      <span className="grid place-items-center w-7 h-7 rounded-lg transition" style={{ background: on ? `rgba(${role.glow},.16)` : "rgba(20,27,45,.05)", transform: on ? "rotate(90deg)" : "none" }}>
                        <ChevronRight size={15} style={{ color: role.accent }} />
                      </span>
                    </div>
                  </button>
                  {on && (
                    <div className="drop px-5 pb-5">
                      <div className="pt-4" style={{ borderTop: `1px solid rgba(${role.glow},.25)` }}>
                        <GateField label={x.deptPass} val={pw} set={setPw} ph="••••••••" Icon={Lock} af type="password" accent={role.accent} onEnter={() => goEmp(role.id)} />
                        {err && <p className="mt-2.5 text-[11px] flex items-start gap-1.5" style={{ color: "#E8837A" }}><AlertTriangle size={13} className="mt-px shrink-0" />{err}</p>}
                        <div className="mt-3.5"><Btn variant="accent" accent={role.glow} full icon={Fingerprint} onClick={() => goEmp(role.id)}>{busy ? "…" : t.enter}</Btn></div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "rgba(30,38,58,.42)" }}><ShieldCheck size={12} />{t.secure}</span>
                          <button className="text-[10.5px] font-semibold" style={{ color: role.accent }}>{t.forgot}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rise" style={{ animationDelay: "420ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
            <span className="text-[10.5px] tracking-[.22em] uppercase" style={{ color: "rgba(30,38,58,.4)" }}>{x.orRep}</span>
            <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
          </div>
          <div className="scene">
            <div className="card3d glass relative overflow-hidden rounded-3xl max-w-xl mx-auto"
              style={{ borderColor: rep ? "rgba(63,216,180,.45)" : "var(--line)", boxShadow: rep ? "0 30px 70px -34px rgba(63,216,180,.7)" : "none" }}>
              <div className="sheen" />
              <button onClick={() => { setRep(!rep); setOpen(null); setRerr(""); }} className="w-full text-start p-4 sm:p-5 flex items-center gap-3.5">
                <Emblem role={REP} size={48} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-extrabold">{x.repTitle}</span>
                  <span className="block text-[11.5px] mt-0.5" style={{ color: "var(--muted)" }}>{x.repSub}</span>
                </span>
                <span className="grid place-items-center w-7 h-7 rounded-lg shrink-0 transition" style={{ background: "rgba(20,27,45,.05)", transform: rep ? "rotate(90deg)" : "none" }}>
                  <ChevronRight size={15} style={{ color: REP.accent }} />
                </span>
              </button>
              {rep && (
                <div className="drop px-4 sm:px-5 pb-5">
                  <div className="pt-4 space-y-3.5" style={{ borderTop: "1px solid rgba(63,216,180,.25)" }}>
                    <GateField label={x.nationalId} val={nid} set={setNid} ph="1xxxxxxxxx" Icon={User} af type="text" accent={REP.accent} onEnter={goRep} />
                    <GateField label={t.pass} val={rpw} set={setRpw} ph="••••••••" Icon={Lock} type="password" accent={REP.accent} onEnter={goRep} />
                    {shownRerr && <p className="text-[11px] flex items-start gap-1.5" style={{ color: "#E8837A" }}><AlertTriangle size={13} className="mt-px shrink-0" />{shownRerr}</p>}
                    <Btn variant="accent" accent={REP.glow} full icon={Fingerprint} onClick={goRep}>{busy ? "…" : x.repTitle}</Btn>
                    <p className="text-[10px] text-center" style={{ color: "rgba(30,38,58,.38)" }}>{x.repHint}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-center text-[10.5px] mt-8" style={{ color: "rgba(30,38,58,.32)" }}>{t.demoNote}</p>
      </div>
    </div>
  );
}

/* ═══════════  جدول متجاوب  ═══════════ */
function DataTable({ headers, rows, onBulkDelete }) {
  const curLang = (typeof document !== "undefined" && document.documentElement.lang) || "ar";
  const x = EX[curLang] || EX.ar;
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [selected, setSelected] = useState({});
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;
  const Cell = ({ c }) => c.custom !== undefined
    ? c.custom
    : c.chip
    ? <Chip tone={c.chip.tone} sm>{c.chip.label}</Chip>
    : <span className={c.mono ? "num" : ""} style={{ color: c.dim ? "var(--muted)" : "#12151D", fontWeight: c.strong ? 700 : 500 }}>{c.v}</span>;
  const hasActions = rows.some((r) => r.onDelete);
  const bulkMode = !!onBulkDelete;
  const sortVal = (r, i) => {
    const c = r.cells[i];
    if (!c) return "";
    if (c.chip) return c.chip.label;
    const raw = String(c.v ?? "");
    const num = parseFloat(raw.replace(/[^0-9.\-]/g, ""));
    return !isNaN(num) && /^[\s\d.,\-]+$/.test(raw) ? num : raw.toLowerCase();
  };
  const sortedRows = sortCol == null ? rows : [...rows].sort((a, b) => {
    const va = sortVal(a, sortCol), vb = sortVal(b, sortCol);
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * sortDir;
    return String(va).localeCompare(String(vb)) * sortDir;
  });
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const curPage = Math.min(page, pageCount - 1);
  const pagedRows = sortedRows.slice(curPage * PAGE_SIZE, curPage * PAGE_SIZE + PAGE_SIZE);
  const toggleSort = (i) => {
    if (sortCol === i) setSortDir((d) => -d);
    else { setSortCol(i); setSortDir(1); }
    setPage(0);
  };
  const selCount = Object.values(selected).filter(Boolean).length;
  const toggleOne = (key) => setSelected((p) => ({ ...p, [key]: !p[key] }));
  const toggleAll = () => {
    const allSelected = pagedRows.length > 0 && pagedRows.every((r) => selected[r.key]);
    const next = { ...selected };
    pagedRows.forEach((r) => { next[r.key] = !allSelected; });
    setSelected(next);
  };
  const doBulkDelete = () => {
    const keys = Object.keys(selected).filter((k) => selected[k]);
    if (keys.length && onBulkDelete) onBulkDelete(keys);
    setSelected({});
  };
  return (
    <>
      {bulkMode && selCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 mb-3" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.3)" }}>
          <span className="text-[12px] font-semibold">{x.bulkSelected}: {selCount}</span>
          <Btn variant="danger" icon={Trash2} onClick={doBulkDelete}>{x.bulkDelete}</Btn>
        </div>
      )}
      <div className="hidden md:block overflow-x-auto no-scrollbar">
        <table className="w-full text-[12.5px]" style={{ borderCollapse: "separate", borderSpacing: "0 7px" }}>
          <thead><tr>
            {bulkMode && (
              <th className="pb-1 px-3 sticky top-0 z-10" style={{ background: "var(--ink)" }}>
                <input type="checkbox" checked={pagedRows.length > 0 && pagedRows.every((r) => selected[r.key])} onChange={toggleAll} className="w-4 h-4" />
              </th>
            )}
            {headers.map((h, i) => (
            <th key={h} onClick={() => toggleSort(i)} className="text-start font-bold pb-1 px-3 whitespace-nowrap text-[10.5px] cursor-pointer select-none sticky top-0 z-10 label-caps"
              style={{ color: sortCol === i ? "#12151D" : "var(--muted-2)", background: "var(--ink)" }}>
              <span className="inline-flex items-center gap-1 normal-case" style={{ fontSize: 11, letterSpacing: 0, fontWeight: 700 }}>{h}
                {sortCol === i ? (sortDir === 1 ? <ChevronRight size={11} style={{ transform: "rotate(90deg)" }} /> : <ChevronRight size={11} style={{ transform: "rotate(-90deg)" }} />) : null}
              </span>
            </th>
          ))}{hasActions && <th className="pb-1 px-3 sticky top-0 z-10" style={{ background: "var(--ink)" }} />}</tr></thead>
          <tbody>{pagedRows.map((r) => (
            <tr key={r.key} className="transition-all duration-200 group" style={{ transitionTimingFunction: "var(--ease-out)" }}>
              {bulkMode && (
                <td className="py-3 px-3 rounded-s-2xl group-hover:brightness-95" style={{ background: "var(--surface-1)" }}>
                  <input type="checkbox" checked={!!selected[r.key]} onChange={() => toggleOne(r.key)} className="w-4 h-4" />
                </td>
              )}
              {r.cells.map((c, i) => (
                <td key={i} className={`py-3 px-3 whitespace-nowrap group-hover:brightness-95 ${!bulkMode && i === 0 ? "rounded-s-2xl" : ""} ${!hasActions && i === r.cells.length - 1 ? "rounded-e-2xl" : ""}`} style={{ background: "var(--surface-1)" }}><Cell c={c} /></td>
              ))}
              {hasActions && (
                <td className="py-3 px-3 whitespace-nowrap text-end rounded-e-2xl group-hover:brightness-95" style={{ background: "var(--surface-1)" }}>
                  {r.onDelete && (
                    <button onClick={r.onDelete} className="p-1.5 rounded-lg transition-transform active:scale-90" style={{ color: "#E8837A" }} aria-label="delete">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}</tbody>
        </table>
        {pageCount > 1 && (
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-[11px]" style={{ color: "var(--muted)" }}>{curPage * PAGE_SIZE + 1}–{Math.min(sortedRows.length, (curPage + 1) * PAGE_SIZE)} / {sortedRows.length}</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={curPage === 0} className="grid place-items-center w-8 h-8 rounded-xl transition disabled:opacity-30" style={{ background: "var(--surface-1)", border: "1px solid var(--line)" }}>
                <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i).filter((i) => Math.abs(i - curPage) <= 1 || i === 0 || i === pageCount - 1).map((i, idx, arr) => (
                <React.Fragment key={i}>
                  {idx > 0 && arr[idx - 1] !== i - 1 && <span className="text-[11px]" style={{ color: "var(--muted-2)" }}>···</span>}
                  <button onClick={() => setPage(i)} className="num grid place-items-center w-8 h-8 rounded-xl text-[11.5px] font-bold transition"
                    style={{ background: i === curPage ? "var(--gold)" : "var(--surface-1)", color: i === curPage ? "#1A1204" : "var(--muted)", border: "1px solid var(--line)" }}>
                    {i + 1}
                  </button>
                </React.Fragment>
              ))}
              <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={curPage === pageCount - 1} className="grid place-items-center w-8 h-8 rounded-xl transition disabled:opacity-30" style={{ background: "var(--surface-1)", border: "1px solid var(--line)" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="md:hidden space-y-2.5">
        {sortedRows.map((r) => (
          <div key={r.key} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="flex items-center gap-2 min-w-0">
                {bulkMode && <input type="checkbox" checked={!!selected[r.key]} onChange={() => toggleOne(r.key)} className="w-4 h-4 shrink-0" />}
                <Cell c={{ ...r.cells[0], strong: true }} />
              </span>
              <div className="flex items-center gap-2">
                {r.cells.find((c) => c.chip) && <Cell c={r.cells.find((c) => c.chip)} />}
                {r.onDelete && (
                  <button onClick={r.onDelete} className="p-1.5 rounded-lg" style={{ color: "#E8837A" }} aria-label="delete">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-3">
              {r.cells.map((c, i) => (i === 0 || c.chip) ? null : (
                <div key={i} className="min-w-0">
                  <div className="text-[10px] mb-0.5" style={{ color: "rgba(30,38,58,.42)" }}>{headers[i]}</div>
                  <div className="truncate text-[12.5px]"><Cell c={c} /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════  تغيير كلمة المرور  ═══════════ */
function DeptPasswordCard({ lang, role, deptPasswords, setDeptPasswords, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const submit = () => {
    if (cur !== (deptPasswords[role.id] || "")) return setErr(x.errCurrentDeptPw);
    if (nw.length < 4) return setErr(x.errPass);
    if (nw !== confirm) return setErr(x.errPassMatch);
    setErr("");
    setDeptPasswords((prev) => ({ ...prev, [role.id]: nw }));
    logAudit(setAuditLog, role, "dept_password_self_change", role.id, actingEmployee);
    setCur(""); setNw(""); setConfirm("");
    setOk(true);
    setTimeout(() => setOk(false), 3500);
  };

  return (
    <Panel title={x.deptPwSelfT}>
      <p className="text-[11.5px] mb-3.5" style={{ color: "var(--muted)" }}>{x.deptPwSelfSub}</p>
      <div className="space-y-3">
        <GateField label={x.deptPwCurrent} val={cur} set={setCur} ph="" Icon={KeyRound} type="password" accent={role.accent} />
        <GateField label={x.deptPwNew} val={nw} set={setNw} ph="" Icon={Lock} type="password" accent={role.accent} />
        <GateField label={x.deptPwConfirm} val={confirm} set={setConfirm} ph="" Icon={Lock} type="password" accent={role.accent} onEnter={submit} />
      </div>
      {err && <p className="mt-3 text-[11.5px] flex items-start gap-1.5" style={{ color: "#D6584D" }}><AlertTriangle size={14} className="mt-px shrink-0" />{err}</p>}
      {ok && <p className="mt-3 text-[11.5px] flex items-start gap-1.5" style={{ color: "#0FA579" }}><CheckCircle2 size={14} className="mt-px shrink-0" />{x.deptPwSaved}</p>}
      <div className="mt-4"><Btn variant="accent" accent={role.glow} icon={KeyRound} onClick={submit}>{x.save}</Btn></div>
    </Panel>
  );
}

function PasswordCard({ lang, role, activeRep, reps, setReps, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [cf, setCf] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(null);
  const [changed, setChanged] = useState(activeRep && activeRep.pwChanged ? activeRep.pwChanged : "—");
  const isRep = role.id === "rep";

  const score = (() => {
    let s = 0;
    if (nw.length >= 6) s++;
    if (nw.length >= 10) s++;
    if (/[0-9]/.test(nw) && /[^0-9a-zA-Z]/.test(nw)) s++;
    else if (/[0-9]/.test(nw) || /[^0-9a-zA-Z]/.test(nw)) s += 0.5;
    return Math.min(3, Math.round(s));
  })();
  const sLabel = [x.weak, x.weak, x.medium, x.strong][score];
  const sColor = ["#E8837A", "#E8837A", "#E4B85C", "#4FD1A5"][score];

  const submit = () => {
    if (cur.length < 4) return setMsg({ ok: false, m: x.errCur });
    if (isRep && activeRep && activeRep.password && cur !== activeRep.password) return setMsg({ ok: false, m: x.errCur });
    if (nw.length < 6) return setMsg({ ok: false, m: x.errShort });
    if (nw === cur) return setMsg({ ok: false, m: x.errSame });
    if (nw !== cf) return setMsg({ ok: false, m: x.errMatch });
    const today = riyadhToday();
    if (isRep && activeRep && setReps) {
      setReps((prev) => prev.map((r) => (r.id === activeRep.id ? { ...r, password: nw, pwChanged: today } : r)));
      logAudit(setAuditLog, role, "password_change", isRep ? `${activeRep.ar} (${activeRep.nid})` : role.id, actingEmployee);
    }
    setMsg({ ok: true, m: x.okSaved });
    setCur(""); setNw(""); setCf("");
    setChanged(today);
  };

  const eye = (
    <button onClick={() => setShow(!show)} className="flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: role.accent }}>
      {show ? <EyeOff size={13} /> : <Eye size={13} />}{x.showPass}
    </button>
  );

  return (
    <Panel title={x.secTitle} extra={<span className="grid place-items-center w-8 h-8 rounded-xl" style={{ background: `rgba(${role.glow},.13)`, border: `1px solid rgba(${role.glow},.28)` }}><KeyRound size={15} style={{ color: role.accent }} /></span>}>
      <div className="rounded-xl p-3 mb-4 flex items-start gap-2.5" style={{ background: `rgba(${role.glow},.07)`, border: `1px solid rgba(${role.glow},.2)` }}>
        <ShieldCheck size={15} style={{ color: role.accent }} className="mt-px shrink-0" />
        <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--muted)" }}>{isRep ? x.secNoteRep : x.secNote}</p>
      </div>
      <div className="space-y-3.5">
        <GateField label={x.curPass} val={cur} set={setCur} ph="••••••••" Icon={Lock} type={show ? "text" : "password"} accent={role.accent} tail={eye} />
        <GateField label={x.newPass} val={nw} set={setNw} ph="••••••••" Icon={KeyRound} type={show ? "text" : "password"} accent={role.accent} />
        {nw.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>{x.strength}</span>
              <span className="text-[10.5px] font-bold" style={{ color: sColor }}>{sLabel}</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="flex-1 h-1.5 rounded-full transition" style={{ background: i < Math.max(1, score) ? sColor : "rgba(20,27,45,.08)" }} />
              ))}
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: "rgba(30,38,58,.38)" }}>{x.tips}</p>
          </div>
        )}
        <GateField label={x.cfPass} val={cf} set={setCf} ph="••••••••" Icon={CheckCircle2} type={show ? "text" : "password"} accent={role.accent} onEnter={submit} />
        {msg && (
          <p className="text-[11.5px] flex items-start gap-1.5" style={{ color: msg.ok ? "#4FD1A5" : "#E8837A" }}>
            {msg.ok ? <CheckCircle2 size={14} className="mt-px shrink-0" /> : <AlertTriangle size={14} className="mt-px shrink-0" />}{msg.m}
          </p>
        )}
        <Btn variant="accent" accent={role.glow} full icon={KeyRound} onClick={submit}>{x.savePass}</Btn>
        <p className="text-[10.5px] text-center" style={{ color: "rgba(30,38,58,.38)" }}>{x.lastChanged}: <span className="num">{changed}</span></p>
      </div>
    </Panel>
  );
}

/* ═══════════  الصفحات  ═══════════ */
function RepHeroArt({ accent = "63,216,180" }) {
  return (
    <svg viewBox="0 0 200 90" className="absolute pointer-events-none" style={{ insetInlineEnd: -6, bottom: -6, width: 190, opacity: .5 }} fill="none">
      <path d="M4 74 H196" stroke={`rgba(${accent},.25)`} strokeWidth="1.4" strokeDasharray="5 5" />
      <path d="M20 76 L60 40 L90 40 L120 76" stroke={`rgba(${accent},.45)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="120" cy="76" r="3" fill={`rgba(${accent},.7)`} />
      <g transform="translate(128,52)">
        <rect x="0" y="14" width="46" height="16" rx="4" stroke={`rgba(${accent},.55)`} strokeWidth="2" fill="none" />
        <path d="M6 14 L14 2 H34 L42 14" stroke={`rgba(${accent},.55)`} strokeWidth="2" fill="none" strokeLinejoin="round" />
        <circle cx="10" cy="32" r="5" stroke={`rgba(${accent},.7)`} strokeWidth="2" fill="none" />
        <circle cx="36" cy="32" r="5" stroke={`rgba(${accent},.7)`} strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
}

function Overview({ pricing, role, lang, reps, reports, orders, cars, invoices, contracts, cases, employees, expenses, restaurants, tickets, attendance, activeRep, approvalReqs, shifts }) {
  const t = T[lang], x = EX[lang], A = role.glow;
  const [customizing, setCustomizing] = useState(false);
  const [hiddenKpis, setHiddenKpis] = usePersonalList(`kpi_hidden_${role.id}`);

  if (role.id === "rep") {
    const quotes = MOTIVATION[lang];
    const quote = quotes[riyadhNow().getUTCDate() % quotes.length];
    const month = riyadhNow().toISOString().slice(0, 7);
    const mine = activeRep ? monthEntriesFor(reports, activeRep.id, month) : [];
    const mOrders = mine.reduce((a, e) => a + (e.orders || 0), 0);
    const mHours = mine.reduce((a, e) => a + (e.hours || 0), 0);
    const mWeekendViol = mine.reduce((a, e) => a + (e.weekendViolations || 0), 0);
    const mAppViol = mine.reduce((a, e) => a + (e.appViolations || 0), 0);
    const mViol = mWeekendViol + mAppViol;
    const tgt = activeRep ? monthTargetOf(pricing, activeRep.app) : null;
    const pct = tgt ? Math.round((mOrders / tgt) * 100) : null;
    const today = riyadhToday();
    const myClock = attendance.find((a) => a.key === activeRep?.nid && a.date === today);
    const myShift = (shifts || []).filter((s) => s.repId === activeRep?.nid && s.date === today).slice(-1)[0];
    const lb = computeLeaderboard(reps, reports, month);
    const myRank = activeRep ? lb.stats.findIndex((s) => s.rep.id === activeRep.id) + 1 : 0;
    return (
      <div className="space-y-4">
        <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(125deg,rgba(${A},.16),rgba(${A},.02) 60%)`, border: `1px solid rgba(${A},.32)` }}>
          <div className="absolute pointer-events-none rounded-full" style={{ width: 220, height: 220, insetInlineEnd: -80, top: -80, background: `radial-gradient(circle,rgba(${A},.22),transparent 70%)` }} />
          <RepHeroArt accent={A} />
          <div className="relative flex items-center gap-5 flex-wrap sm:flex-nowrap">
            {pct != null ? <ProgressRing pct={pct} accent={A} label={x.monthTarget} /> : <div className="shrink-0 text-center px-3"><div className="num text-[34px] font-extrabold leading-none">{mOrders}</div><div className="text-[10.5px] mt-1" style={{ color: "var(--muted)" }}>{x.ordersPart}</div></div>}
            <div className="flex-1 min-w-[160px]">
              <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: role.accent }}>{x.motivHeadline}</p>
              <p className="text-[14.5px] font-semibold leading-snug mt-1">{quote}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span><span className="num text-[17px] font-extrabold">{mOrders}</span><span className="text-[10.5px] block" style={{ color: "var(--muted)" }}>{x.ordersPart}</span></span>
                <span><span className="num text-[17px] font-extrabold">{mHours.toFixed(1)}</span><span className="text-[10.5px] block" style={{ color: "var(--muted)" }}>{t.h.time}</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl overflow-hidden" style={{ border: `1px solid ${myClock && !myClock.out ? "rgba(63,216,180,.4)" : "var(--line)"}` }}>
          <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--line)" }}>
            <span className="grid place-items-center w-11 h-11 rounded-2xl shrink-0" style={{ background: myClock && !myClock.out ? "rgba(63,216,180,.16)" : "rgba(20,27,45,.06)" }}>
              <Fingerprint size={20} style={{ color: myClock && !myClock.out ? "#3FD8B4" : "var(--muted)" }} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold">
                {myClock && !myClock.out ? x.alreadyClockedIn : myClock && myClock.out ? t.s.closed : x.notClockedIn}
              </p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                {myShift ? `${x.shiftWindow}: ${myShift.start} → ${myShift.end}` : x.noShiftToday} · {x.dammamTime}
              </p>
            </div>
            {myClock && !myClock.out && <span className="w-2 h-2 rounded-full pulse-dot shrink-0" style={{ background: "#3FD8B4" }} />}
          </div>
          <div className="p-4 flex items-center gap-3" style={{ background: "rgba(228,184,92,.06)", borderBottom: activeRep?.idExpiry ? "1px solid var(--line)" : "none" }}>
            <span className="grid place-items-center w-11 h-11 rounded-2xl shrink-0" style={{ background: "rgba(228,184,92,.18)" }}>
              <Trophy size={20} style={{ color: "#E4B85C" }} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold">{x.lbTitle}</p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>{x.lbYourRank}: <span className="num font-bold" style={{ color: "#F7E3B0" }}>#{myRank || "—"}</span> · {x.lbMotivate}</p>
            </div>
          </div>
          {activeRep?.idExpiry && (() => {
            const days = daysUntil(activeRep.idExpiry);
            const tier = iqamaTier(days);
            if (tier.key === "healthy") return null;
            return (
              <div className="p-4 flex items-center gap-3">
                <span className="grid place-items-center w-11 h-11 rounded-2xl shrink-0" style={{ background: "rgba(232,131,122,.14)" }}>
                  <ShieldAlert size={20} style={{ color: "#E8837A" }} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold">{x.iqamaT}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>{days} {x.daysLeft} · <Chip tone={tier.tone} sm>{x[tier.key]}</Chip></p>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Kpi label={x.violCol} value={String(mViol)} icon={AlertTriangle} accent={A} />
          <Kpi label={tgt ? x.monthTarget : x.ordersPart} value={String(tgt || mOrders)} icon={Target} accent={A} />
        </div>
      </div>
    );
  }

  const activeReps = reps.filter((r) => r.status === "active");
  const month = riyadhNow().toISOString().slice(0, 7);
  const carsOnShift = cars.filter((c) => c.st === "on_shift").length;
  const totalRevenue = invoices.filter((v) => v.st === "paid").reduce((a, v) => a + v.amt, 0);
  const totalExpenses = expenses.reduce((a, e) => a + e.v, 0);
  const invOpen = invoices.filter((v) => v.st === "pending").reduce((a, v) => a + v.amt, 0);
  const invOverdue = invoices.filter((v) => v.st === "overdue").reduce((a, v) => a + v.amt, 0);
  const activeContracts = contracts.filter((c) => c.st === "active").length;
  const expiringContracts = contracts.filter((c) => c.st === "expiring").length;
  const openCases = cases.filter((c) => c.st === "open").length;
  const pendingTk = tickets.filter((tk) => ticketVisibleToRole(tk, role.id) && tk.status === "open").length;
  const pendingApprovals = (approvalReqs || []).filter((a) => !a.status).length;
  const today = riyadhToday();
  const onDutyNow = attendance.filter((a) => a.date === today && a.in && !a.out).length;

  const K = {
    gm: [
      { l: t.k.revenue, v: money(totalRevenue), u: t.sar, i: CircleDollarSign },
      { l: t.k.profit, v: money(totalRevenue - totalExpenses), u: t.sar, i: TrendingUp },
      { l: t.k.contracts, v: String(activeContracts), i: FileSignature },
      { l: t.k.activeReps, v: String(activeReps.length), i: Bike },
      { l: t.k.cases, v: String(openCases), i: Gavel },
      { l: x.onDutyLive, v: String(onDutyNow), i: Fingerprint },
    ],
    opsm: [
      { l: t.k.activeReps, v: String(activeReps.length), i: Bike },
      { l: t.k.carsShift, v: String(carsOnShift), i: Car },
      { l: t.k.cars, v: String(cars.length), i: Car },
      { l: x.onDutyLive, v: String(onDutyNow), i: Fingerprint },
      { l: t.k.pending, v: String(pendingTk), i: Bell },
      { l: t.k.carsMaint, v: String(cars.filter((c) => c.st === "maint").length), i: SlidersHorizontal },
    ],
    ops: [
      { l: t.k.activeReps, v: String(activeReps.length), i: Bike },
      { l: t.k.carsShift, v: String(carsOnShift), i: Car },
      { l: x.onDutyLive, v: String(onDutyNow), i: Fingerprint },
      { l: t.k.pending, v: String(pendingTk), i: Bell },
    ],
    fin: [
      { l: t.k.revenue, v: money(totalRevenue), u: t.sar, i: CircleDollarSign },
      { l: t.k.expenses, v: money(totalExpenses), u: t.sar, i: Wallet },
      { l: t.k.profit, v: money(totalRevenue - totalExpenses), u: t.sar, i: TrendingUp },
      { l: t.k.partners, v: String(invoices.length), i: ReceiptText },
      { l: t.k.open, v: money(invOpen), u: t.sar, i: ReceiptText },
      { l: t.k.overdue, v: money(invOverdue), u: t.sar, i: AlertTriangle },
    ],
    hr: [
      { l: t.k.head, v: String(employees.length), i: Users },
      { l: t.k.activeReps, v: String(activeReps.length), i: Bike },
      { l: x.onDutyLive, v: String(onDutyNow), i: Fingerprint },
      { l: x.pendingReps, v: String(reps.filter((r) => r.status === "pending").length), i: ClipboardList },
      { l: t.k.pending, v: String(pendingTk), i: Bell },
    ],
    legal: [
      { l: t.k.contracts, v: String(activeContracts), i: FileSignature },
      { l: t.k.expiring, v: String(expiringContracts), i: Clock },
      { l: t.k.cases, v: String(openCases), i: Gavel },
      { l: x.compScore, v: contracts.length ? String(Math.round((activeContracts / contracts.length) * 100)) : "0", u: "%", i: ShieldCheck },
    ],
  }[role.id];

  const carData = ["on_shift", "idle", "maint"]
    .map((s, i) => ({ n: t.s[s], v: cars.filter((c) => c.st === s).length, c: ["#5BC8E8", "#8B9BF7", "#E4B85C"][i] }))
    .filter((d) => d.v > 0);

  const months6 = Array.from({ length: 6 }, (_, i) => { const d = riyadhNow(); d.setUTCMonth(d.getUTCMonth() - (5 - i)); return d.toISOString().slice(0, 7); });
  const REV_REAL = months6.map((m) => ({
    m: m.slice(5), v: +(invoices.filter((v) => v.due && v.due.startsWith(m)).reduce((a, v) => a + v.amt, 0) / 1000).toFixed(1),
    c: +(expenses.filter((e) => e.date && e.date.startsWith(m)).reduce((a, e) => a + e.v, 0) / 1000).toFixed(1),
  }));
  const days7 = Array.from({ length: 7 }, (_, i) => { const d = riyadhNow(); d.setUTCDate(d.getUTCDate() - (6 - i)); return d.toISOString().slice(0, 10); });
  const WEEK_REAL = days7.map((d) => ({ d: d.slice(8), v: attendance.filter((a) => a.date === d && a.in).length }));

  const alerts = [];
  invoices.filter((v) => v.st === "overdue").slice(0, 2).forEach((v) => alerts.push(lang === "ar" ? `فاتورة ${v.no} تجاوزت الاستحقاق` : lang === "en" ? `Invoice ${v.no} is overdue` : `انوائس ${v.no} کی مدت گزر گئی`));
  contracts.filter((c) => c.st === "expiring").slice(0, 2).forEach((c) => alerts.push(lang === "ar" ? `عقد ${c.party} ينتهي قريباً` : lang === "en" ? `${c.party}'s contract is expiring` : `${c.party} کا معاہدہ ختم ہونے والا ہے`));

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 flex items-center gap-3" style={{ background: `linear-gradient(100deg,rgba(${A},.12),rgba(${A},.03))`, border: `1px solid rgba(${A},.26)` }}>
        <span className="grid place-items-center w-11 h-11 rounded-2xl shrink-0" style={{ background: `rgba(${A},.16)` }}>
          <Users size={20} style={{ color: role.accent }} />
        </span>
        <div className="min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: role.accent }}>{x.staffMotivHeadline}</p>
          <p className="text-[13.5px] font-semibold leading-snug mt-0.5">{STAFF_MOTIVATION[lang][riyadhNow().getUTCDate() % STAFF_MOTIVATION[lang].length]}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <span />
        <button onClick={() => setCustomizing(!customizing)} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "var(--muted)" }}>
          <SlidersHorizontal size={12} />{x.customizeT}
        </button>
      </div>
      {customizing && (
        <div className="glass rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {K.map((k, i) => (
            <label key={i} className="flex items-center gap-2 text-[11.5px] cursor-pointer">
              <input type="checkbox" checked={!hiddenKpis.includes(i)} onChange={() => setHiddenKpis((prev) => prev.includes(i) ? prev.filter((h) => h !== i) : [...prev, i])} className="w-3.5 h-3.5" />
              {k.l}
            </label>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {K.map((k, i) => !hiddenKpis.includes(i) && <Kpi key={i} label={k.l} value={k.v} unit={k.u} icon={k.i} accent={A} />)}
      </div>


      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title={t.c.rev}
          extra={<Chip tone="ok" sm><span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />{t.live}</Chip>}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REV_REAL} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                <defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={role.accent} stopOpacity=".5" />
                  <stop offset="1" stopColor={role.accent} stopOpacity="0" />
                </linearGradient></defs>
                <CartesianGrid stroke="rgba(20,27,45,.06)" vertical={false} />
                <XAxis dataKey="m" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip {...TIP} />
                <Area type="monotone" dataKey="v" name={t.k.revenue + " (K)"} stroke={role.accent} strokeWidth={2.4} fill="url(#gv)" />
                <Line type="monotone" dataKey="c" name={t.k.expenses + " (K)"} stroke="rgba(30,38,58,.45)" strokeWidth={1.6} dot={false} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>


        {role.id === "fin" ? (
          <Panel title={t.c.exp}>
            {totalExpenses === 0 ? <EmptyHint lang={lang} /> : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.keys(EXP_LABEL).map((k) => ({ n: EXP_LABEL[k][lang], v: +(expenses.filter((e) => e.k === k).reduce((a, e) => a + e.v, 0) / 1000).toFixed(1) })).filter((d) => d.v > 0)} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(20,27,45,.06)" vertical={false} />
                    <XAxis dataKey="n" tick={{ ...AXIS, fontSize: 8 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                    <Tooltip {...TIP} />
                    <Bar dataKey="v" name={t.sar + " K"} radius={[8, 8, 2, 2]} fill={role.accent} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        ) : role.id === "hr" ? (
          <Panel title={t.c.attend}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEK_REAL} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(20,27,45,.06)" vertical={false} />
                  <XAxis dataKey="d" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...TIP} />
                  <Line type="monotone" dataKey="v" name={x.onDutyLive} stroke={role.accent} strokeWidth={2.6} dot={{ r: 3, fill: role.accent, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        ) : role.id === "legal" ? (
          <Panel title={t.c.cases}>
            {cases.length === 0 ? <EmptyHint lang={lang} /> : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={["open", "review", "closed"].map((s) => ({ n: t.s[s], v: cases.filter((c) => c.st === s).length }))} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(20,27,45,.06)" vertical={false} />
                    <XAxis dataKey="n" tick={{ ...AXIS, fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...TIP} />
                    <Bar dataKey="v" name={t.nav.cases} radius={[8, 8, 2, 2]} fill={role.accent} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        ) : (role.id === "opsm" || role.id === "ops") ? (
          <Panel title={t.c.cars}>
            {carData.length === 0 ? <EmptyHint lang={lang} /> : (
              <>
                <div className="h-56 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={carData} dataKey="v" nameKey="n" innerRadius="58%" outerRadius="88%" paddingAngle={3} stroke="none">
                        {carData.map((d, i) => <Cell key={i} fill={d.c} />)}
                      </Pie>
                      <Tooltip {...TIP} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 grid place-items-center pointer-events-none">
                    <div className="text-center">
                      <div className="num text-[22px] font-bold">{cars.length}</div>
                      <div className="text-[10px]" style={{ color: "var(--muted)" }}>{t.k.cars}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {carData.map((d) => (
                    <span key={d.n} className="flex items-center gap-1.5 text-[10.5px]" style={{ color: "var(--muted)" }}>
                      <i className="w-2 h-2 rounded-full" style={{ background: d.c }} />{d.n}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Panel>
        ) : (
          <Panel title={t.k.contracts}>
            {contracts.length === 0 ? <EmptyHint lang={lang} /> : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={["active", "expiring", "review", "closed"].map((s) => ({ n: t.s[s], v: contracts.filter((c) => c.st === s).length }))} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(20,27,45,.06)" vertical={false} />
                    <XAxis dataKey="n" tick={{ ...AXIS, fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...TIP} />
                    <Bar dataKey="v" name={t.k.contracts} radius={[8, 8, 2, 2]} fill={role.accent} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        )}
      </div>


      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title={t.alerts}>
          {alerts.length === 0 ? <EmptyHint lang={lang} /> : (
            <div className="space-y-2.5 mt-1">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl p-2.5" style={{ background: "rgba(20,27,45,.035)" }}>
                  <span className="grid place-items-center w-7 h-7 rounded-lg shrink-0" style={{ background: "rgba(228,184,92,.12)", border: "1px solid rgba(228,184,92,.25)" }}>
                    <AlertTriangle size={13} style={{ color: "var(--gold)" }} />
                  </span>
                  <p className="text-[12px] leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
        {(role.id === "gm" || role.id === "opsm") && (
          <Panel title={x.gmOversight}>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} style={{ color: role.accent }} className="mt-0.5 shrink-0" />
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--muted)" }}>{x.fullControlNote}</p>
            </div>
          </Panel>
        )}
      </div>

      {(role.id === "opsm" || role.id === "hr" || role.id === "gm") && (
        <RepPerformanceAnalytics lang={lang} role={role} reps={reps} />
      )}
    </div>
  );
}

/* ═══════════  نموذج إضافة سريع (عام)  ═══════════ */
/* ═══════════  نموذج إضافة سريع (عام)  ═══════════ */
function QuickAddPanel({ lang, role, title, icon: Icon, fields, onSubmit, submitLabel }) {
  const x = EX[lang];
  const init = () => Object.fromEntries(fields.map((f) => [f.key, f.type === "select" ? f.options[0].value : f.type === "file" ? null : ""]));
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState(init);
  const [names, setNames] = useState({});
  const [types, setTypes] = useState({});
  const set = (k) => (v) => setVals((p) => ({ ...p, [k]: v }));
  const onFile = (k) => (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setNames((p) => ({ ...p, [k]: file.name }));
    setTypes((p) => ({ ...p, [k]: file.type }));
    const reader = new FileReader();
    reader.onload = () => set(k)(reader.result);
    reader.readAsDataURL(file);
  };
  const submit = () => {
    if (fields.some((f) => f.required && f.type !== "file" && !String(vals[f.key] || "").trim())) return;
    onSubmit({ ...vals, __fileNames: names, __fileTypes: types });
    setVals(init());
    setNames({});
    setTypes({});
    setOpen(false);
  };
  if (!open) return <Btn variant="gold" icon={Plus} onClick={() => setOpen(true)}>{title}</Btn>;
  return (
    <Panel title={title} extra={Icon ? <Icon size={16} style={{ color: role.accent }} /> : null}>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => f.type === "select" ? (
          <label key={f.key} className="block">
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{f.label}</span>
            <select value={vals[f.key]} onChange={(e) => set(f.key)(e.target.value)}
              className="w-full rounded-xl px-3 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }}>
              {f.options.map((o) => <option key={o.value} value={o.value} style={{ background: "#FFFFFF" }}>{o.label}</option>)}
            </select>
          </label>
        ) : f.type === "file" ? (
          <label key={f.key} className="block">
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{f.label}</span>
            <span className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 cursor-pointer" style={{ background: "rgba(0,0,0,.22)", border: `1px dashed ${vals[f.key] ? role.accent : "var(--line)"}` }}>
              <Paperclip size={16} style={{ color: vals[f.key] ? role.accent : "var(--muted)" }} />
              <span className="text-[12px] font-semibold truncate" style={{ color: vals[f.key] ? role.accent : "var(--muted)" }}>{names[f.key] || x.attachFile}</span>
              <input type="file" className="hidden" onChange={onFile(f.key)} />
            </span>
          </label>
        ) : (
          <GateField key={f.key} label={f.label} val={vals[f.key]} set={set(f.key)} ph={f.ph || ""} Icon={f.icon || ClipboardList} type={f.type || "text"} accent={role.accent} />
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Btn onClick={() => setOpen(false)}>{x.cancel}</Btn>
        <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={submit}>{submitLabel || x.save}</Btn>
      </div>
    </Panel>
  );
}

function EmptyHint({ lang, variant = "box" }) {
  const paths = {
    box: <path d="M8 26 L32 26 L32 46 L8 46 Z M8 26 L20 14 L44 14 L32 26 M32 26 L44 26 L44 46 L32 46 M20 14 L20 26" />,
    mail: <path d="M8 16 L52 16 L52 44 L8 44 Z M8 16 L30 34 L52 16" />,
    people: <><circle cx="22" cy="20" r="8" /><circle cx="42" cy="24" r="6" /><path d="M8 46 C8 34 16 30 22 30 C28 30 36 34 36 46 M32 46 C32 38 36 34 42 34 C46 34 52 37 52 46" /></>,
  };
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="rgba(30,38,58,.28)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {paths[variant] || paths.box}
      </svg>
      <p className="text-[12px]" style={{ color: "var(--muted)" }}>{EX[lang].noRecords}</p>
    </div>
  );
}

function OrdersPage({ lang, role, orders, setOrders }) {
  const t = T[lang], x = EX[lang];
  const zoneOpts = Object.keys(ZN).map((k) => ({ value: k, label: ZN[k][lang] }));
  const payOpts = [{ value: "cash", label: x.pay.cash }, { value: "card", label: x.pay.card }, { value: "online", label: x.pay.online }];
  const statusOpts = ["new", "preparing", "picked", "on_way", "delivered", "late", "canceled"].map((s) => ({ value: s, label: t.s[s] }));
  const add = (v) => setOrders((prev) => [{ id: "BQ-" + (40000 + prev.length + Math.floor(Math.random() * 900)),
    restaurant: v.restaurant, z: v.z, st: v.st, m: +v.m || 0, v: +v.value || 0, p: v.p, createdAt: riyadhNow().toISOString() }, ...prev]);
  return (
    <div className="space-y-4">
      <QuickAddPanel lang={lang} role={role} title={x.addOrder} icon={ShoppingBag} submitLabel={x.save} onSubmit={add}
        fields={[
          { key: "restaurant", label: x.orderRestaurant, required: true, icon: Store },
          { key: "z", label: x.orderZone, type: "select", options: zoneOpts },
          { key: "st", label: t.h.status, type: "select", options: statusOpts },
          { key: "value", label: x.orderValue, type: "number", icon: CircleDollarSign },
          { key: "m", label: t.h.time, type: "number", icon: Timer },
          { key: "p", label: x.orderPay, type: "select", options: payOpts },
        ]} />
      <Panel title={t.nav.orders} extra={<Btn icon={SlidersHorizontal}>{t.filter}</Btn>}>
        {orders.length === 0 ? <EmptyHint lang={lang} /> : (
          <DataTable
            headers={[t.h.order, t.h.restaurant, t.h.zone, t.h.status, t.h.time, t.h.value, t.h.pay]}
            rows={orders.map((o) => ({
              key: o.id,
              cells: [
                { v: o.id, mono: 1 }, { v: o.restaurant }, { v: zn(o.z, lang), dim: 1 },
                { chip: { tone: TONE[o.st], label: t.s[o.st] } },
                { v: `${o.m} ${t.min}`, mono: 1 }, { v: `${o.v} ${t.sar}`, mono: 1, strong: 1 },
                { v: x.pay[o.p], dim: 1 },
              ],
            }))} />
        )}
      </Panel>
    </div>
  );
}

function CarsPage({ lang, role, cars, setCars }) {
  const t = T[lang], x = EX[lang];
  const statusOpts = ["on_shift", "idle", "maint"].map((s) => ({ value: s, label: t.s[s] }));
  const add = (v) => setCars((prev) => [...prev, { plate: v.plate, c: v.model, st: v.st, km: +v.km || 0, last: riyadhToday() }]);
  const onShift = cars.filter((c) => c.st === "on_shift").length;
  const maint = cars.filter((c) => c.st === "maint").length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label={t.k.cars} value={String(cars.length)} icon={Car} accent={role.glow} />
        <Kpi label={t.k.carsShift} value={String(onShift)} icon={Navigation} accent={role.glow} />
        <Kpi label={t.k.carsMaint} value={String(maint)} icon={SlidersHorizontal} accent={role.glow} />
        <Kpi label={t.k.fuel} value={money(cars.reduce((a, c) => a + (c.km || 0) * 0.35, 0))} unit={t.sar} icon={Fuel} accent={role.glow} />
      </div>
      <QuickAddPanel lang={lang} role={role} title={x.addCar} icon={Car} onSubmit={add}
        fields={[
          { key: "plate", label: x.carPlate, required: true },
          { key: "model", label: x.carModel, required: true },
          { key: "st", label: t.h.status, type: "select", options: statusOpts },
          { key: "km", label: "KM", type: "number" },
        ]} />
      <Panel title={t.nav.cars} extra={<Btn icon={Download}>{t.export}</Btn>}>
        {cars.length === 0 ? <EmptyHint lang={lang} /> : (
          <DataTable
            headers={[t.h.plate, t.h.car, t.h.status, t.h.last, "KM"]}
            rows={cars.map((c) => ({
              key: c.plate,
              onDelete: () => setCars((prev) => prev.filter((x2) => x2.plate !== c.plate)),
              cells: [
                { v: c.plate, mono: 1 }, { v: c.c }, { chip: { tone: TONE[c.st], label: t.s[c.st] } },
                { v: c.last, mono: 1 }, { v: fmt(c.km), mono: 1 },
              ],
            }))} />
        )}
      </Panel>
    </div>
  );
}

function ZonesPage({ lang, role, orders }) {
  const t = T[lang], x = EX[lang];
  const zones = Object.keys(ZN).map((k) => {
    const inZone = orders.filter((o) => o.z === k);
    const avgMin = inZone.length ? Math.round(inZone.reduce((a, o) => a + (o.m || 0), 0) / inZone.length) : 0;
    return { z: k, v: inZone.length, min: avgMin };
  });
  const maxV = Math.max(1, ...zones.map((z) => z.v));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {zones.map((z) => {
        const load = Math.round((z.v / maxV) * 100);
        return (
          <Panel key={z.z} title={zn(z.z, lang)} extra={<Chip tone={load > 85 ? "bad" : load > 60 ? "warn" : "ok"} sm>{load}%</Chip>}>
            <div className="scene">
              <div className="card3d relative rounded-xl h-24 overflow-hidden" style={{ background: "rgba(20,27,45,.04)", border: "1px solid var(--line)" }}>
                <div className="absolute bottom-0 left-0 right-0 bar-in" style={{ height: `${load}%`, transformOrigin: "bottom", background: `linear-gradient(to top,rgba(${role.glow},.55),rgba(${role.glow},.08))` }} />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="num text-[22px] font-bold">{fmt(z.v)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2.5 text-[11px]" style={{ color: "var(--muted)" }}>
              <span>{x.orders} · {x.capacity}</span>
              <span className="num">{x.avgZone}: {z.min} {t.min}</span>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function RestaurantsPage({ lang, role, restaurants, setRestaurants }) {
  const t = T[lang], x = EX[lang];
  const zoneOpts = Object.keys(ZN).map((k) => ({ value: k, label: ZN[k][lang] }));
  const add = (v) => setRestaurants((prev) => [...prev, { id: "RS-" + Date.now(), name: v.name, z: v.z }]);
  return (
    <div className="space-y-4">
      <QuickAddPanel lang={lang} role={role} title={x.addRestaurant} icon={Store} onSubmit={add}
        fields={[
          { key: "name", label: x.orderRestaurant, required: true, icon: Store },
          { key: "z", label: x.orderZone, type: "select", options: zoneOpts },
        ]} />
      {restaurants.length === 0 ? <EmptyHint lang={lang} /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <div key={r.id} className="glass card3d rounded-2xl p-4 relative overflow-hidden">
              <div className="sheen" />
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.13)`, border: `1px solid rgba(${role.glow},.28)` }}>
                  <Store size={17} style={{ color: role.accent }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold truncate">{r.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>{zn(r.z, lang)}</div>
                </div>
                <button onClick={() => setRestaurants((prev) => prev.filter((x2) => x2.id !== r.id))} className="p-1.5 rounded-lg shrink-0" style={{ color: "#E8837A" }} aria-label="delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvoicesPage({ lang, role, invoices, setInvoices, expenses, payrollRuns, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const statusOpts = [{ value: "review", label: x.invStatusReview }, { value: "paid", label: x.invStatusPaid }];
  const [viewDoc, setViewDoc] = useState(null);

  const add = (v) => {
    const entry = { no: "INV-" + Date.now().toString().slice(-8), app: v.app, amt: +v.amt || 0, date: riyadhToday(), st: v.st,
      attachment: v.doc || null, attachmentType: (v.__fileTypes && v.__fileTypes.doc) || "", attachmentName: (v.__fileNames && v.__fileNames.doc) || "",
      uploadedBy: actingEmployee?.name || role.id };
    setInvoices((prev) => [entry, ...prev]);
    logAudit(setAuditLog, role, "app_invoice_upload", `${APPS.find((a) => a.id === v.app)?.[lang] || v.app}: ${v.amt}`, actingEmployee);
  };

  const appName = (id) => APPS.find((a) => a.id === id)?.[lang] || id;
  const totalReview = invoices.filter((v) => v.st === "review").reduce((a, v) => a + v.amt, 0);
  const totalPaid = invoices.filter((v) => v.st === "paid").reduce((a, v) => a + v.amt, 0);

  const approvedExpenses = expenses.filter((e) => e.status === "approved" || !e.status).reduce((a, e) => a + e.v, 0);
  const approvedPayroll = payrollRuns.filter((r) => r.status === "approved").reduce((a, r) => a + r.totalPayroll, 0);
  const netResult = totalPaid - approvedExpenses - approvedPayroll;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label={x.invStatusReview} value={money(totalReview)} unit={t.sar} icon={ReceiptText} accent={role.glow} />
        <Kpi label={x.invStatusPaid} value={money(totalPaid)} unit={t.sar} icon={CheckCircle2} accent="15,165,121" />
        <Kpi label={x.invTotalExpenses} value={money(approvedExpenses)} unit={t.sar} icon={Wallet} accent="214,88,77" />
        <Kpi label={x.invTotalPayroll} value={money(approvedPayroll)} unit={t.sar} icon={CircleDollarSign} accent="214,88,77" />
      </div>

      <div className="glass rounded-2xl p-5 relative overflow-hidden" style={{ background: netResult >= 0 ? "linear-gradient(100deg,rgba(15,165,121,.14),rgba(15,165,121,.02))" : "linear-gradient(100deg,rgba(214,88,77,.14),rgba(214,88,77,.02))", border: `1px solid ${netResult >= 0 ? "rgba(15,165,121,.35)" : "rgba(214,88,77,.35)"}` }}>
        <div className="flex items-center gap-3">
          {netResult >= 0 ? <TrendingUp size={26} style={{ color: "#0FA579" }} /> : <TrendingDown size={26} style={{ color: "#D6584D" }} />}
          <div>
            <p className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>{x.invNetResultT}</p>
            <p className="num text-[24px] font-extrabold" style={{ color: netResult >= 0 ? "#0FA579" : "#D6584D" }}>{netResult >= 0 ? "+" : ""}{money(netResult)} {t.sar}</p>
            <p className="text-[10.5px] mt-1" style={{ color: "var(--muted)" }}>{x.invStatusPaid}: {money(totalPaid)} − {x.invTotalExpenses}: {money(approvedExpenses)} − {x.invTotalPayroll}: {money(approvedPayroll)}</p>
          </div>
        </div>
      </div>

      <QuickAddPanel lang={lang} role={role} title={x.addAppInvoice} icon={ReceiptText} onSubmit={add}
        fields={[
          { key: "app", label: x.invApp, type: "select", required: true, options: APPS.map((a) => ({ value: a.id, label: a[lang] })) },
          { key: "amt", label: t.h.amount, type: "number", required: true },
          { key: "st", label: t.h.status, type: "select", options: statusOpts },
          { key: "doc", label: x.invoiceAttach, type: "file" },
        ]} />

      <Panel title={t.nav.invoices}>
        {invoices.length === 0 ? <EmptyHint lang={lang} /> : (
          <DataTable
            headers={[t.h.invoice, x.invApp, t.h.amount, x.invMonth, t.h.status, x.invoiceAttach]}
            rows={invoices.map((v) => ({
              key: v.no,
              onDelete: () => setInvoices((prev) => prev.filter((x2) => x2.no !== v.no)),
              cells: [
                { v: v.no, mono: 1 }, { v: appName(v.app) }, { v: fmt(v.amt), mono: 1, strong: 1 },
                { v: v.date, mono: 1, dim: 1 }, { chip: { tone: v.st === "paid" ? "ok" : "warn", label: v.st === "paid" ? x.invStatusPaid : x.invStatusReview } },
                { custom: v.attachment ? (
                  <button onClick={() => setViewDoc(v)} className="flex items-center gap-1 text-[11px] font-bold" style={{ color: role.accent }}>📎 {x.viewPdfBtn}</button>
                ) : <span style={{ color: "var(--muted)" }}>—</span> },
              ],
            }))}
            onBulkDelete={(keys) => setInvoices((prev) => prev.filter((v) => !keys.includes(v.no)))} />
        )}
      </Panel>

      {viewDoc && (
        <div className="fixed inset-0 z-[95] grid place-items-center p-6" style={{ background: "rgba(10,14,25,.85)" }} onClick={() => setViewDoc(null)}>
          {viewDoc.attachmentType === "application/pdf" ? (
            <iframe title="invoice-pdf" src={viewDoc.attachment} className="w-full h-full max-w-3xl rounded-2xl bg-white" onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={viewDoc.attachment} alt="" className="max-w-full max-h-full rounded-2xl" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </div>
  );
}

const EXPENSE_APPROVAL_THRESHOLD = 1000; // فوق هذا المبلغ لازم اعتماد المدير العام، تحته المالية تعتمد لحالها

function ExpensesPage({ lang, role, expenses, setExpenses, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const catOpts = Object.keys(EXP_LABEL).map((k) => ({ value: k, label: EXP_LABEL[k][lang] }));
  const [form, setForm] = useState({ k: "fuel", amt: "", reason: "", photo: null, photoType: "" });
  const [err, setErr] = useState("");
  const [viewPhoto, setViewPhoto] = useState(null);

  const onPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result, photoType: file.type }));
    reader.readAsDataURL(file);
  };

  const submit = () => {
    const amt = +form.amt || 0;
    if (amt <= 0) return setErr(x.errExpAmount);
    if (form.reason.trim().length < 8) return setErr(x.errExpReason);
    if (amt > EXPENSE_APPROVAL_THRESHOLD && !form.photo) return setErr(x.errExpNeedsReceipt);
    setErr("");
    const needsGm = amt > EXPENSE_APPROVAL_THRESHOLD;
    const entry = { id: "EXP-" + Date.now(), k: form.k, v: amt, reason: form.reason.trim(), date: riyadhToday(),
      photo: form.photo, photoType: form.photoType, submittedBy: actingEmployee?.name || role.id, status: needsGm ? "pending" : "approved",
      approvedBy: needsGm ? null : (actingEmployee?.name || role.id), approvedAt: needsGm ? null : riyadhNow().toISOString() };
    setExpenses((prev) => [entry, ...prev]);
    logAudit(setAuditLog, role, "expense_add", `${EXP_LABEL[form.k][lang]}: ${amt} — ${form.reason.slice(0, 40)}`, actingEmployee);
    setForm({ k: "fuel", amt: "", reason: "", photo: null, photoType: "" });
  };

  const decide = (id, status) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status, approvedBy: actingEmployee?.name || role.id, approvedAt: riyadhNow().toISOString() } : e)));
    logAudit(setAuditLog, role, "expense_" + status, id, actingEmployee);
  };

  const approved = expenses.filter((e) => e.status === "approved" || !e.status);
  const pending = expenses.filter((e) => e.status === "pending");
  const rejected = expenses.filter((e) => e.status === "rejected");
  const total = approved.reduce((a, b) => a + b.v, 0);
  const byCat = Object.keys(EXP_LABEL).map((k) => ({ k, v: approved.filter((e) => e.k === k).reduce((a, e) => a + e.v, 0) }));
  const canApprove = role.id === "gm";

  return (
    <div className="space-y-4">
      <Panel title={t.k.expense}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{t.c.exp}</span>
            <select value={form.k} onChange={(e) => setForm((f) => ({ ...f, k: e.target.value }))}
              className="w-full rounded-xl px-3 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#fff" }}>
              {catOpts.map((o) => <option key={o.value} value={o.value} style={{ background: "#0A0F1C" }}>{o.label}</option>)}
            </select>
          </label>
          <GateField label={t.h.amount} val={form.amt} set={(v) => setForm((f) => ({ ...f, amt: v }))} ph="0" Icon={CircleDollarSign} type="number" accent={role.accent} />
        </div>
        <label className="block mt-3">
          <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.expReasonLbl} <span style={{ color: "#D6584D" }}>*</span></span>
          <textarea value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} rows={2}
            placeholder={x.expReasonPh}
            className="w-full rounded-xl px-3.5 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#EAF0FF" }} />
        </label>
        {form.amt > EXPENSE_APPROVAL_THRESHOLD && (
          <p className="text-[10.5px] mt-2 flex items-center gap-1.5" style={{ color: "#B8862E" }}><AlertTriangle size={12} />{x.expNeedsGm}</p>
        )}
        <label className="block mt-3">
          <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>
            {x.expReceiptLbl} {form.amt > EXPENSE_APPROVAL_THRESHOLD && <span style={{ color: "#D6584D" }}>*</span>}
          </span>
          <span className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 cursor-pointer" style={{ background: "rgba(0,0,0,.22)", border: `1px dashed ${form.photo ? role.accent : "var(--line)"}` }}>
            {form.photo ? (
              form.photoType === "application/pdf"
                ? <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: `${role.accent}22` }}><FileSignature size={16} style={{ color: role.accent }} /></span>
                : <img src={form.photo} alt="" className="w-9 h-9 rounded-lg object-cover" />
            ) : <ImagePlus size={16} style={{ color: "var(--muted)" }} />}
            <span className="text-[12px] font-semibold" style={{ color: form.photo ? role.accent : "var(--muted)" }}>{form.photo ? x.uploaded : x.attachFile}</span>
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onPhoto} />
          </span>
        </label>
        {err && <p className="mt-2 text-[11.5px]" style={{ color: "#D6584D" }}>{err}</p>}
        <div className="mt-3"><Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={submit}>{x.save}</Btn></div>
      </Panel>

      {viewPhoto && (
        <div className="fixed inset-0 z-[95] grid place-items-center p-6" style={{ background: "rgba(10,14,25,.85)" }} onClick={() => setViewPhoto(null)}>
          {viewPhoto.type === "application/pdf" ? (
            <iframe title="receipt-pdf" src={viewPhoto.data} className="w-full h-full max-w-3xl rounded-2xl bg-white" onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={viewPhoto.data} alt="" className="max-w-full max-h-full rounded-2xl" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}

      {canApprove && pending.length > 0 && (
        <Panel title={x.expPendingGmT}>
          <div className="space-y-2.5">
            {pending.map((e) => (
              <div key={e.id} className="rounded-2xl p-3.5" style={{ background: "rgba(228,184,92,.06)", border: "1px solid rgba(228,184,92,.25)" }}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[13px] font-bold">{EXP_LABEL[e.k][lang]}</span>
                  <span className="num font-bold" style={{ color: "#B8862E" }}>{money(e.v)} {t.sar}</span>
                </div>
                <p className="text-[11.5px] mb-2.5" style={{ color: "var(--muted)" }}>{e.reason} — {x.submittedByLbl}: {e.submittedBy}</p>
                  {e.photo && (
                    e.photoType === "application/pdf"
                      ? <button onClick={() => setViewPhoto({ data: e.photo, type: e.photoType })} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-2.5 text-[11px] font-bold" style={{ background: `${role.accent}18`, color: role.accent }}><FileSignature size={13} />{x.viewPdfBtn}</button>
                      : <img src={e.photo} alt="" className="w-14 h-14 rounded-lg object-cover mb-2.5 cursor-pointer" onClick={() => setViewPhoto({ data: e.photo, type: e.photoType })} />
                  )}
                <div className="flex gap-2">
                  <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => decide(e.id, "approved")}>{x.approvedLbl}</Btn>
                  <Btn variant="danger" icon={X} onClick={() => decide(e.id, "rejected")}>{x.rejectedLbl}</Btn>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title={t.c.exp} extra={<span className="num text-[12px]" style={{ color: "var(--muted)" }}>{money(total)} {t.sar}</span>}>
        {total === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-3 mt-1">
            {byCat.filter((e) => e.v > 0).map((e) => (
              <div key={e.k} className="flex items-center gap-3">
                <span className="text-[12px] w-28 shrink-0 truncate">{EXP_LABEL[e.k][lang]}</span>
                <span className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(20,27,45,.06)" }}>
                  <span className="block h-full bar-in rounded-full" style={{ width: `${(e.v / total) * 100}%`, background: `linear-gradient(90deg,rgba(${role.glow},.4),${role.accent})`, transformOrigin: "left" }} />
                </span>
                <span className="num text-[12px] w-14 text-end">{money(e.v)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title={x.expLedgerT}>
        {expenses.length === 0 ? <EmptyHint lang={lang} /> : (
          <DataTable
            headers={[t.c.exp, t.h.amount, x.expReasonLbl, x.submittedByLbl, x.statusLbl, x.expReceiptLbl]}
            rows={expenses.map((e) => ({
              key: e.id,
              cells: [
                { v: EXP_LABEL[e.k][lang] }, { v: money(e.v) + " " + t.sar, mono: 1, strong: 1 },
                { v: e.reason || "—", dim: 1 }, { v: e.submittedBy || "—", dim: 1 },
                { v: e.status === "approved" || !e.status ? x.approvedLbl : e.status === "rejected" ? x.rejectedLbl : x.pendingLbl },
                { custom: e.photo ? (
                  e.photoType === "application/pdf"
                    ? <button onClick={() => setViewPhoto({ data: e.photo, type: e.photoType })} className="w-9 h-9 rounded-lg grid place-items-center" style={{ background: `${role.accent}18` }}><FileSignature size={14} style={{ color: role.accent }} /></button>
                    : <img src={e.photo} alt="" className="w-9 h-9 rounded-lg object-cover cursor-pointer" onClick={() => setViewPhoto({ data: e.photo, type: e.photoType })} />
                ) : <span style={{ color: "var(--muted)" }}>—</span> },
              ],
            }))} />
        )}
      </Panel>
    </div>
  );
}

/* ═══════════  تقويم الشفتات البصري  ═══════════ */
function ShiftCalendar({ lang, role, shifts, attendance }) {
  const x = EX[lang];
  const now = riyadhNow();
  const y = now.getUTCFullYear(), m = now.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const firstDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const todayDate = now.getUTCDate();
  const byDate = {};
  shifts.forEach((s) => { const d = +s.date.slice(8, 10); byDate[d] = byDate[d] || { shift: null, clock: null }; byDate[d].shift = s; });
  attendance.forEach((a) => { if (+a.date.slice(5, 7) === m + 1) { const d = +a.date.slice(8, 10); byDate[d] = byDate[d] || { shift: null, clock: null }; byDate[d].clock = a; } });
  const weekDayLabels = lang === "ar" ? ["أحد", "اثن", "ثلا", "أرب", "خمي", "جمع", "سبت"] : lang === "ur" ? ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {weekDayLabels.map((w) => <div key={w} className="text-center text-[9.5px] font-bold" style={{ color: "var(--muted)" }}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (d == null) return <div key={i} />;
          const info = byDate[d];
          const isToday = d === todayDate;
          let bg = "rgba(20,27,45,.03)", border = "var(--line)", dot = null;
          if (info?.clock && info.clock.out) { bg = "rgba(79,209,165,.14)"; border = "rgba(79,209,165,.35)"; dot = "#4FD1A5"; }
          else if (info?.clock && !info.clock.out) { bg = "rgba(63,216,180,.16)"; border = "rgba(63,216,180,.4)"; dot = "#3FD8B4"; }
          else if (info?.shift) { bg = "rgba(228,184,92,.12)"; border = "rgba(228,184,92,.35)"; dot = "#E4B85C"; }
          return (
            <div key={i} className="aspect-square rounded-lg flex flex-col items-center justify-center relative"
              style={{ background: bg, border: `1px solid ${isToday ? role.accent : border}` }}>
              <span className="num text-[10.5px] font-bold">{d}</span>
              {dot && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ background: dot }} />}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        <span className="flex items-center gap-1.5 text-[10.5px]" style={{ color: "var(--muted)" }}><i className="w-2 h-2 rounded-full" style={{ background: "#E4B85C" }} />{x.shiftWindow}</span>
        <span className="flex items-center gap-1.5 text-[10.5px]" style={{ color: "var(--muted)" }}><i className="w-2 h-2 rounded-full" style={{ background: "#3FD8B4" }} />{x.onDutyLive}</span>
        <span className="flex items-center gap-1.5 text-[10.5px]" style={{ color: "var(--muted)" }}><i className="w-2 h-2 rounded-full" style={{ background: "#4FD1A5" }} />{x.alreadyClockedIn}</span>
      </div>
    </div>
  );
}

function SelfieCapture({ x, role, onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const [shot, setShot] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (!alive) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; setReady(true); }
      } catch { if (alive) setErr(x.cameraDenied); }
    })();
    return () => { alive = false; if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line
  }, []);

  const takeShot = () => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setShot(canvas.toDataURL("image/jpeg", .85));
  };
  const confirm = () => { if (shot) onCapture(shot); };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center px-5" style={{ background: "rgba(3,5,10,.86)", backdropFilter: "blur(6px)" }}>
      <div className="glass rounded-3xl p-5 w-full max-w-sm rise" style={{ background: "#fff" }}>
        <div className="flex items-center gap-2 mb-3">
          <Camera size={17} style={{ color: role.accent }} />
          <h3 className="text-[14.5px] font-extrabold">{x.selfieRequired}</h3>
        </div>
        <div className="relative rounded-2xl overflow-hidden aspect-square" style={{ background: "#0A0D14" }}>
          {shot ? (
            <img src={shot} alt="" className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
          )}
          <canvas ref={canvasRef} className="hidden" />
          {!ready && !shot && !err && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-[11.5px]" style={{ color: "rgba(255,255,255,.7)" }}>{x.cameraLoading}</span>
            </div>
          )}
        </div>
        {err && <p className="mt-3 text-[11.5px] flex items-start gap-1.5" style={{ color: "#D6584D" }}><AlertTriangle size={13} className="mt-px shrink-0" />{err}</p>}
        <div className="flex gap-2 mt-4">
          <Btn full onClick={onCancel}>{x.cancel}</Btn>
          {shot ? (
            <>
              <Btn onClick={() => setShot(null)}>{x.retake}</Btn>
              <Btn full variant="accent" accent={role.glow} icon={CheckCircle2} onClick={confirm}>{x.confirmClockIn}</Btn>
            </>
          ) : (
            <Btn full variant="gold" icon={Camera} onClick={takeShot} disabled={!ready}>{x.captureSelfie}</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendancePage({ lang, role, user, activeRep, attendance, setAttendance, shifts, employees, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const isRep = role.id === "rep";
  const today = riyadhToday();
  const nowTime = () => riyadhTimeHM();
  const myKey = isRep ? user : role.id + ":" + user;
  const myToday = attendance.find((a) => a.key === myKey && a.date === today);
  const [justDid, setJustDid] = useState(null);
  const [showSelfie, setShowSelfie] = useState(false);

  const doClockIn = (selfie) => {
    const at = nowTime();
    const who = isRep ? (activeRep ? (lang === "en" ? activeRep.en : activeRep.ar) : user) : role[lang].t;
    setAttendance((prev) => [...prev, { key: myKey, role: role.id, name: who, date: today, in: at, out: null, selfie: selfie || null }]);
    logAudit(setAuditLog, role, "attendance_clock_in", `${isRep ? user : (actingEmployee?.name || role[lang].t)} @ ${at}`, actingEmployee);
    setJustDid({ type: "in", at });
    setShowSelfie(false);
    setTimeout(() => setJustDid(null), 4000);
  };
  const clockIn = () => { if (isRep) doClockIn(null); else setShowSelfie(true); };
  const clockOut = () => {
    const at = nowTime();
    setAttendance((prev) => prev.map((a) => (a.key === myKey && a.date === today ? { ...a, out: at } : a)));
    logAudit(setAuditLog, role, "attendance_clock_out", `${isRep ? user : (actingEmployee?.name || role[lang].t)} @ ${at}`, actingEmployee);
    setJustDid({ type: "out", at });
    setTimeout(() => setJustDid(null), 4000);
  };
  const duration = (a) => {
    if (!a.out) return null;
    const [ih, im] = a.in.split(":").map(Number), [oh, om] = a.out.split(":").map(Number);
    let mins = (oh * 60 + om) - (ih * 60 + im);
    if (mins < 0) mins += 24 * 60;
    return `${Math.floor(mins / 60)}${lang === "ar" ? "س" : "h"} ${mins % 60}${lang === "ar" ? "د" : "m"}`;
  };

  const myLog = attendance.filter((a) => a.key === myKey).slice(-10).reverse();
  const onDuty = attendance.filter((a) => a.date === today && a.in && !a.out);

  return (
    <div className="space-y-4">
      {showSelfie && <SelfieCapture x={x} role={role} onCapture={doClockIn} onCancel={() => setShowSelfie(false)} />}
      {justDid && (
        <div className="glass rounded-2xl p-4 flex items-center gap-3 rise" style={{ background: "rgba(63,216,180,.12)", border: "1px solid rgba(63,216,180,.4)" }}>
          <span className="grid place-items-center w-11 h-11 rounded-2xl shrink-0" style={{ background: "rgba(63,216,180,.2)" }}>
            <CheckCircle2 size={20} style={{ color: "#3FD8B4" }} />
          </span>
          <div>
            <p className="text-[13px] font-bold">{justDid.type === "in" ? x.clockInConfirmed : x.clockOutConfirmed}</p>
            <p className="num text-[11.5px]" style={{ color: "var(--muted)" }}>{justDid.at} · {x.dammamTime}</p>
          </div>
        </div>
      )}
      <Panel title={isRep ? x.myShifts : t.nav.attendance}
        extra={myToday && myToday.out ? <Chip tone="ok" sm>{x.clockedOutAt}: {myToday.out}</Chip> : myToday ? <Chip tone="info" sm>{x.clockedInAt}: {myToday.in}</Chip> : <Chip tone="warn" sm>{x.notClockedIn}</Chip>}>
        {!isRep && !myToday && <p className="text-[11px] mb-2.5 flex items-center gap-1.5" style={{ color: "var(--muted)" }}><Camera size={12} />{x.selfieNote}</p>}
        <div className="flex gap-2.5 flex-wrap items-center">
          {!myToday && <Btn variant="accent" accent={role.glow} icon={isRep ? Fingerprint : Camera} onClick={clockIn}>{x.clockIn}</Btn>}
          {myToday && !myToday.out && <Btn variant="gold" icon={LogOut} onClick={clockOut}>{x.clockOut}</Btn>}
          {myToday && myToday.out && (
            <>
              <Chip tone="ok"><CheckCircle2 size={13} />{x.alreadyClockedIn}</Chip>
              <Chip tone="info" sm><Timer size={12} />{duration(myToday)}</Chip>
            </>
          )}
        </div>

        <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
          <p className="text-[11.5px] font-semibold mb-2.5" style={{ color: "var(--muted)" }}>{x.myAttendanceLog}</p>
          {myLog.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.notClockedIn}</p> : (
            <div className="space-y-2">
              {myLog.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-xl p-2.5 text-[12px]" style={{ background: "rgba(20,27,45,.035)" }}>
                  {a.selfie && <img src={a.selfie} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                  <span className="num" style={{ color: "var(--muted)" }}>{a.date}</span>
                  <span className="num">{x.clockedInAt}: {a.in}</span>
                  <span className="num">{a.out ? `${x.clockedOutAt}: ${a.out}` : "—"}</span>
                  {a.out && <span className="num text-[10.5px]" style={{ color: "#3FD8B4" }}>{duration(a)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {isRep && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
            <p className="text-[11.5px] font-semibold mb-2.5" style={{ color: "var(--muted)" }}>{x.myShifts}</p>
            <ShiftCalendar lang={lang} role={role} shifts={shifts.filter((s) => s.repId === user)} attendance={attendance.filter((a) => a.key === user)} />
          </div>
        )}
      </Panel>

      {role.id === "gm" && (() => {
        const deptHours = {};
        attendance.forEach((a) => {
          if (!a.out) return;
          const [ih, im] = a.in.split(":").map(Number), [oh, om] = a.out.split(":").map(Number);
          let mins = (oh * 60 + om) - (ih * 60 + im);
          if (mins < 0) mins += 24 * 60;
          const deptId = a.role;
          deptHours[deptId] = (deptHours[deptId] || 0) + mins;
        });
        const summary = ALL_ROLES.filter((r) => deptHours[r.id] > 0).map((r) => ({ r, mins: deptHours[r.id] }));
        return (
          <Panel title={x.hoursSummaryT}>
            {summary.length === 0 ? <EmptyHint lang={lang} /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {summary.map(({ r, mins }) => (
                  <div key={r.id} className="rounded-xl p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Emblem role={r} size={22} />
                      <span className="text-[11.5px] font-bold truncate">{r[lang].t}</span>
                    </div>
                    <p className="num text-[16px] font-extrabold">{Math.floor(mins / 60)}<span className="text-[11px]" style={{ color: "var(--muted)" }}>{lang === "ar" ? "س" : "h"}</span> {mins % 60}<span className="text-[11px]" style={{ color: "var(--muted)" }}>{lang === "ar" ? "د" : "m"}</span></p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        );
      })()}

      {role.id === "gm" && (
        <Panel title={x.allAttendance} extra={
          <div className="flex items-center gap-2">
            <Chip tone="ok" sm>{x.onDutyNow}: {onDuty.length}</Chip>
            <Btn icon={Download} onClick={() => exportToExcel(attendance.map((a) => ({
              [t.h.employee]: a.name, [t.h.dept]: a.role === "rep" ? REP[lang].t : (ALL_ROLES.find((r) => r.id === a.role) || {})[lang]?.t || a.role,
              [x.clockedInAt]: a.in, [x.clockedOutAt]: a.out || "", Date: a.date,
            })), `attendance-${riyadhToday()}`, "Attendance")}>{t.export}</Btn>
          </div>
        }>
          <DataTable
            headers={[t.h.employee, t.h.dept, t.h.status, x.clockedInAt, x.clockedOutAt]}
            rows={attendance.slice(-30).reverse().map((a, i) => ({
              key: i,
              cells: [
                { v: a.name, strong: 1 }, { v: a.role === "rep" ? REP[lang].t : (ALL_ROLES.find((r) => r.id === a.role) || {})[lang]?.t || a.role, dim: 1 },
                { chip: { tone: a.out ? "n" : "ok", label: a.out ? t.s.closed : x.onDutyNow } },
                { v: a.in, mono: 1 }, { v: a.out || "—", mono: 1, dim: 1 },
              ],
            }))} />
        </Panel>
      )}
    </div>
  );
}

function monthEntriesFor(reports, repId, monthPrefix) {
  const entries = [];
  reports.forEach((rp) => {
    if (!rp.date.startsWith(monthPrefix)) return;
    rp.entries.forEach((e) => { if (e.id === repId) entries.push({ ...e, date: rp.date, hrStatus: rp.hrStatus }); });
  });
  return entries;
}

/* ═══════════  لوحة الصدارة الشهرية  ═══════════ */
const LB_REWARDS = { first: 300, second: 200, third: 150 };
function computeLeaderboard(reps, reports, month) {
  const active = reps.filter((r) => r.status === "active");
  const stats = active.map((r) => {
    const entries = monthEntriesFor(reports, r.id, month);
    const orders = entries.reduce((a, e) => a + (e.orders || 0), 0);
    return { rep: r, orders };
  });
  const byOrders = [...stats].sort((a, b) => b.orders - a.orders);
  const first = byOrders[0] || null;
  const second = byOrders[1] || null;
  return { first, second, stats };
}


/* ═══════════  تنبيهات انتهاء الإقامات (الموارد البشرية)  ═══════════ */
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date(riyadhToday() + "T00:00:00");
  return Math.round((d - today) / 86400000);
}
function iqamaTier(days) {
  if (days == null) return { key: "healthy", tone: "n" };
  if (days < 0) return { key: "expired", tone: "bad" };
  if (days <= 30) return { key: "critical", tone: "bad" };
  if (days <= 60) return { key: "warning", tone: "warn" };
  return { key: "healthy", tone: "ok" };
}

/* ═══════════  لوحة الصدارة الشهرية  ═══════════ */
function prevMonthStr(month) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return d.toISOString().slice(0, 7);
}

function PodiumCard({ lang, role, rank, entry, rewardAmt, desc, icon: Icon, tone, umrah }) {
  const x = EX[lang];
  if (!entry) {
    return (
      <div className="glass rounded-2xl p-4 flex items-center justify-center" style={{ minHeight: 150, border: `1px dashed ${tone}` }}>
        <p className="text-[11.5px] text-center" style={{ color: "var(--muted)" }}>{x.lbNoData}</p>
      </div>
    );
  }
  const rep = entry.rep;
  return (
    <div className="glass rounded-2xl p-4 relative overflow-hidden" style={{ border: `1px solid ${tone}66`, background: `linear-gradient(160deg,${tone}22,transparent 70%)` }}>
      <div className="absolute pointer-events-none rounded-full" style={{ width: 130, height: 130, insetInlineEnd: -40, top: -40, background: `radial-gradient(circle,${tone}33,transparent 70%)` }} />
      <div className="flex items-center justify-between mb-3 relative">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: tone }}><Icon size={15} />{rank}</span>
        <span className="num text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${tone}22`, color: tone }}>+{rewardAmt} {T[lang].sar}</span>
      </div>
      <div className="flex items-center gap-3 relative">
        {rep.photo ? <img src={rep.photo} alt="" className="w-14 h-14 rounded-2xl object-cover" style={{ border: `2px solid ${tone}` }} />
          : <span className="grid place-items-center w-14 h-14 rounded-2xl" style={{ background: `${tone}22`, border: `2px solid ${tone}` }}>
              {rep.vehicle === "car" ? <Car size={22} style={{ color: tone }} /> : <Bike size={22} style={{ color: tone }} />}
            </span>}
        <div className="min-w-0">
          <p className="text-[14px] font-extrabold truncate">{lang === "en" ? rep.en : rep.ar}</p>
          <p className="text-[10.5px] mt-0.5" style={{ color: "var(--muted)" }}>{desc}</p>
        </div>
      </div>
      <div className="flex gap-3 mt-3 pt-3 relative" style={{ borderTop: `1px solid ${tone}33` }}>
        <span className="text-[11px]"><b className="num">{entry.orders}</b> {x.lbOrders}</span>
      </div>
      {umrah && (
        <div className="mt-3 rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: "rgba(228,184,92,.15)", border: "1px solid rgba(228,184,92,.4)" }}>
          <Plane size={15} style={{ color: "#E4B85C" }} />
          <span className="text-[11px] font-bold" style={{ color: "#F7E3B0" }}>{x.lbUmrah}</span>
        </div>
      )}
    </div>
  );
}


function MyStoryPage({ lang, role, activeRep, reports, leaderboardHistory, shifts, user, weekendFine, violationPenalty, payrollRuns }) {
  const t = T[lang], x = EX[lang];
  if (!activeRep) return <div className="space-y-4"><Panel title={x.myStoryT}><EmptyHint lang={lang} /></Panel></div>;

  const allEntries = [];
  reports.forEach((rp) => rp.entries.forEach((e) => { if (e.id === activeRep.id) allEntries.push({ ...e, date: rp.date }); }));
  const totalOrders = allEntries.reduce((a, e) => a + (e.orders || 0), 0);
  const totalHours = allEntries.reduce((a, e) => a + (e.hours || 0), 0);
  const monthsActive = new Set(allEntries.map((e) => e.date.slice(0, 7))).size;
  const wins = leaderboardHistory.filter((h) => h.first === activeRep.id).length;
  const thirdWins = leaderboardHistory.filter((h) => h.third === activeRep.id).length;
  const shiftsCount = (shifts || []).filter((s) => s.repId === user).length;
  const joinDate = allEntries.length ? allEntries.map((e) => e.date).sort()[0] : null;

  const stats = [
    { icon: ShoppingBag, label: x.storyOrders, value: fmt(totalOrders) },
    { icon: Timer, label: x.storyHours, value: totalHours.toFixed(0) },
    { icon: CalendarClock, label: x.storyMonths, value: String(monthsActive) },
    { icon: Trophy, label: x.storyWins, value: String(wins) },
    { icon: Award, label: x.storyThird, value: String(thirdWins) },
  ];

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(125deg,rgba(${role.glow},.18),rgba(${role.glow},.02) 60%)`, border: `1px solid rgba(${role.glow},.32)` }}>
        <RepHeroArt accent={role.glow} />
        <div className="relative flex items-center gap-3">
          {activeRep.photo ? <img src={activeRep.photo} alt="" className="w-16 h-16 rounded-2xl object-cover" style={{ border: `2px solid rgba(${role.glow},.5)` }} />
            : <Emblem role={role} size={64} />}
          <div className="min-w-0">
            <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: role.accent }}>{x.myStoryT}</p>
            <p className="text-[16px] font-extrabold">{lang === "en" ? activeRep.en : activeRep.ar}</p>
            {joinDate && <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{x.storySince} <span className="num">{joinDate}</span></p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-4">
            <span className="grid place-items-center w-9 h-9 rounded-xl mb-2.5" style={{ background: `rgba(${role.glow},.13)` }}>
              <s.icon size={16} style={{ color: role.accent }} />
            </span>
            <p className="num text-[22px] font-extrabold leading-none">{s.value}</p>
            <p className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {wins > 0 && (
        <div className="glass rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(228,184,92,.1)", border: "1px solid rgba(228,184,92,.35)" }}>
          <Crown size={20} style={{ color: "#E4B85C" }} />
          <p className="text-[13px] font-semibold">{x.storyProud} {wins} {x.storyProudEnd}</p>
        </div>
      )}
    </div>
  );
}

function HallOfFamePage({ lang, role, reps, leaderboardHistory }) {
  const t = T[lang], x = EX[lang];
  const repName = (id) => { const r = reps.find((rr) => rr.id === id); return r ? { name: lang === "en" ? r.en : r.ar, photo: r.photo, vehicle: r.vehicle } : { name: id, photo: null, vehicle: "car" }; };
  const sorted = [...leaderboardHistory].filter((h) => h.first).sort((a, b) => b.month.localeCompare(a.month));
  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(125deg,rgba(228,184,92,.16),rgba(228,184,92,.02) 60%)", border: "1px solid rgba(228,184,92,.32)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <Trophy size={19} style={{ color: "#E4B85C" }} />
          <h2 className="text-[16px] font-extrabold">{x.hallOfFameT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.hallOfFameSub}</p>
      </div>
      {sorted.length === 0 ? <EmptyHint lang={lang} /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((h) => {
            const first = repName(h.first);
            const third = h.third ? repName(h.third) : null;
            return (
              <div key={h.month} className="glass rounded-2xl p-4 relative overflow-hidden" style={{ border: "1px solid rgba(228,184,92,.3)" }}>
                <p className="num text-[11px] font-bold mb-3" style={{ color: "#E4B85C" }}>{h.month}</p>
                <div className="flex items-center gap-3">
                  {first.photo ? <img src={first.photo} alt="" className="w-12 h-12 rounded-2xl object-cover" style={{ border: "2px solid #E4B85C" }} />
                    : <span className="grid place-items-center w-12 h-12 rounded-2xl" style={{ background: "rgba(228,184,92,.16)", border: "2px solid #E4B85C" }}>
                        <Crown size={18} style={{ color: "#E4B85C" }} />
                      </span>}
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold truncate">{first.name}</p>
                    <p className="text-[10.5px]" style={{ color: "var(--muted)" }}>{x.lbFirst}</p>
                  </div>
                </div>
                {third && (
                  <div className="flex items-center gap-2.5 mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
                    <Award size={14} style={{ color: "#C58BF2" }} />
                    <p className="text-[11.5px] truncate">{third.name} · {x.lbThird}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LeaderboardPage({ lang, role, reps, reports, activeRep, leaderboardHistory, setLeaderboardHistory }) {
  const t = T[lang], x = EX[lang];
  const month = riyadhNow().toISOString().slice(0, 7);
  const { first, second, stats } = computeLeaderboard(reps, reports, month);
  const prevMonth = prevMonthStr(month);
  const prevRecord = leaderboardHistory.find((h) => h.month === prevMonth);
  const umrahEligible = !!(first && prevRecord && prevRecord.first === first.rep.id);

  const thisRecord = leaderboardHistory.find((h) => h.month === month);
  const thirdId = thisRecord?.third || null;
  const thirdEntry = thirdId ? stats.find((s) => s.rep.id === thirdId) : null;

  useEffect(() => {
    if (!first) return;
    setLeaderboardHistory((prev) => {
      const exists = prev.find((h) => h.month === month);
      if (exists && exists.first === first.rep.id) return prev;
      const rest = prev.filter((h) => h.month !== month);
      return [...rest, { month, first: first.rep.id, third: exists?.third || null }];
    });
    // eslint-disable-next-line
  }, [first?.rep.id, month]);

  const [pickThird, setPickThird] = useState(thirdId || "");
  const saveThird = () => {
    if (!pickThird) return;
    setLeaderboardHistory((prev) => {
      const exists = prev.find((h) => h.month === month);
      const rest = prev.filter((h) => h.month !== month);
      return [...rest, { month, first: exists?.first || (first ? first.rep.id : null), third: pickThird }];
    });
  };

  const myRank = activeRep ? stats.findIndex((s) => s.rep.id === activeRep.id) + 1 : 0;
  const canPickThird = role.id === "hr" || role.id === "opsm" || role.id === "gm";

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(125deg,rgba(228,184,92,.16),rgba(228,184,92,.02) 60%)", border: "1px solid rgba(228,184,92,.32)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <Trophy size={19} style={{ color: "#E4B85C" }} />
          <h2 className="text-[16px] font-extrabold">{x.lbTitle}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.lbSub}</p>
        {role.id === "rep" && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Chip tone="info" sm>{x.lbYourRank}: #{myRank || "—"}</Chip>
            <span className="text-[11.5px] font-semibold" style={{ color: "#F7E3B0" }}>{x.lbMotivate}</span>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <PodiumCard lang={lang} role={role} rank={x.lbFirst} entry={first} rewardAmt={LB_REWARDS.first} desc={x.lbFirstDesc} icon={Crown} tone="#E4B85C" umrah={umrahEligible} />
        <PodiumCard lang={lang} role={role} rank={x.lbSecond} entry={second} rewardAmt={LB_REWARDS.second} desc={x.lbSecondDesc} icon={Medal} tone="#9BB3C9" />
        <PodiumCard lang={lang} role={role} rank={x.lbThird} entry={thirdEntry} rewardAmt={LB_REWARDS.third} desc={x.lbThirdDesc} icon={Award} tone="#C58BF2" />
      </div>

      {umrahEligible && (
        <div className="glass rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(228,184,92,.1)", border: "1px solid rgba(228,184,92,.35)" }}>
          <Plane size={20} style={{ color: "#E4B85C" }} />
          <p className="text-[12.5px] font-semibold">{x.lbUmrah} — {x.lbUmrahHint}</p>
        </div>
      )}

      {canPickThird && (
        <Panel title={x.lbPickThird}>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={pickThird} onChange={(e) => setPickThird(e.target.value)} className="rounded-xl px-3 py-2.5 text-[12.5px] font-semibold outline-none"
              style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }}>
              <option value="" style={{ background: "#FFFFFF" }}>—</option>
              {reps.filter((r) => r.status === "active").map((r) => <option key={r.id} value={r.id} style={{ background: "#FFFFFF" }}>{lang === "en" ? r.en : r.ar}</option>)}
            </select>
            <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={saveThird}>{x.lbSaveThird}</Btn>
          </div>
          <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{x.lbHistoryNote}</p>
        </Panel>
      )}
    </div>
  );
}

/* ═══════════  سجل التتبع (Audit Log) — للمدير العام فقط  ═══════════ */
const AUDIT_LABELS = {
  password_change: { ar: "تغيير كلمة مرور", en: "Password changed", ur: "پاس ورڈ تبدیل" },
  payroll_close_month: { ar: "إقفال شهر رواتب", en: "Payroll month closed", ur: "تنخواہ کا مہینہ بند" },
  payroll_approve_run: { ar: "اعتماد مسير رواتب", en: "Payroll run approved", ur: "تنخواہ مسیر منظور" },
  report_send_finance: { ar: "إرسال تقرير للمالية", en: "Report sent to finance", ur: "رپورٹ مالیات کو بھیجی" },
  ticket_resolve: { ar: "اعتماد تذكرة", en: "Ticket resolved", ur: "ٹکٹ منظور" },
  ticket_reject: { ar: "رفض تذكرة", en: "Ticket rejected", ur: "ٹکٹ مسترد" },
  circular_publish: { ar: "نشر تعميم", en: "Circular published", ur: "سرکلر شائع" },
};
/* ═══════════  تحليل فواتير تطبيقات التوصيل  ═══════════ */
/* ═══════════  الامتثال والمعدات — يمنع غرامات هيئة النقل  ═══════════ */
const EQUIP_ITEMS = ["shirt", "helmet", "bag"];
/* ═══════════  مجلس المستشارين — الحلقة الحصرية مع المدير العام  ═══════════ */
/* ═══════════  القرارات — اعتماد إجباري مزدوج (المدير العام + هيئة المستشارين)  ═══════════ */
function DecisionsPage({ lang, role, decisions, setDecisions, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "" });

  const addDecision = () => {
    if (form.title.trim().length < 3) return;
    const entry = { id: "DEC-" + Date.now(), title: form.title.trim(), desc: form.desc.trim(),
      createdBy: actingEmployee?.name || role.id, createdAt: riyadhNow().toISOString(),
      gmApproved: false, boardApproved: false, boardComment: "" };
    setDecisions((prev) => [entry, ...prev]);
    logAudit(setAuditLog, role, "decision_create", form.title, actingEmployee);
    setForm({ title: "", desc: "" }); setShowForm(false);
  };
  const setGmApproval = (id, val) => {
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, gmApproved: val } : d)));
    logAudit(setAuditLog, role, "decision_gm_" + (val ? "approve" : "unapprove"), id, actingEmployee);
  };
  const setBoardApproval = (id, val, comment) => {
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, boardApproved: val, boardComment: comment || d.boardComment } : d)));
    logAudit(setAuditLog, role, "decision_board_" + (val ? "approve" : "unapprove"), id, actingEmployee);
  };

  const isFinal = (d) => d.gmApproved && d.boardApproved;
  const pending = decisions.filter((d) => !isFinal(d));
  const final = decisions.filter(isFinal);

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(125deg,rgba(216,180,254,.16),rgba(216,180,254,.02) 60%)", border: "1px solid rgba(216,180,254,.32)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <Gavel size={19} style={{ color: "#B892F0" }} />
          <h2 className="text-[16px] font-extrabold">{x.decisionsT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.decisionsSub}</p>
      </div>

      {role.id === "gm" && (
        !showForm ? (
          <Btn variant="accent" accent="216,180,254" icon={Plus} onClick={() => setShowForm(true)}>{x.newDecisionBtn}</Btn>
        ) : (
          <Panel title={x.newDecisionBtn}>
            <GateField label={x.decisionTitleLbl} val={form.title} set={(v) => setForm((f) => ({ ...f, title: v }))} ph="" Icon={Gavel} type="text" accent="#B892F0" />
            <label className="block mt-3">
              <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.decisionDescLbl}</span>
              <textarea value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} rows={3}
                className="w-full rounded-xl px-3.5 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#EAF0FF" }} />
            </label>
            <div className="flex gap-2 mt-4">
              <Btn onClick={() => setShowForm(false)}>{x.cancel}</Btn>
              <Btn variant="accent" accent="216,180,254" icon={CheckCircle2} onClick={addDecision}>{x.save}</Btn>
            </div>
          </Panel>
        )
      )}

      <Panel title={x.decisionsPendingT}>
        {pending.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-3">
            {pending.map((d) => (
              <div key={d.id} className="rounded-2xl p-4" style={{ background: "rgba(216,180,254,.06)", border: "1px solid rgba(216,180,254,.25)" }}>
                <p className="text-[13.5px] font-extrabold">{d.title}</p>
                {d.desc && <p className="text-[12px] mt-1.5" style={{ color: "var(--muted)" }}>{d.desc}</p>}
                <p className="num text-[10px] mt-2" style={{ color: "var(--muted)" }}>{d.createdBy} · {d.createdAt.slice(0, 16).replace("T", " ")}</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: d.gmApproved ? "rgba(15,165,121,.1)" : "rgba(0,0,0,.03)", border: `1px solid ${d.gmApproved ? "rgba(15,165,121,.3)" : "var(--line)"}` }}>
                    <span className="text-[11px] font-bold">{x.gmApprovalLbl}</span>
                    {role.id === "gm" ? (
                      <button onClick={() => setGmApproval(d.id, !d.gmApproved)} className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg" style={{ background: d.gmApproved ? "#0FA579" : "rgba(0,0,0,.08)", color: d.gmApproved ? "#fff" : "var(--muted)" }}>
                        {d.gmApproved ? x.approvedLbl : x.pendingLbl}
                      </button>
                    ) : (
                      <Chip tone={d.gmApproved ? "ok" : "warn"} sm>{d.gmApproved ? x.approvedLbl : x.pendingLbl}</Chip>
                    )}
                  </div>
                  <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: d.boardApproved ? "rgba(15,165,121,.1)" : "rgba(0,0,0,.03)", border: `1px solid ${d.boardApproved ? "rgba(15,165,121,.3)" : "var(--line)"}` }}>
                    <span className="text-[11px] font-bold">{x.boardApprovalLbl}</span>
                    {role.id === "advisor" ? (
                      <button onClick={() => setBoardApproval(d.id, !d.boardApproved)} className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg" style={{ background: d.boardApproved ? "#0FA579" : "rgba(0,0,0,.08)", color: d.boardApproved ? "#fff" : "var(--muted)" }}>
                        {d.boardApproved ? x.approvedLbl : x.pendingLbl}
                      </button>
                    ) : (
                      <Chip tone={d.boardApproved ? "ok" : "warn"} sm>{d.boardApproved ? x.approvedLbl : x.pendingLbl}</Chip>
                    )}
                  </div>
                </div>
                <p className="text-[10px] mt-2" style={{ color: "#8A611E" }}>{x.decisionDualNote}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title={x.decisionsFinalT}>
        {final.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-2">
            {final.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: "rgba(15,165,121,.06)", border: "1px solid rgba(15,165,121,.25)" }}>
                <span className="text-[12.5px] font-bold">{d.title}</span>
                <Chip tone="ok" sm><CheckCircle2 size={11} />{x.decisionFinalizedLbl}</Chip>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function BoardCouncilPage({ lang, role, reps, reports, expenses, payrollRuns, tgaFines, equipStatus, employees, deptPasswords, setDeptPasswords, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const month = riyadhNow().toISOString().slice(0, 7);
  const activeReps = reps.filter((r) => r.status === "active");
  const monthReports = reports.filter((rp) => rp.date && rp.date.startsWith(month));
  const monthOrders = monthReports.reduce((a, rp) => a + rp.entries.reduce((b, e) => b + (e.orders || 0), 0), 0);
  const approvedExpenses = expenses.filter((e) => e.status === "approved" || !e.status);
  const monthExpenses = approvedExpenses.filter((e) => e.date && e.date.startsWith(month)).reduce((a, e) => a + e.v, 0);
  const pendingBoard = payrollRuns.filter((r) => r.status === "sent_to_board");
  const approvedRuns = payrollRuns.filter((r) => r.status === "approved");
  const lastApprovedPayroll = approvedRuns[0]?.totalPayroll || 0;
  const totalTgaFines = tgaFines.reduce((a, f) => a + (f.amount || 0), 0);
  const compliantCount = activeReps.filter((r) => ["shirt", "helmet", "bag"].every((it) => equipStatus[r.id]?.[it] === "valid")).length;
  const complianceRate = activeReps.length ? Math.round((compliantCount / activeReps.length) * 100) : 0;
  const officeCost = employees.reduce((a, e) => a + (e.salary || 0), 0);

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(125deg,rgba(216,180,254,.18),rgba(216,180,254,.02) 60%)", border: "1px solid rgba(216,180,254,.35)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <Scale size={19} style={{ color: "#B892F0" }} />
          <h2 className="text-[16px] font-extrabold">{x.boardT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.boardSub}</p>
      </div>

      {pendingBoard.length > 0 && (
        <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: "rgba(216,180,254,.1)", border: "1px solid rgba(216,180,254,.35)" }}>
          <AlertTriangle size={15} style={{ color: "#B892F0" }} className="mt-0.5 shrink-0" />
          <p className="text-[11.5px] leading-relaxed" style={{ color: "#6B3FA0" }}>{x.boardPendingNote} — {pendingBoard.length} {x.boardPendingCount}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label={x.boardActiveReps} value={String(activeReps.length)} icon={Users} accent="216,180,254" />
        <Kpi label={x.boardMonthOrders} value={fmt(monthOrders)} icon={ShoppingBag} accent="216,180,254" />
        <Kpi label={x.boardMonthExpenses} value={money(monthExpenses)} unit={t.sar} icon={Wallet} accent="216,180,254" />
        <Kpi label={x.boardLastPayroll} value={money(lastApprovedPayroll)} unit={t.sar} icon={CircleDollarSign} accent="216,180,254" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Kpi label={x.boardOfficeCost} value={money(officeCost)} unit={t.sar} icon={Building2} accent="216,180,254" />
        <Kpi label={x.boardCompliance} value={`${complianceRate}%`} icon={ShieldCheck} accent={complianceRate >= 80 ? "15,165,121" : "214,88,77"} />
      </div>

      {totalTgaFines > 0 && (
        <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: "rgba(214,88,77,.08)", border: "1px solid rgba(214,88,77,.25)" }}>
          <AlertTriangle size={15} style={{ color: "#D6584D" }} className="mt-0.5 shrink-0" />
          <p className="text-[11.5px] leading-relaxed" style={{ color: "#8B2E25" }}>{x.boardTgaWarn}: {money(totalTgaFines)} {t.sar}</p>
        </div>
      )}

      <Panel title={x.boardDecisionsT}>
        {pendingBoard.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-2">
            {pendingBoard.map((run) => (
              <div key={run.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: "rgba(216,180,254,.06)", border: "1px solid rgba(216,180,254,.25)" }}>
                <span className="text-[12.5px] font-bold">{run.id} · <span className="num">{run.month}</span></span>
                <span className="num font-bold" style={{ color: "#B892F0" }}>{money(run.totalPayroll)} {t.sar}</span>
              </div>
            ))}
            <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{x.boardGoToPayroll}</p>
          </div>
        )}
      </Panel>

      <Panel title={x.boardApprovedHistoryT}>
        {approvedRuns.length === 0 ? <EmptyHint lang={lang} /> : (
          <DataTable
            headers={[x.invMonth, x.fineAmountLbl2, x.boardDecidedByLbl]}
            rows={approvedRuns.map((r) => ({
              key: r.id,
              cells: [{ v: r.month, mono: 1 }, { v: money(r.totalPayroll) + " " + t.sar, mono: 1, strong: 1 }, { v: r.boardDecidedBy || "—", dim: 1 }],
            }))} />
        )}
      </Panel>

      {role.id === "advisor" && deptPasswords && setDeptPasswords && (
        <DeptPasswordCard lang={lang} role={role} deptPasswords={deptPasswords} setDeptPasswords={setDeptPasswords} setAuditLog={setAuditLog} actingEmployee={actingEmployee} />
      )}
    </div>
  );
}

function ComplianceEquipmentPage({ lang, role, reps, equipStatus, setEquipStatus, tgaFines, setTgaFines, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const [showFineForm, setShowFineForm] = useState(false);
  const [fineForm, setFineForm] = useState({ repId: "", amount: "", date: riyadhToday(), reason: "" });

  const activeReps = reps.filter((r) => r.status === "active");
  const toggle = (repId, item) => {
    setEquipStatus((prev) => {
      const cur = prev[repId] || {};
      const states = ["missing", "valid", "expired"];
      const next = states[(states.indexOf(cur[item] || "missing") + 1) % states.length];
      return { ...prev, [repId]: { ...cur, [item]: next } };
    });
  };
  const fullyCompliant = (repId) => EQUIP_ITEMS.every((it) => (equipStatus[repId]?.[it]) === "valid");
  const compliantCount = activeReps.filter((r) => fullyCompliant(r.id)).length;
  const complianceRate = activeReps.length ? Math.round((compliantCount / activeReps.length) * 100) : 0;

  const totalFines = tgaFines.reduce((a, f) => a + (f.amount || 0), 0);
  const addFine = () => {
    if (!fineForm.repId || !fineForm.amount) return;
    setTgaFines((prev) => [{ id: "TGA-" + Date.now(), ...fineForm, amount: +fineForm.amount }, ...prev]);
    logAudit(setAuditLog, role, "tga_fine_add", `${fineForm.repId}: ${fineForm.amount}`, actingEmployee);
    setFineForm({ repId: "", amount: "", date: riyadhToday(), reason: "" });
    setShowFineForm(false);
  };

  const stateColor = { valid: "#0FA579", missing: "#D6584D", expired: "#B8862E" };
  const stateLabel = { valid: x.equipValid, missing: x.equipMissing, expired: x.equipExpired };

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(125deg,rgba(${role.glow},.16),rgba(${role.glow},.02) 60%)`, border: `1px solid rgba(${role.glow},.32)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <ShieldCheck size={19} style={{ color: role.accent }} />
          <h2 className="text-[16px] font-extrabold">{x.complianceT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.complianceSub}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi label={x.complianceRateLbl} value={`${complianceRate}%`} icon={ShieldCheck} accent={complianceRate >= 80 ? "15,165,121" : "214,88,77"} />
        <Kpi label={x.tgaFinesTotal} value={money(totalFines)} unit={t.sar} icon={AlertTriangle} accent="214,88,77" />
        <Kpi label={x.tgaFinesCount} value={String(tgaFines.length)} icon={ReceiptText} accent={role.glow} />
      </div>

      {complianceRate < 50 && (
        <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: "rgba(214,88,77,.08)", border: "1px solid rgba(214,88,77,.25)" }}>
          <AlertTriangle size={15} style={{ color: "#D6584D" }} className="mt-0.5 shrink-0" />
          <p className="text-[11.5px] leading-relaxed" style={{ color: "#8B2E25" }}>{x.lowComplianceWarn}</p>
        </div>
      )}

      <Panel title={x.equipPerRepT}>
        {activeReps.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-2">
            {activeReps.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(20,27,45,.035)" }}>
                <span className="text-[12.5px] font-bold flex-1 truncate">{lang === "en" ? r.en : r.ar}</span>
                {EQUIP_ITEMS.map((item) => {
                  const st = equipStatus[r.id]?.[item] || "missing";
                  return (
                    <button key={item} onClick={() => toggle(r.id, item)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold shrink-0"
                      style={{ background: `${stateColor[st]}18`, color: stateColor[st], border: `1px solid ${stateColor[st]}40` }}>
                      {x[`equipItem_${item}`]}: {stateLabel[st]}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {!showFineForm ? (
        <Btn variant="danger" icon={Plus} onClick={() => setShowFineForm(true)}>{x.addFineBtn}</Btn>
      ) : (
        <Panel title={x.addFineBtn}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.fineRepSelect}</span>
              <select value={fineForm.repId} onChange={(e) => setFineForm((f) => ({ ...f, repId: e.target.value }))}
                className="w-full rounded-xl px-3 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#fff" }}>
                <option value="" style={{ background: "#0A0F1C" }}>—</option>
                {activeReps.map((r) => <option key={r.id} value={r.id} style={{ background: "#0A0F1C" }}>{lang === "en" ? r.en : r.ar}</option>)}
              </select>
            </label>
            <GateField label={x.fineAmountLbl2} val={fineForm.amount} set={(v) => setFineForm((f) => ({ ...f, amount: v }))} ph="0" Icon={CircleDollarSign} type="number" accent={role.accent} />
            <GateField label={x.invMonth} val={fineForm.date} set={(v) => setFineForm((f) => ({ ...f, date: v }))} ph="" Icon={CalendarClock} type="date" accent={role.accent} />
            <GateField label={x.fineReasonLbl} val={fineForm.reason} set={(v) => setFineForm((f) => ({ ...f, reason: v }))} ph="" Icon={AlertTriangle} type="text" accent={role.accent} />
          </div>
          <div className="flex gap-2 mt-4">
            <Btn onClick={() => setShowFineForm(false)}>{x.cancel}</Btn>
            <Btn variant="danger" icon={CheckCircle2} onClick={addFine}>{x.save}</Btn>
          </div>
        </Panel>
      )}

      <Panel title={x.tgaFinesHistoryT}>
        {tgaFines.length === 0 ? <EmptyHint lang={lang} /> : (
          <DataTable
            headers={[x.fineRepSelect, x.invMonth, x.fineAmountLbl2, x.fineReasonLbl]}
            rows={tgaFines.map((f) => ({
              key: f.id,
              cells: [{ v: f.repId, mono: 1, strong: 1 }, { v: f.date, mono: 1 }, { v: money(f.amount) + " " + t.sar, mono: 1, dim: 1 }, { v: f.reason || "—" }],
            }))} />
        )}
      </Panel>
    </div>
  );
}


function GrowthPage({ lang, role, reps, reports, invoices, payrollRuns, contracts }) {
  const t = T[lang], x = EX[lang];
  const now = riyadhNow();
  const months12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - i), 1));
    return d.toISOString().slice(0, 7);
  });

  const rows = months12.map((m) => {
    const monthReports = reports.filter((rp) => rp.date.startsWith(m));
    const repIds = new Set();
    let orders = 0, km = 0;
    monthReports.forEach((rp) => rp.entries.forEach((e) => { repIds.add(e.id); orders += e.orders || 0; km += e.km || 0; }));
    const run = payrollRuns.find((r) => r.month === m);
    const revenue = run ? run.totalBilling : invoices.filter((v) => v.st === "paid" && v.due && v.due.startsWith(m)).reduce((a, v) => a + v.amt, 0);
    const payroll = run ? run.totalPayroll : 0;
    return { m: m.slice(2), reps: repIds.size, orders, km, revenue: +(revenue / 1000).toFixed(1), payroll: +(payroll / 1000).toFixed(1) };
  });

  const hasAnyData = rows.some((r) => r.reps > 0 || r.revenue > 0);
  const activeReps = reps.filter((r) => r.status === "active").length;
  const activeContracts = contracts.filter((c) => c.st === "active").length;
  const firstMonthWithData = rows.find((r) => r.reps > 0 || r.revenue > 0);
  const lastMonth = rows[rows.length - 1];
  const repGrowthPct = firstMonthWithData && firstMonthWithData.reps > 0 ? Math.round(((lastMonth.reps - firstMonthWithData.reps) / firstMonthWithData.reps) * 100) : null;

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(125deg,rgba(${role.glow},.16),rgba(${role.glow},.02) 60%)`, border: `1px solid rgba(${role.glow},.32)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <TrendingUp size={19} style={{ color: role.accent }} />
          <h2 className="text-[16px] font-extrabold">{x.growthT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.growthSub}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi label={t.k.activeReps} value={String(activeReps)} delta={repGrowthPct} icon={Bike} accent={role.glow} />
        <Kpi label={t.k.contracts} value={String(activeContracts)} icon={FileSignature} accent={role.glow} />
        <Kpi label={x.growthMonths} value={String(rows.filter((r) => r.reps > 0).length)} icon={CalendarClock} accent={role.glow} />
      </div>

      {!hasAnyData ? <Panel title={x.growthT}><EmptyHint lang={lang} /></Panel> : (
        <>
          <Panel title={x.growthRepsT}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rows} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                  <defs><linearGradient id="gRep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={role.accent} stopOpacity=".5" />
                    <stop offset="1" stopColor={role.accent} stopOpacity="0" />
                  </linearGradient></defs>
                  <CartesianGrid stroke="rgba(20,27,45,.06)" vertical={false} />
                  <XAxis dataKey="m" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...TIP} />
                  <Area type="monotone" dataKey="reps" name={t.k.activeReps} stroke={role.accent} strokeWidth={2.4} fill="url(#gRep)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title={x.growthOrdersT}>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(20,27,45,.06)" vertical={false} />
                    <XAxis dataKey="m" tick={AXIS} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...TIP} />
                    <Bar dataKey="orders" name={x.lbOrders} radius={[8, 8, 2, 2]} fill="#5BC8E8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title={x.growthRevenueT}>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rows} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                    <defs><linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#4FD1A5" stopOpacity=".5" />
                      <stop offset="1" stopColor="#4FD1A5" stopOpacity="0" />
                    </linearGradient></defs>
                    <CartesianGrid stroke="rgba(20,27,45,.06)" vertical={false} />
                    <XAxis dataKey="m" tick={AXIS} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                    <Tooltip {...TIP} />
                    <Area type="monotone" dataKey="revenue" name={t.sar + " K"} stroke="#4FD1A5" strokeWidth={2.2} fill="url(#gRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function PreLaunchChecklistPage({ lang, role, reps, employees, reports, auditLog, circulars, weekendFine }) {
  const t = T[lang], x = EX[lang];
  const hasSupervisor = employees.some((e) => e.dept === "ops" && e.isSupervisor);
  const hasActiveRep = reps.some((r) => r.status === "active");
  const hasBackup = auditLog.some((a) => a.action === "backup_export" || a.action === "backup_auto_export");
  const hasReport = reports.length > 0;
  const hasCircular = circulars.length > 0;
  const emptyDepts = ROLES.filter((r) => !employees.some((e) => e.dept === r.id));

  const items = [
    { ok: hasSupervisor, label: x.chkSupervisor },
    { ok: hasActiveRep, label: x.chkActiveRep },
    { ok: emptyDepts.length === 0, label: x.chkAllDepts, note: emptyDepts.length ? emptyDepts.map((d) => d[lang].t).join(" · ") : null },
    { ok: hasReport, label: x.chkDailyReport },
    { ok: hasBackup, label: x.chkBackupDone },
    { ok: hasCircular, label: x.chkCircular },
    { ok: weekendFine > 0, label: x.chkFineSet },
  ];
  const doneCount = items.filter((i) => i.ok).length;
  const allDone = doneCount === items.length;

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(125deg,rgba(${role.glow},.16),rgba(${role.glow},.02) 60%)`, border: `1px solid rgba(${role.glow},.32)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <ClipboardList size={19} style={{ color: role.accent }} />
          <h2 className="text-[16px] font-extrabold">{x.checklistT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{doneCount}/{items.length} {lang === "ar" ? "مكتملة" : lang === "en" ? "complete" : "مکمل"}</p>
      </div>

      {allDone && (
        <div className="glass rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(63,216,180,.12)", border: "1px solid rgba(63,216,180,.4)" }}>
          <Rocket size={20} style={{ color: "#3FD8B4" }} />
          <p className="text-[13px] font-bold">{x.chkAllReady}</p>
        </div>
      )}

      <div className="space-y-2.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: `1px solid ${it.ok ? "rgba(63,216,180,.3)" : "var(--line)"}` }}>
            <span className="grid place-items-center w-9 h-9 rounded-xl shrink-0" style={{ background: it.ok ? "rgba(63,216,180,.16)" : "rgba(228,184,92,.13)" }}>
              {it.ok ? <CheckCircle2 size={17} style={{ color: "#3FD8B4" }} /> : <AlertTriangle size={17} style={{ color: "#E4B85C" }} />}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">{it.label}</p>
              {it.note && <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{it.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════  خريطة الصلاحيات — من له صلاحية إيش  ═══════════ */
const PERMISSION_MAP = [
  { action: { ar: "توظيف مندوب جديد", en: "Hire a new rep", ur: "نیا نمائندہ بھرتی کرنا" }, roles: ["hr", "opsm"] },
  { action: { ar: "تعديل أو حذف مندوب", en: "Edit or delete a rep", ur: "نمائندے میں ترمیم یا حذف" }, roles: ["opsm", "gm"] },
  { action: { ar: "تعيين المشرف التابع له المندوب", en: "Assign the rep's supervisor", ur: "نمائندے کا سپروائزر مقرر کرنا" }, roles: ["hr", "opsm"] },
  { action: { ar: "توظيف موظف إداري", en: "Hire an office employee", ur: "دفتری ملازم بھرتی کرنا" }, roles: ["hr"] },
  { action: { ar: "إيقاف أو تفعيل موظف إداري", en: "Suspend or reactivate an employee", ur: "ملازم کو معطل یا فعال کرنا" }, roles: ["opsm", "gm"] },
  { action: { ar: "تغيير كلمة مرور أي قسم", en: "Change any department's password", ur: "کسی بھی شعبے کا پاس ورڈ تبدیل کرنا" }, roles: ["opsm"] },
  { action: { ar: "فك قفل قسم بعد محاولات فاشلة", en: "Unlock a department after failed logins", ur: "ناکام کوششوں کے بعد شعبہ کھولنا" }, roles: ["opsm"] },
  { action: { ar: "إعادة تعيين كلمة مرور مندوب", en: "Reset a rep's password", ur: "نمائندے کا پاس ورڈ ری سیٹ کرنا" }, roles: ["hr", "ops", "opsm"] },
  { action: { ar: "اعتماد التقرير اليومي وإرساله للمالية", en: "Approve daily report & send to Finance", ur: "روزانہ رپورٹ منظور کر کے مالیات کو بھیجنا" }, roles: ["hr"] },
  { action: { ar: "إقفال الشهر المالي", en: "Close the payroll month", ur: "مالی مہینہ بند کرنا" }, roles: ["fin"] },
  { action: { ar: "اعتماد مسير الرواتب النهائي", en: "Approve the final payroll run", ur: "حتمی تنخواہ مسیر منظور کرنا" }, roles: ["gm"] },
  { action: { ar: "نشر تعميم", en: "Publish a circular", ur: "سرکلر شائع کرنا" }, roles: ["gm", "opsm"] },
  { action: { ar: "إحالة بلاغ للشؤون القانونية", en: "Escalate a report to Legal", ur: "قانونی امور کو اطلاع بھیجنا" }, roles: ["gm"] },
  { action: { ar: "اختيار الأكثر التزاماً بالصدارة الشهرية", en: "Pick the monthly discipline award winner", ur: "ماہانہ نظم و ضبط ایوارڈ کا انتخاب" }, roles: ["hr", "opsm", "gm"] },
  { action: { ar: "رؤية سجل التتبع الكامل", en: "View the full audit log", ur: "مکمل آڈٹ لاگ دیکھنا" }, roles: ["opsm", "gm"] },
  { action: { ar: "تصدير أو استعادة نسخة احتياطية كاملة", en: "Export or restore a full backup", ur: "مکمل بیک اپ برآمد یا بحال کرنا" }, roles: ["gm"] },
  { action: { ar: "تصفير المنصة بالكامل", en: "Fully reset the platform", ur: "پلیٹ فارم مکمل ری سیٹ کرنا" }, roles: ["gm"] },
  { action: { ar: "إضافة أو تعديل بنود اللائحة الداخلية", en: "Add or edit internal charter clauses", ur: "اندرونی ضابطے کی شقیں شامل یا تبدیل کرنا" }, roles: ["legal"] },
];

function PermissionsMapPage({ lang, role }) {
  const t = T[lang], x = EX[lang];
  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(125deg,rgba(${role.glow},.16),rgba(${role.glow},.02) 60%)`, border: `1px solid rgba(${role.glow},.32)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <ShieldCheck size={19} style={{ color: role.accent }} />
          <h2 className="text-[16px] font-extrabold">{x.permMapT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.permMapSub}</p>
      </div>

      <div className="space-y-2.5">
        {PERMISSION_MAP.map((p, i) => {
          const iHave = p.roles.includes(role.id);
          return (
            <div key={i} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: `1px solid ${iHave ? `rgba(${role.glow},.35)` : "var(--line)"}` }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[13px] font-semibold flex-1 min-w-[160px]">{p.action[lang]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.roles.map((rid) => {
                    const r = ALL_ROLES.find((rr) => rr.id === rid);
                    return (
                      <span key={rid} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: `rgba(${r.glow},.14)`, color: r.accent, border: `1px solid rgba(${r.glow},.3)` }}>
                        <Emblem role={r} size={14} />{r[lang].t}
                      </span>
                    );
                  })}
                </div>
              </div>
              {iHave && <p className="text-[10.5px] mt-2 flex items-center gap-1.5" style={{ color: role.accent }}><CheckCircle2 size={11} />{x.permYouHaveIt}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SecurityPage({ lang, role, deptPasswords, setDeptPasswords, deptSecurity, setDeptSecurity, reps, setReps, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const [pwInputs, setPwInputs] = useState({});
  const [repSearch, setRepSearch] = useState("");
  const [repPw, setRepPw] = useState({});

  const savePw = (deptId) => {
    const val = pwInputs[deptId];
    if (!val || val.length < 4) return;
    setDeptPasswords((prev) => ({ ...prev, [deptId]: val }));
    logAudit(setAuditLog, role, "dept_password_reset", deptId, actingEmployee);
    setPwInputs((p) => ({ ...p, [deptId]: "" }));
  };
  const unlockDept = (deptId) => {
    setDeptSecurity((prev) => ({ ...prev, [deptId]: { fails: 0, locked: false } }));
    logAudit(setAuditLog, role, "dept_unlock", deptId, actingEmployee);
  };

  const matchedReps = repSearch.trim().length >= 2
    ? reps.filter((r) => r.ar.includes(repSearch) || r.en.toLowerCase().includes(repSearch.toLowerCase()) || r.phone.includes(repSearch) || (r.nid || "").includes(repSearch))
    : [];
  const saveRepPw = (repId) => {
    const val = repPw[repId];
    if (!val || val.length < 4) return;
    setReps((prev) => prev.map((r) => (r.id === repId ? { ...r, password: val } : r)));
    logAudit(setAuditLog, role, "rep_password_reset", repId, actingEmployee);
    setRepPw((p) => ({ ...p, [repId]: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(125deg,rgba(${role.glow},.16),rgba(${role.glow},.02) 60%)`, border: `1px solid rgba(${role.glow},.32)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <ShieldAlert size={19} style={{ color: role.accent }} />
          <h2 className="text-[16px] font-extrabold">{x.securityT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.securitySub}</p>
      </div>

      <Panel title={x.securityT}>
        <div className="space-y-2.5">
          {ALL_ROLES.filter((r) => r.id !== "rep").map((r) => {
            const sec = deptSecurity[r.id] || { fails: 0, locked: false };
            return (
              <div key={r.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: `1px solid ${sec.locked ? "rgba(232,131,122,.4)" : "var(--line)"}` }}>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <Emblem role={r} size={30} />
                    <span className="text-[13px] font-bold">{r[lang].t}</span>
                  </div>
                  {sec.locked ? (
                    <div className="flex items-center gap-2">
                      <Chip tone="bad" sm><ShieldAlert size={11} />{x.lockedBadge}</Chip>
                      <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => unlockDept(r.id)}>{x.unlockBtn}</Btn>
                    </div>
                  ) : (
                    sec.fails > 0 && <Chip tone="warn" sm>{x.failsLbl}: {sec.fails}/5</Chip>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input value={pwInputs[r.id] || ""} onChange={(e) => setPwInputs((p) => ({ ...p, [r.id]: e.target.value }))} placeholder={x.deptPwLbl} type="text"
                    className="num flex-1 rounded-lg px-3 py-2 text-[12.5px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
                  <Btn variant="accent" accent={role.glow} icon={KeyRound} onClick={() => savePw(r.id)}>{x.saveDeptPw}</Btn>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title={x.resetRepPwT}>
        <GateField label={x.searchRep} val={repSearch} set={setRepSearch} ph="" Icon={Search} type="text" accent={role.accent} />
        {matchedReps.length > 0 && (
          <div className="space-y-2 mt-3">
            {matchedReps.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-xl p-2.5" style={{ background: "rgba(20,27,45,.035)" }}>
                <span className="text-[12.5px] font-bold flex-1 truncate">{lang === "en" ? r.en : r.ar}</span>
                <input value={repPw[r.id] || ""} onChange={(e) => setRepPw((p) => ({ ...p, [r.id]: e.target.value }))} placeholder="••••••••" type="text"
                  className="num w-28 rounded-lg px-2.5 py-1.5 text-[11.5px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
                <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => saveRepPw(r.id)}>{x.save}</Btn>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function AuditLogPage({ lang, role, auditLog, tickets }) {
  const t = T[lang], x = EX[lang];
  const byLabel = (a) => {
    const dept = (ALL_ROLES.find((r) => r.id === a.by) || {})[lang]?.t || a.by;
    return a.byName ? `${a.byName} (${dept})` : dept;
  };
  const doExport = () => {
    const rows = auditLog.map((a) => ({
      [x.auditWhen]: a.at,
      [x.auditBy]: byLabel(a),
      [x.auditAction]: (AUDIT_LABELS[a.action] || {})[lang] || a.action,
      Detail: a.detail,
    }));
    exportToExcel(rows, `audit-log-${riyadhToday()}`, "Audit");
  };
  const resolved = (tickets || []).filter((tk) => tk.resolvedAt && tk.resolvedBy);
  const byDept = {};
  resolved.forEach((tk) => {
    const hrs = (new Date(tk.resolvedAt) - new Date(tk.createdAt)) / 3600000;
    if (!byDept[tk.resolvedBy]) byDept[tk.resolvedBy] = [];
    byDept[tk.resolvedBy].push(hrs);
  });
  const avgRows = Object.keys(byDept).map((deptId) => ({
    deptId, avg: byDept[deptId].reduce((a, h) => a + h, 0) / byDept[deptId].length, count: byDept[deptId].length,
  })).sort((a, b) => a.avg - b.avg);
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4" style={{ background: `linear-gradient(100deg,rgba(${role.glow},.13),rgba(${role.glow},.03))`, border: `1px solid rgba(${role.glow},.28)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <ClipboardList size={18} style={{ color: role.accent }} />
          <h2 className="text-[15px] font-extrabold">{x.auditT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.fullControlNote}</p>
      </div>

      <Panel title={x.avgResolutionT}>
        {avgRows.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.auditNoLogs}</p> : (
          <div className="space-y-2.5">
            {avgRows.map((r) => {
              const dept = ALL_ROLES.find((d) => d.id === r.deptId) || {};
              return (
                <div key={r.deptId} className="flex items-center gap-3">
                  <span className="text-[12px] w-32 shrink-0 truncate flex items-center gap-1.5">
                    {dept.icon && <dept.icon size={13} style={{ color: dept.accent }} />}{dept[lang]?.t || r.deptId}
                  </span>
                  <span className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(20,27,45,.06)" }}>
                    <span className="block h-full bar-in rounded-full" style={{ width: `${Math.min(100, (r.avg / 72) * 100)}%`, background: `linear-gradient(90deg,rgba(${dept.glow || role.glow},.4),${dept.accent || role.accent})`, transformOrigin: "left" }} />
                  </span>
                  <span className="num text-[11.5px] w-24 text-end" style={{ color: "var(--muted)" }}>{r.avg.toFixed(1)}h · {r.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title={x.auditT} extra={<Btn icon={Download} onClick={doExport}>{t.export}</Btn>}>
        {auditLog.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.auditNoLogs}</p> : (
          <DataTable
            headers={[x.auditWhen, x.auditBy, x.auditAction, t.h.title]}
            rows={auditLog.map((a) => ({
              key: a.id,
              cells: [
                { v: a.at.slice(0, 16).replace("T", " "), mono: 1, dim: 1 },
                { v: byLabel(a), strong: 1 },
                { v: (AUDIT_LABELS[a.action] || {})[lang] || a.action },
                { v: a.detail, dim: 1 },
              ],
            }))} />
        )}
      </Panel>
    </div>
  );
}

function IqamaAlertsPage({ lang, role, reps, iqamaAlerts, setIqamaAlerts }) {
  const t = T[lang], x = EX[lang];
  const withDates = reps.filter((r) => r.idExpiry).map((r) => {
    const days = daysUntil(r.idExpiry);
    return { r, days, tier: iqamaTier(days) };
  }).sort((a, b) => (a.days ?? 9e9) - (b.days ?? 9e9));

  const urgent = withDates.filter((o) => o.tier.key === "expired" || o.tier.key === "critical").length;
  const send = (repId) => setIqamaAlerts((prev) => [{ id: "AL-" + Date.now(), repId, date: riyadhToday() }, ...prev]);
  const lastAlertFor = (repId) => iqamaAlerts.find((a) => a.repId === repId);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4" style={{ background: `linear-gradient(100deg,rgba(${role.glow},.13),rgba(${role.glow},.03))`, border: `1px solid rgba(${role.glow},.28)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <ShieldAlert size={18} style={{ color: role.accent }} />
          <h2 className="text-[15px] font-extrabold">{x.iqamaT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.iqamaSub}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi label={x.iqamaUrgentCount} value={String(urgent)} icon={AlertTriangle} accent="232,131,122" />
        <Kpi label={t.k.activeReps} value={String(reps.filter((r) => r.status === "active").length)} icon={Bike} accent={role.glow} />
        <Kpi label={x.healthy} value={String(withDates.filter((o) => o.tier.key === "healthy").length)} icon={CheckCircle2} accent="63,216,180" />
      </div>

      <Panel title={x.iqamaT}>
        {withDates.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-2.5">
            {withDates.map(({ r, days, tier }) => {
              const alert = lastAlertFor(r.id);
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: `1px solid ${tier.key === "expired" || tier.key === "critical" ? "rgba(232,131,122,.35)" : "var(--line)"}` }}>
                  <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.13)` }}>
                    {r.vehicle === "car" ? <Car size={17} style={{ color: role.accent }} /> : <Bike size={17} style={{ color: role.accent }} />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-bold truncate">{lang === "en" ? r.en : r.ar}</span>
                    <span className="num block text-[11px]" style={{ color: "var(--muted)" }}>{r.idExpiry} · {days != null ? `${days} ${x.daysLeft}` : "—"}</span>
                    {alert && <span className="block text-[10.5px] mt-0.5" style={{ color: "#4FD1A5" }}>{x.lastAlert}: <span className="num">{alert.date}</span></span>}
                  </span>
                  <span className="flex flex-col items-end gap-1.5 shrink-0">
                    <Chip tone={tier.tone} sm>{x[tier.key]}</Chip>
                    <Btn variant={tier.key === "healthy" ? "ghost" : "accent"} accent="232,131,122" icon={Send} onClick={() => send(r.id)}>{x.sendAlert}</Btn>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ═══════════  مسيرات الرواتب الشهرية (المالية + المدير العام)  ═══════════ */
function PayrollRunsPage({ lang, role, reps, reports, employees, payrollRuns, setPayrollRuns, setAuditLog, actingEmployee, weekendFine, repSettlements }) {
  const t = T[lang], x = EX[lang];
  const month = riyadhNow().toISOString().slice(0, 7);
  const activeReps = reps.filter((r) => r.status === "active");
  const alreadyClosed = payrollRuns.some((r) => r.month === month);
  const lb = computeLeaderboard(reps, reports, month);
  const rewardFor = (repId) => (lb.first && lb.first.rep.id === repId ? LB_REWARDS.first : lb.second && lb.second.rep.id === repId ? LB_REWARDS.second : 0);
  const [ajeerAmounts, setAjeerAmounts] = useState({});
  const [deductAmounts, setDeductAmounts] = useState({}); // القيمة الفعلية بالريال اللي تقرّرها المالية لكل مندوب: { [repId]: { weekend, app } }

  const appName = (aid) => (APPS.find((a) => a.id === aid) || {})[lang] || aid;
  const settleRec = (repSettlements || []).find((s) => s.month === month && s.closed && s.snapshot);
  const appRevenue = {};
  if (settleRec) settleRec.snapshot.appLines.forEach((l) => { appRevenue[l.app] = l.revenue; });
  const appBreakdown = Object.keys(appRevenue).map((aid) => ({ id: aid, name: appName(aid), total: appRevenue[aid] })).sort((a, b) => b.total - a.total);

  const settledNet = (id) => { const l = settleRec && settleRec.snapshot.repLines.find((z) => z.repId === id); return l ? l.net : 0; };
  const live = activeReps.map((r) => {
    const entries = monthEntriesFor(reports, r.id, month);
    const orders = entries.reduce((a, e) => a + (e.orders || 0), 0);
    const km = entries.reduce((a, e) => a + (e.km || 0), 0);
    const hours = entries.reduce((a, e) => a + (e.hours || 0), 0);
    const weekendCount = entries.reduce((a, e) => a + (e.weekendViolations || 0), 0);
    const appCount = entries.reduce((a, e) => a + (e.appViolations || 0), 0);
    const reward = rewardFor(r.id);
    // كل مندوب — كفالة أو أجير — راتبه يُدخل يدوياً من المالية بالكامل، بدون أي معادلة تلقائية
    const manual = ajeerAmounts[r.id] ?? settledNet(r.id);
    return { repId: r.id, name: lang === "en" ? r.en : r.ar, empType: r.empType, app: r.app, orders, km, hours, weekendCount, appCount,
      salary: manual, violationDeduction: 0, reward, total: manual + reward, billing: 0 };
  });
  const liveKafala = live.filter((r) => r.empType !== "ajeer");
  const liveAjeer = live.filter((r) => r.empType === "ajeer");

  const officeStaff = employees.filter((e) => e.status !== "suspended" && e.dept !== "advisor");
  const [officeAmounts, setOfficeAmounts] = useState({});
  const liveOffice = officeStaff.map((e) => ({
    empId: e.id, name: e.name, dept: e.dept, position: e.position,
    salary: officeAmounts[e.id] ?? (e.salary || 0),
  }));

  const liveTotalPayroll = live.reduce((a, r) => a + r.total, 0) + liveOffice.reduce((a, r) => a + r.salary, 0);
  const liveTotalBilling = settleRec ? settleRec.snapshot.totals.revenue : 0;

  const closeMonth = () => {
    if (alreadyClosed) return;
    setPayrollRuns((prev) => [{ id: "RUN-" + Date.now(), month, createdAt: riyadhNow().toISOString(), entries: live, officeEntries: liveOffice,
      totalPayroll: liveTotalPayroll, totalBilling: liveTotalBilling, status: "finance_review" }, ...prev]);
    logAudit(setAuditLog, role, "payroll_close_month", month, actingEmployee);
  };
  const financeApprove = (id) => {
    setPayrollRuns((prev) => prev.map((r) => (r.id === id ? { ...r, status: "sent_to_gm", financeApprovedBy: actingEmployee?.name || role.id, financeApprovedAt: riyadhNow().toISOString() } : r)));
    logAudit(setAuditLog, role, "payroll_finance_approve", id, actingEmployee);
  };
  const forwardToBoard = (id) => {
    setPayrollRuns((prev) => prev.map((r) => (r.id === id ? { ...r, status: "sent_to_board" } : r)));
    logAudit(setAuditLog, role, "payroll_forward_board", id, actingEmployee);
  };
  const boardDecide = (id, decision) => {
    setPayrollRuns((prev) => prev.map((r) => (r.id === id ? { ...r, status: decision, boardDecidedBy: actingEmployee?.name || role.id, boardDecidedAt: riyadhNow().toISOString() } : r)));
    logAudit(setAuditLog, role, "payroll_board_" + decision, id, actingEmployee);
  };
  const exportRun = (run) => {
    const rows = run.entries.map((e) => ({
      [t.h.employee]: e.name, [x.empTypeCol]: EMP_TYPES[e.empType]?.[lang] || e.empType,
      [x.ordersCol]: e.orders, [x.hoursCol]: (e.hours || 0).toFixed(1),
      [`${x.weekendViolCol} (${x.supReportedLbl})`]: e.weekendCount || 0, [`${x.appViolCol} (${x.supReportedLbl})`]: e.appCount || 0,
      [`${x.weekendViolCol} (${t.sar})`]: e.weekendDeductAmt || 0, [`${x.appViolCol} (${t.sar})`]: e.appDeductAmt || 0,
      [x.totalSalary]: e.salary, [x.lbReward]: e.reward || 0, [t.sar]: e.total,
    }));
    const officeRows = (run.officeEntries || []).map((e) => ({
      [t.h.employee]: e.name, [x.empTypeCol]: x.officeStaffSectionT,
      [x.ordersCol]: "—", [x.hoursCol]: "—",
      [`${x.weekendViolCol} (${x.supReportedLbl})`]: "—", [`${x.appViolCol} (${x.supReportedLbl})`]: "—",
      [`${x.weekendViolCol} (${t.sar})`]: "—", [`${x.appViolCol} (${t.sar})`]: "—",
      [x.totalSalary]: e.salary, [x.lbReward]: 0, [t.sar]: e.salary,
    }));
    exportToExcel([...rows, ...officeRows], `payroll-${run.month}`, run.month);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4" style={{ background: `linear-gradient(100deg,rgba(${role.glow},.13),rgba(${role.glow},.03))`, border: `1px solid rgba(${role.glow},.28)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <CircleDollarSign size={18} style={{ color: role.accent }} />
          <h2 className="text-[15px] font-extrabold">{x.payrollRunsT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.payrollRunsSub}</p>
      </div>

      <Panel title={x.appRevenueT}>
        {appBreakdown.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {appBreakdown.map((a) => (
              <div key={a.id} className="rounded-xl p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                <p className="text-[11px] font-bold truncate" style={{ color: "var(--muted)" }}>{a.name}</p>
                <p className="num text-[16px] font-extrabold mt-1">{money(a.total)} <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>{t.sar}</span></p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi label={x.finalPayroll} value={money(liveTotalPayroll)} unit={t.sar} icon={Wallet} accent={role.glow} />
        <Kpi label={x.companyRevenue} value={money(liveTotalBilling)} unit={t.sar} icon={CircleDollarSign} accent={role.glow} />
        <Kpi label={x.netCompany} value={money(liveTotalBilling - liveTotalPayroll)} unit={t.sar} icon={TrendingUp} accent={role.glow} />
      </div>

      {role.id === "fin" && settleRec && (
        <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: "rgba(15,165,121,.08)", border: "1px solid rgba(15,165,121,.25)" }}>
          <CheckCircle2 size={15} style={{ color: "#0FA579" }} className="mt-0.5 shrink-0" />
          <p className="text-[11.5px] leading-relaxed" style={{ color: "#0B5C46" }}>{RA[lang].payFilled}</p>
        </div>
      )}

      {role.id === "fin" && (
        <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: "rgba(228,184,92,.08)", border: "1px solid rgba(228,184,92,.25)" }}>
          <AlertTriangle size={15} style={{ color: "#B8862E" }} className="mt-0.5 shrink-0" />
          <p className="text-[11.5px] leading-relaxed" style={{ color: "#8A611E" }}>{x.manualPayrollNote}</p>
        </div>
      )}

      {role.id === "fin" && (
        <Panel title={month} extra={<Chip tone={alreadyClosed ? "n" : "warn"} sm>{alreadyClosed ? x.alreadyClosedMonth : month}</Chip>}>
          {live.length === 0 ? <EmptyHint lang={lang} /> : (
            <div className="space-y-2 mb-4">
              {liveKafala.length > 0 && (
                <p className="text-[10.5px] font-bold mb-2" style={{ color: "var(--muted)" }}>{EMP_TYPES.kafala[lang]}</p>
              )}
              {liveKafala.map((r) => (
                <div key={r.repId} className="flex items-center justify-between rounded-xl p-2.5 text-[12px] mb-2" style={{ background: "rgba(20,27,45,.035)" }}>
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{r.name}</span>
                    {r.reward > 0 && <Chip tone="warn" sm><Trophy size={11} />+{r.reward}</Chip>}
                    <span className="num text-[10.5px]" style={{ color: "var(--muted)" }}>{r.orders} {x.lbOrders} · {r.hours.toFixed(1)} {x.hoursCol}
                      {r.weekendCount > 0 && ` · ${x.weekendViolCol}: ${r.weekendCount}`}{r.appCount > 0 && ` · ${x.appViolCol}: ${r.appCount}`}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <input type="number" value={r.salary} onChange={(e) => setAjeerAmounts((prev) => ({ ...prev, [r.repId]: +e.target.value }))}
                      className="num w-24 rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold outline-none text-end" style={{ background: "#fff", border: "1px solid var(--line)", color: "#12151D" }} />
                    <span className="text-[11px]" style={{ color: "var(--muted)" }}>{t.sar}</span>
                  </span>
                </div>
              ))}
              {liveAjeer.length > 0 && (
                <>
                  <p className="text-[10.5px] font-bold mb-2 mt-4 pt-3" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>{EMP_TYPES.ajeer[lang]}</p>
                  {liveAjeer.map((r) => (
                    <div key={r.repId} className="flex items-center justify-between rounded-xl p-2.5 text-[12px]" style={{ background: "rgba(228,184,92,.06)", border: "1px solid rgba(228,184,92,.25)" }}>
                      <span className="flex items-center gap-2">
                        <span className="font-bold">{r.name}</span>
                        <span className="num text-[10.5px]" style={{ color: "var(--muted)" }}>{r.hours.toFixed(1)} {x.hoursCol}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <input type="number" value={r.salary} onChange={(e) => setAjeerAmounts((prev) => ({ ...prev, [r.repId]: +e.target.value }))}
                          className="num w-24 rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold outline-none text-end" style={{ background: "#fff", border: "1px solid var(--line)", color: "#12151D" }} />
                        <span className="text-[11px]" style={{ color: "var(--muted)" }}>{t.sar}</span>
                      </span>
                    </div>
                  ))}
                </>
              )}
              {liveOffice.length > 0 && (
                <>
                  <p className="text-[10.5px] font-bold mb-2 mt-4 pt-3" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>{x.officeStaffSectionT}</p>
                  {liveOffice.map((e) => (
                    <div key={e.empId} className="flex items-center justify-between rounded-xl p-2.5 text-[12px] mb-2" style={{ background: "rgba(91,141,239,.06)", border: "1px solid rgba(91,141,239,.2)" }}>
                      <span className="flex items-center gap-2">
                        <span className="font-bold">{e.name}</span>
                        <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>{e.position || "—"}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <input type="number" value={officeAmounts[e.empId] ?? (e.salary || 0)} onChange={(ev) => setOfficeAmounts((prev) => ({ ...prev, [e.empId]: +ev.target.value }))}
                          className="num w-24 rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold outline-none text-end" style={{ background: "#fff", border: "1px solid var(--line)", color: "#12151D" }} />
                        <span className="text-[11px]" style={{ color: "var(--muted)" }}>{t.sar}</span>
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          {alreadyClosed ? (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3" style={{ background: "rgba(15,165,121,.08)", border: "1px solid rgba(15,165,121,.25)" }}>
              <CheckCircle2 size={16} style={{ color: "#0FA579" }} className="shrink-0" />
              <span className="text-[12.5px] font-bold" style={{ color: "#0B5C46" }}>{x.monthClosed} — {x.nextStepBelowHint}</span>
            </div>
          ) : (
            <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={closeMonth}>{x.closeMonth}</Btn>
          )}
        </Panel>
      )}

      {payrollRuns.filter((r) => r.status === "finance_review").length > 0 && role.id === "fin" && (
        <Panel title={x.financeReviewT}>
          <div className="space-y-2.5">
            {payrollRuns.filter((r) => r.status === "finance_review").map((run) => (
              <div key={run.id} className="rounded-2xl p-3.5" style={{ background: "rgba(228,184,92,.06)", border: "1px solid rgba(228,184,92,.25)" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="block text-[13px] font-bold">{run.id} · <span className="num">{run.month}</span></span>
                    <span className="num block text-[11px]" style={{ color: "var(--muted)" }}>{money(run.totalPayroll)} {t.sar}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn icon={Download} onClick={() => exportRun(run)}>{t.export}</Btn>
                    <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => financeApprove(run.id)}>{x.financeApproveBtn}</Btn>
                  </div>
                </div>
                <p className="text-[10.5px] mt-2" style={{ color: "#8A611E" }}>{x.financeReviewNote}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {payrollRuns.filter((r) => r.status === "sent_to_gm").length > 0 && (
        <Panel title={role.id === "gm" ? x.payrollRunsT : x.runArchive}>
          <div className="space-y-2.5">
            {payrollRuns.filter((r) => r.status === "sent_to_gm").map((run) => (
              <div key={run.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="block text-[13px] font-bold">{run.id} · <span className="num">{run.month}</span></span>
                    <span className="num block text-[11px]" style={{ color: "var(--muted)" }}>{money(run.totalPayroll)} {t.sar}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn icon={Download} onClick={() => exportRun(run)}>{t.export}</Btn>
                    {role.id === "gm" ? (
                      <Btn variant="gold" icon={Send} onClick={() => forwardToBoard(run.id)}>{x.forwardToBoardBtn}</Btn>
                    ) : (
                      <Chip tone="warn" sm>{x.runStatusSent}</Chip>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {payrollRuns.filter((r) => r.status === "sent_to_board").length > 0 && (role.id === "gm" || role.id === "fin" || role.id === "advisor") && (
        <Panel title={x.boardReviewT}>
          <div className="space-y-2.5">
            {payrollRuns.filter((r) => r.status === "sent_to_board").map((run) => (
              <div key={run.id} className="rounded-2xl p-3.5" style={{ background: "rgba(216,180,254,.08)", border: "1px solid rgba(216,180,254,.3)" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="block text-[13px] font-bold">{run.id} · <span className="num">{run.month}</span></span>
                    <span className="num block text-[11px]" style={{ color: "var(--muted)" }}>{money(run.totalPayroll)} {t.sar}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn icon={Download} onClick={() => exportRun(run)}>{t.export}</Btn>
                    {role.id === "advisor" ? (
                      <>
                        <Btn variant="accent" accent="216,180,254" icon={CheckCircle2} onClick={() => boardDecide(run.id, "approved")}>{x.approvedLbl}</Btn>
                        <Btn variant="danger" icon={X} onClick={() => boardDecide(run.id, "rejected")}>{x.rejectedLbl}</Btn>
                      </>
                    ) : (
                      <Chip tone="info" sm>{x.awaitingBoardLbl}</Chip>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title={x.runArchive}>
        {payrollRuns.filter((r) => r.status === "approved").length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-2.5">
            {payrollRuns.filter((r) => r.status === "approved").map((run) => (
              <div key={run.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <div>
                  <span className="num text-[12.5px] font-bold">{run.id} · {run.month}</span>
                  <span className="num block text-[11px]" style={{ color: "var(--muted)" }}>{money(run.totalPayroll)} {t.sar}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Chip tone="ok" sm>{x.runStatusApproved}</Chip>
                  <Btn icon={Download} onClick={() => exportRun(run)}>{t.export}</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function PeoplePage({ lang, role, employees, setEmployees, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const canSuspend = role.id === "opsm" || role.id === "gm";
  const dn = (id) => (ALL_ROLES.find((r) => r.id === id) || {})[lang]?.t || id;
  const [form, setForm] = useState({ name: "", dept: "gm", position: "", photo: null, isSupervisor: false, password: "", salary: "" });
  const [err, setErr] = useState("");
  const [resetId, setResetId] = useState(null);
  const [resetPw, setResetPw] = useState("");
  const [salaryEditId, setSalaryEditId] = useState(null);
  const [salaryInput, setSalaryInput] = useState("");
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const onPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  };
  const submit = () => {
    if (form.name.trim().length < 3) return setErr(x.errRepName);
    if (form.position.trim().length < 2) return setErr(x.errRepName);
    if (form.password.length < 4) return setErr(x.errRepPass);
    setErr("");
    setEmployees((prev) => [...prev, { id: "EMP-" + Date.now(), name: form.name, dept: form.dept, position: form.position,
      photo: form.photo, isSupervisor: form.dept === "ops" && form.isSupervisor, password: form.password, salary: +form.salary || 0 }]);
    logAudit(setAuditLog, role, "employee_add", `${form.name} (${form.dept})`, actingEmployee);
    setForm({ name: "", dept: "gm", position: "", photo: null, isSupervisor: false, password: "", salary: "" });
  };
  const Avatar = ({ p, size = 36 }) => p.photo
    ? <img src={p.photo} alt="" className="rounded-xl object-cover shrink-0" style={{ width: size, height: size }} />
    : <span className="grid place-items-center rounded-xl shrink-0" style={{ width: size, height: size, background: `rgba(${role.glow},.13)` }}><User size={size * 0.5} style={{ color: role.accent }} /></span>;

  return (
    <div className="space-y-4">
      <p className="text-[11.5px] flex items-center gap-1.5" style={{ color: "var(--muted)" }}><ShieldCheck size={13} style={{ color: role.accent }} />{x.hrOnlyHiring}</p>
      <Panel title={x.addEmployeeBtn}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <GateField label={x.empName} val={form.name} set={set("name")} ph="" Icon={User} type="text" accent={role.accent} />
          <label className="block">
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.empDept}</span>
            <select value={form.dept} onChange={(e) => set("dept")(e.target.value)} className="w-full rounded-xl px-3 py-3 text-[13px] outline-none"
              style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }}>
              {[...ROLES, ADVISOR_ROLE].map((r) => <option key={r.id} value={r.id} style={{ background: "#FFFFFF" }}>{r[lang].t}</option>)}
            </select>
          </label>
          <GateField label={x.empPosition} val={form.position} set={set("position")} ph="" Icon={BadgeCheck} type="text" accent={role.accent} />
          <GateField label={x.empSalary} val={form.salary} set={set("salary")} ph="0" Icon={CircleDollarSign} type="number" accent={role.accent} />
          <GateField label={x.empPassword} val={form.password} set={set("password")} ph="••••••••" Icon={KeyRound} type="text" accent={role.accent} />
          <label className="block">
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.empPhoto}</span>
            <span className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 cursor-pointer" style={{ background: "rgba(0,0,0,.22)", border: `1px dashed ${form.photo ? role.accent : "var(--line)"}` }}>
              {form.photo ? <img src={form.photo} alt="" className="w-8 h-8 rounded-lg object-cover" /> : <ImagePlus size={16} style={{ color: "var(--muted)" }} />}
              <span className="text-[12px] font-semibold" style={{ color: form.photo ? role.accent : "var(--muted)" }}>{form.photo ? x.uploaded : x.uploadTap}</span>
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </span>
          </label>
        </div>
        {form.dept === "ops" && (
          <label className="flex items-center gap-2.5 mt-3.5 cursor-pointer">
            <input type="checkbox" checked={form.isSupervisor} onChange={(e) => set("isSupervisor")(e.target.checked)} className="w-4 h-4" />
            <span className="text-[12.5px] font-semibold">{x.isSupervisorLbl}</span>
          </label>
        )}
        {err && <p className="mt-3 text-[11.5px] flex items-start gap-1.5" style={{ color: "#E8837A" }}><AlertTriangle size={14} className="mt-px shrink-0" />{err}</p>}
        <div className="mt-4"><Btn variant="accent" accent={role.glow} icon={UserPlus} onClick={submit}>{x.save}</Btn></div>
      </Panel>
      <Panel title={t.nav.employees}>
        {employees.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-2.5">
            {employees.map((p) => (
              <div key={p.id} className="rounded-2xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <div className="flex items-center gap-3">
                  <Avatar p={p} />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold truncate">{p.name}</span>
                      {p.isSupervisor && <Chip tone="info" sm>{x.isSupervisorLbl}</Chip>}
                      {!p.password && <Chip tone="warn" sm>{x.noPasswordSet}</Chip>}
                      {p.status === "suspended" && <Chip tone="bad" sm>{x.suspendedBadge}</Chip>}
                    </span>
                    <span className="block text-[11px] truncate" style={{ color: "var(--muted)" }}>{dn(p.dept)} · {p.position}</span>
                    {(role.id === "gm" || role.id === "fin") && (
                      <span className="num block text-[10.5px] mt-0.5" style={{ color: p.salary ? "#0FA579" : "#B8862E" }}>
                        {p.salary ? `${money(p.salary)} ${t.sar}/${x.perMonth}` : x.noSalarySet}
                      </span>
                    )}
                  </span>
                  {(role.id === "gm" || role.id === "fin") && (
                    <button onClick={() => { setSalaryEditId(salaryEditId === p.id ? null : p.id); setSalaryInput(p.salary || ""); }} className="p-1.5 rounded-lg shrink-0" style={{ color: "var(--muted)" }} aria-label="edit-salary">
                      <CircleDollarSign size={14} />
                    </button>
                  )}
                  {canSuspend && (
                    <button onClick={() => { const next = p.status === "suspended" ? "active" : "suspended"; setEmployees((prev) => prev.map((e2) => (e2.id === p.id ? { ...e2, status: next } : e2))); logAudit(setAuditLog, role, next === "suspended" ? "employee_suspend" : "employee_reactivate", p.name, actingEmployee); }}
                      className="p-1.5 rounded-lg shrink-0" style={{ color: p.status === "suspended" ? "#4FD1A5" : "#E4B85C" }} aria-label="suspend">
                      {p.status === "suspended" ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
                    </button>
                  )}
                  <button onClick={() => setResetId(resetId === p.id ? null : p.id)} className="p-1.5 rounded-lg shrink-0" style={{ color: "var(--muted)" }} aria-label="reset-password">
                    <KeyRound size={14} />
                  </button>
                  <button onClick={() => { setEmployees((prev) => prev.filter((x2) => x2.id !== p.id)); logAudit(setAuditLog, role, "employee_delete", p.name, actingEmployee); }} className="p-1.5 rounded-lg shrink-0" style={{ color: "#E8837A" }} aria-label="delete">
                    <Trash2 size={14} />
                  </button>
                </div>
                {resetId === p.id && (
                  <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
                    <input value={resetPw} onChange={(e) => setResetPw(e.target.value)} placeholder="••••••••" type="text"
                      className="num flex-1 rounded-lg px-3 py-2 text-[12.5px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
                    <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => {
                      if (resetPw.length < 4) return;
                      setEmployees((prev) => prev.map((e2) => (e2.id === p.id ? { ...e2, password: resetPw } : e2)));
                      setResetId(null); setResetPw("");
                    }}>{x.save}</Btn>
                  </div>
                )}
                {salaryEditId === p.id && (
                  <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
                    <input value={salaryInput} onChange={(e) => setSalaryInput(e.target.value)} placeholder="0" type="number"
                      className="num flex-1 rounded-lg px-3 py-2 text-[12.5px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
                    <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => {
                      setEmployees((prev) => prev.map((e2) => (e2.id === p.id ? { ...e2, salary: +salaryInput || 0 } : e2)));
                      logAudit(setAuditLog, role, "employee_salary_update", `${p.name}: ${salaryInput}`, actingEmployee);
                      setSalaryEditId(null); setSalaryInput("");
                    }}>{x.save}</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function ContractsPage({ lang, role, contracts, setContracts }) {
  const t = T[lang], x = EX[lang];
  const statusOpts = ["active", "expiring", "review", "closed"].map((s) => ({ value: s, label: t.s[s] }));
  const add = (v) => setContracts((prev) => [...prev, { id: "CT-" + Date.now(), party: v.party, type: v.type, s: v.start, e: v.end, val: +v.val || 0, st: v.st }]);
  return (
    <div className="space-y-4">
      <QuickAddPanel lang={lang} role={role} title={x.addContract} icon={FileSignature} onSubmit={add}
        fields={[
          { key: "party", label: x.contractParty, required: true },
          { key: "type", label: x.contractType, required: true },
          { key: "start", label: t.h.start, type: "date" },
          { key: "end", label: t.h.end, type: "date" },
          { key: "val", label: x.contractValue, type: "number" },
          { key: "st", label: t.h.status, type: "select", options: statusOpts },
        ]} />
      <Panel title={t.nav.contracts}>
        {contracts.length === 0 ? <EmptyHint lang={lang} /> : (
          <DataTable
            headers={[t.h.party, t.h.type, t.h.start, t.h.end, t.h.amount, t.h.status]}
            rows={contracts.map((c) => ({
              key: c.id || c.party,
              onDelete: () => setContracts((prev) => prev.filter((x2) => x2 !== c)),
              cells: [
                { v: c.party, strong: 1 }, { v: c.type }, { v: c.s, mono: 1, dim: 1 },
                { v: c.e, mono: 1, dim: 1 }, { v: money(c.val) + " " + t.sar, mono: 1 },
                { chip: { tone: TONE[c.st], label: t.s[c.st] } },
              ],
            }))}
            onBulkDelete={(keys) => setContracts((prev) => prev.filter((c) => !keys.includes(c.id || c.party)))} />
        )}
      </Panel>
    </div>
  );
}

function CasesPage({ lang, role, cases, setCases }) {
  const t = T[lang], x = EX[lang];
  const statusOpts = ["open", "review", "closed"].map((s) => ({ value: s, label: t.s[s] }));
  const add = (v) => setCases((prev) => [{ no: "LC-" + Date.now().toString().slice(-8), ct: v.ct, sub: v.sub, h: v.h, st: v.st }, ...prev]);
  return (
    <div className="space-y-4">
      <QuickAddPanel lang={lang} role={role} title={x.addCase} icon={Gavel} onSubmit={add}
        fields={[
          { key: "ct", label: x.caseAuthority, required: true },
          { key: "sub", label: x.caseSubject, required: true },
          { key: "h", label: t.h.hearing, type: "date" },
          { key: "st", label: t.h.status, type: "select", options: statusOpts },
        ]} />
      <Panel title={t.nav.cases}>
        {cases.length === 0 ? <EmptyHint lang={lang} /> : (
          <DataTable
            headers={[t.h.caseNo, t.h.court, t.h.subject, t.h.hearing, t.h.status]}
            rows={cases.map((c) => ({
              key: c.no,
              onDelete: () => setCases((prev) => prev.filter((x2) => x2.no !== c.no)),
              cells: [
                { v: c.no, mono: 1 }, { v: c.ct, dim: 1 }, { v: c.sub },
                { v: c.h, mono: 1 }, { chip: { tone: TONE[c.st], label: t.s[c.st] } },
              ],
            }))}
            onBulkDelete={(keys) => setCases((prev) => prev.filter((c) => !keys.includes(c.no)))} />
        )}
      </Panel>
    </div>
  );
}

function CharterPage({ lang, role, weekendFine, setWeekendFine, charterClauses, setCharterClauses, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const canEdit = role.id === "legal";
  const [fineInput, setFineInput] = useState(weekendFine);
  const [showAdd, setShowAdd] = useState(false);
  const [cTitle, setCTitle] = useState("");
  const [cBody, setCBody] = useState("");

  const saveFine = () => {
    if (!fineInput || fineInput < 0) return;
    setWeekendFine(fineInput);
    logAudit(setAuditLog, role, "charter_fine_update", String(fineInput), actingEmployee);
  };
  const addClause = () => {
    if (cTitle.trim().length < 3 || cBody.trim().length < 3) return;
    setCharterClauses((prev) => [{ id: "CL-" + Date.now(), title: cTitle, body: cBody, date: riyadhToday() }, ...prev]);
    logAudit(setAuditLog, role, "charter_clause_add", cTitle, actingEmployee);
    setCTitle(""); setCBody(""); setShowAdd(false);
  };

  const builtIn = [
    { icon: CalendarClock, title: x.weekendFineT, desc: x.weekendFineDesc, badge: `${weekendFine} ${t.sar}` },
    { icon: ShieldAlert, title: x.reputationT, desc: x.reputationDesc },
    { icon: Scale, title: x.investigationT, desc: x.investigationDesc },
    { icon: Radio, title: x.routingT, desc: x.routingDesc },
  ];

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(125deg,rgba(${role.glow},.16),rgba(${role.glow},.02) 60%)`, border: `1px solid rgba(${role.glow},.32)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <Scale size={19} style={{ color: role.accent }} />
          <h2 className="text-[16px] font-extrabold">{x.charterPageT}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.charterPageSub}</p>
      </div>

      {canEdit && (
        <Panel title={x.weekendFineT}>
          <div className="flex items-center gap-2.5">
            <span className="flex-1 flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)" }}>
              <CircleDollarSign size={15} style={{ color: role.accent }} />
              <input type="number" value={fineInput} onChange={(e) => setFineInput(+e.target.value)}
                className="num flex-1 bg-transparent border-0 outline-none text-[14px]" style={{ color: "#12151D" }} />
              <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{t.sar}</span>
            </span>
            <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={saveFine}>{x.saveFine}</Btn>
          </div>
        </Panel>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {builtIn.map((c, i) => (
          <div key={i} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="grid place-items-center w-9 h-9 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.13)` }}>
                <c.icon size={16} style={{ color: role.accent }} />
              </span>
              {c.badge && <Chip tone="warn" sm>{c.badge}</Chip>}
            </div>
            <p className="text-[13px] font-bold">{c.title}</p>
            <p className="text-[11.5px] mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>{c.desc}</p>
          </div>
        ))}
      </div>

      {canEdit && !showAdd && <Btn variant="gold" icon={Plus} onClick={() => setShowAdd(true)}>{x.addClauseBtn}</Btn>}
      {canEdit && showAdd && (
        <Panel title={x.addClauseBtn}>
          <div className="space-y-3">
            <GateField label={x.clauseTitleLbl} val={cTitle} set={setCTitle} ph="" Icon={FileSignature} type="text" accent={role.accent} />
            <label className="block">
              <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.clauseBodyLbl}</span>
              <textarea value={cBody} onChange={(e) => setCBody(e.target.value)} rows={3}
                className="w-full rounded-xl px-3.5 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
            </label>
            <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={addClause}>{x.saveClause}</Btn>
          </div>
        </Panel>
      )}

      <Panel title={x.addClauseBtn}>
        {charterClauses.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.noClausesYet}</p> : (
          <div className="space-y-2.5">
            {charterClauses.map((c) => (
              <div key={c.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold">{c.title}</p>
                  {canEdit && (
                    <button onClick={() => setCharterClauses((prev) => prev.filter((c2) => c2.id !== c.id))} className="p-1 rounded-lg" style={{ color: "#E8837A" }}><Trash2 size={13} /></button>
                  )}
                </div>
                <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>{c.body}</p>
                <p className="num text-[10px] mt-2" style={{ color: "var(--muted)" }}>{c.date}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function CompliancePage({ lang, role }) {
  const t = T[lang], x = EX[lang];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {x.compItems.map(([n, s]) => {
        const tone = s === x.compItems[2][1] ? "warn" : s === x.compItems[4][1] ? "info" : "ok";
        return (
          <div key={n} className="glass rounded-2xl p-4 flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.12)`, border: `1px solid rgba(${role.glow},.28)` }}>
              <ShieldCheck size={17} style={{ color: role.accent }} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-bold truncate">{n}</span>
              <span className="block text-[11px]" style={{ color: "var(--muted)" }}>{t.nav.compliance}</span>
            </span>
            <Chip tone={tone} sm>{s}</Chip>
          </div>
        );
      })}
    </div>
  );
}

function ApprovalsPage({ lang, role, approvalReqs, setApprovalReqs }) {
  const t = T[lang], x = EX[lang];
  const dn = (id) => (ALL_ROLES.find((r) => r.id === id) || {})[lang]?.t || id;
  const deptOpts = ROLES.map((r) => ({ value: r.id, label: r[lang].t }));
  const urgencyOpts = ["high", "medium", "low"].map((u) => ({ value: u, label: t.u[u] }));
  const add = (v) => setApprovalReqs((prev) => [{ id: "AP-" + Date.now(), title: v.title, by: v.by, amt: +v.amt || 0, u: v.u, status: null }, ...prev]);
  const setStatus = (id, status) => setApprovalReqs((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  return (
    <div className="space-y-4">
      <QuickAddPanel lang={lang} role={role} title={x.addApproval} icon={BadgeCheck} onSubmit={add}
        fields={[
          { key: "title", label: x.approvalTitle, required: true },
          { key: "by", label: t.h.by, type: "select", options: deptOpts },
          { key: "amt", label: x.approvalAmount, type: "number" },
          { key: "u", label: t.h.urgency, type: "select", options: urgencyOpts },
        ]} />
      {approvalReqs.length === 0 ? <EmptyHint lang={lang} /> : (
        <div className="space-y-3">
          {approvalReqs.map((a) => (
            <div key={a.id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold leading-snug">{a.title}</h4>
                  <p className="text-[11.5px] mt-1" style={{ color: "var(--muted)" }}>
                    {t.h.by}: {dn(a.by)} · <span className="num">{fmt(a.amt)}</span> {t.sar}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Chip tone={a.u === "high" ? "bad" : a.u === "medium" ? "warn" : "n"} sm>{t.u[a.u]}</Chip>
                  <button onClick={() => setApprovalReqs((prev) => prev.filter((x2) => x2.id !== a.id))} className="p-1 rounded-lg" style={{ color: "#E8837A" }} aria-label="delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-3.5">
                {a.status ? <Chip tone={a.status === "ok" ? "ok" : "bad"}>{a.status === "ok" ? t.s.approved : t.reject}</Chip> : (
                  <>
                    <Btn variant="gold" icon={CheckCircle2} onClick={() => setStatus(a.id, "ok")}>{t.approve}</Btn>
                    <Btn variant="danger" icon={X} onClick={() => setStatus(a.id, "no")}>{t.reject}</Btn>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════  تحليل أداء المناديب (مكوّن مشترك)  ═══════════ */
function RepPerformanceAnalytics({ lang, role, reps }) {
  const t = T[lang], x = EX[lang];
  const active = reps.filter((r) => r.status === "active");
  const totalViol = active.reduce((a, r) => a + (r.weekendViolations || 0) + (r.appViolations || 0), 0);
  const top = active.slice().sort((a, b) => (b.orders || 0) - (a.orders || 0))[0];
  const name = (r) => (lang === "en" ? r.en : r.ar);

  return (
    <Panel title={x.perfAnalytics} extra={<Chip tone="ok" sm><span className="w-1.5 h-1.5 rounded-full bg-current" />{t.live}</Chip>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label={x.totalActiveReps} value={String(active.length)} icon={Bike} accent={role.glow} />
        <Kpi label={x.totalViolations} value={String(totalViol)} icon={AlertTriangle} accent={role.glow} />
        <Kpi label={x.topPerformer} value={top ? name(top) : "—"} icon={Star} accent={role.glow} />
      </div>
    </Panel>
  );
}

/* ═══════════  توظيف المناديب — الموارد البشرية  ═══════════ */
function HiringPage({ lang, role, reps, setReps, employees, setAuditLog, actingEmployee, applications, setApplications }) {
  const t = T[lang], x = EX[lang];
  const canManage = role.id === "opsm" || role.id === "gm" || role.id === "hr";
  const SUP_LIST = supervisorsOf(employees);
  const [form, setForm] = useState({ name: "", phone: "", nid: "", riderId: "", idExpiry: "", vehicle: "car", app: "hs", empType: "kafala", idPhoto: null, licPhoto: null, photo: null, password: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [pickSup, setPickSup] = useState(null);
  const [chosenSup, setChosenSup] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const hasRealSupervisors = employees.some((e) => e.dept === "ops" && e.isSupervisor);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const onFile = (k) => (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, [k]: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (form.name.trim().length < 3) return setErr(x.errRepName);
    if (!/^0?\d{9,10}$/.test(form.phone.replace(/\s/g, ""))) return setErr(x.errRepPhone);
    if (!/^\d{10}$/.test(form.nid)) return setErr(x.errRepNid);
    if (reps.some((r) => r.nid === form.nid)) return setErr(x.errRepNid);
    if (!form.idExpiry) return setErr(x.errRepExpiry);
    if (form.riderId.trim() && reps.some((r) => r.app === form.app && String(r.riderId || "").trim() === form.riderId.trim())) return setErr(RA[lang].errRiderDup);
    if (!form.idPhoto || !form.licPhoto) return setErr(x.errRepPhotos);
    if (form.password.length < 4) return setErr(x.errRepPass);
    setErr("");
    const id = "R-" + (1000 + reps.length + Math.floor(Math.random() * 90));
    setReps((prev) => [...prev, { id, ar: form.name, en: form.name, phone: form.phone, nid: form.nid, riderId: form.riderId.trim(), idExpiry: form.idExpiry,
      vehicle: form.vehicle, app: form.app, empType: form.empType, status: "pending", sup: null, password: form.password, photo: form.photo,
      orders: 0, hours: 0, km: 0, weekendViolations: 0, appViolations: 0 }]);
    logAudit(setAuditLog, role, "rep_add", `${form.name} (${id})`, actingEmployee);
    setForm({ name: "", phone: "", nid: "", riderId: "", idExpiry: "", vehicle: "car", app: "hs", empType: "kafala", idPhoto: null, licPhoto: null, photo: null, password: "" });
    setOk(x.repAdded);
    setTimeout(() => setOk(""), 3500);
  };

  const activate = (id) => {
    if (!chosenSup) return;
    setReps(reps.map((r) => (r.id === id ? { ...r, status: "active", sup: chosenSup } : r)));
    logAudit(setAuditLog, role, "rep_activate", id, actingEmployee);
    setPickSup(null); setChosenSup("");
  };
  const deleteRep = (id) => { setReps((prev) => prev.filter((r) => r.id !== id)); logAudit(setAuditLog, role, "rep_delete", id, actingEmployee); };
  const startEdit = (r) => { setEditId(r.id); setEditForm({ name: r.ar, phone: r.phone, riderId: r.riderId || "", idExpiry: r.idExpiry, vehicle: r.vehicle, app: r.app, empType: r.empType, sup: r.sup || "" }); };
  const saveEdit = () => {
    setReps((prev) => prev.map((r) => (r.id === editId ? { ...r, ar: editForm.name, en: editForm.name, phone: editForm.phone, riderId: (editForm.riderId || "").trim(), idExpiry: editForm.idExpiry, vehicle: editForm.vehicle, app: editForm.app, empType: editForm.empType, sup: editForm.sup || r.sup } : r)));
    setEditId(null); setEditForm(null);
  };

  const pending = reps.filter((r) => r.status === "pending");
  const active = reps.filter((r) => r.status === "active");
  const supName = (sid) => SUP_LIST.find((s) => s.id === sid)?.[lang] || "—";
  const appName = (aid) => APPS.find((a) => a.id === aid)?.[lang] || aid;
  const Avatar = ({ p, size = 36 }) => p.photo
    ? <img src={p.photo} alt="" className="rounded-xl object-cover shrink-0" style={{ width: size, height: size }} />
    : <span className="grid place-items-center rounded-xl shrink-0" style={{ width: size, height: size, background: `rgba(${role.glow},.13)` }}>
        {p.vehicle === "car" ? <Car size={size * 0.45} style={{ color: role.accent }} /> : <Bike size={size * 0.45} style={{ color: role.accent }} />}
      </span>;
  const FileBox = ({ label, val, onChange }) => (
    <label className="block">
      <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{label}</span>
      <span className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 cursor-pointer" style={{ background: "rgba(0,0,0,.22)", border: `1px dashed ${val ? role.accent : "var(--line)"}` }}>
        {val ? <img src={val} alt="" className="w-9 h-9 rounded-lg object-cover" /> : <ImagePlus size={18} style={{ color: "var(--muted)" }} />}
        <span className="text-[12px] font-semibold" style={{ color: val ? role.accent : "var(--muted)" }}>{val ? x.uploaded : x.uploadTap}</span>
        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
      </span>
    </label>
  );

  return (
    <div className="space-y-4">
      {applications && <ApplicationsPanel lang={lang} role={role} applications={applications} setApplications={setApplications} reps={reps} setReps={setReps} setAuditLog={setAuditLog} actingEmployee={actingEmployee} />}
      <Panel title={x.addRepBtn} extra={<span className="grid place-items-center w-8 h-8 rounded-xl" style={{ background: `rgba(${role.glow},.13)`, border: `1px solid rgba(${role.glow},.28)` }}><UserPlus size={15} style={{ color: role.accent }} /></span>}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <GateField label={x.repName} val={form.name} set={set("name")} ph="محمد العنزي" Icon={User} type="text" accent={role.accent} />
          <GateField label={x.repPhone} val={form.phone} set={set("phone")} ph="05xxxxxxxx" Icon={Phone} type="tel" accent={role.accent} />
          <GateField label={x.repNid} val={form.nid} set={set("nid")} ph="10xxxxxxxx" Icon={CreditCard} type="text" accent={role.accent} />
          <GateField label={RA[lang].riderId} val={form.riderId} set={set("riderId")} ph={RA[lang].riderIdPh} Icon={Hash} accent={role.accent} />
          <GateField label={x.repIdExpiry} val={form.idExpiry} set={set("idExpiry")} ph="" Icon={CalendarDays} type="date" accent={role.accent} />
          <GateField label={x.repPassword} val={form.password} set={set("password")} ph="••••••••" Icon={KeyRound} type="text" accent={role.accent} />
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 mt-3.5">
          <div>
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.repVehicle}</span>
            <div className="flex gap-2">
              {["car", "bike"].map((v) => (
                <button key={v} onClick={() => set("vehicle")(v)} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12.5px] font-bold transition"
                  style={{ background: form.vehicle === v ? `rgba(${role.glow},.15)` : "rgba(20,27,45,.04)", border: `1px solid ${form.vehicle === v ? `rgba(${role.glow},.4)` : "var(--line)"}`, color: form.vehicle === v ? role.accent : "var(--muted)" }}>
                  {v === "car" ? <Car size={15} /> : <Bike size={15} />}{VEHICLES[v][lang]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.repEmpType}</span>
            <div className="flex gap-2">
              {["kafala", "ajeer"].map((v) => (
                <button key={v} onClick={() => set("empType")(v)} className="flex-1 rounded-xl py-2.5 text-[12.5px] font-bold transition"
                  style={{ background: form.empType === v ? `rgba(${role.glow},.15)` : "rgba(20,27,45,.04)", border: `1px solid ${form.empType === v ? `rgba(${role.glow},.4)` : "var(--line)"}`, color: form.empType === v ? role.accent : "var(--muted)" }}>
                  {EMP_TYPES[v][lang]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3.5">
          <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.repApp}</span>
          <div className="flex gap-2 flex-wrap">
            {APPS.map((a) => (
              <button key={a.id} onClick={() => set("app")(a.id)} className="px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition"
                style={{ background: form.app === a.id ? `rgba(${role.glow},.15)` : "rgba(20,27,45,.04)", border: `1px solid ${form.app === a.id ? `rgba(${role.glow},.4)` : "var(--line)"}`, color: form.app === a.id ? role.accent : "var(--muted)" }}>
                {a[lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-3 mt-3.5">
          <FileBox label={x.empPhoto} val={form.photo} onChange={(e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((f) => ({ ...f, photo: reader.result })); reader.readAsDataURL(file); }} />
          <FileBox label={x.idPhoto} val={form.idPhoto} onChange={onFile("idPhoto")} />
          <FileBox label={x.licPhoto} val={form.licPhoto} onChange={onFile("licPhoto")} />
        </div>

        {err && <p className="mt-3 text-[11.5px] flex items-start gap-1.5" style={{ color: "#E8837A" }}><AlertTriangle size={14} className="mt-px shrink-0" />{err}</p>}
        {ok && <p className="mt-3 text-[11.5px] flex items-start gap-1.5" style={{ color: "#4FD1A5" }}><CheckCircle2 size={14} className="mt-px shrink-0" />{ok}</p>}
        <div className="mt-4"><Btn variant="accent" accent={role.glow} icon={UserPlus} onClick={submit}>{x.submitRep}</Btn></div>
      </Panel>

      <Panel title={`${x.pendingReps} (${pending.length})`}>
        {pending.length === 0 ? (
          <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.noPending}</p>
        ) : (
          <div className="space-y-2.5">
            {pending.map((r) => (
              <div key={r.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar p={r} />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold truncate">{lang === "en" ? r.en : r.ar}</span>
                      <span className="num block text-[11px] truncate" style={{ color: "var(--muted)" }}>{r.phone} · {appName(r.app)} · {EMP_TYPES[r.empType][lang]}</span>
                    </span>
                  </div>
                  <Chip tone="warn" sm>{t.s.pending}</Chip>
                  {canManage && <button onClick={() => deleteRep(r.id)} className="p-1.5 rounded-lg" style={{ color: "#E8837A" }} aria-label="delete"><Trash2 size={14} /></button>}
                </div>
                {pickSup === r.id ? (
                  <div className="flex items-center gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid var(--line)" }}>
                    <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>{x.chooseSup}:</span>
                    {!hasRealSupervisors ? (
                      <p className="text-[11.5px]" style={{ color: "#E8837A" }}>{x.noSupervisorYet}</p>
                    ) : (
                      <>
                        <select value={chosenSup} onChange={(e) => setChosenSup(e.target.value)} className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold outline-none"
                          style={{ background: "rgba(20,27,45,.05)", border: "1px solid var(--line)", color: "#12151D" }}>
                          <option value="" style={{ background: "#FFFFFF" }}>{x.pleaseChoose}</option>
                          {SUP_LIST.map((s) => <option key={s.id} value={s.id} style={{ background: "#FFFFFF" }}>{s[lang]}</option>)}
                        </select>
                        <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => activate(r.id)}>{x.confirmActivate}</Btn>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mt-3"><Btn variant="gold" icon={ArrowUpRight} onClick={() => { setPickSup(r.id); setChosenSup(""); }}>{x.activateBtn}</Btn></div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title={`${x.activeReps2} (${active.length})`}>
        {active.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-2.5">
            {active.map((r) => (
              <div key={r.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar p={r} />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold truncate">{lang === "en" ? r.en : r.ar}</span>
                      <span className="num block text-[11px] truncate" style={{ color: "var(--muted)" }}>{r.phone} · {VEHICLES[r.vehicle][lang]}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Chip tone="info" sm><Navigation size={11} />{x.repOf} {supName(r.sup)}</Chip>
                    {canManage && <button onClick={() => startEdit(r)} className="p-1.5 rounded-lg" style={{ color: "var(--muted)" }} aria-label="edit"><SlidersHorizontal size={14} /></button>}
                    {canManage && <button onClick={() => deleteRep(r.id)} className="p-1.5 rounded-lg" style={{ color: "#E8837A" }} aria-label="delete"><Trash2 size={14} /></button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {editId && editForm && (
        <div className="fixed inset-0 z-[60] grid place-items-center px-5" style={{ background: "rgba(3,5,10,.72)" }} onClick={() => setEditId(null)}>
          <div className="glass rounded-3xl p-6 w-full max-w-md rise" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[15px] font-extrabold mb-4">{x.editRepT}</h3>
            <div className="space-y-3">
              <GateField label={x.repName} val={editForm.name} set={(v) => setEditForm((f) => ({ ...f, name: v }))} ph="" Icon={User} type="text" accent={role.accent} />
              <GateField label={x.repPhone} val={editForm.phone} set={(v) => setEditForm((f) => ({ ...f, phone: v }))} ph="" Icon={Phone} type="tel" accent={role.accent} />
              <GateField label={RA[lang].riderId} val={editForm.riderId || ""} set={(v) => setEditForm((f) => ({ ...f, riderId: v }))} ph={RA[lang].riderIdPh} Icon={Hash} accent={role.accent} />
              <GateField label={x.repIdExpiry} val={editForm.idExpiry} set={(v) => setEditForm((f) => ({ ...f, idExpiry: v }))} ph="" Icon={CalendarDays} type="date" accent={role.accent} />
              <div className="flex gap-2">
                {["car", "bike"].map((v) => (
                  <button key={v} onClick={() => setEditForm((f) => ({ ...f, vehicle: v }))} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12.5px] font-bold transition"
                    style={{ background: editForm.vehicle === v ? `rgba(${role.glow},.15)` : "rgba(20,27,45,.04)", border: `1px solid ${editForm.vehicle === v ? `rgba(${role.glow},.4)` : "var(--line)"}`, color: editForm.vehicle === v ? role.accent : "var(--muted)" }}>
                    {v === "car" ? <Car size={15} /> : <Bike size={15} />}{VEHICLES[v][lang]}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.repOf}</span>
                <select value={editForm.sup} onChange={(e) => setEditForm((f) => ({ ...f, sup: e.target.value }))} className="w-full rounded-xl px-3 py-3 text-[13px] outline-none"
                  style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }}>
                  {SUP_LIST.map((s) => <option key={s.id} value={s.id} style={{ background: "#FFFFFF" }}>{s[lang]}</option>)}
                </select>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <Btn full onClick={() => setEditId(null)}>{x.cancel}</Btn>
              <Btn full variant="accent" accent={role.glow} icon={CheckCircle2} onClick={saveEdit}>{x.save}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════  أداء المناديب — مشرف التشغيل  ═══════════ */
/* ═══════════  نبض المناديب المباشر  ═══════════ */
function DriverCard({ r, role, lang, state, tone, shift, clock, x, t }) {
  const [open, setOpen] = useState(false);
  const stateLabel = state === "onDuty" ? x.onDutyLive : state === "late" ? x.lateForShift : state === "booked" ? x.bookedNotIn : state === "done" ? t.s.closed : x.noShiftToday;
  const borderColor = state === "onDuty" ? "rgba(63,216,180,.4)" : state === "late" ? "rgba(232,131,122,.45)" : "var(--line)";
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: "var(--surface-1)", border: `1px solid ${borderColor}`, transitionTimingFunction: "var(--ease-out)" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3.5 text-start">
        <span className="relative shrink-0">
          {r.photo ? <img src={r.photo} alt="" className="w-12 h-12 rounded-2xl object-cover" />
            : <span className="grid place-items-center w-12 h-12 rounded-2xl" style={{ background: `rgba(${role.glow},.14)` }}>
                {r.vehicle === "car" ? <Car size={20} style={{ color: role.accent }} /> : <Bike size={20} style={{ color: role.accent }} />}
              </span>}
          {state === "onDuty" && <span className="absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 rounded-full pulse-dot" style={{ background: "#3FD8B4", border: "2px solid var(--surface-1)" }} />}
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="text-[13.5px] font-bold truncate">{lang === "en" ? r.en : r.ar}</span>
          </span>
          <span className="block text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
            {shift ? `${shift.start} → ${shift.end}` : x.noShiftToday}
          </span>
        </span>
        <span className="flex flex-col items-end gap-1 shrink-0">
          <Chip tone={tone} sm>{stateLabel}</Chip>
          <ChevronRight size={14} style={{ color: "var(--muted-2)", transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform .3s var(--ease-spring)" }} />
        </span>
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5" style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          <div className="rounded-xl p-2.5" style={{ background: "var(--surface-2)" }}>
            <p className="text-[9.5px]" style={{ color: "var(--muted-2)" }}>{x.ordersCol}</p>
            <p className="num text-[15px] font-bold mt-0.5">{r.orders || 0}</p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: "var(--surface-2)" }}>
            <p className="text-[9.5px]" style={{ color: "var(--muted-2)" }}>{RA[lang].riderId}</p>
            <p className="num text-[15px] font-bold mt-0.5">{r.riderId || "—"}</p>
          </div>
          <div className="rounded-xl p-2.5" style={{ background: "var(--surface-2)" }}>
            <p className="text-[9.5px]" style={{ color: "var(--muted-2)" }}>{RA[lang].phoneL}</p>
            <p className="num text-[15px] font-bold mt-0.5">{r.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PulsePage({ lang, role, reps, shifts, attendance, violationPenalty, weekendFine }) {
  const t = T[lang], x = EX[lang];
  const today = riyadhToday();
  const nowHM = riyadhTimeHM();
  const active = reps.filter((r) => r.status === "active");

  const rows = active.map((r) => {
    const shift = shifts.filter((s) => s.repId === r.nid && s.date === today).slice(-1)[0];
    const clock = attendance.find((a) => a.key === r.nid && a.date === today);
    let state = "none", tone = "n";
    if (clock && !clock.out) { state = "onDuty"; tone = "ok"; }
    else if (clock && clock.out) { state = "done"; tone = "n"; }
    else if (shift) {
      const [sh, sm] = shift.start.split(":").map(Number);
      const [nh, nm] = nowHM.split(":").map(Number);
      const graceMin = (nh * 60 + nm) - (sh * 60 + sm);
      if (graceMin > 15) { state = "late"; tone = "bad"; } else { state = "booked"; tone = "warn"; }
    }
    return { r, shift, clock, state, tone };
  });
  const onDutyCount = rows.filter((r) => r.state === "onDuty").length;
  const bookedCount = rows.filter((r) => r.state === "booked").length;
  const lateCount = rows.filter((r) => r.state === "late").length;

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4" style={{ background: `linear-gradient(100deg,rgba(${role.glow},.13),rgba(${role.glow},.03))`, border: `1px solid rgba(${role.glow},.28)` }}>
        <div className="flex items-center gap-2.5 mb-1">
          <Radio size={18} style={{ color: role.accent }} />
          <h2 className="text-[15px] font-extrabold">{x.pulseTitle}</h2>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.pulseSub}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi label={x.onDutyLive} value={String(onDutyCount)} icon={Fingerprint} accent="63,216,180" />
        <Kpi label={x.bookedNotIn} value={String(bookedCount)} icon={Clock} accent="228,184,92" />
        <Kpi label={x.lateForShift} value={String(lateCount)} icon={AlertTriangle} accent="232,131,122" />
      </div>

      <Panel title={t.k.activeReps}>
        {rows.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {rows.map(({ r, shift, clock, state, tone }) => (
              <DriverCard key={r.id} r={r} role={role} lang={lang} state={state} tone={tone} shift={shift} clock={clock} x={x} t={t} violationPenalty={violationPenalty} weekendFine={weekendFine} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function ShiftsPage({ lang, role, reps, setReps, reports, setReports, goPage, employees }) {
  const t = T[lang], x = EX[lang];
  const SUP_LIST = supervisorsOf(employees);
  const [sup, setSup] = useState(SUP_LIST[0].id);
  const [date, setDate] = useState(riyadhToday());
  const [saved, setSaved] = useState(false);
  const [dayApp, setDayApp] = useState({});

  const mineAll = reps.filter((r) => r.status === "active" && r.sup === sup);
  const mine = mineAll.filter((r) => r.empType !== "ajeer");
  const mineAjeer = mineAll.filter((r) => r.empType === "ajeer");
  const update = (id, field, val) => setReps(reps.map((r) => (r.id === id ? { ...r, [field]: val === "" ? 0 : +val } : r)));
  const Avatar = ({ p, size = 36 }) => p.photo
    ? <img src={p.photo} alt="" className="rounded-xl object-cover shrink-0" style={{ width: size, height: size }} />
    : <span className="grid place-items-center rounded-xl shrink-0" style={{ width: size, height: size, background: `rgba(${role.glow},.13)` }}>
        {p.vehicle === "car" ? <Car size={size * 0.44} style={{ color: role.accent }} /> : <Bike size={size * 0.44} style={{ color: role.accent }} />}
      </span>;

  const historicalAvg = (repId) => {
    const past = [];
    reports.forEach((rp) => rp.entries.forEach((e) => { if (e.id === repId) past.push(e.orders || 0); }));
    if (past.length < 3) return null;
    return past.reduce((a, o) => a + o, 0) / past.length;
  };

  const save = () => {
    const entries = mineAll.map((r) => ({ id: r.id, orders: r.orders, hours: r.hours, km: r.km, weekendViolations: r.weekendViolations || 0, appViolations: r.appViolations || 0, app: dayApp[r.id] || r.app }));
    const id = "RPT-" + Math.floor(1000 + Math.random() * 8999);
    setReports((prev) => [{ id, date, sup, by: "ops", entries, hrStatus: "pending" }, ...prev]);
    setSaved(true);
    setTimeout(() => { setSaved(false); goPage("reports"); }, 700);
  };

  const RepRow = ({ r }) => {
    const avg = historicalAvg(r.id);
    const declined = avg != null && r.orders < avg * 0.5;
    return (
      <div className="rounded-2xl p-3.5" style={{ background: declined ? "rgba(232,131,122,.06)" : "rgba(20,27,45,.035)", border: `1px solid ${declined ? "rgba(232,131,122,.35)" : "var(--line)"}` }}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar p={r} />
            <span className="min-w-0">
              <span className="block text-[13px] font-bold truncate">{lang === "en" ? r.en : r.ar}</span>
              <span className="num block text-[11px]" style={{ color: "var(--muted)" }}>{r.phone}</span>
            </span>
          </div>
          <span className="flex items-center gap-2 shrink-0">
            <select value={dayApp[r.id] || r.app || "hs"} onChange={(e) => setDayApp((p) => ({ ...p, [r.id]: e.target.value }))} title={RA[lang].dayApp}
              className="rounded-lg px-2 py-1.5 text-[11px] font-bold outline-none" style={{ background: "#fff", border: "1px solid var(--line-strong)", color: "#12151D" }}>
              {APPS.map((a) => <option key={a.id} value={a.id}>{a[lang]}</option>)}
            </select>
          </span>
        </div>
        {declined && (
          <p className="text-[11px] mb-3 flex items-center gap-1.5" style={{ color: "#E8837A" }}>
            <AlertTriangle size={12} />{x.declineAlert} ({avg.toFixed(0)} {x.lbOrders})
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { k: "orders", l: x.ordersCol, icon: ShoppingBag },
            { k: "hours", l: x.hoursCol, icon: Timer },
            { k: "weekendViolations", l: x.weekendViolCol, icon: CalendarDays },
            { k: "appViolations", l: x.appViolCol, icon: AlertTriangle },
          ].map((f) => (
            <label key={f.k} className="block">
              <span className="flex items-center gap-1 text-[10px] mb-1" style={{ color: "var(--muted)" }}><f.icon size={11} />{f.l}</span>
              <input type="number" value={r[f.k] || 0} onChange={(e) => update(r.id, f.k, e.target.value)}
                className="num w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none"
                style={{ background: "rgba(0,0,0,.04)", border: "1px solid var(--line)", color: "#12151D" }} />
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <RepPerformanceAnalytics lang={lang} role={role} reps={reps.filter((r) => r.sup === sup && r.status === "active")} />

      <Panel title={x.shiftsT}
        extra={
          <div className="flex items-center gap-2">
            <CalendarDays size={14} style={{ color: "var(--muted)" }} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="num rounded-lg px-2 py-1.5 text-[11.5px] font-semibold outline-none"
              style={{ background: "rgba(20,27,45,.05)", border: "1px solid var(--line)", color: "#12151D" }} />
          </div>
        }>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>{x.teamOf}:</span>
          {SUP_LIST.map((s) => (
            <button key={s.id} onClick={() => setSup(s.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition"
              style={{ background: sup === s.id ? `rgba(${role.glow},.15)` : "rgba(20,27,45,.04)", border: `1px solid ${sup === s.id ? `rgba(${role.glow},.4)` : "var(--line)"}`, color: sup === s.id ? role.accent : "var(--muted)" }}>
              {s.photo ? <img src={s.photo} alt="" className="w-5 h-5 rounded-md object-cover" /> : <Navigation size={13} />}
              {s[lang]}
            </button>
          ))}
        </div>

        <div className="mb-2.5 flex items-center gap-2">
          <span className="grid place-items-center w-6 h-6 rounded-lg" style={{ background: "rgba(91,200,232,.15)" }}><ShieldCheck size={12} style={{ color: "#5BC8E8" }} /></span>
          <p className="text-[12px] font-bold">{EMP_TYPES.kafala[lang]}</p>
          <Chip tone="info" sm>{mine.length}</Chip>
        </div>
        <div className="space-y-2.5 mb-5">
          {mine.length === 0 ? <EmptyHint lang={lang} /> : mine.map((r) => <RepRow key={r.id} r={r} />)}
        </div>

        <div className="mb-2.5 flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
          <span className="grid place-items-center w-6 h-6 rounded-lg" style={{ background: "rgba(228,184,92,.15)" }}><FileSignature size={12} style={{ color: "#B8862E" }} /></span>
          <p className="text-[12px] font-bold">{EMP_TYPES.ajeer[lang]}</p>
          <Chip tone="warn" sm>{mineAjeer.length}</Chip>
        </div>
        <div className="space-y-2.5">
          {mineAjeer.length === 0 ? <EmptyHint lang={lang} /> : mineAjeer.map((r) => <RepRow key={r.id} r={r} />)}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Btn variant="gold" icon={saved ? CheckCircle2 : ClipboardList} onClick={save}>{saved ? t.saved : x.saveReport}</Btn>
          {saved && <span className="text-[11.5px]" style={{ color: "#4FD1A5" }}>{x.reportSaved}</span>}
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════  التقارير (مؤسسية + مناديب)  ═══════════ */
/* ═══════════  مسجّل صوتي بسيط للتذاكر  ═══════════ */
function VoiceRecorder({ lang, value, onChange }) {
  const x = EX[lang];
  const [rec, setRec] = useState(null);
  const [recording, setRecording] = useState(false);
  const [err, setErr] = useState("");
  const [secs, setSecs] = useState(0);
  const chunks = useRef([]);
  const timerRef = useRef(null);

  const start = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => onChange(reader.result);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((tr) => tr.stop());
      };
      mr.start(); setRec(mr); setRecording(true); setSecs(0);
      timerRef.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } catch { setErr(x.micDenied); }
  };
  const stop = () => {
    if (rec) rec.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };
  useEffect(() => () => clearInterval(timerRef.current), []);
  const fmtSecs = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(0,0,0,.22)", border: "1px solid var(--line)" }}>
      <div className="flex items-center gap-4">
        <button onClick={recording ? stop : start} className="grid place-items-center w-16 h-16 rounded-full shrink-0 active:scale-95 transition"
          style={{ background: recording ? "linear-gradient(140deg,#E8837A,#C9564C)" : "linear-gradient(140deg,#3FD8B4,#2BAE8E)", boxShadow: recording ? "0 8px 24px -6px rgba(232,131,122,.6)" : "0 8px 24px -6px rgba(63,216,180,.6)" }}
          aria-label={recording ? x.recordStop : x.recordStart}>
          {recording ? <Square size={22} style={{ color: "#1A0806" }} /> : <Mic size={26} style={{ color: "#06211A" }} />}
        </button>
        <div className="flex-1 min-w-0">
          {recording ? (
            <>
              <span className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "#E8837A" }}>
                <span className="w-2.5 h-2.5 rounded-full pulse-dot" style={{ background: "#E8837A" }} />
                <span className="num text-[20px]">{fmtSecs(secs)}</span>
              </span>
              <span className="block text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{x.recordStop}</span>
            </>
          ) : value ? (
            <div className="flex items-center gap-2">
              <audio controls src={value} className="h-9 flex-1" />
              <button onClick={start} className="text-[11px] font-semibold shrink-0" style={{ color: "var(--muted)" }}>{x.recordAgain}</button>
            </div>
          ) : (
            <span className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>{x.recordStart}</span>
          )}
        </div>
      </div>
      {err && <p className="mt-2.5 text-[11px] flex items-center gap-1.5" style={{ color: "#E8837A" }}><AlertTriangle size={12} />{err}</p>}
    </div>
  );
}

/* ═══════════  التذاكر  ═══════════ */
function TicketStepper({ lang, tk }) {
  const x = EX[lang];
  const tt = ticketTypeOf(tk.type);
  const owner = ticketCurrentOwner(tk);
  const deptName = (id) => id === "broadcast" ? tt.to.map((d) => (ALL_ROLES.find((r) => r.id === d) || {})[lang]?.t).join(" · ") : (ALL_ROLES.find((r) => r.id === id) || {})[lang]?.t || id;
  const label = owner === "resolved" ? x.stageResolved : owner === "rejected" ? x.stageRejected : owner === "auto_closed" ? x.stageAutoClosed : `${x.stageAt} ${deptName(owner)}`;
  const tone = owner === "resolved" ? "ok" : owner === "rejected" || owner === "auto_closed" ? "n" : "info";
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Chip tone="n" sm>{x.stageSubmitted}</Chip>
      <ChevronRight size={13} style={{ color: "var(--muted)" }} />
      <Chip tone={tone} sm>{label}</Chip>
    </div>
  );
}

function NewTicketForm({ lang, role, user, setTickets, onDone, presetType }) {
  const t = T[lang], x = EX[lang];
  const [type, setType] = useState(presetType || "");
  const [mode, setMode] = useState("voice");
  const [text, setText] = useState("");
  const [audio, setAudio] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("10:00");
  const [err, setErr] = useState("");
  const [showCharter, setShowCharter] = useState(false);

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => setFile(reader.result);
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!type) return setErr(x.errTicketType);
    if (type === "appointment" && !apptDate) return setErr(x.errApptDate);
    if (type !== "appointment") {
      if (mode === "text" && text.trim().length < 3) return setErr(x.errTicketBody);
      if (mode === "voice" && !audio) return setErr(x.errTicketBody);
    }
    setErr("");
    const id = "TK-" + Math.floor(1000 + Math.random() * 8999);
    const apptAt = type === "appointment" ? `${apptDate} ${apptTime}` : null;
    setTickets((prev) => [{ id, repId: user, type, mode, text: mode === "text" ? text : "", audio: mode === "voice" ? audio : null,
      attachment: file, attachmentName: fileName, apptAt, createdAt: riyadhNow().toISOString(), status: "open", stage: 0, log: [] }, ...prev]);
    setType(""); setText(""); setAudio(null); setMode("voice"); setFile(null); setFileName(""); setApptDate("");
    speak(x.ttsConfirm, lang);
    onDone();
  };

  return (
    <Panel title={x.newTicket}>
      <div className="grid gap-2 sm:grid-cols-2 mb-3.5">
        {TICKET_TYPES.map((tt) => (
          <button key={tt.id} onClick={() => setType(tt.id)} className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-start transition"
            style={{ background: type === tt.id ? `rgba(${role.glow},.14)` : "rgba(20,27,45,.04)", border: `1px solid ${type === tt.id ? `rgba(${role.glow},.4)` : "var(--line)"}` }}>
            <tt.icon size={16} style={{ color: type === tt.id ? role.accent : "var(--muted)" }} />
            <span className="text-[12.5px] font-semibold" style={{ color: type === tt.id ? "#12151D" : "var(--muted)" }}>{tt[lang]}</span>
          </button>
        ))}
      </div>
      {type && (ticketTypeOf(type).confidential) && (
        <p className="text-[11px] mb-3 flex items-center gap-1.5" style={{ color: "#F2937B" }}><ShieldAlert size={13} />{x.confidentialBadge}</p>
      )}
      {type === "appointment" ? (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="block">
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.apptDateLbl}</span>
            <input type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)}
              className="num w-full rounded-xl px-3 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
          </label>
          <label className="block">
            <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.apptTimeLbl}</span>
            <input type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)}
              className="num w-full rounded-xl px-3 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
          </label>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMode("voice")} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold transition"
              style={{ background: mode === "voice" ? `rgba(${role.glow},.16)` : "rgba(20,27,45,.04)", border: `1px solid ${mode === "voice" ? `rgba(${role.glow},.45)` : "var(--line)"}`, color: mode === "voice" ? role.accent : "var(--muted)" }}>
              <Mic size={16} />{x.ticketVoice}
            </button>
            <button onClick={() => setMode("text")} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold transition"
              style={{ background: mode === "text" ? `rgba(${role.glow},.16)` : "rgba(20,27,45,.04)", border: `1px solid ${mode === "text" ? `rgba(${role.glow},.45)` : "var(--line)"}`, color: mode === "text" ? role.accent : "var(--muted)" }}>
              <ClipboardList size={16} />{x.ticketText}
            </button>
          </div>
          {mode === "voice" ? (
            <VoiceRecorder lang={lang} value={audio} onChange={setAudio} />
          ) : (
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={x.ticketBodyPh} rows={4}
              className="w-full rounded-xl px-3.5 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
          )}
        </>
      )}
      <label className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 mt-3 cursor-pointer" style={{ background: "rgba(0,0,0,.2)", border: `1px dashed ${file ? role.accent : "var(--line)"}` }}>
        <Paperclip size={16} style={{ color: file ? role.accent : "var(--muted)" }} />
        <span className="text-[12px] font-semibold truncate" style={{ color: file ? role.accent : "var(--muted)" }}>{file ? fileName : x.attachFile}</span>
        <input type="file" className="hidden" onChange={onFile} />
      </label>
      <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{x.autoCloseHint}</p>
      {err && <p className="mt-2.5 text-[11.5px] flex items-center gap-1.5" style={{ color: "#E8837A" }}><AlertTriangle size={13} />{err}</p>}
      <div className="flex items-center justify-between mt-4">
        <button onClick={() => setShowCharter(true)} className="text-[11px] font-semibold underline" style={{ color: "var(--muted)" }}>{x.charterTitle}</button>
        <Btn variant="accent" accent={role.glow} icon={Send} onClick={submit}>{x.submitTicket}</Btn>
      </div>
      {showCharter && (
        <div className="fixed inset-0 z-[60] grid place-items-center px-5" style={{ background: "rgba(3,5,10,.72)" }} onClick={() => setShowCharter(false)}>
          <div className="glass rounded-3xl p-6 max-w-sm rise" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[15px] font-extrabold mb-2 flex items-center gap-2"><ShieldAlert size={16} style={{ color: role.accent }} />{x.charterTitle}</h3>
            <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>{x.charterBody}</p>
            <div className="mt-4"><Btn full onClick={() => setShowCharter(false)}>{t.back}</Btn></div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function TicketCard({ lang, role, tk, reps, onAdvance, onResolve, onReject, onForwardLegal }) {
  const t = T[lang], x = EX[lang];
  const tt = ticketTypeOf(tk.type);
  const rep = reps.find((r) => r.id === tk.repId || r.nid === tk.repId);
  const owner = ticketCurrentOwner(tk);
  const canAct = tk.status === "open" && (owner === role.id || owner === "broadcast");
  const isLast = tt.mode === "sequential" && tk.stage === tt.chain.length - 1;
  return (
    <div className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid place-items-center w-9 h-9 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.13)` }}>
            <tt.icon size={16} style={{ color: role.accent }} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-bold truncate">{tt[lang]}</span>
            <span className="block text-[11px] truncate" style={{ color: "var(--muted)" }}>
              {x.ticketFrom}: {rep ? (lang === "en" ? rep.en : rep.ar) : tk.repId} · {x.ticketAt} <span className="num">{tk.createdAt.slice(0, 10)}</span>
            </span>
          </span>
        </div>
        <span className="num text-[10px] shrink-0" style={{ color: "var(--muted)" }}>{tk.id}</span>
      </div>
      {tk.forwardedToLegal && <Chip tone="info" sm><ShieldAlert size={11} />{x.forwardedToLegalBadge}</Chip>}
      {tk.type === "appointment" && tk.apptAt && (
        <Chip tone="warn" sm><CalendarClock size={11} />{tk.apptAt}</Chip>
      )}
      {tk.status === "open" && ticketHoursOpen(tk) >= 48 && (
        <Chip tone="warn" sm>
          <Clock size={11} />{x.warnBefore} {Math.max(0, Math.round(TICKET_AUTOCLOSE_HOURS - ticketHoursOpen(tk)))} {x.warnHours}
        </Chip>
      )}
      {tk.mode === "voice" && tk.audio ? <audio controls src={tk.audio} className="w-full h-9 my-2" /> : <p className="text-[12.5px] my-2 leading-relaxed">{tk.text}</p>}
      {tk.attachment && (
        <a href={tk.attachment} download={tk.attachmentName || "attachment"} className="inline-flex items-center gap-2 text-[11.5px] font-semibold rounded-lg px-2.5 py-1.5 mb-2" style={{ background: `rgba(${role.glow},.1)`, color: role.accent }}>
          <Paperclip size={13} />{tk.attachmentName || x.viewAttachment}
        </a>
      )}
      <TicketStepper lang={lang} tk={tk} />
      {tk.log && tk.log.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {tk.log.map((l, i) => (
            <p key={i} className="text-[11px] rounded-lg p-2" style={{ background: "rgba(20,27,45,.03)", color: "var(--muted)" }}>
              <b style={{ color: "#12151D" }}>{(ALL_ROLES.find((r) => r.id === l.by) || {})[lang]?.t}:</b> {l.note}
            </p>
          ))}
        </div>
      )}
      {canAct && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
          {tt.mode === "sequential" && !isLast && <Btn variant="accent" accent={role.glow} icon={Send} onClick={() => onAdvance(tk.id)}>{x.forwardNext}</Btn>}
          {(tt.mode === "broadcast" || isLast) && <Btn variant="gold" icon={CheckCircle2} onClick={() => onResolve(tk.id)}>{x.resolveTicket}</Btn>}
          <Btn variant="danger" icon={X} onClick={() => onReject(tk.id)}>{x.rejectTicket}</Btn>
          {role.id === "gm" && tt.legalEscalable && !tk.forwardedToLegal && (
            <Btn variant="ghost" icon={Scale} onClick={() => onForwardLegal(tk.id)}>{x.forwardToLegal}</Btn>
          )}
        </div>
      )}
    </div>
  );
}

function TicketsPage({ lang, role, user, reps, tickets, setTickets, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const [showNew, setShowNew] = useState(false);
  const [prefType, setPrefType] = useState(null);
  const [sentToast, setSentToast] = useState(false);
  const isRep = role.id === "rep";

  useEffect(() => {
    const stale = tickets.filter((tk) => tk.status === "open" && ticketHoursOpen(tk) >= TICKET_AUTOCLOSE_HOURS);
    if (stale.length) {
      setTickets((prev) => prev.map((tk) => (tk.status === "open" && ticketHoursOpen(tk) >= TICKET_AUTOCLOSE_HOURS ? { ...tk, status: "auto_closed" } : tk)));
    }
    // eslint-disable-next-line
  }, [tickets]);

  const advance = (id) => setTickets((prev) => prev.map((tk) => (tk.id === id ? { ...tk, stage: tk.stage + 1, log: [...(tk.log || []), { by: role.id, note: "", at: riyadhNow().toISOString() }] } : tk)));
  const resolve = (id) => { setTickets((prev) => prev.map((tk) => (tk.id === id ? { ...tk, status: "resolved", resolvedAt: riyadhNow().toISOString(), resolvedBy: role.id } : tk))); logAudit(setAuditLog, role, "ticket_resolve", id, actingEmployee); };
  const reject = (id) => { setTickets((prev) => prev.map((tk) => (tk.id === id ? { ...tk, status: "rejected", resolvedAt: riyadhNow().toISOString(), resolvedBy: role.id } : tk))); logAudit(setAuditLog, role, "ticket_reject", id, actingEmployee); };
  const forwardLegal = (id) => { setTickets((prev) => prev.map((tk) => (tk.id === id ? { ...tk, forwardedToLegal: true } : tk))); logAudit(setAuditLog, role, "ticket_forward_legal", id, actingEmployee); };

  const mine = tickets.filter((tk) => tk.repId === user);
  const inbox = tickets.filter((tk) => ticketVisibleToRole(tk, role.id) && tk.status === "open" && (ticketCurrentOwner(tk) === role.id || ticketCurrentOwner(tk) === "broadcast"));

  if (isRep) {
    return (
      <div className="space-y-4">
        {sentToast && (
          <div className="glass rounded-2xl p-4 flex items-center gap-3 rise" style={{ background: "rgba(63,216,180,.12)", border: "1px solid rgba(63,216,180,.4)" }}>
            <span className="grid place-items-center w-11 h-11 rounded-2xl shrink-0" style={{ background: "rgba(63,216,180,.2)" }}>
              <CheckCircle2 size={20} style={{ color: "#3FD8B4" }} />
            </span>
            <p className="text-[13px] font-bold">{x.ticketSent}</p>
          </div>
        )}
        {!showNew && <Btn variant="gold" icon={Plus} onClick={() => { setPrefType(null); setShowNew(true); }}>{x.newTicket}</Btn>}
        {showNew && <NewTicketForm lang={lang} role={role} user={user} setTickets={setTickets} presetType={prefType} onDone={() => { setShowNew(false); setSentToast(true); setTimeout(() => setSentToast(false), 4500); }} />}
        <Panel title={x.myTickets}>
          {mine.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.noTickets}</p> : (
            <div className="space-y-2.5">
              {mine.map((tk) => (
                <div key={tk.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="grid place-items-center w-9 h-9 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.13)` }}>
                      {(() => { const Icon = ticketTypeOf(tk.type).icon; return <Icon size={16} style={{ color: role.accent }} />; })()}
                    </span>
                    <span className="text-[13px] font-bold">{ticketTypeOf(tk.type)[lang]}</span>
                  </div>
                  <TicketStepper lang={lang} tk={tk} />
                  {tk.status === "open" && ticketHoursOpen(tk) >= 48 && (
                    <Chip tone="warn" sm><Clock size={11} />{x.warnBefore} {Math.max(0, Math.round(TICKET_AUTOCLOSE_HOURS - ticketHoursOpen(tk)))} {x.warnHours}</Chip>
                  )}
                  {tk.status === "auto_closed" && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
                      <p className="text-[11px] mb-2" style={{ color: "var(--muted)" }}>{x.autoCloseNote}</p>
                      <div className="flex flex-wrap gap-2">
                        <Btn variant="danger" icon={ShieldAlert} onClick={() => { setPrefType("confidential"); setShowNew(true); }}>{x.objConfidential}</Btn>
                        <Btn variant="danger" icon={AlertTriangle} onClick={() => { setPrefType("urgent_report"); setShowNew(true); }}>{x.objReport}</Btn>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Panel title={x.inboxTickets}>
        {inbox.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.noTickets}</p> : (
          <div className="space-y-2.5">
            {inbox.map((tk) => <TicketCard key={tk.id} lang={lang} role={role} tk={tk} reps={reps} onAdvance={advance} onResolve={resolve} onReject={reject} onForwardLegal={forwardLegal} />)}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ═══════════  التعاميم  ═══════════ */
/* ═══════════  حلقة التواصل: شات بين الإدارات + رسائل للمناديب (تم الاطلاع فقط)  ═══════════ */
function CommsPage({ lang, role, user, reps, deptChats, setDeptChats, repMessages, setRepMessages }) {
  const t = T[lang], x = EX[lang];
  const [tab, setTab] = useState("dept");
  const [withDept, setWithDept] = useState(null);
  const [text, setText] = useState("");
  const [toRep, setToRep] = useState("");
  const [repText, setRepText] = useState("");

  const others = ROLES.filter((r) => r.id !== role.id);
  const pairKey = (a, b) => [a, b].sort().join("::");
  const thread = withDept ? deptChats.filter((m) => pairKey(m.from, m.to) === pairKey(role.id, withDept)) : [];
  useEffect(() => {
    if (!withDept) return;
    const hasUnseen = deptChats.some((m) => m.to === role.id && m.from === withDept && !m.seen);
    if (hasUnseen) setDeptChats((prev) => prev.map((m) => (m.to === role.id && m.from === withDept && !m.seen ? { ...m, seen: true } : m)));
    // eslint-disable-next-line
  }, [withDept]);

  const sendDept = () => {
    if (!withDept || text.trim().length < 1) return;
    setDeptChats((prev) => [...prev, { id: "MSG-" + Date.now(), from: role.id, to: withDept, text: text.trim(), at: riyadhNow().toISOString(), seen: false }]);
    setText("");
  };

  const activeReps = reps.filter((r) => r.status === "active");
  const sendToRep = () => {
    if (!toRep || repText.trim().length < 1) return;
    setRepMessages((prev) => [{ id: "RM-" + Date.now(), from: role.id, repId: toRep, text: repText.trim(), at: riyadhNow().toISOString(), seen: false, seenAt: null }, ...prev]);
    setRepText("");
  };
  const sentToReps = repMessages.filter((m) => m.from === role.id);
  const repName = (id) => { const r = reps.find((rr) => rr.nid === id || rr.id === id); return r ? (lang === "en" ? r.en : r.ar) : id; };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab("dept")} className="flex-1 rounded-xl py-2.5 text-[12.5px] font-bold transition"
          style={{ background: tab === "dept" ? `rgba(${role.glow},.14)` : "rgba(20,27,45,.04)", border: `1px solid ${tab === "dept" ? `rgba(${role.glow},.4)` : "var(--line)"}`, color: tab === "dept" ? role.accent : "var(--muted)" }}>
          {x.chatT}
        </button>
        <button onClick={() => setTab("rep")} className="flex-1 rounded-xl py-2.5 text-[12.5px] font-bold transition"
          style={{ background: tab === "rep" ? `rgba(${role.glow},.14)` : "rgba(20,27,45,.04)", border: `1px solid ${tab === "rep" ? `rgba(${role.glow},.4)` : "var(--line)"}`, color: tab === "rep" ? role.accent : "var(--muted)" }}>
          {x.chatToRep}
        </button>
      </div>

      {tab === "dept" ? (
        <Panel title={x.chatT}>
          <div className="flex gap-2 flex-wrap mb-4">
            {others.map((r) => {
              const unseenFromR = deptChats.filter((m) => m.to === role.id && m.from === r.id && !m.seen).length;
              return (
                <button key={r.id} onClick={() => setWithDept(r.id)} className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold transition"
                  style={{ background: withDept === r.id ? `rgba(${r.glow},.15)` : "rgba(20,27,45,.04)", border: `1px solid ${withDept === r.id ? `rgba(${r.glow},.4)` : "var(--line)"}`, color: withDept === r.id ? r.accent : "var(--muted)" }}>
                  <Emblem role={r} size={20} />{r[lang].t}
                  {unseenFromR > 0 && <span className="num text-[9.5px] font-bold px-1.5 rounded-full" style={{ background: "#E8837A", color: "#fff" }}>{unseenFromR}</span>}
                </button>
              );
            })}
          </div>
          {!withDept ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.chatSelectDept}</p> : (
            <>
              <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar mb-3">
                {thread.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.chatNoMsgs}</p> : thread.map((m) => (
                  <div key={m.id} className="flex" style={{ justifyContent: m.from === role.id ? "flex-end" : "flex-start" }}>
                    <div className="max-w-[80%] rounded-2xl px-3.5 py-2.5" style={{ background: m.from === role.id ? `rgba(${role.glow},.16)` : "rgba(20,27,45,.05)", border: "1px solid var(--line)" }}>
                      <p className="text-[12.5px] leading-relaxed">{m.text}</p>
                      <p className="num text-[9.5px] mt-1" style={{ color: "var(--muted)" }}>{m.at.slice(11, 16)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={x.chatSendPh} onKeyDown={(e) => e.key === "Enter" && sendDept()}
                  className="flex-1 rounded-xl px-3.5 py-2.5 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
                <Btn variant="accent" accent={role.glow} icon={Send} onClick={sendDept}>{x.chatSend}</Btn>
              </div>
            </>
          )}
        </Panel>
      ) : (
        <div className="space-y-4">
          <Panel title={x.chatToRep}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.composeToRep}</span>
                <select value={toRep} onChange={(e) => setToRep(e.target.value)} className="w-full rounded-xl px-3 py-3 text-[13px] outline-none"
                  style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }}>
                  <option value="" style={{ background: "#FFFFFF" }}>—</option>
                  {activeReps.map((r) => <option key={r.id} value={r.nid} style={{ background: "#FFFFFF" }}>{lang === "en" ? r.en : r.ar}</option>)}
                </select>
              </label>
              <GateField label={x.chatSendPh} val={repText} set={setRepText} ph="" Icon={MessageSquare} type="text" accent={role.accent} />
            </div>
            <div className="mt-3"><Btn variant="accent" accent={role.glow} icon={Send} onClick={sendToRep}>{x.sendToRep}</Btn></div>
          </Panel>
          <Panel title={x.repMsgsT}>
            {sentToReps.length === 0 ? <EmptyHint lang={lang} /> : (
              <div className="space-y-2.5">
                {sentToReps.map((m) => (
                  <div key={m.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block text-[12.5px] font-bold truncate">{repName(m.repId)}</span>
                        <span className="block text-[12px] mt-1 leading-relaxed">{m.text}</span>
                      </div>
                      <Chip tone={m.seen ? "ok" : "warn"} sm>
                        {m.seen ? <CheckCheck size={12} /> : <Clock size={12} />}{m.seen ? x.seenBadge : x.notSeenBadge}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

function RepMessagesPage({ lang, role, user, repMessages, setRepMessages }) {
  const t = T[lang], x = EX[lang];
  const mine = repMessages.filter((m) => m.repId === user);
  const markSeen = (id) => setRepMessages((prev) => prev.map((m) => (m.id === id ? { ...m, seen: true, seenAt: riyadhNow().toISOString() } : m)));
  return (
    <Panel title={x.repMsgsT}>
      {mine.length === 0 ? <EmptyHint lang={lang} /> : (
        <div className="space-y-2.5">
          {mine.map((m) => (
            <div key={m.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: `1px solid ${m.seen ? "var(--line)" : `rgba(${role.glow},.35)`}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Emblem role={ALL_ROLES.find((r) => r.id === m.from) || role} size={26} />
                <span className="text-[12px] font-bold">{x.repMsgFrom}: {(ALL_ROLES.find((r) => r.id === m.from) || {})[lang]?.t}</span>
              </div>
              <p className="text-[13px] leading-relaxed mb-3">{m.text}</p>
              {m.seen ? (
                <Chip tone="ok" sm><CheckCheck size={12} />{x.seenBadge} · <span className="num">{m.seenAt?.slice(11, 16)}</span></Chip>
              ) : (
                <Btn variant="accent" accent={role.glow} icon={CheckCheck} onClick={() => markSeen(m.id)}>{x.markSeen}</Btn>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function CircularsPage({ lang, role, circulars, setCirculars, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const canPost = role.id === "gm" || role.id === "opsm";
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [showForm, setShowForm] = useState(false);

  const publish = () => {
    if (title.trim().length < 3 || body.trim().length < 3) return;
    setCirculars((prev) => [{ id: "C-" + Date.now(), title, body, by: role.id, date: riyadhToday() }, ...prev]);
    logAudit(setAuditLog, role, "circular_publish", title, actingEmployee);
    setTitle(""); setBody(""); setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {canPost && !showForm && <Btn variant="gold" icon={Plus} onClick={() => setShowForm(true)}>{x.newCircular}</Btn>}
      {canPost && showForm && (
        <Panel title={x.newCircular}>
          <div className="space-y-3">
            <GateField label={x.circularTitle} val={title} set={setTitle} ph="" Icon={Megaphone} type="text" accent={role.accent} />
            <label className="block">
              <span className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{x.circularBody}</span>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
                className="w-full rounded-xl px-3.5 py-3 text-[13px] outline-none" style={{ background: "rgba(0,0,0,.24)", border: "1px solid var(--line)", color: "#12151D" }} />
            </label>
            <Btn variant="accent" accent={role.glow} icon={Megaphone} onClick={publish}>{x.publishCircular}</Btn>
          </div>
        </Panel>
      )}
      <Panel title={x.circulars}>
        {circulars.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{x.noCirculars}</p> : (
          <div className="space-y-3">
            {circulars.map((c) => (
              <div key={c.id} className="rounded-2xl p-4" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="grid place-items-center w-9 h-9 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.13)` }}><Megaphone size={16} style={{ color: role.accent }} /></span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-bold truncate">{c.title}</span>
                    <span className="block text-[11px]" style={{ color: "var(--muted)" }}>{x.publishedBy}: {(ALL_ROLES.find((r) => r.id === c.by) || {})[lang]?.t} · <span className="num">{c.date}</span></span>
                  </span>
                </div>
                <p className="text-[12.5px] leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function ReportsPage({ lang, role, reps, reports, query, setQuery, employees }) {
  const t = T[lang], x = EX[lang];
  const [tab, setTab] = useState(reps && reps.length ? 1 : 0);
  const [p, setP] = useState(0);
  const [open, setOpen] = useState(null);
  const q = (query || "").trim().toLowerCase();

  const repName = (id) => { const r = reps.find((rr) => rr.id === id); return r ? (lang === "en" ? r.en : r.ar) : id; };
  const supName = (sid) => supervisorsOf(employees).find((s) => s.id === sid)?.[lang] || "—";

  const filteredReports = !q ? reports : reports.filter((rp) =>
    rp.entries.some((e) => {
      const rep = reps.find((r) => r.id === e.id);
      if (!rep) return false;
      return rep.ar.toLowerCase().includes(q) || rep.en.toLowerCase().includes(q) || rep.phone.includes(q) || (rep.nid || "").includes(q);
    }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[x.corpReportsT, x.repReportsT].map((n, i) => (
          <button key={n} onClick={() => setTab(i)} className="px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition"
            style={{ background: tab === i ? `rgba(${role.glow},.14)` : "rgba(20,27,45,.04)", border: `1px solid ${tab === i ? `rgba(${role.glow},.4)` : "var(--line)"}`, color: tab === i ? role.accent : "var(--muted)" }}>
            {n}
          </button>
        ))}
      </div>

      {tab === 0 ? (
        <Panel title={x.reportsT}>
          <div className="flex gap-2 mb-4">
            {[x.monthly, x.quarterly, x.yearly].map((n, i) => (
              <button key={n} onClick={() => setP(i)} className="px-3 py-2 rounded-xl text-[12px] font-bold transition"
                style={{ background: p === i ? `rgba(${role.glow},.14)` : "rgba(20,27,45,.04)", border: `1px solid ${p === i ? `rgba(${role.glow},.4)` : "var(--line)"}`, color: p === i ? role.accent : "var(--muted)" }}>{n}</button>
            ))}
          </div>
          <div className="space-y-2.5">
            {x.repItems.map((n) => (
              <div key={n} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <ReceiptText size={16} style={{ color: role.accent }} />
                <span className="flex-1 text-[13px] font-semibold">{n}</span>
                <Btn icon={Download}>{x.generate}</Btn>
              </div>
            ))}
          </div>
        </Panel>
      ) : (
        <Panel title={x.repReportsT}
          extra={
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(20,27,45,.045)", border: "1px solid var(--line)" }}>
                <Search size={14} style={{ color: "var(--muted)" }} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={x.searchRep}
                  className="bg-transparent outline-none border-0 text-[12px] w-40" style={{ color: "#12151D" }} />
              </span>
              <Btn icon={Download} onClick={() => {
                const rows = [];
                filteredReports.forEach((rp) => rp.entries.forEach((e) => {
                  const rep = reps.find((r) => r.id === e.id) || { ar: e.id, en: e.id, empType: "—" };
                  rows.push({ [t.h.employee]: lang === "en" ? rep.en : rep.ar, [x.empTypeCol]: EMP_TYPES[rep.empType]?.[lang] || rep.empType, Date: rp.date,
                    [x.ordersCol]: e.orders, [x.hoursCol]: e.hours, [x.weekendViolCol]: e.weekendViolations || 0, [x.appViolCol]: e.appViolations || 0 });
                }));
                exportToExcel(rows, `rep-reports-${riyadhToday()}`, "Reports");
              }}>{t.export}</Btn>
            </div>
          }>
          <div className="sm:hidden flex items-center gap-2 rounded-xl px-3 py-2 mb-3.5" style={{ background: "rgba(20,27,45,.045)", border: "1px solid var(--line)" }}>
            <Search size={14} style={{ color: "var(--muted)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={x.searchRep}
              className="bg-transparent outline-none border-0 text-[12px] flex-1" style={{ color: "#12151D" }} />
          </div>

          {filteredReports.length === 0 ? (
            <p className="text-[12px]" style={{ color: "var(--muted)" }}>{q ? x.globalNoMatch : x.noReports}</p>
          ) : (
            <div className="space-y-2.5">
              {filteredReports.map((rp) => {
                const isOpen = open === rp.id;
                return (
                  <div key={rp.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                    <button onClick={() => setOpen(isOpen ? null : rp.id)} className="w-full flex items-center justify-between gap-3 p-3.5 text-start">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="grid place-items-center w-9 h-9 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.13)` }}>
                          <ClipboardList size={16} style={{ color: role.accent }} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-bold">{rp.id} · <span className="num">{rp.date}</span></span>
                          <span className="block text-[11px]" style={{ color: "var(--muted)" }}>{x.teamOf} {supName(rp.sup)} · {x.repsCount}: {rp.entries.length}</span>
                        </span>
                      </div>
                      <ChevronRight size={16} style={{ color: "var(--muted)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .3s" }} />
                    </button>
                    {isOpen && (() => {
                      const withType = rp.entries.map((e) => ({ e, rep: reps.find((r) => r.id === e.id) || { ...e, ar: e.id, en: e.id, empType: "kafala" } }));
                      const kafalaEntries = withType.filter((w) => w.rep.empType !== "ajeer");
                      const ajeerEntries = withType.filter((w) => w.rep.empType === "ajeer");
                      const toRows = (list) => list.map(({ e, rep }) => ({
                        key: e.id,
                        cells: [
                          { v: lang === "en" ? rep.en : rep.ar, strong: 1 }, { v: e.orders, mono: 1 },
                          { v: e.hours, mono: 1 }, { v: e.weekendViolations || 0, mono: 1, dim: 1 }, { v: e.appViolations || 0, mono: 1, dim: 1 },
                        ],
                      }));
                      return (
                        <div className="px-3.5 pb-3.5 space-y-3">
                          <div>
                            <p className="text-[10.5px] font-bold mb-1.5" style={{ color: "var(--muted)" }}>{EMP_TYPES.kafala[lang]}</p>
                            {kafalaEntries.length === 0 ? <EmptyHint lang={lang} /> : (
                              <DataTable headers={[t.h.employee, x.ordersCol, x.hoursCol, x.weekendViolCol, x.appViolCol]} rows={toRows(kafalaEntries)} />
                            )}
                          </div>
                          {ajeerEntries.length > 0 && (
                            <div>
                              <p className="text-[10.5px] font-bold mb-1.5 pt-2" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>{EMP_TYPES.ajeer[lang]}</p>
                              <DataTable headers={[t.h.employee, x.ordersCol, x.hoursCol, x.weekendViolCol, x.appViolCol]} rows={toRows(ajeerEntries)} />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

function ResetForLaunchPanel({ lang, role, setters, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const [confirmText, setConfirmText] = useState("");
  const [done, setDone] = useState(false);
  const CONFIRM_WORD = "RESET";
  const ready = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const doReset = () => {
    if (!ready) return;
    Object.keys(setters).forEach((key) => setters[key]([]));
    logAudit(setAuditLog, role, "platform_reset", riyadhNow().toISOString(), actingEmployee);
    setDone(true);
    setConfirmText("");
    setTimeout(() => setDone(false), 6000);
  };

  return (
    <Panel title={x.resetLaunchT}>
      <div className="rounded-xl p-3 mb-4 flex items-start gap-2.5" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.3)" }}>
        <AlertTriangle size={16} style={{ color: "#E8837A" }} className="mt-0.5 shrink-0" />
        <p className="text-[11.5px] leading-relaxed" style={{ color: "#E8837A" }}>{x.resetLaunchWarn}</p>
      </div>
      <p className="text-[12px] mb-3" style={{ color: "var(--muted)" }}>{x.resetLaunchSub}</p>
      <GateField label={x.resetTypeLbl} val={confirmText} set={setConfirmText} ph={CONFIRM_WORD} Icon={ShieldAlert} type="text" accent="232,131,122" />
      <div className="mt-3.5">
        <Btn variant="danger" icon={Trash2} onClick={doReset}>{x.resetLaunchBtn}</Btn>
      </div>
      {done && (
        <p className="mt-3 text-[11.5px] flex items-start gap-1.5" style={{ color: "#4FD1A5" }}>
          <CheckCircle2 size={14} className="mt-px shrink-0" />{x.resetLaunchDone}
        </p>
      )}
    </Panel>
  );
}

function BackupPanel({ lang, role, data, setters, setAuditLog, actingEmployee }) {
  const t = T[lang], x = EX[lang];
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);
  const [lastBackup, setLastBackup] = usePersisted("bq_last_backup", null);
  const [autoRan, setAutoRan] = useState(false);

  const doExport = (auto) => {
    const payload = { exportedAt: riyadhNow().toISOString(), version: 1, data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bawariq-backup-${riyadhToday()}${auto ? "-auto" : ""}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setLastBackup(riyadhToday());
    logAudit(setAuditLog, role, auto ? "backup_auto_export" : "backup_export", riyadhToday(), actingEmployee);
  };

  useEffect(() => {
    if (role.id !== "gm" || autoRan) return;
    const daysSince = lastBackup ? Math.floor((new Date(riyadhToday()) - new Date(lastBackup)) / 86400000) : 999;
    if (daysSince >= 7) { doExport(true); setAutoRan(true); }
    // eslint-disable-next-line
  }, [lastBackup]);

  const onImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const payload = parsed.data || parsed;
        Object.keys(setters).forEach((key) => {
          if (Array.isArray(payload[key])) setters[key](payload[key]);
        });
        setMsg({ ok: true, m: x.restoreOk });
        logAudit(setAuditLog, role, "backup_restore", file.name, actingEmployee);
      } catch {
        setMsg({ ok: false, m: x.restoreErr });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <Panel title={x.backupT} extra={lastBackup ? <Chip tone="ok" sm><CheckCircle2 size={11} />{lastBackup}</Chip> : null}>
      <p className="text-[12px] mb-1" style={{ color: "var(--muted)" }}>{x.backupSub}</p>
      <p className="text-[10.5px] mb-4 flex items-center gap-1.5" style={{ color: "#4FD1A5" }}><CalendarClock size={12} />{x.autoBackupNote}</p>
      <div className="flex flex-wrap gap-2.5">
        <Btn variant="gold" icon={Download} onClick={() => doExport(false)}>{x.backupExport}</Btn>
        {role.id === "gm" && (
          <>
            <Btn variant="danger" icon={Upload} onClick={() => fileRef.current && fileRef.current.click()}>{x.backupImport}</Btn>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
          </>
        )}
      </div>
      {role.id !== "gm" && <p className="text-[10.5px] mt-2.5" style={{ color: "var(--muted)" }}>{x.restoreGmOnly}</p>}
      {msg && (
        <p className="mt-3 text-[11.5px] flex items-start gap-1.5" style={{ color: msg.ok ? "#4FD1A5" : "#E8837A" }}>
          {msg.ok ? <CheckCircle2 size={14} className="mt-px shrink-0" /> : <AlertTriangle size={14} className="mt-px shrink-0" />}{msg.m}
        </p>
      )}
    </Panel>
  );
}

function SettingsPage({ lang, setLang, role, reduce, setReduce, activeRep, reps, setReps, setAuditLog, actingEmployee,
  reports, setReports, tickets, setTickets, circulars, setCirculars, attendance, setAttendance, shifts, setShifts,
  orders, setOrders, cars, setCars, restaurants, setRestaurants, invoices, setInvoices,
  employees, setEmployees, contracts, setContracts, cases, setCases, approvalReqs, setApprovalReqs,
  expenses, setExpenses, iqamaAlerts, setIqamaAlerts, payrollRuns, setPayrollRuns,
  deptChats, setDeptChats, repMessages, setRepMessages, leaderboardHistory, setLeaderboardHistory, auditLog,
  deptPasswords, setDeptPasswords }) {
  const t = T[lang], x = EX[lang];
  const backupData = { reps, reports, tickets, circulars, attendance, shifts, orders, cars, restaurants, invoices,
    employees, contracts, cases, approvalReqs, expenses, iqamaAlerts, payrollRuns, deptChats, repMessages, leaderboardHistory, auditLog };
  const backupSetters = { reps: setReps, reports: setReports, tickets: setTickets, circulars: setCirculars,
    attendance: setAttendance, shifts: setShifts, orders: setOrders, cars: setCars, restaurants: setRestaurants,
    invoices: setInvoices, employees: setEmployees, contracts: setContracts, cases: setCases, approvalReqs: setApprovalReqs,
    expenses: setExpenses, iqamaAlerts: setIqamaAlerts, payrollRuns: setPayrollRuns, deptChats: setDeptChats,
    repMessages: setRepMessages, leaderboardHistory: setLeaderboardHistory, auditLog: setAuditLog };
  return (
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <PasswordCard lang={lang} role={role} activeRep={activeRep} reps={reps} setReps={setReps} setAuditLog={setAuditLog} actingEmployee={actingEmployee} />
      {role.id !== "rep" && (
        <DeptPasswordCard lang={lang} role={role} deptPasswords={deptPasswords} setDeptPasswords={setDeptPasswords} setAuditLog={setAuditLog} actingEmployee={actingEmployee} />
      )}
      <Panel title={t.settings}>
        <div className="space-y-4 mt-1">
          <div>
            <p className="text-[11.5px] font-semibold mb-2" style={{ color: "var(--muted)" }}>{t.langLabel}</p>
            <div className="flex gap-2 flex-wrap">
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)} className="px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition"
                  style={{ background: lang === l.code ? "rgba(228,184,92,.14)" : "rgba(20,27,45,.04)", border: `1px solid ${lang === l.code ? "rgba(228,184,92,.42)" : "var(--line)"}`, color: lang === l.code ? "var(--gold2)" : "var(--muted)" }}>{l.name}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
            <span className="text-[12.5px] font-semibold">{t.motion}</span>
            <button onClick={() => setReduce(!reduce)} className="w-12 h-7 rounded-full relative transition"
              style={{ background: reduce ? "rgba(228,184,92,.6)" : "rgba(20,27,45,.1)", border: "1px solid var(--line)" }}>
              <span className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all" style={{ [reduce ? "right" : "left"]: 4 }} />
            </button>
          </div>
          <div className="pt-3" style={{ borderTop: "1px solid var(--line)" }}>
            <p className="text-[11.5px] font-semibold mb-2" style={{ color: "var(--muted)" }}>{x.role}</p>
            <div className="flex items-center gap-2.5">
              <role.icon size={16} style={{ color: role.accent }} />
              <span className="text-[13px] font-bold">{role[lang].t}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {role.nav.map((n) => <Chip key={n} sm>{t.nav[n]}</Chip>)}
            </div>
          </div>
        </div>
      </Panel>
      {role.id !== "rep" && (
        <BackupPanel lang={lang} role={role} data={backupData} setters={backupSetters} setAuditLog={setAuditLog} actingEmployee={actingEmployee} />
      )}
      {role.id === "gm" && (
        <ResetForLaunchPanel lang={lang} role={role} setters={backupSetters} setAuditLog={setAuditLog} actingEmployee={actingEmployee} />
      )}
      <Panel title={x.whatsNewT} className="lg:col-span-2">
        <div className="grid gap-3 sm:grid-cols-2">
          {(WHATS_NEW[lang] || WHATS_NEW.ar).map((item, i) => {
            const Icon = WHATS_NEW_ICONS[item.icon] || Sparkles;
            return (
              <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <span className="grid place-items-center w-9 h-9 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.13)` }}>
                  <Icon size={16} style={{ color: role.accent }} />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold">{item.t}</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>{item.d}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}


/* ═══════════  نصوص محاسبة المناديب والواجهة الجديدة  ═══════════ */
const RA = {
  ar: {
    title: "محاسبة المناديب", sub: "المشرف يسجّل الطلبات يومياً والنظام يحسب كل شيء تلقائياً. في آخر الشهر تراجع التسعيرات والمخالفات وتقفل الحساب.",
    tabClose: "إقفال الشهر", tabApp: "تسعيرة التطبيق لنا", tabRep: "تسعيرتنا للمندوب",
    appPriceT: "كيف يحاسبنا التطبيق (إيراد الشركة)", appPriceSub: "اختر طريقة الحساب لكل تطبيق — هذا ما تستلمه الشركة من التطبيق.",
    repPriceT: "كيف نحاسب المندوب (ربح المندوب)", repPriceSub: "التسعيرة التي أعطيناها للمندوب لكل تطبيق — يُحسب ربحه منها تلقائياً ويظهر في صفحته.",
    mode: "طريقة الحساب", modeUnit: "سعر للطلب + سعر للكيلو", modeTarget: "مبلغ ثابت عند الهدف + زيادة/نقص", modeTiers: "شرائح حسب عدد الطلبات",
    perOrder: "سعر الطلب", perKm: "سعر الكيلومتر", freeKm: "كم مجاني (يُخصم من إجمالي الكم)", fixedMonthly: "مبلغ ثابت شهري إضافي",
    ordersBase: "مبلغ الطلبات عند الهدف", ordersTarget: "هدف الطلبات الشهري", perOrderDelta: "سعر الطلب الزائد/الناقص",
    kmBase: "مبلغ الكيلومترات عند الهدف", kmTarget: "هدف الكيلومترات الشهري", perKmDelta: "سعر الكيلو الزائد/الناقص",
    tierFrom: "من الطلب رقم", tierRate: "سعر الطلب", addTier: "إضافة شريحة", tiersNote: "ابدأ أول شريحة من 0 — كل شريحة تسري حتى بداية التي بعدها.",
    tryIt: "جرّب الحساب", tryOrders: "طلبات", tryKm: "كيلومتر", tryResult: "الناتج",
    save: "حفظ التسعيرة", saved: "تم الحفظ", configured: "مضبوطة", usingDefault: "افتراضية", resetDefault: "رجوع للافتراضي", copyAll: "نسخ لكل التطبيقات",
    unsaved: "تعديلات غير محفوظة",
    month: "الشهر", draft: "مسودة", closedLbl: "مقفل ومعتمد",
    kRevenue: "إيراد التطبيقات", kRepNet: "صافي ربح المناديب", kFines: "خصومات المناديب (للشركة)", kCompanyNet: "صافي ربح الشركة", kAfterExp: "بعد المصروفات المعتمدة",
    step1: "١) التطبيقات: الإيراد", step2: "٢) المناديب: الأرباح والمخالفات", step3: "٣) الإقفال",
    colApp: "التطبيق", colOrders: "الطلبات", colKm: "الكم", colCalc: "حسب التسعيرة", colActual: "الفاتورة الفعلية", colAppFines: "غرامات التطبيق علينا",
    colRevenue: "الإيراد النهائي", colRepCost: "ما يستحقه مناديبه", colMargin: "ربح الشركة",
    colRep: "المندوب", colGross: "ربحه قبل الخصم", colWeekend: "مخالفة الإجازة", colAppViol: "مخالفة التطبيق", colAdj: "تسويات", colNet: "صافي ربحه",
    actualHint: "اتركه فارغاً لاستخدام الحساب التلقائي", count: "العدد",
    adjT: "تسوية يدوية (إضافة / خصم)", adjType: "النوع", adjAdd: "إضافة", adjDeduct: "خصم", adjAmount: "المبلغ", adjReason: "السبب (إلزامي — 8 أحرف على الأقل)",
    adjAddBtn: "إضافة التسوية", errAdjAmount: "أدخل مبلغاً صحيحاً", errAdjReason: "اكتب سبباً واضحاً (8 أحرف على الأقل)",
    closeBtn: "إقفال الشهر واعتماد الحساب", closeConfirm: "تأكيد الإقفال — لن تتغير الأرقام بعده", cancel: "إلغاء",
    reopen: "إعادة فتح الشهر", closedBy: "أُقفل بواسطة",
    closedNote: "تم تجميد هذه الأرقام. تظهر للمناديب كحساب نهائي وتُعبّأ تلقائياً في مسير الرواتب.",
    exportReps: "تصدير المناديب", exportApps: "تصدير التطبيقات", noActivity: "لا توجد طلبات مسجّلة لهذا الشهر بعد.", viewOnly: "عرض فقط",
    dayApp: "تطبيق اليوم",
    myT: "أرباحي", estimate: "تقديري حتى الآن", finalLbl: "نهائي ومعتمد", gross: "ربحك من الطلبات", deductions: "الخصومات", additions: "الإضافات",
    netProfit: "صافي ربحك", yourRates: "تسعيرتك", daily: "سجل الأيام", date: "التاريخ", hours: "الساعات", violations: "المخالفات",
    noDays: "لا توجد أيام مسجّلة بعد.", closeNoteRep: "هذا حسابك النهائي للشهر — اعتمدته المحاسبة.",
    estNoteRep: "رقم تقديري يتحدث تلقائياً كلما سجّل المشرف طلباتك. الرقم النهائي يُعتمد آخر الشهر بعد المراجعة.",
    weekendViol: "مخالفة إجازة", appViol: "مخالفة تطبيق", reasonLbl: "السبب",
    dOrder: "لكل طلب", dKm: "لكل كم", dFixed: "ثابت شهري", dTarget: "عند هدف", dAbove: "لكل طلب زائد/ناقص", dKmAbove: "لكل كم زائد/ناقص", dFrom: "من الطلب",
    more: "المزيد", quickJump: "انتقال سريع", noHits: "لا نتائج",
    grpMain: "الرئيسية", grpOps: "التشغيل", grpFin: "المالية", grpPeople: "الأفراد", grpComms: "التواصل", grpGov: "الحوكمة والأمان",
    payFilled: "مبالغ المناديب مُعبّأة من محاسبة المناديب المقفلة — يمكنك تعديلها قبل الإقفال.",
    finCloseNotif: "حساب المناديب لهذا الشهر لم يُقفل بعد", repClosedNotif: "اعتُمد حسابك الشهري — اضغط لرؤية صافي ربحك",
  },
  en: {
    title: "Rep Accounting", sub: "Supervisors log orders daily and the system calculates everything. At month-end you review pricing and violations, then close the books.",
    tabClose: "Month close", tabApp: "App pricing (to us)", tabRep: "Our pricing (to reps)",
    appPriceT: "How each app pays us (company revenue)", appPriceSub: "Choose the calculation method per app — this is what the company receives.",
    repPriceT: "How we pay the rep (rep profit)", repPriceSub: "The pricing we gave reps for each app — their profit is calculated from it automatically and shown on their page.",
    mode: "Calculation method", modeUnit: "Per order + per km", modeTarget: "Fixed amount at target ± extra/short", modeTiers: "Tiers by order count",
    perOrder: "Price per order", perKm: "Price per km", freeKm: "Free km (deducted from total)", fixedMonthly: "Extra fixed monthly amount",
    ordersBase: "Orders amount at target", ordersTarget: "Monthly orders target", perOrderDelta: "Price per extra/short order",
    kmBase: "Km amount at target", kmTarget: "Monthly km target", perKmDelta: "Price per extra/short km",
    tierFrom: "From order #", tierRate: "Price per order", addTier: "Add tier", tiersNote: "Start the first tier at 0 — each tier applies until the next one begins.",
    tryIt: "Try the math", tryOrders: "Orders", tryKm: "Km", tryResult: "Result",
    save: "Save pricing", saved: "Saved", configured: "Configured", usingDefault: "Default", resetDefault: "Reset to default", copyAll: "Copy to all apps",
    unsaved: "Unsaved changes",
    month: "Month", draft: "Draft", closedLbl: "Closed & approved",
    kRevenue: "App revenue", kRepNet: "Reps' net profit", kFines: "Rep deductions (to company)", kCompanyNet: "Company net profit", kAfterExp: "After approved expenses",
    step1: "1) Apps: revenue", step2: "2) Reps: earnings & violations", step3: "3) Close",
    colApp: "App", colOrders: "Orders", colKm: "Km", colCalc: "By pricing", colActual: "Actual invoice", colAppFines: "App fines on us",
    colRevenue: "Final revenue", colRepCost: "Owed to its reps", colMargin: "Company margin",
    colRep: "Rep", colGross: "Before deductions", colWeekend: "Weekend violation", colAppViol: "App violation", colAdj: "Adjustments", colNet: "Net profit",
    actualHint: "Leave empty to use the automatic calculation", count: "Count",
    adjT: "Manual adjustment (add / deduct)", adjType: "Type", adjAdd: "Add", adjDeduct: "Deduct", adjAmount: "Amount", adjReason: "Reason (required — at least 8 characters)",
    adjAddBtn: "Add adjustment", errAdjAmount: "Enter a valid amount", errAdjReason: "Write a clear reason (at least 8 characters)",
    closeBtn: "Close month & approve", closeConfirm: "Confirm close — numbers will be frozen", cancel: "Cancel",
    reopen: "Reopen month", closedBy: "Closed by",
    closedNote: "These numbers are frozen. Reps now see them as final and payroll is pre-filled from them.",
    exportReps: "Export reps", exportApps: "Export apps", noActivity: "No orders logged for this month yet.", viewOnly: "View only",
    dayApp: "Day's app",
    myT: "My earnings", estimate: "Estimate so far", finalLbl: "Final & approved", gross: "Your order earnings", deductions: "Deductions", additions: "Additions",
    netProfit: "Your net profit", yourRates: "Your rates", daily: "Daily log", date: "Date", hours: "Hours", violations: "Violations",
    noDays: "No days logged yet.", closeNoteRep: "This is your final statement for the month — approved by accounting.",
    estNoteRep: "A live estimate that updates whenever your supervisor logs your orders. The final figure is approved at month-end after review.",
    weekendViol: "Weekend violation", appViol: "App violation", reasonLbl: "Reason",
    dOrder: "per order", dKm: "per km", dFixed: "fixed monthly", dTarget: "at target", dAbove: "per extra/short order", dKmAbove: "per extra/short km", dFrom: "from order",
    more: "More", quickJump: "Quick jump", noHits: "No results",
    grpMain: "Main", grpOps: "Operations", grpFin: "Finance", grpPeople: "People", grpComms: "Communication", grpGov: "Governance & security",
    payFilled: "Rep amounts are pre-filled from the closed rep accounting — you can edit them before closing.",
    finCloseNotif: "This month's rep accounting isn't closed yet", repClosedNotif: "Your monthly statement is approved — tap to see your net profit",
  },
  ur: {
    title: "نمائندہ اکاؤنٹنگ", sub: "سپروائزر روزانہ آرڈرز درج کرتا ہے اور سسٹم سب خود حساب کرتا ہے۔ مہینے کے آخر میں قیمتیں اور خلاف ورزیاں دیکھ کر حساب بند کریں۔",
    tabClose: "مہینہ بند کریں", tabApp: "ایپ کی قیمت (ہمیں)", tabRep: "ہماری قیمت (نمائندے کو)",
    appPriceT: "ایپ ہمیں کیسے ادائیگی کرتی ہے", appPriceSub: "ہر ایپ کے لیے حساب کا طریقہ چنیں۔",
    repPriceT: "ہم نمائندے کو کیسے ادائیگی کرتے ہیں", repPriceSub: "ہر ایپ کے لیے نمائندے کی قیمت — منافع خود حساب ہو کر اس کے صفحے پر دکھتا ہے۔",
    mode: "حساب کا طریقہ", modeUnit: "فی آرڈر + فی کلومیٹر", modeTarget: "ہدف پر مقررہ رقم ± زیادہ/کم", modeTiers: "آرڈرز کے مطابق سلیب",
    perOrder: "فی آرڈر قیمت", perKm: "فی کلومیٹر قیمت", freeKm: "مفت کلومیٹر", fixedMonthly: "اضافی ماہانہ رقم",
    ordersBase: "ہدف پر آرڈرز کی رقم", ordersTarget: "ماہانہ آرڈر ہدف", perOrderDelta: "زیادہ/کم آرڈر کی قیمت",
    kmBase: "ہدف پر کلومیٹر کی رقم", kmTarget: "ماہانہ کلومیٹر ہدف", perKmDelta: "زیادہ/کم کلومیٹر کی قیمت",
    tierFrom: "آرڈر نمبر سے", tierRate: "فی آرڈر قیمت", addTier: "سلیب شامل کریں", tiersNote: "پہلا سلیب 0 سے شروع کریں۔",
    tryIt: "حساب آزمائیں", tryOrders: "آرڈرز", tryKm: "کلومیٹر", tryResult: "نتیجہ",
    save: "قیمت محفوظ کریں", saved: "محفوظ ہو گیا", configured: "ترتیب شدہ", usingDefault: "ڈیفالٹ", resetDefault: "ڈیفالٹ پر واپس", copyAll: "سب ایپس پر کاپی",
    unsaved: "غیر محفوظ تبدیلیاں",
    month: "مہینہ", draft: "مسودہ", closedLbl: "بند اور منظور",
    kRevenue: "ایپس کی آمدنی", kRepNet: "نمائندوں کا خالص منافع", kFines: "نمائندوں کی کٹوتیاں", kCompanyNet: "کمپنی کا خالص منافع", kAfterExp: "منظور شدہ اخراجات کے بعد",
    step1: "۱) ایپس: آمدنی", step2: "۲) نمائندے: کمائی اور خلاف ورزیاں", step3: "۳) بندش",
    colApp: "ایپ", colOrders: "آرڈرز", colKm: "کلومیٹر", colCalc: "قیمت کے مطابق", colActual: "اصل انوائس", colAppFines: "ایپ کے جرمانے",
    colRevenue: "حتمی آمدنی", colRepCost: "نمائندوں کا حق", colMargin: "کمپنی کا منافع",
    colRep: "نمائندہ", colGross: "کٹوتی سے پہلے", colWeekend: "چھٹی کی خلاف ورزی", colAppViol: "ایپ کی خلاف ورزی", colAdj: "ایڈجسٹمنٹ", colNet: "خالص منافع",
    actualHint: "خالی چھوڑیں تو خودکار حساب ہوگا", count: "تعداد",
    adjT: "دستی ایڈجسٹمنٹ", adjType: "قسم", adjAdd: "اضافہ", adjDeduct: "کٹوتی", adjAmount: "رقم", adjReason: "وجہ (لازمی — کم از کم 8 حروف)",
    adjAddBtn: "ایڈجسٹمنٹ شامل کریں", errAdjAmount: "درست رقم لکھیں", errAdjReason: "واضح وجہ لکھیں (کم از کم 8 حروف)",
    closeBtn: "مہینہ بند کریں اور منظور کریں", closeConfirm: "بندش کی تصدیق — اعداد منجمد ہو جائیں گے", cancel: "منسوخ",
    reopen: "مہینہ دوبارہ کھولیں", closedBy: "بند کرنے والا",
    closedNote: "یہ اعداد منجمد ہیں۔ نمائندوں کو حتمی حساب کے طور پر دکھتے ہیں۔",
    exportReps: "نمائندے ایکسپورٹ", exportApps: "ایپس ایکسپورٹ", noActivity: "اس مہینے ابھی کوئی آرڈر درج نہیں۔", viewOnly: "صرف دیکھیں",
    dayApp: "آج کی ایپ",
    myT: "میری کمائی", estimate: "اب تک کا اندازہ", finalLbl: "حتمی اور منظور", gross: "آرڈرز سے کمائی", deductions: "کٹوتیاں", additions: "اضافے",
    netProfit: "آپ کا خالص منافع", yourRates: "آپ کی قیمتیں", daily: "روزانہ ریکارڈ", date: "تاریخ", hours: "گھنٹے", violations: "خلاف ورزیاں",
    noDays: "ابھی کوئی دن درج نہیں۔", closeNoteRep: "یہ مہینے کا آپ کا حتمی حساب ہے۔",
    estNoteRep: "یہ اندازہ ہے جو ہر بار آرڈر درج ہونے پر بدلتا ہے۔ حتمی رقم مہینے کے آخر میں منظور ہوتی ہے۔",
    weekendViol: "چھٹی کی خلاف ورزی", appViol: "ایپ کی خلاف ورزی", reasonLbl: "وجہ",
    dOrder: "فی آرڈر", dKm: "فی کلومیٹر", dFixed: "ماہانہ مقررہ", dTarget: "ہدف پر", dAbove: "فی زیادہ/کم آرڈر", dKmAbove: "فی زیادہ/کم کلومیٹر", dFrom: "آرڈر سے",
    more: "مزید", quickJump: "فوری رسائی", noHits: "کوئی نتیجہ نہیں",
    grpMain: "مرکزی", grpOps: "آپریشنز", grpFin: "مالیات", grpPeople: "افراد", grpComms: "رابطہ", grpGov: "نظم و ضبط اور سیکیورٹی",
    payFilled: "نمائندوں کی رقوم بند شدہ اکاؤنٹنگ سے بھری گئی ہیں۔",
    finCloseNotif: "اس مہینے کا نمائندہ حساب ابھی بند نہیں ہوا", repClosedNotif: "آپ کا ماہانہ حساب منظور ہو گیا",
  },
};
/* ═══════════  معرف المندوب + مطابقة فاتورة التطبيق  ═══════════ */
Object.assign(RA.ar, {
  riderId: "معرّف المندوب في التطبيق", riderIdPh: "مثال: 4821937", errRiderDup: "هذا المعرّف مسجّل لمندوب آخر في نفس التطبيق",
  colInvNet: "صافي الفاتورة", colRecorded: "مسجّل يومياً", noPolicy: "بدون تسعيرة", noRiderId: "بدون معرّف",
  srcInv: "فاتورة", srcDaily: "يومي",
  stSub: "ارفع فاتورة كل تطبيق (Excel) — يربط النظام كل صف بالمندوب عبر معرّفه ويحسب طلباته ومخالفاته وربحه، ثم يعطيك صافي ربح الشركة.",
  ridersN: "مندوب", matchedN: "تمت مطابقتهم", noInvoice: "لم تُرفع فاتورة بعد — تُحتسب الطلبات من إدخال المشرف", stReplace: "استبدال الفاتورة",
  unmatchedT: "معرّفات في الفاتورة بدون مندوب", linkTo: "اربطه بمندوب…",
  wT: "ملاحظات قبل الإقفال", wRepPrice: "لا توجد تسعيرة مندوب — أرباح المناديب 0", wAppPrice: "لا توجد تسعيرة تطبيق ولا فاتورة — الإيراد 0", wNoId: "مندوب بدون معرّف تطبيق (لن يُطابَق مع الفاتورة)",
  noRateYet: "لم يحدّد المحاسب تسعيرتك بعد — سيظهر ربحك فور اعتمادها", rhMonthOrders: "طلبات الشهر",
  phoneL: "الجوال", usingDefault: "غير مضبوطة", resetDefault: "حذف التسعيرة",
});
Object.assign(RA.en, {
  riderId: "Rider ID in the app", riderIdPh: "e.g. 4821937", errRiderDup: "This ID is already used by another rider on the same app",
  colInvNet: "Invoice net", colRecorded: "logged daily", noPolicy: "No pricing", noRiderId: "No ID",
  srcInv: "invoice", srcDaily: "daily",
  stSub: "Upload each app's invoice (Excel) — every row is matched to a rider by ID, showing orders, violations and profit, then the company's net profit.",
  ridersN: "riders", matchedN: "Matched", noInvoice: "No invoice uploaded yet — orders come from the supervisor's entries", stReplace: "Replace invoice",
  unmatchedT: "Invoice IDs with no rider", linkTo: "Link to a rider…",
  wT: "Before closing", wRepPrice: "No rider pricing set — rider earnings are 0", wAppPrice: "No app pricing and no invoice — revenue is 0", wNoId: "rider(s) without an app ID (won't match the invoice)",
  noRateYet: "The accountant hasn't set your pricing yet — your earnings appear once approved", rhMonthOrders: "Orders this month",
  phoneL: "Phone", usingDefault: "Not set", resetDefault: "Remove pricing",
});
Object.assign(RA.ur, {
  riderId: "ایپ میں رائیڈر آئی ڈی", riderIdPh: "مثال: 4821937", errRiderDup: "یہ آئی ڈی اسی ایپ پر دوسرے رائیڈر کے پاس ہے",
  colInvNet: "انوائس خالص", colRecorded: "روزانہ درج", noPolicy: "قیمت مقرر نہیں", noRiderId: "آئی ڈی نہیں",
  srcInv: "انوائس", srcDaily: "روزانہ",
  stSub: "ہر ایپ کی انوائس (Excel) اپ لوڈ کریں — ہر صف آئی ڈی سے رائیڈر سے ملتی ہے، پھر کمپنی کا خالص منافع۔",
  ridersN: "رائیڈرز", matchedN: "ملائے گئے", noInvoice: "ابھی انوائس اپ لوڈ نہیں ہوئی", stReplace: "انوائس تبدیل کریں",
  unmatchedT: "انوائس میں بغیر رائیڈر آئی ڈیز", linkTo: "رائیڈر سے جوڑیں…",
  wT: "بند کرنے سے پہلے", wRepPrice: "رائیڈر کی قیمت مقرر نہیں — کمائی 0", wAppPrice: "ایپ کی قیمت نہ انوائس — آمدنی 0", wNoId: "رائیڈرز بغیر ایپ آئی ڈی",
  noRateYet: "اکاؤنٹنٹ نے ابھی آپ کی قیمت مقرر نہیں کی", rhMonthOrders: "اس ماہ آرڈرز",
  phoneL: "فون", usingDefault: "مقرر نہیں", resetDefault: "قیمت ہٹائیں",
});
Object.assign(T.ar.nav, { repAccounting: "محاسبة المناديب", myEarnings: "أرباحي" });
Object.assign(T.en.nav, { repAccounting: "Rep Accounting", myEarnings: "My Earnings" });
Object.assign(T.ur.nav, { repAccounting: "نمائندہ اکاؤنٹنگ", myEarnings: "میری کمائی" });

/* ═══════════  محاسبة المناديب (المحاسب) + أرباحي (المندوب)  ═══════════ */
const INPUT_ST = { background: "#fff", border: "1px solid var(--line-strong)", color: "#12151D" };

function describePrice(p, RAx, sar) {
  const n = (v) => +v || 0;
  if (!p) return [];
  const fx = n(p.fixedMonthly) ? [`${n(p.fixedMonthly)} ${sar} ${RAx.dFixed}`] : [];
  if (p.mode === "target") return [`${n(p.ordersBase)} ${sar} ${RAx.dTarget} ${n(p.ordersTarget)} · ${n(p.perOrderDelta)} ${sar} ${RAx.dAbove}`].concat(fx);
  if (p.mode === "tiers") return (p.tiers || []).map((tr) => `${RAx.dFrom} ${n(tr.from)}: ${n(tr.rate)} ${sar} ${RAx.dOrder}`).concat(fx);
  return [`${n(p.perOrder)} ${sar} ${RAx.dOrder}`].concat(fx);
}

function PriceForm({ value, onChange, RAx, sar }) {
  const p = value;
  const [tryO, setTryO] = useState(100);
  const setNum = (k) => (e) => onChange({ ...p, [k]: e.target.value === "" ? "" : +e.target.value });
  const Field = ({ k }) => (
    <label className="block">
      <span className="block text-[10.5px] mb-1" style={{ color: "var(--muted)" }}>{RAx[k]}</span>
      <input type="number" step="any" value={p[k] ?? ""} onChange={setNum(k)} className="num w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST} />
    </label>
  );
  const tiers = p.tiers || [{ from: 0, rate: 0 }];
  const setTier = (i, k, v) => onChange({ ...p, tiers: tiers.map((tr, j) => (j === i ? { ...tr, [k]: v === "" ? "" : +v } : tr)) });
  const res = priceCalc(p, +tryO || 0);
  const modes = [["unit", RAx.modeUnit], ["target", RAx.modeTarget], ["tiers", RAx.modeTiers]];
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--muted)" }}>{RAx.mode}</p>
        <div className="flex gap-2 flex-wrap">
          {modes.map(([id, label]) => (
            <button key={id} onClick={() => onChange({ ...BLANK_PRICE, ...p, mode: id })}
              className="px-3 py-2 rounded-xl text-[12px] font-bold transition"
              style={{ background: p.mode === id ? "rgba(184,134,46,.14)" : "rgba(20,27,45,.04)", border: `1px solid ${p.mode === id ? "rgba(184,134,46,.5)" : "var(--line)"}`, color: p.mode === id ? "#8A611E" : "var(--muted)" }}>{label}</button>
          ))}
        </div>
      </div>
      {p.mode === "target" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field k="ordersBase" /><Field k="ordersTarget" /><Field k="perOrderDelta" />
          <Field k="fixedMonthly" />
        </div>
      )}
      {p.mode === "tiers" && (
        <div className="space-y-2">
          {tiers.map((tr, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <label className="block"><span className="block text-[10.5px] mb-1" style={{ color: "var(--muted)" }}>{RAx.tierFrom}</span>
                <input type="number" value={tr.from ?? ""} onChange={(e) => setTier(i, "from", e.target.value)} className="num w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST} /></label>
              <label className="block"><span className="block text-[10.5px] mb-1" style={{ color: "var(--muted)" }}>{RAx.tierRate}</span>
                <input type="number" step="any" value={tr.rate ?? ""} onChange={(e) => setTier(i, "rate", e.target.value)} className="num w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST} /></label>
              <button disabled={tiers.length <= 1} onClick={() => onChange({ ...p, tiers: tiers.filter((_, j) => j !== i) })} className="p-2.5 rounded-lg disabled:opacity-30" style={{ background: "rgba(232,131,122,.1)" }}><Trash2 size={14} style={{ color: "#E8837A" }} /></button>
            </div>
          ))}
          <button onClick={() => onChange({ ...p, tiers: [...tiers, { from: (+tiers[tiers.length - 1].from || 0) + 100, rate: 0 }] })}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-2 rounded-xl" style={{ background: "rgba(20,27,45,.05)", border: "1px solid var(--line)" }}><Plus size={13} />{RAx.addTier}</button>
          <p className="text-[10.5px]" style={{ color: "var(--muted)" }}>{RAx.tiersNote}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2"><Field k="fixedMonthly" /></div>
        </div>
      )}
      {(p.mode === "unit" || !p.mode) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3"><Field k="perOrder" /><Field k="fixedMonthly" /></div>
      )}
      <div className="rounded-xl p-3" style={{ background: "rgba(15,165,121,.06)", border: "1px solid rgba(15,165,121,.22)" }}>
        <p className="text-[11px] font-bold mb-2" style={{ color: "#0B5C46" }}>{RAx.tryIt}</p>
        <div className="flex items-end gap-3 flex-wrap">
          <label className="block"><span className="block text-[10px] mb-1" style={{ color: "var(--muted)" }}>{RAx.tryOrders}</span>
            <input type="number" value={tryO} onChange={(e) => setTryO(e.target.value)} className="num w-24 rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold outline-none" style={INPUT_ST} /></label>
          <div className="ms-auto text-end"><span className="block text-[10px]" style={{ color: "var(--muted)" }}>{RAx.tryResult}</span>
            <span className="num text-[20px] font-extrabold" style={{ color: "#0B5C46" }}>{fmt(res.total)} <span className="text-[11px]">{sar}</span></span></div>
        </div>
      </div>
    </div>
  );
}

function PricingTab({ lang, role, kind, pricing, setPricing, setAuditLog, actingEmployee }) {
  const RAx = RA[lang], t = T[lang];
  const canEdit = role.id === "fin" || role.id === "gm";
  const [appId, setAppId] = useState(APPS[0].id);
  const stored = pricing && pricing[kind] && pricing[kind][appId];
  const base = stored || BLANK_PRICE;
  const [draft, setDraft] = useState({ ...BLANK_PRICE, ...base });
  const [done, setDone] = useState(false);
  useEffect(() => { setDraft({ ...BLANK_PRICE, ...base }); setDone(false); }, [appId, kind]); // eslint-disable-line
  const dirty = JSON.stringify(draft) !== JSON.stringify({ ...BLANK_PRICE, ...base });
  const writeFor = (ids, val) => setPricing((prev) => {
    const cur = prev || { app: {}, rep: {} };
    const map = { ...(cur[kind] || {}) };
    ids.forEach((id) => { if (val) map[id] = val; else delete map[id]; });
    return { ...cur, [kind]: map };
  });
  const save = () => { if (!validPrice(draft)) return; writeFor([appId], draft); logAudit(setAuditLog, role, "pricing_" + kind, `${APPS.find((a) => a.id === appId)[lang]}`, actingEmployee); setDone(true); setTimeout(() => setDone(false), 1800); };
  const copyAll = () => { writeFor(APPS.map((a) => a.id), draft); logAudit(setAuditLog, role, "pricing_" + kind + "_all", "all apps", actingEmployee); setDone(true); setTimeout(() => setDone(false), 1800); };
  return (
    <div className="space-y-4">
      <Panel title={kind === "app" ? RAx.appPriceT : RAx.repPriceT}>
        <p className="text-[12px] mb-4" style={{ color: "var(--muted)" }}>{kind === "app" ? RAx.appPriceSub : RAx.repPriceSub}</p>
        <div className="flex gap-2 flex-wrap mb-5">
          {APPS.map((a) => {
            const on = appId === a.id, conf = !!(pricing && pricing[kind] && pricing[kind][a.id]);
            return (
              <button key={a.id} onClick={() => setAppId(a.id)} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition"
                style={{ background: on ? `rgba(${role.glow},.16)` : "rgba(20,27,45,.04)", border: `1px solid ${on ? `rgba(${role.glow},.5)` : "var(--line)"}`, color: on ? "#12151D" : "var(--muted)" }}>
                {a[lang]}
                <span className="w-2 h-2 rounded-full" title={conf ? RAx.configured : RAx.usingDefault} style={{ background: conf ? "#0FA579" : "#C9CED8" }} />
              </button>
            );
          })}
        </div>
        <fieldset disabled={!canEdit} style={{ border: 0, padding: 0, margin: 0, opacity: canEdit ? 1 : .85 }}>
          <PriceForm value={draft} onChange={setDraft} RAx={RAx} sar={t.sar} />
        </fieldset>
        {canEdit ? (
          <div className="flex items-center gap-2.5 mt-5 flex-wrap">
            <Btn variant="accent" accent={role.glow} icon={done ? CheckCircle2 : BadgeCheck} onClick={save} disabled={!validPrice(draft)}>{done ? RAx.saved : RAx.save}</Btn>
            <Btn icon={Copy} onClick={copyAll}>{RAx.copyAll}</Btn>
            {stored && <Btn icon={X} onClick={() => { writeFor([appId], null); }}>{RAx.resetDefault}</Btn>}
            {dirty && <span className="text-[11px] font-semibold" style={{ color: "#B8862E" }}>{RAx.unsaved}</span>}
          </div>
        ) : <p className="text-[11px] mt-4" style={{ color: "var(--muted)" }}>{RAx.viewOnly}</p>}
      </Panel>
    </div>
  );
}

function SettlementClose({ lang, role, reps, setReps, reports, pricing, repSettlements, setRepSettlements, weekendFine, violationPenalty, expenses, repReceipts, setAuditLog, actingEmployee }) {
  const RAx = RA[lang], t = T[lang], x = EX[lang];
  const [month, setMonth] = useState(riyadhNow().toISOString().slice(0, 7));
  const [openRep, setOpenRep] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [adj, setAdj] = useState({ type: "deduct", amount: "", reason: "" });
  const [err, setErr] = useState("");
  const [stErr, setStErr] = useState("");
  const rec = repSettlements.find((s) => s.month === month);
  const inputs = { ...EMPTY_SETTLE_INPUTS, ...((rec && rec.inputs) || {}) };
  const closed = !!(rec && rec.closed && rec.snapshot);
  const canEdit = role.id === "fin" && !closed;
  const live = computeSettlement(month, reps, reports, pricing, inputs, weekendFine, violationPenalty, expenses, repReceipts);
  const res = closed ? rec.snapshot : live;
  const appName = (id) => (APPS.find((a) => a.id === id) || {})[lang] || id;
  const patch = (fn) => setRepSettlements((prev) => {
    const cur = prev.find((s) => s.month === month);
    const baseRec = cur || { id: "SET-" + month, month, closed: false, inputs: EMPTY_SETTLE_INPUTS };
    const next = { ...baseRec, inputs: fn({ ...EMPTY_SETTLE_INPUTS, ...baseRec.inputs }) };
    return cur ? prev.map((s) => (s.month === month ? next : s)) : [next, ...prev];
  });
  const setMap = (field, key, v) => patch((i) => { const m = { ...i[field] }; if (v === "" || v == null) delete m[key]; else m[key] = +v; return { ...i, [field]: m }; });
  const setFine = (repId, k, v) => patch((i) => ({ ...i, fineOverride: { ...i.fineOverride, [repId]: { ...(i.fineOverride[repId] || {}), [k]: v === "" ? undefined : +v } } }));
  const addAdj = (repId) => {
    const amount = +adj.amount;
    if (!(amount > 0)) return setErr(RAx.errAdjAmount);
    if (adj.reason.trim().length < 8) return setErr(RAx.errAdjReason);
    setErr("");
    patch((i) => ({ ...i, manual: [...i.manual, { id: "ADJ-" + Date.now(), repId, type: adj.type, amount, reason: adj.reason.trim(), by: actingEmployee?.name || role.id, at: riyadhNow().toISOString() }] }));
    logAudit(setAuditLog, role, "rep_adjustment", `${repId}: ${adj.type} ${amount} — ${adj.reason.slice(0, 40)}`, actingEmployee);
    setAdj({ type: "deduct", amount: "", reason: "" });
  };
  const delAdj = (id) => patch((i) => ({ ...i, manual: i.manual.filter((m) => m.id !== id) }));
  const doClose = () => {
    setRepSettlements((prev) => {
      const cur = prev.find((s) => s.month === month);
      const next = { ...(cur || { id: "SET-" + month, month, inputs }), closed: true, snapshot: live, closedBy: actingEmployee?.name || role.id, closedAt: riyadhNow().toISOString() };
      return cur ? prev.map((s) => (s.month === month ? next : s)) : [next, ...prev];
    });
    logAudit(setAuditLog, role, "rep_accounting_close", `${month} — net ${live.totals.companyNet}`, actingEmployee);
    setConfirm(false);
  };
  const reopen = () => {
    setRepSettlements((prev) => prev.map((s) => (s.month === month ? { ...s, closed: false, snapshot: null } : s)));
    logAudit(setAuditLog, role, "rep_accounting_reopen", month, actingEmployee);
  };
  const exportReps = () => exportToExcel(res.repLines.map((l) => ({
    [RAx.colRep]: l.name, [RAx.riderId]: l.riderId, [RAx.colApp]: appName(l.app), [RAx.colOrders]: l.orders, [RAx.colGross]: l.gross,
    [`${RAx.colWeekend} (${RAx.count})`]: l.weekendCount, [RAx.colWeekend]: l.weekendAmt, [`${RAx.colAppViol} (${RAx.count})`]: l.appCount, [RAx.colAppViol]: l.appAmt,
    [RAx.adjAdd]: l.manualAdds, [RAx.adjDeduct]: l.manualDeds, [RAx.colNet]: l.net })), `rep-accounting-${month}`, month);
  const exportApps = () => exportToExcel(res.appLines.map((l) => ({
    [RAx.colApp]: appName(l.app), [RAx.colOrders]: l.orders, [RAx.colCalc]: l.calc, [RAx.colInvNet]: l.invNet ?? "", [RAx.colActual]: l.actual ?? "",
    [RAx.colAppFines]: l.fines, [RAx.colRevenue]: l.revenue, [RAx.colRepCost]: l.repGross, [RAx.colMargin]: l.margin })), `app-accounting-${month}`, month);
  const num = (v, colour) => <span className="num font-bold" style={colour ? { color: colour } : null}>{fmt(r2(v))}</span>;
  const cell = "py-2.5 px-2.5 text-[12px] whitespace-nowrap";
  const head = "py-2 px-2.5 text-[10.5px] font-bold text-start whitespace-nowrap";
  const mini = (val, onCh, w) => (
    <input type="number" step="any" disabled={!canEdit} value={val} onChange={(e) => onCh(e.target.value)} className="num rounded-lg px-2 py-1.5 text-[12px] font-bold outline-none text-end" style={{ ...INPUT_ST, width: w || 84, opacity: canEdit ? 1 : .7 }} />
  );
  const T_ = res.totals;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "var(--muted)" }}>{RAx.month}
          <input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setConfirm(false); setOpenRep(null); }} className="num rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold outline-none" style={INPUT_ST} />
        </label>
        <Chip tone={closed ? "ok" : "warn"}>{closed ? RAx.closedLbl : RAx.draft}</Chip>
        {!canEdit && !closed && <Chip tone="n" sm>{RAx.viewOnly}</Chip>}
        <span className="ms-auto flex gap-2"><Btn icon={Download} onClick={exportReps}>{RAx.exportReps}</Btn><Btn icon={Download} onClick={exportApps}>{RAx.exportApps}</Btn></span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label={RAx.kRevenue} value={fmt(T_.revenue)} unit={t.sar} icon={CircleDollarSign} accent="139,155,247" />
        <Kpi label={RAx.kRepNet} value={fmt(T_.repNet)} unit={t.sar} icon={Users} accent="63,216,180" />
        <Kpi label={RAx.kFines} value={fmt(T_.deductions)} unit={t.sar} icon={AlertTriangle} accent="228,184,92" />
        <Kpi label={RAx.kCompanyNet} value={fmt(T_.companyNet)} unit={t.sar} icon={T_.companyNet >= 0 ? TrendingUp : TrendingDown} accent={T_.companyNet >= 0 ? "15,165,121" : "232,131,122"} />
      </div>
      <p className="text-[11.5px] -mt-1" style={{ color: "var(--muted)" }}>{RAx.kAfterExp}: <b className="num" style={{ color: T_.afterExpenses >= 0 ? "#0B5C46" : "#C0443A" }}>{fmt(T_.afterExpenses)} {t.sar}</b> <span className="num">({fmt(T_.expenses)} {t.sar})</span></p>

      {(() => {
        const miss = [];
        res.appLines.forEach((l) => { if (!l.repPriced) miss.push(`${appName(l.app)}: ${RAx.wRepPrice}`); if (!l.appPriced && !l.hasStatement && l.actual == null) miss.push(`${appName(l.app)}: ${RAx.wAppPrice}`); });
        const noId = res.repLines.filter((l) => !l.riderId && res.appLines.some((a) => a.app === l.app && a.hasStatement)).length;
        if (noId) miss.push(`${noId} ${RAx.wNoId}`);
        return miss.length && !closed ? (
          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(228,184,92,.1)", border: "1px solid rgba(228,184,92,.4)" }}>
            <p className="text-[12px] font-bold mb-1" style={{ color: "#8A611E" }}>{RAx.wT}</p>
            {miss.map((m, i) => <p key={i} className="text-[11.5px]" style={{ color: "#6B4A12" }}>• {m}</p>)}
          </div>
        ) : null;
      })()}

      <Panel title={RAx.step1}>
        {res.appLines.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full" style={{ minWidth: 820, borderCollapse: "collapse" }}>
              <thead><tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                {[RAx.colApp, RAx.colOrders, RAx.colCalc, RAx.colInvNet, RAx.colActual, RAx.colAppFines, RAx.colRevenue, RAx.colRepCost, RAx.colMargin].map((h) => <th key={h} className={head}>{h}</th>)}
              </tr></thead>
              <tbody>
                {res.appLines.map((l) => (
                  <tr key={l.app} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td className={cell}><b>{appName(l.app)}</b> <span className="num text-[10px]" style={{ color: "var(--muted)" }}>({l.reps})</span></td>
                    <td className={cell}>{num(l.orders)}</td><td className={cell}>{l.appPriced ? num(l.calc) : <Chip tone="warn" sm>{RAx.noPolicy}</Chip>}</td><td className={cell}>{l.invNet != null ? num(l.invNet) : "—"}</td>
                    <td className={cell}>{canEdit ? mini(inputs.appActual[l.app] ?? "", (v) => setMap("appActual", l.app, v), 100) : l.actual != null ? num(l.actual) : "—"}</td>
                    <td className={cell}>{canEdit ? mini(inputs.appFines[l.app] ?? "", (v) => setMap("appFines", l.app, v)) : num(l.fines)}</td>
                    <td className={cell}>{num(l.revenue)}</td><td className={cell}>{num(l.repGross)}</td>
                    <td className={cell}>{num(l.margin, l.margin >= 0 ? "#0B5C46" : "#C0443A")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {canEdit && <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{RAx.colActual}: {RAx.actualHint}</p>}
          </div>
        )}
      </Panel>

      <Panel title={RAx.stT}>
        <p className="text-[12px] mb-3" style={{ color: "var(--muted)" }}>{RAx.stSub}</p>
        <div className="space-y-2.5">
          {APPS.filter((a) => canEdit || closed ? true : true).map((ap) => {
            const l = res.appLines.find((z) => z.app === ap.id);
            const st = (inputs.appStatement || {})[ap.id];
            const matchedN = st ? st.rows.length - (l ? (l.unmatched || []).length : st.rows.length) : 0;
            if (!st && !canEdit) return null;
            return (
              <div key={ap.id} className="rounded-xl p-2.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <b className="text-[12.5px] w-28">{ap[lang]}</b>
                  {st ? (<>
                    <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{RAx.stStatement}: <b className="num">{fmt(st.orders)}</b> · {st.riders} {RAx.ridersN}</span>
                    <Chip tone={l && (l.unmatched || []).length === 0 ? "ok" : "warn"} sm>{RAx.matchedN}: {matchedN}/{st.rows.length}</Chip>
                    {l && l.recOrders !== st.orders && <Chip tone="bad" sm>{RAx.stDiff}: {st.orders - l.recOrders > 0 ? "+" : ""}{fmt(st.orders - l.recOrders)} ({RAx.colRecorded}: {fmt(l.recOrders)})</Chip>}
                  </>) : <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{RAx.noInvoice}</span>}
                  {canEdit && (
                    <span className="ms-auto inline-flex gap-2">
                      {st && <button onClick={() => patch((i) => { const m = { ...(i.appStatement || {}) }; delete m[ap.id]; return { ...i, appStatement: m }; })} className="p-2 rounded-xl" style={{ background: "rgba(232,131,122,.1)" }}><Trash2 size={13} style={{ color: "#E8837A" }} /></button>}
                      <label className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-2 rounded-xl cursor-pointer" style={{ background: "rgba(20,27,45,.06)", border: "1px solid var(--line)" }}>
                        <Upload size={13} />{st ? RAx.stReplace : RAx.stUpload}
                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={async (e) => {
                          const file = e.target.files && e.target.files[0]; if (!file) return;
                          try { const r = await parseStatement(file); if (!r) { setStErr(RAx.stErr); return; } setStErr(""); patch((i) => ({ ...i, appStatement: { ...(i.appStatement || {}), [ap.id]: r } })); logAudit(setAuditLog, role, "invoice_upload", `${ap.id} — ${file.name}`, actingEmployee); }
                          catch (er) { setStErr(RAx.stErr); }
                          e.target.value = "";
                        }} />
                      </label>
                    </span>
                  )}
                </div>
                {l && (l.unmatched || []).length > 0 && (
                  <div className="mt-3 rounded-lg p-2.5" style={{ background: "rgba(228,184,92,.1)", border: "1px solid rgba(228,184,92,.4)" }}>
                    <p className="text-[11.5px] font-bold mb-2" style={{ color: "#8A611E" }}>{RAx.unmatchedT} ({(l.unmatched || []).length})</p>
                    <div className="space-y-1.5">
                      {(l.unmatched || []).map((u) => (
                        <div key={u.id} className="flex items-center gap-2 text-[11.5px] flex-wrap">
                          <b className="num w-24">{u.id}</b><span className="num">{fmt(u.orders)} {t.orders}</span><span className="num" style={{ color: "var(--muted)" }}>{fmt(u.net)} {t.sar}</span>
                          {canEdit && setReps && (
                            <select value="" onChange={(e) => { const rid = e.target.value; if (!rid) return; setReps((prev) => prev.map((r) => (r.id === rid ? { ...r, riderId: u.id } : r))); logAudit(setAuditLog, role, "rider_id_link", `${u.id} → ${rid}`, actingEmployee); }}
                              className="ms-auto rounded-lg px-2 py-1.5 text-[11.5px] font-bold outline-none" style={INPUT_ST}>
                              <option value="">{RAx.linkTo}</option>
                              {reps.filter((r) => r.app === ap.id && !String(r.riderId || "").trim()).map((r) => <option key={r.id} value={r.id}>{lang === "en" ? r.en : r.ar}</option>)}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {stErr && <p className="text-[11.5px]" style={{ color: "#C0443A" }}>{stErr}</p>}
        </div>
      </Panel>

      <Panel title={RAx.step2}>
        {res.repLines.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{RAx.noActivity}</p> : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full" style={{ minWidth: 900, borderCollapse: "collapse" }}>
              <thead><tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                {[RAx.colRep, RAx.riderId, RAx.colOrders, RAx.colGross, RAx.colWeekend, RAx.colAppViol, RAx.colAdj, RAx.colReimb, RAx.colNet].map((h) => <th key={h} className={head}>{h}</th>)}
              </tr></thead>
              <tbody>
                {res.repLines.map((l) => {
                  const mine = (inputs.manual || []).filter((m) => m.repId === l.repId);
                  const open = openRep === l.repId;
                  return (
                    <React.Fragment key={l.repId}>
                      <tr style={{ borderBottom: open ? "none" : "1px solid var(--line)" }}>
                        <td className={cell}><b>{lang === "en" ? l.en : l.name}</b> <span className="text-[10px]" style={{ color: "var(--muted)" }}>{appName(l.app)}</span></td>
                        <td className={cell}>{l.riderId ? <span className="num text-[11.5px] font-bold">{l.riderId}</span> : <Chip tone="warn" sm>{RAx.noRiderId}</Chip>}</td>
                        <td className={cell}>{num(l.orders)} {l.source === "invoice" ? <Chip tone="ok" sm>{RAx.srcInv}</Chip> : <Chip tone="n" sm>{RAx.srcDaily}</Chip>}
                          {l.invOrders != null && l.recOrders !== l.invOrders && <span className="num text-[10px] ms-1" style={{ color: "#C0443A" }}>({RAx.colRecorded}: {l.recOrders})</span>}</td>
                        <td className={cell}>{l.unpriced ? <Chip tone="warn" sm>{RAx.noPolicy}</Chip> : num(l.gross)}</td>
                        <td className={cell}><span className="inline-flex items-center gap-1.5"><span className="num text-[10.5px]" style={{ color: "var(--muted)" }}>{l.weekendCount}×</span>
                          {canEdit ? mini(l.weekendAmt, (v) => setFine(l.repId, "weekend", v), 76) : num(l.weekendAmt, l.weekendAmt ? "#C0443A" : null)}</span></td>
                        <td className={cell}><span className="inline-flex items-center gap-1.5"><span className="num text-[10.5px]" style={{ color: "var(--muted)" }}>{l.appCount}×</span>
                          {canEdit ? mini(l.appAmt, (v) => setFine(l.repId, "app", v), 76) : num(l.appAmt, l.appAmt ? "#C0443A" : null)}</span></td>
                        <td className={cell}>
                          <button onClick={() => setOpenRep(open ? null : l.repId)} className="inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(20,27,45,.05)" }}>
                            <span className="num" style={{ color: "#0B5C46" }}>+{fmt(l.manualAdds)}</span> / <span className="num" style={{ color: "#C0443A" }}>-{fmt(l.manualDeds)}</span>
                          </button>
                        </td>
                        <td className={cell}>{num(l.reimb || 0)}</td>
                        <td className={cell}>{num(l.net, l.net >= 0 ? "#0B5C46" : "#C0443A")}</td>
                      </tr>
                      {open && (
                        <tr style={{ borderBottom: "1px solid var(--line)" }}><td colSpan={9} className="px-2.5 pb-3">
                          <div className="rounded-xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                            <p className="text-[11.5px] font-bold mb-2">{RAx.adjT}</p>
                            {mine.map((m) => (
                              <div key={m.id} className="flex items-center gap-2 text-[11.5px] mb-1.5">
                                <Chip tone={m.type === "add" ? "ok" : "bad"} sm>{m.type === "add" ? RAx.adjAdd : RAx.adjDeduct}</Chip>
                                <b className="num">{fmt(m.amount)}</b><span className="flex-1" style={{ color: "var(--muted)" }}>{m.reason}</span>
                                {canEdit && <button onClick={() => delAdj(m.id)} className="p-1"><Trash2 size={13} style={{ color: "#E8837A" }} /></button>}
                              </div>
                            ))}
                            {canEdit && (
                              <div className="flex items-end gap-2 flex-wrap mt-2">
                                <select value={adj.type} onChange={(e) => setAdj({ ...adj, type: e.target.value })} className="rounded-lg px-2 py-2 text-[12px] font-bold outline-none" style={INPUT_ST}>
                                  <option value="deduct">{RAx.adjDeduct}</option><option value="add">{RAx.adjAdd}</option></select>
                                <input type="number" placeholder={RAx.adjAmount} value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} className="num rounded-lg px-2.5 py-2 text-[12px] font-bold outline-none w-24" style={INPUT_ST} />
                                <input placeholder={RAx.adjReason} value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} className="flex-1 min-w-[180px] rounded-lg px-2.5 py-2 text-[12px] outline-none" style={INPUT_ST} />
                                <Btn icon={Plus} onClick={() => addAdj(l.repId)}>{RAx.adjAddBtn}</Btn>
                              </div>
                            )}
                            {err && openRep === l.repId && <p className="text-[11px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}
                          </div>
                        </td></tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title={RAx.step3}>
        {closed ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3" style={{ background: "rgba(15,165,121,.08)", border: "1px solid rgba(15,165,121,.25)" }}>
              <CheckCircle2 size={16} style={{ color: "#0FA579" }} className="shrink-0 mt-0.5" />
              <div><p className="text-[12.5px] font-bold" style={{ color: "#0B5C46" }}>{RAx.closedNote}</p>
                <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>{RAx.closedBy}: {rec.closedBy} · {(rec.closedAt || "").slice(0, 10)}</p></div>
            </div>
            {role.id === "gm" && <Btn icon={Lock} onClick={reopen}>{RAx.reopen}</Btn>}
          </div>
        ) : role.id === "fin" ? (
          confirm ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={doClose}>{RAx.closeConfirm}</Btn>
              <Btn onClick={() => setConfirm(false)}>{RAx.cancel}</Btn>
            </div>
          ) : <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => setConfirm(true)} disabled={res.repLines.length === 0}>{RAx.closeBtn}</Btn>
        ) : <p className="text-[12px]" style={{ color: "var(--muted)" }}>{RAx.viewOnly}</p>}
      </Panel>
    </div>
  );
}

function RepAccountingPage({ lang, role, reps, setReps, reports, pricing, setPricing, repSettlements, setRepSettlements, weekendFine, violationPenalty, expenses, repReceipts, setAuditLog, actingEmployee }) {
  const RAx = RA[lang];
  const [tab, setTab] = useState("close");
  const tabs = [["close", RAx.tabClose, CheckCircle2], ["app", RAx.tabApp, Building2], ["rep", RAx.tabRep, Users]];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: `linear-gradient(100deg,rgba(${role.glow},.13),rgba(${role.glow},.03))`, border: `1px solid rgba(${role.glow},.28)` }}>
        <div className="flex items-center gap-2.5 mb-1"><HandCoins size={18} style={{ color: role.accent }} /><h2 className="text-[15px] font-extrabold">{RAx.title}</h2></div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{RAx.sub}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-bold transition"
            style={{ background: tab === id ? "#12151D" : "#fff", color: tab === id ? "#fff" : "var(--muted)", border: "1px solid var(--line)" }}><Icon size={14} />{label}</button>
        ))}
      </div>
      {tab === "close" && <SettlementClose lang={lang} role={role} reps={reps} setReps={setReps} reports={reports} pricing={pricing} repSettlements={repSettlements} setRepSettlements={setRepSettlements}
        weekendFine={weekendFine} violationPenalty={violationPenalty} expenses={expenses} repReceipts={repReceipts} setAuditLog={setAuditLog} actingEmployee={actingEmployee} />}
      {tab !== "close" && <PricingTab lang={lang} role={role} kind={tab} pricing={pricing} setPricing={setPricing} setAuditLog={setAuditLog} actingEmployee={actingEmployee} />}
    </div>
  );
}

function MyEarningsPage({ lang, role, user, activeRep, reports, pricing, repSettlements, weekendFine, violationPenalty, repReceipts, tickets, setTickets }) {
  const RAx = RA[lang], t = T[lang];
  const cur = riyadhNow().toISOString().slice(0, 7);
  const prev1 = prevMonthStr(cur), prev2 = prevMonthStr(prev1);
  const [month, setMonth] = useState(cur);
  const [dp, setDp] = useState(null);
  const [dpMsg, setDpMsg] = useState("");
  if (!activeRep) return <EmptyHint lang={lang} />;
  const appName = (id) => (APPS.find((a) => a.id === id) || {})[lang] || id;
  const rec = repSettlements.find((s) => s.month === month);
  const closedLine = rec && rec.closed && rec.snapshot ? rec.snapshot.repLines.find((l) => l.repId === activeRep.id) : null;
  const entries = monthEntriesFor(reports, activeRep.id, month).sort((a, b) => (a.date < b.date ? 1 : -1));
  const c = repMonthCalc(entries, activeRep, pricing, weekendFine, violationPenalty, monthFactor(month));
  const inputs = { ...EMPTY_SETTLE_INPUTS, ...((rec && rec.inputs) || {}) };
  const manual = (inputs.manual || []).filter((m) => m.repId === activeRep.id);
  const reimbLive = r2((repReceipts || []).filter((q) => q.repId === activeRep.id && q.status === "approved" && (q.date || "").startsWith(month)).reduce((sum, q) => sum + (+q.amount || 0), 0));
  const L = closedLine || (() => {
    const fo = inputs.fineOverride[activeRep.id] || {};
    const weekendAmt = fo.weekend != null ? +fo.weekend : c.weekendAuto, appAmt = fo.app != null ? +fo.app : c.appAuto;
    const adds = manual.filter((m) => m.type === "add").reduce((s, m) => s + m.amount, 0), deds = manual.filter((m) => m.type === "deduct").reduce((s, m) => s + m.amount, 0);
    return { gross: c.gross, weekendAmt, appAmt, weekendCount: c.weekendCount, appCount: c.appCount, manualAdds: adds, manualDeds: deds, reimb: reimbLive, net: r2(c.gross + adds + reimbLive - weekendAmt - appAmt - deds), orders: c.orders, unpriced: c.unpriced };
  })();
  const isFinal = !!closedLine;
  const rateLines = describePrice(getRepPrice(pricing, activeRep.app), RAx, t.sar);
  const row = (label, val, tone) => (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--line)" }}>
      <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>{label}</span>
      <span className="num text-[14px] font-bold" style={{ color: tone || "#12151D" }}>{val}</span>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[cur, prev1, prev2].map((m) => (
          <button key={m} onClick={() => setMonth(m)} className="num px-3.5 py-2 rounded-xl text-[12px] font-bold" style={{ background: month === m ? "#12151D" : "#fff", color: month === m ? "#fff" : "var(--muted)", border: "1px solid var(--line)" }}>{m}</button>
        ))}
      </div>
      <div className="rounded-3xl p-5 sm:p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0E1424,#1B2A4A)", color: "#fff" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[12px] font-semibold opacity-70">{RAx.netProfit} · {month}</p>
          <Chip tone={isFinal ? "ok" : "warn"}>{isFinal ? RAx.finalLbl : RAx.estimate}</Chip>
        </div>
        <p className="num text-[40px] sm:text-[52px] font-extrabold leading-none mt-3">{fmt(L.net)} <span className="text-[16px] font-semibold opacity-70">{t.sar}</span></p>
        <div className="flex gap-5 mt-4 text-[12px] opacity-80 flex-wrap">
          <span><b className="num">{L.orders}</b> {t.orders}</span><span>{appName(activeRep.app)}</span>
        </div>
        <p className="text-[11px] mt-3 opacity-60">{isFinal ? RAx.closeNoteRep : RAx.estNoteRep}</p>
        {!isFinal && L.unpriced && <p className="text-[11.5px] mt-2 font-bold" style={{ color: "#E4B85C" }}>{RAx.noRateYet}</p>}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={RAx.netProfit}>
          {row(RAx.gross, `+${fmt(L.gross)}`)}
          {L.manualAdds > 0 && row(RAx.additions, `+${fmt(L.manualAdds)}`, "#0B5C46")}
          {(L.reimb || 0) > 0 && row(RAx.reimb, `+${fmt(L.reimb)}`, "#0B5C46")}
          {L.weekendAmt > 0 && row(`${RAx.weekendViol} (${L.weekendCount})`, `-${fmt(L.weekendAmt)}`, "#C0443A")}
          {L.appAmt > 0 && row(`${RAx.appViol} (${L.appCount})`, `-${fmt(L.appAmt)}`, "#C0443A")}
          {L.manualDeds > 0 && row(RAx.deductions, `-${fmt(L.manualDeds)}`, "#C0443A")}
          <div className="flex items-center justify-between pt-3"><span className="text-[13px] font-extrabold">{RAx.netProfit}</span><span className="num text-[18px] font-extrabold" style={{ color: "#0B5C46" }}>{fmt(L.net)} {t.sar}</span></div>
          {manual.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {manual.map((m) => <p key={m.id} className="text-[11.5px]" style={{ color: "var(--muted)" }}><b className="num" style={{ color: m.type === "add" ? "#0B5C46" : "#C0443A" }}>{m.type === "add" ? "+" : "-"}{fmt(m.amount)}</b> — {RAx.reasonLbl}: {m.reason}</p>)}
            </div>
          )}
        </Panel>
        <Panel title={RAx.yourRates}>
          <p className="text-[12px] font-bold mb-2">{appName(activeRep.app)}</p>
          <ul className="space-y-1.5">{rateLines.map((ln, i) => <li key={i} className="text-[12.5px] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ background: role.accent }} />{ln}</li>)}</ul>
        </Panel>
      </div>
      <Btn icon={Send} onClick={() => { try { window.open("https://wa.me/?text=" + encodeURIComponent(`${RAx.waMsg} ${month}\n${RAx.gross}: ${fmt(L.gross)}\n${RAx.deductions}: -${fmt((L.weekendAmt || 0) + (L.appAmt || 0) + (L.manualDeds || 0))}\n${RAx.netProfit}: ${fmt(L.net)} ${t.sar}`), "_blank"); } catch (e) {} }}>{RAx.rhShare}</Btn>
      {dp && (
        <Panel title={`${RAx.dpTitle}: ${dp.date}`}>
          <textarea value={dp.text} onChange={(e) => setDp({ ...dp, text: e.target.value })} placeholder={RAx.dpReason} rows={3} className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none" style={INPUT_ST} />
          <div className="flex gap-2 mt-3"><Btn variant="accent" accent={role.glow} icon={Send} onClick={() => {
            if (dp.text.trim().length < 8) { setDpMsg(RAx.dpReason); return; }
            setTickets((prev) => [{ id: "TK-" + Math.floor(1000 + Math.random() * 8999), repId: user, type: "dispute", mode: "text", text: `${RAx.dpText} ${dp.date}: ${dp.text.trim()}`, audio: null, attachment: null, attachmentName: "", apptAt: null, createdAt: riyadhNow().toISOString(), status: "open", stage: 0, log: [] }, ...prev]);
            setDp(null); setDpMsg(RAx.dpSent);
          }}>{RAx.dpSend}</Btn><Btn onClick={() => setDp(null)}>×</Btn></div>
          {dpMsg && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{dpMsg}</p>}
        </Panel>
      )}
      {!dp && dpMsg && <p className="text-[12px] font-bold" style={{ color: "#0B5C46" }}>{dpMsg}</p>}
      <Panel title={RAx.daily}>
        {entries.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{RAx.noDays}</p> : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full" style={{ minWidth: 460, borderCollapse: "collapse" }}>
              <thead><tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                {[RAx.date, RAx.colApp, RAx.colOrders, RAx.hours, RAx.violations, ""].map((h, hi) => <th key={hi} className="py-2 px-2 text-[10.5px] font-bold text-start">{h}</th>)}
              </tr></thead>
              <tbody>{entries.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td className="num py-2.5 px-2 text-[12px]">{e.date}</td><td className="py-2.5 px-2 text-[12px]">{appName(e.app || activeRep.app)}</td>
                  <td className="num py-2.5 px-2 text-[12.5px] font-bold">{e.orders || 0}</td>
                  <td className="num py-2.5 px-2 text-[12px]">{(e.hours || 0).toFixed(1)}</td>
                  <td className="num py-2.5 px-2 text-[12px]" style={{ color: (e.weekendViolations || 0) + (e.appViolations || 0) ? "#C0443A" : "var(--muted)" }}>{(e.weekendViolations || 0) + (e.appViolations || 0)}</td>
                  <td className="py-2 px-2">{!isFinal && <button onClick={() => { setDp({ date: e.date, text: "" }); setDpMsg(""); }} className="text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(228,184,92,.16)", color: "#8A611E" }}>{RAx.dpBtn}</button>}</td>
                </tr>))}</tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ═══════════  الواجهة المبسّطة: شاشة اليوم + المراكز + الهوية  ═══════════ */
Object.assign(RA.ar, {
  heroTag: "شبكة لوجستية متكاملة تخدم المنطقة الشرقية", heroReps: "مندوب نشط", heroApps: "تطبيق توصيل شريك", heroRegion: "المنطقة الشرقية",
  todayHello: "أهلاً بك", todayNeeds: "بانتظارك", todayClear: "كل شيء تمام — لا شيء ينتظرك الآن", todayQuick: "اختصارات سريعة",
  kReps: "مناديب نشطون", kMonthOrders: "طلبات الشهر", kTodayEntry: "إدخال طلبات اليوم", entered: "تم", notEntered: "لم يتم بعد",
  backupDue: "مضى أكثر من أسبوع على آخر نسخة احتياطية — حمّل نسخة الآن للأمان", goSettings: "فتح الإعدادات",
  showAll: "عرض كل الأقسام", showLess: "عرض الأساسي فقط",
});
Object.assign(RA.en, {
  heroTag: "An integrated logistics network serving the Eastern Province", heroReps: "active riders", heroApps: "partner delivery apps", heroRegion: "Eastern Province",
  todayHello: "Welcome", todayNeeds: "Needs you", todayClear: "All clear — nothing is waiting for you", todayQuick: "Quick actions",
  kReps: "Active reps", kMonthOrders: "Orders this month", kTodayEntry: "Today's orders entry", entered: "Done", notEntered: "Not yet",
  backupDue: "It's been over a week since the last backup — download one now to stay safe", goSettings: "Open settings",
  showAll: "Show all sections", showLess: "Show essentials only",
});
Object.assign(RA.ur, {
  heroTag: "مشرقی صوبے کی خدمت کرنے والا مربوط لاجسٹکس نیٹ ورک", heroReps: "فعال نمائندے", heroApps: "شراکت دار ڈیلیوری ایپس", heroRegion: "مشرقی صوبہ",
  todayHello: "خوش آمدید", todayNeeds: "آپ کے منتظر", todayClear: "سب ٹھیک ہے — کچھ منتظر نہیں", todayQuick: "فوری اقدامات",
  kReps: "فعال نمائندے", kMonthOrders: "ماہ کے آرڈرز", kTodayEntry: "آج کے آرڈرز کا اندراج", entered: "ہو گیا", notEntered: "ابھی نہیں",
  backupDue: "آخری بیک اپ کو ایک ہفتے سے زیادہ ہو گیا — ابھی ڈاؤن لوڈ کریں", goSettings: "ترتیبات کھولیں",
  showAll: "تمام سیکشنز دکھائیں", showLess: "صرف بنیادی دکھائیں",
});
Object.assign(T.ar.nav, { today: "اليوم", financeHub: "المالية", repsHub: "المناديب", commsHub: "التواصل", hrHub: "شؤون الموظفين", legalHub: "القانونية والعقود" });
Object.assign(T.en.nav, { today: "Today", financeHub: "Finance", repsHub: "Riders", commsHub: "Communication", hrHub: "HR", legalHub: "Legal & Contracts" });
Object.assign(T.ur.nav, { today: "آج", financeHub: "مالیات", repsHub: "نمائندے", commsHub: "رابطہ", hrHub: "انسانی وسائل", legalHub: "قانونی اور معاہدے" });

const HUBS = {
  financeHub: ["repAccounting", "receiptsAdmin", "payrollRuns", "expenses", "invoices"],
  repsHub: ["pulse", "leaderboard", "hall"],
  commsHub: ["tickets", "chat", "circulars", "messages"],
  hrHub: ["hiring", "employees", "iqama"],
  legalHub: ["charter", "contracts", "cases", "compliance"],
};
const HUB_OF = {};
Object.keys(HUBS).forEach((h) => HUBS[h].forEach((m) => { HUB_OF[m] = h; }));
const PRIMARY_NAV = {
  gm: ["today", "decisions", "financeHub", "repsHub", "commsHub"],
  opsm: ["today", "shifts", "repsHub", "cars", "commsHub"],
  ops: ["today", "shifts", "pulse", "cars", "commsHub"],
  fin: ["today", "financeHub", "commsHub"],
  hr: ["today", "hrHub", "repsHub", "commsHub", "attendance"],
  legal: ["today", "legalHub", "commsHub", "attendance"],
  advisor: ["today", "boardCouncil", "decisions", "financeHub"],
  rep: ["riderHome", "myEarnings", "riderReceipts", "attendance", "commsHub", "mystory", "leaderboard", "hall"],
};
const TODAY_QUICK = {
  gm: ["decisions", "expenses", "repAccounting", "pulse"], opsm: ["shifts", "pulse", "cars", "hiring"], ops: ["shifts", "pulse", "cars"],
  fin: ["repAccounting", "payrollRuns", "expenses"], hr: ["hiring", "iqama", "employees"], legal: ["cases", "contracts", "charter"],
  advisor: ["decisions", "payrollRuns", "boardCouncil"],
};

function HubPage(props) {
  const { hubId, role, lang, hubTab, hubStamp, navBadges } = props;
  const t = T[lang];
  const members = HUBS[hubId].filter((id) => role.nav.includes(id));
  const [tab, setTab] = useState(members.includes(hubTab) ? hubTab : members[0]);
  useEffect(() => { if (members.includes(hubTab)) setTab(hubTab); }, [hubTab, hubStamp]); // eslint-disable-line
  const Sub = PAGES[tab] || Overview;
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap p-1.5 rounded-2xl" style={{ background: "#fff", border: "1px solid var(--line)" }}>
        {members.map((id) => {
          const Icon = NAV_ICON[id], on = tab === id, b = (navBadges && navBadges[id]) || 0;
          return (
            <button key={id} onClick={() => setTab(id)} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition"
              style={{ background: on ? "#12151D" : "transparent", color: on ? "#fff" : "var(--muted)" }}>
              <Icon size={14} />{t.nav[id]}{b > 0 && <span className="num text-[9.5px] px-1.5 rounded-full" style={{ background: "#E8837A", color: "#fff" }}>{b}</span>}
            </button>
          );
        })}
      </div>
      <Sub key={tab} {...props} />
    </div>
  );
}

function BigLogo({ size = 120 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} style={{ filter: "drop-shadow(0 10px 28px rgba(228,184,92,.45))" }}>
        <defs>
          <linearGradient id="bgA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBEBC0" /><stop offset=".55" stopColor="#E4B85C" /><stop offset="1" stopColor="#A9741B" /></linearGradient>
          <linearGradient id="bgB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16213B" /><stop offset="1" stopColor="#0A0F1C" /></linearGradient>
        </defs>
        <polygon points="60,4 108,30 108,90 60,116 12,90 12,30" fill="url(#bgB)" stroke="url(#bgA)" strokeWidth="3" />
        <polygon points="60,16 97,36 97,84 60,104 23,84 23,36" fill="none" stroke="rgba(228,184,92,.35)" strokeWidth="1" />
        <path d="M66 24 38 66h20l-6 30 30-44H62z" fill="url(#bgA)" />
        <path d="M18 98c22-9 62-9 84 0" fill="none" stroke="url(#bgA)" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
      </svg>
    </div>
  );
}

function BrandHero({ lang, reps, compact }) {
  const t = T[lang], RAx = RA[lang];
  const active = reps ? reps.filter((r) => r.status === "active").length : null;
  return (
    <div className="relative overflow-hidden rounded-[28px] px-5 sm:px-10 py-7 sm:py-10 text-center" style={{ background: "radial-gradient(120% 140% at 50% 0%,#1B2A4A 0%,#0E1424 55%,#080C18 100%)", border: "1px solid rgba(228,184,92,.28)", boxShadow: "0 40px 90px -40px rgba(10,16,32,.7)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(40% 50% at 50% 0%,rgba(228,184,92,.18),transparent 70%)" }} />
      <div className="relative flex flex-col items-center">
        <BigLogo size={compact ? 92 : 124} />
        <h1 className="gold-text font-extrabold mt-4" style={{ fontSize: compact ? 34 : "clamp(38px,7vw,64px)", lineHeight: 1.05, letterSpacing: "-.01em" }}>{t.brand}</h1>
        <p className="text-[11px] sm:text-[12px] uppercase mt-2" style={{ letterSpacing: ".34em", color: "rgba(255,255,255,.55)" }}>{t.brand2}</p>
        <div className="h-px w-24 my-4" style={{ background: "linear-gradient(90deg,transparent,#E4B85C,transparent)" }} />
        <p className="text-[13px] sm:text-[15px] font-semibold max-w-xl" style={{ color: "rgba(255,255,255,.82)" }}>{RAx.heroTag}</p>
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-5 max-w-2xl">
          {APPS.map((a) => <span key={a.id} className="px-3 py-1.5 rounded-full text-[11.5px] sm:text-[12.5px] font-bold" style={{ background: "rgba(228,184,92,.12)", border: "1px solid rgba(228,184,92,.4)", color: "#F3D58E" }}>{a[lang]}</span>)}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 w-full max-w-xl">
          {[[active != null ? fmt(active) : "—", RAx.heroReps], [String(APPS.length), RAx.heroApps], ["◎", RAx.heroRegion]].map(([v, l], i) => (
            <div key={i} className="rounded-2xl py-3 px-2" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
              <div className="num text-[22px] sm:text-[28px] font-extrabold" style={{ color: "#F3D58E" }}>{v}</div>
              <div className="text-[10.5px] sm:text-[11.5px]" style={{ color: "rgba(255,255,255,.6)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TodayPage({ lang, role, notifs, goPage, reps, reports, activeRep }) {
  const RAx = RA[lang], t = T[lang];
  const [lastBackup] = usePersisted("bq_last_backup", null);
  const month = riyadhToday().slice(0, 7), today = riyadhToday();
  const monthOrders = reports.filter((rp) => rp.date.startsWith(month)).reduce((s, rp) => s + rp.entries.reduce((a, e) => a + (e.orders || 0), 0), 0);
  const entered = reports.some((rp) => rp.date === today);
  const backupOld = (role.id === "gm" || role.id === "opsm") && (!lastBackup || (Date.now() - new Date(lastBackup).getTime()) / 86400000 > 7);
  const quick = (TODAY_QUICK[role.id] || []).filter((id) => role.nav.includes(id));
  const tone = { bad: "#E8837A", warn: "#E4B85C", ok: "#4FD1A5", info: "#5BC8E8", n: "#9AA3B5" };
  const showOps = ["gm", "opsm", "ops"].includes(role.id);
  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 sm:p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0E1424,#1B2A4A)", color: "#fff" }}>
        <p className="text-[12px] opacity-70">{RAx.todayHello} · {today}</p>
        <h2 className="text-[22px] sm:text-[28px] font-extrabold mt-1">{role[lang].t}</h2>
        <p className="text-[13px] mt-2 opacity-80">{notifs.length ? `${RAx.todayNeeds}: ${notifs.length}` : RAx.todayClear}</p>
      </div>
      {backupOld && (
        <button onClick={() => goPage("settings")} className="w-full flex items-center gap-3 rounded-2xl p-3.5 text-start" style={{ background: "rgba(228,184,92,.1)", border: "1px solid rgba(228,184,92,.35)" }}>
          <AlertTriangle size={16} style={{ color: "#B8862E" }} className="shrink-0" />
          <span className="flex-1 text-[12.5px] font-semibold" style={{ color: "#8A611E" }}>{RAx.backupDue}</span>
          <span className="text-[11.5px] font-bold" style={{ color: "#8A611E" }}>{RAx.goSettings} →</span>
        </button>
      )}
      {showOps && (
        <div className="grid grid-cols-3 gap-3">
          <Kpi label={RAx.kReps} value={fmt(reps.filter((r) => r.status === "active").length)} icon={Users} accent={role.glow} />
          <Kpi label={RAx.kMonthOrders} value={fmt(monthOrders)} icon={ShoppingBag} accent={role.glow} />
          <Kpi label={RAx.kTodayEntry} value={entered ? RAx.entered : RAx.notEntered} icon={entered ? CheckCircle2 : Clock} accent={entered ? "15,165,121" : "228,184,92"} />
        </div>
      )}
      {notifs.length > 0 && (
        <Panel title={RAx.todayNeeds}>
          <div className="space-y-2">
            {notifs.map((n, i) => (
              <button key={i} onClick={() => n.page && goPage(n.page)} className="w-full flex items-center gap-3 rounded-xl p-3 text-start transition hover:brightness-95" style={{ background: "rgba(20,27,45,.04)", border: "1px solid var(--line)" }}>
                <span className="w-2 h-8 rounded-full shrink-0" style={{ background: tone[n.tone] || tone.n }} />
                <span className="flex-1 text-[13px] font-semibold">{n.text}</span>
                <ChevronRight size={15} className="opacity-50" style={{ transform: (LANGS.find((l) => l.code === lang) || {}).dir === "rtl" ? "rotate(180deg)" : "none" }} />
              </button>
            ))}
          </div>
        </Panel>
      )}
      {["gm", "opsm", "hr"].includes(role.id) && <RiderLinkCard lang={lang} />}
      {quick.length > 0 && (
        <Panel title={RAx.todayQuick}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quick.map((id) => { const Ic = NAV_ICON[id]; return (
              <button key={id} onClick={() => goPage(id)} className="flex flex-col items-center gap-2 rounded-2xl py-5 transition hover:-translate-y-0.5" style={{ background: `rgba(${role.glow},.09)`, border: `1px solid rgba(${role.glow},.25)` }}>
                <Ic size={22} style={{ color: role.accent }} /><span className="text-[12.5px] font-bold">{t.nav[id]}</span>
              </button>); })}
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ═══════════  تطبيق المندوب: الرئيسية + الدخول المستقل  ═══════════ */
const RIDER_MODE = (() => {
  try { if (import.meta.env && import.meta.env.VITE_APP_MODE === "rider") return true; } catch (e) {}
  try { const l = window.location; return /^\/rider\/?$/i.test(l.pathname) || /[?&]app=rider/i.test(l.search) || /^#\/?rider/i.test(l.hash); } catch (e) { return false; }
})();
Object.assign(RA.ar, {
  rhClockIn: "سجّل حضورك", rhClockOut: "سجّل انصرافك", rhDone: "اكتمل يومك ✓", rhSince: "منذ", rhToday: "اليوم", rhNoEntry: "لم يسجّل المشرف طلباتك بعد",
  rhGoal: "هدف الشهر", rhRank: "ترتيبك هذا الشهر", rhOf: "من", rhDoc: "إقامتك تنتهي خلال", rhDays: "يوم — راجع الموارد البشرية", rhMsgs: "رسائل جديدة", rhTickets: "طلباتك المفتوحة",
  rhShift: "ورديتك اليوم", rhNet: "صافي ربحك هذا الشهر", rhShare: "مشاركة كشفي على واتساب",
  riderLinkT: "رابط تطبيق المندوب", riderLinkSub: "أرسله للمناديب — يفتح مباشرة على دخول المندوب ومتصل بنفس قاعدة البيانات.", copy: "نسخ الرابط", copied: "تم النسخ ✓", waShare: "إرسال واتساب",
  riderLoginT: "تطبيق المندوب", riderLoginSub: "سجّل دخولك برقم الهوية للبدء", missingEntryNotif: "لم تُدخل طلبات أمس بعد — أدخلها الآن",
  waMsg: "كشف أرباحي من بوارق الشرق",
});
Object.assign(RA.en, {
  rhClockIn: "Clock in", rhClockOut: "Clock out", rhDone: "Day complete ✓", rhSince: "since", rhToday: "Today", rhNoEntry: "Your supervisor hasn't logged your orders yet",
  rhGoal: "Month goal", rhRank: "Your rank this month", rhOf: "of", rhDoc: "Your residency expires in", rhDays: "days — contact HR", rhMsgs: "New messages", rhTickets: "Your open requests",
  rhShift: "Today's shift", rhNet: "Your net profit this month", rhShare: "Share my statement on WhatsApp",
  riderLinkT: "Rider app link", riderLinkSub: "Send it to riders — opens straight on rider login and uses the same database.", copy: "Copy link", copied: "Copied ✓", waShare: "Send on WhatsApp",
  riderLoginT: "Rider App", riderLoginSub: "Sign in with your ID number to start", missingEntryNotif: "Yesterday's orders haven't been entered yet — enter them now",
  waMsg: "My earnings statement from Bawariq Al-Sharq",
});
Object.assign(RA.ur, {
  rhClockIn: "حاضری لگائیں", rhClockOut: "رخصتی لگائیں", rhDone: "دن مکمل ✓", rhSince: "سے", rhToday: "آج", rhNoEntry: "سپروائزر نے ابھی آرڈرز درج نہیں کیے",
  rhGoal: "ماہانہ ہدف", rhRank: "اس مہینے آپ کا درجہ", rhOf: "میں سے", rhDoc: "آپ کا اقامہ ختم ہو رہا ہے", rhDays: "دن میں — ایچ آر سے رجوع کریں", rhMsgs: "نئے پیغامات", rhTickets: "آپ کی کھلی درخواستیں",
  rhShift: "آج کی شفٹ", rhNet: "اس مہینے آپ کا خالص منافع", rhShare: "واٹس ایپ پر شیئر کریں",
  riderLinkT: "نمائندہ ایپ کا لنک", riderLinkSub: "نمائندوں کو بھیجیں — براہ راست لاگ ان کھلتا ہے۔", copy: "لنک کاپی", copied: "کاپی ہو گیا ✓", waShare: "واٹس ایپ پر بھیجیں",
  riderLoginT: "نمائندہ ایپ", riderLoginSub: "شروع کرنے کے لیے شناختی نمبر سے لاگ ان کریں", missingEntryNotif: "کل کے آرڈرز ابھی درج نہیں ہوئے",
  waMsg: "بوارق الشرق سے میری کمائی کا گوشوارہ",
});
Object.assign(T.ar.nav, { riderHome: "الرئيسية" });
Object.assign(T.en.nav, { riderHome: "Home" });
Object.assign(T.ur.nav, { riderHome: "ہوم" });

function repNetFor(rep, month, reports, pricing, repSettlements, wf, vp, receipts) {
  const rec = repSettlements.find((s) => s.month === month);
  const closedLine = rec && rec.closed && rec.snapshot ? rec.snapshot.repLines.find((l) => l.repId === rep.id) : null;
  const entries = monthEntriesFor(reports, rep.id, month);
  const c = repMonthCalc(entries, rep, pricing, wf, vp, monthFactor(month));
  if (closedLine) return { net: closedLine.net, final: true, orders: closedLine.orders };
  const inputs = { ...EMPTY_SETTLE_INPUTS, ...((rec && rec.inputs) || {}) };
  const fo = inputs.fineOverride[rep.id] || {};
  const manual = (inputs.manual || []).filter((m) => m.repId === rep.id);
  const adds = manual.filter((m) => m.type === "add").reduce((s, m) => s + m.amount, 0), deds = manual.filter((m) => m.type === "deduct").reduce((s, m) => s + m.amount, 0);
  const reimb = r2((receipts || []).filter((q) => q.repId === rep.id && q.status === "approved" && (q.date || "").startsWith(month)).reduce((sum, q) => sum + (+q.amount || 0), 0));
  return { net: r2(c.gross + adds + reimb - deds - (fo.weekend != null ? +fo.weekend : c.weekendAuto) - (fo.app != null ? +fo.app : c.appAuto)), final: false, orders: c.orders, unpriced: c.unpriced };
}

function RiderHome({ onLogout, lang, role, user, activeRep, reps, reports, attendance, setAttendance, shifts, tickets, repMessages, pricing, repSettlements, weekendFine, violationPenalty, repReceipts, goPage }) {
  const RAx = RA[lang], t = T[lang], x = EX[lang];
  const [toast, setToast] = useState("");
  if (!activeRep) return <EmptyHint lang={lang} />;
  const today = riyadhToday(), month = today.slice(0, 7);
  const myToday = attendance.find((a) => a.key === user && a.date === today);
  const todayEntries = monthEntriesFor(reports, activeRep.id, month).filter((e) => e.date === today);
  const tOrders = todayEntries.reduce((s, e) => s + (e.orders || 0), 0);
  const me = repNetFor(activeRep, month, reports, pricing, repSettlements, weekendFine, violationPenalty, repReceipts);
  const lb = computeLeaderboard(reps, reports, month);
  const sorted = [...lb.stats].sort((a, b) => b.orders - a.orders);
  const rank = Math.max(1, sorted.findIndex((s) => s.rep.id === activeRep.id) + 1);
  const dd = activeRep.idExpiry ? daysUntil(activeRep.idExpiry) : null;
  const unread = repMessages.filter((m) => m.repId === user && !m.seen).length;
  const openTk = tickets.filter((tk) => tk.repId === user && tk.status === "open").length;
  const sh = shifts.find((s) => s.repId === user && s.date === today);
  const tgt = monthTargetOf(pricing, activeRep.app);
  const pct = tgt ? Math.min(100, Math.round((me.orders / tgt) * 100)) : null;
  const doClock = () => {
    const at = riyadhTimeHM();
    if (!myToday) setAttendance((prev) => [...prev, { key: user, role: "rep", name: lang === "en" ? activeRep.en : activeRep.ar, date: today, in: at, out: null }]);
    else if (!myToday.out) setAttendance((prev) => prev.map((a) => (a.key === user && a.date === today ? { ...a, out: at } : a)));
    setToast(at); setTimeout(() => setToast(""), 2500);
  };
  const state = !myToday ? "in" : !myToday.out ? "out" : "done";
  const Tile = ({ icon: Ic, label, value, onClick, tone }) => (
    <button onClick={onClick} className="rounded-2xl p-4 text-start transition active:scale-[.98]" style={{ background: "#fff", border: "1px solid var(--line)" }}>
      <Ic size={18} style={{ color: tone || role.accent }} /><div className="num text-[22px] font-extrabold mt-2">{value}</div><div className="text-[11.5px]" style={{ color: "var(--muted)" }}>{label}</div>
    </button>
  );
  return (
    <div className="space-y-4">
      <InstallBanner lang={lang} />
      <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0E1424,#1B2A4A)", color: "#fff" }}>
        <p className="text-[12px] opacity-70">{RAx.rhToday} · {today}</p>
        <h2 className="text-[22px] font-extrabold mt-1">{lang === "en" ? activeRep.en : activeRep.ar}</h2>
        {sh && <p className="text-[12px] mt-1 opacity-75">{RAx.rhShift}: <b className="num">{sh.start} – {sh.end}</b></p>}
        <button onClick={doClock} disabled={state === "done"} className="w-full mt-5 rounded-2xl py-4 flex items-center justify-center gap-3 text-[16px] font-extrabold transition active:scale-[.98]"
          style={{ background: state === "in" ? "linear-gradient(120deg,#3FD8B4,#2BAE8E)" : state === "out" ? "linear-gradient(120deg,#E4B85C,#C08A22)" : "rgba(255,255,255,.1)", color: state === "done" ? "rgba(255,255,255,.7)" : "#06121A" }}>
          <Fingerprint size={24} />{state === "in" ? RAx.rhClockIn : state === "out" ? `${RAx.rhClockOut} · ${RAx.rhSince} ${myToday.in}` : RAx.rhDone}
        </button>
        {toast && <p className="text-center text-[12px] mt-2 font-bold" style={{ color: "#7FF0CF" }}>{x.clockInConfirmed} · {toast}</p>}
      </div>

      {dd != null && dd <= 30 && (
        <div className="rounded-2xl p-3.5 flex items-center gap-2.5" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.35)" }}>
          <AlertTriangle size={16} style={{ color: "#C0443A" }} className="shrink-0" />
          <p className="text-[12.5px] font-bold" style={{ color: "#9C2F26" }}>{RAx.rhDoc} <span className="num">{Math.max(0, dd)}</span> {RAx.rhDays}</p>
        </div>
      )}

      <button onClick={() => goPage("myEarnings")} className="w-full rounded-3xl p-5 text-start" style={{ background: "#fff", border: "1px solid var(--line)" }}>
        <div className="flex items-center justify-between"><span className="text-[12px] font-semibold" style={{ color: "var(--muted)" }}>{RAx.rhNet}</span><Chip tone={me.final ? "ok" : "warn"} sm>{me.final ? RAx.finalLbl : RAx.estimate}</Chip></div>
        <p className="num text-[38px] font-extrabold mt-1" style={{ color: me.net >= 0 ? "#0B5C46" : "#C0443A" }}>{fmt(me.net)} <span className="text-[14px] font-semibold" style={{ color: "var(--muted)" }}>{t.sar}</span></p>
        {!me.final && me.unpriced && <p className="text-[11.5px] font-bold mt-1" style={{ color: "#B8862E" }}>{RAx.noRateYet}</p>}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Tile icon={ShoppingBag} label={`${RAx.rhToday} · ${t.orders}`} value={todayEntries.length ? tOrders : "—"} onClick={() => goPage("myEarnings")} />
        <Tile icon={Route} label={RAx.rhMonthOrders} value={fmt(me.orders)} onClick={() => goPage("myEarnings")} />
      </div>
      {!todayEntries.length && <p className="text-[11.5px] -mt-1 px-1" style={{ color: "var(--muted)" }}>{RAx.rhNoEntry}</p>}

      <Panel title={RAx.rhGoal}>
        <div className="flex items-center gap-5">
          {pct != null && <ProgressRing pct={pct} size={104} stroke={10} accent={role.glow} />}
          <div className="space-y-1.5 text-[12.5px]">
            <p><b className="num">{me.orders}</b>{tgt ? ` / ${tgt}` : ""} {t.orders}</p>
            <p style={{ color: "var(--muted)" }}>{RAx.rhRank}: <b className="num" style={{ color: role.accent }}>{rank}</b> {RAx.rhOf} <span className="num">{sorted.length}</span></p>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3">
        <Tile icon={MessageSquare} label={RAx.rhMsgs} value={unread} onClick={() => goPage("messages")} tone={unread ? "#E8837A" : undefined} />
        <Tile icon={Send} label={RAx.rhTickets} value={openTk} onClick={() => goPage("tickets")} />
      </div>
      <button onClick={() => goPage("riderReceipts")} className="w-full flex items-center gap-3 rounded-2xl p-4 text-start" style={{ background: "#fff", border: "1px solid var(--line)" }}><Camera size={20} style={{ color: role.accent }} /><span className="flex-1 text-[13px] font-bold">{RAx.rhReceipt}</span><ChevronRight size={15} className="opacity-50" /></button>
      {onLogout && <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 rounded-2xl p-3.5 text-[13px] font-bold" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.35)", color: "#C0443A" }}><LogOut size={16} />{t.logout}</button>}
    </div>
  );
}

function RiderLogin({ lang, setLang, onRep, err, setErr, onBack }) {
  const t = T[lang], x = EX[lang], RAx = RA[lang];
  const [nid, setNid] = useState(""); const [pw, setPw] = useState(""); const [local, setLocal] = useState(""); const [busy, setBusy] = useState(false);
  const go = () => {
    if (nid.trim().length < 6 || pw.length < 4) { setLocal(x.errRep); return; }
    setLocal(""); setErr(""); setBusy(true); setTimeout(() => { setBusy(false); onRep(nid.trim(), pw); }, 400);
  };
  const shown = local || err;
  return (
    <div className="min-h-screen relative px-4 py-6 overflow-hidden">
      <div className="mesh" />
      <div className="relative max-w-md mx-auto space-y-4">
        <BrandHero lang={lang} compact />
        <InstallBanner lang={lang} />
        <div className="glass rounded-3xl p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div><h2 className="text-[17px] font-extrabold">{RAx.riderLoginT}</h2><p className="text-[12px]" style={{ color: "var(--muted)" }}>{RAx.riderLoginSub}</p></div>
            <div className="flex gap-1">{LANGS.map((l) => <button key={l.code} onClick={() => setLang(l.code)} className="num px-2 py-1 rounded-lg text-[11px] font-bold" style={{ background: lang === l.code ? "rgba(228,184,92,.2)" : "rgba(20,27,45,.05)" }}>{l.mark}</button>)}</div>
          </div>
          <GateField label={x.nationalId} val={nid} set={setNid} ph="1xxxxxxxxx" Icon={User} af type="text" accent={REP.accent} onEnter={go} />
          <GateField label={t.pass} val={pw} set={setPw} ph="••••••••" Icon={Lock} type="password" accent={REP.accent} onEnter={go} />
          {shown && <p className="text-[11.5px] flex items-start gap-1.5" style={{ color: "#C0443A" }}><AlertTriangle size={13} className="mt-px shrink-0" />{shown}</p>}
          <Btn variant="accent" accent={REP.glow} full icon={Fingerprint} onClick={go}>{busy ? "…" : x.repTitle}</Btn>
          {onBack && <button onClick={onBack} className="w-full text-[12px] font-semibold py-1" style={{ color: "var(--muted)" }}>{RAx.ldBack}</button>}
        </div>
      </div>
    </div>
  );
}

function RiderLinkCard({ lang }) {
  const RAx = RA[lang];
  const [done, setDone] = useState(false);
  let url = "";
  try { url = window.location.origin + "/?app=rider"; } catch (e) {}
  const copy = () => { try { navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 1800); } catch (e) {} };
  const wa = () => { try { window.open("https://wa.me/?text=" + encodeURIComponent(url), "_blank"); } catch (e) {} };
  return (
    <Panel title={RAx.riderLinkT}>
      <p className="text-[12px] mb-3" style={{ color: "var(--muted)" }}>{RAx.riderLinkSub}</p>
      <div className="num text-[12px] rounded-xl px-3 py-2.5 mb-3 break-all" style={{ background: "rgba(20,27,45,.05)", border: "1px solid var(--line)" }} dir="ltr">{url}</div>
      <div className="flex gap-2 flex-wrap"><Btn icon={done ? CheckCircle2 : Copy} onClick={copy}>{done ? RAx.copied : RAx.copy}</Btn><Btn icon={Send} onClick={wa}>{RAx.waShare}</Btn></div>
    </Panel>
  );
}

/* ═══════════  صفحة ترحيب المندوب + التوظيف + الإيصالات + التثبيت  ═══════════ */
const RIDER_EARN_MAX = 7000;
Object.assign(RA.ar, {
  ldJoin: "انضم إلى بوارق الشرق", ldHeadSub: "شبكة توصيل كبيرة تخدم المنطقة الشرقية — وأنت مكانك فيها",
  ldUpTo: "أرباح تصل إلى", ldPerMonth: "ريال شهرياً", ldDisc: "تقدير يعتمد على عدد طلباتك وكيلومتراتك وانضباطك — وليس مبلغاً مضموناً.",
  ldWhy: "لماذا بوارق الشرق؟",
  ldB1T: "أرباح عالية", ldB1D: "كل طلب وكل كيلومتر يُحتسب لك بتسعيرة واضحة، وتشوف ربحك يتحدث يومياً.",
  ldB2T: "شفافية كاملة", ldB2D: "كشف حسابك بالتفصيل: كل خصم له سبب، وتقدر تعترض على أي يوم.",
  ldB3T: "تطبيقات توصيل متعددة", ldB3D: "اشتغل على أكثر من تطبيق توصيل عبر شركة واحدة منظّمة.",
  ldB4T: "مكافآت ومنافسة شريفة", ldB4D: "لوحة صدارة شهرية بمكافآت مالية وفرصة عمرة لأبطال الشهر.",
  ldB5T: "دعم يتابعك", ldB5D: "مشرف مخصص وطلبات تُحل بسرعة، ومستحقات موثّقة بنظام واضح.",
  ldB6T: "ترقّى معنا", ldB6D: "المناديب المتميزون يترقّون إلى رقباء ويقودون فرقاً.",
  ldCalc: "احسب أرباحك المتوقعة", ldOrdersDay: "طلبات في اليوم", ldDaysMonth: "أيام العمل في الشهر", ldKmDay: "كيلومتر في اليوم", ldEst: "أرباحك المتوقعة",
  ldCalcNote: "حساب تقريبي بتسعيرة هنقرستيشن الحالية قبل أي خصومات.",
  ldSteps: "كيف تبدأ؟", ldS1: "سجّل بياناتك", ldS2: "الموارد البشرية تراجع وتعتمدك", ldS3: "تستلم بيانات الدخول وتبدأ الكسب",
  ldApply: "انضم الآن", ldLogin: "لدي حساب — دخول", ldBack: "رجوع",
  apTitle: "طلب الانضمام", apSub: "عبّئ بياناتك وسنتواصل معك قريباً", apName: "الاسم الكامل", apPhone: "رقم الجوال", apNid: "رقم الهوية / الإقامة", apExpiry: "تاريخ انتهاء الهوية/الإقامة",
  apVehicle: "المركبة", apCar: "سيارة", apBike: "دباب", apOwn: "عندي مركبة خاصة", apNeed: "أحتاج مركبة من الشركة", apApp: "التطبيق المفضل", apNote: "ملاحظات (اختياري)", apSend: "إرسال الطلب",
  apErrName: "اكتب اسمك الكامل", apErrPhone: "رقم الجوال غير صحيح", apErrNid: "رقم الهوية/الإقامة 10 أرقام", apErrExpiry: "أدخل تاريخ انتهاء الهوية",
  apDup: "رقم الهوية مسجّل مسبقاً — سجّل دخولك أو تواصل مع الموارد البشرية", apDone: "تم استلام طلبك ✓", apDoneSub: "سيراجعه فريق الموارد البشرية ويتواصل معك عبر الجوال.",
  apPanelT: "طلبات الانضمام", apNone: "لا توجد طلبات جديدة", apApprove: "اعتماد وإنشاء حساب", apReject: "رفض", apRejectReason: "سبب الرفض (إلزامي)",
  apCreds: "بيانات دخول المندوب", apPassword: "كلمة المرور", apSendWA: "إرسال البيانات واتساب", apApproved: "معتمد", apRejected: "مرفوض", apNew: "جديد", apNotif: "طلبات انضمام جديدة",
  apAfter: "أُنشئ حساب المندوب بحالة «بانتظار التفعيل» — فعّله وحدّد له مشرفاً من قائمة المناديب بالأسفل.",
  rcT: "إيصالات البنزين", rcSub: "ارفع صورة الإيصال وسيراجعها المحاسب. المبلغ المعتمد يُضاف تلقائياً لحسابك.", rcAmount: "المبلغ", rcNote: "ملاحظة", rcPhoto: "صورة الإيصال",
  rcErrAmt: "أدخل مبلغاً صحيحاً", rcErrPhoto: "صورة الإيصال إلزامية", rcSend: "إرسال للاعتماد", rcMine: "إيصالاتي", rcPending: "قيد المراجعة", rcApproved: "معتمد", rcRejected: "مرفوض",
  rcAdminT: "إيصالات المناديب", rcApprove: "اعتماد", rcReject: "رفض", rcReason: "سبب الرفض (5 أحرف على الأقل)", rcNone: "لا توجد إيصالات", rcNotif: "إيصالات بانتظار الاعتماد",
  colReimb: "إيصالات", reimb: "إيصالات البنزين المعتمدة", rcKindFuel: "بنزين", rcKindOther: "أخرى", rcErrNote: "اكتب ملاحظة توضح الإيصال",
  dpBtn: "اعتراض", dpTitle: "اعتراض على يوم", dpReason: "اكتب سبب الاعتراض (8 أحرف على الأقل)", dpSend: "إرسال الاعتراض", dpSent: "وصل اعتراضك للمشرف ✓", dpText: "اعتراض على إدخال يوم",
  stUpload: "رفع كشف التطبيق للمطابقة", stRecorded: "المسجّل", stStatement: "حسب الكشف", stDiff: "الفرق", stMatch: "مطابق ✓", stErr: "تعذّر قراءة الكشف — تأكد أنه ملف Excel لفاتورة التطبيق", stT: "مطابقة كشوف التطبيقات (اختياري)",
  inT: "ثبّت التطبيق على جوالك", inIOS: "اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»", inAnd: "افتح قائمة المتصفح ⋮ ثم «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»", inBtn: "تثبيت", inLater: "لاحقاً",
  rhReceipt: "ارفع إيصال بنزين",
});
Object.assign(RA.en, {
  ldJoin: "Join Bawariq Al-Sharq", ldHeadSub: "A large delivery network serving the Eastern Province — and your place is in it",
  ldUpTo: "Earn up to", ldPerMonth: "SAR per month", ldDisc: "An estimate based on your orders, kilometers and discipline — not a guaranteed amount.",
  ldWhy: "Why Bawariq Al-Sharq?",
  ldB1T: "High earnings", ldB1D: "Every order and kilometer is paid at a clear rate, and you watch your profit update daily.",
  ldB2T: "Full transparency", ldB2D: "A detailed statement: every deduction has a reason, and you can dispute any day.",
  ldB3T: "Multiple delivery apps", ldB3D: "Work across several delivery apps through one organized company.",
  ldB4T: "Rewards & fair competition", ldB4D: "A monthly leaderboard with cash rewards and an Umrah trip for the champions.",
  ldB5T: "Support that follows up", ldB5D: "A dedicated supervisor, fast request handling and documented payouts.",
  ldB6T: "Grow with us", ldB6D: "Outstanding riders get promoted to team leaders.",
  ldCalc: "Estimate your earnings", ldOrdersDay: "Orders per day", ldDaysMonth: "Working days per month", ldKmDay: "Km per day", ldEst: "Your expected earnings",
  ldCalcNote: "Approximate, using the current HungerStation rider rates, before deductions.",
  ldSteps: "How to start", ldS1: "Submit your details", ldS2: "HR reviews and approves you", ldS3: "Get your login and start earning",
  ldApply: "Join now", ldLogin: "I have an account — Sign in", ldBack: "Back",
  apTitle: "Join request", apSub: "Fill in your details and we'll contact you soon", apName: "Full name", apPhone: "Mobile number", apNid: "ID / Iqama number", apExpiry: "ID / Iqama expiry date",
  apVehicle: "Vehicle", apCar: "Car", apBike: "Motorbike", apOwn: "I have my own vehicle", apNeed: "I need a company vehicle", apApp: "Preferred app", apNote: "Notes (optional)", apSend: "Send request",
  apErrName: "Enter your full name", apErrPhone: "Invalid mobile number", apErrNid: "ID/Iqama must be 10 digits", apErrExpiry: "Enter the ID expiry date",
  apDup: "This ID is already registered — sign in or contact HR", apDone: "Request received ✓", apDoneSub: "HR will review it and contact you by phone.",
  apPanelT: "Join requests", apNone: "No new requests", apApprove: "Approve & create account", apReject: "Reject", apRejectReason: "Rejection reason (required)",
  apCreds: "Rider login details", apPassword: "Password", apSendWA: "Send details on WhatsApp", apApproved: "Approved", apRejected: "Rejected", apNew: "New", apNotif: "New join requests",
  apAfter: "The rider account was created as “pending activation” — activate it and assign a supervisor from the riders list below.",
  rcT: "Fuel receipts", rcSub: "Upload the receipt photo for the accountant to review. The approved amount is added to your statement automatically.", rcAmount: "Amount", rcNote: "Note", rcPhoto: "Receipt photo",
  rcErrAmt: "Enter a valid amount", rcErrPhoto: "Receipt photo is required", rcSend: "Send for approval", rcMine: "My receipts", rcPending: "Under review", rcApproved: "Approved", rcRejected: "Rejected",
  rcAdminT: "Rider receipts", rcApprove: "Approve", rcReject: "Reject", rcReason: "Rejection reason (5+ characters)", rcNone: "No receipts", rcNotif: "Receipts awaiting approval",
  colReimb: "Receipts", reimb: "Approved fuel receipts", rcKindFuel: "Fuel", rcKindOther: "Other", rcErrNote: "Add a note describing the receipt",
  dpBtn: "Dispute", dpTitle: "Dispute a day", dpReason: "Write the reason (8+ characters)", dpSend: "Send dispute", dpSent: "Your dispute reached the supervisor ✓", dpText: "Dispute of day entry",
  stUpload: "Upload app statement to reconcile", stRecorded: "Recorded", stStatement: "Per statement", stDiff: "Difference", stMatch: "Match ✓", stErr: "Couldn't read the statement — make sure it's the app's Excel invoice", stT: "App statement reconciliation (optional)",
  inT: "Install the app on your phone", inIOS: "Tap the Share button then “Add to Home Screen”", inAnd: "Open the browser menu ⋮ then “Install app” or “Add to Home screen”", inBtn: "Install", inLater: "Later",
  rhReceipt: "Upload a fuel receipt",
});
Object.assign(RA.ur, {
  ldJoin: "بوارق الشرق میں شامل ہوں", ldHeadSub: "مشرقی صوبے میں خدمات دینے والا بڑا ڈیلیوری نیٹ ورک",
  ldUpTo: "کمائی تک", ldPerMonth: "ریال ماہانہ", ldDisc: "یہ اندازہ ہے، ضمانت شدہ رقم نہیں۔",
  ldWhy: "بوارق الشرق کیوں؟",
  ldB1T: "زیادہ کمائی", ldB1D: "ہر آرڈر اور کلومیٹر واضح قیمت پر شمار ہوتا ہے۔", ldB2T: "مکمل شفافیت", ldB2D: "ہر کٹوتی کی وجہ ہے اور آپ کسی بھی دن پر اعتراض کر سکتے ہیں۔",
  ldB3T: "متعدد ڈیلیوری ایپس", ldB3D: "ایک منظم کمپنی کے ذریعے کئی ایپس پر کام کریں۔", ldB4T: "انعامات", ldB4D: "ماہانہ لیڈر بورڈ اور عمرہ کا موقع۔",
  ldB5T: "مسلسل تعاون", ldB5D: "مخصوص سپروائزر اور تیز حل۔", ldB6T: "ترقی کریں", ldB6D: "بہترین نمائندے ٹیم لیڈر بنتے ہیں۔",
  ldCalc: "اپنی کمائی کا اندازہ لگائیں", ldOrdersDay: "روزانہ آرڈرز", ldDaysMonth: "مہینے میں کام کے دن", ldKmDay: "روزانہ کلومیٹر", ldEst: "متوقع کمائی",
  ldCalcNote: "موجودہ ریٹ پر تقریبی حساب، کٹوتیوں سے پہلے۔",
  ldSteps: "آغاز کیسے کریں؟", ldS1: "اپنی تفصیل بھریں", ldS2: "ایچ آر جائزہ لے کر منظور کرتا ہے", ldS3: "لاگ ان ملے گا اور کمائی شروع",
  ldApply: "ابھی شامل ہوں", ldLogin: "میرا اکاؤنٹ ہے — لاگ ان", ldBack: "واپس",
  apTitle: "شمولیت کی درخواست", apSub: "تفصیل بھریں، ہم رابطہ کریں گے", apName: "پورا نام", apPhone: "موبائل نمبر", apNid: "شناختی / اقامہ نمبر", apExpiry: "اقامہ کی میعاد",
  apVehicle: "سواری", apCar: "کار", apBike: "موٹر سائیکل", apOwn: "میری اپنی سواری ہے", apNeed: "کمپنی کی سواری چاہیے", apApp: "پسندیدہ ایپ", apNote: "نوٹ (اختیاری)", apSend: "درخواست بھیجیں",
  apErrName: "پورا نام لکھیں", apErrPhone: "موبائل نمبر درست نہیں", apErrNid: "10 ہندسے", apErrExpiry: "میعاد درج کریں", apDup: "یہ نمبر پہلے سے درج ہے", apDone: "درخواست موصول ہو گئی ✓", apDoneSub: "ایچ آر رابطہ کرے گا۔",
  apPanelT: "شمولیت کی درخواستیں", apNone: "کوئی نئی درخواست نہیں", apApprove: "منظور کریں", apReject: "مسترد", apRejectReason: "وجہ (لازمی)", apCreds: "لاگ ان تفصیل", apPassword: "پاس ورڈ", apSendWA: "واٹس ایپ پر بھیجیں",
  apApproved: "منظور", apRejected: "مسترد", apNew: "نیا", apNotif: "نئی درخواستیں", apAfter: "اکاؤنٹ «تفعیل کا منتظر» حالت میں بنا — نیچے فہرست سے فعال کریں۔",
  rcT: "پیٹرول رسیدیں", rcSub: "رسید کی تصویر بھیجیں، منظوری کے بعد حساب میں شامل ہو گی۔", rcAmount: "رقم", rcNote: "نوٹ", rcPhoto: "رسید کی تصویر", rcErrAmt: "درست رقم", rcErrPhoto: "تصویر لازمی", rcSend: "منظوری کے لیے بھیجیں",
  rcMine: "میری رسیدیں", rcPending: "زیر جائزہ", rcApproved: "منظور", rcRejected: "مسترد", rcAdminT: "نمائندوں کی رسیدیں", rcApprove: "منظور", rcReject: "مسترد", rcReason: "وجہ (کم از کم 5 حروف)", rcNone: "کوئی رسید نہیں", rcNotif: "منظوری کے منتظر",
  colReimb: "رسیدیں", reimb: "منظور شدہ پیٹرول رسیدیں", rcKindFuel: "پیٹرول", rcKindOther: "دیگر", rcErrNote: "نوٹ لکھیں",
  dpBtn: "اعتراض", dpTitle: "دن پر اعتراض", dpReason: "وجہ لکھیں (کم از کم 8 حروف)", dpSend: "اعتراض بھیجیں", dpSent: "اعتراض پہنچ گیا ✓", dpText: "اندراج پر اعتراض",
  stUpload: "ایپ اسٹیٹمنٹ اپ لوڈ کریں", stRecorded: "درج شدہ", stStatement: "اسٹیٹمنٹ کے مطابق", stDiff: "فرق", stMatch: "مطابق ✓", stErr: "فائل پڑھی نہیں جا سکی", stT: "ایپ اسٹیٹمنٹ ملاپ (اختیاری)",
  inT: "ایپ فون پر انسٹال کریں", inIOS: "شیئر بٹن دبائیں پھر «ہوم اسکرین میں شامل کریں»", inAnd: "براؤزر مینو ⋮ پھر «انسٹال ایپ»", inBtn: "انسٹال", inLater: "بعد میں",
  rhReceipt: "پیٹرول رسید اپ لوڈ کریں",
});
Object.assign(T.ar.nav, { riderReceipts: "إيصال بنزين", receiptsAdmin: "إيصالات المناديب" });
Object.assign(T.en.nav, { riderReceipts: "Fuel Receipt", receiptsAdmin: "Rider Receipts" });
Object.assign(T.ur.nav, { riderReceipts: "پیٹرول رسید", receiptsAdmin: "نمائندوں کی رسیدیں" });

function compressImage(file, max = 1000, q = 0.65) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", q));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
async function parseStatementOrders(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null });
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const row = rows[i] || [];
      const ci = row.findIndex((c) => typeof c === "string" && /completed_orders/i.test(c));
      const ri = row.findIndex((c) => typeof c === "string" && /rider_id/i.test(c));
      if (ci >= 0 && ri >= 0) {
        let sum = 0, n = 0;
        for (let j = i + 1; j < rows.length; j++) { const r = rows[j]; if (r && r[ri] != null && r[ri] !== "" && typeof r[ci] === "number") { sum += r[ci]; n++; } }
        if (n > 0) return { orders: sum, riders: n };
      }
    }
  }
  return null;
}

function InstallBanner({ lang }) {
  const RAx = RA[lang];
  const [dismissed, setDismissed] = useState(() => { try { return localStorage.getItem("bq_install_dismissed") === "1"; } catch (e) { return false; } });
  const [evt, setEvt] = useState(null);
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  let standalone = false, ios = false;
  try { standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; ios = /iphone|ipad|ipod/i.test(navigator.userAgent); } catch (e) {}
  if (standalone || dismissed) return null;
  const close = () => { setDismissed(true); try { localStorage.setItem("bq_install_dismissed", "1"); } catch (e) {} };
  return (
    <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: "rgba(228,184,92,.12)", border: "1px solid rgba(228,184,92,.4)" }}>
      <Download size={20} style={{ color: "#B8862E" }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-extrabold" style={{ color: "#6B4A12" }}>{RAx.inT}</p>
        <p className="text-[11.5px]" style={{ color: "#8A611E" }}>{evt ? "" : ios ? RAx.inIOS : RAx.inAnd}</p>
      </div>
      {evt && <button onClick={async () => { try { evt.prompt(); await evt.userChoice; } catch (e) {} setEvt(null); }} className="px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: "#12151D", color: "#fff" }}>{RAx.inBtn}</button>}
      <button onClick={close} className="text-[11px] font-semibold px-2 py-1" style={{ color: "#8A611E" }}>{RAx.inLater}</button>
    </div>
  );
}

function RiderLanding({ lang, setLang, reps, pricing, go }) {
  const RAx = RA[lang], t = T[lang];
  const benefits = [[Wallet, "ldB1T", "ldB1D"], [ShieldCheck, "ldB2T", "ldB2D"], [Building2, "ldB3T", "ldB3D"], [Trophy, "ldB4T", "ldB4D"], [Users, "ldB5T", "ldB5D"], [Rocket, "ldB6T", "ldB6D"]];
  return (
    <div className="min-h-screen relative px-4 pt-5 pb-28 overflow-hidden">
      <div className="mesh" />
      <div className="relative max-w-2xl mx-auto space-y-5">
        <div className="flex justify-end gap-1">{LANGS.map((l) => <button key={l.code} onClick={() => setLang(l.code)} className="num px-2.5 py-1.5 rounded-xl text-[11px] font-bold" style={{ background: lang === l.code ? "rgba(228,184,92,.2)" : "rgba(20,27,45,.05)" }}>{l.mark}</button>)}</div>
        <BrandHero lang={lang} reps={reps} />
        <InstallBanner lang={lang} />
        <div className="rounded-[28px] p-6 sm:p-8 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg,#F3D58E,#E4B85C 55%,#B8862E)", color: "#2A1C04" }}>
          <p className="text-[13px] font-bold opacity-80">{RAx.ldJoin}</p>
          <p className="text-[15px] font-semibold mt-1">{RAx.ldUpTo}</p>
          <p className="num font-extrabold leading-none mt-1" style={{ fontSize: "clamp(54px,16vw,92px)" }}>{fmt(RIDER_EARN_MAX)}</p>
          <p className="text-[16px] font-extrabold">{RAx.ldPerMonth}</p>
          <p className="text-[11px] mt-3 opacity-75 max-w-sm mx-auto">{RAx.ldDisc}</p>
        </div>
        <p className="text-center text-[13px] font-semibold" style={{ color: "var(--muted)" }}>{RAx.ldHeadSub}</p>

        <div>
          <h3 className="text-[16px] font-extrabold mb-3">{RAx.ldWhy}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map(([Ic, tk, dk]) => (
              <div key={tk} className="glass rounded-2xl p-4 flex gap-3">
                <span className="grid place-items-center w-11 h-11 rounded-xl shrink-0" style={{ background: "rgba(228,184,92,.16)" }}><Ic size={20} style={{ color: "#B8862E" }} /></span>
                <div><p className="text-[13.5px] font-extrabold">{RAx[tk]}</p><p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>{RAx[dk]}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[16px] font-extrabold mb-3">{RAx.ldSteps}</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {["ldS1", "ldS2", "ldS3"].map((k, i) => (
              <div key={k} className="glass rounded-2xl p-3 text-center">
                <span className="num grid place-items-center w-8 h-8 mx-auto rounded-full text-[14px] font-extrabold" style={{ background: "#12151D", color: "#F3D58E" }}>{i + 1}</span>
                <p className="text-[11.5px] font-bold mt-2 leading-snug">{RAx[k]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 inset-x-0 z-30 px-4 py-3" style={{ background: "rgba(245,246,248,.92)", backdropFilter: "blur(14px)", borderTop: "1px solid var(--line)" }}>
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
          <Btn variant="gold" full icon={UserPlus} onClick={() => go("apply")}>{RAx.ldApply}</Btn>
          <Btn full icon={Fingerprint} onClick={() => go("login")}>{RAx.ldLogin}</Btn>
        </div>
      </div>
    </div>
  );
}

function RiderApply({ lang, reps, applications, setApplications, go }) {
  const RAx = RA[lang], x = EX[lang];
  const [f, setF] = useState({ name: "", phone: "", nid: "", idExpiry: "", vehicle: "car", own: true, app: "hs", note: "" });
  const [err, setErr] = useState(""); const [done, setDone] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (f.name.trim().length < 3) return setErr(RAx.apErrName);
    if (!/^0?\d{9,10}$/.test(f.phone.replace(/\s/g, ""))) return setErr(RAx.apErrPhone);
    if (!/^\d{10}$/.test(f.nid)) return setErr(RAx.apErrNid);
    if (!f.idExpiry) return setErr(RAx.apErrExpiry);
    if (reps.some((r) => r.nid === f.nid) || applications.some((a) => a.nid === f.nid && a.status !== "rejected")) return setErr(RAx.apDup);
    setErr("");
    setApplications((prev) => [{ id: "APP-" + Date.now(), name: f.name.trim(), phone: f.phone.trim(), nid: f.nid, idExpiry: f.idExpiry, vehicle: f.vehicle, own: f.own, app: f.app, note: f.note.trim(), createdAt: riyadhNow().toISOString(), status: "new" }, ...prev]);
    setDone(true);
  };
  if (done) return (
    <div className="min-h-screen grid place-items-center px-4"><div className="mesh" />
      <div className="relative glass rounded-3xl p-8 text-center max-w-sm">
        <CheckCircle2 size={54} style={{ color: "#0FA579" }} className="mx-auto" />
        <h2 className="text-[20px] font-extrabold mt-4">{RAx.apDone}</h2>
        <p className="text-[13px] mt-2" style={{ color: "var(--muted)" }}>{RAx.apDoneSub}</p>
        <div className="mt-6"><Btn full onClick={() => go("landing")}>{RAx.ldBack}</Btn></div>
      </div>
    </div>
  );
  const opt = (on, label, onClick) => <button type="button" onClick={onClick} className="flex-1 px-3 py-2.5 rounded-xl text-[12.5px] font-bold" style={{ background: on ? "rgba(228,184,92,.2)" : "rgba(20,27,45,.04)", border: `1px solid ${on ? "rgba(228,184,92,.6)" : "var(--line)"}` }}>{label}</button>;
  return (
    <div className="min-h-screen relative px-4 py-6"><div className="mesh" />
      <div className="relative max-w-md mx-auto space-y-4">
        <BrandHero lang={lang} compact />
        <div className="glass rounded-3xl p-5 space-y-3.5">
          <div><h2 className="text-[17px] font-extrabold">{RAx.apTitle}</h2><p className="text-[12px]" style={{ color: "var(--muted)" }}>{RAx.apSub}</p></div>
          <GateField label={RAx.apName} val={f.name} set={set("name")} ph="" Icon={User} type="text" accent="#B8862E" />
          <GateField label={RAx.apPhone} val={f.phone} set={set("phone")} ph="05xxxxxxxx" Icon={Phone} type="tel" accent="#B8862E" />
          <GateField label={RAx.apNid} val={f.nid} set={set("nid")} ph="1xxxxxxxxx" Icon={CreditCard} type="text" accent="#B8862E" />
          <GateField label={RAx.apExpiry} val={f.idExpiry} set={set("idExpiry")} ph="" Icon={CalendarDays} type="date" accent="#B8862E" />
          <div><p className="text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{RAx.apVehicle}</p>
            <div className="flex gap-2">{opt(f.vehicle === "car", RAx.apCar, () => set("vehicle")("car"))}{opt(f.vehicle === "bike", RAx.apBike, () => set("vehicle")("bike"))}</div></div>
          <div className="flex gap-2">{opt(f.own, RAx.apOwn, () => set("own")(true))}{opt(!f.own, RAx.apNeed, () => set("own")(false))}</div>
          <div><p className="text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{RAx.apApp}</p>
            <div className="flex flex-wrap gap-1.5">{APPS.map((a) => <button type="button" key={a.id} onClick={() => set("app")(a.id)} className="px-3 py-1.5 rounded-full text-[12px] font-bold" style={{ background: f.app === a.id ? "#12151D" : "rgba(20,27,45,.05)", color: f.app === a.id ? "#F3D58E" : "var(--muted)" }}>{a[lang]}</button>)}</div></div>
          <GateField label={RAx.apNote} val={f.note} set={set("note")} ph="" Icon={MessageSquare} type="text" accent="#B8862E" />
          {err && <p className="text-[11.5px] flex items-start gap-1.5" style={{ color: "#C0443A" }}><AlertTriangle size={13} className="mt-px shrink-0" />{err}</p>}
          <Btn variant="gold" full icon={Send} onClick={submit}>{RAx.apSend}</Btn>
          <button onClick={() => go("landing")} className="w-full text-[12px] font-semibold py-1" style={{ color: "var(--muted)" }}>{RAx.ldBack}</button>
        </div>
      </div>
    </div>
  );
}

function ApplicationsPanel({ lang, role, applications, setApplications, reps, setReps, setAuditLog, actingEmployee }) {
  const RAx = RA[lang];
  const [rejId, setRejId] = useState(null); const [reason, setReason] = useState(""); const [creds, setCreds] = useState(null);
  const list = applications.filter((a) => a.status === "new");
  const appName = (id) => (APPS.find((a) => a.id === id) || {})[lang] || id;
  const approve = (a) => {
    const pw = String(Math.floor(100000 + Math.random() * 899999));
    const id = "R-" + (1000 + reps.length + Math.floor(Math.random() * 90));
    setReps((prev) => [...prev, { id, ar: a.name, en: a.name, phone: a.phone, nid: a.nid, idExpiry: a.idExpiry, vehicle: a.vehicle, app: a.app, empType: "kafala", status: "pending", sup: null, password: pw, photo: null, orders: 0, hours: 0, km: 0, weekendViolations: 0, appViolations: 0 }]);
    setApplications((prev) => prev.map((z) => (z.id === a.id ? { ...z, status: "approved", repId: id, decidedBy: actingEmployee?.name || role.id, decidedAt: riyadhNow().toISOString() } : z)));
    logAudit(setAuditLog, role, "application_approve", `${a.name} (${id})`, actingEmployee);
    setCreds({ name: a.name, phone: a.phone, nid: a.nid, pw });
  };
  const reject = (a) => {
    if (reason.trim().length < 5) return;
    setApplications((prev) => prev.map((z) => (z.id === a.id ? { ...z, status: "rejected", reason: reason.trim(), decidedBy: actingEmployee?.name || role.id, decidedAt: riyadhNow().toISOString() } : z)));
    logAudit(setAuditLog, role, "application_reject", a.name, actingEmployee);
    setRejId(null); setReason("");
  };
  const waCreds = () => {
    let url = ""; try { url = window.location.origin + "/?app=rider"; } catch (e) {}
    const ph = creds.phone.replace(/\D/g, "").replace(/^0/, "966");
    const msg = `${creds.name}\n${RA.ar.ldJoin} ✓\n${RA.ar.nationalId || "رقم الهوية"}: ${creds.nid}\n${RAx.apPassword}: ${creds.pw}\n${url}`;
    try { window.open(`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`, "_blank"); } catch (e) {}
  };
  if (!list.length && !creds) return null;
  return (
    <Panel title={`${RAx.apPanelT} (${list.length})`}>
      {creds && (
        <div className="rounded-2xl p-4 mb-3" style={{ background: "rgba(15,165,121,.08)", border: "1px solid rgba(15,165,121,.3)" }}>
          <p className="text-[13px] font-extrabold" style={{ color: "#0B5C46" }}>{RAx.apCreds}: {creds.name}</p>
          <p className="num text-[13px] mt-1">{creds.nid} · {RAx.apPassword}: <b>{creds.pw}</b></p>
          <p className="text-[11.5px] mt-1" style={{ color: "var(--muted)" }}>{RAx.apAfter}</p>
          <div className="flex gap-2 mt-3"><Btn icon={Send} onClick={waCreds}>{RAx.apSendWA}</Btn><Btn onClick={() => setCreds(null)}>OK</Btn></div>
        </div>
      )}
      <div className="space-y-2.5">
        {list.map((a) => (
          <div key={a.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div><p className="text-[13.5px] font-extrabold">{a.name}</p>
                <p className="num text-[11.5px]" style={{ color: "var(--muted)" }}>{a.phone} · {a.nid} · {a.idExpiry}</p>
                <p className="text-[11.5px] mt-0.5" style={{ color: "var(--muted)" }}>{a.vehicle === "car" ? RAx.apCar : RAx.apBike} · {a.own ? RAx.apOwn : RAx.apNeed} · {appName(a.app)}</p>
                {a.note && <p className="text-[11.5px] mt-1">“{a.note}”</p>}</div>
              <Chip tone="info" sm>{RAx.apNew}</Chip>
            </div>
            {rejId === a.id ? (
              <div className="flex gap-2 mt-3 flex-wrap">
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={RAx.apRejectReason} className="flex-1 min-w-[160px] rounded-lg px-2.5 py-2 text-[12px] outline-none" style={INPUT_ST} />
                <Btn variant="danger" onClick={() => reject(a)}>{RAx.apReject}</Btn><Btn onClick={() => { setRejId(null); setReason(""); }}>×</Btn>
              </div>
            ) : (
              <div className="flex gap-2 mt-3"><Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => approve(a)}>{RAx.apApprove}</Btn><Btn variant="danger" onClick={() => setRejId(a.id)}>{RAx.apReject}</Btn></div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PhotoModal({ src, onClose }) {
  if (!src) return null;
  return <div className="fixed inset-0 z-[90] grid place-items-center p-4" style={{ background: "rgba(3,5,10,.8)" }} onClick={onClose}><img src={src} alt="" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 16 }} /></div>;
}

function RiderReceiptsPage({ lang, role, user, activeRep, repReceipts, setRepReceipts }) {
  const RAx = RA[lang], t = T[lang];
  const [f, setF] = useState({ kind: "fuel", amount: "", note: "", photo: null });
  const [err, setErr] = useState(""); const [view, setView] = useState(null); const [busy, setBusy] = useState(false);
  if (!activeRep) return <EmptyHint lang={lang} />;
  const mine = repReceipts.filter((r) => r.repId === activeRep.id);
  const onPhoto = async (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; setBusy(true); try { setF((p) => ({ ...p, photo: null })); const d = await compressImage(file); setF((p) => ({ ...p, photo: d })); } catch (er) { setErr(RAx.rcErrPhoto); } setBusy(false); };
  const submit = () => {
    if (!(+f.amount > 0)) return setErr(RAx.rcErrAmt);
    if (!f.photo) return setErr(RAx.rcErrPhoto);
    if (f.kind === "other" && f.note.trim().length < 5) return setErr(RAx.rcErrNote);
    setErr("");
    setRepReceipts((prev) => [{ id: "RC-" + Date.now(), repId: activeRep.id, name: activeRep.ar, kind: f.kind, amount: +f.amount, note: f.note.trim(), photo: f.photo, date: riyadhToday(), status: "pending" }, ...prev]);
    setF({ kind: "fuel", amount: "", note: "", photo: null });
  };
  const tone = { pending: "warn", approved: "ok", rejected: "bad" };
  const lbl = { pending: RAx.rcPending, approved: RAx.rcApproved, rejected: RAx.rcRejected };
  return (
    <div className="space-y-4">
      <PhotoModal src={view} onClose={() => setView(null)} />
      <Panel title={RAx.rcT}>
        <p className="text-[12px] mb-4" style={{ color: "var(--muted)" }}>{RAx.rcSub}</p>
        <div className="flex gap-2 mb-3">{[["fuel", RAx.rcKindFuel], ["other", RAx.rcKindOther]].map(([k, l]) => <button key={k} onClick={() => setF({ ...f, kind: k })} className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold" style={{ background: f.kind === k ? "#12151D" : "rgba(20,27,45,.05)", color: f.kind === k ? "#fff" : "var(--muted)" }}>{l}</button>)}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <GateField label={RAx.rcAmount} val={f.amount} set={(v) => setF({ ...f, amount: v })} ph="0" Icon={Wallet} type="number" accent={role.accent} />
          <GateField label={RAx.rcNote} val={f.note} set={(v) => setF({ ...f, note: v })} ph="" Icon={MessageSquare} type="text" accent={role.accent} />
        </div>
        <label className="mt-3 flex items-center gap-3 rounded-2xl p-3.5 cursor-pointer" style={{ border: "1.5px dashed var(--line-strong)", background: "rgba(20,27,45,.03)" }}>
          {f.photo ? <img src={f.photo} alt="" className="w-16 h-16 rounded-xl object-cover" /> : <Camera size={26} style={{ color: role.accent }} />}
          <span className="text-[12.5px] font-bold">{busy ? "…" : RAx.rcPhoto}</span>
          <input type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />
        </label>
        {err && <p className="text-[11.5px] mt-3" style={{ color: "#C0443A" }}>{err}</p>}
        <div className="mt-4"><Btn variant="accent" accent={role.glow} icon={Send} onClick={submit}>{RAx.rcSend}</Btn></div>
      </Panel>
      <Panel title={RAx.rcMine}>
        {mine.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{RAx.rcNone}</p> : (
          <div className="space-y-2.5">{mine.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
              <img src={r.photo} alt="" onClick={() => setView(r.photo)} className="w-14 h-14 rounded-lg object-cover cursor-pointer" />
              <div className="flex-1 min-w-0"><p className="num text-[15px] font-extrabold">{fmt(r.amount)} {t.sar}</p><p className="num text-[11px]" style={{ color: "var(--muted)" }}>{r.date}</p>
                {r.status === "rejected" && r.reason && <p className="text-[11px]" style={{ color: "#C0443A" }}>{r.reason}</p>}</div>
              <Chip tone={tone[r.status]} sm>{lbl[r.status]}</Chip>
            </div>))}</div>
        )}
      </Panel>
    </div>
  );
}

function ReceiptsAdminPage({ lang, role, repReceipts, setRepReceipts, setAuditLog, actingEmployee }) {
  const RAx = RA[lang], t = T[lang];
  const [tab, setTab] = useState("pending"); const [view, setView] = useState(null); const [rej, setRej] = useState(null); const [reason, setReason] = useState("");
  const list = repReceipts.filter((r) => r.status === tab);
  const decide = (r, status, why) => {
    setRepReceipts((prev) => prev.map((z) => (z.id === r.id ? { ...z, status, reason: why || "", decidedBy: actingEmployee?.name || role.id, decidedAt: riyadhNow().toISOString() } : z)));
    logAudit(setAuditLog, role, "receipt_" + status, `${r.name}: ${r.amount}`, actingEmployee);
    setRej(null); setReason("");
  };
  const counts = (s) => repReceipts.filter((r) => r.status === s).length;
  return (
    <div className="space-y-4">
      <PhotoModal src={view} onClose={() => setView(null)} />
      <div className="flex gap-2 flex-wrap">{[["pending", RAx.rcPending], ["approved", RAx.rcApproved], ["rejected", RAx.rcRejected]].map(([k, l]) => (
        <button key={k} onClick={() => setTab(k)} className="px-4 py-2.5 rounded-xl text-[12.5px] font-bold" style={{ background: tab === k ? "#12151D" : "#fff", color: tab === k ? "#fff" : "var(--muted)", border: "1px solid var(--line)" }}>{l} <span className="num">({counts(k)})</span></button>))}</div>
      <Panel title={RAx.rcAdminT}>
        {list.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{RAx.rcNone}</p> : (
          <div className="space-y-3">{list.map((r) => (
            <div key={r.id} className="rounded-2xl p-3 flex gap-3 flex-wrap" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
              <img src={r.photo} alt="" onClick={() => setView(r.photo)} className="w-24 h-24 rounded-xl object-cover cursor-pointer" />
              <div className="flex-1 min-w-[180px]">
                <p className="text-[13.5px] font-extrabold">{r.name}</p>
                <p className="num text-[18px] font-extrabold">{fmt(r.amount)} {t.sar}</p>
                <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{r.kind === "fuel" ? RAx.rcKindFuel : RAx.rcKindOther} · <span className="num">{r.date}</span>{r.note ? ` · ${r.note}` : ""}</p>
                {r.status === "rejected" && <p className="text-[11.5px]" style={{ color: "#C0443A" }}>{r.reason}</p>}
                {r.status === "pending" && (rej === r.id ? (
                  <div className="flex gap-2 mt-2 flex-wrap"><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={RAx.rcReason} className="flex-1 min-w-[150px] rounded-lg px-2.5 py-2 text-[12px] outline-none" style={INPUT_ST} />
                    <Btn variant="danger" onClick={() => reason.trim().length >= 5 && decide(r, "rejected", reason.trim())}>{RAx.rcReject}</Btn></div>
                ) : (
                  <div className="flex gap-2 mt-2"><Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => decide(r, "approved")}>{RAx.rcApprove}</Btn><Btn variant="danger" onClick={() => setRej(r.id)}>{RAx.rcReject}</Btn></div>
                ))}
              </div>
            </div>))}</div>
        )}
      </Panel>
    </div>
  );
}

const PAGES = {
  overview: Overview, orders: OrdersPage, cars: CarsPage, zones: ZonesPage,
  restaurants: RestaurantsPage, invoices: InvoicesPage, expenses: ExpensesPage,
  employees: PeoplePage, attendance: AttendancePage,
  contracts: ContractsPage, cases: CasesPage, compliance: CompliancePage,
  approvals: ApprovalsPage, reports: ReportsPage, settings: SettingsPage,
  hiring: HiringPage, shifts: ShiftsPage, tickets: TicketsPage, circulars: CircularsPage,
  pulse: PulsePage, iqama: IqamaAlertsPage, payrollRuns: PayrollRunsPage,
  chat: CommsPage, messages: RepMessagesPage, leaderboard: LeaderboardPage, audit: AuditLogPage,
  hall: HallOfFamePage, charter: CharterPage, checklist: PreLaunchChecklistPage, growth: GrowthPage, security: SecurityPage,
  permissions: PermissionsMapPage, mystory: MyStoryPage, equipCompliance: ComplianceEquipmentPage,
  boardCouncil: BoardCouncilPage, decisions: DecisionsPage,
  repAccounting: RepAccountingPage, myEarnings: MyEarningsPage, today: TodayPage, riderHome: RiderHome, riderReceipts: RiderReceiptsPage, receiptsAdmin: ReceiptsAdminPage,
  financeHub: HubPage, repsHub: HubPage, commsHub: HubPage, hrHub: HubPage, legalHub: HubPage,
};
const NAV_ICON = {
  overview: LayoutDashboard, orders: ShoppingBag, cars: Car, zones: MapPin,
  restaurants: Store, invoices: ReceiptText, expenses: Wallet, payroll: CircleDollarSign,
  employees: Users, attendance: CalendarClock, contracts: FileSignature, cases: Gavel,
  compliance: ShieldCheck, approvals: BadgeCheck, reports: ClipboardList, settings: Settings,
  hiring: UserPlus, shifts: Target, tickets: Send, circulars: Megaphone, pulse: Radio,
  iqama: ShieldAlert, payrollRuns: CircleDollarSign, chat: MessageSquare, messages: MessageSquare,
  leaderboard: Trophy, audit: ClipboardList, hall: Crown, charter: Scale, checklist: Rocket, growth: TrendingUp,
  security: ShieldAlert, permissions: ShieldCheck, mystory: Sparkles, equipCompliance: ShieldAlert,
  boardCouncil: Scale, decisions: Gavel, repAccounting: HandCoins, myEarnings: Wallet, today: Sparkles, riderHome: LayoutDashboard, riderReceipts: Camera, receiptsAdmin: ReceiptText,
  financeHub: Wallet, repsHub: Trophy, commsHub: MessageSquare, hrHub: Users, legalHub: Scale,
};

/* ═══════════  الهيكل  ═══════════ */
/* ═══════════  جولة تعريفية أول استخدام  ═══════════ */
const TOUR_STEPS = {
  ar: {
    rep: [
      { t: "أهلاً بك في بوارق الشرق", d: "هذه لوحتك الشخصية — تعرض إنجازك الشهري وحالة حضورك في نظرة واحدة." },
      { t: "بصمة وشفت جديد", d: "الزرّان العائمان بالأسفل يفتحان لك تسجيل الحضور وحجز شفت جديد من أي صفحة." },
      { t: "التذاكر والرسائل", d: "أي طلب أو استفسار يمر عبر التذاكر، ورسائل الإدارة تصلك للاطلاع فقط." },
    ],
    office: [
      { t: "أهلاً بك في بوارق الشرق", d: "هذه لوحتك الرئيسية — كل رقم فيها محسوب من بياناتك الفعلية، بلا بيانات وهمية." },
      { t: "القائمة الجانبية", d: "كل قسم يملك صلاحياته الخاصة، وتقدر تنتقل بينها من الشريط الجانبي أو القائمة السفلية على الجوال." },
      { t: "الإعدادات والنسخ الاحتياطي", d: "من الإعدادات تقدر تغيّر كلمة مرورك، وتصدّر نسخة كاملة من بيانات المنصة كملف احتياطي." },
    ],
  },
  en: {
    rep: [
      { t: "Welcome to Bawariq Al-Sharq", d: "This is your personal dashboard — your monthly progress and attendance status at a glance." },
      { t: "Clock in & new shift", d: "The floating buttons at the bottom open attendance clock-in and shift booking from any page." },
      { t: "Tickets & messages", d: "Any request goes through Tickets, and department messages arrive for you to acknowledge only." },
    ],
    office: [
      { t: "Welcome to Bawariq Al-Sharq", d: "This is your main dashboard — every number here is computed from your real data, no demo data." },
      { t: "Side navigation", d: "Each department has its own permissions, reachable from the sidebar or the mobile bottom bar." },
      { t: "Settings & backup", d: "From Settings you can change your password and export a full backup of the platform's data." },
    ],
  },
  ur: {
    rep: [
      { t: "بوارق الشرق میں خوش آمدید", d: "یہ آپ کا ذاتی ڈیش بورڈ ہے — آپ کی ماہانہ کارکردگی اور حاضری ایک نظر میں۔" },
      { t: "حاضری اور نئی شفٹ", d: "نیچے موجود بٹن کسی بھی صفحے سے حاضری اور نئی شفٹ بکنگ کھولتے ہیں۔" },
      { t: "ٹکٹس اور پیغامات", d: "کوئی بھی درخواست ٹکٹس کے ذریعے جاتی ہے، اور شعبے کے پیغامات صرف دیکھنے کے لیے آتے ہیں۔" },
    ],
    office: [
      { t: "بوارق الشرق میں خوش آمدید", d: "یہ آپ کا مرکزی ڈیش بورڈ ہے — یہاں ہر عدد آپ کے حقیقی ڈیٹا سے شمار ہوتا ہے۔" },
      { t: "سائیڈ نیویگیشن", d: "ہر شعبے کے اپنے اختیارات ہیں، سائیڈبار یا موبائل نچلی بار سے قابل رسائی۔" },
      { t: "سیٹنگز اور بیک اپ", d: "سیٹنگز سے آپ پاس ورڈ تبدیل کر سکتے ہیں اور پلیٹ فارم کا مکمل بیک اپ برآمد کر سکتے ہیں۔" },
    ],
  },
};
function OnboardingTour({ lang, role, onDone }) {
  const t = T[lang], x = EX[lang];
  const steps = (TOUR_STEPS[lang] || TOUR_STEPS.ar)[role.id === "rep" ? "rep" : "office"];
  const [i, setI] = useState(0);
  const isMapStep = i === steps.length;
  const step = steps[i];
  const isLast = i === steps.length; // آخر خطوة هي خريطة الخدمات
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center px-5" style={{ background: "rgba(3,5,10,.8)", backdropFilter: "blur(6px)" }}>
      <div className="glass rounded-3xl p-6 w-full max-w-md rise" style={{ border: `1px solid rgba(${role.glow},.4)` }}>
        <div className="flex items-center gap-1.5 mb-4">
          {[...steps, {}].map((_, si) => (
            <span key={si} className="h-1.5 flex-1 rounded-full" style={{ background: si <= i ? role.accent : "rgba(20,27,45,.1)" }} />
          ))}
        </div>
        {!isMapStep ? (
          <>
            <Emblem role={role} size={44} />
            <h3 className="text-[16px] font-extrabold mt-3">{step.t}</h3>
            <p className="text-[13px] leading-relaxed mt-2" style={{ color: "var(--muted)" }}>{step.d}</p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Emblem role={role} size={44} />
              <div className="min-w-0">
                <h3 className="text-[15px] font-extrabold truncate">{x.servicesMapT}</h3>
                <p className="text-[11px]" style={{ color: "var(--muted)" }}>{role[lang].t}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 max-h-64 overflow-y-auto no-scrollbar">
              {role.nav.map((n) => {
                const Icon = NAV_ICON[n];
                return (
                  <div key={n} className="flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-center" style={{ background: "rgba(20,27,45,.04)", border: "1px solid var(--line)" }}>
                    <span className="grid place-items-center w-8 h-8 rounded-lg" style={{ background: `rgba(${role.glow},.14)` }}>
                      <Icon size={15} style={{ color: role.accent }} />
                    </span>
                    <span className="text-[9.5px] font-semibold leading-tight" style={{ color: "var(--muted)" }}>{t.nav[n]}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div className="flex items-center justify-between mt-5">
          <button onClick={onDone} className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>{t.back}</button>
          <Btn variant="accent" accent={role.glow} icon={isLast ? CheckCircle2 : ChevronRight} onClick={() => (isLast ? onDone() : setI(i + 1))}>
            {isLast ? x.startNow : t.cont}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function IdentityPicker({ lang, role, staff, onPick }) {
  const t = T[lang], x = EX[lang];
  const [selected, setSelected] = useState(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const confirm = () => {
    if (!selected.password || pw !== selected.password) { setErr(x.errIdentityPass); return; }
    onPick(selected);
  };

  if (selected) {
    return (
      <div className="fixed inset-0 z-[75] grid place-items-center px-5" style={{ background: "rgba(3,5,10,.86)", backdropFilter: "blur(6px)" }}>
        <div className="glass rounded-3xl p-6 w-full max-w-sm rise" style={{ border: `1px solid rgba(${role.glow},.4)` }}>
          <div className="flex items-center gap-3 mb-4">
            {selected.photo ? <img src={selected.photo} alt="" className="w-11 h-11 rounded-2xl object-cover" />
              : <span className="grid place-items-center w-11 h-11 rounded-2xl" style={{ background: `rgba(${role.glow},.14)` }}><User size={18} style={{ color: role.accent }} /></span>}
            <div className="min-w-0">
              <p className="text-[14px] font-extrabold truncate">{selected.name}</p>
              <p className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{selected.position}</p>
            </div>
          </div>
          <GateField label={x.empPassword} val={pw} set={setPw} ph={x.identityPassPh} Icon={Lock} af type="password" accent={role.accent} onEnter={confirm} />
          {err && <p className="mt-2.5 text-[11.5px] flex items-start gap-1.5" style={{ color: "#E8837A" }}><AlertTriangle size={13} className="mt-px shrink-0" />{err}</p>}
          <div className="flex gap-2 mt-4">
            <Btn full onClick={() => { setSelected(null); setPw(""); setErr(""); }}>{t.back}</Btn>
            <Btn full variant="accent" accent={role.glow} icon={Fingerprint} onClick={confirm}>{x.confirmActivate}</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[75] grid place-items-center px-5" style={{ background: "rgba(3,5,10,.86)", backdropFilter: "blur(6px)" }}>
      <div className="glass rounded-3xl p-6 w-full max-w-sm rise" style={{ border: `1px solid rgba(${role.glow},.4)` }}>
        <Emblem role={role} size={44} />
        <h3 className="text-[16px] font-extrabold mt-3">{x.chooseIdentity}</h3>
        <p className="text-[12.5px] leading-relaxed mt-1.5" style={{ color: "var(--muted)" }}>{x.chooseIdentitySub}</p>
        <div className="space-y-2 mt-4 max-h-72 overflow-y-auto no-scrollbar">
          {staff.map((e) => (
            <button key={e.id} onClick={() => { setSelected(e); setErr(""); setPw(""); }} className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-start transition"
              style={{ background: "rgba(20,27,45,.04)", border: "1px solid var(--line)" }}>
              {e.photo ? <img src={e.photo} alt="" className="w-9 h-9 rounded-xl object-cover" />
                : <span className="grid place-items-center w-9 h-9 rounded-xl" style={{ background: `rgba(${role.glow},.14)` }}><User size={16} style={{ color: role.accent }} /></span>}
              <span className="min-w-0">
                <span className="block text-[13px] font-bold truncate">{e.name}</span>
                <span className="block text-[10.5px] truncate" style={{ color: "var(--muted)" }}>{e.position}</span>
              </span>
            </button>
          ))}
        </div>
        <button onClick={() => onPick({ id: "generic", name: role[lang].t, position: "" })} className="w-full text-center mt-4 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
          {x.continueGeneric}
        </button>
      </div>
    </div>
  );
}

function Shell({ lang, setLang, role, user, activeRep, onSwitch, onLogout, reduce, setReduce, reps, setReps, reports, setReports,
  tickets, setTickets, circulars, setCirculars, attendance, setAttendance, shifts, setShifts,
  orders, setOrders, cars, setCars, restaurants, setRestaurants, invoices, setInvoices,
  employees, setEmployees, contracts, setContracts, cases, setCases, approvalReqs, setApprovalReqs,
  expenses, setExpenses, iqamaAlerts, setIqamaAlerts, payrollRuns, setPayrollRuns,
  deptChats, setDeptChats, repMessages, setRepMessages, leaderboardHistory, setLeaderboardHistory, auditLog, setAuditLog,
  weekendFine, setWeekendFine, charterClauses, setCharterClauses, violationPenalty, setViolationPenalty,
  deptPasswords, setDeptPasswords, deptSecurity, setDeptSecurity, pricing, setPricing, repSettlements, setRepSettlements, applications, setApplications, repReceipts, setRepReceipts,
  equipStatus, setEquipStatus, tgaFines, setTgaFines, decisions, setDecisions, query, setQuery }) {
  const t = T[lang], x = EX[lang];
  const navEff = (() => {
    const out = role.id === "rep" ? [] : ["today"];
    role.nav.forEach((n) => {
      const h = HUB_OF[n];
      if (h && HUBS[h].filter((m) => role.nav.includes(m)).length >= 2) { if (!out.includes(h)) out.push(h); }
      else if (!out.includes(n)) out.push(n);
    });
    return out;
  })();
  const [page, setPage] = useState(() => navEff[0] || "overview");
  const [hubNav, setHubNav] = useState({ tab: null, stamp: 0 });
  const goTo = (id) => {
    const h = HUB_OF[id];
    if (h && navEff.includes(h)) { setHubNav({ tab: id, stamp: Date.now() }); setPage(h); } else setPage(id);
  };
  const [showAll, setShowAll] = useState(() => { try { return localStorage.getItem("bq_showall") !== "0"; } catch (e) { return true; } });
  const toggleAll = () => setShowAll((v) => { const nv = !v; try { localStorage.setItem("bq_showall", nv ? "1" : "0"); } catch (e) {} return nv; });
  useEffect(() => { if (!navEff.includes(page) && page !== "settings") setPage(navEff[0]); }, [role.id]); // eslint-disable-line
  const [collapsed, setCollapsed] = useState({});
  const searchRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (searchRef.current) searchRef.current.focus(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const [drawer, setDrawer] = useState(false);
  const [bell, setBell] = useState(false);
  const [logShift, setLogShift] = useState(false);
  const [fabToast, setFabToast] = useState(null);
  const [tourSeen, setTourSeen] = useState(false);
  const markTourSeen = () => setTourSeen(true);
  const deptStaff = employees.filter((e) => e.dept === role.id && e.status !== "suspended");
  const needsIdentity = role.id !== "gm" && deptStaff.length >= 2;
  const [actingEmployee, setActingEmployee] = useState(deptStaff.length === 1 ? deptStaff[0] : null);
  const Page = PAGES[page] || Overview;
  useEffect(() => { setDrawer(false); setBell(false); }, [page]);

  const isRep = role.id === "rep";
  const myOpenTickets = tickets.filter((tk) => tk.repId === user && tk.status === "open").length;
  const myInboxTickets = !isRep ? tickets.filter((tk) => ticketVisibleToRole(tk, role.id) && ticketCurrentOwner(tk) !== "resolved" && ticketCurrentOwner(tk) !== "rejected" && (ticketCurrentOwner(tk) === role.id || ticketCurrentOwner(tk) === "broadcast")).length : 0;

  const minutesUntilAppt = (tk) => {
    if (tk.type !== "appointment" || !tk.apptAt || tk.status !== "open") return null;
    const target = new Date(tk.apptAt.replace(" ", "T") + ":00Z");
    // apptAt مخزّن بتوقيت الدمام (UTC+3) كنص محلي؛ نحوّله لعدد فرق بالدقائق عن الآن الحقيقي
    const targetUtcMs = target.getTime() - 3 * 3600000;
    return Math.round((targetUtcMs - Date.now()) / 60000);
  };

  const notifs = [];
  if (isRep) {
    {
      const pm = prevMonthStr(riyadhNow().toISOString().slice(0, 7));
      if (repSettlements.some((z) => (z.month === pm || z.month === riyadhNow().toISOString().slice(0, 7)) && z.closed)) notifs.push({ text: RA[lang].repClosedNotif, tone: "ok", page: "myEarnings" });
    }
    repMessages.filter((m) => m.repId === user && !m.seen).forEach((m) =>
      notifs.push({ text: `${(ALL_ROLES.find((r) => r.id === m.from) || {})[lang]?.t}: ${m.text}`, tone: "info", page: "messages" }));
    tickets.filter((tk) => tk.repId === user && (tk.status === "resolved" || tk.status === "rejected" || tk.status === "auto_closed"))
      .slice(0, 3).forEach((tk) => notifs.push({ text: `${ticketTypeOf(tk.type)[lang]} — ${tk.status === "resolved" ? x.stageResolved : tk.status === "auto_closed" ? x.stageAutoClosed : x.stageRejected}`, tone: tk.status === "resolved" ? "ok" : "n", page: "tickets" }));
    tickets.filter((tk) => tk.repId === user).forEach((tk) => {
      const mins = minutesUntilAppt(tk);
      if (mins != null && mins >= 0 && mins <= 60) notifs.unshift({ text: `${x.apptSoonT}: ${tk.apptAt.slice(11, 16)} (${x.apptSoonNote})`, tone: "warn", page: "tickets" });
    });
  } else {
    if ((role.id === "opsm" || role.id === "ops") && riyadhNow().getUTCHours() >= 12 && reps.some((r) => r.status === "active") && !reports.some((rp) => rp.date === new Date(riyadhNow().getTime() - 86400000).toISOString().slice(0, 10)))
      notifs.unshift({ text: RA[lang].missingEntryNotif, tone: "warn", page: "shifts", count: 1 });
    if (role.id === "hr" || role.id === "opsm") {
      const na = applications.filter((a) => a.status === "new").length;
      if (na > 0) notifs.unshift({ text: `${RA[lang].apNotif}: ${na}`, tone: "info", page: "hiring", count: na });
    }
    if (role.id === "fin" || role.id === "gm") {
      const nr = repReceipts.filter((q) => q.status === "pending").length;
      if (nr > 0) notifs.unshift({ text: `${RA[lang].rcNotif}: ${nr}`, tone: "warn", page: "receiptsAdmin", count: nr });
    }
    if (role.id === "fin") {
      const pm = prevMonthStr(riyadhNow().toISOString().slice(0, 7));
      const hasPrev = reports.some((rp) => rp.date.startsWith(pm));
      if (hasPrev && !repSettlements.some((z) => z.month === pm && z.closed)) notifs.unshift({ text: `${RA[lang].finCloseNotif} (${pm})`, tone: "warn", page: "repAccounting", count: 1 });
    }
    if (myInboxTickets > 0) notifs.push({ text: `${x.inboxTickets}: ${myInboxTickets}`, tone: "warn", page: "tickets", count: myInboxTickets });

    // ===== تنبيه رسائل الإدارات غير المقروءة (كل الأقسام) =====
    const unseenDeptMsgs = deptChats.filter((m) => m.to === role.id && !m.seen).length;
    if (unseenDeptMsgs > 0) notifs.unshift({ text: `${x.deptMsgsNotif}: ${unseenDeptMsgs}`, tone: "info", page: "chat", count: unseenDeptMsgs });
    tickets.forEach((tk) => {
      const mins = minutesUntilAppt(tk);
      if (mins != null && mins >= 0 && mins <= 60 && ticketVisibleToRole(tk, role.id) && (ticketCurrentOwner(tk) === role.id)) {
        const rep = reps.find((r) => r.nid === tk.repId || r.id === tk.repId);
        notifs.unshift({ text: `${x.apptSoonT}: ${rep ? (lang === "en" ? rep.en : rep.ar) : tk.repId} · ${tk.apptAt.slice(11, 16)}`, tone: "warn", page: "tickets" });
      }
    });
    if (role.id !== "advisor") {
      circulars.slice(0, 2).forEach((c) => notifs.push({ text: `${x.circulars}: ${c.title}`, tone: "n", page: "circulars" }));
      contracts.filter((c) => c.st === "expiring").slice(0, 2).forEach((c) => notifs.push({ text: lang === "ar" ? `عقد ${c.party} ينتهي قريباً` : lang === "en" ? `${c.party}'s contract is expiring` : `${c.party} کا معاہدہ ختم ہونے والا ہے`, tone: "warn", page: "contracts" }));
      if (role.id === "hr") {
        const urgent = reps.filter((r) => r.idExpiry && daysUntil(r.idExpiry) != null && daysUntil(r.idExpiry) <= 30);
        urgent.slice(0, 3).forEach((r) => notifs.push({ text: `${x.iqamaGmCard}: ${lang === "en" ? r.en : r.ar}`, tone: "bad", page: "iqama" }));
      }
    }

    // ===== تنبيهات القرارات المعلّقة (المدير العام + المستشارون) =====
    if (role.id === "gm") {
      const myPendingDecisions = decisions.filter((d) => !d.gmApproved);
      if (myPendingDecisions.length > 0) notifs.unshift({ text: `${x.decisionsPendingNotif}: ${myPendingDecisions.length}`, tone: "warn", page: "decisions", count: myPendingDecisions.length });
    }
    if (role.id === "advisor") {
      const boardPendingDecisions = decisions.filter((d) => !d.boardApproved);
      if (boardPendingDecisions.length > 0) notifs.unshift({ text: `${x.decisionsPendingNotif}: ${boardPendingDecisions.length}`, tone: "warn", page: "decisions", count: boardPendingDecisions.length });
    }

    // ===== تنبيهات سلسلة اعتماد الرواتب (كل مرحلة لصاحبها) =====
    if (role.id === "fin") {
      const financeWaiting = payrollRuns.filter((r) => r.status === "finance_review").length;
      if (financeWaiting > 0) notifs.unshift({ text: `${x.payrollWaitingNotif}: ${financeWaiting}`, tone: "warn", page: "payrollRuns", count: financeWaiting });
    }
    if (role.id === "gm") {
      const gmWaiting = payrollRuns.filter((r) => r.status === "sent_to_gm").length;
      if (gmWaiting > 0) notifs.unshift({ text: `${x.payrollWaitingNotif}: ${gmWaiting}`, tone: "warn", page: "payrollRuns", count: gmWaiting });
    }
    if (role.id === "advisor") {
      const boardWaiting = payrollRuns.filter((r) => r.status === "sent_to_board").length;
      if (boardWaiting > 0) notifs.unshift({ text: `${x.payrollWaitingNotif}: ${boardWaiting}`, tone: "warn", page: "payrollRuns", count: boardWaiting });
    }

    // ===== تنبيهات المصروفات المعلّقة (المدير العام) =====
    if (role.id === "gm") {
      const pendingExpenses = expenses.filter((e) => e.status === "pending").length;
      if (pendingExpenses > 0) notifs.unshift({ text: `${x.expensesWaitingNotif}: ${pendingExpenses}`, tone: "warn", page: "expenses", count: pendingExpenses });
    }

    // ===== تنبيه فواتير التطبيقات تحت المراجعة (المدير العام) =====
    if (role.id === "gm") {
      const reviewInvoices = invoices.filter((v) => v.st === "review").length;
      if (reviewInvoices > 0) notifs.push({ text: `${x.invoicesReviewNotif}: ${reviewInvoices}`, tone: "n", page: "invoices", count: reviewInvoices });
    }

    // ===== تنبيه المناديب بانتظار التفعيل (الموارد البشرية) =====
    if (role.id === "hr") {
      const pendingActivation = reps.filter((r) => r.status === "pending").length;
      if (pendingActivation > 0) notifs.unshift({ text: `${x.pendingReps}: ${pendingActivation}`, tone: "warn", page: "hiring", count: pendingActivation });
    }

    // ===== تنبيهات القانونية (بلاغات محالة + قضايا مفتوحة) =====
    if (role.id === "legal") {
      const forwarded = tickets.filter((tk) => tk.forwardedToLegal && tk.status !== "resolved").length;
      if (forwarded > 0) notifs.unshift({ text: `${x.legalForwardedNotif}: ${forwarded}`, tone: "bad", page: "tickets", count: forwarded });
      const openCasesCount = cases.filter((c) => c.st === "open").length;
      if (openCasesCount > 0) notifs.push({ text: `${x.legalOpenCasesNotif}: ${openCasesCount}`, tone: "warn", page: "cases", count: openCasesCount });
    }

    // ===== تنبيه حسابات مقفلة (مدير الحركة والتشغيل) =====
    if (role.id === "opsm") {
      const lockedDepts = ROLES.filter((r) => (deptSecurity[r.id] || {}).locked).length;
      if (lockedDepts > 0) notifs.unshift({ text: `${x.lockedDeptsNotif}: ${lockedDepts}`, tone: "bad", page: "security", count: lockedDepts });
    }
  }

  // خريطة عدد العناصر المعلّقة لكل صفحة — تُستخدم لعرض شارة حمراء على عنصر القائمة الجانبية نفسه
  const navBadges = {};
  notifs.forEach((n) => { if (n.page && n.count) navBadges[n.page] = (navBadges[n.page] || 0) + n.count; });

  const badgeOf = (n) => (HUBS[n] ? HUBS[n].reduce((sum, m) => sum + (m === "tickets" ? (isRep ? myOpenTickets : myInboxTickets) : (navBadges[m] || 0)), 0)
    : n === "tickets" ? (isRep ? myOpenTickets : myInboxTickets) : (navBadges[n] || 0));
  const GROUPS = [
    { id: "main", label: RA[lang].grpMain, pages: ["today", "riderHome", "overview", "boardCouncil", "decisions", "myEarnings", "mystory"] },
    { id: "ops", label: RA[lang].grpOps, pages: ["shifts", "pulse", "cars", "orders", "zones", "restaurants", "attendance", "hrHub"] },
    { id: "fin", label: RA[lang].grpFin, pages: ["financeHub", "growth"] },
    { id: "people", label: RA[lang].grpPeople, pages: ["repsHub", "messages"] },
    { id: "comms", label: RA[lang].grpComms, pages: ["commsHub"] },
    { id: "gov", label: RA[lang].grpGov, pages: ["legalHub", "equipCompliance", "approvals", "reports", "audit", "permissions", "security", "checklist"] },
  ];
  const navGroups = (() => {
    const used = new Set(), out = [];
    GROUPS.forEach((g) => { const items = g.pages.filter((n) => navEff.includes(n)); items.forEach((n) => used.add(n)); if (items.length) out.push({ ...g, items }); });
    const rest = navEff.filter((n) => !used.has(n) && n !== "settings");
    if (rest.length) out.push({ id: "other", label: "", items: rest });
    return out;
  })();
  const primaryItems = navEff.filter((n) => (PRIMARY_NAV[role.id] || navEff).includes(n) && n !== "settings");
  if (!primaryItems.includes(page) && navEff.includes(page)) primaryItems.push(page);
  const shownGroups = showAll ? navGroups : [{ id: "primary", label: "", items: primaryItems }];
  const sideBtn = { background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.82)", border: "1px solid rgba(255,255,255,.08)" };

  const SideInner = () => (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(180deg,#0E1424,#131C33)", color: "#fff" }}>
      <div className="px-4 pt-5 pb-4"><Wordmark t={t} s={40} dark /></div>
      <div className="px-3">
        <div className="rounded-2xl p-3 mb-3" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)" }}>
          <div className="flex items-center gap-2.5">
            <Emblem role={role} size={38} />
            <div className="min-w-0">
              <div className="text-[12.5px] font-bold truncate">{role[lang].t}</div>
              <div className="num text-[10.5px]" style={{ color: "rgba(255,255,255,.5)" }}>{user}</div>
            </div>
          </div>
          {needsIdentity && actingEmployee && (
            <button onClick={() => setActingEmployee(null)} className="w-full flex items-center gap-2 mt-2.5 pt-2.5 text-start" style={{ borderTop: "1px solid rgba(255,255,255,.1)" }}>
              {actingEmployee.photo ? <img src={actingEmployee.photo} alt="" className="w-6 h-6 rounded-lg object-cover" />
                : <span className="grid place-items-center w-6 h-6 rounded-lg" style={{ background: `rgba(${role.glow},.25)` }}><User size={12} style={{ color: role.accent }} /></span>}
              <span className="text-[10.5px] flex-1 truncate" style={{ color: "rgba(255,255,255,.55)" }}>{x.actingAs}: <b style={{ color: "#fff" }}>{actingEmployee.name}</b></span>
            </button>
          )}
        </div>
      </div>
      <div className="px-3 flex-1 overflow-y-auto no-scrollbar">
        <nav>
          {shownGroups.map((g) => {
            const shut = collapsed[g.id] && !g.items.includes(page);
            const gBadge = g.items.reduce((sum, n) => sum + badgeOf(n), 0);
            return (
              <div key={g.id} className="mb-2">
                {g.label && (
                  <button onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))} className="w-full flex items-center gap-2 px-2.5 pt-2.5 pb-1.5 text-start">
                    <span className="flex-1 text-[10px] font-bold uppercase" style={{ letterSpacing: ".14em", color: "rgba(255,255,255,.38)" }}>{g.label}</span>
                    {shut && gBadge > 0 && <span className="num text-[9px] font-bold px-1.5 rounded-full" style={{ background: "#E8837A", color: "#fff" }}>{gBadge}</span>}
                    <ChevronRight size={12} style={{ color: "rgba(255,255,255,.35)", transform: shut ? "none" : "rotate(90deg)", transition: "transform .2s" }} />
                  </button>
                )}
                {!shut && g.items.map((n) => {
                  const Icon = NAV_ICON[n], on = page === n;
                  const badge = badgeOf(n);
                  return (
                    <button key={n} onClick={() => setPage(n)} className="relative w-full flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-semibold text-start transition-all duration-200 hover:bg-white/5"
                      style={{ background: on ? `rgba(${role.glow},.2)` : undefined, color: on ? "#fff" : "rgba(255,255,255,.62)" }}>
                      <span className="absolute rounded-full transition-all duration-300" style={{ insetInlineStart: 0, top: on ? "20%" : "48%", bottom: on ? "20%" : "48%", width: 3, background: role.accent, opacity: on ? 1 : 0 }} />
                      <Icon size={16} style={{ color: on ? role.accent : "currentColor" }} className="shrink-0" />
                      <span className="flex-1 truncate">{t.nav[n]}</span>
                      {badge > 0 && <span className="num text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#E8837A", color: "#fff" }}>{badge}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        {navEff.length > primaryItems.length && (
          <button onClick={toggleAll} className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 mt-1 text-[11.5px] font-bold" style={{ color: "rgba(255,255,255,.55)", border: "1px dashed rgba(255,255,255,.18)" }}>
            <ChevronRight size={12} style={{ transform: showAll ? "rotate(-90deg)" : "rotate(90deg)" }} />{showAll ? RA[lang].showLess : RA[lang].showAll}
          </button>
        )}
      </div>
      <div className="p-3 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
        {isRep && <Btn full variant="accent" accent={role.glow} icon={Route} onClick={() => setLogShift(true)}>{x.logNewShift}</Btn>}
        {[[KeyRound, x.secTitle, () => setPage("settings")], ...(RIDER_MODE ? [] : [[ShoppingBag, t.switchDept, onSwitch]]), [LogOut, t.logout, onLogout]].map(([Ic, label, fn], i) => (
          <button key={i} onClick={fn} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-bold hover:brightness-125 transition" style={fn === onLogout ? { ...sideBtn, color: "#F4A8A0" } : sideBtn}><Ic size={14} />{label}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-full relative">
      <div className="mesh-dept" style={{ "--dept-glow": role.glow }} />
      {needsIdentity && !actingEmployee && (
        <IdentityPicker lang={lang} role={role} staff={deptStaff} onPick={setActingEmployee} />
      )}
      {(!needsIdentity || actingEmployee) && !tourSeen && <OnboardingTour lang={lang} role={role} onDone={markTourSeen} />}
      {logShift && (
        <LogShiftModal lang={lang} role={role} onClose={() => setLogShift(false)}
          onConfirm={(start, end) => {
            setShifts((prev) => [...prev, { repId: user, date: riyadhToday(), start, end, loggedAt: riyadhNow().toISOString() }]);
            setLogShift(false);
          }} />
      )}
      <aside className="hidden lg:block fixed z-30 rounded-[26px] overflow-hidden" style={{ insetInlineStart: 14, top: 14, bottom: 14, width: 258, background: "#0E1424", border: "1px solid rgba(255,255,255,.06)", boxShadow: "0 30px 70px -30px rgba(10,16,32,.6)" }}>
        <SideInner />
      </aside>

      {drawer && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0" style={{ background: "rgba(3,5,10,.7)", backdropFilter: "blur(6px)" }} onClick={() => setDrawer(false)} />
          <div className="absolute top-0 bottom-0 w-[280px] rise" style={{ insetInlineStart: 0, background: "#0E1424" }}>
            <button onClick={() => setDrawer(false)} className="absolute top-4 z-10 p-2" style={{ insetInlineEnd: 8, color: "#fff" }}><X size={18} /></button>
            <SideInner />
          </div>
        </div>
      )}

      <div className="lg:ms-[286px]">
        <header className="sticky top-0 z-40 px-4 sm:px-5 py-3" style={{ background: "rgba(245,246,248,.82)", backdropFilter: "blur(18px)", borderBottom: "1px solid var(--line)" }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl" onClick={() => setDrawer(true)} aria-label="menu"><Menu size={20} /></button>
            <div className="lg:hidden"><Logo s={30} /></div>
            <div className="relative hidden sm:block flex-1 max-w-md">
              <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5" style={{ background: "rgba(20,27,45,.045)", border: "1px solid var(--line)" }}>
                <Search size={15} style={{ color: "var(--muted)" }} />
                <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search}
                  className="flex-1 bg-transparent outline-none border-0 text-[12.5px] min-w-0" style={{ color: "#12151D" }} />
                <kbd className="num hidden md:block text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: "#fff", border: "1px solid var(--line)", color: "var(--muted)" }}>Ctrl K</kbd>
              </div>
              {query.trim().length >= 2 && (
                <div className="absolute mt-2 w-full rise glass rounded-2xl p-2 z-50 max-h-64 overflow-y-auto no-scrollbar">
                  {(() => {
                    const q = query.trim().toLowerCase();
                    const hits = reps.filter((r) => r.ar.toLowerCase().includes(q) || r.en.toLowerCase().includes(q) || r.phone.includes(q) || (r.nid || "").includes(q)).slice(0, 6);
                    const pageHits = navEff.filter((n) => (t.nav[n] || "").toLowerCase().includes(q)).slice(0, 5);
                    if (!hits.length && !pageHits.length) return <p className="text-[11.5px] p-2" style={{ color: "var(--muted)" }}>{x.globalNoMatch}</p>;
                    const goToRep = () => {
                      const dest = role.nav.includes("shifts") ? "shifts" : role.nav.includes("pulse") ? "pulse" : "reports";
                      setPage(dest);
                    };
                    const pageRows = pageHits.map((n) => { const Ic = NAV_ICON[n]; return (
                      <button key={"p" + n} onClick={() => { goTo(n); setQuery(""); }} className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-start hover:bg-black/[.04] transition">
                        <span className="grid place-items-center w-8 h-8 rounded-lg shrink-0" style={{ background: `rgba(${role.glow},.13)` }}><Ic size={14} style={{ color: role.accent }} /></span>
                        <span className="flex-1 text-[12.5px] font-bold truncate">{t.nav[n]}</span>
                        <span className="text-[10px] font-semibold shrink-0" style={{ color: role.accent }}>{RA[lang].quickJump} →</span>
                      </button>); });
                    if (!hits.length) return pageRows;
                    return [...pageRows, ...hits.map((r) => (
                      <button key={r.id} onClick={goToRep} className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-start hover:bg-black/[.04] transition">
                        <span className="grid place-items-center w-8 h-8 rounded-lg shrink-0" style={{ background: `rgba(${role.glow},.13)` }}>
                          {r.vehicle === "car" ? <Car size={14} style={{ color: role.accent }} /> : <Bike size={14} style={{ color: role.accent }} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] font-bold truncate">{lang === "en" ? r.en : r.ar}</span>
                          <span className="num block text-[10.5px]" style={{ color: "var(--muted)" }}>{r.phone}</span>
                        </span>
                        <span className="text-[10px] font-semibold shrink-0" style={{ color: role.accent }}>{x.searchGoTo} →</span>
                      </button>
                    ))];
                  })()}
                </div>
              )}
            </div>
            <div className="flex-1 sm:hidden" />
            <div className="relative">
              <button onClick={() => setBell(!bell)} className="relative p-2 rounded-xl" style={{ background: "rgba(20,27,45,.045)", border: "1px solid var(--line)" }} aria-label={t.alerts}>
                <Bell size={16} />
                {notifs.length > 0 && <span className="absolute top-1.5 w-2 h-2 rounded-full pulse-dot" style={{ insetInlineEnd: 6, background: "#E8837A" }} />}
              </button>
              {bell && (
                <div className="absolute mt-2 w-[280px] rise glass rounded-2xl p-3 z-50" style={{ insetInlineEnd: 0 }}>
                  <p className="text-[11.5px] font-bold mb-2">{t.alerts}</p>
                  <div className="space-y-2">
                    {notifs.length === 0 ? (
                      <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{x.noRecords}</p>
                    ) : notifs.map((n, i) => (
                      <button key={i} onClick={() => { if (n.page) { goTo(n.page); setBell(false); } }}
                        className="w-full text-start text-[11.5px] leading-relaxed rounded-lg p-2 flex items-center gap-2 transition"
                        style={{ background: "rgba(20,27,45,.04)", color: n.tone === "bad" ? "#E8837A" : n.tone === "warn" ? "#E4B85C" : n.tone === "ok" ? "#4FD1A5" : "var(--muted)", cursor: n.page ? "pointer" : "default" }}>
                        <span className="flex-1">{n.text}</span>
                        {n.page && <ChevronRight size={13} className="shrink-0 opacity-60" style={{ transform: (LANGS.find((l) => l.code === lang) || {}).dir === "rtl" ? "rotate(180deg)" : "none" }} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={onLogout} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: "rgba(232,131,122,.12)", border: "1px solid rgba(232,131,122,.35)", color: "#C0443A" }} aria-label={t.logout}>
              <LogOut size={15} /><span>{t.logout}</span>
            </button>
            <div className="hidden sm:block">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-xl px-2.5 py-2.5 text-[12px] font-semibold outline-none"
                style={{ background: "rgba(20,27,45,.045)", border: "1px solid var(--line)", color: "#12151D" }}>
                {LANGS.map((l) => <option key={l.code} value={l.code} style={{ background: "#FFFFFF" }}>{l.name}</option>)}
              </select>
            </div>
            <span className="hidden sm:block">
              <Emblem role={role} size={36} />
            </span>
          </div>
        </header>

        <main className="px-4 sm:px-5 pt-4 pb-28 lg:pb-8 max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <p className="label-caps" style={{ color: role.accent }}>{role[lang].t}</p>
              <h1 className="text-[22px] sm:text-[28px] h-display tracking-tight">{t.nav[page]}</h1>
            </div>
            <span className="num hidden sm:block text-[11.5px]" style={{ color: "var(--muted)" }}>{t.thisMonth} · 2026</span>
          </div>
          <div key={page} className="rise">
            <Page lang={lang} role={role} user={user} activeRep={activeRep} onLogout={onLogout} setLang={setLang} reduce={reduce} setReduce={setReduce}
              reps={reps} setReps={setReps} reports={reports} setReports={setReports}
              tickets={tickets} setTickets={setTickets} circulars={circulars} setCirculars={setCirculars}
              attendance={attendance} setAttendance={setAttendance} shifts={shifts} setShifts={setShifts}
              orders={orders} setOrders={setOrders} cars={cars} setCars={setCars}
              restaurants={restaurants} setRestaurants={setRestaurants} invoices={invoices} setInvoices={setInvoices}
              employees={employees} setEmployees={setEmployees} contracts={contracts} setContracts={setContracts}
              cases={cases} setCases={setCases} approvalReqs={approvalReqs} setApprovalReqs={setApprovalReqs}
              expenses={expenses} setExpenses={setExpenses}
              iqamaAlerts={iqamaAlerts} setIqamaAlerts={setIqamaAlerts} payrollRuns={payrollRuns} setPayrollRuns={setPayrollRuns}
              deptChats={deptChats} setDeptChats={setDeptChats} repMessages={repMessages} setRepMessages={setRepMessages}
              leaderboardHistory={leaderboardHistory} setLeaderboardHistory={setLeaderboardHistory}
              auditLog={auditLog} setAuditLog={setAuditLog} actingEmployee={actingEmployee} weekendFine={weekendFine} setWeekendFine={setWeekendFine} charterClauses={charterClauses} setCharterClauses={setCharterClauses}
              violationPenalty={violationPenalty} setViolationPenalty={setViolationPenalty}
              deptPasswords={deptPasswords} setDeptPasswords={setDeptPasswords} deptSecurity={deptSecurity} setDeptSecurity={setDeptSecurity}
              equipStatus={equipStatus} setEquipStatus={setEquipStatus} tgaFines={tgaFines} setTgaFines={setTgaFines}
              decisions={decisions} setDecisions={setDecisions}
              pricing={pricing} setPricing={setPricing} repSettlements={repSettlements} setRepSettlements={setRepSettlements}
              applications={applications} setApplications={setApplications} repReceipts={repReceipts} setRepReceipts={setRepReceipts}
              query={query} setQuery={setQuery} goPage={goTo} notifs={notifs} hubId={page} hubTab={hubNav.tab} hubStamp={hubNav.stamp} navBadges={navBadges} />
          </div>
        </main>

        {isRep && (() => {
          const today = riyadhToday();
          const myToday = attendance.find((a) => a.key === user && a.date === today);
          const doClock = () => {
            const at = riyadhTimeHM();
            if (!myToday) {
              setAttendance((prev) => [...prev, { key: user, role: "rep", name: activeRep ? (lang === "en" ? activeRep.en : activeRep.ar) : user, date: today, in: at, out: null }]);
              setFabToast({ type: "in", at });
            } else if (!myToday.out) {
              setAttendance((prev) => prev.map((a) => (a.key === user && a.date === today ? { ...a, out: at } : a)));
              setFabToast({ type: "out", at });
            }
            setTimeout(() => setFabToast(null), 3200);
          };
          return (
            <div className="lg:hidden fixed z-40 flex flex-col items-end gap-2.5" style={{ insetInlineEnd: 16, bottom: "calc(78px + env(safe-area-inset-bottom))" }}>
              {fabToast && (
                <div className="rise flex items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-lg" style={{ background: "rgba(63,216,180,.95)", maxWidth: 220 }}>
                  <CheckCircle2 size={15} style={{ color: "#06121A" }} />
                  <span className="text-[11.5px] font-bold" style={{ color: "#06121A" }}>
                    {fabToast.type === "in" ? x.clockInConfirmed : x.clockOutConfirmed} · {fabToast.at}
                  </span>
                </div>
              )}
              <button onClick={() => setLogShift(true)} className="grid place-items-center w-12 h-12 rounded-2xl shadow-lg active:scale-95 transition"
                style={{ background: "rgba(20,26,38,.92)", border: `1px solid rgba(${role.glow},.4)`, boxShadow: `0 8px 24px -8px rgba(${role.glow},.5)` }} aria-label={x.logNewShift}>
                <Route size={19} style={{ color: role.accent }} />
              </button>
              <button onClick={doClock} className="grid place-items-center w-14 h-14 rounded-2xl shadow-lg active:scale-95 transition"
                style={{ background: myToday && !myToday.out ? "linear-gradient(140deg,#3FD8B4,#2BAE8E)" : `linear-gradient(140deg,rgba(${role.glow},.95),rgba(${role.glow},.6))`, boxShadow: "0 10px 28px -8px rgba(63,216,180,.55)" }}
                aria-label={x.clockIn}>
                <Fingerprint size={22} style={{ color: "#06121A" }} />
              </button>
            </div>
          );
        })()}

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-2 pt-2"
          style={{ background: "rgba(255,255,255,.9)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--line)", paddingBottom: "max(8px,env(safe-area-inset-bottom))" }}>
          <div className="flex items-stretch justify-around gap-1">
            {navEff.filter((n) => (PRIMARY_NAV[role.id] || navEff).includes(n)).slice(0, 4).map((n) => {
              const Icon = NAV_ICON[n], on = page === n;
              const mBadge = badgeOf(n);
              return (
                <button key={n} onClick={() => setPage(n)} className="relative flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition"
                  style={{ background: on ? `rgba(${role.glow},.12)` : "transparent", color: on ? role.accent : "var(--muted)" }}>
                  <span className="relative">
                    <Icon size={19} />
                    {mBadge > 0 && <span className="absolute w-2 h-2 rounded-full" style={{ top: -2, insetInlineEnd: -3, background: "#E8837A" }} />}
                  </span>
                  <span className="text-[9.5px] font-bold truncate max-w-full px-0.5">{t.nav[n]}</span>
                </button>
              );
            })}
            <button onClick={() => setDrawer(true)} className="relative flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition" style={{ color: !(PRIMARY_NAV[role.id] || navEff).includes(page) ? role.accent : "var(--muted)", background: !(PRIMARY_NAV[role.id] || navEff).includes(page) ? `rgba(${role.glow},.12)` : "transparent" }}>
              <span className="relative"><Menu size={19} />{navEff.some((n) => badgeOf(n) > 0) && <span className="absolute w-2 h-2 rounded-full" style={{ top: -2, insetInlineEnd: -3, background: "#E8837A" }} />}</span>
              <span className="text-[9.5px] font-bold">{RA[lang].more}</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ═══════════  الجذر  ═══════════ */
export default function App() {
  const [lang, setLang] = useState("ar");
  const [step, setStep] = useState(RIDER_MODE ? "gate" : "lang");
  const [user, setUser] = useState("BQ-GM");
  const [roleId, setRoleId] = useState(null);
  const [reduce, setReduce] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [reps, setReps, repsSyncStatus] = usePersisted("bq_reps", REP_SEED);
  const [reports, setReports] = usePersisted("bq_daily_reports", REPORTS_SEED);
  const [tickets, setTickets] = usePersisted("bq_tickets", []);
  const [circulars, setCirculars] = usePersisted("bq_circulars", []);
  const [attendance, setAttendance] = usePersisted("bq_attendance", []);
  const [shifts, setShifts] = usePersisted("bq_shifts", []);
  const [orders, setOrders] = usePersisted("bq_orders", []);
  const [cars, setCars] = usePersisted("bq_cars", []);
  const [restaurants, setRestaurants] = usePersisted("bq_restaurants", []);
  const [invoices, setInvoices] = usePersisted("bq_invoices", []);
  const [employees, setEmployees] = usePersisted("bq_employees", []);
  const [contracts, setContracts] = usePersisted("bq_contracts", []);
  const [cases, setCases] = usePersisted("bq_cases", []);
  const [approvalReqs, setApprovalReqs] = usePersisted("bq_approvals", []);
  const [expenses, setExpenses] = usePersisted("bq_expenses", []);
  const [iqamaAlerts, setIqamaAlerts] = usePersisted("bq_iqama_alerts", []);
  const [payrollRuns, setPayrollRuns] = usePersisted("bq_payroll_runs", []);
  const [deptChats, setDeptChats] = usePersisted("bq_dept_chats", []);
  const [repMessages, setRepMessages] = usePersisted("bq_rep_messages", []);
  const [leaderboardHistory, setLeaderboardHistory] = usePersisted("bq_leaderboard", []);
  const [auditLog, setAuditLog] = usePersisted("bq_audit_log", []);
  const DEFAULT_DEPT_PW = { gm: "1234", opsm: "1234", ops: "1234", fin: "1234", hr: "1234", legal: "1234" };
  const [deptPasswords, setDeptPasswords] = usePersisted("bq_dept_passwords", DEFAULT_DEPT_PW);
  const [deptSecurity, setDeptSecurity] = usePersisted("bq_dept_security", {});
  const [weekendFine, setWeekendFine] = usePersisted("bq_weekend_fine", 500);
  const [violationPenalty, setViolationPenalty] = usePersisted("bq_violation_penalty", 50);
  const [equipStatus, setEquipStatus] = usePersisted("bq_equip_status", {});
  const [tgaFines, setTgaFines] = usePersisted("bq_tga_fines", []);
  const [decisions, setDecisions] = usePersisted("bq_decisions", []);
  const [pricing, setPricing] = usePersisted("bq_pricing", { app: {}, rep: {} });
  const [repSettlements, setRepSettlements] = usePersisted("bq_rep_settlements", []);
  const [applications, setApplications] = usePersisted("bq_applications", []);
  const [repReceipts, setRepReceipts] = usePersisted("bq_rep_receipts", []);
  const [riderView, setRiderView] = useState("landing");
  const [charterClauses, setCharterClauses] = usePersisted("bq_charter_clauses", []);
  const [query, setQuery] = useState("");
  const dir = LANGS.find((l) => l.code === lang).dir;
  const role = ALL_ROLES.find((r) => r.id === roleId);
  const activeRep = role && role.id === "rep" ? reps.find((r) => r.nid === user) : null;

  useEffect(() => {
    if (!RIDER_MODE) return;
    try {
      document.title = "بوارق | المندوب";
      const add = (n, c) => { const m = document.createElement("meta"); m.name = n; m.content = c; document.head.appendChild(m); };
      add("theme-color", "#0E1424"); add("apple-mobile-web-app-capable", "yes"); add("mobile-web-app-capable", "yes"); add("apple-mobile-web-app-title", "بوارق");
    } catch (e) {}
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [dir, lang]);

  // مهلة جلسة أمنية: خروج تلقائي بعد 15 دقيقة خمول
  useEffect(() => {
    if (step !== "app") return;
    let timer;
    const IDLE_MS = 15 * 60 * 1000;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { setRoleId(null); setStep("gate"); }, IDLE_MS);
    };
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, reset));
    reset();
    return () => { clearTimeout(timer); events.forEach((ev) => window.removeEventListener(ev, reset)); };
  }, [step]);

  const IDLE_LIMIT_MS = 10 * 60 * 1000;
  const [sessionExpired, setSessionExpired] = useState(false);
  const idleTimer = useRef(null);
  useEffect(() => {
    if (step !== "app") return;
    const resetIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setRoleId(null); setStep("gate"); setSessionExpired(true);
      }, IDLE_LIMIT_MS);
    };
    const events = ["mousemove", "keydown", "touchstart", "click", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, resetIdle));
    resetIdle();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetIdle));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line
  }, [step]);

  const todayStr = () => riyadhToday();
  const needsShiftPick = role && role.id === "rep" && !shifts.some((s) => s.repId === user && s.date === todayStr());

  return (
    <div dir={dir} className={`bq min-h-screen w-full ${reduce ? "reduce" : ""}`}>
      <style>{CSS}</style>
      {(repsSyncStatus === "error" || repsSyncStatus === "saveError") && (
        <div className="fixed top-0 inset-x-0 z-[999] px-4 py-3 flex items-center justify-center gap-2.5 text-center"
          style={{ background: "#D6584D", color: "#fff" }}>
          <AlertTriangle size={16} className="shrink-0" />
          <span className="text-[12.5px] font-bold">
            {repsSyncStatus === "saveError"
              ? (lang === "ar" ? "⚠️ فشل حفظ آخر تعديل بقاعدة البيانات فعلياً! أعد تحميل الصفحة وتأكد قبل ما تكمل، وجرّب تسويها مرة ثانية."
                : "⚠️ The last change failed to save to the database! Reload and verify before continuing, then try again.")
              : (lang === "ar" ? "تعذّر الاتصال بقاعدة البيانات — البيانات المعروضة قد لا تكون محدّثة. لا تعدّل أي شي الآن، وأعد تحميل الصفحة بعد دقيقة."
                : "Could not reach the database — data shown may be stale. Don't make changes now; reload the page in a minute.")}
          </span>
        </div>
      )}
      {step === "lang" && <LangScreen lang={lang} setLang={setLang} next={() => setStep("gate")} />}
      {step === "gate" && RIDER_MODE && riderView === "landing" && <RiderLanding lang={lang} setLang={setLang} reps={reps} pricing={pricing} go={setRiderView} />}
      {step === "gate" && RIDER_MODE && riderView === "apply" && <RiderApply lang={lang} reps={reps} applications={applications} setApplications={setApplications} go={setRiderView} />}
      {step === "gate" && RIDER_MODE && riderView === "login" && (
        <RiderLogin lang={lang} setLang={setLang} err={loginErr} setErr={setLoginErr} onBack={() => setRiderView("landing")}
          onRep={(nid, pass) => {
            const rec = reps.find((r) => r.nid === nid.trim());
            if (!rec || rec.status !== "active") { setLoginErr(EX[lang].errRepNotActive); return; }
            if (rec.password && rec.password !== pass) { setLoginErr(EX[lang].errRepWrongPass); return; }
            setLoginErr(""); setRoleId("rep"); setUser(nid.trim()); setStep("app"); setSessionExpired(false);
          }} />
      )}
      {step === "gate" && !RIDER_MODE && (
        <DeptGate lang={lang} setLang={setLang} reps={reps} employees={employees} err={loginErr} setErr={setLoginErr} sessionExpired={sessionExpired}
          deptPasswords={deptPasswords} deptSecurity={deptSecurity} setDeptSecurity={setDeptSecurity}
          onEmployee={(id) => { setRoleId(id); setUser("BQ-" + id.toUpperCase()); setStep("app"); setSessionExpired(false); }}
          onRep={(nid, pass) => {
            const rec = reps.find((r) => r.nid === nid.trim());
            if (!rec || rec.status !== "active") { setLoginErr(EX[lang].errRepNotActive); return; }
            if (rec.password && rec.password !== pass) { setLoginErr(EX[lang].errRepWrongPass); return; }
            setLoginErr(""); setRoleId("rep"); setUser(nid.trim()); setStep("app"); setSessionExpired(false);
          }} />
      )}
      {step === "app" && role && role.id === "rep" && needsShiftPick && (
        <ShiftPickScreen lang={lang} rep={activeRep} onConfirm={(start, end) => {
          setShifts((prev) => [...prev, { repId: user, date: todayStr(), start, end, loggedAt: riyadhNow().toISOString() }]);
        }} />
      )}
      {step === "app" && role && !(role.id === "rep" && needsShiftPick) && (
        <Shell lang={lang} setLang={setLang} role={role} user={user} activeRep={activeRep} reduce={reduce} setReduce={setReduce}
          reps={reps} setReps={setReps} reports={reports} setReports={setReports}
          tickets={tickets} setTickets={setTickets} circulars={circulars} setCirculars={setCirculars}
          attendance={attendance} setAttendance={setAttendance} shifts={shifts} setShifts={setShifts}
          orders={orders} setOrders={setOrders} cars={cars} setCars={setCars}
          restaurants={restaurants} setRestaurants={setRestaurants} invoices={invoices} setInvoices={setInvoices}
          employees={employees} setEmployees={setEmployees} contracts={contracts} setContracts={setContracts}
          cases={cases} setCases={setCases} approvalReqs={approvalReqs} setApprovalReqs={setApprovalReqs}
          expenses={expenses} setExpenses={setExpenses}
          iqamaAlerts={iqamaAlerts} setIqamaAlerts={setIqamaAlerts} payrollRuns={payrollRuns} setPayrollRuns={setPayrollRuns}
          deptChats={deptChats} setDeptChats={setDeptChats} repMessages={repMessages} setRepMessages={setRepMessages}
          leaderboardHistory={leaderboardHistory} setLeaderboardHistory={setLeaderboardHistory}
          auditLog={auditLog} setAuditLog={setAuditLog}
          weekendFine={weekendFine} setWeekendFine={setWeekendFine} charterClauses={charterClauses} setCharterClauses={setCharterClauses}
          violationPenalty={violationPenalty} setViolationPenalty={setViolationPenalty}
          deptPasswords={deptPasswords} setDeptPasswords={setDeptPasswords} deptSecurity={deptSecurity} setDeptSecurity={setDeptSecurity}
          equipStatus={equipStatus} setEquipStatus={setEquipStatus} tgaFines={tgaFines} setTgaFines={setTgaFines}
          decisions={decisions} setDecisions={setDecisions}
          pricing={pricing} setPricing={setPricing} repSettlements={repSettlements} setRepSettlements={setRepSettlements}
          applications={applications} setApplications={setApplications} repReceipts={repReceipts} setRepReceipts={setRepReceipts}
          query={query} setQuery={setQuery}
          onSwitch={() => setStep("gate")} onLogout={() => { setRoleId(null); setStep("gate"); }} />
      )}
    </div>
  );
}
