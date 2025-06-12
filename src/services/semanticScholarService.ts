interface SemanticScholarPaper {
  paperId: string
  title: string
  abstract: string | null
  authors: Array<{ name: string }>
  year: number | null
  citationCount: number
  url: string | null
  venue: string | null
  fieldsOfStudy: string[] | null
}

interface SemanticScholarResponse {
  papers: SemanticScholarPaper[]
  total: number
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

class SemanticScholarService {
  private baseUrl: string

  constructor() {
    // Use the Supabase edge function endpoint
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/papers-api`
  }

  async searchPapers(
    query: string = 'artificial intelligence',
    limit: number = 10,
    offset: number = 0
  ): Promise<{ papers: FeedPost[], total: number }> {
    try {
      console.log('Searching papers with query:', query)
      
      const url = new URL(this.baseUrl)
      url.searchParams.set('query', query)
      url.searchParams.set('limit', limit.toString())
      url.searchParams.set('offset', offset.toString())

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

      const data: SemanticScholarResponse = await response.json()
      console.log('Papers fetched successfully:', data.papers?.length || 0)

      return {
        papers: data.papers || [],
        total: data.total || 0
      }
    } catch (error) {
      console.error('Error fetching papers:', error)
      throw new Error(`Failed to fetch papers: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPaperById(paperId: string): Promise<FeedPost | null> {
    try {
      console.log('Fetching paper by ID:', paperId)
      
      const url = new URL(this.baseUrl)
      url.searchParams.set('paperId', paperId)

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
      console.log('Paper fetched successfully:', data.paper ? 'Found' : 'Not found')

      return data.paper || null
    } catch (error) {
      console.error('Error fetching paper by ID:', error)
      throw new Error(`Failed to fetch paper: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPopularPapers(limit: number = 10): Promise<{ papers: FeedPost[], total: number }> {
    return this.searchPapers('machine learning deep learning', limit, 0)
  }

  async getPapersByField(field: string, limit: number = 10): Promise<{ papers: FeedPost[], total: number }> {
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
    return this.searchPapers(query, limit, 0)
  }

  // Generate realistic thumbnail URLs for papers
  private generatePaperThumbnail(paperId: string): string {
    const thumbnails = [
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
    
    // Use paper ID to consistently select the same thumbnail
    const index = paperId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % thumbnails.length
    return thumbnails[index]
  }
}

export default SemanticScholarService
export type { FeedPost, SemanticScholarPaper }