import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSupabase, isSupabaseConfigured } from "@/lib/db/store";

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();

  const services = {
    database: { status: "unconfigured", latencyMs: 0 },
    razorpay: { status: "unconfigured" },
    smtp: { status: "unconfigured" }
  };

  let overallStatus = "healthy";

  // 1. Check Database connection
  if (isSupabaseConfigured()) {
    const start = Date.now();
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from("products").select("id").limit(1);
      
      if (error) {
        services.database.status = "unhealthy";
        overallStatus = "unhealthy";
      } else {
        services.database.status = "healthy";
        services.database.latencyMs = Date.now() - start;
      }
    } catch (e) {
      services.database.status = "unhealthy";
      overallStatus = "unhealthy";
    }
  } else {
    // In mock mode, database is memory-based
    services.database.status = "healthy (mock)";
  }

  // 2. Check Razorpay config
  const rzpKeyId = process.env.RAZORPAY_KEY_ID;
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
  if (rzpKeyId && rzpSecret) {
    if (rzpKeyId.includes("PLACEHOLDER") || rzpSecret.includes("PLACEHOLDER")) {
      services.razorpay.status = "placeholder";
    } else {
      services.razorpay.status = "configured";
    }
  } else {
    services.razorpay.status = "missing";
  }

  // 3. Check SMTP Mailer
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_APP_PASSWORD;

  if (smtpHost && smtpUser && smtpPass) {
    if (smtpPass.includes("PLACEHOLDER")) {
      services.smtp.status = "placeholder";
    } else {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT || 465),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 5000 // 5 seconds verify timeout
        });
        
        const smtpVerified = await new Promise<boolean>((resolve) => {
          transporter.verify((error) => {
            if (error) {
              console.warn("[Health Check] SMTP verification failed:", error.message);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        });

        services.smtp.status = smtpVerified ? "healthy" : "unhealthy";
      } catch (err: any) {
        services.smtp.status = "unhealthy";
      }
    }
  } else {
    services.smtp.status = "unconfigured";
  }

  const statusCode = overallStatus === "healthy" ? 200 : 500;

  return NextResponse.json({
    status: overallStatus,
    timestamp,
    uptime,
    services
  }, { status: statusCode });
}
