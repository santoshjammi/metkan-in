import type { ReactElement } from "react";

/** A JSON-LD payload. Arrays are allowed for a graph of nodes. */
export type JsonLdData =
  | Record<string, unknown>
  | readonly Record<string, unknown>[];

/**
 * JSON.stringify alone is not safe inside a `<script>` element: a `</script>`
 * in any string value would close the tag and let the rest execute as markup.
 * Escaping the four HTML-significant characters keeps the payload inert while
 * remaining valid JSON (the escapes decode back to the original characters).
 */
function serialise(data: JsonLdData): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export interface JsonLdProps {
  data: JsonLdData;
  /** Optional stable id, useful when a page emits more than one block. */
  id?: string;
}

/**
 * Server component. Emits structured data as static HTML — no client JS, so a
 * crawler sees it in the first response. Emit only markup whose facts are also
 * visible on the page.
 */
export function JsonLd({ data, id }: JsonLdProps): ReactElement {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialise(data) }}
    />
  );
}
