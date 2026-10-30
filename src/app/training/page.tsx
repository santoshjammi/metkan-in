import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTABand } from "@/components/marketing/CTABand";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { trainingFaqs } from "@/content/faqs";
import { cta } from "@/content/site";
import { trainingAreas, trainingImage, trainingIntro, trainingNote } from "@/content/training";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Training & preparation",
  description:
    "Practical training and preparation at MITT in Visakhapatnam: workshop skill development, welding preparation, workplace practices, safety orientation and employer-specific preparation.",
  path: "/training",
});

export default function TrainingPage() {
  return (
    <>
      <JsonLd
        id="training-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Training", path: "/training" },
        ])}
      />

      {/* The full `trainingIntro` opens the body act below, where there is room
          for it; the hero carries the short form so the two do not repeat. */}
      <PageHero
        eyebrow="Training"
        title="Training is the front half of hiring."
        lede="Practical preparation for the trades an employer actually needs, aligned to how a site or shop floor runs."
        cta={{ label: cta.primaryShort, href: "/contact" }}
        secondary={{ label: "See the trade categories", href: "/capabilities" }}
        meta={{
          label: "On this page",
          items: [
            "Six preparation areas",
            "The workshop setting",
            "What is not claimed",
            "Questions employers ask",
          ],
        }}
      />

      {/* ── 01 — Preparation areas ───────────────────────────────────────── */}
      <Section tone="light" aria-labelledby="preparation-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="preparation-heading"
              eyebrow="Preparation"
              index="01"
              tone="light"
              title="Six areas of practical preparation."
              lede={trainingIntro}
            />
            <p className="copy-ink mt-4 max-w-[40ch] text-[0.95rem]">
              Each area is aligned to what an employer’s process and site
              actually require, not to a fixed syllabus published in advance.
            </p>
          </div>

          <figure className="lg:col-span-7">
            <div className="relative overflow-hidden border border-line-ink">
              <Image
                src={trainingImage.src}
                alt={trainingImage.alt}
                width={trainingImage.width}
                height={trainingImage.height}
                sizes="(min-width: 1240px) 700px, (min-width: 1024px) 58vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Required disclosure: the image is not a MITT facility photograph. */}
            <figcaption className="meta mt-3 flex items-start gap-2 text-steel-ink">
              <span
                aria-hidden="true"
                className="mt-[0.55rem] h-px w-4 shrink-0 bg-copper-ink"
              />
              {trainingImage.disclosure}
            </figcaption>
          </figure>
        </div>

        <ol className="mt-12 grid gap-x-10 gap-y-8 border-t border-line-ink pt-8 md:grid-cols-2 lg:grid-cols-3">
          {trainingAreas.map((area, index) => (
            <li key={area.title}>
              <span
                aria-hidden="true"
                className="font-display text-[0.72rem] font-medium tracking-[0.18em] tabular-nums text-copper-ink"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-display text-[1.1rem] font-medium leading-snug text-text-dark">
                {area.title}
              </h3>
              <p className="copy-ink mt-2 text-[0.95rem]">{area.body}</p>
            </li>
          ))}
        </ol>

        <p className="copy-ink mt-10 max-w-[64ch] border-t border-line-ink pt-6">
          Preparation is scheduled where a requirement justifies it — it is part
          of stage 06 of{" "}
          <Link
            href="/our-process"
            className="link-line text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em]"
          >
            the engagement process
          </Link>
          , not a separate enrolment.
        </p>
      </Section>

      {/* ── 02 — Questions, and what is not claimed ──────────────────────── */}
      <Section tone="dark" aria-labelledby="training-questions-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="training-questions-heading"
              eyebrow="Questions"
              index="02"
              title="What employers ask about training."
            />
            <div className="mt-8 border border-copper/40 bg-copper/[0.06] p-5">
              <p className="eyebrow text-copper-hi">What is not claimed</p>
              <p className="copy mt-3 text-[0.95rem]">{trainingNote}</p>
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <FAQAccordion items={trainingFaqs} tone="dark" />

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="meta max-w-[34ch] text-steel-hi">
                Requirements, numbers and timelines can be discussed before
                anything is scheduled.
              </p>
              <Button href="/contact" size="md" className="shrink-0">
                {cta.primary}
                <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <CTABand index="03" />
    </>
  );
}
