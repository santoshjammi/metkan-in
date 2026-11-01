import type { Metadata } from "next";
import { Suspense } from "react";
import { ThankYouReference, ThankYouView } from "./ThankYouView";

/**
 * True confirmation — BUILD-SPEC §5.
 *
 * This route is a SERVER COMPONENT WRAPPER around one client island. It does
 * not read `searchParams`: a static export prerenders this page once at build
 * time, where no query string exists, so a server-side read would bake in
 * "no reference" forever and break the redirect from the enquiry form.
 *
 * Instead the reference is read in the browser, inside `ThankYouReference`,
 * which calls `useSearchParams`. That hook must be wrapped in a Suspense
 * boundary or the static build fails, and the fallback below is deliberately the
 * COMPLETE no-reference screen (`reference={null}`) rather than a placeholder:
 *  - with JavaScript disabled the page still renders a full, honest
 *    confirmation with both CTAs and the three-step aside;
 *  - there is no blank frame while the boundary resolves.
 *
 * The page is read-only and must never overstate what happened: it shows a
 * reference only when `?ref=` matches the issued format, says plainly that it
 * cannot confirm a specific submission otherwise, and never claims an email
 * reached the visitor (none is sent to them). Staff notification (SMTP/webhook)
 * may or may not be configured, so the page deliberately says nothing about
 * internal delivery either way. `robots` keeps it out of search results in both
 * build modes.
 */

export const metadata: Metadata = {
  title: "Enquiry received",
  description:
    "Confirmation that a workforce requirement reached MITT, with the reference to quote.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

export default function ThankYouPage() {
  return (
    <Suspense fallback={<ThankYouView reference={null} />}>
      <ThankYouReference />
    </Suspense>
  );
}
