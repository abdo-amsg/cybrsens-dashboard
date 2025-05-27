"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Mail,
  Trash2,
  Building,
  Key,
  Database,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { useOrganization } from "../hooks/useOrganization"

export function OrganizationManagement({ organizationId, currentUserRole, currentUserId }) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("viewer")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const { organization, users, loading, error, inviteUser, updateUserRole, removeUser, updateOrganization, refresh } =
    useOrganization(organizationId)

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return

    try {
      setIsInviting(true)
      await inviteUser(inviteEmail, inviteRole, currentUserId)
      setInviteEmail("")
      setInviteDialogOpen(false)
    } catch (err) {
      console.error("Failed to invite user:", err)
      alert("Failed to invite user: " + err.message)
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole, currentUserId)
    } catch (err) {
      console.error("Failed to update user role:", err)
      alert("Failed to update user role: " + err.message)
    }
  }

  const handleRemoveUser = async (userId) => {
    if (userId === currentUserId) {
      alert("You cannot remove yourself from the organization")
      return
    }

    if (confirm("Are you sure you want to remove this user?")) {
      try {
        await removeUser(userId, currentUserId)
      } catch (err) {
        console.error("Failed to remove user:", err)
        alert("Failed to remove user: " + err.message)
      }
    }
  }

  const handleUpdateOrganization = async (field, value) => {
    try {
      const updates = {}
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        updates[parent] = {
          ...organization?.[parent],
          [child]: value,
        }
      } else {
        updates[field] = value
      }

      await updateOrganization(updates)
    } catch (err) {
      console.error("Failed to update organization:", err)
      alert("Failed to update organization: " + err.message)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "default"
      case "analyst":
        return "secondary"
      case "viewer":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "default"
      case "pending":
        return "secondary"
      case "inactive":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load organization data: {error}
          <Button variant="outline" size="sm" onClick={refresh} className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Management
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Manage users, roles, and organization settings for your cybersecurity operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="data">
                <Database className="h-4 w-4 mr-2" />
                Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Team Members</h3>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your organization's cybersecurity team
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="user@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                            <SelectItem value="analyst">Analyst - Data entry and analysis</SelectItem>
                            <SelectItem value="admin">Admin - Full management access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleInviteUser} className="w-full" disabled={isInviting}>
                        {isInviting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4 mr-2" />
                        )}
                        {isInviting ? "Sending..." : "Send Invitation"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="ml-auto space-x-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                            disabled={user.id === currentUserId}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="analyst">Analyst</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(user.status)}>{user.status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveUser(user.id)}
                              disabled={user.id === currentUserId}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : organization ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      defaultValue={organization.name}
                      onBlur={(e) => handleUpdateOrganization("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Email Domain</Label>
                    <Input
                      id="domain"
                      defaultValue={organization.domain}
                      onBlur={(e) => handleUpdateOrganization("domain", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      defaultValue={organization.settings?.timezone || "UTC"}
                      onValueChange={(value) => handleUpdateOrganization("settings.timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retention">Data Retention (Days)</Label>
                    <Input
                      id="retention"
                      type="number"
                      defaultValue={organization.settings?.data_retention_days || 365}
                      onBlur={(e) =>
                        handleUpdateOrganization("settings.data_retention_days", Number.parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : organization ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Security Policies</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (Minutes)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        defaultValue={organization.settings?.session_timeout_minutes || 30}
                        onBlur={(e) =>
                          handleUpdateOrganization("settings.session_timeout_minutes", Number.parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-policy">Password Policy</Label>
                      <Select
                        defaultValue={organization.settings?.password_policy || "strong"}
                        onValueChange={(value) => handleUpdateOrganization("settings.password_policy", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="strong">Strong</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key Management</Label>
                    <div className="flex gap-2">
                      <Input id="api-key" value="sk-..." readOnly />
                      <Button variant="outline">
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Data Management</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Storage Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2.4 GB</div>
                      <div className="text-xs text-muted-foreground">of 10 GB used</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</div>
                      <div className="text-xs text-muted-foreground">active team members</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2">
                  <Label>Data Export</Label>
                  <div className="flex gap-2">
                    <Button variant="outline">Export Logs</Button>
                    <Button variant="outline">Export KPIs</Button>
                    <Button variant="outline">Export Reports</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
