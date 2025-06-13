// Interface Segregation: Focused only on interest selection functionality
import React, { useEffect } from 'react'
import { ArrowRight, Sparkles, Brain, Target } from 'lucide-react'
import { InterestCard } from '../components/interests/InterestCard'
import { AuthButton } from '../components/auth/AuthButton'
import { useInterests } from '../hooks/useInterests'

export const InterestSelection: React.FC = () => {
  const {
    interests,
    selectedInterests,
    loading,
    saving,
    error,
    toggleInterest,
    saveInterests,
    clearError,
    canSave
  } = useInterests()

  // Clear errors when user makes selections
  useEffect(() => {
    if (error && selectedInterests.length > 0) {
      clearError()
    }
  }, [selectedInterests, error, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveInterests()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading interests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src="/image.png" 
                alt="BrainFeed" 
                className="w-12 h-12"
              />
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">BrainFeed</span>
            </div>
            
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                What interests you?
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Select your areas of interest to personalize your learning experience. 
                We'll curate content that matches your preferences.
              </p>
            </div>

            {/* Benefits */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span>Personalized Content</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Brain className="w-4 h-4 text-secondary-500" />
                <span>Smart Recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Target className="w-4 h-4 text-accent-500" />
                <span>Focused Learning</span>
              </div>
            </div>
          </div>

          {/* Interest Selection Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg dark:bg-error-900/20 dark:border-error-800 dark:text-error-400 flex items-center gap-2 max-w-md mx-auto">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Interests Grid */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-700">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Choose your interests
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Select at least one area that interests you. You can always change these later.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {interests.map((interest) => (
                  <InterestCard
                    key={interest.id}
                    id={interest.id}
                    name={interest.name}
                    selected={selectedInterests.includes(interest.id)}
                    onToggle={toggleInterest}
                    disabled={saving}
                  />
                ))}
              </div>

              {/* Selection Counter */}
              <div className="mt-6 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
                  {selectedInterests.length === 0 && (
                    <span className="text-error-600 dark:text-error-400 ml-1">
                      (Please select at least one)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <AuthButton
                type="submit"
                variant="primary"
                size="lg"
                loading={saving}
                disabled={!canSave || saving}
                className="px-12"
              >
                {saving ? (
                  'Saving preferences...'
                ) : (
                  <>
                    Continue to BrainFeed
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </AuthButton>
              
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
                You can update your interests anytime in your profile settings
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}