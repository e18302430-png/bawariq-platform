import type { Metadata } from "next";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";

export const metadata: Metadata = {
  title: "الباكيتات",
  description: "باكيت ٢٥ كوب بأشكال متطورة ومثيرة بـ٩.٩٩ ريال بس — مباشر من المصنع.",
};

export default function CupsPage() {
  return (
    <div className="bg-obsidian px-5 pt-28 pb-24 sm:px-8 lg:pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-xl">
          <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">المتجر</p>
          <h1 className="font-display text-4xl text-off-white sm:text-5xl">وش طلع لك؟</h1>
          <p className="mt-4 text-off-white-dim">
            كل باكيت ٢٥ كوب بأشكال متطورة بـ٩.٩٩ ريال بس. اختر التشكيلة، أو خلها تفاجئك.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} index={index} />
          ))}
        </div>
      </div>

      <StickyBuyBar />
    </div>
  );
}
