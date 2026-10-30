/**
 * Employer FAQs. Answers state the operating model honestly and never promise outcomes.
 */

export interface Faq {
  question: string;
  answer: string;
}

export const employerFaqs: Faq[] = [
  {
    question: "Which worker categories can MITT support?",
    answer:
      "MITT's work covers welding, fitting and fabrication, electrical trades, mechanical and industrial support, plumbing, construction trades and general industrial roles. A category being listed does not mean candidates are available in it today — MITT confirms active availability only after reviewing a specific requirement.",
  },
  {
    question: "Can one requirement cover several trades?",
    answer:
      "Yes. Requirements commonly mix trades and levels. Send the trades, approximate counts per trade and the site location, and MITT will clarify scope before confirming anything.",
  },
  {
    question: "How are candidates screened?",
    answer:
      "Screening is a human assessment of trade competence, relevant work history and workplace readiness, carried out against the requirement you describe. It is not a certification, and it is not a prediction of individual performance.",
  },
  {
    question: "Can interviews be coordinated for our team?",
    answer:
      "Yes. Interviews are arranged for your team in the format you prefer — at the MITT premises, on your site, or remotely. Coordinating an interview is not a selection and does not create an offer.",
  },
  {
    question: "Is additional training available for selected candidates?",
    answer:
      "Where the selected trade or process needs it, MITT can run practical preparation aligned to the requirement. It is scheduled when the requirement justifies it, and programme details are confirmed directly.",
  },
  {
    question: "How are candidate outcomes recorded and communicated?",
    answer:
      "An outcome — joining, deferral or withdrawal — is recorded once your organisation confirms it. Interview, selection, medical clearance, documentation and joining are distinct events and are reported as distinct events.",
  },
  {
    question: "Which locations can MITT currently serve?",
    answer:
      "MITT operates from Visakhapatnam, Andhra Pradesh. Coverage for a specific site or destination is confirmed per requirement, since it depends on the trade, the numbers and the jurisdiction involved.",
  },
  {
    question: "How does a new employer begin working with MITT?",
    answer:
      "Submit a workforce requirement through this website with the trades, approximate numbers, location and timeline. MITT reviews it, clarifies anything unclear, and replies with a realistic next step — including a clear answer if the requirement cannot be supported.",
  },
  {
    question: "Does MITT handle overseas recruitment?",
    answer:
      "Where international activity is involved it is coordinated through authorised partners and remains subject to applicable law and permissions. MITT does not advertise independent overseas recruitment authorisation, and does not promise visas, clearances or approvals.",
  },
  {
    question: "Does MITT charge workers for registration?",
    answer:
      "This website does not collect fees, passport details, medical records or visa documents. Any commercial terms are confirmed directly between MITT and the organisation enquiring.",
  },
];

export const trainingFaqs: Faq[] = [
  {
    question: "Who is training intended for?",
    answer:
      "Workers preparing for a specific employer requirement, workers returning to a trade, and candidates whose practical skills need alignment with a process before an interview.",
  },
  {
    question: "Is a certificate issued?",
    answer:
      "No certification or affiliation is claimed on this website. What MITT can confirm is practical preparation and an honest assessment of readiness for a specific requirement.",
  },
  {
    question: "Can training be arranged around our requirement?",
    answer:
      "Yes, where the requirement justifies it. MITT aligns preparation to the process, equipment or working conditions your site uses.",
  },
];
