import bcrypt from 'bcryptjs'
import { db } from './db'
import { UserRole } from '@prisma/client'
import {
  loginSchema,
  userRegistrationSchema,
  passwordSchema,
  validateAndSanitizeEmail,
  validateAndSanitizeName,
  validateAndSanitizeApartmentUnit,
  sanitizeHtml,
  RATE_LIMITS
} from './validation'
import { loginRateLimiter, getClientIdentifier } from './rate-limit'
import { logSecurityEvent } from './security'
import { generateSecureToken } from './crypto'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hashedPassword)
  } catch (error) {
    // Log failed password verification attempt
    throw new Error('Password verification failed')
  }
}

export async function createUser(data: {
  email: string
  name?: string
  password: string
  role?: UserRole
  apartmentUnit?: string
  apartmentSize?: number
  language?: string
}) {
  // Validate input
  const validatedData = userRegistrationSchema.parse(data)

  // Sanitize inputs
  const sanitizedEmail = validateAndSanitizeEmail(validatedData.email)
  const sanitizedName = validatedData.name ? validateAndSanitizeName(validatedData.name) : undefined
  const sanitizedUnit = validatedData.apartmentUnit ? validateAndSanitizeApartmentUnit(validatedData.apartmentUnit) : undefined

  const hashedPassword = await hashPassword(validatedData.password)

  return db.user.create({
    data: {
      email: sanitizedEmail,
      name: sanitizedName,
      password: hashedPassword,
      role: validatedData.role || UserRole.VOTER,
      apartmentUnit: sanitizedUnit,
      apartmentSize: validatedData.apartmentSize,
      language: validatedData.language || 'en',
    },
  })
}

export async function authenticateUser(email: string, password: string, request?: Request) {
  // Validate input
  const validatedData = loginSchema.parse({ email, password })

  // Check rate limiting
  if (request) {
    const clientIp = getClientIdentifier(request)
    const rateLimitResult = loginRateLimiter.isAllowed(clientIp, RATE_LIMITS.login)

    if (!rateLimitResult.allowed) {
      await logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        details: {
          ip: clientIp,
          email: validatedData.email,
          resetTime: rateLimitResult.resetTime,
        },
        severity: 'HIGH',
      })
      throw new Error('Too many login attempts. Please try again later.')
    }
  }

  // Sanitize email
  const sanitizedEmail = validateAndSanitizeEmail(validatedData.email)

  const user = await db.user.findUnique({
    where: { email: sanitizedEmail },
    include: {
      candidateProfile: true,
    },
  })

  if (!user) {
    await logSecurityEvent({
      type: 'LOGIN_FAILED_USER_NOT_FOUND',
      details: { email: sanitizedEmail },
      severity: 'MEDIUM',
    })
    throw new Error('Invalid credentials')
  }

  if (!user.isActive) {
    await logSecurityEvent({
      type: 'LOGIN_FAILED_INACTIVE_USER',
      details: { email: sanitizedEmail, userId: user.id },
      severity: 'MEDIUM',
    })
    throw new Error('Account is inactive')
  }

  const isValid = await verifyPassword(validatedData.password, user.password)
  if (!isValid) {
    await logSecurityEvent({
      type: 'LOGIN_FAILED_INVALID_PASSWORD',
      details: { email: sanitizedEmail, userId: user.id },
      severity: 'MEDIUM',
    })
    throw new Error('Invalid credentials')
  }

  // Successful login - reset rate limit
  if (request) {
    const clientIp = getClientIdentifier(request)
    loginRateLimiter.reset(clientIp)
  }

  // Log successful login
  await logSecurityEvent({
    type: 'LOGIN_SUCCESS',
    details: { email: sanitizedEmail, userId: user.id },
    severity: 'LOW',
  })

  // Remove password from returned user object
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function logAuditEvent(data: {
  userId?: string
  projectId?: string
  action: string
  details?: string
  ipAddress?: string
  userAgent?: string
}) {
  // Sanitize details to prevent injection
  const sanitizedDetails = data.details ? sanitizeHtml(data.details) : undefined

  return db.auditLog.create({
    data: {
      ...data,
      details: sanitizedDetails,
    },
  })
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.VOTER]: 0,
    [UserRole.CANDIDATE]: 1,
    [UserRole.AUDITOR]: 2,
    [UserRole.SUPERVISOR]: 3,
    [UserRole.COMMITTEE]: 4,
    [UserRole.SUPERADMIN]: 5,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Validate new password
  const validatedPassword = passwordSchema.parse(newPassword)

  // Get user
  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.password)
  if (!isValid) {
    await logSecurityEvent({
      type: 'PASSWORD_CHANGE_FAILED',
      details: { userId, reason: 'Invalid current password' },
      severity: 'MEDIUM',
    })
    throw new Error('Current password is incorrect')
  }

  // Hash new password
  const hashedPassword = await hashPassword(validatedPassword)

  // Update password
  await db.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  // Log successful password change
  await logSecurityEvent({
    type: 'PASSWORD_CHANGED',
    details: { userId },
    severity: 'LOW',
  })
}

export async function resetPassword(email: string): Promise<string> {
  // Validate email
  const sanitizedEmail = validateAndSanitizeEmail(email)

  const user = await db.user.findUnique({
    where: { email: sanitizedEmail },
  })

  if (!user) {
    // Don't reveal if user exists
    return 'If an account exists with this email, a reset link has been sent.'
  }

  // Generate reset token
  const resetToken = generateSecureToken(32)
  const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Update user with reset token
  await db.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  })

  // Log password reset request
  await logSecurityEvent({
    type: 'PASSWORD_RESET_REQUESTED',
    details: { userId: user.id, email: sanitizedEmail },
    severity: 'MEDIUM',
  })

  // In a real application, send email with reset link
  // For now, return the token (in production, this should be sent via email)
  return `Password reset token: ${resetToken}`
}