import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Heart, Bookmark, Share, Calendar, Users, FileText, Eye, Download, Quote } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { CommentsSection } from '../components/feed/CommentsSection'
import { usePostInteractions } from '../hooks/usePostInteractions'
import { useUser } from '../contexts/UserContext'
import type { FeedPost } from '../services/semanticScholarService'
import SemanticScholarService from '../services/semanticScholarService'
import OpenAlexService from '../services/openAlexService'

export const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user } = useUser()
  const [post, setPost] = useState<FeedPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

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
  } = usePostInteractions(postId || '')

  const semanticScholarService = new SemanticScholarService()
  const openAlexService = new OpenAlexService()

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) {
        setError('Post ID not found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Try OpenAlex first (since it's our primary source now)
        let paperDetails: FeedPost | null = null
        
        try {
          paperDetails = await openAlexService.getWorkById(postId)
        } catch (openAlexError) {
          console.log('OpenAlex failed, trying Semantic Scholar:', openAlexError)
          // Fallback to Semantic Scholar
          try {
            paperDetails = await semanticScholarService.getPaperById(postId)
          } catch (semanticScholarError) {
            console.error('Both services failed:', { openAlexError, semanticScholarError })
          }
        }
        
        if (paperDetails) {
          setPost(paperDetails)
        } else {
          setError('Paper not found in any database')
        }
      } catch (err) {
        console.error('Error loading post:', err)
        setError('Failed to load paper details')
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [postId])

  const handleBack = () => {
    navigate(-1)
  }

  const handleReadPaper = () => {
    if (post?.content_url) {
      window.open(post.content_url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleLike = () => {
    if (!user) {
      console.log('User must be signed in to like posts')
      return
    }
    toggleLike()
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    // TODO: Implement actual save functionality
  }

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.getFullYear().toString()
    } catch {
      return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading paper details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-error-600 dark:text-error-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              Paper Not Found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {error || 'The requested research paper could not be found.'}
            </p>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            disabled={interactionsLoading || !user}
            className={isLiked ? 'text-red-600 border-red-300' : ''}
          >
            <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className={isSaved ? 'text-primary-600 border-primary-300' : ''}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Paper Header */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white leading-tight mb-4">
                {post.title}
              </h1>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Published {formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{likesCount * 10} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4" />
                  <span>{likesCount} citations</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleReadPaper} size="lg" className="flex-1 sm:flex-none">
                <ExternalLink className="w-5 h-5 mr-2" />
                Read Full Paper
              </Button>
              <Button variant="outline" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Research Fields
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full dark:bg-primary-900/20 dark:text-primary-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paper Content */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Abstract */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Abstract
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
                  {post.description || 'No abstract available for this paper.'}
                </p>
              </div>
            </div>

            {/* Paper Preview */}
            {post.thumbnail_url && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Preview
                </h2>
                <div className="relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            )}

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Paper Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Authors:</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{post.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Year:</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Citations:</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{likesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Type:</span>
                    <span className="text-neutral-900 dark:text-white font-medium capitalize">{post.content_type}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Engagement
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Likes:</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{likesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Comments:</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{commentsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Views:</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{likesCount * 10}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                  Ready to dive deeper?
                </h3>
                <p className="text-primary-700 dark:text-primary-300">
                  Access the full research paper to explore detailed methodologies, results, and conclusions.
                </p>
                <Button onClick={handleReadPaper} size="lg" className="bg-primary-600 hover:bg-primary-700">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Read Full Paper
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Discussion
          </h2>
          <CommentsSection
            comments={comments}
            commentsCount={commentsCount}
            onAddComment={addComment}
            onDeleteComment={deleteComment}
            loading={interactionsLoading}
            error={interactionsError}
          />
        </CardContent>
      </Card>
    </div>
  )
}