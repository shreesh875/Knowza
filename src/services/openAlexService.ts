import { rateLimiter } from './rateLimiter'

interface OpenAlexWork {
  id: string
  title: string
  abstract_inverted_index?: Record<string, number[]>
  authorships: Array<{
    author: {
      display_name: string
    }
  }>
  publication_year: number
  cited_by_count: number
  open_access: {
    is_oa: boolean
    oa_url?: string
  }
  primary_location?: {
    source?: {
      display_name: string
    }
  }
  concepts: Array<{
    display_name: string
    level: number
  }>
  doi?: string
}

interface OpenAlexResponse {
  papers: FeedPost[]
  total: number
  page: number
  per_page: number
}

interface OpenAlexTopic {
  id: string
  display_name: string
  description: string
  keywords: string[]
  works_count: number
  cited_by_count: number
  subfield: {
    display_name: string
  }
  field: {
    display_name: string
  }
  domain: {
    display_name: string
  }
}

interface OpenAlexTopicsResponse {
  topics: OpenAlexTopic[]
  meta: {
    count: number
    per_page: number
    page: number
  }
}

interface FeedPost {
  id: string
  title: string
  description: string
  author: string
  authorAvatar: string
  timeAgo: string
  contentType: 'paper' | 'video' | 'article'
  thumbnail: string
  likes: number
  comments: number
  tags: string[]
  source?: 'openalex' | 'semantic_scholar'
  citationCount?: number
  year?: number
  url?: string
}

class OpenAlexService {
  private baseUrl: string

  constructor() {
    // Use the Supabase edge function endpoint
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openalex-api`
  }

  // Generate high-quality research paper thumbnails
  private generatePaperThumbnail(workId: string): string {
    const researchThumbnails = [
      // Science and Technology
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg?auto=compress&cs=tinysrgb&w=800',
      
      // AI and Machine Learning themed
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
      
      // Laboratory and Research
      'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1366942/pexels-photo-1366942.jpeg?auto=compress&cs=tinysrgb&w=800',
      
      // Data and Analytics
      'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
    
    // Use work ID to consistently select the same thumbnail
    const index = workId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % researchThumbnails.length
    return researchThumbnails[index]
  }

  // Generate author avatars
  private generateAuthorAvatar(authorName: string): string {
    const avatars = [
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150'
    ]
    
    // Use author name to consistently select the same avatar
    const index = authorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatars.length
    return avatars[index]
  }

  // Format time ago
  private formatTimeAgo(year: number): string {
    const currentYear = new Date().getFullYear()
    const yearsAgo = currentYear - year
    
    if (yearsAgo === 0) return 'This year'
    if (yearsAgo === 1) return '1 year ago'
    if (yearsAgo <= 5) return `${yearsAgo} years ago`
    return `${year}`
  }

  async searchWorks(
    query: string = 'artificial intelligence',
    page: number = 1,
    perPage: number = 10,
    filter?: string
  ): Promise<{ papers: FeedPost[], total: number, page: number, per_page: number }> {
    return rateLimiter.addRequest(async () => {
      try {
        console.log('Searching OpenAlex works with query:', query)
        
        const url = new URL(this.baseUrl)
        url.searchParams.set('endpoint', 'works')
        url.searchParams.set('query', query)
        url.searchParams.set('page', page.toString())
        url.searchParams.set('per_page', perPage.toString())
        
        if (filter) {
          url.searchParams.set('filter', filter)
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: OpenAlexResponse = await response.json()
        console.log('OpenAlex works fetched successfully:', data.papers?.length || 0)

        // Transform the papers to ensure proper image URLs
        const transformedPapers = data.papers?.map(paper => ({
          ...paper,
          thumbnail: this.generatePaperThumbnail(paper.id),
          authorAvatar: this.generateAuthorAvatar(paper.author),
          timeAgo: paper.year ? this.formatTimeAgo(paper.year) : 'Unknown',
          contentType: 'paper' as const,
          source: 'openalex' as const
        })) || []

        return {
          papers: transformedPapers,
          total: data.total || 0,
          page: data.page || 1,
          per_page: data.per_page || 10
        }
      } catch (error) {
        console.error('Error fetching OpenAlex works:', error)
        throw new Error(`Failed to fetch papers: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }

  async getWorkById(workId: string): Promise<FeedPost | null> {
    return rateLimiter.addRequest(async () => {
      try {
        console.log('Fetching OpenAlex work by ID:', workId)
        
        const url = new URL(this.baseUrl)
        url.searchParams.set('endpoint', 'works')
        url.searchParams.set('workId', workId)

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('OpenAlex work fetched successfully:', data.paper ? 'Found' : 'Not found')

        if (data.paper) {
          return {
            ...data.paper,
            thumbnail: this.generatePaperThumbnail(data.paper.id),
            authorAvatar: this.generateAuthorAvatar(data.paper.author),
            timeAgo: data.paper.year ? this.formatTimeAgo(data.paper.year) : 'Unknown',
            contentType: 'paper' as const,
            source: 'openalex' as const
          }
        }

        return null
      } catch (error) {
        console.error('Error fetching OpenAlex work by ID:', error)
        throw new Error(`Failed to fetch paper: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }

  async getTopics(
    page: number = 1,
    perPage: number = 25,
    filter?: string
  ): Promise<OpenAlexTopicsResponse> {
    return rateLimiter.addRequest(async () => {
      try {
        console.log('Fetching OpenAlex topics')
        
        const url = new URL(this.baseUrl)
        url.searchParams.set('endpoint', 'topics')
        url.searchParams.set('page', page.toString())
        url.searchParams.set('per_page', perPage.toString())
        
        if (filter) {
          url.searchParams.set('filter', filter)
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: OpenAlexTopicsResponse = await response.json()
        console.log('OpenAlex topics fetched successfully:', data.topics?.length || 0)

        return data
      } catch (error) {
        console.error('Error fetching OpenAlex topics:', error)
        throw new Error(`Failed to fetch topics: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }

  async getWorksByTopic(
    topicId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<{ papers: FeedPost[], total: number, page: number, per_page: number }> {
    const filter = `concepts.id:${topicId}`
    return this.searchWorks('', page, perPage, filter)
  }

  async getWorksByField(
    field: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<{ papers: FeedPost[], total: number, page: number, per_page: number }> {
    const fieldQueries: Record<string, string> = {
      'ai': 'artificial intelligence machine learning',
      'ml': 'machine learning neural networks',
      'physics': 'quantum physics theoretical physics',
      'biology': 'molecular biology genetics',
      'chemistry': 'organic chemistry materials science',
      'neuroscience': 'neuroscience brain cognitive science',
      'computer-science': 'computer science algorithms',
      'data-science': 'data science statistics analytics',
      'robotics': 'robotics automation control systems',
      'quantum': 'quantum computing quantum information'
    }

    const query = fieldQueries[field] || field
    return this.searchWorks(query, page, perPage)
  }

  async getPopularWorks(
    page: number = 1,
    perPage: number = 10
  ): Promise<{ papers: FeedPost[], total: number, page: number, per_page: number }> {
    return this.searchWorks('machine learning deep learning', page, perPage)
  }
}

export default OpenAlexService
export type { FeedPost, OpenAlexWork, OpenAlexTopic }