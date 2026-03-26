/**
 * Simple in-memory rate limiter.
 * Uses a sliding window approach with automatic cleanup.
 * No external dependencies required.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
let cleanupInterval: ReturnType<typeof setInterval> | null = null

function startCleanup() {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        store.delete(key)
      }
    })
  }, 5 * 60 * 1000)
}

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
 * Check rate limit for a given identifier (e.g., IP address, user ID).
 * Returns { success: true } if the request is allowed, { success: false } if rate limited.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  startCleanup()

  const now = Date.now()
  const key = `${config.maxRequests}:${config.windowSeconds}:${identifier}`
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    // New window
    const resetAt = now + config.windowSeconds * 1000
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: config.maxRequests - 1, resetAt }
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
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
