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
  processCaveat,
  processDisambiguation,
  processStages,
} from "@/content/process";
import { cta } from "@/content/site";
import { seoCopy } from "@/content/seo";
import { breadcrumbJsonLd, buildMetadata, howToJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: seoCopy.process.title,
  description: seoCopy.process.description,
  path: seoCopy.process.path,
  absoluteTitle: true,
});

/**
 * `processCaveat` states that stages 06–08 apply only where the requirement
 * calls for them. They are flagged as optional from that one approved fact.
 */
const optionalStages = new Set(["06", "07", "08"]);

export default function OurProcessPage() {
  return (
    <>
      <JsonLd
        id="process-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Our process", path: "/our-process" },
        ])}
      />
      {/* The eight stages, their titles and their bodies are rendered in
          section 01. The steps restate them; nothing new is described. */}
      <JsonLd id="process-howto" data={howToJsonLd()} />

      <PageHero
        eyebrow="How an engagement works"
        title="Eight stages, each with a stated limit."
        answer={seoCopy.process.answer}
        reviewed
        lede={processCaveat}
        cta={{ label: cta.primaryShort, href: "/contact" }}
        secondary={{ label: "See the trade categories", href: "/capabilities" }}
        meta={{
          label: "On this page",
          items: [
            "The distinction we keep",
            "Eight stages",
            "Which stages are optional",
            "Where the decision sits",
          ],
        }}
      />

      {/* ── 01 — The disambiguation, given the weight it deserves ────────── */}
      <Section tone="light" aria-labelledby="stages-heading">
        <div className="border border-copper/55 bg-copper/[0.08] p-6 md:p-9">
          <p className="eyebrow text-copper-ink">
            <span aria-hidden="true" className="h-px w-8 bg-copper" />
            A distinction we keep
          </p>
          <p className="mt-4 max-w-[44ch] font-display text-[clamp(1.35rem,2.4vw,1.95rem)] font-medium leading-[1.28] text-text-dark">
            {processDisambiguation}
          </p>
          <p className="copy-ink mt-4 max-w-[62ch] text-[0.95rem]">
            It is why each stage below states what has actually happened at that
            point, and what has not.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="stages-heading"
              eyebrow="The eight stages"
              index="01"
              tone="light"
              title="From first enquiry to a confirmed outcome."
            />
            <p className="copy-ink mt-6 max-w-[42ch] text-[0.95rem]">
              Stages 06–08 are optional: they apply only where the requirement
              calls for them.
            </p>
          </div>

          <div className="lg:col-span-8">
            <ol className="border-t border-line-ink">
              {processStages.map((stage) => {
                const optional = optionalStages.has(stage.n);

                return (
                  <li
                    key={stage.n}
                    className="grid gap-4 border-b border-line-ink py-7 md:grid-cols-12 md:gap-6"
                  >
                    <div className="flex items-center gap-3 md:col-span-3 md:flex-col md:items-start md:gap-2">
                      <span
                        aria-hidden="true"
                        className="font-display text-[0.8rem] font-medium tracking-[0.18em] tabular-nums text-copper-ink"
                      >
                        {stage.n}
                      </span>
                      {optional ? (
                        <Badge tone="ink">
                          Optional
                          <span className="sr-only">
                            : only where the requirement calls for it
                          </span>
                        </Badge>
                      ) : null}
                    </div>

                    <div className="md:col-span-9">
                      <h3 className="font-display text-h3 font-medium text-text-dark">
                        {stage.title}
                      </h3>
                      <p className="copy-ink mt-3">{stage.body}</p>

                      {stage.boundary ? (
                        <p className="mt-4 max-w-[56ch] border-l-2 border-copper/55 pl-4 text-[0.9375rem] leading-[1.7] text-copy-ink">
                          <span className="font-medium text-text-dark">
                            Limit of this stage:{" "}
                          </span>
                          {stage.boundary}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </Section>

      {/* ── 02 — Where the decision sits ─────────────────────────────────── */}
      <Section tone="dark" aria-labelledby="decision-heading">
        <SectionHeading
          id="decision-heading"
          eyebrow="Responsibility"
          index="02"
          title="MITT coordinates the process. The decision stays with the employer."
        />

        <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-3 md:gap-10">
          <div>
            <h3 className="font-display text-[1.05rem] font-medium text-ivory">
              Your team decides
            </h3>
            <p className="copy mt-2 text-[0.95rem]">
              Candidates are assessed and selected by the employer. MITT
              coordinates logistics and communicates outcomes.
            </p>
          </div>
          <div>
            <h3 className="font-display text-[1.05rem] font-medium text-ivory">
              Separate events stay separate
            </h3>
            <p className="copy mt-2 text-[0.95rem]">
              Interview, selection, medical clearance, documentation and joining
              are distinct events, and are reported as distinct events.
            </p>
          </div>
          <div>
            <h3 className="font-display text-[1.05rem] font-medium text-ivory">
              Where this connects
            </h3>
            <p className="copy mt-2 text-[0.95rem]">
              Trade scope sits in{" "}
              <Link
                href="/capabilities"
                className="text-ivory underline decoration-line-strong decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-hi"
              >
                capabilities
              </Link>
              ; preparation for a selected trade sits in{" "}
              <Link
                href="/training"
                className="text-ivory underline decoration-line-strong decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-hi"
              >
                training
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="meta max-w-[44ch] text-steel-hi">{processCaveat}</p>
          <Button href="/contact" size="md" className="shrink-0">
            Start a conversation
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
          </Button>
        </div>
      </Section>

      <CTABand index="03" />
    </>
  );
}
