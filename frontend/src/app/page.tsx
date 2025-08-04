

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface MutualFollow {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  followDate: string
  firstEngagement: string
  engagementType: 'like' | 'recast' | 'reply'
  totalInteractions: number
  relationshipScore: number
}

export default function HomePage() {
  const [friends, setFriends] = useState<MutualFollow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fid, setFid] = useState<string>('')

  const fetchTop8 = async (fid: string) => {
    if (!fid) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/top8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fid: parseInt(fid) }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setFriends(data.friends || [])
      } else {
        setError(data.error || 'Failed to fetch top 8')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTop8(fid)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEngagementIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️'
      case 'recast': return '🔄'
      case 'reply': return '💬'
      default: return '💬'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            QuickTop8
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover your longest-standing mutual follows with engagement history
          </p>
          
          {/* FID Input */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="number"
                value={fid}
                onChange={(e) => setFid(e.target.value)}
                placeholder="Enter Farcaster ID (FID)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <Button 
                type="submit" 
                disabled={loading || !fid}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                {loading ? 'Loading...' : 'Find Top 8'}
              </Button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-700 text-center">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {friends.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Your Top 8 Mutual Follows
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friends.map((friend, index) => (
                <Card key={friend.fid} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friend.pfp_url} alt={friend.display_name} />
                        <AvatarFallback>{friend.display_name?.charAt(0) || friend.username?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">
                          {friend.display_name || friend.username}
                        </CardTitle>
                        <p className="text-sm text-gray-500 truncate">@{friend.username}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {friend.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {friend.bio}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Followed since:</span>
                        <span className="font-medium">{formatDate(friend.followDate)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">First engagement:</span>
                        <span className="font-medium flex items-center gap-1">
                          {getEngagementIcon(friend.engagementType)}
                          {formatDate(friend.firstEngagement)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total interactions:</span>
                        <span className="font-medium">{friend.totalInteractions}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Relationship score:</span>
                        <span className="font-medium">{friend.relationshipScore}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && friends.length === 0 && fid && (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  No mutual follows with engagement found for this FID. Try with a different FID or check back later.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
