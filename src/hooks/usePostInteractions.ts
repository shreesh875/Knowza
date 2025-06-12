import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../contexts/UserContext'

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

interface UsePostInteractionsReturn {
  likesCount: number
  commentsCount: number
  isLiked: boolean
  comments: Comment[]
  loading: boolean
  error: string | null
  toggleLike: () => Promise<void>
  addComment: (content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  refreshComments: () => Promise<void>
}

export const usePostInteractions = (postId: string): UsePostInteractionsReturn => {
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useUser()

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get likes count
      const { data: likesData, error: likesError } = await supabase
        .rpc('get_post_like_count', { post_id_param: postId })

      if (likesError) throw likesError
      setLikesCount(likesData || 0)

      // Get comments count
      const { data: commentsCountData, error: commentsCountError } = await supabase
        .rpc('get_post_comment_count', { post_id_param: postId })

      if (commentsCountError) throw commentsCountError
      setCommentsCount(commentsCountData || 0)

      // Check if user liked the post
      if (user) {
        const { data: likedData, error: likedError } = await supabase
          .rpc('user_liked_post', { 
            post_id_param: postId, 
            user_id_param: user.id 
          })

        if (likedError) throw likedError
        setIsLiked(likedData || false)
      }

      // Get comments with user details
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user:profiles(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (commentsError) throw commentsError
      setComments(commentsData || [])

    } catch (err) {
      console.error('Error loading post interactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [postId, user])

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to like posts')
      return
    }

    try {
      setError(null)

      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (error) throw error

        setIsLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        if (error) throw error

        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      setError(err instanceof Error ? err.message : 'Failed to update like')
    }
  }, [postId, user, isLiked])

  // Add comment
  const addComment = useCallback(async (content: string) => {
    if (!user) {
      setError('You must be logged in to comment')
      return
    }

    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    try {
      setError(null)

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user:profiles(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      // Add the new comment to the list
      setComments(prev => [...prev, data])
      setCommentsCount(prev => prev + 1)

    } catch (err) {
      console.error('Error adding comment:', err)
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    }
  }, [postId, user])

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) {
      setError('You must be logged in to delete comments')
      return
    }

    try {
      setError(null)

      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user can only delete their own comments

      if (error) throw error

      // Remove the comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId))
      setCommentsCount(prev => Math.max(0, prev - 1))

    } catch (err) {
      console.error('Error deleting comment:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
    }
  }, [user])

  // Refresh comments
  const refreshComments = useCallback(async () => {
    try {
      setError(null)

      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user:profiles(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (commentsError) throw commentsError
      setComments(commentsData || [])

      // Also refresh comments count
      const { data: commentsCountData, error: commentsCountError } = await supabase
        .rpc('get_post_comment_count', { post_id_param: postId })

      if (commentsCountError) throw commentsCountError
      setCommentsCount(commentsCountData || 0)

    } catch (err) {
      console.error('Error refreshing comments:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh comments')
    }
  }, [postId])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Set up real-time subscriptions for likes and comments
  useEffect(() => {
    const likesChannel = supabase
      .channel(`post_likes_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Refresh likes count when likes change
          supabase
            .rpc('get_post_like_count', { post_id_param: postId })
            .then(({ data }) => {
              if (data !== null) setLikesCount(data)
            })
        }
      )
      .subscribe()

    const commentsChannel = supabase
      .channel(`post_comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Refresh comments when comments change
          refreshComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(likesChannel)
      supabase.removeChannel(commentsChannel)
    }
  }, [postId, refreshComments])

  return {
    likesCount,
    commentsCount,
    isLiked,
    comments,
    loading,
    error,
    toggleLike,
    addComment,
    deleteComment,
    refreshComments,
  }
}