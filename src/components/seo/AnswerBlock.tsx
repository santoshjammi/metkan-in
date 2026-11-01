import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AnswerBlockTone = "dark" | "light";

const toneClasses: Record<AnswerBlockTone, string> = {
  // Reading colour, one step stronger than the supporting lede beneath it.
  dark: "text-ivory",
  light: "text-text-dark",
};

export interface AnswerBlockProps {
  /** 40-60 word direct answer. Plain prose — never a list, never a card. */
  children: string;
  tone?: AnswerBlockTone;
  className?: string;
}

/**
 * The answer-engines block: a single, ordinary paragraph directly under the h1
 * that answers the page's own question in its first sentence.
 *
 * Deliberately unglamorous. No `aria-hidden`, no client island, no reveal
 * animation — it has to be in the first HTML response, in the reading order,
 * and liftable verbatim. Everything else on the page is support for it.
 */
export function AnswerBlock({ children, tone = "dark", className }: AnswerBlockProps) {
  return (
    <p
      className={cn(
        "mt-5 max-w-[56ch] text-[1.0625rem] leading-[1.65]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}
