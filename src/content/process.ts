/**
 * Engagement process — 8 stages.
 *
 * CLAIM RULE: selection is not deployment. Never merge these. Each stage states what
 * has actually happened at that point, and what has not.
 */

export interface ProcessStage {
  n: string;
  title: string;
  body: string;
  /** The honest boundary of this stage. Rendered as a quiet note, not hidden. */
  boundary?: string;
}

export const processStages: ProcessStage[] = [
  {
    n: "01",
    title: "Requirement received",
    body: "You send the trades, approximate numbers, location and timeline. Any format is acceptable to start.",
  },
  {
    n: "02",
    title: "Requirement clarified",
    body: "We confirm trade scope, experience level, shift and site conditions — the detail that decides whether a candidate is genuinely suitable.",
    boundary: "A requirement can be declined if it cannot be supported honestly.",
  },
  {
    n: "03",
    title: "Candidates identified and screened",
    body: "Relevant candidates are identified from MITT's own registration and training activity and screened on trade competence and work history.",
    boundary: "Screening is a human assessment, not a certification or a guarantee of performance.",
  },
  {
    n: "04",
    title: "Interview coordinated",
    body: "Interviews are arranged for your team, in the format you prefer — at MITT, on site, or remotely.",
    boundary: "Coordinating an interview is not a selection or an offer.",
  },
  {
    n: "05",
    title: "Employer assessment and selection",
    body: "Your team assesses and selects. MITT coordinates logistics and communicates outcomes; the hiring decision stays with you.",
    boundary: "Selection is not deployment.",
  },
  {
    n: "06",
    title: "Skill preparation where required",
    body: "Where the selected trade or process needs it, MITT runs practical preparation aligned to your requirement.",
    boundary: "Training is scheduled only when the requirement justifies it.",
  },
  {
    n: "07",
    title: "Documentation and readiness",
    body: "Where applicable and lawful, MITT coordinates readiness steps with the employer and any authorised partner.",
    boundary:
      "Documentation support is coordinated with authorised parties. MITT does not promise visas, clearances or approvals.",
  },
  {
    n: "08",
    title: "Outcome confirmation",
    body: "An outcome is recorded once your organisation confirms it — joining, deferral or withdrawal.",
    boundary:
      "Joining depends on employer confirmation, medical clearance where required, and completed documentation. These are separate events and are never assumed.",
  },
];

export const processCaveat =
  "Activities vary by employer, trade, assignment and jurisdiction. Stages 06–08 apply only where the requirement calls for them.";

export const processDisambiguation =
  "Interview and selection are not deployment. A candidate becomes a confirmed join only when the employer confirms it after the applicable clearances and documentation.";
