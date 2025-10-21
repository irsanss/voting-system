'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Globe, Shield, User, ChevronDown } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { translations, Language } from '@/lib/i18n'

interface AuditorHeaderProps {
    title?: string
    showBackButton?: boolean
    backHref?: string
    currentPage?: 'dashboard' | 'logs' | 'reports'
}

export function AuditorHeader({
    title = "Auditor Dashboard",
    showBackButton = false,
    backHref = '/dashboard',
    currentPage = 'dashboard'
}: AuditorHeaderProps) {
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

    const getUserInitials = () => {
        if (user?.name) {
            return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        }
        return user?.email?.[0]?.toUpperCase() || 'U'
    }

    const t = translations[language]

    if (!mounted) {
        return (
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-semibold">Loading...</h1>
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                {/* Second Row - Main Navigation */}
                <div className="flex justify-between items-center">
                    {/* Left Side - Logo/Title + Navigation Links */}
                    <div className="flex items-center gap-6">
                        <Link href="/auditor/dashboard" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-lg font-semibold">
                                {language === 'id' ? 'Sistem Pemilihan Apartemen' : 'Apartment Voting System'}
                            </h1>
                        </Link>

                        {/* Navigation Menu */}
                        <nav className="flex items-center gap-1 ml-4">
                            <Link href="/auditor/dashboard">
                                <Button
                                    variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="font-medium"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/auditor/logs">
                                <Button
                                    variant={currentPage === 'logs' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="font-medium"
                                >
                                    Audit Logs
                                </Button>
                            </Link>
                            <Link href="/auditor/reports">
                                <Button
                                    variant={currentPage === 'reports' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="font-medium"
                                >
                                    Reports
                                </Button>
                            </Link>
                        </nav>
                    </div>

                    {/* Right Side - Theme, Language, and User Profile */}
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

                        {/* User Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="max-w-[100px] truncate">
                                        {user?.name || user?.email || 'User'}
                                    </span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user?.name || 'User'}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                        <p className="text-xs text-muted-foreground">Role: {user?.role}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                    <span className="mr-2">→</span>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}
