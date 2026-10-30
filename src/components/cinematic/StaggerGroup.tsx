"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  /** Accessible name for the list, when the list is not self-describing. */
  label?: string;
}

/**
 * List container for staggered entrances. Children must be <StaggerItem>.
 * The stagger lives on each item (index-based) so it caps at six no matter
 * how many items are rendered.
 */
export function StaggerGroup({ children, className, label }: StaggerGroupProps) {
  return (
    <motion.ul
      aria-label={label}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
    >
      {children}
    </motion.ul>
  );
}
