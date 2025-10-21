'use client'

import { CandidateHeader } from '@/components/candidate-header'

export default function CandidateCampaignsPage() {
    return (
        <div className="min-h-screen bg-background">
            <CandidateHeader currentPage="campaigns" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-3xl font-bold mb-4">My Campaigns</h1>
                <p className="text-muted-foreground">Manage all your campaign materials and history here.</p>
            </div>
        </div>
    )
}
