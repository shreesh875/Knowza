// Interface Segregation: Focused only on sign-up functionality
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, AtSign, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { FormField } from '../components/auth/FormField'
import { AuthButton } from '../components/auth/AuthButton'
import { useAuth } from '../hooks/useAuth'
import { AuthValidators } from '../validators/authValidators'
import type { SignUpFormData } from '../validators/authValidators'

export const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  })
  
  const { signUp, loading, error, clearError } = useAuth()

  // Clear errors when user starts typing
  useEffect(() => {
    if (error || Object.keys(fieldErrors).length > 0) {
      clearError()
      setFieldErrors({})
    }
  }, [formData, error, clearError])

  // Update password strength indicators
  useEffect(() => {
    setPasswordStrength({
      hasLength: formData.password.length >= 6,
      hasUpper: /[A-Z]/.test(formData.password),
      hasLower: /[a-z]/.test(formData.password),
      hasNumber: /\d/.test(formData.password),
    })
  }, [formData.password])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await signUp(formData)
    if (!result.success) {
      setFieldErrors(result.errors)
    }
  }

  const features = [
    {
      title: 'Personalized Learning',
      description: 'Get content recommendations based on your interests and learning goals',
    },
    {
      title: 'Interactive Quizzes',
      description: 'Test your knowledge and track your progress with engaging assessments',
    },
    {
      title: 'Community Learning',
      description: 'Join teams, compete with peers, and learn together in a supportive environment',
    },
  ]

  const PasswordStrengthIndicator = () => (
    <div className="mt-2 space-y-2">
      <div className="text-xs text-neutral-600 dark:text-neutral-400">Password requirements:</div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-green-600' : 'text-neutral-400'}`}>
          <Check className="w-3 h-3" />
          At least 6 characters
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-green-600' : 'text-neutral-400'}`}>
          <Check className="w-3 h-3" />
          Uppercase letter
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? 'text-green-600' : 'text-neutral-400'}`}>
          <Check className="w-3 h-3" />
          Lowercase letter
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-neutral-400'}`}>
          <Check className="w-3 h-3" />
          Number
        </div>
      </div>
    </div>
  )

  return (
    <AuthLayout
      title="Join the learning revolution"
      subtitle="Create your account and start exploring a world of knowledge. Connect with learners, discover research, and accelerate your growth."
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
            Create Your Account
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Start your personalized learning journey today
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              icon={<User className="w-5 h-5" />}
              error={fieldErrors.fullName}
              required
              autoComplete="name"
              disabled={loading}
            />

            <FormField
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="johndoe"
              icon={<AtSign className="w-5 h-5" />}
              error={fieldErrors.username}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

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
              autoComplete="new-password"
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
            {formData.password && <PasswordStrengthIndicator />}
          </div>

          <div className="space-y-2">
            <FormField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              error={fieldErrors.confirmPassword}
              required
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              style={{ marginTop: '0px', position: 'relative', float: 'right', transform: 'translateY(-45px)' }}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              required
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 mt-1"
            />
            <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium">
                Privacy Policy
              </Link>
            </span>
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
              'Creating account...'
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </AuthButton>
        </form>

        <div className="mt-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="text-primary-600 hover:text-primary-500 font-medium dark:text-primary-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}