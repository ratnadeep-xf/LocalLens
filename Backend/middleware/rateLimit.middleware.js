const { Ratelimit } = require("@upstash/ratelimit");
const { redisClient } = require("../utils/redis");

const authLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "ratelimit:auth",
});

const voteLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "ratelimit:vote",
});

const commentLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "ratelimit:comment",
});

const createLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(20, "1 d"),
  prefix: "ratelimit:create",
});

/**
 * Factory that returns Express middleware for a given Ratelimit instance.
 * @param {Ratelimit} limiter
 * @param {(req: import('express').Request) => string} getIdentifier
 */
const rateLimitMiddleware = (limiter, getIdentifier) => {
  return async (req, res, next) => {
    try {
      const identifier = getIdentifier(req);
      const { success, reset } = await limiter.limit(identifier);

      if (success) {
        return next();
      }

      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((reset - Date.now()) / 1000)
      );
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    } catch (error) {
      // Fail closed (unlike utils/redis.js cache helpers, which fail open):
      // if Redis/rate-limit is unreachable, deny the request rather than
      // allowing unlimited traffic through.
      console.error("[rateLimit] limiter error:", error.message);
      return res.status(429).json({
        error:
          "Rate limiting temporarily unavailable. Please try again shortly.",
      });
    }
  };
};

module.exports = {
  authLimiter,
  voteLimiter,
  commentLimiter,
  createLimiter,
  rateLimitMiddleware,
};
