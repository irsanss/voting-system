import { db } from './db'

export interface SecurityEvent {
  type: string
  details: any
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  ipAddress?: string
  userAgent?: string
  timestamp?: Date
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    await db.securityLog.create({
      data: {
        type: event.type,
        details: JSON.stringify(event.details),
        severity: event.severity,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: event.timestamp || new Date(),
      },
    })

    // For critical events, also log to console (in production, use proper logging service)
    if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
      console.error(`SECURITY ALERT [${event.severity}]: ${event.type}`, event.details)
    }
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

export async function detectSuspiciousActivity(userId: string): Promise<{
  isSuspicious: boolean
  reasons: string[]
  riskScore: number
}> {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const recentEvents = await db.securityLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: twentyFourHoursAgo,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  })

  const reasons: string[] = []
  let riskScore = 0

  // Check for multiple failed logins
  const failedLogins = recentEvents.filter(e => 
    e.type === 'LOGIN_FAILED_INVALID_PASSWORD' || 
    e.type === 'LOGIN_FAILED_USER_NOT_FOUND'
  )

  if (failedLogins.length > 5) {
    reasons.push('Multiple failed login attempts')
    riskScore += 30
  }

  // Check for rapid password changes
  const passwordChanges = recentEvents.filter(e => e.type === 'PASSWORD_CHANGED')
  if (passwordChanges.length > 2) {
    reasons.push('Multiple password changes in short period')
    riskScore += 25
  }

  // Check for suspicious voting patterns
  const votingEvents = recentEvents.filter(e => e.type === 'VOTE_CAST')
  if (votingEvents.length > 10) {
    reasons.push('Unusual voting activity')
    riskScore += 20
  }

  // Check for multiple IP addresses
  const uniqueIPs = new Set(recentEvents.map(e => e.ipAddress).filter(Boolean))
  if (uniqueIPs.size > 5) {
    reasons.push('Multiple IP addresses detected')
    riskScore += 15
  }

  // Check for admin access from new locations
  const adminEvents = recentEvents.filter(e => 
    e.type.includes('ADMIN') || e.type.includes('SUPERADMIN')
  )
  if (adminEvents.length > 0 && uniqueIPs.size > 2) {
    reasons.push('Admin access from multiple locations')
    riskScore += 35
  }

  return {
    isSuspicious: riskScore > 40,
    reasons,
    riskScore,
  }
}

export async function blockSuspiciousUser(userId: string, reason: string, durationHours: number = 24): Promise<void> {
  const blockExpiry = new Date(Date.now() + durationHours * 60 * 60 * 1000)
  
  await db.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      blockedUntil: blockExpiry,
      blockReason: reason,
    },
  })

  await logSecurityEvent({
    type: 'USER_BLOCKED',
    details: { userId, reason, blockExpiry },
    severity: 'HIGH',
    userId,
  })
}

export async function checkAndHandleSuspiciousActivity(userId: string): Promise<void> {
  const analysis = await detectSuspiciousActivity(userId)
  
  if (analysis.isSuspicious) {
    await logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY_DETECTED',
      details: {
        userId,
        reasons: analysis.reasons,
        riskScore: analysis.riskScore,
      },
      severity: 'HIGH',
      userId,
    })

    // Auto-block for high risk scores
    if (analysis.riskScore > 60) {
      await blockSuspiciousUser(
        userId, 
        `Automatic block: ${analysis.reasons.join(', ')}`,
        24
      )
    }
  }
}

// Common security event types
export const SECURITY_EVENTS = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  LOGIN_FAILED_INVALID_PASSWORD: 'LOGIN_FAILED_INVALID_PASSWORD',
  LOGIN_FAILED_USER_NOT_FOUND: 'LOGIN_FAILED_USER_NOT_FOUND',
  LOGIN_FAILED_INACTIVE_USER: 'LOGIN_FAILED_INACTIVE_USER',
  LOGIN_FAILED_RATE_LIMITED: 'LOGIN_FAILED_RATE_LIMITED',
  
  // Password events
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_CHANGE_FAILED: 'PASSWORD_CHANGE_FAILED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  
  // Voting events
  VOTE_CAST: 'VOTE_CAST',
  VOTE_FAILED_DUPLICATE: 'VOTE_FAILED_DUPLICATE',
  VOTE_FAILED_INVALID_PROJECT: 'VOTE_FAILED_INVALID_PROJECT',
  
  // Admin events
  ADMIN_ACCESS_GRANTED: 'ADMIN_ACCESS_GRANTED',
  ADMIN_ACCESS_DENIED: 'ADMIN_ACCESS_DENIED',
  USER_CREATED: 'USER_CREATED',
  USER_DELETED: 'USER_DELETED',
  USER_MODIFIED: 'USER_MODIFIED',
  
  // Security events
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY_DETECTED: 'SUSPICIOUS_ACTIVITY_DETECTED',
  USER_BLOCKED: 'USER_BLOCKED',
  USER_UNBLOCKED: 'USER_UNBLOCKED',
  INVALID_SESSION_ATTEMPT: 'INVALID_SESSION_ATTEMPT',
  CSRF_ATTEMPT: 'CSRF_ATTEMPT',
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  
  // Data events
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_IMPORT: 'DATA_IMPORT',
  DATA_MODIFIED: 'DATA_MODIFIED',
  DATA_ACCESSED_UNAUTHORIZED: 'DATA_ACCESSED_UNAUTHORIZED',
} as const

export type SecurityEventType = typeof SECURITY_EVENTS[keyof typeof SECURITY_EVENTS]