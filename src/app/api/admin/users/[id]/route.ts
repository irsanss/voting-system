import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { isActive, role, apartmentUnit, apartmentSize } = await request.json()

    const user = await db.user.update({
      where: {
        id: params.id,
      },
      data: {
        isActive,
        role,
        apartmentUnit,
        apartmentSize: apartmentSize ? parseFloat(apartmentSize) : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        apartmentUnit: true,
        apartmentSize: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: 'USER_UPDATE',
        details: JSON.stringify({ 
          updatedUserId: params.id,
          changes: { isActive, role, apartmentUnit, apartmentSize },
          updatedBy: session.userId 
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has admin privileges
    if (session.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Only superadmin can delete users' },
        { status: 403 }
      )
    }

    // Prevent self-deletion
    if (params.id === session.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await db.user.delete({
      where: {
        id: params.id,
      },
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: 'USER_DELETE',
        details: JSON.stringify({ 
          deletedUserId: params.id,
          deletedBy: session.userId 
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}