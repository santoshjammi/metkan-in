import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Section } from "./Section";
import {
  figures,
  figuresHeading,
  figuresIntro,
  placementDisclaimer,
} from "@/content/legacy";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface StatBandProps {
  className?: string;
}

/**
 * The numbers band.
 *
 * CLAIMS DISCIPLINE: `figures` are MITT's own published statements. Each
 * attributed value carries its source note on the cell itself - attribution is
 * never moved to a page footer - and `placementDisclaimer` renders verbatim
 * beneath the band. Nothing here is presented as an independently verified
 * measurement.
 *
 * Composition: ink ground, ivory display values, a copper hairline above every
 * cell, hairline dividers between them. Stacked below 640px so the longest
 * value ("100,000+") never has to shrink to illegibility at 320px.
 */
export function StatBand({ className }: StatBandProps) {
  return (
    <Section
      tone="dark"
      aria-labelledby="figures-heading"
      className={cn("border-t border-line-strong", className)}
    >
      <h2 id="figures-heading" className="eyebrow text-ivory/85">
        <span aria-hidden="true" className="h-px w-8 bg-copper" />
        {figuresHeading}
      </h2>

      <ul className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {figures.map((figure, index) => (
          <li
            key={figure.label}
            className={cn(
              "min-w-0 border-t border-line py-7 sm:py-8 lg:py-9",
              index % 2 === 1 ? "sm:border-l sm:pl-6" : null,
              index > 0 ? "lg:border-l lg:pl-8" : null,
            )}
          >
            <span aria-hidden="true" className="block h-px w-10 bg-copper" />

            <p className="mt-5 whitespace-nowrap font-display text-[clamp(2.4rem,6vw,3.4rem)] font-bold leading-[0.92] tracking-[-0.045em] tabular-nums text-ivory">
              {figure.value}
            </p>

            <p className="mt-4 max-w-[22ch] text-[0.72rem] font-medium uppercase leading-[1.5] tracking-[0.14em] text-ivory/85">
              {figure.label}
            </p>

            {figure.note ? (
              <p className="mt-2 max-w-[24ch] text-[0.78125rem] leading-[1.5] tracking-[0.01em] text-steel-hi">
                {figure.note}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-9 border-t border-line pt-5">
        <p className="meta max-w-[72ch] text-[0.8125rem] leading-[1.6] text-steel-hi">
          {figuresIntro}
        </p>
        <p className="meta mt-3 max-w-[72ch] text-[0.8125rem] leading-[1.6] text-steel">
          <span className="mr-2 font-medium uppercase tracking-[0.12em]">
            Note
          </span>
          {placementDisclaimer}
        </p>
      </div>
    </Section>
  );
}
