import { corsHeaders } from '../_shared/cors.ts'

const OPENALEX_API = 'https://api.openalex.org'

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
  results: OpenAlexWork[]
  meta: {
    count: number
    per_page: number
    page: number
  }
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
  results: OpenAlexTopic[]
  meta: {
    count: number
    per_page: number
    page: number
  }
}

// Convert inverted index back to abstract text
function reconstructAbstract(invertedIndex: Record<string, number[]>): string {
  if (!invertedIndex) return ''
  
  const words: string[] = []
  const maxPosition = Math.max(...Object.values(invertedIndex).flat())
  
  // Initialize array with empty strings
  for (let i = 0; i <= maxPosition; i++) {
    words[i] = ''
  }
  
  // Place words at their positions
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const position of positions) {
      words[position] = word
    }
  }
  
  return words.filter(word => word).join(' ')
}

// Format authors to show only top 3 contributors
function formatAuthors(authorships: Array<{ author: { display_name: string } }>): string {
  if (!authorships || authorships.length === 0) {
    return 'Unknown'
  }
  
  // Take only the first 3 authors
  const topAuthors = authorships.slice(0, 3)
  const authorNames = topAuthors.map(a => a.author.display_name)
  
  if (authorships.length <= 3) {
    return authorNames.join(', ')
  } else {
    // Show first 3 authors and indicate there are more
    return `${authorNames.join(', ')} et al.`
  }
}

// Generate realistic thumbnail URLs for papers
function generatePaperThumbnail(workId: string): string {
  const thumbnails = [
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800'
  ]
  
  // Use work ID to consistently select the same thumbnail
  const index = workId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % thumbnails.length
  return thumbnails[index]
}

// Transform OpenAlex work to our format
function transformWork(work: OpenAlexWork) {
  const workId = work.id.replace('https://openalex.org/', '')
  const abstract = work.abstract_inverted_index ? reconstructAbstract(work.abstract_inverted_index) : ''
  
  // Get URL - prefer DOI, fallback to OpenAlex URL
  let contentUrl = work.id
  if (work.doi) {
    contentUrl = work.doi.startsWith('http') ? work.doi : `https://doi.org/${work.doi.replace('https://doi.org/', '')}`
  } else if (work.open_access?.oa_url) {
    contentUrl = work.open_access.oa_url
  }
  
  return {
    id: workId,
    title: work.title || 'Untitled',
    description: abstract || 'No abstract available',
    content_type: 'paper',
    content_url: contentUrl,
    thumbnail_url: generatePaperThumbnail(workId),
    author: formatAuthors(work.authorships),
    published_at: work.publication_year ? `${work.publication_year}-01-01` : new Date().toISOString(),
    tags: work.concepts?.filter(c => c.level <= 2).map(c => c.display_name).slice(0, 5) || [],
    likes_count: Math.floor(work.cited_by_count / 10) || 0,
    comments_count: Math.floor(Math.random() * 50),
    created_at: new Date().toISOString(),
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint') || 'works'
    
    if (endpoint === 'topics') {
      // Fetch research topics
      const page = url.searchParams.get('page') || '1'
      const perPage = url.searchParams.get('per_page') || '25'
      const filter = url.searchParams.get('filter') || ''
      
      console.log(`Fetching topics: page=${page}, per_page=${perPage}`)
      
      let apiUrl = `${OPENALEX_API}/topics?page=${page}&per-page=${perPage}&sort=works_count:desc`
      if (filter) {
        apiUrl += `&filter=${encodeURIComponent(filter)}`
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'BrainFeed/1.0 (educational-platform)',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`OpenAlex API error: ${response.status}`)
      }

      const data: OpenAlexTopicsResponse = await response.json()
      console.log(`Successfully fetched ${data.results?.length || 0} topics`)

      return new Response(
        JSON.stringify({
          topics: data.results || [],
          meta: data.meta || { count: 0, per_page: 25, page: 1 }
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }
    
    // Handle works endpoint
    const workId = url.searchParams.get('workId')
    
    // If workId is provided, fetch single work details
    if (workId) {
      console.log(`Fetching single work: ${workId}`)
      
      const response = await fetch(`${OPENALEX_API}/works/${workId}`, {
        headers: {
          'User-Agent': 'BrainFeed/1.0 (educational-platform)',
          'Accept': 'application/json',
        },
      })

      console.log(`Single work API response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`OpenAlex API error: ${response.status}`)
      }

      const work: OpenAlexWork = await response.json()
      console.log(`Successfully fetched work: ${work.title}`)
      
      const transformedWork = transformWork(work)

      return new Response(
        JSON.stringify({ paper: transformedWork }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }
    
    // Otherwise, search for works
    const query = url.searchParams.get('query') || 'artificial intelligence'
    const page = url.searchParams.get('page') || '1'
    const perPage = url.searchParams.get('per_page') || '10'
    const filter = url.searchParams.get('filter') || ''

    console.log(`Searching works: query="${query}", page=${page}, per_page=${perPage}`)

    // Build the API URL with search parameters
    let apiUrl = `${OPENALEX_API}/works?search=${encodeURIComponent(query)}&page=${page}&per-page=${perPage}&sort=cited_by_count:desc`
    
    if (filter) {
      apiUrl += `&filter=${encodeURIComponent(filter)}`
    }

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'BrainFeed/1.0 (educational-platform)',
        'Accept': 'application/json',
      },
    })

    console.log(`Search API response status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`OpenAlex API error: ${response.status}`)
    }

    const data: OpenAlexResponse = await response.json()
    console.log(`Successfully fetched ${data.results?.length || 0} works`)
    
    // Transform the data to match our expected format
    const papers = data.results?.map(transformWork) || []

    return new Response(
      JSON.stringify({ 
        papers, 
        total: data.meta?.count || 0,
        page: data.meta?.page || 1,
        per_page: data.meta?.per_page || 10
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error fetching from OpenAlex:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch papers from OpenAlex',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})