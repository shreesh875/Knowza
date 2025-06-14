import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useUser()
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; startX: number; startY: number; endX: number; endY: number; delay: number }>>([])

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
      const side = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
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

      // Remove shooting star after animation
      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star.id !== newShootingStar.id))
      }, 2200)
    }

    const interval = setInterval(() => {
      generateShootingStar()
    }, Math.random() * 25000 + 20000) // 20-45 seconds

    return () => clearInterval(interval)
  }, [])

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

      {/* Features Preview Section */}
      <div id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Discover how Knowza transforms learning into an engaging, social experience
          </h2>
          
          {/* Placeholder for carousel - will be implemented in next phase */}
          <div className="mt-16 h-96 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-[#4AB0F3] to-[#B983FF] rounded-full mx-auto mb-6 opacity-50"></div>
              <h3 className="text-2xl font-bold mb-4">Interactive Features</h3>
              <p className="text-white/60">Carousel coming soon...</p>
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