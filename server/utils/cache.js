import crypto from 'crypto';

/** In-memory cache: sha256(text) -> parsed event object */
const cache = new Map();

/**
 * Returns a SHA-256 hex digest of the input string (used as cache key).
 * @param {string} text
 * @returns {string}
 */
export function hashText(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Look up a cached extract result.
 * @param {string} key
 * @returns {object|undefined}
 */
export function getCached(key) {
  return cache.get(key);
}

/**
 * Store an extract result in the cache.
 * @param {string} key
 * @param {object} value
 */
export function setCached(key, value) {
  // Simple LRU-lite: evict oldest entry when cache grows beyond 500 items
  if (cache.size >= 500) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}

/**
 * Clears the entire cache (used in tests).
 */
export function clearCache() {
  cache.clear();
}
