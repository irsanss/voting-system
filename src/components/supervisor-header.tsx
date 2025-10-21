'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, LogOut, User, Moon, Sun, Globe, ChevronDown } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

// Theme colors
const themes = [
    { name: 'Light', value: 'light', hue: null },
    { name: 'Dark', value: 'dark', hue: null },
    { name: 'Sage Green', value: 'sage-green', hue: 145 },
    { name: 'Blue Beach', value: 'blue-beach', hue: 220 },
    { name: 'Rose Pink', value: 'rose-pink', hue: 350 },
]

// Language options
type Language = 'en' | 'id'

const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'id' as Language, name: 'Bahasa Indonesia', flag: '🇮🇩' },
]

interface SupervisorHeaderProps {
    currentPage?: 'dashboard' | 'projects' | 'reports'
}

export default function SupervisorHeader({ currentPage = 'dashboard' }: SupervisorHeaderProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [language, setLanguage] = useState<Language>('en')
    const [userName, setUserName] = useState<string>('Supervisor')
    const [mounted, setMounted] = useState(false)

    // Load language from localStorage
    useEffect(() => {
        setMounted(true)
        const savedLanguage = localStorage.getItem('language') as Language
        if (savedLanguage && languages.find((l) => l.code === savedLanguage)) {
            setLanguage(savedLanguage)
        }
    }, [])

    // Fetch user data
    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch('/api/auth/me')
                if (response.ok) {
                    const data = await response.json()
                    setUserName(data.user.name || 'Supervisor')
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error)
            }
        }
        fetchUserData()
    }, [])

    const handleLanguageChange = (code: Language) => {
        setLanguage(code)
        localStorage.setItem('language', code)
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const isActive = (page: string) => {
        if (page === 'dashboard') return pathname === '/supervisor/dashboard'
        return pathname.startsWith(`/supervisor/${page}`)
    }

    const translations = {
        en: {
            dashboard: 'Dashboard',
            projects: 'Projects',
            reports: 'Reports',
            profile: 'Profile',
            logout: 'Logout',
            theme: 'Theme',
            language: 'Language',
        },
        id: {
            dashboard: 'Dasbor',
            projects: 'Proyek',
            reports: 'Laporan',
            profile: 'Profil',
            logout: 'Keluar',
            theme: 'Tema',
            language: 'Bahasa',
        },
    }

    const t = translations[language]

    if (!mounted) {
        return null
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4">
                {/* Logo and Brand */}
                <Link href="/supervisor/dashboard" className="flex items-center space-x-2 mr-6">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="hidden font-bold sm:inline-block">Supervisor Panel</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
                    <Link
                        href="/supervisor/dashboard"
                        className={`transition-colors hover:text-foreground/80 ${isActive('dashboard') ? 'text-foreground' : 'text-foreground/60'
                            }`}
                    >
                        {t.dashboard}
                    </Link>
                    <Link
                        href="/supervisor/projects"
                        className={`transition-colors hover:text-foreground/80 ${isActive('projects') ? 'text-foreground' : 'text-foreground/60'
                            }`}
                    >
                        {t.projects}
                    </Link>
                    <Link
                        href="/supervisor/reports"
                        className={`transition-colors hover:text-foreground/80 ${isActive('reports') ? 'text-foreground' : 'text-foreground/60'
                            }`}
                    >
                        {t.reports}
                    </Link>
                </nav>

                {/* Theme Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">{t.theme}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {themes.map((t) => (
                            <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)}>
                                <div className="flex items-center">
                                    <div
                                        className="mr-2 h-4 w-4 rounded-full border"
                                        style={{
                                            backgroundColor: t.hue
                                                ? `oklch(0.7 0.15 ${t.hue})`
                                                : t.value === 'dark'
                                                    ? '#1a1a1a'
                                                    : '#ffffff',
                                        }}
                                    />
                                    {t.name}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Language Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Globe className="h-5 w-5" />
                            <span className="sr-only">{t.language}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {languages.map((lang) => (
                            <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
                                <span className="mr-2">{lang.flag}</span>
                                {lang.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span className="hidden sm:inline-block">{userName}</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="flex items-center cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>{t.profile}</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{t.logout}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
