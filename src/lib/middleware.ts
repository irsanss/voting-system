import { NextRequest, NextResponse } from 'next/server'
import { logSecurityEvent, SECURITY_EVENTS } from './security'

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js development
      "style-src 'self' 'unsafe-inline'", // Required for Tailwind
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  // Other security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  )
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

export function validateRequest(request: NextRequest): {
  isValid: boolean
  error?: string
  riskScore: number
} {
  let riskScore = 0
  const reasons: string[] = []

  // Check for suspicious headers
  const userAgent = request.headers.get('user-agent') || ''
  if (!userAgent || userAgent.length < 10) {
    riskScore += 20
    reasons.push('Suspicious or missing User-Agent')
  }

  // Check for common bot patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    riskScore += 15
    reasons.push('Bot-like User-Agent detected')
  }

  // Check for suspicious IP patterns
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = request.ip || forwardedFor?.split(',')[0] || realIp || 'unknown'

  // Check for private IP ranges in forwarded headers
  if (forwardedFor) {
    const ips = forwardedFor.split(',')
    for (const forwardedIp of ips) {
      const trimmedIp = forwardedIp.trim()
      if (trimmedIp.startsWith('192.168.') || 
          trimmedIp.startsWith('10.') || 
          trimmedIp.startsWith('172.')) {
        riskScore += 10
        reasons.push('Private IP in forwarded headers')
        break
      }
    }
  }

  // Check request size
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
    riskScore += 25
    reasons.push('Large request payload')
  }

  // Check for suspicious query parameters
  const url = new URL(request.url)
  const suspiciousParams = ['exec', 'cmd', 'system', 'eval', 'assert']
  for (const param of suspiciousParams) {
    if (url.searchParams.has(param)) {
      riskScore += 30
      reasons.push(`Suspicious query parameter: ${param}`)
    }
  }

  // Log high-risk requests
  if (riskScore > 40) {
    logSecurityEvent({
      type: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY_DETECTED,
      details: {
        ip,
        userAgent,
        riskScore,
        reasons,
        url: request.url,
        method: request.method,
      },
      severity: riskScore > 60 ? 'HIGH' : 'MEDIUM',
      ipAddress: ip,
      userAgent,
    })
  }

  return {
    isValid: riskScore < 70,
    error: riskScore >= 70 ? `Request blocked: ${reasons.join(', ')}` : undefined,
    riskScore,
  }
}

export function sanitizeResponse(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  // Remove sensitive fields from objects
  const sensitiveFields = [
    'password', 'hash', 'salt', 'token', 'secret', 'key',
    'resetToken', 'resetTokenExpiry', 'blockedUntil', 'blockReason'
  ]

  const sanitized = Array.isArray(data) ? [...data] : { ...data }

  const removeSensitiveFields = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(removeSensitiveFields)
    }

    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive fields
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        continue
      }

      // Recursively sanitize nested objects
      if (typeof value === 'object' && value !== null) {
        result[key] = removeSensitiveFields(value)
      } else {
        result[key] = value
      }
    }

    return result
  }

  return removeSensitiveFields(sanitized)
}

export function createSecureResponse(data: any, status: number = 200): NextResponse {
  const sanitizedData = sanitizeResponse(data)
  const response = NextResponse.json(sanitizedData, { status })
  return addSecurityHeaders(response)
}

export function createErrorResponse(message: string, status: number = 500): NextResponse {
  // Don't expose internal error messages in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'An error occurred' 
    : message

  const response = NextResponse.json(
    { error: errorMessage },
    { status }
  )
  return addSecurityHeaders(response)
}