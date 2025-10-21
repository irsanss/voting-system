'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Globe, Shield, User, ChevronDown, Languages } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { translations, Language } from '@/lib/i18n'

interface CandidateHeaderProps {
    title?: string
    showBackButton?: boolean
    backHref?: string
    currentPage?: 'dashboard' | 'campaigns'
}

export function CandidateHeader({
    title,
    showBackButton = true,
    backHref = '/candidate/dashboard',
    currentPage = 'dashboard'
}: CandidateHeaderProps) {
    const router = useRouter()
    const [language, setLanguage] = useState<Language>('en')
    const [mounted, setMounted] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        setMounted(true)
        const savedLanguage = localStorage.getItem('language') as Language
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
            setLanguage(savedLanguage)
        }

        // Fetch user info
        fetchUser()
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
        }
    }

    const handleLanguageChange = (newLanguage: Language) => {
        setLanguage(newLanguage)
        localStorage.setItem('language', newLanguage)
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

    const getUserInitials = () => {
        if (user?.name) {
            return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        }
        return user?.email?.[0]?.toUpperCase() || 'C'
    }

    const t = translations[language]

    if (!mounted) {
        return null
    }

    return (
        <header className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Single row with logo, navigation, and user controls */}
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo and Title */}
                    <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">
                            {language === 'id' ? 'Sistem Pemilihan Apartemen' : 'Apartment Voting System'}
                        </span>
                    </div>

                    {/* Center: Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        <Button
                            variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => router.push('/candidate/dashboard')}
                            className="gap-2"
                        >
                            Dashboard
                        </Button>
                    </nav>

                    {/* Right: Theme, Language, User Profile */}
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-1">
                                    <Languages className="h-4 w-4" />
                                    <span className="text-sm">{language === 'en' ? 'EN' : 'ID'}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                                    English
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleLanguageChange('id')}>
                                    Bahasa Indonesia
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Profile Dropdown */}
                        {mounted && user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <Avatar className="h-7 w-7">
                                            <AvatarFallback className="text-xs">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex items-center gap-2 p-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <div className="p-2">
                                        <p className="text-xs text-muted-foreground">
                                            Role: {user.role}
                                        </p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                            />
                                        </svg>
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
