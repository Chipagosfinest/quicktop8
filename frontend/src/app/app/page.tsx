"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'

interface Friend {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  followDate: string
  firstEngagement: string
  engagementType: string
  totalInteractions: number
  relationshipScore: number
  originalEngagementCastHash: string
  originalEngagementCastUrl: string
  rideOrDieScore: number
  daysSinceFirstEngagement: number
  engagementFrequency: number
}

export default function App() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const [userFid, setUserFid] = useState<number | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  const { isSDKLoaded, isConnected, userFid: contextUserFid, context, signInWithFarcaster } = useMiniApp()

  // Mini App detection pattern from Farcaster docs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const isMini = url.pathname.startsWith('/app') || url.searchParams.get('miniApp') === 'true'
      setIsInMiniApp(isMini)
      
      if (isMini) {
        console.log('Detected Mini App environment')
        // Lazy load the SDK for Mini App specific functionality
        import('@farcaster/miniapp-sdk').then(({ sdk }) => {
          console.log('Mini App SDK loaded')
          // Mini App specific bootstrap here
          sdk.actions.ready().then(() => {
            console.log('Mini App ready - splash screen hidden')
          }).catch((err) => {
            console.log('Ready() call failed (may be running outside Mini App):', err)
          })
        })
      }
    }
  }, [])

  useEffect(() => {
    if (isSDKLoaded && isConnected && contextUserFid) {
      const fid = parseInt(contextUserFid)
      setUserFid(fid)
      const profile = {
        fid: fid,
        username: (context as any)?.user?.username || `user_${fid}`,
        displayName: (context as any)?.user?.displayName || `User ${fid}`,
        pfpUrl: (context as any)?.user?.pfpUrl || ''
      }
      setUserProfile(profile)
      handleGetTop8(fid)
    }
  }, [isSDKLoaded, isConnected, contextUserFid, context])

  const handleGetTop8 = async (fid: number) => {
    if (!fid) {
      setError("No FID detected. Please try again.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/top8?fid=${fid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setFriends(data.friends || [])
    } catch (error) {
      console.error('Error fetching top 8:', error)
      setError(error instanceof Error ? error.message : "Failed to fetch your top 8 friends")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getEngagementIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️'
      case 'recast': return '🔄'
      case 'reply': return '💬'
      default: return '🤝'
    }
  }

  const getWantedBadge = (score: number) => {
    if (score >= 500) return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">🏆 Legend</span>
    if (score >= 200) return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">⭐ All-Star</span>
    if (score >= 50) return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold">🎖️ Hall of Famer</span>
    return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">🤠 Wanted</span>
  }

  if (!isSDKLoaded && isInMiniApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 dark:text-amber-300">Connecting to Farcaster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 relative overflow-hidden">
      {/* Cowboy Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-amber-400 rounded-full transform rotate-12 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-orange-400 rounded-full transform -rotate-12 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-yellow-400 rounded-full transform rotate-30 animate-pulse"></div>
        <div className="absolute top-60 left-1/4 w-12 h-12 bg-red-400 rounded-full transform -rotate-45 animate-bounce"></div>
        <div className="absolute bottom-40 right-1/3 w-18 h-18 bg-brown-400 rounded-full transform rotate-60 animate-pulse"></div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-amber-800 bg-opacity-90 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider border border-amber-600">
          QUICKTOP8
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-amber-500 animate-bounce">
              🤠
            </div>
            <h1 className="text-4xl font-bold text-amber-900 ml-4 drop-shadow-lg">
              Wanted: Top 8 Friends
            </h1>
          </div>
          <p className="text-amber-800 text-lg mb-2 drop-shadow-md">
            Your most engaged mutual friends on Farcaster! 🤠
          </p>
          <div className="flex justify-center space-x-2 mb-4">
            <span className="bg-amber-800 bg-opacity-20 text-amber-800 px-3 py-1 rounded-full text-sm border border-amber-600">🤠 Wanted Posters</span>
            <span className="bg-orange-800 bg-opacity-20 text-orange-800 px-3 py-1 rounded-full text-sm border border-orange-600">💫 Ride or Die</span>
            <span className="bg-yellow-800 bg-opacity-20 text-yellow-800 px-3 py-1 rounded-full text-sm border border-yellow-600">🌟 Friendship Goals</span>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-amber-500 animate-spin mx-auto mb-4">
              🤠
            </div>
            <p className="text-amber-800 text-lg">Loading your wanted friends...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
              ⚠️
            </div>
            <p className="text-amber-800 text-lg mb-4">{error}</p>
            <button
              onClick={() => {
                if (userFid) {
                  handleGetTop8(userFid);
                }
              }}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors border-2 border-amber-500"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && friends.length > 0 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                Wanted Friends 🤠
              </h2>
              <p className="text-amber-800 opacity-90">
                Your top 8 mutual friends based on engagement!
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend, index) => (
                <div
                  key={friend.fid}
                  className={`bg-amber-50 bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 transition-all duration-300 hover:scale-105 ${
                    index % 2 === 0 
                      ? 'border-amber-400 hover:border-amber-500' 
                      : 'border-orange-400 hover:border-orange-500'
                  }`}
                >
                  {/* Wanted Poster Header */}
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🤠</div>
                    <div className="text-2xl font-bold text-amber-900 mb-1">WANTED</div>
                    <div className="text-sm text-amber-700">Dead or Alive</div>
                  </div>

                  {/* Friend Avatar and Info */}
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-4 border-amber-500">
                      {friend.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <h3 className="font-bold text-amber-900 text-lg mb-1">
                      {friend.username || `Friend ${friend.fid}`}
                    </h3>
                    <p className="text-amber-700 text-sm mb-2">
                      {friend.display_name || 'Mutual Friend'}
                    </p>
                    <div className="flex justify-center mb-3">
                      {getWantedBadge(friend.rideOrDieScore)}
                    </div>
                  </div>

                  {/* Friend Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Interactions:</span>
                      <span className="font-semibold text-amber-800">
                        {friend.totalInteractions}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Followed:</span>
                      <span className="font-semibold text-amber-800">
                        {formatDate(friend.followDate)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">First Engagement:</span>
                      <span className="font-semibold text-amber-800">
                        {friend.firstEngagement ? formatDate(friend.firstEngagement) : 'None yet'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Engagement Type:</span>
                      <span className="font-semibold text-amber-800">
                        {getEngagementIcon(friend.engagementType)} {friend.engagementType || 'follow'}
                      </span>
                    </div>
                  </div>

                  {/* Original Engagement Link */}
                  {friend.originalEngagementCastUrl && (
                    <div className="mb-4">
                      <a
                        href={friend.originalEngagementCastUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 text-sm border-2 border-amber-400"
                      >
                        🤠 View Engagement
                      </a>
                    </div>
                  )}

                  {/* Friendship Score */}
                  <div className="text-center">
                    <div className="text-sm text-amber-700 mb-1">Friendship Score</div>
                    <div className="text-2xl font-bold text-amber-800">
                      {friend.rideOrDieScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && friends.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
              🤠
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">
              No Wanted Friends Found
            </h3>
            <p className="text-amber-800 opacity-90 mb-4">
              Start engaging with your mutual follows to discover your top friends!
            </p>
            <button
              onClick={() => userFid && handleGetTop8(userFid)}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors border-2 border-amber-500"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 