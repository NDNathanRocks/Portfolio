import { ImageResponse } from "next/og";

export const alt = "Nathan Nicholas D'Souza, AI/ML & Full-Stack Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#0a0a0a",
          color: "#f4efe6",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, letterSpacing: 4, color: "#a8a39a" }}>
          <div style={{ width: 16, height: 16, borderRadius: 16, background: "#d6ff3f" }} />
          PORTFOLIO 2026
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, lineHeight: 1, letterSpacing: -4 }}>Nathan Nicholas</div>
          <div style={{ fontSize: 120, lineHeight: 1, letterSpacing: -4, color: "#d6ff3f" }}>D&apos;Souza</div>
          <div style={{ marginTop: 36, fontSize: 36, color: "#f4efe6", opacity: 0.8 }}>
            AI/ML & Full-Stack Engineer | Vancouver, BC
          </div>
        </div>
      </div>
    ),
    size,
  );
}
