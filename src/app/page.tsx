'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { translations, Language } from '@/lib/i18n'
import { Globe, Users, Vote, BarChart3, ArrowRight, History, Clock, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ShareButton } from '@/components/share-button'
import { VotingProjectCard } from '@/components/voting-project-card'

interface VotingProject {
  id: string
  title: string
  description?: string
  votingType: string
  startDate: string
  endDate: string
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED'
  candidateCount: number
  voteCount?: number
  candidates?: Array<{
    id: string
    name: string
    photo?: string
  }>
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<VotingProject[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguage(savedLanguage)
    }

    // Check authentication
    checkAuth()

    // Fetch voting projects
    fetchProjects()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects?includeUnpublished=false')
      if (response.ok) {
        const data = await response.json()
        // Filter out ended projects from main view
        const activeProjects = data.filter((project: VotingProject) =>
          project.status !== 'ENDED'
        )
        setProjects(activeProjects)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/'
    }
  }

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/auth/login'

    switch (user.role) {
      case 'SUPERADMIN':
      case 'COMMITTEE':
        return '/admin/dashboard'
      case 'CANDIDATE':
        return '/candidate/dashboard'
      case 'AUDITOR':
        return '/auditor/dashboard'
      case 'SUPERVISOR':
        return '/supervisor/dashboard'
      case 'VOTER':
      default:
        return '/dashboard'
    }
  }

  const t = translations[language]

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">{t.app.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Bahasa</SelectItem>
              </SelectContent>
            </Select>

            <ShareButton />

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {user.name || user.email}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline">{t.auth.login}</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            {t.app.subtitle}
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            {t.home.welcome}
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            {t.home.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href={getDashboardUrl()}>
                <Button size="lg" className="w-full sm:w-auto">
                  {t.dashboard.title}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  {t.home.getStarted}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
            <Link href="/voting-history">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Active Voting Projects */}
      {!loading && projects.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Active Voting Projects
            </h3>
            <p className="text-lg text-slate-600">
              Participate in ongoing and upcoming voting initiatives
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {projects.map((project) => (
              <VotingProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Loading state */}
      {loading && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading voting projects...</p>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              No Active Voting Projects
            </h3>
            <p className="text-slate-600 mb-6">
              There are currently no active or upcoming voting projects. Check back later!
            </p>
            <Link href="/voting-history">
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" />
                View Past Elections
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>View Options</CardTitle>
              <CardDescription>
                Learn about different voting options and candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/candidates">
                <Button variant="ghost" className="w-full justify-between">
                  Explore Options
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Vote className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>{t.vote.title}</CardTitle>
              <CardDescription>
                Cast your vote securely and conveniently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vote">
                <Button variant="ghost" className="w-full justify-between">
                  {t.home.castVote}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>{t.dashboard.title}</CardTitle>
              <CardDescription>
                View real-time election results and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={getDashboardUrl()}>
                <Button variant="ghost" className="w-full justify-between">
                  {t.home.viewResults}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600">
            <p>&copy; 2025 {t.app.title}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}