// Single Responsibility: Validate authentication input data
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface SignInFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  username: string
}

export class AuthValidators {
  // Open/Closed: Easy to extend with new validation rules
  private static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  private static usernameRegex = /^[a-zA-Z0-9_]{3,20}$/

  static validateSignIn(data: SignInFormData): ValidationResult {
    const errors: Record<string, string> = {}

    // Email validation
    if (!data.email.trim()) {
      errors.email = 'Email is required'
    } else if (!this.emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!data.password) {
      errors.password = 'Password is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  static validateSignUp(data: SignUpFormData): ValidationResult {
    const errors: Record<string, string> = {}

    // Email validation
    if (!data.email.trim()) {
      errors.email = 'Email is required'
    } else if (!this.emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!data.password) {
      errors.password = 'Password is required'
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    // Full name validation
    if (!data.fullName.trim()) {
      errors.fullName = 'Full name is required'
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters long'
    }

    // Username validation
    if (!data.username.trim()) {
      errors.username = 'Username is required'
    } else if (!this.usernameRegex.test(data.username)) {
      errors.username = 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // Liskov Substitution: Can be extended with additional validators
  static validateEmail(email: string): boolean {
    return this.emailRegex.test(email)
  }

  static validatePassword(password: string): boolean {
    return password.length >= 6 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  }

  static validateUsername(username: string): boolean {
    return this.usernameRegex.test(username)
  }
}