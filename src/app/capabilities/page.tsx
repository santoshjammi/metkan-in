import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CTABand } from "@/components/marketing/CTABand";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  capabilities,
  capabilityNote,
  type Capability,
} from "@/content/capabilities";
import { cta } from "@/content/site";
import { seoCopy } from "@/content/seo";
import {
  breadcrumbJsonLd,
  buildMetadata,
  serviceJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: seoCopy.capabilities.title,
  description: seoCopy.capabilities.description,
  path: seoCopy.capabilities.path,
  absoluteTitle: true,
});

/**
 * Every category ships as `confirm-required`, so the status note is the honest
 * default. It is a quiet hairline note, never a green or copper "available"
 * badge: listing a category is not a claim of current supply.
 */
const statusNotes: Record<Capability["availability"], string> = {
  "confirm-required":
    "Availability confirmed per requirement. MITT reviews the specific requirement before confirming whether candidates can be supported in this category — this listing is not a claim of current supply.",
  confirmed:
    "Availability for this category is confirmed against a specific requirement. Scope is still agreed with MITT before anything is planned around it.",
};

const nextSteps = [
  {
    n: "01",
    title: "Describe the requirement",
    body: "Trades, approximate numbers, site location and timeline. Any format is enough to start.",
  },
  {
    n: "02",
    title: "Scope is clarified",
    body: "Experience level, shift and site conditions are confirmed — the detail that decides whether a candidate is genuinely suitable.",
  },
  {
    n: "03",
    title: "Availability is confirmed",
    body: "MITT answers honestly for that requirement, including when a category cannot be supported.",
  },
];

function AvailabilityNote({
  availability,
}: {
  availability: Capability["availability"];
}) {
  const isConfirmed = availability === "confirmed";

  return (
    <div className="mt-5 flex max-w-[52ch] items-start gap-3 border-l border-copper/45 pl-3.5">
      <span
        aria-hidden="true"
        className={
          isConfirmed
            ? "mt-[0.6rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-ivory/70"
            : "mt-[0.6rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-copper-hi"
        }
      />
      <p className="meta text-steel-hi">
        <span className="sr-only">Availability: </span>
        {statusNotes[availability]}
      </p>
    </div>
  );
}

function CapabilityEntry({
  capability,
  index,
}: {
  capability: Capability;
  index: number;
}) {
  return (
    /* Deep links from the homepage and /for-employers land here. `globals.css`
       already sets `scroll-padding-top: 6rem` (96px), which clears the fixed
       header on its own; scroll-mt-4 adds 16px of air on top of that, so an
       entry lands 112px from the top edge — header 80px + 32px breathing. */
    <article
      id={capability.slug}
      className="scroll-mt-4 border-t border-line pt-9 md:pt-11"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="flex items-baseline gap-3">
            <span
              aria-hidden="true"
              className="font-display text-[0.75rem] font-medium leading-none tracking-[0.18em] tabular-nums text-copper-hi"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="card-title text-ivory">{capability.title}</h3>
          </div>

          <p className="copy mt-4 max-w-[46ch]">{capability.summary}</p>

          <AvailabilityNote availability={capability.availability} />

          <Link
            href="/contact"
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-[0.875rem] font-medium text-ivory/90 transition-colors duration-200 hover:text-copper-hi"
          >
            Discuss a {capability.title.toLowerCase()} requirement
            <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.6} />
          </Link>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="eyebrow text-steel-hi">Skill examples</p>
          <ul className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {capability.skills.map((skill) => (
              <li
                key={skill}
                className="flex items-baseline gap-3 border-b border-line py-2.5 text-[0.95rem] leading-snug text-ivory/90"
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-1 shrink-0 translate-y-[-0.15em] bg-copper-hi"
                />
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default function CapabilitiesPage() {
  return (
    <>
      <JsonLd
        id="capabilities-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Capabilities", path: "/capabilities" },
        ])}
      />
      {/* Every name and description below is rendered on this page: the seven
          categories in section 02, with their skills and availability note. */}
      <JsonLd id="capabilities-service" data={serviceJsonLd()} />

      <PageHero
        eyebrow="Capabilities"
        title="Seven trade categories, one honest status."
        answer={seoCopy.capabilities.answer}
        reviewed
        lede="What MITT coordinates, what it assesses in each trade, and what is actually confirmed before an employer plans around it."
        cta={{ label: cta.primaryShort, href: "/contact" }}
        secondary={{ label: "See the eight stages", href: "/our-process" }}
        meta={{
          label: "On this page",
          items: [
            "Seven trade categories",
            "Availability status",
            "Skill examples per category",
            "How to discuss a requirement",
          ],
        }}
      />

      {/* ── 01 — How availability actually works ─────────────────────────── */}
      <Section tone="light" aria-labelledby="availability-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <SectionHeading
              id="availability-heading"
              eyebrow="Availability"
              index="01"
              tone="light"
              title="A category is a capability, not a stock position."
              lede="Every category on this page carries the same status today. Nothing is presented as currently available, because MITT confirms supply against a real requirement rather than publishing a general claim."
            />
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <ol className="border-t border-line-ink">
              {nextSteps.map((step) => (
                <li
                  key={step.n}
                  className="border-b border-line-ink py-5 first:pt-5"
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      aria-hidden="true"
                      className="font-display text-[0.72rem] font-medium tracking-[0.18em] tabular-nums text-copper-ink"
                    >
                      {step.n}
                    </span>
                    <h3 className="font-display text-[1.05rem] font-medium leading-snug text-text-dark">
                      {step.title}
                    </h3>
                  </div>
                  <p className="copy-ink mt-2 pl-8 text-[0.95rem]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
            <p className="meta mt-5 text-steel-ink">
              Preparation sits alongside this: see{" "}
              <Link
                href="/training"
                className="link-line text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em]"
              >
                training and preparation
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      {/* ── 02 — The seven categories ────────────────────────────────────── */}
      <Section tone="dark" aria-labelledby="categories-heading">
        <SectionHeading
          id="categories-heading"
          eyebrow="Trade categories"
          index="02"
          title="What each category covers."
          lede="Skills are listed because they define what a screening conversation tests — not because a candidate with every one of them is waiting."
        />

        <div className="mt-10 md:mt-12">
          {capabilities.map((capability, index) => (
            <CapabilityEntry
              key={capability.slug}
              capability={capability}
              index={index}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[58ch]">
            <Badge tone="steel">How to read this page</Badge>
            <p className="copy mt-3">{capabilityNote}</p>
          </div>
          <Button href="/contact" size="md" className="shrink-0">
            {cta.primary}
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
          </Button>
        </div>
      </Section>

      <CTABand index="03" />
    </>
  );
}
