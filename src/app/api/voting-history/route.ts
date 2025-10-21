import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getSession()
    console.log('Voting History - Session:', session ? 'Found' : 'Not found')

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    let whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    const [projects, total] = await Promise.all([
      db.votingProject.findMany({
        where: whereClause,
        include: {
          candidates: {
            include: {
              _count: {
                select: {
                  votes: true
                }
              }
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
        },
        skip,
        take: limit
      }),
      db.votingProject.count({
        where: whereClause
      })
    ])

    const formattedProjects = projects.map(project => {
      const now = new Date()
      let status = 'UPCOMING'

      if (project.isActive && now >= project.startDate && now <= project.endDate) {
        status = 'ACTIVE'
      } else if (now > project.endDate) {
        status = 'ENDED'
      }

      // Calculate results for ended projects
      let results: any = null
      if (status === 'ENDED' && project.candidates.length > 0) {
        const totalVotes = project.candidates.reduce((sum, candidate) => sum + candidate._count.votes, 0)
        results = {
          totalVotes,
          winner: project.candidates.reduce((prev, current) =>
            (prev._count.votes > current._count.votes) ? prev : current
          ),
          candidates: project.candidates.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            votes: candidate._count.votes,
            percentage: totalVotes > 0 ? (candidate._count.votes / totalVotes * 100).toFixed(1) : '0'
          }))
        }
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        votingType: project.votingType,
        votingMethod: project.votingMethod,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate.toISOString(),
        status,
        createdAt: project.createdAt.toISOString(),
        totalVotes: project._count.votes,
        candidateCount: project.candidates.length,
        results
      }
    })

    return NextResponse.json({
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching voting history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voting history' },
      { status: 500 }
    )
  }
}