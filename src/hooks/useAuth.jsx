import { useState, useEffect, useContext, createContext } from 'react'
import {
  signUp,
  signIn,
  signOut,
  signInWithOAuth,
  resetPassword,
  updatePassword,
  getCurrentUser,
  onAuthStateChange,
} from '../lib/supabase'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Error getting current user:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleSignUp = async (email, password) => {
    try {
      setError(null)
      const { data, error } = await signUp(email, password)
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const handleSignIn = async (email, password) => {
    try {
      setError(null)
      const { data, error } = await signIn(email, password)
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const handleSignInWithOAuth = async (provider) => {
    try {
      setError(null)
      const { data, error } = await signInWithOAuth(provider)
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      const { error } = await signOut()
      if (error) throw error
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const handleResetPassword = async (email) => {
    try {
      setError(null)
      const { error } = await resetPassword(email)
      if (error) throw error
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const handleUpdatePassword = async (password) => {
    try {
      setError(null)
      const { error } = await updatePassword(password)
      if (error) throw error
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithOAuth: handleSignInWithOAuth,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
