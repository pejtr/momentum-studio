export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  now?: () => number;
};

/**
 * Per-process sliding-window limiter. The credit ledger remains the durable
 * cross-instance entitlement control; this guard suppresses burst abuse before
 * a credit is reserved.
 */
export function createSlidingWindowRateLimiter({ windowMs, maxRequests, now = Date.now }: RateLimitOptions) {
  const requests = new Map<string, number[]>();

  return {
    check(key: string): RateLimitResult {
      const currentTime = now();
      const windowStart = currentTime - windowMs;
      const recent = (requests.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

      if (recent.length >= maxRequests) {
        requests.set(key, recent);
        const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + windowMs - currentTime) / 1000));
        return { allowed: false, retryAfterSeconds };
      }

      recent.push(currentTime);
      requests.set(key, recent);
      return { allowed: true, remaining: maxRequests - recent.length };
    },
    clear(key?: string) {
      if (key) requests.delete(key);
      else requests.clear();
    },
  };
}

export const aiRequestRateLimiter = createSlidingWindowRateLimiter({
  windowMs: 60_000,
  maxRequests: 12,
});
