import { RATE_LIMITS } from './validation'

interface RateLimitEntry {
  count: number
  resetTime: number
  isBlocked: boolean
  blockExpiry?: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now && !entry.isBlocked) {
        this.store.delete(key)
      } else if (entry.isBlocked && entry.blockExpiry && entry.blockExpiry < now) {
        this.store.delete(key)
      }
    }
  }

  public isAllowed(
    identifier: string,
    limit: typeof RATE_LIMITS[keyof typeof RATE_LIMITS]
  ): { allowed: boolean; remaining: number; resetTime: number; isBlocked: boolean } {
    this.cleanup()
    const now = Date.now()
    const key = identifier

    const entry = this.store.get(key)

    if (!entry) {
      // First request
      this.store.set(key, {
        count: 1,
        resetTime: now + limit.windowMs,
        isBlocked: false,
      })
      return {
        allowed: true,
        remaining: limit.maxAttempts - 1,
        resetTime: now + limit.windowMs,
        isBlocked: false,
      }
    }

    // Check if blocked
    if (entry.isBlocked && entry.blockExpiry && entry.blockExpiry > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockExpiry,
        isBlocked: true,
      }
    }

    // Check if window has expired
    if (entry.resetTime < now) {
      // Reset window
      this.store.set(key, {
        count: 1,
        resetTime: now + limit.windowMs,
        isBlocked: false,
      })
      return {
        allowed: true,
        remaining: limit.maxAttempts - 1,
        resetTime: now + limit.windowMs,
        isBlocked: false,
      }
    }

    // Increment count
    const newCount = entry.count + 1

    if (newCount > limit.maxAttempts) {
      // Block the user
      const blockExpiry = now + limit.blockDuration
      this.store.set(key, {
        count: newCount,
        resetTime: entry.resetTime,
        isBlocked: true,
        blockExpiry,
      })
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockExpiry,
        isBlocked: true,
      }
    }

    // Update count
    this.store.set(key, {
      ...entry,
      count: newCount,
    })

    return {
      allowed: true,
      remaining: limit.maxAttempts - newCount,
      resetTime: entry.resetTime,
      isBlocked: false,
    }
  }

  public reset(identifier: string): void {
    this.store.delete(identifier)
  }

  public getStats(identifier: string): RateLimitEntry | undefined {
    return this.store.get(identifier)
  }
}

// Singleton instances
export const loginRateLimiter = new RateLimiter()
export const registrationRateLimiter = new RateLimiter()
export const votingRateLimiter = new RateLimiter()
export const apiRateLimiter = new RateLimiter()

// Helper functions
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  return ip
}

export function getUserIdentifier(userId: string, projectId?: string): string {
  return projectId ? `${userId}:${projectId}` : userId
}