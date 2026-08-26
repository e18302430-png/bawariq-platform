"use client";

import { whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { analytics } from "@/lib/analytics";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink(WHATSAPP_DEFAULT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analytics.orderViaWhatsapp("floating_button")}
      aria-label="اطلب عبر واتساب"
      className="fixed bottom-24 left-4 z-[45] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform hover:scale-110 active:scale-95 sm:bottom-8 sm:h-14 sm:w-14"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/50" />
      <WhatsAppIcon />
    </a>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.31.646 4.47 1.768 6.312L4 29l7.86-1.727A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.7c-1.94 0-3.75-.556-5.28-1.516l-.379-.234-4.664 1.026 1.05-4.545-.248-.394A9.66 9.66 0 0 1 5.3 15c0-5.906 4.8-10.7 10.704-10.7 5.905 0 10.7 4.794 10.7 10.7s-4.795 10.7-10.7 10.7Zm5.86-8.02c-.32-.16-1.892-.933-2.185-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-1.014 1.253-.187.213-.373.24-.693.08-.32-.16-1.352-.499-2.575-1.589-.952-.849-1.594-1.898-1.781-2.218-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.735-.987-2.377-.26-.626-.524-.541-.72-.55l-.613-.011c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667s1.146 3.093 1.306 3.307c.16.213 2.256 3.445 5.467 4.83.764.33 1.36.527 1.825.674.767.244 1.465.21 2.017.127.615-.092 1.892-.774 2.16-1.52.267-.747.267-1.386.187-1.52-.08-.134-.293-.214-.613-.374Z" />
    </svg>
  );
}
