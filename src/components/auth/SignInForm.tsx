import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { AuthLayout } from './AuthLayout'

export const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      title: 'Learn',
      description: 'Discover content from the best educators and researchers',
    },
    {
      title: 'Quiz',
      description: 'Test your knowledge with interactive quizzes',
    },
    {
      title: 'Compete',
      description: 'Earn points and compete on leaderboards',
    },
  ]

  return (
    <AuthLayout
      title="Expand your knowledge with every scroll"
      subtitle="Dive into a feed of educational content, research papers, and videos. Learn, engage, and climb the leaderboards."
      features={features}
    >
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign in to continue to BrainFeed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700"
              />
              <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                Remember me
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary-600 hover:text-primary-500 font-medium dark:text-primary-400"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}