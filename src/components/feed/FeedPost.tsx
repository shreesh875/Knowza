import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Bookmark, Share, Play, FileText, Video, ExternalLink, Quote, ImageIcon } from 'lucide-react'
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
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

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

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  // Fallback image for research papers
  const getFallbackImage = () => {
    const fallbackImages = [
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg?auto=compress&cs=tinysrgb&w=800',
    ]
    
    // Use post ID to consistently select the same fallback
    const index = post.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % fallbackImages.length
    return fallbackImages[index]
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
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
              className="p-2 text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Open original paper"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post Content */}
        <div className="px-4 pb-4" onClick={handlePostClick}>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {post.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3 leading-relaxed">
            {post.description}
          </p>

          {/* Enhanced Thumbnail with better error handling */}
          <div className="relative mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 group-hover:shadow-md transition-all duration-300">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {imageError ? (
              <div className="w-full h-64 flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800">
                <ImageIcon className="w-16 h-16 text-primary-400 mb-3" />
                <p className="text-primary-600 dark:text-primary-400 font-medium">Research Paper</p>
                <p className="text-primary-500 dark:text-primary-500 text-sm">{post.source === 'openalex' ? 'OpenAlex' : 'Semantic Scholar'}</p>
              </div>
            ) : (
              <>
                <img
                  src={post.thumbnail || getFallbackImage()}
                  alt={post.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
                
                {/* Overlay elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {post.contentType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                )}
                
                {post.source && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                      Research Paper
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full dark:bg-primary-900/20 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/30 transition-colors"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 4 && (
              <span className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-full dark:bg-neutral-800 dark:text-neutral-400">
                +{post.tags.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              disabled={isLiking || !user}
              className={`flex items-center gap-2 transition-all duration-200 px-3 py-2 rounded-lg ${
                isLiked 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'text-neutral-600 hover:text-red-500 hover:bg-red-50 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-red-900/20'
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
              className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBookmark}
              className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Like Status Indicator */}
        {isLiked && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
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