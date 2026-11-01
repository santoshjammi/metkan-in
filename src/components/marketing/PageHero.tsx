import { ArrowRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { ReviewNote } from "@/components/seo/ReviewNote";
import { Button } from "@/components/ui/Button";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type PageHeroTone = "dark" | "graphite" | "light";

interface ToneClasses {
  section: string;
  glow: string;
  eyebrow: string;
  index: string;
  rule: string;
  title: string;
  lede: string;
  metaLabel: string;
  metaItem: string;
  metaDivide: string;
  secondary: string;
}

const toneClasses: Record<PageHeroTone, ToneClasses> = {
  dark: {
    section: "border-line bg-ink text-ivory",
    /* One soft arc light, top-left, resting before the act begins. */
    glow: "bg-[radial-gradient(120%_100%_at_12%_0%,rgba(200,117,57,0.17),rgba(11,15,19,0)_62%)]",
    eyebrow: "text-steel-hi",
    index: "text-copper-hi",
    rule: "bg-copper",
    title: "text-ivory",
    lede: "copy text-ivory/85",
    metaLabel: "text-steel-hi",
    metaItem: "text-ivory/85",
    metaDivide: "divide-line",
    secondary: "",
  },
  graphite: {
    section: "border-line bg-graphite text-ivory",
    glow: "bg-[radial-gradient(120%_100%_at_12%_0%,rgba(200,117,57,0.13),rgba(23,29,35,0)_62%)]",
    eyebrow: "text-steel-hi",
    index: "text-copper-hi",
    rule: "bg-copper",
    title: "text-ivory",
    lede: "copy text-ivory/85",
    metaLabel: "text-steel-hi",
    metaItem: "text-ivory/85",
    metaDivide: "divide-line",
    secondary: "",
  },
  light: {
    section: "border-line-ink bg-ivory text-text-dark",
    glow: "bg-[radial-gradient(120%_100%_at_12%_0%,rgba(200,117,57,0.12),rgba(245,242,234,0)_62%)]",
    eyebrow: "text-steel-ink",
    index: "text-copper-ink",
    rule: "bg-copper",
    title: "text-text-dark",
    lede: "copy-ink",
    metaLabel: "text-steel-ink",
    metaItem: "text-copy-ink",
    metaDivide: "divide-line-ink",
    secondary:
      "border-text-dark/40 text-text-dark hover:border-text-dark hover:bg-text-dark/5",
  },
};

export interface PageHeroMeta {
  /** Accessible name for the aside, e.g. "On this page". */
  label: string;
  items: readonly string[];
}

export interface PageHeroProps {
  /** Id applied to the h1 and used as the section's accessible name. */
  id?: string;
  eyebrow: string;
  /** Editorial act numeral, top-right, matching the homepage section heads. */
  index?: string;
  title: string;
  lede?: string;
  /**
   * 40-60 word direct answer to the page's own question. Rendered as the first
   * paragraph under the h1, before the lede, so an answer engine can lift it.
   */
  answer?: string;
  /** Show the site-wide editorial review line under the hero copy. */
  reviewed?: boolean;
  cta?: { label: string; href: string };
  secondary?: { label: string; href: string };
  meta?: PageHeroMeta;
  tone?: PageHeroTone;
  className?: string;
}

/**
 * Inner-page hero: an act curtain, not a landing screen.
 *
 * Height is a floor (42svh), not a fixed box — the content sets the real
 * height on small screens, so nothing is ever clipped and there is no empty
 * full-screen band. Server component: the h1 is in the first HTML response.
 */
export function PageHero({
  id = "page-heading",
  eyebrow,
  index,
  title,
  lede,
  answer,
  reviewed = false,
  cta,
  secondary,
  meta,
  tone = "dark",
  className,
}: PageHeroProps) {
  const t = toneClasses[tone];
  /** Both surfaces share one text tone: ivory on ink/graphite, ink on ivory. */
  const textTone = tone === "light" ? "light" : "dark";

  return (
    <section
      aria-labelledby={id}
      className={cn(
        "relative isolate overflow-hidden border-b",
        t.section,
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 -z-10", t.glow)}
      />

      <div className="shell flex min-h-[42svh] flex-col justify-end pb-11 pt-26 md:min-h-[44svh] md:pb-14 md:pt-32">
        <div className="flex items-start justify-between gap-6">
          <p className={cn("eyebrow", t.eyebrow)}>
            <span aria-hidden="true" className={cn("h-px w-8", t.rule)} />
            {eyebrow}
          </p>
          {index ? (
            <span
              aria-hidden="true"
              className={cn(
                "font-display text-[0.7rem] font-medium tracking-[0.2em] tabular-nums",
                t.index,
              )}
            >
              {index}
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1
              id={id}
              className={cn(
                "max-w-[26ch] font-display text-[clamp(2.15rem,4.2vw,3.3rem)] font-medium leading-[1.05] tracking-[-0.03em]",
                t.title,
              )}
            >
              {title}
            </h1>

            {answer ? <AnswerBlock tone={textTone}>{answer}</AnswerBlock> : null}

            {lede ? (
              <p className={cn("mt-4 max-w-[52ch]", t.lede)}>{lede}</p>
            ) : null}

            {reviewed ? (
              <ReviewNote tone={textTone} className="mt-7" />
            ) : null}

            {cta || secondary ? (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {cta ? (
                  <Button href={cta.href} size="md">
                    {cta.label}
                    <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
                  </Button>
                ) : null}
                {secondary ? (
                  <Button
                    href={secondary.href}
                    variant="secondary"
                    size="md"
                    className={t.secondary}
                  >
                    {secondary.label}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {meta ? (
            <aside
              aria-label={meta.label}
              className="lg:col-span-4 lg:col-start-9 lg:pt-1"
            >
              <p
                className={cn(
                  "text-[0.68rem] font-medium uppercase leading-none tracking-[0.18em]",
                  t.metaLabel,
                )}
              >
                {meta.label}
              </p>
              <ul className={cn("mt-4 divide-y", t.metaDivide)}>
                {meta.items.map((item) => (
                  <li
                    key={item}
                    className={cn("py-2.5 text-[0.875rem] leading-snug", t.metaItem)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
