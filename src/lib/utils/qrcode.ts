import QRCode from "qrcode";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generate a standards-compliant SVG string representing the QR code.
 */
export async function generateQRCodeSvg(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    margin = 2,
    errorCorrectionLevel = "M",
    darkColor = "#000000",
    lightColor = "#ffffff",
  } = options;

  return QRCode.toString(text, {
    type: "svg",
    margin,
    errorCorrectionLevel,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });
}

/**
 * Generate a Base64 Data URL (PNG) representation of the QR code.
 */
export async function generateQRCodeDataUrl(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    width = 300,
    margin = 2,
    errorCorrectionLevel = "M",
    darkColor = "#000000",
    lightColor = "#ffffff",
  } = options;

  return QRCode.toDataURL(text, {
    width,
    margin,
    errorCorrectionLevel,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });
}

/**
 * Build the absolute or relative verification URL for a booking.
 */
export function buildBookingVerificationUrl(
  referenceCode: string,
  otp?: string,
  origin?: string
): string {
  const params = new URLSearchParams();
  params.set("ref", referenceCode);
  if (otp) {
    params.set("otp", otp);
  }

  const path = `/verify/booking?${params.toString()}`;
  if (origin && typeof origin === "string" && origin.startsWith("http")) {
    return `${origin.replace(/\/$/, "")}${path}`;
  }
  return path;
}
