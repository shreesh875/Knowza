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

  const semanticScholarService = new SemanticScholarService()
  const openAlexService = new OpenAlexService()

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

  // Load mixed papers from both APIs with better error handling
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
        // If there's a specific query, search both APIs with timeout
        const promises = [
          Promise.race([
            semanticScholarService.searchPapers(query, 6, (page - 1) * 6),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
          ]).catch(() => ({ papers: [] })),
          Promise.race([
            openAlexService.searchWorks(query, page, 6),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
          ]).catch(() => ({ papers: [] }))
        ]

        const results = await Promise.allSettled(promises)
        
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.papers) {
            allPapers.push(...result.value.papers)
          }
        })
      } else {
        // For general browsing, use fewer topics and faster loading
        const topics = getRandomTopics(3) // Reduced from 6 to 3
        const promises: Promise<any>[] = []

        // Use only 3 requests instead of 6 for faster loading
        topics.forEach((topic, index) => {
          if (index < 2) {
            // Use Semantic Scholar for first 2
            promises.push(
              Promise.race([
                semanticScholarService.searchPapers(topic, 4, 0),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000))
              ]).then(result => ({ source: 'semantic', papers: result.papers }))
                .catch(() => ({ source: 'semantic', papers: [] }))
            )
          } else {
            // Use OpenAlex for the last one
            promises.push(
              Promise.race([
                openAlexService.searchWorks(topic, 1, 4),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000))
              ]).then(result => ({ source: 'openalex', papers: result.papers }))
                .catch(() => ({ source: 'openalex', papers: [] }))
            )
          }
        })

        const results = await Promise.allSettled(promises)
        
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.papers) {
            allPapers.push(...result.value.papers)
          }
        })
      }

      // Remove duplicates and shuffle for variety
      const uniquePapers = removeDuplicates(allPapers)
      const shuffledPapers = shuffleArray(uniquePapers)
      
      // Limit to reasonable number per load
      const limitedPapers = shuffledPapers.slice(0, 12) // Reduced from 15 to 12

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

      // Get papers from both APIs for the field with timeout
      const promises = [
        Promise.race([
          semanticScholarService.getPapersByField(field, 6),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000))
        ]).catch(() => ({ papers: [] })),
        Promise.race([
          openAlexService.getWorksByField(field, 1, 6),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000))
        ]).catch(() => ({ papers: [] }))
      ]

      const results = await Promise.allSettled(promises)

      let allPapers: FeedPost[] = []

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.papers) {
          allPapers.push(...result.value.papers)
        }
      })

      // Remove duplicates and shuffle
      const uniquePapers = removeDuplicates(allPapers)
      const shuffledPapers = shuffleArray(uniquePapers)
      
      setPosts(shuffledPapers.slice(0, 12))
      setLoadedPostIds(new Set(shuffledPapers.slice(0, 12).map(p => p.id)))
      setCurrentPage(1)
      setHasMore(shuffledPapers.length >= 8)
      
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
  }
}