import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.warn('Redis not configured')
    return null
  }

  if (!redis) {
    const isUpstash = process.env.REDIS_URL.includes('upstash.io')

    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      // Upstash requires TLS - rediss:// URLs handle this automatically
      // but we add explicit TLS config for robustness
      ...(isUpstash ? {
        tls: {},
        enableReadyCheck: false,
        lazyConnect: true,
      } : {}),
    })

    redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })
  }

  return redis
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedis()
  if (!client) return null
  try {
    return await client.get(key)
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.set(key, value, 'EX', ttlSeconds)
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

export async function cacheDelete(key: string): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.del(key)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

export { redis }
