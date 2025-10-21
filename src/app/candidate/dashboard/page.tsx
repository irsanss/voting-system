'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Clock, Eye, Save, X, Plus } from 'lucide-react'
import Link from 'next/link'
import { CandidateHeader } from '@/components/candidate-header'

interface Project {
    id: string
    userId: string
    projectId: string
    name: string
    photo: string | null
    vision: string | null
    mission: string | null
    reason: string | null
    videos: string | null
    images: string | null
    teamMembers: string | null
    socialMedia: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
    project: {
        id: string
        title: string
        description: string | null
        startDate: string
        endDate: string
        isActive: boolean
        status: string
        votingType: string
        votingMethod: string
    }
    _count: {
        votes: number
    }
}

interface Stats {
    candidateId: string
    totalVotes: number
    weightedVotes: number
    position: number
    totalCandidates: number
    votePercentage: number
    recentVotes: number
    leaderboard: Array<{
        id: string
        name: string
        voteCount: number
        weightedVoteCount: number
    }>
}

interface FormData {
    name: string
    photo: string
    vision: string
    mission: string
    reason: string
    teamMembers: string[]
    socialMedia: {
        facebook: string
        twitter: string
        instagram: string
        linkedin: string
        website: string
    }
}

export default function CandidateDashboard() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [stats, setStats] = useState<Stats | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<string>('')
    const [formData, setFormData] = useState<FormData>({
        name: '',
        photo: '',
        vision: '',
        mission: '',
        reason: '',
        teamMembers: [''],
        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            website: ''
        }
    })

    useEffect(() => {
        fetchUser()
        fetchProjects()
    }, [])

    useEffect(() => {
        if (selectedProject) {
            loadProjectData(selectedProject)
            fetchStats(selectedProject.project.id)
        }
    }, [selectedProject])

    useEffect(() => {
        if (selectedProject) {
            const interval = setInterval(() => {
                updateTimeRemaining(selectedProject.project.endDate)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [selectedProject])

    useEffect(() => {
        if (selectedProject) {
            const interval = setInterval(() => {
                fetchStats(selectedProject.project.id)
            }, 30000) // Refresh stats every 30 seconds
            return () => clearInterval(interval)
        }
    }, [selectedProject])

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/auth/me')
            if (response.ok) {
                const data = await response.json()
                setUser(data)
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
        }
    }

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/candidates/projects')
            if (response.ok) {
                const data = await response.json()
                setProjects(data)
                if (data.length > 0) {
                    setSelectedProject(data[0])
                }
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async (projectId: string) => {
        try {
            const response = await fetch(`/api/candidates/stats/${projectId}`)
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    const loadProjectData = (project: Project) => {
        const teamMembers = project.teamMembers ? JSON.parse(project.teamMembers) : ['']
        const socialMedia = project.socialMedia ? JSON.parse(project.socialMedia) : {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            website: ''
        }

        setFormData({
            name: project.name || '',
            photo: project.photo || '',
            vision: project.vision || '',
            mission: project.mission || '',
            reason: project.reason || '',
            teamMembers: teamMembers.length > 0 ? teamMembers : [''],
            socialMedia
        })
    }

    const updateTimeRemaining = (endDate: string) => {
        const now = new Date().getTime()
        const end = new Date(endDate).getTime()
        const distance = end - now

        if (distance < 0) {
            setTimeRemaining('Voting ended')
            return
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    const handleSave = async () => {
        if (!selectedProject) return

        setSaving(true)
        try {
            const response = await fetch(`/api/candidates/${selectedProject.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    photo: formData.photo,
                    vision: formData.vision,
                    mission: formData.mission,
                    reason: formData.reason,
                    teamMembers: JSON.stringify(formData.teamMembers.filter(m => m.trim() !== '')),
                    socialMedia: JSON.stringify(formData.socialMedia)
                }),
            })

            if (response.ok) {
                alert('Profile updated successfully!')
                fetchProjects() // Refresh projects
            } else {
                const error = await response.json()
                alert(`Failed to update profile: ${error.error}`)
            }
        } catch (error) {
            console.error('Failed to save:', error)
            alert('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const addTeamMember = () => {
        setFormData({
            ...formData,
            teamMembers: [...formData.teamMembers, '']
        })
    }

    const updateTeamMember = (index: number, value: string) => {
        const newTeamMembers = [...formData.teamMembers]
        newTeamMembers[index] = value
        setFormData({ ...formData, teamMembers: newTeamMembers })
    }

    const removeTeamMember = (index: number) => {
        const newTeamMembers = formData.teamMembers.filter((_, i) => i !== index)
        setFormData({ ...formData, teamMembers: newTeamMembers })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <CandidateHeader currentPage="dashboard" />
                <div className="container py-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (projects.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <CandidateHeader currentPage="dashboard" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>No Voting Projects</CardTitle>
                            <CardDescription>You haven't been assigned to any voting projects yet.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Please contact an administrator to be added as a candidate to a voting project.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            ACTIVE: 'bg-green-50 text-green-700 ring-green-600/20',
            UPCOMING: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
            ENDED: 'bg-gray-50 text-gray-700 ring-gray-600/20'
        }
        return variants[status] || variants.ENDED
    }

    return (
        <div className="min-h-screen bg-background">
            <CandidateHeader currentPage="dashboard" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Welcome Section with Project Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">🎯 Candidate Dashboard</h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome back, {user?.name}!
                        </p>
                    </div>
                    <div className="w-full sm:w-80">
                        <Label htmlFor="project-select" className="text-sm font-medium mb-2 block">
                            Select Voting Project
                        </Label>
                        <Select
                            value={selectedProject?.id}
                            onValueChange={(value) => {
                                const project = projects.find(p => p.id === value)
                                if (project) setSelectedProject(project)
                            }}
                        >
                            <SelectTrigger id="project-select">
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.project.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {selectedProject && (
                    <>
                        {/* Project Info Banner */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedProject.project.title}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedProject.project.description}
                                        </p>
                                    </div>
                                    <Badge className={`${getStatusBadge(selectedProject.project.status)} ring-1 ring-inset`}>
                                        {selectedProject.project.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Campaign Performance Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📊 Live Campaign Performance</CardTitle>
                                <CardDescription>Real-time voting statistics and ranking</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{stats?.totalVotes || 0}</div>
                                            <p className="text-xs text-muted-foreground">
                                                {stats?.recentVotes || 0} in last 24h
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Current Position</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">#{stats?.position || 0}</div>
                                            <p className="text-xs text-muted-foreground">
                                                of {stats?.totalCandidates || 0} candidates
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-lg font-bold">{timeRemaining}</div>
                                            <p className="text-xs text-muted-foreground">
                                                until voting ends
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Vote Share</span>
                                        <span className="text-sm text-muted-foreground">{stats?.votePercentage || 0}% of total votes</span>
                                    </div>
                                    <Progress value={stats?.votePercentage || 0} className="h-3" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Picture Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📸 Profile Picture</CardTitle>
                                <CardDescription>Upload or provide a URL for your profile picture</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-4">
                                    {formData.photo && (
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                                            <img
                                                src={formData.photo}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="photo">Photo URL</Label>
                                        <Input
                                            id="photo"
                                            type="text"
                                            value={formData.photo}
                                            onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                                            placeholder="https://example.com/photo.jpg or upload to image host"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Use an image hosting service like Imgur, Unsplash, or Cloudinary
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Campaign Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>📝 Campaign Information</CardTitle>
                                <CardDescription>Update your campaign details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Campaign Name / Candidate Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vision">Vision Statement</Label>
                                    <Textarea
                                        id="vision"
                                        value={formData.vision}
                                        onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                                        placeholder="What is your vision for the community?"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mission">Mission Statement</Label>
                                    <Textarea
                                        id="mission"
                                        value={formData.mission}
                                        onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                                        placeholder="List your key missions and goals"
                                        rows={5}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Why Choose Me?</Label>
                                    <Textarea
                                        id="reason"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="Explain why you're the best candidate"
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Media Links */}
                        <Card>
                            <CardHeader>
                                <CardTitle>🔗 Social Media Links (Optional)</CardTitle>
                                <CardDescription>Add your social media profiles to connect with voters</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="facebook">Facebook</Label>
                                        <Input
                                            id="facebook"
                                            value={formData.socialMedia.facebook}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                                            })}
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="twitter">Twitter</Label>
                                        <Input
                                            id="twitter"
                                            value={formData.socialMedia.twitter}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                                            })}
                                            placeholder="https://twitter.com/yourhandle"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="instagram">Instagram</Label>
                                        <Input
                                            id="instagram"
                                            value={formData.socialMedia.instagram}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                                            })}
                                            placeholder="https://instagram.com/yourhandle"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin">LinkedIn</Label>
                                        <Input
                                            id="linkedin"
                                            value={formData.socialMedia.linkedin}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                                            })}
                                            placeholder="https://linkedin.com/in/yourprofile"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="website">Personal Website</Label>
                                        <Input
                                            id="website"
                                            value={formData.socialMedia.website}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socialMedia: { ...formData.socialMedia, website: e.target.value }
                                            })}
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team Members */}
                        <Card>
                            <CardHeader>
                                <CardTitle>� Team Members</CardTitle>
                                <CardDescription>List your campaign team members</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {formData.teamMembers.map((member, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={member}
                                            onChange={(e) => updateTeamMember(index, e.target.value)}
                                            placeholder="e.g., John Doe - Campaign Manager"
                                        />
                                        {formData.teamMembers.length > 1 && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeTeamMember(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addTeamMember}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Team Member
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={handleSave} disabled={saving} size="lg">
                                        <Save className="mr-2 h-4 w-4" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button variant="outline" size="lg" asChild>
                                        <Link href={`/candidates/${selectedProject.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview Public Profile
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}
