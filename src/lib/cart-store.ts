"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";
import { analytics } from "./analytics";

export type CartLine = {
  productSlug: string;
  name: string;
  image: string;
  price: number;
  variantId: string;
  variantLabel: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  isDrawerOpen: boolean;
  lastAddedSlug: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (product: Product, variantId: string, quantity?: number) => void;
  removeItem: (productSlug: string, variantId: string) => void;
  setQuantity: (productSlug: string, variantId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isDrawerOpen: false,
      lastAddedSlug: null,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: (product, variantId, quantity = 1) => {
        const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
        const existing = get().lines.find(
          (line) => line.productSlug === product.slug && line.variantId === variant.id
        );

        if (existing) {
          set({
            lines: get().lines.map((line) =>
              line === existing ? { ...line, quantity: line.quantity + quantity } : line
            ),
          });
        } else {
          set({
            lines: [
              ...get().lines,
              {
                productSlug: product.slug,
                name: product.name,
                image: product.image,
                price: product.price,
                variantId: variant.id,
                variantLabel: variant.label,
                quantity,
              },
            ],
          });
        }

        set({ isDrawerOpen: true, lastAddedSlug: product.slug });
        analytics.addToCart(product.slug, product.name, product.price, quantity);
      },

      removeItem: (productSlug, variantId) => {
        const line = get().lines.find(
          (l) => l.productSlug === productSlug && l.variantId === variantId
        );
        if (line) analytics.removeFromCart(productSlug, line.name);
        set({
          lines: get().lines.filter(
            (l) => !(l.productSlug === productSlug && l.variantId === variantId)
          ),
        });
      },

      setQuantity: (productSlug, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productSlug, variantId);
          return;
        }
        set({
          lines: get().lines.map((line) =>
            line.productSlug === productSlug && line.variantId === variantId
              ? { ...line, quantity }
              : line
          ),
        });
      },

      clear: () => set({ lines: [] }),
    }),
    { name: "bawariq-cart" }
  )
);

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
