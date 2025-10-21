'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SupervisorHeader from '@/components/supervisor-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, Calendar } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function SupervisorReports() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [reportType, setReportType] = useState('approval-history')
    const [dateRange, setDateRange] = useState('last-30-days')

    useEffect(() => {
        async function verifyAccess() {
            try {
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

                setLoading(false)
            } catch (err) {
                console.error('Error verifying access:', err)
                // Don't show error, just proceed
                setLoading(false)
            }
        }

        verifyAccess()
    }, [router])

    const handleGenerateReport = async () => {
        console.log('Generating report:', { reportType, dateRange })
        // TODO: Implement report generation
        alert('Report generation will be implemented in the API')
    }

    const handleExportReport = () => {
        console.log('Exporting report:', { reportType, dateRange })
        // TODO: Implement report export
        alert('Report export will be implemented in the API')
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <SupervisorHeader currentPage="reports" />
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                        <p className="mt-4 text-muted-foreground">Loading reports...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <SupervisorHeader currentPage="reports" />

            <div className="flex-1 space-y-6 p-8 pt-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Supervisor Reports</h2>
                        <p className="text-muted-foreground">
                            Generate reports on your review activities and project approvals
                        </p>
                    </div>
                </div>

                {/* Report Generator */}
                <Card>
                    <CardHeader>
                        <CardTitle>Generate Report</CardTitle>
                        <CardDescription>
                            Select report type and date range to generate a detailed report
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Report Type</label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="approval-history">Approval History</SelectItem>
                                        <SelectItem value="pending-reviews">Pending Reviews</SelectItem>
                                        <SelectItem value="rejected-projects">Rejected Projects</SelectItem>
                                        <SelectItem value="approved-projects">Approved Projects</SelectItem>
                                        <SelectItem value="activity-summary">Activity Summary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date Range</label>
                                <Select value={dateRange} onValueChange={setDateRange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                                        <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                                        <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                                        <SelectItem value="this-year">This Year</SelectItem>
                                        <SelectItem value="all-time">All Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleGenerateReport} className="flex-1">
                                <Calendar className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                            <Button onClick={handleExportReport} variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Types Info */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Approval History</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>
                                View a complete history of all projects you have reviewed, including approval and rejection decisions with timestamps and comments.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Pending Reviews</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>
                                List all projects currently awaiting your review, including submission dates and project details for efficient workload management.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>
                                Statistical summary of your supervisor activities, including total reviews, approval rate, average review time, and trends over time.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Project Status Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>
                                Detailed reports on approved or rejected projects, including reasons for rejection and follow-up actions taken by administrators.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Report Features (Coming Soon)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>
                            The report generation and export functionality is currently under development. Once implemented, you'll be able to:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Generate detailed PDF reports</li>
                            <li>Export data to CSV for analysis</li>
                            <li>Schedule automated report generation</li>
                            <li>Share reports with other administrators</li>
                            <li>View interactive charts and visualizations</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
