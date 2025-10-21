'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3, Users, Weight, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface VoteResult {
  candidateId: string
  candidateName: string
  voteCount: number
  weightedVotes: number
  percentage: number
  weightedPercentage: number
}

interface VotingSummary {
  totalVotes: number
  totalWeightedVotes: number
  totalEligibleVoters: number
  totalArea?: number
  votingMethod: string
  votingType: string
  results: VoteResult[]
  winner?: VoteResult
  metadata: {
    hasQuorum: boolean
    quorumRequired: number
    votingEndTime: string
    isCompleted: boolean
  }
}

export default function ResultsPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [summary, setSummary] = useState<VotingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResults()
  }, [projectId])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/results`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch results')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const getVotingMethodDescription = (method: string) => {
    switch (method) {
      case 'ONE_PERSON_ONE_VOTE':
        return 'One Person, One Vote'
      case 'WEIGHTED_BY_SIZE_MANUAL':
        return 'Weighted by Apartment Size (Manual Total)'
      case 'WEIGHTED_BY_SIZE_VOTERS':
        return 'Weighted by Apartment Size (Voters Total)'
      default:
        return method
    }
  }

  const getVotingTypeDescription = (type: string) => {
    switch (type) {
      case 'HEAD_OF_APARTMENT':
        return 'Head of Apartment Election'
      case 'POLICY':
        return 'Policy Voting'
      case 'ACTION_PLAN':
        return 'Action Plan Voting'
      case 'SURVEY':
        return 'Survey Voting'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Error</h2>
              <p className="text-slate-600">{error || 'Results not found'}</p>
              <Link href="/dashboard" className="mt-4 inline-block">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold text-slate-900">Voting Results</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Voting Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Votes</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.totalVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Weight className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Weighted</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.totalWeightedVotes.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Quorum</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.metadata.hasQuorum ? 'Met' : 'Not Met'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Status</p>
                  <p className="text-lg font-bold text-slate-900">
                    {summary.metadata.isCompleted ? 'Completed' : 'Active'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voting Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Voting results using {getVotingMethodDescription(summary.votingMethod)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {summary.results.map((result, index) => (
                    <div key={result.candidateId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.candidateName}</span>
                          {summary.winner?.candidateId === result.candidateId && (
                            <Badge variant="default">Winner</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{result.voteCount} votes</div>
                          {summary.votingMethod !== 'ONE_PERSON_ONE_VOTE' && (
                            <div className="text-sm text-slate-500">
                              {result.weightedVotes.toFixed(2)} weighted
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={result.percentage} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-sm text-slate-500">
                          <span>{result.percentage.toFixed(1)}%</span>
                          {summary.votingMethod !== 'ONE_PERSON_ONE_VOTE' && (
                            <span>{result.weightedPercentage.toFixed(1)}% weighted</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voting Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Type</p>
                  <p className="text-slate-900">{getVotingTypeDescription(summary.votingType)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Method</p>
                  <p className="text-slate-900">{getVotingMethodDescription(summary.votingMethod)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Eligible Voters</p>
                  <p className="text-slate-900">{summary.totalEligibleVoters}</p>
                </div>
                {summary.totalArea && (
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Area</p>
                    <p className="text-slate-900">{summary.totalArea.toFixed(2)} m²</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-600">Quorum Required</p>
                  <p className="text-slate-900">{summary.metadata.quorumRequired} voters</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Voting Ends</p>
                  <p className="text-slate-900">
                    {new Date(summary.metadata.votingEndTime).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quorum Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Current Votes</span>
                    <span className="font-medium">{summary.totalVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Required</span>
                    <span className="font-medium">{summary.metadata.quorumRequired}</span>
                  </div>
                  <Progress 
                    value={(summary.totalVotes / summary.metadata.quorumRequired) * 100}
                    className="h-2 mt-2"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    {summary.metadata.hasQuorum 
                      ? 'Quorum has been met. Results are valid.'
                      : 'Quorum has not been met yet.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}