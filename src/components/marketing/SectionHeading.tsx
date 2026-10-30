import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SectionHeadingTone = "dark" | "light" | "copper";

const toneClasses: Record<
  SectionHeadingTone,
  { eyebrow: string; index: string; title: string; lede: string; rule: string }
> = {
  dark: {
    eyebrow: "text-steel-hi",
    /* copper at this size falls just under 4.5:1 on ink — copper-hi is the
       small-text token for dark surfaces (BUILD-SPEC §3). */
    index: "text-copper-hi",
    title: "text-ivory",
    lede: "copy",
    rule: "bg-copper",
  },
  light: {
    eyebrow: "text-steel-ink",
    index: "text-steel-ink",
    title: "text-text-dark",
    lede: "copy-ink",
    rule: "bg-copper",
  },
  copper: {
    eyebrow: "text-ink/85",
    index: "text-ink/85",
    title: "text-ink",
    lede: "text-ink/85",
    rule: "bg-ink/40",
  },
};

export interface SectionHeadingProps {
  eyebrow?: string;
  /** Editorial act number, top-right of the head. */
  index?: string;
  title: string;
  lede?: string;
  tone?: SectionHeadingTone;
  /** Id for the h2, so a section can be labelled by it. */
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  index,
  title,
  lede,
  tone = "dark",
  id,
  className,
}: SectionHeadingProps) {
  const t = toneClasses[tone];

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-start justify-between gap-6">
        {eyebrow ? (
          <p className={cn("eyebrow", t.eyebrow)}>
            <span aria-hidden="true" className={cn("h-px w-8", t.rule)} />
            {eyebrow}
          </p>
        ) : (
          <span />
        )}
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

      <h2
        id={id}
        className={cn(
          "mt-5 max-w-[24ch] font-display text-h2 font-medium",
          t.title,
        )}
      >
        {title}
      </h2>

      {lede ? (
        <p className={cn("mt-5 max-w-[62ch]", t.lede)}>{lede}</p>
      ) : null}
    </div>
  );
}
