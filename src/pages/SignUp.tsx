import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, AtSign, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  })
  
  const { signUp } = useUser()

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
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.email || !formData.password || !formData.fullName || !formData.username) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName, formData.username)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const PasswordStrengthIndicator = () => (
    <div className="mt-2 space-y-2">
      <div className="text-xs text-white/70">Password requirements:</div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-green-400' : 'text-white/50'}`}>
          <Check className="w-3 h-3" />
          At least 6 characters
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-green-400' : 'text-white/50'}`}>
          <Check className="w-3 h-3" />
          Uppercase letter
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? 'text-green-400' : 'text-white/50'}`}>
          <Check className="w-3 h-3" />
          Lowercase letter
        </div>
        <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-400' : 'text-white/50'}`}>
          <Check className="w-3 h-3" />
          Number
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/Knowza Symbol.png" 
              alt="Knowza" 
              className="w-12 h-12 drop-shadow-lg"
            />
            <span className="text-3xl font-bold text-white drop-shadow-lg">Knowza</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
            Create Your Account
          </h1>
          <p className="text-white/80 drop-shadow-sm">
            Start your personalized learning journey today
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-lg backdrop-blur-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                icon={<User className="w-5 h-5" />}
                required
                disabled={loading}
              />

              <Input
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="johndoe"
                icon={<AtSign className="w-5 h-5" />}
                required
                disabled={loading}
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              icon={<Mail className="w-5 h-5" />}
              required
              disabled={loading}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-white/60 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {formData.password && <PasswordStrengthIndicator />}
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-white/60 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-start text-white/80">
              <input
                type="checkbox"
                required
                className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2 mt-1"
              />
              <span className="ml-2 text-sm">
                I agree to the{' '}
                <Link to="/terms" className="text-purple-300 hover:text-purple-200 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-purple-300 hover:text-purple-200 transition-colors">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/80">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}