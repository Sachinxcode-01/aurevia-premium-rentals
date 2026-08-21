import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
          border: "4px solid #D8B36A",
        }}
      >
        <div
          style={{
            fontSize: 108,
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
