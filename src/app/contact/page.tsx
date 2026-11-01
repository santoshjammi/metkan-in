import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { site, scopeCaveat } from "@/content/site";

export const metadata: Metadata = {
  title: "Discuss your workforce requirement",
  description:
    "Send MITT the trades, approximate numbers, site and timeline for a workforce requirement. Enquiries are reviewed and answered directly; no response time is promised.",
  alternates: { canonical: "/contact" },
};

/**
 * `site.phone.href` carries a masked value in content (the number itself is
 * verified, the anchor string is not), so the dialable href is derived from the
 * published display number. One source of truth, no second hard-coded number.
 */
const telHref = `tel:${site.phone.display.replace(/[^+\d]/g, "")}`;

const responseSteps = [
  {
    n: "01",
    title: "MITT reads the requirement",
    body: "Trades, approximate numbers, site and timeline are checked against what MITT can realistically coordinate.",
  },
  {
    n: "02",
    title: "Anything unclear is clarified",
    body: "Usually the trade mix, experience level, shift pattern or site conditions — the detail that decides whether someone is genuinely suitable.",
  },
  {
    n: "03",
    title: "You get a straight answer",
    body: "A realistic next step, or a clear answer that the requirement cannot be supported. Nothing is promised before that review.",
  },
] as const;

const beforeYouSend = [
  {
    title: "Employers and agencies only",
    body: "This is a commercial enquiry form for organisations. There is no worker registration, candidate profile or login anywhere on this site.",
  },
  {
    title: "No fees and no documents",
    body: "MITT does not collect fees, passport details, medical records or visa documents through this website. Do not send them through this form.",
  },
  {
    title: "What happens to your details",
    body: "Name, organisation, email and the requirement detail you choose to add are used to review and answer this enquiry. They are stored on MITT's own systems.",
  },
  {
    title: "A conversation, not an engagement",
    body: `Sending a requirement starts a discussion. ${scopeCaveat}`,
  },
] as const;

export default function ContactPage() {
  return (
    <>
      {/* Graphite curtain so the ink form act below is a distinct intensity. */}
      <PageHero
        id="contact-heading"
        eyebrow="Enquiry"
        index="01"
        tone="graphite"
        title="Discuss your workforce requirement"
        lede="Send the trades, approximate numbers, the site and when you need people. That is enough to start. MITT reviews the requirement and replies directly — including a clear answer if it cannot be supported."
        meta={{
          label: "What to send",
          items: [
            "Trades needed",
            "Approximate numbers",
            "Site or project location",
            "Timeline",
          ],
        }}
      />

      <Section
        tone="dark"
        aria-label="Enquiry form and contact details"
        className="border-b border-line"
      >
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>

          <aside
            aria-labelledby="contact-methods-heading"
            className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start lg:border-l lg:border-line lg:pl-10"
          >
            <h2 id="contact-methods-heading" className="eyebrow text-steel-hi">
              Speak to MITT directly
            </h2>

            <dl className="mt-6 space-y-7">
              <div>
                <dt className="text-[0.78125rem] uppercase tracking-[0.14em] text-steel-hi">
                  Telephone
                </dt>
                <dd className="mt-2">
                  <a
                    href={telHref}
                    className="inline-flex items-center gap-2 text-[1.0625rem] font-medium text-ivory underline decoration-ivory/30 decoration-1 underline-offset-[0.3em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
                  >
                    <Phone
                      aria-hidden="true"
                      size={15}
                      strokeWidth={1.6}
                      className="text-copper-hi"
                    />
                    {site.phone.display}
                  </a>
                  {/* The two additional numbers MITT publishes, in its own order. */}
                  <ul className="mt-3 space-y-1.5">
                    {site.secondaryPhones.map((phone) => (
                      <li key={phone.href}>
                        <a
                          href={`tel:${phone.display.replace(/[^+\d]/g, "")}`}
                          className="text-[0.9375rem] text-ivory/85 underline decoration-ivory/25 decoration-1 underline-offset-[0.3em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
                        >
                          {phone.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>

              <div>
                <dt className="text-[0.78125rem] uppercase tracking-[0.14em] text-steel-hi">
                  Postal address
                </dt>
                <dd className="mt-2">
                  <address className="not-italic text-[0.9375rem] leading-relaxed text-ivory/90">
                    {site.address.line1}, {site.address.line2}
                    <br />
                    {site.address.city} {site.address.postalCode}
                    <br />
                    {site.address.region}, {site.address.country}
                  </address>
                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-copper-hi underline decoration-copper/40 underline-offset-[0.25em] transition-colors duration-200 hover:text-ivory hover:decoration-ivory/60"
                  >
                    Search this address on Google Maps
                    <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.7} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-[0.78125rem] uppercase tracking-[0.14em] text-steel-hi">
                  Email
                </dt>
                <dd className="mt-2">
                  {/* Both addresses are MITT's own published inboxes. */}
                  <a
                    href={site.email.href}
                    className="text-[1.0625rem] font-medium text-ivory underline decoration-ivory/30 decoration-1 underline-offset-[0.3em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
                  >
                    {site.email.display}
                  </a>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed">
                    <a
                      href={site.secondaryEmail.href}
                      className="text-steel-hi underline decoration-steel-hi/40 decoration-1 underline-offset-[0.25em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
                    >
                      {site.secondaryEmail.display}
                    </a>
                  </p>
                  <p className="meta mt-3 max-w-[38ch] text-steel-hi">
                    MITT publishes both addresses. Either reaches the same
                    enquiry review as the form.
                  </p>
                </dd>
              </div>
            </dl>

            <div className="mt-10 border-t border-line pt-7">
              <h3 className="eyebrow text-steel-hi">What happens after you send it</h3>
              <ol className="mt-5 space-y-4">
                {responseSteps.map((step) => (
                  <li key={step.n} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="font-display text-[0.7rem] font-medium leading-[1.9] tracking-[0.18em] tabular-nums text-copper-hi"
                    >
                      {step.n}
                    </span>
                    <div>
                      <p className="text-[0.9rem] font-medium leading-snug text-ivory">
                        {step.title}
                      </p>
                      <p className="meta mt-1.5 max-w-[40ch] text-steel-hi">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="meta mt-5 max-w-[40ch] border-l border-copper/50 pl-4 text-steel-hi">
                No response time is promised. A reply follows the review, not a
                queue.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="light" aria-labelledby="contact-notes-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="contact-notes-heading"
              eyebrow="Before you send"
              index="02"
              tone="light"
              title="What this form is, and what it isn’t."
            />
            <p className="meta mt-8 max-w-[34ch] border-t border-line-ink pt-4 text-steel-ink">
              MITT reviews every requirement by hand. Automated bulk submissions
              are rejected.
            </p>
          </div>

          <div className="lg:col-span-8">
            <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {beforeYouSend.map((item) => (
                <div key={item.title} className="border-t border-line-ink pt-4">
                  <dt className="text-[0.95rem] font-medium text-text-dark">
                    {item.title}
                  </dt>
                  <dd className="copy-ink mt-2 text-[0.9375rem]">{item.body}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-col gap-4 border-t border-line-ink pt-6 sm:flex-row sm:items-center sm:gap-8">
              <Link
                href="/for-employers"
                className="link-line text-[0.875rem] font-medium text-text-dark hover:text-copper-ink"
              >
                What a requirement can include
              </Link>
              <Link
                href="/privacy"
                className="link-line text-[0.875rem] font-medium text-text-dark hover:text-copper-ink"
              >
                Privacy notice
              </Link>
              <Link
                href="/capabilities"
                className="link-line text-[0.875rem] font-medium text-text-dark hover:text-copper-ink"
              >
                Capability categories
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
