import type { ReactNode } from "react";

export interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  /** Accessible name for the list, when the list is not self-describing. */
  label?: string;
}

/**
 * List container for staggered entrances. Children must be <StaggerItem>.
 *
 * The group is what the shared observer watches, so the whole list reveals as
 * one gesture; the stagger lives on each item (index-based) and caps at six no
 * matter how many items are rendered. Server component: no JavaScript here.
 */
export function StaggerGroup({ children, className, label }: StaggerGroupProps) {
  return (
    <ul aria-label={label} className={className} data-stagger-group="">
      {children}
    </ul>
  );
}
