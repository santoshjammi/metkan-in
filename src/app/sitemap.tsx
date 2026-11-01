import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * NOTE ON THE FILE EXTENSION: this is `.tsx`, not `.ts`, and that is load-bearing.
 *
 * `npm run build:static` sets `NEXT_OUTPUT=export`, and static export mode
 * narrows `pageExtensions` to `["tsx"]` (see next.config.ts) so the two
 * `route.ts` handlers under src/app/api are not collected as routes - a static
 * host has no Node process to run them, and Next refuses to export a route
 * handler that declares `dynamic = "force-dynamic"`. Every page, layout and
 * metadata route in this app is `.tsx`, which is what keeps it in the artifact;
 * a `.ts` metadata route would be dropped from the static build while still
 * working on the server build. Hence no `.ts` route files here.
 *
 * `force-static` makes this route prerender to the sitemap XML in BOTH build
 * modes. A static export has no server to generate it per request, so without
 * this the file is simply absent from the artifact and the sitemap reference in
 * robots.txt points at a 404.
 */
export const dynamic = "force-static";

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
