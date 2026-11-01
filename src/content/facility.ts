/**
 * Facility facts and the real facility photographs, transcribed from MITT's flyer
 * (page 3) and its embedded images. Register: FACTS-FROM-FLYER (private ops docs).
 *
 * IMAGE RULE: these are genuine but low-resolution photographs (363-1600px wide).
 * They may be displayed at or below their native width in a documentary context.
 * Never upscale them to full-bleed. None contain identifiable people.
 */

export interface FacilityPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  /** Native pixel width - the layout must not exceed it. */
  nativeWidth: number;
}

export const facilityPhotos: FacilityPhoto[] = [
  {
    src: "/media/facility/workshop-overview.jpg",
    alt: "The MITT welding workshop floor, with a row of blue partitioned booths",
    width: 486,
    height: 567,
    caption: "The workshop floor, looking down the booth line.",
    nativeWidth: 486,
  },
  {
    src: "/media/facility/booths-aisle.jpg",
    alt: "Welding booths along the workshop aisle, with safety charts on the wall",
    width: 363,
    height: 363,
    caption: "Booths on the aisle, with the safety charts above them.",
    nativeWidth: 363,
  },
  {
    src: "/media/facility/booth-closeup.jpg",
    alt: "A single numbered welding booth with its power source and partition",
    width: 363,
    height: 363,
    caption: "One of the fourteen individual booths.",
    nativeWidth: 363,
  },
  {
    src: "/media/facility/interview-room.jpg",
    alt: "An interview room at the MITT campus, with a table and seating for candidates",
    width: 458,
    height: 389,
    caption: "An interview room used for employer and candidate meetings.",
    nativeWidth: 458,
  },
];

export const campusExterior = {
  src: "/media/facility/campus-exterior.jpg",
  alt: "The Metkan Institute building in Autonagar, Visakhapatnam",
  width: 1600,
  height: 650,
  caption: "The institute building in Autonagar, Visakhapatnam.",
} as const;

export const facilityHeadline = "Fourteen booths, not a shared bench";

export const facilityIntro =
  "Practical training only works if every trainee has a station and enough torch time. MITT runs fourteen individual welding booths with dedicated power sources, so practice time is not rationed by equipment queues.";

export const facilityPoints: { title: string; body: string }[] = [
  {
    title: "Fourteen individual welding booths",
    body: "Fully equipped stations that give each trainee dedicated practice space and cut waiting time for equipment.",
  },
  {
    title: "Modern industrial equipment",
    body: "Industry-standard, heavy-duty welding power sources and workshop equipment - the same class of plant trainees will meet on site.",
  },
  {
    title: "Safety built into the room",
    body: "Source-extraction ventilation, fire-safety equipment, personal protective equipment and documented safe workshop practice.",
  },
];

export const testingFacility = {
  heading: "Placement and testing facility",
  body: "MITT's facility carries trade-specific testing equipment, which lets employers assess practical skill before committing to a candidate rather than relying on an interview claim.",
  supports: [
    "Placement and recruitment across skilled trades",
    "Trade-specific practical skill testing",
    "Candidate screening and evaluation",
    "Employer-focused selection support",
    "Practical assessment against the job requirement",
  ],
} as const;

export const facilityCaption =
  "Photographs of MITT's own facility. Displayed at native resolution - these are working photographs, not a styled shoot.";
