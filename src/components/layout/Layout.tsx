import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  )
}