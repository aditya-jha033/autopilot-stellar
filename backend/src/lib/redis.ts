import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Redis not configured — return null and fall back to in-memory
    return null;
  }

  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return _redis;
}

/**
 * Rate limit check using Redis sliding window.
 * Returns { allowed: boolean, remaining: number, resetInMs: number }
 */
export async function checkRateLimit(
  key: string,
  maxRequests = 100,
  windowSecs = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();

  // If Redis not configured, always allow (fallback)
  if (!redis) return { allowed: true, remaining: maxRequests };

  const now = Date.now();
  const windowKey = `rl:${key}:${Math.floor(now / (windowSecs * 1000))}`;

  const count = await redis.incr(windowKey);
  if (count === 1) {
    await redis.expire(windowKey, windowSecs);
  }

  const allowed = count <= maxRequests;
  return { allowed, remaining: Math.max(0, maxRequests - count) };
}

/**
 * Store the Horizon cursor position for a wallet address.
 * Used by the automation worker to resume from where it left off.
 */
export async function saveHorizonCursor(publicKey: string, cursor: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(`horizon:cursor:${publicKey}`, cursor, { ex: 60 * 60 * 24 * 7 }); // 7 days TTL
}

export async function getHorizonCursor(publicKey: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  return await redis.get<string>(`horizon:cursor:${publicKey}`);
}

/**
 * Cache any value with a TTL (useful for balance caching, etc.)
 */
export async function cacheSet(key: string, value: unknown, ttlSecs = 30): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), { ex: ttlSecs });
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  const val = await redis.get<string>(key);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}
