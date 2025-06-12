import React, { useState } from 'react'
import { Search, Filter, Sparkles, Brain, Atom, Dna, FlaskConical, Calculator, Code, Microscope, BarChart3, Bot, Zap, Database, BookOpen } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface FeedFiltersProps {
  onSearch: (query: string) => void
  onFilterByField: (field: string) => void
  onSwitchDataSource: (source: 'semantic-scholar' | 'openalex') => void
  currentDataSource: 'semantic-scholar' | 'openalex'
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
  onSwitchDataSource,
  currentDataSource,
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
      onSearch('artificial intelligence machine learning')
    } else {
      onFilterByField(fieldId)
    }
  }

  const handleDataSourceSwitch = (source: 'semantic-scholar' | 'openalex') => {
    onSwitchDataSource(source)
  }

  return (
    <div className="space-y-4">
      {/* Data Source Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Data Source:
        </span>
        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          <button
            onClick={() => handleDataSourceSwitch('openalex')}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentDataSource === 'openalex'
                ? 'bg-white text-primary-700 shadow-sm dark:bg-neutral-700 dark:text-primary-400'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Database className="w-4 h-4" />
            OpenAlex
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/20 dark:text-green-400">
              200M+ papers
            </span>
          </button>
          <button
            onClick={() => handleDataSourceSwitch('semantic-scholar')}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentDataSource === 'semantic-scholar'
                ? 'bg-white text-primary-700 shadow-sm dark:bg-neutral-700 dark:text-primary-400'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <BookOpen className="w-4 h-4" />
            Semantic Scholar
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
              200M+ papers
            </span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search research papers on ${currentDataSource === 'openalex' ? 'OpenAlex' : 'Semantic Scholar'}...`}
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

      {/* Data Source Info */}
      <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          {currentDataSource === 'openalex' ? (
            <Database className="w-4 h-4 text-green-600" />
          ) : (
            <BookOpen className="w-4 h-4 text-blue-600" />
          )}
          <span className="font-medium">
            {currentDataSource === 'openalex' ? 'OpenAlex' : 'Semantic Scholar'}
          </span>
        </div>
        <p>
          {currentDataSource === 'openalex' 
            ? 'Open catalog of scholarly papers, authors, venues, institutions, and concepts. Completely free and open.'
            : 'AI-powered research tool for scientific literature. Provides semantic analysis and paper recommendations.'
          }
        </p>
      </div>
    </div>
  )
}