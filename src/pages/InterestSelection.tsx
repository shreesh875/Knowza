// Interface Segregation: Focused only on interest selection functionality
import React, { useEffect } from 'react'
import { ArrowRight, Heart, Lightbulb, Users, AlertCircle } from 'lucide-react'
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

  // Enhanced loading state with debugging info
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading your interests...</h3>
          <p className="text-white/60 text-sm">
            Setting up your personalized learning experience
          </p>
          
          {/* Debug info in development */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-black/20 rounded-lg text-left">
              <p className="text-white/80 text-xs mb-2">Debug Info:</p>
              <p className="text-white/60 text-xs">• Connecting to Supabase...</p>
              <p className="text-white/60 text-xs">• Fetching interests from database...</p>
              <p className="text-white/60 text-xs">• Check browser console for details</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
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
                <span>Smart Suggestions</span>
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
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Connection Issue</p>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
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

              {interests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No interests available</h3>
                  <p className="text-white/60 text-sm">
                    There seems to be an issue loading interests. Please check your connection.
                  </p>
                </div>
              ) : (
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
              )}

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
                disabled={!canSave || saving || interests.length === 0}
                className={`px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                  canSave && !saving && interests.length > 0
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