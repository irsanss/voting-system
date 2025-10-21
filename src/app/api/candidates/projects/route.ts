import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/candidates/projects - Get all voting projects for current candidate
export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find all candidate profiles for this user
        const candidates = await prisma.candidate.findMany({
            where: {
                userId: session.userId
            },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                        status: true,
                        votingType: true,
                        votingMethod: true
                    }
                },
                _count: {
                    select: {
                        votes: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        if (candidates.length === 0) {
            return NextResponse.json({ error: 'No candidate profiles found' }, { status: 404 })
        }

        return NextResponse.json(candidates)
    } catch (error) {
        console.error('Error fetching candidate projects:', error)
        return NextResponse.json({ error: 'Failed to fetch candidate projects' }, { status: 500 })
    }
}
