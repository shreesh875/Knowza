import { useState, useEffect, useCallback } from 'react'
import SemanticScholarService, { type FeedPost } from '../services/semanticScholarService'
import OpenAlexService from '../services/openAlexService'

interface UseFeedDataReturn {
  posts: FeedPost[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  searchPapers: (query: string) => Promise<void>
  filterByField: (field: string) => Promise<void>
  switchDataSource: (source: 'semantic-scholar' | 'openalex') => void
  currentDataSource: 'semantic-scholar' | 'openalex'
}

export const useFeedData = (): UseFeedDataReturn => {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentQuery, setCurrentQuery] = useState('artificial intelligence machine learning')
  const [total, setTotal] = useState(0)
  const [currentDataSource, setCurrentDataSource] = useState<'semantic-scholar' | 'openalex'>('openalex')

  const semanticScholarService = new SemanticScholarService()
  const openAlexService = new OpenAlexService()

  const loadPosts = useCallback(async (
    query: string = currentQuery,
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true)
      setError(null)

      let result: { papers: FeedPost[], total: number }

      if (currentDataSource === 'semantic-scholar') {
        const offset = (page - 1) * 10
        result = await semanticScholarService.searchPapers(query, 10, offset)
      } else {
        const openAlexResult = await openAlexService.searchWorks(query, page, 10)
        result = {
          papers: openAlexResult.papers,
          total: openAlexResult.total
        }
      }
      
      if (append) {
        setPosts(prev => [...prev, ...result.papers])
      } else {
        setPosts(result.papers)
      }
      
      setTotal(result.total)
      setCurrentPage(page)
      
      // Calculate if there are more pages
      const totalPages = Math.ceil(result.total / 10)
      setHasMore(page < totalPages)
      
    } catch (err) {
      console.error('Error loading posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [currentQuery, currentDataSource, semanticScholarService, openAlexService])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    const nextPage = currentPage + 1
    await loadPosts(currentQuery, nextPage, true)
  }, [hasMore, loading, currentPage, currentQuery, loadPosts])

  const refresh = useCallback(async () => {
    setCurrentPage(1)
    await loadPosts(currentQuery, 1, false)
  }, [currentQuery, loadPosts])

  const searchPapers = useCallback(async (query: string) => {
    setCurrentQuery(query)
    setCurrentPage(1)
    await loadPosts(query, 1, false)
  }, [loadPosts])

  const filterByField = useCallback(async (field: string) => {
    setCurrentPage(1)
    try {
      setLoading(true)
      setError(null)

      let result: { papers: FeedPost[], total: number }

      if (currentDataSource === 'semantic-scholar') {
        result = await semanticScholarService.getPapersByField(field, 10)
      } else {
        const openAlexResult = await openAlexService.getWorksByField(field, 1, 10)
        result = {
          papers: openAlexResult.papers,
          total: openAlexResult.total
        }
      }
      
      setPosts(result.papers)
      setTotal(result.total)
      setCurrentPage(1)
      
      const totalPages = Math.ceil(result.total / 10)
      setHasMore(1 < totalPages)
      
    } catch (err) {
      console.error('Error filtering posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to filter posts')
    } finally {
      setLoading(false)
    }
  }, [currentDataSource, semanticScholarService, openAlexService])

  const switchDataSource = useCallback((source: 'semantic-scholar' | 'openalex') => {
    setCurrentDataSource(source)
    setCurrentPage(1)
    setPosts([])
    // Reload with new data source
    loadPosts(currentQuery, 1, false)
  }, [currentQuery, loadPosts])

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
    switchDataSource,
    currentDataSource,
  }
}