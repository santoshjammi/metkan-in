import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ArcGlow } from "@/components/cinematic/ArcGlow";
import { GrainOverlay } from "@/components/cinematic/GrainOverlay";
import { HeroMedia } from "@/components/cinematic/HeroMedia";
import { Reveal } from "@/components/cinematic/Reveal";
import { RevealObserver } from "@/components/cinematic/RevealObserver";
import { Button } from "@/components/ui/Button";
import { CTABand } from "@/components/marketing/CTABand";
import { CapabilityGrid } from "@/components/marketing/CapabilityGrid";
import {
  EditorialPanels,
  type EditorialPanelItem,
} from "@/components/marketing/EditorialPanels";
import { EvidencePanel } from "@/components/marketing/EvidencePanel";
import { ProcessTimeline } from "@/components/marketing/ProcessTimeline";
import { Section } from "@/components/marketing/Section";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { TrainingPanel } from "@/components/marketing/TrainingPanel";
import { evidenceHeading, evidenceIntro } from "@/content/evidence";
import {
  processCaveat,
  processDisambiguation,
  processStages,
} from "@/content/process";
import { trainingIntro } from "@/content/training";
import { cta, site } from "@/content/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Hero words are split only so each can rise inside its own mask. */
const heroWords = site.heroHeadline.split(" ");

const heroEyebrow = ["Technical training", "Skilled workforce", site.city].join(
  " · ",
);

/* Panel bodies are lifted verbatim from approved content — no new claims. */
const technicalSkillsBody =
  processStages.find((stage) => stage.n === "03")?.body ?? site.positioning;

const editorialPanels: EditorialPanelItem[] = [
  { n: "01", title: "Technical skills", body: technicalSkillsBody },
  { n: "02", title: "Workforce coordination", body: site.positioning },
  { n: "03", title: "Opportunity readiness", body: site.brandLine },
];

export default function HomePage() {
  return (
    <>
      {/* One shared client island drives every entrance on this page. It also
          owns the reveal CSS, so nothing here depends on an animation runtime. */}
      <RevealObserver />

      {/* ── Act 1 — Hero ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden bg-ink"
      >
        <HeroMedia className="absolute inset-0 -z-10 h-full w-full object-cover object-[58%_center]" />

        {/* One horizontal scrim, dense behind the headline and open over the
            welder, plus a short bottom fade into the ivory act below. */}
        <div aria-hidden="true" className="hero-scrim" />
        <div aria-hidden="true" className="hero-scrim-fade" />

        <ArcGlow className="-z-10 -right-[18%] top-0 h-[58vh] w-[112vw] max-w-[880px] lg:right-[2%] lg:top-[4%] lg:h-[70vh] lg:w-[58vw]" />
        <GrainOverlay className="-z-10" />

        <div className="shell relative pb-14 pt-24 md:pb-20 md:pt-32">
          <div className="max-w-[52rem]">
            <p className="eyebrow hero-rise text-ivory/70">
              <span aria-hidden="true" className="h-px w-8 bg-copper" />
              {heroEyebrow}
            </p>

            <h1
              id="hero-heading"
              className="mt-5 max-w-[14ch] font-display text-display font-bold text-ivory sm:mt-6 sm:max-w-[15ch]"
            >
              {heroWords.map((word, index) => (
                <span key={`${word}-${index}`}>
                  <span className="word-mask">
                    <span style={{ animationDelay: `${index * 40}ms` }}>
                      {word}
                    </span>
                  </span>
                  {index < heroWords.length - 1 ? " " : null}
                </span>
              ))}
            </h1>

            <p
              className="hero-rise copy mt-6 max-w-[46ch] text-ivory/85"
              style={{ animationDelay: "300ms" }}
            >
              {site.heroSupport}
            </p>

            <div
              className="hero-rise mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              style={{ animationDelay: "420ms" }}
            >
              <Button href="/contact" size="lg">
                {cta.primary}
                <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
              </Button>
              <Button href="/capabilities" variant="secondary" size="lg">
                {cta.capabilities}
              </Button>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 right-8 hidden flex-col items-center gap-3 lg:flex"
        >
          <span className="text-[0.58rem] uppercase tracking-[0.3em] text-steel [writing-mode:vertical-rl]">
            Scroll
          </span>
          <span className="h-10 w-px bg-copper/50" />
        </div>
      </section>

      {/* ── Act 2 — The people behind industry ───────────────────────────── */}
      <Section tone="light" aria-labelledby="people-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="people-heading"
              eyebrow="The people behind industry"
              index="02"
              tone="light"
              title="Every successful project starts with the people who make it possible."
            />
            <p className="meta mt-8 max-w-[36ch] border-t border-line-ink pt-4 text-steel-ink">
              {site.positioning}
            </p>
          </div>
          <div className="lg:col-span-7">
            <Reveal>
              <EditorialPanels items={editorialPanels} />
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ── Act 3 — Capabilities ─────────────────────────────────────────── */}
      <Section tone="dark" aria-labelledby="capabilities-heading">
        <SectionHeading
          id="capabilities-heading"
          eyebrow="Capabilities"
          index="03"
          title="Trades we coordinate against employer requirements."
        />
        <CapabilityGrid className="mt-12" />
      </Section>

      {/* ── Act 4 — Process ──────────────────────────────────────────────── */}
      <Section tone="light" aria-labelledby="process-heading">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Sticky rail: travels with the timeline, releases at the last stage.
              Static flow below 1024px, where the timeline is already stacked. */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <SectionHeading
              id="process-heading"
              eyebrow="How an engagement works"
              index="04"
              tone="light"
              title="Eight stages, each with a stated limit."
              lede={processCaveat}
            />

            <div className="mt-8 border border-copper/45 bg-copper/[0.07] p-5 sm:p-6">
              <p className="eyebrow text-copy-ink">A distinction we keep</p>
              <p className="copy-ink mt-3 max-w-[52ch]">
                {processDisambiguation}
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ProcessTimeline tone="light" />
          </div>
        </div>
      </Section>

      {/* ── Act 5 — Training ─────────────────────────────────────────────── */}
      <Section tone="dark" aria-labelledby="training-heading">
        <SectionHeading
          id="training-heading"
          eyebrow="Training"
          index="05"
          title="Training and preparation."
          lede={trainingIntro}
        />
        <TrainingPanel tone="dark" />

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.75rem] uppercase tracking-[0.16em] text-steel-hi">
            Have a requirement to discuss?
          </p>
          <Button href="/contact" className="w-full sm:w-auto">
            {cta.primary}
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
          </Button>
        </div>
      </Section>

      {/* ── Act 6 — Evidence ─────────────────────────────────────────────── */}
      <Section tone="light" aria-labelledby="evidence-heading">
        <SectionHeading
          id="evidence-heading"
          eyebrow="Evidence"
          index="06"
          tone="light"
          title={evidenceHeading}
          lede={evidenceIntro}
        />
        <EvidencePanel tone="light" />
      </Section>

      {/* ── Act 7 — Conversion ───────────────────────────────────────────── */}
      <CTABand index="07" />
    </>
  );
}
