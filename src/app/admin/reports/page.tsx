'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"

export default function ManageReportsPage() {
    return (
        <>
            <AdminHeader title="Generate & Audit Reports" showBackButton backHref="/admin/dashboard" currentPage="reports" />
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground mt-1">
                            Generate, view, and approve voting reports
                        </p>
                    </div>
                    <Button>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Voting Reports & Audit Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Reports and audit log interface coming soon...
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
