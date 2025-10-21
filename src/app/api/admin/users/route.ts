import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { createUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has admin privileges
    if (session.role !== 'SUPERADMIN' && session.role !== 'COMMITTEE') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get role filter from query params
    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role')

    const whereClause: any = {}
    if (roleFilter) {
      if (roleFilter === 'SYSTEM') {
        // Return all non-voter users (Committee, Supervisor, Auditor, SuperAdmin)
        whereClause.role = {
          in: ['COMMITTEE', 'SUPERVISOR', 'AUDITOR', 'SUPERADMIN']
        }
      } else {
        whereClause.role = roleFilter
      }
    }

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        apartmentUnit: true,
        apartmentSize: true,
        isActive: true,
        isVerified: true,
        verifiedBy: true,
        verifiedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedUsers = users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has admin privileges
    if (session.role !== 'SUPERADMIN' && session.role !== 'COMMITTEE') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { email, name, password, role, apartmentUnit, apartmentSize, isActive = true } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check role limits
    const roleCounts = await db.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    })

    const limits = {
      [UserRole.SUPERADMIN]: 5,
      [UserRole.COMMITTEE]: 50,
      [UserRole.AUDITOR]: 10,
      [UserRole.CANDIDATE]: 50,
      [UserRole.VOTER]: 10000,
    }

    const currentCount = roleCounts.find(r => r.role === role)?._count.role || 0
    const limit = limits[role as UserRole] || 1000

    if (currentCount >= limit) {
      return NextResponse.json(
        { error: `Maximum limit reached for role: ${role}` },
        { status: 400 }
      )
    }

    const user = await createUser({
      email,
      name,
      password,
      role: role as UserRole,
      apartmentUnit,
      apartmentSize: apartmentSize ? parseFloat(apartmentSize) : undefined,
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: 'USER_CREATE',
        details: JSON.stringify({
          createdUserId: user.id,
          email,
          role,
          createdBy: session.userId
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      apartmentUnit: user.apartmentUnit,
      apartmentSize: user.apartmentSize,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    })
  } catch (error: any) {
    console.error('Failed to create user:', error)

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