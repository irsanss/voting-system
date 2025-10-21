import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = await db.candidate.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            email: true,
            apartmentUnit: true,
            apartmentSize: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

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
      voteCount: candidate._count.votes,
      user: candidate.user,
    })
  } catch (error) {
    console.error('Failed to update candidate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const candidateId = params.id
    const body = await request.json()

    // Verify the candidate belongs to the current user
    const existingCandidate = await db.candidate.findUnique({
      where: { id: candidateId }
    })

    if (!existingCandidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    if (existingCandidate.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own profile' }, { status: 403 })
    }

    // Update the candidate profile (only provided fields)
    const { name, photo, vision, mission, reason, teamMembers, images, videos, socialMedia } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (photo !== undefined) updateData.photo = photo
    if (vision !== undefined) updateData.vision = vision
    if (mission !== undefined) updateData.mission = mission
    if (reason !== undefined) updateData.reason = reason
    if (teamMembers !== undefined) updateData.teamMembers = teamMembers
    if (images !== undefined) updateData.images = images
    if (videos !== undefined) updateData.videos = videos
    if (socialMedia !== undefined) updateData.socialMedia = socialMedia

    const candidate = await db.candidate.update({
      where: { id: candidateId },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            apartmentUnit: true,
            apartmentSize: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        userId: session.userId,
        projectId: candidate.projectId,
        action: 'CANDIDATE_PROFILE_UPDATED',
        details: JSON.stringify({ candidateId, updatedFields: Object.keys(updateData) }),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Candidate profile updated successfully',
      candidate: {
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
        voteCount: candidate._count.votes,
        user: candidate.user,
      }
    })
  } catch (error) {
    console.error('Failed to update candidate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {
      name,
      photo,
      vision,
      mission,
      reason,
      teamMembers,
      images,
      videos,
      isActive,
    } = await request.json()

    const candidate = await db.candidate.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        photo,
        vision,
        mission,
        reason,
        teamMembers: teamMembers ? JSON.stringify(teamMembers) : null,
        images: images ? JSON.stringify(images) : null,
        videos: videos ? JSON.stringify(videos) : null,
        isActive,
      },
      include: {
        user: {
          select: {
            email: true,
            apartmentUnit: true,
            apartmentSize: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        userId: candidate.userId,
        projectId: candidate.projectId,
        action: 'CANDIDATE_UPDATE',
        details: JSON.stringify({ name, candidateId: params.id }),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
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
      voteCount: candidate._count.votes,
      user: candidate.user,
    })
  } catch (error) {
    console.error('Failed to update candidate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}