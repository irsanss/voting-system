import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // Check if user is SUPERADMIN or COMMITTEE
        const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { role: true }
        })

        if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'COMMITTEE')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const {
            title,
            description,
            votingType,
            votingMethod,
            totalArea,
            startDate,
            endDate,
            isActive,
            isPublished,
            requiresSupervisorReview
        } = body

        // Validate required fields
        if (!title || !votingType || !votingMethod || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create project
        const project = await db.votingProject.create({
            data: {
                title,
                description,
                votingType,
                votingMethod,
                totalArea: totalArea || null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: isActive || false,
                isPublished: isPublished || false,
                requiresSupervisorReview: requiresSupervisorReview || false,
                supervisorApprovalStatus: requiresSupervisorReview ? 'PENDING' : null,
                status: 'UPCOMING' // Will be calculated based on dates
            }
        })

        // Log audit
        await db.auditLog.create({
            data: {
                userId: session.userId,
                projectId: project.id,
                action: 'CREATE_PROJECT',
                details: JSON.stringify({ title: project.title })
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error('Failed to create project:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
