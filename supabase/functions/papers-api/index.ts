import { corsHeaders } from '../_shared/cors.ts'

const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1'

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('query') || 'artificial intelligence'
    const limit = url.searchParams.get('limit') || '10'
    const offset = url.searchParams.get('offset') || '0'

    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))

    const response = await fetch(
      `${SEMANTIC_SCHOLAR_API}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&fields=paperId,title,abstract,authors,year,citationCount,url,venue,fieldsOfStudy`,
      {
        headers: {
          'User-Agent': 'BrainFeed/1.0 (educational-platform)',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Semantic Scholar API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform the data to match our expected format
    const papers = data.data?.map((paper: Paper) => ({
      id: paper.paperId,
      title: paper.title,
      description: paper.abstract || 'No abstract available',
      content_type: 'paper',
      content_url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      thumbnail_url: null,
      author: paper.authors?.map(a => a.name).join(', ') || 'Unknown',
      published_at: paper.year ? `${paper.year}-01-01` : null,
      tags: paper.fieldsOfStudy || [],
      likes_count: Math.floor(paper.citationCount / 10) || 0,
      comments_count: Math.floor(Math.random() * 50),
    })) || []

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