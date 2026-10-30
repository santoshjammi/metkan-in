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

const LAST_UPDATED = "30 October 2026";

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
            "What is collected, and what is not",
            "Why, and on what basis",
            "Retention, access and storage",
            "Your rights and how to use them",
          ],
        }}
      />

      <Section tone="light">
        {site.legalReviewPending ? <DraftNotice /> : null}

        <div className="mt-10 max-w-[68ch]">
          <p className="copy-ink">
            This is the privacy notice of {site.legalName} ({site.name}) for this
            website, given under India’s Digital Personal Data Protection Act,
            2023 (the DPDP Act) and read alongside the Information Technology
            Act, 2000. MITT is the data fiduciary for the information described
            here. It explains what this site collects, why, who can see it, how
            long it is kept and what you can ask MITT to do with it.
          </p>

          <LegalHeading>Who we are, and what this notice covers</LegalHeading>
          <p className="copy-ink mt-3">
            {site.legalName} is a technical training and skilled-workforce
            coordination organisation based at {site.addressLine}. Its published
            telephone number is{" "}
            <a
              href={telHref}
              className="text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-ink"
            >
              {site.phone.display}
            </a>
            . No enquiries email address is published at present, so written
            contact is by post.
          </p>
          <p className="copy-ink mt-4">
            This notice covers two things only: the public pages of this website,
            and the employer enquiry form on it, together with the record that
            form creates on MITT’s server.
          </p>
          <p className="copy-ink mt-4">
            It does not cover the internal platform MITT uses to run a live
            requirement, any worker or candidate record held in that platform, or
            any record MITT keeps in the course of a contract with an employer.
            Those are separate processing activities, described to the parties
            concerned under their own terms. Nothing on this website is a worker
            portal, a candidate database or a login.
          </p>

          <LegalHeading>What this website collects</LegalHeading>
          <p className="copy-ink mt-3">
            The enquiry form asks for the following, and the site stores what you
            type into it:
          </p>
          <LegalList
            items={[
              "Your name, the name of your organisation, and a work email address.",
              "Optionally, a telephone number. The form does not require one.",
              "The type of organisation you are enquiring as (employer, agency or other).",
              "The trades the requirement covers, up to eight selections from the site’s list.",
              "An approximate number of positions, expressed as a band rather than an exact figure.",
              "A location, an employment type (permanent, contract or other) and a timeline, each optional and each chosen from a fixed list.",
              "Any free-text notes you add to describe the requirement.",
              "The consent checkbox, and the date and time the submission reached the server.",
            ]}
          />
          <p className="copy-ink mt-4">
            Values are normalised before storage: text is trimmed, the email
            address is lower-cased, and any field the form does not define is
            rejected rather than stored. Each accepted submission receives a
            reference of the form MITT-YYMMDD-XXXXXX, which identifies the
            enquiry without containing personal data.
          </p>
          <p className="copy-ink mt-4">
            Two technical checks run alongside the form and are not personal
            information about you: a hidden field that a person leaves empty, and
            how long the page was open before submission. They exist only to
            filter automated submissions.
          </p>
          <p className="copy-ink mt-4">
            A submission writes one server log line containing the enquiry
            reference, the timestamp and the organisation type. It never contains
            your name, your message or any other field value.
          </p>

          <LegalHeading>What this website does not collect</LegalHeading>
          <p className="copy-ink mt-3">
            This site is a business enquiry channel, not a worker registration
            channel. There is no form here on which a worker can register, upload
            a document or apply for a job, and the enquiry form does not ask for
            any of the following:
          </p>
          <LegalList
            items={[
              "Worker profiles, CVs, candidate records or work histories.",
              "Passports, visas, emigration documents or any identity document.",
              "Medical or health records, disability information or fitness certificates.",
              "Biometric data of any kind.",
              "Payment, card or bank details.",
              "Worker fees, receipts or evidence of fees paid.",
              "Government identifiers such as Aadhaar, PAN or a registration number.",
            ]}
          />
          <p className="copy-ink mt-4">
            Please do not send any of that material through this website, and do
            not attach it to an enquiry. Anything of that kind sent unprompted to
            MITT is outside the scope of this notice and is dealt with separately
            from the enquiry record described here.
          </p>

          <LegalHeading>Why we process it, and nothing else</LegalHeading>
          <p className="copy-ink mt-3">
            Enquiry details are used for three connected purposes and no others:
          </p>
          <LegalList
            items={[
              "To read the requirement and assess whether MITT can realistically help with it.",
              "To contact you to clarify scope, timing or trade where the enquiry is unclear, and to reply with a next step.",
              "To keep a record of the commercial conversation, so that what was asked and what was said is not lost between calls.",
            ]}
          />
          <p className="copy-ink mt-4">
            MITT does not use an enquiry for marketing, does not add you to a
            mailing list, does not build a profile of you, does not make an
            automated decision about you, and does not sell, rent or trade the
            details. If MITT ever wants to use an enquiry for something beyond
            the three purposes above, it will ask you first and record that
            separate consent.
          </p>

          <LegalHeading>The basis for processing: your consent</LegalHeading>
          <p className="copy-ink mt-3">
            MITT relies on your consent, given by ticking the consent checkbox on
            the form. The checkbox is not pre-ticked, the form will not submit
            without it, and the fact of consent is recorded with the submission
            together with the server-side timestamp. Consent covers being
            contacted about that enquiry and nothing further.
          </p>
          <p className="copy-ink mt-4">
            You can withdraw consent at any time by telephoning{" "}
            <a
              href={telHref}
              className="text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-ink"
            >
              {site.phone.display}
            </a>{" "}
            or writing to the postal address below. Withdrawal does not affect
            anything done before it, and on withdrawal the enquiry record is
            deleted unless MITT is required by law to keep it, in which case MITT
            will tell you which law and for how long.
          </p>

          <LegalHeading>How long it is kept</LegalHeading>
          <p className="copy-ink mt-3">
            An enquiry is kept while the enquiry or the commercial relationship
            it belongs to is active, and is deleted when you ask for it to be
            deleted. Retention is reviewed against the purpose above rather than
            assumed, so a closed or dormant enquiry is not kept indefinitely.
          </p>
          <p className="copy-ink mt-4">
            A defined retention schedule — how long a closed enquiry is held
            before deletion, and what is kept after that — is being finalised
            with legal advice rather than stated prematurely. It will be
            published on this page.
          </p>
          <p className="mt-4 border border-copper/55 bg-copper/[0.08] p-4 text-[0.95rem] font-medium leading-[1.6] text-text-dark">
            [RETENTION SCHEDULE - TO BE CONFIRMED]
          </p>

          <LegalHeading>Who can see it</LegalHeading>
          <p className="copy-ink mt-3">
            Enquiry details are visible only to authorised MITT staff who handle
            employer enquiries, and only so far as they need them for the purpose
            above. They are not sold, rented, traded or shared for marketing, and
            are disclosed outside MITT only where the law requires it.
          </p>
          <p className="copy-ink mt-4">
            MITT uses service providers to run the site: a hosting provider that
            serves the pages and stores the enquiry record, and — where an enquiry
            notification is enabled — an email or messaging delivery provider.
            Those providers act only on MITT’s instructions, and written
            processor agreements must be in place before the site handles live
            enquiry data. None is named individually here yet.
          </p>
          <p className="mt-4 border border-copper/55 bg-copper/[0.08] p-4 text-[0.95rem] font-medium leading-[1.6] text-text-dark">
            [PROCESSOR AGREEMENTS - TO BE CONFIRMED]
          </p>

          <LegalHeading>Where it is stored</LegalHeading>
          <p className="copy-ink mt-3">
            The enquiry record is written to storage on the server infrastructure
            MITT uses to run this site, in a private directory that the website
            does not serve and that only the service account can read. It is not
            stored in your browser, and no copy is placed in the page, in
            analytics or in a public bucket.
          </p>
          <p className="copy-ink mt-4">
            Whether any hosting or delivery provider stores or processes that
            data outside India — and what the DPDP Act and any restriction
            notified by the Government require in that case — must be settled
            before launch, not after. The position will be stated here once it is
            known.
          </p>
          <p className="mt-4 border border-copper/55 bg-copper/[0.08] p-4 text-[0.95rem] font-medium leading-[1.6] text-text-dark">
            [CROSS-BORDER POSITION - TO BE CONFIRMED]
          </p>

          <LegalHeading>Your rights as a data principal</LegalHeading>
          <p className="copy-ink mt-3">
            As a data principal under the DPDP Act you can ask MITT to:
          </p>
          <LegalList
            items={[
              "give you a summary of the personal data held about you, the processing it is subject to, and the identity of any other data fiduciary or processor with whom it has been shared;",
              "correct anything inaccurate, and complete anything incomplete;",
              "erase data that is no longer needed for the purpose it was given for, unless a legal obligation requires it to be kept;",
              "withdraw the consent you gave, which stops any further processing on that basis;",
              "nominate another person to exercise these rights on your behalf in the event of death or incapacity;",
              "raise a grievance about how your data has been handled, using the route in the next section.",
            ]}
          />
          <p className="copy-ink mt-4">
            Make a request by telephone on{" "}
            <a
              href={telHref}
              className="text-text-dark underline decoration-line-ink decoration-1 underline-offset-[0.3em] transition-colors hover:text-copper-ink"
            >
              {site.phone.display}
            </a>{" "}
            or by post to {site.legalName}, {site.addressLine}, marked for the
            attention of the grievance contact. Say what you want done and,
            where you have it, quote the enquiry reference. MITT may ask for
            enough detail to locate the record and to confirm the request is
            yours; it will not ask for more than that.
          </p>
          <p className="copy-ink mt-4">
            MITT will acknowledge the request and answer it within the period the
            DPDP Act and its rules prescribe. Where a request cannot be met, MITT
            will say so in writing and explain why.
          </p>
          <p className="mt-4 border border-copper/55 bg-copper/[0.08] p-4 text-[0.95rem] font-medium leading-[1.6] text-text-dark">
            [RESPONSE TIMELINE - TO BE CONFIRMED]
          </p>

          <LegalHeading>Grievance redressal</LegalHeading>
          <p className="copy-ink mt-3">
            A grievance about how MITT has handled your data should go first to
            MITT. The DPDP Act requires a readily available grievance redressal
            mechanism and a named contact for it. That appointment has not yet
            been made for publication.
          </p>
          <div className="mt-5 border border-copper/55 bg-copper/[0.08] p-5 md:p-6">
            <p className="font-display text-[1.05rem] font-medium text-text-dark">
              [GRIEVANCE OFFICER - TO BE CONFIRMED]
            </p>
            <p className="meta mt-3 text-copy-ink">
              A named grievance officer, with a direct telephone number and a
              postal address, must be recorded here before this website goes
              live. Until that is done this notice is incomplete and the DRAFT
              chip at the top of this page stays.
            </p>
          </div>
          <p className="copy-ink mt-4">
            The DPDP Act also provides for a complaint to the Data Protection
            Board of India where a grievance is not resolved. MITT will set out
            that route, and its current procedure, once counsel has confirmed
            it.
          </p>

          <LegalHeading>How the enquiry data is protected</LegalHeading>
          <LegalList
            items={[
              "Server-side validation runs on the endpoint itself, not only in the browser: only the documented fields are accepted, unknown fields are rejected, and every value is length- and format-checked before anything is stored.",
              "The endpoint is rate limited per connection, so a single source cannot flood it, and automated submissions are filtered before they consume a real enquirer’s allowance.",
              "Stored enquiries sit in a private directory readable only by the service account that runs the site; they are not reachable over the web.",
              "Application logs carry the reference, the timestamp and the organisation type only. No name, email, message or other field value is logged.",
              "Analytics events, where enabled, are restricted to an allow-list of coarse values and can never carry a form field.",
              "MITT maintains reasonable security practices and procedures as contemplated by the Information Technology Act, 2000 and the rules made under it, to the extent those rules apply to the data described here.",
            ]}
          />
          <p className="copy-ink mt-4">
            This notice does not claim any security certification, audit or
            accreditation, because MITT holds none that has been verified for
            publication.
          </p>

          <LegalHeading>Children</LegalHeading>
          <p className="copy-ink mt-3">
            This website is for organisations and the people who represent them,
            and it is not directed at children. The enquiry form is not a route
            for a child to obtain a service, so the site operates no age gate and
            asks for no date of birth. MITT does not knowingly collect a child’s
            personal data through this website, does not use this site to track,
            behaviourally monitor or target advertising at children, and will
            delete any enquiry it discovers to have been submitted by a child.
          </p>

          <LegalHeading>Cookies and tracking</LegalHeading>
          <p className="copy-ink mt-3">
            This site sets no marketing or advertising cookies, and by default
            loads no third-party analytics, advertising or social tracking
            script. Nothing here builds a profile of you across other websites.
          </p>
          <p className="copy-ink mt-4">
            Because the site sets no non-essential cookies, it does not show a
            cookie banner. If a privacy-respecting analytics service is enabled
            in future, this notice will say so, and the banner will be added,
            before that change goes live. The site’s analytics code is written so
            that an event can carry only a coarse reason or status, never a form
            value.
          </p>

          <LegalHeading>Changes to this notice</LegalHeading>
          <p className="copy-ink mt-3">
            If this notice changes, the revised version is published on this page
            and the last-updated line changes with it. A change in what is
            collected, why, or who can see it will be described here in plain
            terms rather than folded silently into a new version.
          </p>
          <p className="copy-ink mt-4">
            This is version 1 of the notice, prepared as a draft for legal
            review. If you need to know what it said when you submitted an
            enquiry, ask MITT and it will be provided.
          </p>
          <p className="meta mt-8 text-steel-ink">
            Last updated: {LAST_UPDATED}. Draft — pending legal review.
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
              No enquiries email address is published yet; use the telephone
              number or post. For a workforce requirement rather than a data
              request, use the{" "}
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
