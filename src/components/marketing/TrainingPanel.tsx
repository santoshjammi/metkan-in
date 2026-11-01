import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { facilityCaption, facilityPhotos } from "@/content/facility";
import { programmes, programmeNote } from "@/content/programmes";
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
    rule: string;
  }
> = {
  dark: {
    line: "border-line",
    plate: "border-line bg-graphite-2",
    numeral: "text-copper-hi",
    title: "text-ivory",
    body: "copy",
    caption: "text-steel-hi",
    rule: "bg-copper",
  },
  light: {
    line: "border-line-ink",
    plate: "border-line-ink bg-ivory-2",
    numeral: "text-copper-ink",
    title: "text-text-dark",
    body: "copy-ink",
    caption: "text-steel-ink",
    rule: "bg-copper",
  },
};

export interface TrainingPanelProps {
  tone?: TrainingPanelTone;
  className?: string;
}

/**
 * The workshop aisle is a genuine MITT photograph, 363x363 at source. The plate
 * is capped at that native width so it is never upscaled, and the caption says
 * plainly whose facility it is rather than carrying an "illustrative" caveat.
 *
 * The five programmes come straight from `src/content/programmes.ts`; the panel
 * shows each one's published duration and defers the detail to /training.
 */
const boothPhoto = facilityPhotos.find((photo) =>
  photo.src.endsWith("/booths-aisle.jpg"),
);

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
      {boothPhoto ? (
        <figure>
          <div
            className={cn("w-full border", t.plate)}
            style={{ maxWidth: boothPhoto.nativeWidth }}
          >
            <Image
              src={boothPhoto.src}
              alt={boothPhoto.alt}
              width={boothPhoto.width}
              height={boothPhoto.height}
              unoptimized
              className="h-auto w-full"
            />
          </div>
          <figcaption
            className={cn(
              "meta mt-3 flex max-w-[44ch] items-start gap-2 text-[0.8125rem] leading-[1.55]",
              t.caption,
            )}
          >
            <span
              aria-hidden="true"
              className={cn("mt-[0.55rem] h-px w-4 shrink-0", t.rule)}
            />
            {facilityCaption}
          </figcaption>
        </figure>
      ) : null}

      <div>
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-y-5 xl:grid-cols-2">
          {programmes.map((programme) => (
            <li key={programme.slug} className={cn("border-t pt-4", t.line)}>
              <p
                aria-hidden="true"
                className={cn(
                  "font-display text-[0.75rem] tracking-[0.18em] tabular-nums",
                  t.numeral,
                )}
              >
                {programme.index}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h3
                  className={cn(
                    "font-display text-[1.0625rem] font-medium leading-snug",
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
              <p className={cn("mt-1.5 text-[0.85rem]", t.body)}>
                {programme.duration}
              </p>
            </li>
          ))}
        </ul>

        <p className={cn("mt-8 max-w-[62ch] border-t pt-4", t.line, t.body)}>
          {programmeNote}
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
