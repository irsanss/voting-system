import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/session'
import { logSecurityEvent, SECURITY_EVENTS } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for security logging
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    // Destroy the session
    await destroySession()

    // Log successful logout
    await logSecurityEvent({
      type: SECURITY_EVENTS.LOGOUT_SUCCESS,
      details: {},
      severity: 'LOW',
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}