'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Globe, Vote, LogOut } from 'lucide-react'
import { translations, Language } from '@/lib/i18n'

interface AppHeaderProps {
    title?: string
    showAuth?: boolean
    showLogout?: boolean
    showBackButton?: boolean
    backHref?: string
    backLabel?: string
}

export function AppHeader({
    title,
    showAuth = true,
    showLogout = false,
    showBackButton = false,
    backHref = '/',
    backLabel
}: AppHeaderProps) {
    const router = useRouter()
    const [language, setLanguage] = useState<Language>('en')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedLanguage = localStorage.getItem('language') as Language
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
            setLanguage(savedLanguage)
        }
    }, [])

    const handleLanguageChange = (newLanguage: Language) => {
        setLanguage(newLanguage)
        localStorage.setItem('language', newLanguage)
        // Trigger page re-render by dispatching a custom event
        window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }))
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/auth/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const t = translations[language]

    if (!mounted) {
        return (
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Vote className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-semibold">Loading...</h1>
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Vote className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <h1 className="text-xl font-semibold">
                                {title || t.app.title}
                            </h1>
                        </Link>
                        {showBackButton && backHref && (
                            <Link href={backHref}>
                                <Button variant="ghost" size="sm">
                                    ← {backLabel || t.common.back}
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Switcher */}
                        <ThemeSwitcher />

                        {/* Language Switcher */}
                        <Select value={language} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-[130px]">
                                <Globe className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="id">Bahasa</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Auth/Logout Button */}
                        {showLogout ? (
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                {t.nav.logout || 'Logout'}
                            </Button>
                        ) : showAuth ? (
                            <Link href="/auth/login">
                                <Button variant="outline">{t.auth.login}</Button>
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    )
}
