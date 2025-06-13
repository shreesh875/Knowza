// Single Responsibility: Manage authentication state and operations
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, type AuthCredentials, type SignUpData } from '../services/authService'
import { AuthValidators, type SignInFormData, type SignUpFormData } from '../validators/authValidators'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Dependency Inversion: Depends on abstraction (authService) not concrete implementation
  const signIn = useCallback(async (formData: SignInFormData) => {
    // Clear previous errors
    setError(null)
    
    // Validate input
    const validation = AuthValidators.validateSignIn(formData)
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0]
      setError(firstError)
      return { success: false, errors: validation.errors }
    }

    setLoading(true)

    try {
      const credentials: AuthCredentials = {
        email: formData.email.trim(),
        password: formData.password
      }

      const result = await authService.signIn(credentials)

      if (result.error) {
        setError(result.error)
        return { success: false, errors: { general: result.error } }
      }

      // Success - navigate to home
      navigate('/')
      return { success: true, errors: {} }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, errors: { general: errorMessage } }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const signUp = useCallback(async (formData: SignUpFormData) => {
    // Clear previous errors
    setError(null)
    
    // Validate input
    const validation = AuthValidators.validateSignUp(formData)
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0]
      setError(firstError)
      return { success: false, errors: validation.errors }
    }

    setLoading(true)

    try {
      const signUpData: SignUpData = {
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        username: formData.username.trim()
      }

      const result = await authService.signUp(signUpData)

      if (result.error) {
        setError(result.error)
        return { success: false, errors: { general: result.error } }
      }

      // Success - navigate to home
      navigate('/')
      return { success: true, errors: {} }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, errors: { general: errorMessage } }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.signOut()
      
      if (result.error) {
        setError(result.error)
        return { success: false }
      }

      navigate('/signin')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError
  }
}