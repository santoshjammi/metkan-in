import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { StaggerGroup } from "@/components/cinematic/StaggerGroup";
import { StaggerItem } from "@/components/cinematic/StaggerItem";
import {
  evidenceEmptyState,
  evidencePoints,
  partners,
  testimonials,
} from "@/content/evidence";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type EvidencePanelTone = "dark" | "light";

const toneClasses: Record<
  EvidencePanelTone,
  {
    line: string;
    numeral: string;
    title: string;
    body: string;
    meta: string;
    emptyCard: string;
    emptyTitle: string;
    emptyBody: string;
    emptyMeta: string;
    link: string;
  }
> = {
  dark: {
    line: "border-line",
    numeral: "text-copper-hi",
    title: "text-ivory",
    body: "copy",
    meta: "text-steel-hi",
    emptyCard: "border-line",
    emptyTitle: "text-ivory",
    emptyBody: "copy",
    emptyMeta: "text-steel-hi",
    link: "text-ivory/90 hover:text-copper-hi",
  },
  light: {
    line: "border-line-ink",
    /* 2.25rem numeral: copper itself clears 3:1 at large-text size on ivory. */
    numeral: "text-copper",
    title: "text-text-dark",
    body: "copy-ink",
    meta: "text-steel-ink",
    emptyCard: "border-line-ink",
    emptyTitle: "text-text-dark",
    emptyBody: "copy-ink",
    emptyMeta: "text-steel-ink",
    link: "text-text-dark hover:text-copper-ink",
  },
};

export interface EvidencePanelProps {
  tone?: EvidencePanelTone;
  className?: string;
}

function EmptyEvidence({
  label,
  title,
  body,
  note,
  action,
  tone,
}: {
  label: string;
  title: string;
  body: string;
  note: string;
  action?: { label: string; href: string };
  tone: EvidencePanelTone;
}) {
  const t = toneClasses[tone];

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between border border-dashed p-4",
        t.emptyCard,
      )}
    >
      <div>
        <p className={cn("text-[0.72rem] uppercase tracking-[0.16em]", t.meta)}>
          {label}
        </p>
        <h3 className={cn("mt-2 font-display text-[1rem] font-medium", t.emptyTitle)}>
          {title}
        </h3>
        <p className={cn("mt-1.5 max-w-[46ch] text-[0.9375rem] leading-relaxed", t.emptyBody)}>
          {body}
        </p>
      </div>
      <div className="mt-4">
        <p className={cn("flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.14em]", t.meta)}>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-copper" />
          {note}
        </p>
        {action ? (
          <Link
            href={action.href}
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-colors duration-200",
              t.link,
            )}
          >
            {action.label}
            <ArrowRight aria-hidden="true" size={13} strokeWidth={1.6} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Credibility act, empty-state first. Nothing here is fabricated: the four
 * evidence points describe method and process, and the references/partner
 * blocks render an honest statement until permissioned material exists.
 *
 * Composition is a 2x2 hairline grid with a large index numeral, so the act
 * carries weight on ivory without needing boxes or shadows. The two empty
 * states sit in a single row beneath it, deliberately quieter.
 */
export function EvidencePanel({ tone = "dark", className }: EvidencePanelProps) {
  const t = toneClasses[tone];

  return (
    <div className={cn("mt-14", className)}>
      <StaggerGroup
        label="What MITT can evidence"
        className="grid sm:grid-cols-2"
      >
        {evidencePoints.map((point, index) => (
          <StaggerItem
            key={point.title}
            index={index}
            className={cn(
              "border-t pb-10 pt-8 sm:pb-14 sm:pt-10",
              index % 2 === 0 ? "sm:pr-12" : "sm:border-l sm:pl-12",
              t.line,
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "block font-display text-[2.25rem] font-medium leading-none tracking-[-0.04em] tabular-nums sm:text-[2.75rem]",
                t.numeral,
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3
              className={cn(
                "mt-5 max-w-[24ch] font-display text-[1.375rem] font-medium leading-snug sm:text-[1.5rem]",
                t.title,
              )}
            >
              {point.title}
            </h3>
            <p className={cn("mt-3 max-w-[44ch]", t.body)}>{point.body}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Supporting row, deliberately quieter than the four points above it. */}
      <div className={cn("mt-10 grid gap-4 border-t pt-8 md:grid-cols-2", t.line)}>
        {testimonials.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {testimonials.map((item) => (
              <li key={`${item.organisation}-${item.permissionedOn}`}>
                <figure className={cn("border p-4", t.emptyCard)}>
                  <Quote aria-hidden="true" size={16} strokeWidth={1.4} className={t.numeral} />
                  <blockquote className={cn("mt-2 max-w-[46ch] text-[0.9375rem] leading-relaxed", t.body)}>
                    {item.quote}
                  </blockquote>
                  <figcaption className={cn("mt-3 text-[0.78125rem] leading-relaxed", t.meta)}>
                    {item.attribution} — {item.organisation}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyEvidence
            label="Client references"
            title={evidenceEmptyState.title}
            body={evidenceEmptyState.body}
            note="Not published — shared on request"
            action={{ label: "Discuss a reference", href: "/contact" }}
            tone={tone}
          />
        )}

        {partners.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {partners.map((partner) => (
              <li
                key={partner.name}
                className={cn("flex items-center gap-3 border p-4", t.emptyCard)}
              >
                {partner.logoSrc ? (
                  <Image
                    src={partner.logoSrc}
                    alt={`${partner.name} logo`}
                    width={96}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                ) : null}
                <div>
                  <p className={cn("font-display text-[0.9375rem]", t.emptyTitle)}>
                    {partner.name}
                  </p>
                  <p className={cn("mt-1 text-[0.78125rem]", t.meta)}>
                    {partner.relationship}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyEvidence
            label="Partner and client marks"
            title="Client and partner marks"
            body="No client or partner logo is published here. A mark appears only where a written permission exists for its use, and none has been granted for publication."
            note="Placeholder-free by policy"
            tone={tone}
          />
        )}
      </div>
    </div>
  );
}
