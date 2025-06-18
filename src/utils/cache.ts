// internal dependencies
import redis from "./redis";
import { config } from "./config";

/**
 * Sets a value in Redis with TTL (in seconds)
 * @template T
 * @param {string} key - Redis key to set
 * @param {T} value - Value to store (will be stringified)
 * @param {number} ttlSec - Time-to-live in seconds (default: 60)
 * @returns {Promise<void>}
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSec: number = 60
): Promise<void> {
  if (!config.useRedisCache) return;
  await redis.set(key, JSON.stringify(value), "EX", ttlSec);
}

/**
 * Gets a value from Redis cache
 * @template T
 * @param {string} key - Redis key to retrieve
 * @returns {Promise<T | null>} - Parsed object or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!config.useRedisCache) return null;
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

/**
 * Deletes a cache entry
 * @param {string} key - Redis key to delete
 * @returns {Promise<void>}
 */
export async function delCache(key: string): Promise<void> {
  if (!config.useRedisCache) return;
  await redis.del(key);
}

/**
 *
 * Method to create a cache key string by combining a prefix with sorted parameters
 * Ensures that identical parameter objects always produce the same cache key
 *
 * @param prefix - namespace prefix for the key (e.g., 'openPRs')
 * @param params - object containing parameters to include in the key
 * @returns deterministic string key for cache storage and retrieval
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, string | number | boolean | string[]>
): string {
  // Sort keys to ensure consistent ordering
  const sortedParams: Record<string, string | number | boolean> = {};
  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key];
      sortedParams[key] = Array.isArray(value) ? value.join(',') : value;
    });

  // Serialize sorted params to JSON
  const serialized = JSON.stringify(sortedParams);

  // Combine prefix and serialized params
  return `${prefix}:${serialized}`;
}
