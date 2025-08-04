

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TopInteraction {
  fid: number
  username: string
  displayName: string
  avatar: string
  followerCount: number
  userScore: number
  verified: boolean
  interactionCount: number
  likes: number
  replies: number
  recasts: number
}

interface UserData {
  fid: number
  username: string
  displayName: string
  avatar: string
  bio: string
  followerCount: number
  followingCount: number
  castCount: number
  verified: boolean
  message: string
  test: boolean
  hasTopInteractions: boolean
  hasRealData: boolean
  topInteractions: TopInteraction[]
  cached: boolean
}

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fid, setFid] = useState<string>('')
  const [hasSearched, setHasSearched] = useState(false)

  const fetchUserData = async (fid: string) => {
    if (!fid.trim()) {
      setError('Please enter a valid FID')
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)
    
    try {
      const response = await fetch(`/api/user?fid=${fid.trim()}`)
      const data = await response.json()
      
      if (response.ok) {
        setUserData(data)
      } else {
        setError(data.error || 'Failed to fetch user data')
        setUserData(null)
      }
    } catch (err) {
      setError('Network error occurred')
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchUserData(fid)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your Farcaster interactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">QuickTop8</h1>
          <p className="text-gray-600">Your Top Farcaster Friends</p>
        </div>

        {/* Search Section */}
        {!userData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">🔍 Find Your Top 8 Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label htmlFor="fid" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your Farcaster ID (FID)
                  </label>
                  <input
                    id="fid"
                    type="number"
                    placeholder="e.g., 4044"
                    value={fid}
                    onChange={(e) => setFid(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={loading || !fid.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Analyzing...' : 'Find My Top 8'}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  We'll analyze your recent casts to find who interacts with you most
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={() => {
                    setError(null)
                    setHasSearched(false)
                    setUserData(null)
                  }}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Info */}
        {userData && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userData.avatar} alt={userData.displayName} />
                    <AvatarFallback>{userData.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{userData.displayName}</CardTitle>
                    <p className="text-gray-600">@{userData.username}</p>
                    <div className="flex space-x-4 mt-2">
                      <span className="text-sm text-gray-500">{userData.followerCount} followers</span>
                      <span className="text-sm text-gray-500">{userData.followingCount} following</span>
                      <span className="text-sm text-gray-500">{userData.castCount} casts</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setUserData(null)
                    setFid('')
                    setError(null)
                    setHasSearched(false)
                  }}
                  variant="outline"
                >
                  Search Another User
                </Button>
              </div>
            </CardHeader>
            {userData.bio && (
              <CardContent>
                <p className="text-gray-700">{userData.bio}</p>
              </CardContent>
            )}
          </Card>
        )}

        {/* Top Interactions */}
        {userData?.hasTopInteractions && userData.topInteractions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Your Top 8 Friends
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userData.topInteractions.map((interaction, index) => (
                <Card key={interaction.fid} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-3">
                        <AvatarImage src={interaction.avatar} alt={interaction.displayName} />
                        <AvatarFallback>{interaction.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-gray-800 mb-1">{interaction.displayName}</h3>
                      <p className="text-sm text-gray-600 mb-2">@{interaction.username}</p>
                      
                      <div className="flex justify-center space-x-2 mb-3">
                        {interaction.verified && (
                          <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Likes:</span>
                          <span className="font-medium">{interaction.likes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Replies:</span>
                          <span className="font-medium">{interaction.replies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recasts:</span>
                          <span className="font-medium">{interaction.recasts}</span>
                        </div>
                        <div className="border-t pt-1 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-purple-600">{interaction.interactionCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Interactions */}
        {userData && !userData.hasTopInteractions && !loading && !error && hasSearched && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">No recent interactions found.</p>
              <p className="text-sm text-gray-500">
                This could mean:
              </p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• You haven't posted many casts recently</li>
                <li>• Your casts don't have many interactions yet</li>
                <li>• The user might be new to Farcaster</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Welcome State */}
        {!userData && !hasSearched && !error && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">Enter a Farcaster ID above to discover your top 8 friends!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
