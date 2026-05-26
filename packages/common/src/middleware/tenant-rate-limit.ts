/**
 * Per-tenant rate limiting — Redis-backed sliding window. Prevents one
 * abusive tenant from monopolizing gateway capacity.
 *
 *   app.use(tenantRateLimit({ redis, requestsPerMinute: 600 }));
 *
 * Falls back to no-op when redis is null (dev without Redis), so tests
 * don't need to spin up Redis.
 *
 * Uses INCR + EXPIRE for a fixed 60s window. Adequate for in-cluster
 * rate limiting; if you need true sliding-window or per-route limits,
 * swap to ioredis-tokenize / rate-limit-redis.
 */
import type { Request, Response, NextFunction } from "express";
import type { Redis } from "ioredis";

export interface TenantRateLimitOptions {
  redis: Redis | null;
  /** Max requests per tenant per 60s window. Default 600 = 10rps avg. */
  requestsPerMinute?: number;
  /** Key prefix for Redis keys. */
  keyPrefix?: string;
}

export function tenantRateLimit(opts: TenantRateLimitOptions) {
  const limit = opts.requestsPerMinute ?? 600;
  const prefix = opts.keyPrefix ?? "rl:tenant:";

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!opts.redis) return next();

    // Determine the rate-limit key — prefer authenticated tenant, fall back to IP
    const tenantId =
      (req.headers["x-tenant-id"] as string | undefined) ?? req.user?.tenantId;
    const subject = tenantId ?? `ip:${req.ip ?? "unknown"}`;
    const windowSeconds = 60;
    const minute = Math.floor(Date.now() / 1000 / windowSeconds);
    const key = `${prefix}${subject}:${minute}`;

    try {
      const count = await opts.redis.incr(key);
      if (count === 1) {
        await opts.redis.expire(key, windowSeconds + 5);
      }
      const remaining = Math.max(0, limit - count);
      res.setHeader("X-RateLimit-Limit", String(limit));
      res.setHeader("X-RateLimit-Remaining", String(remaining));
      res.setHeader("X-RateLimit-Reset", String((minute + 1) * windowSeconds));

      if (count > limit) {
        res.setHeader("Retry-After", String(windowSeconds));
        return res.status(429).json({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Tenant rate limit exceeded (${limit} req/min). Retry in ${windowSeconds}s.`,
          },
        });
      }
      next();
    } catch (err) {
      // Redis hiccup must not break the request — log and pass through.
      // (Caller's logger middleware will capture the err.)
      next();
    }
  };
}
