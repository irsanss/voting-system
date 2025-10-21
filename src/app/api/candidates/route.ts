import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const includeVoteCount = searchParams.get('includeVoteCount') === 'true'

    let candidates = await db.candidate.findMany({
      where: {
        isActive: true,
        ...(projectId && { projectId }),
      },
      include: {
        user: {
          select: {
            email: true,
            apartmentUnit: true,
            apartmentSize: true,
          },
        },
        ...(includeVoteCount && {
          _count: {
            select: {
              votes: true,
            },
          },
        }),
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Format the response
    const formattedCandidates = candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      photo: candidate.photo,
      vision: candidate.vision,
      mission: candidate.mission,
      reason: candidate.reason,
      teamMembers: candidate.teamMembers ? JSON.parse(candidate.teamMembers) : [],
      images: candidate.images ? JSON.parse(candidate.images) : [],
      videos: candidate.videos ? JSON.parse(candidate.videos) : [],
      isActive: candidate.isActive,
      createdAt: candidate.createdAt.toISOString(),
      voteCount: includeVoteCount ? candidate._count.votes : 0,
      user: candidate.user,
    }))

    return NextResponse.json(formattedCandidates)
  } catch (error) {
    console.error('Failed to fetch candidates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      projectId,
      name,
      photo,
      vision,
      mission,
      reason,
      teamMembers,
      images,
      videos,
    } = await request.json()

    if (!userId || !projectId || !name) {
      return NextResponse.json(
        { error: 'userId, projectId, and name are required' },
        { status: 400 }
      )
    }

    const candidate = await db.candidate.create({
      data: {
        userId,
        projectId,
        name,
        photo,
        vision,
        mission,
        reason,
        teamMembers: teamMembers ? JSON.stringify(teamMembers) : null,
        images: images ? JSON.stringify(images) : null,
        videos: videos ? JSON.stringify(videos) : null,
      },
      include: {
        user: {
          select: {
            email: true,
            apartmentUnit: true,
            apartmentSize: true,
          },
        },
      },
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        userId,
        projectId,
        action: 'CANDIDATE_CREATE',
        details: JSON.stringify({ name, projectId }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({
      id: candidate.id,
      name: candidate.name,
      photo: candidate.photo,
      vision: candidate.vision,
      mission: candidate.mission,
      reason: candidate.reason,
      teamMembers: candidate.teamMembers ? JSON.parse(candidate.teamMembers) : [],
      images: candidate.images ? JSON.parse(candidate.images) : [],
      videos: candidate.videos ? JSON.parse(candidate.videos) : [],
      isActive: candidate.isActive,
      createdAt: candidate.createdAt.toISOString(),
      voteCount: 0,
      user: candidate.user,
    })
  } catch (error: any) {
    console.error('Failed to create candidate:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User is already a candidate for this project' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}