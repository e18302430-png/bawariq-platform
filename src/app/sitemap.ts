import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const SITE_URL = "https://weshtala3lak.example.com"; // PLACEHOLDER — set real production domain

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/cups", "/cart", "/checkout"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes];
}
