import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only SUPERADMIN can reset all passwords
    if (session.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only SUPERADMIN can reset all passwords.' },
        { status: 403 }
      )
    }

    // Hash the new password
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Reset all user passwords
    const result = await db.user.updateMany({
      where: {
        // Optionally exclude the current user
        id: { not: session.userId }
      },
      data: {
        password: hashedPassword
      }
    })

    // Log the action for audit purposes
    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: 'RESET_ALL_PASSWORDS',
        details: JSON.stringify({
          affectedUsers: result.count,
          resetTo: 'admin123',
          timestamp: new Date().toISOString(),
          performedBy: session.userId
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully reset passwords for ${result.count} users to "admin123"`,
      affectedUsers: result.count,
      note: 'Your own password was not changed'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}