import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Bookmark, Share, Play, FileText, Video, ExternalLink, Quote } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { useUser } from '../../contexts/UserContext'
import { supabase } from '../../lib/supabase'

interface Post {
  id: string
  title: string
  description: string
  author: string
  authorAvatar: string
  timeAgo: string
  contentType: string
  thumbnail: string
  likes: number
  comments: number
  tags: string[]
  source?: 'openalex' | 'semantic_scholar'
  citationCount?: number
  year?: number
  url?: string
}

interface FeedPostProps {
  post: Post
}

export const FeedPost: React.FC<FeedPostProps> = ({ post }) => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [justLiked, setJustLiked] = useState(false)

  // Check if user has already liked this post
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (data && !error) {
          setIsLiked(true)
        }
      } catch (error) {
        // User hasn't liked this post yet
        setIsLiked(false)
      }
    }

    checkLikeStatus()
  }, [user, post.id])

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'paper':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getSourceBadge = () => {
    if (!post.source) return null
    
    const badges = {
      openalex: { label: 'OpenAlex', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
      semantic_scholar: { label: 'Semantic Scholar', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' }
    }
    
    const badge = badges[post.source]
    if (!badge) return null
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const handlePostClick = () => {
    // For research papers with URLs, open in new tab
    if (post.url && post.source) {
      window.open(post.url, '_blank')
    } else {
      navigate(`/post/${post.id}`)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation when clicking like button
    
    if (!user || isLiking) return

    setIsLiking(true)

    try {
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)

        if (error) throw error

        setIsLiked(false)
        setLikesCount(prev => prev - 1)
        setJustLiked(false)
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          })

        if (error) throw error

        setIsLiked(true)
        setLikesCount(prev => prev + 1)
        setJustLiked(true)
        
        // Remove the "just liked" animation after a short delay
        setTimeout(() => setJustLiked(false), 600)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Show user-friendly error message
      alert('Failed to update like. Please try again.')
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/post/${post.id}#comments`)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement bookmark functionality
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement share functionality
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (post.url) {
      window.open(post.url, '_blank')
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="flex items-center gap-3 p-4">
          <Avatar src={post.authorAvatar} alt={post.author} size="md" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {post.author}
              </h3>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {post.timeAgo}
              </span>
              <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                {getContentIcon(post.contentType)}
                <span className="capitalize">{post.contentType}</span>
              </div>
              {getSourceBadge()}
            </div>
            {/* Citation count for research papers */}
            {post.citationCount !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <Quote className="w-3 h-3 text-neutral-400" />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {post.citationCount} citations
                </span>
                {post.year && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    • {post.year}
                  </span>
                )}
              </div>
            )}
          </div>
          {/* External link button for research papers */}
          {post.url && (
            <button
              onClick={handleExternalLink}
              className="p-2 text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
              title="Open original paper"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post Content */}
        <div className="px-4 pb-4" onClick={handlePostClick}>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            {post.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
            {post.description}
          </p>

          {/* Thumbnail */}
          <div className="relative mb-4 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
            {post.contentType === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-4">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            )}
            {post.source && (
              <div className="absolute top-3 right-3">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                  Research Paper
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full dark:bg-primary-900/20 dark:text-primary-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              disabled={isLiking || !user}
              className={`flex items-center gap-2 transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-neutral-600 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''} ${
                justLiked ? 'scale-110' : 'scale-100'
              }`}
            >
              <Heart 
                className={`w-5 h-5 transition-all duration-200 ${
                  isLiked ? 'fill-current' : ''
                } ${justLiked ? 'animate-pulse' : ''}`} 
              />
              <span className={`text-sm font-medium transition-all duration-200 ${
                justLiked ? 'text-red-500 font-bold' : ''
              }`}>
                {likesCount}
                {justLiked && (
                  <span className="ml-1 text-xs animate-bounce">+1</span>
                )}
              </span>
            </button>
            <button 
              onClick={handleComment}
              className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBookmark}
              className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
            >
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Like Status Indicator */}
        {isLiked && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 text-sm text-red-500">
              <Heart className="w-4 h-4 fill-current" />
              <span>You liked this post</span>
              {justLiked && (
                <span className="text-xs animate-pulse">• Just now</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}