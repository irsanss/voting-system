import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/candidates/stats/:projectId - Get voting statistics for a candidate in a specific project
export async function GET(
    req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await getSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const projectId = params.projectId

        // Find the candidate profile for this user in this project
        const candidate = await prisma.candidate.findFirst({
            where: {
                userId: session.userId,
                projectId: projectId
            }
        })

        if (!candidate) {
            return NextResponse.json({ error: 'Candidate not found for this project' }, { status: 404 })
        }

        // Get total votes for this candidate
        const totalVotes = await prisma.vote.count({
            where: {
                candidateId: candidate.id,
                projectId: projectId
            }
        })

        // Get total weighted votes (sum of weights)
        const weightedVotes = await prisma.vote.aggregate({
            where: {
                candidateId: candidate.id,
                projectId: projectId
            },
            _sum: {
                weight: true
            }
        })

        // Get all candidates in this project with their vote counts
        const allCandidates = await prisma.candidate.findMany({
            where: {
                projectId: projectId,
                isActive: true
            },
            include: {
                _count: {
                    select: {
                        votes: true
                    }
                },
                votes: {
                    select: {
                        weight: true
                    }
                }
            }
        })

        // Calculate weighted votes for each candidate
        const candidatesWithStats = allCandidates.map(c => ({
            id: c.id,
            name: c.name,
            voteCount: c._count.votes,
            weightedVoteCount: c.votes.reduce((sum, v) => sum + v.weight, 0)
        }))

        // Sort by weighted votes (or regular votes if all weights are 1)
        candidatesWithStats.sort((a, b) => b.weightedVoteCount - a.weightedVoteCount)

        // Find current candidate's position
        const position = candidatesWithStats.findIndex(c => c.id === candidate.id) + 1

        // Get total votes in project
        const totalProjectVotes = await prisma.vote.count({
            where: {
                projectId: projectId
            }
        })

        // Calculate vote percentage
        const votePercentage = totalProjectVotes > 0
            ? ((totalVotes / totalProjectVotes) * 100).toFixed(1)
            : '0'

        // Get recent votes (last 24 hours)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const recentVotes = await prisma.vote.count({
            where: {
                candidateId: candidate.id,
                projectId: projectId,
                timestamp: {
                    gte: yesterday
                }
            }
        })

        return NextResponse.json({
            candidateId: candidate.id,
            totalVotes,
            weightedVotes: weightedVotes._sum.weight || 0,
            position,
            totalCandidates: allCandidates.length,
            votePercentage: parseFloat(votePercentage),
            recentVotes,
            leaderboard: candidatesWithStats
        })
    } catch (error) {
        console.error('Error fetching candidate stats:', error)
        return NextResponse.json({ error: 'Failed to fetch candidate stats' }, { status: 500 })
    }
}
