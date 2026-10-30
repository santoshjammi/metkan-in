import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface EditorialPanelItem {
  n: string;
  title: string;
  body: string;
}

export interface EditorialPanelsProps {
  items: EditorialPanelItem[];
  className?: string;
}

/**
 * Numbered editorial panels for the ivory act. Hairlines between, no cards —
 * this reads like a printed spread, not a feature grid.
 */
export function EditorialPanels({ items, className }: EditorialPanelsProps) {
  return (
    <ol className={cn("border-t border-line-ink", className)}>
      {items.map((item) => (
        <li
          key={item.n}
          className="grid gap-2 border-b border-line-ink py-6 sm:grid-cols-[3.25rem_1fr] sm:gap-6 sm:py-7"
        >
          <p className="font-display text-[0.78125rem] font-medium tracking-[0.18em] tabular-nums text-steel-ink">
            {item.n}
          </p>
          <div>
            <h3 className="font-display text-[1.25rem] font-medium leading-snug text-text-dark sm:text-[1.35rem]">
              {item.title}
            </h3>
            <p className="copy-ink mt-2 max-w-[46ch]">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
