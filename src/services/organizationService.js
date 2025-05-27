import { supabase } from "../lib/supabase"

export class OrganizationService {
  static async getOrganization(orgId) {
    try {
      const { data, error } = await supabase.from("organizations").select("*").eq("id", orgId).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching organization:", error)
      throw error
    }
  }

  static async updateOrganization(orgId, updates) {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", orgId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating organization:", error)
      throw error
    }
  }

  static async getOrganizationUsers(orgId) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching organization users:", error)
      return []
    }
  }

  static async inviteUser(orgId, email, role, invitedBy) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .eq("organization_id", orgId)
        .single()

      if (existingUser) {
        throw new Error("User already exists in this organization")
      }

      // Create pending user
      const { data, error } = await supabase
        .from("users")
        .insert({
          email,
          name: email.split("@")[0],
          role,
          organization_id: orgId,
          status: "pending",
          preferences: {
            theme: "dark",
            dashboard_layout: "grid",
            notifications: {
              email: true,
              push: false,
              sms: false,
            },
          },
        })
        .select()
        .single()

      if (error) throw error

      // Log the invitation
      await this.logAuditEvent(orgId, invitedBy, "user_invited", "user", data.id, {
        invited_email: email,
        role: role,
      })

      return data
    } catch (error) {
      console.error("Error inviting user:", error)
      throw error
    }
  }

  static async updateUserRole(orgId, userId, newRole, updatedBy) {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .eq("organization_id", orgId)
        .select()
        .single()

      if (error) throw error

      // Log the role change
      await this.logAuditEvent(orgId, updatedBy, "user_role_updated", "user", userId, {
        new_role: newRole,
      })

      return data
    } catch (error) {
      console.error("Error updating user role:", error)
      throw error
    }
  }

  static async removeUser(orgId, userId, removedBy) {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .eq("organization_id", orgId)

      if (error) throw error

      // Log the removal
      await this.logAuditEvent(orgId, removedBy, "user_removed", "user", userId, {})
    } catch (error) {
      console.error("Error removing user:", error)
      throw error
    }
  }

  static async logAuditEvent(orgId, userId, action, resourceType, resourceId, details) {
    try {
      await supabase.from("audit_logs").insert({
        organization_id: orgId,
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: "0.0.0.0", // Would be populated from request
        user_agent: "CybrSens Dashboard",
      })
    } catch (error) {
      console.error("Error logging audit event:", error)
    }
  }
}
