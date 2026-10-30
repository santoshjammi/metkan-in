"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export interface ArcGlowProps {
  className?: string;
}

/**
 * The welding arc: one soft copper radial that settles once on mount and then
 * rests. Never loops. Under reduced motion it is simply present at 0.5 opacity.
 */
export function ArcGlow({ className }: ArcGlowProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      data-arc-glow=""
      className={[
        "pointer-events-none absolute bg-[radial-gradient(closest-side,rgba(224,142,78,0.55),rgba(200,117,57,0.16)_46%,transparent_72%)]",
        className ?? "",
      ].join(" ")}
      initial={{ opacity: 0, scale: 0.86 }}
      animate={{ opacity: 0.5, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 1.6, ease: EASE }}
    />
  );
}
