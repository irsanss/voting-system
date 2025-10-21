'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { translations, Language } from '@/lib/i18n'
import { Globe, Users, ArrowLeft, BarChart3, TrendingUp, Clock, MapPin, Activity, RefreshCw, Vote as VoteIcon, LogOut, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { VoterHeader } from '@/components/voter-header'

interface VotingProject {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  isActive: boolean
  candidateCount: number
  voteCount: number
}

interface Candidate {
  id: string
  name: string
  photo?: string
  voteCount: number
  percentage?: number
}

interface VoteActivity {
  id: string
  timestamp: string
  candidateName: string
  projectTitle?: string
  location?: { lat: number; lng: number }
  deviceInfo?: string
  action?: 'VOTE_CAST' | 'VOTE_REVOKED'
  userName?: string
  details?: any
}

export default function DashboardPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<VotingProject[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [recentActivity, setRecentActivity] = useState<VoteActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [userVote, setUserVote] = useState<{
    hasVoted: boolean
    voteTimestamp: string | null
    candidate: { id: string; name: string; photo?: string } | null
    voteId: string | null
  } | null>(null)
  const [revokingVote, setRevokingVote] = useState(false)
  const [countdown, setCountdown] = useState<string>('')
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalCandidates: 0,
    votingProgress: 0,
    activeVoters: 0,
  })

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguage(savedLanguage)
    }

    // Check authentication first
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        // Only fetch data if user is authenticated
        fetchData()
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/auth/login'
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      window.location.href = '/auth/login'
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      // Fetch projects
      const projectsResponse = await fetch('/api/projects')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0].id)
          fetchDashboardData(projectsData[0].id)
          checkUserVote(projectsData[0].id)
        }
      }
      // Fetch recent activity across all projects (independent of selected project)
      fetchRecentActivity()
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserVote = async (projectId: string) => {
    try {
      const response = await fetch(`/api/votes/check?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setUserVote(data)
      }
    } catch (error) {
      console.error('Failed to check user vote:', error)
    }
  }

  const handleRevokeVote = async () => {
    if (!selectedProject || !confirm('Are you sure you want to revoke your vote? You can vote again after revoking.')) {
      return
    }

    setRevokingVote(true)
    try {
      const response = await fetch('/api/votes/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh data after revoking vote
        await checkUserVote(selectedProject)
        await fetchDashboardData(selectedProject)
        alert('Vote revoked successfully. You can now vote again.')
      } else {
        alert(data.error || 'Failed to revoke vote')
      }
    } catch (error) {
      console.error('Failed to revoke vote:', error)
      alert('An error occurred while revoking your vote')
    } finally {
      setRevokingVote(false)
    }
  }

  useEffect(() => {
    if (user && selectedProject) {
      // Update countdown every second
      const countdownInterval = setInterval(() => {
        updateCountdown()
      }, 1000)

      return () => clearInterval(countdownInterval)
    }
  }, [user, selectedProject, projects])

  useEffect(() => {
    if (user) {
      // Set up real-time updates only if user is authenticated
      const interval = setInterval(() => {
        if (selectedProject) {
          fetchDashboardData(selectedProject)
        }
        // Always fetch recent activity across all projects
        fetchRecentActivity()
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [user, selectedProject])

  const fetchDashboardData = async (projectId: string) => {
    try {
      // Fetch candidates with vote counts
      const candidatesResponse = await fetch(`/api/candidates?projectId=${projectId}&includeVoteCount=true`)
      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json()
        const totalVotes = candidatesData.reduce((sum: number, c: Candidate) => sum + c.voteCount, 0)

        const candidatesWithPercentage = candidatesData.map((c: Candidate) => ({
          ...c,
          percentage: totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0,
        }))

        setCandidates(candidatesWithPercentage)
      }

      // Update stats
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setStats({
          totalVotes: project.voteCount,
          totalCandidates: project.candidateCount,
          votingProgress: calculateVotingProgress(project),
          activeVoters: project.voteCount, // Assuming each vote is from a unique user
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent votes across ALL projects
      const votesResponse = await fetch('/api/votes?allProjects=true')
      let allActivity: VoteActivity[] = []

      if (votesResponse.ok) {
        const votesData = await votesResponse.json()
        allActivity = votesData.map((vote: any) => ({
          ...vote,
          action: 'VOTE_CAST' as const,
        }))
      }

      // Fetch recent vote revocations from audit logs
      const revokeResponse = await fetch('/api/audit-logs?action=VOTE_REVOKED&limit=20')
      if (revokeResponse.ok) {
        const revokeData = await revokeResponse.json()
        const revokeActivity = revokeData.map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp,
          candidateName: log.details?.candidateName || 'Unknown',
          projectTitle: log.projectTitle,
          action: 'VOTE_REVOKED' as const,
          userName: log.userName,
          details: log.details,
        }))
        allActivity = [...allActivity, ...revokeActivity]
      }

      // Sort by timestamp descending and take top 10
      allActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(allActivity.slice(0, 10))
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    }
  }

  const getProjectStatus = (project: VotingProject) => {
    const now = new Date()
    const start = new Date(project.startDate)
    const end = new Date(project.endDate)

    if (now < start) {
      return 'NOT_STARTED'
    } else if (now >= start && now <= end && project.isActive) {
      return 'ACTIVE'
    } else if (now > end || !project.isActive) {
      return 'ENDED'
    }
    return 'ENDED'
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'ENDED':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'Not Started'
      case 'ACTIVE':
        return 'Active Now'
      case 'ENDED':
        return 'Ended'
      default:
        return 'Unknown'
    }
  }

  const formatCountdown = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const updateCountdown = () => {
    if (!selectedProject) return

    const project = projects.find(p => p.id === selectedProject)
    if (!project) return

    const now = new Date()
    const start = new Date(project.startDate)
    const end = new Date(project.endDate)
    const status = getProjectStatus(project)

    if (status === 'NOT_STARTED') {
      const timeUntilStart = start.getTime() - now.getTime()
      setCountdown(`Starts in ${formatCountdown(timeUntilStart)}`)
    } else if (status === 'ACTIVE') {
      const timeUntilEnd = end.getTime() - now.getTime()
      setCountdown(`Ends in ${formatCountdown(timeUntilEnd)}`)
    } else {
      setCountdown('Voting has ended')
    }
  }

  const calculateVotingProgress = (project: VotingProject) => {
    const now = new Date()
    const start = new Date(project.startDate)
    const end = new Date(project.endDate)

    if (now < start) return 0
    if (now > end) return 100

    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / total) * 100)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    if (selectedProject) {
      await fetchDashboardData(selectedProject)
    }
    // Always refresh recent activity across all projects
    await fetchRecentActivity()
    setRefreshing(false)
  }

  const t = translations[language]

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <VoterHeader currentPage="dashboard" />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject)

  return (
    <div className="min-h-screen bg-background">
      <VoterHeader currentPage="dashboard" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t.dashboard.title}
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-2">
              {t.dashboard.title}
            </h2>
            <p className="text-xl text-slate-600">
              Real-time election results and statistics
            </p>
          </div>

          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600">{t.common.loading}</p>
          </div>
        ) : projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <VoteIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Voting Projects Available</h3>
              <p className="text-muted-foreground mb-4">
                There are currently no voting projects available. Please check back later.
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Project Selection */}
            {projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Voting Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedProject} onValueChange={(value) => {
                    setSelectedProject(value)
                    fetchDashboardData(value)
                    checkUserVote(value)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voting project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {selectedProjectData && (
              <>
                {/* Project Status Information */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedProjectData.title}</CardTitle>
                        {selectedProjectData.description && (
                          <CardDescription className="mt-2">
                            {selectedProjectData.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        className={`${getStatusBadgeColor(getProjectStatus(selectedProjectData))} border px-3 py-1 text-sm font-semibold`}
                      >
                        {getStatusText(getProjectStatus(selectedProjectData))}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Start Date */}
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Start Date</p>
                          <p className="text-sm font-semibold">
                            {new Date(selectedProjectData.startDate).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* End Date */}
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">End Date</p>
                          <p className="text-sm font-semibold">
                            {new Date(selectedProjectData.endDate).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Countdown */}
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <Activity className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Status</p>
                          <p className="text-sm font-bold text-primary">
                            {countdown || 'Calculating...'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          <Users className="w-4 h-4 inline mr-1" />
                          {selectedProjectData.candidateCount} Candidates
                        </span>
                        <span className="text-muted-foreground">
                          <VoteIcon className="w-4 h-4 inline mr-1" />
                          {selectedProjectData.voteCount} Votes Cast
                        </span>
                      </div>
                      {getProjectStatus(selectedProjectData) === 'NOT_STARTED' && (
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                          Upcoming
                        </Badge>
                      )}
                      {getProjectStatus(selectedProjectData) === 'ACTIVE' && (
                        <Badge variant="outline" className="text-green-700 border-green-300 animate-pulse">
                          Live Voting
                        </Badge>
                      )}
                      {getProjectStatus(selectedProjectData) === 'ENDED' && (
                        <Badge variant="outline" className="text-gray-700 border-gray-300">
                          Closed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Voting Section */}
                {selectedProjectData.isActive &&
                  new Date() >= new Date(selectedProjectData.startDate) &&
                  new Date() <= new Date(selectedProjectData.endDate) && (
                    <>
                      {userVote?.hasVoted ? (
                        // User has already voted - show vote status with revoke option
                        <Card className="border-green-500/50 bg-green-50/50">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  You Have Voted
                                </CardTitle>
                                <CardDescription>
                                  {selectedProjectData.title}
                                </CardDescription>
                              </div>
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Voted
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-lg border border-green-200">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                      Your vote was cast for:
                                    </p>
                                    <div className="flex items-center gap-3 mb-3">
                                      {userVote.candidate?.photo && (
                                        <img
                                          src={userVote.candidate.photo}
                                          alt={userVote.candidate.name}
                                          className="w-12 h-12 rounded-full object-cover"
                                        />
                                      )}
                                      <div>
                                        <p className="text-lg font-bold text-green-700">
                                          {userVote.candidate?.name}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Voted on: {userVote.voteTimestamp ? new Date(userVote.voteTimestamp).toLocaleString() : 'Unknown'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <div className="text-sm text-muted-foreground">
                                  <p className="mb-1">Want to change your vote?</p>
                                  <p className="text-xs">You can revoke your current vote and vote again.</p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={handleRevokeVote}
                                  disabled={revokingVote}
                                >
                                  {revokingVote ? 'Revoking...' : 'Revoke Vote'}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        // User hasn't voted - show vote button
                        <Card className="border-primary/50 bg-primary/5">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <VoteIcon className="w-5 h-5 text-primary" />
                                  Cast Your Vote
                                </CardTitle>
                                <CardDescription>
                                  {selectedProjectData.title} - Voting is currently active
                                </CardDescription>
                              </div>
                              <Badge variant="default" className="bg-green-600">
                                <Activity className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Voting ends: {new Date(selectedProjectData.endDate).toLocaleString()}
                                </p>
                                <p className="text-sm font-medium">
                                  Click below to participate in this voting project
                                </p>
                              </div>
                              <Link href={`/vote?project=${selectedProjectData.id}`}>
                                <Button size="lg" className="gap-2">
                                  <VoteIcon className="w-4 h-4" />
                                  Vote Now
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t.dashboard.totalVotes}
                      </CardTitle>
                      <VoteIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalVotes}</div>
                      <p className="text-xs text-muted-foreground">
                        Total votes cast
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t.dashboard.candidates}
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                      <p className="text-xs text-muted-foreground">
                        Active candidates
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t.dashboard.votingProgress}
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.votingProgress}%</div>
                      <Progress value={stats.votingProgress} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Voters
                      </CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeVoters}</div>
                      <p className="text-xs text-muted-foreground">
                        Unique participants
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Live Results */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        {t.dashboard.liveResults}
                      </CardTitle>
                      <CardDescription>
                        Current vote distribution among candidates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {candidates.map((candidate, index) => (
                          <div key={candidate.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-semibold">{index + 1}</span>
                                </div>
                                <span className="font-medium">{candidate.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold">{candidate.voteCount}</span>
                                <span className="text-sm text-slate-500 ml-2">
                                  ({candidate.percentage}%)
                                </span>
                              </div>
                            </div>
                            <Progress value={candidate.percentage} className="h-2" />
                          </div>
                        ))}

                        {candidates.length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            No candidates available for this project
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        {t.dashboard.recentActivity}
                      </CardTitle>
                      <CardDescription>
                        Latest voting activity across all projects
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className={`w-2 h-2 rounded-full mt-2 ${activity.action === 'VOTE_REVOKED' ? 'bg-red-500' : 'bg-green-500'
                              }`}></div>
                            <div className="flex-1">
                              {activity.action === 'VOTE_REVOKED' ? (
                                <>
                                  <p className="text-sm font-medium">
                                    Vote revoked for <span className="text-red-600">{activity.candidateName}</span>
                                  </p>
                                  {activity.projectTitle && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Project: <span className="font-medium">{activity.projectTitle}</span>
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                                    <span className="text-red-600 font-medium">Revoked</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-medium">
                                    Vote cast for <span className="text-primary">{activity.candidateName}</span>
                                  </p>
                                  {activity.projectTitle && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Project: <span className="font-medium">{activity.projectTitle}</span>
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                                    {activity.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        Location recorded
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}

                        {recentActivity.length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            No voting activity yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600">
            <p>&copy; 2024 {t.app.title}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}