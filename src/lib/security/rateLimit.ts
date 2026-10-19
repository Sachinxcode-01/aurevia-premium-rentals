import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store keyed by route namespace + client IP
const rateLimitStore = new Map<string, RateLimitRecord>();
const MAX_STORE_SIZE = 10000;

function pruneExpired(now: number) {
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Periodic cleanup every 5 minutes to prevent memory growth
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  pruneExpired(now);
}

function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== "string" || ip.length > 45) return false;

  // IPv4: 4 octets 0-255 separated by dots
  const ipv4Pattern =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
  if (ipv4Pattern.test(ip)) return true;

  // IPv6: standard, compressed, and loopback
  const ipv6Pattern =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  return ipv6Pattern.test(ip);
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
 * @param req Incoming NextRequest or standard Request
 * @param namespace Unique route tag (e.g., "create-order", "verify-payment")
 * @param config { windowMs: number, maxRequests: number }
 */
export function checkRateLimit(
  req: NextRequest | Request,
  namespace: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpired();
  const now = Date.now();

  // 1. Extract client IP ONLY from the configurable trusted proxy header
  const trustedHeaderName = process.env.TRUSTED_IP_HEADER || "x-forwarded-for";
  let clientIp: string | null = null;

  if ("headers" in req && typeof req.headers.get === "function") {
    const rawHeader = req.headers.get(trustedHeaderName);
    if (rawHeader) {
      const candidate = trustedHeaderName.toLowerCase() === "x-forwarded-for"
        ? rawHeader.split(",")[0].trim()
        : rawHeader.trim();
      if (isValidIP(candidate)) {
        clientIp = candidate;
      }
    }
  }

  // 2. Reject request if IP is missing or invalid (avoid defaulting to 127.0.0.1 or trusting unverified headers)
  if (!clientIp) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: config.windowMs,
      retryAfterSec: Math.ceil(config.windowMs / 1000),
    };
  }

  const key = `${namespace}:${clientIp}`;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    // If new key, enforce hard cap on rateLimitStore
    if (!existing) {
      if (rateLimitStore.size >= MAX_STORE_SIZE) {
        pruneExpired(now);
      }
      if (rateLimitStore.size >= MAX_STORE_SIZE) {
        return {
          allowed: false,
          remaining: 0,
          resetMs: config.windowMs,
          retryAfterSec: Math.ceil(config.windowMs / 1000),
        };
      }
    }

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
