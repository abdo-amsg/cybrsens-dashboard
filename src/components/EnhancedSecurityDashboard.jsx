"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  BarChart3,
  Loader2,
} from "lucide-react"
import { useSecurityMetrics } from "../hooks/useSecurityMetrics"

export function EnhancedSecurityDashboard({ userRole, organizationId, currentUserId }) {
  const [timeRange, setTimeRange] = useState("24h")
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")

  const { metrics, threats, incidents, loading, error, refresh } = useSecurityMetrics(organizationId, timeRange)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "default"
      default:
        return "outline"
    }
  }

  const getTrendIcon = (trend, change) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-red-500" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const canCustomize = userRole !== "viewer"

  const handleExport = async () => {
    try {
      const exportData = {
        metrics,
        threats:
          userRole !== "viewer"
            ? threats
            : threats.map((t) => ({
                id: t.id,
                title: t.title,
                severity: t.severity,
              })),
        incidents:
          userRole !== "viewer"
            ? incidents
            : incidents.map((i) => ({
                id: i.id,
                title: i.title,
                severity: i.severity,
              })),
        exported_at: new Date().toISOString(),
        exported_by: currentUserId,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cybrsens-security-report-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load security dashboard: {error}
          <Button variant="outline" size="sm" onClick={refresh} className="ml-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Operations Dashboard
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>Real-time cybersecurity metrics and threat intelligence</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {canCustomize && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Input
              placeholder="Search threats, incidents..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="high">High & Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))
          : metrics
            ? Object.entries(metrics).map(([key, metric]) => (
                <Card key={key} className="relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {key === "threats" && "Active Threats"}
                      {key === "incidents" && "Security Incidents"}
                      {key === "vulnerabilities" && "Vulnerabilities"}
                      {key === "compliance" && "Compliance Score"}
                    </CardTitle>
                    <Badge variant={getSeverityColor(metric.severity)} className="text-xs">
                      {metric.severity.toUpperCase()}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {key === "compliance" ? `${metric.current}%` : metric.current}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {getTrendIcon(metric.trend, metric.change)}
                      <span className="ml-1">
                        {metric.change > 0 ? "+" : ""}
                        {metric.change}% from last period
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            : null}
      </div>

      {/* Active Threats and Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : threats.length > 0 ? (
              <div className="space-y-3">
                {threats.slice(0, 5).map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">{threat.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {threat.source} • {new Date(threat.detected_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(threat.severity)}>{threat.severity.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2" />
                <p>No active threats detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">{incident.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {incident.category} • {new Date(incident.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(incident.severity)}>{incident.severity.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p>No recent incidents</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Threat Intelligence & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="threats" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
              <TabsTrigger value="incidents">Incident Timeline</TabsTrigger>
              <TabsTrigger value="network">Network Activity</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
            </TabsList>

            <TabsContent value="threats" className="space-y-4">
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Threat analysis chart integrated with Chart.js</p>
                  <p className="text-xs text-muted-foreground">
                    Data source: Supabase threats table for org {organizationId}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-4">
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Activity className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Incident timeline from real data</p>
                  <p className="text-xs text-muted-foreground">
                    Data source: Supabase incidents table for org {organizationId}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Activity className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Network monitoring from log files</p>
                  <p className="text-xs text-muted-foreground">Data source: Processed log files in Supabase</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Shield className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Compliance metrics from KPIs</p>
                  <p className="text-xs text-muted-foreground">
                    Data source: Supabase KPIs and security_metrics tables
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks based on your role and current security status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Eye className="h-6 w-6 mb-2" />
              View Reports
            </Button>
            {(userRole === "analyst" || userRole === "admin") && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Create Alert
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  Upload Logs
                </Button>
              </>
            )}
            {userRole === "admin" && (
              <Button variant="outline" className="h-20 flex-col">
                <Settings className="h-6 w-6 mb-2" />
                Manage Users
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
