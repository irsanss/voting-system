'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { translations, Language } from '@/lib/i18n'
import { Globe, Users, Eye, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Candidate {
  id: string
  name: string
  photo?: string
  vision?: string
  mission?: string
  reason?: string
  teamMembers?: string[]
  images?: string[]
  videos?: string[]
  isActive: boolean
  createdAt: string
  voteCount: number
}

export default function CandidatesPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguage(savedLanguage)
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch projects
      const projectsResponse = await fetch('/api/projects')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0].id)
        }
      }

      // Fetch candidates
      const candidatesResponse = await fetch('/api/candidates')
      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json()
        setCandidates(candidatesData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const t = translations[language]

  if (!mounted) {
    return null
  }

  const activeCandidates = candidates.filter(c => c.isActive)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">{t.app.title}</h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
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
            
            <Link href="/auth/login">
              <Button variant="outline">{t.auth.login}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            {t.app.subtitle}
          </Badge>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            {t.candidate.title}
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Meet the candidates running for apartment leadership
          </p>
        </div>
      </section>

      {/* Project Selector */}
      {projects.length > 0 && (
        <section className="container mx-auto px-4 pb-8">
          <div className="max-w-md mx-auto">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select voting project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>
      )}

      {/* Candidates Grid */}
      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600">{t.common.loading}</p>
          </div>
        ) : activeCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Candidates Yet</h3>
            <p className="text-slate-600">Candidates will appear here once they are registered.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {activeCandidates.map((candidate) => (
              <Card key={candidate.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {candidate.photo ? (
                      <Image
                        src={candidate.photo}
                        alt={candidate.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl">{candidate.name}</CardTitle>
                  <CardDescription>
                    Candidate for Apartment Head
                  </CardDescription>
                  <div className="flex justify-center gap-2 mt-2">
                    <Badge variant="secondary">{candidate.voteCount} votes</Badge>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {candidate.vision && (
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-1">{t.candidate.vision}</h4>
                      <p className="text-sm text-slate-600 line-clamp-3">{candidate.vision}</p>
                    </div>
                  )}
                  
                  {candidate.mission && (
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-1">{t.candidate.mission}</h4>
                      <p className="text-sm text-slate-600 line-clamp-3">{candidate.mission}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Link href={`/candidates/${candidate.id}`}>
                    <Button className="w-full group-hover:bg-primary/90">
                      <Eye className="w-4 h-4 mr-2" />
                      {t.common.view} Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600">
            <p>&copy; 2024 {t.app.title}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}