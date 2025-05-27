import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cyydfgsvzykufxsxuzjq.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eWRmZ3N2enlrdWZ4c3h1empxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzY0OTIsImV4cCI6MjA2MzkxMjQ5Mn0.R_x7ZkeOVWRLclysdX2ZZMTmvyXz9RW4wB5vjzrRmd8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user session
export const getCurrentUser = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) {
    console.error("Error getting session:", error)
    return null
  }
  return session?.user || null
}

// Helper function to get user profile with organization
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      organizations (
        id,
        name,
        domain,
        settings,
        branding
      )
    `)
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
  return data
}
