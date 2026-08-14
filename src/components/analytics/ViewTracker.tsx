"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

export function ViewTracker({ event }: { event: "home" | { product: string; name: string } }) {
  useEffect(() => {
    if (event === "home") {
      analytics.viewHome();
    } else {
      analytics.viewProduct(event.product, event.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
