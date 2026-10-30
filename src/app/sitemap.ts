import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * The site is deployed as one unit, so every route shares the build timestamp
 * as its last-modified date. No route claims more recent content than the
 * deployment that shipped it.
 */
const lastModified = new Date();

interface SitemapRoute {
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}

/**
 * Public, indexable routes only. `/thank-you` is a confirmation screen and is
 * excluded (it is also disallowed in robots.txt); the 404 is not a route.
 */
const routes: SitemapRoute[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/for-employers", changeFrequency: "monthly", priority: 0.9 },
  { path: "/capabilities", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/training", changeFrequency: "monthly", priority: 0.7 },
  { path: "/our-process", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
