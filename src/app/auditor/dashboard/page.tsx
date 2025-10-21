'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Download, Search } from 'lucide-react'
import { AuditorHeader } from '@/components/auditor-header'
import { translations, Language } from '@/lib/i18n'

export default function AuditorDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [language, setLanguage] = useState<Language>('en')

    useEffect(() => {
        fetchUser()
        // Load language from localStorage
        const savedLanguage = localStorage.getItem('language') as Language
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
            setLanguage(savedLanguage)
        }

        // Listen for language changes
        const handleLanguageChange = (event: CustomEvent) => {
            setLanguage(event.detail)
        }
        window.addEventListener('languageChange', handleLanguageChange as EventListener)

        return () => {
            window.removeEventListener('languageChange', handleLanguageChange as EventListener)
        }
    }, [])

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/auth/me')
            if (response.ok) {
                const data = await response.json()
                setUser(data)
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleInvestigate = (eventType: string) => {
        alert(`Investigating ${eventType} event... This feature will be implemented soon.`)
    }

    const handleViewDetails = (eventType: string) => {
        alert(`Viewing details for ${eventType}... This feature will be implemented soon.`)
    }

    const handleViewAllLogs = () => {
        router.push('/auditor/logs')
    }

    const handleViewReport = (reportName: string) => {
        alert(`Viewing report: ${reportName}... This feature will be implemented soon.`)
    }

    const handleContinue = () => {
        alert(`Continuing audit... This feature will be implemented soon.`)
    }

    const handleGenerateReport = () => {
        alert(`Generating new audit report... This feature will be implemented soon.`)
    }

    const handleExportLogs = () => {
        alert(`Exporting audit logs... This feature will be implemented soon.`)
    }

    const handleMonitor = (projectName: string) => {
        alert(`Monitoring ${projectName}... This feature will be implemented soon.`)
    }

    const handleReviewSetup = (projectName: string) => {
        alert(`Reviewing setup for ${projectName}... This feature will be implemented soon.`)
    }

    const t = translations[language]

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <AuditorHeader title={t.app.title} currentPage="dashboard" />
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
            <AuditorHeader title={t.app.title} currentPage="dashboard" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold">🔍 Auditor Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        {user?.name} • Access Level: Full Audit Rights
                    </p>
                </div>

                {/* System Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>📊 System Overview</CardTitle>
                        <CardDescription>Real-time system statistics and health</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">5</div>
                                    <p className="text-xs text-muted-foreground">
                                        2 requiring audit
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">250</div>
                                    <p className="text-xs text-muted-foreground">
                                        +5 this month
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1,247</div>
                                    <p className="text-xs text-muted-foreground">
                                        recorded today
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">Healthy</div>
                                    <p className="text-xs text-muted-foreground">
                                        All systems operational
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Events */}
                <Card>
                    <CardHeader>
                        <CardTitle>🔐 Security Events (Last 24 Hours)</CardTitle>
                        <CardDescription>Monitor security-related activities and alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="destructive">CRITICAL</Badge>
                                <span className="text-2xl font-bold">0</span>
                                <span className="text-sm text-muted-foreground">events</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-orange-500">HIGH</Badge>
                                <span className="text-2xl font-bold">2</span>
                                <span className="text-sm text-muted-foreground">events</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-500">MEDIUM</Badge>
                                <span className="text-2xl font-bold">15</span>
                                <span className="text-sm text-muted-foreground">events</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-green-500">LOW</Badge>
                                <span className="text-2xl font-bold">234</span>
                                <span className="text-sm text-muted-foreground">events</span>
                            </div>
                        </div>

                        <div className="space-y-3 mt-6">
                            <div className="text-sm font-medium">Recent Security Events:</div>

                            <div className="flex items-start gap-3 p-3 border rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                                <div className="flex-1">
                                    <div className="font-medium">Multiple login attempts detected</div>
                                    <div className="text-sm text-muted-foreground">
                                        IP: 192.168.1.55 • Time: 14:23 • Severity: HIGH
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleInvestigate('Multiple login attempts')}>
                                    Investigate
                                </Button>
                            </div>

                            <div className="flex items-start gap-3 p-3 border rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                <div className="flex-1">
                                    <div className="font-medium">User role changed</div>
                                    <div className="text-sm text-muted-foreground">
                                        User: voter1@example.com • Time: 13:45 • Severity: MEDIUM
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails('User role changed')}>
                                    View Details
                                </Button>
                            </div>

                            <div className="flex items-start gap-3 p-3 border rounded-lg">
                                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div className="flex-1">
                                    <div className="font-medium">Vote cast successfully</div>
                                    <div className="text-sm text-muted-foreground">
                                        Project: Election 2024 • User ID: #123 • Time: 12:30
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails('Vote cast')}>
                                    View Details
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button variant="outline" onClick={handleViewAllLogs}>
                                <Search className="mr-2 h-4 w-4" />
                                View All Security Logs
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Audit Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle>📋 Recent Audit Activities</CardTitle>
                        <CardDescription>Your audit history and ongoing reviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <div>
                                        <div className="font-medium">Election "Head 2024" - Verified</div>
                                        <div className="text-sm text-muted-foreground">Dec 20, 2024 • Status: Complete ✓</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleViewReport('Election Head 2024')}>
                                    View Report
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                    <div>
                                        <div className="font-medium">Vote integrity check</div>
                                        <div className="text-sm text-muted-foreground">Dec 19, 2024 • Status: In Progress</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleContinue}>
                                    Continue
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <div>
                                        <div className="font-medium">User access audit</div>
                                        <div className="text-sm text-muted-foreground">Dec 18, 2024 • Status: Complete</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleViewReport('User access audit')}>
                                    View Report
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <div>
                                        <div className="font-medium">System log review</div>
                                        <div className="text-sm text-muted-foreground">Dec 17, 2024 • No issues found</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleViewReport('System log review')}>
                                    View Report
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleGenerateReport}>
                                <FileText className="mr-2 h-4 w-4" />
                                Generate New Report
                            </Button>
                            <Button variant="outline" onClick={handleExportLogs}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Logs
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Voting Projects Requiring Audit */}
                <Card>
                    <CardHeader>
                        <CardTitle>🗳️ Voting Projects Requiring Audit</CardTitle>
                        <CardDescription>Active and upcoming projects that need audit oversight</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Apartment Head Election 2024</div>
                                    <div className="text-sm text-muted-foreground">
                                        Status: Active • Ends: Dec 31, 2024 • 247 votes cast
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleMonitor('Apartment Head Election 2024')}>
                                        Monitor
                                    </Button>
                                    <Button size="sm" onClick={handleGenerateReport}>
                                        Generate Report
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Budget Approval 2025</div>
                                    <div className="text-sm text-muted-foreground">
                                        Status: Upcoming • Starts: Jan 1, 2025 • Awaiting approval
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleReviewSetup('Budget Approval 2025')}>
                                    Review Setup
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
