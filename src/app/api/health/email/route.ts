import { NextResponse } from "next/server";

export async function GET() {
  const host    = process.env.SMTP_HOST;
  const user    = process.env.SMTP_USER;
  const pass    = process.env.SMTP_APP_PASSWORD;
  const port    = process.env.SMTP_PORT;
  const provider = process.env.EMAIL_PROVIDER ?? "unknown";

  const isConfigured =
    !!host &&
    !!user &&
    !!pass &&
    !pass.includes("PLACEHOLDER") &&
    !pass.includes("YOUR_");

  if (!isConfigured) {
    return NextResponse.json(
      { status: "unconfigured", provider, message: "SMTP credentials are missing or use placeholder values." },
      { status: 503 }
    );
  }

  // Do NOT attempt a live SMTP connection in health checks (too slow, uses quota).
  // Configuration presence check is sufficient for uptime monitoring.
  return NextResponse.json({
    status: "configured",
    provider,
    host: host?.replace(/./g, "*").slice(0, -4) + host?.slice(-4), // mask all but TLD
    port: Number(port ?? 465),
    user: user?.replace(/(.{2}).+(@.+)/, "$1***$2"), // mask email username
    timestamp: new Date().toISOString(),
  });
}
