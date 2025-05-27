"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  BarChart3,
  FileText,
  Settings,
  Users,
  Database,
  AlertTriangle,
  Activity,
  Upload,
  Download,
  Eye,
  Edit,
  Crown,
} from "lucide-react"

const navigationItems = [
  {
    title: "Security Dashboard",
    icon: Shield,
    url: "/dashboard",
    roles: ["viewer", "analyst", "admin"],
  },
  {
    title: "Threat Analysis",
    icon: AlertTriangle,
    url: "/threats",
    roles: ["viewer", "analyst", "admin"],
    badge: "3",
  },
  {
    title: "Log Visualizer",
    icon: BarChart3,
    url: "/logs",
    roles: ["viewer", "analyst", "admin"],
  },
  {
    title: "Data Upload",
    icon: Upload,
    url: "/upload",
    roles: ["analyst", "admin"],
  },
  {
    title: "KPI Management",
    icon: Activity,
    url: "/kpis",
    roles: ["analyst", "admin"],
  },
  {
    title: "Reports",
    icon: FileText,
    url: "/reports",
    roles: ["viewer", "analyst", "admin"],
  },
  {
    title: "User Management",
    icon: Users,
    url: "/users",
    roles: ["admin"],
  },
  {
    title: "Organization Settings",
    icon: Settings,
    url: "/org-settings",
    roles: ["admin"],
  },
  {
    title: "Data Sources",
    icon: Database,
    url: "/data-sources",
    roles: ["analyst", "admin"],
  },
]

export function RoleBasedNavigation({ userRole, organizationName, userName, onNavigate }) {
  const [activeItem, setActiveItem] = useState("/dashboard")

  const filteredItems = navigationItems.filter((item) => item.roles.includes(userRole))

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4" />
      case "analyst":
        return <Edit className="h-4 w-4" />
      case "viewer":
        return <Eye className="h-4 w-4" />
      default:
        return null
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

  const handleNavigation = (url) => {
    setActiveItem(url)
    if (onNavigate) {
      onNavigate(url)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">CybrSens</h2>
          <div className="text-sm text-muted-foreground">{organizationName}</div>
          <Badge variant={getRoleColor(userRole)} className="w-fit">
            {getRoleIcon(userRole)}
            <span className="ml-1">{userRole.toUpperCase()}</span>
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Security Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems
                .filter((item) => ["Security Dashboard", "Threat Analysis", "Log Visualizer"].includes(item.title))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeItem === item.url}
                      onClick={() => handleNavigation(item.url)}
                    >
                      <a href="#" className="flex items-center justify-between">
                        <div className="flex items-center">
                          <item.icon className="h-4 w-4" />
                          <span className="ml-2">{item.title}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="destructive" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(userRole === "analyst" || userRole === "admin") && (
          <SidebarGroup>
            <SidebarGroupLabel>Data Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems
                  .filter((item) => ["Data Upload", "KPI Management", "Data Sources"].includes(item.title))
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={activeItem === item.url}
                        onClick={() => handleNavigation(item.url)}
                      >
                        <a href="#">
                          <item.icon className="h-4 w-4" />
                          <span className="ml-2">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Reports & Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems
                .filter((item) => ["Reports"].includes(item.title))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeItem === item.url}
                      onClick={() => handleNavigation(item.url)}
                    >
                      <a href="#">
                        <item.icon className="h-4 w-4" />
                        <span className="ml-2">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems
                  .filter((item) => ["User Management", "Organization Settings"].includes(item.title))
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={activeItem === item.url}
                        onClick={() => handleNavigation(item.url)}
                      >
                        <a href="#">
                          <item.icon className="h-4 w-4" />
                          <span className="ml-2">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">{userName}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
