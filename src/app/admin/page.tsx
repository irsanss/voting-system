'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { translations, Language } from '@/lib/i18n'
import { Globe, Users, ArrowLeft, Settings, FileText, Upload, Download, Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name?: string
  role: string
  apartmentUnit?: string
  apartmentSize?: number
  isActive: boolean
  createdAt: string
}

interface Project {
  id: string
  title: string
  description?: string
  votingType: string
  votingMethod: string
  totalArea?: number
  startDate: string
  endDate: string
  isActive: boolean
  candidateCount: number
  voteCount: number
}

interface Report {
  id: string
  projectId: string
  generatedBy: string
  notes?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
}

export default function AdminPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [activeTab, setActiveTab] = useState('projects')

  // Form states
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    votingType: 'HEAD_OF_APARTMENT',
    votingMethod: 'ONE_PERSON_ONE_VOTE',
    totalArea: '',
    startDate: '',
    endDate: '',
    isActive: false,
  })
  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    role: 'VOTER',
    apartmentUnit: '',
    apartmentSize: '',
    isActive: true,
  })

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguage(savedLanguage)
    }
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setSession(userData)
        if (userData.role !== 'SUPERADMIN' && userData.role !== 'COMMITTEE') {
          window.location.href = '/dashboard'
          return
        }
        fetchData()
      } else {
        window.location.href = '/auth/login'
      }
    } catch (error) {
      window.location.href = '/auth/login'
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Fetch projects
      const projectsResponse = await fetch('/api/projects?showAll=true')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)
      }

      // Fetch reports
      const reportsResponse = await fetch('/api/reports')
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    }
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const handleCreateProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectForm),
      })

      if (response.ok) {
        setShowProjectDialog(false)
        setProjectForm({
          title: '',
          description: '',
          votingType: 'HEAD_OF_APARTMENT',
          votingMethod: 'ONE_PERSON_ONE_VOTE',
          totalArea: '',
          startDate: '',
          endDate: '',
          isActive: false,
        })
        fetchData()
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userForm,
          password: 'changeme123', // Default password
        }),
      })

      if (response.ok) {
        setShowUserDialog(false)
        setUserForm({
          email: '',
          name: '',
          role: 'VOTER',
          apartmentUnit: '',
          apartmentSize: '',
          isActive: true,
        })
        fetchData()
      }
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleToggleProjectStatus = async (projectId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
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

  if (!session) {
    return null
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
            <Badge variant="outline">
              {session.role}
            </Badge>
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
            
            <Link href="/auth/logout">
              <Button variant="outline">{t.auth.logout}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.common.back} to Dashboard
          </Button>
        </Link>

        {/* Admin Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            <Settings className="w-4 h-4 mr-2" />
            {t.admin.title}
          </Badge>
          <h2 className="text-4xl font-bold text-slate-900 mb-2">
            {t.admin.title}
          </h2>
          <p className="text-xl text-slate-600">
            Manage voting projects, users, and reports
          </p>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Voting Projects</CardTitle>
                    <CardDescription>Manage voting projects and elections</CardDescription>
                  </div>
                  <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                          Set up a new voting project or election
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={projectForm.title}
                            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                            placeholder="Project title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={projectForm.description}
                            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                            placeholder="Project description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="votingType">Voting Type</Label>
                          <Select value={projectForm.votingType} onValueChange={(value) => setProjectForm({ ...projectForm, votingType: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select voting type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HEAD_OF_APARTMENT">Head of Apartment Election</SelectItem>
                              <SelectItem value="POLICY">Policy Voting</SelectItem>
                              <SelectItem value="ACTION_PLAN">Action Plan Voting</SelectItem>
                              <SelectItem value="SURVEY">Survey Voting</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="votingMethod">Voting Method</Label>
                          <Select value={projectForm.votingMethod} onValueChange={(value) => setProjectForm({ ...projectForm, votingMethod: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select voting method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ONE_PERSON_ONE_VOTE">One Person, One Vote</SelectItem>
                              <SelectItem value="WEIGHTED_BY_SIZE_MANUAL">Weighted by Apartment Size (Manual Total)</SelectItem>
                              <SelectItem value="WEIGHTED_BY_SIZE_VOTERS">Weighted by Apartment Size (Voters Total)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {projectForm.votingMethod === 'WEIGHTED_BY_SIZE_MANUAL' && (
                          <div>
                            <Label htmlFor="totalArea">Total Area (sq meters)</Label>
                            <Input
                              id="totalArea"
                              type="number"
                              step="0.01"
                              value={projectForm.totalArea}
                              onChange={(e) => setProjectForm({ ...projectForm, totalArea: e.target.value })}
                              placeholder="Enter total apartment complex area"
                            />
                            <p className="text-sm text-slate-500 mt-1">
                              Total area of all apartment units in the complex
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="datetime-local"
                              value={projectForm.startDate}
                              onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="datetime-local"
                              value={projectForm.endDate}
                              onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-4">
                          <Button variant="outline" onClick={() => setShowProjectDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateProject}>
                            Create Project
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-slate-600">{project.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {project.votingType?.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {project.votingMethod?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span>{project.candidateCount} candidates</span>
                          <span>{project.voteCount} votes</span>
                          {project.totalArea && <span>{project.totalArea}m² total area</span>}
                          <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={project.isActive ? "default" : "secondary"}>
                          {project.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleProjectStatus(project.id, !project.isActive)}
                        >
                          {project.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                          Add a new user to the system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userForm.email}
                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                            placeholder="user@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={userForm.name}
                            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                            placeholder="User name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VOTER">Voter</SelectItem>
                              <SelectItem value="CANDIDATE">Candidate</SelectItem>
                              <SelectItem value="COMMITTEE">Committee</SelectItem>
                              <SelectItem value="AUDITOR">Auditor</SelectItem>
                              <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="apartmentUnit">Apartment Unit</Label>
                            <Input
                              id="apartmentUnit"
                              value={userForm.apartmentUnit}
                              onChange={(e) => setUserForm({ ...userForm, apartmentUnit: e.target.value })}
                              placeholder="A-101"
                            />
                          </div>
                          <div>
                            <Label htmlFor="apartmentSize">Size (m²)</Label>
                            <Input
                              id="apartmentSize"
                              type="number"
                              value={userForm.apartmentSize}
                              onChange={(e) => setUserForm({ ...userForm, apartmentSize: e.target.value })}
                              placeholder="85.5"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-4">
                          <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateUser}>
                            Create User
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.name || user.email}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <Badge variant="outline">{user.role}</Badge>
                          {user.apartmentUnit && <span>Unit: {user.apartmentUnit}</span>}
                          {user.apartmentSize && <span>Size: {user.apartmentSize}m²</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Exports</CardTitle>
                <CardDescription>Generate and download voting reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Report #{report.id.slice(-8)}</h3>
                        <p className="text-sm text-slate-600">
                          Generated on {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                        {report.notes && (
                          <p className="text-sm text-slate-500 mt-1">Notes: {report.notes}</p>
                        )}
                        {report.approvedAt && (
                          <p className="text-sm text-green-600 mt-1">
                            Approved on {new Date(report.approvedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={report.approvedAt ? "default" : "secondary"}>
                          {report.approvedAt ? "Approved" : "Pending"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Voters</CardTitle>
                <CardDescription>Import voter database from CSV file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Download Template</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Download the CSV template to format your voter data correctly.
                    </p>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Upload CSV File</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Upload a CSV file with voter information. Required columns: email, name
                    </p>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Drop CSV file here or click to browse</p>
                      <Button variant="outline">Choose File</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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