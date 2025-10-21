import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import VotingCalculator from '@/lib/voting-calculator'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { candidateId, projectId, location } = await request.json()

    if (!candidateId || !projectId) {
      return NextResponse.json(
        { error: 'candidateId and projectId are required' },
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
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted in this election' },
        { status: 400 }
      )
    }

    // Verify candidate exists and is active
    const candidate = await db.candidate.findUnique({
      where: {
        id: candidateId,
        isActive: true,
      },
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Invalid candidate' },
        { status: 400 }
      )
    }

    // Verify project exists and is active
    const project = await db.votingProject.findUnique({
      where: {
        id: projectId,
        isActive: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Invalid voting project' },
        { status: 400 }
      )
    }

    // Check if voting is open
    const now = new Date()
    if (now < project.startDate || now > project.endDate) {
      return NextResponse.json(
        { error: 'Voting is not currently open for this project' },
        { status: 400 }
      )
    }

    // Check if user can vote
    const canVoteResult = await VotingCalculator.canUserVote(session.userId, projectId)
    if (!canVoteResult.canVote) {
      return NextResponse.json(
        { error: canVoteResult.reason },
        { status: 400 }
      )
    }

    // Calculate vote weight
    const voteWeight = await VotingCalculator.calculateVoteWeight(session.userId, projectId)

    // Create the vote
    const vote = await db.vote.create({
      data: {
        userId: session.userId,
        candidateId,
        projectId,
        weight: voteWeight,
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        location: location ? JSON.stringify(location) : null,
      },
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        userId: session.userId,
        projectId,
        action: 'VOTE_CAST',
        details: JSON.stringify({
          candidateId,
          voteId: vote.id,
          location: location ? 'captured' : 'not_captured'
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({
      message: 'Vote cast successfully',
      voteId: vote.id,
    })
  } catch (error) {
    console.error('Failed to cast vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const allProjects = searchParams.get('allProjects') // New parameter to get all activity

    let votes
    if (projectId) {
      // Get votes for a specific project
      votes = await db.vote.findMany({
        where: {
          projectId,
        },
        include: {
          user: {
            select: {
              name: true,
              apartmentUnit: true,
              apartmentSize: true,
            },
          },
          candidate: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      })
    } else if (allProjects === 'true') {
      // Get recent votes across all projects
      votes = await db.vote.findMany({
        include: {
          candidate: {
            select: {
              name: true,
            },
          },
          project: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 50, // Limit to last 50 votes
      })
    } else {
      // Get votes for current user only
      votes = await db.vote.findMany({
        where: {
          userId: session.userId,
        },
        include: {
          candidate: {
            select: {
              name: true,
            },
          },
          project: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      })
    }

    const formattedVotes = votes.map(vote => ({
      id: vote.id,
      timestamp: vote.timestamp.toISOString(),
      ipAddress: vote.ipAddress,
      userAgent: vote.userAgent,
      location: vote.location ? JSON.parse(vote.location) : null,
      candidateName: vote.candidate?.name,
      projectTitle: (vote as any).project?.title,
      ...(projectId && {
        user: (vote as any).user,
      }),
    }))

    return NextResponse.json(formattedVotes)
  } catch (error) {
    console.error('Failed to fetch votes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}