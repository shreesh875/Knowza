// Single Responsibility: Manage interest selection state and operations
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { interestService, type Interest } from '../services/interestService'
import { useUser } from '../contexts/UserContext'

export const useInterests = () => {
  const [interests, setInterests] = useState<Interest[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const navigate = useNavigate()

  // Dependency Inversion: Depends on abstraction (interestService) not concrete implementation
  const loadInterests = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await interestService.getAllInterests()
      
      if (result.error) {
        setError(result.error)
      } else {
        setInterests(result.interests)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load interests')
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleInterest = useCallback((interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId)
      } else {
        return [...prev, interestId]
      }
    })
  }, [])

  const saveInterests = useCallback(async () => {
    if (!user || selectedInterests.length === 0) {
      setError('Please select at least one interest')
      return { success: false }
    }

    setSaving(true)
    setError(null)

    try {
      // Save user interests
      const saveResult = await interestService.saveUserInterests(user.id, selectedInterests)
      
      if (saveResult.error) {
        setError(saveResult.error)
        return { success: false }
      }

      // Mark onboarding as completed
      const onboardingResult = await interestService.completeOnboarding(user.id)
      
      if (onboardingResult.error) {
        setError(onboardingResult.error)
        return { success: false }
      }

      // Navigate to home page
      navigate('/')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save interests'
      setError(errorMessage)
      return { success: false }
    } finally {
      setSaving(false)
    }
  }, [user, selectedInterests, navigate])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load interests on mount
  useEffect(() => {
    loadInterests()
  }, [loadInterests])

  return {
    interests,
    selectedInterests,
    loading,
    saving,
    error,
    toggleInterest,
    saveInterests,
    clearError,
    canSave: selectedInterests.length > 0
  }
}