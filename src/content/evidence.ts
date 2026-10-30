/**
 * Evidence and credibility content.
 *
 * HONEST BY CONSTRUCTION: no testimonial, partner logo, certification, award or
 * workforce statistic is published because none has been verified or permissioned.
 * The arrays stay empty and the UI renders a real, useful empty state that explains
 * what MITT *can* evidence on request.
 *
 * When MITT supplies approved, permissioned material, add it here — the components
 * already support it, so no layout change is needed.
 */

export interface Testimonial {
  quote: string;
  attribution: string;
  organisation: string;
  permissionedOn: string;
}

export interface Partner {
  name: string;
  logoSrc?: string;
  relationship: string;
}

export const testimonials: Testimonial[] = [];
export const partners: Partner[] = [];

/** These are process facts MITT can substantiate in a conversation. Not statistics. */
export const evidencePoints: { title: string; body: string }[] = [
  {
    title: "Screening method",
    body: "The criteria used to assess trade competence and readiness are described openly, so you can judge whether they match your requirement.",
  },
  {
    title: "Training capability",
    body: "The practical areas MITT prepares workers in, and what a preparation block actually covers, can be walked through before you commit.",
  },
  {
    title: "Process visibility",
    body: "You are told where a requirement stands at each stage, including when it stalls or cannot be met.",
  },
  {
    title: "Facility discussion",
    body: "A conversation about visiting or reviewing the working environment can be arranged directly with MITT.",
  },
];

export const evidenceHeading = "What MITT can evidence";

export const evidenceIntro =
  "This website publishes no testimonials, client logos or placement statistics, because none have been approved for publication. What MITT can evidence, it evidences directly: method, capability and process, in a conversation with your team.";

export const evidenceEmptyState = {
  title: "Client references",
  body: "Permissioned references are shared directly during an engagement discussion. They are not published here.",
};

export const heroMedia = {
  src: "/media/hero-welding.jpg",
  alt: "A welder working on a metal beam in a dark industrial workshop, arc light and sparks illuminating the scene",
  width: 2000,
  height: 1125,
  /** Displayed in the footer legal row. Required by the build spec — do not remove. */
  disclaimer:
    "Imagery is representative of trade work and is not a photograph of MITT workers or facilities.",
};
