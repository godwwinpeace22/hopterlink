type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export const cacheKeys = {
  profile: (userId: string) => `profile:${userId}`,
  providerProfile: (userId: string) => `provider_profile:${userId}`,
};

export async function cachedQuery<T>(
  key: string,
  ttlMs: number,
  fetcher: () => PromiseLike<T>,
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && entry.expiresAt > now) {
    return entry.value as T;
  }

  const value = await fetcher();
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidateCache(key: string) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}
