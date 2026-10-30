import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SectionTone = "dark" | "light" | "copper" | "graphite";

const toneClasses: Record<SectionTone, string> = {
  dark: "bg-ink text-ivory",
  light: "bg-ivory text-text-dark",
  copper: "bg-copper text-ink",
  graphite: "bg-graphite text-ivory",
};

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  /** Skip the 1240px container (full-bleed composition). */
  bleed?: boolean;
  className?: string;
}

/**
 * One act of the page: vertical rhythm from `--spacing-section`, tone from the
 * palette, container at 1240px with 1.25–2.5rem gutters.
 */
export function Section({
  tone = "dark",
  bleed = false,
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      data-tone={tone}
      className={cn("section-y relative", toneClasses[tone], className)}
      {...rest}
    >
      {bleed ? children : <div className="shell">{children}</div>}
    </section>
  );
}
