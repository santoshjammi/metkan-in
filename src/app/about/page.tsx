import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CTABand } from "@/components/marketing/CTABand";
import { LeadershipList } from "@/components/marketing/LeadershipList";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  evidenceHeading,
  evidenceIntro,
  evidencePoints,
} from "@/content/evidence";
import { campusExterior } from "@/content/facility";
import {
  careerSupport,
  careerSupportHeading,
  careerSupportIntro,
  legacy,
  leadership,
} from "@/content/legacy";
import { cta, site } from "@/content/site";
import {
  breadcrumbJsonLd,
  buildMetadata,
  organizationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Metkan Institute for Technical Training (MITT), formerly St. Patrick Welding Institute, has trained and placed industrial tradespeople from Autonagar, Visakhapatnam for more than 23 years. Published leadership, placement support and contact details.",
  path: "/about",
});

/**
 * Built from the published display number rather than a stored href, so the
 * tel: URI always carries the full digits.
 */
const telHref = (display: string) => `tel:${display.replace(/[^+\d]/g, "")}`;

/** What MITT does - each line restates approved content, no new capability. */
const pillars = [
  {
    n: "01",
    title: "Technical training",
    body: "Practical workshop preparation for the hand skills a trade actually requires, from process-specific welding practice to the workplace discipline that decides whether a worker lasts on a site.",
  },
  {
    n: "02",
    title: "Skilled-worker screening",
    body: "A human assessment of trade competence, relevant work history and workplace readiness against a stated requirement - not a certification, and not a prediction of individual performance.",
  },
  {
    n: "03",
    title: "Employer hiring coordination",
    body: "Requirement clarification, interview coordination and readiness steps, with the hiring decision staying with the employer.",
  },
];

/**
 * Stated as absences because they are absences: nothing in this list has been
 * verified or permissioned for publication. MITT's own published history is
 * presented elsewhere on this page, with its source note.
 */
const notPublished = [
  "Testimonials or client references",
  "Client logos or partner marks",
  "Placement or workforce statistics",
  "Certifications, accreditations or affiliations",
  "Staff counts beyond the published leadership",
];

export default function AboutPage() {
  return (
    <>
      <JsonLd id="about-organization" data={organizationJsonLd()} />
      <JsonLd
        id="about-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <PageHero
        eyebrow="About"
        title="Metkan Institute for Technical Training."
        lede={site.heroSupport}
        cta={{ label: cta.speak, href: "/contact" }}
        secondary={{ label: "How an engagement works", href: "/our-process" }}
        meta={{
          label: "On this page",
          items: [
            "What MITT does",
            "Heritage and leadership",
            "Placement support",
            "What this site leaves out",
            "Address and contact",
          ],
        }}
      />

      {/* -- 01 -- What MITT does ------------------------------------------ */}
      <Section tone="light" aria-labelledby="what-we-do-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="what-we-do-heading"
              eyebrow="The organisation"
              index="01"
              tone="light"
              title="Three connected activities, run from Visakhapatnam."
              lede="MITT works with employers who need trade skills on a site or shop floor, and with the people who have them. The work is coordination and preparation, not the sale of a promise."
            />
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-8 border-t border-line-ink pt-8 sm:grid-cols-3 sm:gap-6">
              {pillars.map((pillar) => (
                <div key={pillar.n}>
                  <span
                    aria-hidden="true"
                    className="font-display text-[0.72rem] font-medium tracking-[0.18em] tabular-nums text-copper-ink"
                  >
                    {pillar.n}
                  </span>
                  <h3 className="mt-2 font-display text-[1.05rem] font-medium leading-snug text-text-dark">
                    {pillar.title}
                  </h3>
                  <p className="copy-ink mt-2 text-[0.95rem]">{pillar.body}</p>
                </div>
              ))}
            </div>

            <p className="copy-ink mt-10 max-w-[64ch] border-t border-line-ink pt-6">
              This website is a marketing site. It holds no worker registration,
              candidate profiles, logins or dashboards - it exists so an
              employer can judge whether a conversation with MITT is worth
              having. Trade scope is set out in{" "}
              <Link
                href="/capabilities"
                className="link-line text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em]"
              >
                capabilities
              </Link>
              , preparation in{" "}
              <Link
                href="/training"
                className="link-line text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em]"
              >
                training
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      {/* -- 02 -- Heritage, as MITT publishes it --------------------------- */}
      <Section tone="dark" aria-labelledby="heritage-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="heritage-heading"
              eyebrow={legacy.eyebrow}
              index="02"
              title={legacy.heading}
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {legacy.body.map((paragraph) => (
              <p key={paragraph} className="copy mt-4 text-[1rem] first:mt-0">
                {paragraph}
              </p>
            ))}
            <p className="meta mt-6 max-w-[58ch] border-t border-line pt-4 text-steel-hi">
              {legacy.attribution}
            </p>
          </div>
        </div>
      </Section>

      {/* -- Campus band: a genuine 1600x650 photograph, capped at native --- */}
      <Section bleed tone="graphite" aria-label="The institute building">
        <figure className="mx-auto w-full" style={{ maxWidth: campusExterior.width }}>
          <Image
            src={campusExterior.src}
            alt={campusExterior.alt}
            width={campusExterior.width}
            height={campusExterior.height}
            unoptimized
            className="h-auto w-full"
          />
          <figcaption className="meta mt-4 max-w-[62ch] px-[clamp(1.25rem,4vw,2.5rem)] text-steel-hi">
            {campusExterior.caption} Photographs of the institute are MITT&apos;s own.
          </figcaption>
        </figure>
      </Section>

      {/* -- 03 -- Leadership as published ---------------------------------- */}
      <Section tone="light" aria-labelledby="leadership-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="leadership-heading"
              eyebrow="Leadership"
              index="03"
              tone="light"
              title="The leadership MITT publishes."
              lede={
                "These are the entries named in MITT's own published material: the head of the facility and the recruitment team. No further roster, qualification claim or team structure is published here."
              }
            />
            <p className="meta mt-6 max-w-[42ch] border-t border-line-ink pt-4 text-steel-ink">
              Names, roles and experience are reproduced as MITT states them.
              They are not an independent assessment of any individual.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <LeadershipList tone="light" className="mt-2" />
            <p className="meta mt-8 max-w-[52ch] text-steel-ink">
              {leadership.length} entries, exactly as published.
            </p>
          </div>
        </div>
      </Section>

      {/* -- 04 -- Career support ------------------------------------------ */}
      <Section tone="graphite" aria-labelledby="career-support-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="career-support-heading"
              eyebrow="Placement support"
              index="04"
              title={careerSupportHeading}
              lede={careerSupportIntro}
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="grid gap-x-10 gap-y-0 border-t border-line sm:grid-cols-2">
              {careerSupport.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-3 border-b border-line py-3.5 text-[0.95rem] text-ivory/90"
                >
                  <Check
                    aria-hidden="true"
                    size={14}
                    strokeWidth={1.8}
                    className="shrink-0 translate-y-[0.15em] text-copper-hi"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="meta mt-6 max-w-[52ch] text-steel-hi">
              Support is preparation for an employer conversation. It is not a
              placement guarantee.
            </p>
          </div>
        </div>
      </Section>

      {/* -- 05 -- Evidence, stated as what exists ------------------------- */}
      <Section tone="dark" aria-labelledby="evidence-heading">
        <SectionHeading
          id="evidence-heading"
          eyebrow="Evidence"
          index="05"
          title={evidenceHeading}
          lede={evidenceIntro}
        />

        <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {evidencePoints.map((point) => (
            <div key={point.title}>
              <h3 className="font-display text-[1.05rem] font-medium text-ivory">
                {point.title}
              </h3>
              <p className="copy mt-2 text-[0.95rem]">{point.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Badge tone="copperOnDark">Not published here</Badge>
            <h3 className="mt-4 max-w-[24ch] font-display text-h3 font-medium text-ivory">
              What this site deliberately leaves out.
            </h3>
            <p className="copy mt-3 max-w-[40ch] text-[0.95rem]">
              None of the following has been verified or permissioned, so none
              of it appears - on this page or anywhere else on the site. Where
              MITT&apos;s own published material states its history or its
              leadership, that appears above with the source note attached.
            </p>
          </div>
          <ul className="lg:col-span-7 lg:col-start-6">
            {notPublished.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-3 border-b border-line py-3 text-[0.95rem] text-ivory/90"
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-1 shrink-0 translate-y-[-0.15em] bg-copper-hi"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* -- 06 -- Where MITT works, and who built this site ---------------- */}
      <Section tone="light" aria-labelledby="contact-details-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="contact-details-heading"
              eyebrow="Where we work"
              index="06"
              tone="light"
              title="Visakhapatnam, Andhra Pradesh."
              lede="MITT operates from Visakhapatnam. Coverage for a specific site or destination is confirmed per requirement, since it depends on the trade, the numbers and the jurisdiction involved."
            />
          </div>

          <div className="lg:col-span-7">
            <dl className="grid gap-8 border-t border-line-ink pt-8 sm:grid-cols-2">
              <div>
                <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-steel-ink">
                  Address
                </dt>
                <dd className="mt-2 text-[0.95rem] leading-[1.7] text-text-dark">
                  <address className="not-italic">
                    {site.legalName}
                    <br />
                    {site.address.line1}
                    <br />
                    {site.address.line2}
                    <br />
                    {site.address.city} {site.address.postalCode}
                    <br />
                    {site.address.region}, {site.address.country}
                  </address>
                </dd>
              </div>
              <div>
                <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-steel-ink">
                  Telephone
                </dt>
                <dd className="mt-2">
                  <a
                    href={telHref(site.phone.display)}
                    className="text-[1rem] font-medium text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-ink"
                  >
                    {site.phone.display}
                  </a>
                  <ul className="mt-2 space-y-1">
                    {site.secondaryPhones.map((phone) => (
                      <li key={phone.href}>
                        <a
                          href={telHref(phone.display)}
                          className="text-[0.95rem] text-text-dark/85 underline decoration-line-ink decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-ink"
                        >
                          {phone.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-steel-ink">
                  Email
                </dt>
                <dd className="mt-2 text-[0.95rem] leading-[1.7] text-text-dark">
                  <a
                    href={site.email.href}
                    className="font-medium underline decoration-line-ink decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-ink"
                  >
                    {site.email.display}
                  </a>
                  <br />
                  <a
                    href={site.secondaryEmail.href}
                    className="underline decoration-line-ink decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-ink"
                  >
                    {site.secondaryEmail.display}
                  </a>
                  <p className="meta mt-2 max-w-[34ch] text-steel-ink">
                    Both addresses are published by MITT. The second is an
                    alternative route, not a different service.
                  </p>
                </dd>
              </div>
              <div>
                <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-steel-ink">
                  Location
                </dt>
                <dd className="mt-2 text-[0.95rem] leading-[1.7] text-text-dark">
                  Autonagar, Visakhapatnam
                  <br />
                  Andhra Pradesh 530012, India
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-line-ink pt-6">
              <p className="eyebrow text-steel-ink">Technology partner</p>
              <p className="copy-ink mt-3 max-w-[58ch] text-[0.95rem]">
                {site.technologyPartner.attribution}. Sai Ameya is MITT&apos;s
                technology partner for this website; it is not MITT&apos;s parent
                organisation and does not provide the training or workforce
                coordination described here.
              </p>
            </div>

            <div className="mt-8">
              <Button
                href="/contact"
                size="md"
                className="border-text-dark bg-text-dark text-ivory hover:border-graphite hover:bg-graphite"
              >
                Contact MITT
                <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <CTABand index="07" />
    </>
  );
}
