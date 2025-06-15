import React from 'react'
import { RefreshCw, Search, Shuffle, Zap } from 'lucide-react'
import { FeedPost } from '../components/feed/FeedPost'
import { FeedFilters } from '../components/feed/FeedFilters'
import { Button } from '../components/ui/Button'
import { useFeedData } from '../hooks/useFeedData'

export const Home: React.FC = () => {
  const {
    posts,
    loading,
    error,
    refresh,
    searchPapers,
    filterByField,
    hasMore,
    loadMore
  } = useFeedData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Your Feed</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Latest research papers from multiple academic databases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Shuffle className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            New Mix
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FeedFilters 
        onSearch={searchPapers}
        onFilterByField={filterByField}
        loading={loading}
      />

      {/* Quick Load Banner */}
      {!loading && posts.length === 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-primary-900 dark:text-primary-100">Lightning Fast Research Feed</h3>
          </div>
          <p className="text-primary-700 dark:text-primary-300 text-sm">
            Get instant access to the latest research papers from OpenAlex and Semantic Scholar. 
            Each refresh brings you a fresh mix of cutting-edge academic content.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {posts.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Papers Loaded</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {posts.filter(p => p.source === 'openalex').length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">OpenAlex</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {posts.filter(p => p.source === 'semantic_scholar').length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Semantic Scholar</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {new Set(posts.map(p => p.tags).flat()).size}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Unique Topics</div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <p className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Loading State - Only show when actually loading */}
      {loading && posts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-primary-200 dark:border-primary-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span className="text-neutral-600 dark:text-neutral-400">
              Loading fresh research papers...
            </span>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No papers found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              No papers match the current search. Try adjusting your search terms or browse all fields.
            </p>
            <Button
              variant="outline"
              onClick={refresh}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Get Random Papers
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <FeedPost key={`${post.source}-${post.id}`} post={post} />
          ))
        )}
      </div>

      {/* Load More Button */}
      {!loading && posts.length > 0 && hasMore && (
        <div className="text-center py-6">
          <Button
            variant="outline"
            onClick={loadMore}
            className="px-8"
          >
            Load More Papers
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loading && posts.length > 0 && (
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <div className="w-4 h-4 border-2 border-primary-200 dark:border-primary-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span className="text-neutral-600 dark:text-neutral-400 text-sm">
              Loading more papers...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}