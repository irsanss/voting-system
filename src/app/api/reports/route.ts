import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { projectId, notes, includeVoterDetails } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Get project details
    const project = await db.votingProject.findUnique({
      where: { id: projectId },
      include: {
        candidates: {
          include: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get votes with user details
    const votes = await db.vote.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
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
        timestamp: 'asc',
      },
    })

    // Get audit logs for this project
    const auditLogs = await db.auditLog.findMany({
      where: { projectId },
      orderBy: {
        timestamp: 'desc',
      },
    })

    // Generate report data
    const reportData = {
      project: {
        title: project.title,
        description: project.description,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate.toISOString(),
        isActive: project.isActive,
        totalVotes: project._count.votes,
        totalCandidates: project.candidates.length,
      },
      candidates: project.candidates.map(candidate => ({
        name: candidate.name,
        voteCount: candidate._count.votes,
        percentage: project._count.votes > 0 
          ? Math.round((candidate._count.votes / project._count.votes) * 100) 
          : 0,
      })),
      votes: includeVoterDetails ? votes.map(vote => ({
        voterName: vote.user.name,
        apartmentUnit: vote.user.apartmentUnit,
        apartmentSize: vote.user.apartmentSize,
        voteTime: vote.timestamp.toISOString(),
        deviceInfo: vote.userAgent,
        location: vote.location ? JSON.parse(vote.location) : null,
      })) : votes.map(vote => ({
        voteTime: vote.timestamp.toISOString(),
        deviceInfo: vote.userAgent,
        location: vote.location ? JSON.parse(vote.location) : null,
      })),
      auditLogs: auditLogs.map(log => ({
        action: log.action,
        timestamp: log.timestamp.toISOString(),
        details: log.details ? JSON.parse(log.details) : null,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
      })),
      generatedAt: new Date().toISOString(),
      generatedBy: session.userId,
      notes: notes || '',
    }

    // Create report record
    const report = await db.report.create({
      data: {
        projectId,
        generatedBy: session.userId,
        notes: notes || null,
      },
    })

    // Log audit event
    await db.auditLog.create({
      data: {
        userId: session.userId,
        projectId,
        action: 'REPORT_GENERATED',
        details: JSON.stringify({ 
          reportId: report.id,
          includeVoterDetails,
          totalVotes: votes.length 
        }),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({
      reportId: report.id,
      data: reportData,
    })
  } catch (error) {
    console.error('Failed to generate report:', error)
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

    let reports
    if (projectId) {
      reports = await db.report.findMany({
        where: { projectId },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } else {
      reports = await db.report.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      })
    }

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}