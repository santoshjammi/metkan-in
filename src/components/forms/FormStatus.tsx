"use client";

import { TriangleAlert } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FormStatusItem {
  /** DOM id of the control to focus when the item is activated. */
  id: string;
  label: string;
  message: string;
}

export interface FormStatusProps {
  /** Per-field problems, rendered as a jump list. */
  items?: FormStatusItem[];
  /** Whole-form problem (rate limit, store unavailable, network). */
  alert?: string | null;
  className?: string;
}

function focusField(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;
  element.focus();
  element.scrollIntoView({ block: "center", behavior: "smooth" });
}

/**
 * The one live region on the form.
 *
 * It is always mounted — an `aria-live` container that is inserted together with
 * its content is unreliably announced — and only its children change. Field
 * errors are listed as links so a keyboard user can jump straight to the control.
 */
export function FormStatus({ items = [], alert, className }: FormStatusProps) {
  const hasItems = items.length > 0;

  return (
    <div aria-live="polite" className={cn(className)}>
      {alert ? (
        <div className="flex items-start gap-3 border border-copper/60 bg-copper/[0.12] p-4 sm:p-5">
          <TriangleAlert
            aria-hidden="true"
            size={17}
            strokeWidth={1.7}
            className="mt-0.5 shrink-0 text-copper-hi"
          />
          <p className="text-[0.9rem] leading-relaxed text-ivory">
            <span className="sr-only">Error: </span>
            {alert}
          </p>
        </div>
      ) : null}

      {hasItems ? (
        <div
          className={cn(
            "border border-copper/60 bg-copper/[0.08] p-4 sm:p-5",
            alert && "mt-4",
          )}
        >
          <p className="flex items-start gap-2 text-[0.9rem] font-medium text-ivory">
            <TriangleAlert
              aria-hidden="true"
              size={15}
              strokeWidth={1.7}
              className="mt-1 shrink-0 text-copper-hi"
            />
            {items.length === 1
              ? "One field needs attention before this can be sent."
              : `${items.length} fields need attention before this can be sent.`}
          </p>

          <ul className="mt-3 space-y-2 pl-[1.45rem]">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    focusField(item.id);
                  }}
                  className="text-[0.85rem] leading-relaxed text-copper-hi underline decoration-copper/50 underline-offset-[0.25em] transition-colors duration-150 hover:text-ivory hover:decoration-ivory/60"
                >
                  <span className="font-medium">{item.label}</span>
                  {" — "}
                  {item.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
