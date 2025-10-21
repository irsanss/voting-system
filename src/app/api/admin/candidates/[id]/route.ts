import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

// PUT - Update candidate
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const candidateId = params.id
        const { name, vision, mission, reason, isActive } = await request.json()

        if (!name) {
            return NextResponse.json(
                { error: 'name is required' },
                { status: 400 }
            )
        }

        const candidate = await db.candidate.update({
            where: { id: candidateId },
            data: {
                name,
                vision,
                mission,
                reason,
                isActive
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        })

        return NextResponse.json(candidate)
    } catch (error) {
        console.error('Failed to update candidate:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Delete candidate
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const candidateId = params.id

        // Check if candidate has votes
        const voteCount = await db.vote.count({
            where: { candidateId }
        })

        if (voteCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete candidate with existing votes' },
                { status: 400 }
            )
        }

        await db.candidate.delete({
            where: { id: candidateId }
        })

        return NextResponse.json({
            message: 'Candidate deleted successfully'
        })
    } catch (error) {
        console.error('Failed to delete candidate:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
