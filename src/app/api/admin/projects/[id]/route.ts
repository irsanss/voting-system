import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

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

        const project = await db.votingProject.findUnique({
            where: { id: projectId }
        })

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            id: project.id,
            title: project.title,
            description: project.description,
            status: project.status,
            votingType: project.votingType,
            votingMethod: project.votingMethod,
            startDate: project.startDate.toISOString(),
            endDate: project.endDate.toISOString(),
            isActive: project.isActive,
            isPublished: project.isPublished,
        })
    } catch (error) {
        console.error('Failed to fetch project:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

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

        // Check if project exists
        const existingProject = await db.votingProject.findUnique({
            where: { id: projectId }
        })

        if (!existingProject) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        // Prepare update data
        const updateData: any = {}

        if (body.title !== undefined) updateData.title = body.title
        if (body.description !== undefined) updateData.description = body.description
        if (body.votingType !== undefined) updateData.votingType = body.votingType
        if (body.votingMethod !== undefined) updateData.votingMethod = body.votingMethod
        if (body.totalArea !== undefined) updateData.totalArea = body.totalArea
        if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
        if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
        if (body.isActive !== undefined) updateData.isActive = body.isActive
        if (body.isPublished !== undefined) updateData.isPublished = body.isPublished
        if (body.requiresSupervisorReview !== undefined) updateData.requiresSupervisorReview = body.requiresSupervisorReview

        // Update project
        const project = await db.votingProject.update({
            where: { id: projectId },
            data: updateData
        })

        // Log audit
        await db.auditLog.create({
            data: {
                userId: session.userId,
                projectId: project.id,
                action: 'UPDATE_PROJECT',
                details: JSON.stringify(updateData)
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error('Failed to update project:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

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

        // Check if project exists
        const project = await db.votingProject.findUnique({
            where: { id: projectId },
            include: {
                _count: {
                    select: { votes: true }
                }
            }
        })

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        // Check if project has votes
        if (project._count.votes > 0) {
            return NextResponse.json(
                { error: 'Cannot delete project with existing votes' },
                { status: 400 }
            )
        }

        // Delete related candidates first (due to foreign key constraints)
        await db.candidate.deleteMany({
            where: { projectId }
        })

        // Delete audit logs related to this project
        await db.auditLog.deleteMany({
            where: { projectId }
        })

        // Delete the project
        await db.votingProject.delete({
            where: { id: projectId }
        })

        return NextResponse.json({
            message: 'Project deleted successfully'
        })
    } catch (error) {
        console.error('Failed to delete project:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
