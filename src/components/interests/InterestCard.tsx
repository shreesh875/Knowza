// Single Responsibility: Render individual interest selection card
import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface InterestCardProps {
  id: string
  name: string
  selected: boolean
  onToggle: (id: string) => void
  disabled?: boolean
}

export const InterestCard: React.FC<InterestCardProps> = ({
  id,
  name,
  selected,
  onToggle,
  disabled = false
}) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(id)}
      disabled={disabled}
      className={cn(
        'relative p-4 rounded-xl border-2 transition-all duration-200 text-left w-full',
        'hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        selected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-primary-600',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{name}</span>
        {selected && (
          <div className="flex-shrink-0 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Selection indicator */}
      <div className={cn(
        'absolute inset-0 rounded-xl border-2 transition-all duration-200 pointer-events-none',
        selected 
          ? 'border-primary-500 shadow-lg shadow-primary-500/20' 
          : 'border-transparent'
      )} />
    </button>
  )
}