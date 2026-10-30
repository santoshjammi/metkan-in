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

const LAST_UPDATED = "30 October 2026";

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
            "What these terms cover",
            "An enquiry is not a contract",
            "Accuracy and availability",
            "Liability, law and jurisdiction",
          ],
        }}
      />

      <Section tone="light">
        {site.legalReviewPending ? <DraftNotice /> : null}

        <div className="mt-10 max-w-[68ch]">
          <p className="copy-ink">
            These terms govern use of the {site.legalName} ({site.name}) website.
            By using the site you accept them. They are not terms of any
            engagement: work with MITT is agreed separately, in writing, with the
            organisation concerned.
          </p>

          <LegalHeading>What these terms cover</LegalHeading>
          <p className="copy-ink mt-3">
            These terms apply to this informational website: the public pages
            that describe MITT, the trades it works with, its training
            capabilities and its process, and the employer enquiry form that
            sends a requirement to MITT.
          </p>
          <p className="copy-ink mt-4">
            They do not govern any recruitment, training, screening or deployment
            service, any worker or candidate record, or any use of the internal
            platform MITT runs a live requirement on. Those are governed by the
            terms agreed with the employer or the worker concerned. How this site
            handles personal data is described separately in the privacy notice.
          </p>

          <LegalHeading>An enquiry creates no contract</LegalHeading>
          <p className="copy-ink mt-3">
            Submitting the enquiry form, or telephoning MITT, is an invitation to
            discuss a requirement. It does not create a contract, an offer, an
            acceptance, a placement, an engagement or a confirmed joining, and it
            obliges neither MITT to supply workers nor you to engage them.
          </p>
          <p className="copy-ink mt-4">
            Nothing on this site is a quotation, a price list or a commitment to
            supply. An enquiry is not an order, and MITT’s acknowledgement of an
            enquiry — including the reference number the form returns — records
            only that the enquiry was received.
          </p>
          <p className="copy-ink mt-4">
            No guarantee is given of the availability of workers in any trade, of
            a candidate being put forward, of a candidate being selected, of a
            selected candidate joining, or of any commercial or operational
            outcome. Interview, selection, medical clearance, documentation and
            joining are separate events, and are treated as separate events.
          </p>

          <LegalHeading>Accuracy of information</LegalHeading>
          <p className="copy-ink mt-3">
            Content here is published in good faith and describes MITT’s
            operating model as it stands. It may change without notice, and it
            may be incomplete on a point that matters to you — which is what the
            enquiry process exists to settle.
          </p>
          <p className="copy-ink mt-4">
            Two things follow from that. First, a capability category lists the
            skills MITT assesses in a trade; it does not mean candidates are
            available in that trade today. Second, availability, scope,
            preparation and any commercial terms vary by trade, employer,
            assignment and jurisdiction, and are confirmed per requirement rather
            than taken from this site.
          </p>
          <p className="copy-ink mt-4">
            Where international activity is involved, it is coordinated through
            authorised partners and remains subject to applicable law and the
            permissions those partners hold. This website does not advertise
            independent overseas recruitment authorisation, and nothing on it
            promises a visa, a clearance or an approval.
          </p>

          <LegalHeading>Acceptable use</LegalHeading>
          <p className="copy-ink mt-3">
            Use this site as it is intended to be used. In particular, do not:
          </p>
          <LegalList
            items={[
              "scrape, crawl or systematically copy the site at scale, or republish its content as your own;",
              "submit enquiries in bulk or by automation, or script the enquiry endpoint;",
              "attempt to access non-public areas, other users’ submissions or the systems behind the site, or probe it for vulnerabilities without written permission;",
              "bypass, disable or interfere with the protections on the enquiry form, including its validation, its rate limiting and its automated-submission filters;",
              "submit information that is false, misleading, or not yours to provide;",
              "represent yourself as acting for MITT, or as having an affiliation with MITT, when you do not;",
              "use the site for anything unlawful, or in a way that infringes another person’s rights.",
            ]}
          />
          <p className="copy-ink mt-4">
            MITT may restrict or block access where it has reasonable grounds to
            believe the site is being used in any of those ways.
          </p>

          <LegalHeading>Intellectual property</LegalHeading>
          <p className="copy-ink mt-3">
            The text, layout, design and code of this site, and the MITT name and
            marks, belong to MITT or are used with permission. No part of the
            site may be copied, republished, mirrored or used commercially
            without written permission, other than short quotation with
            attribution for review, comment or reporting.
          </p>
          <p className="copy-ink mt-4">
            The site was engineered by{" "}
            {site.technologyPartner.name}, which is credited in the footer as
            MITT’s technology partner. That credit records who built the site. It
            is not a transfer of ownership of the site, its content or the MITT
            marks to {site.technologyPartner.name}, and it does not make that
            firm MITT’s parent, agent or representative.
          </p>
          <p className="copy-ink mt-4">
            Imagery on this site is representative of trade work unless it is
            captioned as a photograph of MITT premises or MITT candidates.
          </p>

          <LegalHeading>Links to other sites</LegalHeading>
          <p className="copy-ink mt-3">
            Where this site links to a third-party page — including a map link
            for MITT’s address — MITT does not control that page, does not
            endorse it, and is not responsible for its content, its availability
            or its handling of your data. Visiting a linked site is at your own
            risk and on that site’s terms.
          </p>

          <LegalHeading>Limitation of liability</LegalHeading>
          <p className="copy-ink mt-3">
            Nothing in these terms excludes or limits any liability that
            applicable law does not permit to be excluded or limited, and nothing
            in them affects statutory rights you have that cannot be waived.
          </p>
          <p className="copy-ink mt-4">
            Subject to that, and to the extent permitted by applicable law, MITT
            is not liable for loss or damage arising from your use of, or
            inability to use, this website; from reliance on information
            published on it; from any interruption, error or omission in its
            content; or from any indirect or consequential loss, loss of profit,
            loss of business or loss of opportunity, however arising.
          </p>
          <p className="copy-ink mt-4">
            The site is provided as it is. MITT does not warrant that it will be
            available without interruption, that it is free of errors, or that
            any defect will be corrected. This section limits liability for the
            website; it does not limit any liability that arises under a separate
            written engagement.
          </p>

          <LegalHeading>Governing law and jurisdiction</LegalHeading>
          <p className="copy-ink mt-3">
            These terms are governed by the laws of India. Subject to the wording
            below being confirmed, the courts at Visakhapatnam, Andhra Pradesh
            are intended to have jurisdiction over any dispute arising from use
            of this website, and the parties are expected to attempt to resolve
            any such dispute with MITT directly before approaching a court.
          </p>
          <div className="mt-5 border border-copper/55 bg-copper/[0.08] p-5 md:p-6">
            <p className="font-display text-[1.05rem] font-medium text-text-dark">
              [JURISDICTION WORDING - TO BE CONFIRMED]
            </p>
            <p className="meta mt-3 text-copy-ink">
              The governing-law and jurisdiction clause above is a drafting
              position, not a settled clause. Whether exclusive jurisdiction
              should be claimed, and the precise court description, require legal
              confirmation before this page goes live.
            </p>
          </div>

          <LegalHeading>Other provisions</LegalHeading>
          <p className="copy-ink mt-3">
            If any provision of these terms is held to be unenforceable, the
            remaining provisions continue in effect. A failure to enforce a
            provision on one occasion is not a waiver of it. These terms, with
            the privacy notice, are the whole of what governs use of the website;
            they do not replace or vary any separate written agreement with MITT.
          </p>

          <LegalHeading>Changes to these terms</LegalHeading>
          <p className="copy-ink mt-3">
            These terms may be updated. The version published on this page is the
            version that applies, and the last-updated line changes with it. If a
            change materially affects how the site may be used, it will be
            described here rather than folded silently into a new version.
          </p>
          <p className="copy-ink mt-4">
            This is version 1 of the terms, prepared as a draft for legal review.
          </p>
          <p className="meta mt-8 text-steel-ink">
            Last updated: {LAST_UPDATED}. Draft — pending legal review.
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
