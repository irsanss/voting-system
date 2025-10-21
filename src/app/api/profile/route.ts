import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession()

        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name, phone, apartmentUnit, apartmentSize, language } = body

        // Validate inputs
        const updateData: any = {}

        if (name !== undefined) {
            updateData.name = name.trim()
        }

        if (phone !== undefined) {
            // Basic phone validation (optional)
            updateData.phone = phone.trim()
        }

        if (apartmentUnit !== undefined) {
            updateData.apartmentUnit = apartmentUnit.trim()
        }

        if (apartmentSize !== undefined) {
            const size = parseFloat(apartmentSize)
            if (!isNaN(size) && size >= 0) {
                updateData.apartmentSize = size
            }
        }

        if (language !== undefined && (language === 'en' || language === 'id')) {
            updateData.language = language
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: session.userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                apartmentUnit: true,
                apartmentSize: true,
                language: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        // Create audit log for profile update
        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: 'PROFILE_UPDATED',
                details: `Updated profile: ${Object.keys(updateData).join(', ')}`,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
        })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
