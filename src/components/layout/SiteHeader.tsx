"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileNav } from "./MobileNav";
import { cta, nav, site } from "@/content/site";

/**
 * Sticky header. Transparent while the hero is behind it, solid ink once the
 * page has scrolled. Only the surface state is client-side: the nav links
 * themselves are plain anchors that exist in the server-rendered HTML.
 *
 * Primary navigation is set at 14px/500 in ivory at 90% so it reads as
 * navigation rather than as secondary meta, and carries a copper rule for
 * hover and for the current page.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-arc",
        scrolled
          ? "border-b border-line bg-ink"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      {/* Anchors the transparent header over the hero photograph. Sits below the
          header content, never intercepts a pointer, and fades out on scroll. */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[120px]",
          "bg-[linear-gradient(to_bottom,rgba(11,15,19,0.55)_0%,rgba(11,15,19,0.28)_55%,rgba(11,15,19,0)_100%)]",
          "transition-opacity duration-300 ease-arc",
          scrolled ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />

      <div className="shell flex h-16 items-center justify-between gap-4 md:h-20 md:gap-8">
        {/* No aria-label: the visible wordmark + registered name are the accessible
            name. An aria-label that omits visible text fails WCAG 2.5.3 (label in name). */}
        <Link
          href="/"
          className="group flex shrink-0 flex-col justify-center leading-none"
        >
          <span className="font-display text-[1.35rem] font-bold tracking-[-0.06em] text-ivory">
            {site.name}
          </span>
          <span className="mt-1.5 hidden text-[0.56rem] uppercase leading-none tracking-[0.22em] text-steel-hi sm:block lg:hidden xl:block">
            {site.legalName}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-8">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group/nav inline-flex min-h-11 items-center text-[0.875rem] font-medium",
                      "transition-colors duration-200 ease-arc",
                      active ? "text-ivory" : "text-ivory/90 hover:text-ivory",
                    ].join(" ")}
                  >
                    {/* 1px copper rule, 6px below the label. Anchored to the
                        label box rather than the 44px hit area. */}
                    <span
                      className={[
                        "relative",
                        "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left",
                        "after:bg-copper after:transition-transform after:duration-200 after:ease-arc",
                        active
                          ? "after:scale-x-100"
                          : "after:scale-x-0 group-hover/nav:after:scale-x-100 group-focus-visible/nav:after:scale-x-100",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/contact"
            className="hidden min-h-11 items-center justify-center rounded-xs border border-copper bg-copper px-5 text-[0.8rem] font-medium text-ink transition-colors duration-200 hover:border-copper-hi hover:bg-copper-hi md:inline-flex"
          >
            {cta.primaryShort}
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
