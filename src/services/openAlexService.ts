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
  papers: OpenAlexWork[]
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
  content_type: 'paper' | 'video' | 'article'
  content_url: string
  thumbnail_url: string | null
  author: string
  published_at: string
  tags: string[]
  likes_count: number
  comments_count: number
  created_at: string
}

class OpenAlexService {
  private baseUrl: string

  constructor() {
    // Use the Supabase edge function endpoint
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openalex-api`
  }

  async searchWorks(
    query: string = 'artificial intelligence',
    page: number = 1,
    perPage: number = 10,
    filter?: string
  ): Promise<{ papers: FeedPost[], total: number, page: number, per_page: number }> {
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

      return {
        papers: data.papers || [],
        total: data.total || 0,
        page: data.page || 1,
        per_page: data.per_page || 10
      }
    } catch (error) {
      console.error('Error fetching OpenAlex works:', error)
      throw new Error(`Failed to fetch papers: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getWorkById(workId: string): Promise<FeedPost | null> {
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

      return data.paper || null
    } catch (error) {
      console.error('Error fetching OpenAlex work by ID:', error)
      throw new Error(`Failed to fetch paper: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTopics(
    page: number = 1,
    perPage: number = 25,
    filter?: string
  ): Promise<OpenAlexTopicsResponse> {
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