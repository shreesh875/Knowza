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
  papers: FeedPost[]
  total: number
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

class SemanticScholarService {
  private baseUrl: string

  constructor() {
    // Use the Supabase edge function endpoint
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/papers-api`
  }

  // Generate high-quality research paper thumbnails
  private generatePaperThumbnail(paperId: string, fieldsOfStudy: string[] = []): string {
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
      'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800',
      
      // Books and Academic
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1370296/pexels-photo-1370296.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1370298/pexels-photo-1370298.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1370300/pexels-photo-1370300.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
    
    // Use paper ID to consistently select the same thumbnail
    const index = paperId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % researchThumbnails.length
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

      // Transform the papers to ensure proper image URLs
      const transformedPapers = data.papers?.map(paper => ({
        ...paper,
        thumbnail: this.generatePaperThumbnail(paper.id, paper.tags),
        authorAvatar: this.generateAuthorAvatar(paper.author),
        timeAgo: paper.year ? this.formatTimeAgo(paper.year) : 'Unknown',
        contentType: 'paper' as const,
        source: 'semantic_scholar' as const
      })) || []

      return {
        papers: transformedPapers,
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

      if (data.paper) {
        return {
          ...data.paper,
          thumbnail: this.generatePaperThumbnail(data.paper.id, data.paper.tags),
          authorAvatar: this.generateAuthorAvatar(data.paper.author),
          timeAgo: data.paper.year ? this.formatTimeAgo(data.paper.year) : 'Unknown',
          contentType: 'paper' as const,
          source: 'semantic_scholar' as const
        }
      }

      return null
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
}

export default SemanticScholarService
export type { FeedPost, SemanticScholarPaper }