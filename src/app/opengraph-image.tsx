import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AUREVIA Premium Rentals | Cinema Camera & Lens Concierge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#070707",
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(216, 179, 106, 0.15) 0%, transparent 60%)",
          padding: "70px 80px",
          fontFamily: "system-ui, sans-serif",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Brand header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              border: "2px solid #D8B36A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(216, 179, 106, 0.1)",
              color: "#F5F1E8",
              fontSize: "28px",
              fontWeight: 800,
              fontFamily: "Georgia, serif",
            }}
          >
            A
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "14px",
                letterSpacing: "0.28em",
                color: "#D8B36A",
                textTransform: "uppercase",
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              PREM MUNDARGI PRESENTS
            </span>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#F5F1E8",
                letterSpacing: "0.06em",
              }}
            >
              AUREVIA
            </span>
          </div>
        </div>

        {/* Title and tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 300,
              color: "#FFFFFF",
              lineHeight: 1.1,
              margin: 0,
              fontFamily: "Georgia, serif",
            }}
          >
            Cinema Camera &amp;{" "}
            <span style={{ color: "#D8B36A", fontStyle: "italic", fontWeight: 400 }}>
              Lens Concierge
            </span>
          </h1>
          <p
            style={{
              fontSize: "22px",
              color: "#9E9E9E",
              lineHeight: 1.5,
              margin: 0,
              fontWeight: 300,
            }}
          >
            Rent calibrated Sony FX3, Canon EOS R5, RED Komodo, cinema primes &amp; production rigs. Pelican flight cases across South India.
          </p>
        </div>

        {/* Trust Badges Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
            <span style={{ color: "#F5F1E8", fontSize: "16px", fontWeight: 500, fontFamily: "monospace" }}>
              100% Calibrated Sensors
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D8B36A" }} />
            <span style={{ color: "#F5F1E8", fontSize: "16px", fontWeight: 500, fontFamily: "monospace" }}>
              Zero-Deposit Options
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D8B36A" }} />
            <span style={{ color: "#F5F1E8", fontSize: "16px", fontWeight: 500, fontFamily: "monospace" }}>
              Pelican Flight Casing
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
