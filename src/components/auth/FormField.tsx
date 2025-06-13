// Single Responsibility: Render form input fields with validation
import React from 'react'
import { cn } from '../../lib/utils'

interface FormFieldProps {
  label: string
  type: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  icon?: React.ReactNode
  required?: boolean
  disabled?: boolean
  autoComplete?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  error,
  icon,
  required = false,
  disabled = false,
  autoComplete
}) => {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={cn(
            'block w-full rounded-lg border px-3 py-3 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
            'dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 dark:border-neutral-600',
            icon && 'pl-10',
            error 
              ? 'border-error-500 focus:ring-error-500' 
              : 'border-neutral-300 dark:border-neutral-600',
            disabled && 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-900'
          )}
        />
      </div>
      
      {error && (
        <p className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}