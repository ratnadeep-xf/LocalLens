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
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  prefix: "ratelimit:create:hourly",
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
        message: "Too many requests. Please try again later.",
        error: "Too many requests. Please try again later.",
      });
    } catch (error) {
      // Fail open: a Redis/rate-limit outage should not block publishing.
      console.error("[rateLimit] limiter error, allowing request:", error.message);
      return next();
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
