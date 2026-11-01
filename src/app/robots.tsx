import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * NOTE ON THE FILE EXTENSION: this is `.tsx`, not `.ts`. Static export mode
 * narrows `pageExtensions` to `["tsx"]` (see next.config.ts) so the two
 * `route.ts` handlers under src/app/api are not collected as routes on a host
 * with no Node process. Keeping this metadata route `.tsx` keeps it in BOTH
 * artifacts.
 *
 * `force-static` makes this route prerender to robots.txt in BOTH build modes.
 * A static export has no server to answer /robots.txt per request, so without
 * this the file never reaches the host. robots.txt stays PUBLIC: the host's
 * .htaccess denies named files and `.log`/`.md`, and deliberately does not deny
 * `.txt` wholesale, because that would 403 this file.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* The enquiry endpoint is not a page, and the confirmation screen is
         only meaningful immediately after a submission. */
      disallow: ["/api/", "/thank-you"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
