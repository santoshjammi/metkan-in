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

export interface HeroMediaProps {
  className?: string;
}

export function HeroMedia({ className }: HeroMediaProps) {
  return (
    <Image
      src={heroMedia.src}
      alt={heroMedia.alt}
      width={heroMedia.width}
      height={heroMedia.height}
      priority
      quality={82}
      sizes="100vw"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className={className}
    />
  );
}
