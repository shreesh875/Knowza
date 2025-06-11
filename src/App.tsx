import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Leaderboard } from './pages/Leaderboard'
import { Profile } from './pages/Profile'
import { BrainMate } from './pages/BrainMate'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="brainmate" element={<BrainMate />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App