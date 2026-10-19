import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store keyed by route namespace + client IP
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory growth
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  retryAfterSec: number;
}

/**
 * Enforce rate limiting by client IP address
 * @param req Incoming NextRequest
 * @param namespace Unique route tag (e.g., "create-order", "verify-payment")
 * @param config { windowMs: number, maxRequests: number }
 */
export function checkRateLimit(
  req: NextRequest | Request,
  namespace: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpired();

  // Extract client IP from standard proxy headers
  let ip = "127.0.0.1";
  if ("headers" in req && typeof req.headers.get === "function") {
    const xForwardedFor = req.headers.get("x-forwarded-for");
    const xRealIp = req.headers.get("x-real-ip");
    const cfConnectingIp = req.headers.get("cf-connecting-ip");

    if (cfConnectingIp) {
      ip = cfConnectingIp;
    } else if (xForwardedFor) {
      ip = xForwardedFor.split(",")[0].trim();
    } else if (xRealIp) {
      ip = xRealIp.trim();
    }
  }

  const key = `${namespace}:${ip}`;
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetMs: config.windowMs,
      retryAfterSec: Math.ceil(config.windowMs / 1000),
    };
  }

  if (existing.count >= config.maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetMs: existing.resetAt - now,
      retryAfterSec,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetMs: existing.resetAt - now,
    retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
  };
}
