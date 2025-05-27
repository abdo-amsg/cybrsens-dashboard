import { supabase } from "../lib/supabase"

export class SecurityMetricsService {
  static async getSecurityMetricsSummary(orgId, timeRange = "24h") {
    try {
      // Get current metrics
      const { data: metrics, error } = await supabase
        .from("security_metrics")
        .select("*")
        .eq("organization_id", orgId)
        .gte("timestamp", this.getTimeRangeStart(timeRange))
        .order("timestamp", { ascending: false })

      if (error) throw error

      // Process metrics into summary format
      const summary = this.processMetricsIntoSummary(metrics || [])
      return summary
    } catch (error) {
      console.error("Error fetching security metrics:", error)
      return this.getDefaultMetrics()
    }
  }

  static async getActiveThreats(orgId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from("threats")
        .select("*")
        .eq("organization_id", orgId)
        .in("status", ["active", "investigating"])
        .order("detected_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching active threats:", error)
      return []
    }
  }

  static async getRecentIncidents(orgId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching recent incidents:", error)
      return []
    }
  }

  static async createSecurityMetric(orgId, metricType, value, severity, createdBy, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from("security_metrics")
        .insert({
          organization_id: orgId,
          metric_type: metricType,
          value,
          severity,
          created_by: createdBy,
          metadata,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating security metric:", error)
      throw error
    }
  }

  static getTimeRangeStart(timeRange) {
    const now = new Date()
    switch (timeRange) {
      case "1h":
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    }
  }

  static processMetricsIntoSummary(metrics) {
    const summary = {
      threats: { current: 0, change: 0, trend: "stable", severity: "low" },
      incidents: { current: 0, change: 0, trend: "stable", severity: "low" },
      vulnerabilities: { current: 0, change: 0, trend: "stable", severity: "low" },
      compliance: { current: 100, change: 0, trend: "stable", severity: "low" },
    }

    // Group metrics by type and calculate current values
    const metricsByType = metrics.reduce((acc, metric) => {
      if (!acc[metric.metric_type]) {
        acc[metric.metric_type] = []
      }
      acc[metric.metric_type].push(metric)
      return acc
    }, {})

    // Calculate summary for each metric type
    Object.keys(metricsByType).forEach((type) => {
      const typeMetrics = metricsByType[type]
      if (typeMetrics.length > 0) {
        const latest = typeMetrics[0]
        const previous = typeMetrics[1]

        summary[type] = {
          current: latest.value,
          change: previous ? ((latest.value - previous.value) / previous.value) * 100 : 0,
          trend: previous
            ? latest.value > previous.value
              ? "up"
              : latest.value < previous.value
                ? "down"
                : "stable"
            : "stable",
          severity: latest.severity,
        }
      }
    })

    return summary
  }

  static getDefaultMetrics() {
    return {
      threats: { current: 0, change: 0, trend: "stable", severity: "low" },
      incidents: { current: 0, change: 0, trend: "stable", severity: "low" },
      vulnerabilities: { current: 0, change: 0, trend: "stable", severity: "low" },
      compliance: { current: 100, change: 0, trend: "stable", severity: "low" },
    }
  }
}
