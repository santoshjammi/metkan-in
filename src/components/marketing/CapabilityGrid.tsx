import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StaggerGroup } from "@/components/cinematic/StaggerGroup";
import { StaggerItem } from "@/components/cinematic/StaggerItem";
import { capabilities, capabilityNote, type Capability } from "@/content/capabilities";
import { cta } from "@/content/site";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CapabilityGridTone = "dark" | "light";

const toneClasses: Record<
  CapabilityGridTone,
  {
    card: string;
    line: string;
    title: string;
    numeral: string;
    chip: string;
    link: string;
    note: string;
    badge: string;
    body: string;
  }
> = {
  dark: {
    card: "border-line bg-graphite/30 hover:border-ivory/30 hover:bg-graphite/50",
    line: "border-line",
    title: "text-ivory",
    numeral: "text-copper-hi",
    chip: "border-line text-steel-hi",
    link: "text-ivory/90 hover:text-copper-hi",
    note: "copy",
    badge: "border-line bg-transparent text-steel-hi",
    body: "copy",
  },
  light: {
    card: "border-line-ink bg-ivory-2/40 hover:border-text-dark/25 hover:bg-ivory-2/70",
    line: "border-line-ink",
    title: "text-text-dark",
    numeral: "text-copper-ink",
    chip: "border-line-ink text-steel-ink",
    link: "text-text-dark hover:text-copper-ink",
    note: "copy-ink",
    badge: "border-line-ink bg-transparent text-steel-ink",
    body: "copy-ink",
  },
};

export interface CapabilityGridProps {
  tone?: CapabilityGridTone;
  className?: string;
}

function CapabilityCard({
  capability,
  index,
  wide,
  tone,
}: {
  capability: Capability;
  index: number;
  wide: boolean;
  tone: CapabilityGridTone;
}) {
  const t = toneClasses[tone];

  return (
    <article
      className={cn(
        "relative flex h-full flex-col border",
        t.card,
        "transition-[transform,border-color,background-color] duration-200 ease-arc",
        "motion-safe:hover:-translate-y-1 motion-safe:focus-within:-translate-y-1",
      )}
    >
      {/* Plate: only a confirmed photograph earns one. No letter stand-ins. */}
      {capability.image ? (
        <div className={cn("relative aspect-[16/9] shrink-0 overflow-hidden border-b", t.line)}>
          <Image
            src={capability.image.src}
            alt={capability.image.alt}
            width={capability.image.width}
            height={capability.image.height}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          {capability.availability === "confirm-required" ? (
            <Badge tone="steel" className={t.badge}>
              Confirm availability
            </Badge>
          ) : (
            <span />
          )}
          <span
            aria-hidden="true"
            className={cn(
              "font-display text-[0.75rem] font-medium leading-none tracking-[0.18em] tabular-nums",
              t.numeral,
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div
          className={cn(
            wide
              ? "mt-5 flex flex-1 flex-col sm:grid sm:grid-cols-[1.05fr_0.95fr] sm:items-start sm:gap-10"
              : "flex flex-1 flex-col",
          )}
        >
          <div>
            <h3 className={cn("card-title", t.title)}>
              {capability.title}
            </h3>
            <p className={cn("mt-3 max-w-[44ch]", t.body)}>
              {capability.summary}
            </p>
          </div>

          <div className={cn("flex flex-1 flex-col pt-6", wide && "sm:pt-0")}>
            <ul className="flex flex-wrap gap-1.5 pb-6">
              {capability.skills.slice(0, 3).map((skill) => (
                <li
                  key={skill}
                  className={cn(
                    "whitespace-nowrap border px-2.5 py-1.5 text-[0.72rem] uppercase leading-none tracking-[0.08em]",
                    t.chip,
                  )}
                >
                  {skill}
                </li>
              ))}
            </ul>

            <div className={cn("mt-auto border-t pt-4", t.line)}>
              <Link
                href={`/capabilities#${capability.slug}`}
                className={cn(
                  "inline-flex items-center gap-1.5 text-[0.875rem] font-medium transition-colors duration-200 after:absolute after:inset-0 after:content-['']",
                  t.link,
                )}
              >
                View capability
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.6} />
                <span className="sr-only">: {capability.title}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Seven trade categories. Every card carries a quiet availability state
 * because MITT has not confirmed live supply for any category.
 *
 * No filter row: there is no filtering data behind this grid, so there is no
 * control implying there is.
 */
export function CapabilityGrid({
  tone = "dark",
  className,
}: CapabilityGridProps) {
  const lastIndex = capabilities.length - 1;
  const t = toneClasses[tone];

  return (
    <div className={className}>
      <StaggerGroup
        label="Capability areas"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
      >
        {capabilities.map((capability, index) => (
          <StaggerItem
            key={capability.slug}
            index={index}
            className={cn(
              "relative h-full",
              index === lastIndex && "sm:col-span-2 lg:col-span-3",
            )}
          >
            <CapabilityCard
              capability={capability}
              index={index}
              wide={index === lastIndex}
              tone={tone}
            />
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div
        className={cn(
          "mt-10 flex flex-col gap-6 border-t pt-6 md:flex-row md:items-center md:justify-between",
          t.line,
        )}
      >
        <p className={cn("max-w-[58ch]", t.note)}>{capabilityNote}</p>
        <Button
          href="/contact"
          variant={tone === "dark" ? "primary" : "secondary"}
          size="md"
          className={cn("shrink-0", tone === "light" && "border-text-dark/40 text-text-dark hover:border-text-dark hover:bg-text-dark/5")}
        >
          {cta.primary}
        </Button>
      </div>
    </div>
  );
}
