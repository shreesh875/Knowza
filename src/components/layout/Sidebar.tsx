import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Bot, BarChart3, User, Moon, Sun, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useUser } from '../../contexts/UserContext'
import { Avatar } from '../ui/Avatar'

const navigation = [
  { name: 'Home', href: '/app', icon: Home },
  { name: 'Eden', href: '/app/brainmate', icon: Bot },
  { name: 'Leaderboard', href: '/app/leaderboard', icon: BarChart3 },
  { name: 'Profile', href: '/app/profile', icon: User },
]

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, profile, signOut } = useUser()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div 
      className={`fixed left-4 top-4 bottom-4 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className="h-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-neutral-700/50 shadow-2xl shadow-black/10 dark:shadow-black/30 flex flex-col overflow-hidden">
        {/* Header with Logo and Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200/50 dark:border-neutral-700/50">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <img 
                  src="/Knowza Symbol.png" 
                  alt="Knowza" 
                  className="w-5 h-5"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                Knowza
              </span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>
        </div>

        {/* User Profile */}
        {profile && (
          <div className={`p-4 border-b border-neutral-200/50 dark:border-neutral-700/50 ${isCollapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <Avatar
                src={profile.avatar_url}
                alt={profile.full_name || profile.username}
                size="md"
                fallback={profile.full_name || profile.username}
                className="ring-2 ring-primary-500/20"
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {profile.full_name || profile.username}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    @{profile.username}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        {profile.points}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        {profile.streak}d
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/50 dark:hover:text-white'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
              {!isCollapsed && (
                <div className="w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-700/50 space-y-2">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full px-3 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/50 dark:hover:text-white rounded-xl transition-all duration-200 ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className="truncate">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
          
          <button 
            onClick={handleSignOut}
            className={`flex items-center gap-3 w-full px-3 py-3 text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-all duration-200 ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="truncate">Sign Out</span>
            )}
          </button>
        </div>

        {/* Floating Indicator */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-1 h-12 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  )
}