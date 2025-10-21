'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  History,
  Users,
  Vote,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Trophy,
  User
} from 'lucide-react'
import Link from 'next/link'
import { VoterHeader } from '@/components/voter-header'

interface VotingProject {
  id: string
  title: string
  description?: string
  votingType: string
  votingMethod: string
  startDate: string
  endDate: string
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED'
  createdAt: string
  totalVotes: number
  candidateCount: number
  results?: {
    totalVotes: number
    winner: {
      id: string
      name: string
      _count: { votes: number }
    }
    candidates: Array<{
      id: string
      name: string
      votes: number
      percentage: string
    }>
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function VotingHistory() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [projects, setProjects] = useState<VotingProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Redirect to login if not authenticated
        router.push('/auth/login?callbackUrl=/voting-history')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login?callbackUrl=/voting-history')
    } finally {
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, statusFilter, pagination.page])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/voting-history?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch voting history')
      }

      const data = await response.json()
      setProjects(data.projects)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching voting history:', error)
      setError('Failed to load voting history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ENDED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Voting Active'
      case 'UPCOMING':
        return 'Upcoming'
      case 'ENDED':
        return 'Completed'
      default:
        return status
    }
  }

  const getVotingTypeText = (type: string) => {
    switch (type) {
      case 'HEAD_OF_APARTMENT':
        return 'Apartment Leadership'
      case 'POLICY':
        return 'Policy Vote'
      case 'ACTION_PLAN':
        return 'Action Plan'
      case 'SURVEY':
        return 'Survey'
      default:
        return type
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <VoterHeader currentPage="dashboard" />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading voting history...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <VoterHeader currentPage="dashboard" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Voting History</h1>
          </div>
          <p className="text-muted-foreground">View past and present voting initiatives</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Projects</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="ENDED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {projects.length} of {pagination.total} projects
          </div>
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchProjects} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {!error && projects.length === 0 && (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No voting projects found
            </h3>
            <p className="text-slate-600">
              {statusFilter === 'ALL'
                ? "There are no voting projects in the system yet."
                : `No ${statusFilter.toLowerCase()} voting projects found.`
              }
            </p>
          </div>
        )}

        {!error && projects.length > 0 && (
          <div className="space-y-6">
            {projects.map((project) => (
              <Card key={project.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {getVotingTypeText(project.votingType)}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Ends: {new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold">{project.candidateCount}</div>
                      <div className="text-xs text-muted-foreground">Candidates</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <Vote className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold">{project.totalVotes}</div>
                      <div className="text-xs text-muted-foreground">Total Votes</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold">
                        {project.candidateCount > 0 ? Math.round(project.totalVotes / project.candidateCount) : 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Votes</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold">
                        {project.candidateCount > 0 ?
                          `${((project.totalVotes / (project.candidateCount * 10)) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Participation</div>
                    </div>
                  </div>

                  {/* Results for ended projects */}
                  {project.status === 'ENDED' && project.results && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h4 className="font-semibold">Final Results</h4>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <User className="w-8 h-8 text-green-600" />
                          <div>
                            <div className="font-semibold text-green-800">Winner</div>
                            <div className="text-green-700">{project.results.winner.name}</div>
                          </div>
                          <div className="ml-auto text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {project.results.winner._count.votes}
                            </div>
                            <div className="text-sm text-green-600">votes</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {project.results.candidates.map((candidate, index) => (
                            <div key={candidate.id} className="flex items-center gap-3">
                              <div className="w-8 text-center font-semibold text-sm text-muted-foreground">
                                #{index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium">{candidate.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {candidate.votes} votes ({candidate.percentage}%)
                                  </span>
                                </div>
                                <Progress
                                  value={parseFloat(candidate.percentage)}
                                  className="h-2"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    {project.status === 'UPCOMING' && (
                      <Link href={`/candidates?project=${project.id}`}>
                        <Button variant="outline" className="w-full sm:w-auto">
                          View Candidates
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}

                    {project.status === 'ACTIVE' && (
                      <Link href={`/vote?project=${project.id}`}>
                        <Button className="w-full sm:w-auto">
                          Cast Your Vote
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}

                    {project.status === 'ENDED' && (
                      <Link href={`/results/${project.id}`}>
                        <Button variant="outline" className="w-full sm:w-auto">
                          View Detailed Results
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!error && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>

            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}