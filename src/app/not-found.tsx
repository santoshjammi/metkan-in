import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";

/**
 * 404. Served by Next with a real 404 status and rendered inside the root
 * layout, so the header, footer and skip link all still work. No metadata
 * export is supported here, and none is needed: it must not be indexed.
 */
export default function NotFound() {
  return (
    <Section
      tone="dark"
      aria-labelledby="not-found-heading"
      className="flex min-h-[78svh] items-center pt-24"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-steel-hi">
            <span aria-hidden="true" className="h-px w-8 bg-copper" />
            Error 404
          </p>

          <h1
            id="not-found-heading"
            className="mt-5 max-w-[20ch] font-display text-[clamp(2.2rem,4.6vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ivory"
          >
            This page isn’t here.
          </h1>

          <p className="copy mt-5 max-w-[46ch] text-ivory/85">
            The address may have changed, or the link may be incomplete. Nothing
            you were looking for has been withheld — it was never at this
            address.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/" size="md">
              Back to the homepage
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
            </Button>
            <Button href="/capabilities" variant="secondary" size="md">
              Explore our capabilities
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <p className="text-[0.68rem] font-medium uppercase leading-none tracking-[0.18em] text-steel-hi">
            Everything we publish
          </p>
          <ul className="mt-4 divide-y divide-line">
            {[
              { label: "Capabilities", href: "/capabilities" },
              { label: "Training", href: "/training" },
              { label: "Our process", href: "/our-process" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <li key={item.href} className="py-2.5">
                <Link
                  href={item.href}
                  className="text-[0.9375rem] text-ivory/85 transition-colors duration-200 hover:text-copper-hi"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="meta mt-5 text-steel-hi">{site.locationLine}</p>
        </div>
      </div>
    </Section>
  );
}
