/**
 * Privacy-conscious event hook.
 *
 * Principles:
 *  - no third-party SDK; a local array plus one optional script;
 *  - **no form field values, ever** — props are filtered through a per-event
 *    allow-list and coerced to primitives, so a mistyped call cannot leak a name
 *    or an email into analytics;
 *  - a no-op on the server, so importing this from a server component is safe.
 *
 * Plausible-compatible: if `NEXT_PUBLIC_ANALYTICS_DOMAIN` is set, the page is
 * expected to load Plausible's script, which defines `window.plausible`. With no
 * domain configured nothing is transmitted anywhere and events stay in
 * `window.__mittEvents` for local inspection.
 */

export type MittEventName =
  | "enquiry_submitted"
  | "enquiry_rejected"
  | "enquiry_failed";

/**
 * The only prop keys each event may carry. Adding a key here is the only way to
 * send one — anything else passed to `track()` is dropped.
 */
const ALLOWED_PROPS: Record<MittEventName, readonly string[]> = {
  /* Success carries no properties at all: the reference stays on our server. */
  enquiry_submitted: [],
  /* Coarse reason only — never the submitted values or the field contents. */
  enquiry_rejected: ["reason"],
  enquiry_failed: ["status"],
};

/** Strings are truncated so an accidental free-text value cannot ride along. */
const MAX_PROP_LENGTH = 64;

export type MittPropValue = string | number | boolean;

export interface MittEvent {
  event: MittEventName;
  props: Record<string, MittPropValue>;
  at: number;
}

declare global {
  interface Window {
    __mittEvents?: MittEvent[];
    plausible?: (
      event: string,
      options?: { props?: Record<string, MittPropValue> },
    ) => void;
  }
}

function sanitiseProps(
  event: MittEventName,
  props: Record<string, unknown> | undefined,
): Record<string, MittPropValue> {
  const allowed = ALLOWED_PROPS[event] ?? [];
  const safe: Record<string, MittPropValue> = {};

  for (const key of allowed) {
    const value = props?.[key];
    if (typeof value === "string") safe[key] = value.slice(0, MAX_PROP_LENGTH);
    else if (typeof value === "number" && Number.isFinite(value)) safe[key] = value;
    else if (typeof value === "boolean") safe[key] = value;
  }

  return safe;
}

export function track(
  event: MittEventName,
  props?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  const safeProps = sanitiseProps(event, props);
  const entry: MittEvent = { event, props: safeProps, at: Date.now() };

  window.__mittEvents = window.__mittEvents ?? [];
  window.__mittEvents.push(entry);

  if (
    process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN &&
    typeof window.plausible === "function"
  ) {
    window.plausible(event, { props: safeProps });
  }
}
