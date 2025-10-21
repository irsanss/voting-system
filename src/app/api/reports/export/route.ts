import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { reportData, format = 'json' } = await request.json()

    if (!reportData) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      )
    }

    let content: string
    let contentType: string
    let filename: string

    if (format === 'csv') {
      content = generateCSV(reportData)
      contentType = 'text/csv'
      filename = `voting-report-${reportData.project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`
    } else {
      content = JSON.stringify(reportData, null, 2)
      contentType = 'application/json'
      filename = `voting-report-${reportData.project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    }

    // Add export metadata
    const exportData = {
      ...reportData,
      exportedAt: new Date().toISOString(),
      exportedBy: session.userId,
      exportFormat: format,
    }

    if (format === 'csv') {
      content = generateCSV(exportData)
    } else {
      content = JSON.stringify(exportData, null, 2)
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Failed to export report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateCSV(data: any): string {
  const headers = [
    'Report Title',
    'Project Title',
    'Generated At',
    'Exported At',
    'Total Votes',
    'Total Candidates',
    'Notes',
  ]

  const rows = [
    headers.join(','),
    [
      'Voting Report',
      data.project.title,
      data.generatedAt,
      data.exportedAt || new Date().toISOString(),
      data.project.totalVotes,
      data.project.totalCandidates,
      `"${(data.notes || '').replace(/"/g, '""')}"`,
    ].join(','),
    '',
    'Candidates Results',
    'Candidate Name,Votes,Percentage',
    ...data.candidates.map((candidate: any) => 
      `"${candidate.name}",${candidate.voteCount},${candidate.percentage}%`
    ),
    '',
    'Voting Activity',
    'Vote Time,Device Info,Location',
    ...data.votes.map((vote: any) => [
      vote.voteTime,
      `"${(vote.deviceInfo || '').replace(/"/g, '""')}"`,
      vote.location ? `"${vote.location.lat}, ${vote.location.lng}"` : 'N/A'
    ].join(',')),
    '',
    'Audit Log',
    'Timestamp,Action,Details,IP Address',
    ...data.auditLogs.map((log: any) => [
      log.timestamp,
      log.action,
      `"${(log.details || '').replace(/"/g, '""')}"`,
      log.ipAddress || 'N/A'
    ].join(',')),
    '',
    '',
    '',
    '=== SIGNATURES ===',
    '',
    'Committee Signature: ____________________    Date: _______________',
    '',
    'Auditor Signature: ______________________    Date: _______________',
    '',
    'Candidates Representative: ______________    Date: _______________',
    '',
    '',
    '=== ACKNOWLEDGEMENT ===',
    '',
    'I hereby certify that this report is true and accurate to the best of my knowledge.',
    '',
    'Auditor Notes: ___________________________________________________',
    '',
    '__________________________________________________________________',
    '',
    '__________________________________________________________________',
  ].join('\n')

  return rows
}