import Image from "next/image";
import { Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { facilityPhotos, testingFacility } from "@/content/facility";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TestingPanelProps {
  className?: string;
}

/**
 * Trade testing, framed for the employer: the reason a candidate can be assessed
 * on the work before anyone commits to an interview.
 *
 * IMAGE RULE: the interview room photograph is 458px wide at native resolution.
 * It renders at or below that width, only at lg and above, and never upscaled.
 */
export function TestingPanel({ className }: TestingPanelProps) {
  const interviewRoom = facilityPhotos.find((photo) =>
    photo.src.endsWith("interview-room.jpg"),
  );

  return (
    <div
      className={cn(
        "mt-14 grid gap-10 border-t border-line-ink pt-10 lg:grid-cols-12 lg:items-start lg:gap-12",
        className,
      )}
    >
      <div className="lg:col-span-7">
        <p className="eyebrow text-copper-ink">
          <span aria-hidden="true" className="h-px w-8 bg-copper" />
          Trade testing
        </p>

        <h3 className="mt-4 max-w-[26ch] font-display text-[1.5rem] font-medium leading-snug text-text-dark sm:text-[1.75rem]">
          {testingFacility.heading}
        </h3>

        <p className="copy-ink mt-3 max-w-[60ch]">{testingFacility.body}</p>

        <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {testingFacility.supports.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 border-t border-line-ink pt-3 text-[0.9375rem] leading-relaxed text-text-dark"
            >
              <Check
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                className="mt-[0.28em] shrink-0 text-copper-ink"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {interviewRoom ? (
        <figure className="hidden lg:col-span-5 lg:block">
          <Image
            src={interviewRoom.src}
            alt={interviewRoom.alt}
            width={interviewRoom.width}
            height={interviewRoom.height}
            /* Small native source; the optimizer adds nothing but softness here. */
            unoptimized
            className="block h-auto w-full border border-line-ink bg-ivory"
            style={{ maxWidth: interviewRoom.nativeWidth }}
          />
          <figcaption className="meta mt-3 max-w-[40ch] border-t border-line-ink pt-2.5 text-[0.78125rem] leading-[1.5] text-steel-ink">
            {interviewRoom.caption}
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}
