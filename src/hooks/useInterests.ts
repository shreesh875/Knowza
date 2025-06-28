// Single Responsibility: Manage interest selection state and operations
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { interestService, type Interest } from '../services/interestService'
import { useUser } from '../contexts/UserContext'

export const useInterests = () => {
  const [interests, setInterests] = useState<Interest[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(true) // Start with true
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, refreshProfile } = useUser()
  const navigate = useNavigate()

  // Dependency Inversion: Depends on abstraction (interestService) not concrete implementation
  const loadInterests = useCallback(async () => {
    console.log('🚀 useInterests: Starting to load interests...')
    setLoading(true)
    setError(null)

    try {
      console.log('📞 useInterests: Calling interestService.getAllInterests()...')
      const result = await interestService.getAllInterests()
      
      if (result.error) {
        console.error('❌ useInterests: Error from service:', result.error)
        setError(result.error)
      } else {
        console.log('✅ useInterests: Successfully loaded interests:', result.interests.length)
        setInterests(result.interests)
      }
    } catch (error) {
      console.error('💥 useInterests: Exception in loadInterests:', error)
      setError(error instanceof Error ? error.message : 'Failed to load interests')
    } finally {
      console.log('🏁 useInterests: Finished loading interests')
      setLoading(false)
    }
  }, [])

  const toggleInterest = useCallback((interestId: string) => {
    console.log('🔄 useInterests: Toggling interest:', interestId)
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        const newSelection = prev.filter(id => id !== interestId)
        console.log('➖ Removed interest, new selection:', newSelection)
        return newSelection
      } else {
        const newSelection = [...prev, interestId]
        console.log('➕ Added interest, new selection:', newSelection)
        return newSelection
      }
    })
  }, [])

  const saveInterests = useCallback(async () => {
    if (!user) {
      setError('User not authenticated')
      return { success: false }
    }

    if (selectedInterests.length === 0) {
      setError('Please select at least one interest')
      return { success: false }
    }

    console.log('💾 useInterests: Starting to save interests:', selectedInterests)
    setSaving(true)
    setError(null)

    try {
      // Save user interests
      console.log('📝 useInterests: Saving user interests...')
      const saveResult = await interestService.saveUserInterests(user.id, selectedInterests)
      
      if (saveResult.error) {
        console.error('❌ useInterests: Error saving interests:', saveResult.error)
        setError(saveResult.error)
        return { success: false }
      }

      // Mark onboarding as completed
      console.log('🎯 useInterests: Completing onboarding...')
      const onboardingResult = await interestService.completeOnboarding(user.id)
      
      if (onboardingResult.error) {
        console.error('❌ useInterests: Error completing onboarding:', onboardingResult.error)
        setError(onboardingResult.error)
        return { success: false }
      }

      console.log('✅ useInterests: Onboarding completed successfully')
      
      // Refresh the user profile to get updated onboarding status
      await refreshProfile()

      // Navigate to home page
      console.log('🏠 useInterests: Navigating to app...')
      navigate('/app')
      return { success: true }
    } catch (error) {
      console.error('💥 useInterests: Exception saving interests:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save interests'
      setError(errorMessage)
      return { success: false }
    } finally {
      setSaving(false)
    }
  }, [user, selectedInterests, navigate, refreshProfile])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load interests on mount
  useEffect(() => {
    console.log('🎬 useInterests: Component mounted, loading interests...')
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