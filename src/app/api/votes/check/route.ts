import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Check if user has already voted in this project
    const existingVote = await db.vote.findUnique({
      where: {
        userId_projectId: {
          userId: session.userId,
          projectId,
        },
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
    })

    return NextResponse.json({
      hasVoted: !!existingVote,
      voteTimestamp: existingVote?.timestamp.toISOString() || null,
      candidate: existingVote?.candidate || null,
      voteId: existingVote?.id || null,
    })
  } catch (error) {
    console.error('Failed to check vote status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}