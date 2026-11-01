import { Download, FileText } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { brochure } from "@/content/legacy";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BrochureCardTone = "light" | "dark";

const toneClasses: Record<
  BrochureCardTone,
  { card: string; rule: string; icon: string; iconFrame: string; title: string; body: string; meta: string; action: string }
> = {
  light: {
    card: "border-line-ink bg-ivory",
    rule: "border-l-copper",
    icon: "text-copper-ink",
    iconFrame: "border-line-ink",
    title: "text-text-dark",
    body: "copy-ink",
    meta: "text-steel-ink",
    /* Copper ground takes ink text - white would fail on it. */
    action:
      "border-copper bg-copper text-ink hover:border-copper-hi hover:bg-copper-hi",
  },
  dark: {
    card: "border-line bg-graphite",
    rule: "border-l-copper-hi",
    icon: "text-copper-hi",
    iconFrame: "border-line-strong",
    title: "text-ivory",
    body: "copy",
    meta: "text-steel-hi",
    action:
      "border-copper bg-copper text-ink hover:border-copper-hi hover:bg-copper-hi",
  },
};

export interface BrochureCardProps {
  tone?: BrochureCardTone;
  /**
   * Heading level for the document title. h3 inside an existing act; h2 when the
   * card is the only heading in its own band.
   */
  headingLevel?: "h2" | "h3";
  className?: string;
}

/**
 * The download. A real, published four-page document - the one piece of
 * collateral MITT can actually hand an employer today, so it is offered as a
 * hairline card rather than a button floating on an empty panel.
 *
 * The anchor is a plain `<a>`: `download` and `type` only mean anything on a raw
 * anchor, and this is same-origin under /public.
 */
export function BrochureCard({
  tone = "light",
  headingLevel = "h3",
  className,
}: BrochureCardProps) {
  const t = toneClasses[tone];
  const Heading = headingLevel;

  return (
    <div
      className={cn(
        "grid gap-6 border border-l-2 p-5 sm:p-7 lg:grid-cols-12 lg:items-center lg:gap-8",
        t.card,
        t.rule,
        className,
      )}
    >
      <div className="flex items-start gap-4 lg:col-span-8">
        <span
          aria-hidden="true"
          className={cn(
            "hidden shrink-0 border p-2.5 sm:block",
            t.iconFrame,
            t.icon,
          )}
        >
          <FileText size={22} strokeWidth={1.4} />
        </span>

        <div>
          <p
            className={cn(
              "text-[0.72rem] font-medium uppercase tracking-[0.16em]",
              t.meta,
            )}
          >
            Document
          </p>
          <Heading
            className={cn(
              "mt-2 font-display text-[1.25rem] font-medium leading-snug sm:text-[1.375rem]",
              t.title,
            )}
          >
            {brochure.title}
          </Heading>
          <p className={cn("mt-2 max-w-[56ch] text-[0.9375rem]", t.body)}>
            {brochure.body}
          </p>
        </div>
      </div>

      <div className="lg:col-span-4 lg:justify-self-end">
        <p className={cn("meta text-[0.78125rem] leading-[1.55]", t.meta)}>
          {brochure.meta}
        </p>
        <a
          href={brochure.href}
          download
          type="application/pdf"
          className={cn(
            "mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xs border px-5 text-[0.9rem] font-medium transition-colors duration-200",
            t.action,
          )}
        >
          {brochure.cta}
          <Download aria-hidden="true" size={15} strokeWidth={1.7} />
        </a>
      </div>
    </div>
  );
}
