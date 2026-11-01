import { heroMedia } from "@/content/evidence";

/**
 * Hero plate, served WITHOUT the Next image optimizer.
 *
 * The site ships in two shapes (see next.config.ts): a Node server build, and a
 * static export for Apache shared hosting where no `/_next/image` endpoint
 * exists. A `next/image` hero would request an endpoint the static host cannot
 * serve, so the hero is a hand-written `picture`: the browser picks the format
 * and the width itself, with no JavaScript involved at all.
 *
 * Deliberate choices:
 *  - WebP first (640/1024/1600/2000, the variants already in /public/media),
 *    JPEG as the universal fallback (640/1024/1600). `sizes="100vw"` matches
 *    the layout: the plate is full-bleed at every breakpoint.
 *  - Explicit `width`/`height` of the source artwork (2000x1125) so the aspect
 *    ratio is known before the bytes land. The element is `absolute inset-0`
 *    with `object-cover`, so this cannot shift layout: CLS stays 0.
 *  - `loading="eager"` + `fetchPriority="high"`: this is the LCP element, and
 *    lazy-loading it would delay the largest paint.
 *  - `decoding="async"`: decode off the main thread. The overlay and scrim
 *    layers behind it are the same ink value, so nothing flashes lighter.
 */

/** WebP widths present in /public/media. */
const WEBP_SRCSET = [
  "/media/hero-welding-640.webp 640w",
  "/media/hero-welding-1024.webp 1024w",
  "/media/hero-welding-1600.webp 1600w",
  "/media/hero-welding-2000.webp 2000w",
].join(", ");

/** JPEG widths present in /public/media (no 2000w JPEG was generated). */
const JPEG_SRCSET = [
  "/media/hero-welding-640.jpg 640w",
  "/media/hero-welding-1024.jpg 1024w",
  "/media/hero-welding-1600.jpg 1600w",
].join(", ");

/** Default JPEG for browsers that ignore `srcset` entirely. */
const JPEG_FALLBACK = "/media/hero-welding-1600.jpg";

export interface HeroMediaProps {
  className?: string;
}

export function HeroMedia({ className }: HeroMediaProps) {
  return (
    <picture>
      <source type="image/webp" srcSet={WEBP_SRCSET} sizes="100vw" />
      {/*
        A plain <img> is the point, not an oversight: next/image needs the
        optimizer endpoint that the static host does not have.
      */}
      <img
        src={JPEG_FALLBACK}
        srcSet={JPEG_SRCSET}
        sizes="100vw"
        alt={heroMedia.alt}
        width={heroMedia.width}
        height={heroMedia.height}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={className}
      />
    </picture>
  );
}
