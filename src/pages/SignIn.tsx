// Interface Segregation: Focused only on sign-in functionality
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { FormField } from '../components/auth/FormField'
import { AuthButton } from '../components/auth/AuthButton'
import { useAuth } from '../hooks/useAuth'
import type { SignInFormData } from '../validators/authValidators'

export const SignIn: React.FC = () => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const { signIn, loading, error, clearError } = useAuth()

  // Clear errors when user starts typing
  useEffect(() => {
    if (error || Object.keys(fieldErrors).length > 0) {
      clearError()
      setFieldErrors({})
    }
  }, [formData, error, clearError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await signIn(formData)
    if (!result.success) {
      setFieldErrors(result.errors)
    }
  }

  const features = [
    {
      title: 'Learn',
      description: 'Discover content from the best educators and researchers worldwide',
    },
    {
      title: 'Quiz',
      description: 'Test your knowledge with interactive quizzes and assessments',
    },
    {
      title: 'Compete',
      description: 'Earn points and compete on leaderboards with fellow learners',
    },
  ]

  return (
    <AuthLayout
      title="Expand your knowledge with every scroll"
      subtitle="Dive into a feed of educational content, research papers, and videos. Learn, engage, and climb the leaderboards."
      features={features}
    >
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-8 border border-neutral-200 dark:border-neutral-700">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/image.png" 
              alt="BrainFeed" 
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">BrainFeed</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign in to continue your learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg dark:bg-error-900/20 dark:border-error-800 dark:text-error-400 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            icon={<Mail className="w-5 h-5" />}
            error={fieldErrors.email}
            required
            autoComplete="email"
            disabled={loading}
          />

          <div className="space-y-2">
            <FormField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              error={fieldErrors.password}
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              style={{ marginTop: '0px', position: 'relative', float: 'right', transform: 'translateY(-45px)' }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700"
              />
              <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                Remember me
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <AuthButton
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                Sign in
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </AuthButton>
        </form>

        <div className="mt-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary-600 hover:text-primary-500 font-medium dark:text-primary-400 transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}