import type { CSSProperties, ReactNode } from "react";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Extra delay in seconds, for the occasional second-in-line element. */
  delay?: number;
}

/**
 * Section-level entrance: opacity 0 to 1 with an 18px rise, once.
 *
 * This is a server component: it ships markup and a CSS variable only. The
 * transition itself lives in the shared `RevealObserver` island, and the
 * element renders fully visible when JavaScript is not running.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const style =
    delay > 0
      ? ({ "--reveal-delay": `${Math.round(delay * 1000)}ms` } as CSSProperties)
      : undefined;

  return (
    <div data-reveal="" className={className} style={style}>
      {children}
    </div>
  );
}
