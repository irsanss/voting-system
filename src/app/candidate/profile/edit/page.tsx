'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { CandidateHeader } from '@/components/candidate-header'

export default function EditCandidateProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [candidateProfile, setCandidateProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        vision: '',
        mission: '',
        reason: '',
        teamMembers: [''],
        images: [''],
        videos: ['']
    })

    useEffect(() => {
        fetchUserAndProfile()
    }, [])

    const fetchUserAndProfile = async () => {
        try {
            // Fetch user info
            const userResponse = await fetch('/api/auth/me')
            if (userResponse.ok) {
                const userData = await userResponse.json()
                setUser(userData)

                // Fetch candidate profile
                const profileResponse = await fetch(`/api/candidates/profile?userId=${userData.id}`)
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json()
                    setCandidateProfile(profileData)

                    // Parse JSON fields
                    const teamMembers = profileData.teamMembers ?
                        (typeof profileData.teamMembers === 'string' ? JSON.parse(profileData.teamMembers) : profileData.teamMembers) : ['']
                    const images = profileData.images ?
                        (typeof profileData.images === 'string' ? JSON.parse(profileData.images) : profileData.images) : ['']
                    const videos = profileData.videos ?
                        (typeof profileData.videos === 'string' ? JSON.parse(profileData.videos) : profileData.videos) : ['']

                    setFormData({
                        name: profileData.name || '',
                        vision: profileData.vision || '',
                        mission: profileData.mission || '',
                        reason: profileData.reason || '',
                        teamMembers: teamMembers.length > 0 ? teamMembers : [''],
                        images: images.length > 0 ? images : [''],
                        videos: videos.length > 0 ? videos : ['']
                    })
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!candidateProfile?.id) {
            alert('No candidate profile found')
            return
        }

        setSaving(true)
        try {
            // Filter out empty strings from arrays
            const cleanedData = {
                name: formData.name,
                vision: formData.vision,
                mission: formData.mission,
                reason: formData.reason,
                teamMembers: JSON.stringify(formData.teamMembers.filter(m => m.trim() !== '')),
                images: JSON.stringify(formData.images.filter(i => i.trim() !== '')),
                videos: JSON.stringify(formData.videos.filter(v => v.trim() !== ''))
            }

            const response = await fetch(`/api/candidates/${candidateProfile.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData),
            })

            if (response.ok) {
                alert('Profile updated successfully!')
                router.push('/candidate/dashboard')
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Failed to save profile:', error)
            alert('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const addArrayField = (field: 'teamMembers' | 'images' | 'videos') => {
        setFormData({
            ...formData,
            [field]: [...formData[field], '']
        })
    }

    const removeArrayField = (field: 'teamMembers' | 'images' | 'videos', index: number) => {
        const newArray = formData[field].filter((_, i) => i !== index)
        setFormData({
            ...formData,
            [field]: newArray.length > 0 ? newArray : ['']
        })
    }

    const updateArrayField = (field: 'teamMembers' | 'images' | 'videos', index: number, value: string) => {
        const newArray = [...formData[field]]
        newArray[index] = value
        setFormData({
            ...formData,
            [field]: newArray
        })
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

    if (!candidateProfile) {
        return (
            <div className="min-h-screen bg-background">
                <CandidateHeader currentPage="dashboard" />
                <div className="container py-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>No Candidate Profile Found</CardTitle>
                            <CardDescription>
                                You don't have an active candidate profile. Please contact an administrator.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/candidate/dashboard">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <CandidateHeader currentPage="dashboard" />
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/candidate/dashboard">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold tracking-tight">✏️ Edit Campaign Profile</h1>
                        </div>
                    </div>
                    <p className="text-muted-foreground ml-14">
                        Update your campaign information for <span className="font-semibold">{candidateProfile.project?.title || 'your campaign'}</span>
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Campaign Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Information</CardTitle>
                            <CardDescription>Basic information about your campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Campaign Name / Candidate Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your campaign or candidate name"
                                />
                                <p className="text-xs text-muted-foreground">
                                    This will be displayed to voters as your official campaign name
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Project</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {candidateProfile.project?.title || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Status</Label>
                                    <div className="text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${candidateProfile.project?.status === 'ACTIVE'
                                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                : candidateProfile.project?.status === 'UPCOMING'
                                                    ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                                                    : 'bg-gray-50 text-gray-700 ring-gray-600/20'
                                            }`}>
                                            {candidateProfile.project?.status || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vision & Mission */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vision & Mission</CardTitle>
                            <CardDescription>Share your vision and mission statement with voters</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                    placeholder="List your key missions and goals (one per line)"
                                    rows={6}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Tip: Use numbered points (1. 2. 3.) for better readability
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Why You're Running</Label>
                                <Textarea
                                    id="reason"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Explain why you're the best candidate for this position"
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Members */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>List your campaign team members and their roles</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.teamMembers.map((member, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={member}
                                        onChange={(e) => updateArrayField('teamMembers', index, e.target.value)}
                                        placeholder="e.g., John Doe - Campaign Manager"
                                    />
                                    {formData.teamMembers.length > 1 && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeArrayField('teamMembers', index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addArrayField('teamMembers')}
                            >
                                + Add Team Member
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Images</CardTitle>
                            <CardDescription>Add image URLs for your campaign photos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.images.map((image, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={image}
                                        onChange={(e) => updateArrayField('images', index, e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {formData.images.length > 1 && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeArrayField('images', index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addArrayField('images')}
                            >
                                + Add Image URL
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Use Unsplash or other image hosting services for best results
                            </p>
                        </CardContent>
                    </Card>

                    {/* Videos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Videos</CardTitle>
                            <CardDescription>Add video URLs for your campaign videos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.videos.map((video, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={video}
                                        onChange={(e) => updateArrayField('videos', index, e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                    {formData.videos.length > 1 && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeArrayField('videos', index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addArrayField('videos')}
                            >
                                + Add Video URL
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Save Actions */}
                    <div className="flex gap-3 pb-8 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t">
                        <Button onClick={handleSave} disabled={saving} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" asChild size="lg">
                            <Link href="/candidate/dashboard">Cancel</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
