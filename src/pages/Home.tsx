import React, { useState } from 'react'
import { Search, Bell, Settings, Bookmark, Eye, Calendar, TrendingUp, Users, Globe } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useFeedData } from '../hooks/useFeedData'

const mockNewsData = [
  {
    id: '1',
    title: 'Microsoft launches deepfake detector tool ahead of US election',
    category: 'TECHNOLOGY',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
    timeAgo: '2h ago',
    source: 'TechCrunch'
  },
  {
    id: '2',
    title: 'To build responsibly, tech needs to do more than just hire chief ethics officers',
    category: 'TECHNOLOGY',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
    timeAgo: '4h ago',
    source: 'VentureBeat'
  },
  {
    id: '3',
    title: 'Teamwork startup PaperTrails gets $54 million - Series B',
    category: 'STARTUP',
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400',
    timeAgo: '6h ago',
    source: 'TechCrunch'
  },
  {
    id: '4',
    title: 'The IPO parade continues as Wish files, Bumble targets continue as',
    category: 'BUSINESS',
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400',
    timeAgo: '8h ago',
    source: 'Forbes'
  },
  {
    id: '5',
    title: 'Hypatos gets $11.8M for a deep learning approach',
    category: 'AI',
    image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    timeAgo: '10h ago',
    source: 'VentureBeat'
  }
]

const mockBookmarks = [
  {
    id: '1',
    title: 'Teamwork startup PaperTrails gets $54 million - Series B',
    category: 'TECHNOLOGY',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    timeAgo: '2 days ago'
  },
  {
    id: '2',
    title: 'The IPO parade continues as Wish files, Bumble targets continue as',
    category: 'BUSINESS',
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=200',
    timeAgo: '3 days ago'
  },
  {
    id: '3',
    title: 'Hypatos gets $11.8M for a deep learning approach',
    category: 'AI',
    image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=200',
    timeAgo: '5 days ago'
  }
]

const mockVideos = [
  {
    id: '1',
    title: 'The IPO parade continues as Wish files, Bumble targets continue as',
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=300',
    duration: '12:34',
    views: '1.2M views'
  },
  {
    id: '2',
    title: 'Hypatos gets $11.8M for a deep learning approach',
    thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=300',
    duration: '8:45',
    views: '856K views'
  }
]

const mockNotifications = [
  {
    id: '1',
    title: 'Teamwork startup PaperTrails gets $54 million - Series B',
    timeAgo: '13 April, 2020',
    description: 'The IPO parade continues as Wish files, Bumble targets continue as'
  },
  {
    id: '2',
    title: 'The IPO parade continues as Wish files, Bumble targets continue as',
    timeAgo: '13 April, 2020',
    description: 'The IPO parade continues as Wish files, Bumble targets continue as'
  },
  {
    id: '3',
    title: 'The IPO parade continues as Wish files, Bumble targets continue as',
    timeAgo: '13 April, 2020',
    description: 'Bumble targets continue as'
  }
]

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Home')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'Home', label: 'Home', icon: null },
    { id: 'News', label: 'News', icon: null },
    { id: 'Bookmarks', label: 'Bookmarks', icon: null },
    { id: 'Search', label: 'Search', icon: null },
    { id: 'Notifications', label: 'Notifications', icon: null },
    { id: 'Settings', label: 'Settings', icon: null }
  ]

  const renderHomeContent = () => (
    <div className="space-y-6">
      {/* Featured Article */}
      <Card className="overflow-hidden">
        <div className="relative">
          <img 
            src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800" 
            alt="Featured"
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              TECHNOLOGY
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-white text-2xl font-bold mb-2">
              Microsoft launches deepfake detector tool ahead of US election
            </h2>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span>Latest News</span>
              <span>•</span>
              <span>2h ago</span>
            </div>
          </div>
        </div>
      </Card>

      {/* News List */}
      <div className="space-y-4">
        {mockNewsData.slice(1).map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex gap-4 p-4">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {article.category}
                    </span>
                    <span className="text-gray-500 text-xs">{article.timeAgo}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{article.source}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderNewsContent = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest News</h2>
      {mockNewsData.map((article) => (
        <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              <img 
                src={article.image} 
                alt={article.title}
                className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {article.category}
                  </span>
                  <span className="text-gray-500 text-xs">{article.timeAgo}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm">{article.source}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderBookmarksContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Collections</h2>
        <Button variant="outline" size="sm">
          <Bookmark className="w-4 h-4 mr-2" />
          Manage
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {mockBookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <img 
                src={bookmark.image} 
                alt={bookmark.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                  {bookmark.category}
                </span>
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                  {bookmark.title}
                </h3>
                <p className="text-gray-500 text-xs">{bookmark.timeAgo}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest bookmarks</h3>
        <div className="space-y-3">
          {mockBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img 
                src={bookmark.image} 
                alt={bookmark.title}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                  {bookmark.title}
                </h4>
                <p className="text-gray-500 text-xs">{bookmark.timeAgo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSearchContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Search</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, videos, and more..."
            className="pl-10 py-3"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Virtual Reality</h3>
        <p className="text-gray-600 mb-4">13 Videos</p>
        
        <div className="grid grid-cols-2 gap-4">
          {mockVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                    {video.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  <p className="text-gray-500 text-xs">{video.views}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">78 News</h3>
        <div className="space-y-3">
          {mockNewsData.slice(0, 3).map((article) => (
            <div key={article.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img 
                src={article.image} 
                alt={article.title}
                className="w-16 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                  {article.title}
                </h4>
                <p className="text-gray-500 text-xs">{article.source} • {article.timeAgo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderNotificationsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Unread</h2>
      
      <div className="space-y-4">
        {mockNotifications.map((notification) => (
          <Card key={notification.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {notification.description}
                  </p>
                  <p className="text-gray-500 text-xs">{notification.timeAgo}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Other</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">Bug report</p>
              <p className="text-gray-500 text-xs">Report issues and feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Globe className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">Where the app</p>
              <p className="text-gray-500 text-xs">Download mobile apps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      <div className="space-y-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Profile settings</h3>
                <p className="text-gray-500 text-sm">Manage your account</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">News settings</h3>
                <p className="text-gray-500 text-sm">Customize your feed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Notifications</h3>
                <p className="text-gray-500 text-sm">Manage notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Privacy</h3>
                <p className="text-gray-500 text-sm">Control what others can see</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return renderHomeContent()
      case 'News':
        return renderNewsContent()
      case 'Bookmarks':
        return renderBookmarksContent()
      case 'Search':
        return renderSearchContent()
      case 'Notifications':
        return renderNotificationsContent()
      case 'Settings':
        return renderSettingsContent()
      default:
        return renderHomeContent()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/Knowza Symbol.png" 
                alt="Knowza" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900">Knowza</span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}