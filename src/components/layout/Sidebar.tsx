import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Bot, BarChart3, User, Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { Avatar } from '../ui/Avatar'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'BrainMate', href: '/brainmate', icon: Bot },
  { name: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
]

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <img 
          src="/BrainFeed No bg Logo(only symbol).png" 
          alt="BrainFeed" 
          className="w-8 h-8"
        />
        <span className="text-xl font-bold text-neutral-900 dark:text-white">BrainFeed</span>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <Avatar
          src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
          alt="Demo User"
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
            Demo User
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            @demouser
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-neutral-200 dark:border-neutral-700 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        
        <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )
}