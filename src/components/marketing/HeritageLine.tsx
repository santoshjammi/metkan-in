import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Section } from "./Section";
import { legacy } from "@/content/legacy";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type HeritageLineTone = "graphite" | "light";

const toneClasses: Record<
  HeritageLineTone,
  { eyebrow: string; rule: string; title: string; body: string; meta: string; edge: string }
> = {
  graphite: {
    eyebrow: "text-copper-hi",
    rule: "border-copper",
    title: "text-ivory",
    body: "copy",
    meta: "text-steel-hi",
    edge: "border-line",
  },
  light: {
    eyebrow: "text-copper-ink",
    rule: "border-copper-ink",
    title: "text-text-dark",
    body: "copy-ink",
    meta: "text-steel-ink",
    edge: "border-line-ink",
  },
};

export interface HeritageLineProps {
  tone?: HeritageLineTone;
  className?: string;
}

/**
 * The single strongest trust fact, as a quiet strip rather than an act: MITT is
 * the former St. Patrick Welding Institute and has worked the same trade in the
 * same place for more than 23 years. Everything comes from MITT's own published
 * material, hence the attribution line.
 *
 * Composition is a copper rule down the left edge of the statement column - the
 * only ornament - with display heading at h3 scale so it reads as a passage,
 * not a headline.
 */
export function HeritageLine({ tone = "graphite", className }: HeritageLineProps) {
  const t = toneClasses[tone];

  return (
    <Section
      tone={tone}
      aria-labelledby="heritage-heading"
      className={cn("py-12 sm:py-14 lg:py-16", t.edge, "border-y", className)}
    >
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <p className={cn("eyebrow self-start lg:col-span-4", t.eyebrow)}>
          <span aria-hidden="true" className="h-px w-8 bg-copper" />
          {legacy.eyebrow}
        </p>

        <div className={cn("border-l pl-5 sm:pl-7 lg:col-span-8", t.rule)}>
          <h2
            id="heritage-heading"
            className={cn(
              "max-w-[26ch] font-display text-h3 font-medium",
              t.title,
            )}
          >
            {legacy.heading}
          </h2>

          {legacy.body.map((paragraph) => (
            <p key={paragraph} className={cn("mt-4 max-w-[56ch]", t.body)}>
              {paragraph}
            </p>
          ))}

          <p className={cn("meta mt-5 text-[0.78125rem] leading-[1.55]", t.meta)}>
            {legacy.attribution}
          </p>
        </div>
      </div>
    </Section>
  );
}
