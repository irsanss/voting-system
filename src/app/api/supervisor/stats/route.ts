import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Get session
        const session = await getSession()

        if (!session?.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user to verify role
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { role: true, email: true, name: true }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Only supervisors and superadmins can access this
        if (user.role !== 'SUPERVISOR' && user.role !== 'SUPERADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Supervisor access required' },
                { status: 403 }
            )
        }

        // Get all projects that require supervisor review
        const allProjects = await prisma.votingProject.findMany({
            where: {
                requiresSupervisorReview: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                isActive: true,
                requiresSupervisorReview: true,
                supervisorApprovalStatus: true,
                supervisorComments: true,
                supervisorReviewedBy: true,
                supervisorReviewedAt: true,
                createdAt: true
            }
        })

        // Calculate stats
        const stats = {
            pendingReviews: allProjects.filter(p =>
                !p.supervisorApprovalStatus || p.supervisorApprovalStatus === 'PENDING'
            ).length,
            approvedProjects: allProjects.filter(p =>
                p.supervisorApprovalStatus === 'APPROVED'
            ).length,
            rejectedProjects: allProjects.filter(p =>
                p.supervisorApprovalStatus === 'REJECTED'
            ).length,
            totalReviewed: allProjects.filter(p =>
                p.supervisorApprovalStatus === 'APPROVED' || p.supervisorApprovalStatus === 'REJECTED'
            ).length
        }

        console.log(`📊 Supervisor Stats API: Found ${allProjects.length} projects requiring review`)
        console.log('Stats:', stats)

        // Get recent pending projects (limit 5)
        const recentProjects = allProjects
            .filter(p => !p.supervisorApprovalStatus || p.supervisorApprovalStatus === 'PENDING')
            .slice(0, 5)
            .map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                submittedAt: p.createdAt.toISOString(),
                submittedBy: 'Admin' // Default to 'Admin' since we don't have createdBy field
            }))

        return NextResponse.json({
            stats,
            recentProjects
        })

    } catch (error) {
        console.error('Error fetching supervisor stats:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
