// internal dependencies
import redis from "./redis.js";
import "dotenv/config";
import { config } from './config.js';

const useRedisCache = process.env.USE_REDIS_CACHE;
console.log("1. use redis cache", useRedisCache);
console.log("1. Connecting to Redis:", process.env.REDIS_URL);
console.log("1. config redis url", config.redisUrl);

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
  if (useRedisCache == "false") return;
  await redis.set(key, JSON.stringify(value), "EX", ttlSec);
   console.log(`[CACHE SET] ${key}`);
}

/**
 * Gets a value from Redis cache
 * @template T
 * @param {string} key - Redis key to retrieve
 * @returns {Promise<T | null>} - Parsed object or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (useRedisCache == "false") return null;
  const cached = await redis.get(key);
  if (cached) {
    console.log(`[CACHE HIT] ${key}`);
    return JSON.parse(cached);
  } else {
    console.log(`[CACHE MISS] ${key}`);
    return null;
  }
}

/**
 * Deletes a cache entry
 * @param {string} key - Redis key to delete
 * @returns {Promise<void>}
 */
export async function delCache(key: string): Promise<void> {
  if (useRedisCache == "false") return;
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
