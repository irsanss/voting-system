'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { translations, Language } from '@/lib/i18n'
import { Globe, Users, ArrowLeft, Calendar, MapPin, Play, Image as ImageIcon, Users2, Target, Lightbulb } from 'lucide-react'
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
  user: {
    email: string
    apartmentUnit?: string
    apartmentSize?: number
  }
}

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguage(savedLanguage)
    }
    if (params.id) {
      fetchCandidate(params.id as string)
    }
  }, [params.id])

  const fetchCandidate = async (id: string) => {
    try {
      const response = await fetch(`/api/candidates/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCandidate(data)
      } else {
        router.push('/candidates')
      }
    } catch (error) {
      console.error('Failed to fetch candidate:', error)
      router.push('/candidates')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Candidate Not Found</h3>
          <Link href="/candidates">
            <Button>{t.common.back} to Candidates</Button>
          </Link>
        </div>
      </div>
    )
  }

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

      {/* Back Navigation */}
      <section className="container mx-auto px-4 py-6">
        <Link href="/candidates">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.common.back} to Candidates
          </Button>
        </Link>
      </section>

      {/* Candidate Header */}
      <section className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="relative w-32 h-32 mx-auto mb-6">
                {candidate.photo ? (
                  <Image
                    src={candidate.photo}
                    alt={candidate.name}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-slate-400" />
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl mb-2">{candidate.name}</CardTitle>
              <CardDescription className="text-lg">
                Candidate for Apartment Head
              </CardDescription>
              <div className="flex justify-center gap-3 mt-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {candidate.voteCount} votes
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {candidate.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Candidate Details */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="vision" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vision" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Vision & Mission
              </TabsTrigger>
              <TabsTrigger value="why" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Why Choose Me
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users2 className="w-4 h-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Media
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vision" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      {t.candidate.vision}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">
                      {candidate.vision || 'No vision statement provided.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      {t.candidate.mission}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">
                      {candidate.mission || 'No mission statement provided.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="why" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    {t.candidate.whyChoose}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">
                    {candidate.reason || 'No reason provided.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users2 className="w-5 h-5 text-purple-600" />
                    {t.candidate.team}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {candidate.teamMembers && candidate.teamMembers.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {candidate.teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{member}</p>
                            <p className="text-sm text-slate-600">Team Member</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600">No team members listed.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="mt-6">
              <div className="space-y-6">
                {/* Images */}
                {candidate.images && candidate.images.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                        {t.candidate.photos}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {candidate.images.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`${candidate.name} - Photo ${index + 1}`}
                              fill
                              className="object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Videos */}
                {candidate.videos && candidate.videos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-red-600" />
                        {t.candidate.videos}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {candidate.videos.map((video, index) => (
                          <div key={index} className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                            <video
                              controls
                              className="w-full h-full"
                              poster="/video-poster.jpg"
                            >
                              <source src={video} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!candidate.images?.length && !candidate.videos?.length && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No media available.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
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