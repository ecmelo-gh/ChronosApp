import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis = globalForRedis.redis || new Redis(process.env.REDIS_URL || '')

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

// Configuração do Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    // Exponential backoff com máximo de 30 segundos
    const delay = Math.min(times * 50, 30000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  disconnectTimeout: 2000,
  commandTimeout: 5000,
  lazyConnect: true,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined
};

// Criar instância do Redis
// export const redis = new Redis(redisConfig);

// Eventos de conexão
redis.on('connect', () => {
  console.info('Redis client connected');
});

redis.on('error', (err) => {
  console.error('Redis client error:', err);
});

redis.on('ready', () => {
  console.info('Redis client ready');
});

redis.on('close', () => {
  console.info('Redis client closed connection');
});

redis.on('reconnecting', () => {
  console.info('Redis client reconnecting');
});

// Função para limpar chaves expiradas
export async function clearExpiredKeys(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      const pipeline = redis.pipeline();
      for (const key of keys) {
        pipeline.ttl(key).then((ttl) => {
          if (ttl <= 0) {
            redis.del(key);
          }
        });
      }
      await pipeline.exec();
    }
  } catch (error) {
    console.error('Error clearing expired keys:', error);
  }
}

// Função para verificar saúde do Redis
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const ping = await redis.ping();
    return ping === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Função para obter métricas do Redis
export async function getRedisMetrics() {
  try {
    const info = await redis.info();
    return info;
  } catch (error) {
    console.error('Error getting Redis metrics:', error);
    return null;
  }
}
