'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SupervisorHeader from '@/components/supervisor-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle, XCircle, Clock, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface Project {
    id: string
    title: string
    description: string
    requiresSupervisorReview: boolean
    supervisorApprovalStatus: string | null
    supervisorComments: string | null
    supervisorReviewedBy: string | null
    supervisorReviewedAt: string | null
    createdAt: string
    startDate: string
    endDate: string
    isActive: boolean
}

export default function SupervisorProjects() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [projects, setProjects] = useState<Project[]>([])
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('pending')
    const [reviewDialog, setReviewDialog] = useState<{
        open: boolean
        project: Project | null
        action: 'APPROVE' | 'REJECT' | null
    }>({ open: false, project: null, action: null })
    const [reviewComments, setReviewComments] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Handle URL query parameters for initial tab
    useEffect(() => {
        const status = searchParams.get('status')
        if (status && ['pending', 'approved', 'rejected', 'all'].includes(status)) {
            setActiveTab(status)
        }
    }, [searchParams])

    useEffect(() => {
        async function fetchProjects() {
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

                // Fetch projects requiring supervisor review
                const projectsResponse = await fetch('/api/supervisor/projects')
                console.log('📥 Projects API Response Status:', projectsResponse.status)

                if (projectsResponse.ok) {
                    const data = await projectsResponse.json()
                    console.log('📥 Projects API Response Data:', data)
                    console.log('📋 Total projects received:', data.projects?.length || 0)

                    setProjects(data.projects || [])
                    const pending = (data.projects || []).filter((p: Project) => !p.supervisorApprovalStatus || p.supervisorApprovalStatus === 'PENDING')
                    console.log('📋 Pending projects after filter:', pending.length)
                    setFilteredProjects(pending)
                } else {
                    console.log('❌ Projects API returned error:', projectsResponse.status)
                    setProjects([])
                    setFilteredProjects([])
                }
            } catch (err) {
                console.error('Error fetching projects:', err)
                // Don't show error, just use empty list
                setProjects([])
                setFilteredProjects([])
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [router])

    useEffect(() => {
        let filtered = projects

        // Filter by tab
        if (activeTab === 'pending') {
            filtered = filtered.filter(p => !p.supervisorApprovalStatus || p.supervisorApprovalStatus === 'PENDING')
        } else if (activeTab === 'approved') {
            filtered = filtered.filter(p => p.supervisorApprovalStatus === 'APPROVED')
        } else if (activeTab === 'rejected') {
            filtered = filtered.filter(p => p.supervisorApprovalStatus === 'REJECTED')
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredProjects(filtered)
    }, [activeTab, searchQuery, projects])

    const getStatusBadge = (status: string | null) => {
        if (!status || status === 'PENDING') {
            return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
        } else if (status === 'APPROVED') {
            return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
        } else if (status === 'REJECTED') {
            return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
        }
        return null
    }

    const handleOpenReviewDialog = (project: Project, action: 'APPROVE' | 'REJECT') => {
        setReviewDialog({ open: true, project, action })
        setReviewComments(project.supervisorComments || '')
    }

    const handleCloseReviewDialog = () => {
        setReviewDialog({ open: false, project: null, action: null })
        setReviewComments('')
    }

    const handleSubmitReview = async () => {
        if (!reviewDialog.project || !reviewDialog.action) return

        setSubmitting(true)
        try {
            const response = await fetch(`/api/supervisor/projects/${reviewDialog.project.id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: reviewDialog.action,
                    comments: reviewComments.trim() || null
                })
            })

            if (response.ok) {
                const data = await response.json()
                alert(data.message || `Project ${reviewDialog.action === 'APPROVE' ? 'approved' : 'rejected'} successfully`)

                // Refresh the projects list
                const projectsResponse = await fetch('/api/supervisor/projects')
                if (projectsResponse.ok) {
                    const projectsData = await projectsResponse.json()
                    setProjects(projectsData.projects || [])
                }

                handleCloseReviewDialog()
            } else {
                const error = await response.json()
                alert(`Failed to submit review: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Error submitting review:', error)
            alert('Failed to submit review. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <SupervisorHeader currentPage="projects" />
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                        <p className="mt-4 text-muted-foreground">Loading projects...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <SupervisorHeader currentPage="projects" />

            <div className="flex-1 space-y-6 p-8 pt-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Review Projects</h2>
                        <p className="text-muted-foreground">
                            Review and approve voting projects that require supervisor authorization
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Projects List */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="pending">
                            Pending ({projects.filter(p => !p.supervisorApprovalStatus || p.supervisorApprovalStatus === 'PENDING').length})
                        </TabsTrigger>
                        <TabsTrigger value="approved">
                            Approved ({projects.filter(p => p.supervisorApprovalStatus === 'APPROVED').length})
                        </TabsTrigger>
                        <TabsTrigger value="rejected">
                            Rejected ({projects.filter(p => p.supervisorApprovalStatus === 'REJECTED').length})
                        </TabsTrigger>
                        <TabsTrigger value="all">
                            All ({projects.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                        {filteredProjects.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">No projects found</p>
                                    <p className="text-sm text-muted-foreground">
                                        {searchQuery ? 'Try adjusting your search query' : 'No projects match the current filter'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {filteredProjects.map((project) => (
                                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CardTitle>{project.title}</CardTitle>
                                                        {getStatusBadge(project.supervisorApprovalStatus)}
                                                        {project.isActive && (
                                                            <Badge variant="outline" className="text-blue-600 border-blue-600">Active</Badge>
                                                        )}
                                                    </div>
                                                    <CardDescription>{project.description}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="text-muted-foreground">
                                                        <span className="font-medium">Voting Period:</span>{' '}
                                                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                {project.supervisorComments && (
                                                    <div className="rounded-lg bg-muted p-3 text-sm">
                                                        <p className="font-medium mb-1">Supervisor Comments:</p>
                                                        <p className="text-muted-foreground">{project.supervisorComments}</p>
                                                    </div>
                                                )}

                                                {project.supervisorReviewedBy && project.supervisorReviewedAt && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Reviewed by {project.supervisorReviewedBy} on {new Date(project.supervisorReviewedAt).toLocaleString()}
                                                    </div>
                                                )}

                                                {(!project.supervisorApprovalStatus || project.supervisorApprovalStatus === 'PENDING') && (
                                                    <div className="flex gap-2 pt-2">
                                                        <Button
                                                            size="sm"
                                                            className="flex-1"
                                                            variant="outline"
                                                            onClick={() => handleOpenReviewDialog(project, 'APPROVE')}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="flex-1"
                                                            variant="outline"
                                                            onClick={() => handleOpenReviewDialog(project, 'REJECT')}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">About Supervisor Review</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                            As a supervisor, you can review and approve voting projects before they are activated. Projects requiring supervisor review cannot be enabled for voting until approved.
                        </p>
                        <p>
                            When reviewing a project, you can approve, reject, or add comments for clarification. All supervisor actions are logged in the audit trail.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Review Dialog */}
            <Dialog open={reviewDialog.open} onOpenChange={(open) => !open && handleCloseReviewDialog()}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {reviewDialog.action === 'APPROVE' ? 'Approve Project' : 'Reject Project'}
                        </DialogTitle>
                        <DialogDescription>
                            {reviewDialog.project && (
                                <>
                                    You are about to {reviewDialog.action === 'APPROVE' ? 'approve' : 'reject'} the project "{reviewDialog.project.title}".
                                    You can add comments to explain your decision.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <label htmlFor="comments" className="text-sm font-medium mb-2 block">
                                Comments {reviewDialog.action === 'REJECT' && '(Required for rejection)'}
                            </label>
                            <Textarea
                                id="comments"
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                                placeholder={
                                    reviewDialog.action === 'APPROVE'
                                        ? 'Add any comments or notes (optional)...'
                                        : 'Please explain why this project is being rejected...'
                                }
                                rows={4}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseReviewDialog}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmitReview}
                            disabled={submitting || (reviewDialog.action === 'REJECT' && !reviewComments.trim())}
                            className={reviewDialog.action === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {submitting ? 'Submitting...' : (reviewDialog.action === 'APPROVE' ? 'Approve Project' : 'Reject Project')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
