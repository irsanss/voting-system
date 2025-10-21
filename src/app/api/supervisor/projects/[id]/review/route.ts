import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
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
            select: {
                id: true,
                role: true,
                email: true,
                name: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Only supervisors and superadmins can review
        if (user.role !== 'SUPERVISOR' && user.role !== 'SUPERADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Supervisor access required' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { action, comments } = body

        if (!action || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be APPROVE or REJECT' },
                { status: 400 }
            )
        }

        // Get the project
        const project = await prisma.votingProject.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                title: true,
                requiresSupervisorReview: true,
                supervisorApprovalStatus: true
            }
        })

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        if (!project.requiresSupervisorReview) {
            return NextResponse.json(
                { error: 'This project does not require supervisor review' },
                { status: 400 }
            )
        }

        // Update the project with supervisor decision
        const updatedProject = await prisma.votingProject.update({
            where: { id: projectId },
            data: {
                supervisorApprovalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                supervisorComments: comments || null,
                supervisorReviewedBy: user.id,
                supervisorReviewedAt: new Date()
            }
        })

        // Log the action in audit trail
        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                projectId: projectId,
                action: action === 'APPROVE' ? 'SUPERVISOR_APPROVE' : 'SUPERVISOR_REJECT',
                details: JSON.stringify({
                    projectTitle: project.title,
                    comments: comments || null,
                    reviewedBy: user.name || user.email
                })
            }
        })

        console.log(`✅ Supervisor ${action === 'APPROVE' ? 'approved' : 'rejected'} project: ${project.title}`)

        return NextResponse.json({
            success: true,
            project: updatedProject,
            message: `Project ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`
        })

    } catch (error) {
        console.error('Error reviewing project:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
