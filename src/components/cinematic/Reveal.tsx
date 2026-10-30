"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Extra delay in seconds, for the occasional second-in-line element. */
  delay?: number;
}

/**
 * Section-level entrance: opacity 0→1 with an 18px rise, once, at 520ms.
 * Reduced motion collapses the duration to zero (no transform, no fade).
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{
        duration: reduceMotion ? 0 : 0.52,
        delay: reduceMotion ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}
