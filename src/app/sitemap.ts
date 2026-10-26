import type { MetadataRoute } from "next";
import { SITE_URL, servicePages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Omit lastModified until an actual content modification date is available.
  return ["/", "/about", "/become-helper", ...servicePages.map((page) => page.path)].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
  }));
}
