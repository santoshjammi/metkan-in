import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/marketing/Section";
import { isValidReference } from "@/lib/validation";
import { site } from "@/content/site";

/**
 * True confirmation — BUILD-SPEC §5.
 *
 * This route is read-only and must never overstate what happened:
 *  - a reference is shown only when `?ref=` matches the issued format;
 *  - with no (or a malformed) reference the page says plainly that it cannot
 *    confirm a specific submission;
 *  - no email or SMS is claimed, because none is sent — no enquiries inbox or
 *    notification channel is configured yet.
 *
 * Not `force-static`: the page reads `searchParams`, so it is rendered per
 * request. That is the correct trade for a confirmation page, and `robots`
 * below keeps it out of search results either way.
 */

export const metadata: Metadata = {
  title: "Enquiry received",
  description:
    "Confirmation that a workforce requirement reached MITT, with the reference to quote.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

const nextSteps = [
  {
    n: "01",
    title: "MITT reviews the requirement",
    body: "Trades, approximate numbers, site and timeline are checked against what MITT can realistically coordinate.",
  },
  {
    n: "02",
    title: "You may be asked to clarify",
    body: "Usually the trade mix, experience level, shift pattern or site conditions. A short reply is enough.",
  },
  {
    n: "03",
    title: "You get a direct answer",
    body: "A realistic next step, or a clear answer that the requirement cannot be supported. No response time is promised.",
  },
] as const;

interface ThankYouPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const raw = params.ref;
  const candidate = Array.isArray(raw) ? raw[0] : raw;
  const reference = isValidReference(candidate) ? candidate : null;

  return (
    <Section
      tone="dark"
      aria-labelledby="thank-you-heading"
      className="pt-28 md:pt-32"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-steel-hi">
            <span aria-hidden="true" className="h-px w-8 bg-copper" />
            Confirmation
          </p>

          <h1
            id="thank-you-heading"
            className="mt-5 max-w-[18ch] font-display text-[clamp(2.15rem,4.2vw,3.3rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ivory"
          >
            {reference ? "Enquiry received" : "Thank you"}
          </h1>

          <p className="copy mt-6 max-w-[52ch] text-ivory/85">
            {reference
              ? "If you have just submitted a requirement, it is stored under this reference and waiting for review by MITT."
              : "If you have just submitted a requirement, it has been stored and will be reviewed by MITT. This link carries no reference, so this page cannot confirm a specific submission."}
          </p>

          {reference ? (
            <div className="mt-9 border-y border-line py-6">
              <p className="text-[0.75rem] uppercase tracking-[0.16em] text-steel-hi">
                Your reference
              </p>
              <p className="mt-3 select-all font-display text-[1.375rem] font-medium tracking-[0.04em] text-ivory tabular-nums sm:text-[1.625rem]">
                {reference}
              </p>
              <p className="meta mt-3 max-w-[46ch] text-steel-hi">
                Quote this if you call {site.phone.display}. No separate email
                confirmation has been sent — an enquiries inbox is not live yet, so
                this page is the record that the enquiry reached MITT.
              </p>
            </div>
          ) : (
            <div className="mt-9 border-y border-line py-6">
              <p className="meta max-w-[50ch] text-steel-hi">
                No confirmation email has been sent, because no enquiries inbox is
                live yet. If you are unsure whether your enquiry went through, call{" "}
                <a
                  href={`tel:${site.phone.display.replace(/[^+\d]/g, "")}`}
                  className="text-ivory underline decoration-ivory/30 underline-offset-[0.3em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
                >
                  {site.phone.display}
                </a>{" "}
                and MITT will check.
              </p>
            </div>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/capabilities" size="lg">
              Explore our capabilities
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
            </Button>
            <Button href="/" variant="secondary" size="lg">
              Back to home
            </Button>
          </div>

          <p className="meta mt-8 max-w-[52ch] text-steel-hi">
            Need to add something to the requirement?{" "}
            <Link
              href="/contact"
              className="text-ivory underline decoration-ivory/30 underline-offset-[0.3em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
            >
              Send it as a follow-up
            </Link>{" "}
            or call, quoting the reference if you have one.
          </p>
        </div>

        <aside
          aria-labelledby="next-heading"
          className="lg:col-span-5 lg:border-l lg:border-line lg:pl-10"
        >
          <h2 id="next-heading" className="eyebrow text-steel-hi">
            What happens next
          </h2>

          <ol className="mt-6 border-t border-line">
            {nextSteps.map((step) => (
              <li key={step.n} className="flex gap-4 border-b border-line py-4">
                <span
                  aria-hidden="true"
                  className="font-display text-[0.7rem] font-medium leading-[1.9] tracking-[0.18em] tabular-nums text-copper-hi"
                >
                  {step.n}
                </span>
                <div>
                  <p className="text-[0.9375rem] font-medium leading-snug text-ivory">
                    {step.title}
                  </p>
                  <p className="meta mt-1.5 max-w-[40ch] text-steel-hi">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="meta mt-6 max-w-[38ch] text-steel-hi">
            Nothing further is needed from you unless MITT asks a question.
          </p>
        </aside>
      </div>
    </Section>
  );
}
