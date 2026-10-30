/**
 * Training and preparation.
 *
 * Only operationally plausible, generic capability language is published. No programme
 * names, durations, batch sizes, certificates, affiliations or fees are claimed — none
 * are verified.
 */

export interface TrainingArea {
  title: string;
  body: string;
}

export const trainingAreas: TrainingArea[] = [
  {
    title: "Practical skill development",
    body: "Supervised workshop practice focused on the hand skills a trade actually requires on a site or shop floor.",
  },
  {
    title: "Welding preparation",
    body: "Process-specific practice and position work, prepared around the requirement an employer brings.",
  },
  {
    title: "Workplace practices",
    body: "Safe working habits, tool care, housekeeping and the discipline that decides whether a worker lasts on a site.",
  },
  {
    title: "Technical refresh sessions",
    body: "Short refreshers for workers returning to a trade or moving to a different process.",
  },
  {
    title: "Behavioural and safety orientation",
    body: "Site conduct, reporting, shift discipline and hazard awareness before deployment to a project.",
  },
  {
    title: "Employer-specific preparation",
    body: "Where an employer's process or equipment differs from standard practice, preparation is aligned to their requirement.",
  },
];

export const trainingIntro =
  "Training is treated as the front half of hiring, not a separate product: what a worker can actually do decides whether an employer interview is worth anyone's time.";

/** Rendered as a visible note — this content is capability-oriented, not a catalogue. */
export const trainingNote =
  "Programme schedules, eligibility and fees are confirmed with MITT directly. No certification or affiliation is claimed on this website.";

export const trainingImage = {
  src: "/media/facility-corridor.jpg",
  alt: "Industrial workshop floor with equipment under warm low lighting",
  width: 2000,
  height: 1142,
  /** Shown to users: this is illustrative, not a MITT facility photograph. */
  disclosure: "Illustrative image — not a photograph of a MITT facility.",
};
