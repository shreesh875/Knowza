import React, { useState } from 'react'
import { MessageCircle, Send, Trash2, User } from 'lucide-react'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { useUser } from '../../contexts/UserContext'
import { formatDate } from '../../lib/utils'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  user: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
}

interface CommentsSectionProps {
  comments: Comment[]
  commentsCount: number
  onAddComment: (content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
  loading?: boolean
  error?: string | null
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  commentsCount,
  onAddComment,
  onDeleteComment,
  loading = false,
  error = null,
}) => {
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const { user } = useUser()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || submitting) return

    try {
      setSubmitting(true)
      await onAddComment(newComment.trim())
      setNewComment('')
    } catch (err) {
      console.error('Error submitting comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await onDeleteComment(commentId)
      } catch (err) {
        console.error('Error deleting comment:', err)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Comments Toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">
          {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
        </span>
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="flex gap-3">
                <Avatar
                  src={user.user_metadata?.avatar_url}
                  alt={user.user_metadata?.full_name || 'User'}
                  size="sm"
                  fallback={user.user_metadata?.full_name || user.email}
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    disabled={submitting}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Please sign in to leave a comment
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-3 py-2 rounded-lg text-sm dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
              {error}
            </div>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar
                    src={comment.user.avatar_url}
                    alt={comment.user.full_name}
                    size="sm"
                    fallback={comment.user.full_name}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-neutral-900 dark:text-white">
                          {comment.user.full_name}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          @{comment.user.username}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                    
                    {/* Delete button for comment owner */}
                    {user && user.id === comment.user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}