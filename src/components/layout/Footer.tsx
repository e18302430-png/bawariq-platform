import Link from "next/link";
import { trustSignals } from "@/lib/products";
import { whatsappLink, WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER_DISPLAY } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-t border-line bg-obsidian-2 text-off-white-dim">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl text-off-white">وش طلع لك</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              مصنع أكواب سعودي — ٢٥ كوب بأشكال مثيرة ومتطورة، مباشر من المصنع بدون وسطاء.
            </p>
            <a
              href={whatsappLink(WHATSAPP_DEFAULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-[#25D366] transition-opacity hover:opacity-80"
            >
              اطلب واتساب:{" "}
              <span dir="ltr" className="font-semibold">
                {WHATSAPP_NUMBER_DISPLAY}
              </span>
            </a>
          </div>

          <FooterColumn
            title="المتجر"
            links={[
              { href: "/cups", label: "كل الباكيتات" },
              { href: "/#collection", label: "التشكيلة المميزة" },
              { href: "/cart", label: "السلة" },
            ]}
          />

          <FooterColumn
            title="الدعم"
            links={[
              { href: "/#faq", label: "الأسئلة الشائعة" },
              { href: "#", label: "الشحن والتوصيل" },
              { href: "#", label: "الاستبدال والإرجاع" },
            ]}
          />

          <div>
            <p className="mb-4 text-sm font-semibold text-off-white">نثق فيه</p>
            <ul className="space-y-2 text-sm">
              {trustSignals.map((signal) => (
                <li key={signal.label}>{signal.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} وش طلع لك. جميع الحقوق محفوظة.</p>
          <p className="text-off-white-dim/70">
            الأسعار والسياسات المعروضة تجريبية لغرض العرض — سيتم تحديثها قبل الإطلاق الرسمي.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-4 text-sm font-semibold text-off-white">{title}</p>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition-colors hover:text-gold">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
