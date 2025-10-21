'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AdminHeader } from "@/components/admin-header"

export default function CreateProjectPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

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

            setLoading(true)

            const payload = {
                ...formData,
                totalArea: formData.totalArea ? parseFloat(formData.totalArea) : null,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }

            const response = await fetch('/api/admin/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                alert('Project created successfully')
                router.push('/admin/projects')
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
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminHeader title="Create New Project" showBackButton backHref="/admin/projects" currentPage="projects" />
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Voting Project</CardTitle>
                        <CardDescription>
                            Fill in the details to create a new voting project
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., 2025 Head of Apartment Election"
                                    required
                                />
                            </div>

                            {/* Description */}
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

                            {/* Voting Type and Method */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            {/* Total Area (conditional) */}
                            {formData.votingMethod === 'WEIGHTED_BY_SIZE_MANUAL' && (
                                <div>
                                    <Label htmlFor="totalArea">Total Area (m²)</Label>
                                    <Input
                                        id="totalArea"
                                        type="number"
                                        step="0.01"
                                        value={formData.totalArea}
                                        onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                                        placeholder="e.g., 10000"
                                    />
                                </div>
                            )}

                            {/* Start and End Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            {/* Checkboxes */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="requiresSupervisorReview"
                                        type="checkbox"
                                        checked={formData.requiresSupervisorReview}
                                        onChange={(e) => setFormData({ ...formData, requiresSupervisorReview: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="requiresSupervisorReview" className="font-normal cursor-pointer">
                                        Requires supervisor review and approval
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        id="isPublished"
                                        type="checkbox"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="isPublished" className="font-normal cursor-pointer">
                                        Publish project (make visible to voters)
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        id="isActive"
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="isActive" className="font-normal cursor-pointer">
                                        Activate project (allow voting)
                                    </Label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t">
                                <Link href="/admin/projects">
                                    <Button type="button" variant="outline">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Project'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
