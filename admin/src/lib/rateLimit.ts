/**
 * Production Rate Limiter & Brute-Force Lockout Protection
 * In-memory sliding window tracker for admin authentication attempts
 */

interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  lockoutUntil: number;
}

const attemptsMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5; // Max 5 failed attempts
const WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window
const LOCKOUT_MS = 15 * 60 * 1000; // 15-minute lockout period

export interface RateLimitCheckResult {
  allowed: boolean;
  remainingAttempts: number;
  lockoutTimeSeconds?: number;
  message?: string;
}

export function checkRateLimit(key: string): RateLimitCheckResult {
  const now = Date.now();
  const record = attemptsMap.get(key);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if actively locked out
  if (record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutTimeSeconds: remainingSeconds,
      message: `Security Lockout: Too many failed administrative attempts. Try again in ${Math.ceil(remainingSeconds / 60)} minutes.`,
    };
  }

  // Reset window if expired
  if (now - record.firstAttempt > WINDOW_MS) {
    attemptsMap.delete(key);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_MS;
    const remainingSeconds = Math.ceil(LOCKOUT_MS / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutTimeSeconds: remainingSeconds,
      message: `Security Lockout: Account locked for 15 minutes due to repeated invalid credentials.`,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.attempts,
  };
}

export function recordFailedAttempt(key: string): RateLimitCheckResult {
  const now = Date.now();
  let record = attemptsMap.get(key);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    record = {
      attempts: 1,
      firstAttempt: now,
      lockoutUntil: 0,
    };
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_MS;
  }

  attemptsMap.set(key, record);

  return checkRateLimit(key);
}

export function resetRateLimit(key: string): void {
  attemptsMap.delete(key);
}
