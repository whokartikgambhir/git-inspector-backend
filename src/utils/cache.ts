// external dependencies
import NodeCache from 'node-cache';

// In-memory cache with a default TTL of 60 seconds
export const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

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
