import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('showAll') === 'true'
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

    const now = new Date()

    let whereClause: any = {}

    // Don't filter by isActive - we want to show upcoming projects too
    // Only filter by published status

    if (!includeUnpublished) {
      whereClause.isPublished = true
    }

    const projects = await db.votingProject.findMany({
      where: whereClause,
      include: {
        candidates: {
          select: {
            id: true,
            name: true,
            photo: true
          }
        },
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    const formattedProjects = projects.map(project => {
      // Determine status based on dates and active state
      let status = 'UPCOMING'

      if (project.isActive && now >= project.startDate && now <= project.endDate) {
        status = 'ACTIVE'
      } else if (now > project.endDate) {
        status = 'ENDED'
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        votingType: project.votingType,
        votingMethod: project.votingMethod,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate.toISOString(),
        isActive: project.isActive,
        isPublished: project.isPublished,
        requiresSupervisorReview: project.requiresSupervisorReview,
        supervisorApprovalStatus: project.supervisorApprovalStatus,
        status,
        createdAt: project.createdAt.toISOString(),
        candidateCount: project._count.candidates,
        voteCount: project._count.votes,
        candidates: project.candidates
      }
    })

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      votingType = 'HEAD_OF_APARTMENT',
      votingMethod = 'ONE_PERSON_ONE_VOTE',
      totalArea,
      startDate,
      endDate,
      isActive = false,
      isPublished = false,
    } = await request.json()

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'title, startDate, and endDate are required' },
        { status: 400 }
      )
    }

    // Validate total area for weighted voting method 2
    if (votingMethod === 'WEIGHTED_BY_SIZE_MANUAL' && !totalArea) {
      return NextResponse.json(
        { error: 'totalArea is required for weighted voting method 2' },
        { status: 400 }
      )
    }

    const project = await db.votingProject.create({
      data: {
        title,
        description,
        votingType,
        votingMethod,
        totalArea: totalArea ? parseFloat(totalArea) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
        isPublished,
      },
      include: {
        candidates: {
          select: {
            id: true,
            name: true,
            photo: true
          }
        },
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        action: 'PROJECT_CREATE',
        details: JSON.stringify({ title, projectId: project.id }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // Determine status
    const now = new Date()
    let status = 'UPCOMING'

    if (project.isActive && now >= project.startDate && now <= project.endDate) {
      status = 'ACTIVE'
    } else if (now > project.endDate) {
      status = 'ENDED'
    }

    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      votingType: project.votingType,
      votingMethod: project.votingMethod,
      totalArea: project.totalArea,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate.toISOString(),
      isActive: project.isActive,
      isPublished: project.isPublished,
      status,
      createdAt: project.createdAt.toISOString(),
      candidateCount: project._count.candidates,
      voteCount: project._count.votes,
      candidates: project.candidates
    })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}