import type { Metadata } from "next";
import { site } from "@/content/site";

/**
 * Canonical origin. `NEXT_PUBLIC_SITE_URL` wins; otherwise the local preview
 * origin from `site`. Trailing slashes are stripped so every URL built here is
 * byte-identical no matter how the environment variable was set.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.siteUrlFallback
).replace(/\/+$/, "");

/** The generated `opengraph-image` route — 1200x630, no network fonts. */
export const socialImage = {
  path: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.heroHeadline}`,
} as const;

export interface BuildMetadataInput {
  /** Page title only. The root layout template appends `· MITT`. */
  title: string;
  /** Unique per page. Never reused across routes. */
  description: string;
  /** Route path, leading slash. Used for canonical, og:url and twitter. */
  path: string;
  /** Override the default social image with another route. */
  ogImage?: string;
  /** Legal drafts and confirmation screens: keep out of the index. */
  noIndex?: boolean;
}

/** Absolute URL for a route path, normalised to a single leading slash. */
export function absoluteUrl(path: string): string {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalised, `${siteUrl}/`).toString();
}

/**
 * The one metadata builder every inner page uses. Canonical, Open Graph,
 * Twitter card and robots defaults are set in one place so no page can
 * accidentally ship a relative canonical or a missing card type.
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(ogImage ?? socialImage.path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: site.name,
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: socialImage.width,
          height: socialImage.height,
          alt: socialImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * `EducationalOrganization` for the real, owner-supplied address and telephone.
 *
 * Deliberately absent, because none of it is verified: aggregateRating, review,
 * openingHours, geo coordinates, accreditations, certifications, foundingDate
 * and any employee or placement count. Adding one of these is a claims breach,
 * not a metadata tweak.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${siteUrl}/#organization`,
    name: site.legalName,
    alternateName: site.name,
    url: `${siteUrl}/`,
    telephone: site.phone.display,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: "IN",
    },
    areaServed: "Visakhapatnam",
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Route path, leading slash. */
  path: string;
}

/** Trails must match the page's own visible hierarchy — first item is Home. */
export function breadcrumbJsonLd(
  items: readonly BreadcrumbItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * FAQPage markup. Only emit this on a page where the questions AND answers are
 * visibly rendered — markup whose answers are not on the page is cloaking and a
 * rich-result violation. Answers are passed through verbatim from `src/content`.
 */
export function faqPageJsonLd(
  faqs: readonly { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
