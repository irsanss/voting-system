import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import VotingCalculator from '@/lib/voting-calculator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const projectId = params.id

    try {
      const results = await VotingCalculator.calculateResults(projectId)
      
      return NextResponse.json(results)
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to fetch voting results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}