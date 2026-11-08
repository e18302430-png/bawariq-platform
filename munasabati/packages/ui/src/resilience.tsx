import { Component, type ErrorInfo, type ReactNode } from "react";

/** حاجز أخطاء: أي خطأ في شاشة يظهر برسالة واضحة بدل صفحة بيضاء، ويمكن إعادة المحاولة */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[مناسبتي]", error, info.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="empty" role="alert" style={{ minHeight: "50vh" }}>
        <span className="ico">!</span>
        <b style={{ color: "var(--ink)", fontSize: 17 }}>صار خطأ غير متوقع في هذي الشاشة</b>
        <span>بياناتك محفوظة. جرّب مرة ثانية.</span>
        <button className="btn primary" onClick={() => { this.setState({ error: null }); }}>أعد المحاولة</button>
      </div>
    );
  }
}

/** هيكل تحميل خفيف يظهر لأجزاء من الثانية أثناء تحميل الشاشة */
export function ScreenSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="جاري التحميل">
      <div className="sk" style={{ height: 34, width: "45%" }} />
      <div className="sk" style={{ height: 180 }} />
      <div className="sk" style={{ height: 120 }} />
    </div>
  );
}

/** تخزين مؤقت للعمل بدون إنترنت عند النشر الفعلي (يُتجاهل حيث لا تُدعم Service Workers) */
export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || location.protocol !== "https:") return;
  // داخل إطار (مثل رابط المعاينة) لا نسجّل التخزين المؤقت، ونزيل أي تسجيل سابق حتى تظهر آخر نسخة دائماً
  if (window.top !== window) { navigator.serviceWorker.getRegistrations?.().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {}); return; }
  window.addEventListener("load", () => { navigator.serviceWorker.register("./sw.js").catch(() => { /* غير مدعوم هنا */ }); });
}
