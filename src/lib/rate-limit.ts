import "server-only";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as unknown as {
  critorbitRateLimitStore?: Map<string, RateLimitBucket>;
};

const store = globalForRateLimit.critorbitRateLimitStore ?? new Map<string, RateLimitBucket>();

if (!globalForRateLimit.critorbitRateLimitStore) {
  globalForRateLimit.critorbitRateLimitStore = store;
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    pruneRateLimitStore(now);
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  store.set(key, bucket);
  return { allowed: true, remaining: Math.max(0, limit - bucket.count) };
}

function pruneRateLimitStore(now: number) {
  if (store.size < 500) {
    return;
  }

  for (const [entryKey, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(entryKey);
    }
  }
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
