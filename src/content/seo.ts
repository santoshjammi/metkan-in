/**
 * SEO / AEO / EEAT copy for the nine content routes.
 *
 * Every string here is transcribed from `internal-docs/ACE-AUDIT.md` (the ACE
 * standard for a Sai Ameya website): the title and description tables, and the
 * suggested answer blocks. The answer blocks are tightened to sit inside the
 * 40-60 word band; no fact, figure, certification, testimonial or affiliation
 * has been added that is not already published elsewhere in this repository.
 *
 * Keeping the copy in one module means a title can never drift from its route,
 * and the audit script can be reasoned about against a single source.
 */

export interface RouteSeo {
  /** Route path, leading slash. Used for the canonical and the schema nodes. */
  path: string;
  /** Absolute title (30-62 chars). The root template's `· MITT` is bypassed. */
  title: string;
  /** Unique per route, 70-165 chars. */
  description: string;
  /** 40-60 word direct answer, rendered as ordinary text under the h1. */
  answer: string;
}

export const seoCopy = {
  home: {
    path: "/",
    title: "Technical Training & Skilled Workforce | MITT Visakhapatnam",
    description:
      "MITT trains welders, pipe fitters and fabricators in Visakhapatnam and coordinates skilled-worker screening and interviews for industrial employers.",
    answer:
      "MITT, Metkan Institute for Technical Training, is a technical training institute in Autonagar, Visakhapatnam. It trains welders, pipe fitters and structural fabricators, screens skilled workers against an employer requirement, coordinates interviews and supports trade testing before selection. Employers describe a requirement, and MITT replies directly about what can be supported.",
  },
  employers: {
    path: "/for-employers",
    title: "Hire Skilled Tradespeople | MITT Workforce Coordination",
    description:
      "Send MITT your trades, numbers, site and timeline. We screen candidates, coordinate interviews and support trade testing before you commit.",
    answer:
      "To hire through MITT, send four things: the trades you need, the approximate number of positions, the site or project location, and when you need people on site. MITT reviews the requirement, clarifies it, identifies and screens candidates, and coordinates interviews for your team.",
  },
  capabilities: {
    path: "/capabilities",
    title: "Welding, Pipe Fitting & Fabrication Trades | MITT",
    description:
      "Welding, pipe fitting, structural fabrication, mechanical support, plumbing and construction trades, with trade-specific testing before interview.",
    answer:
      "MITT works across welding, pipe fitting, structural fabrication, mechanical and industrial support, plumbing and construction trades. Skills are listed because they define what a screening conversation tests. Listing a trade does not mean candidates are available today: availability is confirmed only after MITT reviews a specific employer requirement.",
  },
  training: {
    path: "/training",
    title: "Welding & Pipe Fitting Courses, Visakhapatnam | MITT",
    description:
      "Five programmes in Visakhapatnam: structural welding, pipe welding, industrial pipe fitting, structural fitting and corporate upskilling.",
    answer:
      "MITT runs five training programmes from its Visakhapatnam workshop: structural welding, pipe welding mastery, industrial pipe fitting, structural fitting, and corporate upskilling. The four core programmes run two months full-time and accept beginners, working professionals and people upskilling in a new process.",
  },
  process: {
    path: "/our-process",
    title: "How MITT Coordinates Hiring, Step by Step",
    description:
      "Eight stages from requirement to outcome, each with its stated limit. Interview and selection are not deployment, and MITT says so plainly.",
    answer:
      "A MITT engagement runs in eight stages: requirement received, requirement clarified, candidates identified and screened, interview coordinated, employer assessment and selection, skill preparation where required, documentation and readiness, and outcome confirmation. Selection is not deployment; a candidate becomes a confirmed join only when the employer confirms it.",
  },
  about: {
    path: "/about",
    title: "Metkan Institute for Technical Training, Visakhapatnam",
    description:
      "Formerly St. Patrick Welding Institute, MITT has trained and placed industrial tradespeople from Autonagar, Visakhapatnam for more than 23 years.",
    answer:
      "Metkan Institute for Technical Training, formerly St. Patrick Welding Institute, has trained and placed industrial tradespeople from Autonagar, Visakhapatnam for more than 23 years. The institute runs fourteen individual welding booths and a trade-testing facility used by employers to assess practical skill before selection.",
  },
  contact: {
    path: "/contact",
    title: "Submit a Workforce Requirement | MITT",
    description:
      "Tell MITT which trades you need, how many positions, the site and your timeline. One form, optional detail, and a direct answer about what is possible.",
    answer:
      "This form goes to MITT's enquiry review, not to a recruitment queue. Only five details are required - name, organisation, work email, organisation type and consent. Trades, numbers, site location and timeline are optional but make the first reply more useful.",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Notice — MITT Website Data Practices",
    description:
      "What the MITT website collects through its enquiry form, why, how long it is kept, who can see it, and how to exercise your rights under the DPDP Act.",
    answer:
      "This notice covers the MITT marketing website and its employer enquiry form. It explains what the form collects, why, how long it is kept, who can see it, and how to ask for access, correction or deletion under India's Digital Personal Data Protection Act, 2023.",
  },
  terms: {
    path: "/terms",
    title: "Website Terms of Use | Metkan Institute (MITT)",
    description:
      "The terms that apply to using the MITT website, including acceptable use, intellectual property and why a submitted enquiry creates no contract.",
    answer:
      "These terms cover use of the MITT informational website. Submitting an enquiry does not create a contract, a placement obligation or a guarantee of workers, training or interviews; service availability varies by trade, employer, assignment and jurisdiction. Work with MITT is agreed separately, in writing.",
  },
} as const satisfies Record<string, RouteSeo>;

/**
 * EEAT signals. One review date for the whole site, stated identically
 * everywhere; no per-page date, no named reviewer and no credential is implied.
 */
export const editorial = {
  reviewDate: "1 November 2026",
  reviewLabel: "Last reviewed 1 November 2026",
  reviewNote: "Reviewed periodically; figures are MITT's own published numbers.",
  /**
   * Sits under the homepage figures band: an attributed figure needs a named
   * source, not the vague "MITT's published figure" on its own.
   */
  figuresSource:
    "Source: the four figures above are taken from MITT's published capability brochure. They are MITT's own published numbers, not an independent measurement.",
} as const;
