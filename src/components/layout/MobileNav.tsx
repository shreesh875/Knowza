import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Bot, User } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/app', icon: Home },
  { name: 'Eden', href: '/app/brainmate', icon: Bot },
  { name: 'Profile', href: '/app/profile', icon: User },
]

export const MobileNav: React.FC = () => {
  return (
    <nav className="bg-white/10 backdrop-blur-xl border-t border-white/20">
      <div className="flex justify-around">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-purple-400'
                  : 'text-white/70 hover:text-white'
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