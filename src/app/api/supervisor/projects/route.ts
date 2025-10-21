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
        const projects = await prisma.votingProject.findMany({
            where: {
                requiresSupervisorReview: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        console.log(`📋 Supervisor Projects API: Found ${projects.length} projects requiring review`)
        if (projects.length > 0) {
            console.log('Projects:', projects.map(p => ({
                id: p.id,
                title: p.title,
                requiresSupervisorReview: p.requiresSupervisorReview,
                supervisorApprovalStatus: p.supervisorApprovalStatus
            })))
        }

        return NextResponse.json({
            projects
        })

    } catch (error) {
        console.error('Error fetching supervisor projects:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
