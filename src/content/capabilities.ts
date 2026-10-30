/**
 * Trade / workforce categories.
 *
 * `availability` is deliberately conservative:
 *   "confirm-required" → MITT has not confirmed active supply for this category.
 * The UI must render these honestly (a quiet status note), never as a stock claim.
 * Do not add categories, certifications or counts that MITT has not verified.
 */

export type Availability = "confirm-required" | "confirmed";

export interface Capability {
  slug: string;
  title: string;
  summary: string;
  skills: string[];
  availability: Availability;
  /** Optional confirmed image. When absent, the card renders a type-only plate. */
  image?: { src: string; alt: string; width: number; height: number };
}

export const capabilities: Capability[] = [
  {
    slug: "welding",
    title: "Welding",
    summary:
      "Welders assessed on process familiarity, position work and workplace discipline before an employer interview.",
    skills: ["MIG / MAG", "TIG", "Arc welding", "Structural fabrication"],
    availability: "confirm-required",
  },
  {
    slug: "fitting-and-fabrication",
    title: "Fitting & fabrication",
    summary:
      "Fitters and fabricators coordinated against employer drawings, tolerances and assembly requirements.",
    skills: ["Assembly fitting", "Sheet metal", "Pipe fitting", "Drawing interpretation"],
    availability: "confirm-required",
  },
  {
    slug: "electrical-trades",
    title: "Electrical trades",
    summary:
      "Industrial and site electricians screened for practical troubleshooting and safe working practice.",
    skills: ["Industrial wiring", "Panel work", "Conduit and cabling", "Fault finding"],
    availability: "confirm-required",
  },
  {
    slug: "mechanical-and-industrial-support",
    title: "Mechanical & industrial support",
    summary:
      "Mechanical maintenance and industrial support roles coordinated to plant and project requirements.",
    skills: ["Machine maintenance", "Fitters' mates", "Lubrication and servicing", "Shutdown support"],
    availability: "confirm-required",
  },
  {
    slug: "plumbing",
    title: "Plumbing",
    summary:
      "Plumbing candidates assessed on installation practice, pipe work and site readiness.",
    skills: ["Pipe installation", "Sanitary fitting", "Leak diagnosis", "Site plumbing"],
    availability: "confirm-required",
  },
  {
    slug: "construction-trades",
    title: "Construction trades",
    summary:
      "Construction trade roles coordinated for project phases, with requirements clarified per site.",
    skills: ["Masonry", "Steel fixing", "Shuttering", "Site support"],
    availability: "confirm-required",
  },
  {
    slug: "general-industrial-workforce",
    title: "General industrial workforce",
    summary:
      "Helpers and general industrial roles coordinated for volume requirements and shift patterns.",
    skills: ["Production helpers", "Material handling", "Housekeeping", "Loading support"],
    availability: "confirm-required",
  },
];

export const capabilityNote =
  "MITT confirms active availability for a trade only after reviewing a specific requirement. Listing a category here does not mean candidates are currently available in it.";

export function tradeLabel(slug: string): string {
  return capabilities.find((c) => c.slug === slug)?.title ?? slug;
}

export const tradeSlugs = capabilities.map((c) => c.slug) as [string, ...string[]];
