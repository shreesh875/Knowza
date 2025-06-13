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
  // Temporarily disabled authentication - set demo user
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(false) // Set to false since we're not loading anything

  const fetchProfile = async (userId: string) => {
    // Temporarily disabled - return demo profile
    console.log('Profile fetching disabled for demo')
    return
  }

  const refreshProfile = async () => {
    // Temporarily disabled
    console.log('Profile refresh disabled for demo')
    return
  }

  useEffect(() => {
    console.log('UserProvider: Authentication disabled for demo')
    setLoading(false)
    
    // Set demo user and profile
    setUser(null) // No real user for demo
    setProfile({
      id: 'demo-user-id',
      username: 'demouser',
      full_name: 'Demo User',
      avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      points: 120,
      streak: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onboarding_completed: true
    })
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('Sign in disabled for demo')
    throw new Error('Authentication disabled for demo')
  }

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    console.log('Sign up disabled for demo')
    throw new Error('Authentication disabled for demo')
  }

  const signOut = async () => {
    console.log('Sign out disabled for demo')
    // Don't actually sign out in demo mode
  }

  const updateProfile = async (updates: Partial<User>) => {
    console.log('Profile update disabled for demo')
    // Don't actually update in demo mode
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

  console.log('UserProvider state (demo mode):', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    loading, 
    onboardingCompleted: profile?.onboarding_completed 
  })

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}