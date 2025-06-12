import React, { useState, useEffect } from 'react'
import { RefreshCw, Filter, Search } from 'lucide-react'
import { FeedPost } from '../components/feed/FeedPost'
import { Button } from '../components/ui/Button'
import { researchService, type ResearchPaper } from '../services/researchService'

const mockPosts = [
  {
    id: '1',
    title: 'Introduction to Neural Networks',
    description: 'A beginner-friendly overview of neural networks and their applications in modern AI systems.',
    author: 'Dr. Alex Chen',
    authorAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    timeAgo: '2h ago',
    contentType: 'video',
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 342,
    comments: 47,
    tags: ['Neural Networks', 'Deep Learning', 'AI Fundamentals']
  },
  {
    id: '2',
    title: 'Quantum Computing and Machine Learning',
    description: 'Exploring the intersection of quantum computing and machine learning algorithms.',
    author: 'Prof. Sarah Johnson',
    authorAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    timeAgo: '1d ago',
    contentType: 'paper',
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 256,
    comments: 32,
    tags: ['Quantum Computing', 'Machine Learning', 'Research']
  },
  {
    id: '3',
    title: 'The Future of Artificial Intelligence',
    description: 'A comprehensive look at emerging trends and future possibilities in AI development.',
    author: 'Dr. Michael Rodriguez',
    authorAvatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
    timeAgo: '3d ago',
    contentType: 'article',
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 189,
    comments: 28,
    tags: ['AI Future', 'Technology Trends', 'Innovation']
  }
]

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<any[]>(mockPosts)
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'papers' | 'videos' | 'articles'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Load research papers on component mount
  useEffect(() => {
    loadResearchPapers()
  }, [])

  const loadResearchPapers = async () => {
    setLoading(true)
    try {
      const papers = await researchService.fetchMixedResearchPapers(15)
      setResearchPapers(papers)
      
      // Merge with mock posts and sort by a mix of recency and engagement
      const allPosts = [...mockPosts, ...papers].sort(() => Math.random() - 0.5)
      setPosts(allPosts)
    } catch (error) {
      console.error('Error loading research papers:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshFeed = async () => {
    await loadResearchPapers()
  }

  const filteredPosts = posts.filter(post => {
    // Filter by content type
    if (filter !== 'all') {
      if (filter === 'papers' && post.contentType !== 'paper') return false
      if (filter === 'videos' && post.contentType !== 'video') return false
      if (filter === 'articles' && post.contentType !== 'article') return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.tags.some((tag: string) => tag.toLowerCase().includes(query))
      )
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Your Feed</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Latest research papers and educational content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshFeed}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search papers, topics, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400"
          />
        </div>

        {/* Content Type Filter */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'papers', label: 'Papers' },
            { key: 'videos', label: 'Videos' },
            { key: 'articles', label: 'Articles' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                filter === item.key
                  ? 'bg-white text-primary-600 shadow-sm dark:bg-neutral-700 dark:text-primary-400'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {posts.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Posts</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {researchPapers.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Research Papers</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {posts.filter(p => p.contentType === 'video').length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Videos</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {posts.filter(p => p.contentType === 'article').length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Articles</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
            <span className="text-neutral-600 dark:text-neutral-400">
              Loading latest research papers...
            </span>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {searchQuery 
                ? `No posts match "${searchQuery}". Try a different search term.`
                : 'No posts match the selected filter. Try changing your filter settings.'
              }
            </p>
            {(searchQuery || filter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setFilter('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Load More Button */}
      {!loading && filteredPosts.length > 0 && filteredPosts.length >= 10 && (
        <div className="text-center py-6">
          <Button
            variant="outline"
            onClick={refreshFeed}
            className="px-8"
          >
            Load More Papers
          </Button>
        </div>
      )}
    </div>
  )
}