import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email, password) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

export const signIn = async (email, password) => {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signInWithOAuth = async (provider) => {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

export const signOut = async () => {
  return supabase.auth.signOut()
}

export const resetPassword = async (email) => {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

export const updatePassword = async (password) => {
  return supabase.auth.updateUser({
    password,
  })
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}
