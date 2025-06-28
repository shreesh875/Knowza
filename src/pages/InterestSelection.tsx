// Interface Segregation: Focused only on interest selection functionality
import React, { useEffect } from 'react'
import { ArrowRight, Sparkles, Brain, Target, Heart, Lightbulb, Users } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading interests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Large decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 bg-cyan-500/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-purple-400/20 rounded-full blur-xl"></div>
        
        {/* Small floating dots */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <img 
                  src="/Knowza Symbol.png" 
                  alt="Knowza" 
                  className="w-8 h-8"
                />
              </div>
              <span className="text-2xl font-bold text-white">Knowza</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6">
              What interests you?
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-lg mx-auto mb-8">
              Select your areas of interest to personalize your learning experience. We'll curate content that matches your preferences.
            </p>

            {/* Benefits */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Personal Content</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span>Personalized Suggestions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Focused Learning</span>
              </div>
            </div>
          </div>

          {/* Interest Selection Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-lg backdrop-blur-sm flex items-center gap-2 max-w-md mx-auto">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Interests Section */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Choose your interests
                </h2>
                <p className="text-white/70 text-sm">
                  Select at least one area that interests you. You can always change these later.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => !saving && toggleInterest(interest.id)}
                    disabled={saving}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left w-full group ${
                      selectedInterests.includes(interest.id)
                        ? 'border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20'
                        : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{interest.name}</span>
                      {selectedInterests.includes(interest.id) && (
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Glow effect for selected items */}
                    {selectedInterests.includes(interest.id) && (
                      <div className="absolute inset-0 rounded-xl border-2 border-purple-400 shadow-lg shadow-purple-500/30 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>

              {/* Selection Counter */}
              <div className="mt-6 text-center">
                <p className="text-sm text-white/70">
                  {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
                  {selectedInterests.length === 0 && (
                    <span className="text-red-400 ml-1">
                      (Please select at least one)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={!canSave || saving}
                className={`px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                  canSave && !saving
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3" />
                    Saving preferences...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Continue to Knowza
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </button>
              
              <p className="text-xs text-white/50 mt-4">
                You can update your interests anytime in your profile settings
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}