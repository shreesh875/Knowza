interface OpenAlexTopic {
  id: string
  display_name: string
  description: string
  keywords: string[]
  level: number
  works_count: number
  cited_by_count: number
  updated_date: string
}

interface OpenAlexWork {
  id: string
  title: string
  abstract_inverted_index?: Record<string, number[]>
  publication_year: number
  cited_by_count: number
  authors: Array<{
    author: {
      display_name: string
    }
  }>
  primary_location?: {
    source?: {
      display_name: string
    }
  }
  concepts: Array<{
    display_name: string
    level: number
  }>
  open_access?: {
    is_oa: boolean
    oa_url?: string
  }
}

interface SemanticScholarPaper {
  paperId: string
  title: string
  abstract: string
  authors: Array<{ name: string }>
  year: number
  citationCount: number
  url: string
  venue: string
  fieldsOfStudy: string[]
}

interface ResearchPaper {
  id: string
  title: string
  description: string
  author: string
  authorAvatar: string
  timeAgo: string
  contentType: 'paper'
  thumbnail: string
  likes: number
  comments: number
  tags: string[]
  source: 'openalex' | 'semantic_scholar'
  citationCount: number
  year: number
  url?: string
}

class ResearchService {
  private readonly openAlexBaseUrl = 'https://api.openalex.org'
  private readonly semanticScholarBaseUrl = 'https://api.semanticscholar.org/graph/v1'

  // Get random avatar for authors
  private getRandomAvatar(): string {
    const avatars = [
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150'
    ]
    return avatars[Math.floor(Math.random() * avatars.length)]
  }

  // Get random research thumbnail
  private getRandomThumbnail(): string {
    const thumbnails = [
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
    return thumbnails[Math.floor(Math.random() * thumbnails.length)]
  }

  // Format time ago
  private formatTimeAgo(year: number): string {
    const currentYear = new Date().getFullYear()
    const yearsAgo = currentYear - year
    
    if (yearsAgo === 0) return 'This year'
    if (yearsAgo === 1) return '1 year ago'
    return `${yearsAgo} years ago`
  }

  // Reconstruct abstract from inverted index
  private reconstructAbstract(invertedIndex: Record<string, number[]>): string {
    const words: string[] = []
    
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const position of positions) {
        words[position] = word
      }
    }
    
    return words.filter(Boolean).join(' ').slice(0, 300) + '...'
  }

  // Fetch papers from OpenAlex
  async fetchOpenAlexPapers(query: string = 'artificial intelligence', limit: number = 10): Promise<ResearchPaper[]> {
    try {
      const response = await fetch(
        `${this.openAlexBaseUrl}/works?search=${encodeURIComponent(query)}&per_page=${limit}&sort=cited_by_count:desc&filter=publication_year:>2020`
      )

      if (!response.ok) {
        throw new Error(`OpenAlex API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.results?.map((work: OpenAlexWork) => {
        const abstract = work.abstract_inverted_index 
          ? this.reconstructAbstract(work.abstract_inverted_index)
          : 'No abstract available'
        
        const authors = work.authors?.map(a => a.author.display_name).join(', ') || 'Unknown Author'
        const venue = work.primary_location?.source?.display_name || 'Unknown Venue'
        const concepts = work.concepts?.slice(0, 3).map(c => c.display_name) || []
        
        return {
          id: `openalex_${work.id.split('/').pop()}`,
          title: work.title || 'Untitled',
          description: abstract,
          author: `${authors} • ${venue}`,
          authorAvatar: this.getRandomAvatar(),
          timeAgo: this.formatTimeAgo(work.publication_year || new Date().getFullYear()),
          contentType: 'paper' as const,
          thumbnail: this.getRandomThumbnail(),
          likes: Math.floor(work.cited_by_count / 10) || Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          tags: concepts.length > 0 ? concepts : ['Research', 'Academic'],
          source: 'openalex' as const,
          citationCount: work.cited_by_count || 0,
          year: work.publication_year || new Date().getFullYear(),
          url: work.open_access?.oa_url
        }
      }) || []
    } catch (error) {
      console.error('Error fetching OpenAlex papers:', error)
      return []
    }
  }

  // Fetch papers from Semantic Scholar
  async fetchSemanticScholarPapers(query: string = 'machine learning', limit: number = 10): Promise<ResearchPaper[]> {
    try {
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))

      const response = await fetch(
        `${this.semanticScholarBaseUrl}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=paperId,title,abstract,authors,year,citationCount,url,venue,fieldsOfStudy`
      )

      if (!response.ok) {
        throw new Error(`Semantic Scholar API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.data?.map((paper: SemanticScholarPaper) => {
        const authors = paper.authors?.map(a => a.name).join(', ') || 'Unknown Author'
        const venue = paper.venue || 'Unknown Venue'
        
        return {
          id: `semantic_${paper.paperId}`,
          title: paper.title || 'Untitled',
          description: paper.abstract || 'No abstract available',
          author: `${authors} • ${venue}`,
          authorAvatar: this.getRandomAvatar(),
          timeAgo: this.formatTimeAgo(paper.year || new Date().getFullYear()),
          contentType: 'paper' as const,
          thumbnail: this.getRandomThumbnail(),
          likes: Math.floor(paper.citationCount / 10) || Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          tags: paper.fieldsOfStudy?.slice(0, 3) || ['Research', 'Academic'],
          source: 'semantic_scholar' as const,
          citationCount: paper.citationCount || 0,
          year: paper.year || new Date().getFullYear(),
          url: paper.url
        }
      }) || []
    } catch (error) {
      console.error('Error fetching Semantic Scholar papers:', error)
      return []
    }
  }

  // Get trending topics from OpenAlex
  async getTrendingTopics(limit: number = 20): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.openAlexBaseUrl}/topics?per_page=${limit}&sort=works_count:desc`
      )

      if (!response.ok) {
        throw new Error(`OpenAlex Topics API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.results?.map((topic: OpenAlexTopic) => topic.display_name) || []
    } catch (error) {
      console.error('Error fetching trending topics:', error)
      return [
        'Artificial Intelligence',
        'Machine Learning',
        'Deep Learning',
        'Neural Networks',
        'Computer Vision',
        'Natural Language Processing',
        'Quantum Computing',
        'Robotics',
        'Data Science',
        'Blockchain'
      ]
    }
  }

  // Fetch mixed research papers from both sources
  async fetchMixedResearchPapers(limit: number = 20): Promise<ResearchPaper[]> {
    try {
      const topics = await this.getTrendingTopics(10)
      const selectedTopics = topics.slice(0, 4) // Get top 4 topics
      
      const promises = []
      
      // Fetch from OpenAlex with different topics
      for (let i = 0; i < 2; i++) {
        const topic = selectedTopics[i] || 'artificial intelligence'
        promises.push(this.fetchOpenAlexPapers(topic, Math.ceil(limit / 4)))
      }
      
      // Fetch from Semantic Scholar with different topics
      for (let i = 2; i < 4; i++) {
        const topic = selectedTopics[i] || 'machine learning'
        promises.push(this.fetchSemanticScholarPapers(topic, Math.ceil(limit / 4)))
      }
      
      const results = await Promise.all(promises)
      const allPapers = results.flat()
      
      // Shuffle and limit results
      const shuffled = allPapers.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, limit)
    } catch (error) {
      console.error('Error fetching mixed research papers:', error)
      return []
    }
  }
}

export const researchService = new ResearchService()
export type { ResearchPaper }