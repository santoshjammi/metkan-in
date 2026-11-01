import type { Metadata } from "next";
import { site } from "@/content/site";
import { programmes } from "@/content/programmes";
import { capabilities } from "@/content/capabilities";
import { processStages } from "@/content/process";

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
  /**
   * Emit `title` exactly as given. Every content route ships a hand-tuned
   * absolute title (from `src/content/seo.ts`) that already carries the brand,
   * so the `· MITT` template would double it and break the length budget.
   */
  absoluteTitle?: boolean;
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
  absoluteTitle = false,
  description,
  path,
  ogImage,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(ogImage ?? socialImage.path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
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

/** The organization node as a resolvable reference, for `provider`/`publisher`. */
function organizationRef(): Record<string, unknown> {
  return {
    "@type": "EducationalOrganization",
    "@id": `${siteUrl}/#organization`,
    name: site.legalName,
    url: `${siteUrl}/`,
  };
}

/**
 * `WebSite` for the homepage. Pairs with the `EducationalOrganization` node on
 * the same page, which it names as publisher. No `SearchAction` is claimed:
 * this site has no search endpoint, and inventing one is a markup lie.
 */
export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: site.name,
    alternateName: site.legalName,
    inLanguage: "en-IN",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

/**
 * `ContactPage` for /contact, pointing at the organization node that is emitted
 * on the same page. The name is the page's own h1.
 */
export function contactPageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${absoluteUrl("/contact")}#contactpage`,
    url: absoluteUrl("/contact"),
    name: "Discuss your workforce requirement",
    mainEntity: { "@id": `${siteUrl}/#organization` },
    about: { "@id": `${siteUrl}/#organization` },
  };
}

/**
 * `ItemList` of the five published programmes as `Course` entries.
 *
 * Every field is transcribed from `src/content/programmes.ts`, which is what the
 * page renders: no outcome, certificate, syllabus hour or intake date is added.
 * `timeRequired` is ISO 8601 (`P2M`) and is emitted only for the four two-month
 * programmes — the fifth is bespoke and has no fixed duration to state.
 */
export function courseListJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MITT training programmes",
    numberOfItems: programmes.length,
    itemListElement: programmes.map((programme, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: programme.title,
        description: programme.summary,
        provider: organizationRef(),
        educationalLevel: programme.levels,
        ...(programme.custom ? {} : { timeRequired: "P2M" }),
        teaches: programme.skills,
      },
    })),
  };
}

/**
 * `Service` with an `OfferCatalog` over the seven trade categories, one `Offer`
 * each. The category summary and skill list are rendered on the same page, which
 * is why they can be described here; the availability caveat is deliberately not
 * encoded as `availability`, because it is a condition, not a stock status.
 */
export function serviceJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Skilled-workforce coordination across seven trade categories",
    serviceType: "Skilled-worker screening and interview coordination",
    provider: organizationRef(),
    areaServed: "Visakhapatnam",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Trade categories",
      numberOfItems: capabilities.length,
      itemListElement: capabilities.map((capability) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: capability.title,
          description: capability.summary,
        },
      })),
    },
  };
}

/**
 * `HowTo` for /our-process: the eight stages the page already renders, with the
 * stage body as the step text. No `totalTime` and no `tool` are claimed — neither
 * is stated anywhere on the page.
 */
export function howToJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How MITT coordinates a workforce requirement",
    description:
      "From first enquiry to a confirmed outcome, in eight stages, each with its stated limit.",
    step: processStages.map((stage, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: stage.title,
      text: stage.body,
    })),
  };
}

