import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { Layout } from './components/layout/Layout'
// import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Home } from './pages/Home'
import { PostDetail } from './pages/PostDetail'
import { Leaderboard } from './pages/Leaderboard'
import { Profile } from './pages/Profile'
import { BrainMate } from './pages/BrainMate'
// import { SignIn } from './pages/SignIn'
// import { SignUp } from './pages/SignUp'
// import { InterestSelection } from './pages/InterestSelection'

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <Routes>
              {/* Temporarily disabled authentication routes */}
              {/*
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
              
              <Route 
                path="/onboarding/interests" 
                element={
                  <ProtectedRoute requireAuth={true} requireOnboarding={false}>
                    <InterestSelection />
                  </ProtectedRoute>
                } 
              />
              */}
              
              {/* Main application routes - now accessible without authentication */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="post/:postId" element={<PostDetail />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="brainmate" element={<BrainMate />} />
              </Route>
              
              {/* Redirect any auth routes to home */}
              <Route path="/signin" element={<Navigate to="/" replace />} />
              <Route path="/signup" element={<Navigate to="/" replace />} />
              <Route path="/onboarding/interests" element={<Navigate to="/" replace />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App