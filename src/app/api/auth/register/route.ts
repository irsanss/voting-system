import { NextRequest, NextResponse } from 'next/server'
import { createUser, logAuditEvent } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, apartmentUnit, apartmentSize, language } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Create user with VOTER role by default
    const user = await createUser({
      name,
      email,
      password,
      role: UserRole.VOTER,
      apartmentUnit,
      apartmentSize,
      language: language || 'en',
    })

    // Log audit event
    await logAuditEvent({
      userId: user.id,
      action: 'REGISTER',
      details: JSON.stringify({ email, role: UserRole.VOTER }),
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}