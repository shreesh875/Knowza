import React, { useState, useEffect, useRef } from 'react'
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isNavHovered, setIsNavHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | 'direct'>('next')
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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      } else if (e.key === ' ') {
        e.preventDefault()
        togglePlayPause()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlide, isTransitioning])

  const nextSlide = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setSlideDirection('next')
    setCurrentSlide(prev => (prev + 1) % videoSlides.length)
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1000)
  }

  const prevSlide = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setSlideDirection('prev')
    setCurrentSlide(prev => (prev - 1 + videoSlides.length) % videoSlides.length)
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1000)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return
    
    setIsTransitioning(true)
    setSlideDirection('direct')
    setCurrentSlide(index)
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1000)
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

  // Get slide transform based on position and direction
  const getSlideTransform = (index: number) => {
    if (index === currentSlide) {
      return 'opacity-100 scale-100 translate-x-0 blur-0'
    }
    
    if (slideDirection === 'next') {
      if (index === (currentSlide - 1 + videoSlides.length) % videoSlides.length) {
        return 'opacity-0 scale-90 -translate-x-full blur-sm'
      } else if (index === (currentSlide + 1) % videoSlides.length) {
        return 'opacity-0 scale-90 translate-x-full blur-sm'
      }
    } else if (slideDirection === 'prev') {
      if (index === (currentSlide + 1) % videoSlides.length) {
        return 'opacity-0 scale-90 translate-x-full blur-sm'
      } else if (index === (currentSlide - 1 + videoSlides.length) % videoSlides.length) {
        return 'opacity-0 scale-90 -translate-x-full blur-sm'
      }
    }
    
    // For direct navigation or other slides
    return 'opacity-0 scale-85 translate-x-0 blur-md'
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
      </div>

      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div 
          className="bg-white/10 backdrop-blur-xl rounded-full px-8 py-2 border border-white/20 min-w-[900px]"
          onMouseEnter={() => setIsNavHovered(true)}
          onMouseLeave={() => setIsNavHovered(false)}
        >
          <div className="flex items-center justify-between h-12">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 cursor-pointer relative overflow-hidden">
              <img 
                src="/Knowza Symbol.png" 
                alt="Knowza" 
                className={`w-7 h-7 transition-transform duration-500 relative z-10 ${
                  isNavHovered ? 'rotate-180' : 'rotate-0'
                }`}
              />
              <span 
                className={`text-white font-bold text-xl transition-all duration-500 ease-out ${
                  isNavHovered 
                    ? 'opacity-100 transform translate-x-0' 
                    : 'opacity-0 transform -translate-x-4'
                }`}
              >
                Knowza
              </span>
            </div>
            
            {/* Centered Navigation Items */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-12">
              <a href="#features" className="text-white/80 hover:text-white hover:bg-white/10 px-6 py-2 rounded-full transition-all duration-200 text-base font-medium">
                Features
              </a>
              <a href="#about" className="text-white/80 hover:text-white hover:bg-white/10 px-6 py-2 rounded-full transition-all duration-200 text-base font-medium">
                About
              </a>
            </div>
            
            {/* Login Button */}
            <button 
              onClick={handleSignIn}
              className="text-white/80 hover:text-white hover:bg-white/10 px-6 py-2 rounded-full transition-all duration-200 text-base font-medium"
            >
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-none">
            <div className="bg-gradient-to-r from-gray-400/50 to-white/50 bg-clip-text text-transparent mb-6 pb-4 animate-gradient-x bg-[length:200%_200%] overflow-visible" style={{ lineHeight: '1.1' }}>
              The AI Learning
            </div>
            <div className="bg-gradient-to-r from-[#4AB0F3] via-[#B983FF] to-[#A4F34A] bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%] pb-4 overflow-visible" style={{ lineHeight: '1.1' }}>
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
        </div>
      </div>

      {/* Apple-Style Video Carousel */}
      <div id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Video Carousel Container */}
          <div className="relative flex items-center justify-center">
            {/* Left Peek Panel */}
            <div className="hidden lg:block absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
              <div className="w-32 h-72 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                <div 
                  className="w-full h-full bg-cover bg-center opacity-60 transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] transform hover:scale-105"
                  style={{ 
                    backgroundImage: `url(${videoSlides[(currentSlide - 1 + videoSlides.length) % videoSlides.length].posterUrl})` 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />
                <div className="absolute bottom-4 left-3 right-3">
                  <p className="text-white text-xs font-medium truncate transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    {videoSlides[(currentSlide - 1 + videoSlides.length) % videoSlides.length].title}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Peek Panel */}
            <div className="hidden lg:block absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
              <div className="w-32 h-72 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                <div 
                  className="w-full h-full bg-cover bg-center opacity-60 transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] transform hover:scale-105"
                  style={{ 
                    backgroundImage: `url(${videoSlides[(currentSlide + 1) % videoSlides.length].posterUrl})` 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/60" />
                <div className="absolute bottom-4 left-3 right-3">
                  <p className="text-white text-xs font-medium truncate transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    {videoSlides[(currentSlide + 1) % videoSlides.length].title}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Video Display */}
            <div className="relative h-[500px] w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl mx-auto">
              {/* Video Content */}
              <div className="relative w-full h-full">
                {videoSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${getSlideTransform(index)}`}
                    style={{
                      transformOrigin: 'center center',
                      willChange: 'transform, opacity, filter'
                    }}
                  >
                    <video
                      ref={el => videoRefs.current[index] = el}
                      className="w-full h-full object-cover transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" />
                    
                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="max-w-xl transform transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] translate-y-0 opacity-100">
                        <h3 className="text-3xl font-bold mb-3 text-white transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                          {slide.title}
                        </h3>
                        <p className="text-xl text-white/80 mb-4 font-medium transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                          {slide.subtitle}
                        </p>
                        <p className="text-sm text-white/70 leading-relaxed transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                          {slide.description}
                        </p>
                      </div>
                    </div>

                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-110 active:scale-95"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white ml-0" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:bg-white/10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:bg-white/10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Dot Navigation */}
          <div className="flex justify-center mt-8 space-x-3">
            {videoSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] disabled:cursor-not-allowed hover:scale-125 active:scale-110 ${
                  index === currentSlide
                    ? 'bg-white scale-125 shadow-lg shadow-white/30'
                    : 'bg-white/40 hover:bg-white/60 scale-100'
                }`}
              />
            ))}
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