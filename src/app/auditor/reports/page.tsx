'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditorHeader } from '@/components/auditor-header'
import { translations, Language } from '@/lib/i18n'

export default function AuditorReportsPage() {
    const [language, setLanguage] = useState<Language>('en')

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') as Language
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
            setLanguage(savedLanguage)
        }
    }, [])

    const t = translations[language]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <AuditorHeader title={t.app.title} currentPage="reports" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">📊 Audit Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        Generate and view audit reports for compliance and verification
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reports Coming Soon</CardTitle>
                        <CardDescription>
                            This section will allow you to generate comprehensive audit reports
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Feature under development. You will be able to:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                            <li>Generate voting audit reports</li>
                            <li>View user activity reports</li>
                            <li>Export compliance documentation</li>
                            <li>Schedule automated reports</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
