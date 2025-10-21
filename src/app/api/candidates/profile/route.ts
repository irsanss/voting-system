import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/candidates/profile - Get candidate profile for current user
export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get userId from query params (for admin access) or use session
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId') || session.userId

        // Find the candidate profile for this user
        const candidate = await prisma.candidate.findFirst({
            where: {
                userId: userId
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
                        status: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        apartmentUnit: true,
                        apartmentSize: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        if (!candidate) {
            return NextResponse.json({ error: 'No candidate profile found' }, { status: 404 })
        }

        return NextResponse.json(candidate)
    } catch (error) {
        console.error('Error fetching candidate profile:', error)
        return NextResponse.json({ error: 'Failed to fetch candidate profile' }, { status: 500 })
    }
}
