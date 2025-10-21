import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        apartmentUnit: true,
        apartmentSize: true,
        language: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Failed to get user info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}