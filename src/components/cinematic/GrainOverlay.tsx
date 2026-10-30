export interface GrainOverlayProps {
  className?: string;
}

/**
 * Film grain over the hero. Pure CSS (SVG feTurbulence data URI in `.grain`),
 * 3.5% opacity, never intercepts pointer events, hidden from assistive tech.
 */
export function GrainOverlay({ className }: GrainOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={className ? `grain ${className}` : "grain"}
    />
  );
}
