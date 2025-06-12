import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Bookmark, Share, ExternalLink, FileText, Calendar, Users } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { CommentsSection } from './CommentsSection'
import { usePostInteractions } from '../../hooks/usePostInteractions'
import { useUser } from '../../contexts/UserContext'
import type { FeedPost as FeedPostType } from '../../services/semanticScholarService'

interface FeedPostProps {
  post: FeedPostType
  onSave?: (postId: string) => void
  onShare?: (postId: string) => void
}

export const FeedPost: React.FC<FeedPostProps> = ({
  post,
  onSave,
  onShare,
}) => {
  const navigate = useNavigate()
  const { user } = useUser()
  
  const {
    likesCount,
    commentsCount,
    isLiked,
    comments,
    loading: interactionsLoading,
    error: interactionsError,
    toggleLike,
    addComment,
    deleteComment,
  } = usePostInteractions(post.id)

  const handlePostClick = () => {
    navigate(`/post/${post.id}`)
  }

  const handleReadPaper = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation to post detail
    if (post.content_url) {
      window.open(post.content_url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation() // Prevent navigation to post detail
    action()
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      // Redirect to sign in or show sign in modal
      console.log('User must be signed in to like posts')
      return
    }
    toggleLike()
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.getFullYear().toString()
    } catch {
      return 'Unknown'
    }
  }

  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Post Header */}
      <div 
        className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
        onClick={handlePostClick}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 rounded-full flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Users className="w-4 h-4" />
            <span>{post.author}</span>
            <span>•</span>
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.published_at)}</span>
            <span>•</span>
            <span className="capitalize font-medium text-primary-600 dark:text-primary-400">
              Research Paper
            </span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <div 
          className="cursor-pointer"
          onClick={handlePostClick}
        >
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 leading-tight hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {post.title}
          </h2>
          
          {post.description && (
            <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              {truncateDescription(post.description)}
            </p>
          )}

          {/* Thumbnail */}
          {post.thumbnail_url && (
            <div className="relative mb-4 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={post.thumbnail_url}
                alt={post.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-3 right-3">
                <Button
                  onClick={handleReadPaper}
                  size="sm"
                  className="bg-white/90 text-neutral-900 hover:bg-white backdrop-blur-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Read Paper
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLikeClick}
              disabled={interactionsLoading}
              className={`flex items-center gap-2 transition-colors ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-neutral-600 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400'
              } disabled:opacity-50`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => handleActionClick(e, () => onSave?.(post.id))}
              className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => handleActionClick(e, () => onShare?.(post.id))}
              className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
            >
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection
          comments={comments}
          commentsCount={commentsCount}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          loading={interactionsLoading}
          error={interactionsError}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            {post.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full dark:bg-primary-900/20 dark:text-primary-400"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 5 && (
              <span className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-full dark:bg-neutral-800 dark:text-neutral-400">
                +{post.tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}