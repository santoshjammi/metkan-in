/**
 * History, measured claims, leadership and placement support - from MITT's flyer
 * (pages 1 and 4). Register: FACTS-FROM-FLYER (private ops docs).
 *
 * ATTRIBUTION RULE: figures marked `attributed` are MITT's own published statements.
 * The UI must present them with their source note and with `placementDisclaimer`
 * beside them. Never restate an attributed figure as an independently verified fact.
 */

export interface Figure {
  value: string;
  label: string;
  attributed: boolean;
  note?: string;
}

export const figures: Figure[] = [
  {
    value: "23+",
    label: "Years of training and placement",
    attributed: true,
    note: "MITT's published figure.",
  },
  {
    value: "100,000+",
    label: "Candidates placed overseas",
    attributed: true,
    note: "MITT's published figure.",
  },
  {
    value: "14",
    label: "Individual welding booths",
    attributed: false,
  },
  {
    value: "80%",
    label: "Hands-on practical training",
    attributed: false,
    note: "The remainder is classroom theory.",
  },
];

export const figuresHeading = "What MITT has built";

export const figuresIntro =
  "Four numbers that describe the scale of the institute. The first two are MITT's own published figures; the last two describe the facility and the training model.";

export const placementDisclaimer =
  "Placement performance may vary depending on trainee eligibility, skills, experience, employer requirements, and available vacancies.";

export const legacy = {
  eyebrow: "Formerly St. Patrick Welding Institute",
  heading: "Twenty-three years in the same trade, in the same place",
  body: [
    "Metkan Institute for Technical Training - formerly St. Patrick Welding Institute - has trained and placed industrial tradespeople from Autonagar, Visakhapatnam for more than 23 years.",
    "That history is the reason employers keep coming back: the institute has spent two decades learning what a fabrication shop, a pipeline job or a construction site actually asks of a worker before anyone is sent to an interview.",
  ],
  attribution: "History and standing as stated in MITT's published material.",
} as const;

export const leadership = [
  {
    name: "K. V. Srikanth",
    role: "Head of Facility",
    body: "More than 25 years executing mechanical, electrical and structural projects across India - practical insight into how industrial work is actually run.",
  },
  {
    name: "Manning and recruitment team",
    role: "25 years in overseas recruitment",
    body: "Coordinates client interviews, mobilises candidates, and oversees the institute's training and trade-testing operations.",
  },
] as const;

export const careerSupport = [
  "Resume preparation",
  "Blueprint and drawing-reading support",
  "Weld-test preparation",
  "Mock interviews",
  "Job-readiness guidance",
  "Placement assistance",
  "Lifetime alumni network",
] as const;

export const careerSupportHeading = "Getting from the workshop to the workplace";

export const careerSupportIntro =
  "Technical skill gets a worker to the interview. These are the things that get them through it and into the job.";

/**
 * Overseas support, as MITT publishes it. COMPLIANCE: no licence, authorisation or
 * approval may be stated or implied. See FACTS-FROM-FLYER (private ops docs) C1-C3.
 */
export const overseasSupport = {
  heading: "Overseas placement and travel coordination",
  body: "Where a role is overseas, MITT coordinates travel through established travel-agency partners in Delhi and Mumbai, alongside the candidate's own documentation.",
  items: [
    "International air-ticket arrangements",
    "Visa processing coordination",
    "Travel coordination",
    "Overseas deployment support",
  ],
  caveat:
    "Documentation, visa and deployment steps are coordinated with authorised partners and remain subject to applicable law and to the destination country's requirements. No visa, clearance or approval is promised.",
} as const;

export const brochure = {
  href: "/media/mitt-brochure.pdf",
  title: "MITT capability brochure",
  body: "Programmes, facility details and trade-testing capability, in one four-page document you can forward internally.",
  cta: "Download the brochure",
  meta: "PDF, 4 pages, 700 KB",
} as const;
