import type { MetadataRoute } from "next";

const SITE_URL = "https://weshtala3lak.example.com"; // PLACEHOLDER — set real production domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
