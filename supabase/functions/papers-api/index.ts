import { corsHeaders } from '../_shared/cors.ts'

const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1'
const API_KEY = 'Eig1SjMOPd1wbMqXoizgd5zdK9r4waAra66nCVuz'

interface Paper {
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

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Increase delay significantly - 2 seconds base delay, exponential backoff for retries
      const delay = attempt === 1 ? 2000 : 2000 * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      const response = await fetch(url, options)
      
      if (response.status === 429) {
        console.log(`Rate limited (attempt ${attempt}/${maxRetries}), retrying...`)
        if (attempt === maxRetries) {
          throw new Error(`Rate limit exceeded after ${maxRetries} attempts`)
        }
        continue
      }
      
      return response
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      console.log(`Request failed (attempt ${attempt}/${maxRetries}), retrying...`)
    }
  }
  
  throw new Error('Max retries exceeded')
}

// Format authors to show only top 3 contributors
function formatAuthors(authors: Array<{ name: string }>): string {
  if (!authors || authors.length === 0) {
    return 'Unknown'
  }
  
  // Take only the first 3 authors
  const topAuthors = authors.slice(0, 3)
  const authorNames = topAuthors.map(a => a.name)
  
  if (authors.length <= 3) {
    return authorNames.join(', ')
  } else {
    // Show first 3 authors and indicate there are more
    return `${authorNames.join(', ')} et al.`
  }
}

// Generate realistic thumbnail URLs for papers
function generatePaperThumbnail(paperId: string): string {
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
  
  // Use paper ID to consistently select the same thumbnail
  const index = paperId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % thumbnails.length
  return thumbnails[index]
}

// Transform paper data to our format
function transformPaper(paper: Paper) {
  return {
    id: paper.paperId,
    title: paper.title,
    description: paper.abstract || 'No abstract available',
    content_type: 'paper',
    content_url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
    thumbnail_url: generatePaperThumbnail(paper.paperId),
    author: formatAuthors(paper.authors),
    published_at: paper.year ? `${paper.year}-01-01` : new Date().toISOString(),
    tags: paper.fieldsOfStudy || [],
    likes_count: Math.floor(paper.citationCount / 10) || 0,
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
    const paperId = url.searchParams.get('paperId')
    
    // If paperId is provided, fetch single paper details
    if (paperId) {
      console.log(`Fetching single paper: ${paperId}`)
      
      const response = await fetchWithRetry(
        `${SEMANTIC_SCHOLAR_API}/paper/${paperId}?fields=paperId,title,abstract,authors,year,citationCount,url,venue,fieldsOfStudy`,
        {
          headers: {
            'User-Agent': 'BrainFeed/1.0 (educational-platform)',
            'x-api-key': API_KEY,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log(`Single paper API response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Semantic Scholar API error: ${response.status} - ${errorText}`)
        throw new Error(`Semantic Scholar API error: ${response.status}`)
      }

      const paper: Paper = await response.json()
      console.log(`Successfully fetched paper: ${paper.title}`)
      
      const transformedPaper = transformPaper(paper)

      return new Response(
        JSON.stringify({ paper: transformedPaper }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }
    
    // Otherwise, search for papers
    const query = url.searchParams.get('query') || 'artificial intelligence'
    const limit = url.searchParams.get('limit') || '10'
    const offset = url.searchParams.get('offset') || '0'

    console.log(`Searching papers: query="${query}", limit=${limit}, offset=${offset}`)

    const response = await fetchWithRetry(
      `${SEMANTIC_SCHOLAR_API}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&fields=paperId,title,abstract,authors,year,citationCount,url,venue,fieldsOfStudy`,
      {
        headers: {
          'User-Agent': 'BrainFeed/1.0 (educational-platform)',
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log(`Search API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Semantic Scholar API error: ${response.status} - ${errorText}`)
      throw new Error(`Semantic Scholar API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched ${data.data?.length || 0} papers`)
    
    // Transform the data to match our expected format
    const papers = data.data?.map(transformPaper) || []

    return new Response(
      JSON.stringify({ papers, total: data.total || 0 }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error fetching papers:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch papers',
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