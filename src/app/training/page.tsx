import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CTABand } from "@/components/marketing/CTABand";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { PageHero } from "@/components/marketing/PageHero";
import { ProgrammeList } from "@/components/marketing/ProgrammeList";
import { Section } from "@/components/marketing/Section";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { trainingFaqs } from "@/content/faqs";
import {
  facilityCaption,
  facilityHeadline,
  facilityIntro,
  facilityPhotos,
  facilityPoints,
} from "@/content/facility";
import { programmeIntro, programmeNote } from "@/content/programmes";
import { cta } from "@/content/site";
import { seoCopy } from "@/content/seo";
import {
  breadcrumbJsonLd,
  buildMetadata,
  courseListJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: seoCopy.training.title,
  description: seoCopy.training.description,
  path: seoCopy.training.path,
  absoluteTitle: true,
});

/**
 * The workshop overview is the only facility photograph used here. It is a
 * genuine 486x567 photograph, so the plate is capped at its native width and
 * `unoptimized` keeps the optimiser from generating a wider derivative.
 */
const workshopPhoto = facilityPhotos.find((photo) =>
  photo.src.endsWith("/workshop-overview.jpg"),
);

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
      {/* The five programmes are rendered in section 01 with their summary,
          duration, level band and skills - which is exactly what this markup
          restates. No certificate, fee or intake date is claimed. */}
      <JsonLd id="training-courses" data={courseListJsonLd()} />

      <PageHero
        eyebrow="Training"
        title="Training is the front half of hiring."
        answer={seoCopy.training.answer}
        reviewed
        lede="Five programmes taught in a working workshop: welding, pipe fitting and structural fabrication, for beginners, working professionals and people upskilling in a new process."
        cta={{ label: cta.primaryShort, href: "/contact" }}
        secondary={{ label: "See the trade categories", href: "/capabilities" }}
        meta={{
          label: "On this page",
          items: [
            "The five programmes",
            "The workshop and booths",
            "What is not claimed",
            "Questions employers ask",
          ],
        }}
      />

      {/* -- 01 -- The five published programmes --------------------------- */}
      <Section tone="light" aria-labelledby="programmes-heading">
        <SectionHeading
          id="programmes-heading"
          eyebrow="Programmes"
          index="01"
          tone="light"
          title="Five programmes, taught in a working workshop."
          lede={programmeIntro}
        />

        <ProgrammeList tone="light" />

        <p className="copy-ink mt-8 max-w-[70ch] border-l-2 border-copper pl-4">
          {programmeNote}
        </p>
      </Section>

      {/* -- 02 -- The facility the training actually runs in --------------- */}
      <Section tone="graphite" aria-labelledby="facility-heading">
        <SectionHeading
          id="facility-heading"
          eyebrow="Facility"
          index="02"
          title={facilityHeadline}
          lede={facilityIntro}
        />

        <div className="mt-10 grid gap-10 border-t border-line pt-8 lg:grid-cols-12 lg:gap-12">
          {workshopPhoto ? (
            <figure className="lg:col-span-5">
              <div
                className="w-full border border-line bg-graphite-2"
                style={{ maxWidth: workshopPhoto.nativeWidth }}
              >
                <Image
                  src={workshopPhoto.src}
                  alt={workshopPhoto.alt}
                  width={workshopPhoto.width}
                  height={workshopPhoto.height}
                  unoptimized
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="meta mt-3 max-w-[46ch] text-steel-hi">
                <span className="block">{workshopPhoto.caption}</span>
                {facilityCaption}
              </figcaption>
            </figure>
          ) : null}

          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="grid gap-6">
              {facilityPoints.map((point, index) => (
                <li key={point.title} className="border-t border-line pt-5">
                  <div className="flex items-baseline gap-3">
                    <span
                      aria-hidden="true"
                      className="font-display text-[0.7rem] font-medium tracking-[0.18em] tabular-nums text-copper-hi"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-[1.05rem] font-medium leading-snug text-ivory">
                      {point.title}
                    </h3>
                  </div>
                  <p className="copy mt-2 max-w-[52ch] text-[0.95rem]">
                    {point.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* -- 03 -- Questions, and what is not claimed ---------------------- */}
      <Section tone="dark" aria-labelledby="training-questions-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="training-questions-heading"
              eyebrow="Questions"
              index="03"
              title="What employers ask about training."
            />
            <div className="mt-8 border border-copper/40 bg-copper/[0.06] p-5">
              <p className="eyebrow text-copper-hi">What is not claimed</p>
              <p className="copy mt-3 text-[0.95rem]">
                No certification, affiliation or accreditation is claimed, and no
                intake date or fee is published here. Those are confirmed with
                MITT directly.
              </p>
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

      <CTABand index="04" />
    </>
  );
}
