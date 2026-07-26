const { client } = require("../config/redis");
const logger = require("./logger");

const TTL_SECONDS = 60;

// The frontend only ever asks for these two sizes today (5 = "recent" on the
// wallet screen, 200 = the "all transactions" page). Keeping a fixed list
// keeps invalidation a couple of cheap DEL calls instead of a KEYS/SCAN.
const KNOWN_LIMITS = [5, 50, 200];

const cacheKey = (userId, limit) => `transactions:${userId}:${limit}`;

/**
 * Returns the cached transactions array for this user+limit, or null on a
 * miss (key doesn't exist, Redis is down, or the value fails to parse).
 * Never throws — a cache problem should never break the actual request.
 */
const getCachedTransactions = async (userId, limit) => {
  try {
    const raw = await client.get(cacheKey(userId, limit));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    logger.error(`[TX CACHE] get failed: ${error.message}`);
    return null;
  }
};

/**
 * Caches the transactions array for this user+limit for TTL_SECONDS.
 */
const setCachedTransactions = async (userId, limit, transactions) => {
  try {
    await client.set(cacheKey(userId, limit), JSON.stringify(transactions), {
      EX: TTL_SECONDS,
    });
  } catch (error) {
    logger.error(`[TX CACHE] set failed: ${error.message}`);
  }
};

/**
 * Call this right after any write that changes a user's transaction feed
 * (wallet created/deleted, order filled) so the next read isn't stale.
 */
const invalidateTransactionsCache = async (userId) => {
  try {
    await Promise.all(
      KNOWN_LIMITS.map((limit) => client.del(cacheKey(userId, limit))),
    );
  } catch (error) {
    logger.error(`[TX CACHE] invalidate failed: ${error.message}`);
  }
};

module.exports = {
  getCachedTransactions,
  setCachedTransactions,
  invalidateTransactionsCache,
};