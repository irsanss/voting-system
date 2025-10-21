'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Plus, Edit, Trash2, Users, Vote, Calendar, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { AdminHeader } from "@/components/admin-header"

interface VotingProject {
    id: string
    title: string
    description?: string
    votingType: string
    votingMethod: string
    totalArea?: number
    startDate: string
    endDate: string
    isActive: boolean
    isPublished: boolean
    requiresSupervisorReview?: boolean
    supervisorApprovalStatus?: string | null
    status: 'UPCOMING' | 'ACTIVE' | 'ENDED'
    candidateCount: number
    voteCount: number
    createdAt: string
}

export default function ManageProjectsPage() {
    const [projects, setProjects] = useState<VotingProject[]>([])
    const [loading, setLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingProject, setEditingProject] = useState<VotingProject | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        votingType: 'HEAD_OF_APARTMENT',
        votingMethod: 'ONE_PERSON_ONE_VOTE',
        totalArea: '',
        startDate: '',
        endDate: '',
        isActive: false,
        isPublished: false,
        requiresSupervisorReview: false
    })

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects?showAll=true&includeUnpublished=true')
            if (response.ok) {
                const data = await response.json()
                setProjects(data)
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (project?: VotingProject) => {
        if (project) {
            setEditingProject(project)
            setFormData({
                title: project.title,
                description: project.description || '',
                votingType: project.votingType,
                votingMethod: project.votingMethod,
                totalArea: project.totalArea?.toString() || '',
                startDate: new Date(project.startDate).toISOString().slice(0, 16),
                endDate: new Date(project.endDate).toISOString().slice(0, 16),
                isActive: project.isActive,
                isPublished: project.isPublished,
                requiresSupervisorReview: (project as any).requiresSupervisorReview || false
            })
        } else {
            setEditingProject(null)
            setFormData({
                title: '',
                description: '',
                votingType: 'HEAD_OF_APARTMENT',
                votingMethod: 'ONE_PERSON_ONE_VOTE',
                totalArea: '',
                startDate: '',
                endDate: '',
                isActive: false,
                isPublished: false,
                requiresSupervisorReview: false
            })
        }
        setShowDialog(true)
    }

    const handleSubmit = async () => {
        try {
            // Validate required fields
            if (!formData.title || !formData.startDate || !formData.endDate) {
                alert('Please fill in all required fields (Title, Start Date, End Date)')
                return
            }

            // Validate dates
            const startDate = new Date(formData.startDate)
            const endDate = new Date(formData.endDate)

            if (isNaN(startDate.getTime())) {
                alert('Please enter a valid start date')
                return
            }

            if (isNaN(endDate.getTime())) {
                alert('Please enter a valid end date')
                return
            }

            if (endDate <= startDate) {
                alert('End date must be after start date')
                return
            }

            const url = editingProject
                ? `/api/admin/projects/${editingProject.id}`
                : '/api/admin/projects'

            const method = editingProject ? 'PUT' : 'POST'

            const payload = {
                ...formData,
                totalArea: formData.totalArea ? parseFloat(formData.totalArea) : null,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                alert(`Project ${editingProject ? 'updated' : 'created'} successfully`)
                setShowDialog(false)
                fetchProjects()
            } else {
                const error = await response.json()
                console.error('API Error:', error)
                alert(`Failed to save project: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to save project:', error)
            if (error instanceof Error) {
                alert(`Failed to save project: ${error.message}`)
            } else {
                alert('Failed to save project. Please check the console for details.')
            }
        }
    }

    const handleDelete = async (projectId: string, hasVotes: boolean) => {
        if (hasVotes) {
            alert('Cannot delete project with existing votes')
            return
        }

        if (!confirm('Are you sure you want to delete this project?')) {
            return
        }

        try {
            const response = await fetch(`/api/admin/projects/${projectId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                alert('Project deleted successfully')
                fetchProjects()
            } else {
                const error = await response.json()
                alert(`Failed: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to delete project:', error)
            alert('Failed to delete project')
        }
    }

    const handleTogglePublish = async (projectId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublished: !currentStatus })
            })

            if (response.ok) {
                alert(`Project ${!currentStatus ? 'published' : 'unpublished'} successfully`)
                fetchProjects()
            } else {
                const error = await response.json()
                alert(`Failed: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to toggle publish status:', error)
            alert('Failed to update project')
        }
    }

    const handleToggleActive = async (projectId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            })

            if (response.ok) {
                alert(`Project ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
                fetchProjects()
            } else {
                const error = await response.json()
                alert(`Failed: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to toggle active status:', error)
            alert('Failed to update project')
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            UPCOMING: 'bg-blue-500',
            ACTIVE: 'bg-green-500',
            ENDED: 'bg-gray-500'
        }
        return (
            <Badge className={variants[status] || 'bg-gray-500'}>
                {status}
            </Badge>
        )
    }

    const getVotingTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            HEAD_OF_APARTMENT: 'Head of Apartment',
            POLICY: 'Policy',
            ACTION_PLAN: 'Action Plan',
            SURVEY: 'Survey'
        }
        return labels[type] || type
    }

    const getVotingMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            ONE_PERSON_ONE_VOTE: 'One Person, One Vote',
            WEIGHTED_BY_SIZE_MANUAL: 'Weighted by Size (Manual)',
            WEIGHTED_BY_SIZE_VOTERS: 'Weighted by Size (Voters)'
        }
        return labels[method] || method
    }

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
            <AdminHeader title="Manage Voting Projects" showBackButton backHref="/admin/dashboard" currentPage="projects" />
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-muted-foreground mt-1">
                                Create, edit, and manage all voting projects
                            </p>
                        </div>
                        <Link href="/admin/projects/create">
                            <Button type="button">
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Project
                            </Button>
                        </Link>
                        <Dialog open={showDialog} onOpenChange={setShowDialog}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingProject ? 'Edit Project' : 'Create New Project'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingProject
                                            ? 'Update the voting project details below'
                                            : 'Fill in the details to create a new voting project'
                                        }
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., 2025 Head of Apartment Election"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the voting project"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="votingType">Voting Type *</Label>
                                            <Select
                                                value={formData.votingType}
                                                onValueChange={(value) => setFormData({ ...formData, votingType: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="HEAD_OF_APARTMENT">Head of Apartment</SelectItem>
                                                    <SelectItem value="POLICY">Policy</SelectItem>
                                                    <SelectItem value="ACTION_PLAN">Action Plan</SelectItem>
                                                    <SelectItem value="SURVEY">Survey</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="votingMethod">Voting Method *</Label>
                                            <Select
                                                value={formData.votingMethod}
                                                onValueChange={(value) => setFormData({ ...formData, votingMethod: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ONE_PERSON_ONE_VOTE">One Person, One Vote</SelectItem>
                                                    <SelectItem value="WEIGHTED_BY_SIZE_MANUAL">Weighted by Size (Manual)</SelectItem>
                                                    <SelectItem value="WEIGHTED_BY_SIZE_VOTERS">Weighted by Size (Voters)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {formData.votingMethod === 'WEIGHTED_BY_SIZE_MANUAL' && (
                                        <div>
                                            <Label htmlFor="totalArea">Total Area (m²)</Label>
                                            <Input
                                                id="totalArea"
                                                type="number"
                                                step="0.01"
                                                value={formData.totalArea}
                                                onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                                                placeholder="e.g., 1000"
                                            />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="startDate">Start Date & Time *</Label>
                                            <Input
                                                id="startDate"
                                                type="datetime-local"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                required
                                                className={!formData.startDate ? 'border-red-300' : ''}
                                            />
                                            {!formData.startDate && (
                                                <p className="text-xs text-red-600 mt-1">Start date is required</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="endDate">End Date & Time *</Label>
                                            <Input
                                                id="endDate"
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                required
                                                className={!formData.endDate ? 'border-red-300' : ''}
                                            />
                                            {!formData.endDate && (
                                                <p className="text-xs text-red-600 mt-1">End date is required</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="requiresSupervisorReview"
                                            type="checkbox"
                                            checked={formData.requiresSupervisorReview}
                                            onChange={(e) => setFormData({ ...formData, requiresSupervisorReview: e.target.checked })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="requiresSupervisorReview" className="font-normal">
                                            Requires supervisor review and approval
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="isPublished"
                                            type="checkbox"
                                            checked={formData.isPublished}
                                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="isPublished" className="font-normal">
                                            Publish project (make visible to voters)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="isActive"
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="isActive" className="font-normal">
                                            Activate project (allow voting)
                                        </Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={handleSubmit}>
                                        {editingProject ? 'Update Project' : 'Create Project'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{projects.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {projects.filter(p => p.status === 'ACTIVE').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Upcoming Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {projects.filter(p => p.status === 'UPCOMING').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Completed Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">
                                {projects.filter(p => p.status === 'ENDED').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Voting Projects</CardTitle>
                        <CardDescription>
                            Manage all voting projects, candidates, and settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Stats</TableHead>
                                        <TableHead>Visibility</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                No projects found. Create your first voting project!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        projects.map((project) => (
                                            <TableRow key={project.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{project.title}</div>
                                                        {project.description && (
                                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                                {project.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {getVotingTypeLabel(project.votingType)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {getVotingMethodLabel(project.votingMethod)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(project.startDate).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            to {new Date(project.endDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(project.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {project.candidateCount} candidates
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Vote className="h-3 w-3" />
                                                            {project.voteCount} votes
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant={project.isPublished ? "default" : "secondary"}>
                                                            {project.isPublished ? "Published" : "Draft"}
                                                        </Badge>
                                                        <Badge variant={project.isActive ? "default" : "secondary"}>
                                                            {project.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                        {project.requiresSupervisorReview && (
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    project.supervisorApprovalStatus === 'APPROVED'
                                                                        ? "border-green-600 text-green-600"
                                                                        : project.supervisorApprovalStatus === 'REJECTED'
                                                                            ? "border-red-600 text-red-600"
                                                                            : "border-yellow-600 text-yellow-600"
                                                                }
                                                            >
                                                                {project.supervisorApprovalStatus === 'APPROVED'
                                                                    ? "✓ Supervisor Approved"
                                                                    : project.supervisorApprovalStatus === 'REJECTED'
                                                                        ? "✗ Supervisor Rejected"
                                                                        : "⏳ Needs Supervisor Review"
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleTogglePublish(project.id, project.isPublished)}
                                                            title={project.isPublished ? "Unpublish" : "Publish"}
                                                        >
                                                            {project.isPublished ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Link href={`/admin/projects/${project.id}/candidates`}>
                                                            <Button variant="ghost" size="sm" title="Manage Candidates">
                                                                <Users className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenDialog(project)}
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(project.id, project.voteCount > 0)}
                                                            title={project.voteCount > 0 ? "Cannot delete project with votes" : "Delete"}
                                                            disabled={project.voteCount > 0}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
