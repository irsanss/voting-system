import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function POST(
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
        const admin = await db.user.findUnique({
            where: { id: session.userId },
            select: { role: true, email: true }
        })

        if (!admin || (admin.role !== 'SUPERADMIN' && admin.role !== 'COMMITTEE')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const userId = params.id
        const { isVerified } = await request.json()

        // Update user verification status
        const user = await db.user.update({
            where: { id: userId },
            data: {
                isVerified: isVerified,
                verifiedBy: isVerified ? session.userId : null,
                verifiedAt: isVerified ? new Date() : null
            }
        })

        return NextResponse.json({
            message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
            user: {
                id: user.id,
                email: user.email,
                isVerified: user.isVerified
            }
        })
    } catch (error) {
        console.error('Failed to verify user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
