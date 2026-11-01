import { leadership } from "@/content/legacy";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type LeadershipListTone = "dark" | "light";

const toneClasses: Record<
  LeadershipListTone,
  {
    item: string;
    numeral: string;
    name: string;
    role: string;
    body: string;
  }
> = {
  dark: {
    item: "border-line",
    numeral: "text-copper-hi",
    name: "text-ivory",
    role: "text-copper-hi",
    body: "copy",
  },
  light: {
    item: "border-line-ink",
    numeral: "text-copper-ink",
    name: "text-text-dark",
    role: "text-copper-ink",
    body: "copy-ink",
  },
};

export interface LeadershipListProps {
  tone?: LeadershipListTone;
  className?: string;
}

/**
 * The leadership named in MITT's own published material - one person and one
 * team, exactly as published. Nothing is added to the roster.
 */
export function LeadershipList({
  tone = "light",
  className,
}: LeadershipListProps) {
  const t = toneClasses[tone];

  return (
    <ol className={cn("grid gap-8 sm:grid-cols-2 sm:gap-10", className)}>
      {leadership.map((entry, index) => (
        <li key={entry.name} className={cn("border-t pt-6", t.item)}>
          <span
            aria-hidden="true"
            className={cn(
              "font-display text-[0.72rem] font-medium tracking-[0.18em] tabular-nums",
              t.numeral,
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3
            className={cn(
              "mt-2 font-display text-[1.1rem] font-medium leading-snug",
              t.name,
            )}
          >
            {entry.name}
          </h3>
          <p
            className={cn(
              "mt-1.5 text-[0.7rem] uppercase tracking-[0.16em]",
              t.role,
            )}
          >
            {entry.role}
          </p>
          <p className={cn("mt-3 max-w-[44ch] text-[0.95rem]", t.body)}>
            {entry.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
