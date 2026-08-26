import { PACK_SIZE } from "./products";

// Direct-order WhatsApp channel — this is the primary ordering path the
// client asked to surface everywhere on the site.
export const WHATSAPP_NUMBER_DISPLAY = "0570 150 638";
const WHATSAPP_NUMBER_INTL = "966570150638"; // +966 5 70150638

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER_INTL}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_MESSAGE = `مرحبًا 👋 أبغى أطلب باكيت وش طلع لك (${PACK_SIZE} كوب بـ٩.٩٩ ريال).`;

export function whatsappProductMessage(productName: string, packs: number) {
  return `مرحبًا 👋 أبغى أطلب: ${productName} — ${packs} باكيت (${packs * PACK_SIZE} كوب).`;
}
