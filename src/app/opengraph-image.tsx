import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.heroHeadline}`;

/** "Skilled Hands. Stronger Industries." → two lines, broken on the sentence. */
const headlineLines = site.heroHeadline
  .split(". ")
  .map((part, index, parts) => (index < parts.length - 1 ? `${part}.` : part));

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The social card: ink ground, one copper rule, the wordmark and the hero
 * headline. No network fonts — `ImageResponse` uses the font bundled with
 * `next/og`, so this renders the same offline and during `next build`, and the
 * route never makes an outbound request.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0B0F13",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                fontSize: 50,
                lineHeight: 1,
                letterSpacing: -3,
                color: "#F5F2EA",
                fontWeight: 700,
              }}
            >
              {site.name}
            </div>
            <div
              style={{
                display: "flex",
                width: 88,
                height: 4,
                backgroundColor: "#C87539",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 17,
              letterSpacing: 4,
              color: "#A8B6C1",
            }}
          >
            METKAN INSTITUTE FOR TECHNICAL TRAINING
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 120,
              height: 6,
              backgroundColor: "#C87539",
              marginBottom: 28,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 900,
              fontSize: 82,
              lineHeight: 1.06,
              letterSpacing: -3,
              color: "#F5F2EA",
              fontWeight: 700,
            }}
          >
            {headlineLines.map((line) => (
              <div key={line} style={{ display: "flex" }}>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(245,242,234,0.14)",
            paddingTop: 26,
          }}
        >
          <div style={{ display: "flex", fontSize: 23, color: "#A8B6C1" }}>
            {site.locationLine}
          </div>
          <div style={{ display: "flex", fontSize: 21, color: "#E08E4E" }}>
            {site.brandLine}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
