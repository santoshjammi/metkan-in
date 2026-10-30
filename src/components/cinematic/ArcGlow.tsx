export interface ArcGlowProps {
  className?: string;
}

/**
 * The welding arc: one soft copper radial that settles once on mount and then
 * rests. Never loops, never needs JavaScript - the settle is the
 * `mitt-arc-settle` keyframe declared by the shared RevealObserver island.
 * Reduced motion lands on the settled value immediately (globals.css).
 */
export function ArcGlow({ className }: ArcGlowProps) {
  return (
    <div
      aria-hidden="true"
      data-arc-glow=""
      className={[
        "pointer-events-none absolute bg-[radial-gradient(closest-side,rgba(224,142,78,0.55),rgba(200,117,57,0.16)_46%,transparent_72%)]",
        className ?? "",
      ].join(" ")}
    />
  );
}
