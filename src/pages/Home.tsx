import React from 'react'
import { RefreshCw, AlertCircle, Loader } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { FeedFilters } from '../components/feed/FeedFilters'
import { FeedPost } from '../components/feed/FeedPost'
import { useFeedData } from '../hooks/useFeedData'

export const Home: React.FC = () => {
  const {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    searchPapers,
    filterByField,
  } = useFeedData()

  const handleLike = (postId: string) => {
    console.log('Like post:', postId)
    // TODO: Implement like functionality
  }

  const handleSave = (postId: string) => {
    console.log('Save post:', postId)
    // TODO: Implement save functionality
  }

  const handleShare = (postId: string) => {
    console.log('Share post:', postId)
    // TODO: Implement share functionality
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Research Feed</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Discover the latest research papers from Semantic Scholar
          </p>
        </div>
        <Button
          onClick={refresh}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <FeedFilters
        onSearch={searchPapers}
        onFilterByField={filterByField}
        loading={loading}
      />

      {/* Error State */}
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg dark:bg-error-900/20 dark:border-error-800 dark:text-error-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Failed to load research papers</p>
            <p className="text-sm mt-1">{error}</p>
            <Button
              onClick={refresh}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && posts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              Loading research papers...
            </p>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
            />
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center py-6">
              <Button
                onClick={loadMore}
                disabled={loading}
                variant="outline"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  'Load More Papers'
                )}
              </Button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-6">
              <p className="text-neutral-500 dark:text-neutral-400">
                You've reached the end of the feed
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            No papers found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button onClick={refresh} variant="outline">
            Refresh Feed
          </Button>
        </div>
      )}
    </div>
  )
}