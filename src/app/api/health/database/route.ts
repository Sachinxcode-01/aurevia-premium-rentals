import { NextResponse } from "next/server";

export async function GET() {
  const start = Date.now();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Safety: never expose credentials — only report configuration status
  if (!url || !anonKey || url.includes("PLACEHOLDER") || url.includes("YOUR_")) {
    return NextResponse.json(
      { status: "unconfigured", message: "Supabase environment variables are not set." },
      { status: 503 }
    );
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, anonKey);

    // Lightweight ping: count rows in brands (always seeded, tiny table)
    const { error } = await supabase
      .from("brands")
      .select("id", { count: "exact", head: true });

    const latency = Date.now() - start;

    if (error) {
      return NextResponse.json(
        { status: "error", latency_ms: latency, message: "Database query failed." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      latency_ms: latency,
      mode: "supabase",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "error", latency_ms: Date.now() - start, message: "Failed to connect to database." },
      { status: 503 }
    );
  }
}
