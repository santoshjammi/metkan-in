import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { Section } from "@/components/marketing/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { site } from "@/content/site";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata: Metadata = buildMetadata({
  title: "Website terms of use",
  description:
    "Terms for using the MITT website: acceptable use, enquiries creating no contract, accuracy of information, intellectual property, no guarantee of workers or outcomes, and applicable law.",
  path: "/terms",
});

/** Rendered from `legalReviewPending` — the flag, not the page, decides. */
function DraftNotice() {
  return (
    <div
      role="note"
      className="flex flex-col gap-3 border border-copper/55 bg-copper/[0.08] p-5 sm:flex-row sm:items-center sm:gap-5 md:p-6"
    >
      <Badge tone="copper">Draft — pending legal review</Badge>
      <p className="meta text-copy-ink">
        These terms are a working draft prepared for this website. They have not
        yet been reviewed by a qualified legal professional, including the
        governing-law and jurisdiction wording, and will be replaced by a
        reviewed version.
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

export default function TermsPage() {
  return (
    <>
      <JsonLd
        id="terms-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ])}
      />

      <PageHero
        eyebrow="Legal"
        title="Website terms of use."
        lede="The rules for using this website, and what an enquiry through it does and does not create."
        meta={{
          label: "In these terms",
          items: [
            "Acceptable use",
            "Enquiries create no contract",
            "Accuracy and availability",
            "Intellectual property and law",
          ],
        }}
      />

      <Section tone="light">
        {site.legalReviewPending ? <DraftNotice /> : null}

        <div className="mt-10 max-w-[68ch]">
          <p className="copy-ink">
            These terms govern use of the {site.legalName} ({site.name}) website.
            By using the site you accept them. They are not terms of any
            engagement: work with MITT is agreed separately with the organisation
            concerned.
          </p>

          <LegalHeading>Acceptable use</LegalHeading>
          <LegalList
            items={[
              "Do not submit information that is false, misleading or not yours to provide.",
              "Do not attempt to interfere with the site, probe it for vulnerabilities without written permission, or bypass the protections on the enquiry form.",
              "Do not run automated access at a rate that degrades the service for others.",
              "Do not represent yourself as acting for MITT, or as having an affiliation with MITT, when you do not.",
            ]}
          />

          <LegalHeading>An enquiry creates no contract</LegalHeading>
          <p className="copy-ink mt-3">
            Submitting the enquiry form is an invitation to discuss a
            requirement. It does not create a contract, an offer of employment, a
            placement or a confirmed join, and it obliges neither MITT to supply
            workers nor you to engage them. Nothing on this site is a quotation.
          </p>

          <LegalHeading>Accuracy of information</LegalHeading>
          <p className="copy-ink mt-3">
            Content here describes MITT’s operating model. Capability categories
            list the skills assessed in a trade and do not mean candidates are
            currently available in it. Availability, scope, preparation and any
            commercial terms are confirmed per requirement and may change
            without notice.
          </p>

          <LegalHeading>No guarantee of workers or outcomes</LegalHeading>
          <p className="copy-ink mt-3">
            MITT coordinates a process and does not control its outcome. No
            guarantee is given of the availability of workers in any trade, of a
            candidate being selected, of a selected candidate joining, or of any
            commercial result. Interview, selection, medical clearance,
            documentation and joining are separate events, and are treated as
            separate events.
          </p>

          <LegalHeading>Overseas activity</LegalHeading>
          <p className="copy-ink mt-3">
            Where international activity is involved it is coordinated through
            authorised partners and remains subject to applicable law and
            permissions. This website does not advertise independent overseas
            recruitment authorisation, and nothing on it promises a visa,
            clearance or approval.
          </p>

          <LegalHeading>Intellectual property</LegalHeading>
          <p className="copy-ink mt-3">
            The text, layout and design of this site, and the MITT name and
            marks, belong to MITT. Imagery is representative of trade work and is
            not a photograph of MITT workers or facilities. No part of this site
            may be copied, republished or used commercially without permission,
            other than short quotation with attribution for review or comment.
          </p>

          <LegalHeading>Links to other sites</LegalHeading>
          <p className="copy-ink mt-3">
            Where this site links to a third-party page, MITT does not control
            that page and is not responsible for its content or its handling of
            your data.
          </p>

          <LegalHeading>Changes to these terms</LegalHeading>
          <p className="copy-ink mt-3">
            These terms may be updated. The version published on this page is the
            version that applies.
          </p>

          <LegalHeading>Governing law and jurisdiction</LegalHeading>
          <p className="copy-ink mt-3">
            These terms are governed by the laws of India. Jurisdiction is
            intended to sit in Andhra Pradesh, India. The precise court wording
            has not been confirmed and is pending legal review; the reviewed
            version will state it.
          </p>
        </div>
      </Section>

      <Section tone="dark" aria-labelledby="terms-contact-heading">
        <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <h2
              id="terms-contact-heading"
              className="font-display text-h3 font-medium text-ivory"
            >
              Questions about these terms
            </h2>
            <p className="copy mt-3 max-w-[40ch] text-[0.95rem]">
              Raise them with MITT directly, by telephone or by post.
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
              {site.phone.display}
            </address>
          </div>
        </div>
      </Section>
    </>
  );
}
