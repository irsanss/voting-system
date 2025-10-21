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

        const { projectId } = await request.json()

        if (!projectId) {
            return NextResponse.json(
                { error: 'projectId is required' },
                { status: 400 }
            )
        }

        // Find the user's vote for this project
        const existingVote = await db.vote.findUnique({
            where: {
                userId_projectId: {
                    userId: session.userId,
                    projectId,
                },
            },
            include: {
                candidate: true,
                project: true,
            },
        })

        if (!existingVote) {
            return NextResponse.json(
                { error: 'No vote found to revoke' },
                { status: 400 }
            )
        }

        // Check if voting is still open (can only revoke during voting period)
        const now = new Date()
        if (now < existingVote.project.startDate || now > existingVote.project.endDate) {
            return NextResponse.json(
                { error: 'Votes can only be revoked during the voting period' },
                { status: 400 }
            )
        }

        // Delete the vote
        await db.vote.delete({
            where: {
                id: existingVote.id,
            },
        })

        // Log audit event
        await db.auditLog.create({
            data: {
                userId: session.userId,
                projectId,
                action: 'VOTE_REVOKED',
                details: JSON.stringify({
                    candidateId: existingVote.candidateId,
                    candidateName: existingVote.candidate.name,
                    voteId: existingVote.id,
                    originalVoteTime: existingVote.timestamp,
                }),
                ipAddress: request.headers.get('x-forwarded-for') || undefined,
                userAgent: request.headers.get('user-agent') || undefined,
            },
        })

        return NextResponse.json({
            message: 'Vote revoked successfully',
            revokedVoteId: existingVote.id,
        })
    } catch (error) {
        console.error('Failed to revoke vote:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
