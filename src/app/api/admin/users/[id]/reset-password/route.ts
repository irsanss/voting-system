import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import crypto from 'crypto'

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
            select: { role: true }
        })

        if (!admin || (admin.role !== 'SUPERADMIN' && admin.role !== 'COMMITTEE')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const userId = params.id

        // Get user
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

        // Save reset token
        await db.user.update({
            where: { id: userId },
            data: {
                resetToken,
                resetTokenExpiry
            }
        })

        // In a real application, you would send an email here
        // For now, we'll just log it (or you can integrate with an email service)
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

        console.log('Password reset link generated:', resetUrl)
        console.log('For user:', user.email)

        // TODO: Send email with reset link
        // await sendPasswordResetEmail(user.email, user.name, resetUrl)

        return NextResponse.json({
            message: 'Password reset link generated successfully',
            // In production, don't send the token in response
            // This is just for development/testing
            resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
        })
    } catch (error) {
        console.error('Failed to reset password:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
