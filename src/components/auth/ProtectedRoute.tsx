// Single Responsibility: Handle route protection based on authentication and onboarding
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireOnboarding?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireOnboarding = true
}) => {
  const { user, profile, loading } = useUser()
  const location = useLocation()

  console.log('ProtectedRoute:', {
    path: location.pathname,
    requireAuth,
    requireOnboarding,
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    loading
  })

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    console.log('Redirecting to signin: no user')
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // If user is authenticated but trying to access auth pages
  if (!requireAuth && user) {
    console.log('User authenticated, checking onboarding status')
    // If user hasn't completed onboarding, redirect to interests selection
    if (profile && !profile.onboarding_completed) {
      console.log('Redirecting to onboarding: not completed')
      return <Navigate to="/onboarding/interests" replace />
    }
    // Otherwise redirect to home
    console.log('Redirecting to home: onboarding completed')
    return <Navigate to="/" replace />
  }

  // If user is authenticated and onboarding is required
  if (requireAuth && requireOnboarding && user) {
    // Wait for profile to load
    if (!profile) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading profile...</p>
          </div>
        </div>
      )
    }

    // If user hasn't completed onboarding and is not on the onboarding page
    if (!profile.onboarding_completed && location.pathname !== '/onboarding/interests') {
      console.log('Redirecting to onboarding: required but not completed')
      return <Navigate to="/onboarding/interests" replace />
    }
    
    // If user has completed onboarding but is trying to access onboarding page
    if (profile.onboarding_completed && location.pathname === '/onboarding/interests') {
      console.log('Redirecting to home: onboarding already completed')
      return <Navigate to="/" replace />
    }
  }

  // If user is authenticated but onboarding is not required (onboarding page itself)
  if (requireAuth && !requireOnboarding && user) {
    // Wait for profile to load
    if (!profile) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading profile...</p>
          </div>
        </div>
      )
    }

    // If user has already completed onboarding, redirect to home
    if (profile.onboarding_completed && location.pathname === '/onboarding/interests') {
      console.log('Redirecting to home: onboarding already completed')
      return <Navigate to="/" replace />
    }
  }

  console.log('Rendering children')
  return <>{children}</>
}