import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { site } from "@/content/site";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata: Metadata = buildMetadata({
  title: "Privacy notice",
  description:
    "How MITT handles information sent through this website's employer enquiry form: what is collected, why, how long it is kept, who sees it, and your rights under India's Digital Personal Data Protection Act, 2023.",
  path: "/privacy",
});

/**
 * Built from the verified display number rather than a stored href, so the
 * tel: URI always carries the full digits.
 */
const telHref = `tel:${site.phone.display.replace(/[^\d+]/g, "")}`;

/** Rendered from `legalReviewPending` — the flag, not the page, decides. */
function DraftNotice() {
  return (
    <div
      role="note"
      className="flex flex-col gap-3 border border-copper/55 bg-copper/[0.08] p-5 sm:flex-row sm:items-center sm:gap-5 md:p-6"
    >
      <Badge tone="copper">Draft — pending legal review</Badge>
      <p className="meta text-copy-ink">
        This notice is a working draft prepared for this website. It has not yet
        been reviewed by a qualified legal professional, does not constitute
        legal advice, and will be replaced by a reviewed version before it is
        relied upon.
      </p>
    </div>
  );
}

function LegalHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-12 font-display text-h3 font-medium text-text-dark">
      {children}
    </h2>
  );
}

function LegalList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex max-w-[62ch] items-baseline gap-3 text-[0.95rem] leading-[1.7] text-copy-ink"
        >
          <span
            aria-hidden="true"
            className="h-1 w-1 shrink-0 translate-y-[-0.15em] bg-copper-ink"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        id="privacy-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy notice", path: "/privacy" },
        ])}
      />

      <PageHero
        eyebrow="Legal"
        title="Privacy notice."
        lede="What this website does with the information you send it, written for this site specifically rather than as a generic policy."
        meta={{
          label: "In this notice",
          items: [
            "What is collected",
            "Why, and on what basis",
            "Retention and access",
            "Your rights and how to use them",
          ],
        }}
      />

      <Section tone="light">
        {site.legalReviewPending ? <DraftNotice /> : null}

        <div className="mt-10 max-w-[68ch]">
          <p className="copy-ink">
            This notice covers the MITT marketing website and the employer
            enquiry form on it. It is written with reference to India’s Digital
            Personal Data Protection Act, 2023. It does not describe records MITT
            keeps while working on an employer requirement; those are handled
            under the terms agreed with that employer.
          </p>

          <LegalHeading>What this website collects</LegalHeading>
          <p className="copy-ink mt-3">
            When you submit the enquiry form, the site receives the details you
            type into it:
          </p>
          <LegalList
            items={[
              "Your name, your organisation and a work email address.",
              "Optionally: a telephone number, the trades you are interested in, an approximate number of positions, a location, an employment type, a timeline and any notes you add.",
            ]}
          />
          <p className="copy-ink mt-4">
            The form also performs two technical checks that are not personal
            information: a hidden field that a person leaves empty, and how long
            the page was open before submission. They exist to filter automated
            submissions.
          </p>
          <p className="copy-ink mt-4">
            A submission creates a server log line containing the enquiry
            reference, the timestamp and the type of organisation — never the
            contents of your message.
          </p>

          <LegalHeading>Why it is held</LegalHeading>
          <p className="copy-ink mt-3">
            To read the requirement, clarify scope where it is unclear, and reply
            with a realistic next step. That is the only purpose for which
            enquiry details are used.
          </p>

          <LegalHeading>The basis for processing</LegalHeading>
          <p className="copy-ink mt-3">
            Consent, given through the consent checkbox on the form. Consent can
            be withdrawn at any time by asking for the enquiry to be deleted;
            withdrawing it does not affect anything done before that point.
          </p>

          <LegalHeading>How long it is kept</LegalHeading>
          <p className="copy-ink mt-3">
            An enquiry is retained while the commercial relationship it belongs
            to is active, and deleted when you ask for it to be deleted. MITT
            does not operate a fixed retention period, so none is stated here.
          </p>

          <LegalHeading>Who can see it</LegalHeading>
          <p className="copy-ink mt-3">
            Authorised MITT staff who handle employer enquiries. Enquiry details
            are not sold, rented or traded, and are not shared for marketing.
          </p>

          <LegalHeading>What this site does not do</LegalHeading>
          <LegalList
            items={[
              "No third-party analytics or advertising trackers run on this site by default.",
              "No advertising or profiling cookies are set, and no profile of you is built across other sites.",
              "No passport, medical, visa, biometric or fee and payment details are collected here.",
              "No worker registration, candidate profile, login or dashboard exists on this site.",
              "No automated decision about you is made from an enquiry.",
            ]}
          />

          <LegalHeading>Your rights</LegalHeading>
          <p className="copy-ink mt-3">
            As a data principal under the Digital Personal Data Protection Act,
            2023, you can ask to:
          </p>
          <LegalList
            items={[
              "access a summary of the personal data held about you and how it is processed;",
              "correct or complete anything inaccurate;",
              "erase data that is no longer needed for the purpose it was given for;",
              "nominate another person to exercise these rights in the event of death or incapacity;",
              "raise a grievance about how your data has been handled.",
            ]}
          />
          <p className="copy-ink mt-4">
            Requests can be made by telephone on{" "}
            <a
              href={telHref}
              className="text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-ink"
            >
              {site.phone.display}
            </a>{" "}
            or by post to {site.addressLine}. If a request cannot be met, MITT
            will say so and explain why.
          </p>

          <LegalHeading>Changes to this notice</LegalHeading>
          <p className="copy-ink mt-3">
            If this notice changes, the revised version is published on this
            page. The reviewed version will replace this draft.
          </p>
        </div>
      </Section>

      <Section tone="dark" aria-labelledby="privacy-contact-heading">
        <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <h2
              id="privacy-contact-heading"
              className="font-display text-h3 font-medium text-ivory"
            >
              Questions about your data
            </h2>
            <p className="copy mt-3 max-w-[40ch] text-[0.95rem]">
              Ask for MITT directly, or send a written request to the address
              below.
            </p>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <address className="not-italic text-[0.95rem] leading-[1.8] text-ivory/90">
              {site.legalName}
              <br />
              {site.address.line1}, {site.address.line2}
              <br />
              {site.address.city} {site.address.postalCode}
              <br />
              {site.address.region}, {site.address.country}
              <br />
              <a
                href={telHref}
                className="text-ivory underline decoration-line-strong decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-hi"
              >
                {site.phone.display}
              </a>
            </address>
            <p className="meta mt-4 text-steel-hi">
              For a workforce requirement rather than a data request, use the{" "}
              <Link
                href="/contact"
                className="text-ivory underline decoration-line-strong decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-hi"
              >
                enquiry form
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
