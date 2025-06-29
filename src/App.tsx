import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { Home } from './pages/Home'
import { PostDetail } from './pages/PostDetail'
import { Profile } from './pages/Profile'
import { BrainMate } from './pages/BrainMate'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { InterestSelection } from './pages/InterestSelection'

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <Routes>
              {/* Landing page for non-authenticated users */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LandingPage />
                  </ProtectedRoute>
                } 
              />
              
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
              
              {/* Fallback - redirect to landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App