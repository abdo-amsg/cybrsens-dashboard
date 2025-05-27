"use client"

import { useState, useEffect } from "react"
import { SecurityMetricsService } from "../services/securityMetricsService"

export function useSecurityMetrics(organizationId, timeRange = "24h") {
  const [metrics, setMetrics] = useState(null)
  const [threats, setThreats] = useState([])
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [metricsData, threatsData, incidentsData] = await Promise.all([
        SecurityMetricsService.getSecurityMetricsSummary(organizationId, timeRange),
        SecurityMetricsService.getActiveThreats(organizationId),
        SecurityMetricsService.getRecentIncidents(organizationId),
      ])

      setMetrics(metricsData)
      setThreats(threatsData)
      setIncidents(incidentsData)
    } catch (err) {
      setError(err.message || "Failed to fetch security metrics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      fetchData()
    }
  }, [organizationId, timeRange])

  const refresh = () => {
    fetchData()
  }

  return {
    metrics,
    threats,
    incidents,
    loading,
    error,
    refresh,
  }
}
