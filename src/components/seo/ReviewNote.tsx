import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { editorial } from "@/content/seo";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ReviewNoteTone = "dark" | "light";

const toneClasses: Record<ReviewNoteTone, { border: string; label: string; note: string }> = {
  dark: {
    border: "border-line",
    label: "text-ivory/85",
    note: "text-steel-hi",
  },
  light: {
    border: "border-line-ink",
    label: "text-text-dark",
    note: "text-steel-ink",
  },
};

export interface ReviewNoteProps {
  tone?: ReviewNoteTone;
  className?: string;
  /**
   * The editorial note is identical on every page, so it is rendered by default.
   * Set to false only where the surrounding copy already states the same thing
   * word for word.
   */
  withNote?: boolean;
}

/**
 * The EEAT line: one visible review date and one line of editorial provenance,
 * on every content page.
 *
 * It claims only what is true - the page was reviewed on that date, it is
 * reviewed periodically, and the figures on it are MITT's own published numbers.
 * No reviewer name, credential or external verification is asserted, because
 * none exists.
 */
export function ReviewNote({ tone = "dark", className, withNote = true }: ReviewNoteProps) {
  const t = toneClasses[tone];

  return (
    <p
      className={cn(
        "meta mt-6 max-w-[58ch] border-t pt-3",
        t.border,
        t.note,
        className,
      )}
    >
      <span className={cn("font-medium", t.label)}>{editorial.reviewLabel}</span>
      {withNote ? <span> · {editorial.reviewNote}</span> : null}
    </p>
  );
}
