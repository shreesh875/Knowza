import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

interface VideoSlide {
  id: number
  title: string
  subtitle: string
  description: string
  videoUrl: string
  posterUrl: string
  type: 'video' | 'image'
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useUser()
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; startX: number; startY: number; endX: number; endY: number; delay: number }>>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const videoSlides: VideoSlide[] = [
    {
      id: 1,
      title: "AI-Powered Learning",
      subtitle: "Smart. Adaptive. Personal.",
      description: "Experience personalized learning that adapts to your pace and style with advanced AI algorithms.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      posterUrl: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
      type: 'video'
    },
    {
      id: 2,
      title: "Social Learning",
      subtitle: "Connect. Collaborate. Compete.",
      description: "Join study groups, compete on leaderboards, and learn together with peers worldwide.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      posterUrl: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
      type: 'video'
    },
    {
      id: 3,
      title: "Interactive Content",
      subtitle: "Engage. Practice. Master.",
      description: "Interactive quizzes, simulations, and hands-on exercises make learning engaging and effective.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      posterUrl: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
      type: 'video'
    },
    {
      id: 4,
      title: "Expert Tutors",
      subtitle: "Learn. Guide. Excel.",
      description: "Get personalized guidance from expert tutors and AI-powered teaching assistants.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      posterUrl: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800",
      type: 'video'
    },
    {
      id: 5,
      title: "Progress Tracking",
      subtitle: "Monitor. Analyze. Improve.",
      description: "Track your learning progress with detailed analytics and personalized insights.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      posterUrl: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800",
      type: 'video'
    }
  ]

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      if (profile?.onboarding_completed) {
        navigate('/app')
      } else {
        navigate('/onboarding/interests')
      }
    }
  }, [user, profile, loading, navigate])

  // Generate stars on mount
  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 80; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 3
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  // Generate shooting stars periodically
  useEffect(() => {
    const generateShootingStar = () => {
      const side = Math.floor(Math.random() * 4)
      let startX, startY, endX, endY

      switch (side) {
        case 0: // top
          startX = Math.random() * 100
          startY = -5
          endX = Math.random() * 100
          endY = 105
          break
        case 1: // right
          startX = 105
          startY = Math.random() * 100
          endX = -5
          endY = Math.random() * 100
          break
        case 2: // bottom
          startX = Math.random() * 100
          startY = 105
          endX = Math.random() * 100
          endY = -5
          break
        case 3: // left
          startX = -5
          startY = Math.random() * 100
          endX = 105
          endY = Math.random() * 100
          break
        default:
          startX = startY = endX = endY = 0
      }

      const newShootingStar = {
        id: Date.now(),
        startX,
        startY,
        endX,
        endY,
        delay: 0
      }

      setShootingStars(prev => [...prev, newShootingStar])

      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star.id !== newShootingStar.id))
      }, 2200)
    }

    const interval = setInterval(() => {
      generateShootingStar()
    }, Math.random() * 25000 + 20000)

    return () => clearInterval(interval)
  }, [])

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % videoSlides.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [videoSlides.length])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => (prev - 1 + videoSlides.length) % videoSlides.length)
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => (prev + 1) % videoSlides.length)
      } else if (e.key === ' ') {
        e.preventDefault()
        togglePlayPause()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [videoSlides.length])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % videoSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + videoSlides.length) % videoSlides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const togglePlayPause = () => {
    const currentVideo = videoRefs.current[currentSlide]
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause()
      } else {
        currentVideo.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleGetStarted = () => {
    navigate('/signup')
  }

  const handleSignIn = () => {
    navigate('/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative">
      {/* Starry Background */}
      <div className="absolute inset-0">
        {/* Static Stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}

        {/* Shooting Stars */}
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-gradient-to-r from-white to-blue-400 rounded-full animate-shooting-star"
            style={{
              left: `${star.startX}%`,
              top: `${star.startY}%`,
              '--end-x': `${star.endX - star.startX}vw`,
              '--end-y': `${star.endY - star.startY}vh`,
            } as React.CSSProperties}
          />
        ))}

        {/* Constellation Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <path
            d="M100,200 Q200,100 300,200 T500,200"
            stroke="white"
            strokeWidth="1"
            fill="none"
            className="animate-draw-line"
            style={{ animationDelay: '2s' }}
          />
          <path
            d="M600,300 L700,250 L750,350 L650,400 Z"
            stroke="white"
            strokeWidth="1"
            fill="none"
            className="animate-draw-line"
            style={{ animationDelay: '4s' }}
          />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-xl rounded-full px-12 py-4 border border-white/20 min-w-[800px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 group cursor-pointer">
              <img 
                src="/Knowza Symbol.png" 
                alt="Knowza" 
                className="w-8 h-8 transition-transform duration-300 group-hover:rotate-180"
              />
              <span className="text-white font-bold text-xl transition-all duration-300 group-hover:text-[#4AB0F3]">
                Knowza
              </span>
            </div>
            
            <div className="flex items-center space-x-10">
              <a href="#features" className="text-white/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-full transition-all duration-200 text-lg">
                Features
              </a>
              <a href="#about" className="text-white/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-full transition-all duration-200 text-lg">
                About
              </a>
              <button 
                onClick={handleSignIn}
                className="text-white/80 hover:text-white hover:bg-white/10 px-8 py-3 rounded-full transition-all duration-200 text-lg font-medium"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <div className="bg-gradient-to-r from-gray-400/50 to-white/50 bg-clip-text text-transparent mb-4">
              The AI Learning
            </div>
            <div className="bg-gradient-to-r from-[#4AB0F3] via-[#B983FF] to-[#A4F34A] bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]">
              Revolution
            </div>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed">
            Automatically make learning addictive. Knowza transforms science education into 
            social media with AI-powered personalization and study sessions.
          </p>
          
          <button 
            onClick={handleGetStarted}
            className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl hover:shadow-white/20"
          >
            Join for free
          </button>
          
          <p className="text-white/40 mt-6 text-sm">
            Currently in development • Coming to iOS & Android
          </p>
        </div>
      </div>

      {/* Apple-Style Video Carousel */}
      <div id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Discover how Knowza transforms learning into an engaging, social experience
            </h2>
          </div>

          {/* Video Carousel Container */}
          <div className="relative">
            {/* Main Video Display */}
            <div className="relative h-[600px] bg-black rounded-3xl overflow-hidden shadow-2xl">
              {/* Video Content */}
              <div className="relative w-full h-full">
                {videoSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      index === currentSlide 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95'
                    }`}
                  >
                    <video
                      ref={el => videoRefs.current[index] = el}
                      className="w-full h-full object-cover"
                      poster={slide.posterUrl}
                      muted
                      loop
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <source src={slide.videoUrl} type="video/mp4" />
                    </video>
                    
                    {/* Video Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-12">
                      <div className="max-w-2xl">
                        <h3 className="text-5xl font-bold mb-4 text-white">
                          {slide.title}
                        </h3>
                        <p className="text-2xl text-white/80 mb-6 font-medium">
                          {slide.subtitle}
                        </p>
                        <p className="text-lg text-white/70 leading-relaxed">
                          {slide.description}
                        </p>
                      </div>
                    </div>

                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white ml-0" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Dot Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              {videoSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-white scale-125'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6 max-w-md mx-auto">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#4AB0F3] to-[#B983FF] transition-all duration-700 ease-out"
                  style={{ width: `${((currentSlide + 1) / videoSlides.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-white/60">
                <span>{currentSlide + 1} of {videoSlides.length}</span>
                <span>Features</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="relative z-10 py-20 px-4 bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            How can we help with your learning?
          </h2>
          
          <p className="text-xl text-white/70 mb-16 max-w-4xl mx-auto">
            Knowza uses AI to create personalized learning experiences that feel like social media, with study 
            sessions, expert tutors, and peer collaboration - all in one platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-[#4AB0F3] transition-colors duration-300">10M+</h3>
              <p className="text-white/60">Research papers and educational content</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🚀</div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-[#B983FF] transition-colors duration-300">AI-Powered</h3>
              <p className="text-white/60">Personalized learning paths and recommendations</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🌟</div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-[#A4F34A] transition-colors duration-300">Social</h3>
              <p className="text-white/60">Learn together with peers and expert tutors</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Experience the Future of Learning
          </h2>
          
          <p className="text-xl text-white/70 mb-12">
            Discover how AI-powered personalization, social engagement, and interactive study sessions will 
            transform your educational journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-[#4AB0F3] to-[#B983FF] text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl"
            >
              Get Started Free
            </button>
            <button 
              onClick={handleSignIn}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}