import React, { useState } from 'react'
import { Search, Filter, Sparkles, Brain, Atom, Dna, FlaskConical, Calculator, Code, Microscope, BarChart3, Bot, Zap, BookOpen } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface FeedFiltersProps {
  onSearch: (query: string) => void
  onFilterByField: (field: string) => void
  loading: boolean
}

const researchFields = [
  { id: 'all', label: 'All Fields', icon: Sparkles, color: 'text-purple-500' },
  { id: 'ai', label: 'AI & ML', icon: Brain, color: 'text-blue-500' },
  { id: 'physics', label: 'Physics', icon: Atom, color: 'text-cyan-500' },
  { id: 'biology', label: 'Biology', icon: Dna, color: 'text-green-500' },
  { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: 'text-orange-500' },
  { id: 'neuroscience', label: 'Neuroscience', icon: Brain, color: 'text-pink-500' },
  { id: 'computer-science', label: 'Computer Science', icon: Code, color: 'text-indigo-500' },
  { id: 'data-science', label: 'Data Science', icon: BarChart3, color: 'text-emerald-500' },
  { id: 'robotics', label: 'Robotics', icon: Bot, color: 'text-gray-500' },
  { id: 'quantum', label: 'Quantum', icon: Zap, color: 'text-violet-500' },
]

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  onSearch,
  onFilterByField,
  loading,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const handleFilterClick = (fieldId: string) => {
    setActiveFilter(fieldId)
    if (fieldId === 'all') {
      onSearch('') // This will trigger random mixed content
    } else {
      onFilterByField(fieldId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search research papers across multiple databases..."
            icon={<Search className="w-4 h-4" />}
            disabled={loading}
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading || !searchQuery.trim()}
          className="px-6"
        >
          Search
        </Button>
      </form>

      {/* Field Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Filter by field:
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {researchFields.map((field) => (
          <button
            key={field.id}
            onClick={() => handleFilterClick(field.id)}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeFilter === field.id
                ? 'bg-primary-100 text-primary-700 border border-primary-300 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <field.icon className={`w-4 h-4 ${field.color}`} />
            {field.label}
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-primary-600" />
          <span className="font-medium">
            Multi-Source Research Feed
          </span>
        </div>
        <p>
          Discover papers from OpenAlex (200M+ papers) and Semantic Scholar (200M+ papers) combined for maximum variety and coverage.
        </p>
      </div>
    </div>
  )
}