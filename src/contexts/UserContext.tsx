import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface UserContextType {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will be created by trigger')
          return null
        }
        return null
      }

      console.log('Profile fetched successfully:', data)
      setProfile(data)
      return data
    } catch (error) {
      console.error('Exception fetching profile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    console.log('UserProvider: Initializing authentication')
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else if (session?.user) {
          console.log('Initial session found:', session.user.id)
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          console.log('No initial session found')
        }
      } catch (error) {
        console.error('Exception getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('Signing in user:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      throw error
    }

    console.log('Sign in successful:', data.user?.id)
  }

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    console.log('Signing up user:', email, username)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    })

    if (error) {
      console.error('Sign up error:', error)
      throw error
    }

    console.log('Sign up successful:', data.user?.id)
  }

  const signOut = async () => {
    console.log('Signing out user')
    
    try {
      // Clear local state first
      setUser(null)
      setProfile(null)
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }

      console.log('Sign out successful')
      
      // Force a page reload to clear any cached state
      window.location.href = '/'
    } catch (error) {
      console.error('Exception during sign out:', error)
      // Even if there's an error, clear local state and redirect
      setUser(null)
      setProfile(null)
      window.location.href = '/'
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in')
    }

    console.log('Updating profile:', updates)
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Update profile error:', error)
      throw error
    }

    console.log('Profile updated successfully:', data)
    setProfile(data)
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  }

  console.log('UserProvider state:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    loading, 
    onboardingCompleted: profile?.onboarding_completed 
  })

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}