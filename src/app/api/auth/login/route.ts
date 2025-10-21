import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, logAuditEvent } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { logSecurityEvent, SECURITY_EVENTS } from '@/lib/security'
import { ZodError } from 'zod'
import { loginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Get client IP for security logging
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    const user = await authenticateUser(
      validatedData.email,
      validatedData.password,
      request
    )

    if (!user) {
      // Log failed login attempt
      await logSecurityEvent({
        type: SECURITY_EVENTS.LOGIN_FAILED_INVALID_PASSWORD,
        details: { email: validatedData.email },
        severity: 'MEDIUM',
        ipAddress,
        userAgent,
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('USER FROM AUTH:', { id: user.id, email: user.email, role: user.role })

    // Create session
    await createSession(user)

    // Log successful login
    await logAuditEvent({
      userId: user.id,
      action: 'LOGIN',
      details: JSON.stringify({ email: validatedData.email }),
      ipAddress,
      userAgent,
    })

    await logSecurityEvent({
      type: SECURITY_EVENTS.LOGIN_SUCCESS,
      details: { email: validatedData.email, userId: user.id },
      severity: 'LOW',
      userId: user.id,
      ipAddress,
      userAgent,
    })

    // Determine redirect URL based on user role
    let redirectUrl = '/dashboard' // Default for VOTER

    switch (user.role) {
      case 'SUPERADMIN':
      case 'COMMITTEE':
        redirectUrl = '/admin/dashboard'
        break
      case 'CANDIDATE':
        redirectUrl = '/candidate/dashboard'
        break
      case 'AUDITOR':
        redirectUrl = '/auditor/dashboard'
        break
      case 'SUPERVISOR':
        redirectUrl = '/supervisor/dashboard'
        break
      case 'VOTER':
      default:
        redirectUrl = '/dashboard'
        break
    }

    console.log('🔐 LOGIN SUCCESS:', {
      email: user.email,
      role: user.role,
      redirectUrl,
      userId: user.id
    })

    return NextResponse.json({
      message: 'Login successful',
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    // Don't reveal specific error messages for security
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}