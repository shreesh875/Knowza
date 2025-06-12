import React from 'react'
import { RefreshCw, Search } from 'lucide-react'
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
    switchDataSource,
    currentDataSource,
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
            Latest research papers and educational content
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
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FeedFilters 
        onSearch={searchPapers}
        onFilterByField={filterByField}
        onSwitchDataSource={switchDataSource}
        currentDataSource={currentDataSource}
        loading={loading}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {posts.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Posts</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {posts.filter(p => p.contentType === 'paper').length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Research Papers</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {posts.filter(p => p.contentType === 'video').length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Videos</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {posts.filter(p => p.contentType === 'article').length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Articles</div>
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
            <span className="text-neutral-600 dark:text-neutral-400">
              Loading latest research papers...
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
              No posts found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              No posts match the current filters. Try adjusting your search or filter settings.
            </p>
            <Button
              variant="outline"
              onClick={refresh}
            >
              Refresh Feed
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <FeedPost key={post.id} post={post} />
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
    </div>
  )
}