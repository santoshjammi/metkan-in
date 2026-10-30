import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTABand } from "@/components/marketing/CTABand";
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
import { cta, site } from "@/content/site";
import {
  breadcrumbJsonLd,
  buildMetadata,
  organizationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Metkan Institute for Technical Training (MITT) is based in Visakhapatnam, Andhra Pradesh, coordinating technical training, skilled-worker screening and employer hiring processes.",
  path: "/about",
});

/**
 * Built from the verified display number rather than a stored href, so the
 * tel: URI always carries the full digits.
 */
const telHref = `tel:${site.phone.display.replace(/[^\d+]/g, "")}`;

/** What MITT does — each line restates approved content, no new capability. */
const pillars = [
  {
    n: "01",
    title: "Technical training",
    body: "Practical workshop preparation for the hand skills a trade actually requires, from process-specific welding practice to the workplace discipline that decides whether a worker lasts on a site.",
  },
  {
    n: "02",
    title: "Skilled-worker screening",
    body: "A human assessment of trade competence, relevant work history and workplace readiness against a stated requirement — not a certification, and not a prediction of individual performance.",
  },
  {
    n: "03",
    title: "Employer hiring coordination",
    body: "Requirement clarification, interview coordination and readiness steps, with the hiring decision staying with the employer.",
  },
];

/**
 * Stated as absences because they are absences: nothing in this list has been
 * verified or permissioned for publication.
 */
const notPublished = [
  "Testimonials or client references",
  "Client logos or partner marks",
  "Placement or workforce statistics",
  "Certifications, accreditations or affiliations",
  "Years in business, staff counts or founding dates",
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
            "How employers work with us",
            "What this website does not publish",
            "Address and telephone",
          ],
        }}
      />

      {/* ── 01 — What MITT does ──────────────────────────────────────────── */}
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
              candidate profiles, logins or dashboards — it exists so an
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

      {/* ── 02 — Evidence, stated as what exists ─────────────────────────── */}
      <Section tone="dark" aria-labelledby="evidence-heading">
        <SectionHeading
          id="evidence-heading"
          eyebrow="Evidence"
          index="02"
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
              None of the following has been verified or approved for
              publication, so none of it appears — on this page or anywhere
              else on the site.
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

      {/* ── 03 — Where MITT works, and who built this site ───────────────── */}
      <Section tone="light" aria-labelledby="contact-details-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="contact-details-heading"
              eyebrow="Where we work"
              index="03"
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
                    href={telHref}
                    className="text-[1rem] font-medium text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-ink"
                  >
                    {site.phone.display}
                  </a>
                  {/* Stays inside the <dd>: a <dl> group may only contain dt/dd. */}
                  <p className="meta mt-4 text-steel-ink">
                    No enquiries email is published yet. Use the telephone number
                    or the enquiry form.
                  </p>
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-line-ink pt-6">
              <p className="eyebrow text-steel-ink">Technology partner</p>
              <p className="copy-ink mt-3 max-w-[58ch] text-[0.95rem]">
                {site.technologyPartner.attribution}. Sai Ameya is MITT’s
                technology partner for this website; it is not MITT’s parent
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

      <CTABand index="04" />
    </>
  );
}
