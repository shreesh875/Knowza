import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Home } from './pages/Home'
import { PostDetail } from './pages/PostDetail'
import { Profile } from './pages/Profile'
import { BrainMate } from './pages/BrainMate'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { InterestSelection } from './pages/InterestSelection'

function App() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([])

  // Generate animated stars for global background
  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 120; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 3,
          size: Math.random() * 3 + 1
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Global Animated Space Background */}
            <div className="fixed inset-0 z-0">
              {/* Stars */}
              {stars.map((star) => (
                <div
                  key={star.id}
                  className="absolute rounded-full bg-white animate-twinkle"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animationDelay: `${star.delay}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
              
              {/* Floating Particles */}
              <div className="absolute inset-0">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${3 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20" />
            </div>

            {/* Main Content */}
            <div className="relative z-10">
              <Routes>
                {/* Authentication routes */}
                <Route 
                  path="/signin" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <SignIn />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <SignUp />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Onboarding route */}
                <Route 
                  path="/onboarding/interests" 
                  element={
                    <ProtectedRoute requireAuth={true} requireOnboarding={false}>
                      <InterestSelection />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Main application routes - require authentication */}
                <Route path="/app" element={
                  <ProtectedRoute requireAuth={true} requireOnboarding={true}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Home />} />
                  <Route path="post/:postId" element={<PostDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="brainmate" element={<BrainMate />} />
                </Route>
                
                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/signin" replace />} />
              </Routes>
            </div>
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App