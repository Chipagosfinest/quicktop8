"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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

export default function AppPage() {
  const [fid, setFid] = useState("")
  const [friends, setFriends] = useState<MutualFollow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isInMiniApp, setIsInMiniApp] = useState(false)

  // Check if we're in a Mini App environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInMiniApp(window.location.href.includes('farcaster.com') || window.location.href.includes('warpcast.com'))
    }
  }, [])

  const handleGetTop8 = async () => {
    if (!fid) {
      setError("Please enter a FID")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/top8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fid: parseInt(fid) }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch Top 8")
      }

      setFriends(data.friends || [])
      
      if (data.message) {
        console.log(data.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              QuickTop8
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              Discover your longest-standing mutual follows with engagement history
            </p>
            <div className="flex justify-center gap-2">
              {isInMiniApp && (
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                  🎯 Mini App
                </Badge>
              )}
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                🔗 Mutual Follows
              </Badge>
            </div>
          </div>

          {/* FID Input */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Find Your Top 8</CardTitle>
              <CardDescription>
                Enter a Farcaster ID (FID) to discover their longest-standing mutual follows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={fid}
                  onChange={(e) => setFid(e.target.value)}
                  placeholder="Enter FID (e.g., 194, 4044)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <Button 
                  onClick={handleGetTop8}
                  disabled={loading || !fid}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                >
                  {loading ? 'Loading...' : 'Find Top 8'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <p className="text-red-700 dark:text-red-300 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {friends.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Top 8 Mutual Follows
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {friends.map((friend, index) => (
                  <Card key={friend.fid} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.pfp_url} alt={friend.display_name} />
                          <AvatarFallback>{friend.display_name?.charAt(0) || friend.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold truncate dark:text-white">
                            {friend.display_name || friend.username}
                          </CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{friend.username}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {friend.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {friend.bio}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Followed since:</span>
                          <span className="font-medium dark:text-white">{formatDate(friend.followDate)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">First engagement:</span>
                          <span className="font-medium flex items-center gap-1 dark:text-white">
                            {getEngagementIcon(friend.engagementType)}
                            {formatDate(friend.firstEngagement)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Total interactions:</span>
                          <span className="font-medium dark:text-white">{friend.totalInteractions}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Relationship score:</span>
                          <span className="font-medium dark:text-white">{friend.relationshipScore}</span>
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
            <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <p className="text-gray-600 dark:text-gray-300">
                  No mutual follows with engagement found for this FID. Try with a different FID or check back later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 