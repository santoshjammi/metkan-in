import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cta, scopeCaveat } from "@/content/site";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Section } from "./Section";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CTABandProps {
  eyebrow?: string;
  index?: string;
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}

/**
 * The conversion act. Always copper: the page has been dark for a while and
 * this is the only moment the whole surface goes hot. Buttons invert to ink so
 * the copper ground keeps its value.
 */
export function CTABand({
  eyebrow = "Next step",
  index,
  title = "Let’s understand your workforce requirement.",
  body = scopeCaveat,
  primary = { label: cta.submit, href: "/contact" },
  secondary = { label: cta.speak, href: "/contact" },
  className,
}: CTABandProps) {
  return (
    <Section
      tone="copper"
      className={cn("border-y border-ink/10", className)}
      aria-labelledby="cta-heading"
    >
      <div className="flex items-start justify-between gap-6">
        <p className="eyebrow text-ink/85">
          <span aria-hidden="true" className="h-px w-8 bg-ink/40" />
          {eyebrow}
        </p>
        {index ? (
          <span
            aria-hidden="true"
            className="font-display text-[0.7rem] font-medium tracking-[0.2em] tabular-nums text-ink/85"
          >
            {index}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <h2
          id="cta-heading"
          className="max-w-[20ch] font-display text-h2 font-medium text-ink lg:col-span-7"
        >
          {title}
        </h2>

        <div className="lg:col-span-5">
          <p className="mt-0 max-w-[42ch] text-[1.03125rem] leading-[1.7] text-ink/85">
            {body}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              href={primary.href}
              size="lg"
              className="border-ink bg-ink text-ivory hover:border-graphite hover:bg-graphite"
            >
              {primary.label}
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
            </Button>
            <Button
              href={secondary.href}
              variant="secondary"
              size="lg"
              className="border-ink/60 text-ink hover:border-ink hover:bg-ink/10"
            >
              {secondary.label}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
