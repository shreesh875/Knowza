import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Bot, User, Moon, Sun, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useUser } from '../../contexts/UserContext'
import { Avatar } from '../ui/Avatar'

const navigation = [
  { name: 'Home', href: '/app', icon: Home },
  { name: 'Eden', href: '/app/brainmate', icon: Bot },
  { name: 'Profile', href: '/app/profile', icon: User },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: (collapsed: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { theme, toggleTheme } = useTheme()
  const { user, profile, signOut } = useUser()

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
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="h-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header with Logo and Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <img 
                  src="/Knowza Symbol.png" 
                  alt="Knowza" 
                  className="w-5 h-5"
                />
              </div>
              <span className="text-xl font-bold text-white">
                Knowza
              </span>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <img 
                  src="/Knowza Symbol.png" 
                  alt="Knowza" 
                  className="w-6 h-6"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={() => onToggleCollapse(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white ${
              isCollapsed ? 'absolute -right-2 top-4 bg-white/10 shadow-lg border border-white/20' : ''
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Profile */}
        {profile && (
          <div className={`p-4 border-b border-white/10 ${isCollapsed ? 'px-3' : ''}`}>
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <Avatar
                src={profile.avatar_url}
                alt={profile.full_name || profile.username}
                size={isCollapsed ? "lg" : "md"}
                fallback={profile.full_name || profile.username}
                className="ring-2 ring-purple-500/20"
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {profile.full_name || profile.username}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    @{profile.username}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/app'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
            >
              <item.icon className={`${isCollapsed ? 'w-7 h-7' : 'w-5 h-5'} flex-shrink-0`} />
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
        <div className="p-4">
          <div className="bg-white/5 rounded-xl p-3 space-y-2 border border-white/10">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 w-full px-3 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200 ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              {theme === 'dark' ? (
                <Sun className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} flex-shrink-0`} />
              ) : (
                <Moon className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} flex-shrink-0`} />
              )}
              {!isCollapsed && (
                <span className="truncate">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>
            
            <button 
              onClick={handleSignOut}
              className={`flex items-center gap-3 w-full px-3 py-3 text-sm font-medium text-white/80 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all duration-200 ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <LogOut className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} flex-shrink-0`} />
              {!isCollapsed && (
                <span className="truncate">Sign Out</span>
              )}
            </button>
          </div>
        </div>

        {/* Floating Indicator */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-1 h-12 bg-gradient-to-b from-purple-500 to-blue-600 rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  )
}