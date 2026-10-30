/**
 * Single source of truth for brand, contact and navigation.
 *
 * CLAIMS DISCIPLINE: every value below is either verified (see docs/BUILD-SPEC.md §1)
 * or an explicitly labelled placeholder. Do not replace a placeholder with an invented
 * value. When MITT supplies real details, change them here only.
 */

export const placeholderMarker = "[PLACEHOLDER — pending MITT confirmation]";

export const site = {
  name: "MITT",
  legalName: "Metkan Institute for Technical Training",
  shortLegalName: "Metkan Institute for Technical Training",
  positioning: "Technical training, skilled-worker screening and coordinated employer hiring.",
  brandLine: "Connecting skilled people with real opportunities.",
  heroHeadline: "Skilled Hands. Stronger Industries.",
  heroSupport:
    "MITT supports technical training, skilled-worker screening and coordinated employer hiring processes.",
  city: "Visakhapatnam",
  region: "Andhra Pradesh",
  country: "India",
  /** Verified: Visakhapatnam, Andhra Pradesh. Street address is NOT verified — do not add one. */
  locationLine: "Visakhapatnam, Andhra Pradesh, India",
  /** Owner-supplied 2026-10-30. `href` is empty for email until an inbox exists. */
  phone: {
    display: "+91 74163 42020",
    href: "tel:+917416342020",
    placeholder: false,
    source: "Owner, 2026-10-30",
  },
  email: {
    display: "Enquiries email pending confirmation",
    href: "",
    placeholder: true,
  },
  /** No approved WhatsApp business number exists. Keep null — do not render a WhatsApp link. */
  whatsapp: null as string | null,
  /** No verified social profiles. Keep empty — footer must render nothing for this. */
  social: [] as { label: string; href: string }[],
  technologyPartner: {
    name: "Sai Ameya Technologies LLP",
    /** Never presented as MITT's parent brand or service provider. */
    attribution: "Website engineered by Sai Ameya Technologies LLP",
  },
  /** Legal review has not happened. Renders a visible DRAFT chip on /privacy and /terms. */
  legalReviewPending: true,
  siteUrlFallback: "http://localhost:3210",
} as const;

export const cta = {
  primary: "Discuss Your Workforce Requirement",
  primaryShort: "Discuss a requirement",
  submit: "Submit a Workforce Requirement",
  speak: "Speak With MITT",
  capabilities: "Explore Our Capabilities",
  training: "Explore Training Capabilities",
} as const;

export const nav = [
  { label: "For employers", href: "/for-employers" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Training", href: "/training" },
  { label: "Our process", href: "/our-process" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const orgTypes = [
  { value: "employer", label: "Employer / industrial client" },
  { value: "agency", label: "Recruitment or staffing agency" },
  { value: "other", label: "Other organisation" },
] as const;

export const headcountBands = [
  { value: "1-5", label: "1 – 5 positions" },
  { value: "6-25", label: "6 – 25 positions" },
  { value: "26-100", label: "26 – 100 positions" },
  { value: "100+", label: "More than 100 positions" },
] as const;

export const employmentTypes = [
  { value: "permanent", label: "Permanent" },
  { value: "contract", label: "Contract" },
  { value: "other", label: "Other / not yet decided" },
] as const;

export const timelines = [
  { value: "immediate", label: "Immediate" },
  { value: "30d", label: "Within 30 days" },
  { value: "90d", label: "Within 90 days" },
  { value: "exploring", label: "Exploring options" },
] as const;

/** Standard hedge used wherever scope is described. Keep wording consistent. */
export const scopeCaveat =
  "Activities vary by employer, trade, assignment and jurisdiction.";
