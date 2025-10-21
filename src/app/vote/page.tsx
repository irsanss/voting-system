'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { translations, Language } from '@/lib/i18n'
import { Globe, Users, ArrowLeft, Vote, CheckCircle, AlertCircle, MapPin, Clock, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Candidate {
  id: string
  name: string
  photo?: string
  vision?: string
  mission?: string
  reason?: string
  isActive: boolean
  voteCount: number
}

interface VotingProject {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  isActive: boolean
  candidateCount: number
  voteCount: number
}

export default function VotePage() {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<VotingProject[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [deviceInfo, setDeviceInfo] = useState({ userAgent: '', ipAddress: '' })

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguage(savedLanguage)
    }
    fetchData()
    getLocation()
    getDeviceInfo()
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
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async (projectId: string) => {
    try {
      const response = await fetch(`/api/candidates?projectId=${projectId}&includeVoteCount=true`)
      if (response.ok) {
        const candidatesData = await response.json()
        setCandidates(candidatesData)
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
    }
  }

  const checkIfVoted = async (projectId: string) => {
    try {
      const response = await fetch(`/api/votes/check?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setHasVoted(data.hasVoted)
      }
    } catch (error) {
      console.error('Failed to check vote status:', error)
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }
  }

  const getDeviceInfo = async () => {
    setDeviceInfo({
      userAgent: navigator.userAgent,
      ipAddress: 'Unknown', // Will be set by server
    })
  }

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId)
    setSelectedCandidate('')
    setError('')
    setSuccess('')
    fetchCandidates(projectId)
    checkIfVoted(projectId)
  }

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate')
      return
    }

    setVoting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: selectedCandidate,
          projectId: selectedProject,
          location: userLocation,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(t.vote.voteSuccess)
        setHasVoted(true)
        // Update candidate vote count
        setCandidates(prev =>
          prev.map(c =>
            c.id === selectedCandidate
              ? { ...c, voteCount: c.voteCount + 1 }
              : c
          )
        )
      } else {
        setError(data.error || 'Voting failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setVoting(false)
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

  const selectedProjectData = projects.find(p => p.id === selectedProject)
  const isVotingOpen = selectedProjectData?.isActive &&
    new Date() >= new Date(selectedProjectData.startDate) &&
    new Date() <= new Date(selectedProjectData.endDate)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">
                  {t.app.title}
                </span>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.common.back}
          </Button>
        </Link>

        {/* Vote Header */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <Badge variant="secondary" className="mb-4">
            <Vote className="w-4 h-4 mr-2" />
            {t.vote.title}
          </Badge>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            {t.vote.title}
          </h2>
          <p className="text-xl text-slate-600">
            Cast your vote for the apartment leadership
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600">{t.common.loading}</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Project Selection */}
            {projects.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Select Voting Project</CardTitle>
                  <CardDescription>
                    Choose the election you want to participate in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedProject} onValueChange={handleProjectChange}>
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

                  {selectedProjectData && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>
                            {new Date(selectedProjectData.startDate).toLocaleDateString()} - {new Date(selectedProjectData.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span>{selectedProjectData.candidateCount} candidates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Vote className="w-4 h-4 text-slate-500" />
                          <span>{selectedProjectData.voteCount} votes cast</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isVotingOpen ? "default" : "secondary"}>
                            {isVotingOpen ? "Voting Open" : "Voting Closed"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Voting Status */}
            {hasVoted && (
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You have already voted in this election. Each voter can only vote once.
                </AlertDescription>
              </Alert>
            )}

            {!isVotingOpen && selectedProjectData && !hasVoted && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {new Date() < new Date(selectedProjectData.startDate)
                    ? t.vote.votingNotOpen
                    : t.vote.votingClosed}
                </AlertDescription>
              </Alert>
            )}

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Candidates Selection */}
            {selectedProject && candidates.length > 0 && !hasVoted && isVotingOpen && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.vote.selectCandidate}</CardTitle>
                  <CardDescription>
                    Review the candidates and select your preferred choice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                    <div className="space-y-4">
                      {candidates.map((candidate) => (
                        <div key={candidate.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-slate-50">
                          <RadioGroupItem value={candidate.id} id={candidate.id} />
                          <Label htmlFor={candidate.id} className="flex items-center space-x-4 cursor-pointer flex-1">
                            <div className="relative w-16 h-16">
                              {candidate.photo ? (
                                <Image
                                  src={candidate.photo}
                                  alt={candidate.name}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center">
                                  <Users className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{candidate.name}</h3>
                              {candidate.vision && (
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{candidate.vision}</p>
                              )}
                            </div>
                            <Badge variant="secondary">{candidate.voteCount} votes</Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Shield className="w-4 h-4" />
                      <span>Your vote is secure and anonymous</span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="lg" disabled={!selectedCandidate || voting}>
                          {voting ? t.common.loading : t.vote.confirmVote}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Your Vote</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to vote for this candidate? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-4">
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={handleVote} disabled={voting}>
                            {voting ? t.common.loading : 'Confirm Vote'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Information */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Voting Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>One vote per registered voter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Secure and encrypted voting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Location and device tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Anonymous vote counting</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600">
            <p>&copy; 2024 {t.app.title}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}