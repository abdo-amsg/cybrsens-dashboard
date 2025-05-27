"use client"

import { useState, useEffect } from "react"
import { OrganizationService } from "../services/organizationService"

export function useOrganization(organizationId) {
  const [organization, setOrganization] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [orgData, usersData] = await Promise.all([
        OrganizationService.getOrganization(organizationId),
        OrganizationService.getOrganizationUsers(organizationId),
      ])

      setOrganization(orgData)
      setUsers(usersData)
    } catch (err) {
      setError(err.message || "Failed to fetch organization data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      fetchData()
    }
  }, [organizationId])

  const inviteUser = async (email, role, invitedBy) => {
    try {
      const newUser = await OrganizationService.inviteUser(organizationId, email, role, invitedBy)
      setUsers((prev) => [...prev, newUser])
      return newUser
    } catch (err) {
      throw err
    }
  }

  const updateUserRole = async (userId, newRole, updatedBy) => {
    try {
      const updatedUser = await OrganizationService.updateUserRole(organizationId, userId, newRole, updatedBy)
      setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)))
      return updatedUser
    } catch (err) {
      throw err
    }
  }

  const removeUser = async (userId, removedBy) => {
    try {
      await OrganizationService.removeUser(organizationId, userId, removedBy)
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: "inactive" } : user)))
    } catch (err) {
      throw err
    }
  }

  const updateOrganization = async (updates) => {
    try {
      const updatedOrg = await OrganizationService.updateOrganization(organizationId, updates)
      setOrganization(updatedOrg)
      return updatedOrg
    } catch (err) {
      throw err
    }
  }

  return {
    organization,
    users,
    loading,
    error,
    inviteUser,
    updateUserRole,
    removeUser,
    updateOrganization,
    refresh: fetchData,
  }
}
