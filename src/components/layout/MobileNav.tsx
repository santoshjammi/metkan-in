"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cta, nav, site } from "@/content/site";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function visibleFocusables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * Full-screen navigation for small screens.
 * Focus is trapped while open, Escape closes, and focus returns to the
 * trigger on close. Body scrolling is locked without shifting the page.
 *
 * Motion is CSS only: the panel fades in via `mitt-nav-in` and each row rises
 * with an index-based delay. globals.css already collapses both to zero for
 * reduced motion, so there is no runtime and nothing to gate.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  /* Scroll lock - restore whatever inline value was there before. */
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* Focus: move in on open, trap Tab, close on Escape, return on close. */
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const trigger = triggerRef.current;

    const first = visibleFocusables(panel)[0];
    if (first) {
      first.focus();
    } else {
      panel?.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const nodes = visibleFocusables(panel);
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (!firstNode || !lastNode) return;

      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === firstNode || active === null || !panel.contains(active)) {
          event.preventDefault();
          lastNode.focus();
        }
      } else if (active === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@keyframes mitt-nav-in{from{opacity:0}to{opacity:1}}" +
            "@keyframes mitt-nav-row-in{from{opacity:0;transform:translate3d(0,12px,0)}to{opacity:1;transform:translate3d(0,0,0)}}" +
            ".mitt-nav-panel{animation:mitt-nav-in 240ms cubic-bezier(0.22,0.61,0.36,1) both}" +
            ".mitt-nav-row{animation:mitt-nav-row-in 400ms cubic-bezier(0.22,0.61,0.36,1) both}",
        }}
      />
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label="Open menu"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xs border border-line text-ivory transition-colors duration-200 hover:border-ivory/40 lg:hidden"
      >
        <Menu aria-hidden="true" size={20} strokeWidth={1.5} />
      </button>

      {open ? (
        <div
          id="mobile-navigation"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          tabIndex={-1}
          className="mitt-nav-panel fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-ink lg:hidden"
        >
          <div className="shell flex h-16 shrink-0 items-center justify-between md:h-20">
            <span className="font-display text-[1.35rem] font-bold tracking-[-0.06em] text-ivory">
              {site.name}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xs border border-line text-ivory transition-colors duration-200 hover:border-ivory/40"
            >
              <X aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav aria-label="Primary" className="shell flex-1 pt-4">
            <ul className="flex flex-col">
              {nav.map((item, index) => (
                <li
                  key={item.href}
                  className="mitt-nav-row border-b border-line"
                  style={{ animationDelay: `${50 + Math.min(index, 6) * 50}ms` }}
                >
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex items-baseline justify-between gap-4 py-4 font-display text-[1.6rem] tracking-[-0.02em] text-ivory"
                  >
                    {item.label}
                    <span className="text-[0.65rem] tabular-nums tracking-[0.14em] text-steel">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="shell shrink-0 border-t border-line pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
            <Link
              href="/contact"
              onClick={close}
              className="flex min-h-12 w-full items-center justify-center rounded-xs border border-copper bg-copper px-5 text-sm font-medium text-ink"
            >
              {cta.primary}
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-steel">
              {site.locationLine}
            </p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-steel-hi">
              {!site.phone.placeholder && site.phone.href.length > 0 ? (
                <a
                  href={site.phone.href}
                  className="text-ivory underline decoration-ivory/30 underline-offset-[0.3em]"
                >
                  {site.phone.display}
                </a>
              ) : (
                <span className="pending-chip">Pending confirmation</span>
              )}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
