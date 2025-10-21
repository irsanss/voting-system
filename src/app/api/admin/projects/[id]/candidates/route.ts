import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

// GET - Fetch all candidates for a project
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

        const candidates = await db.candidate.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(candidates)
    } catch (error) {
        console.error('Failed to fetch candidates:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Add a new candidate to a project
export async function POST(
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

        const { userId, name, vision, mission, reason, isActive } = await request.json()

        if (!userId || !name) {
            return NextResponse.json(
                { error: 'userId and name are required' },
                { status: 400 }
            )
        }

        // Check if user is already a candidate in this project
        const existingCandidate = await db.candidate.findFirst({
            where: {
                projectId,
                userId
            }
        })

        if (existingCandidate) {
            return NextResponse.json(
                { error: 'User is already a candidate in this project' },
                { status: 400 }
            )
        }

        const candidate = await db.candidate.create({
            data: {
                projectId,
                userId,
                name,
                vision,
                mission,
                reason,
                isActive: isActive !== undefined ? isActive : true
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

        return NextResponse.json(candidate, { status: 201 })
    } catch (error) {
        console.error('Failed to create candidate:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
