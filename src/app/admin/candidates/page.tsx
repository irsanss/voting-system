'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"

export default function ManageCandidatesPage() {
  return (
    <>
      <AdminHeader title="Manage Candidates" showBackButton backHref="/admin/dashboard" currentPage="projects" />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground mt-1">
              Oversee candidate profiles and their project involvement
            </p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Candidate
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Candidate management interface coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
