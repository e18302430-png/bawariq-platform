import React, { useState, useEffect, useRef, useMemo } from "react";
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
  HandCoins, ShieldAlert, Sparkles, Award, Rocket, Zap, Radio, ChevronLeft, Trophy, Medal, Plane, Volume2, VolumeX,
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
      compliance: "الالتزام", approvals: "الموافقات", reports: "تقارير المناديب", settings: "الإعدادات",
      hiring: "توظيف المناديب", shifts: "أداء المناديب", tickets: "التذاكر", circulars: "التعاميم", pulse: "نبض المناديب", iqama: "الإقامات", payrollRuns: "مسيرات الرواتب", chat: "المراسلات", messages: "رسائل الإدارة", leaderboard: "لوحة الصدارة", audit: "سجل التتبع", hall: "قاعة المشاهير", charter: "اللائحة الداخلية", checklist: "قائمة التحقق", growth: "نمو الشركة", security: "الأمان", permissions: "خريطة الصلاحيات", mystory: "قصتي مع بوارق", invAnalysis: "تحليل الفواتير", equipCompliance: "الامتثال والمعدات" },
    k: { orders: "طلبات اليوم", avgTime: "متوسط التوصيل", onTime: "التوصيل في الوقت",
      activeReps: "مناديب نشطون", partners: "مطاعم شريكة", rating: "تقييم العملاء",
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
      on_shift: "في الخدمة", off_shift: "خارج الخدمة", maint: "في الصيانة", idle: "متوقفة" },
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
      compliance: "Compliance", approvals: "Approvals", reports: "Rider Reports", settings: "Settings",
      hiring: "Rep Hiring", shifts: "Rep Performance", tickets: "Tickets", circulars: "Circulars", pulse: "Rep Pulse", iqama: "Residency", payrollRuns: "Payroll Runs", chat: "Messaging", messages: "Messages", leaderboard: "Leaderboard", audit: "Audit Log", hall: "Hall of Fame", charter: "Internal Charter", checklist: "Launch Checklist", growth: "Company Growth", security: "Security", permissions: "Permissions Map", mystory: "My Story", invAnalysis: "Invoice Analysis", equipCompliance: "Equipment Compliance" },
    k: { orders: "Orders today", avgTime: "Avg. delivery", onTime: "On-time delivery",
      activeReps: "Active reps", partners: "Partner restaurants", rating: "Customer rating",
      cod: "Cash collected", cancel: "Cancellation rate", revenue: "Revenue", profit: "Net profit",
      expenses: "Expenses", head: "Headcount", attend: "Attendance rate", hires: "New hires",
      contracts: "Active contracts", cases: "Open cases", expiring: "Expiring soon",
      cars: "Delivery cars", carsShift: "Active cars", carsMaint: "In service",
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
      on_shift: "Active", off_shift: "Inactive", maint: "In service", idle: "Idle" },
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
      compliance: "ضابطے", approvals: "منظوریاں", reports: "نمائندہ رپورٹس", settings: "سیٹنگز",
      hiring: "نمائندہ بھرتی", shifts: "نمائندہ کارکردگی", tickets: "ٹکٹس", circulars: "سرکلرز", pulse: "نمائندہ نبض", iqama: "اقامہ", payrollRuns: "تنخواہ مسیر", chat: "پیغام رسانی", messages: "پیغامات", leaderboard: "لیڈر بورڈ", audit: "آڈٹ لاگ", hall: "شہرت کا ہال", charter: "اندرونی ضابطہ", checklist: "لانچ چیک لسٹ", growth: "کمپنی کی ترقی", security: "سیکیورٹی", permissions: "اختیارات کا نقشہ", mystory: "میری کہانی", invAnalysis: "انوائس تجزیہ", equipCompliance: "سازوسامان کی تعمیل" },
    k: { orders: "آج کے آرڈرز", avgTime: "اوسط ڈیلیوری", onTime: "وقت پر ڈیلیوری",
      activeReps: "فعال نمائندے", partners: "شراکت دار ریستوران", rating: "کسٹمر ریٹنگ",
      cod: "وصول شدہ رقم", cancel: "منسوخی کی شرح", revenue: "آمدنی", profit: "خالص منافع",
      expenses: "اخراجات", head: "کل ملازمین", attend: "حاضری کی شرح", hires: "نئی بھرتیاں",
      contracts: "فعال معاہدے", cases: "کھلے مقدمات", expiring: "جلد ختم ہونے والے",
      cars: "ڈیلیوری گاڑیاں", carsShift: "فعال گاڑیاں", carsMaint: "مرمت میں",
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
      on_shift: "فعال", off_shift: "غیر فعال", maint: "مرمت میں", idle: "کھڑی" },
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
    nav: ["overview", "decisions", "invoices", "expenses", "repAccounting", "dailyLedger", "receiptsAdmin", "payrollRuns", "equipCompliance", "growth", "checklist", "pulse", "audit", "permissions", "tickets", "chat", "circulars", "attendance", "settings", "inbox", "copilot", "perfBoard", "walletAdmin", "incidents", "leavesAdmin", "settleFlow", "crm", "snapshots", "retention", "referrals", "teams", "appAvail", "cockpit", "whatIf", "closeList", "cashflow", "perfPlans", "coverage", "empFile", "offboard"] },
  { id: "opsm", icon: Navigation, accent: "#5BC8E8", glow: "91,200,232", staff: 12, shape: "hex",
    ar: { t: "مدير التشغيل", d: "توزيع الأحياء وأداء المناديب والسيارات" },
    en: { t: "Operations Manager", d: "Zone coverage, rep and car performance" },
    ur: { t: "آپریشنز منیجر", d: "علاقے، نمائندے اور گاڑیوں کی کارکردگی" },
    nav: ["overview", "pulse", "shifts", "cars", "hiring", "security", "audit", "permissions", "tickets", "chat", "circulars", "attendance", "settings", "inbox", "copilot", "dayOps", "perfBoard", "incidents", "leavesAdmin", "trainingAdmin", "pipeline", "settleFlow", "retention", "referrals", "teams", "appAvail", "perfPlans", "coverage", "offboard"] },
  { id: "ops", icon: UtensilsCrossed, accent: "#FF9153", glow: "255,145,83", staff: 34, shape: "diamond",
    ar: { t: "إدارة التشغيل", d: "غرفة الطلبات: الإسناد والمتابعة اللحظية" },
    en: { t: "Operations", d: "Order room: dispatching and live tracking" },
    ur: { t: "آپریشنز شعبہ", d: "آرڈر روم: تقسیم اور لائیو ٹریکنگ" },
    nav: ["overview", "pulse", "shifts", "cars", "tickets", "chat", "permissions", "attendance", "settings", "inbox", "dayOps", "perfBoard", "incidents", "leavesAdmin", "retention", "teams", "perfPlans", "coverage"] },
  { id: "fin", icon: Wallet, accent: "#8B9BF7", glow: "139,155,247", staff: 9, shape: "circle",
    ar: { t: "الإدارة المالية", d: "عمولات المطاعم والتحصيل النقدي والرواتب" },
    en: { t: "Finance", d: "Restaurant commissions, cash collection, payroll" },
    ur: { t: "مالیات", d: "ریستوران کمیشن، نقد وصولی اور تنخواہ" },
    nav: ["overview", "repAccounting", "dailyLedger", "receiptsAdmin", "expenses", "payrollRuns", "tickets", "chat", "permissions", "attendance", "settings", "inbox", "walletAdmin", "settleFlow", "perfBoard", "crm", "referrals", "closeList", "cashflow", "whatIf", "offboard"] },
  { id: "hr", icon: Users, accent: "#C58BF2", glow: "197,139,242", staff: 8, shape: "shield",
    ar: { t: "الموارد البشرية", d: "المناديب والتوظيف والتطوير وملفات الموظفين" },
    en: { t: "Human Resources", d: "Reps, hiring, development and staff files" },
    ur: { t: "انسانی وسائل", d: "نمائندے، بھرتی، تربیت اور عملے کی فائلیں" },
    nav: ["overview", "hiring", "repFiles", "employees", "iqama", "attendance", "tickets", "chat", "circulars", "permissions", "settings", "inbox", "pipeline", "trainingAdmin", "leavesAdmin", "retention", "referrals", "teams", "appAvail", "perfPlans", "coverage", "empFile", "offboard"] },
  { id: "legal", icon: Scale, accent: "#E2789E", glow: "226,120,158", staff: 4, shape: "shieldTall",
    ar: { t: "الشؤون القانونية", d: "عقود المطاعم والمخالفات والالتزام" },
    en: { t: "Legal Affairs", d: "Restaurant contracts, violations, compliance" },
    ur: { t: "قانونی امور", d: "ریستوران معاہدے، خلاف ورزیاں اور ضابطے" },
    nav: ["overview", "charter", "contracts", "cases", "tickets", "compliance", "chat", "circulars", "permissions", "attendance", "settings", "inbox", "incidents", "crm"] },
];
const ADVISOR_ROLE = { id: "advisor", icon: Scale, accent: "#D8B4FE", glow: "216,180,254", staff: 2, shape: "shieldTall",
  ar: { t: "هيئة المستشارين", d: "الحلقة الوصل الحصرية مع المدير العام — اعتماد القرارات الاستراتيجية" },
  en: { t: "Advisory Board", d: "Exclusive link with the General Manager — strategic decision approval" },
  ur: { t: "مشاورتی بورڈ", d: "جنرل منیجر کے ساتھ خصوصی رابطہ — اسٹریٹجک فیصلوں کی منظوری" },
  nav: ["boardCouncil", "decisions", "repAccounting", "payrollRuns", "invoices", "expenses"] };
const REP = {
  id: "rep", icon: Car, accent: "#3FD8B4", glow: "63,216,180", staff: 128, shape: "chevron",
  ar: { t: "مندوب توصيل", d: "طلبات اليوم وإثبات التسليم" },
  en: { t: "Delivery Rep", d: "Today's orders and proof of delivery" },
  ur: { t: "ڈیلیوری نمائندہ", d: "آج کے آرڈرز اور ثبوتِ ترسیل" },
  nav: ["riderHome", "coach", "myEarnings", "myScore", "myWallet", "myDaily", "academy", "myLeave", "reportInc", "support", "myRefer", "teams", "riderReceipts", "mystory", "riderWelcome", "messages", "tickets", "circulars", "settings"],
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
const BLANK_PRICE = { mode: "unit", perOrder: "", fixedMonthly: 0, ordersBase: "", ordersTarget: "", perOrderDelta: "", perOrderShort: "", belowRate: "", tierCalc: "all", scope: "rider", tiersV: 2, tiers: [{ from: 1, to: "", rate: "" }] };
const getAppPrice = (pricing, appId) => (pricing && pricing.app && pricing.app[appId]) || null;
const getRepPrice = (pricing, appId) => (pricing && pricing.rep && pricing.rep[appId]) || null;
const r2 = (n) => Math.round((+n || 0) * 100) / 100;
// شرائح "من طلب رقم X إلى طلب رقم Y بسعر Z" — الحقل to الفارغ = فما فوق. البيانات القديمة (حدود فقط) تُحوَّل تلقائياً.
function tiersForm(p) {
  const raw = p && p.tiers && p.tiers.length ? p.tiers : [{ from: 1, to: "", rate: "" }];
  if (p && p.tiersV === 2) return raw;
  const s = [...raw].sort((a, b) => (+a.from || 0) - (+b.from || 0));
  return s.map((x, i) => ({ from: (+x.from || 0) + 1, to: i + 1 < s.length ? (+s[i + 1].from || 0) : "", rate: x.rate }));
}
function tiersN(p) {
  return tiersForm(p).filter((x) => x.rate !== "" && x.rate != null && x.from !== "" && x.from != null)
    .map((x) => ({ from: Math.max(1, +x.from || 1), to: x.to === "" || x.to == null ? Infinity : +x.to, rate: +x.rate || 0 }))
    .sort((a, b) => a.from - b.from);
}
// أخطاء الشرائح: first = لا تبدأ من 1 · gap = فجوة بين شريحتين · overlap = تداخل · open = شريحة مفتوحة في الوسط · bad = "إلى" أصغر من "من"
function tierIssues(p) {
  const rows = tiersForm(p);
  const out = new Set();
  if (!rows.length || rows.some((x) => x.rate === "" || x.rate == null || x.from === "" || x.from == null)) out.add("empty");
  const t = tiersN(p);
  t.forEach((x, i) => {
    if (x.to < x.from) out.add("bad");
    const nx = t[i + 1];
    if (nx) {
      if (x.to === Infinity) out.add("open");
      else if (nx.from > x.to + 1) out.add("gap");
      else if (nx.from <= x.to) out.add("overlap");
    }
  });
  if (t.length && t[0].from !== 1) out.add("first");
  return [...out];
}
function validPrice(p) {
  if (!p) return false;
  if (p.mode === "target") return +p.ordersBase > 0 && +p.ordersTarget > 0 && p.perOrderDelta !== "";
  if (p.mode === "tiers") return tiersN(p).length > 0 && tierIssues(p).length === 0;
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
    const diff = orders - n(p.ordersTarget) * f;
    // اتفاق المندوب: دون الهدف يُحسب كل طلب بسعر ثابت (belowRate) ولا راتب ثابت — وعند بلوغ الهدف: الراتب + الزائد
    if (hasBelow(p) && diff < 0) o = orders * n(p.belowRate);
    else o = n(p.ordersBase) * f + diff * (diff >= 0 || p.perOrderShort === "" || p.perOrderShort == null ? n(p.perOrderDelta) : n(p.perOrderShort));
  } else if (p.mode === "tiers") {
    const tiers = tiersN(p);
    if (p.tierCalc === "all") {
      // كل الطلبات بسعر الشريحة التي وصل إليها إجمالي الطلبات (مثل لوكيت: 500 طلب × 16.50). فوق آخر شريحة: سعر آخر شريحة
      const t = tiers.find((x) => orders >= x.from && orders <= x.to) || (tiers.length && orders > tiers[tiers.length - 1].to ? tiers[tiers.length - 1] : tiers[0]);
      o = t ? orders * t.rate : 0;
    } else tiers.forEach((tr, i) => {
      const hi = Math.min(tr.to, i + 1 < tiers.length ? tiers[i + 1].from - 1 : Infinity);
      o += Math.max(0, Math.min(orders, hi) - (tr.from - 1)) * tr.rate;
    });
  } else {
    o = orders * n(p.perOrder);
  }
  const fixed = n(p.fixedMonthly) * f;
  return { orders: r2(o), fixed, total: Math.max(0, r2(o + fixed)), configured: true };
}
const hasBelow = (p) => p && p.belowRate !== "" && p.belowRate != null && +p.belowRate > 0;
// تفصيل الحساب سطراً سطراً (للمحاسب): يطابق priceCalc تماماً. base = عدّاد موروث لحساب التطبيق (شرائح فقط)
function priceBreakdown(p, own, f, base) {
  const n = (v) => +v || 0; f = f || 1; base = base || 0; const lines = [];
  if (!p) return { lines, total: 0, known: false };
  if (!own) return { lines, total: 0, known: true };
  if (p.mode === "target") {
    const T = n(p.ordersTarget) * f, diff = own - T;
    const rate = diff >= 0 || p.perOrderShort === "" || p.perOrderShort == null ? n(p.perOrderDelta) : n(p.perOrderShort);
    if (hasBelow(p) && diff < 0) lines.push({ k: "below", qty: own, rate: n(p.belowRate), amt: r2(own * n(p.belowRate)), target: r2(T), f });
    else lines.push({ k: "base", amt: r2(n(p.ordersBase) * f), f, target: r2(T) });
    if (!(hasBelow(p) && diff < 0) && diff !== 0) lines.push({ k: diff > 0 ? "extra" : "short", qty: Math.abs(r2(diff)), rate, amt: r2(diff * rate) });
  } else if (p.mode === "tiers" && p.tierCalc === "all") {
    const tot = priceCalc(p, base + own, 1).orders, t0 = base ? priceCalc(p, base, 1).orders : 0;
    const rate = (base + own) > 0 ? r2(tot / (base + own)) : 0;
    lines.push({ k: "tierAll", qty: base + own, rate, amt: r2(tot) });
    if (base) lines.push({ k: "adj", amt: -r2(t0), base });
  } else if (p.mode === "tiers") {
    const ts = tiersN(p);
    ts.forEach((tr, i) => {
      const hi = Math.min(tr.to, i + 1 < ts.length ? ts[i + 1].from - 1 : Infinity);
      const q = Math.max(0, Math.min(hi, base + own) - Math.max(tr.from - 1, base));
      if (q > 0) lines.push({ k: "tier", from: tr.from, to: tr.to, qty: q, rate: tr.rate, amt: r2(q * tr.rate) });
    });
  } else lines.push({ k: "unit", qty: own, rate: n(p.perOrder), amt: r2(own * n(p.perOrder)) });
  if (n(p.fixedMonthly) && !base) lines.push({ k: "fixed", amt: r2(n(p.fixedMonthly) * f), f });
  return { lines, total: Math.max(0, r2(lines.reduce((a, x) => a + x.amt, 0))), known: true };
}
// أرباح مندوب من الإدخال اليومي للمشرف (تُجمَّع حسب التطبيق ثم تُسعَّر بتسعيرة المندوب لذلك التطبيق)
// rep.inherit = عدّاد شريحة التطبيق (الشركة) يكمل من عدد من سبقه — داخلي للشركة فقط. أجر المندوب نفسه يبدأ من أول طلب له ولا يتأثر.
function payWithBase(price, own, base, f) {
  if (!price || !own) return priceCalc(price, own, f).total;
  if (!base || price.mode !== "tiers") return priceCalc(price, own, f).total;
  const a = priceCalc(price, base + own, 1).orders - priceCalc(price, base, 1).orders;
  return Math.max(0, r2(a + (+price.fixedMonthly || 0) * (f || 1)));
}
function repMonthCalc(entries, rep, pricing, weekendFine, violationPenalty, f, month) {
  const byApp = {};
  entries.forEach((e) => {
    const a = e.app || rep.app || "hs";
    const g = byApp[a] || (byApp[a] = { orders: 0, hours: 0 });
    g.orders += e.orders || 0; g.hours += e.hours || 0;
  });
  if (month && rep && rep.inherit && rep.inherit.month === month && byApp[rep.inherit.app]) byApp[rep.inherit.app].base = +rep.inherit.orders || 0;
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
    g.pay = priceCalc(price, g.orders, c.f).total; // أجر المندوب دائماً من أول طلب له — العدّاد الموروث (g.base) للشركة فقط
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
let DAILY_CTX = [];
function computeSettlement(month, reps, reports, pricing, rawInputs, weekendFine, violationPenalty, expenses, receipts, daily) {
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
    let c = repMonthCalc(entries, r, pricing, weekendFine, violationPenalty, f, month);
    const recOrders = (c.byApp[r.app] || {}).orders || 0;
    let source = "daily", appAmtAuto = c.appAuto;
    if (row) {
      source = "invoice";
      matched[r.app] = (matched[r.app] || new Set()); matched[r.app].add(row.id);
      const byApp = { ...c.byApp, [r.app]: { orders: row.orders, hours: (c.byApp[r.app] || {}).hours || 0, base: (c.byApp[r.app] || {}).base || 0 } };
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
    const dl = dailyTotals(daily, r.id, month);
    const reimb = r2((receipts || []).filter((q) => q.repId === r.id && q.status === "approved" && (q.date || "").startsWith(month)).reduce((sum, q) => sum + (+q.amount || 0), 0));
    repLines.push({ repId: r.id, repApp: r.app, srcF: row ? 1 : f, riderId: rid, name: r.ar, en: r.en, empType: r.empType, app: c.main, byApp: c.byApp, source, unpriced: c.unpriced, baseOrders: (c.byApp[c.main] || {}).base || 0, baseFrom: (r.inherit && r.inherit.month === month) ? r.inherit.fromName : null,
      orders: c.orders, recOrders, invOrders: row ? row.orders : null, invNet: row ? row.net : null, hours: c.hours,
      gross: c.gross, weekendCount: c.weekendCount, appCount: c.appCount, weekendAmt, appAmt, manualAdds: adds, manualDeds: deds, totalDed,
      reimb, net: r2(c.gross + adds + reimb - totalDed), dailyAdv: dl.advBal, dailyCash: dl.gap, dailyDed: r2(dl.advBal + dl.gap), payable: r2(c.gross + adds + reimb - totalDed - dl.advBal - dl.gap) });
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
  // إيراد الشركة عن كل مندوب: شرائح لوكيت تُحسب على طلبات حسابه هو (إن كان النطاق "لكل مندوب")، أو من فاتورة التطبيق، أو بحصته من الإيراد
  const perRiderTiers = (a) => { const pp = getAppPrice(pricing, a); return !!pp && pp.mode === "tiers" && pp.scope !== "total"; };
  repLines.forEach((l) => {
    l.detail = Object.keys(l.byApp).map((a) => {
      const g = l.byApp[a], ap = getAppPrice(pricing, a), rp = getRepPrice(pricing, a); const fa = a === l.repApp ? l.srcF : f;
      const cost = priceBreakdown(rp, g.orders, fa, 0);
      let rev, est = 0;
      const sharedAgg = agg[a] ? (stm[a] ? stm[a].orders : agg[a].orders) : 0;
      if (perRiderTiers(a)) { rev = priceBreakdown(ap, g.orders, fa, g.base || 0); est = rev.total; }
      else if (ap && sharedAgg > 0) { const tot = priceCalc(ap, sharedAgg, stm[a] ? 1 : f).total; est = r2(tot * (g.orders / sharedAgg)); rev = { lines: [{ k: "share", qty: g.orders, of: sharedAgg, amt: est }], total: est, known: true }; }
      else rev = { lines: [], total: 0, known: false };
      if (l.source === "invoice" && a === l.repApp) rev = { lines: [{ k: "invoice", amt: l.invNet }], total: l.invNet, known: true };
      return { app: a, orders: g.orders, base: g.base || 0, f: fa, cost, rev, est, scope: perRiderTiers(a) ? "rider" : "total" };
    });
    l.rev = r2(l.detail.reduce((x, d) => x + d.rev.total, 0)); l.revKnown = l.detail.length > 0 && l.detail.every((d) => d.rev.known);
    l.profit = r2(l.rev - l.net);
  });
  const appLines = Object.keys(agg).map((a) => {
    const g = agg[a], st = stm[a];
    const orders = st ? st.orders : g.orders;
    const appPrice = getAppPrice(pricing, a);
    const calc = perRiderTiers(a) ? r2(repLines.reduce((x, l) => x + (((l.detail || []).find((d) => d.app === a) || {}).est || 0), 0)) : priceCalc(appPrice, orders, st ? 1 : f).total;
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
    dailyDed: r2(repLines.reduce((s, l) => s + (l.dailyDed || 0), 0)),
    payable: r2(repLines.reduce((s, l) => s + (l.payable != null ? l.payable : l.net), 0)),
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
    { icon: "Radio", t: "نبض المناديب المباشر", d: "تحضير يومي من المشرف: كم حضر وكم غاب وسبب الغياب — ويرتبط بدرجة الالتزام." },
    { icon: "ClipboardList", t: "سجل التتبع", d: "كل إجراء حساس (كلمات مرور، رواتب، تذاكر) مسجّل بالوقت والمسؤول." },
    { icon: "Download", t: "تصدير Excel", d: "الرواتب والحضور والتقارير — ملف Excel حقيقي بضغطة واحدة." },
    { icon: "MessageSquare", t: "المراسلات الداخلية", d: "شات بين الإدارات، ورسائل للمناديب بخاصية تم الاطلاع." },
    { icon: "ShieldAlert", t: "تنبيهات الإقامات", d: "متابعة تلقائية لتواريخ انتهاء الإقامة وإرسال الإنذارات." },
  ],
  en: [
    { icon: "Trophy", t: "Monthly Leaderboard", d: "Top 3 reps each month with automatic rewards and a free Umrah chance." },
    { icon: "Radio", t: "Live Rep Pulse", d: "Daily roll call by the supervisor: who attended, who was absent and why — linked to the commitment score." },
    { icon: "ClipboardList", t: "Audit Log", d: "Every sensitive action (passwords, payroll, tickets) recorded with time and owner." },
    { icon: "Download", t: "Excel export", d: "Payroll, attendance and reports — a real Excel file in one click." },
    { icon: "MessageSquare", t: "Internal messaging", d: "Chat between departments, and one-way messages to reps with a seen receipt." },
    { icon: "ShieldAlert", t: "Residency alerts", d: "Automatic tracking of Iqama expiry dates with timely warnings." },
  ],
  ur: [
    { icon: "Trophy", t: "ماہانہ لیڈر بورڈ", d: "ہر ماہ کے سرِفہرست 3 نمائندے، خودکار انعامات اور مفت عمرہ کا موقع۔" },
    { icon: "Radio", t: "نمائندوں کی براہ راست نبض", d: "سپروائزر کی روزانہ حاضری: کون حاضر، کون غیر حاضر اور وجہ۔" },
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
  const stateRef = useRef(initial);
  const lastRawRef = useRef(null);
  useEffect(() => {
    let alive = true;
    let attempt = 0;
    const tryLoad = async () => {
      attempt++;
      try {
        const r = await window.storage.get(key, true);
        if (!alive) return;
        const v0 = r && r.value ? JSON.parse(r.value) : initial;
        stateRef.current = v0; lastRawRef.current = r && r.value ? r.value : null;
        setState(v0);
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
  // طابور حفظ مرتّب: كل حفظ ينتظر اللي قبله، وإعادة المحاولة لا تكتب نسخة قديمة فوق أحدث
  const seqRef = useRef(0);
  const chainRef = useRef(Promise.resolve());
  const pendingRef = useRef(0);
  const syncStatusRef = useRef(syncStatus);
  useEffect(() => { syncStatusRef.current = syncStatus; }, [syncStatus]);
  // كل تعديل دالّي يُطبَّق داخل الطابور على «آخر نسخة من القاعدة» (قراءة ← تعديل ← كتابة)
  // فلا يمسح تعديل مستخدم آخر كتب في نفس المفتاح في الأثناء.
  const update = (updater) => {
    if (!ready.current) {
      console.warn(`bq: تجاهلت محاولة حفظ "${key}" قبل اكتمال أول تحميل ناجح — حماية من الكتابة فوق بيانات حقيقية.`);
      return;
    }
    const isFn = typeof updater === "function";
    const next = isFn ? updater(stateRef.current) : updater;
    stateRef.current = next;
    setState(next);
    const mySeq = ++seqRef.current;
    pendingRef.current++;
    chainRef.current = chainRef.current.then(async () => {
      try {
        let out = next;
        const writeOnce = async (raw, ver) => {
          // ver !== undefined → كتابة مشروطة (Compare-and-Swap): تفشل بخطأ "conflict" إن كتب غيرك بعد قراءتنا
          if (ver !== undefined) return window.storage.set(key, raw, true, ver);
          return window.storage.set(key, raw, true);
        };
        for (let attempt = 1; attempt <= 6; attempt++) {
          let ver;
          if (isFn) {
            try {
              const r = await window.storage.get(key, true);
              if (r && r.value) { out = updater(JSON.parse(r.value)); ver = r.ver; }
              else out = next;
            } catch (e) {
              if (String(e && e.message || e).includes("not found")) { out = updater(initial); ver = null; }
              else out = next;
            }
          }
          const raw = JSON.stringify(out);
          try {
            await writeOnce(raw, isFn ? ver : undefined);
            lastRawRef.current = raw;
            if (syncStatusRef.current === "saveError") setSyncStatus("ready");
            if (mySeq === seqRef.current && out !== next) { stateRef.current = out; setState(out); }
            return;
          } catch (err) {
            if (String(err && err.message || err).includes("conflict") && attempt < 6) { await new Promise((r) => setTimeout(r, 40 * attempt + Math.random() * 120)); continue; }
            console.error(`bq: فشل حفظ "${key}" — محاولة ${attempt}`, err);
            if (attempt < 6) await new Promise((r) => setTimeout(r, Math.min(attempt, 3) * 800));
            else setSyncStatus("saveError");
          }
        }
      } finally { pendingRef.current--; }
    });
  };
  useEffect(() => { stateRef.current = state; }, [state]);
  // مزامنة: نسحب آخر نسخة من القاعدة كل 15 ثانية وعند العودة للتبويب، بشرط ما يكون عندنا حفظ معلّق
  useEffect(() => {
    if (syncStatus !== "ready") return;
    let alive = true;
    const pull = async () => {
      if (!alive || pendingRef.current > 0) return;
      try {
        const r = await window.storage.get(key, true);
        if (!alive || pendingRef.current > 0 || !r || !r.value) return;
        if (r.value !== lastRawRef.current) {
          lastRawRef.current = r.value;
          const v = JSON.parse(r.value);
          stateRef.current = v;
          setState(v);
        }
      } catch { /* تجاهل، المحاولة القادمة تعوّض */ }
    };
    const iv = setInterval(pull, 15000);
    const onVis = () => { if (document.visibilityState === "visible") pull(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, [syncStatus]);
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
    nationalId: "رقم الهوية / الإقامة", 
    ordersToday: "طلبات اليوم", doneToday: "تم التسليم", inRoute: "قيد التوصيل",
    distance: "المسافة المقطوعة", cash: "تحصيل نقدي", rating: "تقييمك", myRoute: "طلبات اليوم",
    pod: "تأكيد تسليم الطلب", accept: "قبول الطلب", pickup: "الاستلام من المطعم",
    leaveToday: "في إجازة اليوم", openRoles: "وظائف مفتوحة", docsExp: "مستندات تنتهي",
    winRate: "نسبة كسب القضايا", compScore: "مؤشر الالتزام",
    newOrder: "طلب جديد", addRest: "إضافة مطعم", addEmp: "إضافة موظف", upDoc: "رفع مستند", 
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
    repReportsT: "تقارير المناديب", 
    searchRep: "ابحث باسم المندوب أو رقم الجوال…", noReports: "لا توجد تقارير محفوظة بعد",
    savedBy: "حفظه", repsCount: "عدد المناديب", viewReport: "عرض التفاصيل", hideReport: "إخفاء التفاصيل",
    globalNoMatch: "لا توجد نتائج مطابقة", searchResults: "نتائج البحث",
    repPassword: "كلمة مرور مبدئية للمندوب", errRepPass: "أدخل كلمة مرور مبدئية (4 خانات على الأقل).",
    errRepNotActive: "بيانات الدخول غير صحيحة أو الحساب غير مفعّل بعد.",
    errRepWrongPass: "كلمة المرور غير صحيحة.", 
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
    onDutyLive: "متواجد الآن",  clockStatus: "حالة البصمة", staffMotivHeadline: "فريق واحد، هدف واحد",
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
    warnBefore: "متبقي", warnHours: "ساعة قبل الإغلاق التلقائي", 
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
    nationalId: "ID / Iqama number", 
    ordersToday: "Today's orders", doneToday: "Delivered", inRoute: "Out for delivery",
    distance: "Distance covered", cash: "Cash collected", rating: "Your rating", myRoute: "Today's orders",
    pod: "Confirm delivery", accept: "Accept order", pickup: "Pick up from restaurant",
    leaveToday: "On leave today", openRoles: "Open roles", docsExp: "Documents expiring",
    winRate: "Case win rate", compScore: "Compliance score",
    newOrder: "New order", addRest: "Add restaurant", addEmp: "Add employee", upDoc: "Upload document", 
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
    repReportsT: "Rep reports", 
    searchRep: "Search by rep name or phone…", noReports: "No saved reports yet",
    savedBy: "Saved by", repsCount: "Reps count", viewReport: "View details", hideReport: "Hide details",
    globalNoMatch: "No matching results", searchResults: "Search results",
    repPassword: "Initial rep password", errRepPass: "Enter an initial password (4+ characters).",
    errRepNotActive: "Invalid credentials or account not activated yet.",
    errRepWrongPass: "Incorrect password.", 
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
    onDutyLive: "On duty now",  clockStatus: "Clock status", staffMotivHeadline: "One team, one goal",
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
    lbFirstDesc: "Leading in both orders and distance", lbSecondDesc: "Most distance covered", lbThirdDesc: "Most disciplined — conduct, attendance and punctuality",
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
    warnBefore: "", warnHours: "h left before auto-close", 
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
    nationalId: "شناختی / اقامہ نمبر", 
    ordersToday: "آج کے آرڈرز", doneToday: "پہنچا دیے", inRoute: "راستے میں",
    distance: "طے شدہ فاصلہ", cash: "وصول شدہ رقم", rating: "آپ کی ریٹنگ", myRoute: "آج کے آرڈرز",
    pod: "ترسیل کی تصدیق", accept: "آرڈر قبول کریں", pickup: "ریستوران سے وصولی",
    leaveToday: "آج چھٹی پر", openRoles: "خالی عہدے", docsExp: "ختم ہونے والی دستاویزات",
    winRate: "مقدمات جیتنے کی شرح", compScore: "تعمیل اسکور",
    newOrder: "نیا آرڈر", addRest: "ریستوران شامل کریں", addEmp: "ملازم شامل کریں", upDoc: "دستاویز اپلوڈ", 
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
    repReportsT: "نمائندہ رپورٹس", 
    searchRep: "نمائندے کے نام یا فون سے تلاش کریں…", noReports: "ابھی کوئی رپورٹ محفوظ نہیں",
    savedBy: "محفوظ کردہ از", repsCount: "نمائندوں کی تعداد", viewReport: "تفصیل دیکھیں", hideReport: "تفصیل چھپائیں",
    globalNoMatch: "کوئی مماثل نتیجہ نہیں", searchResults: "تلاش کے نتائج",
    repPassword: "نمائندے کا ابتدائی پاس ورڈ", errRepPass: "ابتدائی پاس ورڈ درج کریں (کم از کم 4 حروف)۔",
    errRepNotActive: "غلط معلومات یا اکاؤنٹ ابھی فعال نہیں۔",
    errRepWrongPass: "غلط پاس ورڈ۔", 
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
    onDutyLive: "ابھی حاضر",  clockStatus: "حاضری کی حالت", staffMotivHeadline: "ایک ٹیم، ایک ہدف",
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
    lbFirstDesc: "آرڈرز اور فاصلے دونوں میں سرِفہرست", lbSecondDesc: "سب سے زیادہ فاصلہ", lbThirdDesc: "نظم و ضبط، حاضری اور وقت کی پابندی میں سب سے آگے",
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
    warnBefore: "باقی", warnHours: "گھنٹے خودکار بندش سے پہلے", 
    sessionExpiredMsg: "آپ کی نشست غیرفعالیت کی وجہ سے خودکار ختم ہو گئی — براہ کرم دوبارہ لاگ ان کریں۔",
    avgResolutionT: "شعبے کے مطابق ٹکٹ حل کرنے کا اوسط وقت",
    pacingT: "ہفتہ وار پیش بندی الرٹ", pacingSub: "ہر نمائندے کی کارکردگی متوقع رفتار کے مقابلے میں، مہینہ ختم ہونے سے پہلے سنبھالیں", pacingAllGood: "سب مقررہ رفتار پر ہیں 👍",
  },
};

/* ═══════════  حقل رقمي موحّد: يقبل الأرقام العربية (٠-٩) والفاصلة العشرية والآلاف، ولا يفقد المؤشر أثناء الكتابة  ═══════════ */
const NUM_DIG = { "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9", "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9" };
function cleanNum(v, neg) {
  let s = String(v == null ? "" : v).replace(/[٠-٩۰-۹]/g, (d) => NUM_DIG[d]).replace(/٫/g, ".").replace(/[,،٬\s]/g, "").replace(/[^0-9.\-]/g, "");
  const m = neg && s[0] === "-" ? "-" : "";
  s = s.replace(/-/g, "");
  const i = s.indexOf("."); if (i >= 0) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "");
  return m + s;
}
function NumInput({ value, onChange, min, max, step, ...rest }) {
  const neg = min === undefined || +min < 0;
  const [txt, setTxt] = useState(value == null ? "" : String(value));
  useEffect(() => { if ((Number(value) || 0) !== (Number(txt) || 0)) setTxt(value == null ? "" : String(value)); }, [value]); // eslint-disable-line
  return <input {...rest} type="text" inputMode="decimal" autoComplete="off" value={txt} onChange={(e) => {
    let c = cleanNum(e.target.value, neg); if (max !== undefined && max !== "" && c !== "" && +c > +max) c = String(max);
    setTxt(c); const out = c === "-" || c === "." || c === "-." ? "" : c;
    if (onChange) onChange({ target: { value: out }, currentTarget: { value: out } });
  }} />;
}

/* ═══════════  حقل إدخال  ═══════════ */
function GateField({ label, val, set, ph, Icon, type, accent, onEnter, af, tail }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold" style={{ color: "var(--muted)" }}>{label}</span>{tail}
      </span>
      <span className="flex items-center gap-2.5 rounded-xl px-3.5 py-3" style={{ background: "rgba(0,0,0,.28)", border: "1px solid var(--line)" }}>
        <Icon size={16} style={{ color: accent }} />
        {type === "number"
          ? <NumInput value={val} onChange={(e) => set(e.target.value)} placeholder={ph} autoFocus={af} onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
              className="num flex-1 bg-transparent border-0 outline-none text-[15px] min-w-0" style={{ color: "#12151D" }} />
          : <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} type={type} autoFocus={af}
              onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
              className="num flex-1 bg-transparent border-0 outline-none text-[15px] min-w-0" style={{ color: "#12151D" }} />}
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
function DeptGate({ lang, setLang, onEmployee, onRep, reps, employees, err: gateErr, setErr: setGateErr, sessionExpired, deptPasswords, deptSecurity, setDeptSecurity }) {
  const t = T[lang], x = EX[lang];
  const [open, setOpen] = useState(null);
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const [rep, setRep] = useState(false);
  const [nid, setNid] = useState(""); const [rpw, setRpw] = useState(""); const [rerr, setRerr] = useState("");
  const [busy, setBusy] = useState(false);
  const [supPick, setSupPick] = useState(null); // المشرف المختار في بوابة التشغيل
  const [viaDept, setViaDept] = useState(false);

  const pick = (id) => { setOpen(open === id ? null : id); setPw(""); setErr(""); setRep(false); setSupPick(null); setViaDept(false); };
  const goSup = () => {
    if (!supPick) return;
    const key = "emp:" + supPick.id;
    const sec = deptSecurity[key] || { fails: 0, locked: false };
    if (sec.locked) { setErr(x.deptLockedErr); return; }
    if (!supPick.password || pw !== supPick.password) {
      const fails = (sec.fails || 0) + 1, locked = fails >= 5;
      setDeptSecurity((prev) => ({ ...prev, [key]: { fails, locked } }));
      setErr(locked ? x.deptLockedErr : x.errPass);
      return;
    }
    setDeptSecurity((prev) => ({ ...prev, [key]: { fails: 0, locked: false } }));
    setErr(""); setBusy(true); setTimeout(() => onEmployee("ops", supPick), 400);
  };
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
                  {on && role.id === "ops" && !viaDept && (
                    <div className="drop px-5 pb-5">
                      <div className="pt-4" style={{ borderTop: `1px solid rgba(${role.glow},.25)` }}>
                        {!supPick ? (
                          <>
                            <p className="text-[11.5px] font-bold mb-2.5" style={{ color: role.accent }}>{RA[lang].opsPickSup}</p>
                            <div className="space-y-2">
                              {employees.filter((e) => e.dept === "ops" && e.status !== "suspended").map((e) => (
                                <button key={e.id} onClick={() => { setSupPick(e); setPw(""); setErr(""); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-start transition"
                                  style={{ background: "rgba(20,27,45,.04)", border: "1px solid var(--line)" }}>
                                  {e.photo ? <img src={e.photo} alt="" className="w-8 h-8 rounded-lg object-cover" /> : <span className="grid place-items-center w-8 h-8 rounded-lg" style={{ background: `rgba(${role.glow},.15)` }}><User size={15} style={{ color: role.accent }} /></span>}
                                  <span className="flex-1 text-[13px] font-bold">{e.name}</span>
                                  {e.isSupervisor && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `rgba(${role.glow},.14)`, color: role.accent }}>{RA[lang].supLabel}</span>}
                                  <ChevronRight size={14} style={{ color: role.accent }} />
                                </button>
                              ))}
                              {employees.filter((e) => e.dept === "ops" && e.status !== "suspended").length === 0 && (
                                <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{RA[lang].opsNoSup}</p>
                              )}
                            </div>
                            <button onClick={() => { setViaDept(true); setPw(""); setErr(""); }} className="mt-3 text-[10.5px] font-semibold" style={{ color: "var(--muted)" }}>{RA[lang].opsViaDept}</button>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-3">
                              <button onClick={() => { setSupPick(null); setPw(""); setErr(""); }} className="text-[11px] font-semibold" style={{ color: role.accent }}>‹ {t.back}</button>
                              <span className="text-[13px] font-bold">{supPick.name}</span>
                            </div>
                            <GateField label={RA[lang].supPass} val={pw} set={setPw} ph="••••••••" Icon={Lock} af type="password" accent={role.accent} onEnter={goSup} />
                            {err && <p className="mt-2.5 text-[11px] flex items-start gap-1.5" style={{ color: "#E8837A" }}><AlertTriangle size={13} className="mt-px shrink-0" />{err}</p>}
                            <div className="mt-3.5"><Btn variant="accent" accent={role.glow} full icon={Fingerprint} onClick={goSup}>{busy ? "…" : t.enter}</Btn></div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {on && (role.id !== "ops" || viaDept) && (
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
                <td key={i} className={`py-3 px-3 whitespace-nowrap group-hover:brightness-95 ${!bulkMode && i === 0 ? "rounded-s-2xl" : ""} ${!hasActions && i === r.cells.length - 1 ? "rounded-e-2xl" : ""}`} style={{ background: "var(--surface-1)" }}>{Cell({ c })}</td>
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
                {Cell({ c: { ...r.cells[0], strong: true } })}
              </span>
              <div className="flex items-center gap-2">
                {r.cells.find((c) => c.chip) && Cell({ c: r.cells.find((c) => c.chip) })}
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
                  <div className="truncate text-[12.5px]">{Cell({ c })}</div>
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

function Overview({ pricing, role, lang, reps, reports, orders, cars, invoices, contracts, cases, employees, expenses, restaurants, tickets, attendance, activeRep, approvalReqs }) {
  const t = T[lang], x = EX[lang], A = role.glow;
  const [customizing, setCustomizing] = useState(false);
  const [hiddenKpis, setHiddenKpis] = usePersonalList(`kpi_hidden_${role.id}`);


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

function AttendancePage({ lang, role, user, activeRep, attendance, setAttendance, employees, setAuditLog, actingEmployee }) {
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
      <Panel title={t.nav.attendance}
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



function MyStoryPage({ lang, role, activeRep, reports, leaderboardHistory, user, weekendFine, violationPenalty, payrollRuns }) {
  const t = T[lang], x = EX[lang];
  if (!activeRep) return <div className="space-y-4"><Panel title={x.myStoryT}><EmptyHint lang={lang} /></Panel></div>;

  const allEntries = [];
  reports.forEach((rp) => rp.entries.forEach((e) => { if (e.id === activeRep.id) allEntries.push({ ...e, date: rp.date }); }));
  const totalOrders = allEntries.reduce((a, e) => a + (e.orders || 0), 0);
  const totalHours = allEntries.reduce((a, e) => a + (e.hours || 0), 0);
  const monthsActive = new Set(allEntries.map((e) => e.date.slice(0, 7))).size;
  const joinDate = allEntries.length ? allEntries.map((e) => e.date).sort()[0] : null;

  const stats = [
    { icon: ShoppingBag, label: x.storyOrders, value: fmt(totalOrders) },
    { icon: Timer, label: x.storyHours, value: totalHours.toFixed(0) },
    { icon: CalendarClock, label: x.storyMonths, value: String(monthsActive) },
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
  const rewardFor = () => 0;
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
                    <NumInput value={r.salary} onChange={(e) => setAjeerAmounts((prev) => ({ ...prev, [r.repId]: +e.target.value }))}
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
                        <NumInput value={r.salary} onChange={(e) => setAjeerAmounts((prev) => ({ ...prev, [r.repId]: +e.target.value }))}
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
                        <NumInput value={officeAmounts[e.empId] ?? (e.salary || 0)} onChange={(ev) => setOfficeAmounts((prev) => ({ ...prev, [e.empId]: +ev.target.value }))}
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
                    <NumInput value={salaryInput} onChange={(e) => setSalaryInput(e.target.value)} placeholder="0"
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
              <NumInput value={fineInput} onChange={(e) => setFineInput(+e.target.value)}
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
    setReps((prev) => prev.map((r) => (r.id === id ? { ...r, status: "active", sup: chosenSup, startDate: r.startDate || riyadhToday() } : r)));
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

function ShiftsPage({ lang, role, reps, setReps, reports, setReports, goPage, employees, scopeSup }) {
  const t = T[lang], x = EX[lang];
  const ALL_SUP = supervisorsOf(employees);
  const SUP_LIST = scopeSup ? ALL_SUP.filter((s) => s.id === scopeSup) : ALL_SUP;
  const [sup, setSup] = useState((SUP_LIST[0] || ALL_SUP[0]).id);
  const [date, setDate] = useState(riyadhToday());
  const [saved, setSaved] = useState(false);
  const [dayApp, setDayApp] = useState({});

  const mineAll = reps.filter((r) => r.status === "active" && r.sup === sup);
  const mine = mineAll.filter((r) => r.empType !== "ajeer");
  const mineAjeer = mineAll.filter((r) => r.empType === "ajeer");
  const update = (id, field, val) => setReps((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val === "" ? 0 : +val } : r)));
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
              <NumInput value={r[f.k] ? r[f.k] : ""} placeholder="0" onChange={(e) => update(r.id, f.k, e.target.value)}
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
          {mine.length === 0 ? <EmptyHint lang={lang} /> : mine.map((r) => <React.Fragment key={r.id}>{RepRow({ r })}</React.Fragment>)}
        </div>

        <div className="mb-2.5 flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
          <span className="grid place-items-center w-6 h-6 rounded-lg" style={{ background: "rgba(228,184,92,.15)" }}><FileSignature size={12} style={{ color: "#B8862E" }} /></span>
          <p className="text-[12px] font-bold">{EMP_TYPES.ajeer[lang]}</p>
          <Chip tone="warn" sm>{mineAjeer.length}</Chip>
        </div>
        <div className="space-y-2.5">
          {mineAjeer.length === 0 ? <EmptyHint lang={lang} /> : mineAjeer.map((r) => <React.Fragment key={r.id}>{RepRow({ r })}</React.Fragment>)}
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
  reports, setReports, tickets, setTickets, circulars, setCirculars, attendance, setAttendance,
  orders, setOrders, cars, setCars, restaurants, setRestaurants, invoices, setInvoices,
  employees, setEmployees, contracts, setContracts, cases, setCases, approvalReqs, setApprovalReqs,
  expenses, setExpenses, iqamaAlerts, setIqamaAlerts, payrollRuns, setPayrollRuns,
  deptChats, setDeptChats, repMessages, setRepMessages, leaderboardHistory, setLeaderboardHistory, auditLog,
  deptPasswords, setDeptPasswords }) {
  const t = T[lang], x = EX[lang];
  const backupData = { reps, reports, tickets, circulars, attendance, orders, cars, restaurants, invoices,
    employees, contracts, cases, approvalReqs, expenses, iqamaAlerts, payrollRuns, deptChats, repMessages, leaderboardHistory, auditLog };
  const backupSetters = { reps: setReps, reports: setReports, tickets: setTickets, circulars: setCirculars,
    attendance: setAttendance, orders: setOrders, cars: setCars, restaurants: setRestaurants,
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
    tierFrom: "من طلب رقم", tierTo: "إلى طلب رقم", tierRate: "سعر الطلب (ريال)", addTier: "إضافة شريحة", tiersNote: "اكتب كل شريحة هكذا: من 1 إلى 249 = 13.50. الشريحة التالية تبدأ من 250. اترك «إلى» فارغاً في آخر شريحة (فما فوق).", andAbove: "فما فوق", tierTo2: "إلى",
    tierRow: (f, t, r, sar) => (t ? `من الطلب ${f} إلى ${t}: كل طلب ${r} ${sar}` : `من الطلب ${f} فما فوق: كل طلب ${r} ${sar}`),
    tierErr_empty: "أكمل الأرقام في كل شريحة", tierErr_bad: "رقم «إلى» يجب أن يكون أكبر من «من»", tierErr_gap: "توجد فجوة بين شريحتين — الشريحة التالية يجب أن تبدأ من (إلى + 1)", tierErr_overlap: "شريحتان متداخلتان — راجع الأرقام", tierErr_open: "شريحة «فما فوق» يجب أن تكون الأخيرة", tierErr_first: "أول شريحة يجب أن تبدأ من 1",
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
    tierFrom: "From order #", tierTo: "To order #", tierRate: "Price per order (SAR)", addTier: "Add tier", tiersNote: "Write each tier like: 1 to 249 = 13.50. The next tier starts at 250. Leave \"To\" empty on the last tier (and above).", andAbove: "and above", tierTo2: "to",
    tierRow: (f, t, r, sar) => (t ? `Orders ${f} to ${t}: ${r} ${sar} each` : `Orders ${f} and above: ${r} ${sar} each`),
    tierErr_empty: "Fill in every tier", tierErr_bad: "\"To\" must be larger than \"From\"", tierErr_gap: "Gap between two tiers — next tier must start at (To + 1)", tierErr_overlap: "Two tiers overlap", tierErr_open: "The \"and above\" tier must be last", tierErr_first: "First tier must start at 1",
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
    tierFrom: "آرڈر نمبر سے", tierTo: "آرڈر نمبر تک", tierRate: "فی آرڈر قیمت", addTier: "سلیب شامل کریں", tiersNote: "ہر سلیب ایسے لکھیں: 1 سے 249 = 13.50۔ اگلا سلیب 250 سے شروع ہوگا۔", andAbove: "اور اوپر", tierTo2: "تک",
    tierRow: (f, t, r, sar) => (t ? `آرڈر ${f} سے ${t}: ${r} ${sar} فی آرڈر` : `آرڈر ${f} اور اوپر: ${r} ${sar} فی آرڈر`),
    tierErr_empty: "ہر سلیب مکمل کریں", tierErr_bad: "\"تک\" کو \"سے\" سے بڑا ہونا چاہیے", tierErr_gap: "دو سلیبوں کے درمیان خلا ہے", tierErr_overlap: "دو سلیب آپس میں ملتے ہیں", tierErr_open: "\"اور اوپر\" سلیب آخری ہونا چاہیے", tierErr_first: "پہلا سلیب 1 سے شروع ہو",
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
Object.assign(RA.ar, { calcT: "طريقة احتساب الشرائح", calcAll: "كل الطلبات بسعر الشريحة التي وصل لها (مثال: 500 طلب × 16.50)", calcMarg: "كل شريحة على طلباتها فقط", calcNote: "أسلوب لوكيت: متى بلغ المندوب شريحة تُحسب كل طلباته بسعرها، لا الطلبات الزائدة فقط.", ordersBase: "الراتب الثابت عند تحقيق الهدف (ريال)", ordersTarget: "هدف الطلبات الشهري", perOrderDelta: "سعر الطلب الزائد عن الهدف (ريال)", perOrderShort: "خصم الطلب الناقص (قديم)", belowRate: "سعر الطلب إذا لم يبلغ الهدف (ريال) — يُحسب كل طلب بهذا السعر بدل الراتب الثابت",
  scopeT: "تُحسب الشرائح على", scopeRider: "كل مندوب على حدة (حسب طلبات حسابه في التطبيق)", scopeTotal: "إجمالي طلبات التطبيق كلها", scopeNote: "لوكيت وأغلب التطبيقات تحسب الشريحة على طلبات كل حساب مندوب وحده — اختر «كل مندوب على حدة».",
  colRev: "إيراد الشركة عنه", colProfit: "ربح الشركة منه", explain: "كيف حُسب؟" });
const RA_NEW_EN = { calcT: "How tiers are applied", calcAll: "All orders at the tier reached (e.g. 500 orders × 16.50)", calcMarg: "Each tier only on its own orders", calcNote: "Lockit-style: once the rider reaches a tier, ALL his orders are paid at that tier rate.", ordersBase: "Fixed salary when target is met (SAR)", ordersTarget: "Monthly orders target", perOrderDelta: "Price per order above target (SAR)", perOrderShort: "Deduction per short order (legacy)", belowRate: "Price per order if target is NOT reached (SAR) — replaces the fixed salary",
  scopeT: "Tiers are counted on", scopeRider: "Each rider separately (his own account orders)", scopeTotal: "Total orders of the whole app", scopeNote: "Most apps tier each rider account on its own — choose \"each rider\".",
  colRev: "Company revenue from him", colProfit: "Company profit from him", explain: "How is it computed?" };
Object.assign(RA.en, RA_NEW_EN); Object.assign(RA.ur, RA_NEW_EN);
Object.assign(RA.ar, { ldOpenAll: "التوظيف متاح لجميع الجنسيات", ldOpenAllSub: "داخل المملكة العربية السعودية" });
Object.assign(RA.en, { ldOpenAll: "Hiring is open to all nationalities", ldOpenAllSub: "inside the Kingdom of Saudi Arabia" });
Object.assign(RA.ur, { ldOpenAll: "بھرتی تمام قومیتوں کے لیے کھلی ہے", ldOpenAllSub: "سعودی عرب کے اندر" });
Object.assign(T.ar.nav, { repAccounting: "محاسبة المناديب", myEarnings: "أرباحي" });
Object.assign(T.en.nav, { repAccounting: "Rep Accounting", myEarnings: "My Earnings" });
Object.assign(T.ur.nav, { repAccounting: "نمائندہ اکاؤنٹنگ", myEarnings: "میری کمائی" });

/* ═══════════  محاسبة المناديب (المحاسب) + أرباحي (المندوب)  ═══════════ */
const INPUT_ST = { background: "#fff", border: "1px solid var(--line-strong)", color: "#12151D" };

function describePrice(p, RAx, sar) {
  const n = (v) => +v || 0;
  if (!p) return [];
  const fx = n(p.fixedMonthly) ? [`${n(p.fixedMonthly)} ${sar} ${RAx.dFixed}`] : [];
  if (p.mode === "target") return [`${n(p.ordersBase)} ${sar} ${RAx.dTarget} ${n(p.ordersTarget)} · +${n(p.perOrderDelta)} ${sar} ▲ ${RAx.dOrder}${hasBelow(p) ? ` · ▼ ${n(p.belowRate)} ${sar} ${RAx.dOrder}` : ""}`].concat(fx);
  if (p.mode === "tiers") return tiersN(p).map((tr) => `${n(tr.from)} ${RAx.tierTo2} ${tr.to === Infinity ? RAx.andAbove : n(tr.to)}: ${n(tr.rate)} ${sar} ${RAx.dOrder}`).concat(fx);
  return [`${n(p.perOrder)} ${sar} ${RAx.dOrder}`].concat(fx);
}

function BreakLines({ lines, lang, sar, tone }) {
  const t = (x) => {
    if (x.k === "base") return Lx(lang, `الراتب الثابت${x.f < 1 ? ` (بنسبة ${Math.round(x.f * 100)}% من الشهر، والهدف المحتسب ${x.target} طلب)` : ""}`, `Fixed salary${x.f < 1 ? ` (${Math.round(x.f * 100)}% of month, target ${x.target})` : ""}`);
    if (x.k === "tierAll") return Lx(lang, `كل الطلبات بسعر الشريحة التي وصل لها: ${x.qty} × ${x.rate}`, `All orders at the tier reached: ${x.qty} × ${x.rate}`);
    if (x.k === "adj") return Lx(lang, `يُخصم ما حُسب على حساب المندوب السابق (${x.base} طلب)`, `Less what was counted for the previous rider (${x.base})`);
    if (x.k === "below") return Lx(lang, `لم يبلغ الهدف (${x.target} طلب) فكل طلب بسعر ثابت: ${x.qty} × ${x.rate}`, `Target (${x.target}) not reached, flat rate: ${x.qty} × ${x.rate}`);
    if (x.k === "extra") return Lx(lang, `طلبات زائدة عن الهدف: ${x.qty} × ${x.rate}`, `Above target: ${x.qty} × ${x.rate}`);
    if (x.k === "short") return Lx(lang, `طلبات ناقصة عن الهدف: ${x.qty} × ${x.rate} (خصم)`, `Below target: ${x.qty} × ${x.rate} (deduction)`);
    if (x.k === "tier") return Lx(lang, `الطلبات ${x.from}–${x.to === Infinity ? "فأكثر" : x.to}: ${x.qty} × ${x.rate}`, `Orders ${x.from}–${x.to === Infinity ? "+" : x.to}: ${x.qty} × ${x.rate}`);
    if (x.k === "unit") return Lx(lang, `${x.qty} طلب × ${x.rate}`, `${x.qty} orders × ${x.rate}`);
    if (x.k === "fixed") return Lx(lang, "ثابت شهري", "Fixed monthly");
    if (x.k === "share") return Lx(lang, `حصته من إيراد التطبيق (${x.qty} من ${x.of} طلب)`, `Share of app revenue (${x.qty} of ${x.of})`);
    if (x.k === "invoice") return Lx(lang, "من فاتورة التطبيق (صافي الدفعات)", "From app invoice (net payments)");
    return x.k;
  };
  return <div className="space-y-0.5">{lines.map((x, i) => <p key={i} className="num text-[11.5px] flex justify-between gap-3"><span>{t(x)}</span><b style={{ color: x.amt < 0 ? "#C0443A" : tone || "#12151D" }}>{x.amt < 0 ? "−" : ""}{fmt(Math.abs(x.amt))} {sar}</b></p>)}</div>;
}
function PriceForm({ value, onChange, RAx, sar, kind, lang }) {
  const p = value;
  const [tryO, setTryO] = useState(100);
  const setNum = (k) => (e) => onChange({ ...p, [k]: e.target.value === "" ? "" : +e.target.value });
  const Field = ({ k }) => (
    <label className="block">
      <span className="block text-[10.5px] mb-1" style={{ color: "var(--muted)" }}>{RAx[k]}</span>
      <NumInput step="any" value={p[k] ?? ""} onChange={setNum(k)} className="num w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST} />
    </label>
  );
  const tiers = tiersForm(p);
  const setTiers = (arr) => onChange({ ...p, tiersV: 2, tiers: arr });
  const setTier = (i, k, v) => setTiers(tiers.map((tr, j) => (j === i ? { ...tr, [k]: v === "" ? "" : +v } : tr)));
  const addTier = () => {
    const last = tiers[tiers.length - 1];
    const lastTo = last.to === "" || last.to == null ? (+last.from || 1) + 99 : +last.to;
    setTiers([...tiers.slice(0, -1), { ...last, to: lastTo }, { from: lastTo + 1, to: "", rate: "" }]);
  };
  const issues = p.mode === "tiers" ? tierIssues(p) : [];
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
          {Field({ k: "ordersBase" })}{Field({ k: "ordersTarget" })}{Field({ k: "perOrderDelta" })}{Field({ k: "belowRate" })}
          {Field({ k: "fixedMonthly" })}
        </div>
      )}
      {p.mode === "target" && hasBelow(p) && +p.ordersBase > 0 && +p.ordersTarget > 0 && +p.ordersBase < +p.ordersTarget * +p.belowRate && (
        <div className="rounded-lg p-2.5 text-[11.5px] font-semibold" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.4)", color: "#B3392F" }}>
          ⚠ {Lx(lang || "ar", `الراتب الثابت (${p.ordersBase}) أقل من ${p.ordersTarget} × ${p.belowRate} = ${fmt(+p.ordersTarget * +p.belowRate)}: المندوب الذي يصل ${(+p.ordersTarget) - 1} طلباً سيستلم أكثر ممن بلغ الهدف تماماً.`, `Fixed salary (${p.ordersBase}) is below ${p.ordersTarget} × ${p.belowRate} = ${fmt(+p.ordersTarget * +p.belowRate)}: a rider at ${(+p.ordersTarget) - 1} orders would earn more than one who hits the target.`)}
        </div>
      )}
      {p.mode === "tiers" && (
        <div className="space-y-2">
          <div className="rounded-xl p-3" style={{ background: "rgba(15,165,121,.07)", border: "1px solid rgba(15,165,121,.28)" }}>
            <p className="text-[11px] font-bold mb-2">{RAx.calcT}</p>
            <div className="flex gap-2 flex-wrap">{[["all", RAx.calcAll], ["marginal", RAx.calcMarg]].map(([id, label]) => <button key={id} type="button" onClick={() => onChange({ ...p, tierCalc: id })} className="px-3 py-2 rounded-xl text-[11.5px] font-bold" style={{ background: (p.tierCalc || "marginal") === id ? "rgba(15,165,121,.2)" : "rgba(20,27,45,.04)", border: `1px solid ${(p.tierCalc || "marginal") === id ? "rgba(15,165,121,.6)" : "var(--line)"}`, color: (p.tierCalc || "marginal") === id ? "#0B5C46" : "var(--muted)" }}>{label}</button>)}</div>
            <p className="text-[10.5px] mt-1.5" style={{ color: "var(--muted)" }}>{RAx.calcNote}</p>
          </div>
          {kind === "app" && (
            <div className="rounded-xl p-3" style={{ background: "rgba(184,134,46,.08)", border: "1px solid rgba(184,134,46,.3)" }}>
              <p className="text-[11px] font-bold mb-2">{RAx.scopeT}</p>
              <div className="flex gap-2 flex-wrap">{[["rider", RAx.scopeRider], ["total", RAx.scopeTotal]].map(([id, label]) => <button key={id} type="button" onClick={() => onChange({ ...p, scope: id })} className="px-3 py-2 rounded-xl text-[11.5px] font-bold" style={{ background: (p.scope || "rider") === id ? "rgba(184,134,46,.2)" : "rgba(20,27,45,.04)", border: `1px solid ${(p.scope || "rider") === id ? "rgba(184,134,46,.6)" : "var(--line)"}`, color: (p.scope || "rider") === id ? "#6B4A12" : "var(--muted)" }}>{label}</button>)}</div>
              <p className="text-[10.5px] mt-1.5" style={{ color: "var(--muted)" }}>{RAx.scopeNote}</p>
            </div>
          )}
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-[10.5px] font-semibold px-0.5" style={{ color: "var(--muted)" }}>
            <span>{RAx.tierFrom}</span><span>{RAx.tierTo}</span><span>{RAx.tierRate}</span><span className="w-9" />
          </div>
          {tiers.map((tr, i) => (
            <div key={i} className="rounded-xl p-2" style={{ background: "rgba(20,27,45,.03)", border: "1px solid var(--line)" }}>
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                <NumInput min="1" value={tr.from ?? ""} onChange={(e) => setTier(i, "from", e.target.value)} className="num w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST} />
                <NumInput min="1" value={tr.to ?? ""} placeholder={RAx.andAbove} onChange={(e) => setTier(i, "to", e.target.value)} className="num w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST} />
                <NumInput step="any" value={tr.rate ?? ""} placeholder="13.50" onChange={(e) => setTier(i, "rate", e.target.value)} className="num w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST} />
                <button disabled={tiers.length <= 1} onClick={() => setTiers(tiers.filter((_, j) => j !== i))} className="p-2.5 rounded-lg disabled:opacity-30" style={{ background: "rgba(232,131,122,.1)" }}><Trash2 size={14} style={{ color: "#E8837A" }} /></button>
              </div>
              {tr.rate !== "" && tr.rate != null && tr.from !== "" && (
                <p className="text-[11px] mt-1.5 px-0.5" style={{ color: "#0B5C46" }}>
                  {RAx.tierRow(tr.from, tr.to === "" || tr.to == null ? null : tr.to, tr.rate, sar)}
                </p>
              )}
            </div>
          ))}
          <button onClick={addTier}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-2 rounded-xl" style={{ background: "rgba(20,27,45,.05)", border: "1px solid var(--line)" }}><Plus size={13} />{RAx.addTier}</button>
          <p className="text-[10.5px]" style={{ color: "var(--muted)" }}>{RAx.tiersNote}</p>
          {issues.length > 0 && (
            <div className="rounded-lg p-2.5 text-[11.5px] font-semibold space-y-0.5" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.4)", color: "#B3392F" }}>
              {issues.map((k) => <p key={k}>⚠ {RAx["tierErr_" + k]}</p>)}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">{Field({ k: "fixedMonthly" })}</div>
        </div>
      )}
      {(p.mode === "unit" || !p.mode) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Field({ k: "perOrder" })}{Field({ k: "fixedMonthly" })}</div>
      )}
      <div className="rounded-xl p-3" style={{ background: "rgba(15,165,121,.06)", border: "1px solid rgba(15,165,121,.22)" }}>
        <p className="text-[11px] font-bold mb-2" style={{ color: "#0B5C46" }}>{RAx.tryIt}</p>
        <div className="flex items-end gap-3 flex-wrap">
          <label className="block"><span className="block text-[10px] mb-1" style={{ color: "var(--muted)" }}>{RAx.tryOrders}</span>
            <NumInput value={tryO} onChange={(e) => setTryO(e.target.value)} className="num w-24 rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold outline-none" style={INPUT_ST} /></label>
          <div className="ms-auto text-end"><span className="block text-[10px]" style={{ color: "var(--muted)" }}>{RAx.tryResult}</span>
            <span className="num text-[20px] font-extrabold" style={{ color: "#0B5C46" }}>{fmt(res.total)} <span className="text-[11px]">{sar}</span></span></div>
        </div>
        {validPrice(p) && +tryO > 0 && <div className="mt-2 pt-2" style={{ borderTop: "1px dashed rgba(15,165,121,.3)" }}><BreakLines lines={priceBreakdown(p, +tryO, 1, 0).lines} lang={lang || "ar"} sar={sar} tone="#0B5C46" /></div>}
      </div>
    </div>
  );
}

function PricingTab({ lang, role, kind, pricing, setPricing, setAuditLog, actingEmployee, ext, setExt }) {
  const RAx = RA[lang], t = T[lang];
  const canEdit = role.id === "fin" || role.id === "gm";
  const [appId, setAppId] = useState(APPS[0].id);
  const stored = pricing && pricing[kind] && pricing[kind][appId];
  const base = stored || BLANK_PRICE;
  const draftOf = (b) => ({ ...BLANK_PRICE, ...b, ...(stored && stored.mode === "tiers" && stored.tierCalc === undefined ? { tierCalc: "marginal" } : {}) });
  const [draft, setDraft] = useState(draftOf(base));
  const [done, setDone] = useState(false);
  useEffect(() => { setDraft(draftOf(base)); setDone(false); }, [appId, kind]); // eslint-disable-line
  const dirty = JSON.stringify(draft) !== JSON.stringify(draftOf(base));
  const writeFor = (ids, val) => setPricing((prev) => {
    const cur = prev || { app: {}, rep: {} };
    const map = { ...(cur[kind] || {}) };
    ids.forEach((id) => { if (val) map[id] = val; else delete map[id]; });
    return { ...cur, [kind]: map };
  });
  const needGm = role.id === "fin" && !!setExt; // أي تسعيرة (للشركة من التطبيق أو للمندوب) يضعها المحاسب تنتظر اعتماد المدير العام
  const submitReq = (ids, val) => { extUpd(setExt, "priceReq", (a) => [{ id: uidX("PR"), kind, appIds: ids, price: val, old: (pricing && pricing[kind] && pricing[kind][ids[0]]) || null, by: byName(role, actingEmployee), at: riyadhNow().toISOString(), status: "pending" }, ...a]); logAudit(setAuditLog, role, "price_request", ids.map((i) => (APPS.find((a) => a.id === i) || {}).ar || i).join("، "), actingEmployee); };
  const save = () => { if (!validPrice(draft)) return; if (needGm) { submitReq([appId], draft); setDone(true); setTimeout(() => setDone(false), 1800); return; } writeFor([appId], draft); logAudit(setAuditLog, role, "pricing_" + kind, `${APPS.find((a) => a.id === appId)[lang]}`, actingEmployee); setDone(true); setTimeout(() => setDone(false), 1800); };
  const copyAll = () => { if (needGm) { submitReq(APPS.map((a) => a.id), draft); setDone(true); setTimeout(() => setDone(false), 1800); return; } writeFor(APPS.map((a) => a.id), draft); logAudit(setAuditLog, role, "pricing_" + kind + "_all", "all apps", actingEmployee); setDone(true); setTimeout(() => setDone(false), 1800); };
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
          <PriceForm value={draft} onChange={setDraft} RAx={RAx} sar={t.sar} kind={kind} lang={lang} />
        </fieldset>
        {canEdit ? (
          <div className="flex items-center gap-2.5 mt-5 flex-wrap">
            <Btn variant="accent" accent={role.glow} icon={done ? CheckCircle2 : BadgeCheck} onClick={save} disabled={!validPrice(draft)}>{done ? RAx.saved : RAx.save}</Btn>
            <Btn icon={Copy} onClick={copyAll}>{RAx.copyAll}</Btn>
            {stored && <Btn icon={X} onClick={() => { if (needGm) submitReq([appId], null); else writeFor([appId], null); }}>{RAx.resetDefault}</Btn>}
            {needGm && <span className="text-[11px] font-semibold" style={{ color: "#B8862E" }}>{kind === "app" ? Lx(lang, "تسعيرة الشركة (من التطبيق) تُرسل للمدير العام للاعتماد قبل أن تسري.", "Company (app) pricing goes to the GM for approval before it applies.") : Lx(lang, "تسعيرة المندوب تُرسل للمدير العام للاعتماد قبل أن تسري.", "Rider pricing goes to the GM for approval before it applies.")}</span>}
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
  const [calcRep, setCalcRep] = useState(null);
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
    [RAx.adjAdd]: l.manualAdds, [RAx.adjDeduct]: l.manualDeds, [RAx.colNet]: l.net, [Lx(lang, "الصافي بعد اليومية", "Net after daily ledger")]: l.payable != null ? l.payable : l.net, [RAx.colRev]: l.revKnown ? l.rev : "", [RAx.colProfit]: l.revKnown ? l.profit : "" })), `rep-accounting-${month}`, month);
  const exportApps = () => exportToExcel(res.appLines.map((l) => ({
    [RAx.colApp]: appName(l.app), [RAx.colOrders]: l.orders, [RAx.colCalc]: l.calc, [RAx.colInvNet]: l.invNet ?? "", [RAx.colActual]: l.actual ?? "",
    [RAx.colAppFines]: l.fines, [RAx.colRevenue]: l.revenue, [RAx.colRepCost]: l.repGross, [RAx.colMargin]: l.margin })), `app-accounting-${month}`, month);
  const num = (v, colour) => <span className="num font-bold" style={colour ? { color: colour } : null}>{fmt(r2(v))}</span>;
  const cell = "py-2.5 px-2.5 text-[12px] whitespace-nowrap";
  const head = "py-2 px-2.5 text-[10.5px] font-bold text-start whitespace-nowrap";
  const mini = (val, onCh, w) => (
    <NumInput step="any" disabled={!canEdit} value={val} onChange={(e) => onCh(e.target.value)} className="num rounded-lg px-2 py-1.5 text-[12px] font-bold outline-none text-end" style={{ ...INPUT_ST, width: w || 84, opacity: canEdit ? 1 : .7 }} />
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
                {[RAx.colRep, RAx.riderId, RAx.colOrders, RAx.colGross, RAx.colWeekend, RAx.colAppViol, RAx.colAdj, RAx.colReimb, RAx.colNet, Lx(lang, "الصافي بعد اليومية", "Net after daily ledger"), RAx.colRev, RAx.colProfit].map((h) => <th key={h} className={head}>{h}</th>)}
              </tr></thead>
              <tbody>
                {res.repLines.map((l) => {
                  const mine = (inputs.manual || []).filter((m) => m.repId === l.repId);
                  const open = openRep === l.repId;
                  return (
                    <React.Fragment key={l.repId}>
                      <tr style={{ borderBottom: open ? "none" : "1px solid var(--line)" }}>
                        <td className={cell}><b>{lang === "en" ? l.en : l.name}</b> <span className="text-[10px]" style={{ color: "var(--muted)" }}>{appName(l.app)}</span>
                          <button onClick={() => setCalcRep(calcRep === l.repId ? null : l.repId)} className="block text-[10.5px] font-bold underline" style={{ color: "#8A611E" }}>{RAx.explain}</button></td>
                        <td className={cell}>{l.riderId ? <span className="num text-[11.5px] font-bold">{l.riderId}</span> : <Chip tone="warn" sm>{RAx.noRiderId}</Chip>}</td>
                        <td className={cell}>{num(l.orders)} {l.source === "invoice" ? <Chip tone="ok" sm>{RAx.srcInv}</Chip> : <Chip tone="n" sm>{RAx.srcDaily}</Chip>}
                          {l.invOrders != null && l.recOrders !== l.invOrders && <span className="num text-[10px] ms-1" style={{ color: "#C0443A" }}>({RAx.colRecorded}: {l.recOrders})</span>}
                          {l.baseOrders > 0 && <span className="block text-[10px]" style={{ color: "#8A611E" }}>{Lx(lang, `عدّاد التطبيق يكمل عن ${l.baseFrom || "سابقه"}: ${l.baseOrders} + ${l.orders} = ${l.baseOrders + l.orders} (داخلي)`, `App counter continues from ${l.baseFrom || "predecessor"}: ${l.baseOrders} + ${l.orders} = ${l.baseOrders + l.orders} (internal)`)}</span>}</td>
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
                        <td className={cell}>{num(l.payable != null ? l.payable : l.net, (l.payable != null ? l.payable : l.net) >= 0 ? "#0B5C46" : "#C0443A")}
                          {(l.dailyDed || 0) !== 0 && <span className="block text-[10px]" style={{ color: "var(--muted)" }}>{Lx(lang, `اليومية: ${l.dailyDed > 0 ? "−" : "+"}${fmt(Math.abs(l.dailyDed))} (سلف ${fmt(l.dailyAdv)} · كاش ${fmt(l.dailyCash)})`, `Ledger: ${l.dailyDed > 0 ? "−" : "+"}${fmt(Math.abs(l.dailyDed))}`)}</span>}</td>
                        <td className={cell}>{l.revKnown ? num(l.rev) : <Chip tone="warn" sm>{RAx.noPolicy}</Chip>}</td>
                        <td className={cell}>{l.revKnown ? num(l.profit, l.profit >= 0 ? "#0B5C46" : "#C0443A") : "—"}</td>
                      </tr>
                      {calcRep === l.repId && (
                        <tr style={{ borderBottom: "1px solid var(--line)" }}><td colSpan={12} className="px-2.5 pb-3">
                          <div className="rounded-xl p-3 grid gap-4 md:grid-cols-2" style={{ background: "rgba(184,134,46,.06)", border: "1px solid rgba(184,134,46,.3)" }}>
                            {l.detail.map((d) => (
                              <React.Fragment key={d.app}>
                                <div>
                                  <p className="text-[12px] font-extrabold mb-1.5">{Lx(lang, `إيراد الشركة من ${appName(d.app)}`, `Company revenue from ${appName(d.app)}`)}</p>
                                  <p className="text-[10.5px] mb-1.5" style={{ color: "var(--muted)" }}>{d.rev.lines[0] && d.rev.lines[0].k === "invoice" ? Lx(lang, "حسب فاتورة التطبيق المرفوعة.", "From the uploaded app invoice.") : d.scope === "rider" ? Lx(lang, `الشرائح تُحسب على طلبات هذا المندوب وحده (${d.orders} طلب)${d.base ? ` — العدّاد يكمل من ${d.base}` : ""}.`, `Tiers counted on this rider's own orders (${d.orders})${d.base ? ` — counter continues from ${d.base}` : ""}.`) : Lx(lang, "حصته من إيراد إجمالي التطبيق.", "His share of the app's total revenue.")}</p>
                                  {d.rev.known ? <BreakLines lines={d.rev.lines} lang={lang} sar={t.sar} tone="#0B5C46" /> : <p className="text-[11.5px]" style={{ color: "#8A611E" }}>{RAx.wAppPrice}</p>}
                                  <p className="num text-[13px] font-extrabold mt-1.5 flex justify-between"><span>{Lx(lang, "الإيراد", "Revenue")}</span><span style={{ color: "#0B5C46" }}>{fmt(Math.round(d.rev.total))} {t.sar}</span></p>
                                </div>
                                <div>
                                  <p className="text-[12px] font-extrabold mb-1.5">{Lx(lang, "ما يستحقه المندوب", "What the rider earns")}</p>
                                  {d.cost.known ? <BreakLines lines={d.cost.lines} lang={lang} sar={t.sar} /> : <p className="text-[11.5px]" style={{ color: "#8A611E" }}>{RAx.wRepPrice}</p>}
                                  <p className="num text-[13px] font-extrabold mt-1.5 flex justify-between"><span>{Lx(lang, "إجمالي أجره", "Gross pay")}</span><span>{fmt(Math.round(d.cost.total))} {t.sar}</span></p>
                                </div>
                              </React.Fragment>
                            ))}
                            <div className="md:col-span-2 rounded-lg p-2.5 num text-[12.5px]" style={{ background: "#fff", border: "1px solid var(--line)" }}>
                              {Lx(lang, "ربح الشركة منه", "Company profit from him")} = {fmt(Math.round(l.rev))} {Lx(lang, "(إيراد)", "(revenue)")} − {fmt(Math.round(l.net))} {Lx(lang, "(صافي ما يستلمه بعد الغرامات والتسويات)", "(his net after fines & adjustments)")} = <b style={{ color: l.profit >= 0 ? "#0B5C46" : "#C0443A" }}>{fmt(Math.round(l.profit))} {t.sar}</b>
                              {l.detail.some((d) => d.f < 1) && <span className="block text-[10.5px] mt-1" style={{ color: "#8A611E" }}>{Lx(lang, `الشهر لم ينتهِ بعد: الراتب الثابت والهدف يُحسبان بنسبة ما مضى من الشهر (${Math.round(Math.min(...l.detail.map((d) => d.f)) * 100)}%). سيكتمل الحساب في آخر الشهر.`, "Month still open: fixed salary and target are prorated to date.")}</span>}
                            </div>
                          </div>
                        </td></tr>
                      )}
                      {open && (
                        <tr style={{ borderBottom: "1px solid var(--line)" }}><td colSpan={11} className="px-2.5 pb-3">
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
                                <NumInput placeholder={RAx.adjAmount} value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} className="num rounded-lg px-2.5 py-2 text-[12px] font-bold outline-none w-24" style={INPUT_ST} />
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

function RepAccountingPage({ lang, role, reps, setReps, reports, pricing, setPricing, repSettlements, setRepSettlements, weekendFine, violationPenalty, expenses, repReceipts, setAuditLog, actingEmployee, ext, setExt }) {
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
      {tab !== "close" && <PricingTab lang={lang} role={role} kind={tab} pricing={pricing} setPricing={setPricing} setAuditLog={setAuditLog} actingEmployee={actingEmployee} ext={ext} setExt={setExt} />}
      {tab !== "close" && <PriceReqPanel lang={lang} role={role} pricing={pricing} setPricing={setPricing} ext={ext} setExt={setExt} setAuditLog={setAuditLog} actingEmployee={actingEmployee} />}
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
  const c = repMonthCalc(entries, activeRep, pricing, weekendFine, violationPenalty, monthFactor(month), month);
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

Object.assign(T.ar.nav, { dailyLedger: "يومية المناديب", myDaily: "يوميتي" });
Object.assign(T.en.nav, { dailyLedger: "Riders' Daily Ledger", myDaily: "My Daily" });
Object.assign(T.ur.nav, { dailyLedger: "Riders' Daily Ledger", myDaily: "My Daily" });
const HUBS = {
  financeHub: ["repAccounting", "dailyLedger", "settleFlow", "closeList", "cashflow", "whatIf", "walletAdmin", "receiptsAdmin", "payrollRuns", "expenses", "invoices"],
  repsHub: ["pulse", "retention", "perfPlans", "coverage", "teams", "dayOps", "perfBoard", "incidents", "leavesAdmin", "trainingAdmin"],
  commsHub: ["tickets", "chat", "circulars", "messages"],
  hrHub: ["appAvail", "referrals", "pipeline", "hiring", "repFiles", "employees", "empFile", "offboard", "iqama"],
  legalHub: ["charter", "contracts", "cases", "compliance", "crm"],
};
const HUB_OF = {};
Object.keys(HUBS).forEach((h) => HUBS[h].forEach((m) => { HUB_OF[m] = h; }));
const PRIMARY_NAV = {
  gm: ["today", "cockpit", "decisions", "financeHub", "repsHub", "commsHub"],
  opsm: ["today", "shifts", "repsHub", "cars", "commsHub"],
  ops: ["today", "shifts", "pulse", "cars", "commsHub"],
  fin: ["today", "financeHub", "commsHub"],
  hr: ["today", "hrHub", "repsHub", "commsHub", "attendance"],
  legal: ["today", "legalHub", "commsHub", "attendance"],
  advisor: ["today", "boardCouncil", "decisions", "financeHub"],
  rep: ["riderHome", "coach", "myEarnings", "myScore", "myWallet", "myDaily", "academy", "myLeave", "reportInc", "support", "myRefer", "teams", "riderReceipts", "commsHub", "mystory", "riderWelcome"],
};
const TODAY_QUICK = {
  gm: ["inbox", "decisions", "expenses", "repAccounting", "pulse"], opsm: ["shifts", "pulse", "cars", "hiring"], ops: ["shifts", "pulse", "cars"],
  fin: ["repAccounting", "payrollRuns", "expenses"], hr: ["repFiles", "hiring", "iqama", "employees"], legal: ["cases", "contracts", "charter"],
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
  rhGoal: "هدف الشهر", rhRank: "ترتيبك هذا الشهر", rhOf: "من", rhDoc: "إقامتك تنتهي خلال", rhDays: "يوم — راجع الموارد البشرية", rhMsgs: "رسائل جديدة", rhTickets: "طلباتك المفتوحة",  rhNet: "صافي ربحك هذا الشهر", rhShare: "مشاركة كشفي على واتساب",
  riderLinkT: "رابط تطبيق المندوب", riderLinkSub: "أرسله للمناديب — يفتح مباشرة على دخول المندوب ومتصل بنفس قاعدة البيانات.", copy: "نسخ الرابط", copied: "تم النسخ ✓", waShare: "إرسال واتساب",
  riderLoginT: "تطبيق المندوب", riderLoginSub: "سجّل دخولك برقم الهوية للبدء", missingEntryNotif: "لم تُدخل طلبات أمس بعد — أدخلها الآن",
  waMsg: "كشف أرباحي من بوارق الشرق",
});
Object.assign(RA.en, {
  rhClockIn: "Clock in", rhClockOut: "Clock out", rhDone: "Day complete ✓", rhSince: "since", rhToday: "Today", rhNoEntry: "Your supervisor hasn't logged your orders yet",
  rhGoal: "Month goal", rhRank: "Your rank this month", rhOf: "of", rhDoc: "Your residency expires in", rhDays: "days — contact HR", rhMsgs: "New messages", rhTickets: "Your open requests",  rhNet: "Your net profit this month", rhShare: "Share my statement on WhatsApp",
  riderLinkT: "Rider app link", riderLinkSub: "Send it to riders — opens straight on rider login and uses the same database.", copy: "Copy link", copied: "Copied ✓", waShare: "Send on WhatsApp",
  riderLoginT: "Rider App", riderLoginSub: "Sign in with your ID number to start", missingEntryNotif: "Yesterday's orders haven't been entered yet — enter them now",
  waMsg: "My earnings statement from Bawariq Al-Sharq",
});
Object.assign(RA.ur, {
  rhClockIn: "حاضری لگائیں", rhClockOut: "رخصتی لگائیں", rhDone: "دن مکمل ✓", rhSince: "سے", rhToday: "آج", rhNoEntry: "سپروائزر نے ابھی آرڈرز درج نہیں کیے",
  rhGoal: "ماہانہ ہدف", rhRank: "اس مہینے آپ کا درجہ", rhOf: "میں سے", rhDoc: "آپ کا اقامہ ختم ہو رہا ہے", rhDays: "دن میں — ایچ آر سے رجوع کریں", rhMsgs: "نئے پیغامات", rhTickets: "آپ کی کھلی درخواستیں",  rhNet: "اس مہینے آپ کا خالص منافع", rhShare: "واٹس ایپ پر شیئر کریں",
  riderLinkT: "نمائندہ ایپ کا لنک", riderLinkSub: "نمائندوں کو بھیجیں — براہ راست لاگ ان کھلتا ہے۔", copy: "لنک کاپی", copied: "کاپی ہو گیا ✓", waShare: "واٹس ایپ پر بھیجیں",
  riderLoginT: "نمائندہ ایپ", riderLoginSub: "شروع کرنے کے لیے شناختی نمبر سے لاگ ان کریں", missingEntryNotif: "کل کے آرڈرز ابھی درج نہیں ہوئے",
  waMsg: "بوارق الشرق سے میری کمائی کا گوشوارہ",
});
/* ═══════════  ترحيب المندوب + ملفات المناديب + استعادة الحساب  ═══════════ */
Object.assign(RA.ar, {
  wlHi: "أهلاً وسهلاً", wlJoin: "انضممتَ إلى عائلة بوارق الشرق",
  wlJoinD: "أنت الآن جزء من شركة كبيرة تعمل في أكثر من تطبيق توصيل، وتضع مندوبيها في المقدمة. وجودك معنا مصدر فخر لنا، وهذا التطبيق وُلد ليخدمك.",
  wlPrivT: "تطبيق خاص بينك وبين بوارق الشرق فقط",
  wlPrivD: "هذا التطبيق مخصّص لك ولشركتك فقط. بياناتك وأرباحك ومحادثاتك لا يراها أحد خارج بوارق الشرق، ولا تُشارك مع أي جهة أخرى.",
  wlWhyT: "لماذا أنشأنا هذا التطبيق؟",
  wlWhyD: "لنطوّر نظام التوصيل معاً، ونسهّل التواصل بيننا وبينك، ونفتح قنوات مباشرة وواضحة تصل بها إلى الشركة في أي وقت دون واسطة ولا تعقيد.",
  wlP1T: "أرباحك أمامك", wlP1D: "تعرف أرباحك وطلباتك ومخالفاتك بوضوح، وتتحدث أولاً بأول بعد اعتماد المحاسب.",
  wlP2T: "تواصل مباشر مع مشرفك", wlP2D: "اتصال أو واتساب لمشرفك بضغطة، وتصلك تعليمات الشركة مباشرة.",
  wlP3T: "رسائل وتعاميم", wlP3D: "كل قرار أو تنبيه يخصك يصلك في التطبيق ويظهر لنا أنك اطّلعت عليه.",
  wlP4T: "إيصالات وطلبات", wlP4D: "ارفع إيصال البنزين، وقدّم اعتراضاً على أي يوم، وافتح تذكرة لأي مشكلة.",
  wlP5T: "نكبر معك", wlP5D: "نطوّر التطبيق بناءً على ملاحظاتك، وكل اقتراح منك يصل مباشرة للإدارة.",
  wlP6T: "حقك محفوظ", wlP6D: "كل رقم يُحتسب بتسعيرة يعتمدها المحاسب فقط، ونوضّح لك كيف حُسب.",
  wlPledgeT: "عهدنا لك", wlPledgeD: "شفافية في الحساب، وسرعة في الرد، واحترام لوقتك وجهدك. أنت شريك في نجاح بوارق الشرق.",
  wlStart: "ابدأ الآن", wlAboutBtn: "عن التطبيق ورسالتنا لك", rhMySup: "مشرفك", rhCall: "اتصال",
  forgot: "نسيت كلمة السر؟", forgotT: "استعادة الحساب", forgotSub: "أدخل رقم هويتك ورقم جوالك، وسيصل الطلب للموارد البشرية لتزويدك بكلمة سر جديدة.",
  forgotSend: "إرسال الطلب", forgotDone: "تم إرسال طلبك للموارد البشرية. سيتواصلون معك بكلمة سر جديدة.", forgotErr: "أدخل رقم هوية صحيح (10 أرقام) ورقم جوال.", forgotBack: "رجوع لتسجيل الدخول",
  rfTitle: "ملفات المناديب", rfSub: "قسم خاص بالموارد البشرية فقط: بيانات كل مندوب ودخوله للتطبيق. عدّل أي بيان أو استعد الحساب.", rfOnlyHr: "هذا القسم للموارد البشرية فقط.",
  rfResets: "طلبات استعادة الحساب", rfUnknown: "هوية غير مسجّلة", rfNewPw: "كلمة سر جديدة", rfGen: "توليد", rfRestore: "استعادة الحساب", rfReject: "رفض", rfNoMatch: "لا يوجد مندوب بهذه الهوية.",
  rfAll: "كل المناديب", rfSearch: "بحث بالاسم أو الجوال أو الهوية", rfName: "الاسم", rfPhone: "رقم الجوال", rfNid: "رقم الهوية", rfPw: "كلمة سر التطبيق", rfStatus: "الحالة",
  rfActive: "نشط", rfPending: "قيد الاعتماد", rfSuspended: "موقوف", rfEdit: "تعديل", rfDupNid: "رقم الهوية مسجّل لمندوب آخر",
});
Object.assign(RA.en, {
  wlHi: "Welcome", wlJoin: "You've joined the Bawariq Al-Sharq family",
  wlJoinD: "You're now part of a large company working across multiple delivery apps and putting its riders first. Having you with us is a source of pride, and this app was built to serve you.",
  wlPrivT: "A private app between you and Bawariq Al-Sharq only",
  wlPrivD: "This app is exclusively for you and your company. Your data, earnings and conversations are not visible outside Bawariq Al-Sharq and are never shared with anyone else.",
  wlWhyT: "Why did we build this app?",
  wlWhyD: "To improve the delivery system together, make communication between us easy, and open direct, clear channels to reach the company at any time — no middlemen, no hassle.",
  wlP1T: "Your earnings, clearly", wlP1D: "See your earnings, orders and violations, updated as soon as the accountant approves.",
  wlP2T: "Direct line to your supervisor", wlP2D: "Call or WhatsApp your supervisor in one tap; company instructions reach you directly.",
  wlP3T: "Messages & circulars", wlP3D: "Every decision or alert for you arrives in the app, and we can see you've read it.",
  wlP4T: "Receipts & requests", wlP4D: "Upload fuel receipts, dispute any day, and open a ticket for any issue.",
  wlP5T: "We grow with you", wlP5D: "We improve the app from your feedback; every suggestion reaches management.",
  wlP6T: "Your rights, protected", wlP6D: "Every number uses pricing approved by the accountant only, and we show how it was calculated.",
  wlPledgeT: "Our promise", wlPledgeD: "Transparent accounting, fast replies, and respect for your time and effort. You're a partner in Bawariq Al-Sharq's success.",
  wlStart: "Get started", wlAboutBtn: "About the app & our message", rhMySup: "Your supervisor", rhCall: "Call",
  forgot: "Forgot password?", forgotT: "Recover account", forgotSub: "Enter your ID and phone number; the request goes to HR who will give you a new password.",
  forgotSend: "Send request", forgotDone: "Your request was sent to HR. They'll contact you with a new password.", forgotErr: "Enter a valid 10-digit ID and a phone number.", forgotBack: "Back to login",
  rfTitle: "Rider Files", rfSub: "HR-only section: each rider's details and app login. Edit any detail or restore an account.", rfOnlyHr: "This section is for HR only.",
  rfResets: "Account recovery requests", rfUnknown: "Unregistered ID", rfNewPw: "New password", rfGen: "Generate", rfRestore: "Restore account", rfReject: "Reject", rfNoMatch: "No rider with this ID.",
  rfAll: "All riders", rfSearch: "Search by name, phone or ID", rfName: "Name", rfPhone: "Phone", rfNid: "ID number", rfPw: "App password", rfStatus: "Status",
  rfActive: "Active", rfPending: "Pending", rfSuspended: "Suspended", rfEdit: "Edit", rfDupNid: "ID number is registered to another rider",
});
Object.assign(RA.ur, {
  wlHi: "خوش آمدید", wlJoin: "آپ بواریق الشرق کے خاندان میں شامل ہو گئے",
  wlJoinD: "آپ اب ایک بڑی کمپنی کا حصہ ہیں جو کئی ڈیلیوری ایپس پر کام کرتی ہے اور اپنے رائیڈرز کو اولیت دیتی ہے۔ یہ ایپ آپ کی خدمت کے لیے بنی ہے۔",
  wlPrivT: "یہ ایپ صرف آپ اور بواریق الشرق کے درمیان ہے",
  wlPrivD: "آپ کا ڈیٹا، کمائی اور گفتگو بواریق الشرق کے باہر کوئی نہیں دیکھ سکتا۔",
  wlWhyT: "ہم نے یہ ایپ کیوں بنائی؟",
  wlWhyD: "ڈیلیوری نظام کو بہتر بنانے، رابطہ آسان کرنے اور کمپنی تک براہِ راست رسائی کے لیے۔",
  wlP1T: "آپ کی کمائی واضح", wlP1D: "اکاؤنٹنٹ کی منظوری کے بعد کمائی، آرڈرز اور خلاف ورزیاں دیکھیں۔",
  wlP2T: "سپروائزر سے براہِ راست رابطہ", wlP2D: "ایک ٹیپ میں کال یا واٹس ایپ۔",
  wlP3T: "پیغامات اور سرکلر", wlP3D: "ہر فیصلہ یا الرٹ ایپ میں آپ تک پہنچتا ہے۔",
  wlP4T: "رسیدیں اور درخواستیں", wlP4D: "ایندھن کی رسید اپ لوڈ کریں، کسی دن پر اعتراض کریں، ٹکٹ کھولیں۔",
  wlP5T: "ہم آپ کے ساتھ بڑھتے ہیں", wlP5D: "آپ کی رائے سے ایپ بہتر ہوتی ہے۔",
  wlP6T: "آپ کا حق محفوظ", wlP6D: "ہر رقم صرف اکاؤنٹنٹ کی منظور شدہ قیمت سے بنتی ہے۔",
  wlPledgeT: "ہمارا وعدہ", wlPledgeD: "شفاف حساب، فوری جواب، اور آپ کے وقت کا احترام۔",
  wlStart: "شروع کریں", wlAboutBtn: "ایپ کے بارے میں", rhMySup: "آپ کا سپروائزر", rhCall: "کال",
  forgot: "پاس ورڈ بھول گئے؟", forgotT: "اکاؤنٹ بحالی", forgotSub: "شناختی نمبر اور فون درج کریں؛ درخواست ایچ آر کو جائے گی۔",
  forgotSend: "درخواست بھیجیں", forgotDone: "آپ کی درخواست ایچ آر کو بھیج دی گئی۔", forgotErr: "درست 10 ہندسوں کا شناختی نمبر اور فون درج کریں۔", forgotBack: "لاگ اِن پر واپس",
  rfTitle: "رائیڈر فائلیں", rfSub: "صرف ایچ آر کے لیے: ہر رائیڈر کی معلومات اور ایپ لاگ اِن۔", rfOnlyHr: "یہ سیکشن صرف ایچ آر کے لیے ہے۔",
  rfResets: "اکاؤنٹ بحالی کی درخواستیں", rfUnknown: "غیر رجسٹرڈ شناخت", rfNewPw: "نیا پاس ورڈ", rfGen: "بنائیں", rfRestore: "اکاؤنٹ بحال کریں", rfReject: "مسترد", rfNoMatch: "اس شناخت کا کوئی رائیڈر نہیں۔",
  rfAll: "تمام رائیڈرز", rfSearch: "نام، فون یا شناخت سے تلاش", rfName: "نام", rfPhone: "فون", rfNid: "شناختی نمبر", rfPw: "ایپ پاس ورڈ", rfStatus: "حالت",
  rfActive: "فعال", rfPending: "زیرِ التوا", rfSuspended: "معطل", rfEdit: "ترمیم", rfDupNid: "یہ شناختی نمبر دوسرے رائیڈر کا ہے",
});
Object.assign(T.ar.nav, { riderHome: "الرئيسية", repFiles: "ملفات المناديب", riderWelcome: "عن التطبيق" });
Object.assign(T.en.nav, { riderHome: "Home", repFiles: "Rider Files", riderWelcome: "About the app" });
Object.assign(T.ur.nav, { riderHome: "ہوم", repFiles: "رائیڈر فائلیں", riderWelcome: "ایپ کے بارے میں" });

function repNetFor(rep, month, reports, pricing, repSettlements, wf, vp, receipts) {
  const rec = repSettlements.find((s) => s.month === month);
  const closedLine = rec && rec.closed && rec.snapshot ? rec.snapshot.repLines.find((l) => l.repId === rep.id) : null;
  const entries = monthEntriesFor(reports, rep.id, month);
  const c = repMonthCalc(entries, rep, pricing, wf, vp, monthFactor(month), month);
  if (closedLine) return { net: closedLine.net, final: true, orders: closedLine.orders };
  const inputs = { ...EMPTY_SETTLE_INPUTS, ...((rec && rec.inputs) || {}) };
  const fo = inputs.fineOverride[rep.id] || {};
  const manual = (inputs.manual || []).filter((m) => m.repId === rep.id);
  const adds = manual.filter((m) => m.type === "add").reduce((s, m) => s + m.amount, 0), deds = manual.filter((m) => m.type === "deduct").reduce((s, m) => s + m.amount, 0);
  const reimb = r2((receipts || []).filter((q) => q.repId === rep.id && q.status === "approved" && (q.date || "").startsWith(month)).reduce((sum, q) => sum + (+q.amount || 0), 0));
  return { net: r2(c.gross + adds + reimb - deds - (fo.weekend != null ? +fo.weekend : c.weekendAuto) - (fo.app != null ? +fo.app : c.appAuto)), final: false, orders: c.orders, unpriced: c.unpriced };
}

/* ═══════════  ترحيب المندوب — يظهر عند أول دخول ومتاح دائماً من «عن التطبيق»  ═══════════ */
function RiderWelcome({ lang, rep, onDone, asPage }) {
  const RAx = RA[lang], t = T[lang];
  const pillars = [[Wallet, "wlP1T", "wlP1D"], [MessageSquare, "wlP2T", "wlP2D"], [Users, "wlP3T", "wlP3D"], [Camera, "wlP4T", "wlP4D"], [Rocket, "wlP5T", "wlP5D"], [ShieldCheck, "wlP6T", "wlP6D"]];
  const body = (
    <div className="relative max-w-xl mx-auto px-4 py-6 space-y-5">
      <div className="relative overflow-hidden rounded-[28px] px-5 py-8 text-center" style={{ background: "radial-gradient(120% 140% at 50% 0%,#1B2A4A 0%,#0E1424 55%,#080C18 100%)", border: "1px solid rgba(228,184,92,.35)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(45% 55% at 50% 0%,rgba(228,184,92,.22),transparent 70%)" }} />
        <div className="relative flex flex-col items-center">
          <BigLogo size={96} />
          <p className="text-[12px] font-bold mt-4" style={{ color: "rgba(255,255,255,.6)" }}>{RAx.wlHi}</p>
          <h1 className="gold-text font-extrabold mt-1" style={{ fontSize: "clamp(26px,7vw,38px)", lineHeight: 1.15 }}>{rep ? (lang === "en" ? rep.en : rep.ar) : t.brand}</h1>
          <div className="h-px w-24 my-4" style={{ background: "linear-gradient(90deg,transparent,#E4B85C,transparent)" }} />
          <p className="text-[16px] font-extrabold" style={{ color: "#fff" }}>{RAx.wlJoin}</p>
          <p className="text-[12.5px] mt-2 leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,.78)" }}>{RAx.wlJoinD}</p>
        </div>
      </div>

      <div className="rounded-2xl p-4 flex gap-3 items-start" style={{ background: "rgba(15,165,121,.08)", border: "1px solid rgba(15,165,121,.3)" }}>
        <Lock size={22} style={{ color: "#0B5C46" }} className="shrink-0 mt-0.5" />
        <div><p className="text-[14px] font-extrabold" style={{ color: "#0B5C46" }}>{RAx.wlPrivT}</p><p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: "#12151D" }}>{RAx.wlPrivD}</p></div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--line)" }}>
        <p className="text-[14px] font-extrabold">{RAx.wlWhyT}</p>
        <p className="text-[12.5px] mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>{RAx.wlWhyD}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pillars.map(([Ic, tk, dk]) => (
          <div key={tk} className="rounded-2xl p-4 flex gap-3" style={{ background: "#fff", border: "1px solid var(--line)" }}>
            <span className="grid place-items-center w-11 h-11 rounded-xl shrink-0" style={{ background: "rgba(228,184,92,.16)" }}><Ic size={20} style={{ color: "#B8862E" }} /></span>
            <div><p className="text-[13.5px] font-extrabold">{RAx[tk]}</p><p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>{RAx[dk]}</p></div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg,#0E1424,#1B2A4A)", color: "#fff" }}>
        <p className="text-[14px] font-extrabold gold-text">{RAx.wlPledgeT}</p>
        <p className="text-[12.5px] mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,.82)" }}>{RAx.wlPledgeD}</p>
      </div>

      {onDone && <Btn variant="gold" full icon={Rocket} onClick={onDone}>{RAx.wlStart}</Btn>}
    </div>
  );
  if (asPage) return body;
  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto" style={{ background: "var(--bg, #F5F6F8)" }}>
      <div className="mesh" />
      {body}
    </div>
  );
}
function RiderAboutPage({ lang, activeRep }) { return <RiderWelcome lang={lang} rep={activeRep} asPage />; }

function RiderHome({ onLogout, lang, role, user, activeRep, reps, employees, reports, tickets, repMessages, pricing, repSettlements, weekendFine, violationPenalty, repReceipts, goPage }) {
  const RAx = RA[lang], t = T[lang];
  const [seenW, markW] = usePersonalFlag("welcome_seen_" + user);
  if (!activeRep) return <EmptyHint lang={lang} />;
  const today = riyadhToday(), month = today.slice(0, 7);
  const todayEntries = monthEntriesFor(reports, activeRep.id, month).filter((e) => e.date === today);
  const tOrders = todayEntries.reduce((s, e) => s + (e.orders || 0), 0);
  const me = repNetFor(activeRep, month, reports, pricing, repSettlements, weekendFine, violationPenalty, repReceipts);
  const dd = activeRep.idExpiry ? daysUntil(activeRep.idExpiry) : null;
  const unread = repMessages.filter((m) => m.repId === user && !m.seen).length;
  const openTk = tickets.filter((tk) => tk.repId === user && tk.status === "open").length;
  const sup = (employees || []).find((e) => e.id === activeRep.sup);
  const supPhone = sup && sup.phone ? String(sup.phone).replace(/\D/g, "") : "";
  const tgt = monthTargetOf(pricing, activeRep.app);
  const pct = tgt ? Math.min(100, Math.round((me.orders / tgt) * 100)) : null;
  const Tile = ({ icon: Ic, label, value, onClick, tone }) => (
    <button onClick={onClick} className="rounded-2xl p-4 text-start transition active:scale-[.98]" style={{ background: "#fff", border: "1px solid var(--line)" }}>
      <Ic size={18} style={{ color: tone || role.accent }} /><div className="num text-[22px] font-extrabold mt-2">{value}</div><div className="text-[11.5px]" style={{ color: "var(--muted)" }}>{label}</div>
    </button>
  );
  return (
    <div className="space-y-4">
      {!seenW && <RiderWelcome lang={lang} rep={activeRep} onDone={markW} />}
      <InstallBanner lang={lang} />
      <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0E1424,#1B2A4A)", color: "#fff" }}>
        <p className="text-[12px] opacity-70">{RAx.rhToday} · {today}</p>
        <h2 className="text-[22px] font-extrabold mt-1">{lang === "en" ? activeRep.en : activeRep.ar}</h2>
        {activeRep.riderId && <p className="text-[11.5px] mt-1 opacity-70">{RAx.riderId}: <b className="num">{activeRep.riderId}</b></p>}
        <button onClick={() => goPage("riderWelcome")} className="mt-3 text-[11.5px] font-bold px-3 py-1.5 rounded-xl" style={{ background: "rgba(228,184,92,.16)", border: "1px solid rgba(228,184,92,.4)", color: "#F3D58E" }}>{RAx.wlAboutBtn}</button>
      </div>

      {dd != null && dd <= 30 && (
        <div className="rounded-2xl p-3.5 flex items-center gap-2.5" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.35)" }}>
          <AlertTriangle size={16} style={{ color: "#C0443A" }} className="shrink-0" />
          <p className="text-[12.5px] font-bold" style={{ color: "#9C2F26" }}>{RAx.rhDoc} <span className="num">{Math.max(0, dd)}</span> {RAx.rhDays}</p>
        </div>
      )}

      <button onClick={() => goPage("myEarnings")} className="w-full rounded-3xl p-5 text-start" style={{ background: "#fff", border: "1px solid var(--line)" }}>
        <div className="flex items-center justify-between"><span className="text-[12px] font-semibold" style={{ color: "var(--muted)" }}>{RAx.rhNet}</span><Chip tone={me.final ? "ok" : "warn"} sm>{me.final ? RAx.finalLbl : RAx.estimate}</Chip></div>
        {!me.final && me.unpriced
          ? <p className="text-[14px] font-bold mt-2" style={{ color: "#B8862E" }}>{RAx.noRateYet}</p>
          : <p className="num text-[38px] font-extrabold mt-1" style={{ color: me.net >= 0 ? "#0B5C46" : "#C0443A" }}>{fmt(me.net)} <span className="text-[14px] font-semibold" style={{ color: "var(--muted)" }}>{t.sar}</span></p>}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Tile icon={ShoppingBag} label={`${RAx.rhToday} · ${t.orders}`} value={todayEntries.length ? tOrders : "—"} onClick={() => goPage("myEarnings")} />
        <Tile icon={Route} label={RAx.rhMonthOrders} value={fmt(me.orders)} onClick={() => goPage("myEarnings")} />
      </div>
      {!todayEntries.length && <p className="text-[11.5px] -mt-1 px-1" style={{ color: "var(--muted)" }}>{RAx.rhNoEntry}</p>}

      <div className="grid grid-cols-3 gap-2.5">
        {[["coach", Lx(lang, "مدربي", "Coach")], ["support", Lx(lang, "دعم فوري", "Support")], ["teams", Lx(lang, "فريقي", "My team")], ["myRefer", Lx(lang, "رشّح", "Refer")], ["myScore", Lx(lang, "أدائي", "Score")], ["myWallet", Lx(lang, "محفظتي", "Wallet")], ["academy", Lx(lang, "الأكاديمية", "Academy")], ["myLeave", Lx(lang, "إجازاتي", "Leaves")], ["reportInc", Lx(lang, "بلّغ", "Report")]].map(([id, l]) => { const Ic = NAV_ICON[id]; return (
          <button key={id} onClick={() => goPage(id)} className="flex flex-col items-center gap-1.5 rounded-2xl py-3.5 transition active:scale-95" style={{ background: `rgba(${role.glow},.09)`, border: `1px solid rgba(${role.glow},.25)` }}>
            <Ic size={20} style={{ color: role.accent }} /><span className="text-[11.5px] font-bold">{l}</span></button>); })}
      </div>

      {pct != null && (
        <Panel title={RAx.rhGoal}>
          <div className="flex items-center gap-5">
            <ProgressRing pct={pct} size={104} stroke={10} accent={role.glow} />
            <p className="text-[12.5px]"><b className="num">{me.orders}</b> / {tgt} {t.orders}</p>
          </div>
        </Panel>
      )}

      {sup && (
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--line)" }}>
          <p className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>{RAx.rhMySup}</p>
          <p className="text-[15px] font-extrabold mt-0.5">{sup.name}</p>
          {supPhone && (
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <a href={`tel:+${supPhone.replace(/^00/, "")}`} className="rounded-xl py-2.5 text-center text-[12.5px] font-bold" style={{ background: "rgba(20,27,45,.06)", border: "1px solid var(--line)" }}><Phone size={14} className="inline me-1.5" />{RAx.rhCall}</a>
              <a href={`https://wa.me/${supPhone.replace(/^00/, "").replace(/^0/, "966")}`} target="_blank" rel="noreferrer" className="rounded-xl py-2.5 text-center text-[12.5px] font-bold" style={{ background: "rgba(15,165,121,.12)", border: "1px solid rgba(15,165,121,.35)", color: "#0B5C46" }}><MessageSquare size={14} className="inline me-1.5" />WhatsApp</a>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Tile icon={MessageSquare} label={RAx.rhMsgs} value={unread} onClick={() => goPage("messages")} tone={unread ? "#E8837A" : undefined} />
        <Tile icon={Send} label={RAx.rhTickets} value={openTk} onClick={() => goPage("tickets")} />
      </div>
      <button onClick={() => goPage("riderReceipts")} className="w-full flex items-center gap-3 rounded-2xl p-4 text-start" style={{ background: "#fff", border: "1px solid var(--line)" }}><Camera size={20} style={{ color: role.accent }} /><span className="flex-1 text-[13px] font-bold">{RAx.rhReceipt}</span><ChevronRight size={16} style={{ color: "var(--muted)" }} /></button>
      {onLogout && <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 rounded-2xl p-3.5 text-[13px] font-bold" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.35)", color: "#C0443A" }}><LogOut size={16} />{t.logout}</button>}
    </div>
  );
}

/* ═══════════  ملفات المناديب — قسم مستقل بالموارد البشرية فقط  ═══════════ */
function RepFilesPage({ lang, role, reps, setReps, pwResets, setPwResets, setAuditLog, actingEmployee }) {
  const RAx = RA[lang], x = EX[lang];
  const [q, setQ] = useState("");
  const [editId, setEditId] = useState(null);
  const [f, setF] = useState(null);
  const [show, setShow] = useState({});
  const [err, setErr] = useState("");
  const [newPw, setNewPw] = useState({});
  const canEdit = role.id === "hr";
  if (!canEdit) return <Panel title={RAx.rfTitle}><p className="text-[12.5px]" style={{ color: "var(--muted)" }}>{RAx.rfOnlyHr}</p></Panel>;
  const genPw = () => String(Math.floor(100000 + Math.random() * 900000));
  const list = reps.filter((r) => { const k = q.trim().toLowerCase(); return !k || [r.ar, r.en, r.phone, r.nid, r.riderId].some((v) => String(v || "").toLowerCase().includes(k)); });
  const open = (pwResets || []).filter((z) => z.status === "open");
  const start = (r) => { setEditId(r.id); setErr(""); setF({ name: r.ar, phone: r.phone || "", nid: r.nid || "", riderId: r.riderId || "", password: r.password || "", status: r.status }); };
  const save = () => {
    if (f.name.trim().length < 3) return setErr(x.errRepName);
    if (!/^\d{10}$/.test(f.nid)) return setErr(x.errRepNid);
    if (reps.some((r) => r.id !== editId && r.nid === f.nid)) return setErr(RAx.rfDupNid);
    if (f.riderId.trim() && reps.some((r) => r.id !== editId && String(r.riderId || "").trim() === f.riderId.trim() && r.app === (reps.find((z) => z.id === editId) || {}).app)) return setErr(RA[lang].errRiderDup);
    if (f.password.length < 4) return setErr(x.errRepPass);
    setReps((prev) => prev.map((r) => (r.id === editId ? { ...r, ar: f.name.trim(), en: f.name.trim(), phone: f.phone.trim(), nid: f.nid, riderId: f.riderId.trim(), password: f.password, status: f.status } : r)));
    logAudit(setAuditLog, role, "rep_file_edit", editId, actingEmployee);
    setEditId(null); setF(null); setErr("");
  };
  const restore = (reqId, rep, pw) => {
    if (!rep || pw.length < 4) return;
    setReps((prev) => prev.map((r) => (r.id === rep.id ? { ...r, password: pw, status: "active" } : r)));
    setPwResets((prev) => prev.map((z) => (z.id === reqId ? { ...z, status: "done", doneBy: actingEmployee?.name || role.id, doneAt: riyadhNow().toISOString() } : z)));
    logAudit(setAuditLog, role, "rep_account_restore", rep.id, actingEmployee);
  };
  const inp = (k, label, type) => (
    <label className="block"><span className="block text-[10.5px] mb-1" style={{ color: "var(--muted)" }}>{label}</span>
      {type === "number" ? <NumInput value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST} />
        : <input type={type || "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST} />}</label>
  );
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: `linear-gradient(100deg,rgba(${role.glow},.13),rgba(${role.glow},.03))`, border: `1px solid rgba(${role.glow},.28)` }}>
        <div className="flex items-center gap-2.5 mb-1"><KeyRound size={18} style={{ color: role.accent }} /><h2 className="text-[15px] font-extrabold">{RAx.rfTitle}</h2></div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{RAx.rfSub}</p>
      </div>

      {open.length > 0 && (
        <Panel title={`${RAx.rfResets} (${open.length})`}>
          <div className="space-y-2.5">
            {open.map((z) => {
              const rep = reps.find((r) => r.nid === z.nid);
              const pw = newPw[z.id] ?? "";
              return (
                <div key={z.id} className="rounded-xl p-3" style={{ background: "rgba(228,184,92,.08)", border: "1px solid rgba(228,184,92,.35)" }}>
                  <div className="flex items-center gap-2 flex-wrap text-[12.5px]">
                    <b>{rep ? (lang === "en" ? rep.en : rep.ar) : RAx.rfUnknown}</b>
                    <span className="num" style={{ color: "var(--muted)" }}>{z.nid}</span>{z.phone && <span className="num" style={{ color: "var(--muted)" }}>{z.phone}</span>}
                    <span className="num text-[10.5px] ms-auto" style={{ color: "var(--muted)" }}>{(z.at || "").slice(0, 16).replace("T", " ")}</span>
                  </div>
                  {rep ? (
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <input value={pw} onChange={(e) => setNewPw({ ...newPw, [z.id]: e.target.value })} placeholder={RAx.rfNewPw} className="num rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none w-36" style={INPUT_ST} />
                      <Btn icon={Sparkles} onClick={() => setNewPw({ ...newPw, [z.id]: genPw() })}>{RAx.rfGen}</Btn>
                      <Btn variant="gold" icon={CheckCircle2} onClick={() => restore(z.id, rep, pw)} disabled={pw.length < 4}>{RAx.rfRestore}</Btn>
                      <Btn icon={X} onClick={() => setPwResets((prev) => prev.map((w) => (w.id === z.id ? { ...w, status: "rejected" } : w)))}>{RAx.rfReject}</Btn>
                    </div>
                  ) : <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{RAx.rfNoMatch}</p>}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <Panel title={`${RAx.rfAll} (${list.length})`} extra={<input value={q} onChange={(e) => setQ(e.target.value)} placeholder={RAx.rfSearch} className="rounded-lg px-2.5 py-1.5 text-[12px] outline-none w-44" style={INPUT_ST} />}>
        {list.length === 0 ? <EmptyHint lang={lang} /> : (
          <div className="space-y-2.5">
            {list.map((r) => editId === r.id && f ? (
              <div key={r.id} className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.035)", border: `1px solid rgba(${role.glow},.4)` }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inp("name", RAx.rfName)}{inp("phone", RAx.rfPhone)}{inp("nid", RAx.rfNid)}{inp("riderId", RA[lang].riderId)}{inp("password", RAx.rfPw)}
                  <label className="block"><span className="block text-[10.5px] mb-1" style={{ color: "var(--muted)" }}>{RAx.rfStatus}</span>
                    <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className="w-full rounded-lg px-2.5 py-2 text-[13px] font-bold outline-none" style={INPUT_ST}>
                      <option value="active">{RAx.rfActive}</option><option value="pending">{RAx.rfPending}</option><option value="suspended">{RAx.rfSuspended}</option></select></label>
                </div>
                {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}
                <div className="flex gap-2 mt-3"><Btn variant="gold" icon={CheckCircle2} onClick={save}>{RAx.save}</Btn><Btn onClick={() => { setEditId(null); setF(null); setErr(""); }}>{RAx.cancel}</Btn></div>
              </div>
            ) : (
              <div key={r.id} className="rounded-2xl p-3.5 flex items-center gap-3 flex-wrap" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap"><b className="text-[13.5px]">{lang === "en" ? r.en : r.ar}</b><Chip tone={r.status === "active" ? "ok" : r.status === "pending" ? "warn" : "bad"} sm>{r.status === "active" ? RAx.rfActive : r.status === "pending" ? RAx.rfPending : RAx.rfSuspended}</Chip></div>
                  <div className="num text-[11.5px] mt-1 flex gap-x-4 gap-y-0.5 flex-wrap" style={{ color: "var(--muted)" }}>
                    <span>{RAx.rfPhone}: {r.phone || "—"}</span><span>{RAx.rfNid}: {r.nid || "—"}</span><span>{RA[lang].riderId}: {r.riderId || "—"}</span>
                    <span>{RAx.rfPw}: <b>{show[r.id] ? (r.password || "—") : "••••••"}</b> <button onClick={() => setShow({ ...show, [r.id]: !show[r.id] })} className="align-middle ms-1" aria-label="show">{show[r.id] ? <EyeOff size={13} /> : <Eye size={13} />}</button></span>
                  </div>
                </div>
                <Btn icon={SlidersHorizontal} onClick={() => start(r)}>{RAx.rfEdit}</Btn>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}


function RiderLogin({ lang, setLang, onRep, onForgot, err, setErr, onBack }) {
  const t = T[lang], x = EX[lang], RAx = RA[lang];
  const [nid, setNid] = useState(""); const [pw, setPw] = useState(""); const [local, setLocal] = useState(""); const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("login"); const [fph, setFph] = useState(""); const [sent, setSent] = useState(false);
  const go = () => {
    if (nid.trim().length < 6 || pw.length < 4) { setLocal(x.errRep); return; }
    setLocal(""); setErr(""); setBusy(true); setTimeout(() => { setBusy(false); onRep(nid.trim(), pw); }, 400);
  };
  const sendForgot = () => {
    if (!/^\d{10}$/.test(nid.trim()) || fph.trim().length < 9) { setLocal(RAx.forgotErr); return; }
    setLocal(""); if (onForgot) onForgot(nid.trim(), fph.trim()); setSent(true);
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
            <div><h2 className="text-[17px] font-extrabold">{mode === "login" ? RAx.riderLoginT : RAx.forgotT}</h2><p className="text-[12px]" style={{ color: "var(--muted)" }}>{mode === "login" ? RAx.riderLoginSub : RAx.forgotSub}</p></div>
            <div className="flex gap-1">{LANGS.map((l) => <button key={l.code} onClick={() => setLang(l.code)} className="num px-2 py-1 rounded-lg text-[11px] font-bold" style={{ background: lang === l.code ? "#12151D" : "rgba(20,27,45,.06)", color: lang === l.code ? "#fff" : "var(--muted)" }}>{l.code.toUpperCase()}</button>)}</div>
          </div>
          <GateField label={x.nationalId} val={nid} set={setNid} ph="1xxxxxxxxx" Icon={User} af type="text" accent={REP.accent} onEnter={mode === "login" ? go : sendForgot} />
          {mode === "login" ? (<>
            <GateField label={t.pass} val={pw} set={setPw} ph="••••••••" Icon={Lock} type="password" accent={REP.accent} onEnter={go} />
            {shown && <p className="text-[11.5px] flex items-start gap-1.5" style={{ color: "#C0443A" }}><AlertTriangle size={13} className="mt-px shrink-0" />{shown}</p>}
            <Btn variant="accent" accent={REP.glow} full icon={Fingerprint} onClick={go}>{busy ? "…" : x.repTitle}</Btn>
            <button onClick={() => { setMode("forgot"); setLocal(""); setErr(""); setSent(false); }} className="w-full text-[12.5px] font-bold py-1" style={{ color: "#B8862E" }}>{RAx.forgot}</button>
          </>) : sent ? (<>
            <div className="rounded-xl p-3.5 flex gap-2.5" style={{ background: "rgba(15,165,121,.08)", border: "1px solid rgba(15,165,121,.3)" }}><CheckCircle2 size={18} style={{ color: "#0FA579" }} className="shrink-0" /><p className="text-[12.5px] font-bold" style={{ color: "#0B5C46" }}>{RAx.forgotDone}</p></div>
            <Btn full onClick={() => { setMode("login"); setSent(false); }}>{RAx.forgotBack}</Btn>
          </>) : (<>
            <GateField label={RAx.rfPhone} val={fph} set={setFph} ph="05xxxxxxxx" Icon={Phone} type="tel" accent={REP.accent} onEnter={sendForgot} />
            {shown && <p className="text-[11.5px] flex items-start gap-1.5" style={{ color: "#C0443A" }}><AlertTriangle size={13} className="mt-px shrink-0" />{shown}</p>}
            <Btn variant="accent" accent={REP.glow} full icon={Send} onClick={sendForgot}>{RAx.forgotSend}</Btn>
            <button onClick={() => { setMode("login"); setLocal(""); }} className="w-full text-[12px] font-semibold py-1" style={{ color: "var(--muted)" }}>{RAx.forgotBack}</button>
          </>)}
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
  ldB4T: "تواصل مباشر مع الشركة", ldB4D: "رسائل وتذاكر ومشرف بضغطة — قنوات واضحة بينك وبين بوارق الشرق.",
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
  ldB4T: "Direct line to the company", ldB4D: "Messages, tickets and your supervisor in a tap — clear channels to Bawariq Al-Sharq.",
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
  ldB3T: "متعدد ڈیلیوری ایپس", ldB3D: "ایک منظم کمپنی کے ذریعے کئی ایپس پر کام کریں۔", ldB4T: "کمپنی سے براہِ راست رابطہ", ldB4D: "پیغامات، ٹکٹ اور سپروائزر ایک ٹیپ میں۔",
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

function RiderLanding({ lang, setLang, reps, pricing, go, ext }) {
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
        <div className="rounded-3xl px-5 py-6 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0B5C46,#0FA579)", color: "#fff", boxShadow: "0 12px 34px -12px rgba(11,92,70,.6)" }}>
          <BadgeCheck size={44} className="mx-auto mb-2" style={{ color: "#FFE9A8" }} />
          <p className="font-extrabold leading-tight" style={{ fontSize: "clamp(24px,7.2vw,38px)" }}>{RAx.ldOpenAll}</p>
          <p className="font-bold mt-1.5" style={{ fontSize: "clamp(15px,4.4vw,20px)", color: "#FFE9A8" }}>{RAx.ldOpenAllSub}</p>
        </div>
        <p className="text-center text-[13px] font-semibold" style={{ color: "var(--muted)" }}>{RAx.ldHeadSub}</p>

        <AppAvailCard lang={lang} ext={ext} />
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

function RiderApply({ lang, reps, applications, setApplications, go, ext }) {
  const RAx = RA[lang], x = EX[lang];
  const [f, setF] = useState({ name: "", phone: "", nid: "", idExpiry: "", vehicle: "car", own: true, app: "", city: "", note: "" });
  const [err, setErr] = useState(""); const [done, setDone] = useState(false);
  const openApps = openAppsOf(ext); const selAv = f.app ? appAvailOf(ext, f.app) : null;
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (f.name.trim().length < 3) return setErr(RAx.apErrName);
    if (!/^0?\d{9,10}$/.test(f.phone.replace(/\s/g, ""))) return setErr(RAx.apErrPhone);
    if (!/^\d{10}$/.test(f.nid)) return setErr(RAx.apErrNid);
    if (!f.idExpiry) return setErr(RAx.apErrExpiry);
    if (reps.some((r) => r.nid === f.nid) || applications.some((a) => a.nid === f.nid && a.status !== "rejected")) return setErr(RAx.apDup);
    if (openApps.length > 0 && !f.app) return setErr(Lx(lang, "اختر أحد التطبيقات المتاحة.", "Pick one of the open apps."));
    if (selAv && selAv.cities.length > 0 && !f.city) return setErr(Lx(lang, "اختر مدينتك من مدن هذا التطبيق.", "Pick your city."));
    setErr("");
    setApplications((prev) => [{ id: "APP-" + Date.now(), name: f.name.trim(), phone: f.phone.trim(), nid: f.nid, idExpiry: f.idExpiry, vehicle: f.vehicle, own: f.own, app: f.app, city: f.city, waitlist: openApps.length === 0, note: f.note.trim(), createdAt: riyadhNow().toISOString(), status: "new" }, ...prev]);
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
            <AppAvailCard lang={lang} ext={ext} pick={f.app} onPick={(id) => setF((p) => ({ ...p, app: id, city: "" }))} />
            {selAv && selAv.cities.length > 0 && <div className="mt-2.5"><p className="text-[11px] font-semibold mb-1.5" style={{ color: "var(--muted)" }}>{Lx(lang, "مدينتك", "Your city")}</p><div className="flex flex-wrap gap-1.5">{selAv.cities.map((c) => <button type="button" key={c} onClick={() => set("city")(c)} className="px-3 py-1.5 rounded-full text-[12px] font-bold" style={{ background: f.city === c ? "#12151D" : "rgba(20,27,45,.05)", color: f.city === c ? "#fff" : "inherit" }}>📍 {c}</button>)}</div></div>}</div>
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
                <p className="text-[11.5px] mt-0.5" style={{ color: "var(--muted)" }}>{a.vehicle === "car" ? RAx.apCar : RAx.apBike} · {a.own ? RAx.apOwn : RAx.apNeed} · {a.app ? appName(a.app) : Lx(lang, "قائمة انتظار", "Waitlist")}{a.city ? ` · 📍 ${a.city}` : ""}</p>
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

/* ═══════════════════════════════════════════════════════════════
   الحزمة الموسّعة (bq_ext): مدرب الأرباح، الأداء والنقاط، المحفظة،
   البلاغات، الإجازات، الأكاديمية، + صفحات الإدارة المرتبطة بها
   ═══════════════════════════════════════════════════════════════ */
const EXT0 = {
  wallet: [], incidents: [], leaves: [], courses: [], progress: {}, ratings: {}, redeem: [], bonus: [],
  crm: [], flow: {}, pipe: {}, snapIdx: [], copilot: {}, doneSeen: {}, daily: [],
  cfg: { tol: 0, bonus: 100, bonusMin: 85, bonusTop: 3, dualLimit: 5000, advMaxPct: 30 },
};
const extOf = (ext) => ({ ...EXT0, ...(ext || {}), cfg: { ...EXT0.cfg, ...((ext || {}).cfg || {}) } });
const Lx = (lang, ar, en) => (lang === "en" ? en : ar);
const uidX = (p) => p + "-" + Date.now().toString(36) + Math.floor(Math.random() * 999);
const extUpd = (setExt, key, fn) => setExt((p) => { const cur = (p && p[key]) !== undefined ? p[key] : EXT0[key]; return { ...(p || {}), [key]: fn(cur) }; });
const extCfg = (setExt, patch) => setExt((p) => ({ ...(p || {}), cfg: { ...EXT0.cfg, ...((p || {}).cfg || {}), ...patch } }));
const ADV_CAP = 30; // سقف السلفة: 30% من الصافي الحالي، ثابت ولا يتجاوزه أي إعداد
// إضافة تسوية يدوية (مكافأة/سلفة) داخل كشف شهر المحاسبة نفسه — فتظهر للمندوب والمحاسب
function addManualAdj(setRepSettlements, month, adj) {
  setRepSettlements((prev) => {
    const cur = prev.find((s) => s.month === month);
    if (cur && cur.closed) return prev;
    const base = cur || { id: "SET-" + month, month, closed: false, inputs: EMPTY_SETTLE_INPUTS };
    const inputs = { ...EMPTY_SETTLE_INPUTS, ...base.inputs };
    if ((inputs.manual || []).some((m) => m.id === adj.id)) return prev;
    const next = { ...base, inputs: { ...inputs, manual: [...(inputs.manual || []), { ...adj, at: riyadhNow().toISOString() }] } };
    return cur ? prev.map((s) => (s.month === month ? next : s)) : [next, ...prev];
  });
}
const byName = (role, actingEmployee) => (actingEmployee && actingEmployee.name) || role.id;
const XINP = { background: "#fff", border: "1px solid var(--line-strong)", color: "#12151D" };
function XIn({ value, onChange, ph, type = "text", cls = "" }) {
  if (type === "number") return <NumInput value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} className={`rounded-xl px-3 py-2.5 text-[12.5px] outline-none ${cls}`} style={XINP} />;
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} type={type} className={`rounded-xl px-3 py-2.5 text-[12.5px] outline-none ${cls}`} style={XINP} />;
}
function XBar({ v, color = "#3FD8B4" }) {
  return <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(20,27,45,.08)" }}><div className="h-full rounded-full" style={{ width: Math.round(Math.max(0, Math.min(1, v)) * 100) + "%", background: color }} /></div>;
}
function XTabs({ tabs, tab, setTab }) {
  return <div className="flex gap-2 flex-wrap">{tabs.map(([k, l, n]) => (
    <button key={k} onClick={() => setTab(k)} className="px-4 py-2.5 rounded-xl text-[12.5px] font-bold" style={{ background: tab === k ? "#12151D" : "#fff", color: tab === k ? "#fff" : "var(--muted)", border: "1px solid var(--line)" }}>{l}{n != null && <span className="num"> ({n})</span>}</button>))}</div>;
}
const monthDays = (month) => { const [y, m] = month.split("-").map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); };

/* ─── محرك الأداء: 40 حضور / 30 إنتاجية / 20 تقييم المشرف / 10 مخالفات ─── */
function perfOf(rep, month, reports, attendance, ext, pricing, wf, vp, teamAvg) {
  const E = extOf(ext);
  const entries = monthEntriesFor(reports, rep.id, month);
  const f = monthFactor(month);
  const days = new Set(entries.filter((e) => (e.orders || 0) > 0 || (e.hours || 0) > 0).map((e) => e.date));
  (attendance || []).forEach((a) => { if (a.key === rep.nid && (a.date || "").startsWith(month)) days.add(a.date); });
  const elapsed = Math.max(1, Math.round(monthDays(month) * f));
  let excusedN = 0;
  Object.keys(E.roll || {}).forEach((d) => { if (!d.startsWith(month)) return; const rc = (E.roll[d] || {})[rep.id]; if (!rc) return; if (rc.st === "present") days.add(d); else { days.delete(d); if (rc.excused) excusedN++; } });
  const expected = Math.max(1, Math.round(elapsed * 6 / 7) - excusedN);
  const att = Math.min(1, days.size / expected);
  const c = repMonthCalc(entries, rep, pricing, wf, vp, f, month);
  const tgt = monthTargetOf(pricing, c.main);
  const goal = tgt ? tgt * f : (teamAvg || 0);
  const hasGoal = goal > 0;
  const prod = hasGoal ? Math.min(1, c.orders / goal) : 0.7;
  const rk = E.ratings[rep.id + "|" + month];
  const sup = rk ? rk.stars / 5 : 0.7;
  const viol = c.weekendCount + c.appCount;
  const vs = Math.max(0, 1 - viol / 5);
  const score = Math.round(40 * att + 30 * prod + 20 * sup + 10 * vs);
  return { score, att, prod, sup, vs, rated: !!rk, orders: c.orders, days: days.size, expected, viol, c, goal, hasGoal, target: tgt };
}
const perfLevel = (s, lang) => (s >= 85 ? [Lx(lang, "ممتاز", "Excellent"), "ok"] : s >= 70 ? [Lx(lang, "جيد", "Good"), "info"] : s >= 50 ? [Lx(lang, "مقبول", "Fair"), "warn"] : [Lx(lang, "يحتاج متابعة", "Needs follow-up"), "bad"]);
function teamAvgOrders(reps, month, reports) {
  const act = (reps || []).filter((r) => r.status === "active");
  if (!act.length) return 0;
  const tot = act.reduce((s, r) => s + monthEntriesFor(reports, r.id, month).reduce((a, e) => a + (e.orders || 0), 0), 0);
  return (tot / act.length) * 1.1;
}
/* ─── النقاط والمستويات ─── */
const TIERS = [[0, "bronze", "برونزي", "Bronze", "#B07A45"], [500, "silver", "فضي", "Silver", "#9AA4B2"], [1500, "gold", "ذهبي", "Gold", "#E4B85C"], [3000, "plat", "بلاتيني", "Platinum", "#5BC8E8"]];
const REWARD_CATALOG = [{ id: "c50", cost: 400, amount: 50 }, { id: "c120", cost: 900, amount: 120 }, { id: "c300", cost: 2000, amount: 300 }];
function pointsOf(rep, reports, ext) {
  const E = extOf(ext);
  const months = {};
  reports.forEach((rp) => rp.entries.forEach((e) => {
    if (e.id !== rep.id) return;
    const g = months[rp.date.slice(0, 7)] || (months[rp.date.slice(0, 7)] = { orders: 0, days: new Set(), viol: 0 });
    g.orders += e.orders || 0; if ((e.orders || 0) > 0) g.days.add(rp.date); g.viol += (e.weekendViolations || 0) + (e.appViolations || 0);
  }));
  let earned = 0;
  Object.values(months).forEach((g) => { earned += Math.floor(g.orders / 5) + 5 * g.days.size - 10 * g.viol; });
  earned = Math.max(0, earned);
  const spent = E.redeem.filter((r) => r.repId === rep.id && r.status !== "rejected").reduce((s, r) => s + r.cost, 0);
  const tier = [...TIERS].reverse().find((t) => earned >= t[0]) || TIERS[0];
  const next = TIERS.find((t) => t[0] > earned);
  return { earned, spent, balance: Math.max(0, earned - spent), tier, next };
}

/* ═══════════  مدرب الأرباح (النظام 14) — تطبيق المندوب  ═══════════ */
function CoachPage({ lang, role, activeRep, reps, reports, pricing, repSettlements, weekendFine, violationPenalty, repReceipts, attendance, ext, goPage }) {
  const t = T[lang];
  if (!activeRep) return <EmptyHint lang={lang} />;
  const today = riyadhToday(), month = today.slice(0, 7), dayN = +today.slice(8, 10), dim = monthDays(month);
  const f = monthFactor(month);
  const entries = monthEntriesFor(reports, activeRep.id, month);
  const c = repMonthCalc(entries, activeRep, pricing, weekendFine, violationPenalty, f, month);
  const me = repNetFor(activeRep, month, reports, pricing, repSettlements, weekendFine, violationPenalty, repReceipts);
  const workedSet = new Set(entries.filter((e) => (e.orders || 0) > 0).map((e) => e.date));
  const todayDone = workedSet.has(today);
  const avg = workedSet.size ? c.orders / workedSet.size : 0;
  const workLeft = Math.max(0, Math.round((dim - dayN) * 6 / 7)) + (todayDone ? 0 : 1);
  const projOrders = Math.round(c.orders + avg * workLeft);
  const price = getRepPrice(pricing, c.main);
  const projMain = price ? priceCalc(price, ((c.byApp[c.main] || {}).orders || 0) + Math.round(avg * workLeft), 1).total : 0;
  const nowMain = price ? priceCalc(price, (c.byApp[c.main] || {}).orders || 0, f).total : 0;
  const projNet = Math.max(0, r2(me.net - nowMain + projMain));
  // الخطوة التالية: الشريحة التالية أو الهدف
  let nextT = null, step = null;
  const mainOrders = (c.byApp[c.main] || {}).orders || 0;
  const projMainOrders = mainOrders + Math.round(avg * workLeft);
  if (price && price.mode === "tiers") {
    const th = tiersN(price).map((x) => x.from).filter((v) => v > projMainOrders).sort((a, b) => a - b)[0];
    if (th) { nextT = th; step = r2(priceCalc(price, th, 1).total - priceCalc(price, projMainOrders, 1).total); }
  } else if (price && price.mode === "target") {
    const tg = +price.ordersTarget;
    if (tg > projMainOrders) { nextT = tg; step = r2(priceCalc(price, tg, 1).total - priceCalc(price, projMainOrders, 1).total); }
  }
  const perOrder = price ? (price.mode === "unit" ? +price.perOrder : price.mode === "target" ? (hasBelow(price) && mainOrders < +price.ordersTarget * f ? +price.belowRate : +price.perOrderDelta) : (() => { const ts = tiersN(price); const cur = ts.filter((x) => x.from <= mainOrders).pop(); return cur ? cur.rate : 0; })()) : 0;
  const goalOrders = nextT || Math.round(avg * (workedSet.size + workLeft) * 1.1) || 0;
  const needPerDay = workLeft > 0 && goalOrders > mainOrders ? Math.ceil((goalOrders - mainOrders) / workLeft) : 0;
  // سلسلة الأيام المتواصلة
  let streak = 0; { const d = new Date(today + "T00:00:00Z"); if (!workedSet.has(today)) d.setUTCDate(d.getUTCDate() - 1); for (let i = 0; i < 60; i++) { const k = d.toISOString().slice(0, 10); if (workedSet.has(k)) { streak++; d.setUTCDate(d.getUTCDate() - 1); } else break; } }
  const ta = teamAvgOrders(reps, month, reports);
  const p = perfOf(activeRep, month, reports, attendance, ext, pricing, weekendFine, violationPenalty, ta);
  const pts = pointsOf(activeRep, reports, ext);
  const tips = [];
  if (!todayDone) tips.push(Lx(lang, "لم تُسجَّل لك طلبات اليوم بعد — ابدأ طلبات اليوم لتحافظ على سلسلتك.", "No orders logged for you today yet — start today to keep your streak."));
  if (step && nextT) tips.push(Lx(lang, `بقي لك ${Math.max(0, nextT - projMainOrders)} طلب فوق توقعك لتصل للحد التالي ويرتفع دخلك ${fmt(step)} ر.س.`, `${Math.max(0, nextT - projMainOrders)} more orders beyond your forecast reach the next level and add ${fmt(step)} SAR.`));
  if (p.viol > 0) tips.push(Lx(lang, `لديك ${p.viol} مخالفة هذا الشهر — كل مخالفة تخصم من دخلك وتخفض درجتك.`, `You have ${p.viol} violation(s) this month — each one cuts income and score.`));
  if (p.att < 0.85) tips.push(Lx(lang, "حضورك أقل من المتوقع — كل يوم حضور يرفع درجتك أكثر من أي عامل آخر.", "Attendance is below expected — each attended day lifts your score the most."));
  if (streak >= 5) tips.push(Lx(lang, `ما شاء الله، ${streak} أيام متواصلة — حافظ عليها.`, `${streak} days in a row — keep going.`));
  if (!tips.length) tips.push(Lx(lang, "وتيرتك ممتازة — استمر على نفس الإيقاع.", "Great pace — keep it up."));
  const Card = ({ k, v, sub, tone }) => (
    <div className="rounded-2xl p-3.5" style={{ background: "rgba(20,27,45,.04)", border: "1px solid var(--line)" }}>
      <p className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>{k}</p>
      <p className="num text-[20px] font-extrabold mt-1" style={{ color: tone || "inherit" }}>{v}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>);
  const [lv, lt] = perfLevel(p.score, lang);
  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: "radial-gradient(120% 140% at 50% 0%,#1B2A4A 0%,#0E1424 60%,#080C18 100%)", border: "1px solid rgba(228,184,92,.35)" }}>
        <p className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,.65)" }}>{Lx(lang, "دخلك المتوقع نهاية الشهر", "Expected income at month end")}</p>
        <p className="num gold-text font-extrabold" style={{ fontSize: 40, lineHeight: 1.1 }}>{fmt(Math.round(projNet))} <span className="text-[16px]">{t.sar}</span></p>
        <p className="text-[11.5px] mt-1" style={{ color: "rgba(255,255,255,.6)" }}>{Lx(lang, `تقدير بناءً على متوسطك ${Math.round(avg)} طلب/يوم ومتبقٍ ${workLeft} يوم عمل — الكشف المعتمد هو المرجع.`, `Estimate from your ${Math.round(avg)} orders/day and ${workLeft} working days left — the approved statement is final.`)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card k={Lx(lang, "صافيك حتى الآن", "Net so far")} v={`${fmt(Math.round(me.net))}`} sub={t.sar} />
        <Card k={Lx(lang, "طلباتك / المتوقع", "Orders / forecast")} v={`${c.orders} / ${projOrders}`} sub={Lx(lang, "طلب", "orders")} />
        <Card k={Lx(lang, "قيمة كل طلب إضافي", "Value of each extra order")} v={perOrder ? `${r2(perOrder)}` : "—"} sub={t.sar} tone="#0B5C46" />
        <Card k={Lx(lang, "سلسلة الأيام", "Day streak")} v={streak} sub={Lx(lang, "يوم متواصل", "days in a row")} />
      </div>
      <Panel title={Lx(lang, "خطتك اليوم", "Today's plan")}>
        {nextT ? (
          <div className="space-y-2">
            <p className="text-[13px] leading-relaxed">{Lx(lang, `هدفك التالي ${nextT} طلب. تحتاج حوالي `, `Your next goal is ${nextT} orders. You need about `)}<b className="num">{needPerDay}</b>{Lx(lang, " طلب/يوم من الآن، ويرفع دخلك ", " orders/day from now, adding ")}<b className="num" style={{ color: "#0B5C46" }}>{fmt(step)} {t.sar}</b>.</p>
            <XBar v={nextT ? mainOrders / nextT : 0} />
            <p className="num text-[11px]" style={{ color: "var(--muted)" }}>{mainOrders} / {nextT}</p>
          </div>
        ) : <p className="text-[13px]">{Lx(lang, "لا توجد شريحة أعلى محددة لتسعيرتك حالياً — كل طلب إضافي يزيد دخلك مباشرة.", "No higher tier set for your pricing — each extra order adds directly.")}</p>}
        <div className="mt-3 space-y-1.5">{tips.map((x, i) => <p key={i} className="text-[12px] rounded-xl px-3 py-2" style={{ background: "rgba(228,184,92,.10)", border: "1px solid rgba(228,184,92,.3)" }}>💡 {x}</p>)}</div>
      </Panel>
      <Panel title={Lx(lang, "درجتي ونقاطي", "My score & points")} extra={<Chip tone={lt} sm>{lv}</Chip>}>
        <div className="flex items-end justify-between"><p className="num text-[34px] font-extrabold">{p.score}<span className="text-[14px]" style={{ color: "var(--muted)" }}>/100</span></p>
          <p className="text-[12px] font-bold" style={{ color: pts.tier[4] }}>{Lx(lang, pts.tier[2], pts.tier[3])} · <span className="num">{pts.balance}</span> {Lx(lang, "نقطة", "pts")}</p></div>
        <XBar v={p.score / 100} color={p.score >= 85 ? "#3FD8B4" : p.score >= 70 ? "#5BC8E8" : p.score >= 50 ? "#E4B85C" : "#E8837A"} />
        <div className="grid grid-cols-2 gap-2 mt-3 text-[11.5px]">
          {[[Lx(lang, "الحضور (40)", "Attendance (40)"), p.att], [Lx(lang, "الإنتاجية (30)", "Productivity (30)"), p.prod], [Lx(lang, "تقييم المشرف (20)", "Supervisor (20)"), p.sup], [Lx(lang, "الالتزام (10)", "Compliance (10)"), p.vs]].map(([k, v]) => (
            <div key={k}><div className="flex justify-between mb-1"><span>{k}</span><span className="num">{Math.round(v * 100)}%</span></div><XBar v={v} /></div>))}
        </div>
        <div className="mt-3"><Btn icon={Trophy} onClick={() => goPage("myScore")}>{Lx(lang, "تفاصيل الأداء والمكافآت", "Performance & rewards")}</Btn></div>
      </Panel>
    </div>
  );
}

/* ═══════════  أدائي ونقاطي ومكافآتي  ═══════════ */
function MyScorePage({ lang, role, activeRep, reps, reports, pricing, weekendFine, violationPenalty, attendance, ext, setExt }) {
  const t = T[lang];
  if (!activeRep) return <EmptyHint lang={lang} />;
  const E = extOf(ext), month = riyadhToday().slice(0, 7);
  const p = perfOf(activeRep, month, reports, attendance, ext, pricing, weekendFine, violationPenalty, teamAvgOrders(reps, month, reports));
  const pts = pointsOf(activeRep, reports, ext);
  const mine = E.redeem.filter((r) => r.repId === activeRep.id);
  const myBonus = E.bonus.filter((b) => b.repId === activeRep.id);
  const [msg, setMsg] = useState("");
  const redeem = (rw) => {
    if (pts.balance < rw.cost) return setMsg(Lx(lang, "رصيد نقاطك لا يكفي.", "Not enough points."));
    extUpd(setExt, "redeem", (a) => [{ id: uidX("RD"), repId: activeRep.id, name: activeRep.ar, cost: rw.cost, amount: rw.amount, status: "pending", at: riyadhNow().toISOString() }, ...a]);
    setMsg(Lx(lang, "تم إرسال الطلب لمدير التشغيل.", "Request sent to the Operations Manager."));
  };
  const tone = { pending: "warn", approved: "ok", rejected: "bad" };
  const lbl = { pending: Lx(lang, "قيد المراجعة", "Pending"), approved: Lx(lang, "معتمد", "Approved"), rejected: Lx(lang, "مرفوض", "Rejected") };
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "درجة أدائي هذا الشهر", "My score this month")} extra={<Chip tone={perfLevel(p.score, lang)[1]} sm>{perfLevel(p.score, lang)[0]}</Chip>}>
        <p className="num text-[38px] font-extrabold">{p.score}<span className="text-[14px]" style={{ color: "var(--muted)" }}>/100</span></p>
        <div className="space-y-2 mt-2 text-[12px]">
          <p>{Lx(lang, `الحضور: ${p.days} يوم من ${p.expected} متوقع`, `Attendance: ${p.days} of ${p.expected} expected days`)}</p>
          <p>{p.hasGoal ? Lx(lang, `الإنتاج: ${p.orders} من ${Math.round(p.goal)} طلب`, `Output: ${p.orders} of ${Math.round(p.goal)} orders`) : Lx(lang, "الإنتاج: لا يوجد هدف محدد بعد", "Output: no target set yet")}</p>
          <p>{p.rated ? Lx(lang, "تقييم المشرف: مُسجَّل", "Supervisor rating: recorded") : Lx(lang, "تقييم المشرف: لم يُسجَّل بعد (يُحتسب محايداً)", "Supervisor rating: not yet (neutral)")}</p>
          <p>{Lx(lang, `المخالفات: ${p.viol}`, `Violations: ${p.viol}`)}</p>
        </div>
      </Panel>
      <MyAttendanceCard lang={lang} activeRep={activeRep} ext={ext} setExt={setExt} />
      <Panel title={Lx(lang, "نقاطي ومستواي", "My points & tier")}>
        <p className="text-[22px] font-extrabold" style={{ color: pts.tier[4] }}>{Lx(lang, pts.tier[2], pts.tier[3])}</p>
        <p className="num text-[13px]">{Lx(lang, "الرصيد", "Balance")}: <b>{pts.balance}</b> · {Lx(lang, "المكتسب", "Earned")}: {pts.earned}</p>
        {pts.next && <><XBar v={pts.earned / pts.next[0]} color={pts.next[4]} /><p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>{Lx(lang, `بقي ${pts.next[0] - pts.earned} نقطة للمستوى ${pts.next[2]}`, `${pts.next[0] - pts.earned} pts to ${pts.next[3]}`)}</p></>}
        <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, "كيف تكسب: كل 5 طلبات = نقطة · كل يوم عمل = 5 نقاط · كل مخالفة = -10 نقاط.", "Earn: 5 orders = 1 pt · each working day = 5 pts · each violation = -10 pts.")}</p>
      </Panel>
      <Panel title={Lx(lang, "استبدال النقاط بمكافأة نقدية", "Redeem points for cash")}>
        <div className="grid gap-2 sm:grid-cols-3">{REWARD_CATALOG.map((rw) => (
          <button key={rw.id} onClick={() => redeem(rw)} className="rounded-2xl p-3 text-start" style={{ background: "rgba(228,184,92,.10)", border: "1px solid rgba(228,184,92,.35)" }}>
            <p className="num text-[18px] font-extrabold">{rw.amount} {t.sar}</p><p className="num text-[11.5px]" style={{ color: "var(--muted)" }}>{rw.cost} {Lx(lang, "نقطة", "pts")}</p></button>))}</div>
        {msg && <p className="text-[12px] mt-2 font-bold">{msg}</p>}
        <div className="space-y-1.5 mt-3">{mine.map((r) => <div key={r.id} className="flex items-center justify-between text-[12px] rounded-xl px-3 py-2" style={{ background: "rgba(20,27,45,.035)" }}><span className="num">{r.amount} {t.sar} · {r.cost} {Lx(lang, "نقطة", "pts")}</span><Chip tone={tone[r.status]} sm>{lbl[r.status]}</Chip></div>)}</div>
      </Panel>
      {myBonus.length > 0 && <Panel title={Lx(lang, "مكافآت الأداء المتميز", "Outstanding performance bonuses")}>
        {myBonus.map((b) => <p key={b.id} className="num text-[12.5px]">{b.month} · <b>{b.amount} {t.sar}</b> · {b.status === "approved" ? lbl.approved : lbl[b.status]}</p>)}</Panel>}
    </div>
  );
}

/* ═══════════  محفظتي: سلف + ادخار  ═══════════ */
const walletApproved = (w) => w.status === "approved";
function walletFinal(w, limit) {
  const roles = (w.approvals || []).map((a) => a.role);
  return +w.amount > limit ? roles.includes("fin") && roles.includes("gm") : roles.includes("fin") || roles.includes("gm");
}
function MyWalletPage({ lang, role, activeRep, reports, pricing, repSettlements, weekendFine, violationPenalty, repReceipts, ext, setExt }) {
  const t = T[lang];
  if (!activeRep) return <EmptyHint lang={lang} />;
  const E = extOf(ext), month = riyadhToday().slice(0, 7);
  const me = repNetFor(activeRep, month, reports, pricing, repSettlements, weekendFine, violationPenalty, repReceipts);
  const mine = E.wallet.filter((w) => w.repId === activeRep.id);
  const advMonth = mine.filter((w) => w.kind === "advance" && w.status !== "rejected" && w.status !== "canceled" && w.month === month).reduce((s, w) => s + +w.amount, 0);
  const advPct = Math.min(ADV_CAP, +E.cfg.advMaxPct || ADV_CAP);
  const cap = Math.max(0, Math.floor((me.net * advPct) / 100) - advMonth);
  const saved = mine.filter((w) => w.kind === "saving" && w.status === "approved").reduce((s, w) => s + +w.amount, 0) - mine.filter((w) => w.kind === "withdraw" && w.status === "approved").reduce((s, w) => s + +w.amount, 0);
  const [kind, setKind] = useState("advance"); const [amt, setAmt] = useState(""); const [why, setWhy] = useState(""); const [err, setErr] = useState(""); const [agree, setAgree] = useState(false);
  const send = () => {
    const a = +amt;
    if (!(a > 0)) return setErr(Lx(lang, "اكتب مبلغاً صحيحاً.", "Enter a valid amount."));
    if (kind === "advance" && a > cap) return setErr(Lx(lang, `الحد المتاح لك الآن ${fmt(cap)} ر.س (${advPct}% من صافيك الحالي).`, `Your current limit is ${fmt(cap)} SAR (${advPct}% of net).`));
    if (kind === "withdraw" && a > saved) return setErr(Lx(lang, "المبلغ أكبر من مدخراتك.", "More than your savings."));
    if (kind === "advance" && why.trim().length < 5) return setErr(Lx(lang, "اكتب سبب السلفة.", "Give a reason."));
    if (kind !== "withdraw" && !agree) return setErr(Lx(lang, "يجب الموافقة على الخصم من كشفك.", "You must consent to the deduction."));
    setErr("");
    extUpd(setExt, "wallet", (arr) => [{ id: uidX("WL"), repId: activeRep.id, name: activeRep.ar, kind, amount: a, reason: why.trim(), month, status: "pending", approvals: [], consent: kind !== "withdraw", at: riyadhNow().toISOString() }, ...arr]);
    setAmt(""); setWhy(""); setAgree(false);
  };
  const KL = { advance: Lx(lang, "سلفة", "Advance"), saving: Lx(lang, "ادخار", "Saving"), withdraw: Lx(lang, "سحب ادخار", "Withdraw") };
  const tone = { pending: "warn", approved: "ok", rejected: "bad", canceled: "n" };
  const lbl = { pending: Lx(lang, "قيد الاعتماد", "Pending"), approved: Lx(lang, "معتمد", "Approved"), rejected: Lx(lang, "مرفوض", "Rejected"), canceled: Lx(lang, "ملغي", "Canceled") };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: "rgba(63,216,180,.10)", border: "1px solid rgba(63,216,180,.35)" }}><p className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>{Lx(lang, "الحد المتاح للسلفة", "Advance limit now")}</p><p className="num text-[22px] font-extrabold">{fmt(cap)} <span className="text-[12px]">{t.sar}</span></p></div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(228,184,92,.10)", border: "1px solid rgba(228,184,92,.35)" }}><p className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>{Lx(lang, "مدخراتي", "My savings")}</p><p className="num text-[22px] font-extrabold">{fmt(saved)} <span className="text-[12px]">{t.sar}</span></p></div>
      </div>
      <Panel title={Lx(lang, "طلب جديد", "New request")}>
        <div className="flex gap-2 mb-3">{["advance", "saving", "withdraw"].map((k) => <button key={k} onClick={() => setKind(k)} className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold" style={{ background: kind === k ? "#12151D" : "rgba(20,27,45,.05)", color: kind === k ? "#fff" : "var(--muted)" }}>{KL[k]}</button>)}</div>
        <div className="grid gap-3 sm:grid-cols-2"><XIn value={amt} onChange={setAmt} ph={Lx(lang, "المبلغ", "Amount")} type="number" /><XIn value={why} onChange={setWhy} ph={Lx(lang, "السبب / ملاحظة", "Reason / note")} /></div>
        {kind !== "withdraw" && <label className="flex items-start gap-2 mt-3 text-[11.5px] leading-relaxed cursor-pointer"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />{kind === "advance" ? Lx(lang, "أوافق على خصم هذه السلفة من كشف راتبي الشهري.", "I consent to deducting this advance from my monthly statement.") : Lx(lang, "أوافق طوعاً على اقتطاع هذا المبلغ كادخار من كشفي، ويحق لي سحبه متى شئت.", "I voluntarily agree to set aside this amount as savings and may withdraw it anytime.")}</label>}
        {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}
        <div className="mt-3"><Btn variant="accent" accent={role.glow} icon={Send} onClick={send}>{Lx(lang, "إرسال الطلب", "Send request")}</Btn></div>
      </Panel>
      <Panel title={Lx(lang, "طلباتي", "My requests")}>
        {mine.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لا توجد طلبات.", "No requests.")}</p> : <div className="space-y-2">{mine.map((w) => (
          <div key={w.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <div className="flex-1"><p className="num text-[14px] font-extrabold">{KL[w.kind]} · {fmt(w.amount)} {t.sar}</p><p className="num text-[11px]" style={{ color: "var(--muted)" }}>{(w.at || "").slice(0, 10)}{w.reason ? ` · ${w.reason}` : ""}</p>{w.status === "rejected" && w.why && <p className="text-[11px]" style={{ color: "#C0443A" }}>{w.why}</p>}</div>
            <Chip tone={tone[w.status]} sm>{lbl[w.status]}</Chip>
            {w.status === "pending" && <button onClick={() => extUpd(setExt, "wallet", (arr) => arr.map((z) => (z.id === w.id ? { ...z, status: "canceled" } : z)))} className="text-[11px] font-bold" style={{ color: "#C0443A" }}>{Lx(lang, "إلغاء", "Cancel")}</button>}
          </div>))}</div>}
      </Panel>
    </div>
  );
}

/* ═══════════  بلّغ — الحوادث والمشاكل (المندوب)  ═══════════ */
const INC_TYPES = { accident: ["حادث", "Accident"], theft: ["سرقة / فقدان", "Theft / loss"], fine: ["مخالفة مرورية", "Traffic fine"], breakdown: ["عطل المركبة", "Breakdown"], dispute: ["مشكلة مع عميل/مطعم", "Customer/restaurant issue"], other: ["أخرى", "Other"] };
function ReportIncidentPage({ lang, role, activeRep, ext, setExt }) {
  if (!activeRep) return <EmptyHint lang={lang} />;
  const E = extOf(ext);
  const [f, setF] = useState({ type: "accident", desc: "", urgent: false, photo: null });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const mine = E.incidents.filter((i) => i.repId === activeRep.id);
  const onPhoto = async (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; setBusy(true); try { const d = await compressImage(file); setF((p) => ({ ...p, photo: d })); } catch { setErr(Lx(lang, "تعذّر رفع الصورة.", "Photo failed.")); } setBusy(false); };
  const send = () => {
    if (f.desc.trim().length < 8) return setErr(Lx(lang, "اشرح ما حدث (8 أحرف على الأقل).", "Describe what happened."));
    setErr("");
    extUpd(setExt, "incidents", (a) => [{ id: uidX("INC"), repId: activeRep.id, name: activeRep.ar, sup: activeRep.sup || null, type: f.type, desc: f.desc.trim(), urgent: f.urgent, photo: f.photo, status: "open", notes: [], at: riyadhNow().toISOString() }, ...a]);
    setF({ type: "accident", desc: "", urgent: false, photo: null });
  };
  const tone = { open: "warn", investigating: "info", closed: "ok" };
  const lbl = { open: Lx(lang, "مفتوح", "Open"), investigating: Lx(lang, "قيد المتابعة", "In progress"), closed: Lx(lang, "مغلق", "Closed") };
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "بلّغ عن حادث أو مشكلة", "Report an incident")}>
        <div className="flex gap-2 flex-wrap mb-3">{Object.keys(INC_TYPES).map((k) => <button key={k} onClick={() => setF({ ...f, type: k })} className="px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: f.type === k ? "#12151D" : "rgba(20,27,45,.05)", color: f.type === k ? "#fff" : "var(--muted)" }}>{INC_TYPES[k][lang === "en" ? 1 : 0]}</button>)}</div>
        <textarea value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={3} placeholder={Lx(lang, "ماذا حدث؟ أين؟ هل أُصيب أحد؟", "What happened? Where? Anyone hurt?")} className="w-full rounded-xl px-3 py-2.5 text-[12.5px] outline-none" style={XINP} />
        <label className="flex items-center gap-2 mt-2 text-[12px] font-bold cursor-pointer"><input type="checkbox" checked={f.urgent} onChange={(e) => setF({ ...f, urgent: e.target.checked })} />{Lx(lang, "حالة عاجلة / إصابة", "Urgent / injury")}</label>
        <label className="mt-3 flex items-center gap-3 rounded-2xl p-3 cursor-pointer" style={{ border: "1.5px dashed var(--line-strong)", background: "rgba(20,27,45,.03)" }}>
          {f.photo ? <img src={f.photo} alt="" className="w-14 h-14 rounded-xl object-cover" /> : <Camera size={24} />}<span className="text-[12.5px] font-bold">{busy ? "…" : Lx(lang, "أرفق صورة (اختياري)", "Attach photo (optional)")}</span>
          <input type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" /></label>
        {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}
        <div className="mt-3"><Btn variant="accent" accent={role.glow} icon={Send} onClick={send}>{Lx(lang, "إرسال البلاغ", "Send report")}</Btn></div>
      </Panel>
      <Panel title={Lx(lang, "بلاغاتي", "My reports")}>
        {mine.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لا توجد بلاغات.", "None.")}</p> : <div className="space-y-2">{mine.map((i) => (
          <div key={i.id} className="rounded-xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <div className="flex items-center justify-between"><p className="text-[13px] font-extrabold">{INC_TYPES[i.type][lang === "en" ? 1 : 0]}{i.urgent ? " 🚨" : ""}</p><Chip tone={tone[i.status]} sm>{lbl[i.status]}</Chip></div>
            <p className="text-[12px] mt-1">{i.desc}</p><p className="num text-[10.5px]" style={{ color: "var(--muted)" }}>{(i.at || "").slice(0, 10)}</p>
            {(i.notes || []).map((n, k) => <p key={k} className="text-[11.5px] mt-1" style={{ color: "#0B5C46" }}>↳ {n.text}</p>)}
          </div>))}</div>}
      </Panel>
    </div>
  );
}

/* ═══════════  إجازاتي (المندوب)  ═══════════ */
const LEAVE_KINDS = { annual: ["سنوية", "Annual"], sick: ["مرضية", "Sick"], emergency: ["طارئة", "Emergency"] };
function MyLeavePage({ lang, role, activeRep, ext, setExt }) {
  if (!activeRep) return <EmptyHint lang={lang} />;
  const E = extOf(ext);
  const [f, setF] = useState({ kind: "annual", from: "", to: "", reason: "" }); const [err, setErr] = useState("");
  const mine = E.leaves.filter((l) => l.repId === activeRep.id);
  const send = () => {
    if (!f.from || !f.to || f.to < f.from) return setErr(Lx(lang, "حدّد تاريخ بداية ونهاية صحيحين.", "Pick valid dates."));
    if (f.from < riyadhToday() && f.kind !== "sick") return setErr(Lx(lang, "لا يمكن طلب إجازة بتاريخ سابق (إلا المرضية).", "Past dates only allowed for sick leave."));
    setErr("");
    extUpd(setExt, "leaves", (a) => [{ id: uidX("LV"), repId: activeRep.id, name: activeRep.ar, sup: activeRep.sup || null, ...f, status: "pending", at: riyadhNow().toISOString() }, ...a]);
    setF({ kind: "annual", from: "", to: "", reason: "" });
  };
  const tone = { pending: "warn", approved: "ok", rejected: "bad" };
  const lbl = { pending: Lx(lang, "بانتظار مدير التشغيل", "Awaiting Ops Manager"), approved: Lx(lang, "معتمدة", "Approved"), rejected: Lx(lang, "مرفوضة", "Rejected") };
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "طلب إجازة", "Leave request")}>
        <div className="flex gap-2 mb-3">{Object.keys(LEAVE_KINDS).map((k) => <button key={k} onClick={() => setF({ ...f, kind: k })} className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold" style={{ background: f.kind === k ? "#12151D" : "rgba(20,27,45,.05)", color: f.kind === k ? "#fff" : "var(--muted)" }}>{LEAVE_KINDS[k][lang === "en" ? 1 : 0]}</button>)}</div>
        <div className="grid gap-3 sm:grid-cols-2"><XIn type="date" value={f.from} onChange={(v) => setF({ ...f, from: v })} /><XIn type="date" value={f.to} onChange={(v) => setF({ ...f, to: v })} /></div>
        <div className="mt-3"><XIn value={f.reason} onChange={(v) => setF({ ...f, reason: v })} ph={Lx(lang, "السبب (اختياري)", "Reason (optional)")} cls="w-full" /></div>
        {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}
        <div className="mt-3"><Btn variant="accent" accent={role.glow} icon={Send} onClick={send}>{Lx(lang, "إرسال الطلب", "Send")}</Btn></div>
      </Panel>
      <Panel title={Lx(lang, "طلباتي", "My requests")}>
        {mine.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لا توجد طلبات.", "None.")}</p> : <div className="space-y-2">{mine.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <div className="flex-1"><p className="text-[13px] font-extrabold">{LEAVE_KINDS[l.kind][lang === "en" ? 1 : 0]}</p><p className="num text-[11.5px]" style={{ color: "var(--muted)" }}>{l.from} → {l.to}</p>{l.status === "rejected" && l.why && <p className="text-[11px]" style={{ color: "#C0443A" }}>{l.why}</p>}</div>
            <Chip tone={tone[l.status]} sm>{lbl[l.status]}</Chip></div>))}</div>}
      </Panel>
    </div>
  );
}

/* ═══════════  الأكاديمية (المندوب)  ═══════════ */
const DEFAULT_COURSES = [
  { id: "c-safety", title: ["السلامة على الطريق", "Road safety"], body: ["التزم بالسرعة المحددة، ولا تستخدم الجوال أثناء القيادة، واربط الخوذة دائماً، وتجنّب الطلبات المتتالية بسرعة خطرة. سلامتك أهم من أي طلب.", "Keep to speed limits, never use the phone while riding, always wear a helmet. Your safety beats any order."], mandatory: true, pass: 70,
    quiz: [{ q: ["متى تستخدم الجوال أثناء القيادة؟", "When may you use the phone while riding?"], opts: [["أبداً، أتوقف أولاً", "Never — stop first"], ["عند الازدحام", "In traffic"], ["إذا كان الطلب مستعجلاً", "If order is urgent"]], ans: 0 },
      { q: ["ما أهم أولوية؟", "Top priority?"], opts: [["السرعة", "Speed"], ["السلامة", "Safety"], ["عدد الطلبات", "Order count"]], ans: 1 }] },
  { id: "c-customer", title: ["التعامل مع العميل", "Customer handling"], body: ["حيِّ العميل بلطف، تأكد من الطلب قبل التسليم، وإذا تعذّر الوصول اتصل قبل أي إجراء. لا تجادل العميل أبداً وارفع الأمر لمشرفك.", "Greet politely, verify the order, call before any action if unreachable. Never argue; escalate to your supervisor."], mandatory: true, pass: 70,
    quiz: [{ q: ["العميل غاضب، ماذا تفعل؟", "Customer is angry — what now?"], opts: [["أجادله", "Argue"], ["أهدأ وأبلغ مشرفي", "Stay calm, tell supervisor"], ["أترك الطلب", "Leave order"]], ans: 1 }] },
  { id: "c-earn", title: ["كيف تعظّم أرباحك", "Maximising earnings"], body: ["افهم تسعيرتك: الشرائح تعني أن كل طلب بعد الحد يرفع قيمة طلباتك. حافظ على حضورك، وتجنّب المخالفات لأنها تُخصم، وراجع «مدربي» يومياً.", "Know your pricing: tiers raise value past thresholds. Stay consistent, avoid violations (they are deducted), check your Coach daily."], mandatory: false, pass: 60,
    quiz: [{ q: ["ما الذي يُخصم من أرباحك؟", "What is deducted?"], opts: [["المخالفات", "Violations"], ["الحضور", "Attendance"], ["الشرائح", "Tiers"]], ans: 0 }] },
];
const allCourses = (E) => [...DEFAULT_COURSES, ...(E.courses || [])];
const cTitle = (c, lang) => (Array.isArray(c.title) ? c.title[lang === "en" ? 1 : 0] : c.title);
const cBody = (c, lang) => (Array.isArray(c.body) ? c.body[lang === "en" ? 1 : 0] : c.body);
function AcademyPage({ lang, role, activeRep, ext, setExt }) {
  if (!activeRep) return <EmptyHint lang={lang} />;
  const E = extOf(ext), prog = E.progress[activeRep.id] || {};
  const [open, setOpen] = useState(null); const [ans, setAns] = useState({}); const [res, setRes] = useState(null);
  const courses = allCourses(E);
  const cur = courses.find((c) => c.id === open);
  const submit = () => {
    const right = cur.quiz.filter((q, i) => ans[i] === q.ans).length;
    const pct = Math.round((right / Math.max(1, cur.quiz.length)) * 100);
    const passed = pct >= (cur.pass || 70);
    setRes({ pct, passed });
    extUpd(setExt, "progress", (p) => ({ ...p, [activeRep.id]: { ...(p[activeRep.id] || {}), [cur.id]: { score: pct, passed: passed || !!((p[activeRep.id] || {})[cur.id] || {}).passed, at: riyadhNow().toISOString() } } }));
  };
  if (cur) return (
    <div className="space-y-4">
      <Panel title={cTitle(cur, lang)} extra={<button onClick={() => { setOpen(null); setAns({}); setRes(null); }} className="text-[12px] font-bold">{Lx(lang, "رجوع", "Back")}</button>}>
        <p className="text-[13px] leading-loose">{cBody(cur, lang)}</p>
      </Panel>
      <Panel title={Lx(lang, "اختبار قصير", "Quick quiz")}>
        {cur.quiz.map((q, i) => (
          <div key={i} className="mb-4"><p className="text-[13px] font-bold mb-2">{Array.isArray(q.q) ? q.q[lang === "en" ? 1 : 0] : q.q}</p>
            <div className="space-y-1.5">{q.opts.map((o, k) => <button key={k} onClick={() => setAns({ ...ans, [i]: k })} className="w-full text-start rounded-xl px-3 py-2.5 text-[12.5px] font-bold" style={{ background: ans[i] === k ? "#12151D" : "rgba(20,27,45,.05)", color: ans[i] === k ? "#fff" : "inherit" }}>{Array.isArray(o) ? o[lang === "en" ? 1 : 0] : o}</button>)}</div></div>))}
        {res && <p className="text-[13px] font-extrabold" style={{ color: res.passed ? "#0B5C46" : "#C0443A" }}>{res.passed ? Lx(lang, `نجحت ✔ ${res.pct}%`, `Passed ✔ ${res.pct}%`) : Lx(lang, `لم تنجح ${res.pct}% — راجع الدرس وأعد المحاولة`, `Not passed ${res.pct}% — review and retry`)}</p>}
        <div className="mt-3"><Btn variant="accent" accent={role.glow} onClick={submit} disabled={Object.keys(ans).length < cur.quiz.length}>{Lx(lang, "تسليم الإجابات", "Submit")}</Btn></div>
      </Panel>
    </div>
  );
  const done = courses.filter((c) => (prog[c.id] || {}).passed).length;
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "أكاديمية بوارق", "Bawariq Academy")}><p className="text-[12.5px]">{Lx(lang, `أنجزت ${done} من ${courses.length} دورة`, `${done} of ${courses.length} courses done`)}</p><XBar v={done / Math.max(1, courses.length)} /></Panel>
      {courses.map((c) => { const pr = prog[c.id]; return (
        <button key={c.id} onClick={() => setOpen(c.id)} className="w-full flex items-center gap-3 rounded-2xl p-4 text-start" style={{ background: "#fff", border: "1px solid var(--line)" }}>
          <div className="flex-1"><p className="text-[14px] font-extrabold">{cTitle(c, lang)}</p><p className="text-[11px]" style={{ color: "var(--muted)" }}>{c.mandatory ? Lx(lang, "إلزامية", "Mandatory") : Lx(lang, "اختيارية", "Optional")}{pr ? ` · ${pr.score}%` : ""}</p></div>
          <Chip tone={pr && pr.passed ? "ok" : c.mandatory ? "warn" : "n"} sm>{pr && pr.passed ? Lx(lang, "منجزة", "Done") : Lx(lang, "ابدأ", "Start")}</Chip></button>); })}
    </div>
  );
}

/* ═══════════  صفحات الإدارة للحزمة الموسّعة  ═══════════ */
const EMPTYT = (lang) => <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لا توجد عناصر.", "Nothing here.")}</p>;
const repName = (reps, id, fb) => { const r = (reps || []).find((z) => z.id === id); return r ? r.ar : fb || id; };

/* ─── الأداء والمكافآت (نظام 3 + 9) ─── */
function PerfBoardPage({ lang, role, reps, reports, pricing, weekendFine, violationPenalty, attendance, ext, setExt, setRepSettlements, setAuditLog, actingEmployee, scopeSup }) {
  const t = T[lang], E = extOf(ext);
  const month = riyadhToday().slice(0, 7);
  const [tab, setTab] = useState("board");
  const canApprove = role.id === "opsm" || role.id === "gm";
  const canCfg = role.id === "gm" || role.id === "fin";
  const ta = teamAvgOrders(reps, month, reports);
  const act = reps.filter((r) => r.status === "active");
  const rows = act.map((r) => ({ r, p: perfOf(r, month, reports, attendance, ext, pricing, weekendFine, violationPenalty, ta) })).sort((a, b) => b.p.score - a.p.score);
  const rate = (r, stars) => extUpd(setExt, "ratings", (m) => ({ ...m, [r.id + "|" + month]: { stars, by: byName(role, actingEmployee), at: riyadhNow().toISOString() } }));
  const pendRedeem = E.redeem.filter((x) => x.status === "pending");
  const pendBonus = E.bonus.filter((x) => x.status === "pending");
  const eligible = rows.filter((x) => x.p.score >= E.cfg.bonusMin).slice(0, E.cfg.bonusTop).filter((x) => !E.bonus.some((b) => b.repId === x.r.id && b.month === month));
  const proposeBonus = () => extUpd(setExt, "bonus", (a) => [...eligible.map((x) => ({ id: uidX("BN"), repId: x.r.id, name: x.r.ar, month, amount: E.cfg.bonus, score: x.p.score, status: "pending", at: riyadhNow().toISOString() })), ...a]);
  const decideBonus = (b, ok) => {
    extUpd(setExt, "bonus", (a) => a.map((z) => (z.id === b.id ? { ...z, status: ok ? "approved" : "rejected", by: byName(role, actingEmployee) } : z)));
    if (ok) addManualAdj(setRepSettlements, b.month, { id: "BN-" + b.id, repId: b.repId, type: "add", amount: b.amount, reason: Lx(lang, "مكافأة أداء متميز", "Outstanding performance bonus"), by: byName(role, actingEmployee) });
    logAudit(setAuditLog, role, ok ? "bonus_approved" : "bonus_rejected", `${b.name}: ${b.amount}`, actingEmployee);
  };
  const decideRedeem = (x, ok) => {
    extUpd(setExt, "redeem", (a) => a.map((z) => (z.id === x.id ? { ...z, status: ok ? "approved" : "rejected", by: byName(role, actingEmployee) } : z)));
    if (ok) addManualAdj(setRepSettlements, month, { id: "RD-" + x.id, repId: x.repId, type: "add", amount: x.amount, reason: Lx(lang, "استبدال نقاط", "Points redemption"), by: byName(role, actingEmployee) });
    logAudit(setAuditLog, role, ok ? "redeem_approved" : "redeem_rejected", `${x.name}: ${x.amount}`, actingEmployee);
  };
  return (
    <div className="space-y-4">
      <XTabs tab={tab} setTab={setTab} tabs={[["board", Lx(lang, "لوحة الأداء", "Scoreboard")], ["rewards", Lx(lang, "المكافآت والنقاط", "Rewards"), pendRedeem.length + pendBonus.length], ["cfg", Lx(lang, "الإعدادات", "Settings")]]} />
      {tab === "board" && <Panel title={Lx(lang, `درجات المناديب — ${month}`, `Rider scores — ${month}`)}>
        {rows.length === 0 ? EMPTYT(lang) : <div className="space-y-2">{rows.map(({ r, p }, i) => { const [lv, lt] = perfLevel(p.score, lang); return (
          <div key={r.id} className="rounded-2xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <div className="flex items-center gap-3"><span className="num text-[12px] font-extrabold w-6">{i + 1}</span><p className="flex-1 text-[13px] font-extrabold">{r.ar}</p><span className="num text-[20px] font-extrabold">{p.score}</span><Chip tone={lt} sm>{lv}</Chip></div>
            <div className="grid grid-cols-4 gap-2 mt-2 text-[10.5px]" style={{ color: "var(--muted)" }}>{[[Lx(lang, "حضور", "Att"), p.att], [Lx(lang, "إنتاج", "Prod"), p.prod], [Lx(lang, "تقييم", "Rating"), p.sup], [Lx(lang, "التزام", "Comp"), p.vs]].map(([k, v]) => <div key={k}><div className="flex justify-between"><span>{k}</span><span className="num">{Math.round(v * 100)}</span></div><XBar v={v} /></div>)}</div>
            <div className="flex items-center gap-1 mt-2"><span className="text-[11px] font-bold ml-2">{Lx(lang, "تقييم المشرف:", "Supervisor rating:")}</span>{[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => rate(r, s)} className="text-[18px]" style={{ color: p.rated && (E.ratings[r.id + "|" + month].stars >= s) ? "#E4B85C" : "rgba(20,27,45,.2)" }}>★</button>)}</div>
          </div>); })}</div>}
      </Panel>}
      {tab === "rewards" && <>
        <Panel title={Lx(lang, "مكافآت الأداء المتميز", "Outstanding performance bonuses")} extra={canApprove && eligible.length > 0 ? <Btn variant="accent" accent={role.glow} onClick={proposeBonus}>{Lx(lang, `اقتراح ${eligible.length} مكافأة`, `Propose ${eligible.length}`)}</Btn> : null}>
          <p className="text-[11.5px] mb-2" style={{ color: "var(--muted)" }}>{Lx(lang, `أعلى ${E.cfg.bonusTop} مناديب بدرجة ≥ ${E.cfg.bonusMin} — المبلغ ${E.cfg.bonus} ر.س لكل مندوب، يُضاف تلقائياً لكشفه عند الاعتماد.`, `Top ${E.cfg.bonusTop} riders scoring ≥ ${E.cfg.bonusMin} — ${E.cfg.bonus} SAR each, auto-added to the statement on approval.`)}</p>
          {E.bonus.length === 0 ? EMPTYT(lang) : E.bonus.map((b) => <div key={b.id} className="flex items-center gap-2 rounded-xl px-3 py-2 mb-1.5" style={{ background: "rgba(20,27,45,.035)" }}><span className="flex-1 text-[12.5px] font-bold">{b.name} <span className="num" style={{ color: "var(--muted)" }}>({b.score}) · {b.month} · {b.amount} {t.sar}</span></span>
            {b.status === "pending" && canApprove ? <><Btn variant="accent" accent={role.glow} onClick={() => decideBonus(b, true)}>{Lx(lang, "اعتماد", "Approve")}</Btn><Btn variant="danger" onClick={() => decideBonus(b, false)}>{Lx(lang, "رفض", "Reject")}</Btn></> : <Chip tone={b.status === "approved" ? "ok" : b.status === "rejected" ? "bad" : "warn"} sm>{b.status === "approved" ? Lx(lang, "معتمدة", "Approved") : b.status === "rejected" ? Lx(lang, "مرفوضة", "Rejected") : Lx(lang, "بانتظار الاعتماد", "Pending")}</Chip>}</div>)}
        </Panel>
        <Panel title={Lx(lang, "طلبات استبدال النقاط", "Points redemption requests")}>
          {E.redeem.length === 0 ? EMPTYT(lang) : E.redeem.map((x) => <div key={x.id} className="flex items-center gap-2 rounded-xl px-3 py-2 mb-1.5" style={{ background: "rgba(20,27,45,.035)" }}><span className="flex-1 text-[12.5px] font-bold">{x.name} <span className="num" style={{ color: "var(--muted)" }}>· {x.cost} {Lx(lang, "نقطة", "pts")} → {x.amount} {t.sar}</span></span>
            {x.status === "pending" && canApprove ? <><Btn variant="accent" accent={role.glow} onClick={() => decideRedeem(x, true)}>{Lx(lang, "اعتماد", "Approve")}</Btn><Btn variant="danger" onClick={() => decideRedeem(x, false)}>{Lx(lang, "رفض", "Reject")}</Btn></> : <Chip tone={x.status === "approved" ? "ok" : x.status === "rejected" ? "bad" : "warn"} sm>{x.status}</Chip>}</div>)}
        </Panel></>}
      {tab === "cfg" && <Panel title={Lx(lang, "إعدادات المكافآت", "Reward settings")}>
        {!canCfg && <p className="text-[11.5px] mb-2" style={{ color: "var(--muted)" }}>{Lx(lang, "التعديل للمدير العام والمالية فقط.", "Editable by GM and Finance only.")}</p>}
        <div className="grid gap-3 sm:grid-cols-3">{[["bonus", Lx(lang, "مبلغ المكافأة (ر.س)", "Bonus (SAR)")], ["bonusMin", Lx(lang, "أدنى درجة", "Min score")], ["bonusTop", Lx(lang, "عدد المستحقين شهرياً", "Winners / month")]].map(([k, l]) => <div key={k}><p className="text-[11px] font-bold mb-1">{l}</p><XIn type="number" value={E.cfg[k]} onChange={(v) => canCfg && extCfg(setExt, { [k]: +v })} cls="w-full" /></div>)}</div>
        <p className="text-[11px] mt-3" style={{ color: "var(--muted)" }}>{Lx(lang, "أوزان الدرجة: حضور 40 · إنتاجية 30 · تقييم المشرف 20 · مخالفات 10.", "Weights: attendance 40 · productivity 30 · supervisor 20 · violations 10.")}</p>
      </Panel>}
    </div>
  );
}

/* ─── المحفظة: اعتماد السلف والادخار (نظام 13) — اعتماد مزدوج فوق الحد ─── */
function WalletAdminPage({ lang, role, reps, ext, setExt, setRepSettlements, setAuditLog, actingEmployee }) {
  const t = T[lang], E = extOf(ext), limit = +E.cfg.dualLimit;
  const [tab, setTab] = useState("pending"); const [why, setWhy] = useState({});
  const can = role.id === "fin" || role.id === "gm";
  const list = E.wallet.filter((w) => (tab === "pending" ? w.status === "pending" : w.status === tab));
  const KL = { advance: Lx(lang, "سلفة", "Advance"), saving: Lx(lang, "ادخار", "Saving"), withdraw: Lx(lang, "سحب", "Withdraw") };
  const approve = (w) => {
    const sign = { role: role.id, by: byName(role, actingEmployee), at: riyadhNow().toISOString() };
    const approvals = [...(w.approvals || []).filter((a) => a.role !== role.id), sign];
    const done = walletFinal({ ...w, approvals }, limit);
    extUpd(setExt, "wallet", (a) => a.map((z) => (z.id === w.id ? { ...z, approvals, status: done ? "approved" : "pending" } : z)));
    if (done) {
      const mo = riyadhToday().slice(0, 7);
      const type = w.kind === "withdraw" ? "add" : "deduct";
      addManualAdj(setRepSettlements, mo, { id: "WL-" + w.id, repId: w.repId, type, amount: +w.amount, reason: (w.kind === "advance" ? Lx(lang, "سلفة معتمدة", "Approved advance") : w.kind === "saving" ? Lx(lang, "ادخار اختياري", "Voluntary saving") : Lx(lang, "سحب من الادخار", "Savings withdrawal")), by: sign.by });
      logAudit(setAuditLog, role, "wallet_approved", `${w.name}: ${w.kind} ${w.amount}`, actingEmployee);
    }
  };
  const reject = (w) => { if ((why[w.id] || "").trim().length < 4) return; extUpd(setExt, "wallet", (a) => a.map((z) => (z.id === w.id ? { ...z, status: "rejected", why: why[w.id].trim() } : z))); logAudit(setAuditLog, role, "wallet_rejected", `${w.name}: ${w.amount}`, actingEmployee); };
  const bal = {}; E.wallet.forEach((w) => { if (w.status !== "approved") return; bal[w.repId] = (bal[w.repId] || 0) + (w.kind === "saving" ? +w.amount : w.kind === "withdraw" ? -w.amount : 0); });
  return (
    <div className="space-y-4">
      <XTabs tab={tab} setTab={setTab} tabs={[["pending", Lx(lang, "بانتظار الاعتماد", "Pending"), E.wallet.filter((w) => w.status === "pending").length], ["approved", Lx(lang, "معتمدة", "Approved")], ["rejected", Lx(lang, "مرفوضة", "Rejected")], ["savings", Lx(lang, "أرصدة الادخار", "Savings")]]} />
      <p className="text-[11.5px] rounded-xl px-3 py-2" style={{ background: "rgba(228,184,92,.10)", border: "1px solid rgba(228,184,92,.3)" }}>{Lx(lang, `المبالغ حتى ${fmt(limit)} ر.س تُعتمد من المالية أو المدير العام، وما فوقها يلزمه توقيع المالية والمدير العام معاً. الخصم يتم من كشف الشهر بموافقة المندوب المسجّلة.`, `Up to ${fmt(limit)} SAR: Finance or GM. Above: both Finance and GM must sign. Deducted from the monthly statement with the rider's recorded consent.`)}</p>
      {tab !== "savings" ? <Panel title={Lx(lang, "الطلبات", "Requests")}>
        {list.length === 0 ? EMPTYT(lang) : <div className="space-y-3">{list.map((w) => { const need = +w.amount > limit; const signed = (w.approvals || []).map((a) => a.role); return (
          <div key={w.id} className="rounded-2xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <div className="flex items-center justify-between"><p className="text-[13.5px] font-extrabold">{w.name} · {KL[w.kind]}</p><p className="num text-[18px] font-extrabold">{fmt(w.amount)} {t.sar}</p></div>
            <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{(w.at || "").slice(0, 10)}{w.reason ? ` · ${w.reason}` : ""}{w.consent ? ` · ${Lx(lang, "بموافقة المندوب", "rider consented")}` : ""}</p>
            <div className="flex gap-2 mt-1.5 flex-wrap">{need && <Chip tone="warn" sm>{Lx(lang, "اعتماد مزدوج", "Dual approval")}</Chip>}<Chip tone={signed.includes("fin") ? "ok" : "n"} sm>{Lx(lang, "المالية", "Finance")}</Chip>{need && <Chip tone={signed.includes("gm") ? "ok" : "n"} sm>{Lx(lang, "المدير العام", "GM")}</Chip>}</div>
            {w.status === "rejected" && <p className="text-[11.5px] mt-1" style={{ color: "#C0443A" }}>{w.why}</p>}
            {w.status === "pending" && can && <div className="flex gap-2 mt-2 flex-wrap items-center">{!signed.includes(role.id) && <Btn variant="accent" accent={role.glow} onClick={() => approve(w)}>{Lx(lang, "اعتماد", "Approve")}</Btn>}
              <input value={why[w.id] || ""} onChange={(e) => setWhy({ ...why, [w.id]: e.target.value })} placeholder={Lx(lang, "سبب الرفض", "Reason")} className="flex-1 min-w-[120px] rounded-lg px-2.5 py-2 text-[12px] outline-none" style={XINP} /><Btn variant="danger" onClick={() => reject(w)}>{Lx(lang, "رفض", "Reject")}</Btn></div>}
          </div>); })}</div>}
      </Panel> : <Panel title={Lx(lang, "أرصدة الادخار", "Savings balances")}>{Object.keys(bal).length === 0 ? EMPTYT(lang) : Object.keys(bal).map((id) => <p key={id} className="num text-[13px] py-1">{repName(reps, id)} — <b>{fmt(bal[id])} {t.sar}</b></p>)}</Panel>}
    </div>
  );
}

/* ─── البلاغات والحوادث (نظام 11) ─── */
function IncidentsPage({ lang, role, reps, ext, setExt, setAuditLog, actingEmployee, scopeSup }) {
  const E = extOf(ext); const [tab, setTab] = useState("open"); const [note, setNote] = useState({}); const [view, setView] = useState(null);
  const vis = (i) => (!scopeSup || i.sup === scopeSup) && (role.id !== "legal" || ["accident", "theft", "fine", "dispute"].includes(i.type));
  const all = E.incidents.filter(vis);
  const list = all.filter((i) => (tab === "open" ? i.status !== "closed" : i.status === "closed"));
  const act = (i, status) => { const txt = (note[i.id] || "").trim(); extUpd(setExt, "incidents", (a) => a.map((z) => (z.id === i.id ? { ...z, status, notes: txt ? [...(z.notes || []), { text: txt, by: byName(role, actingEmployee), at: riyadhNow().toISOString() }] : z.notes } : z))); setNote({ ...note, [i.id]: "" }); logAudit(setAuditLog, role, "incident_" + status, `${i.name}: ${i.type}`, actingEmployee); };
  return (
    <div className="space-y-4"><PhotoModal src={view} onClose={() => setView(null)} />
      <XTabs tab={tab} setTab={setTab} tabs={[["open", Lx(lang, "مفتوحة", "Open"), all.filter((i) => i.status !== "closed").length], ["closed", Lx(lang, "مغلقة", "Closed")]]} />
      <Panel title={Lx(lang, "البلاغات", "Incidents")}>
        {list.length === 0 ? EMPTYT(lang) : <div className="space-y-3">{list.map((i) => (
          <div key={i.id} className="rounded-2xl p-3" style={{ background: "rgba(20,27,45,.035)", border: `1px solid ${i.urgent ? "rgba(232,131,122,.5)" : "var(--line)"}` }}>
            <div className="flex items-center justify-between"><p className="text-[13.5px] font-extrabold">{i.name} · {INC_TYPES[i.type][lang === "en" ? 1 : 0]}{i.urgent ? " 🚨" : ""}</p><Chip tone={i.status === "open" ? "warn" : i.status === "investigating" ? "info" : "ok"} sm>{i.status}</Chip></div>
            <p className="text-[12.5px] mt-1">{i.desc}</p><p className="num text-[10.5px]" style={{ color: "var(--muted)" }}>{(i.at || "").slice(0, 16).replace("T", " ")}</p>
            {i.photo && <img src={i.photo} alt="" onClick={() => setView(i.photo)} className="w-20 h-20 rounded-xl object-cover mt-2 cursor-pointer" />}
            {(i.notes || []).map((n, k) => <p key={k} className="text-[11.5px] mt-1" style={{ color: "#0B5C46" }}>↳ {n.by}: {n.text}</p>)}
            {i.status !== "closed" && <div className="flex gap-2 mt-2 flex-wrap"><input value={note[i.id] || ""} onChange={(e) => setNote({ ...note, [i.id]: e.target.value })} placeholder={Lx(lang, "ملاحظة / إجراء", "Note / action")} className="flex-1 min-w-[140px] rounded-lg px-2.5 py-2 text-[12px] outline-none" style={XINP} />
              {i.status === "open" && <Btn onClick={() => act(i, "investigating")}>{Lx(lang, "بدء المتابعة", "Investigate")}</Btn>}<Btn variant="accent" accent={role.glow} onClick={() => act(i, "closed")}>{Lx(lang, "إغلاق", "Close")}</Btn></div>}
          </div>))}</div>}
      </Panel>
    </div>
  );
}

/* ─── الإجازات: اعتماد مدير التشغيل (قرارك رقم 5) ─── */
function LeavesAdminPage({ lang, role, reps, ext, setExt, setAuditLog, actingEmployee, scopeSup }) {
  const E = extOf(ext); const [tab, setTab] = useState("pending"); const [why, setWhy] = useState({});
  const can = role.id === "opsm" || role.id === "gm";
  const all = E.leaves.filter((l) => !scopeSup || l.sup === scopeSup);
  const list = all.filter((l) => l.status === tab);
  const overlap = (l) => E.leaves.filter((z) => z.id !== l.id && z.status === "approved" && z.sup === l.sup && !(z.to < l.from || z.from > l.to)).length;
  const decide = (l, ok) => { if (!ok && (why[l.id] || "").trim().length < 4) return; extUpd(setExt, "leaves", (a) => a.map((z) => (z.id === l.id ? { ...z, status: ok ? "approved" : "rejected", why: ok ? "" : why[l.id].trim(), by: byName(role, actingEmployee) } : z))); logAudit(setAuditLog, role, ok ? "leave_approved" : "leave_rejected", `${l.name}: ${l.from}→${l.to}`, actingEmployee); };
  return (
    <div className="space-y-4">
      <XTabs tab={tab} setTab={setTab} tabs={[["pending", Lx(lang, "بانتظار الاعتماد", "Pending"), all.filter((l) => l.status === "pending").length], ["approved", Lx(lang, "معتمدة", "Approved")], ["rejected", Lx(lang, "مرفوضة", "Rejected")]]} />
      {!can && <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "الاعتماد لمدير التشغيل — الصفحة للاطلاع.", "Approval belongs to the Operations Manager — view only.")}</p>}
      <Panel title={Lx(lang, "طلبات الإجازة", "Leave requests")}>
        {list.length === 0 ? EMPTYT(lang) : <div className="space-y-3">{list.map((l) => (
          <div key={l.id} className="rounded-2xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <p className="text-[13.5px] font-extrabold">{l.name} · {LEAVE_KINDS[l.kind][lang === "en" ? 1 : 0]}</p>
            <p className="num text-[12px]">{l.from} → {l.to}{l.reason ? ` · ${l.reason}` : ""}</p>
            {overlap(l) > 0 && l.status === "pending" && <p className="text-[11.5px] font-bold" style={{ color: "#8A611E" }}>⚠ {Lx(lang, `يتعارض مع ${overlap(l)} إجازة معتمدة لنفس المشرف`, `Overlaps ${overlap(l)} approved leave(s) under same supervisor`)}</p>}
            {l.status === "rejected" && <p className="text-[11.5px]" style={{ color: "#C0443A" }}>{l.why}</p>}
            {l.status === "pending" && can && <div className="flex gap-2 mt-2 flex-wrap"><Btn variant="accent" accent={role.glow} onClick={() => decide(l, true)}>{Lx(lang, "اعتماد", "Approve")}</Btn>
              <input value={why[l.id] || ""} onChange={(e) => setWhy({ ...why, [l.id]: e.target.value })} placeholder={Lx(lang, "سبب الرفض", "Reason")} className="flex-1 min-w-[120px] rounded-lg px-2.5 py-2 text-[12px] outline-none" style={XINP} /><Btn variant="danger" onClick={() => decide(l, false)}>{Lx(lang, "رفض", "Reject")}</Btn></div>}
          </div>))}</div>}
      </Panel>
    </div>
  );
}

/* ─── إدارة التدريب (نظام 12) ─── */
function TrainingAdminPage({ lang, role, reps, ext, setExt }) {
  const E = extOf(ext); const courses = allCourses(E); const can = role.id === "hr" || role.id === "opsm" || role.id === "gm";
  const [f, setF] = useState({ title: "", body: "", mandatory: true, qs: "" }); const [err, setErr] = useState("");
  const add = () => {
    const quiz = f.qs.split("\n").map((l) => l.split("|").map((s) => s.trim())).filter((p) => p.length >= 4).map((p) => ({ q: p[0], opts: p.slice(1, -1), ans: Math.max(0, (+p[p.length - 1] || 1) - 1) }));
    if (f.title.trim().length < 3 || f.body.trim().length < 20) return setErr(Lx(lang, "اكتب عنواناً ومحتوى كافياً.", "Title and content needed."));
    if (!quiz.length) return setErr(Lx(lang, "أضف سؤالاً واحداً على الأقل بالصيغة: السؤال|خيار1|خيار2|رقم الصحيح", "Add at least one question: Q|opt1|opt2|correct-number"));
    setErr(""); extUpd(setExt, "courses", (a) => [...a, { id: uidX("C"), title: f.title.trim(), body: f.body.trim(), mandatory: f.mandatory, pass: 70, quiz }]); setF({ title: "", body: "", mandatory: true, qs: "" });
  };
  const act = reps.filter((r) => r.status === "active"); const mand = courses.filter((c) => c.mandatory);
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "إنجاز الدورات الإلزامية", "Mandatory course completion")}>
        {act.length === 0 ? EMPTYT(lang) : <div className="space-y-1.5">{act.map((r) => { const pr = E.progress[r.id] || {}; const n = mand.filter((c) => (pr[c.id] || {}).passed).length; return (
          <div key={r.id} className="flex items-center gap-3 text-[12.5px]"><span className="flex-1 font-bold">{r.ar}</span><span className="num w-12 text-end">{n}/{mand.length}</span><div className="w-24"><XBar v={n / Math.max(1, mand.length)} /></div></div>); })}</div>}
      </Panel>
      {can && <Panel title={Lx(lang, "دورة جديدة", "New course")}>
        <div className="space-y-2"><XIn value={f.title} onChange={(v) => setF({ ...f, title: v })} ph={Lx(lang, "عنوان الدورة", "Course title")} cls="w-full" />
          <textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} rows={4} placeholder={Lx(lang, "محتوى الدرس", "Lesson content")} className="w-full rounded-xl px-3 py-2.5 text-[12.5px] outline-none" style={XINP} />
          <textarea value={f.qs} onChange={(e) => setF({ ...f, qs: e.target.value })} rows={3} placeholder={Lx(lang, "سؤال في كل سطر: السؤال|خيار1|خيار2|خيار3|رقم الصحيح", "One per line: Q|opt1|opt2|opt3|correct-number")} className="w-full rounded-xl px-3 py-2.5 text-[12.5px] outline-none" style={XINP} />
          <label className="flex items-center gap-2 text-[12px] font-bold"><input type="checkbox" checked={f.mandatory} onChange={(e) => setF({ ...f, mandatory: e.target.checked })} />{Lx(lang, "إلزامية", "Mandatory")}</label>
          {err && <p className="text-[11.5px]" style={{ color: "#C0443A" }}>{err}</p>}<Btn variant="accent" accent={role.glow} onClick={add}>{Lx(lang, "إضافة الدورة", "Add course")}</Btn></div>
      </Panel>}
      <Panel title={Lx(lang, "الدورات", "Courses")}>{courses.map((c) => <p key={c.id} className="text-[12.5px] py-1">• {cTitle(c, lang)} <span style={{ color: "var(--muted)" }}>{c.mandatory ? Lx(lang, "(إلزامية)", "(mandatory)") : ""}</span></p>)}</Panel>
    </div>
  );
}

/* ─── خط سير التسوية الشهرية + مطابقة الفاتورة (نظام 2) — السماحية يضبطها المحاسب، الافتراضي 0 ─── */
const FLOW = ["draft", "ops", "fin", "gm", "paid"];
function SettleFlowPage({ lang, role, reps, reports, ext, setExt, repSettlements, setAuditLog, actingEmployee }) {
  const t = T[lang], E = extOf(ext);
  const [month, setMonth] = useState(riyadhToday().slice(0, 7)); const [note, setNote] = useState("");
  const fl = E.flow[month] || { stage: "draft", log: [] };
  const rec = repSettlements.find((s) => s.month === month);
  const stm = (rec && rec.inputs && rec.inputs.appStatement) || {};
  const diffs = [];
  Object.keys(stm).forEach((appId) => { (stm[appId].rows || []).forEach((row) => {
    const rep = reps.find((r) => String(r.riderId || "").trim() === row.id && r.app === appId); if (!rep) return;
    const mine = monthEntriesFor(reports, rep.id, month).reduce((s, e) => s + ((e.app || rep.app) === appId ? (e.orders || 0) : 0), 0);
    const pct = Math.abs(row.orders - mine) / Math.max(1, mine) * 100;
    if (pct > +E.cfg.tol || (E.cfg.tol === 0 && row.orders !== mine)) diffs.push({ rep, appId, inv: row.orders, mine, pct });
  }); });
  const who = { draft: ["ops", "opsm"], ops: ["opsm"], fin: ["fin"], gm: ["gm"] };
  const next = FLOW[FLOW.indexOf(fl.stage) + 1];
  const mayAdvance = who[fl.stage] && who[fl.stage].includes(role.id);
  const labels = { draft: Lx(lang, "إعداد", "Draft"), ops: Lx(lang, "مراجعة التشغيل", "Ops review"), fin: Lx(lang, "مراجعة المالية", "Finance review"), gm: Lx(lang, "اعتماد المدير العام", "GM approval"), paid: Lx(lang, "تم الصرف", "Paid") };
  const move = (to) => {
    if (to > fl.stage && diffs.length > 0 && fl.stage === "fin" && note.trim().length < 5) return;
    const entry = { from: fl.stage, to, by: byName(role, actingEmployee), role: role.id, note: note.trim(), at: riyadhNow().toISOString() };
    extUpd(setExt, "flow", (m) => ({ ...m, [month]: { stage: to, log: [...((m[month] || {}).log || []), entry] } }));
    logAudit(setAuditLog, role, "settle_flow", `${month}: ${entry.from}→${to}`, actingEmployee); setNote("");
  };
  const back = FLOW[FLOW.indexOf(fl.stage) - 1];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><XIn type="month" value={month} onChange={setMonth} /><Chip tone={rec ? "ok" : "warn"} sm>{rec ? Lx(lang, "يوجد كشف تسوية", "Statement exists") : Lx(lang, "لا كشف بعد", "No statement")}</Chip></div>
      <Panel title={Lx(lang, "مسار الاعتماد", "Approval path")}>
        <div className="flex gap-1.5 flex-wrap mb-3">{FLOW.map((s) => <Chip key={s} tone={s === fl.stage ? "info" : FLOW.indexOf(s) < FLOW.indexOf(fl.stage) ? "ok" : "n"}>{labels[s]}</Chip>)}</div>
        {fl.stage !== "paid" && <div className="space-y-2">
          <XIn value={note} onChange={setNote} ph={Lx(lang, "ملاحظة (إلزامية عند وجود فروقات في مرحلة المالية)", "Note (required with diffs at Finance)")} cls="w-full" />
          <div className="flex gap-2 flex-wrap">{mayAdvance && next && <Btn variant="accent" accent={role.glow} onClick={() => move(next)}>{Lx(lang, "تمرير إلى: ", "Advance to: ")}{labels[next]}</Btn>}
            {back && (who[fl.stage] || []).includes(role.id) && fl.stage !== "draft" && <Btn variant="danger" onClick={() => note.trim().length >= 4 && move(back)}>{Lx(lang, "إرجاع (مع ملاحظة)", "Return (with note)")}</Btn>}</div>
          {!mayAdvance && <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "هذه المرحلة ليست لدورك.", "This stage is not yours.")}</p>}
        </div>}
        {fl.log.length > 0 && <div className="mt-3 space-y-1">{fl.log.map((l, i) => <p key={i} className="text-[11px]" style={{ color: "var(--muted)" }}>{(l.at || "").slice(0, 16).replace("T", " ")} · {l.by}: {labels[l.from]} → {labels[l.to]}{l.note ? ` — ${l.note}` : ""}</p>)}</div>}
      </Panel>
      <Panel title={Lx(lang, "مطابقة فاتورة التطبيق بإدخال المشرفين", "App invoice vs supervisor entries")}>
        <div className="flex items-center gap-2 mb-3 flex-wrap"><span className="text-[12px] font-bold">{Lx(lang, "السماحية %:", "Tolerance %:")}</span>
          <XIn type="number" value={E.cfg.tol} onChange={(v) => (role.id === "fin" || role.id === "gm") && extCfg(setExt, { tol: Math.max(0, +v || 0) })} cls="w-24" /><span className="text-[11px]" style={{ color: "var(--muted)" }}>{Lx(lang, "(0 = أي فرق يُعلَّم)، يضبطها المحاسب.", "(0 = flag any difference), set by accountant.")}</span></div>
        {Object.keys(stm).length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لم تُرفع فواتير تطبيقات لهذا الشهر (من صفحة محاسبة المناديب).", "No app invoices uploaded for this month.")}</p> :
          diffs.length === 0 ? <p className="text-[13px] font-bold" style={{ color: "#0B5C46" }}>✔ {Lx(lang, "لا فروقات خارج السماحية.", "No differences beyond tolerance.")}</p> :
            <div className="space-y-1.5">{diffs.map((d, i) => <div key={i} className="flex items-center gap-2 text-[12.5px] rounded-xl px-3 py-2" style={{ background: "rgba(232,131,122,.08)", border: "1px solid rgba(232,131,122,.25)" }}><span className="flex-1 font-bold">{d.rep.ar}</span><span className="num">{Lx(lang, "الفاتورة", "Invoice")} {d.inv} · {Lx(lang, "المشرف", "Supervisor")} {d.mine}</span><Chip tone="bad" sm>{d.pct.toFixed(1)}%</Chip></div>)}</div>}
      </Panel>
    </div>
  );
}

/* ─── يومي المشرف (نظام 4) ─── */
function DayOpsPage({ lang, role, reps, reports, attendance, ext, goPage }) {
  const E = extOf(ext); const today = riyadhToday();
  const act = reps.filter((r) => r.status === "active");
  const onLeave = (r) => E.leaves.some((l) => l.repId === r.id && l.status === "approved" && l.from <= today && l.to >= today);
  const rows = act.map((r) => { const ents = monthEntriesFor(reports, r.id, today.slice(0, 7)).filter((e) => e.date === today); return { r, orders: ents.reduce((s, e) => s + (e.orders || 0), 0), has: ents.length > 0, in: (attendance || []).some((a) => a.key === r.nid && a.date === today), leave: onLeave(r) }; });
  const missing = rows.filter((x) => !x.has && !x.leave);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">{[[Lx(lang, "مناديب نشطون", "Active"), act.length], [Lx(lang, "سجّلوا اليوم", "Logged today"), rows.filter((x) => x.has).length], [Lx(lang, "لم يسجّلوا", "Missing"), missing.length]].map(([k, v]) => <div key={k} className="rounded-2xl p-3 text-center" style={{ background: "rgba(20,27,45,.04)", border: "1px solid var(--line)" }}><p className="num text-[22px] font-extrabold">{v}</p><p className="text-[11px]" style={{ color: "var(--muted)" }}>{k}</p></div>)}</div>
      <Panel title={Lx(lang, "حالة اليوم", "Today")} extra={<Btn onClick={() => goPage("reports")}>{Lx(lang, "إدخال التقرير اليومي", "Daily report")}</Btn>}>
        {rows.length === 0 ? EMPTYT(lang) : <div className="space-y-1.5">{rows.map(({ r, orders, has, in: ci, leave }) => (
          <div key={r.id} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(20,27,45,.035)" }}>
            <span className="flex-1 text-[12.5px] font-bold">{r.ar}</span>
            {ci && <Chip tone="ok" sm>{Lx(lang, "بصم", "In")}</Chip>}{leave && <Chip tone="info" sm>{Lx(lang, "إجازة", "Leave")}</Chip>}
            <Chip tone={has ? "ok" : leave ? "n" : "warn"} sm>{has ? `${orders} ${Lx(lang, "طلب", "ord")}` : Lx(lang, "بلا تقرير", "No report")}</Chip>
            {r.phone && !has && !leave && <a href={"tel:" + r.phone} className="text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(63,216,180,.15)" }}>{Lx(lang, "اتصال", "Call")}</a>}
          </div>))}</div>}
      </Panel>
    </div>
  );
}

/* ─── مسار التوظيف (نظام 1) ─── */
const PIPE = ["new", "contacted", "interview", "docs", "trial", "hired", "rejected"];
function PipelinePage({ lang, role, applications, reps, ext, setExt }) {
  const E = extOf(ext); const [open, setOpen] = useState(null);
  const L = { new: Lx(lang, "جديد", "New"), contacted: Lx(lang, "تم التواصل", "Contacted"), interview: Lx(lang, "مقابلة", "Interview"), docs: Lx(lang, "مستندات", "Documents"), trial: Lx(lang, "فترة تجربة", "Trial"), hired: Lx(lang, "تم التعيين", "Hired"), rejected: Lx(lang, "مرفوض", "Rejected") };
  const stageOf = (a) => (E.pipe[a.id] || {}).stage || (a.status === "approved" ? "hired" : a.status === "rejected" ? "rejected" : "new");
  const setStage = (a, st) => extUpd(setExt, "pipe", (m) => ({ ...m, [a.id]: { ...(m[a.id] || {}), stage: st, at: riyadhNow().toISOString() } }));
  const toggle = (a, k) => extUpd(setExt, "pipe", (m) => { const cur = m[a.id] || {}; return { ...m, [a.id]: { ...cur, check: { ...(cur.check || {}), [k]: !(cur.check || {})[k] } } }; });
  const CHK = [["id", Lx(lang, "صورة الهوية/الإقامة", "ID copy")], ["lic", Lx(lang, "رخصة القيادة", "License")], ["contract", Lx(lang, "توقيع العقد", "Signed contract")]];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">{PIPE.map((s) => <div key={s} className="rounded-xl p-2 text-center" style={{ background: "rgba(20,27,45,.04)", border: "1px solid var(--line)" }}><p className="num text-[18px] font-extrabold">{applications.filter((a) => stageOf(a) === s).length}</p><p className="text-[10px]" style={{ color: "var(--muted)" }}>{L[s]}</p></div>)}</div>
      <Panel title={Lx(lang, "المتقدمون", "Applicants")}>
        {applications.length === 0 ? EMPTYT(lang) : <div className="space-y-2">{applications.map((a) => { const st = stageOf(a), pr = E.pipe[a.id] || {}; return (
          <div key={a.id} className="rounded-2xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <button onClick={() => setOpen(open === a.id ? null : a.id)} className="w-full flex items-center gap-2 text-start"><span className="flex-1 text-[13px] font-extrabold">{a.name}</span><span className="num text-[11px]" style={{ color: "var(--muted)" }}>{a.phone}</span><Chip tone={st === "hired" ? "ok" : st === "rejected" ? "bad" : "info"} sm>{L[st]}</Chip></button>
            {open === a.id && <div className="mt-2 space-y-2"><div className="flex gap-1.5 flex-wrap">{PIPE.map((s) => <button key={s} onClick={() => setStage(a, s)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold" style={{ background: st === s ? "#12151D" : "rgba(20,27,45,.06)", color: st === s ? "#fff" : "inherit" }}>{L[s]}</button>)}</div>
              <div className="flex gap-3 flex-wrap">{CHK.map(([k, l]) => <label key={k} className="flex items-center gap-1.5 text-[12px]"><input type="checkbox" checked={!!(pr.check || {})[k]} onChange={() => toggle(a, k)} />{l}</label>)}</div>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>{Lx(lang, "التفعيل النهائي وإنشاء حساب المندوب من صفحة التوظيف.", "Final activation is done from the Hiring page.")}</p></div>}
          </div>); })}</div>}
      </Panel>
    </div>
  );
}

/* ─── علاقات العملاء (نظام 7) ─── */
const CRM_ST = ["lead", "talk", "contract", "active", "lost"];
function CrmPage({ lang, role, ext, setExt }) {
  const E = extOf(ext); const [f, setF] = useState({ name: "", phone: "", value: "", note: "" }); const [err, setErr] = useState("");
  const L = { lead: Lx(lang, "عميل محتمل", "Lead"), talk: Lx(lang, "تفاوض", "Negotiation"), contract: Lx(lang, "عقد", "Contract"), active: Lx(lang, "نشط", "Active"), lost: Lx(lang, "خسرناه", "Lost") };
  const add = () => { if (f.name.trim().length < 2) return setErr(Lx(lang, "اكتب اسم العميل.", "Enter a name.")); setErr(""); extUpd(setExt, "crm", (a) => [{ id: uidX("CR"), ...f, name: f.name.trim(), value: +f.value || 0, stage: "lead", at: riyadhNow().toISOString(), next: "" }, ...a]); setF({ name: "", phone: "", value: "", note: "" }); };
  const move = (c, st) => extUpd(setExt, "crm", (a) => a.map((z) => (z.id === c.id ? { ...z, stage: st } : z)));
  const pipe = E.crm.filter((c) => ["lead", "talk", "contract"].includes(c.stage)).reduce((s, c) => s + (+c.value || 0), 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">{CRM_ST.map((s) => <div key={s} className="rounded-xl p-2 text-center" style={{ background: "rgba(20,27,45,.04)", border: "1px solid var(--line)" }}><p className="num text-[18px] font-extrabold">{E.crm.filter((c) => c.stage === s).length}</p><p className="text-[10px]" style={{ color: "var(--muted)" }}>{L[s]}</p></div>)}</div>
      <p className="text-[12px] font-bold">{Lx(lang, "القيمة الشهرية المتوقعة في المسار:", "Pipeline monthly value:")} <span className="num">{fmt(pipe)}</span> {T[lang].sar}</p>
      <Panel title={Lx(lang, "عميل جديد", "New client")}>
        <div className="grid gap-2 sm:grid-cols-4"><XIn value={f.name} onChange={(v) => setF({ ...f, name: v })} ph={Lx(lang, "اسم المطعم/الشركة", "Name")} /><XIn value={f.phone} onChange={(v) => setF({ ...f, phone: v })} ph={Lx(lang, "الجوال", "Phone")} /><XIn type="number" value={f.value} onChange={(v) => setF({ ...f, value: v })} ph={Lx(lang, "قيمة شهرية متوقعة", "Expected monthly")} /><XIn value={f.note} onChange={(v) => setF({ ...f, note: v })} ph={Lx(lang, "ملاحظة", "Note")} /></div>
        {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}<div className="mt-2"><Btn variant="accent" accent={role.glow} icon={Plus} onClick={add}>{Lx(lang, "إضافة", "Add")}</Btn></div>
      </Panel>
      <Panel title={Lx(lang, "العملاء", "Clients")}>{E.crm.length === 0 ? EMPTYT(lang) : <div className="space-y-2">{E.crm.map((c) => (
        <div key={c.id} className="rounded-2xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
          <div className="flex items-center gap-2"><span className="flex-1 text-[13px] font-extrabold">{c.name}</span><span className="num text-[12px]">{fmt(c.value)}</span></div>
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>{c.phone}{c.note ? ` · ${c.note}` : ""}</p>
          <div className="flex gap-1.5 flex-wrap mt-1.5">{CRM_ST.map((s) => <button key={s} onClick={() => move(c, s)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold" style={{ background: c.stage === s ? "#12151D" : "rgba(20,27,45,.06)", color: c.stage === s ? "#fff" : "inherit" }}>{L[s]}</button>)}</div>
        </div>))}</div>}</Panel>
    </div>
  );
}

/* ─── النسخ الاحتياطي التلقائي (نظام 6) ─── */
const SNAP_KEYS = ["bq_reps", "bq_daily_reports", "bq_employees", "bq_rep_settlements", "bq_applications", "bq_pricing", "bq_ext", "bq_rep_receipts", "bq_attendance", "bq_tickets", "bq_expenses", "bq_invoices", "bq_payroll_runs", "bq_contracts", "bq_cases", "bq_dept_security"];
async function takeSnapshot(setExt, date) {
  const out = {};
  for (const k of SNAP_KEYS) { try { const r = await window.storage.get(k, true); if (r && r.value) out[k] = r.value; } catch (e) { /* مفتاح غير موجود */ } }
  await window.storage.set("bq_snap_" + date, JSON.stringify({ date, keys: out }), true);
  let drop = [];
  setExt((p) => { const idx = [...new Set([date, ...(((p || {}).snapIdx) || [])])].sort().reverse(); drop = idx.slice(7); return { ...(p || {}), snapIdx: idx.slice(0, 7) }; });
  setTimeout(() => { drop.forEach((d) => { try { window.storage.delete("bq_snap_" + d, true); } catch (e) { /* تجاهل */ } }); }, 1500);
}
function SnapshotsPage({ lang, role, ext, setExt, setAuditLog, actingEmployee }) {
  const E = extOf(ext); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(""); const [conf, setConf] = useState(null);
  const run = async () => { setBusy(true); setMsg(""); try { await takeSnapshot(setExt, riyadhToday()); setMsg(Lx(lang, "تم حفظ نسخة اليوم.", "Today's snapshot saved.")); } catch (e) { setMsg(Lx(lang, "تعذّر الحفظ.", "Save failed.")); } setBusy(false); };
  const restore = async (d) => {
    setBusy(true);
    try { const r = await window.storage.get("bq_snap_" + d, true); const snap = JSON.parse(r.value);
      await takeSnapshot(setExt, "pre-" + riyadhToday()); // نسخة أمان قبل الاستعادة
      for (const k of Object.keys(snap.keys)) { if (k === "bq_ext") continue; await window.storage.set(k, snap.keys[k], true); }
      logAudit(setAuditLog, role, "snapshot_restore", d, actingEmployee); setMsg(Lx(lang, "تمت الاستعادة — حدّث الصفحة الآن.", "Restored — reload the page now."));
    } catch (e) { setMsg(Lx(lang, "تعذّرت الاستعادة.", "Restore failed.")); }
    setBusy(false); setConf(null);
  };
  const can = role.id === "gm";
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "النسخ الاحتياطي التلقائي", "Automatic snapshots")}>
        <p className="text-[12px] leading-relaxed mb-3">{Lx(lang, "تُحفظ نسخة يومية تلقائياً عند دخول المدير العام، وتبقى آخر 7 نسخ. الاستعادة تعيد بيانات المناديب والتقارير والتسويات والموظفين لحالة النسخة (مع نسخة أمان قبلها).", "A daily snapshot is saved automatically when the GM signs in; the last 7 are kept. Restore rolls back riders, reports, settlements and staff (a safety snapshot is taken first).")}</p>
        <Btn variant="accent" accent={role.glow} icon={Download} onClick={run} disabled={busy}>{Lx(lang, "حفظ نسخة الآن", "Snapshot now")}</Btn>
        {msg && <p className="text-[12px] font-bold mt-2">{msg}</p>}
      </Panel>
      <Panel title={Lx(lang, "النسخ المحفوظة", "Saved snapshots")}>
        {E.snapIdx.length === 0 ? EMPTYT(lang) : E.snapIdx.map((d) => (
          <div key={d} className="flex items-center gap-3 py-2"><span className="num flex-1 text-[13px] font-bold">{d}</span>
            {can && (conf === d ? <><Btn variant="danger" onClick={() => restore(d)} disabled={busy}>{Lx(lang, "تأكيد الاستعادة", "Confirm restore")}</Btn><Btn onClick={() => setConf(null)}>{Lx(lang, "إلغاء", "Cancel")}</Btn></> : <Btn onClick={() => setConf(d)}>{Lx(lang, "استعادة", "Restore")}</Btn>)}</div>))}
      </Panel>
    </div>
  );
}

/* ─── المستشار الذكي: توصيات من البيانات (نظام 8) ─── */
function CopilotPage({ lang, role, reps, reports, pricing, weekendFine, violationPenalty, attendance, ext, setExt, employees, repSettlements }) {
  const E = extOf(ext); const month = riyadhToday().slice(0, 7); const today = riyadhToday();
  const ta = teamAvgOrders(reps, month, reports);
  const act = reps.filter((r) => r.status === "active");
  const recs = [];
  act.forEach((r) => {
    const p = perfOf(r, month, reports, attendance, ext, pricing, weekendFine, violationPenalty, ta);
    if (p.score < 50 && p.days >= 3) recs.push({ id: "low-" + r.id + month, tone: "bad", text: Lx(lang, `${r.ar}: درجة الأداء ${p.score} — جلسة متابعة مع المشرف.`, `${r.ar}: score ${p.score} — schedule a follow-up.`) });
    if (p.score >= E.cfg.bonusMin && p.days >= 5) recs.push({ id: "top-" + r.id + month, tone: "ok", text: Lx(lang, `${r.ar}: أداء ممتاز (${p.score}) — مرشّح للمكافأة.`, `${r.ar}: excellent (${p.score}) — bonus candidate.`) });
    const last = [...new Set(monthEntriesFor(reports, r.id, month).filter((e) => (e.orders || 0) > 0).map((e) => e.date))].sort().pop();
    if (last && daysUntil(last) <= -4) recs.push({ id: "idle-" + r.id + last, tone: "warn", text: Lx(lang, `${r.ar}: بلا طلبات منذ ${-daysUntil(last)} أيام — تواصل معه.`, `${r.ar}: no orders for ${-daysUntil(last)} days — reach out.`) });
    if (r.idExpiry && daysUntil(r.idExpiry) != null && daysUntil(r.idExpiry) <= 30) recs.push({ id: "iq-" + r.id + r.idExpiry, tone: "bad", text: Lx(lang, `${r.ar}: الإقامة تنتهي خلال ${daysUntil(r.idExpiry)} يوم.`, `${r.ar}: residence expires in ${daysUntil(r.idExpiry)} days.`) });
  });
  const unpriced = act.filter((r) => !getRepPrice(pricing, r.app)).length;
  if (unpriced > 0) recs.push({ id: "unpriced" + month, tone: "warn", text: Lx(lang, `${unpriced} مندوب بلا تسعيرة معرّفة لتطبيقهم — اضبط التسعيرة قبل الإقفال.`, `${unpriced} riders have no pricing for their app — set it before closing.`) });
  const noSup = reps.filter((r) => r.status === "active" && !r.sup).length;
  if (noSup > 0) recs.push({ id: "nosup" + month, tone: "warn", text: Lx(lang, `${noSup} مندوب نشط بلا مشرف — لن يظهروا لأي مشرف.`, `${noSup} active riders have no supervisor.`) });
  const seen = E.copilot;
  const open = recs.filter((r) => !seen[r.id]);
  const mark = (id, st) => extUpd(setExt, "copilot", (m) => ({ ...m, [id]: st }));
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "توصيات اليوم", "Today's recommendations")}>
        <p className="text-[11.5px] mb-3" style={{ color: "var(--muted)" }}>{Lx(lang, "توصيات تقوم على قواعد واضحة من بياناتك الفعلية؛ القرار لك دائماً، وما ترفضه لا يظهر لك ثانية.", "Rule-based recommendations from your real data; you always decide, dismissed ones don't return.")}</p>
        {open.length === 0 ? <p className="text-[13px] font-bold" style={{ color: "#0B5C46" }}>✔ {Lx(lang, "لا توصيات معلّقة.", "Nothing pending.")}</p> : <div className="space-y-2">{open.map((r) => (
          <div key={r.id} className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <Chip tone={r.tone} sm>●</Chip><p className="flex-1 text-[12.5px]">{r.text}</p><Btn onClick={() => mark(r.id, "done")}>{Lx(lang, "تم", "Done")}</Btn><Btn variant="danger" onClick={() => mark(r.id, "dismissed")}>{Lx(lang, "تجاهل", "Dismiss")}</Btn></div>))}</div>}
      </Panel>
    </div>
  );
}

/* ─── صندوق المهام الموحّد (نظام 5) ─── */
function InboxPage({ lang, role, reps, ext, decisions, expenses, payrollRuns, repReceipts, applications, goPage, scopeSup }) {
  const E = extOf(ext); const today = riyadhToday();
  const items = []; const add = (n, text, page, tone = "warn") => { if (n > 0) items.push({ n, text, page, tone }); };
  const r = role.id;
  if (r === "fin" || r === "gm") add(E.wallet.filter((w) => w.status === "pending" && (r === "gm" ? +w.amount > E.cfg.dualLimit || !(w.approvals || []).length : !(w.approvals || []).some((a) => a.role === "fin"))).length, Lx(lang, "طلبات سلف/ادخار بانتظار اعتمادك", "Wallet requests awaiting you"), "walletAdmin");
  if (r === "gm" || r === "fin") add(E.daily.filter((d) => d.status === "pending").length, Lx(lang, "سلف يومية تنتظر المدير العام", "Daily advances awaiting GM"), "dailyLedger");
  if (r === "fin") add(repReceipts.filter((q) => q.status === "pending").length, Lx(lang, "إيصالات مناديب للمراجعة", "Receipts to review"), "receiptsAdmin");
  if (r === "gm") { add(decisions.filter((d) => !d.gmApproved).length, Lx(lang, "قرارات بانتظار المدير العام", "Decisions awaiting GM"), "decisions"); add(expenses.filter((e) => e.status === "pending").length, Lx(lang, "مصروفات معلّقة", "Pending expenses"), "expenses"); }
  if (r === "fin" || r === "gm" || r === "opsm") Object.keys(E.flow).forEach((m) => { const st = E.flow[m].stage; if ((st === "fin" && r === "fin") || (st === "gm" && r === "gm") || (st === "ops" && r === "opsm")) add(1, Lx(lang, `تسوية ${m} بانتظار مرحلتك`, `Settlement ${m} awaiting you`), "settleFlow"); });
  if (r === "opsm" || r === "gm") { add(E.leaves.filter((l) => l.status === "pending").length, Lx(lang, "طلبات إجازة", "Leave requests"), "leavesAdmin"); add(E.redeem.filter((x) => x.status === "pending").length + E.bonus.filter((x) => x.status === "pending").length, Lx(lang, "مكافآت/نقاط للاعتماد", "Rewards to approve"), "perfBoard"); }
  if (r === "opsm" || r === "ops" || r === "legal" || r === "gm") add(E.incidents.filter((i) => i.status !== "closed" && (!scopeSup || i.sup === scopeSup)).length, Lx(lang, "بلاغات مفتوحة", "Open incidents"), "incidents", "bad");
  if (r === "hr") { add(applications.filter((a) => !(E.pipe[a.id] || {}).stage && a.status === "new").length, Lx(lang, "متقدمون جدد لم يُراجَعوا", "New applicants"), "pipeline"); add(reps.filter((x) => x.idExpiry && daysUntil(x.idExpiry) != null && daysUntil(x.idExpiry) <= 30).length, Lx(lang, "إقامات تنتهي خلال 30 يوماً", "Residencies expiring ≤30d"), "iqama", "bad");
    const mand = allCourses(E).filter((c) => c.mandatory); add(reps.filter((x) => x.status === "active" && mand.some((c) => !((E.progress[x.id] || {})[c.id] || {}).passed)).length, Lx(lang, "مناديب لم يكملوا الدورات الإلزامية", "Riders missing mandatory courses"), "trainingAdmin"); }
  if (r === "ops" || r === "opsm") { const expectedToday = reps.filter((x) => x.status === "active").length; add(expectedToday > 0 ? 1 : 0, Lx(lang, "راجع حالة التقارير اليومية لليوم", "Review today's daily reports"), "dayOps", "info"); }
  if (r === "gm") add(E.priceReq.filter((q) => q.status === "pending").length, Lx(lang, "طلبات اعتماد التسعيرات", "Pricing approval requests"), "repAccounting", "bad");
  if (r === "hr" || r === "opsm" || r === "gm") { add(E.perfPlans.filter((p) => p.status === "escalated").length, Lx(lang, "خطط أداء مُصعَّدة تنتظر قراراً", "Escalated performance plans"), "perfPlans", "bad"); add(E.offboard.filter((c) => c.status === "open").length, Lx(lang, "حالات مغادرة مفتوحة", "Open offboardings"), "offboard"); }
  if (r === "hr") add(Object.values(E.empDocs || {}).reduce((n, arr) => n + arr.filter((d) => { const x = daysUntil(d.expiry); return x != null && x <= 30; }).length, 0), Lx(lang, "مستندات موظفين تنتهي خلال 30 يوماً", "Staff documents expiring ≤30d"), "empFile");
  return (
    <div className="space-y-3">
      <Panel title={Lx(lang, "مهامك اليوم", "Your tasks today")}>
        {items.length === 0 ? <p className="text-[13px] font-bold" style={{ color: "#0B5C46" }}>✔ {Lx(lang, "لا مهام معلّقة لدورك.", "Nothing pending for your role.")}</p> : <div className="space-y-2">{items.map((it, i) => (
          <button key={i} onClick={() => goPage(it.page)} className="w-full flex items-center gap-3 rounded-2xl p-3.5 text-start" style={{ background: "#fff", border: "1px solid var(--line)" }}>
            <Chip tone={it.tone}>{it.n}</Chip><span className="flex-1 text-[13px] font-bold">{it.text}</span><ChevronLeft size={16} /></button>))}</div>}
      </Panel>
    </div>
  );
}

/* ═══════════  توفّر التطبيقات والمدن (تحدده الموارد البشرية) — يظهر للمتقدم  ═══════════ */
EXT0.appAvail = {};
const appAvailOf = (ext, appId) => { const a = ((ext && ext.appAvail) || {})[appId] || {}; return { open: a.open !== false, cities: a.cities || [], note: a.note || "" }; };
const openAppsOf = (ext) => APPS.filter((a) => appAvailOf(ext, a.id).open);
function AppAvailCard({ lang, ext, pick, onPick }) {
  const open = openAppsOf(ext), busy = APPS.filter((a) => !appAvailOf(ext, a.id).open);
  return (
    <div className="rounded-2xl p-3.5 space-y-2.5" style={{ background: "rgba(63,216,180,.08)", border: "1px solid rgba(63,216,180,.3)" }}>
      <p className="text-[12.5px] font-extrabold">{Lx(lang, "التطبيقات المتاحة للتسجيل الآن", "Apps open for registration now")}</p>
      {open.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لا يوجد تطبيق متاح حالياً. سجّل بياناتك وسنتواصل معك فور فتح باب التسجيل.", "No app is open right now. Register and we will contact you when one opens.")}</p> :
        open.map((a) => { const av = appAvailOf(ext, a.id); const on = pick === a.id; return (
          <button type="button" key={a.id} onClick={() => onPick && onPick(a.id)} className="w-full text-start rounded-xl p-3" style={{ background: on ? "#12151D" : "#fff", color: on ? "#fff" : "inherit", border: `1px solid ${on ? "#12151D" : "var(--line)"}`, cursor: onPick ? "pointer" : "default" }}>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#3FD8B4" }} /><span className="text-[13px] font-extrabold">{a[lang] || a.ar}</span><span className="text-[10.5px] opacity-70">{Lx(lang, "متاح", "Open")}</span></div>
            <div className="flex flex-wrap gap-1.5 mt-2">{av.cities.length ? av.cities.map((c) => <span key={c} className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: on ? "rgba(255,255,255,.16)" : "rgba(63,216,180,.16)" }}>📍 {c}</span>) : <span className="text-[11px] opacity-70">{Lx(lang, "كل المدن التي نغطيها", "All covered cities")}</span>}</div>
            {av.note && <p className="text-[11px] mt-1.5 opacity-80">{av.note}</p>}
          </button>); })}
      {busy.length > 0 && <div className="flex flex-wrap gap-1.5 pt-1">{busy.map((a) => <span key={a.id} className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: "rgba(20,27,45,.06)", color: "var(--muted)", textDecoration: "line-through" }}>{a[lang] || a.ar}</span>)}<span className="text-[11px]" style={{ color: "var(--muted)" }}>{Lx(lang, "— مكتملة حالياً", "— currently full")}</span></div>}
    </div>
  );
}
function AppAvailAdminPage({ lang, role, applications, ext, setExt, setAuditLog, actingEmployee }) {
  const E = extOf(ext); const [city, setCity] = useState({});
  const can = role.id === "hr" || role.id === "opsm" || role.id === "gm";
  const patch = (id, p) => { if (!can) return; extUpd(setExt, "appAvail", (m) => ({ ...m, [id]: { ...(m[id] || {}), ...p } })); logAudit(setAuditLog, role, "app_avail", `${id}: ${JSON.stringify(p).slice(0, 60)}`, actingEmployee); };
  const addCity = (id) => { const v = (city[id] || "").trim(); if (!v) return; const cur = appAvailOf(ext, id).cities; if (!cur.includes(v)) patch(id, { cities: [...cur, v] }); setCity({ ...city, [id]: "" }); };
  const waiting = (id) => applications.filter((a) => a.status === "new" && (a.app === id || (!a.app && a.waitlist))).length;
  return (
    <div className="space-y-4">
      {!can && <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "التعديل للموارد البشرية ومدير التشغيل والمدير العام.", "Editable by HR, Ops Manager and GM.")}</p>}
      <p className="text-[12px] rounded-xl px-3 py-2" style={{ background: "rgba(228,184,92,.10)", border: "1px solid rgba(228,184,92,.3)" }}>{Lx(lang, "ما تفتحه هنا يظهر فوراً للمتقدمين في صفحة التسجيل مع مدن كل تطبيق. التطبيق المغلق يظهر لهم «مكتمل حالياً» ولا يمكن اختياره.", "What you open here shows instantly on the application page with each app's cities. Closed apps appear as full and can't be selected.")}</p>
      <div className="grid gap-3 sm:grid-cols-2">{APPS.map((a) => { const av = appAvailOf(ext, a.id); return (
        <Panel key={a.id} title={a[lang] || a.ar} extra={<button onClick={() => patch(a.id, { open: !av.open })} className="px-3 py-1.5 rounded-full text-[11.5px] font-extrabold" style={{ background: av.open ? "rgba(63,216,180,.2)" : "rgba(232,131,122,.15)", color: av.open ? "#0B5C46" : "#C0443A" }}>{av.open ? Lx(lang, "متاح ✓", "Open ✓") : Lx(lang, "مغلق", "Closed")}</button>}>
          <p className="text-[11px] font-bold mb-1.5">{Lx(lang, "المدن المغطاة", "Covered cities")}</p>
          <div className="flex flex-wrap gap-1.5 mb-2">{av.cities.length === 0 ? <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لم تُحدَّد (تظهر «كل المدن»)", "None set (shows all cities)")}</span> : av.cities.map((c) => <span key={c} className="px-2.5 py-1 rounded-full text-[11.5px] font-bold flex items-center gap-1.5" style={{ background: "rgba(63,216,180,.16)" }}>{c}{can && <button onClick={() => patch(a.id, { cities: av.cities.filter((z) => z !== c) })} style={{ color: "#C0443A" }}>×</button>}</span>)}</div>
          {can && <div className="flex gap-2"><XIn value={city[a.id] || ""} onChange={(v) => setCity({ ...city, [a.id]: v })} ph={Lx(lang, "أضف مدينة (مثال: الدمام)", "Add city")} cls="flex-1" /><Btn onClick={() => addCity(a.id)}>{Lx(lang, "إضافة", "Add")}</Btn></div>}
          <div className="mt-2"><XIn value={av.note} onChange={(v) => patch(a.id, { note: v })} ph={Lx(lang, "ملاحظة تظهر للمتقدم (اختياري)", "Note shown to applicants")} cls="w-full" /></div>
          <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, `متقدمون جدد على هذا التطبيق: ${waiting(a.id)}`, `New applicants for this app: ${waiting(a.id)}`)}</p>
        </Panel>); })}</div>
    </div>
  );
}

/* ═══════════  رادار الاستبقاء + دعم واتساب + ترشيح مندوب + منافسة الفرق  ═══════════ */
const phoneWa = (p) => { const d = String(p || "").replace(/\D/g, ""); if (!d) return ""; return d.startsWith("00") ? d.slice(2) : d.startsWith("0") ? "966" + d.slice(1) : d; };
const totalOrdersOf = (reports, repId) => { let n = 0; reports.forEach((rp) => rp.entries.forEach((e) => { if (e.id === repId) n += e.orders || 0; })); return n; };
EXT0.retention = {}; EXT0.referrals = []; EXT0.contests = [];
EXT0.cfg = { ...EXT0.cfg, refBonus: 100, refMinOrders: 200 };

function churnOf(rep, reports, attendance, ext, pricing, wf, vp) {
  const E = extOf(ext), month = riyadhToday().slice(0, 7), prev = prevMonthStr(month);
  const daysIn = (m) => new Set(monthEntriesFor(reports, rep.id, m).filter((e) => (e.orders || 0) > 0).map((e) => e.date)).size;
  const elapsed = Math.max(1, Math.round(monthDays(month) * monthFactor(month)));
  const cur = daysIn(month) / elapsed, prv = daysIn(prev) / monthDays(prev);
  const signals = []; let pts = 0;
  if (prv > 0.3 && cur < prv * 0.7) { pts += 30; signals.push(["att", cur, prv]); }
  const last = [...new Set(monthEntriesFor(reports, rep.id, month).filter((e) => (e.orders || 0) > 0).map((e) => e.date))].sort().pop();
  const idle = last ? -daysUntil(last) : null;
  if (idle != null && idle >= 4) { pts += 25; signals.push(["idle", idle]); }
  const p = perfOf(rep, month, reports, attendance, ext, pricing, wf, vp, 0);
  if (p.score < 50 && p.days >= 3) { pts += 15; signals.push(["score", p.score]); }
  const advs = E.wallet.filter((w) => w.repId === rep.id && w.kind === "advance" && (w.at || "").slice(0, 10) >= new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10)).length;
  if (advs >= 2) { pts += 15; signals.push(["adv", advs]); }
  if (p.viol >= 3) { pts += 10; signals.push(["viol", p.viol]); }
  return { pts, signals, level: pts >= 50 ? "high" : pts >= 25 ? "mid" : "low", active: daysIn(month) + daysIn(prev) > 0 };
}
function RetentionPage({ lang, role, allReps, reps, allReports, reports, attendance, pricing, weekendFine, violationPenalty, ext, setExt, setAuditLog, actingEmployee, scopeSup }) {
  const E = extOf(ext); const RR = scopeSup ? reps : (allReps || reps); const RP = scopeSup ? reports : (allReports || reports);
  const [note, setNote] = useState({});
  const rows = RR.filter((r) => r.status === "active").map((r) => ({ r, c: churnOf(r, RP, attendance, ext, pricing, weekendFine, violationPenalty) })).filter((x) => x.c.active && x.c.level !== "low").sort((a, b) => b.c.pts - a.c.pts);
  const sig = (s) => s[0] === "att" ? Lx(lang, `انخفض حضوره من ${Math.round(s[2] * 100)}% إلى ${Math.round(s[1] * 100)}%`, `Attendance fell ${Math.round(s[2] * 100)}% → ${Math.round(s[1] * 100)}%`) : s[0] === "idle" ? Lx(lang, `بلا طلبات منذ ${s[1]} أيام`, `No orders for ${s[1]} days`) : s[0] === "score" ? Lx(lang, `درجة الأداء ${s[1]}`, `Score ${s[1]}`) : s[0] === "adv" ? Lx(lang, `${s[1]} طلبات سلفة خلال 60 يوماً`, `${s[1]} advance requests in 60d`) : Lx(lang, `${s[1]} مخالفات هذا الشهر`, `${s[1]} violations this month`);
  const log = (r) => { const txt = (note[r.id] || "").trim(); extUpd(setExt, "retention", (m) => ({ ...m, [r.id]: { at: riyadhNow().toISOString(), by: byName(role, actingEmployee), note: txt } })); setNote({ ...note, [r.id]: "" }); logAudit(setAuditLog, role, "retention_contact", r.ar, actingEmployee); };
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "رادار الاستبقاء — مناديب معرّضون للترك", "Retention radar — riders at risk")}>
        <p className="text-[11.5px] mb-3" style={{ color: "var(--muted)" }}>{Lx(lang, "المؤشرات: هبوط الحضور عن الشهر الماضي، الانقطاع، ضعف الأداء، تكرار السلف، المخالفات. هدفه أن تتحدث مع المندوب قبل أن يغادر، وليس معاقبته.", "Signals: attendance drop, idle days, weak score, repeated advances, violations. The aim is to talk to the rider early, not to penalize.")}</p>
        {rows.length === 0 ? <p className="text-[13px] font-bold" style={{ color: "#0B5C46" }}>✔ {Lx(lang, "لا مناديب في خطر حالياً.", "No riders at risk.")}</p> : <div className="space-y-3">{rows.map(({ r, c }) => { const done = E.retention[r.id]; return (
          <div key={r.id} className="rounded-2xl p-3" style={{ background: "rgba(20,27,45,.035)", border: `1px solid ${c.level === "high" ? "rgba(232,131,122,.5)" : "var(--line)"}` }}>
            <div className="flex items-center gap-2"><span className="flex-1 text-[13.5px] font-extrabold">{r.ar}</span><Chip tone={c.level === "high" ? "bad" : "warn"} sm>{c.level === "high" ? Lx(lang, "خطر مرتفع", "High risk") : Lx(lang, "خطر متوسط", "Medium")} · {c.pts}</Chip></div>
            <div className="mt-1.5 space-y-0.5">{c.signals.map((s, i) => <p key={i} className="text-[12px]">• {sig(s)}</p>)}</div>
            {done && <p className="text-[11px] mt-1" style={{ color: "#0B5C46" }}>✔ {Lx(lang, "تم التواصل", "Contacted")} {done.at.slice(0, 10)} — {done.by}{done.note ? `: ${done.note}` : ""}</p>}
            <div className="flex gap-2 mt-2 flex-wrap items-center"><input value={note[r.id] || ""} onChange={(e) => setNote({ ...note, [r.id]: e.target.value })} placeholder={Lx(lang, "ما دار في الحديث", "What was discussed")} className="flex-1 min-w-[140px] rounded-lg px-2.5 py-2 text-[12px] outline-none" style={XINP} />
              {r.phone && <a href={"https://wa.me/" + phoneWa(r.phone)} target="_blank" rel="noreferrer" className="text-[12px] font-bold px-3 py-2 rounded-xl" style={{ background: "rgba(63,216,180,.18)" }}>{Lx(lang, "واتساب", "WhatsApp")}</a>}
              <Btn variant="accent" accent={role.glow} onClick={() => log(r)}>{Lx(lang, "سجّلت التواصل", "Log contact")}</Btn></div>
          </div>); })}</div>}
      </Panel>
      <LeaveReasonsPanel lang={lang} ext={ext} />
    </div>
  );
}

/* ─── دعم فوري عبر واتساب (المندوب) ─── */
function SupportPage({ lang, role, activeRep, employees }) {
  if (!activeRep) return <EmptyHint lang={lang} />;
  const sup = (employees || []).find((e) => e.id === activeRep.sup);
  const wa = sup && sup.phone ? phoneWa(sup.phone) : "";
  const topics = [[Lx(lang, "عطل في الدراجة/السيارة", "Vehicle breakdown")], [Lx(lang, "مشكلة في طلب", "Order problem")], [Lx(lang, "مشكلة في التطبيق", "App problem")], [Lx(lang, "استفسار عن راتبي", "Pay question")], [Lx(lang, "حادث / حالة طارئة", "Accident / emergency")]];
  const link = (topic) => wa ? "https://wa.me/" + wa + "?text=" + encodeURIComponent(`${Lx(lang, "السلام عليكم، أنا المندوب", "Hello, I'm rider")} ${activeRep.ar} (${Lx(lang, "رقم", "ID")} ${activeRep.riderId || activeRep.nid || ""})\n${Lx(lang, "الموضوع", "Topic")}: ${topic}`) : "";
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "دعم فوري من مشرفك", "Instant support from your supervisor")}>
        {!wa ? <p className="text-[12.5px]">{Lx(lang, "لا يوجد رقم مسجّل لمشرفك بعد. اطلب من الإدارة إضافته، أو افتح تذكرة.", "No supervisor number on file. Ask management to add it, or open a ticket.")}</p> : <>
          <p className="text-[12px] mb-3" style={{ color: "var(--muted)" }}>{Lx(lang, `اختر الموضوع وستفتح محادثة واتساب جاهزة مع ${sup.name}، ومعها اسمك ورقمك.`, `Pick a topic to open a ready WhatsApp chat with ${sup.name} including your name and ID.`)}</p>
          <div className="space-y-2">{topics.map(([tp], i) => <a key={i} href={link(tp)} target="_blank" rel="noreferrer" className="block w-full rounded-2xl px-4 py-3.5 text-[13px] font-extrabold" style={{ background: i === 4 ? "rgba(232,131,122,.12)" : "rgba(63,216,180,.12)", border: `1px solid ${i === 4 ? "rgba(232,131,122,.4)" : "rgba(63,216,180,.35)"}` }}>{tp}</a>)}</div></>}
      </Panel>
    </div>
  );
}

/* ─── ترشيح مندوب (المندوب) ─── */
function MyReferPage({ lang, role, activeRep, allReports, reports, ext, setExt }) {
  const t = T[lang];
  if (!activeRep) return <EmptyHint lang={lang} />;
  const E = extOf(ext); const mine = E.referrals.filter((r) => r.referrerId === activeRep.id);
  const [f, setF] = useState({ name: "", phone: "" }); const [err, setErr] = useState("");
  const send = () => {
    const ph = phoneWa(f.phone);
    if (f.name.trim().length < 3 || ph.length < 9) return setErr(Lx(lang, "اكتب اسمه ورقم جواله الصحيح.", "Enter a name and valid phone."));
    if (E.referrals.some((r) => phoneWa(r.phone) === ph)) return setErr(Lx(lang, "هذا الرقم مرشَّح من قبل.", "This number was already referred."));
    if (phoneWa(activeRep.phone) === ph) return setErr(Lx(lang, "لا يمكنك ترشيح نفسك.", "You can't refer yourself."));
    setErr(""); extUpd(setExt, "referrals", (a) => [{ id: uidX("RF"), referrerId: activeRep.id, referrerName: activeRep.ar, name: f.name.trim(), phone: f.phone.trim(), status: "pending", at: riyadhNow().toISOString() }, ...a]); setF({ name: "", phone: "" });
  };
  const lbl = { pending: Lx(lang, "بانتظار الانضمام", "Waiting to join"), approved: Lx(lang, "تم صرف المكافأة", "Bonus paid"), rejected: Lx(lang, "غير مستحقة", "Not eligible") };
  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5" style={{ background: "rgba(228,184,92,.12)", border: "1px solid rgba(228,184,92,.4)" }}>
        <p className="text-[15px] font-extrabold">{Lx(lang, `رشّح مندوباً واربح ${E.cfg.refBonus} ${t.sar}`, `Refer a rider and earn ${E.cfg.refBonus} ${t.sar}`)}</p>
        <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>{Lx(lang, `تُصرف المكافأة بعد أن ينضم من رشّحته ويُكمل ${E.cfg.refMinOrders} طلباً. تُضاف إلى كشفك تلقائياً.`, `Paid once your referral joins and completes ${E.cfg.refMinOrders} orders. Added to your statement automatically.`)}</p>
      </div>
      <Panel title={Lx(lang, "ترشيح جديد", "New referral")}>
        <div className="grid gap-3 sm:grid-cols-2"><XIn value={f.name} onChange={(v) => setF({ ...f, name: v })} ph={Lx(lang, "اسمه", "Name")} /><XIn value={f.phone} onChange={(v) => setF({ ...f, phone: v })} ph={Lx(lang, "رقم جواله", "Phone")} /></div>
        {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}<div className="mt-3"><Btn variant="accent" accent={role.glow} icon={Send} onClick={send}>{Lx(lang, "إرسال الترشيح", "Submit")}</Btn></div>
      </Panel>
      <Panel title={Lx(lang, "ترشيحاتي", "My referrals")}>
        {mine.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لا ترشيحات بعد.", "None yet.")}</p> : mine.map((r) => <div key={r.id} className="flex items-center gap-2 py-1.5 text-[12.5px]"><span className="flex-1 font-bold">{r.name}</span><Chip tone={r.status === "approved" ? "ok" : r.status === "rejected" ? "bad" : "warn"} sm>{lbl[r.status]}</Chip></div>)}
      </Panel>
    </div>
  );
}
function ReferralsAdminPage({ lang, role, allReps, reps, allReports, reports, ext, setExt, setRepSettlements, setAuditLog, actingEmployee }) {
  const t = T[lang], E = extOf(ext); const RR = allReps || reps, RP = allReports || reports;
  const can = role.id === "hr" || role.id === "opsm" || role.id === "gm" || role.id === "fin";
  const [tab, setTab] = useState("pending");
  const info = (rf) => { const rep = RR.find((r) => phoneWa(r.phone) === phoneWa(rf.phone)); const orders = rep ? totalOrdersOf(RP, rep.id) : 0; return { rep, orders, ok: !!rep && rep.status === "active" && orders >= E.cfg.refMinOrders && rep.id !== rf.referrerId }; };
  const pay = (rf) => { const mo = riyadhToday().slice(0, 7); extUpd(setExt, "referrals", (a) => a.map((z) => (z.id === rf.id ? { ...z, status: "approved", by: byName(role, actingEmployee) } : z))); addManualAdj(setRepSettlements, mo, { id: "RF-" + rf.id, repId: rf.referrerId, type: "add", amount: +E.cfg.refBonus, reason: Lx(lang, "مكافأة ترشيح مندوب", "Referral bonus"), by: byName(role, actingEmployee) }); logAudit(setAuditLog, role, "referral_paid", `${rf.referrerName} → ${rf.name}`, actingEmployee); };
  const list = E.referrals.filter((r) => r.status === tab);
  return (
    <div className="space-y-4">
      <XTabs tab={tab} setTab={setTab} tabs={[["pending", Lx(lang, "قيد المتابعة", "Pending"), E.referrals.filter((r) => r.status === "pending").length], ["approved", Lx(lang, "مصروفة", "Paid")], ["rejected", Lx(lang, "مرفوضة", "Rejected")]]} />
      <Panel title={Lx(lang, "ترشيحات المناديب", "Rider referrals")} extra={(role.id === "gm" || role.id === "fin") ? <div className="flex gap-2 items-center"><XIn type="number" value={E.cfg.refBonus} onChange={(v) => extCfg(setExt, { refBonus: +v || 0 })} cls="w-20" /><XIn type="number" value={E.cfg.refMinOrders} onChange={(v) => extCfg(setExt, { refMinOrders: +v || 0 })} cls="w-20" /></div> : null}>
        {list.length === 0 ? EMPTYT(lang) : <div className="space-y-2">{list.map((rf) => { const i = info(rf); return (
          <div key={rf.id} className="rounded-2xl p-3" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
            <p className="text-[13px] font-extrabold">{rf.referrerName} ← {rf.name} <span className="num text-[11px]" style={{ color: "var(--muted)" }}>{rf.phone}</span></p>
            <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{i.rep ? Lx(lang, `انضم — ${i.orders} / ${E.cfg.refMinOrders} طلب`, `Joined — ${i.orders} / ${E.cfg.refMinOrders} orders`) : Lx(lang, "لم ينضم بعد (يُطابق برقم الجوال)", "Not joined yet (matched by phone)")}</p>
            {rf.status === "pending" && can && <div className="flex gap-2 mt-2"><Btn variant="accent" accent={role.glow} disabled={!i.ok} onClick={() => pay(rf)}>{Lx(lang, `صرف ${E.cfg.refBonus} ${t.sar}`, `Pay ${E.cfg.refBonus} ${t.sar}`)}</Btn><Btn variant="danger" onClick={() => extUpd(setExt, "referrals", (a) => a.map((z) => (z.id === rf.id ? { ...z, status: "rejected" } : z)))}>{Lx(lang, "رفض", "Reject")}</Btn></div>}
          </div>); })}</div>}
        <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, "المربعان العلويان للمدير العام/المالية: مبلغ المكافأة، ثم الحد الأدنى للطلبات.", "Top boxes (GM/Finance): bonus amount, then minimum orders.")}</p>
      </Panel>
    </div>
  );
}

/* ─── منافسة الفرق (مشرف = فريق) — المقياس: متوسط الطلبات لكل مندوب ─── */
function TeamsPage({ lang, role, allReps, reps, allReports, reports, employees, activeRep, ext, setExt, setRepSettlements, setAuditLog, actingEmployee }) {
  const t = T[lang], E = extOf(ext); const RR = allReps || reps, RP = allReports || reports;
  const month = riyadhToday().slice(0, 7); const isRep = role.id === "rep";
  const sups = supervisorsOf(employees).filter((s) => s.id !== "sup1");
  const teams = sups.map((s) => { const m = RR.filter((r) => r.status === "active" && r.sup === s.id); const tot = m.reduce((a, r) => a + monthEntriesFor(RP, r.id, month).reduce((x, e) => x + (e.orders || 0), 0), 0); return { s, m, tot, avg: m.length ? tot / m.length : 0 }; }).filter((x) => x.m.length > 0).sort((a, b) => b.avg - a.avg);
  const contest = E.contests.find((c) => c.month === month);
  const [f, setF] = useState({ title: "", prize: "" }); const [err, setErr] = useState("");
  const can = role.id === "opsm" || role.id === "gm";
  const create = () => { if (f.title.trim().length < 3 || !(+f.prize > 0)) return setErr(Lx(lang, "اكتب عنواناً ومبلغاً.", "Title and amount needed.")); setErr(""); extUpd(setExt, "contests", (a) => [{ id: uidX("CT"), month, title: f.title.trim(), prize: +f.prize, status: "open", at: riyadhNow().toISOString() }, ...a]); setF({ title: "", prize: "" }); };
  const close = () => {
    const w = teams[0]; if (!w || !contest) return;
    extUpd(setExt, "contests", (a) => a.map((c) => (c.id === contest.id ? { ...c, status: "closed", winnerId: w.s.id, winnerName: w.s.ar, avg: Math.round(w.avg), by: byName(role, actingEmployee) } : c)));
    w.m.forEach((r) => addManualAdj(setRepSettlements, month, { id: "CT-" + contest.id + "-" + r.id, repId: r.id, type: "add", amount: contest.prize, reason: Lx(lang, `فوز الفريق: ${contest.title}`, `Team win: ${contest.title}`), by: byName(role, actingEmployee) }));
    logAudit(setAuditLog, role, "contest_closed", `${contest.title} → ${w.s.ar}`, actingEmployee);
  };
  const myTeam = isRep && activeRep ? activeRep.sup : null;
  return (
    <div className="space-y-4">
      {contest ? <div className="rounded-3xl p-5" style={{ background: "radial-gradient(120% 140% at 50% 0%,#1B2A4A 0%,#0E1424 70%)", border: "1px solid rgba(228,184,92,.35)" }}>
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,.6)" }}>{Lx(lang, "تحدي الشهر", "Challenge of the month")}</p>
        <p className="gold-text text-[20px] font-extrabold">{contest.title}</p>
        <p className="text-[13px]" style={{ color: "#fff" }}>{Lx(lang, `جائزة كل عضو في الفريق الفائز: ${contest.prize} ${t.sar}`, `Prize for each member of the winning team: ${contest.prize} ${t.sar}`)}</p>
        {contest.status === "closed" && <p className="text-[13px] font-extrabold mt-1" style={{ color: "#F3D58E" }}>🏆 {Lx(lang, "الفائز", "Winner")}: {contest.winnerName}</p>}
      </div> : <p className="text-[12.5px] rounded-xl px-3 py-2" style={{ background: "rgba(20,27,45,.04)" }}>{Lx(lang, "لا يوجد تحدٍّ معلن لهذا الشهر.", "No challenge announced this month.")}</p>}
      <Panel title={Lx(lang, "ترتيب الفرق — متوسط الطلبات لكل مندوب", "Team ranking — avg orders per rider")}>
        {teams.length === 0 ? EMPTYT(lang) : <div className="space-y-2">{teams.map((x, i) => (
          <div key={x.s.id} className="rounded-2xl p-3" style={{ background: myTeam === x.s.id ? "rgba(228,184,92,.14)" : "rgba(20,27,45,.035)", border: `1px solid ${myTeam === x.s.id ? "rgba(228,184,92,.5)" : "var(--line)"}` }}>
            <div className="flex items-center gap-3"><span className="num text-[18px] font-extrabold w-7">{i === 0 ? "🏆" : i + 1}</span><span className="flex-1 text-[13.5px] font-extrabold">{Lx(lang, "فريق", "Team")} {x.s.ar}{myTeam === x.s.id ? ` — ${Lx(lang, "فريقك", "your team")}` : ""}</span><span className="num text-[15px] font-extrabold">{Math.round(x.avg)}</span></div>
            <p className="num text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{x.m.length} {Lx(lang, "مندوب", "riders")} · {fmt(x.tot)} {Lx(lang, "طلب", "orders")}</p>
          </div>))}</div>}
        <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, "المقياس متوسط الطلبات لكل مندوب حتى تكون المنافسة عادلة بين الفرق الكبيرة والصغيرة.", "Average per rider keeps it fair between big and small teams.")}</p>
      </Panel>
      {can && <Panel title={Lx(lang, "إدارة التحدي", "Manage challenge")}>
        {!contest ? <><div className="grid gap-3 sm:grid-cols-2"><XIn value={f.title} onChange={(v) => setF({ ...f, title: v })} ph={Lx(lang, "اسم التحدي", "Challenge name")} /><XIn type="number" value={f.prize} onChange={(v) => setF({ ...f, prize: v })} ph={Lx(lang, "جائزة كل عضو (ر.س)", "Prize per member (SAR)")} /></div>
          {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}<div className="mt-3"><Btn variant="accent" accent={role.glow} onClick={create}>{Lx(lang, "إعلان التحدي", "Announce")}</Btn></div></>
          : contest.status === "open" ? <Btn variant="accent" accent={role.glow} onClick={close} disabled={!teams.length}>{Lx(lang, "إغلاق التحدي وصرف الجوائز لأعضاء الفريق الفائز", "Close & pay winning team")}</Btn>
            : <p className="text-[12.5px] font-bold" style={{ color: "#0B5C46" }}>✔ {Lx(lang, "أُغلق التحدي وأُضيفت الجوائز لكشوف الفريق الفائز.", "Closed; prizes added to the winners' statements.")}</p>}
      </Panel>}
    </div>
  );
}

/* ═══════════  الأنظمة 15–22: المشرفون • المدير العام • المحاسب • الموارد البشرية  ═══════════ */
Object.assign(EXT0, { priceReq: [], perfPlans: [], bench: [], coverLog: [], cockpit: {}, scenarios: [], closeL: {}, cashItems: [], cashOpen: null, recvEsc: {}, empDocs: {}, reviews: {}, offboard: [] });
EXT0.cfg = { ...EXT0.cfg, planWeeks: 4, payTerm: 30, payDay: 28, cashFloor: 0, mOk: 12, mBad: 5 };

const addDays = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const rangeStats = (reports, repId, from, to) => {
  let orders = 0; const days = new Set();
  reports.forEach((rp) => { if (rp.date < from || rp.date > to) return; rp.entries.forEach((e) => { if (e.id === repId && (e.orders || 0) > 0) { orders += e.orders; days.add(rp.date); } }); });
  return { orders, days: days.size };
};
const escH = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const printDoc = (title, body) => {
  try {
    const w = window.open("", "_blank"); if (!w) return false;
    w.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${escH(title)}</title><style>body{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;padding:28px;color:#12151D}h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:18px 0 6px}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ccc;padding:6px 8px;font-size:13px;text-align:right}.g{color:#0B5C46;font-weight:700}.a{color:#B07A00;font-weight:700}.r{color:#C0443A;font-weight:700}.m{color:#666;font-size:12px}</style></head><body>${body}<script>setTimeout(function(){window.print()},400)<\/script></body></html>`);
    w.document.close(); return true;
  } catch (e) { return false; }
};
function XSel({ value, onChange, children, cls = "" }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className={`rounded-xl px-3 py-2.5 text-[12.5px] outline-none ${cls}`} style={XINP}>{children}</select>;
}
const BOXS = { background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" };
const settleOf = (month, RR, RP, pricing, repSettlements, wf, vp, expenses, receipts) => {
  const rec = (repSettlements || []).find((s) => s.month === month);
  if (rec && rec.closed && rec.snapshot && rec.snapshot.totals) return { ...rec.snapshot, closed: true, rec };
  try { return { ...computeSettlement(month, RR, RP, pricing, rec && rec.inputs, wf, vp, expenses, receipts), closed: false, rec }; } catch (e) { return null; }
};

/* ═══ 15) خطة تحسين الأداء وجلسات المتابعة ═══ */
function PerfPlansPage({ lang, role, reps, allReps, reports, allReports, attendance, pricing, weekendFine, violationPenalty, ext, setExt, setAuditLog, actingEmployee, scopeSup, goPage }) {
  const E = extOf(ext); const RR = scopeSup ? reps : (allReps || reps); const RP = scopeSup ? reports : (allReports || reports);
  const today = riyadhToday(), month = today.slice(0, 7);
  const [tab, setTab] = useState("active"); const [sel, setSel] = useState(null);
  const [f, setF] = useState({ ordersWk: "", daysWk: "5", note: "" }); const [note, setNote] = useState({}); const [dec, setDec] = useState({}); const [err, setErr] = useState("");
  const canAct = role.id === "ops" || role.id === "opsm" || role.id === "gm";
  const plans = E.perfPlans.filter((p) => !scopeSup || p.sup === scopeSup);
  const busy = new Set(plans.filter((p) => p.status === "active").map((p) => p.repId));
  const tAvg = teamAvgOrders(RR, month, RP);
  const cands = RR.filter((r) => r.status === "active" && !busy.has(r.id)).map((r) => ({ r, p: perfOf(r, month, RP, attendance, ext, pricing, weekendFine, violationPenalty, tAvg) })).filter((x) => x.p.days >= 3 && x.p.score < 60).sort((a, b) => a.p.score - b.p.score);
  const upd = (id, fn) => extUpd(setExt, "perfPlans", (a) => a.map((z) => (z.id === id ? fn(z) : z)));
  const me = byName(role, actingEmployee);
  const start = () => {
    const r = RR.find((x) => x.id === sel); if (!r) return;
    const ow = +f.ordersWk, dw = +f.daysWk;
    if (!(ow > 0) || !(dw > 0 && dw <= 7) || f.note.trim().length < 6) return setErr(Lx(lang, "حدّد هدف الطلبات الأسبوعي وأيام العمل واكتب ملخص الجلسة الأولى.", "Set weekly orders goal, days per week and first-session notes."));
    setErr("");
    const base = perfOf(r, month, RP, attendance, ext, pricing, weekendFine, violationPenalty, tAvg); const s14 = rangeStats(RP, r.id, addDays(today, -13), today);
    const weeks = +E.cfg.planWeeks || 4;
    extUpd(setExt, "perfPlans", (a) => [{ id: uidX("PP"), repId: r.id, repName: r.ar, sup: r.sup || null, startAt: today, endAt: addDays(today, weeks * 7), weeks, extended: 0, goals: { ordersWk: ow, daysWk: dw }, baseline: { score: base.score, orders14: s14.orders, days14: s14.days }, sessions: [{ at: riyadhNow().toISOString(), by: me, kind: "first", note: f.note.trim() }], status: "active", by: me }, ...a]);
    logAudit(setAuditLog, role, "perf_plan_start", r.ar, actingEmployee); setSel(null); setF({ ordersWk: "", daysWk: "5", note: "" }); setTab("active");
  };
  const weeksOf = (p) => Array.from({ length: p.weeks }, (_, i) => { const from = addDays(p.startAt, i * 7), to = addDays(from, 6); const s = rangeStats(RP, p.repId, from, to); const done = to < today; return { i, from, to, ...s, done, future: from > today, met: s.orders >= p.goals.ordersWk && s.days >= p.goals.daysWk }; });
  const verdict = (p) => {
    const w = weeksOf(p).filter((x) => x.done); const ended = today >= p.endAt;
    const rep = RR.find((x) => x.id === p.repId); const nowScore = rep ? perfOf(rep, month, RP, attendance, ext, pricing, weekendFine, violationPenalty, tAvg).score : p.baseline.score;
    if (w.length >= 2 && w[w.length - 1].met && w[w.length - 2].met) return ["success", nowScore];
    if (ended) return nowScore >= p.baseline.score + 10 && p.extended < 2 ? ["extend", nowScore] : ["escalate", nowScore];
    return ["continue", nowScore];
  };
  const VL = { success: [Lx(lang, "حقق الهدف — يُنصح بالإغلاق", "Goal met — close"), "ok"], extend: [Lx(lang, "تحسّن — يُنصح بالتمديد", "Improving — extend"), "info"], escalate: [Lx(lang, "لم يتحسّن — يُنصح بالتصعيد", "No progress — escalate"), "bad"], continue: [Lx(lang, "الخطة جارية", "In progress"), "warn"] };
  const shown = plans.filter((p) => (tab === "active" ? p.status === "active" : tab === "escalated" ? p.status === "escalated" : tab === "closed" ? p.status === "closed" : false));
  return (
    <div className="space-y-4">
      <XTabs tab={tab} setTab={setTab} tabs={[["active", Lx(lang, "خطط جارية", "Active"), plans.filter((p) => p.status === "active").length], ["cands", Lx(lang, "يحتاجون خطة", "Need a plan"), cands.length], ["escalated", Lx(lang, "مُصعَّدة", "Escalated"), plans.filter((p) => p.status === "escalated").length], ["closed", Lx(lang, "مغلقة", "Closed")]]} />
      <p className="text-[11.5px] rounded-xl px-3 py-2" style={{ background: "rgba(228,184,92,.10)", border: "1px solid rgba(228,184,92,.3)" }}>{Lx(lang, "الهدف دعم المندوب لا معاقبته: جلسة موثّقة، ثم هدف أسبوعي واضح لمدة أسابيع، ثم قرار مبني على الأرقام (إغلاق أو تمديد أو تصعيد).", "The aim is to support, not punish: a documented session, clear weekly goals, then a data-based decision.")}</p>
      {tab === "cands" ? <Panel title={Lx(lang, "مناديب درجتهم أقل من 60", "Riders scoring below 60")}>
        {cands.length === 0 ? <p className="text-[13px] font-bold" style={{ color: "#0B5C46" }}>✔ {Lx(lang, "لا أحد يحتاج خطة حالياً.", "Nobody needs a plan now.")}</p> : <div className="space-y-2">{cands.map(({ r, p }) => (
          <div key={r.id} className="rounded-2xl p-3" style={BOXS}>
            <div className="flex items-center gap-2"><span className="flex-1 text-[13px] font-extrabold">{r.ar}</span><Chip tone="bad" sm>{Lx(lang, "الدرجة", "Score")} {p.score}</Chip>{canAct && <Btn variant="accent" accent={role.glow} onClick={() => { if (sel === r.id) { setSel(null); return; } const s14 = rangeStats(RP, r.id, addDays(today, -13), today); const wk = s14.orders / 2; const g = Math.max(Math.ceil(wk * 1.25), Math.ceil(wk + 10)); const dd = Math.min(6, Math.max(4, Math.ceil(s14.days / 2) + 1)); setF({ ordersWk: String(g), daysWk: String(dd), note: Lx(lang, `جلسة متابعة: درجة الأداء ${p.score}. اتفقنا على هدف أسبوعي ${g} طلباً في ${dd} أيام مع متابعة أسبوعية.`, `Follow-up session: score ${p.score}. Agreed weekly goal ${g} orders over ${dd} days.`) }); setSel(r.id); setErr(""); }}>{sel === r.id ? Lx(lang, "إلغاء", "Cancel") : Lx(lang, "خطة مقترحة تلقائياً", "Auto-suggested plan")}</Btn>}</div>
            <p className="num text-[11px] mt-1" style={{ color: "var(--muted)" }}>{Lx(lang, `حضور ${Math.round(p.att * 100)}% · طلبات ${p.orders} · مخالفات ${p.viol}`, `Attendance ${Math.round(p.att * 100)}% · orders ${p.orders} · violations ${p.viol}`)}</p>
            {sel === r.id && <div className="mt-3 space-y-2">
              <p className="text-[11.5px] font-bold" style={{ color: "#B07A00" }}>{Lx(lang, "الأرقام التالية مقترحة من نشاطه آخر 14 يوماً — عدّلها إن لزم ثم اعتمد.", "Suggested from the last 14 days — adjust if needed, then confirm.")}</p>
              <div className="grid gap-2 sm:grid-cols-2"><XIn type="number" value={f.ordersWk} onChange={(v) => setF({ ...f, ordersWk: v })} ph={Lx(lang, "هدف الطلبات الأسبوعي", "Weekly orders goal")} /><XIn type="number" value={f.daysWk} onChange={(v) => setF({ ...f, daysWk: v })} ph={Lx(lang, "أيام العمل أسبوعياً", "Days per week")} /></div>
              <XIn value={f.note} onChange={(v) => setF({ ...f, note: v })} ph={Lx(lang, "ملخص الجلسة الأولى (الأسباب والاتفاق)", "First session summary")} cls="w-full" />
              {err && <p className="text-[11.5px]" style={{ color: "#C0443A" }}>{err}</p>}
              <Btn variant="accent" accent={role.glow} onClick={start}>{Lx(lang, `اعتماد الخطة (${E.cfg.planWeeks} أسابيع)`, `Confirm plan (${E.cfg.planWeeks} weeks)`)}</Btn></div>}
          </div>))}</div>}
      </Panel> : <div className="space-y-3">{shown.length === 0 ? <Panel title={Lx(lang, "الخطط", "Plans")}>{EMPTYT(lang)}</Panel> : shown.map((p) => { const ws = weeksOf(p); const [vk, nowScore] = verdict(p); return (
        <Panel key={p.id} title={`${p.repName}`} extra={p.status === "active" ? <Chip tone={VL[vk][1]} sm>{VL[vk][0]}</Chip> : <Chip tone={p.status === "escalated" ? "bad" : "ok"} sm>{p.status === "escalated" ? Lx(lang, "مُصعَّدة", "Escalated") : Lx(lang, "مغلقة", "Closed")}</Chip>}>
          <p className="num text-[11.5px]" style={{ color: "var(--muted)" }}>{p.startAt} → {p.endAt} · {Lx(lang, `الهدف أسبوعياً: ${p.goals.ordersWk} طلب في ${p.goals.daysWk} أيام`, `Weekly goal: ${p.goals.ordersWk} orders / ${p.goals.daysWk} days`)} · {Lx(lang, `الدرجة ${p.baseline.score} ← ${nowScore}`, `Score ${p.baseline.score} → ${nowScore}`)}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">{ws.map((w) => (
            <div key={w.i} className="rounded-xl p-2 text-center" style={{ background: w.future ? "rgba(20,27,45,.03)" : w.met ? "rgba(63,216,180,.16)" : w.done ? "rgba(232,131,122,.14)" : "rgba(228,184,92,.14)" }}>
              <p className="text-[10.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "أسبوع", "Wk")} {w.i + 1}</p>
              <p className="num text-[13px] font-extrabold">{w.future ? "—" : `${w.orders} / ${p.goals.ordersWk}`}</p>
              <p className="num text-[10.5px]">{w.future ? "" : `${w.days} / ${p.goals.daysWk} ${Lx(lang, "أيام", "d")}`}</p></div>))}</div>
          <div className="mt-2 space-y-1">{p.sessions.map((s, i) => <p key={i} className="text-[11.5px]">• <span className="num" style={{ color: "var(--muted)" }}>{(s.at || "").slice(0, 10)}</span> {s.by}: {s.note}</p>)}</div>
          {p.decision && <p className="text-[12px] font-bold mt-1">{Lx(lang, "القرار", "Decision")}: {p.decision}</p>}
          {p.status === "active" && canAct && <div className="mt-3 space-y-2">
            <div className="flex gap-2"><XIn value={note[p.id] || ""} onChange={(v) => setNote({ ...note, [p.id]: v })} ph={Lx(lang, "جلسة متابعة جديدة: ما تم الاتفاق عليه", "Follow-up session notes")} cls="flex-1" /><Btn onClick={() => { const n = (note[p.id] || "").trim(); if (n.length < 4) return; upd(p.id, (z) => ({ ...z, sessions: [...z.sessions, { at: riyadhNow().toISOString(), by: me, kind: "follow", note: n }] })); setNote({ ...note, [p.id]: "" }); }}>{Lx(lang, "تسجيل", "Log")}</Btn></div>
            <div className="flex gap-2 flex-wrap">
              <Btn variant="accent" accent={role.glow} onClick={() => { upd(p.id, (z) => ({ ...z, status: "closed", outcome: "success", closedAt: today, decision: Lx(lang, "أُغلقت بنجاح", "Closed successfully") })); logAudit(setAuditLog, role, "perf_plan_close", p.repName, actingEmployee); }}>{Lx(lang, "إغلاق (نجحت)", "Close (success)")}</Btn>
              {p.extended < 2 && <Btn onClick={() => upd(p.id, (z) => ({ ...z, endAt: addDays(z.endAt, 14), weeks: z.weeks + 2, extended: z.extended + 1 }))}>{Lx(lang, "تمديد أسبوعين", "Extend 2 weeks")}</Btn>}
              <Btn variant="danger" onClick={() => { upd(p.id, (z) => ({ ...z, status: "escalated", escalatedAt: today, escalatedBy: me })); logAudit(setAuditLog, role, "perf_plan_escalate", p.repName, actingEmployee); }}>{Lx(lang, "تصعيد للإدارة", "Escalate")}</Btn></div></div>}
          {p.status === "escalated" && (role.id === "hr" || role.id === "opsm" || role.id === "gm") && <div className="mt-3 space-y-2">
            <XIn value={dec[p.id] || ""} onChange={(v) => setDec({ ...dec, [p.id]: v })} ph={Lx(lang, "القرار (إنذار، نقل فريق، تدريب، ...)", "Decision (warning, transfer, training…)")} cls="w-full" />
            <div className="flex gap-2 flex-wrap"><Btn variant="accent" accent={role.glow} onClick={() => { const d = (dec[p.id] || "").trim(); if (d.length < 4) return; upd(p.id, (z) => ({ ...z, status: "closed", outcome: "decision", closedAt: today, decision: d })); logAudit(setAuditLog, role, "perf_plan_decision", `${p.repName}: ${d.slice(0, 40)}`, actingEmployee); }}>{Lx(lang, "تسجيل القرار وإغلاق", "Record decision & close")}</Btn>
              {goPage && role.nav.includes("offboard") && <Btn onClick={() => goPage("offboard")}>{Lx(lang, "بدء إنهاء خدمة", "Start offboarding")}</Btn>}</div></div>}
        </Panel>); })}</div>}
    </div>
  );
}

/* ═══ 16) التغطية والبدائل وقائمة الاحتياط ═══ */
function CoveragePage({ lang, role, reps, allReps, reports, allReports, attendance, pricing, weekendFine, violationPenalty, applications, employees, ext, setExt, setAuditLog, actingEmployee, scopeSup }) {
  const E = extOf(ext); const RR = scopeSup ? reps : (allReps || reps); const RP = scopeSup ? reports : (allReports || reports);
  const today = riyadhToday(); const month = today.slice(0, 7);
  const [date, setDate] = useState(addDays(today, 1)); const [bf, setBf] = useState({ name: "", phone: "", app: "hs", city: "" }); const [err, setErr] = useState("");
  const wd = new Date(date + "T00:00:00Z").getUTCDay();
  const canBench = role.id === "ops" || role.id === "opsm" || role.id === "hr" || role.id === "gm";
  const onLeave = (r) => E.leaves.some((l) => l.repId === r.id && l.status === "approved" && l.from <= date && l.to >= date);
  const idBad = (r) => !!r.idExpiry && r.idExpiry < date;
  const sups = supervisorsOf(employees).filter((s) => (scopeSup ? s.id === scopeSup : s.id !== "sup1"));
  const past = []; for (let i = 1; i <= 8 && past.length < 4; i++) { const d = addDays(date, -7 * i); if (d < today) past.push(d); }
  const tAvg = teamAvgOrders(RR, month, RP);
  const scoreOf = (r) => perfOf(r, month, RP, attendance, ext, pricing, weekendFine, violationPenalty, tAvg).score;
  const teams = sups.map((s) => {
    const members = RR.filter((r) => r.status === "active" && r.sup === s.id); if (!members.length) return null;
    const ids = new Set(members.map((m) => m.id));
    const worked = past.map((d) => { const rp = RP.filter((x) => x.date === d); if (!rp.length) return null; const set = new Set(); rp.forEach((x) => x.entries.forEach((e) => { if (ids.has(e.id) && (e.orders || 0) > 0) set.add(e.id); })); return set.size; }).filter((x) => x != null);
    const expected = worked.length ? Math.round(worked.reduce((a, b) => a + b, 0) / worked.length) : Math.round(members.length * 6 / 7);
    const avail = members.filter((r) => !onLeave(r) && !idBad(r)); const out = members.filter((r) => onLeave(r) || idBad(r));
    return { s, members, expected, avail, out, short: Math.max(0, expected - avail.length), basis: worked.length };
  }).filter(Boolean);
  const wa = (phone, text) => "https://wa.me/" + phoneWa(phone) + "?text=" + encodeURIComponent(text);
  const pool = (t) => {
    const apps = new Set(t.members.map((m) => m.app));
    const others = RR.filter((r) => r.status === "active" && r.sup !== t.s.id && !onLeave(r) && !idBad(r) && apps.has(r.app)).map((r) => ({ kind: "rider", id: r.id, name: r.ar, phone: r.phone, score: scoreOf(r), tag: Lx(lang, "من فريق آخر", "Other team") }));
    const bench = E.bench.filter((b) => b.status === "ready" && (apps.size === 0 || apps.has(b.app))).map((b) => ({ kind: "bench", id: b.id, name: b.name, phone: b.phone, score: 50, tag: Lx(lang, "احتياط", "Bench") + (b.city ? ` · ${b.city}` : "") }));
    const wait = (applications || []).filter((a) => a.status === "new" && apps.has(a.app)).map((a) => ({ kind: "app", id: a.id, name: a.name, phone: a.phone, score: 40, tag: Lx(lang, "متقدم", "Applicant") + (a.city ? ` · ${a.city}` : "") }));
    return [...others, ...bench, ...wait].sort((a, b) => b.score - a.score).slice(0, 6);
  };
  const invite = (t, c) => { extUpd(setExt, "coverLog", (a) => [{ id: uidX("CV"), date, supId: t.s.id, supName: t.s.ar, name: c.name, kind: c.kind, by: byName(role, actingEmployee), at: riyadhNow().toISOString() }, ...a].slice(0, 200)); };
  const addBench = () => { if (bf.name.trim().length < 3 || phoneWa(bf.phone).length < 9) return setErr(Lx(lang, "اكتب الاسم والجوال.", "Name and phone required.")); setErr(""); extUpd(setExt, "bench", (a) => [{ id: uidX("BN"), ...bf, name: bf.name.trim(), phone: bf.phone.trim(), city: bf.city.trim(), status: "ready", at: riyadhNow().toISOString() }, ...a]); setBf({ name: "", phone: "", app: bf.app, city: "" }); logAudit(setAuditLog, role, "bench_add", bf.name, actingEmployee); };
  const totalShort = teams.reduce((s, t) => s + t.short, 0);
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "التغطية المتوقعة", "Expected coverage")} extra={<XIn type="date" value={date} onChange={setDate} cls="w-40" />}>
        <p className="text-[11.5px] mb-3" style={{ color: "var(--muted)" }}>{Lx(lang, "المتوقع = متوسط من عملوا في نفس اليوم من الأسبوع خلال آخر 4 أسابيع. المتاح = النشطون ناقص من في إجازة معتمدة أو إقامته منتهية.", "Expected = average riders working the same weekday over 4 weeks. Available = active minus approved leave or expired ID.")}</p>
        {teams.length === 0 ? EMPTYT(lang) : <><div className="rounded-xl px-3 py-2 mb-3 text-[13px] font-extrabold" style={{ background: totalShort ? "rgba(232,131,122,.14)" : "rgba(63,216,180,.16)" }}>{totalShort ? Lx(lang, `نقص متوقع في ${date}: ${totalShort} مندوب`, `Expected shortage on ${date}: ${totalShort}`) : "✔ " + Lx(lang, "التغطية كافية.", "Coverage is sufficient.")}</div>
          <div className="space-y-3">{teams.map((t) => (
            <div key={t.s.id} className="rounded-2xl p-3" style={{ ...BOXS, border: `1px solid ${t.short ? "rgba(232,131,122,.5)" : "var(--line)"}` }}>
              <div className="flex items-center gap-2 flex-wrap"><span className="flex-1 text-[13.5px] font-extrabold">{Lx(lang, "فريق", "Team")} {t.s.ar}</span><Chip tone={t.short ? "bad" : "ok"} sm>{Lx(lang, `متوقع ${t.expected} · متاح ${t.avail.length}`, `Need ${t.expected} · have ${t.avail.length}`)}</Chip>{t.short > 0 && <Chip tone="bad" sm>{Lx(lang, `نقص ${t.short}`, `Short ${t.short}`)}</Chip>}</div>
              {t.out.length > 0 && <p className="text-[11.5px] mt-1" style={{ color: "var(--muted)" }}>{Lx(lang, "غائبون: ", "Out: ")}{t.out.map((r) => `${r.ar} (${onLeave(r) ? Lx(lang, "إجازة", "leave") : Lx(lang, "إقامة منتهية", "ID expired")})`).join("، ")}</p>}
              {t.short > 0 && <div className="mt-2 space-y-1.5"><p className="text-[11.5px] font-bold">{Lx(lang, "بدائل مقترحة (الأعلى أداءً أولاً):", "Suggested substitutes:")}</p>
                {pool(t).length === 0 ? <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لا بدائل مناسبة — أضف أسماء لقائمة الاحتياط أدناه.", "No substitutes — add names to the bench below.")}</p> : pool(t).map((c) => (
                  <div key={c.kind + c.id} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#fff", border: "1px solid var(--line)" }}>
                    <span className="flex-1 text-[12.5px] font-bold">{c.name} <span className="text-[10.5px] font-normal" style={{ color: "var(--muted)" }}>{c.tag}</span></span>
                    {c.kind === "rider" && <span className="num text-[11px]">{c.score}</span>}
                    {c.phone && <a href={wa(c.phone, Lx(lang, `السلام عليكم ${c.name}، نحتاجك للعمل مع فريق ${t.s.ar} بتاريخ ${date}. هل تستطيع؟`, `Hello ${c.name}, can you cover for team ${t.s.ar} on ${date}?`))} target="_blank" rel="noreferrer" onClick={() => invite(t, c)} className="text-[12px] font-bold px-3 py-1.5 rounded-xl" style={{ background: "rgba(63,216,180,.18)" }}>{Lx(lang, "دعوة واتساب", "Invite")}</a>}
                  </div>))}</div>}
            </div>))}</div></>}
      </Panel>
      <Panel title={Lx(lang, "قائمة الاحتياط", "Bench list")}>
        {canBench && <div className="grid gap-2 sm:grid-cols-4 mb-3"><XIn value={bf.name} onChange={(v) => setBf({ ...bf, name: v })} ph={Lx(lang, "الاسم", "Name")} /><XIn value={bf.phone} onChange={(v) => setBf({ ...bf, phone: v })} ph={Lx(lang, "الجوال", "Phone")} />
          <XSel value={bf.app} onChange={(v) => setBf({ ...bf, app: v })}>{APPS.map((a) => <option key={a.id} value={a.id}>{a[lang] || a.ar}</option>)}</XSel><XIn value={bf.city} onChange={(v) => setBf({ ...bf, city: v })} ph={Lx(lang, "المدينة", "City")} /></div>}
        {canBench && <div className="mb-3"><Btn variant="accent" accent={role.glow} onClick={addBench}>{Lx(lang, "إضافة للاحتياط", "Add to bench")}</Btn>{err && <span className="text-[11.5px] mx-2" style={{ color: "#C0443A" }}>{err}</span>}</div>}
        {E.bench.filter((b) => b.status === "ready").length === 0 ? EMPTYT(lang) : <div className="space-y-1.5">{E.bench.filter((b) => b.status === "ready").map((b) => (
          <div key={b.id} className="flex items-center gap-2 rounded-xl px-3 py-2" style={BOXS}><span className="flex-1 text-[12.5px] font-bold">{b.name} <span className="text-[10.5px] font-normal" style={{ color: "var(--muted)" }}>{(APPS.find((a) => a.id === b.app) || {})[lang] || b.app}{b.city ? ` · ${b.city}` : ""}</span></span>
            {canBench && <button onClick={() => extUpd(setExt, "bench", (a) => a.map((z) => (z.id === b.id ? { ...z, status: "removed" } : z)))} className="text-[11.5px] font-bold" style={{ color: "#C0443A" }}>{Lx(lang, "إزالة", "Remove")}</button>}</div>))}</div>}
        {E.coverLog.length > 0 && <p className="text-[10.5px] mt-3" style={{ color: "var(--muted)" }}>{Lx(lang, "آخر دعوة: ", "Last invite: ")}{E.coverLog[0].name} — {E.coverLog[0].supName} ({E.coverLog[0].date})</p>}
      </Panel>
    </div>
  );
}

/* ═══ 20) التدفق النقدي والتوقعات (دالة مشتركة مع غرفة القيادة) ═══ */
function cashForecast(E, invoices, payrollRuns, expenses, delay, days = 60) {
  const today = riyadhToday(); const open = E.cashOpen; if (!open || open.amount == null || open.amount === "") return null;
  const ev = []; const end = addDays(today, days);
  const term = +E.cfg.payTerm || 0;
  (invoices || []).filter((v) => v.st === "review").forEach((v) => { let d = addDays(v.date || today, term + (+delay || 0)); if (d < today) d = today; if (d <= end) ev.push({ date: d, amt: +v.amt || 0, dir: "in", label: Lx("ar", "فاتورة " + v.app, "") + " " + (v.no || "") }); });
  const lastRun = (payrollRuns || []).find((r) => +r.totalPayroll > 0); const pay = lastRun ? +lastRun.totalPayroll : 0;
  if (pay > 0) for (let k = 0; k < 4; k++) { const base = new Date(today + "T00:00:00Z"); base.setUTCMonth(base.getUTCMonth() + k, 1); const ym = base.toISOString().slice(0, 7); const dim = monthDays(ym); const d = ym + "-" + String(Math.min(+E.cfg.payDay || 28, dim)).padStart(2, "0"); if (d >= today && d <= end) ev.push({ date: d, amt: pay, dir: "out", label: "payroll" }); }
  (E.cashItems || []).forEach((it) => {
    const amt = +it.amount || 0; if (!amt || !it.date) return;
    if (it.repeat === "monthly") { for (let k = 0; k < 4; k++) { const base = new Date(it.date + "T00:00:00Z"); base.setUTCMonth(base.getUTCMonth() + k); const d = base.toISOString().slice(0, 10); if (d >= today && d <= end) ev.push({ date: d, amt, dir: it.dir, label: it.label }); } }
    else if (it.date >= today && it.date <= end) ev.push({ date: it.date, amt, dir: it.dir, label: it.label });
  });
  const since = addDays(today, -90); const expTotal = (expenses || []).filter((e) => (e.status === "approved" || !e.status) && (e.date || "") >= since).reduce((s, e) => s + (+e.v || 0), 0); const daily = expTotal / 90;
  let bal = +open.amount; const rows = []; let min = bal, minDate = today, firstNeg = null;
  for (let i = 0; i <= days; i++) {
    const d = addDays(today, i); const inn = ev.filter((x) => x.date === d && x.dir === "in").reduce((s, x) => s + x.amt, 0); const out = ev.filter((x) => x.date === d && x.dir === "out").reduce((s, x) => s + x.amt, 0) + (i > 0 ? daily : 0);
    bal = bal + inn - out; rows.push({ date: d, label: d.slice(5), bal: Math.round(bal), inn: Math.round(inn), out: Math.round(out) });
    if (bal < min) { min = bal; minDate = d; } if (bal < 0 && !firstNeg) firstNeg = d;
  }
  return { rows, min: Math.round(min), minDate, firstNeg, start: +open.amount, pay, daily: Math.round(daily), events: ev.sort((a, b) => a.date.localeCompare(b.date)) };
}
function CashFlowPage({ lang, role, invoices, payrollRuns, expenses, ext, setExt, setAuditLog, actingEmployee }) {
  const t = T[lang]; const E = extOf(ext); const [delay, setDelay] = useState(0); const [op, setOp] = useState(""); const [it, setIt] = useState({ label: "", amount: "", dir: "out", date: riyadhToday(), repeat: "once" }); const [err, setErr] = useState("");
  const can = role.id === "fin" || role.id === "gm";
  const fc = cashForecast(E, invoices, payrollRuns, expenses, delay);
  const floor = +E.cfg.cashFloor || 0; const first14 = fc ? fc.rows.slice(0, 15) : []; const min14 = first14.length ? Math.min(...first14.map((r) => r.bal)) : 0;
  const addItem = () => { if (it.label.trim().length < 2 || !(+it.amount > 0) || !it.date) return setErr(Lx(lang, "اكتب البيان والمبلغ والتاريخ.", "Label, amount and date needed.")); setErr(""); extUpd(setExt, "cashItems", (a) => [{ id: uidX("CI"), ...it, label: it.label.trim(), amount: +it.amount }, ...a]); setIt({ ...it, label: "", amount: "" }); logAudit(setAuditLog, role, "cash_item", it.label, actingEmployee); };
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "الرصيد الافتتاحي", "Opening balance")}>
        <div className="flex gap-2 items-center flex-wrap"><XIn type="number" value={op} onChange={setOp} ph={E.cashOpen ? String(E.cashOpen.amount) : Lx(lang, "الرصيد البنكي/النقدي اليوم", "Bank/cash balance today")} cls="w-52" />
          {can && <Btn variant="accent" accent={role.glow} onClick={() => { if (op === "" || isNaN(+op)) return; extUpd(setExt, "cashOpen", () => ({ amount: +op, date: riyadhToday(), by: byName(role, actingEmployee) })); setOp(""); logAudit(setAuditLog, role, "cash_open", String(op), actingEmployee); }}>{Lx(lang, "تحديث الرصيد اليوم", "Set today's balance")}</Btn>}
          {E.cashOpen && <span className="text-[11px]" style={{ color: "var(--muted)" }}>{Lx(lang, "آخر تحديث", "Updated")} {E.cashOpen.date} — {E.cashOpen.by}</span>}</div>
        <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, "حدّث الرصيد كل يوم (أو أسبوعياً) ليبقى التوقع دقيقاً. التوقع تقدير وليس كشف حساب.", "Update the balance regularly. The forecast is an estimate, not a bank statement.")}</p>
      </Panel>
      {!fc ? <p className="text-[12.5px] rounded-xl px-3 py-2" style={{ background: "rgba(20,27,45,.04)" }}>{Lx(lang, "أدخل الرصيد الافتتاحي لعرض التوقع.", "Enter the opening balance to see the forecast.")}</p> : <>
        <div className="rounded-2xl px-4 py-3 text-[13px] font-extrabold" style={{ background: min14 < floor ? "rgba(232,131,122,.16)" : "rgba(63,216,180,.16)" }}>
          {min14 < floor ? Lx(lang, `⚠ تنبيه: الرصيد يهبط إلى ${fmt(min14)} ${t.sar} خلال 14 يوماً${fc.firstNeg ? ` (سالب من ${fc.firstNeg})` : ""}.`, `⚠ Balance drops to ${fmt(min14)} within 14 days.`) : "✔ " + Lx(lang, `لا عجز متوقع خلال 14 يوماً (أدنى رصيد ${fmt(min14)}).`, `No shortfall within 14 days (min ${fmt(min14)}).`)}</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Kpi label={Lx(lang, "الرصيد الحالي", "Current")} value={money(fc.start)} unit={t.sar} icon={Wallet} accent={role.glow} /><Kpi label={Lx(lang, "أدنى رصيد (60 يوماً)", "Lowest (60d)")} value={money(fc.min)} unit={t.sar} icon={TrendingDown} accent="232,131,122" /><Kpi label={Lx(lang, "الرصيد بعد 60 يوماً", "In 60 days")} value={money(fc.rows[fc.rows.length - 1].bal)} unit={t.sar} icon={TrendingUp} accent="15,165,121" /><Kpi label={Lx(lang, "راتب الشهر المقدّر", "Est. payroll")} value={money(fc.pay)} unit={t.sar} icon={Users} accent="139,155,247" /></div>
        <Panel title={Lx(lang, "الرصيد المتوقع يومياً", "Projected daily balance")} extra={<div className="flex gap-1">{[0, 7, 14, 21].map((d) => <button key={d} onClick={() => setDelay(d)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold" style={{ background: delay === d ? "#12151D" : "rgba(20,27,45,.06)", color: delay === d ? "#fff" : "var(--muted)" }}>{d ? `+${d}` : Lx(lang, "طبيعي", "Normal")}</button>)}</div>}>
          <div style={{ height: 220 }} dir="ltr"><ResponsiveContainer width="100%" height="100%"><AreaChart data={fc.rows}><CartesianGrid strokeDasharray="3 3" stroke="rgba(20,27,45,.08)" /><XAxis dataKey="label" tick={{ fontSize: 10 }} interval={6} /><YAxis tick={{ fontSize: 10 }} width={48} tickFormatter={(v) => money(v)} /><Tooltip formatter={(v) => fmt(v)} /><Area type="monotone" dataKey="bal" stroke="#3FD8B4" fill="rgba(63,216,180,.25)" /></AreaChart></ResponsiveContainer></div>
          <p className="text-[10.5px] mt-1" style={{ color: "var(--muted)" }}>{Lx(lang, `الأزرار: تأخّر سداد التطبيقات بعدد الأيام. المحصَّل المتوقع = تاريخ الفاتورة + ${E.cfg.payTerm} يوماً. المصروفات اليومية المقدّرة ${fmt(fc.daily)} ${t.sar} من متوسط 90 يوماً.`, `Buttons simulate late app payments. Daily expenses estimated from the 90-day average.`)}</p>
        </Panel>
        <Panel title={Lx(lang, "أكبر الحركات القادمة", "Upcoming movements")}>
          {fc.events.length === 0 ? EMPTYT(lang) : <div className="space-y-1">{fc.events.slice(0, 12).map((e, i) => <div key={i} className="flex items-center gap-2 text-[12.5px] py-1"><span className="num w-24" style={{ color: "var(--muted)" }}>{e.date}</span><span className="flex-1">{e.label === "payroll" ? Lx(lang, "رواتب المناديب والموظفين", "Payroll") : e.label}</span><span className="num font-extrabold" style={{ color: e.dir === "in" ? "#0B5C46" : "#C0443A" }}>{e.dir === "in" ? "+" : "−"}{fmt(Math.round(e.amt))}</span></div>)}</div>}
        </Panel></>}
      {can && <Panel title={Lx(lang, "بنود نقدية يدوية (إيجار، تسديد، دفعة...)", "Manual cash items")}>
        <div className="grid gap-2 sm:grid-cols-5"><XIn value={it.label} onChange={(v) => setIt({ ...it, label: v })} ph={Lx(lang, "البيان", "Label")} /><XIn type="number" value={it.amount} onChange={(v) => setIt({ ...it, amount: v })} ph={Lx(lang, "المبلغ", "Amount")} /><XIn type="date" value={it.date} onChange={(v) => setIt({ ...it, date: v })} />
          <XSel value={it.dir} onChange={(v) => setIt({ ...it, dir: v })}><option value="out">{Lx(lang, "خروج", "Out")}</option><option value="in">{Lx(lang, "دخول", "In")}</option></XSel><XSel value={it.repeat} onChange={(v) => setIt({ ...it, repeat: v })}><option value="once">{Lx(lang, "مرة واحدة", "Once")}</option><option value="monthly">{Lx(lang, "شهرياً", "Monthly")}</option></XSel></div>
        {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}<div className="mt-2"><Btn variant="accent" accent={role.glow} onClick={addItem}>{Lx(lang, "إضافة", "Add")}</Btn></div>
        <div className="mt-3 space-y-1">{E.cashItems.map((c) => <div key={c.id} className="flex items-center gap-2 text-[12.5px] rounded-xl px-3 py-1.5" style={BOXS}><span className="flex-1 font-bold">{c.label}</span><span className="num" style={{ color: c.dir === "in" ? "#0B5C46" : "#C0443A" }}>{c.dir === "in" ? "+" : "−"}{fmt(c.amount)}</span><span className="num text-[11px]" style={{ color: "var(--muted)" }}>{c.date}{c.repeat === "monthly" ? " ↻" : ""}</span><button onClick={() => extUpd(setExt, "cashItems", (a) => a.filter((z) => z.id !== c.id))} aria-label="delete" style={{ color: "#C0443A" }}><Trash2 size={14} /></button></div>)}</div>
      </Panel>}
    </div>
  );
}

/* ═══ 17) غرفة القيادة والتقرير التنفيذي ═══ */
function CockpitPage({ lang, role, allReps, reps, allReports, reports, attendance, pricing, repSettlements, weekendFine, violationPenalty, expenses, decisions, invoices, payrollRuns, repReceipts, employees, ext, setExt, setAuditLog, actingEmployee }) {
  const t = T[lang]; const E = extOf(ext); const RR = allReps || reps, RP = allReports || reports;
  const today = riyadhToday(), month = today.slice(0, 7); const me = byName(role, actingEmployee);
  const [txt, setTxt] = useState({});
  const act = RR.filter((r) => r.status === "active");
  const dates = [...new Set(RP.map((x) => x.date))].filter((d) => d <= today).sort().reverse();
  const dayOrders = (d) => RP.filter((x) => x.date === d).reduce((s, x) => s + x.entries.reduce((a, e) => a + (e.orders || 0), 0), 0);
  const lastD = dates[0]; const prevD = dates.slice(1, 8); const lastO = lastD ? dayOrders(lastD) : 0; const avgO = prevD.length ? prevD.reduce((s, d) => s + dayOrders(d), 0) / prevD.length : 0;
  const opsR = !lastD || !avgO ? null : lastO / avgO;
  const st = settleOf(month, RR, RP, pricing, repSettlements, weekendFine, violationPenalty, expenses, repReceipts);
  const rev = st ? st.totals.revenue : 0; const mar = st && rev > 0 ? (st.totals.afterExpenses / rev) * 100 : null;
  const risk = act.map((r) => churnOf(r, RP, attendance, ext, pricing, weekendFine, violationPenalty)).filter((c) => c.active && c.level === "high").length;
  const riskPct = act.length ? (risk / act.length) * 100 : 0;
  const idExp = RR.filter((r) => r.status === "active" && r.idExpiry).map((r) => daysUntil(r.idExpiry)).filter((d) => d != null);
  const expired = idExp.filter((d) => d < 0).length, soon = idExp.filter((d) => d >= 0 && d <= 30).length;
  const pend = (decisions || []).filter((d) => !d.gmApproved).length + (expenses || []).filter((e) => e.status === "pending").length + E.wallet.filter((w) => w.status === "pending").length + E.leaves.filter((l) => l.status === "pending").length + (repReceipts || []).filter((q) => q.status === "pending").length;
  const fc = cashForecast(E, invoices, payrollRuns, expenses, 0); const min14 = fc ? Math.min(...fc.rows.slice(0, 15).map((r) => r.bal)) : null; const floor = +E.cfg.cashFloor || 0;
  const G = "g", A = "a", R = "r", N = "n";
  const tiles = [
    { k: "ops", ic: ShoppingBag, ti: Lx(lang, "التشغيل", "Operations"), val: opsR == null ? "—" : Math.round(opsR * 100) + "%", sub: opsR == null ? Lx(lang, "لا بيانات كافية", "Not enough data") : Lx(lang, `طلبات ${lastD}: ${fmt(lastO)} مقابل متوسط ${fmt(Math.round(avgO))}`, `Orders ${lastD}: ${fmt(lastO)} vs avg ${fmt(Math.round(avgO))}`), s: opsR == null ? N : opsR >= 0.9 ? G : opsR >= 0.7 ? A : R },
    { k: "fin", ic: CircleDollarSign, ti: Lx(lang, "هامش الربح (الشهر)", "Profit margin (month)"), val: mar == null ? "—" : mar.toFixed(1) + "%", sub: st ? Lx(lang, `الإيراد ${fmt(Math.round(rev))} · الصافي ${fmt(Math.round(st.totals.afterExpenses))}`, `Revenue ${fmt(Math.round(rev))} · net ${fmt(Math.round(st.totals.afterExpenses))}`) : "—", s: mar == null ? N : mar >= +E.cfg.mOk ? G : mar >= +E.cfg.mBad ? A : R },
    { k: "hr", ic: Users, ti: Lx(lang, "القوى العاملة", "Workforce"), val: `${act.length}`, sub: Lx(lang, `${risk} مندوب بخطر ترك مرتفع (${riskPct.toFixed(0)}%)`, `${risk} at high churn risk (${riskPct.toFixed(0)}%)`), s: !act.length ? N : riskPct >= 15 ? R : riskPct >= 5 ? A : G },
    { k: "cmp", ic: ShieldAlert, ti: Lx(lang, "الامتثال والإقامات", "Compliance"), val: String(expired + soon), sub: Lx(lang, `${expired} منتهية · ${soon} خلال 30 يوماً`, `${expired} expired · ${soon} within 30d`), s: expired > 0 ? R : soon > 0 ? A : G },
    { k: "apr", ic: BadgeCheck, ti: Lx(lang, "طلبات بانتظار الاعتماد", "Pending approvals"), val: String(pend), sub: Lx(lang, "قرارات ومصروفات وسلف وإجازات وإيصالات", "Decisions, expenses, wallet, leave, receipts"), s: pend > 15 ? R : pend > 5 ? A : G },
    { k: "cash", ic: Wallet, ti: Lx(lang, "السيولة (14 يوماً)", "Cash (14 days)"), val: min14 == null ? "—" : money(min14), sub: min14 == null ? Lx(lang, "أدخل الرصيد في صفحة التدفق النقدي", "Set balance in Cash Flow") : Lx(lang, "أدنى رصيد متوقع", "Lowest projected balance"), s: min14 == null ? N : min14 < floor ? R : min14 < floor + (fc.pay || 0) * 0.25 ? A : G },
  ];
  const COL = { g: ["#0B5C46", "rgba(63,216,180,.14)", "rgba(63,216,180,.45)"], a: ["#B07A00", "rgba(228,184,92,.16)", "rgba(228,184,92,.5)"], r: ["#C0443A", "rgba(232,131,122,.15)", "rgba(232,131,122,.55)"], n: ["#6B7280", "rgba(20,27,45,.04)", "var(--line)"] };
  const cm = E.cockpit || {};
  const sinceKey = (k) => "since|" + k; const cKey = (k) => "c|" + k + "|" + (cm[sinceKey(k)] || today);
  useEffect(() => {
    const cur = (ext && ext.cockpit) || {}; const patch = {}; let ch = false;
    tiles.forEach((x) => { const sk = sinceKey(x.k); if (x.s === R && !cur[sk]) { patch[sk] = today; ch = true; } if (x.s !== R && cur[sk]) { patch[sk] = null; ch = true; } });
    if (ch) extUpd(setExt, "cockpit", (m) => { const n = { ...m }; Object.keys(patch).forEach((k) => { if (patch[k] == null) delete n[k]; else n[k] = patch[k]; }); return n; });
  }); // eslint-disable-line
  const comment = (k) => { const v = (txt[k] || "").trim(); if (v.length < 4) return; extUpd(setExt, "cockpit", (m) => ({ ...m, [cKey(k)]: { by: me, at: riyadhNow().toISOString(), text: v } })); setTxt({ ...txt, [k]: "" }); logAudit(setAuditLog, role, "cockpit_comment", `${k}: ${v.slice(0, 40)}`, actingEmployee); };
  const overdue = (k) => { const since = cm[sinceKey(k)]; return since && !cm[cKey(k)] && (new Date(today) - new Date(since)) / 86400000 >= 2; };
  const top = act.map((r) => ({ r, p: perfOf(r, month, RP, attendance, ext, pricing, weekendFine, violationPenalty, 0) })).filter((x) => x.p.days > 0).sort((a, b) => b.p.score - a.p.score);
  const exec = () => {
    const rows = tiles.map((x) => `<tr><td>${escH(x.ti)}</td><td class="${x.s}">${escH(x.val)}</td><td>${escH(x.sub)}</td><td>${escH((cm[cKey(x.k)] || {}).text || "")}</td></tr>`).join("");
    const lst = (arr) => arr.map((x) => `<tr><td>${escH(x.r.ar)}</td><td>${x.p.score}</td><td>${x.p.orders}</td></tr>`).join("");
    const body = `<h1>${escH(Lx(lang, "التقرير التنفيذي الأسبوعي — بوارق الشرق", "Weekly Executive Report — Bawariq Al-Sharq"))}</h1><p class="m">${today}</p><h2>${escH(Lx(lang, "المؤشرات الستة", "Six indicators"))}</h2><table><tr><th>${escH(Lx(lang, "المؤشر", "Indicator"))}</th><th>${escH(Lx(lang, "القيمة", "Value"))}</th><th>${escH(Lx(lang, "التفاصيل", "Details"))}</th><th>${escH(Lx(lang, "تعليق المدير", "GM comment"))}</th></tr>${rows}</table><h2>${escH(Lx(lang, "الأعلى أداءً", "Top performers"))}</h2><table>${lst(top.slice(0, 5))}</table><h2>${escH(Lx(lang, "الأحوج للمتابعة", "Need attention"))}</h2><table>${lst(top.slice(-5).reverse())}</table>`;
    if (!printDoc(Lx(lang, "التقرير التنفيذي", "Executive report"), body)) alert(Lx(lang, "اسمح بالنوافذ المنبثقة لطباعة التقرير.", "Allow pop-ups to print the report."));
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap"><p className="flex-1 text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "كل رقم أحمر يلزمه تعليق منك خلال 48 ساعة، ويظهر التعليق في التقرير الأسبوعي.", "Every red indicator needs your comment within 48 hours; it appears in the weekly report.")}</p><Btn icon={Printer} onClick={exec}>{Lx(lang, "التقرير التنفيذي (PDF)", "Executive report (PDF)")}</Btn></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tiles.map((x) => { const c = COL[x.s]; const Ic = x.ic; const cmt = cm[cKey(x.k)]; return (
        <div key={x.k} className="rounded-3xl p-4" style={{ background: c[1], border: `1px solid ${c[2]}` }}>
          <div className="flex items-center gap-2"><Ic size={16} style={{ color: c[0] }} /><span className="flex-1 text-[12.5px] font-extrabold">{x.ti}</span>{overdue(x.k) && <Chip tone="bad" sm>{Lx(lang, "تعليق متأخر", "Overdue")}</Chip>}</div>
          <p className="num text-[28px] font-extrabold mt-1" style={{ color: c[0] }}>{x.val}</p>
          <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{x.sub}</p>
          {x.s === R && <div className="mt-2">{cmt ? <p className="text-[11.5px] font-bold" style={{ color: "#0B5C46" }}>✔ {cmt.by}: {cmt.text}</p> : role.id === "gm" ? <div className="flex gap-2"><XIn value={txt[x.k] || ""} onChange={(v) => setTxt({ ...txt, [x.k]: v })} ph={Lx(lang, "سبب الأحمر والإجراء", "Cause & action")} cls="flex-1 min-w-0" /><Btn onClick={() => comment(x.k)}>{Lx(lang, "تعليق", "Comment")}</Btn></div> : <p className="text-[11px]" style={{ color: "#C0443A" }}>{Lx(lang, "بانتظار تعليق المدير العام", "Awaiting GM comment")}</p>}</div>}
        </div>); })}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Panel title={Lx(lang, "الأعلى أداءً هذا الشهر", "Top performers")}>{top.length === 0 ? EMPTYT(lang) : top.slice(0, 5).map((x) => <div key={x.r.id} className="flex items-center gap-2 text-[12.5px] py-1"><span className="flex-1 font-bold">{x.r.ar}</span><span className="num">{x.p.orders}</span><Chip tone="ok" sm>{x.p.score}</Chip></div>)}</Panel>
        <Panel title={Lx(lang, "الأحوج للمتابعة", "Need attention")}>{top.length === 0 ? EMPTYT(lang) : top.slice(-5).reverse().map((x) => <div key={x.r.id} className="flex items-center gap-2 text-[12.5px] py-1"><span className="flex-1 font-bold">{x.r.ar}</span><span className="num">{x.p.orders}</span><Chip tone="bad" sm>{x.p.score}</Chip></div>)}</Panel>
      </div>
    </div>
  );
}

/* ═══ 18) محاكي القرار «ماذا لو؟» ═══ */
function WhatIfPage({ lang, role, allReps, reps, allReports, reports, pricing, repSettlements, weekendFine, violationPenalty, expenses, repReceipts, ext, setExt, setAuditLog, actingEmployee }) {
  const t = T[lang]; const E = extOf(ext); const RR = allReps || reps, RP = allReports || reports; const today = riyadhToday();
  const months = [today.slice(0, 7), prevMonthStr(today.slice(0, 7))];
  const [mo, setMo] = useState(months[0]); const [name, setName] = useState("");
  const [v, setV] = useState({ a: "0", b: "0", c: "0", m: "0", fixed: "0", oneOff: "0" });
  const can = role.id === "gm" || role.id === "fin";
  const st = settleOf(mo, RR, RP, pricing, repSettlements, weekendFine, violationPenalty, expenses, repReceipts);
  const N = st ? st.repLines.reduce((s, l) => s + (l.orders || 0), 0) : 0; const K = st ? st.repLines.filter((l) => (l.orders || 0) > 0).length : 0;
  const R0 = st ? st.totals.revenue : 0, G0 = st ? st.totals.repGross : 0, X0 = st ? st.totals.expenses : 0; const adj0 = st ? st.totals.repNet - st.totals.repGross : 0;
  const base = R0 - G0 - adj0 - X0;
  const a = +v.a || 0, b = +v.b || 0, c = +v.c || 0, m = +v.m || 0, fixed = +v.fixed || 0, one = +v.oneOff || 0;
  const oavg = K ? N / K : 0; const N1 = N * (1 + c / 100) + m * oavg * 0.8;
  const rpo = N ? R0 / N : 0, gpo = N ? G0 / N : 0;
  const R1 = N1 * (rpo + b), G1 = N1 * (gpo + a), adj1 = N ? adj0 * (N1 / N) : 0, X1 = X0 + m * fixed + one;
  const sc = R1 - G1 - adj1 - X1; const d = sc - base;
  const curMargin = (() => { const s2 = settleOf(today.slice(0, 7), RR, RP, pricing, repSettlements, weekendFine, violationPenalty, expenses, repReceipts); return s2 ? s2.totals.afterExpenses : null; })();
  const save = () => { if (name.trim().length < 3) return; extUpd(setExt, "scenarios", (arr) => [{ id: uidX("SC"), name: name.trim(), baseMonth: mo, inputs: { ...v }, base: Math.round(base), predicted: Math.round(sc), at: riyadhNow().toISOString(), by: byName(role, actingEmployee) }, ...arr].slice(0, 30)); setName(""); logAudit(setAuditLog, role, "whatif_save", name.trim(), actingEmployee); };
  const Row = ({ k, a1, a2 }) => <div className="grid grid-cols-3 gap-2 py-1.5 text-[12.5px] border-b" style={{ borderColor: "var(--line)" }}><span className="font-bold">{k}</span><span className="num text-center">{a1}</span><span className="num text-center font-extrabold">{a2}</span></div>;
  const FLD = [["a", Lx(lang, "تغيير ما يُدفع للمندوب لكل طلب (ر.س)", "Rider pay change per order (SAR)")], ["b", Lx(lang, "تغيير سعر التطبيق للشركة لكل طلب (ر.س)", "App price change per order (SAR)")], ["c", Lx(lang, "نمو/انخفاض الطلبات (%)", "Order growth (%)")], ["m", Lx(lang, "إضافة مناديب جدد (عدد)", "Add riders (count)")], ["fixed", Lx(lang, "تكلفة شهرية ثابتة لكل مندوب جديد (ر.س)", "Fixed monthly cost / new rider")], ["oneOff", Lx(lang, "تكلفة لمرة واحدة (ر.س)", "One-off cost (SAR)")]];
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "ماذا لو؟ — اختبر القرار على أرقامك الفعلية", "What if? — test a decision on your real numbers")} extra={<XSel value={mo} onChange={setMo}>{months.map((x) => <option key={x} value={x}>{x}</option>)}</XSel>}>
        {!st || N === 0 ? <p className="text-[12.5px]">{Lx(lang, "لا طلبات كافية في هذا الشهر لبناء المحاكاة.", "Not enough orders this month to simulate.")}</p> : <>
          <p className="num text-[11.5px] mb-3" style={{ color: "var(--muted)" }}>{Lx(lang, `الأساس: ${fmt(N)} طلب · ${K} مندوب · الصافي بعد المصروفات ${fmt(Math.round(base))} ${t.sar}`, `Base: ${fmt(N)} orders · ${K} riders · net ${fmt(Math.round(base))}`)}</p>
          <div className="grid gap-2 sm:grid-cols-2">{FLD.map(([k, l]) => <label key={k} className="block"><span className="text-[11.5px] font-bold block mb-1">{l}</span><XIn type="number" value={v[k]} onChange={(x) => setV({ ...v, [k]: x })} cls="w-full" /></label>)}</div>
          <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, "المندوب الجديد يُفترض أن يُنتج 80% من متوسط المناديب الحاليين.", "A new rider is assumed to produce 80% of the current average.")}</p>
          <div className="mt-4 rounded-2xl p-3" style={BOXS}>
            <div className="grid grid-cols-3 gap-2 text-[11px] pb-1.5" style={{ color: "var(--muted)" }}><span /><span className="text-center">{Lx(lang, "الآن", "Now")}</span><span className="text-center">{Lx(lang, "بعد القرار", "After")}</span></div>
            <Row k={Lx(lang, "الطلبات", "Orders")} a1={fmt(Math.round(N))} a2={fmt(Math.round(N1))} />
            <Row k={Lx(lang, "إيراد التطبيقات", "Revenue")} a1={fmt(Math.round(R0))} a2={fmt(Math.round(R1))} />
            <Row k={Lx(lang, "تكلفة المناديب", "Rider cost")} a1={fmt(Math.round(G0 + adj0))} a2={fmt(Math.round(G1 + adj1))} />
            <Row k={Lx(lang, "المصروفات", "Expenses")} a1={fmt(Math.round(X0))} a2={fmt(Math.round(X1))} />
            <Row k={Lx(lang, "الصافي", "Net")} a1={fmt(Math.round(base))} a2={fmt(Math.round(sc))} />
            <p className="text-[14px] font-extrabold mt-2" style={{ color: d >= 0 ? "#0B5C46" : "#C0443A" }}>{d >= 0 ? "▲" : "▼"} {fmt(Math.abs(Math.round(d)))} {t.sar} {Lx(lang, "شهرياً", "per month")}{R1 > 0 ? ` · ${Lx(lang, "هامش", "margin")} ${((sc / R1) * 100).toFixed(1)}%` : ""}</p></div>
          {can && <div className="flex gap-2 mt-3"><XIn value={name} onChange={setName} ph={Lx(lang, "اسم السيناريو لحفظه", "Scenario name")} cls="flex-1" /><Btn variant="accent" accent={role.glow} onClick={save}>{Lx(lang, "حفظ السيناريو", "Save")}</Btn></div>}
        </>}
      </Panel>
      <Panel title={Lx(lang, "السيناريوهات المحفوظة والمقارنة بالواقع", "Saved scenarios vs. reality")}>
        {E.scenarios.length === 0 ? EMPTYT(lang) : <div className="space-y-2">{E.scenarios.map((s) => { const diff = s.actual != null ? s.actual.net - s.predicted : null; return (
          <div key={s.id} className="rounded-2xl p-3" style={BOXS}>
            <div className="flex items-center gap-2"><span className="flex-1 text-[13px] font-extrabold">{s.name}</span><span className="num text-[11px]" style={{ color: "var(--muted)" }}>{s.at.slice(0, 10)}</span></div>
            <p className="num text-[12px] mt-1">{Lx(lang, "المتوقع", "Predicted")}: {fmt(s.predicted)} {t.sar} · {Lx(lang, "الأساس", "Base")}: {fmt(s.base)}{s.actual != null ? ` · ${Lx(lang, "الفعلي", "Actual")} (${s.actual.month}): ${fmt(s.actual.net)} (${diff >= 0 ? "+" : ""}${fmt(Math.round(diff))})` : ""}</p>
            {can && curMargin != null && <div className="mt-2"><Btn onClick={() => extUpd(setExt, "scenarios", (arr) => arr.map((z) => (z.id === s.id ? { ...z, actual: { month: today.slice(0, 7), net: Math.round(curMargin), at: today } } : z)))}>{Lx(lang, "قارن بصافي الشهر الحالي", "Compare with this month's net")}</Btn></div>}
          </div>); })}</div>}
      </Panel>
    </div>
  );
}

/* ═══ 19) قائمة الإقفال الشهري وذمم التطبيقات ═══ */
function CloseListPage({ lang, role, allReps, reps, allReports, reports, pricing, repSettlements, weekendFine, violationPenalty, expenses, repReceipts, invoices, payrollRuns, ext, setExt, setAuditLog, actingEmployee }) {
  const t = T[lang]; const E = extOf(ext); const RR = allReps || reps, RP = allReports || reports; const today = riyadhToday();
  const months = [prevMonthStr(today.slice(0, 7)), today.slice(0, 7)];
  const [mo, setMo] = useState(months[0]); const [why, setWhy] = useState({});
  const can = role.id === "fin" || role.id === "gm";
  const st = settleOf(mo, RR, RP, pricing, repSettlements, weekendFine, violationPenalty, expenses, repReceipts);
  const rec = E.closeL[mo] || { signs: {} };
  const inM = (d) => (d || "").startsWith(mo);
  const pendRep = RP.filter((x) => inM(x.date) && (x.hrStatus || "pending") === "pending").length;
  const stmts = ((st && st.rec && st.rec.inputs && st.rec.inputs.appStatement) || (st && st.closed ? {} : {})); const appsWithOrders = st ? st.appLines.filter((l) => l.recOrders > 0) : [];
  const noStmt = st && !st.closed ? appsWithOrders.filter((l) => !l.hasStatement).length : 0;
  const unmatched = st ? st.appLines.reduce((s, l) => s + (l.unmatched || []).length, 0) : 0;
  const pendExp = (expenses || []).filter((e) => e.status === "pending" && inM(e.date)).length;
  const pendRc = (repReceipts || []).filter((q) => q.status === "pending" && inM(q.date)).length + E.wallet.filter((w) => w.status === "pending" && (w.month === mo || inM(w.at))).length;
  const unpriced = st ? st.repLines.filter((l) => l.unpriced).length + st.appLines.filter((l) => !l.appPriced || !l.repPriced).length : 0;
  const run = (payrollRuns || []).find((r) => r.month === mo);
  const ITEMS = [
    ["rep", Lx(lang, "كل التقارير اليومية معتمدة من الموارد البشرية", "All daily reports approved by HR"), pendRep === 0, Lx(lang, `${pendRep} تقرير بانتظار الاعتماد`, `${pendRep} reports pending`)],
    ["stm", Lx(lang, "كشف كل تطبيق مرفوع ومطابَق", "Every app statement uploaded"), noStmt === 0, Lx(lang, `${noStmt} تطبيق بلا كشف`, `${noStmt} apps without statement`)],
    ["unm", Lx(lang, "لا مناديب غير مطابَقين في الكشوف", "No unmatched statement rows"), unmatched === 0, Lx(lang, `${unmatched} صف غير مطابَق`, `${unmatched} unmatched rows`)],
    ["exp", Lx(lang, "لا مصروفات معلّقة", "No pending expenses"), pendExp === 0, Lx(lang, `${pendExp} مصروف معلّق`, `${pendExp} pending`)],
    ["rc", Lx(lang, "لا إيصالات أو سلف معلّقة", "No pending receipts / advances"), pendRc === 0, Lx(lang, `${pendRc} معلّق`, `${pendRc} pending`)],
    ["prc", Lx(lang, "كل التسعيرات مكتملة", "All pricing complete"), unpriced === 0, Lx(lang, `${unpriced} عنصر بلا تسعيرة`, `${unpriced} unpriced`)],
    ["pay", Lx(lang, "مسيرة الرواتب معدّة للشهر", "Payroll run prepared"), !!run, Lx(lang, "لم تُعدّ مسيرة الرواتب", "No payroll run")],
  ];
  const ready = ITEMS.every(([k, , ok]) => ok || rec.signs[k]);
  const sign = (k) => { const w = (why[k] || "").trim(); if (w.length < 5) return; extUpd(setExt, "closeL", (m) => { const cur = m[mo] || { signs: {} }; return { ...m, [mo]: { ...cur, signs: { ...cur.signs, [k]: { by: byName(role, actingEmployee), at: riyadhNow().toISOString(), why: w } } } }; }); setWhy({ ...why, [k]: "" }); logAudit(setAuditLog, role, "close_override", `${mo}/${k}: ${w.slice(0, 40)}`, actingEmployee); };
  const closeIt = () => { if (!ready) return; extUpd(setExt, "closeL", (m) => ({ ...m, [mo]: { ...(m[mo] || { signs: {} }), closed: { by: byName(role, actingEmployee), at: riyadhNow().toISOString() } } })); logAudit(setAuditLog, role, "close_ready", mo, actingEmployee); };
  // ذمم التطبيقات
  const open = (invoices || []).filter((v) => v.st === "review").map((v) => ({ ...v, age: -(daysUntil(v.date) || 0) }));
  const bucket = (x) => (x.age <= 30 ? 0 : x.age <= 60 ? 1 : 2);
  const byApp = APPS.map((a) => { const L = open.filter((v) => v.app === a.id); return { a, tot: L.reduce((s, v) => s + (+v.amt || 0), 0), b: [0, 1, 2].map((i) => L.filter((v) => bucket(v) === i).reduce((s, v) => s + (+v.amt || 0), 0)), over: L.filter((v) => bucket(v) === 2) }; }).filter((x) => x.tot > 0);
  const paidInMonth = (id) => (invoices || []).filter((v) => v.app === id && v.st === "paid" && inM(v.date)).reduce((s, v) => s + (+v.amt || 0), 0);
  return (
    <div className="space-y-4">
      <Panel title={Lx(lang, "قائمة الإقفال الشهري", "Month-end checklist")} extra={<XSel value={mo} onChange={setMo}>{months.map((x) => <option key={x} value={x}>{x}</option>)}</XSel>}>
        {rec.closed && <div className="rounded-xl px-3 py-2 mb-3 text-[12.5px] font-extrabold" style={{ background: "rgba(63,216,180,.16)" }}>✔ {Lx(lang, `اعتُمد جاهزاً للإقفال بواسطة ${rec.closed.by} (${rec.closed.at.slice(0, 10)})`, `Marked ready by ${rec.closed.by} (${rec.closed.at.slice(0, 10)})`)}</div>}
        <div className="space-y-2">{ITEMS.map(([k, label, ok, bad]) => { const sg = rec.signs[k]; return (
          <div key={k} className="rounded-2xl p-3" style={{ ...BOXS, border: `1px solid ${ok ? "rgba(63,216,180,.4)" : sg ? "rgba(228,184,92,.5)" : "rgba(232,131,122,.45)"}` }}>
            <div className="flex items-center gap-2"><span className="text-[15px]">{ok ? "✅" : sg ? "🟡" : "⛔"}</span><span className="flex-1 text-[12.5px] font-bold">{label}</span>{!ok && <span className="text-[11px]" style={{ color: "#C0443A" }}>{bad}</span>}</div>
            {!ok && sg && <p className="text-[11px] mt-1" style={{ color: "#B07A00" }}>{Lx(lang, "استثناء موثّق", "Documented exception")}: {sg.by} — {sg.why}</p>}
            {!ok && !sg && can && <div className="flex gap-2 mt-2"><XIn value={why[k] || ""} onChange={(x) => setWhy({ ...why, [k]: x })} ph={Lx(lang, "سبب الاستثناء (إلزامي)", "Exception reason (required)")} cls="flex-1 min-w-0" /><Btn onClick={() => sign(k)}>{Lx(lang, "استثناء", "Override")}</Btn></div>}
          </div>); })}</div>
        {can && !rec.closed && <div className="mt-3"><Btn variant="accent" accent={role.glow} disabled={!ready} onClick={closeIt}>{ready ? Lx(lang, "اعتماد: الشهر جاهز للإقفال", "Mark month ready to close") : Lx(lang, "أكمل البنود أو وثّق الاستثناءات", "Complete items or document exceptions")}</Btn></div>}
        <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, "هذه القائمة ضابط جودة قبل الإقفال؛ الإقفال الفعلي يتم من «مسار التسوية».", "This is a quality gate; actual closing is done in Settlement Flow.")}</p>
      </Panel>
      <Panel title={Lx(lang, "ذمم التطبيقات — أعمار الديون", "App receivables — aging")}>
        {byApp.length === 0 ? <p className="text-[12.5px] font-bold" style={{ color: "#0B5C46" }}>✔ {Lx(lang, "لا فواتير مستحقة التحصيل.", "No outstanding invoices.")}</p> : <div className="space-y-2">
          <div className="grid grid-cols-5 gap-1 text-[10.5px] px-2" style={{ color: "var(--muted)" }}><span>{Lx(lang, "التطبيق", "App")}</span><span className="text-center">0–30</span><span className="text-center">31–60</span><span className="text-center">+60</span><span className="text-center">{Lx(lang, "الإجمالي", "Total")}</span></div>
          {byApp.map((x) => <div key={x.a.id} className="rounded-xl p-2" style={BOXS}>
            <div className="grid grid-cols-5 gap-1 items-center text-[12px]"><span className="font-extrabold">{x.a[lang] || x.a.ar}</span>{x.b.map((n, i) => <span key={i} className="num text-center" style={{ color: i === 2 && n > 0 ? "#C0443A" : i === 1 && n > 0 ? "#B07A00" : "inherit", fontWeight: n > 0 && i > 0 ? 800 : 400 }}>{fmt(Math.round(n))}</span>)}<span className="num text-center font-extrabold">{fmt(Math.round(x.tot))}</span></div>
            {x.over.map((v) => <div key={v.no} className="flex items-center gap-2 mt-1.5 text-[11.5px]"><span className="flex-1">{v.no} · {v.age} {Lx(lang, "يوم", "d")} · {fmt(v.amt)} {t.sar}</span>{E.recvEsc[v.no] ? <Chip tone="warn" sm>{Lx(lang, "تم التصعيد", "Escalated")} · {E.recvEsc[v.no].by}</Chip> : can && <Btn variant="danger" onClick={() => { extUpd(setExt, "recvEsc", (m) => ({ ...m, [v.no]: { by: byName(role, actingEmployee), at: riyadhNow().toISOString() } })); logAudit(setAuditLog, role, "recv_escalate", `${x.a.ar} ${v.no}`, actingEmployee); }}>{Lx(lang, "تصعيد للمدير العام", "Escalate to GM")}</Btn>}</div>)}
          </div>)}</div>}
      </Panel>
      {st && <Panel title={Lx(lang, `المستحق مقابل المحصَّل — ${mo}`, `Expected vs received — ${mo}`)}>
        {st.appLines.length === 0 ? EMPTYT(lang) : <div className="space-y-1">{st.appLines.map((l) => { const got = paidInMonth(l.app); const gap = l.revenue - got; return <div key={l.app} className="flex items-center gap-2 text-[12.5px] py-1"><span className="flex-1 font-bold">{(APPS.find((a) => a.id === l.app) || {})[lang] || l.app}</span><span className="num">{fmt(Math.round(l.revenue))}</span><span className="num" style={{ color: "var(--muted)" }}>/ {fmt(Math.round(got))}</span><Chip tone={gap > Math.max(1, l.revenue * 0.02) ? "warn" : "ok"} sm>{gap > 0 ? "−" : "+"}{fmt(Math.abs(Math.round(gap)))}</Chip></div>; })}</div>}
        <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, "المستحق من التسوية، والمحصَّل من الفواتير المسددة بتاريخ الشهر. الفرق قد يعني تأخّراً في السداد وليس خطأً.", "Expected from settlement; received from invoices paid in the month. A gap may be late payment, not an error.")}</p>
      </Panel>}
    </div>
  );
}

/* ═══ 21) ملف الموظف والمستندات والتقييم السنوي ═══ */
const DOC_TYPES = [["id", "هوية / إقامة", "ID / Iqama"], ["lic", "رخصة قيادة", "Driving licence"], ["contract", "عقد عمل", "Contract"], ["health", "شهادة صحية", "Health card"], ["ins", "تأمين طبي", "Medical insurance"], ["cert", "شهادة / دورة", "Certificate"], ["other", "أخرى", "Other"]];
const REVIEW_CRIT = [["quality", "جودة العمل", "Work quality"], ["att", "الانضباط والحضور", "Discipline"], ["team", "العمل الجماعي", "Teamwork"], ["init", "المبادرة", "Initiative"], ["comm", "التواصل", "Communication"]];
const docTier = (d) => (d == null ? null : d < 0 ? ["bad", "expired"] : d <= 7 ? ["bad", "7"] : d <= 30 ? ["warn", "30"] : d <= 60 ? ["info", "60"] : null);
function EmpFilePage({ lang, role, reps, allReps, employees, ext, setExt, setAuditLog, actingEmployee }) {
  const E = extOf(ext); const RR = allReps || reps; const year = new Date().getUTCFullYear();
  const can = role.id === "hr";
  const people = [...(employees || []).map((e) => ({ id: e.id, name: e.name, kind: "emp", sub: e.position || e.dept, data: e })), ...RR.filter((r) => r.status !== "pending").map((r) => ({ id: r.id, name: r.ar, kind: "rep", sub: Lx(lang, "مندوب", "Rider"), data: r }))];
  const [q, setQ] = useState(""); const [sel, setSel] = useState(null); const [kindF, setKindF] = useState("all");
  const [d, setD] = useState({ type: "id", no: "", expiry: "", file: null, fileName: "" }); const [err, setErr] = useState("");
  const [rv, setRv] = useState({ quality: 0, att: 0, team: 0, init: 0, comm: 0, note: "" });
  const docsOf = (p) => { const own = (E.empDocs[p.id] || []).map((x) => ({ ...x, own: true })); if (p.kind === "rep" && p.data.idExpiry && !own.some((x) => x.type === "id")) own.unshift({ id: "auto-id", type: "id", no: p.data.nid || "", expiry: p.data.idExpiry, auto: true }); return own; };
  const alerts = people.flatMap((p) => docsOf(p).map((x) => ({ p, x, days: daysUntil(x.expiry) })).filter((z) => docTier(z.days))).sort((a, b) => a.days - b.days);
  const cnt = (f) => alerts.filter(f).length;
  const list = people.filter((p) => (kindF === "all" || p.kind === kindF) && (!q.trim() || p.name.includes(q.trim())));
  const P = people.find((p) => p.id === sel);
  const tn = (ty) => { const z = DOC_TYPES.find((x) => x[0] === ty); return z ? (lang === "en" ? z[2] : z[1]) : ty; };
  const onFile = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; if (f.size > 350 * 1024) { setErr(Lx(lang, "الملف أكبر من 350KB — اضغطه أو احفظ بياناته فقط.", "File over 350KB.")); return; } const rd = new FileReader(); rd.onload = () => setD((z) => ({ ...z, file: rd.result, fileName: f.name })); rd.readAsDataURL(f); };
  const addDoc = () => { if (!P) return; if (!d.expiry) return setErr(Lx(lang, "حدّد تاريخ الانتهاء.", "Expiry date required.")); setErr(""); extUpd(setExt, "empDocs", (m) => ({ ...m, [P.id]: [{ id: uidX("DC"), type: d.type, no: d.no.trim(), expiry: d.expiry, file: d.file, fileName: d.fileName, at: riyadhNow().toISOString(), by: byName(role, actingEmployee) }, ...(m[P.id] || [])] })); setD({ type: "id", no: "", expiry: "", file: null, fileName: "" }); logAudit(setAuditLog, role, "emp_doc_add", `${P.name}: ${d.type}`, actingEmployee); };
  const revs = P ? (E.reviews[P.id] || []) : [];
  const saveRv = () => { if (!P) return; if (REVIEW_CRIT.some(([k]) => !rv[k])) return setErr(Lx(lang, "قيّم المعايير الخمسة.", "Rate all five criteria.")); setErr(""); const avg = REVIEW_CRIT.reduce((s, [k]) => s + rv[k], 0) / REVIEW_CRIT.length; extUpd(setExt, "reviews", (m) => ({ ...m, [P.id]: [{ year, scores: Object.fromEntries(REVIEW_CRIT.map(([k]) => [k, rv[k]])), avg: +avg.toFixed(2), note: rv.note.trim(), by: byName(role, actingEmployee), at: riyadhNow().toISOString() }, ...(m[P.id] || []).filter((x) => x.year !== year)] })); setRv({ quality: 0, att: 0, team: 0, init: 0, comm: 0, note: "" }); logAudit(setAuditLog, role, "emp_review", `${P.name} ${year}`, actingEmployee); };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[[Lx(lang, "منتهية", "Expired"), cnt((z) => z.days < 0), "#C0443A"], [Lx(lang, "خلال 7 أيام", "≤ 7 days"), cnt((z) => z.days >= 0 && z.days <= 7), "#C0443A"], [Lx(lang, "خلال 30 يوماً", "≤ 30 days"), cnt((z) => z.days > 7 && z.days <= 30), "#B07A00"], [Lx(lang, "خلال 60 يوماً", "≤ 60 days"), cnt((z) => z.days > 30 && z.days <= 60), "#2563EB"]].map(([k, n, c]) => <div key={k} className="rounded-2xl p-3 text-center" style={BOXS}><p className="num text-[24px] font-extrabold" style={{ color: c }}>{n}</p><p className="text-[11px]" style={{ color: "var(--muted)" }}>{k}</p></div>)}</div>
      {alerts.length > 0 && <Panel title={Lx(lang, "تنبيهات المستندات", "Document alerts")}><div className="space-y-1">{alerts.slice(0, 10).map((z, i) => { const tr = docTier(z.days); return <button key={i} onClick={() => setSel(z.p.id)} className="w-full flex items-center gap-2 text-[12.5px] py-1 text-start"><span className="flex-1 font-bold">{z.p.name}</span><span style={{ color: "var(--muted)" }}>{tn(z.x.type)}</span><Chip tone={tr[0]} sm>{z.days < 0 ? Lx(lang, `منتهٍ منذ ${-z.days} يوم`, `${-z.days}d ago`) : Lx(lang, `بعد ${z.days} يوم`, `in ${z.days}d`)}</Chip></button>; })}</div></Panel>}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel title={Lx(lang, "الأشخاص", "People")}>
          <div className="flex gap-2 mb-2"><XIn value={q} onChange={setQ} ph={Lx(lang, "بحث بالاسم", "Search")} cls="flex-1 min-w-0" /><XSel value={kindF} onChange={setKindF}><option value="all">{Lx(lang, "الكل", "All")}</option><option value="emp">{Lx(lang, "موظفون", "Staff")}</option><option value="rep">{Lx(lang, "مناديب", "Riders")}</option></XSel></div>
          <div className="space-y-1 max-h-[420px] overflow-auto">{list.length === 0 ? EMPTYT(lang) : list.map((p) => { const worst = docsOf(p).map((x) => daysUntil(x.expiry)).filter((x) => x != null).sort((a, b) => a - b)[0]; const tr = docTier(worst); return <button key={p.id} onClick={() => { setSel(p.id); setErr(""); }} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-start" style={{ background: sel === p.id ? "#12151D" : "rgba(20,27,45,.035)", color: sel === p.id ? "#fff" : "inherit" }}><span className="flex-1 text-[12.5px] font-bold">{p.name}</span><span className="text-[10.5px] opacity-70">{p.sub}</span>{tr && <span className="w-2 h-2 rounded-full" style={{ background: tr[0] === "bad" ? "#E8837A" : tr[0] === "warn" ? "#E4B85C" : "#5BC8E8" }} />}</button>; })}</div>
        </Panel>
        {!P ? <Panel title={Lx(lang, "الملف", "File")}><p className="text-[12.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "اختر شخصاً لعرض ملفه ومستنداته وتقييمه السنوي.", "Pick a person to open the file.")}</p></Panel> : <div className="space-y-4">
          <Panel title={P.name} extra={<Chip tone="n" sm>{P.kind === "emp" ? Lx(lang, "موظف", "Staff") : Lx(lang, "مندوب", "Rider")}</Chip>}>
            <p className="text-[12px]" style={{ color: "var(--muted)" }}>{P.data.phone || ""} {P.kind === "rep" ? `· ${(APPS.find((a) => a.id === P.data.app) || {})[lang] || ""}` : `· ${P.data.position || ""}`}</p>
          </Panel>
          <Panel title={Lx(lang, "المستندات", "Documents")}>
            {docsOf(P).length === 0 ? EMPTYT(lang) : <div className="space-y-1.5">{docsOf(P).map((x) => { const dd = daysUntil(x.expiry); const tr = docTier(dd); return <div key={x.id} className="flex items-center gap-2 rounded-xl px-3 py-2" style={BOXS}><span className="flex-1 text-[12.5px] font-bold">{tn(x.type)} <span className="num text-[11px] font-normal" style={{ color: "var(--muted)" }}>{x.no}</span></span><span className="num text-[11.5px]">{x.expiry}</span>{tr ? <Chip tone={tr[0]} sm>{dd < 0 ? Lx(lang, "منتهٍ", "Expired") : `${dd}d`}</Chip> : <Chip tone="ok" sm>{Lx(lang, "ساري", "Valid")}</Chip>}{x.file && <a href={x.file} download={x.fileName || "doc"} className="text-[11px] font-bold" style={{ color: "#2563EB" }}>{Lx(lang, "تنزيل", "Download")}</a>}{can && x.own && <button onClick={() => extUpd(setExt, "empDocs", (m) => ({ ...m, [P.id]: (m[P.id] || []).filter((z) => z.id !== x.id) }))} style={{ color: "#C0443A" }} aria-label="delete"><Trash2 size={14} /></button>}</div>; })}</div>}
            {can && <div className="mt-3 grid gap-2 sm:grid-cols-4"><XSel value={d.type} onChange={(v) => setD({ ...d, type: v })}>{DOC_TYPES.map((z) => <option key={z[0]} value={z[0]}>{lang === "en" ? z[2] : z[1]}</option>)}</XSel><XIn value={d.no} onChange={(v) => setD({ ...d, no: v })} ph={Lx(lang, "الرقم", "Number")} /><XIn type="date" value={d.expiry} onChange={(v) => setD({ ...d, expiry: v })} /><label className="text-[11.5px] rounded-xl px-3 py-2.5 cursor-pointer text-center font-bold" style={{ background: "rgba(20,27,45,.05)" }}>{d.fileName || Lx(lang, "إرفاق ملف (اختياري)", "Attach (optional)")}<input type="file" accept="image/*,application/pdf" className="hidden" onChange={onFile} /></label></div>}
            {can && <div className="mt-2"><Btn variant="accent" accent={role.glow} onClick={addDoc}>{Lx(lang, "إضافة مستند", "Add document")}</Btn></div>}
            {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}
          </Panel>
          <Panel title={Lx(lang, `التقييم السنوي ${year}`, `Annual review ${year}`)}>
            {revs.length > 0 && <div className="space-y-1.5 mb-3">{revs.map((r) => <div key={r.year} className="rounded-xl px-3 py-2" style={BOXS}><div className="flex items-center gap-2"><span className="num font-extrabold">{r.year}</span><Chip tone={r.avg >= 4 ? "ok" : r.avg >= 3 ? "info" : "warn"} sm>{r.avg} / 5</Chip><span className="flex-1" /><span className="text-[11px]" style={{ color: "var(--muted)" }}>{r.by}</span></div>{r.note && <p className="text-[11.5px] mt-1">{r.note}</p>}</div>)}</div>}
            {can && <><div className="space-y-1.5">{REVIEW_CRIT.map(([k, ar, en]) => <div key={k} className="flex items-center gap-2"><span className="flex-1 text-[12px] font-bold">{lang === "en" ? en : ar}</span>{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRv({ ...rv, [k]: n })} className="w-8 h-8 rounded-lg text-[12px] font-extrabold" style={{ background: rv[k] >= n ? "#12151D" : "rgba(20,27,45,.06)", color: rv[k] >= n ? "#fff" : "var(--muted)" }}>{n}</button>)}</div>)}</div>
              <XIn value={rv.note} onChange={(v) => setRv({ ...rv, note: v })} ph={Lx(lang, "ملاحظات التقييم", "Review notes")} cls="w-full mt-2" />
              <div className="mt-2"><Btn variant="accent" accent={role.glow} onClick={saveRv}>{revs.some((r) => r.year === year) ? Lx(lang, "تحديث تقييم هذا العام", "Update this year's review") : Lx(lang, "حفظ التقييم", "Save review")}</Btn></div></>}
          </Panel>
        </div>}
      </div>
    </div>
  );
}

/* ═══ 22) إنهاء الخدمة والمغادرة المنظّمة ═══ */
const OB_REASONS = [["pay", "الدخل / الأجر", "Pay"], ["orders", "قلة الطلبات", "Few orders"], ["sup", "علاقة بالمشرف", "Supervisor"], ["job", "فرصة أخرى", "Other job"], ["personal", "ظروف شخصية", "Personal"], ["end", "انتهاء العقد", "Contract end"], ["company", "قرار الشركة / انضباط", "Company decision"]];
const OB_STEPS = [["assets", "تسليم العهدة والمعدات", "Return assets & equipment", ["hr", "opsm", "ops", "gm"]], ["accounts", "إغلاق حسابه على التطبيق وإيقاف الدخول", "Close app account & access", ["hr", "opsm", "gm"]], ["advances", "تسوية السلف والمستحقات", "Settle advances & dues", ["fin", "gm"]], ["docs", "تسليم المستندات وشهادة الخبرة", "Hand over documents & experience letter", ["hr", "gm"]], ["exit", "مقابلة الخروج", "Exit interview", ["hr", "opsm", "gm"]]];
const EXIT_TYPES = [["resign", "استقالة", "Resignation"], ["suspend", "إيقاف عن العمل", "Suspension"], ["fire", "إنهاء من الشركة", "Termination"]];
const exitName = (k, lang) => { const z = EXIT_TYPES.find((x) => x[0] === (k || "resign")) || EXIT_TYPES[0]; return lang === "en" ? z[2] : z[1]; };
const exitBanner = (k, lang) => (k === "suspend" ? Lx(lang, "موقوف عن العمل", "Suspended from work") : k === "fire" ? Lx(lang, "تم إنهاء تعاقدك — موقوف عن العمل", "Contract ended — suspended from work") : Lx(lang, "مستقال وموقوف عن العمل", "Resigned — suspended from work"));
// كشف المغادرة الدقيق للمندوب: تاريخ البدء والنهاية والطلبات والأرباح والمخالفات شهراً بشهر
function exitStatement(rep, RP, pricing, repSettlements, wf, vp, receipts, endDate) {
  const mine = RP.filter((rp) => rp.entries.some((e) => e.id === rep.id));
  const months = [...new Set(mine.map((rp) => rp.date.slice(0, 7)))].sort();
  const dates = []; mine.forEach((rp) => { if (rp.entries.some((e) => e.id === rep.id && ((e.orders || 0) > 0 || (e.hours || 0) > 0))) dates.push(rp.date); }); dates.sort();
  const rows = months.map((m) => {
    const c = repMonthCalc(monthEntriesFor(RP, rep.id, m), rep, pricing, wf, vp, monthFactor(m), m);
    const n = repNetFor(rep, m, RP, pricing, repSettlements, wf, vp, receipts);
    return { month: m, orders: c.orders, base: (c.byApp[c.main] || {}).base || 0, gross: c.gross, weekend: c.weekendCount, app: c.appCount, fines: r2(c.weekendAuto + c.appAuto), net: n.net, final: !!n.final };
  });
  const sum = (k) => rows.reduce((a, x) => a + (x[k] || 0), 0);
  return { startDate: rep.startDate || dates[0] || null, endDate: endDate || rep.leftAt || null, firstOrderDate: dates[0] || null, lastOrderDate: dates[dates.length - 1] || null, workDays: dates.length,
    orders: sum("orders"), gross: r2(sum("gross")), net: r2(sum("net")), weekend: sum("weekend"), app: sum("app"), violations: sum("weekend") + sum("app"), fines: r2(sum("fines")), months: rows, appId: rep.app };
}
const daysBetween = (a, b) => (a && b ? Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000)) : null);
const reasonName = (k, lang) => { const z = OB_REASONS.find((x) => x[0] === k); return z ? (lang === "en" ? z[2] : z[1]) : k; };
function LeaveReasonsPanel({ lang, ext }) {
  const E = extOf(ext); const done = E.offboard.filter((c) => c.exit && c.exit.reason); if (!done.length) return null;
  const cnt = {}; done.forEach((c) => { cnt[c.exit.reason] = (cnt[c.exit.reason] || 0) + 1; });
  const rows = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
  return <Panel title={Lx(lang, "أسباب المغادرة (من مقابلات الخروج)", "Leaving reasons (exit interviews)")}><div className="space-y-1.5">{rows.map((k) => <div key={k} className="flex items-center gap-2 text-[12.5px]"><span className="w-36 font-bold">{reasonName(k, lang)}</span><div className="flex-1"><XBar v={cnt[k] / done.length} color="#E4B85C" /></div><span className="num w-8 text-end">{cnt[k]}</span></div>)}</div></Panel>;
}
const liveOrSnap = (c, rr, rp, pricing, rs, wf, vp, receipts) => { if (c.snap) return c.snap; const r = rr.find((x) => x.id === c.pid); return r ? exitStatement(r, rp, pricing, rs, wf, vp, receipts, c.lastDay) : null; };
function StatBox({ label, value, tone }) { return <div className="rounded-xl px-3 py-2" style={BOXS}><p className="text-[10.5px]" style={{ color: "var(--muted)" }}>{label}</p><p className="num text-[14px] font-extrabold" style={tone ? { color: tone } : null}>{value}</p></div>; }
function ExitMonthsTable({ lang, S, sar, internal }) {
  return <div className="overflow-x-auto mt-2"><table className="w-full text-[11.5px]"><thead><tr style={{ color: "var(--muted)" }}>{[Lx(lang, "الشهر", "Month"), Lx(lang, "الطلبات", "Orders"), Lx(lang, "الإجمالي", "Gross"), Lx(lang, "مخالفات", "Violations"), Lx(lang, "غرامات", "Fines"), Lx(lang, "الصافي", "Net")].map((h, i) => <th key={i} className="text-start font-semibold py-1 pe-3">{h}</th>)}</tr></thead>
    <tbody>{S.months.map((m) => <tr key={m.month} style={{ borderTop: "1px solid var(--line)" }}><td className="num py-1.5 pe-3">{m.month}</td><td className="num pe-3">{fmt(m.orders)}{internal && m.base ? <span style={{ color: "#8A611E" }}> ({Lx(lang, "عدّاد الشركة يبدأ من", "company counter from")} {m.base})</span> : null}</td><td className="num pe-3">{fmt(Math.round(m.gross))}</td><td className="num pe-3">{m.weekend + m.app}</td><td className="num pe-3">{fmt(Math.round(m.fines))}</td><td className="num font-bold">{fmt(Math.round(m.net))} {sar}</td></tr>)}
      {!S.months.length && <tr><td colSpan={6} className="py-2" style={{ color: "var(--muted)" }}>{Lx(lang, "لا توجد تقارير مسجّلة له.", "No reports on record.")}</td></tr>}</tbody></table></div>;
}
function ExitStatementBox({ lang, c, rr, rp, pricing, repSettlements, wf, vp, receipts, sar }) {
  const S = liveOrSnap(c, rr, rp, pricing, repSettlements, wf, vp, receipts); const [show, setShow] = useState(false); if (!S) return null;
  const dur = daysBetween(S.startDate, c.lastDay);
  return <div className="mt-3 rounded-2xl p-3" style={BOXS}>
    <p className="text-[12.5px] font-extrabold mb-2">{Lx(lang, "كشف المغادرة الدقيق", "Exact exit statement")} {c.snap ? "🔒" : ""}</p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <StatBox label={Lx(lang, "تاريخ البدء", "Start date")} value={S.startDate || "—"} />
      <StatBox label={Lx(lang, "تاريخ النهاية", "End date")} value={c.lastDay} />
      <StatBox label={Lx(lang, "مدة الخدمة (يوم)", "Service (days)")} value={dur == null ? "—" : fmt(dur)} />
      <StatBox label={Lx(lang, "أيام عمل فعلية", "Worked days")} value={fmt(S.workDays)} />
      <StatBox label={Lx(lang, "إجمالي الطلبات", "Total orders")} value={fmt(S.orders)} />
      <StatBox label={Lx(lang, "صافي الأرباح", "Net earnings")} value={`${fmt(Math.round(S.net))} ${sar}`} tone="#0B5C46" />
      <StatBox label={Lx(lang, "المخالفات", "Violations")} value={`${S.violations} (${Lx(lang, "نهاية أسبوع", "wknd")} ${S.weekend} · ${Lx(lang, "تطبيق", "app")} ${S.app})`} tone={S.violations ? "#C0443A" : null} />
      <StatBox label={Lx(lang, "قيمة الغرامات", "Fines")} value={`${fmt(Math.round(S.fines))} ${sar}`} tone={S.fines ? "#C0443A" : null} />
    </div>
    <button onClick={() => setShow(!show)} className="text-[11.5px] font-bold mt-2 underline">{show ? Lx(lang, "إخفاء التفصيل الشهري", "Hide monthly detail") : Lx(lang, "التفصيل الشهري", "Monthly detail")}</button>
    {show && <ExitMonthsTable lang={lang} S={S} sar={sar} internal />}
  </div>;
}
function ExitRegistry({ lang, cases, rr, rp, pricing, repSettlements, wf, vp, receipts, sar, today }) {
  const [q, setQ] = useState(""); const [typ, setTyp] = useState("all"); const [open, setOpen] = useState(null);
  const rows = cases.filter((c) => c.kind === "rep" && (typ === "all" || (c.exitType || "resign") === typ) && (!q.trim() || c.name.includes(q.trim()))).map((c) => ({ c, S: liveOrSnap(c, rr, rp, pricing, repSettlements, wf, vp, receipts) }));
  const staff = cases.filter((c) => c.kind !== "rep" && (typ === "all" || (c.exitType || "resign") === typ) && (!q.trim() || c.name.includes(q.trim())));
  const exportX = () => {
    const out = rows.map(({ c, S }) => ({ [Lx(lang, "الاسم", "Name")]: c.name, [Lx(lang, "النوع", "Type")]: exitName(c.exitType, lang), [Lx(lang, "السبب", "Reason")]: reasonName(c.reason, lang), [Lx(lang, "تاريخ البدء", "Start")]: S ? S.startDate || "" : "", [Lx(lang, "تاريخ النهاية", "End")]: c.lastDay, [Lx(lang, "أيام العمل", "Worked days")]: S ? S.workDays : "", [Lx(lang, "إجمالي الطلبات", "Orders")]: S ? S.orders : "", [Lx(lang, "صافي الأرباح", "Net")]: S ? S.net : "", [Lx(lang, "المخالفات", "Violations")]: S ? S.violations : "", [Lx(lang, "الغرامات", "Fines")]: S ? S.fines : "", [Lx(lang, "البديل", "Replacement")]: c.replName || "", [Lx(lang, "طلبات موروثة", "Inherited")]: c.inheritOrders || 0, [Lx(lang, "الحالة", "Status")]: c.status === "closed" ? Lx(lang, "مكتملة", "Closed") : Lx(lang, "مفتوحة", "Open") }));
    if (!out.length) return; const ws = XLSX.utils.json_to_sheet(out); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Exits"); XLSX.writeFile(wb, `exits_${today}.xlsx`);
  };
  return <Panel title={Lx(lang, "سجل الاستقالات والإيقاف", "Resignations & suspensions register")} extra={<Btn onClick={exportX}>Excel</Btn>}>
    <div className="flex gap-2 flex-wrap mb-3"><XIn value={q} onChange={setQ} ph={Lx(lang, "بحث بالاسم", "Search name")} cls="w-44" />
      <XSel value={typ} onChange={setTyp}><option value="all">{Lx(lang, "كل الأنواع", "All types")}</option>{EXIT_TYPES.map((z) => <option key={z[0]} value={z[0]}>{lang === "en" ? z[2] : z[1]}</option>)}</XSel></div>
    {rows.length === 0 && staff.length === 0 ? EMPTYT(lang) : <div className="space-y-2">
      {rows.map(({ c, S }) => <div key={c.id} className="rounded-2xl p-3" style={BOXS}>
        <div className="flex items-center gap-2 flex-wrap"><b className="text-[13.5px]">{c.name}</b><Chip tone="bad" sm>{exitName(c.exitType, lang)}</Chip><Chip tone={c.status === "closed" ? "ok" : "warn"} sm>{c.status === "closed" ? Lx(lang, "مكتملة", "Closed") : Lx(lang, "مفتوحة", "Open")}</Chip>
          <span className="num text-[11.5px] ms-auto" style={{ color: "var(--muted)" }}>{S && S.startDate ? S.startDate : "—"} ← {c.lastDay}</span></div>
        {S && <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
          <StatBox label={Lx(lang, "الطلبات", "Orders")} value={fmt(S.orders)} /><StatBox label={Lx(lang, "صافي الأرباح", "Net")} value={`${fmt(Math.round(S.net))} ${sar}`} tone="#0B5C46" />
          <StatBox label={Lx(lang, "المخالفات", "Violations")} value={S.violations} tone={S.violations ? "#C0443A" : null} /><StatBox label={Lx(lang, "الغرامات", "Fines")} value={`${fmt(Math.round(S.fines))} ${sar}`} />
          <StatBox label={Lx(lang, "البديل", "Replacement")} value={c.replName ? `${c.replName} (${c.inheritOrders})` : "—"} /></div>}
        {S && <button onClick={() => setOpen(open === c.id ? null : c.id)} className="text-[11.5px] font-bold mt-2 underline">{open === c.id ? Lx(lang, "إخفاء التفصيل", "Hide detail") : Lx(lang, "التفصيل الشهري", "Monthly detail")}</button>}
        {S && open === c.id && <ExitMonthsTable lang={lang} S={S} sar={sar} internal />}
      </div>)}
      {staff.map((c) => <div key={c.id} className="rounded-2xl p-3 flex items-center gap-2 flex-wrap" style={BOXS}><b className="text-[13px]">{c.name}</b><Chip tone="n" sm>{Lx(lang, "موظف", "Staff")}</Chip><Chip tone="bad" sm>{exitName(c.exitType, lang)}</Chip><span className="num text-[11.5px] ms-auto" style={{ color: "var(--muted)" }}>{c.lastDay}</span></div>)}
    </div>}
  </Panel>;
}
/* شاشة المندوب بعد الاستقالة/الإيقاف: كشف دقيق بتاريخ البدء والنهاية والطلبات والأرباح والمخالفات */
function RepExitScreen({ lang, setLang, rep, reports, pricing, repSettlements, weekendFine, violationPenalty, repReceipts, ext, onLogout }) {
  const E = extOf(ext); const t = T[lang];
  const cs = (E.offboard || []).filter((c) => c.pid === rep.id).sort((a, b) => (b.at || "").localeCompare(a.at || ""))[0] || null;
  const typ = (cs && cs.exitType) || rep.exitType || (rep.status === "suspended" ? "suspend" : "resign");
  const end = (cs && cs.lastDay) || rep.leftAt || null;
  const S = (cs && cs.snap) || exitStatement(rep, reports, pricing, repSettlements, weekendFine, violationPenalty, repReceipts, end);
  const dur = daysBetween(S.startDate, end); const settled = cs && cs.settle && cs.settle.status === "approved";
  return (
    <div className="min-h-screen px-4 py-6" dir={lang === "en" ? "ltr" : "rtl"} style={{ background: "#F4F1EA", color: "#12151D" }}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="rounded-3xl p-6 text-center" style={{ background: "linear-gradient(135deg,#3A1513,#7A2A24)", color: "#fff" }}>
          <p className="text-[12px] opacity-70 mb-1">{lang === "en" ? rep.en : rep.ar}</p>
          <p className="text-[22px] font-extrabold">{exitBanner(typ, lang)}</p>
          <p className="num text-[13px] mt-2 opacity-90">{Lx(lang, "تاريخ الإيقاف", "Effective")}: {end || "—"}</p>
          <p className="text-[11.5px] mt-1 opacity-70">{Lx(lang, "حسابك لم يعد يستقبل الطلبات. هذا كشف بحسابك حتى تاريخ الإيقاف.", "Your account no longer takes orders. This is your statement up to the effective date.")}</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <StatBox label={Lx(lang, "تاريخ البدء", "Start date")} value={S.startDate || "—"} />
          <StatBox label={Lx(lang, "تاريخ النهاية", "End date")} value={end || "—"} />
          <StatBox label={Lx(lang, "مدة الخدمة (يوم)", "Service (days)")} value={dur == null ? "—" : fmt(dur)} />
          <StatBox label={Lx(lang, "أيام العمل الفعلية", "Worked days")} value={fmt(S.workDays)} />
          <StatBox label={Lx(lang, "إجمالي الطلبات", "Total orders")} value={fmt(S.orders)} />
          <StatBox label={Lx(lang, "صافي أرباحك", "Net earnings")} value={`${fmt(Math.round(S.net))} ${t.sar}`} tone="#0B5C46" />
          <StatBox label={Lx(lang, "عدد المخالفات", "Violations")} value={`${S.violations}`} tone={S.violations ? "#C0443A" : null} />
          <StatBox label={Lx(lang, "قيمة الغرامات", "Fines")} value={`${fmt(Math.round(S.fines))} ${t.sar}`} tone={S.fines ? "#C0443A" : null} />
        </div>
        {S.violations > 0 && <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, `المخالفات: نهاية أسبوع ${S.weekend} · مخالفات التطبيق ${S.app}`, `Weekend ${S.weekend} · app ${S.app}`)}</p>}
        <div className="rounded-2xl p-4 bg-white" style={{ border: "1px solid var(--line)" }}>
          <p className="text-[13px] font-extrabold">{Lx(lang, "التفصيل الشهري", "Monthly detail")}</p>
          <ExitMonthsTable lang={lang} S={S} sar={t.sar} />
        </div>
        {cs && <div className="rounded-2xl p-4 bg-white text-[12.5px]" style={{ border: "1px solid var(--line)" }}>
          <p className="font-extrabold mb-1">{Lx(lang, "التسوية النهائية", "Final settlement")}</p>
          {settled ? <p className="num">{Lx(lang, "معتمدة — الصافي المستحق", "Approved — net due")}: <b>{fmt(Math.round(cs.settle.amount || 0))} {t.sar}</b></p> : <p style={{ color: "var(--muted)" }}>{Lx(lang, "قيد الاعتماد لدى المالية.", "Pending with Finance.")}</p>}
        </div>}
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 rounded-2xl p-3.5 text-[13px] font-bold" style={{ background: "rgba(232,131,122,.1)", border: "1px solid rgba(232,131,122,.35)", color: "#C0443A" }}><LogOut size={16} />{t.logout}</button>
      </div>
    </div>
  );
}
function OffboardPage({ lang, role, reps, allReps, allReports, reports, employees, setReps, setEmployees, pricing, repSettlements, weekendFine, violationPenalty, repReceipts, ext, setExt, setRepSettlements, setAuditLog, actingEmployee }) {
  const t = T[lang]; const E = extOf(ext); const RR = allReps || reps, RP = allReports || reports; const today = riyadhToday(); const me = byName(role, actingEmployee);
  const canStart = role.id === "hr" || role.id === "opsm" || role.id === "gm";
  const [tab, setTab] = useState("open");
  const [f, setF] = useState({ kind: "rep", pid: "", lastDay: today, reason: "personal", text: "", exitType: "resign", repl: "" }); const [open, setOpen] = useState({}); const [err, setErr] = useState(""); const [ded, setDed] = useState({}); const [ex, setEx] = useState({});
  const upd = (id, fn) => extUpd(setExt, "offboard", (a) => a.map((z) => (z.id === id ? fn(z) : z)));
  const baseFor = (r, lastDay) => {
    const mo = lastDay.slice(0, 7); const by = {};
    monthEntriesFor(RP, r.id, mo).filter((e) => e.date <= lastDay).forEach((e) => { const a = e.app || r.app || "hs"; by[a] = (by[a] || 0) + (e.orders || 0); });
    const apps = Object.keys(by).sort((x, y) => by[y] - by[x]); const a = apps[0] || r.app;
    return { app: a, orders: by[a] || 0, month: mo };
  };
  const pushInherit = (c, rid, info) => setReps((p) => p.map((r) => {
    if (r.inherit && r.inherit.caseId === c.id && r.id !== rid) { const { inherit: _x, ...rest } = r; return rest; }
    if (r.id === rid) return { ...r, inherit: { ...info, fromId: c.pid, fromName: c.name, date: c.lastDay, caseId: c.id } };
    return r;
  }));
  const assignRepl = (c, rid) => {
    const old = RR.find((r) => r.id === c.pid); if (!old) return;
    if (!rid) { setReps((p) => p.map((r) => { if (r.inherit && r.inherit.caseId === c.id) { const { inherit: _x, ...rest } = r; return rest; } return r; })); upd(c.id, (z) => ({ ...z, replacementId: "", replName: "", inheritOrders: 0 })); return; }
    const nr = RR.find((r) => r.id === rid); const info = baseFor(old, c.lastDay);
    pushInherit(c, rid, info);
    upd(c.id, (z) => ({ ...z, replacementId: rid, replName: nr ? nr.ar : rid, inheritOrders: info.orders, inheritApp: info.app, inheritMonth: info.month, replAt: today, replBy: me }));
    logAudit(setAuditLog, role, "offboard_replacement", `${c.name} → ${nr ? nr.ar : rid} (${info.orders})`, actingEmployee);
  };
  const pool = f.kind === "rep" ? RR.filter((r) => r.status === "active").map((r) => ({ id: r.id, name: r.ar })) : (employees || []).filter((e) => e.status !== "suspended").map((e) => ({ id: e.id, name: e.name }));
  const openIds = new Set(E.offboard.filter((c) => c.status === "open").map((c) => c.pid));
  const start = () => {
    const p = pool.find((x) => x.id === f.pid); if (!p || !f.lastDay) return setErr(Lx(lang, "اختر الشخص وآخر يوم عمل.", "Pick a person and last day."));
    if (openIds.has(p.id)) return setErr(Lx(lang, "توجد حالة مفتوحة له.", "An open case exists."));
    if (f.text.trim().length < 4) return setErr(Lx(lang, "اكتب تفاصيل السبب.", "Add reason details.")); setErr("");
    const isSup = f.kind === "emp" && (employees || []).some((e) => e.id === p.id && e.isSupervisor);
    const teamN = isSup ? RR.filter((r) => r.sup === p.id && r.status === "active").length : 0;
    const steps = Object.fromEntries(OB_STEPS.map(([k]) => [k, null]));
    const oid = uidX("OB"); const oldRep = f.kind === "rep" ? RR.find((r) => r.id === p.id) : null; const nr = f.repl ? RR.find((r) => r.id === f.repl) : null; const info = oldRep && nr ? baseFor(oldRep, f.lastDay) : null;
    if (info) pushInherit({ id: oid, pid: p.id, name: p.name, lastDay: f.lastDay }, f.repl, info);
    extUpd(setExt, "offboard", (a) => [{ id: oid, exitType: f.exitType, replacementId: info ? f.repl : "", replName: info ? nr.ar : "", inheritOrders: info ? info.orders : 0, inheritApp: info ? info.app : "", inheritMonth: info ? info.month : "", kind: f.kind, pid: p.id, name: p.name, lastDay: f.lastDay, reason: f.reason, text: f.text.trim(), steps, teamN, teamMoved: teamN === 0 ? { by: "—", at: today } : null, deds: [], settle: { status: "draft" }, exit: null, status: "open", by: me, at: riyadhNow().toISOString() }, ...a]);
    logAudit(setAuditLog, role, "offboard_start", `${p.name}: ${f.reason}`, actingEmployee); setF({ ...f, pid: "", text: "", repl: "" }); setTab("open");
  };
  const calc = (c) => {
    if (c.kind !== "rep") return { net: 0, savings: 0, dedTotal: (c.deds || []).reduce((s, x) => s + (+x.amount || 0), 0), final: 0 - (c.deds || []).reduce((s, x) => s + (+x.amount || 0), 0), isRep: false };
    const rep = RR.find((r) => r.id === c.pid); const net = rep ? repNetFor(rep, c.lastDay.slice(0, 7), RP, pricing, repSettlements, weekendFine, violationPenalty, repReceipts).net : 0;
    const savings = E.wallet.filter((w) => w.repId === c.pid && w.status === "approved").reduce((s, w) => s + (w.kind === "saving" ? +w.amount : w.kind === "withdraw" ? -w.amount : 0), 0);
    const dedTotal = (c.deds || []).reduce((s, x) => s + (+x.amount || 0), 0);
    return { net, savings: Math.max(0, savings), dedTotal, final: r2(net + Math.max(0, savings) - dedTotal), isRep: true };
  };
  const toggle = (c, k) => upd(c.id, (z) => ({ ...z, steps: { ...z.steps, [k]: z.steps[k] ? null : { by: me, at: riyadhNow().toISOString() } } }));
  const addDed = (c) => { const d = ded[c.id] || {}; if (!(+d.amount > 0) || (d.reason || "").trim().length < 4) return; upd(c.id, (z) => ({ ...z, deds: [...z.deds, { amount: +d.amount, reason: d.reason.trim(), by: me }], settle: { status: "draft" } })); setDed({ ...ded, [c.id]: { amount: "", reason: "" } }); };
  const approveSettle = (c) => {
    const k = calc(c); const sign = { role: role.id, by: me, at: riyadhNow().toISOString() };
    const approvals = [...((c.settle.approvals || []).filter((a) => a.role !== role.id)), sign];
    const done = walletFinal({ amount: Math.abs(k.final), approvals }, +E.cfg.dualLimit);
    upd(c.id, (z) => ({ ...z, settle: { ...z.settle, approvals, status: done ? "approved" : "draft", amount: k.final } }));
    if (done && c.kind === "rep" && !c.settle.applied) {
      const mo = c.lastDay.slice(0, 7);
      if (k.savings > 0) { extUpd(setExt, "wallet", (a) => [{ id: uidX("WL"), repId: c.pid, name: c.name, kind: "withdraw", amount: k.savings, month: mo, status: "approved", approvals: approvals, reason: Lx(lang, "تسوية نهاية الخدمة", "End-of-service refund"), at: riyadhNow().toISOString() }, ...a]); addManualAdj(setRepSettlements, mo, { id: "OB-" + c.id, repId: c.pid, type: "add", amount: k.savings, reason: Lx(lang, "رد رصيد الادخار عند المغادرة", "Savings refund on exit"), by: me }); }
      (c.deds || []).forEach((dd, i) => addManualAdj(setRepSettlements, mo, { id: "OBD-" + c.id + "-" + i, repId: c.pid, type: "deduct", amount: +dd.amount, reason: dd.reason, by: me }));
      upd(c.id, (z) => ({ ...z, settle: { ...z.settle, applied: true } }));
    }
    logAudit(setAuditLog, role, "offboard_settle_sign", `${c.name}: ${k.final}`, actingEmployee);
  };
  const closeCase = (c) => {
    const old = c.kind === "rep" ? RR.find((r) => r.id === c.pid) : null;
    const snap = old ? { ...exitStatement(old, RP, pricing, repSettlements, weekendFine, violationPenalty, repReceipts, c.lastDay), at: today } : null;
    if (c.kind === "rep") setReps((p) => p.map((r) => (r.id === c.pid ? { ...r, status: c.exitType === "suspend" ? "suspended" : "left", leftAt: c.lastDay, exitType: c.exitType || "resign", exitCaseId: c.id } : r)));
    else setEmployees((p) => p.map((e) => (e.id === c.pid ? { ...e, status: "suspended", leftAt: c.lastDay } : e)));
    if (old && c.replacementId) assignRepl(c, c.replacementId);
    upd(c.id, (z) => ({ ...z, status: "closed", closedAt: today, closedBy: me, snap })); logAudit(setAuditLog, role, "offboard_close", c.name, actingEmployee);
  };
  const shown = tab === "registry" ? [] : E.offboard.filter((c) => c.status === tab);
  const rv = (c) => ({ rating: 0, reason: c.reason, comment: "", back: "yes", ...(ex[c.id] || {}) });
  return (
    <div className="space-y-4">
      <XTabs tab={tab} setTab={setTab} tabs={[["open", Lx(lang, "حالات مفتوحة", "Open"), E.offboard.filter((c) => c.status === "open").length], ["closed", Lx(lang, "مكتملة", "Closed"), E.offboard.filter((c) => c.status === "closed").length], ["registry", Lx(lang, "سجل الاستقالات والإيقاف", "Exit register"), E.offboard.length]]} />
      {tab === "registry" && <ExitRegistry lang={lang} cases={E.offboard} rr={RR} rp={RP} pricing={pricing} repSettlements={repSettlements} wf={weekendFine} vp={violationPenalty} receipts={repReceipts} sar={t.sar} today={today} />}
      {canStart && tab === "open" && <Panel title={Lx(lang, "بدء إجراء مغادرة", "Start an offboarding")}>
        <div className="grid gap-2 sm:grid-cols-2">
          <XSel value={f.kind} onChange={(v) => setF({ ...f, kind: v, pid: "" })}><option value="rep">{Lx(lang, "مندوب", "Rider")}</option><option value="emp">{Lx(lang, "موظف مكتب/مشرف", "Staff / supervisor")}</option></XSel>
          <XSel value={f.pid} onChange={(v) => setF({ ...f, pid: v })}><option value="">{Lx(lang, "— اختر —", "— pick —")}</option>{pool.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</XSel>
          <XIn type="date" value={f.lastDay} onChange={(v) => setF({ ...f, lastDay: v })} />
          <XSel value={f.reason} onChange={(v) => setF({ ...f, reason: v })}>{OB_REASONS.map((z) => <option key={z[0]} value={z[0]}>{lang === "en" ? z[2] : z[1]}</option>)}</XSel>
          <XSel value={f.exitType} onChange={(v) => setF({ ...f, exitType: v })}>{EXIT_TYPES.map((z) => <option key={z[0]} value={z[0]}>{lang === "en" ? z[2] : z[1]}</option>)}</XSel>
          {f.kind === "rep" && <XSel value={f.repl} onChange={(v) => setF({ ...f, repl: v })}><option value="">{Lx(lang, "— البديل (اختياري، يمكن تحديده لاحقاً) —", "— Replacement (optional) —")}</option>{RR.filter((r) => (r.status === "active" || r.status === "pending") && r.id !== f.pid).map((r) => <option key={r.id} value={r.id}>{r.ar}{r.status === "pending" ? Lx(lang, " (قيد الاعتماد)", " (pending)") : ""}</option>)}</XSel>}</div>
        {f.kind === "rep" && f.repl && f.pid && (() => { const o = RR.find((r) => r.id === f.pid); if (!o) return null; const b = baseFor(o, f.lastDay); const nr = RR.find((r) => r.id === f.repl); return <p className="text-[11.5px] mt-2 font-semibold" style={{ color: "#8A611E" }}>{Lx(lang, `عدّاد الشركة للبديل (${nr ? nr.ar : ""}) يكمل من ${b.orders} طلب لشهر ${b.month}. أجر المندوب يبدأ من الطلب 1 ولا يعرف بذلك.`, `Company counter continues from ${b.orders} orders (${b.month}); rider pay starts at 1 and he is not told.`)}{nr && nr.app !== b.app ? Lx(lang, " ⚠ تطبيقه مختلف عن تطبيق المستقيل فلن يعمل العدّاد.", " ⚠ different app — no tier effect.") : ""}</p>; })()}
        <XIn value={f.text} onChange={(v) => setF({ ...f, text: v })} ph={Lx(lang, "تفاصيل السبب", "Reason details")} cls="w-full mt-2" />
        {err && <p className="text-[11.5px] mt-2" style={{ color: "#C0443A" }}>{err}</p>}<div className="mt-2"><Btn variant="accent" accent={role.glow} onClick={start}>{Lx(lang, "بدء الإجراء", "Start")}</Btn></div>
      </Panel>}
      {tab === "registry" ? null : shown.length === 0 ? <Panel title={Lx(lang, "الحالات", "Cases")}>{EMPTYT(lang)}</Panel> : shown.map((c) => { const k = calc(c); const stepsDone = OB_STEPS.every(([s]) => c.steps[s]) && !!c.exit && !!c.teamMoved; const settled = c.settle.status === "approved"; const V = rv(c); const need = walletFinal({ amount: Math.abs(k.final), approvals: [] }, +E.cfg.dualLimit); const signed = (c.settle.approvals || []).map((a) => a.role); return (
        <Panel key={c.id} title={`${c.name} · ${c.kind === "rep" ? Lx(lang, "مندوب", "Rider") : Lx(lang, "موظف", "Staff")}`} extra={<div className="flex gap-1.5"><Chip tone="bad" sm>{exitName(c.exitType, lang)}</Chip><Chip tone={c.status === "closed" ? "ok" : "warn"} sm>{reasonName(c.reason, lang)}</Chip></div>}>
          <p className="num text-[11.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "آخر يوم", "Last day")}: {c.lastDay} · {c.text}</p>
          {c.kind === "rep" && <ExitStatementBox lang={lang} c={c} rr={RR} rp={RP} pricing={pricing} repSettlements={repSettlements} wf={weekendFine} vp={violationPenalty} receipts={repReceipts} sar={t.sar} />}
          {c.kind === "rep" && <div className="mt-3 rounded-2xl p-3" style={BOXS}>
            <p className="text-[12.5px] font-extrabold mb-1.5">{Lx(lang, "البديل — عدّاد شريحة التطبيق يكمل (داخلي، لا يراه المندوب)", "Replacement — company tier counter continues (internal, hidden from rider)")}</p>
            {canStart ? <XSel value={c.replacementId || ""} onChange={(v) => assignRepl(c, v)}><option value="">{Lx(lang, "— لم يُحدَّد بعد —", "— not set —")}</option>{RR.filter((r) => (r.status === "active" || r.status === "pending") && r.id !== c.pid).map((r) => <option key={r.id} value={r.id}>{r.ar}{r.status === "pending" ? Lx(lang, " (قيد الاعتماد)", " (pending)") : ""}</option>)}</XSel> : null}
            {c.replacementId ? <p className="num text-[12px] mt-1.5">{c.replName} · {Lx(lang, `عدّاد الشركة يكمل من ${c.inheritOrders} طلب (${c.inheritMonth}) — أما أجر المندوب فيبدأ من الطلب 1 بشكل عادي`, `Company counter continues from ${c.inheritOrders} orders (${c.inheritMonth}); rider pay starts at order 1`)}</p> : <p className="text-[11.5px] mt-1" style={{ color: "var(--muted)" }}>{Lx(lang, "لا يوجد بديل محدد.", "No replacement set.")}</p>}
          </div>}
          <div className="mt-3 space-y-1.5">
            {OB_STEPS.filter(([s]) => s !== "exit").map(([s, ar, en, who]) => { const dn = c.steps[s]; const ok = who.includes(role.id); return <div key={s} className="flex items-center gap-2 rounded-xl px-3 py-2" style={BOXS}><button disabled={!ok || c.status === "closed" || (s === "advances" && !settled && !dn)} onClick={() => toggle(c, s)} className="text-[16px]" aria-label="toggle">{dn ? "✅" : "⬜"}</button><span className="flex-1 text-[12.5px] font-bold">{lang === "en" ? en : ar}</span>{dn && <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>{dn.by}</span>}</div>; })}
            {c.teamN > 0 && <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={BOXS}><button disabled={!canStart || c.status === "closed"} onClick={() => upd(c.id, (z) => ({ ...z, teamMoved: z.teamMoved && z.teamMoved.by !== "—" ? null : { by: me, at: today } }))} className="text-[16px]" aria-label="toggle">{c.teamMoved && c.teamMoved.by !== "—" ? "✅" : "⬜"}</button><span className="flex-1 text-[12.5px] font-bold">{Lx(lang, `نقل مناديب فريقه (${c.teamN}) لمشرف آخر`, `Reassign his ${c.teamN} riders`)}</span></div>}
          </div>
          <div className="mt-3 rounded-2xl p-3" style={BOXS}>
            <p className="text-[12.5px] font-extrabold mb-1.5">{Lx(lang, "مقابلة الخروج", "Exit interview")} {c.exit ? "✅" : ""}</p>
            {c.exit ? <p className="text-[12px]">{reasonName(c.exit.reason, lang)} · {"★".repeat(c.exit.rating)}{"☆".repeat(5 - c.exit.rating)} · {c.exit.back === "yes" ? Lx(lang, "يعود للعمل معنا", "Would return") : Lx(lang, "لن يعود", "Would not return")}{c.exit.comment ? ` — ${c.exit.comment}` : ""}</p> : c.status === "open" && (role.id === "hr" || role.id === "opsm" || role.id === "gm") ? <div className="space-y-2">
              <div className="flex gap-1 items-center"><span className="text-[11.5px] ml-2">{Lx(lang, "تقييم تجربته", "Experience")}</span>{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setEx({ ...ex, [c.id]: { ...V, rating: n } })} className="text-[18px]" style={{ color: V.rating >= n ? "#E4B85C" : "rgba(20,27,45,.2)" }}>★</button>)}</div>
              <div className="grid gap-2 sm:grid-cols-2"><XSel value={V.reason} onChange={(x) => setEx({ ...ex, [c.id]: { ...V, reason: x } })}>{OB_REASONS.map((z) => <option key={z[0]} value={z[0]}>{lang === "en" ? z[2] : z[1]}</option>)}</XSel><XSel value={V.back} onChange={(x) => setEx({ ...ex, [c.id]: { ...V, back: x } })}><option value="yes">{Lx(lang, "يعود للعمل معنا", "Would return")}</option><option value="no">{Lx(lang, "لن يعود", "Would not return")}</option></XSel></div>
              <XIn value={V.comment} onChange={(x) => setEx({ ...ex, [c.id]: { ...V, comment: x } })} ph={Lx(lang, "ما الذي كان سيبقيه؟", "What would have kept him?")} cls="w-full" />
              <Btn variant="accent" accent={role.glow} onClick={() => { if (!V.rating) return; upd(c.id, (z) => ({ ...z, exit: { rating: V.rating, reason: V.reason, back: V.back, comment: V.comment.trim(), by: me, at: today }, steps: { ...z.steps, exit: { by: me, at: riyadhNow().toISOString() } } })); }}>{Lx(lang, "حفظ المقابلة", "Save interview")}</Btn></div> : <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "بانتظار الموارد البشرية.", "Awaiting HR.")}</p>}
          </div>
          <div className="mt-3 rounded-2xl p-3" style={BOXS}>
            <p className="text-[12.5px] font-extrabold mb-1.5">{Lx(lang, "التسوية النهائية", "Final settlement")} {settled ? "✅" : ""}</p>
            {k.isRep && <p className="num text-[12px]">{Lx(lang, "صافي شهر المغادرة", "Net for last month")}: {fmt(Math.round(k.net))} · {Lx(lang, "رصيد الادخار المردود", "Savings refund")}: {fmt(Math.round(k.savings))}</p>}
            {(c.deds || []).map((x, i) => <p key={i} className="num text-[12px]" style={{ color: "#C0443A" }}>− {fmt(x.amount)} {x.reason} ({x.by})</p>)}
            <p className="num text-[15px] font-extrabold mt-1">{Lx(lang, "الصافي المستحق", "Net due")}: {fmt(Math.round(k.final))} {t.sar}</p>
            {c.status === "open" && role.id === "fin" && !settled && <div className="flex gap-2 mt-2"><XIn type="number" value={(ded[c.id] || {}).amount || ""} onChange={(x) => setDed({ ...ded, [c.id]: { ...(ded[c.id] || {}), amount: x } })} ph={Lx(lang, "خصم (ر.س)", "Deduction")} cls="w-28" /><XIn value={(ded[c.id] || {}).reason || ""} onChange={(x) => setDed({ ...ded, [c.id]: { ...(ded[c.id] || {}), reason: x } })} ph={Lx(lang, "سبب الخصم (مثل: عهدة غير مُسلَّمة)", "Reason")} cls="flex-1 min-w-0" /><Btn onClick={() => addDed(c)}>{Lx(lang, "إضافة", "Add")}</Btn></div>}
            {c.status === "open" && !settled && (role.id === "fin" || role.id === "gm") && <div className="flex gap-2 mt-2 items-center flex-wrap"><Chip tone={signed.includes("fin") ? "ok" : "n"} sm>{Lx(lang, "المالية", "Finance")}</Chip>{need && <Chip tone={signed.includes("gm") ? "ok" : "n"} sm>{Lx(lang, "المدير العام", "GM")}</Chip>}<Btn variant="accent" accent={role.glow} onClick={() => approveSettle(c)}>{Lx(lang, "اعتماد التسوية", "Approve settlement")}</Btn></div>}
            <p className="text-[10.5px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, "الخصم من المستحقات النهائية مقيَّد بنظام العمل ويحتاج موافقة موثّقة — راجع الشؤون القانونية قبل أي خصم. إن كان شهر المغادرة مغلقاً لن تُضاف التعديلات تلقائياً لكشفه.", "Deductions from final dues are restricted by labor law; consult Legal first. If the month is closed, adjustments are not auto-added.")}</p>
          </div>
          {c.status === "open" && canStart && <div className="mt-3"><Btn variant="accent" accent={role.glow} disabled={!stepsDone || !settled} onClick={() => closeCase(c)}>{stepsDone && settled ? Lx(lang, "إغلاق الحالة وتعطيل الحساب", "Close case & disable account") : Lx(lang, "أكمل كل الخطوات واعتماد التسوية", "Finish all steps & settlement")}</Btn></div>}
        </Panel>); })}
      <LeaveReasonsPanel lang={lang} ext={ext} />
    </div>
  );
}

Object.assign(T.ar.nav, {perfPlans: "خطط تحسين الأداء", coverage: "التغطية والبدائل", cockpit: "غرفة القيادة", whatIf: "ماذا لو؟", closeList: "الإقفال والذمم", cashflow: "التدفق النقدي", empFile: "ملفات الموظفين", offboard: "الاستقالات والإيقاف"});
Object.assign(T.en.nav, {perfPlans: "Improvement Plans", coverage: "Coverage & Bench", cockpit: "Command Room", whatIf: "What If?", closeList: "Close & Receivables", cashflow: "Cash Flow", empFile: "Staff Files", offboard: "Resignations & Suspensions"});
Object.assign(T.ur.nav, {perfPlans: "Improvement Plans", coverage: "Coverage & Bench", cockpit: "Command Room", whatIf: "What If?", closeList: "Close & Receivables", cashflow: "Cash Flow", empFile: "Staff Files", offboard: "Offboarding"});
/* ═══════════  حضور المناديب اليومي (نبض المناديب) + إشعارات بصوت + تقارير المناديب  ═══════════ */
EXT0.roll = {};

/* ─── صوت التنبيه والإشعار ─── */
const SND_KEY = "bq_sound";
function playAlert(urgent) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = window.__bqAudio || (window.__bqAudio = new AC()); if (ctx.state === "suspended") ctx.resume();
    const seq = urgent ? [880, 660, 880, 660, 880] : [740, 988]; let t0 = ctx.currentTime;
    seq.forEach((f) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = urgent ? "square" : "sine"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(urgent ? 0.22 : 0.14, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22); o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + 0.24); t0 += 0.27; });
  } catch (e) {}
}
function AlertSoundToggle({ lang, score, urgent, body }) {
  const [on, setOn] = useState(() => { try { return localStorage.getItem(SND_KEY) !== "off"; } catch (e) { return true; } });
  const prev = useRef(null); const base = useRef(null);
  useEffect(() => {
    const unlock = () => { try { const AC = window.AudioContext || window.webkitAudioContext; if (!window.__bqAudio && AC) window.__bqAudio = new AC(); if (window.__bqAudio && window.__bqAudio.state === "suspended") window.__bqAudio.resume(); } catch (e) {} };
    document.addEventListener("click", unlock); document.addEventListener("touchstart", unlock);
    return () => { document.removeEventListener("click", unlock); document.removeEventListener("touchstart", unlock); };
  }, []);
  useEffect(() => {
    if (prev.current !== null && score > prev.current && on) {
      playAlert(urgent);
      try { if (window.Notification && Notification.permission === "granted" && document.hidden) new Notification("بوارق الشرق", { body: body || "" }); } catch (e) {}
    }
    prev.current = score;
    try { if (base.current == null) base.current = document.title.replace(/^\(\d+\)\s*/, ""); document.title = (score > 0 ? `(${score}) ` : "") + base.current; } catch (e) {}
  }, [score]); // eslint-disable-line
  useEffect(() => { // تذكير هادئ كل دقيقتين ما دام هناك بلاغ عاجل لم يُعالَج
    if (!on || !urgent) return;
    const iv = setInterval(() => playAlert(true), 120000);
    return () => clearInterval(iv);
  }, [on, urgent]);
  const toggle = () => { const n = !on; setOn(n); try { localStorage.setItem(SND_KEY, n ? "on" : "off"); } catch (e) {} if (n) { playAlert(false); try { if (window.Notification && Notification.permission === "default") Notification.requestPermission(); } catch (e) {} } };
  return (
    <button onClick={toggle} className="relative p-2 rounded-xl" style={{ background: on ? "rgba(63,216,180,.14)" : "rgba(20,27,45,.045)", border: "1px solid var(--line)" }} aria-label={Lx(lang, "صوت التنبيه", "Alert sound")} title={on ? Lx(lang, "صوت التنبيه يعمل — اضغط للإيقاف", "Sound on") : Lx(lang, "صوت التنبيه متوقف — اضغط للتشغيل", "Sound off")}>
      {on ? <Volume2 size={16} style={{ color: "#0B5C46" }} /> : <VolumeX size={16} style={{ color: "var(--muted)" }} />}
    </button>
  );
}

/* ─── نبض المناديب: تحضير يومي يقوم به المشرف ─── */
function PulsePage({ lang, role, reps, allReps, attendance, ext, setExt, employees, setRepMessages, setAuditLog, actingEmployee, scopeSup, pricing, reports, allReports, weekendFine, violationPenalty }) {
  const E = extOf(ext); const today = riyadhToday(), month = today.slice(0, 7);
  const RR = scopeSup ? reps : (allReps || reps); const RP = scopeSup ? reports : (allReports || reports);
  const act = RR.filter((r) => r.status === "active");
  const [date, setDate] = useState(today); const [tab, setTab] = useState("roll"); const [dr, setDr] = useState({}); const [rej, setRej] = useState({}); const [err, setErr] = useState({});
  const canMark = role.id === "ops" || role.id === "opsm" || role.id === "hr" || role.id === "gm";
  const me = byName(role, actingEmployee);
  const dayRoll = (E.roll || {})[date] || {};
  const onLeave = (r) => E.leaves.some((l) => l.repId === r.id && l.status === "approved" && l.from <= date && l.to >= date);
  const clockOf = (r) => (attendance || []).find((a) => a.key === r.nid && a.date === date);
  const setRoll = (r, rec, d = date) => extUpd(setExt, "roll", (m) => ({ ...m, [d]: { ...(m[d] || {}), [r.id]: rec } }));
  const tell = (r, text) => setRepMessages && setRepMessages((prev) => [{ id: "RM-" + Date.now() + "-" + r.id, from: role.id, repId: r.id, text, at: riyadhNow().toISOString(), seen: false, seenAt: null }, ...prev]);
  const present = (r) => { setRoll(r, { st: "present", by: me, at: riyadhNow().toISOString() }); logAudit(setAuditLog, role, "roll_present", `${r.ar} ${date}`, actingEmployee); };
  const presentAll = () => act.filter((r) => !dayRoll[r.id] && !onLeave(r)).forEach((r) => setRoll(r, { st: "present", by: me, at: riyadhNow().toISOString() }));
  const leaveAbs = (r) => { setRoll(r, { st: "absent", contact: "leave", reason: Lx(lang, "إجازة معتمدة", "Approved leave"), excused: true, by: me, at: riyadhNow().toISOString() }); };
  const absent = (r) => {
    const d = dr[r.id] || {};
    if (!d.contact) return setErr({ ...err, [r.id]: Lx(lang, "حدّد: هل تواصلت مع المندوب؟", "Did you reach the rider?") });
    const reason = d.contact === "noanswer" ? (Lx(lang, "لم يجب على الاتصال", "Did not answer") + ((d.reason || "").trim() ? ` — ${d.reason.trim()}` : "")) : (d.reason || "").trim();
    if (d.contact === "reached" && reason.length < 4) return setErr({ ...err, [r.id]: Lx(lang, "اكتب سبب الغياب كما ذكره المندوب.", "Write the reason given.") });
    const excused = d.contact === "reached" && !!d.excused;
    setErr({ ...err, [r.id]: "" });
    setRoll(r, { st: "absent", contact: d.contact, reason, excused, by: me, at: riyadhNow().toISOString() });
    tell(r, excused
      ? Lx(lang, `سُجّل غيابك بتاريخ ${date} بعذر مقبول (${reason}). نذكّرك بأن أي غياب يلزمه سبب واضح وطارئ وتقديمه بشكل رسمي.`, `Your absence on ${date} was recorded as excused (${reason}).`)
      : Lx(lang, `⚠ سُجّل غيابك بتاريخ ${date} بدون عذر مقبول. السبب المسجَّل: ${reason}. تنبيه رسمي: لا غياب بدون سبب واضح وطارئ يُقدَّم بشكل رسمي. قدّم عذرك من صفحة «أدائي ونقاطي» خلال 48 ساعة وإلا يُحتسب بلا عذر ويخفض درجة الحضور.`, `⚠ Your absence on ${date} was recorded without an accepted excuse. Reason noted: ${reason}. Official notice: every absence needs a clear, urgent reason submitted formally. Submit your excuse within 48 hours or it counts as unexcused and lowers your attendance score.`));
    logAudit(setAuditLog, role, "roll_absent", `${r.ar} ${date}: ${reason.slice(0, 40)}`, actingEmployee);
    setDr({ ...dr, [r.id]: {} });
  };
  const undo = (r) => extUpd(setExt, "roll", (m) => { const day = { ...(m[date] || {}) }; delete day[r.id]; return { ...m, [date]: day }; });
  const decideExcuse = (d, r, ok) => {
    const note = (rej[r.id] || "").trim(); if (!ok && note.length < 4) return;
    extUpd(setExt, "roll", (m) => ({ ...m, [d]: { ...(m[d] || {}), [r.id]: { ...m[d][r.id], excused: ok, excuse: { ...m[d][r.id].excuse, status: ok ? "accepted" : "rejected", by: me, note: ok ? "" : note } } } }));
    tell(r, ok ? Lx(lang, `قُبل عذرك عن غياب ${d}.`, `Your excuse for ${d} was accepted.`) : Lx(lang, `لم يُقبل عذرك عن غياب ${d}: ${note}`, `Your excuse for ${d} was not accepted: ${note}`));
    logAudit(setAuditLog, role, ok ? "excuse_accept" : "excuse_reject", `${r.ar} ${d}`, actingEmployee);
  };
  const nPresent = act.filter((r) => (dayRoll[r.id] || {}).st === "present").length;
  const nAbsent = act.filter((r) => (dayRoll[r.id] || {}).st === "absent").length;
  const nPend = act.length - nPresent - nAbsent;
  const pending = []; Object.keys(E.roll || {}).sort().reverse().slice(0, 14).forEach((d) => act.forEach((r) => { const rc = E.roll[d][r.id]; if (rc && rc.st === "absent" && rc.excuse && rc.excuse.status === "pending") pending.push({ d, r, rc }); }));
  const tAvg = teamAvgOrders(RR, month, RP);
  const mrows = act.map((r) => { const p = perfOf(r, month, RP, attendance, ext, pricing, weekendFine, violationPenalty, tAvg); let pr = 0, ex = 0, un = 0; Object.keys(E.roll || {}).filter((d) => d.startsWith(month)).forEach((d) => { const rc = E.roll[d][r.id]; if (!rc) return; if (rc.st === "present") pr++; else if (rc.excused) ex++; else un++; }); return { r, pr, ex, un, att: p.att, pts: Math.round(40 * p.att) }; }).sort((a, b) => a.att - b.att);
  const bad = { background: "rgba(232,131,122,.14)", border: "1px solid rgba(232,131,122,.45)" };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: `linear-gradient(100deg,rgba(${role.glow},.13),rgba(${role.glow},.03))`, border: `1px solid rgba(${role.glow},.28)` }}>
        <div className="flex items-center gap-2.5 mb-1"><Radio size={18} style={{ color: role.accent }} /><h2 className="text-[15px] font-extrabold">{Lx(lang, "حضور المناديب اليومي", "Daily rider attendance")}</h2></div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "يحضّر المشرف مناديب فريقه كل يوم. الحضور هو أساس درجة الالتزام (40 من 100). الغياب بلا عذر واضح وطارئ يُقدَّم رسمياً يخفض الدرجة.", "The supervisor takes daily attendance. It drives the commitment score (40/100); unexcused absence lowers it.")}</p>
      </div>
      <XTabs tab={tab} setTab={setTab} tabs={[["roll", Lx(lang, "تحضير اليوم", "Roll call")], ["excuse", Lx(lang, "أعذار مقدّمة", "Excuses"), pending.length], ["month", Lx(lang, "التزام الشهر", "Month")]]} />
      {tab === "roll" && <>
        <div className="grid grid-cols-3 gap-3">{[[Lx(lang, "حضروا", "Present"), nPresent, "#0B5C46", "rgba(63,216,180,.16)"], [Lx(lang, "غائبون", "Absent"), nAbsent, "#C0443A", "rgba(232,131,122,.15)"], [Lx(lang, "لم يُحضَّروا", "Not marked"), nPend, "#B07A00", "rgba(228,184,92,.16)"]].map(([k, n, c, bg]) => <div key={k} className="rounded-2xl p-3 text-center" style={{ background: bg }}><p className="num text-[26px] font-extrabold" style={{ color: c }}>{n}</p><p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{k}</p></div>)}</div>
        <Panel title={Lx(lang, `مناديب فريقك (${act.length})`, `Your riders (${act.length})`)} extra={<div className="flex gap-2 items-center"><XIn type="date" value={date} onChange={(v) => v && v <= today && v >= addDays(today, -7) && setDate(v)} cls="w-36" />{canMark && nPend > 0 && <Btn variant="accent" accent={role.glow} onClick={presentAll}>{Lx(lang, "الباقون حاضرون", "Rest present")}</Btn>}</div>}>
          {act.length === 0 ? EMPTYT(lang) : <div className="space-y-2">{act.map((r) => { const rc = dayRoll[r.id]; const ck = clockOf(r); const lv = onLeave(r); const d = dr[r.id] || {}; return (
            <div key={r.id} className="rounded-2xl p-3" style={rc && rc.st === "absent" && !rc.excused ? bad : BOXS}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex-1 min-w-[120px]"><span className="text-[13.5px] font-extrabold">{r.ar}</span>{ck && <span className="num text-[10.5px] mx-2" style={{ color: "var(--muted)" }}>{Lx(lang, "بصم", "clock")} {ck.in}</span>}</span>
                {lv && !rc && <Chip tone="info" sm>{Lx(lang, "إجازة معتمدة", "On approved leave")}</Chip>}
                {rc ? <Chip tone={rc.st === "present" ? "ok" : rc.excused ? "warn" : "bad"} sm>{rc.st === "present" ? Lx(lang, "حاضر", "Present") : rc.excused ? Lx(lang, "غائب بعذر", "Excused") : Lx(lang, "غائب بلا عذر", "Unexcused")}</Chip> : null}
                {canMark && !rc && (lv ? <Btn onClick={() => leaveAbs(r)}>{Lx(lang, "تسجيل: إجازة", "Mark leave")}</Btn> : <><Btn variant="accent" accent={role.glow} onClick={() => present(r)}>{Lx(lang, "حاضر", "Present")}</Btn><Btn variant="danger" onClick={() => setDr({ ...dr, [r.id]: { open: !d.open } })}>{Lx(lang, "غائب", "Absent")}</Btn></>)}
                {canMark && rc && <button onClick={() => undo(r)} className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>{Lx(lang, "تراجع", "Undo")}</button>}
              </div>
              {rc && rc.st === "absent" && <p className="text-[11.5px] mt-1.5">{rc.contact === "noanswer" ? "📵 " : rc.contact === "leave" ? "🏖 " : "📞 "}{rc.reason}{rc.excuse ? ` · ${Lx(lang, "العذر الرسمي", "Formal excuse")}: ${rc.excuse.status === "accepted" ? Lx(lang, "مقبول", "accepted") : rc.excuse.status === "rejected" ? Lx(lang, "مرفوض", "rejected") : Lx(lang, "قيد المراجعة", "pending")}` : ""}</p>}
              {canMark && !rc && d.open && <div className="mt-3 space-y-2 rounded-xl p-3" style={{ background: "#fff", border: "1px solid var(--line)" }}>
                <p className="text-[12px] font-bold">{Lx(lang, "تواصل مع المندوب أولاً ثم سجّل النتيجة:", "Contact the rider first, then record:")}</p>
                <div className="flex gap-2 flex-wrap">{[["reached", Lx(lang, "📞 تواصلت معه", "Reached him")], ["noanswer", Lx(lang, "📵 لم يجب على الاتصال", "No answer")]].map(([k, l]) => <button key={k} onClick={() => setDr({ ...dr, [r.id]: { ...d, contact: k } })} className="px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: d.contact === k ? "#12151D" : "rgba(20,27,45,.06)", color: d.contact === k ? "#fff" : "inherit" }}>{l}</button>)}</div>
                {d.contact && <XIn value={d.reason || ""} onChange={(v) => setDr({ ...dr, [r.id]: { ...d, reason: v } })} ph={d.contact === "reached" ? Lx(lang, "سبب الغياب كما ذكره (إلزامي)", "Reason he gave (required)") : Lx(lang, "ملاحظة (اختياري)", "Note (optional)")} cls="w-full" />}
                {d.contact === "reached" && <label className="flex items-start gap-2 text-[11.5px] cursor-pointer"><input type="checkbox" checked={!!d.excused} onChange={(e) => setDr({ ...dr, [r.id]: { ...d, excused: e.target.checked } })} className="mt-0.5" />{Lx(lang, "السبب واضح وطارئ ومقبول (وإلا يُسجَّل بلا عذر وينبَّه المندوب)", "Reason is clear, urgent and accepted")}</label>}
                {err[r.id] && <p className="text-[11.5px]" style={{ color: "#C0443A" }}>{err[r.id]}</p>}
                <Btn variant="danger" onClick={() => absent(r)}>{Lx(lang, "تسجيل الغياب وإخطار المندوب", "Record absence & notify rider")}</Btn></div>}
            </div>); })}</div>}
          <p className="text-[10.5px] mt-3" style={{ color: "var(--muted)" }}>{Lx(lang, "عند تسجيل الغياب بلا عذر يصل المندوب إخطار رسمي بصوت تنبيه، ويمكنه تقديم عذره رسمياً خلال 48 ساعة من صفحة «أدائي ونقاطي».", "An unexcused absence sends the rider an official notice; he can submit a formal excuse within 48 hours.")}</p>
        </Panel></>}
      {tab === "excuse" && <Panel title={Lx(lang, "أعذار مقدّمة بانتظار قرارك", "Excuses awaiting your decision")}>
        {pending.length === 0 ? EMPTYT(lang) : <div className="space-y-2">{pending.map(({ d, r, rc }) => (
          <div key={d + r.id} className="rounded-2xl p-3" style={BOXS}>
            <p className="text-[13px] font-extrabold">{r.ar} · <span className="num">{d}</span></p>
            <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, "سجّل المشرف: ", "Logged: ")}{rc.reason}</p>
            <p className="text-[12.5px] mt-1">{Lx(lang, "عذر المندوب: ", "Rider's excuse: ")}{rc.excuse.text}</p>
            {canMark && <div className="flex gap-2 mt-2 flex-wrap"><Btn variant="accent" accent={role.glow} onClick={() => decideExcuse(d, r, true)}>{Lx(lang, "قبول العذر", "Accept")}</Btn><XIn value={rej[r.id] || ""} onChange={(v) => setRej({ ...rej, [r.id]: v })} ph={Lx(lang, "سبب الرفض", "Reject reason")} cls="flex-1 min-w-[120px]" /><Btn variant="danger" onClick={() => decideExcuse(d, r, false)}>{Lx(lang, "رفض", "Reject")}</Btn></div>}
          </div>))}</div>}
      </Panel>}
      {tab === "month" && <Panel title={Lx(lang, "التزام الحضور هذا الشهر", "Attendance commitment this month")}>
        {mrows.length === 0 ? EMPTYT(lang) : <div className="space-y-1.5">
          <div className="grid grid-cols-5 gap-1 text-[10.5px] px-3" style={{ color: "var(--muted)" }}><span className="col-span-2">{Lx(lang, "المندوب", "Rider")}</span><span className="text-center">{Lx(lang, "حضر", "Pres.")}</span><span className="text-center">{Lx(lang, "بلا عذر", "Unexc.")}</span><span className="text-center">{Lx(lang, "درجة الحضور", "Score")}</span></div>
          {mrows.map((m) => <div key={m.r.id} className="grid grid-cols-5 gap-1 items-center rounded-xl px-3 py-2 text-[12.5px]" style={BOXS}><span className="col-span-2 font-bold">{m.r.ar}</span><span className="num text-center">{m.pr}</span><span className="num text-center" style={{ color: m.un ? "#C0443A" : "inherit", fontWeight: m.un ? 800 : 400 }}>{m.un}</span><span className="num text-center font-extrabold">{m.pts} / 40</span></div>)}</div>}
      </Panel>}
    </div>
  );
}

/* ─── المندوب: حضوري وتقديم العذر الرسمي ─── */
function MyAttendanceCard({ lang, activeRep, ext, setExt }) {
  const E = extOf(ext); const month = riyadhToday().slice(0, 7); const today = riyadhToday();
  const [txt, setTxt] = useState({}); const [err, setErr] = useState("");
  if (!activeRep) return null;
  const mine = Object.keys(E.roll || {}).filter((d) => d.startsWith(month)).sort().reverse().map((d) => ({ d, rc: E.roll[d][activeRep.id] })).filter((x) => x.rc);
  if (!mine.length) return null;
  const pr = mine.filter((x) => x.rc.st === "present").length, un = mine.filter((x) => x.rc.st === "absent" && !x.rc.excused).length, ex = mine.filter((x) => x.rc.st === "absent" && x.rc.excused).length;
  const send = (d) => { const t = (txt[d] || "").trim(); if (t.length < 10) return setErr(Lx(lang, "اشرح عذرك بوضوح (10 أحرف على الأقل).", "Explain clearly (10+ chars).")); setErr(""); extUpd(setExt, "roll", (m) => ({ ...m, [d]: { ...m[d], [activeRep.id]: { ...m[d][activeRep.id], excuse: { text: t, at: riyadhNow().toISOString(), status: "pending" } } } })); };
  return (
    <Panel title={Lx(lang, "حضوري هذا الشهر", "My attendance this month")}>
      <div className="grid grid-cols-3 gap-2 mb-3">{[[Lx(lang, "حضرت", "Present"), pr, "#0B5C46"], [Lx(lang, "غياب بعذر", "Excused"), ex, "#B07A00"], [Lx(lang, "غياب بلا عذر", "Unexcused"), un, "#C0443A"]].map(([k, n, c]) => <div key={k} className="rounded-xl p-2 text-center" style={{ background: "rgba(20,27,45,.04)" }}><p className="num text-[20px] font-extrabold" style={{ color: c }}>{n}</p><p className="text-[10.5px]" style={{ color: "var(--muted)" }}>{k}</p></div>)}</div>
      <div className="space-y-2">{mine.filter((x) => x.rc.st === "absent").map(({ d, rc }) => { const canSend = !rc.excused && !rc.excuse && (new Date(today) - new Date(d)) / 86400000 <= 2; return (
        <div key={d} className="rounded-xl p-3" style={{ background: rc.excused ? "rgba(228,184,92,.12)" : "rgba(232,131,122,.12)", border: "1px solid var(--line)" }}>
          <p className="text-[12.5px] font-bold"><span className="num">{d}</span> — {rc.excused ? Lx(lang, "غياب بعذر مقبول", "Excused") : Lx(lang, "غياب بلا عذر", "Unexcused")}</p>
          <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{rc.reason}</p>
          {rc.excuse && <p className="text-[11.5px] mt-1">{Lx(lang, "عذرك المقدَّم: ", "Your excuse: ")}{rc.excuse.text} — <b>{rc.excuse.status === "accepted" ? Lx(lang, "مقبول", "accepted") : rc.excuse.status === "rejected" ? Lx(lang, "مرفوض", "rejected") : Lx(lang, "قيد المراجعة", "under review")}</b></p>}
          {canSend && <div className="mt-2 space-y-2"><XIn value={txt[d] || ""} onChange={(v) => setTxt({ ...txt, [d]: v })} ph={Lx(lang, "عذرك الرسمي: سبب واضح وطارئ", "Your formal excuse: a clear, urgent reason")} cls="w-full" />{err && <p className="text-[11.5px]" style={{ color: "#C0443A" }}>{err}</p>}<Btn variant="accent" accent="228,184,92" onClick={() => send(d)}>{Lx(lang, "تقديم العذر رسمياً", "Submit formally")}</Btn></div>}
        </div>); })}</div>
      <p className="text-[10.5px] mt-3" style={{ color: "var(--muted)" }}>{Lx(lang, "لا غياب بدون سبب واضح وطارئ يُقدَّم بشكل رسمي خلال 48 ساعة، وإلا يخفض درجة الحضور.", "Every absence needs a clear, urgent reason submitted formally within 48 hours, or it lowers your attendance score.")}</p>
    </Panel>
  );
}

/* ─── تقارير المناديب (مع إجمالي الطلبات) ─── */
function ReportsPage({ lang, role, reps, reports, query, setQuery, employees }) {
  const t = T[lang], x = EX[lang];
  const [open, setOpen] = useState(null);
  const q = (query || "").trim().toLowerCase();
  const supName = (sid) => supervisorsOf(employees).find((s) => s.id === sid)?.[lang] || "—";
  const filtered = !q ? reports : reports.filter((rp) => rp.entries.some((e) => { const rep = reps.find((r) => r.id === e.id); return rep && (rep.ar.toLowerCase().includes(q) || (rep.en || "").toLowerCase().includes(q) || (rep.phone || "").includes(q) || (rep.nid || "").includes(q)); }));
  const totOf = (rp) => rp.entries.reduce((s, e) => s + (e.orders || 0), 0);
  const grand = filtered.reduce((s, rp) => s + totOf(rp), 0);
  const TotalBar = ({ label, n, strong }) => <div className="flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ background: strong ? "#12151D" : "rgba(63,216,180,.14)", color: strong ? "#fff" : "inherit", border: strong ? "none" : "1px solid rgba(63,216,180,.4)" }}><span className="text-[12.5px] font-extrabold">{label}</span><span className="num text-[16px] font-extrabold">{fmt(n)}</span></div>;
  return (
    <div className="space-y-4">
      <Panel title={x.repReportsT}
        extra={<div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(20,27,45,.045)", border: "1px solid var(--line)" }}><Search size={14} style={{ color: "var(--muted)" }} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={x.searchRep} className="bg-transparent outline-none border-0 text-[12px] w-40" style={{ color: "#12151D" }} /></span>
          <Btn icon={Download} onClick={() => {
            const rows = [];
            filtered.forEach((rp) => { rp.entries.forEach((e) => { const rep = reps.find((r) => r.id === e.id) || { ar: e.id, en: e.id, empType: "—" }; rows.push({ [t.h.employee]: lang === "en" ? rep.en : rep.ar, [x.empTypeCol]: EMP_TYPES[rep.empType]?.[lang] || rep.empType, Date: rp.date, [x.ordersCol]: e.orders, [x.hoursCol]: e.hours, [x.weekendViolCol]: e.weekendViolations || 0, [x.appViolCol]: e.appViolations || 0 }); }); });
            rows.push({ [t.h.employee]: Lx(lang, "إجمالي الطلبات", "Total orders"), [x.ordersCol]: grand });
            exportToExcel(rows, `rep-reports-${riyadhToday()}`, "Reports");
          }}>{t.export}</Btn></div>}>
        <div className="sm:hidden flex items-center gap-2 rounded-xl px-3 py-2 mb-3.5" style={{ background: "rgba(20,27,45,.045)", border: "1px solid var(--line)" }}><Search size={14} style={{ color: "var(--muted)" }} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={x.searchRep} className="bg-transparent outline-none border-0 text-[12px] flex-1" style={{ color: "#12151D" }} /></div>
        {filtered.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{q ? x.globalNoMatch : x.noReports}</p> : (
          <div className="space-y-2.5">
            {filtered.map((rp) => {
              const isOpen = open === rp.id;
              return (
                <div key={rp.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(20,27,45,.035)", border: "1px solid var(--line)" }}>
                  <button onClick={() => setOpen(isOpen ? null : rp.id)} className="w-full flex items-center justify-between gap-3 p-3.5 text-start">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid place-items-center w-9 h-9 rounded-xl shrink-0" style={{ background: `rgba(${role.glow},.13)` }}><ClipboardList size={16} style={{ color: role.accent }} /></span>
                      <span className="min-w-0"><span className="block text-[13px] font-bold">{rp.id} · <span className="num">{rp.date}</span></span><span className="block text-[11px]" style={{ color: "var(--muted)" }}>{x.teamOf} {supName(rp.sup)} · {x.repsCount}: {rp.entries.length}</span></span>
                    </div>
                    <span className="flex items-center gap-2 shrink-0"><Chip tone="ok" sm>{Lx(lang, "الطلبات", "Orders")} {fmt(totOf(rp))}</Chip><ChevronRight size={16} style={{ color: "var(--muted)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .3s" }} /></span>
                  </button>
                  {isOpen && (() => {
                    const withType = rp.entries.map((e) => ({ e, rep: reps.find((r) => r.id === e.id) || { ...e, ar: e.id, en: e.id, empType: "kafala" } }));
                    const kafala = withType.filter((w) => w.rep.empType !== "ajeer"), ajeer = withType.filter((w) => w.rep.empType === "ajeer");
                    const toRows = (list) => list.map(({ e, rep }) => ({ key: e.id, cells: [{ v: lang === "en" ? rep.en : rep.ar, strong: 1 }, { v: e.orders, mono: 1 }, { v: e.hours, mono: 1 }, { v: e.weekendViolations || 0, mono: 1, dim: 1 }, { v: e.appViolations || 0, mono: 1, dim: 1 }] }));
                    const heads = [t.h.employee, x.ordersCol, x.hoursCol, x.weekendViolCol, x.appViolCol];
                    const sumO = (l) => l.reduce((s, w) => s + (w.e.orders || 0), 0);
                    return (
                      <div className="px-3.5 pb-3.5 space-y-3">
                        <div><p className="text-[10.5px] font-bold mb-1.5" style={{ color: "var(--muted)" }}>{EMP_TYPES.kafala[lang]}</p>{kafala.length === 0 ? <EmptyHint lang={lang} /> : <><DataTable headers={heads} rows={toRows(kafala)} /><div className="mt-2"><TotalBar label={Lx(lang, "إجمالي طلبات الكفالة", "Sponsored total")} n={sumO(kafala)} /></div></>}</div>
                        {ajeer.length > 0 && <div><p className="text-[10.5px] font-bold mb-1.5 pt-2" style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}>{EMP_TYPES.ajeer[lang]}</p><DataTable headers={heads} rows={toRows(ajeer)} /><div className="mt-2"><TotalBar label={Lx(lang, "إجمالي طلبات الأجير", "Contracted total")} n={sumO(ajeer)} /></div></div>}
                        <TotalBar strong label={Lx(lang, "إجمالي الطلبات في التقرير", "Report total orders")} n={totOf(rp)} />
                      </div>
                    );
                  })()}
                </div>
              );
            })}
            <TotalBar strong label={Lx(lang, `إجمالي الطلبات (${filtered.length} تقرير)`, `Total orders (${filtered.length} reports)`)} n={grand} />
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ═══ اعتماد المدير العام لتسعيرة المندوب ═══ */
const priceSummary = (p, lang) => {
  if (!p) return Lx(lang, "افتراضي / غير محدد", "Default / unset");
  if (p.mode === "target") return Lx(lang, `هدف شهري ${p.ordersTarget} طلب · راتب ثابت ${p.ordersBase || 0} · زائد +${p.perOrderDelta || 0}/طلب${hasBelow(p) ? ` · دون الهدف ${p.belowRate}/طلب فقط` : ""}`, `Target ${p.ordersTarget} orders · salary ${p.ordersBase || 0} · above +${p.perOrderDelta || 0}${hasBelow(p) ? ` · below target ${p.belowRate}/order only` : ""}`);
  const tiers = tiersN(p);
  if (p.mode === "tiers" || tiers.length > 1) return Lx(lang, (p.tierCalc === "all" ? "كل الطلبات بسعر الشريحة — " : "") + (p.scope === "total" ? "شرائح (على إجمالي التطبيق): " : "شرائح (لكل مندوب): "), p.scope === "total" ? "Tiers (app total): " : "Tiers (per rider): ") + tiers.map((x) => `${x.from}${x.to === Infinity ? "+" : "–" + x.to} → ${x.rate}`).join("، ") + (+p.fixedMonthly ? ` · ${Lx(lang, "ثابت", "fixed")} ${p.fixedMonthly}` : "");
  return Lx(lang, `${p.perOrder} لكل طلب`, `${p.perOrder} per order`) + (+p.fixedMonthly ? ` · ${Lx(lang, "ثابت", "fixed")} ${p.fixedMonthly}` : "");
};
function PriceReqPanel({ lang, role, pricing, setPricing, ext, setExt, setAuditLog, actingEmployee }) {
  const E = extOf(ext); const [why, setWhy] = useState({});
  const list = E.priceReq.filter((r) => r.status === "pending"); const hist = E.priceReq.filter((r) => r.status !== "pending").slice(0, 5);
  const nm = (ids) => ids.length === APPS.length ? Lx(lang, "كل التطبيقات", "All apps") : ids.map((i) => (APPS.find((a) => a.id === i) || {})[lang] || i).join("، ");
  const decide = (r, ok) => {
    if (!ok && (why[r.id] || "").trim().length < 4) return;
    if (ok) setPricing((prev) => { const cur = prev || { app: {}, rep: {} }; const kd = r.kind || "rep"; const map = { ...(cur[kd] || {}) }; r.appIds.forEach((id) => { if (r.price) map[id] = r.price; else delete map[id]; }); return { ...cur, [kd]: map }; });
    extUpd(setExt, "priceReq", (a) => a.map((z) => (z.id === r.id ? { ...z, status: ok ? "approved" : "rejected", decidedBy: byName(role, actingEmployee), decidedAt: riyadhNow().toISOString(), why: ok ? "" : why[r.id].trim() } : z)));
    logAudit(setAuditLog, role, ok ? "price_approved" : "price_rejected", nm(r.appIds), actingEmployee);
  };
  if (!list.length && !hist.length) return null;
  return (
    <Panel title={Lx(lang, "طلبات اعتماد التسعيرات (تنتظر المدير العام)", "Pricing approval requests (GM)")}>
      {list.length === 0 ? <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "لا طلبات معلّقة.", "No pending requests.")}</p> : <div className="space-y-3">{list.map((r) => (
        <div key={r.id} className="rounded-2xl p-3" style={{ background: "rgba(228,184,92,.10)", border: "1px solid rgba(228,184,92,.4)" }}>
          <p className="text-[13px] font-extrabold"><Chip tone={(r.kind || "rep") === "app" ? "ok" : "warn"} sm>{(r.kind || "rep") === "app" ? Lx(lang, "تسعيرة الشركة (من التطبيق)", "Company price (from app)") : Lx(lang, "تسعيرة المندوب", "Rider price")}</Chip> {nm(r.appIds)} <span className="text-[11px] font-normal" style={{ color: "var(--muted)" }}>— {r.by} · {r.at.slice(0, 10)}</span></p>
          <p className="text-[12px] mt-1">{Lx(lang, "الحالية: ", "Current: ")}{priceSummary(r.old, lang)}</p>
          <p className="text-[12px] font-bold">{Lx(lang, "المطلوبة: ", "Requested: ")}{r.price ? priceSummary(r.price, lang) : Lx(lang, "حذف التسعيرة", "Remove pricing")}</p>
          {role.id === "gm" ? <div className="flex gap-2 mt-2 flex-wrap"><Btn variant="accent" accent={role.glow} onClick={() => decide(r, true)}>{Lx(lang, "اعتماد", "Approve")}</Btn><XIn value={why[r.id] || ""} onChange={(v) => setWhy({ ...why, [r.id]: v })} ph={Lx(lang, "سبب الرفض", "Reject reason")} cls="flex-1 min-w-[120px]" /><Btn variant="danger" onClick={() => decide(r, false)}>{Lx(lang, "رفض", "Reject")}</Btn></div>
            : <p className="text-[11.5px] mt-1.5" style={{ color: "#B8862E" }}>{Lx(lang, "بانتظار اعتماد المدير العام", "Awaiting GM approval")}{role.id === "fin" && <button onClick={() => extUpd(setExt, "priceReq", (a) => a.filter((z) => z.id !== r.id))} className="mx-3 font-bold" style={{ color: "#C0443A" }}>{Lx(lang, "سحب الطلب", "Withdraw")}</button>}</p>}
        </div>))}</div>}
      {hist.length > 0 && <div className="mt-3 space-y-1">{hist.map((r) => <p key={r.id} className="text-[11.5px]" style={{ color: "var(--muted)" }}>{r.status === "approved" ? "✔" : "✖"} {nm(r.appIds)} — {r.decidedBy} {r.decidedAt.slice(0, 10)}{r.why ? ` (${r.why})` : ""}</p>)}</div>}
    </Panel>
  );
}

Object.assign(T.ar.nav, { coach: "مدربي", myScore: "أدائي ونقاطي", myWallet: "محفظتي", reportInc: "بلّغ", myLeave: "إجازاتي", academy: "الأكاديمية", perfBoard: "الأداء والمكافآت", walletAdmin: "السلف والادخار", incidents: "البلاغات", leavesAdmin: "الإجازات", trainingAdmin: "التدريب", settleFlow: "مسار التسوية", dayOps: "يوم المشرف", pipeline: "مسار التوظيف", crm: "العملاء", snapshots: "النسخ الاحتياطي", copilot: "المستشار الذكي", inbox: "مهامي", retention: "رادار الاستبقاء", support: "دعم فوري", myRefer: "رشّح مندوباً", referrals: "ترشيحات المناديب", teams: "منافسة الفرق", appAvail: "التطبيقات والمدن" });
Object.assign(T.en.nav, { coach: "My Coach", myScore: "Score & Points", myWallet: "My Wallet", reportInc: "Report", myLeave: "My Leaves", academy: "Academy", perfBoard: "Performance & Rewards", walletAdmin: "Advances & Savings", incidents: "Incidents", leavesAdmin: "Leaves", trainingAdmin: "Training", settleFlow: "Settlement Flow", dayOps: "Supervisor Day", pipeline: "Hiring Pipeline", crm: "Clients", snapshots: "Backups", copilot: "Smart Advisor", inbox: "My Tasks", retention: "Retention Radar", support: "Instant Support", myRefer: "Refer a Rider", referrals: "Referrals", teams: "Team Contest", appAvail: "Apps & Cities" });
Object.assign(T.ur.nav, { coach: "My Coach", myScore: "Score & Points", myWallet: "My Wallet", reportInc: "Report", myLeave: "My Leaves", academy: "Academy", perfBoard: "Performance & Rewards", walletAdmin: "Advances & Savings", incidents: "Incidents", leavesAdmin: "Leaves", trainingAdmin: "Training", settleFlow: "Settlement Flow", dayOps: "Supervisor Day", pipeline: "Hiring Pipeline", crm: "Clients", snapshots: "Backups", copilot: "Smart Advisor", inbox: "My Tasks", retention: "Retention Radar", support: "Instant Support", myRefer: "Refer a Rider", referrals: "Referrals", teams: "Team Contest", appAvail: "Apps & Cities" });
/* ═══════════════════════════════════════════════════════════════
   اليومية: عهدة المناديب اليومية (خدّ كم وسلّم كم)
   — المحاسب يدخل المبالغ فقط، والطلبات تأتي تلقائياً من إدخال المشرف
   — كل شيء يتجمع تلقائياً في كشف نهاية الشهر
   ═══════════════════════════════════════════════════════════════ */
const DL_LIVE = (d) => d.status !== "pending" && d.status !== "rejected";
const dlAdv = (d) => (+d.fuel || 0) + (+d.ordAdv || 0) + (+d.otherAdv || 0);
const dlId = (date, repId) => `DL-${date}-${repId}`;
function dailyTotals(daily, repId, month, upTo) {
  const src = daily === undefined ? DAILY_CTX : daily || [];
  const list = src.filter((d) => d.repId === repId && (d.date || "").startsWith(month) && (!upTo || d.date <= upTo) && DL_LIVE(d));
  const s = { adv: 0, settled: 0, collected: 0, handed: 0, days: list.length };
  list.forEach((d) => { s.adv += dlAdv(d); s.settled += +d.settled || 0; s.collected += +d.collected || 0; s.handed += +d.handed || 0; });
  return { adv: r2(s.adv), settled: r2(s.settled), collected: r2(s.collected), handed: r2(s.handed), advBal: r2(s.adv - s.settled), gap: r2(s.collected - s.handed), days: s.days };
}
const DL_WD = { ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"], en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };
const dlSar = (lang) => Lx(lang, "ر.س", "SAR");
const dlColor = (v, goodNeg) => (v > 0 ? "#C0443A" : v < 0 ? "#0B5C46" : null);
const dlN = (v, col) => <span className="num font-bold" style={col ? { color: col } : null}>{fmt(r2(v))}</span>;

function dailyStatementRows(repId, month, reports, daily, showAll) {
  const nd = monthDays(month), ordBy = {};
  reports.forEach((rp) => { if (!(rp.date || "").startsWith(month)) return; rp.entries.forEach((e) => { if (e.id === repId) ordBy[rp.date] = (ordBy[rp.date] || 0) + (e.orders || 0); }); });
  let advBal = 0, gap = 0; const rows = [], T0 = { orders: 0, adv: 0, settled: 0, collected: 0, handed: 0 };
  for (let d = 1; d <= nd; d++) {
    const date = `${month}-${String(d).padStart(2, "0")}`;
    const ents = (daily || []).filter((z) => z.repId === repId && z.date === date);
    const live = ents.filter(DL_LIVE);
    const orders = ordBy[date] || 0;
    const adv = live.reduce((s, z) => s + dlAdv(z), 0), settled = live.reduce((s, z) => s + (+z.settled || 0), 0);
    const collected = live.reduce((s, z) => s + (+z.collected || 0), 0), handed = live.reduce((s, z) => s + (+z.handed || 0), 0);
    advBal += adv - settled; gap += collected - handed;
    T0.orders += orders; T0.adv += adv; T0.settled += settled; T0.collected += collected; T0.handed += handed;
    if (showAll || orders || ents.length) rows.push({ date, wd: new Date(date + "T00:00:00Z").getUTCDay(), orders, adv, settled, collected, handed, advBal: r2(advBal), gap: r2(gap), note: ents.map((z) => z.note).filter(Boolean).join(" · "), pending: ents.some((z) => z.status === "pending"), rejected: ents.some((z) => z.status === "rejected"), fuel: live.reduce((s, z) => s + (+z.fuel || 0), 0) });
  }
  return { rows, tot: { ...T0, advBal: r2(advBal), gap: r2(gap) } };
}

function RiderDayStatement({ lang, repId, month, reports, daily, showAll }) {
  const { rows, tot } = dailyStatementRows(repId, month, reports, daily, showAll);
  const sar = dlSar(lang);
  const th = "text-start text-[10.5px] font-bold px-2 py-2 whitespace-nowrap", td = "px-2 py-2 text-[12px] whitespace-nowrap";
  if (!rows.length) return EMPTYT(lang);
  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full" style={{ minWidth: 820, borderCollapse: "collapse" }}>
        <thead><tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
          {[Lx(lang, "التاريخ", "Date"), Lx(lang, "طلبات اليوم", "Orders"), Lx(lang, "خدّ سلفة", "Took (advance)"), Lx(lang, "سلّم من السلفة", "Returned of it"), Lx(lang, "رصيد السلفة عليه", "Advance balance"),
            Lx(lang, "كاش استلمه", "Cash collected"), Lx(lang, "كاش سلّمه", "Cash handed in"), Lx(lang, "عجز / فائض تراكمي", "Cash gap (cum.)"), Lx(lang, "ملاحظة", "Note")].map((h) => <th key={h} className={th}>{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.date} style={{ borderBottom: "1px solid var(--line)", background: r.pending ? "rgba(228,184,92,.08)" : r.rejected ? "rgba(232,131,122,.07)" : null }}>
            <td className={td}><span className="num font-bold">{r.date.slice(8)}</span> <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>{(DL_WD[lang === "en" ? "en" : "ar"])[r.wd]}</span>
              {r.pending && <span className="ms-1"><Chip tone="warn" sm>{Lx(lang, "بانتظار اعتماد المدير العام", "Awaiting GM")}</Chip></span>}{r.rejected && <span className="ms-1"><Chip tone="bad" sm>{Lx(lang, "مرفوضة", "Rejected")}</Chip></span>}</td>
            <td className={td}>{dlN(r.orders)}</td><td className={td}>{dlN(r.adv)}</td><td className={td}>{dlN(r.settled)}</td>
            <td className={td}>{dlN(r.advBal, r.advBal > 0 ? "#8A611E" : null)}</td><td className={td}>{dlN(r.collected)}</td><td className={td}>{dlN(r.handed)}</td>
            <td className={td}>{dlN(r.gap, dlColor(r.gap))}</td><td className={td + " text-[11px]"} style={{ color: "var(--muted)", whiteSpace: "normal" }}>{r.note}</td>
          </tr>))}
          <tr style={{ background: "rgba(20,27,45,.05)" }}>
            <td className={td}><b>{Lx(lang, "الإجمالي", "Total")}</b></td><td className={td}>{dlN(tot.orders)}</td><td className={td}>{dlN(tot.adv)}</td><td className={td}>{dlN(tot.settled)}</td>
            <td className={td}>{dlN(tot.advBal, tot.advBal > 0 ? "#8A611E" : null)}</td><td className={td}>{dlN(tot.collected)}</td><td className={td}>{dlN(tot.handed)}</td><td className={td}>{dlN(tot.gap, dlColor(tot.gap))}</td><td className={td} />
          </tr>
        </tbody>
      </table>
      <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, `رصيد السلفة = ما خدّه − ما سلّمه منها. عجز الكاش = كاش استلمه من العملاء − كاش سلّمه للشركة (بالسالب = فائض له). كلها بـ ${sar} وتُخصم تلقائياً في كشف نهاية الشهر. الطلبات من إدخال المشرف.`, `Advance balance = took − returned of it. Cash gap = collected from customers − handed in (negative = surplus owed to him), in ${sar}. Deducted automatically in the month-end statement. Orders come from the supervisor.`)}</p>
    </div>
  );
}

function DailyLedgerPage({ lang, role, reps, reports, ext, setExt, pricing, repSettlements, weekendFine, violationPenalty, expenses, repReceipts, setAuditLog, actingEmployee }) {
  const E = extOf(ext), limit = +E.cfg.dualLimit, sar = dlSar(lang);
  const [tab, setTab] = useState("day");
  const [date, setDate] = useState(riyadhToday());
  const [month, setMonth] = useState(riyadhToday().slice(0, 7));
  const [drafts, setDrafts] = useState({});
  const [open, setOpen] = useState(null);
  const [why, setWhy] = useState({});
  const [err, setErr] = useState("");
  const isFin = role.id === "fin", isGm = role.id === "gm";
  const mo = date.slice(0, 7);
  const closedMonth = (m) => (repSettlements || []).some((s) => s.month === m && s.closed);
  const closed = closedMonth(mo);
  const nm = (r) => (lang === "en" ? r.en || r.ar : r.ar);
  const byRep = {}; E.daily.filter((d) => d.date === date).forEach((d) => { byRep[d.repId] = d; });
  const ordersOn = (repId, dt) => reports.filter((rp) => rp.date === dt).reduce((s, rp) => s + rp.entries.filter((e) => e.id === repId).reduce((a, e) => a + (e.orders || 0), 0), 0);
  const riders = reps.filter((r) => r.status === "active" || byRep[r.id] || ordersOn(r.id, date) > 0).sort((a, b) => nm(a).localeCompare(nm(b)));
  const KEYS = ["fuel", "ordAdv", "otherAdv", "collected", "handed", "settled"];
  const val = (r, k) => (drafts[r.id] && drafts[r.id][k] !== undefined ? drafts[r.id][k] : byRep[r.id] && byRep[r.id][k] ? String(byRep[r.id][k]) : "");
  const setD = (r, k, v) => setDrafts((d) => ({ ...d, [r.id]: { ...(d[r.id] || {}), [k]: v } }));
  const saveRow = (r) => {
    if (!isFin) return;
    if (closed) return setErr(Lx(lang, "هذا الشهر مُقفل — افتح التسوية أولاً لتعديل اليومية.", "This month is closed — reopen the settlement first."));
    setErr("");
    const g = (k) => r2(+val(r, k) || 0);
    const e = { fuel: g("fuel"), ordAdv: g("ordAdv"), otherAdv: g("otherAdv"), collected: g("collected"), handed: g("handed"), settled: g("settled"), note: String(drafts[r.id] && drafts[r.id].note !== undefined ? drafts[r.id].note : (byRep[r.id] && byRep[r.id].note) || "").trim() };
    const id = dlId(date, r.id);
    const empty = !(e.fuel || e.ordAdv || e.otherAdv || e.collected || e.handed || e.settled || e.note);
    if (empty) extUpd(setExt, "daily", (a) => a.filter((z) => z.id !== id));
    else {
      const needGm = dlAdv(e) > limit;
      const entry = { id, date, repId: r.id, name: r.ar, ...e, status: needGm ? "pending" : "approved", needGm, by: byName(role, actingEmployee), at: riyadhNow().toISOString() };
      extUpd(setExt, "daily", (a) => [entry, ...a.filter((z) => z.id !== id)]);
      logAudit(setAuditLog, role, "daily_ledger_save", `${r.ar} ${date}: adv ${dlAdv(e)} / collected ${e.collected} / handed ${e.handed}${needGm ? " (GM approval)" : ""}`, actingEmployee);
    }
    setDrafts((d) => { const n = { ...d }; delete n[r.id]; return n; });
  };
  const saveAll = () => Object.keys(drafts).forEach((id) => { const r = reps.find((z) => z.id === id); if (r) saveRow(r); });
  const decide = (d, ok) => {
    if (!isGm) return;
    if (!ok && (why[d.id] || "").trim().length < 4) return;
    extUpd(setExt, "daily", (a) => a.map((z) => (z.id === d.id ? { ...z, status: ok ? "approved" : "rejected", decidedBy: byName(role, actingEmployee), decidedAt: riyadhNow().toISOString(), why: ok ? "" : why[d.id].trim() } : z)));
    logAudit(setAuditLog, role, ok ? "daily_ledger_approved" : "daily_ledger_rejected", `${d.name} ${d.date}: ${dlAdv(d)}`, actingEmployee);
  };
  const live = useMemo(() => { try { return settleOf(month, reps, reports, pricing, repSettlements, weekendFine, violationPenalty, expenses, repReceipts); } catch (e) { return null; } }, [month, reps, reports, pricing, repSettlements, weekendFine, violationPenalty, expenses, repReceipts, E.daily]);
  const lineOf = {}; (live ? live.repLines : []).forEach((l) => { lineOf[l.repId] = l; });
  const mRows = reps.map((r) => ({ r, l: lineOf[r.id], d: dailyTotals(E.daily, r.id, month) })).filter((x) => x.l || x.d.days > 0)
    .map((x) => { const net = x.l ? (x.l.net || 0) : 0; return { ...x, net, orders: x.l ? x.l.orders : 0, pay: r2(net - x.d.advBal - x.d.gap) }; }).sort((a, b) => nm(a.r).localeCompare(nm(b.r)));
  const cap = +E.cfg.advMaxPct || ADV_CAP;
  const mTot = mRows.reduce((s, x) => ({ orders: s.orders + x.orders, net: s.net + x.net, adv: s.adv + x.d.adv, settled: s.settled + x.d.settled, advBal: s.advBal + x.d.advBal, collected: s.collected + x.d.collected, handed: s.handed + x.d.handed, gap: s.gap + x.d.gap, pay: s.pay + x.pay }), { orders: 0, net: 0, adv: 0, settled: 0, advBal: 0, collected: 0, handed: 0, gap: 0, pay: 0 });
  const exportMonth = () => exportToExcel(mRows.map((x) => ({
    [Lx(lang, "المندوب", "Rider")]: nm(x.r), [Lx(lang, "المعرف", "ID")]: x.r.riderId || "", [Lx(lang, "الطلبات", "Orders")]: x.orders, [Lx(lang, "أجره قبل اليومية", "Earnings before ledger")]: x.net,
    [Lx(lang, "خدّ سلف", "Advances")]: x.d.adv, [Lx(lang, "سلّم منها", "Returned")]: x.d.settled, [Lx(lang, "رصيد السلف", "Advance balance")]: x.d.advBal,
    [Lx(lang, "كاش استلمه", "Cash collected")]: x.d.collected, [Lx(lang, "كاش سلّمه", "Cash handed")]: x.d.handed, [Lx(lang, "عجز(+)/فائض(−) الكاش", "Cash gap")]: x.d.gap,
    [Lx(lang, "الصافي بعد اليومية", "Net after ledger")]: x.pay })), `daily-ledger-${month}`, month);
  const dayTot = riders.reduce((s, r) => { const d = byRep[r.id]; if (!d || !DL_LIVE(d)) return s; return { adv: s.adv + dlAdv(d), collected: s.collected + (+d.collected || 0), handed: s.handed + (+d.handed || 0), settled: s.settled + (+d.settled || 0) }; }, { adv: 0, collected: 0, handed: 0, settled: 0 });
  const dayOrders = riders.reduce((s, r) => s + ordersOn(r.id, date), 0);
  const pendingAll = E.daily.filter((d) => d.status === "pending");
  const th = "text-start text-[10.5px] font-bold px-2 py-2 whitespace-nowrap", td = "px-2 py-2 text-[12px] whitespace-nowrap";
  const Tile = ({ k, v, c }) => <div className="rounded-xl p-3" style={BOXS}><p className="text-[10.5px]" style={{ color: "var(--muted)" }}>{k}</p><p className="num text-[17px] font-extrabold" style={c ? { color: c } : null}>{fmt(r2(v))}</p></div>;
  const shiftDay = (n) => { const dt = new Date(date + "T00:00:00Z"); dt.setUTCDate(dt.getUTCDate() + n); setDate(dt.toISOString().slice(0, 10)); setDrafts({}); };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: `linear-gradient(100deg,rgba(${role.glow},.13),rgba(${role.glow},.03))`, border: `1px solid rgba(${role.glow},.28)` }}>
        <div className="flex items-center gap-2.5 mb-1"><ClipboardList size={18} style={{ color: role.accent }} /><h2 className="text-[15px] font-extrabold">{Lx(lang, "يومية المناديب", "Riders' daily ledger")}</h2></div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>{Lx(lang, "سجّل لكل مندوب كم خدّ (سلفة بنزين/طلبات) وكم سلّم (كاش وسلف). الطلبات تأتي تلقائياً من إدخال المشرف — لا تُدخل هنا. وفي نهاية الشهر يتجمع كل شيء ويُحسب تلقائياً في كشف التسوية.", "Record what each rider took (fuel/order advances) and returned (cash and advances). Orders come from the supervisor automatically. Everything rolls into the month-end settlement.")}</p>
      </div>
      <XTabs tab={tab} setTab={setTab} tabs={[["day", Lx(lang, "اليوم", "Day sheet")], ["month", Lx(lang, "كشف الشهر", "Month statement")], ["pending", Lx(lang, "بانتظار المدير العام", "Awaiting GM"), pendingAll.length]]} />
      {err && <p className="text-[12px] font-bold" style={{ color: "#C0443A" }}>{err}</p>}
      {tab === "day" && (<>
        <div className="flex items-center gap-2 flex-wrap">
          <Btn onClick={() => shiftDay(-1)}>{Lx(lang, "اليوم السابق", "Prev")}</Btn>
          <XIn type="date" value={date} onChange={(v) => { if (v) { setDate(v); setDrafts({}); } }} />
          <Btn onClick={() => shiftDay(1)}>{Lx(lang, "اليوم التالي", "Next")}</Btn>
          {closed && <Chip tone="warn">{Lx(lang, "الشهر مُقفل", "Month closed")}</Chip>}
          {!isFin && <Chip tone="n">{Lx(lang, "عرض فقط — الإدخال للمحاسب", "View only — accountant enters")}</Chip>}
          {isFin && Object.keys(drafts).length > 0 && <Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={saveAll}>{Lx(lang, `حفظ الكل (${Object.keys(drafts).length})`, `Save all (${Object.keys(drafts).length})`)}</Btn>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Tile k={Lx(lang, "طلبات اليوم (من المشرف)", "Orders (supervisor)")} v={dayOrders} /><Tile k={Lx(lang, "سلف اليوم", "Advances")} v={dayTot.adv} />
          <Tile k={Lx(lang, "كاش استلموه", "Cash collected")} v={dayTot.collected} /><Tile k={Lx(lang, "كاش سلّموه", "Cash handed in")} v={dayTot.handed} />
          <Tile k={Lx(lang, "فرق الكاش اليوم", "Cash gap today")} v={dayTot.collected - dayTot.handed} c={dlColor(dayTot.collected - dayTot.handed)} />
        </div>
        <Panel title={Lx(lang, `ورقة ${date}`, `Sheet ${date}`)}>
          {riders.length === 0 ? EMPTYT(lang) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full" style={{ minWidth: 1180, borderCollapse: "collapse" }}>
                <thead><tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                  {[Lx(lang, "المندوب", "Rider"), Lx(lang, "الطلبات", "Orders"), Lx(lang, "خدّ: بنزين", "Took: fuel"), Lx(lang, "خدّ: طلبات", "Took: orders"), Lx(lang, "خدّ: أخرى", "Took: other"),
                    Lx(lang, "كاش استلمه", "Cash collected"), Lx(lang, "سلّم كاش", "Cash handed"), Lx(lang, "سلّم من السلفة", "Returned of advance"), Lx(lang, "ملاحظة", "Note"), Lx(lang, "رصيد السلف", "Adv. balance"), Lx(lang, "فرق الكاش", "Cash gap"), ""].map((h, i) => <th key={i} className={th}>{h}</th>)}
                </tr></thead>
                <tbody>{riders.map((r) => {
                  const tot = dailyTotals(E.daily, r.id, mo, date);
                  const ent = byRep[r.id], dirty = !!drafts[r.id];
                  const ord = ordersOn(r.id, date);
                  const inp = (k, w = 84) => isFin && !closed ? <XIn type="number" value={val(r, k)} onChange={(v) => setD(r, k, v)} cls="!px-2 !py-1.5" ph="0" /> : <span className="num text-[12px]">{val(r, k) || "—"}</span>;
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--line)", background: dirty ? "rgba(228,184,92,.08)" : null }}>
                      <td className={td}><b>{nm(r)}</b> {r.riderId ? <span className="num text-[10.5px]" style={{ color: "var(--muted)" }}>{r.riderId}</span> : null}
                        {ent && ent.status === "pending" && <span className="ms-1"><Chip tone="warn" sm>{Lx(lang, "بانتظار المدير العام", "GM approval")}</Chip></span>}
                        {ent && ent.status === "rejected" && <span className="ms-1"><Chip tone="bad" sm>{Lx(lang, "مرفوضة", "Rejected")}</Chip></span>}</td>
                      <td className={td}>{ord > 0 ? <Chip tone="ok" sm>{ord}</Chip> : <span style={{ color: "var(--muted)" }}>0</span>}</td>
                      {["fuel", "ordAdv", "otherAdv", "collected", "handed", "settled"].map((k) => <td key={k} className={td} style={{ minWidth: 92 }}>{inp(k)}</td>)}
                      <td className={td} style={{ minWidth: 140 }}>{isFin && !closed ? <XIn value={drafts[r.id] && drafts[r.id].note !== undefined ? drafts[r.id].note : (ent && ent.note) || ""} onChange={(v) => setD(r, "note", v)} cls="!px-2 !py-1.5 w-full" ph={Lx(lang, "اختياري", "optional")} /> : <span className="text-[11px]">{(ent && ent.note) || ""}</span>}</td>
                      <td className={td}>{dlN(tot.advBal, tot.advBal > 0 ? "#8A611E" : null)}</td>
                      <td className={td}>{dlN(tot.gap, dlColor(tot.gap))}</td>
                      <td className={td}>{isFin && dirty && <Btn variant="accent" accent={role.glow} onClick={() => saveRow(r)}>{Lx(lang, "حفظ", "Save")}</Btn>}</td>
                    </tr>);
                })}</tbody>
              </table>
            </div>)}
          <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, `السلف التي يتجاوز مجموعها ${fmt(limit)} ${sar} في اليوم لمندوب واحد تحتاج اعتماد المدير العام قبل أن تدخل الحساب. عمودا الرصيد والفرق تراكميان من أول الشهر حتى هذا اليوم.`, `Advances over ${fmt(limit)} ${sar} per rider per day need GM approval before they count. Balance and gap are cumulative from month start to this day.`)}</p>
        </Panel>
      </>)}
      {tab === "month" && (<>
        <div className="flex items-center gap-2 flex-wrap"><XIn type="month" value={month} onChange={(v) => v && setMonth(v)} />
          {closedMonth(month) && <Chip tone="warn">{Lx(lang, "الشهر مُقفل", "Month closed")}</Chip>}
          <Btn icon={Download} onClick={exportMonth}>{Lx(lang, "تصدير Excel", "Export Excel")}</Btn></div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Tile k={Lx(lang, "طلبات الشهر", "Month orders")} v={mTot.orders} /><Tile k={Lx(lang, "سلف مصروفة", "Advances")} v={mTot.adv} /><Tile k={Lx(lang, "رصيد السلف غير المسوّى", "Unsettled advances")} v={mTot.advBal} c={mTot.advBal > 0 ? "#8A611E" : null} />
          <Tile k={Lx(lang, "عجز الكاش", "Cash gap")} v={mTot.gap} c={dlColor(mTot.gap)} /><Tile k={Lx(lang, "صافي المناديب بعد اليومية", "Riders' net after ledger")} v={mTot.pay} />
        </div>
        <Panel title={Lx(lang, "كشف الشهر لكل مندوب", "Month statement per rider")}>
          {mRows.length === 0 ? EMPTYT(lang) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full" style={{ minWidth: 1050, borderCollapse: "collapse" }}>
                <thead><tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                  {[Lx(lang, "المندوب", "Rider"), Lx(lang, "الطلبات", "Orders"), Lx(lang, "أجره قبل اليومية", "Earnings"), Lx(lang, "خدّ سلف", "Advances"), Lx(lang, "سلّم منها", "Returned"), Lx(lang, "رصيد السلف", "Balance"), Lx(lang, "كاش استلمه", "Cash in"), Lx(lang, "كاش سلّمه", "Cash handed"), Lx(lang, "عجز/فائض", "Gap"), Lx(lang, "الصافي بعد اليومية", "Net after ledger"), ""].map((h, i) => <th key={i} className={th}>{h}</th>)}
                </tr></thead>
                <tbody>{mRows.map((x) => { const over = x.net > 0 && x.d.advBal > x.net * cap / 100; return (
                  <React.Fragment key={x.r.id}>
                    <tr style={{ borderBottom: open === x.r.id ? "none" : "1px solid var(--line)" }}>
                      <td className={td}><b>{nm(x.r)}</b> {x.r.riderId ? <span className="num text-[10.5px]" style={{ color: "var(--muted)" }}>{x.r.riderId}</span> : null}
                        {over && <span className="ms-1"><Chip tone="warn" sm>{Lx(lang, `السلف فوق ${cap}% من أجره`, `Advances > ${cap}% of earnings`)}</Chip></span>}</td>
                      <td className={td}>{dlN(x.orders)}</td><td className={td}>{dlN(x.net)}</td><td className={td}>{dlN(x.d.adv)}</td><td className={td}>{dlN(x.d.settled)}</td>
                      <td className={td}>{dlN(x.d.advBal, x.d.advBal > 0 ? "#8A611E" : null)}</td><td className={td}>{dlN(x.d.collected)}</td><td className={td}>{dlN(x.d.handed)}</td>
                      <td className={td}>{dlN(x.d.gap, dlColor(x.d.gap))}</td><td className={td}>{dlN(x.pay, x.pay >= 0 ? "#0B5C46" : "#C0443A")}{x.pay < 0 && <span className="ms-1"><Chip tone="bad" sm>{Lx(lang, "عجز عليه", "Owes")}</Chip></span>}</td>
                      <td className={td}><button onClick={() => setOpen(open === x.r.id ? null : x.r.id)} className="text-[11.5px] font-bold underline" style={{ color: "#8A611E" }}>{open === x.r.id ? Lx(lang, "إخفاء", "Hide") : Lx(lang, "كشف يومي", "Daily")}</button></td>
                    </tr>
                    {open === x.r.id && <tr style={{ borderBottom: "1px solid var(--line)" }}><td colSpan={11} className="px-2 pb-3"><div className="rounded-xl p-3" style={{ background: "#fff", border: "1px solid var(--line)" }}><RiderDayStatement lang={lang} repId={x.r.id} month={month} reports={reports} daily={E.daily} /></div></td></tr>}
                  </React.Fragment>); })}
                  <tr style={{ background: "rgba(20,27,45,.05)" }}><td className={td}><b>{Lx(lang, "الإجمالي", "Total")}</b></td><td className={td}>{dlN(mTot.orders)}</td><td className={td}>{dlN(mTot.net)}</td><td className={td}>{dlN(mTot.adv)}</td><td className={td}>{dlN(mTot.settled)}</td><td className={td}>{dlN(mTot.advBal)}</td><td className={td}>{dlN(mTot.collected)}</td><td className={td}>{dlN(mTot.handed)}</td><td className={td}>{dlN(mTot.gap, dlColor(mTot.gap))}</td><td className={td}>{dlN(mTot.pay)}</td><td className={td} /></tr>
                </tbody>
              </table>
            </div>)}
          <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>{Lx(lang, "الصافي بعد اليومية = أجره بعد الغرامات والتسويات − رصيد السلف غير المسوّى − عجز الكاش (أو + فائضه). هذا نفس الرقم الذي يظهر في كشف التسوية.", "Net after ledger = earnings after fines/adjustments − unsettled advances − cash gap (or + surplus). Same figure as in the settlement.")}</p>
        </Panel>
      </>)}
      {tab === "pending" && (
        <Panel title={Lx(lang, "سلف تحتاج اعتماد المدير العام", "Advances needing GM approval")}>
          {pendingAll.length === 0 ? EMPTYT(lang) : <div className="space-y-3">{pendingAll.map((d) => (
            <div key={d.id} className="rounded-2xl p-3" style={BOXS}>
              <div className="flex items-center justify-between"><p className="text-[13.5px] font-extrabold">{d.name} · {d.date}</p><p className="num text-[18px] font-extrabold">{fmt(dlAdv(d))} {sar}</p></div>
              <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>{Lx(lang, `بنزين ${fmt(d.fuel || 0)} · طلبات ${fmt(d.ordAdv || 0)} · أخرى ${fmt(d.otherAdv || 0)}`, `Fuel ${fmt(d.fuel || 0)} · Orders ${fmt(d.ordAdv || 0)} · Other ${fmt(d.otherAdv || 0)}`)}{d.note ? ` · ${d.note}` : ""} · {Lx(lang, "أدخلها", "entered by")} {d.by}</p>
              {isGm ? <div className="flex gap-2 mt-2 flex-wrap items-center"><Btn variant="accent" accent={role.glow} icon={CheckCircle2} onClick={() => decide(d, true)}>{Lx(lang, "اعتماد", "Approve")}</Btn>
                <input value={why[d.id] || ""} onChange={(e) => setWhy({ ...why, [d.id]: e.target.value })} placeholder={Lx(lang, "سبب الرفض", "Reason")} className="flex-1 min-w-[120px] rounded-lg px-2.5 py-2 text-[12px] outline-none" style={XINP} /><Btn variant="danger" onClick={() => decide(d, false)}>{Lx(lang, "رفض", "Reject")}</Btn></div>
                : <p className="text-[11.5px] mt-1" style={{ color: "#8A611E" }}>{Lx(lang, "بانتظار المدير العام (لا تدخل الحساب قبل اعتماده).", "Awaiting GM — not counted until approved.")}</p>}
            </div>))}</div>}
        </Panel>)}
    </div>
  );
}

/* ─── يوميتي: كشف المندوب اليومي (خدّ/سلّم) — بلا أي أرقام عن ربح الشركة ─── */
function MyDailyPage({ lang, role, activeRep, reports, ext }) {
  const E = extOf(ext);
  const [month, setMonth] = useState(riyadhToday().slice(0, 7));
  const [all, setAll] = useState(false);
  if (!activeRep) return null;
  const d = dailyTotals(E.daily, activeRep.id, month);
  const orders = monthEntriesFor(reports, activeRep.id, month).reduce((s, e) => s + (e.orders || 0), 0);
  const Tile = ({ k, v, c }) => <div className="rounded-xl p-3" style={BOXS}><p className="text-[10.5px]" style={{ color: "var(--muted)" }}>{k}</p><p className="num text-[17px] font-extrabold" style={c ? { color: c } : null}>{fmt(r2(v))}</p></div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap"><XIn type="month" value={month} onChange={(v) => v && setMonth(v)} />
        <button onClick={() => setAll(!all)} className="px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: "#fff", border: "1px solid var(--line)" }}>{all ? Lx(lang, "أيام النشاط فقط", "Active days only") : Lx(lang, "كل أيام الشهر", "All days")}</button></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Tile k={Lx(lang, "طلباتي هذا الشهر", "My orders")} v={orders} /><Tile k={Lx(lang, "خدتّه من سلف", "Advances taken")} v={d.adv} />
        <Tile k={Lx(lang, "رصيد السلف عليّ", "Advance balance")} v={d.advBal} c={d.advBal > 0 ? "#8A611E" : null} /><Tile k={d.gap < 0 ? Lx(lang, "فائض كاش لي", "Cash surplus (mine)") : Lx(lang, "كاش عليّ تسليمه", "Cash I owe")} v={Math.abs(d.gap)} c={dlColor(d.gap)} />
      </div>
      <Panel title={Lx(lang, "كشفي اليومي", "My daily statement")}><RiderDayStatement lang={lang} repId={activeRep.id} month={month} reports={reports} daily={E.daily} showAll={all} /></Panel>
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
  chat: CommsPage, messages: RepMessagesPage, audit: AuditLogPage,
  charter: CharterPage, checklist: PreLaunchChecklistPage, growth: GrowthPage, security: SecurityPage,
  permissions: PermissionsMapPage, mystory: MyStoryPage, equipCompliance: ComplianceEquipmentPage,
  boardCouncil: BoardCouncilPage, decisions: DecisionsPage,
  repAccounting: RepAccountingPage, repFiles: RepFilesPage, riderWelcome: RiderAboutPage, myEarnings: MyEarningsPage, today: TodayPage, riderHome: RiderHome, riderReceipts: RiderReceiptsPage, receiptsAdmin: ReceiptsAdminPage,
  financeHub: HubPage, repsHub: HubPage, commsHub: HubPage, hrHub: HubPage, legalHub: HubPage,
  coach: CoachPage, myScore: MyScorePage, myWallet: MyWalletPage, reportInc: ReportIncidentPage, myLeave: MyLeavePage, academy: AcademyPage,
  perfBoard: PerfBoardPage, walletAdmin: WalletAdminPage, incidents: IncidentsPage, leavesAdmin: LeavesAdminPage, trainingAdmin: TrainingAdminPage,
  appAvail: AppAvailAdminPage, retention: RetentionPage, support: SupportPage, myRefer: MyReferPage, referrals: ReferralsAdminPage, teams: TeamsPage,
  perfPlans: PerfPlansPage, coverage: CoveragePage, cockpit: CockpitPage, whatIf: WhatIfPage, closeList: CloseListPage, cashflow: CashFlowPage, empFile: EmpFilePage, offboard: OffboardPage,
  dailyLedger: DailyLedgerPage, myDaily: MyDailyPage, settleFlow: SettleFlowPage, dayOps: DayOpsPage, pipeline: PipelinePage, crm: CrmPage, snapshots: SnapshotsPage, copilot: CopilotPage, inbox: InboxPage,
};
const NAV_ICON = {
  repFiles: KeyRound, riderWelcome: Sparkles,
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
  coach: Rocket, myScore: Trophy, myWallet: HandCoins, reportInc: ShieldAlert, myLeave: CalendarDays, academy: Award,
  perfBoard: Trophy, walletAdmin: HandCoins, incidents: ShieldAlert, leavesAdmin: CalendarDays, trainingAdmin: Award,
  appAvail: Navigation, retention: AlertTriangle, support: Phone, myRefer: UserPlus, referrals: UserPlus, teams: Trophy,
  perfPlans: Target, coverage: Users, cockpit: LayoutDashboard, whatIf: Zap, closeList: BadgeCheck, cashflow: TrendingUp, empFile: ClipboardList, offboard: LogOut,
  dailyLedger: ClipboardList, myDaily: CalendarDays, settleFlow: BadgeCheck, dayOps: ClipboardList, pipeline: UserPlus, crm: Building2, snapshots: Download, copilot: Sparkles, inbox: Bell,
};

/* ═══════════  الهيكل  ═══════════ */
/* ═══════════  جولة تعريفية أول استخدام  ═══════════ */
const TOUR_STEPS = {
  ar: {
    rep: [
      { t: "أهلاً بك في بوارق الشرق", d: "هذه لوحتك الشخصية — تعرض إنجازك الشهري وحالة حضورك في نظرة واحدة." },
      { t: "بصمة الحضور", d: "الزر العائم بالأسفل يسجّل بصمتك من أي صفحة، والمشرف يحضّرك يومياً وتظهر درجة حضورك في «أدائي ونقاطي»." },
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
      { t: "Clock in", d: "The floating button clocks you in from any page; your supervisor takes daily attendance and your score shows in My Score." },
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
      { t: "حاضری", d: "نیچے موجود بٹن کسی بھی صفحے سے حاضری لگاتا ہے، اور سپروائزر روزانہ حاضری لیتا ہے۔" },
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

Object.assign(RA.ar, { opsPickSup: "اختر اسمك", supLabel: "مشرف", opsNoSup: "لا يوجد موظفون في إدارة التشغيل بعد — تضيفهم الموارد البشرية.", opsViaDept: "دخول بكلمة سر الإدارة (للمدير)", supPass: "كلمة سرّك الشخصية", supScopeNote: "أنت تشاهد فريقك فقط" });
Object.assign(RA.en, { opsPickSup: "Choose your name", supLabel: "Supervisor", opsNoSup: "No operations staff yet — HR adds them.", opsViaDept: "Sign in with department password (manager)", supPass: "Your personal password", supScopeNote: "You only see your own team" });
Object.assign(RA.ur, { opsPickSup: "اپنا نام منتخب کریں", supLabel: "سپروائزر", opsNoSup: "ابھی کوئی عملہ نہیں — HR شامل کرے گا۔", opsViaDept: "شعبہ کے پاس ورڈ سے داخل ہوں (مینیجر)", supPass: "آپ کا ذاتی پاس ورڈ", supScopeNote: "آپ صرف اپنی ٹیم دیکھتے ہیں" });

function Shell({ lang, setLang, role, user, activeRep, onSwitch, onLogout, reduce, setReduce, reps, setReps, reports, setReports,
  tickets, setTickets, circulars, setCirculars, attendance, setAttendance,
  orders, setOrders, cars, setCars, restaurants, setRestaurants, invoices, setInvoices,
  employees, setEmployees, contracts, setContracts, cases, setCases, approvalReqs, setApprovalReqs,
  expenses, setExpenses, iqamaAlerts, setIqamaAlerts, payrollRuns, setPayrollRuns,
  deptChats, setDeptChats, repMessages, setRepMessages, leaderboardHistory, setLeaderboardHistory, auditLog, setAuditLog,
  weekendFine, setWeekendFine, charterClauses, setCharterClauses, violationPenalty, setViolationPenalty,
  deptPasswords, setDeptPasswords, deptSecurity, setDeptSecurity, pricing, setPricing, repSettlements, setRepSettlements, applications, setApplications, pwResets, setPwResets, repReceipts, setRepReceipts,
  equipStatus, setEquipStatus, tgaFines, setTgaFines, decisions, setDecisions, query, setQuery, startEmployee, ext, setExt }) {
  // نسخة احتياطية يومية تلقائية عند دخول المدير العام (مرة واحدة في اليوم)
  useEffect(() => {
    if (role.id !== "gm" || !ext) return;
    const idx = (ext.snapIdx || []);
    const today = riyadhToday();
    if (idx.includes(today)) return;
    const tm = setTimeout(() => { takeSnapshot(setExt, today).catch(() => {}); }, 12000);
    return () => clearTimeout(tm);
    // eslint-disable-next-line
  }, [role.id, ext && (ext.snapIdx || []).join(",")]);
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
  const [fabToast, setFabToast] = useState(null);
  const [tourSeen, setTourSeen] = useState(false);
  const markTourSeen = () => setTourSeen(true);
  const deptStaff = employees.filter((e) => e.dept === role.id && e.status !== "suspended");
  const needsIdentity = role.id !== "gm" && deptStaff.length >= 2;
  const [actingEmployee, setActingEmployee] = useState(startEmployee || (deptStaff.length === 1 ? deptStaff[0] : null));
  const Page = PAGES[page] || Overview;
  // عزل المشرف: كل مشرف يشوف مناديب فريقه وتقاريره وتذاكره ورسائله فقط
  const scopeSup = role.id === "ops" && actingEmployee && actingEmployee.isSupervisor ? actingEmployee.id : null;
  const vReps = scopeSup ? reps.filter((r) => r.sup === scopeSup) : reps;
  const teamNids = new Set(vReps.map((r) => r.nid));
  const vReports = scopeSup ? reports.filter((r) => r.sup === scopeSup) : reports;
  const vTickets = scopeSup ? tickets.filter((tk) => teamNids.has(tk.repId)) : tickets;
  const vRepMessages = scopeSup ? repMessages.filter((m) => teamNids.has(m.repId)) : repMessages;
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
  const EXn = extOf(ext);
  if (isRep) {
    {
      const pm = prevMonthStr(riyadhNow().toISOString().slice(0, 7));
      if (repSettlements.some((z) => (z.month === pm || z.month === riyadhNow().toISOString().slice(0, 7)) && z.closed)) notifs.push({ text: RA[lang].repClosedNotif, tone: "ok", page: "myEarnings" });
    }
    repMessages.filter((m) => m.repId === user && !m.seen).forEach((m) =>
      notifs.push({ text: `${(ALL_ROLES.find((r) => r.id === m.from) || {})[lang]?.t}: ${m.text}`, tone: m.text.indexOf("⚠") === 0 ? "bad" : "info", page: "messages", snd: m.text.indexOf("⚠") === 0 ? "urgent" : "normal" }));
    tickets.filter((tk) => tk.repId === user && (tk.status === "resolved" || tk.status === "rejected" || tk.status === "auto_closed"))
      .slice(0, 3).forEach((tk) => notifs.push({ text: `${ticketTypeOf(tk.type)[lang]} — ${tk.status === "resolved" ? x.stageResolved : tk.status === "auto_closed" ? x.stageAutoClosed : x.stageRejected}`, tone: tk.status === "resolved" ? "ok" : "n", page: "tickets" }));
    tickets.filter((tk) => tk.repId === user).forEach((tk) => {
      const mins = minutesUntilAppt(tk);
      if (mins != null && mins >= 0 && mins <= 60) notifs.unshift({ text: `${x.apptSoonT}: ${tk.apptAt.slice(11, 16)} (${x.apptSoonNote})`, tone: "warn", page: "tickets" });
    });
  } else {
    if (role.id === "ops" || role.id === "opsm" || role.id === "legal" || role.id === "gm") {
      const openInc = EXn.incidents.filter((i) => i.status !== "closed" && (!scopeSup || i.sup === scopeSup));
      const urgentInc = openInc.filter((i) => i.urgent);
      if (openInc.length > 0) notifs.unshift({ text: Lx(lang, `🚨 بلاغات مفتوحة: ${openInc.length}${urgentInc.length ? ` (عاجل: ${urgentInc.length})` : ""} — آخرها: ${openInc[0].name}`, `🚨 Open incidents: ${openInc.length}${urgentInc.length ? ` (urgent: ${urgentInc.length})` : ""} — latest: ${openInc[0].name}`), tone: "bad", page: "incidents", count: openInc.length, snd: "urgent" });
    }
    if (role.id === "gm") { const prq = (EXn.priceReq || []).filter((r) => r.status === "pending"); if (prq.length > 0) notifs.unshift({ text: Lx(lang, `💰 تسعيرات تنتظر اعتمادك: ${prq.length} — ${prq.some((r) => (r.kind || "rep") === "app") ? "تسعيرة الشركة من التطبيق" : "تسعيرة المندوب"}`, `💰 Pricing awaiting your approval: ${prq.length}`), tone: "warn", page: "repAccounting", count: prq.length, snd: "normal" }); }
    if ((role.id === "ops" || role.id === "opsm") && riyadhNow().getUTCHours() >= 12 && reps.some((r) => r.status === "active") && !((EXn.roll || {})[riyadhToday()] && Object.keys(EXn.roll[riyadhToday()]).length > 0))
      notifs.unshift({ text: Lx(lang, "لم يُسجَّل حضور مناديب اليوم بعد", "Today's rider attendance isn't taken yet"), tone: "warn", page: "pulse", count: 1, snd: "normal" });
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
    if (myInboxTickets > 0) notifs.push({ text: `${x.inboxTickets}: ${myInboxTickets}`, tone: "warn", page: "tickets", count: myInboxTickets, snd: "normal" });

    // ===== تنبيه رسائل الإدارات غير المقروءة (كل الأقسام) =====
    const unseenDeptMsgs = deptChats.filter((m) => m.to === role.id && !m.seen).length;
    if (unseenDeptMsgs > 0) notifs.unshift({ text: `${x.deptMsgsNotif}: ${unseenDeptMsgs}`, tone: "info", page: "chat", count: unseenDeptMsgs, snd: "normal" });
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
      if (forwarded > 0) notifs.unshift({ text: `${x.legalForwardedNotif}: ${forwarded}`, tone: "bad", page: "tickets", count: forwarded, snd: "normal" });
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
            <AlertSoundToggle lang={lang} score={notifs.reduce((a, n) => a + (n.snd ? (n.count || 1) : 0), 0)} urgent={notifs.some((n) => n.snd === "urgent")} body={(notifs.find((n) => n.snd === "urgent") || notifs.find((n) => n.snd) || {}).text} />
            <div className="relative">
              <button onClick={() => setBell(!bell)} className="relative p-2 rounded-xl" style={{ background: "rgba(20,27,45,.045)", border: "1px solid var(--line)" }} aria-label={t.alerts}>
                <Bell size={16} />
                {notifs.length > 0 && <span className="absolute -top-1 min-w-[16px] h-4 px-1 grid place-items-center rounded-full text-[9.5px] font-extrabold pulse-dot" style={{ insetInlineEnd: -3, background: "#E8837A", color: "#fff" }}>{Math.min(99, notifs.reduce((a, n) => a + (n.count || 1), 0))}</span>}
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
              reps={vReps} setReps={setReps} reports={vReports} setReports={setReports} scopeSup={scopeSup}
              tickets={vTickets} setTickets={setTickets} circulars={circulars} setCirculars={setCirculars}
              attendance={attendance} setAttendance={setAttendance}
              orders={orders} setOrders={setOrders} cars={cars} setCars={setCars}
              restaurants={restaurants} setRestaurants={setRestaurants} invoices={invoices} setInvoices={setInvoices}
              employees={employees} setEmployees={setEmployees} contracts={contracts} setContracts={setContracts}
              cases={cases} setCases={setCases} approvalReqs={approvalReqs} setApprovalReqs={setApprovalReqs}
              expenses={expenses} setExpenses={setExpenses}
              iqamaAlerts={iqamaAlerts} setIqamaAlerts={setIqamaAlerts} payrollRuns={payrollRuns} setPayrollRuns={setPayrollRuns}
              deptChats={deptChats} setDeptChats={setDeptChats} repMessages={vRepMessages} setRepMessages={setRepMessages}
              leaderboardHistory={leaderboardHistory} setLeaderboardHistory={setLeaderboardHistory}
              auditLog={auditLog} setAuditLog={setAuditLog} actingEmployee={actingEmployee} weekendFine={weekendFine} setWeekendFine={setWeekendFine} charterClauses={charterClauses} setCharterClauses={setCharterClauses}
              violationPenalty={violationPenalty} setViolationPenalty={setViolationPenalty}
              deptPasswords={deptPasswords} setDeptPasswords={setDeptPasswords} deptSecurity={deptSecurity} setDeptSecurity={setDeptSecurity}
              equipStatus={equipStatus} setEquipStatus={setEquipStatus} tgaFines={tgaFines} setTgaFines={setTgaFines}
              decisions={decisions} setDecisions={setDecisions}
              pricing={pricing} setPricing={setPricing} repSettlements={repSettlements} setRepSettlements={setRepSettlements}
              applications={applications} setApplications={setApplications} pwResets={pwResets} setPwResets={setPwResets} repReceipts={repReceipts} setRepReceipts={setRepReceipts}
              ext={ext} setExt={setExt} allReps={reps} allReports={reports}
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
  const [pwResets, setPwResets] = usePersisted("bq_pw_resets", []);
  const [repReceipts, setRepReceipts] = usePersisted("bq_rep_receipts", []);
  const [ext, setExt] = usePersisted("bq_ext", EXT0);
  DAILY_CTX = (ext && ext.daily) || [];
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
      timer = setTimeout(() => { setRoleId(null); setStartEmp(null); setStep("gate"); }, IDLE_MS);
    };
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, reset));
    reset();
    return () => { clearTimeout(timer); events.forEach((ev) => window.removeEventListener(ev, reset)); };
  }, [step]);

  const IDLE_LIMIT_MS = 10 * 60 * 1000;
  const [sessionExpired, setSessionExpired] = useState(false);
  const [startEmp, setStartEmp] = useState(null);
  const idleTimer = useRef(null);
  useEffect(() => {
    if (step !== "app") return;
    const resetIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setRoleId(null); setStartEmp(null); setStep("gate"); setSessionExpired(true);
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
      {step === "gate" && RIDER_MODE && riderView === "landing" && <RiderLanding lang={lang} setLang={setLang} reps={reps} pricing={pricing} go={setRiderView} ext={ext} />}
      {step === "gate" && RIDER_MODE && riderView === "apply" && <RiderApply lang={lang} reps={reps} applications={applications} setApplications={setApplications} go={setRiderView} ext={ext} />}
      {step === "gate" && RIDER_MODE && riderView === "login" && (
        <RiderLogin lang={lang} setLang={setLang} err={loginErr} setErr={setLoginErr} onBack={() => setRiderView("landing")}
          onForgot={(nid, phone) => setPwResets((prev) => (prev.some((q) => q.nid === nid && q.status === "open") ? prev : [{ id: "PWR-" + Date.now(), nid, phone, at: riyadhNow().toISOString(), status: "open" }, ...prev]))}
          onRep={(nid, pass) => {
            const rec = reps.find((r) => r.nid === nid.trim());
            if (!rec || !["active", "left", "suspended"].includes(rec.status)) { setLoginErr(EX[lang].errRepNotActive); return; }
            if (rec.password && rec.password !== pass) { setLoginErr(EX[lang].errRepWrongPass); return; }
            setLoginErr(""); setRoleId("rep"); setUser(nid.trim()); setStep("app"); setSessionExpired(false);
          }} />
      )}
      {step === "gate" && !RIDER_MODE && (
        <DeptGate lang={lang} setLang={setLang} reps={reps} employees={employees} err={loginErr} setErr={setLoginErr} sessionExpired={sessionExpired}
          deptPasswords={deptPasswords} deptSecurity={deptSecurity} setDeptSecurity={setDeptSecurity}
          onEmployee={(id, emp) => { setStartEmp(emp || null); setRoleId(id); setUser("BQ-" + id.toUpperCase()); setStep("app"); setSessionExpired(false); }}
          onRep={(nid, pass) => {
            const rec = reps.find((r) => r.nid === nid.trim());
            if (!rec || !["active", "left", "suspended"].includes(rec.status)) { setLoginErr(EX[lang].errRepNotActive); return; }
            if (rec.password && rec.password !== pass) { setLoginErr(EX[lang].errRepWrongPass); return; }
            setLoginErr(""); setRoleId("rep"); setUser(nid.trim()); setStep("app"); setSessionExpired(false);
          }} />
      )}
      {step === "app" && role && role.id === "rep" && activeRep && activeRep.status !== "active" && (
        <RepExitScreen lang={lang} setLang={setLang} rep={activeRep} reports={reports} pricing={pricing} repSettlements={repSettlements} weekendFine={weekendFine} violationPenalty={violationPenalty} repReceipts={repReceipts} ext={ext}
          onLogout={() => { setRoleId(null); setStartEmp(null); setStep("gate"); }} />
      )}
      {step === "app" && role && !(role.id === "rep" && activeRep && activeRep.status !== "active") && (
        <Shell startEmployee={startEmp} lang={lang} setLang={setLang} role={role} user={user} activeRep={activeRep} reduce={reduce} setReduce={setReduce}
          reps={reps} setReps={setReps} reports={reports} setReports={setReports}
          tickets={tickets} setTickets={setTickets} circulars={circulars} setCirculars={setCirculars}
          attendance={attendance} setAttendance={setAttendance}
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
          applications={applications} setApplications={setApplications} pwResets={pwResets} setPwResets={setPwResets} repReceipts={repReceipts} setRepReceipts={setRepReceipts} ext={ext} setExt={setExt}
          query={query} setQuery={setQuery}
          onSwitch={() => { setStartEmp(null); setStep("gate"); }} onLogout={() => { setRoleId(null); setStartEmp(null); setStep("gate"); }} />
      )}
    </div>
  );
}
