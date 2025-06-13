// Single Responsibility: Handle all authentication operations
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpData extends AuthCredentials {
  fullName: string
  username: string
}

export interface AuthResult {
  user: User | null
  error: string | null
}

export class AuthService {
  // Single Responsibility: Sign in user
  async signIn(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, error: this.formatAuthError(error.message) }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }
    }
  }

  // Single Responsibility: Sign up user
  async signUp(signUpData: SignUpData): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
            username: signUpData.username,
          },
        },
      })

      if (error) {
        return { user: null, error: this.formatAuthError(error.message) }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }
    }
  }

  // Single Responsibility: Sign out user
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: this.formatAuthError(error.message) }
      }

      return { error: null }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }
    }
  }

  // Single Responsibility: Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  // Single Responsibility: Format error messages for user display
  private formatAuthError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
      'User already registered': 'An account with this email already exists. Please sign in instead.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Unable to validate email address: invalid format': 'Please enter a valid email address.',
      'signup_disabled': 'New registrations are currently disabled.',
    }

    return errorMap[errorMessage] || errorMessage
  }
}

// Export singleton instance
export const authService = new AuthService()