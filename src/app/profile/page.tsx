'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, Shield, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AppHeader } from '@/components/app-header'
import { translations, Language } from '@/lib/i18n'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [language, setLanguage] = useState<Language>('en')
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        apartmentUnit: '',
        apartmentSize: '',
        language: 'en',
    })

    useEffect(() => {
        fetchUser()
        // Load language from localStorage
        const savedLanguage = localStorage.getItem('language') as Language
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
            setLanguage(savedLanguage)
        }
    }, [])

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/auth/me')
            if (response.ok) {
                const data = await response.json()
                setUser(data)
                setFormData({
                    name: data.name || '',
                    phone: data.phone || '',
                    apartmentUnit: data.apartmentUnit || '',
                    apartmentSize: data.apartmentSize?.toString() || '',
                    language: data.language || 'en',
                })
            } else {
                router.push('/auth/login')
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    apartmentUnit: formData.apartmentUnit,
                    apartmentSize: formData.apartmentSize,
                    language: formData.language,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
                alert('Profile updated successfully!')

                // Update language in localStorage if changed
                if (formData.language !== language) {
                    localStorage.setItem('language', formData.language)
                    setLanguage(formData.language as Language)
                }
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

    const getDashboardUrl = () => {
        if (!user) return '/dashboard'

        switch (user.role) {
            case 'SUPERADMIN':
            case 'COMMITTEE':
                return '/admin/dashboard'
            case 'CANDIDATE':
                return '/candidate/dashboard'
            case 'AUDITOR':
                return '/auditor/dashboard'
            case 'VOTER':
            default:
                return '/dashboard'
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return 'bg-purple-50 text-purple-700 ring-purple-700/10'
            case 'COMMITTEE':
                return 'bg-blue-50 text-blue-700 ring-blue-700/10'
            case 'CANDIDATE':
                return 'bg-green-50 text-green-700 ring-green-700/10'
            case 'AUDITOR':
                return 'bg-orange-50 text-orange-700 ring-orange-700/10'
            case 'VOTER':
                return 'bg-gray-50 text-gray-700 ring-gray-700/10'
            default:
                return 'bg-gray-50 text-gray-700 ring-gray-700/10'
        }
    }

    const t = translations[language]

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <AppHeader title={t?.app?.title || "E-Voting System"} showAuth={false} showLogout={true} />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <AppHeader
                title={t?.app?.title || "E-Voting System"}
                showAuth={false}
                showLogout={true}
                showBackButton
                backHref={getDashboardUrl()}
                backLabel="Back to Dashboard"
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold">👤 My Profile</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your personal information and account settings
                    </p>
                </div>

                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your account details and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="e.g., +62 812 3456 7890"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-muted">
                                    <Badge className={`${getRoleBadgeColor(user?.role)}`}>
                                        {user?.role}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="memberSince">Member Since</Label>
                                <Input
                                    id="memberSince"
                                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="apartmentUnit">Apartment Unit</Label>
                                <Input
                                    id="apartmentUnit"
                                    value={formData.apartmentUnit}
                                    onChange={(e) => setFormData({ ...formData, apartmentUnit: e.target.value })}
                                    placeholder="e.g., A-101"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="apartmentSize">Apartment Size (m²)</Label>
                                <Input
                                    id="apartmentSize"
                                    type="number"
                                    step="0.1"
                                    value={formData.apartmentSize}
                                    onChange={(e) => setFormData({ ...formData, apartmentSize: e.target.value })}
                                    placeholder="e.g., 85.5"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="language">Preferred Language</Label>
                                <Select
                                    value={formData.language}
                                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                                >
                                    <SelectTrigger id="language">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleSave} disabled={saving}>
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Shield className="inline mr-2 h-5 w-5" />
                            Security Settings
                        </CardTitle>
                        <CardDescription>Manage your password and security preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    placeholder="••••••••••••"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••••••"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must contain at least 8 characters with letters and numbers
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <Button variant="outline">
                            Update Password
                        </Button>

                        <div className="mt-6 pt-6 border-t">
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Login:</span>
                                    <span className="font-medium">
                                        {new Date().toLocaleString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Account Status:</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                        Active ✓
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Activity className="inline mr-2 h-5 w-5" />
                            Activity Summary
                        </CardTitle>
                        <CardDescription>Your participation and engagement statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <div className="text-2xl font-bold">
                                    {user?.role === 'VOTER' || user?.role === 'CANDIDATE' ? '5' : 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">Total Votes Cast</p>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {user?.role === 'VOTER' || user?.role === 'CANDIDATE' ? '5' : 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">Projects Participated</p>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">Active</div>
                                <p className="text-xs text-muted-foreground">Account Status</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
