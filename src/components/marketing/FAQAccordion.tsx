import { Plus } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Faq } from "@/content/faqs";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FAQAccordionTone = "dark" | "light";

const toneClasses: Record<
  FAQAccordionTone,
  { list: string; row: string; question: string; answer: string; marker: string }
> = {
  dark: {
    list: "border-line",
    row: "border-line",
    question: "text-ivory",
    answer: "text-steel-hi",
    marker: "text-copper-hi",
  },
  light: {
    list: "border-line-ink",
    row: "border-line-ink",
    question: "text-text-dark",
    answer: "text-copy-ink",
    marker: "text-copper-ink",
  },
};

export interface FAQAccordionProps {
  items: readonly Faq[];
  tone?: FAQAccordionTone;
  id?: string;
  className?: string;
}

/**
 * Native `<details>/<summary>` on purpose: the answers are in the HTML whether
 * or not JavaScript runs, keyboard and screen-reader behaviour is the
 * platform's, and `Ctrl+F` in the browser finds text inside a closed row.
 *
 * The marker is a copper plus that rotates to a cross via a CSS attribute
 * variant on the parent `<details>[open]` — no state, no listeners.
 */
export function FAQAccordion({
  items,
  tone = "dark",
  id,
  className,
}: FAQAccordionProps) {
  const t = toneClasses[tone];

  return (
    <div id={id} className={cn("border-b", t.list, className)}>
      {items.map((item) => (
        <details key={item.question} className={cn("group border-t", t.row)}>
          <summary
            className={cn(
              "flex min-h-12 cursor-pointer list-none items-start justify-between gap-6 py-5",
              "[&::-webkit-details-marker]:hidden",
            )}
          >
            <h3
              className={cn(
                "font-display text-[1.05rem] font-medium leading-snug md:text-[1.15rem]",
                t.question,
              )}
            >
              {item.question}
            </h3>
            <Plus
              aria-hidden="true"
              size={18}
              strokeWidth={1.6}
              className={cn(
                "mt-0.5 shrink-0 transition-transform duration-200 ease-arc group-open:rotate-45",
                t.marker,
              )}
            />
          </summary>
          <p
            className={cn(
              "max-w-[62ch] pb-6 text-[0.95rem] leading-[1.7] md:pr-10",
              t.answer,
            )}
          >
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
