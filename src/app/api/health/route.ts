import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "AUREVIA API",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
