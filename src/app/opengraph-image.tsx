import { ImageResponse } from "next/og";

export const alt = "CritOrbit — Assignment support for Malaysian students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f7cf49", color: "#211d1a", padding: "64px", border: "16px solid #211d1a" }}>
        <div style={{ display: "flex", fontSize: 42, fontWeight: 700 }}>CRITORBIT</div>
        <div style={{ display: "flex", fontSize: 76, lineHeight: 1.05, maxWidth: 1000 }}>Assignment support for Malaysian students.</div>
        <div style={{ display: "flex", fontSize: 28 }}>Coding · Reports · Presentations · Design</div>
      </div>
    ),
    size,
  );
}
