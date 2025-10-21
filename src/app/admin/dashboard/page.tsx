'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin-header"
import { Users, UserCheck, Briefcase, FileText, BarChart2, Plus, Trash2, Edit, Eye } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
    totalVoters: number
    totalCandidates: number
    upcomingProjects: number
    activeProjects: number
    endedProjects: number
    totalVotes: number
}

interface VotingProject {
    id: string
    title: string
    description?: string
    status: 'UPCOMING' | 'ACTIVE' | 'ENDED'
    startDate: string
    endDate: string
    candidateCount: number
    voteCount: number
    isPublished: boolean
}

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalVoters: 0,
        totalCandidates: 0,
        upcomingProjects: 0,
        activeProjects: 0,
        endedProjects: 0,
        totalVotes: 0
    })
    const [projects, setProjects] = useState<VotingProject[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            // Fetch statistics
            const statsResponse = await fetch('/api/admin/stats')
            if (statsResponse.ok) {
                const statsData = await statsResponse.json()
                setStats(statsData)
            }

            // Fetch all projects
            const projectsResponse = await fetch('/api/projects?includeUnpublished=true')
            if (projectsResponse.ok) {
                const projectsData = await projectsResponse.json()
                setProjects(projectsData)
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteProject = async (projectId: string, hasVotes: boolean) => {
        if (hasVotes) {
            alert('Cannot delete a project that has votes!')
            return
        }

        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(`/api/admin/projects/${projectId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                alert('Project deleted successfully')
                fetchDashboardData()
            } else {
                const error = await response.json()
                alert(`Failed to delete project: ${error.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to delete project:', error)
            alert('Failed to delete project')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'UPCOMING':
                return 'bg-blue-100 text-blue-800'
            case 'ACTIVE':
                return 'bg-green-100 text-green-800'
            case 'ENDED':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const upcomingProjects = projects.filter(p => p.status === 'UPCOMING')
    const activeProjects = projects.filter(p => p.status === 'ACTIVE')
    const endedProjects = projects.filter(p => p.status === 'ENDED')

    if (loading) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    return (
        <>
            <AdminHeader title="Superadmin Dashboard" showBackButton={false} currentPage="dashboard" />
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8">
                    <p className="text-muted-foreground">
                        Welcome back! Manage your voting system from here.
                    </p>
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalVoters}</div>
                            <Link href="/admin/users">
                                <Button variant="link" className="px-0 text-xs">
                                    Manage Voters →
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all projects
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalVotes}</div>
                            <p className="text-xs text-muted-foreground">
                                All time
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Manage Voting Projects Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Manage Voting Projects</CardTitle>
                                <CardDescription>
                                    Create, monitor, and control all voting projects
                                </CardDescription>
                            </div>
                            <Link href="/admin/projects/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Project
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Upcoming Projects */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                    {upcomingProjects.length}
                                </Badge>
                                Upcoming Projects
                            </h3>
                            {upcomingProjects.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No upcoming projects</p>
                            ) : (
                                <div className="space-y-2">
                                    {upcomingProjects.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            onDelete={handleDeleteProject}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Active Projects */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                    {activeProjects.length}
                                </Badge>
                                Active Projects
                            </h3>
                            {activeProjects.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No active projects</p>
                            ) : (
                                <div className="space-y-2">
                                    {activeProjects.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            onDelete={handleDeleteProject}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past Projects */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                    {endedProjects.length}
                                </Badge>
                                Past Projects
                            </h3>
                            {endedProjects.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No past projects</p>
                            ) : (
                                <div className="space-y-2">
                                    {endedProjects.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            onDelete={handleDeleteProject}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/users">
                        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full border-2 hover:border-primary">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold">
                                    Manage Voters
                                </CardTitle>
                                <Users className="h-8 w-8 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    View, create, update, and manage voter profiles
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/reports">
                        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full border-2 hover:border-primary">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold">
                                    Reports & Audit
                                </CardTitle>
                                <FileText className="h-8 w-8 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Generate, view, and approve voting reports
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/analytics">
                        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full border-2 hover:border-primary">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold">
                                    System Analytics
                                </CardTitle>
                                <BarChart2 className="h-8 w-8 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    View overall system dashboards and analytics
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </>
    )
}

function ProjectCard({
    project,
    onDelete
}: {
    project: VotingProject
    onDelete: (id: string, hasVotes: boolean) => void
}) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'UPCOMING':
                return 'bg-blue-100 text-blue-800'
            case 'ACTIVE':
                return 'bg-green-100 text-green-800'
            case 'ENDED':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const hasVotes = project.voteCount > 0

    return (
        <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{project.title}</h4>
                        <Badge className={getStatusColor(project.status)}>
                            {project.status}
                        </Badge>
                        {!project.isPublished && (
                            <Badge variant="outline">Draft</Badge>
                        )}
                        {(project as any).requiresSupervisorReview && (
                            <Badge
                                variant="outline"
                                className={
                                    (project as any).supervisorApprovalStatus === 'APPROVED'
                                        ? "border-green-600 text-green-600 text-xs"
                                        : (project as any).supervisorApprovalStatus === 'REJECTED'
                                            ? "border-red-600 text-red-600 text-xs"
                                            : "border-yellow-600 text-yellow-600 text-xs"
                                }
                            >
                                {(project as any).supervisorApprovalStatus === 'APPROVED'
                                    ? "✓ Supervisor OK"
                                    : (project as any).supervisorApprovalStatus === 'REJECTED'
                                        ? "✗ Rejected"
                                        : "⏳ Needs Review"
                                }
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                        {project.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📅 {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                        <span>👥 {project.candidateCount} candidates</span>
                        <span>🗳️ {project.voteCount} votes</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <Link href={`/admin/projects/${project.id}/candidates`}>
                        <Button variant="outline" size="sm" title="Manage Candidates">
                            <UserCheck className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={`/admin/projects/${project.id}/edit`}>
                        <Button variant="outline" size="sm" title="Edit Project">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={`/admin/projects/${project.id}`}>
                        <Button variant="outline" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(project.id, hasVotes)}
                        disabled={hasVotes}
                        title={hasVotes ? 'Cannot delete project with votes' : 'Delete Project'}
                        className={hasVotes ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-600'}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
