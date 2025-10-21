import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const limit = parseInt(searchParams.get('limit') || '20')

        const whereClause: any = {}

        if (action) {
            whereClause.action = action
        }

        const auditLogs = await db.auditLog.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                project: {
                    select: {
                        title: true,
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
            take: limit,
        })

        const formattedLogs = auditLogs.map(log => ({
            id: log.id,
            action: log.action,
            timestamp: log.timestamp.toISOString(),
            userName: log.user?.name,
            userEmail: log.user?.email,
            projectTitle: log.project?.title,
            details: log.details ? JSON.parse(log.details) : null,
            ipAddress: log.ipAddress,
        }))

        return NextResponse.json(formattedLogs)
    } catch (error) {
        console.error('Failed to fetch audit logs:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
