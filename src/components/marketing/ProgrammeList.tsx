import { Badge } from "@/components/ui/Badge";
import { programmes } from "@/content/programmes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ProgrammeListTone = "dark" | "light";

const toneClasses: Record<
  ProgrammeListTone,
  {
    item: string;
    numeral: string;
    title: string;
    body: string;
    label: string;
    value: string;
    skill: string;
    dot: string;
    bespoke: string;
  }
> = {
  dark: {
    item: "border-line",
    numeral: "text-copper-hi",
    title: "text-ivory",
    body: "copy",
    label: "text-steel-hi",
    value: "text-ivory/90",
    skill: "text-ivory/85",
    dot: "bg-copper-hi",
    bespoke: "border-copper/55 bg-copper/[0.08]",
  },
  light: {
    item: "border-line-ink",
    numeral: "text-copper-ink",
    title: "text-text-dark",
    body: "copy-ink",
    label: "text-steel-ink",
    value: "text-text-dark",
    skill: "text-text-dark/85",
    dot: "bg-copper",
    bespoke: "border-copper/55 bg-copper/[0.06]",
  },
};

export interface ProgrammeListProps {
  tone?: ProgrammeListTone;
  className?: string;
}

/**
 * MITT's five published programmes, exactly as transcribed in
 * `src/content/programmes.ts` - no programme, duration, level or skill is added
 * here. P5 is bespoke work, so it carries an explicit badge and a highlighted
 * block rather than a fixed duration band.
 */
export function ProgrammeList({
  tone = "light",
  className,
}: ProgrammeListProps) {
  const t = toneClasses[tone];

  return (
    <ol className={cn("mt-10 border-b", t.item, className)}>
      {programmes.map((programme) => (
        <li key={programme.slug} className={cn("border-t py-8 md:py-9", t.item)}>
          <div
            className={cn(
              "grid gap-x-10 gap-y-6 md:grid-cols-12",
              programme.custom && cn("border-l-2 px-4 md:px-6", t.bespoke),
            )}
          >
            <div className="md:col-span-1">
              <span
                aria-hidden="true"
                className={cn(
                  "font-display text-[0.72rem] font-medium tracking-[0.18em] tabular-nums",
                  t.numeral,
                )}
              >
                {programme.index}
              </span>
            </div>

            <div className="md:col-span-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3
                  className={cn(
                    "font-display text-[1.2rem] font-medium leading-snug",
                    t.title,
                  )}
                >
                  {programme.title}
                </h3>
                {programme.custom ? (
                  <Badge tone={tone === "dark" ? "copperOnDark" : "copper"}>
                    Bespoke
                  </Badge>
                ) : null}
              </div>

              <p className={cn("mt-2 max-w-[46ch] text-[0.95rem]", t.body)}>
                {programme.summary}
              </p>

              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                <div className="flex items-baseline gap-2">
                  <dt
                    className={cn(
                      "text-[0.68rem] uppercase tracking-[0.16em]",
                      t.label,
                    )}
                  >
                    Duration
                  </dt>
                  <dd className={cn("text-[0.85rem]", t.value)}>
                    {programme.duration}
                  </dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt
                    className={cn(
                      "text-[0.68rem] uppercase tracking-[0.16em]",
                      t.label,
                    )}
                  >
                    Levels
                  </dt>
                  <dd className={cn("text-[0.85rem]", t.value)}>
                    {programme.levels}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="md:col-span-5">
              <p
                className={cn(
                  "text-[0.68rem] uppercase tracking-[0.16em]",
                  t.label,
                )}
              >
                {programme.custom ? "What a custom block covers" : "Skills covered"}
              </p>
              <ul className="mt-3 grid gap-1.5">
                {programme.skills.map((skill) => (
                  <li
                    key={skill}
                    className={cn(
                      "flex items-baseline gap-2.5 text-[0.9rem] leading-[1.55]",
                      t.skill,
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn("h-1 w-1 shrink-0", t.dot)}
                    />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
