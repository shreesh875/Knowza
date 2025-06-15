import { useState, useEffect, useCallback } from 'react'
import SemanticScholarService, { type FeedPost } from '../services/semanticScholarService'
import OpenAlexService from '../services/openAlexService'
import { rateLimiter } from '../services/rateLimiter'

interface UseFeedDataReturn {
  posts: FeedPost[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  searchPapers: (query: string) => Promise<void>
  filterByField: (field: string) => Promise<void>
  queueLength: number
}

// Research topics for variety
const researchTopics = [
  'artificial intelligence machine learning',
  'quantum computing quantum information',
  'neural networks deep learning',
  'computer vision image processing',
  'natural language processing',
  'robotics automation',
  'data science analytics',
  'blockchain cryptocurrency',
  'bioinformatics computational biology',
  'cybersecurity network security',
  'augmented reality virtual reality',
  'internet of things IoT',
  'cloud computing distributed systems',
  'software engineering',
  'human computer interaction',
  'materials science nanotechnology',
  'renewable energy sustainability',
  'biomedical engineering',
  'cognitive science neuroscience',
  'climate change environmental science'
]

export const useFeedData = (): UseFeedDataReturn => {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(false) // Start with false to avoid initial loading
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentQuery, setCurrentQuery] = useState('')
  const [loadedPostIds, setLoadedPostIds] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)
  const [queueLength, setQueueLength] = useState(0)

  const semanticScholarService = new SemanticScholarService()
  const openAlexService = new OpenAlexService()

  // Monitor rate limiter queue
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueLength(rateLimiter.getQueueLength())
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Get random topics for variety
  const getRandomTopics = (count: number = 4) => {
    const shuffled = [...researchTopics].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  // Shuffle array utility
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Remove duplicates based on title similarity
  const removeDuplicates = (papers: FeedPost[]): FeedPost[] => {
    const seen = new Set<string>()
    const unique: FeedPost[] = []
    
    for (const paper of papers) {
      // Create a normalized title for comparison
      const normalizedTitle = paper.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      
      // Skip if we've seen this title or ID before
      if (!seen.has(normalizedTitle) && !loadedPostIds.has(paper.id)) {
        seen.add(normalizedTitle)
        unique.push(paper)
      }
    }
    
    return unique
  }

  // Load mixed papers from both APIs with rate limiting
  const loadMixedPapers = useCallback(async (
    query: string = '',
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true)
      setError(null)

      let allPapers: FeedPost[] = []

      if (query) {
        console.log('🔍 Searching with query:', query)
        console.log('📊 Rate limiter queue length:', rateLimiter.getQueueLength())
        
        // Sequential requests with rate limiting (1 per second)
        try {
          const semanticResult = await semanticScholarService.searchPapers(query, 6, (page - 1) * 6)
          allPapers.push(...semanticResult.papers)
          console.log('✅ Semantic Scholar:', semanticResult.papers.length, 'papers')
        } catch (error) {
          console.warn('⚠️ Semantic Scholar failed:', error)
        }

        try {
          const openAlexResult = await openAlexService.searchWorks(query, page, 6)
          allPapers.push(...openAlexResult.papers)
          console.log('✅ OpenAlex:', openAlexResult.papers.length, 'papers')
        } catch (error) {
          console.warn('⚠️ OpenAlex failed:', error)
        }
      } else {
        // For general browsing, use fewer topics and sequential loading
        const topics = getRandomTopics(3) // Reduced from 6 to 3
        console.log('🎯 Loading topics:', topics)
        console.log('📊 Rate limiter queue length:', rateLimiter.getQueueLength())

        // Sequential requests to respect rate limiting
        for (let i = 0; i < topics.length; i++) {
          const topic = topics[i]
          
          try {
            if (i < 2) {
              // Use Semantic Scholar for first 2
              const result = await semanticScholarService.searchPapers(topic, 4, 0)
              allPapers.push(...result.papers)
              console.log(`✅ Semantic Scholar (${topic}):`, result.papers.length, 'papers')
            } else {
              // Use OpenAlex for the last one
              const result = await openAlexService.searchWorks(topic, 1, 4)
              allPapers.push(...result.papers)
              console.log(`✅ OpenAlex (${topic}):`, result.papers.length, 'papers')
            }
          } catch (error) {
            console.warn(`⚠️ Failed to load topic "${topic}":`, error)
          }
        }
      }

      // Remove duplicates and shuffle for variety
      const uniquePapers = removeDuplicates(allPapers)
      const shuffledPapers = shuffleArray(uniquePapers)
      
      // Limit to reasonable number per load
      const limitedPapers = shuffledPapers.slice(0, 12) // Reduced from 15 to 12

      console.log('📝 Final result:', limitedPapers.length, 'unique papers')

      if (append) {
        setPosts(prev => {
          const combined = [...prev, ...limitedPapers]
          // Update loaded IDs
          setLoadedPostIds(prevIds => {
            const newIds = new Set(prevIds)
            limitedPapers.forEach(paper => newIds.add(paper.id))
            return newIds
          })
          return combined
        })
      } else {
        setPosts(limitedPapers)
        // Reset loaded IDs for new search
        setLoadedPostIds(new Set(limitedPapers.map(p => p.id)))
      }
      
      setCurrentPage(page)
      
      // Determine if there are more papers (simplified logic)
      setHasMore(limitedPapers.length >= 8)
      
    } catch (err) {
      console.error('Error loading papers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load papers')
    } finally {
      setLoading(false)
    }
  }, [semanticScholarService, openAlexService, loadedPostIds])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    const nextPage = currentPage + 1
    await loadMixedPapers(currentQuery, nextPage, true)
  }, [hasMore, loading, currentPage, currentQuery, loadMixedPapers])

  const refresh = useCallback(async () => {
    setCurrentPage(1)
    setLoadedPostIds(new Set()) // Clear loaded IDs for fresh content
    await loadMixedPapers(currentQuery, 1, false)
  }, [currentQuery, loadMixedPapers])

  const searchPapers = useCallback(async (query: string) => {
    setCurrentQuery(query)
    setCurrentPage(1)
    setLoadedPostIds(new Set()) // Clear loaded IDs for new search
    await loadMixedPapers(query, 1, false)
  }, [loadMixedPapers])

  const filterByField = useCallback(async (field: string) => {
    setCurrentPage(1)
    setLoadedPostIds(new Set()) // Clear loaded IDs for new filter
    
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Filtering by field:', field)
      console.log('📊 Rate limiter queue length:', rateLimiter.getQueueLength())

      let allPapers: FeedPost[] = []

      // Sequential requests with rate limiting
      try {
        const semanticResult = await semanticScholarService.getPapersByField(field, 6)
        allPapers.push(...semanticResult.papers)
        console.log('✅ Semantic Scholar:', semanticResult.papers.length, 'papers')
      } catch (error) {
        console.warn('⚠️ Semantic Scholar failed:', error)
      }

      try {
        const openAlexResult = await openAlexService.getWorksByField(field, 1, 6)
        allPapers.push(...openAlexResult.papers)
        console.log('✅ OpenAlex:', openAlexResult.papers.length, 'papers')
      } catch (error) {
        console.warn('⚠️ OpenAlex failed:', error)
      }

      // Remove duplicates and shuffle
      const uniquePapers = removeDuplicates(allPapers)
      const shuffledPapers = shuffleArray(uniquePapers)
      
      setPosts(shuffledPapers.slice(0, 12))
      setLoadedPostIds(new Set(shuffledPapers.slice(0, 12).map(p => p.id)))
      setCurrentPage(1)
      setHasMore(shuffledPapers.length >= 8)
      
      console.log('📝 Filter result:', shuffledPapers.slice(0, 12).length, 'unique papers')
      
    } catch (err) {
      console.error('Error filtering papers:', err)
      setError(err instanceof Error ? err.message : 'Failed to filter papers')
    } finally {
      setLoading(false)
    }
  }, [semanticScholarService, openAlexService])

  // Initial load with delay to avoid immediate loading state
  useEffect(() => {
    if (!isInitialized) {
      // Small delay to avoid flash of loading state
      const timer = setTimeout(() => {
        setIsInitialized(true)
        loadMixedPapers()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isInitialized, loadMixedPapers])

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    searchPapers,
    filterByField,
    queueLength,
  }
}