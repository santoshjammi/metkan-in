"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

interface StaggerCustom {
  index: number;
  reduce: boolean;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (custom: StaggerCustom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.reduce ? 0 : 0.52,
      /* 60ms between items, capped at six so long lists never crawl. */
      delay: custom.reduce ? 0 : Math.min(custom.index, 5) * 0.06,
      ease: EASE,
    },
  }),
};

export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Position in the group — drives the capped stagger delay. */
  index?: number;
}

export function StaggerItem({ children, className, index = 0 }: StaggerItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      data-reveal=""
      className={className}
      custom={{ index, reduce: Boolean(reduceMotion) } satisfies StaggerCustom}
      variants={itemVariants}
    >
      {children}
    </motion.li>
  );
}
