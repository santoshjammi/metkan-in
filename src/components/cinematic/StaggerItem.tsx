import type { CSSProperties, ReactNode } from "react";

export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Position in the group - drives the capped stagger delay. */
  index?: number;
}

/**
 * One item in a <StaggerGroup>. Server component: the only thing it ships is a
 * CSS variable carrying an index-based delay, capped at six items so long
 * lists never crawl.
 */
export function StaggerItem({
  children,
  className,
  index = 0,
}: StaggerItemProps) {
  const style = {
    "--reveal-delay": `${Math.min(Math.max(index, 0), 5) * 60}ms`,
  } as CSSProperties;

  return (
    <li data-reveal="" className={className} style={style}>
      {children}
    </li>
  );
}
