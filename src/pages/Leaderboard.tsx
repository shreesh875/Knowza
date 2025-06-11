import React, { useState } from 'react'
import { Trophy, Medal, Award, Globe, MapPin, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'

const mockLeaderboard = [
  {
    id: '1',
    name: 'James Wilson',
    username: '@quantum_master',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 875,
    streak: 12,
    rank: 1
  },
  {
    id: '2',
    name: 'Emma Davis',
    username: '@neuroscientist',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 743,
    streak: 8,
    rank: 2
  },
  {
    id: '3',
    name: 'David Zhang',
    username: '@ai_researcher',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 691,
    streak: 15,
    rank: 3
  },
  {
    id: '4',
    name: 'Sarah Kim',
    username: '@data_scientist',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 634,
    streak: 6,
    rank: 4
  },
  {
    id: '5',
    name: 'Alex Rodriguez',
    username: '@ml_engineer',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    points: 589,
    streak: 9,
    rank: 5
  }
]

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'regional' | 'friends'>('global')

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-neutral-500">{rank}</span>
    }
  }

  const tabs = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'regional', label: 'Regional', icon: MapPin },
    { id: 'friends', label: 'Friends', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Leaderboard</h1>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Resets in 12:34:56
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm dark:bg-neutral-700 dark:text-primary-400'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Top Learners</h2>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Today</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {mockLeaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 ${
                  index !== mockLeaderboard.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>
                
                <Avatar src={user.avatar} alt={user.name} size="md" />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {user.username}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-primary-600 dark:text-primary-400">
                    {user.points} pts
                  </p>
                  <div className="flex items-center gap-1 text-sm text-success-600 dark:text-success-400">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span>{user.streak} streak</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}