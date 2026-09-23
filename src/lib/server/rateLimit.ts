// ==============================================================================
// MADHUS BOUTIQUE: SERVER-SIDE SLIDING WINDOW RATE LIMITER
// Protects sensitive endpoints (payment submission, verification, tracking)
// ==============================================================================

import { NextRequest } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

/**
 * Checks sliding-window rate limit for a given unique key
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Filter timestamps within the current sliding window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= options.maxRequests) {
    const oldestTimestamp = activeTimestamps[0] || now;
    const resetMs = Math.max(0, oldestTimestamp + options.windowMs - now);

    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      resetMs,
    };
  }

  // Record this request
  activeTimestamps.push(now);
  rateLimitStore.set(key, { timestamps: activeTimestamps });

  return {
    allowed: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - activeTimestamps.length,
    resetMs: options.windowMs,
  };
}

/**
 * Resets rate limit for a key (useful for test isolation)
 */
export function resetRateLimit(key?: string): void {
  if (key) {
    rateLimitStore.delete(key);
  } else {
    rateLimitStore.clear();
  }
}

/**
 * Extracts client IP identifier from request headers safely
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
