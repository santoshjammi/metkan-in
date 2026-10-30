import Image from "next/image";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  trainingAreas,
  trainingImage,
  trainingNote,
} from "@/content/training";
import { cta } from "@/content/site";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TrainingPanelTone = "dark" | "light";

const toneClasses: Record<
  TrainingPanelTone,
  {
    line: string;
    plate: string;
    numeral: string;
    title: string;
    body: string;
    caption: string;
  }
> = {
  dark: {
    line: "border-line",
    plate: "border-line bg-graphite",
    numeral: "text-copper-hi",
    title: "text-ivory",
    body: "copy",
    caption: "text-steel-hi",
  },
  light: {
    line: "border-line-ink",
    plate: "border-line-ink bg-ivory-2",
    numeral: "text-copper-ink",
    title: "text-text-dark",
    body: "copy-ink",
    caption: "text-steel-ink",
  },
};

export interface TrainingPanelProps {
  tone?: TrainingPanelTone;
  className?: string;
}

/**
 * Training act. The facility still carries its disclosure caption everywhere it
 * appears — it is illustrative, and the page says so.
 *
 * Composition is an even lg split so the photograph fills its column at 4:3
 * instead of shrinking to a square thumbnail beside a wall of text. The
 * disclosure sits directly beneath the plate, as a caption rather than a
 * floating note.
 */
export function TrainingPanel({
  tone = "dark",
  className,
}: TrainingPanelProps) {
  const t = toneClasses[tone];

  return (
    <div
      className={cn(
        "mt-12 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14",
        className,
      )}
    >
      <figure>
        <div
          className={cn(
            "relative aspect-[4/3] w-full overflow-hidden border",
            t.plate,
          )}
        >
          <Image
            src={trainingImage.src}
            alt={trainingImage.alt}
            width={trainingImage.width}
            height={trainingImage.height}
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
        <figcaption
          className={cn("meta mt-3 flex items-start gap-2 text-[0.8125rem] leading-[1.55]", t.caption)}
        >
          <Info
            aria-hidden="true"
            size={13}
            strokeWidth={1.6}
            className="mt-[0.2em] shrink-0"
          />
          {trainingImage.disclosure}
        </figcaption>
      </figure>

      <div>
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-y-5 xl:grid-cols-2">
          {trainingAreas.map((area, index) => (
            <li key={area.title} className={cn("border-t pt-4", t.line)}>
              <p
                aria-hidden="true"
                className={cn(
                  "font-display text-[0.75rem] tracking-[0.18em] tabular-nums",
                  t.numeral,
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3
                className={cn(
                  "mt-2 font-display text-[1.125rem] font-medium leading-snug",
                  t.title,
                )}
              >
                {area.title}
              </h3>
              <p className={cn("mt-1.5 max-w-[42ch]", t.body)}>{area.body}</p>
            </li>
          ))}
        </ul>

        <p className={cn("mt-8 max-w-[62ch] border-t pt-4", t.line, t.body)}>
          {trainingNote}
        </p>

        <div className="mt-6">
          <Button
            href="/training"
            variant="secondary"
            className={cn(
              tone === "light" &&
                "border-text-dark/35 text-text-dark hover:border-text-dark hover:bg-text-dark/5",
            )}
          >
            {cta.training}
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
          </Button>
        </div>
      </div>
    </div>
  );
}
