import Link from "next/link";
import { nav, site } from "@/content/site";

/** Wider than the literal union in `site`, so the flag - not the call site - decides. */
interface ContactEntry {
  display: string;
  href: string;
  placeholder?: boolean;
}

/**
 * A contact value renders from its own flag, so swapping a placeholder for a
 * confirmed value is a content change and nothing else:
 *
 * - confirmed (`placeholder: false` with an href) -> a real, routable link;
 * - unconfirmed -> an intentional uppercase chip. Never a fake value styled
 *   like a link, never underlined, never an href.
 */
function ContactValue({ entry }: { entry: ContactEntry }) {
  if (entry.placeholder || entry.href.length === 0) {
    return (
      <dd className="mt-1.5">
        <span className="pending-chip" title={entry.display}>
          Pending confirmation
        </span>
      </dd>
    );
  }

  return (
    <dd className="mt-1.5">
      <a
        href={entry.href}
        className="text-[1rem] font-medium text-ivory underline decoration-ivory/30 decoration-1 underline-offset-[0.3em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
      >
        {entry.display}
      </a>
    </dd>
  );
}

/**
 * `site.phone.href` is stored masked in content, so the dialable URI is derived
 * from the published display number - same rule /contact and /about use.
 */
const telHref = (display: string) => `tel:${display.replace(/[^+\d]/g, "")}`;

/**
 * The hero still is representative trade imagery, but the facility photographs
 * on /training and /about are MITT's own - so the legal row has to say both
 * things rather than claim no photograph on the site is theirs.
 */
const mediaDisclaimer =
  "The hero image is representative trade photography, not a photograph of MITT workers or facilities. Facility photographs on this site are MITT's own.";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const emailPending = site.email.placeholder;

  return (
    <footer className="border-t border-line bg-ink">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="font-display text-2xl font-bold tracking-[-0.05em] text-ivory">
            {site.name}
          </p>
          <p className="meta mt-2 text-steel-hi">{site.legalName}</p>
          <p className="copy mt-6 max-w-[34ch] text-ivory/90">
            {site.brandLine}
          </p>
          <p className="mt-6 flex items-center gap-2 text-[0.78125rem] uppercase tracking-[0.16em] text-steel-hi">
            <span aria-hidden="true" className="h-px w-6 bg-copper" />
            {site.locationLine}
          </p>
        </div>

        <nav aria-label="Footer" className="lg:col-span-3">
          <h2 className="eyebrow text-steel-hi">Explore</h2>
          <ul className="mt-5 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[0.9375rem] text-ivory/90 transition-colors duration-200 hover:text-ivory"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h2 className="eyebrow text-steel-hi">Contact</h2>
          <dl className="mt-5 space-y-5">
            <div>
              <dt className="text-[0.78125rem] uppercase tracking-[0.14em] text-steel-hi">
                Telephone
              </dt>
              <ContactValue
                entry={{ ...site.phone, href: telHref(site.phone.display) }}
              />
              <dd className="mt-2">
                <ul className="space-y-1">
                  {site.secondaryPhones.map((phone) => (
                    <li key={phone.href}>
                      <a
                        href={telHref(phone.display)}
                        className="text-[0.9375rem] text-ivory/85 underline decoration-ivory/25 decoration-1 underline-offset-[0.25em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
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
                Email
              </dt>
              <ContactValue entry={site.email} />
              {site.secondaryEmail.href.length > 0 ? (
                <dd className="mt-2">
                  <a
                    href={site.secondaryEmail.href}
                    className="text-[0.9375rem] text-ivory/85 underline decoration-ivory/25 decoration-1 underline-offset-[0.25em] transition-colors duration-200 hover:text-copper-hi hover:decoration-copper-hi"
                  >
                    {site.secondaryEmail.display}
                  </a>
                </dd>
              ) : null}
            </div>
            <div>
              <dt className="text-[0.78125rem] uppercase tracking-[0.14em] text-steel-hi">
                Location
              </dt>
              <dd className="mt-1.5 text-[0.9375rem] text-ivory">
                {site.locationLine}
              </dd>
            </div>
          </dl>
          {emailPending ? (
            <p className="meta mt-5 max-w-[38ch] text-steel-hi">
              Enquiries email is pending confirmation and is not yet routable.
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-3 py-7 text-[0.78125rem] leading-relaxed text-steel-hi md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-8">
          <p className="max-w-[52ch]">{mediaDisclaimer}</p>
          <p>
            &copy; {year} {site.legalName}. All rights reserved.
          </p>
          <p>{site.technologyPartner.attribution}.</p>
        </div>
      </div>
    </footer>
  );
}
