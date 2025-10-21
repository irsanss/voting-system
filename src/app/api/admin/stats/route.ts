import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
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

        // Get statistics
        const [
            totalVoters,
            totalCandidates,
            allProjects,
            totalVotes
        ] = await Promise.all([
            db.user.count({
                where: { role: 'VOTER' }
            }),
            db.candidate.count(),
            db.votingProject.findMany({
                select: {
                    status: true
                }
            }),
            db.vote.count()
        ])

        const upcomingProjects = allProjects.filter(p => p.status === 'UPCOMING').length
        const activeProjects = allProjects.filter(p => p.status === 'ACTIVE').length
        const endedProjects = allProjects.filter(p => p.status === 'ENDED').length

        return NextResponse.json({
            totalVoters,
            totalCandidates,
            upcomingProjects,
            activeProjects,
            endedProjects,
            totalVotes
        })
    } catch (error) {
        console.error('Failed to fetch admin stats:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
