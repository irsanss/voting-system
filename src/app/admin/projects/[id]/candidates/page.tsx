'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Save, X, UserCheck } from 'lucide-react'
import { AdminHeader } from '@/components/admin-header'

interface Candidate {
    id: string
    name: string
    userId: string
    photo?: string
    vision?: string
    mission?: string
    reason?: string
    videos?: string
    images?: string
    teamMembers?: string
    isActive: boolean
    user: {
        email: string
        name?: string
    }
}

interface VotingProject {
    id: string
    title: string
    status: string
}

interface User {
    id: string
    email: string
    name?: string
    role: string
}

export default function ManageCandidatesPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [project, setProject] = useState<VotingProject | null>(null)
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [availableUsers, setAvailableUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [addingNew, setAddingNew] = useState(false)
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        vision: '',
        mission: '',
        reason: '',
        isActive: true
    })

    useEffect(() => {
        fetchData()
    }, [params.id])

    const fetchData = async () => {
        try {
            // Fetch project details
            const projectResponse = await fetch(`/api/admin/projects/${params.id}`)
            if (projectResponse.ok) {
                const projectData = await projectResponse.json()
                setProject(projectData)
            }

            // Fetch candidates for this project
            const candidatesResponse = await fetch(`/api/admin/projects/${params.id}/candidates`)
            if (candidatesResponse.ok) {
                const candidatesData = await candidatesResponse.json()
                setCandidates(candidatesData)
            }

            // Fetch available users (CANDIDATE role and not already in this project)
            const usersResponse = await fetch('/api/admin/users?role=CANDIDATE')
            if (usersResponse.ok) {
                const usersData = await usersResponse.json()
                setAvailableUsers(usersData)
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCandidate = async () => {
        if (!formData.userId || !formData.name) {
            alert('Please fill in required fields')
            return
        }

        try {
            const response = await fetch(`/api/admin/projects/${params.id}/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    projectId: params.id
                })
            })

            if (response.ok) {
                alert('Candidate added successfully')
                setAddingNew(false)
                resetForm()
                fetchData()
            } else {
                const error = await response.json()
                alert(`Failed to add candidate: ${error.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to add candidate:', error)
            alert('Failed to add candidate')
        }
    }

    const handleUpdateCandidate = async (candidateId: string) => {
        try {
            const response = await fetch(`/api/admin/candidates/${candidateId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                alert('Candidate updated successfully')
                setEditingId(null)
                resetForm()
                fetchData()
            } else {
                const error = await response.json()
                alert(`Failed to update candidate: ${error.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to update candidate:', error)
            alert('Failed to update candidate')
        }
    }

    const handleDeleteCandidate = async (candidateId: string) => {
        if (!confirm('Are you sure you want to delete this candidate?')) {
            return
        }

        try {
            const response = await fetch(`/api/admin/candidates/${candidateId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                alert('Candidate deleted successfully')
                fetchData()
            } else {
                const error = await response.json()
                alert(`Failed to delete candidate: ${error.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to delete candidate:', error)
            alert('Failed to delete candidate')
        }
    }

    const startEditing = (candidate: Candidate) => {
        setEditingId(candidate.id)
        setFormData({
            userId: candidate.userId,
            name: candidate.name,
            vision: candidate.vision || '',
            mission: candidate.mission || '',
            reason: candidate.reason || '',
            isActive: candidate.isActive
        })
    }

    const resetForm = () => {
        setFormData({
            userId: '',
            name: '',
            vision: '',
            mission: '',
            reason: '',
            isActive: true
        })
    }

    const cancelEditing = () => {
        setEditingId(null)
        setAddingNew(false)
        resetForm()
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
            <AdminHeader title={`Manage Candidates - ${project?.title || ''}`} showBackButton backHref="/admin/dashboard" />
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        {!addingNew && (
                            <Button onClick={() => setAddingNew(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Candidate
                            </Button>
                        )}
                    </div>
                </div>

                {/* Add New Candidate Form */}
                {addingNew && (
                    <Card className="mb-6 border-2 border-primary">
                        <CardHeader>
                            <CardTitle>Add New Candidate</CardTitle>
                            <CardDescription>Fill in the candidate information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CandidateForm
                                formData={formData}
                                setFormData={setFormData}
                                availableUsers={availableUsers}
                                onSave={handleAddCandidate}
                                onCancel={cancelEditing}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Candidates List */}
                <div className="space-y-4">
                    {candidates.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No candidates yet. Add your first candidate above.
                            </CardContent>
                        </Card>
                    ) : (
                        candidates.map((candidate) => (
                            <Card key={candidate.id}>
                                {editingId === candidate.id ? (
                                    <CardContent className="pt-6">
                                        <CandidateForm
                                            formData={formData}
                                            setFormData={setFormData}
                                            availableUsers={availableUsers}
                                            onSave={() => handleUpdateCandidate(candidate.id)}
                                            onCancel={cancelEditing}
                                            isEditing
                                        />
                                    </CardContent>
                                ) : (
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                                                    <h3 className="text-xl font-semibold">{candidate.name}</h3>
                                                    <Badge variant={candidate.isActive ? 'default' : 'secondary'}>
                                                        {candidate.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    User: {candidate.user.email}
                                                </p>
                                                {candidate.vision && (
                                                    <div className="mb-3">
                                                        <h4 className="font-semibold text-sm mb-1">Vision</h4>
                                                        <p className="text-sm text-muted-foreground">{candidate.vision}</p>
                                                    </div>
                                                )}
                                                {candidate.mission && (
                                                    <div className="mb-3">
                                                        <h4 className="font-semibold text-sm mb-1">Mission</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{candidate.mission}</p>
                                                    </div>
                                                )}
                                                {candidate.reason && (
                                                    <div className="mb-3">
                                                        <h4 className="font-semibold text-sm mb-1">Reason</h4>
                                                        <p className="text-sm text-muted-foreground">{candidate.reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => startEditing(candidate)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteCandidate(candidate.id)}
                                                    className="hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}

function CandidateForm({
    formData,
    setFormData,
    availableUsers,
    onSave,
    onCancel,
    isEditing = false
}: {
    formData: any
    setFormData: (data: any) => void
    availableUsers: User[]
    onSave: () => void
    onCancel: () => void
    isEditing?: boolean
}) {
    return (
        <div className="space-y-4">
            {!isEditing && (
                <div className="space-y-2">
                    <Label htmlFor="userId">Select User *</Label>
                    <Select
                        value={formData.userId}
                        onValueChange={(value) => {
                            const user = availableUsers.find(u => u.id === value)
                            setFormData({
                                ...formData,
                                userId: value,
                                name: user?.name || user?.email || ''
                            })
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableUsers.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.name || user.email} ({user.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Candidate Name *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter candidate name"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="vision">Vision</Label>
                <Textarea
                    id="vision"
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    placeholder="Candidate's vision statement"
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="mission">Mission</Label>
                <Textarea
                    id="mission"
                    value={formData.mission}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    placeholder="Candidate's mission points (one per line)"
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="reason">Reason for Running</Label>
                <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Why this candidate is running"
                    rows={3}
                />
            </div>

            <div className="flex items-center gap-4">
                <Label htmlFor="isActive" className="cursor-pointer">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-2"
                    />
                    Active
                </Label>
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={onSave}>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update' : 'Add'} Candidate
                </Button>
                <Button variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                </Button>
            </div>
        </div>
    )
}
