import React, { useState } from 'react'
import { Edit, Trophy, Target, Calendar } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'

const interests = ['Artificial Intelligence', 'Machine Learning', 'Data Science']

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'achievements'>('posts')

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'saved', label: 'Saved' },
    { id: 'achievements', label: 'Achievements' },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800"></div>
        <CardContent className="relative px-6 pb-6">
          <div className="flex items-end gap-4 -mt-16">
            <Avatar
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
              alt="Demo User"
              size="xl"
              className="border-4 border-white dark:border-neutral-800"
            />
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Demo User</h1>
                  <p className="text-neutral-600 dark:text-neutral-400">@demouser</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">120 points</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-medium dark:bg-success-900/20 dark:text-success-400">
              <Target className="w-4 h-4" />
              <span>3 day streak</span>
            </div>
          </div>

          {/* Interests */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full dark:bg-primary-900/20 dark:text-primary-400"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm dark:bg-neutral-700 dark:text-primary-400'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-neutral-500 dark:text-neutral-400">
            {activeTab === 'posts' && 'No posts yet.'}
            {activeTab === 'saved' && 'No saved content yet.'}
            {activeTab === 'achievements' && 'No achievements yet.'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}