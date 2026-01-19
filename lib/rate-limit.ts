import { LRUCache } from 'lru-cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type RateLimitOptions = {
  interval?: number;
  uniqueTokenPerInterval?: number;
};

export class RateLimiter {
  private tokenCache: LRUCache<string, number[]>;

  constructor(options: RateLimitOptions = {}) {
    this.tokenCache = new LRUCache({
      max: options.uniqueTokenPerInterval || 500,
      ttl: options.interval || 60000,
    });
  }

  check(limit: number, token: string): { isRateLimited: boolean; remaining: number } {
    const tokenCount = this.tokenCache.get(token) || [0];
    if (tokenCount[0] === 0) {
      this.tokenCache.set(token, tokenCount);
    }
    tokenCount[0] += 1;

    const currentUsage = tokenCount[0];
    const isRateLimited = currentUsage >= limit;
    const remaining = isRateLimited ? 0 : limit - currentUsage;

    return { isRateLimited, remaining };
  }

  reset(token: string): void {
    this.tokenCache.delete(token);
  }
}

// Create rate limiters for different endpoints
export const publicRateLimiter = new RateLimiter({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 1000,
});

export const authRateLimiter = new RateLimiter({
  interval: 60000,
  uniqueTokenPerInterval: 100,
});

export const adminRateLimiter = new RateLimiter({
  interval: 60000,
  uniqueTokenPerInterval: 50,
});

// Middleware function for API routes
export function withRateLimit(
  handler: Function,
  limiter: RateLimiter = publicRateLimiter,
  limit: number = 100
) {
  return async (request: NextRequest) => {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const { isRateLimited, remaining } = limiter.check(limit, ip);

    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': '60',
          }
        }
      );
    }

    const response = await handler(request);
    
    if (response) {
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', '60');
    }

    return response;
  };
}