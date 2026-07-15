const { Redis } = require("@upstash/redis");
require("dotenv").config();

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Get a cached value by key.
 * @param {string} key
 * @returns {Promise<any|null>} Parsed JSON value, or null if missing/error
 */
const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (data === null || data === undefined) {
      return null;
    }
    // Upstash may auto-deserialize JSON; handle both string and object
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    return data;
  } catch (error) {
    console.warn(`[redis] getCache failed for key "${key}":`, error.message);
    return null;
  }
};

/**
 * Set a cache value with TTL.
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 * @returns {Promise<boolean>} true on success, false on failure
 */
const setCache = async (key, value, ttlSeconds) => {
  try {
    await redisClient.set(key, JSON.stringify(value), { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.warn(`[redis] setCache failed for key "${key}":`, error.message);
    return false;
  }
};

/**
 * Delete one or more cache keys.
 * @param {string|string[]} keyOrPattern — a single key, or an array of keys
 * @returns {Promise<boolean>} true on success, false on failure
 */
const deleteCache = async (keyOrPattern) => {
  try {
    if (Array.isArray(keyOrPattern)) {
      if (keyOrPattern.length === 0) {
        return true;
      }
      await redisClient.del(...keyOrPattern);
    } else {
      await redisClient.del(keyOrPattern);
    }
    return true;
  } catch (error) {
    console.warn(
      `[redis] deleteCache failed for key(s) "${keyOrPattern}":`,
      error.message
    );
    return false;
  }
};

module.exports = {
  redisClient,
  getCache,
  setCache,
  deleteCache,
};
