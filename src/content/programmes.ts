/**
 * Training programmes - transcribed from MITT's published flyer (page 2).
 * Source register: FACTS-FROM-FLYER (private ops docs) (P1-P5).
 *
 * Do not add a programme, duration, level or skill that is not in that register.
 */

export interface Programme {
  slug: string;
  index: string;
  title: string;
  summary: string;
  skills: string[];
  duration: string;
  levels: string;
  /** P5 is bespoke work, so it has no fixed duration or level bands. */
  custom?: boolean;
}

export const programmes: Programme[] = [
  {
    slug: "structural-welding",
    index: "01",
    title: "Structural Welding Programme",
    summary:
      "Build a strong foundation in structural welding through intensive practical training on plate.",
    skills: [
      "Plate welding in 1G, 2G, 3G and 4G positions",
      "SMAW (stick welding)",
      "GMAW (MIG welding)",
      "Joint preparation and welding technique",
      "Practical workshop practice",
    ],
    duration: "2 months, full-time",
    levels: "Beginner · Advanced · Upskilling",
  },
  {
    slug: "pipe-welding",
    index: "02",
    title: "Pipe Welding Mastery",
    summary:
      "Advanced pipe welding for industrial applications, taught across multiple processes.",
    skills: [
      "Pipe welding in 2G, 5G and 6G positions",
      "GTAW (TIG welding)",
      "SMAW (stick welding)",
      "Pipe joint preparation",
      "Multi-process welding technique",
      "Practical welding-test preparation",
    ],
    duration: "2 months, full-time",
    levels: "Beginner · Advanced · Upskilling",
  },
  {
    slug: "industrial-pipe-fitter",
    index: "03",
    title: "Industrial Pipe Fitter Course",
    summary:
      "The technical and practical skills required for industrial pipe-fitting and fabrication work.",
    skills: [
      "Pipe blueprint and drawing reading",
      "Isometric drawing interpretation",
      "Pipe layout and measurement",
      "Cutting and beveling",
      "Threading",
      "Fit-up and alignment",
      "Tack-welding preparation",
    ],
    duration: "2 months, full-time",
    levels: "Beginner · Advanced · Upskilling",
  },
  {
    slug: "structural-fitter",
    index: "04",
    title: "Structural Fitter / Fabricator",
    summary:
      "Interpret structural drawings and turn them into accurately fitted fabricated structures.",
    skills: [
      "Structural drawing interpretation",
      "Layout and marking",
      "Measurement and precision fitting",
      "Cutting and preparation",
      "Fitting of beams, channels and structural members",
      "Joint preparation for final welding",
      "Practical fabrication technique",
    ],
    duration: "2 months, full-time",
    levels: "Beginner · Advanced · Upskilling",
  },
  {
    slug: "corporate-upskilling",
    index: "05",
    title: "Corporate & Custom Upskilling",
    summary:
      "Technical training built around a specific company, project or fabrication team rather than a fixed syllabus.",
    skills: [
      "Specialised multi-process welding",
      "Company-specific fabrication requirements",
      "Applicable fabrication codes and procedures",
      "Practical skill enhancement",
      "Customised schedules and modules",
    ],
    duration: "Flexible, customised schedule",
    levels: "Designed per requirement",
    custom: true,
  },
];

export const programmeIntro =
  "Five programmes, taught in a working workshop rather than a classroom. Every core programme runs two months full-time and accepts beginners, working professionals and people upskilling in a new process.";

export const programmeNote =
  "Programme dates, intake and fees are confirmed directly with MITT. No certification, affiliation or accreditation is claimed on this website.";
