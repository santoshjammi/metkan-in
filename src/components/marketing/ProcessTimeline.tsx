"use client";

import { useEffect, useRef } from "react";
import { processStages } from "@/content/process";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ProcessTimelineTone = "dark" | "light";

const toneClasses: Record<
  ProcessTimelineTone,
  {
    track: string;
    rule: string;
    dot: string;
    numeral: string;
    title: string;
    body: string;
    boundary: string;
    boundaryRule: string;
  }
> = {
  dark: {
    track: "bg-line",
    rule: "bg-copper",
    dot: "border-copper bg-ink",
    numeral: "text-copper-hi",
    title: "text-ivory",
    body: "copy",
    boundary: "text-steel-hi",
    boundaryRule: "border-copper/40",
  },
  light: {
    track: "bg-line-ink",
    /* copper itself stays: it is a 1px rule and reads at 3.1:1 on ivory. */
    rule: "bg-copper",
    dot: "border-copper bg-ivory",
    numeral: "text-copper-ink",
    title: "text-text-dark",
    body: "copy-ink",
    boundary: "text-steel-ink",
    boundaryRule: "border-copper/45",
  },
};

export interface ProcessTimelineProps {
  tone?: ProcessTimelineTone;
  className?: string;
}

/**
 * Eight stages along a 1px copper rule that draws itself as the act scrolls
 * past. The rule is decoration only: no pinning, no scroll hijacking, and the
 * document scrolls exactly as it would without it.
 *
 * The draw is a passive scroll calculation writing a single transform, so the
 * scroll path carries no animation runtime and no React state. Reduced motion
 * is handled in globals.css (`[data-process-rule]` is forced to `scaleY(1)`),
 * so the line is simply fully drawn for those users.
 */
export function ProcessTimeline({
  tone = "dark",
  className,
}: ProcessTimelineProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const ruleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const rule = ruleRef.current;
    if (!track || !rule) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    /* 0 when the track's top reaches 85% of the viewport, 1 when its bottom
       reaches 55% - the window the rule was originally drawn against. */
    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const start = rect.top - viewport * 0.85;
      const end = rect.bottom - viewport * 0.55;
      const span = end - start;
      const progress = span <= 0 ? 1 : (0 - start) / span;
      const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;
      rule.style.transform = `scaleY(${clamped})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const t = toneClasses[tone];

  return (
    <div ref={trackRef} className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className={cn("absolute bottom-2 left-2 top-2 w-px", t.track)}
      />
      <div
        ref={ruleRef}
        aria-hidden="true"
        data-process-rule=""
        className={cn(
          "absolute bottom-2 left-2 top-2 w-px origin-top",
          t.rule,
        )}
      />

      <ol className="relative space-y-9 md:space-y-11">
        {processStages.map((stage) => (
          <li key={stage.n} className="relative pl-8 md:pl-12">
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-[5px] top-[0.55rem] h-[7px] w-[7px] rounded-full border",
                t.dot,
              )}
            />
            <p
              className={cn(
                "font-display text-[0.75rem] font-medium tracking-[0.2em] tabular-nums",
                t.numeral,
              )}
            >
              {stage.n}
            </p>
            <h3
              className={cn(
                "mt-2 max-w-[36ch] font-display text-[1.25rem] font-medium leading-snug md:text-[1.35rem]",
                t.title,
              )}
            >
              {stage.title}
            </h3>
            <p className={cn("mt-2 max-w-[58ch]", t.body)}>{stage.body}</p>
            {stage.boundary ? (
              <p
                className={cn(
                  "meta mt-3 flex max-w-[58ch] gap-2 border-l pl-3",
                  t.boundaryRule,
                  t.boundary,
                )}
              >
                <span className="sr-only">Boundary of this stage: </span>
                <span aria-hidden="true" className={t.numeral}>
                  &mdash;
                </span>
                {stage.boundary}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
