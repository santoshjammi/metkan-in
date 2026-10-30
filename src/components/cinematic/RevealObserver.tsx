"use client";

import { useEffect } from "react";

/**
 * The only client-side motion code on the page.
 *
 * Every entrance animation is declared in CSS and driven by a single shared
 * IntersectionObserver. No animation library, no per-component state.
 *
 * Progressive enhancement contract:
 * - The stylesheet that hides anything is CREATED BY SCRIPT (`#mitt-motion-css`)
 *   during HTML parse. With JavaScript off it simply does not exist, so every
 *   line of copy ships at full opacity. It is never written as static CSS.
 * - The sheet lives inside `prefers-reduced-motion: no-preference`, so a
 *   reduced-motion visitor renders in the final state with no transitions.
 * - Nothing is attached to React-managed nodes (no attribute on <html>), so
 *   hydration stays clean.
 * - If hydration never lands, the boot timer pulls the sheet back out and the
 *   page is simply visible.
 */

/** Reveal + process-rule rules. Only injected when motion is allowed. */
const MOTION_CSS = `
@media (prefers-reduced-motion: no-preference){
  [data-reveal]{
    opacity:0;
    transform:translate3d(0,18px,0);
    transition-property:opacity,transform;
    transition-duration:520ms;
    transition-timing-function:cubic-bezier(0.22,0.61,0.36,1);
    transition-delay:var(--reveal-delay,0ms);
  }
  [data-reveal].is-revealed{
    opacity:1;
    transform:translate3d(0,0,0);
  }
  [data-process-rule]{
    transform:scaleY(0);
  }
}
`;

/**
 * Runs during HTML parse, before the revealed elements are painted, so the
 * hidden state never flashes. Kept tiny and dependency-free on purpose.
 */
const BOOT_SCRIPT =
  "(function(){try{" +
  "if(!('IntersectionObserver' in window))return;" +
  "var d=document;" +
  "if(d.getElementById('mitt-motion-css'))return;" +
  "var s=d.createElement('style');" +
  "s.id='mitt-motion-css';" +
  "s.textContent=" +
  JSON.stringify(MOTION_CSS) +
  ";" +
  "d.head.appendChild(s);" +
  "window.__mittMotionTimer=window.setTimeout(function(){" +
  "if(!window.__mittMotionHydrated){" +
  "var el=d.getElementById('mitt-motion-css');" +
  "if(el)el.parentNode.removeChild(el);" +
  "}" +
  "},3000);" +
  "}catch(e){}})();";

/** Bottom margin shared by every reveal: trigger once the run is 10% in. */
const ROOT_MARGIN = "0px 0px -10% 0px";

declare global {
  interface Window {
    __mittMotionTimer?: number;
    __mittMotionHydrated?: boolean;
  }
}

function dropInjectedStyles() {
  const el = document.getElementById("mitt-motion-css");
  if (el?.parentNode) el.parentNode.removeChild(el);
}

export function RevealObserver() {
  useEffect(() => {
    /* Mark hydration first: the boot timer must never fire after this point. */
    window.__mittMotionHydrated = true;
    if (typeof window.__mittMotionTimer === "number") {
      window.clearTimeout(window.__mittMotionTimer);
      window.__mittMotionTimer = undefined;
    }

    const allowed =
      typeof IntersectionObserver !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!allowed) {
      /* Reduced motion or no observer: final state, immediately, no rules. */
      dropInjectedStyles();
      document
        .querySelectorAll("[data-reveal]")
        .forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    /* One observer for the whole page. Items inside a stagger group are
       observed through the group, so a grid reveals as one gesture. */
    const targets = new Set<Element>();
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      const group = el.closest("[data-stagger-group]");
      targets.add(group ?? el);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          if (el.hasAttribute("data-stagger-group")) {
            el.querySelectorAll("[data-reveal]").forEach((item) =>
              item.classList.add("is-revealed"),
            );
          } else {
            el.classList.add("is-revealed");
          }
          observer.unobserve(el);
        }
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Pure CSS decoration: the arc settle. No JavaScript gate - it is a
          keyframe, and globals.css already pins the reduced-motion state. */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            "[data-arc-glow]{opacity:0.5}" +
            "@media (prefers-reduced-motion: no-preference){" +
            "[data-arc-glow]{animation:mitt-arc-settle 1600ms cubic-bezier(0.22,0.61,0.36,1) both}" +
            "}" +
            "@keyframes mitt-arc-settle{from{opacity:0;transform:scale(0.86)}to{opacity:0.5;transform:scale(1)}}",
        }}
      />
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
    </>
  );
}
