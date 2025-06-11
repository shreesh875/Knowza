import React from 'react'
import { Heart, MessageCircle, Bookmark, Share, Play, FileText, Video } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'

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
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'paper':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Your Feed</h1>
      </div>

      <div className="space-y-6">
        {mockPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="flex items-center gap-3 p-4">
                <Avatar src={post.authorAvatar} alt={post.author} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {post.author}
                    </h3>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {post.timeAgo}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {getContentIcon(post.contentType)}
                      <span className="capitalize">{post.contentType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-4">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {post.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {post.description}
                </p>

                {/* Thumbnail */}
                <div className="relative mb-4 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-64 object-cover"
                  />
                  {post.contentType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-4">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-neutral-600 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
                      <Share className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full dark:bg-primary-900/20 dark:text-primary-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}