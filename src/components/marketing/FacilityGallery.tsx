import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import {
  facilityCaption,
  facilityHeadline,
  facilityIntro,
  facilityPhotos,
} from "@/content/facility";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FacilityGalleryProps {
  /** Editorial act number, rendered by SectionHeading. */
  index?: string;
  className?: string;
}

/**
 * Real photographs of the facility.
 *
 * IMAGE RULE: these are genuine working photographs at 363-486px native width.
 * Every frame is declared at its own width/height, capped with `maxWidth` so the
 * layout can never exceed the native width, and `sizes` is tuned to the column it
 * actually occupies so a larger file is never requested. No full-bleed, no
 * upscale, no `object-cover` crop that would imply more detail than exists.
 *
 * Light tone by design: these are bright documentary images and read badly on
 * ink. Captions are per-frame; `facilityCaption` explains what the strip is.
 */
export function FacilityGallery({ index, className }: FacilityGalleryProps) {
  return (
    <Section
      tone="light"
      aria-labelledby="facility-heading"
      className={cn("border-y border-line-ink bg-ivory-2", className)}
    >
      <SectionHeading
        id="facility-heading"
        eyebrow="The facility"
        index={index}
        tone="light"
        title={facilityHeadline}
        lede={facilityIntro}
      />

      <ul className="mt-12 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-x-6">
        {facilityPhotos
          // The training act above already shows the booth-aisle photograph with
          // the same caption. Repeating it here would look like a mistake, so the
          // gallery carries the remaining facility evidence instead.
          .filter((photo) => !photo.src.endsWith("/booths-aisle.jpg"))
          .map((photo) => (
          <li key={photo.src}>
            <figure>
              {/* Uniform 4:3 frames so the row reads as one designed strip instead
                  of three ragged aspect ratios. object-cover crops rather than
                  scales: no photograph is upscaled past its native width. */}
              <div className="aspect-[4/3] w-full overflow-hidden border border-line-ink bg-ivory">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  /* These sources are already small (363-486px). Running them through
                     the optimizer resamples them down and the result reads soft at
                     display size, so the original file is served untouched. */
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="meta mt-3 max-w-[34ch] border-t border-line-ink pt-2.5 text-[0.78125rem] leading-[1.5] text-steel-ink">
                {photo.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col gap-4 border-t border-line-ink pt-5 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="meta max-w-[64ch] text-[0.78125rem] leading-[1.55] text-steel-ink">
          {facilityCaption}
        </p>
        <Link
          href="/about"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[0.875rem] font-medium text-text-dark transition-colors duration-200 hover:text-copper-ink"
        >
          See the facility
          <ArrowRight aria-hidden="true" size={14} strokeWidth={1.6} />
        </Link>
      </div>
    </Section>
  );
}
