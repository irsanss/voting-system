'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

interface UserHeaderProps {
    title?: string
    navLinks?: Array<{ href: string; label: string }>
}

export function UserHeader({ title = 'Voting System', navLinks = [] }: UserHeaderProps) {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    // Get dashboard URL based on role
    const getDashboardUrl = () => {
        if (!user) return '/dashboard'

        switch (user.role) {
            case 'SUPERADMIN':
            case 'COMMITTEE':
                return '/admin/dashboard'
            case 'CANDIDATE':
                return '/candidate/dashboard'
            case 'AUDITOR':
                return '/auditor/dashboard'
            case 'VOTER':
            default:
                return '/dashboard'
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return 'bg-purple-50 text-purple-700 ring-purple-700/10'
            case 'COMMITTEE':
                return 'bg-blue-50 text-blue-700 ring-blue-700/10'
            case 'CANDIDATE':
                return 'bg-green-50 text-green-700 ring-green-700/10'
            case 'AUDITOR':
                return 'bg-orange-50 text-orange-700 ring-orange-700/10'
            case 'VOTER':
                return 'bg-gray-50 text-gray-700 ring-gray-700/10'
            default:
                return 'bg-gray-50 text-gray-700 ring-gray-700/10'
        }
    }

    if (loading) {
        return (
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="font-semibold">{title}</div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                </div>
            </header>
        )
    }

    const initial = user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href={getDashboardUrl()} className="flex items-center gap-2">
                        <div className="font-semibold text-lg">{title}</div>
                    </Link>
                    {navLinks.length > 0 && (
                        <nav className="hidden md:flex items-center gap-4 text-sm">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{initial.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground mt-1">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={getDashboardUrl()}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    )
}
