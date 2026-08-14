// Central analytics event bus.
// Swap `dispatch` for a real provider (GA4 / Meta Pixel / server-side CAPI) at launch.
// Every call site in the app should go through the named helpers below so the
// event contract stays stable regardless of which vendor sits behind it.

type EventPayload = Record<string, string | number | boolean | undefined>;

function dispatch(event: string, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });

  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${event}`, payload);
  }
}

export const analytics = {
  viewHome: () => dispatch("view_home"),
  viewProduct: (productId: string, productName: string) =>
    dispatch("view_product", { product_id: productId, product_name: productName }),
  playHeroVideo: () => dispatch("play_hero_video"),
  scrollStoryStart: () => dispatch("scroll_story_start"),
  scrollStoryComplete: () => dispatch("scroll_story_complete"),
  revealInteraction: (variant?: string) => dispatch("reveal_interaction", { variant }),
  selectProduct: (productId: string, productName: string) =>
    dispatch("select_product", { product_id: productId, product_name: productName }),
  addToCart: (productId: string, productName: string, price: number, quantity: number) =>
    dispatch("add_to_cart", {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
    }),
  removeFromCart: (productId: string, productName: string) =>
    dispatch("remove_from_cart", { product_id: productId, product_name: productName }),
  beginCheckout: (value: number, itemCount: number) =>
    dispatch("begin_checkout", { value, item_count: itemCount }),
  checkoutAbandon: (step: string) => dispatch("checkout_abandon", { step }),
  purchase: (orderId: string, value: number) =>
    dispatch("purchase", { order_id: orderId, value }),
};

declare global {
  interface Window {
    dataLayer: EventPayload[];
  }
}
