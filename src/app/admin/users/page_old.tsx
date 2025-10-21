'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AdminHeader } from "@/components/admin-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { UserPlus, Search, CheckCircle, XCircle, Key, Filter, Edit, Trash2, Shield } from "lucide-react"
import Link from "next/link"

interface User {
    id: string
    email: string
    name?: string
    phone?: string
    role: string
    apartmentUnit?: string
    apartmentSize?: number
    isActive: boolean
    isVerified: boolean
    verifiedBy?: string
    verifiedAt?: string
    createdAt: string
}

export default function ManageUsersPage() {
    const [activeTab, setActiveTab] = useState('voters')
    const [users, setUsers] = useState<User[]>([])
    const [systemUsers, setSystemUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [filteredSystemUsers, setFilteredSystemUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [systemSearchQuery, setSystemSearchQuery] = useState('')
    const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all')
    
    // System User Dialog
    const [showSystemUserDialog, setShowSystemUserDialog] = useState(false)
    const [editingSystemUser, setEditingSystemUser] = useState<User | null>(null)
    const [systemUserForm, setSystemUserForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'COMMITTEE',
        password: ''
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchUsers()
        fetchSystemUsers()
    }, [])

    useEffect(() => {
        filterUsers()
    }, [users, searchQuery, filterVerified])

    useEffect(() => {
        filterSystemUsers()
    }, [systemUsers, systemSearchQuery])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users?role=VOTER')
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSystemUsers = async () => {
        try {
            const response = await fetch('/api/admin/users?role=SYSTEM')
            if (response.ok) {
                const data = await response.json()
                setSystemUsers(data)
            }
        } catch (error) {
            console.error('Failed to fetch system users:', error)
        }
    }

    const filterUsers = () => {
        let filtered = users

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.apartmentUnit?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by verification status
        if (filterVerified === 'verified') {
            filtered = filtered.filter(user => user.isVerified)
        } else if (filterVerified === 'unverified') {
            filtered = filtered.filter(user => !user.isVerified)
        }

        setFilteredUsers(filtered)
    }

    const filterSystemUsers = () => {
        let filtered = systemUsers

        // Filter by search query
        if (systemSearchQuery) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(systemSearchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(systemSearchQuery.toLowerCase()) ||
                user.role.toLowerCase().includes(systemSearchQuery.toLowerCase())
            )
        }

        setFilteredSystemUsers(filtered)
    }

    const handleVerify = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: !currentStatus })
            })

            if (response.ok) {
                alert(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`)
                fetchUsers()
            } else {
                const error = await response.json()
                alert(`Failed: ${error.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to verify user:', error)
            alert('Failed to update verification status')
        }
    }

    const handleResetPassword = async (userId: string, email: string) => {
        if (!confirm(`Send password reset email to ${email}?`)) {
            return
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
                method: 'POST'
            })

            if (response.ok) {
                alert('Password reset link sent successfully')
            } else {
                const error = await response.json()
                alert(`Failed: ${error.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to reset password:', error)
            alert('Failed to send password reset')
        }
    }

    const handleOpenSystemUserDialog = (user?: User) => {
        if (user) {
            setEditingSystemUser(user)
            setSystemUserForm({
                name: user.name || '',
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                password: '' // Don't populate password for edit
            })
        } else {
            setEditingSystemUser(null)
            setSystemUserForm({
                name: '',
                email: '',
                phone: '',
                role: 'COMMITTEE',
                password: ''
            })
        }
        setShowSystemUserDialog(true)
    }

    const handleCloseSystemUserDialog = () => {
        setShowSystemUserDialog(false)
        setEditingSystemUser(null)
        setSystemUserForm({
            name: '',
            email: '',
            phone: '',
            role: 'COMMITTEE',
            password: ''
        })
    }

    const handleSubmitSystemUser = async () => {
        // Validation
        if (!systemUserForm.email || !systemUserForm.name) {
            alert('Please fill in all required fields (Name and Email)')
            return
        }

        if (!editingSystemUser && !systemUserForm.password) {
            alert('Password is required for new users')
            return
        }

        setSubmitting(true)
        try {
            const url = editingSystemUser 
                ? `/api/admin/users/${editingSystemUser.id}`
                : '/api/admin/users'
            
            const payload: any = {
                name: systemUserForm.name,
                email: systemUserForm.email,
                phone: systemUserForm.phone || null,
                role: systemUserForm.role,
                apartmentUnit: 'N/A', // System users don't have apartments
                apartmentSize: 0, // System users have 0 size
            }

            // Only include password if it's provided (new user or password change)
            if (systemUserForm.password) {
                payload.password = systemUserForm.password
            }

            const response = await fetch(url, {
                method: editingSystemUser ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                alert(editingSystemUser ? 'User updated successfully' : 'User created successfully')
                handleCloseSystemUserDialog()
                fetchSystemUsers()
            } else {
                const error = await response.json()
                alert(`Failed: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to save system user:', error)
            alert('Failed to save user. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteSystemUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                alert('User deleted successfully')
                fetchSystemUsers()
            } else {
                const error = await response.json()
                alert(`Failed: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to delete user:', error)
            alert('Failed to delete user')
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return 'bg-purple-100 text-purple-800'
            case 'COMMITTEE':
                return 'bg-blue-100 text-blue-800'
            case 'SUPERVISOR':
                return 'bg-green-100 text-green-800'
            case 'AUDITOR':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return 'Super Admin'
            case 'COMMITTEE':
                return 'Committee'
            case 'SUPERVISOR':
                return 'Supervisor'
            case 'AUDITOR':
                return 'Auditor'
            default:
                return role
        }
    }

    const stats = {
        total: users.length,
        verified: users.filter(u => u.isVerified).length,
        unverified: users.filter(u => !u.isVerified).length,
        totalArea: users.reduce((sum, u) => sum + (u.apartmentSize || 0), 0)
    }

    const systemStats = {
        total: systemUsers.length,
        committee: systemUsers.filter(u => u.role === 'COMMITTEE').length,
        supervisors: systemUsers.filter(u => u.role === 'SUPERVISOR').length,
        admins: systemUsers.filter(u => u.role === 'SUPERADMIN').length,
    }

    if (loading) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    return (
        <>
            <AdminHeader title="Manage Users" showBackButton backHref="/admin/dashboard" currentPage="users" />
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="voters">
                            <Shield className="h-4 w-4 mr-2" />
                            Voters ({users.length})
                        </TabsTrigger>
                        <TabsTrigger value="system">
                            <UserPlus className="h-4 w-4 mr-2" />
                            System Users ({systemUsers.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* VOTERS TAB */}
                    <TabsContent value="voters">

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-muted-foreground mt-1">
                                View and manage all voter profiles and verification status
                            </p>
                        </div>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add New Voter
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Voters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Verified
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.unverified}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Area (m²)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalArea.toFixed(1)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex-1 w-full sm:max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, email, or unit..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={filterVerified === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterVerified('all')}
                                >
                                    All
                                </Button>
                                <Button
                                    variant={filterVerified === 'verified' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterVerified('verified')}
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verified
                                </Button>
                                <Button
                                    variant={filterVerified === 'unverified' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterVerified('unverified')}
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Unverified
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            All Voters ({filteredUsers.length})
                        </CardTitle>
                        <CardDescription>
                            Complete list of registered voters with their details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Area (m²)</TableHead>
                                        <TableHead>Verified</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                {searchQuery || filterVerified !== 'all'
                                                    ? 'No voters match your filters'
                                                    : 'No voters registered yet'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    {user.name || '-'}
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.phone || '-'}</TableCell>
                                                <TableCell>{user.apartmentUnit || '-'}</TableCell>
                                                <TableCell>
                                                    {user.apartmentSize ? user.apartmentSize.toFixed(1) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={user.isVerified ? 'default' : 'secondary'}
                                                        className={user.isVerified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                                                    >
                                                        {user.isVerified ? (
                                                            <>
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Verified
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Pending
                                                            </>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(user.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleVerify(user.id, user.isVerified)}
                                                            title={user.isVerified ? 'Mark as unverified' : 'Verify voter'}
                                                        >
                                                            {user.isVerified ? (
                                                                <XCircle className="h-4 w-4" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleResetPassword(user.id, user.email)}
                                                            title="Reset password"
                                                        >
                                                            <Key className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
