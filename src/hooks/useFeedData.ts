import { useState, useEffect, useCallback } from 'react'
import SemanticScholarService, { type FeedPost } from '../services/semanticScholarService'

interface UseFeedDataReturn {
  posts: FeedPost[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  searchPapers: (query: string) => Promise<void>
  filterByField: (field: string) => Promise<void>
}

export const useFeedData = (): UseFeedDataReturn => {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [currentQuery, setCurrentQuery] = useState('artificial intelligence machine learning')
  const [total, setTotal] = useState(0)

  const semanticScholarService = new SemanticScholarService()

  const loadPosts = useCallback(async (
    query: string = currentQuery,
    offset: number = 0,
    append: boolean = false
  ) => {
    try {
      setLoading(true)
      setError(null)

      const { papers, total: totalCount } = await semanticScholarService.searchPapers(query, 10, offset)
      
      if (append) {
        setPosts(prev => [...prev, ...papers])
      } else {
        setPosts(papers)
      }
      
      setTotal(totalCount)
      setCurrentOffset(offset + papers.length)
      setHasMore(offset + papers.length < totalCount)
      
    } catch (err) {
      console.error('Error loading posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [currentQuery, semanticScholarService])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await loadPosts(currentQuery, currentOffset, true)
  }, [hasMore, loading, currentQuery, currentOffset, loadPosts])

  const refresh = useCallback(async () => {
    setCurrentOffset(0)
    await loadPosts(currentQuery, 0, false)
  }, [currentQuery, loadPosts])

  const searchPapers = useCallback(async (query: string) => {
    setCurrentQuery(query)
    setCurrentOffset(0)
    await loadPosts(query, 0, false)
  }, [loadPosts])

  const filterByField = useCallback(async (field: string) => {
    setCurrentOffset(0)
    try {
      setLoading(true)
      setError(null)

      const { papers, total: totalCount } = await semanticScholarService.getPapersByField(field, 10)
      
      setPosts(papers)
      setTotal(totalCount)
      setCurrentOffset(papers.length)
      setHasMore(papers.length < totalCount)
      
    } catch (err) {
      console.error('Error filtering posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to filter posts')
    } finally {
      setLoading(false)
    }
  }, [semanticScholarService])

  // Initial load
  useEffect(() => {
    loadPosts()
  }, [])

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    searchPapers,
    filterByField,
  }
}