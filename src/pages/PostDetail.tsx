import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share, Send } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { useUser } from '../contexts/UserContext'
import { supabase } from '../lib/supabase'

// Mock data - in a real app, this would come from your API
const mockPosts = [
  {
    id: '1',
    title: 'Introduction to Neural Networks',
    description: 'A beginner-friendly overview of neural networks and their applications in modern AI systems.',
    content: `Neural networks are computational models inspired by the human brain's structure and function. They consist of interconnected nodes (neurons) that process information through weighted connections.

## Key Components

### 1. Neurons (Nodes)
Each neuron receives inputs, processes them using an activation function, and produces an output. The basic structure includes:
- Input layer: Receives raw data
- Hidden layers: Process information through weighted connections
- Output layer: Produces final results

### 2. Weights and Biases
- **Weights**: Determine the strength of connections between neurons
- **Biases**: Allow neurons to activate even when inputs are zero

### 3. Activation Functions
Common activation functions include:
- **ReLU (Rectified Linear Unit)**: f(x) = max(0, x)
- **Sigmoid**: f(x) = 1 / (1 + e^(-x))
- **Tanh**: f(x) = (e^x - e^(-x)) / (e^x + e^(-x))

## Training Process

Neural networks learn through a process called backpropagation:

1. **Forward Pass**: Data flows from input to output
2. **Loss Calculation**: Compare predicted vs actual outputs
3. **Backward Pass**: Adjust weights to minimize loss
4. **Iteration**: Repeat until convergence

## Applications

Neural networks excel in various domains:
- **Computer Vision**: Image recognition, object detection
- **Natural Language Processing**: Translation, sentiment analysis
- **Speech Recognition**: Voice assistants, transcription
- **Recommendation Systems**: Content and product suggestions

## Types of Neural Networks

### Feedforward Networks
Information flows in one direction from input to output.

### Convolutional Neural Networks (CNNs)
Specialized for processing grid-like data such as images.

### Recurrent Neural Networks (RNNs)
Can process sequences of data by maintaining internal memory.

### Long Short-Term Memory (LSTM)
A type of RNN that can learn long-term dependencies.

## Getting Started

To begin working with neural networks:

1. **Learn the fundamentals** of linear algebra and calculus
2. **Choose a framework** like TensorFlow, PyTorch, or Keras
3. **Start with simple projects** like digit recognition
4. **Gradually increase complexity** as you gain experience

Neural networks represent a powerful tool in the machine learning toolkit, offering solutions to complex problems across numerous fields.`,
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
    content: `Quantum computing represents a paradigm shift in computational power, offering exponential speedups for certain types of problems. When combined with machine learning, it opens up new possibilities for solving complex optimization and pattern recognition tasks.

## Quantum Computing Fundamentals

### Qubits vs Classical Bits
- **Classical bits**: Can be either 0 or 1
- **Qubits**: Can exist in superposition of both 0 and 1 simultaneously

### Key Quantum Phenomena
- **Superposition**: Qubits can be in multiple states simultaneously
- **Entanglement**: Qubits can be correlated in ways that classical systems cannot
- **Interference**: Quantum states can interfere constructively or destructively

## Quantum Machine Learning Algorithms

### 1. Quantum Support Vector Machines
Leverage quantum feature maps to classify data in high-dimensional spaces more efficiently than classical methods.

### 2. Quantum Neural Networks
Implement neural network computations using quantum circuits, potentially offering exponential speedups.

### 3. Quantum Principal Component Analysis
Perform dimensionality reduction on quantum data exponentially faster than classical PCA.

### 4. Variational Quantum Eigensolvers (VQE)
Hybrid quantum-classical algorithms for optimization problems in machine learning.

## Applications

### Drug Discovery
Quantum computers can simulate molecular interactions more accurately, accelerating the discovery of new pharmaceuticals.

### Financial Modeling
Portfolio optimization and risk analysis can benefit from quantum algorithms' ability to explore multiple scenarios simultaneously.

### Cryptography and Security
Quantum machine learning can enhance both cryptographic methods and their analysis.

## Current Limitations

### Noise and Decoherence
Current quantum computers are noisy and lose quantum information quickly.

### Limited Qubit Count
Today's quantum computers have relatively few qubits compared to what's needed for large-scale applications.

### Error Rates
Quantum operations are prone to errors, requiring sophisticated error correction schemes.

## The Road Ahead

### Near-term Applications
- Quantum advantage in specific optimization problems
- Hybrid quantum-classical algorithms
- Quantum-inspired classical algorithms

### Long-term Vision
- Fault-tolerant quantum computers
- Quantum internet and distributed quantum computing
- Revolutionary advances in AI and machine learning

The intersection of quantum computing and machine learning represents one of the most exciting frontiers in technology, promising to solve problems that are intractable for classical computers.`,
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
    content: `Artificial Intelligence stands at the threshold of unprecedented advancement. As we look toward the future, several key trends and developments are shaping the landscape of AI technology and its applications across industries.

## Current State of AI

### Machine Learning Dominance
Today's AI is primarily driven by machine learning, particularly deep learning neural networks that have achieved remarkable success in:
- Image and speech recognition
- Natural language processing
- Game playing and strategic thinking
- Autonomous systems

### Limitations of Current AI
Despite impressive achievements, current AI systems face significant limitations:
- Lack of general intelligence
- Brittleness and lack of robustness
- Limited ability to transfer learning across domains
- Dependence on large datasets

## Emerging Trends

### 1. Artificial General Intelligence (AGI)
The holy grail of AI research, AGI represents systems that can understand, learn, and apply intelligence across a wide range of tasks at human level.

**Timeline Predictions:**
- Conservative estimates: 2040-2060
- Optimistic projections: 2030-2040
- Challenges remain significant

### 2. Multimodal AI Systems
Future AI will seamlessly integrate multiple types of data:
- Text, images, audio, and video
- Sensor data from IoT devices
- Real-time environmental information

### 3. Explainable AI (XAI)
As AI systems become more complex, the need for transparency grows:
- Interpretable machine learning models
- AI decision auditing capabilities
- Regulatory compliance requirements

### 4. Edge AI and Distributed Intelligence
Moving AI processing closer to data sources:
- Reduced latency and bandwidth requirements
- Enhanced privacy and security
- Autonomous operation in disconnected environments

## Transformative Applications

### Healthcare Revolution
- Personalized medicine based on genetic profiles
- Real-time health monitoring and prediction
- AI-assisted surgery and diagnosis
- Drug discovery acceleration

### Autonomous Everything
- Self-driving vehicles and transportation systems
- Autonomous drones for delivery and surveillance
- Smart cities with self-managing infrastructure
- Robotic assistants in homes and workplaces

### Scientific Discovery
- AI-driven hypothesis generation
- Automated experimentation and analysis
- Climate modeling and environmental protection
- Space exploration and astronomy

### Creative Industries
- AI-generated art, music, and literature
- Personalized entertainment content
- Interactive and immersive experiences
- Collaborative human-AI creativity

## Challenges and Considerations

### Ethical Implications
- Bias and fairness in AI systems
- Privacy and surveillance concerns
- Autonomous weapons and military applications
- Impact on employment and society

### Technical Challenges
- Energy consumption and environmental impact
- Cybersecurity and AI safety
- Data quality and availability
- Computational resource requirements

### Regulatory and Governance
- International AI governance frameworks
- Standards and certification processes
- Liability and accountability questions
- Balancing innovation with safety

## Preparing for the AI Future

### Education and Workforce Development
- Reskilling and upskilling programs
- AI literacy for all professions
- New educational paradigms
- Lifelong learning approaches

### Infrastructure Requirements
- High-performance computing resources
- Advanced networking capabilities
- Data storage and management systems
- Energy-efficient hardware

### Collaboration and Partnerships
- Public-private partnerships
- International cooperation
- Academic-industry collaboration
- Open source development

## Conclusion

The future of AI holds immense promise for solving humanity's greatest challenges while also presenting significant risks that must be carefully managed. Success will require thoughtful planning, ethical consideration, and collaborative effort across all sectors of society.

As we stand on the brink of this AI revolution, our choices today will determine whether artificial intelligence becomes humanity's greatest tool for progress or its greatest challenge. The future is not predetermined – it is ours to shape.`,
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

interface Comment {
  id: string
  content: string
  author: string
  authorAvatar: string
  timeAgo: string
  userId: string
}

export const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user } = useUser()
  
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [justLiked, setJustLiked] = useState(false)

  useEffect(() => {
    // Find the post by ID
    const foundPost = mockPosts.find(p => p.id === postId)
    if (foundPost) {
      setPost(foundPost)
      setLikesCount(foundPost.likes)
      loadComments()
      checkLikeStatus()
    }
  }, [postId])

  const checkLikeStatus = async () => {
    if (!user || !postId) return

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (data && !error) {
        setIsLiked(true)
      }
    } catch (error) {
      // User hasn't liked this post yet
      setIsLiked(false)
    }
  }

  const loadComments = async () => {
    if (!postId) return

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!inner(username, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedComments = (data || []).map(comment => {
        const profile = comment.profiles as any
        return {
          id: comment.id,
          content: comment.content,
          author: profile.full_name || profile.username,
          authorAvatar: profile.avatar_url || '',
          timeAgo: new Date(comment.created_at).toLocaleDateString(),
          userId: comment.user_id
        }
      })

      setComments(formattedComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleLike = async () => {
    if (!user || !postId || isLiking) return

    setIsLiking(true)

    try {
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (error) throw error

        setIsLiked(false)
        setLikesCount(prev => prev - 1)
        setJustLiked(false)
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        if (error) throw error

        setIsLiked(true)
        setLikesCount(prev => prev + 1)
        setJustLiked(true)
        
        // Remove the "just liked" animation after a short delay
        setTimeout(() => setJustLiked(false), 600)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('Failed to update like. Please try again.')
    } finally {
      setIsLiking(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !postId || !newComment.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      await loadComments() // Reload comments to show the new one
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Post not found
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Feed
      </Button>

      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-6">
            <Avatar src={post.authorAvatar} alt={post.author} size="md" />
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {post.author}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {post.timeAgo} • {post.contentType}
              </p>
            </div>
          </div>

          {/* Title and Description */}
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
            {post.description}
          </p>

          {/* Thumbnail */}
          <div className="relative mb-6 rounded-lg overflow-hidden">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-80 object-cover"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full dark:bg-primary-900/20 dark:text-primary-400"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-700">
            <button 
              onClick={handleLike}
              disabled={isLiking || !user}
              className={`flex items-center gap-2 transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-neutral-600 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''} ${
                justLiked ? 'scale-110' : 'scale-100'
              }`}
            >
              <Heart 
                className={`w-6 h-6 transition-all duration-200 ${
                  isLiked ? 'fill-current' : ''
                } ${justLiked ? 'animate-pulse' : ''}`} 
              />
              <span className={`font-medium transition-all duration-200 ${
                justLiked ? 'text-red-500 font-bold' : ''
              }`}>
                {likesCount}
                {justLiked && (
                  <span className="ml-1 text-sm animate-bounce">+1</span>
                )}
              </span>
            </button>
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">{comments.length}</span>
            </div>
            <button className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
              <Bookmark className="w-6 h-6" />
            </button>
            <button className="p-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
              <Share className="w-6 h-6" />
            </button>
          </div>

          {/* Like Status Indicator */}
          {isLiked && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                <Heart className="w-4 h-4 fill-current" />
                <span>You liked this post</span>
                {justLiked && (
                  <span className="text-xs animate-pulse">• Just now</span>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {post.content.split('\n').map((paragraph: string, index: number) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white">
                    {paragraph.replace('## ', '')}
                  </h2>
                )
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">
                    {paragraph.replace('### ', '')}
                  </h3>
                )
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <li key={index} className="ml-4 text-neutral-700 dark:text-neutral-300">
                    {paragraph.replace('- ', '')}
                  </li>
                )
              }
              if (paragraph.trim() === '') {
                return <br key={index} />
              }
              return (
                <p key={index} className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {paragraph}
                </p>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <Avatar 
                  src={user.user_metadata?.avatar_url} 
                  alt={user.user_metadata?.full_name || 'You'} 
                  size="md" 
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      type="submit" 
                      disabled={!newComment.trim() || isSubmitting}
                      size="sm"
                    >
                      {isSubmitting ? (
                        'Posting...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center">
              <p className="text-neutral-600 dark:text-neutral-400">
                Please sign in to add a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar 
                    src={comment.authorAvatar} 
                    alt={comment.author} 
                    size="md"
                    fallback={comment.author}
                  />
                  <div className="flex-1">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {comment.author}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {comment.timeAgo}
                        </span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}