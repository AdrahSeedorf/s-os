/**
 * A small in-memory rate limiter.
 *
 * Honest about what it is: serverless functions run in several instances, and
 * memory is per-instance, so a determined attacker spread across instances
 * gets more than the nominal allowance. It is not a security control.
 *
 * What it *does* stop is the realistic case — one person or one crude script
 * hammering the form from one place — for zero cost and no extra service. If
 * abuse ever became a real problem the fix is a shared store (Upstash, Vercel
 * KV), and this module is the only thing that would change.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may try again. Zero when allowed. */
  retryAfter: number;
}

interface Window {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;

const buckets = new Map<string, Window>();

export function rateLimit(
  key: string,
  now: number = Date.now(),
  limit: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS,
): RateLimitResult {
  // Opportunistic cleanup — this map would otherwise grow for the lifetime of
  // the instance, one entry per unique client.
  for (const [entryKey, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(entryKey);
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/** Test helper. */
export function resetRateLimit(): void {
  buckets.clear();
}
