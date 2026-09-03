import { ImageResponse } from "next/og";

export const alt = "Kent Bespoke Carpentry Ltd — Bespoke joinery, made in Kent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0e2140", color: "#fff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 22, letterSpacing: 8, textTransform: "uppercase", opacity: 0.85 }}>Kent Bespoke Carpentry Ltd</div>
          <div style={{ width: 120, height: 2, background: "rgba(255,255,255,.4)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, lineHeight: 1, letterSpacing: -3 }}>
          <div style={{ fontWeight: 600 }}>Bespoke joinery,</div>
          <div style={{ fontWeight: 300 }}>made in Kent.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, opacity: 0.9 }}>
          <span>07494 280614</span>
          <span>kentbespokecarpentry.co.uk</span>
        </div>
      </div>
    ),
    size,
  );
}
