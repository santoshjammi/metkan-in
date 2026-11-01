import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BrochureCard } from "@/components/marketing/BrochureCard";
import { CTABand } from "@/components/marketing/CTABand";
import { HeritageLine } from "@/components/marketing/HeritageLine";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { TestingPanel } from "@/components/marketing/TestingPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd } from "@/lib/seo";
import { capabilities, capabilityNote } from "@/content/capabilities";
import { evidenceHeading, evidenceIntro, evidencePoints } from "@/content/evidence";
import { employerFaqs } from "@/content/faqs";
import {
  processDisambiguation,
  processStages,
} from "@/content/process";
import {
  cta,
  headcountBands,
  scopeCaveat,
  site,
  timelines,
} from "@/content/site";

export const metadata: Metadata = {
  title: "For employers",
  description:
    "How MITT works with industrial employers and staffing agencies: what a workforce requirement should include, how screening and interview coordination work, and how to submit a requirement.",
  alternates: { canonical: "/for-employers" },
};

const telHref = `tel:${site.phone.display.replace(/[^+\d]/g, "")}`;

/** Verified service areas only — BUILD-SPEC §1, client brief §1. */
const serviceLines = [
  "Technical training",
  "Skilled-worker screening",
  "Interview coordination",
];

const requirementFacts = [
  {
    title: "Trades",
    body: "One trade or several. Mixed trade and mixed experience requirements are normal — the categories below are the ones MITT works in.",
  },
  {
    title: "Volume",
    body: `The band MITT plans against: ${headcountBands
      .map((band) => band.label)
      .join(" · ")}.`,
  },
  {
    title: "Site",
    body: "Where the work happens — city, plant or project site — and whether the role is site-based or plant-based.",
  },
  {
    title: "Timeline",
    body: `When you need people: ${timelines
      .map((timeline) => timeline.label)
      .join(" · ")}.`,
  },
] as const;

const whatHelps = [
  "Trades needed, with approximate counts per trade",
  "Site or project location, and the type of site",
  "Shift pattern and working conditions",
  "Experience level you actually expect",
  "Employment type and expected duration",
  "When you need people on site",
] as const;

const neverCollected = [
  "Fees of any kind from workers",
  "Passport, visa or emigration documents",
  "Medical records or certificates",
  "Worker registration or candidate profiles",
  "Payment or bank details",
] as const;

/** The first five stages are the ones that decide whether a requirement is workable. */
const transparencyStages = processStages.slice(0, 5);

export default function ForEmployersPage() {
  return (
    <>
      {/* Q&A markup is legitimate here because every question and answer below is
          rendered visibly on this page. Do not copy this to another route. */}
      <JsonLd data={faqPageJsonLd(employerFaqs)} />
      {/* ── 01 — Opening ─────────────────────────────────────────────────── */}
      <PageHero
        id="employers-heading"
        eyebrow="For employers & agencies"
        index="01"
        title="Send the requirement. Get an honest answer."
        lede={`MITT coordinates technical training, skilled-worker screening and interview logistics for industrial employers and staffing agencies working from Visakhapatnam. Describe the requirement and you will get a direct answer about what can realistically be supported. ${scopeCaveat}`}
        cta={{ label: cta.submit, href: "/contact" }}
        secondary={{ label: cta.capabilities, href: "/capabilities" }}
        meta={{ label: "What MITT coordinates", items: serviceLines }}
      />

      {/* ── 02 — What a requirement can include ──────────────────────────── */}
      <Section tone="light" aria-labelledby="requirement-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="requirement-heading"
              eyebrow="What to send"
              index="02"
              tone="light"
              title="Four facts are enough to start."
              lede="You do not need a specification, a job description or a template. These four details decide whether the requirement can be worked on at all."
            />
          </div>

          <div className="lg:col-span-8">
            <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {requirementFacts.map((fact) => (
                <div key={fact.title} className="border-t border-line-ink pt-4">
                  <dt className="flex items-baseline gap-2 font-display text-[1.15rem] font-medium text-text-dark">
                    {fact.title}
                  </dt>
                  <dd className="copy-ink mt-2 text-[0.9375rem]">{fact.body}</dd>
                </div>
              ))}
            </dl>

            <p className="meta mt-10 max-w-[62ch] border-t border-line-ink pt-4 text-steel-ink">
              Anything else — shift pattern, equipment, process, experience level —
              sharpens the first reply, but none of it is required to submit.
            </p>
          </div>
        </div>
      </Section>

      {/* ── 03 — Categories ──────────────────────────────────────────────── */}
      <Section tone="dark" aria-labelledby="categories-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <SectionHeading
              id="categories-heading"
              eyebrow="Capability"
              index="03"
              title="Seven categories, confirmed against a requirement."
              lede="Each category describes the work MITT coordinates in it — not stock that is sitting available."
            />
            <Button href="/capabilities" variant="secondary" className="mt-8">
              Open the capability map
            </Button>
          </div>

          <div className="lg:col-span-8">
            <ul className="border-t border-line">
              {capabilities.map((capability) => (
                <li key={capability.slug} className="border-b border-line py-6">
                  <h3 className="card-title text-ivory">{capability.title}</h3>
                  <p className="copy mt-2 max-w-[54ch] text-[0.9375rem]">
                    {capability.summary}
                  </p>
                  <Link
                    href={`/capabilities#${capability.slug}`}
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[0.85rem] font-medium text-copper-hi transition-colors duration-200 hover:text-ivory"
                  >
                    {capability.title} on the capability map
                    <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.6} />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="meta mt-6 max-w-[62ch] text-steel-hi">{capabilityNote}</p>
          </div>
        </div>
      </Section>

      {/* ── 04 — Process transparency ────────────────────────────────────── */}
      <Section tone="light" aria-labelledby="transparency-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <SectionHeading
              id="transparency-heading"
              eyebrow="Process"
              index="04"
              tone="light"
              title="What actually happens after you send it."
              lede="The first five stages decide whether a requirement is workable. The last three apply only where the requirement calls for them."
            />

            <div className="mt-8 border border-copper/45 bg-copper/[0.07] p-5 sm:p-6">
              <p className="eyebrow text-copy-ink">A distinction we keep</p>
              <p className="copy-ink mt-3 max-w-[48ch]">{processDisambiguation}</p>
            </div>

            <Link
              href="/our-process"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-[0.875rem] font-medium text-text-dark transition-colors duration-200 hover:text-copper-ink"
            >
              See all eight stages
              <ArrowRight aria-hidden="true" size={15} strokeWidth={1.6} />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <ol className="border-t border-line-ink">
              {transparencyStages.map((stage) => (
                <li
                  key={stage.n}
                  className="grid grid-cols-[2.25rem_1fr] gap-x-4 border-b border-line-ink py-5"
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-[0.7rem] font-medium leading-[1.9] tracking-[0.18em] tabular-nums text-copper-ink"
                  >
                    {stage.n}
                  </span>
                  <div>
                    <h3 className="text-[1rem] font-medium leading-snug text-text-dark">
                      {stage.title}
                    </h3>
                    <p className="copy-ink mt-1.5 max-w-[54ch] text-[0.9375rem]">
                      {stage.body}
                    </p>
                    {stage.boundary ? (
                      <p className="meta mt-2 max-w-[52ch] border-l border-copper/50 pl-3 text-steel-ink">
                        {stage.boundary}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Testing is the part of the process an employer feels first: skill is
            assessed on the work before an interview is committed to. */}
        <TestingPanel />
      </Section>

      {/* ── 05 — Engagement model ────────────────────────────────────────── */}
      <Section tone="dark" aria-labelledby="begin-heading">
        <SectionHeading
          id="begin-heading"
          eyebrow="How to begin"
          index="05"
          title="What helps us answer, and what we will never ask for."
          lede="A requirement is reviewed by a person, against what MITT can actually coordinate. There is no queue to buy into and no form that guarantees a reply within a fixed time."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h3 className="eyebrow text-steel-hi">Information that helps</h3>
            <ul className="mt-5 border-t border-line">
              {whatHelps.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-line py-3.5 text-[0.9375rem] text-ivory/90"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-px w-3 shrink-0 bg-copper"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <h3 className="eyebrow text-steel-hi">Never collected through this site</h3>
            <ul className="mt-5 border-t border-line">
              {neverCollected.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-line py-3.5 text-[0.9375rem] text-ivory/90"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-px w-3 shrink-0 bg-steel/70"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="meta mt-5 max-w-[46ch] text-steel-hi">
              This website is a front door, not the recruitment platform. Nothing
              about workers is stored here.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[46ch] text-[0.9375rem] leading-relaxed text-ivory/90">
            Two ways in: submit the requirement, or call{" "}
            <a
              href={telHref}
              className="text-ivory underline decoration-ivory/30 underline-offset-[0.3em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
            >
              {site.phone.display}
            </a>
            .
          </p>
          <Button href="/contact" className="shrink-0">
            {cta.submit}
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
          </Button>
        </div>
      </Section>

      {/* -- Heritage strip: the standing behind the evidence ---------------- */}
      <HeritageLine />

      {/* ── 06 — Credibility, honestly ───────────────────────────────────── */}
      <Section tone="light" aria-labelledby="evidence-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="evidence-heading"
              eyebrow="Evidence"
              index="06"
              tone="light"
              title={evidenceHeading}
              lede={evidenceIntro}
            />
          </div>

          <div className="lg:col-span-7">
            <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {evidencePoints.map((point) => (
                <div key={point.title} className="border-t border-line-ink pt-4">
                  <dt className="text-[0.95rem] font-medium text-text-dark">
                    {point.title}
                  </dt>
                  <dd className="copy-ink mt-2 text-[0.9375rem]">{point.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* ── 07 — FAQ ─────────────────────────────────────────────────────── */}
      <Section tone="dark" aria-labelledby="faq-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <SectionHeading
              id="faq-heading"
              eyebrow="Questions"
              index="07"
              title="Straight answers before you send anything."
              lede="Including the ones where the answer is a limit rather than a benefit."
            />
          </div>

          <div className="lg:col-span-8">
            {/* Native disclosures: keyboard, find-in-page and no-JS all work. */}
            <div className="border-b border-line">
              {employerFaqs.map((faq) => (
                <details key={faq.question} className="group border-t border-line">
                  <summary className="flex min-h-14 cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                    <span
                      role="heading"
                      aria-level={3}
                      className="max-w-[46ch] text-[1.0625rem] font-medium leading-snug text-ivory transition-colors duration-200 group-hover:text-copper-hi"
                    >
                      {faq.question}
                    </span>
                    <Plus
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.6}
                      className="mt-1 shrink-0 text-copper-hi transition-transform duration-200 group-open:rotate-45"
                    />
                  </summary>
                  <p className="copy max-w-[62ch] pb-6 pr-8 text-[0.9375rem]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>

            <p className="meta mt-6 max-w-[56ch] text-steel-hi">
              Something not covered here?{" "}
              <Link
                href="/contact"
                className="text-copper-hi underline decoration-copper/40 underline-offset-[0.25em] transition-colors duration-200 hover:text-ivory"
              >
                Send the requirement
              </Link>{" "}
              and ask directly.
            </p>
          </div>
        </div>
      </Section>

      {/* -- The download: a real document, offered before the ask ------------ */}
      <Section
        tone="light"
        aria-label="Capability brochure"
        className="border-t border-line-ink py-14 sm:py-16"
      >
        <BrochureCard tone="light" headingLevel="h2" />
      </Section>

      <CTABand
        eyebrow="Next step"
        title="Let’s understand your workforce requirement."
        body="Trades, approximate numbers, site and timeline. That is enough for MITT to give you a straight answer."
        primary={{ label: cta.submit, href: "/contact" }}
        secondary={{ label: "See the full process", href: "/our-process" }}
      />
    </>
  );
}
