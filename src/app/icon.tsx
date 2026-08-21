import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 48,
  height: 48,
};
export const contentType = "image/png";

// Image generation for Google & Browser Favicon (48x48 high DPI)
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080808",
          borderRadius: "50%",
          border: "2px solid #D8B36A",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            fontFamily: "Georgia, serif",
            color: "#F5F1E8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          A
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
