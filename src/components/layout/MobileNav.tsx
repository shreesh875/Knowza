import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Bot, BarChart3, User } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'BrainMate', href: '/brainmate', icon: Bot },
  { name: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
]

export const MobileNav: React.FC = () => {
  return (
    <nav className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
      <div className="flex justify-around">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}