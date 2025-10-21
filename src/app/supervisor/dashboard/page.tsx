'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SupervisorHeader from '@/components/supervisor-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react'

interface DashboardStats {
    pendingReviews: number
    approvedProjects: number
    rejectedProjects: number
    totalReviewed: number
}

interface PendingProject {
    id: string
    title: string
    description: string
    submittedAt: string
    submittedBy: string
}

export default function SupervisorDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        pendingReviews: 0,
        approvedProjects: 0,
        rejectedProjects: 0,
        totalReviewed: 0,
    })
    const [recentProjects, setRecentProjects] = useState<PendingProject[]>([])

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Verify supervisor access
                const meResponse = await fetch('/api/auth/me')
                if (!meResponse.ok) {
                    router.push('/login')
                    return
                }

                const userData = await meResponse.json()
                if (userData.role !== 'SUPERVISOR' && userData.role !== 'SUPERADMIN') {
                    router.push('/dashboard')
                    return
                }

                // Fetch dashboard stats
                const statsResponse = await fetch('/api/supervisor/stats')
                if (statsResponse.ok) {
                    const data = await statsResponse.json()
                    setStats(data.stats)
                    setRecentProjects(data.recentProjects || [])
                } else {
                    // If API returns error, log but don't show error to user (might just be empty data)
                    console.log('Stats API returned error, using default empty stats')
                    setStats({
                        pendingReviews: 0,
                        approvedProjects: 0,
                        rejectedProjects: 0,
                        totalReviewed: 0,
                    })
                    setRecentProjects([])
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
                // Don't show error, just use empty state
                setStats({
                    pendingReviews: 0,
                    approvedProjects: 0,
                    rejectedProjects: 0,
                    totalReviewed: 0,
                })
                setRecentProjects([])
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [router])

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <SupervisorHeader currentPage="dashboard" />
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <SupervisorHeader currentPage="dashboard" />

            <div className="flex-1 space-y-6 p-8 pt-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Supervisor Dashboard</h2>
                        <p className="text-muted-foreground">
                            Review and approve voting projects that require supervisor authorization
                        </p>
                    </div>
                    <Button onClick={() => router.push('/supervisor/projects')}>
                        View All Projects
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting your review
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approvedProjects}</div>
                            <p className="text-xs text-muted-foreground">
                                Projects approved
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rejectedProjects}</div>
                            <p className="text-xs text-muted-foreground">
                                Projects rejected
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Reviewed</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalReviewed}</div>
                            <p className="text-xs text-muted-foreground">
                                All time
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Projects Pending Review */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Projects Pending Review</CardTitle>
                        <CardDescription>
                            Projects that require your approval before they can be activated
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">All caught up!</p>
                                <p className="text-sm text-muted-foreground">
                                    There are no projects pending your review at this time.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex items-start justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold">{project.title}</h4>
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                                    Pending
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {project.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Submitted by {project.submittedBy}</span>
                                                <span>•</span>
                                                <span>{new Date(project.submittedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => router.push(`/supervisor/projects?id=${project.id}`)}
                                            size="sm"
                                        >
                                            Review
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common supervisor tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Button
                                variant="outline"
                                className="justify-start h-auto py-4 px-4"
                                onClick={() => router.push('/supervisor/projects?status=pending')}
                            >
                                <div className="text-left">
                                    <div className="font-semibold">Review Pending Projects</div>
                                    <div className="text-sm text-muted-foreground">
                                        {stats.pendingReviews} projects awaiting review
                                    </div>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="justify-start h-auto py-4 px-4"
                                onClick={() => router.push('/supervisor/projects?status=approved')}
                            >
                                <div className="text-left">
                                    <div className="font-semibold">View Approved Projects</div>
                                    <div className="text-sm text-muted-foreground">
                                        {stats.approvedProjects} approved projects
                                    </div>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="justify-start h-auto py-4 px-4"
                                onClick={() => router.push('/supervisor/reports')}
                            >
                                <div className="text-left">
                                    <div className="font-semibold">Generate Reports</div>
                                    <div className="text-sm text-muted-foreground">
                                        Review history and analytics
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
