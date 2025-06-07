import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { NextRequest } from 'next/server'

// Redis client instance
let redis: Redis;

// Initialize Redis client
export function initRedis(options?: { url?: string; token?: string }) {
  redis = new Redis({
    url: options?.url || process.env.UPSTASH_REDIS_REST_URL || '',
    token: options?.token || process.env.UPSTASH_REDIS_REST_TOKEN || '',
  });
  return redis;
}

// Get Redis client instance
export function getRedis() {
  if (!redis) {
    redis = initRedis();
  }
  return redis;
}

// Create rate limiter
export function createRatelimit() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
  });
}

export interface RateLimitConfig {
  interval: number; // em segundos
  maxRequests: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  auth: {
    interval: 300, // 5 minutos
    maxRequests: 10
  },
  reset: {
    interval: 3600, // 1 hora
    maxRequests: 3
  },
  api: {
    interval: 60, // 1 minuto
    maxRequests: 100
  }
};

export class RateLimit {
  constructor(
    private config: RateLimitConfig,
    private prefix: string = 'rate-limit'
  ) {}

  private getKey(identifier: string): string {
    return `${this.prefix}:${identifier}`;
  }

  async increment(identifier: string): Promise<boolean> {
    const key = this.getKey(identifier);
    const now = Math.floor(Date.now() / 1000);

    try {
      // Usar pipeline para garantir atomicidade
      const pipeline = getRedis().pipeline();
      
      pipeline.zadd(key, { score: now, member: `${now}` });
      pipeline.zremrangebyscore(key, 0, now - this.config.interval);
      pipeline.zcard(key);
      pipeline.expire(key, this.config.interval);

      const results = await pipeline.exec() as [Error | null, unknown][];
      if (!results) return false;

      const requestCount = results[2]?.[1] as number ?? 0;
      return requestCount <= this.config.maxRequests;
    } catch (error) {
      console.error('Rate limit error:', error);
      // Em caso de erro, permitir request (melhor UX)
      return true;
    }
  }

  async check(identifier: string): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  }> {
    const key = this.getKey(identifier);
    const now = Math.floor(Date.now() / 1000);

    try {
      // Limpar requests antigos e contar atuais
      await getRedis().zremrangebyscore(key, 0, now - this.config.interval);
      const requestCount = await getRedis().zcard(key);

      return {
        success: requestCount < this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - requestCount),
        reset: now + this.config.interval
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return {
        success: true,
        remaining: 1,
        reset: now + this.config.interval
      };
    }
  }

  async reset(identifier: string): Promise<boolean> {
    const key = this.getKey(identifier);
    try {
      await getRedis().del(key);
      return true;
    } catch (error) {
      console.error('Rate limit reset error:', error);
      return false;
    }
  }
}

// Middleware para Next.js
export async function rateLimitMiddleware(
  req: NextRequest,
  type: keyof typeof DEFAULT_CONFIGS = 'api'
) {
  const ip = req.ip || 'anonymous';
  const config = DEFAULT_CONFIGS[type];
  const limiter = new RateLimit(config, `rate-limit:${type}`);

  const { success, remaining, reset } = await limiter.check(ip);

  // Adicionar headers
  const headers = new Headers(req.headers);
  headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', reset.toString());

  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': (reset - Math.floor(Date.now() / 1000)).toString(),
        ...Object.fromEntries(headers)
      }
    });
  }

  // Incrementar contador
  await limiter.increment(ip);

  return null;
}
