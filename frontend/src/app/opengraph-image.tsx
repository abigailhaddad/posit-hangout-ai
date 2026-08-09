import { ImageResponse } from "next/og";

// Rendered once at build time into the static export, not per request on the
// edge. The card is identical for every visitor -- it takes no request input --
// so there was never a reason to generate it at runtime, and `output: "export"`
// refuses to build a route that might be dynamic.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0D0D1A",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 100px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Waveform decoration */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
          {[6, 14, 22, 14, 6].map((h, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: h * 2,
                borderRadius: 4,
                background: i === 2 ? "#A5B4FC" : "#818CF8",
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          AI in Data Science
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.4,
            maxWidth: 800,
          }}
        >
          Four years of the Posit Data Science Hangout — how practitioners talked about AI
        </div>

        {/* Bottom tag */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: 100,
            fontSize: 18,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          1,039 mentions · 224 episodes · 2021–2026
        </div>
      </div>
    ),
    { ...size }
  );
}
