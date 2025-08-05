'use client'

import { useState, useEffect } from 'react'
import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'

interface ReplyGuy {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  ens_name?: string
  replyCount: number
  firstReplyDate: string
  lastReplyDate: string
  // Rich Neynar data
  follower_count?: number
  following_count?: number
  cast_count?: number
  verified_addresses?: string[]
  active_status?: string
  last_active?: string
  // Their recent interactions with others
  recent_interactions?: Array<{
    target_username: string
    target_fid: number
    interaction_type: 'reply' | 'like' | 'recast'
    cast_text: string
    timestamp: string
  }>
  // Potential new connections
  potential_connections?: Array<{
    fid: number
    username: string
    display_name: string
    pfp_url: string
    bio: string
    ens_name?: string
    interaction_count: number
    last_interaction: string
  }>
}

export default function App() {
  const [replyGuys, setReplyGuys] = useState<ReplyGuy[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userFid, setUserFid] = useState<number | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  const { isSDKLoaded, isConnected, userFid: contextUserFid, context, signInWithFarcaster } = useMiniApp()

  const isInMiniApp = typeof window !== 'undefined' && window.location.href.includes('warpcast.com')

  useEffect(() => {
    if (isSDKLoaded && isConnected && contextUserFid && context) {
      console.log('Farcaster context received:', context)
      console.log('User FID detected:', contextUserFid)
      
      const fid = parseInt(contextUserFid.toString())
      setUserFid(fid)
      
      // Get user profile
      const profile = {
        fid: fid,
        username: (context as any)?.user?.username || 'unknown',
        displayName: (context as any)?.user?.displayName || 'Unknown User'
      }
      setUserProfile(profile)
      
      // Call sdk.actions.ready() to hide splash screen
      const callReady = async () => {
        try {
          await sdk.actions.ready()
          console.log('Mini App ready() called successfully')
        } catch (error) {
          console.error('Error calling ready():', error)
        }
      }
      callReady()
      
      handleGetReplyGuys(fid)
    }
  }, [isSDKLoaded, isConnected, contextUserFid, context])

  const handleGetReplyGuys = async (fid: number) => {
    if (!fid) {
      setError("No FID detected. Please try again.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/replyguys?fid=${fid}`, {
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

      setReplyGuys(data.replyGuys || [])
    } catch (error) {
      console.error('Error fetching reply guys:', error)
      setError(error instanceof Error ? error.message : "Failed to fetch your reply guys")
    } finally {
      setLoading(false)
    }
  }

  const getReplyGuyType = (replyGuy: ReplyGuy) => {
    if (replyGuy.replyCount >= 10) return { type: "Super Fan", icon: "🔥", color: "from-red-500 to-pink-500" }
    if (replyGuy.replyCount >= 5) return { type: "Regular", icon: "💬", color: "from-blue-500 to-purple-500" }
    if (replyGuy.replyCount >= 2) return { type: "Occasional", icon: "👋", color: "from-green-500 to-blue-500" }
    return { type: "New", icon: "🆕", color: "from-gray-500 to-gray-600" }
  }

  const getActivityStatus = (replyGuy: ReplyGuy) => {
    if (!replyGuy.last_active) return "Unknown"
    const lastActive = new Date(replyGuy.last_active)
    const now = new Date()
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) return "🟢 Active now"
    if (diffHours < 24) return "🟡 Active today"
    if (diffHours < 168) return "🟠 Active this week"
    return "🔴 Inactive"
  }

  // Call ready() even if no user context (for testing)
  useEffect(() => {
    if (isSDKLoaded && isInMiniApp) {
      const callReady = async () => {
        try {
          await sdk.actions.ready()
          console.log('Mini App ready() called (fallback)')
        } catch (error) {
          console.error('Error calling ready() (fallback):', error)
        }
      }
      callReady()
    }
  }, [isSDKLoaded, isInMiniApp])

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
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-amber-400 rounded-full transform rotate-12 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-orange-400 rounded-full transform -rotate-12 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-yellow-400 rounded-full transform rotate-30 animate-pulse"></div>
      </div>

      {/* Header */}
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
              Wanted: Reply Guys & Their Friends
            </h1>
          </div>
          <p className="text-amber-800 text-lg mb-2 drop-shadow-md">
            Discover who replies to you most and find new connections through them
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-amber-500 animate-spin mx-auto mb-4">
              🤠
            </div>
            <p className="text-amber-800 text-lg">Finding your reply guys...</p>
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
                  handleGetReplyGuys(userFid);
                }
              }}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors border-2 border-amber-500"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && replyGuys.length > 0 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                Your Reply Guys & Their Friends 🤠
              </h2>
              <p className="text-amber-800 opacity-90 mb-3">
                Discover who replies to you most and find new connections through them
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {replyGuys.map((replyGuy, index) => {
                const replyGuyType = getReplyGuyType(replyGuy)
                const activityStatus = getActivityStatus(replyGuy)
                
                return (
                  <div
                    key={replyGuy.fid}
                    className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group relative ${
                      index % 2 === 0 
                        ? 'border-amber-400 hover:border-amber-500 hover:bg-amber-50' 
                        : 'border-orange-400 hover:border-orange-500 hover:bg-orange-50'
                    }`}
                    onClick={() => window.open(`https://warpcast.com/${replyGuy.username}`, '_blank')}
                  >
                    {/* Rank Badge */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r ${replyGuyType.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      #{index + 1}
                    </div>

                    {/* Profile Section */}
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-amber-500 overflow-hidden bg-gradient-to-br from-amber-600 to-orange-700">
                        {replyGuy.pfp_url ? (
                          <img 
                            src={replyGuy.pfp_url} 
                            alt={`${replyGuy.username}'s profile`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-white font-bold text-xl ${replyGuy.pfp_url ? 'hidden' : ''}`}>
                          {replyGuy.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-amber-900 text-lg mb-1">
                        {replyGuy.ens_name ? (
                          <span>
                            <span className="text-purple-600">{replyGuy.ens_name}</span>
                            <span className="text-amber-600 text-sm ml-2">@{replyGuy.username}</span>
                          </span>
                        ) : (
                          `@${replyGuy.username || `ReplyGuy ${replyGuy.fid}`}`
                        )}
                      </h3>
                      
                      <p className="text-amber-700 text-sm mb-2">
                        {replyGuy.display_name || 'Reply Guy'}
                      </p>

                      {/* Reply Guy Type Badge */}
                      <div className={`inline-block bg-gradient-to-r ${replyGuyType.color} text-white px-3 py-1 rounded-full text-xs font-bold mb-2`}>
                        {replyGuyType.icon} {replyGuyType.type}
                      </div>

                      {/* Activity Status */}
                      <div className="text-xs text-gray-600 mb-2">
                        {activityStatus}
                      </div>
                    </div>

                    {/* Bio */}
                    {replyGuy.bio && (
                      <div className="mb-4">
                        <p className="text-amber-600 text-xs italic bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                          "{replyGuy.bio}"
                        </p>
                      </div>
                    )}

                    {/* Reply Stats */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-amber-800 mb-2">💬 Reply Stats</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 rounded p-2 text-center">
                          <div className="font-bold text-blue-800">{replyGuy.replyCount}</div>
                          <div className="text-blue-600">Replies to You</div>
                        </div>
                        <div className="bg-green-50 rounded p-2 text-center">
                          <div className="font-bold text-green-800">{replyGuy.follower_count?.toLocaleString() || 'N/A'}</div>
                          <div className="text-green-600">Followers</div>
                        </div>
                      </div>
                    </div>

                    {/* Potential Connections */}
                    {replyGuy.potential_connections && replyGuy.potential_connections.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-amber-800 mb-2">🔗 Potential Connections</div>
                        <div className="space-y-2">
                          {replyGuy.potential_connections.slice(0, 3).map((connection, idx) => (
                            <div key={connection.fid} className="bg-purple-50 rounded p-2 text-xs">
                              <div className="font-semibold text-purple-800">@{connection.username}</div>
                              <div className="text-purple-600">{connection.interaction_count} interactions</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://warpcast.com/${replyGuy.username}`, '_blank');
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm border-2 border-blue-400"
                      >
                        👤 View Profile
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loading && !error && replyGuys.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
              🤠
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">
              No Reply Guys Found
            </h3>
            <p className="text-amber-800 opacity-90 mb-4">
              Start posting more content to discover who replies to you most!
            </p>
            <button
              onClick={() => userFid && handleGetReplyGuys(userFid)}
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