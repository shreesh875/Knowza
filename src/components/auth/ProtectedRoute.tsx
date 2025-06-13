// Single Responsibility: Handle route protection based on authentication
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useUser()
  const location = useLocation()

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
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // If user is authenticated but trying to access auth pages
  if (!requireAuth && user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}