import type { MetadataRoute } from "next";

const SITE_URL = "https://bawariq.example.com"; // PLACEHOLDER — set real production domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
