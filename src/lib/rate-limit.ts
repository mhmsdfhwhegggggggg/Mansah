import { getRedis } from './redis'

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Window size in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check rate limit for a given identifier using Redis.
 * If Redis is not available, it handles the limit gracefully (allows request)
 * but logs a warning.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedis();
  
  const now = Date.now()
  const resetAt = now + config.windowSeconds * 1000
    
  if (!redis) {
    console.warn('Redis not available for rate limiting. Allowing request.');
    return { success: true, remaining: config.maxRequests - 1, resetAt };
  }

  const key = `rate-limit:${config.maxRequests}:${config.windowSeconds}:${identifier}`

  try {
    const currentCount = await redis.incr(key);
    
    // If it's the first request, set the expiration
    if (currentCount === 1) {
      await redis.expire(key, config.windowSeconds);
    }
    
    if (currentCount > config.maxRequests) {
      return { success: false, remaining: 0, resetAt };
    }
    
    return {
      success: true,
      remaining: config.maxRequests - currentCount,
      resetAt,
    }
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // Fail open in case of Redis errors
    return { success: true, remaining: config.maxRequests - 1, resetAt };
  }
}

/**
 * Get the client IP address from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return 'unknown'
}

// Predefined rate limit configs
export const RATE_LIMITS = {
  /** Auth endpoints: 10 requests per minute */
  auth: { maxRequests: 10, windowSeconds: 60 },
  /** Register: 5 requests per minute */
  register: { maxRequests: 5, windowSeconds: 60 },
  /** Order creation: 10 requests per minute */
  orderCreate: { maxRequests: 10, windowSeconds: 60 },
  /** Payment creation: 10 requests per minute */
  paymentCreate: { maxRequests: 10, windowSeconds: 60 },
  /** General API: 60 requests per minute */
  general: { maxRequests: 60, windowSeconds: 60 },
  /** Track endpoint: 20 requests per minute */
  track: { maxRequests: 20, windowSeconds: 60 },
  /** Seed endpoint: 3 requests per minute */
  seed: { maxRequests: 3, windowSeconds: 60 },
} as const
