import type { Metadata, Viewport } from "next";
import { displayFont, bodyFont } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import "./globals.css";

const SITE_NAME = "بوارق";
const SITE_URL = "https://bawariq.example.com"; // PLACEHOLDER — set real production domain

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "بوارق — وش طلع لك؟",
    template: "%s | بوارق",
  },
  description:
    "أكواب بوارق مو مجرد أدوات قهوة — كل كوب يحمل فكرة أو رسالة أو مفاجأة تكتشفها كل يوم.",
  openGraph: {
    title: "بوارق — وش طلع لك؟",
    description:
      "أكواب بوارق مو مجرد أدوات قهوة — كل كوب يحمل فكرة أو رسالة أو مفاجأة تكتشفها كل يوم.",
    siteName: SITE_NAME,
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "بوارق — وش طلع لك؟",
    description: "أكواب تحمل فكرة، مو مجرد أكواب.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-obsidian text-off-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only-focusable fixed top-2 start-2 z-[100] rounded-full bg-gold px-4 py-2 text-sm font-bold text-obsidian"
        >
          تخطَّ إلى المحتوى
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
