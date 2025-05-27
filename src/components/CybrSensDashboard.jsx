"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RoleBasedNavigation } from "./RoleBasedNavigation"
import { EnhancedSecurityDashboard } from "./EnhancedSecurityDashboard"
import { OrganizationManagement } from "./OrganizationManagement"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase, getCurrentUser, getUserProfile } from "../lib/supabase"
import { Settings, AlertTriangle } from "lucide-react"

export function CybrSensDashboard() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [userSession, setUserSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const user = await getCurrentUser()

        if (!user) {
          setError("Please log in to access the dashboard")
          return
        }

        const userProfile = await getUserProfile(user.id)

        if (!userProfile) {
          setError("User profile not found")
          return
        }

        setUserSession({
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          organizationId: userProfile.organization_id,
          organizationName: userProfile.organizations?.name || "Unknown Organization",
        })

        // Update last login
        await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", userProfile.id)
      } catch (err) {
        console.error("Session initialization error:", err)
        setError(err.message || "Failed to initialize session")
      } finally {
        setLoading(false)
      }
    }

    initializeSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUserSession(null)
      } else if (event === "SIGNED_IN" && session) {
        initializeSession()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNavigation = (url) => {
    switch (url) {
      case "/dashboard":
        setCurrentView("dashboard")
        break
      case "/users":
      case "/org-settings":
        setCurrentView("org-management")
        break
      default:
        setCurrentView("dashboard")
    }
  }

  const renderCurrentView = () => {
    if (!userSession) return null

    switch (currentView) {
      case "dashboard":
        return (
          <EnhancedSecurityDashboard
            userRole={userSession.role}
            organizationId={userSession.organizationId}
            currentUserId={userSession.id}
          />
        )
      case "org-management":
        return userSession.role === "admin" ? (
          <OrganizationManagement
            organizationId={userSession.organizationId}
            currentUserRole="admin"
            currentUserId={userSession.id}
          />
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>You don't have permission to access organization management.</AlertDescription>
          </Alert>
        )
      default:
        return (
          <EnhancedSecurityDashboard
            userRole={userSession.role}
            organizationId={userSession.organizationId}
            currentUserId={userSession.id}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading CybrSens Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !userSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || "Authentication required"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <RoleBasedNavigation
          userRole={userSession.role}
          organizationName={userSession.organizationName}
          userName={userSession.name}
          onNavigate={handleNavigation}
        />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex items-center gap-2 flex-1">
              <h1 className="text-lg font-semibold">CybrSens Security Operations</h1>
              <span className="text-sm text-muted-foreground">• {userSession.organizationName}</span>
            </div>
            <div className="flex items-center gap-2">
              {userSession.role !== "viewer" && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              )}
              {userSession.role === "admin" && (
                <Button variant="outline" size="sm" onClick={() => setCurrentView("org-management")}>
                  Manage Org
                </Button>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{renderCurrentView()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
