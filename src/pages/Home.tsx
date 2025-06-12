import React, { useState, useEffect } from 'react'
import { FeedPost } from '../components/feed/FeedPost'

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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Your Feed</h1>
      </div>

      <div className="space-y-6">
        {mockPosts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}