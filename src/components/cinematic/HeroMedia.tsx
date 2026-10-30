import Image from "next/image";
import { heroMedia } from "@/content/evidence";

/**
 * Flat fill-in for the hero while the photograph decodes. Keeps the exact ink
 * value so there is no flash of a lighter surface on slow connections.
 */
const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"><rect width="16" height="9" fill="#0B0F13"/><rect y="5" width="16" height="4" fill="#171D23"/></svg>',
  );

/**
 * Intrinsic plate for the hero. The element is a full-bleed `object-cover`
 * layer, so this only declares the artwork's aspect ratio: the delivered file
 * is chosen by `sizes` (100vw) against the device widths Next generates, from
 * 640w up. 1600x900 is the widest CSS size the layout is ever asked to cover
 * at 1x, and it keeps the exact 16:9 ratio the crop was composed against. The
 * previous 2000x1125 declaration was larger than anything the layout uses.
 */
const HERO_WIDTH = 1600;
const HERO_HEIGHT = 900;

export interface HeroMediaProps {
  className?: string;
}

export function HeroMedia({ className }: HeroMediaProps) {
  return (
    <Image
      src={heroMedia.src}
      alt={heroMedia.alt}
      width={HERO_WIDTH}
      height={HERO_HEIGHT}
      priority
      fetchPriority="high"
      quality={86}
      sizes="100vw"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className={className}
    />
  );
}
