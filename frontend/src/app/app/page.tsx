'use client'

import { useState, useEffect } from 'react'
import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'
import SocialShare from '@/components/SocialShare'

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
  // Enhanced social analytics
  neynar_user_score?: number
  engagement_rate?: number
  social_influence_score?: number
  reply_quality_score?: number
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
    neynar_user_score?: number
    engagement_rate?: number
  }>
}

interface LeaderboardEntry {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  ens_name?: string
  reply_count: number
  quality_score: number
  social_influence_score: number
  is_friend: boolean
  is_mutual: boolean
  rank: number
}

export default function App() {
  const [replyGuys, setReplyGuys] = useState<ReplyGuy[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userFid, setUserFid] = useState<number | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'reply-guys' | 'leaderboard' | 'analytics'>('reply-guys')
  const [leaderboardType, setLeaderboardType] = useState<'friends' | 'global' | 'mutual'>('friends')
  const [analytics, setAnalytics] = useState<any>(null)

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
      handleGetLeaderboard(fid)
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
      setAnalytics(data.analytics || null)
    } catch (error) {
      console.error('Error fetching reply guys:', error)
      setError(error instanceof Error ? error.message : "Failed to fetch your reply guys")
    } finally {
      setLoading(false)
    }
  }

  const handleGetLeaderboard = async (fid: number) => {
    if (!fid) return

    try {
      const response = await fetch(`/api/leaderboard?fid=${fid}&type=${leaderboardType}`, {
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

      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }



  const getReplyGuyType = (replyGuy: ReplyGuy) => {
    if (replyGuy.reply_quality_score && replyGuy.reply_quality_score >= 80) return { type: "Legendary", icon: "👑", color: "from-purple-500 to-pink-500" }
    if (replyGuy.reply_quality_score && replyGuy.reply_quality_score >= 60) return { type: "Super Fan", icon: "🔥", color: "from-red-500 to-pink-500" }
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

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-1 border-2 border-amber-400">
            <button
              onClick={() => setActiveTab('reply-guys')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'reply-guys'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              🤠 Reply Guys
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              📊 Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              📈 Analytics
            </button>
          </div>
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

        {!loading && !error && activeTab === 'reply-guys' && replyGuys.length > 0 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                Your Reply Guys & Their Friends 🤠
              </h2>
              <p className="text-amber-800 opacity-90 mb-3">
                Discover who replies to you most and find new connections through them
              </p>
              <SocialShare 
                replyGuys={replyGuys} 
                userFid={userFid}
                onShare={() => console.log('Results shared!')}
              />
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

                    {/* Quality Score Badge */}
                    {replyGuy.reply_quality_score && (
                      <div className="absolute -top-3 -left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        ⭐ {replyGuy.reply_quality_score.toFixed(0)}
                      </div>
                    )}

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

                    {/* Enhanced Stats */}
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
                      
                      {/* Quality Metrics */}
                      {replyGuy.reply_quality_score && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-purple-50 rounded p-2 text-center">
                            <div className="font-bold text-purple-800">{replyGuy.reply_quality_score.toFixed(0)}</div>
                            <div className="text-purple-600">Quality Score</div>
                          </div>
                          <div className="bg-orange-50 rounded p-2 text-center">
                            <div className="font-bold text-orange-800">{replyGuy.social_influence_score?.toFixed(0) || 'N/A'}</div>
                            <div className="text-orange-600">Influence</div>
                          </div>
                        </div>
                      )}
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
                              {connection.neynar_user_score && (
                                <div className="text-purple-500">⭐ {connection.neynar_user_score.toFixed(1)}</div>
                              )}
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

        {!loading && !error && activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">
                📊 Social Leaderboard
              </h2>
              
              {/* Leaderboard Type Selector */}
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-1 border-2 border-amber-400">
                  <button
                    onClick={() => {
                      setLeaderboardType('friends')
                      if (userFid) handleGetLeaderboard(userFid)
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      leaderboardType === 'friends'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    👥 Friends
                  </button>
                  <button
                    onClick={() => {
                      setLeaderboardType('mutual')
                      if (userFid) handleGetLeaderboard(userFid)
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      leaderboardType === 'mutual'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    🤝 Mutual
                  </button>
                  <button
                    onClick={() => {
                      setLeaderboardType('global')
                      if (userFid) handleGetLeaderboard(userFid)
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      leaderboardType === 'global'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    🌍 Global
                  </button>
                </div>
              </div>
            </div>

            {leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.fid}
                    className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-4 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                      index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50' :
                      index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50' :
                      index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-red-50' :
                      'border-amber-300 hover:border-amber-400'
                    }`}
                    onClick={() => window.open(`https://warpcast.com/${entry.username}`, '_blank')}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600 text-white' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                        'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Profile */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-amber-600 to-orange-700">
                            {entry.pfp_url ? (
                              <img 
                                src={entry.pfp_url} 
                                alt={`${entry.username}'s profile`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {entry.username?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-amber-900">
                              {entry.ens_name ? (
                                <span>
                                  <span className="text-purple-600">{entry.ens_name}</span>
                                  <span className="text-amber-600 text-sm ml-2">@{entry.username}</span>
                                </span>
                              ) : (
                                `@${entry.username}`
                              )}
                            </h3>
                            <p className="text-amber-700 text-sm">{entry.display_name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-800">{entry.quality_score.toFixed(0)}</div>
                        <div className="text-xs text-amber-600">Quality Score</div>
                        <div className="text-sm font-semibold text-blue-600">{entry.reply_count} replies</div>
                      </div>

                      {/* Social Indicators */}
                      <div className="flex space-x-1">
                        {entry.is_friend && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full" title="Friend"></div>
                        )}
                        {entry.is_mutual && (
                          <div className="w-3 h-3 bg-green-500 rounded-full" title="Mutual"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-amber-500 mx-auto mb-6">
                  📊
                </div>
                <h2 className="text-2xl font-bold text-amber-900 mb-4">
                  No Leaderboard Data Yet!
                </h2>
                <p className="text-amber-800 text-lg mb-6 max-w-md mx-auto">
                  Start posting engaging content to build your reply guys leaderboard and compete with friends!
                </p>
              </div>
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                📈 Social Analytics
              </h2>
              <p className="text-amber-800 opacity-90 mb-3">
                Deep insights into your social engagement and reply guy quality
              </p>
            </div>

            {analytics ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Analytics Cards */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-blue-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="font-bold text-blue-900 text-lg mb-2">Total Replies Analyzed</h3>
                    <div className="text-3xl font-bold text-blue-600">{analytics.total_replies_analyzed}</div>
                    <p className="text-blue-700 text-sm mt-2">Replies across your recent casts</p>
                  </div>
                </div>

                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-green-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">⭐</div>
                    <h3 className="font-bold text-green-900 text-lg mb-2">Average Quality Score</h3>
                    <div className="text-3xl font-bold text-green-600">{analytics.average_quality_score?.toFixed(1) || 'N/A'}</div>
                    <p className="text-green-700 text-sm mt-2">Overall reply guy quality</p>
                  </div>
                </div>

                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-purple-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👑</div>
                    <h3 className="font-bold text-purple-900 text-lg mb-2">Top Reply Guy Score</h3>
                    <div className="text-3xl font-bold text-purple-600">{analytics.top_reply_guy_score?.toFixed(0) || 'N/A'}</div>
                    <p className="text-purple-700 text-sm mt-2">Your highest quality reply guy</p>
                  </div>
                </div>

                {/* Quality Distribution */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-amber-400 md:col-span-2 lg:col-span-3">
                  <h3 className="font-bold text-amber-900 text-lg mb-4 text-center">Reply Guy Quality Distribution</h3>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    {replyGuys.slice(0, 4).map((rg, index) => (
                      <div key={rg.fid} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-300">
                        <div className="text-2xl mb-2">#{index + 1}</div>
                        <div className="font-bold text-amber-800">@{rg.username}</div>
                        <div className="text-lg font-bold text-amber-600">{rg.reply_quality_score?.toFixed(0) || 'N/A'}</div>
                        <div className="text-xs text-amber-700">Quality Score</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-amber-500 mx-auto mb-6">
                  📈
                </div>
                <h2 className="text-2xl font-bold text-amber-900 mb-4">
                  No Analytics Data Yet!
                </h2>
                <p className="text-amber-800 text-lg mb-6 max-w-md mx-auto">
                  Start posting content to generate rich analytics about your reply guys and social engagement!
                </p>
              </div>
            )}
          </div>
        )}

        {!loading && !error && replyGuys.length === 0 && activeTab === 'reply-guys' && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-amber-500 mx-auto mb-6 animate-bounce">
              🤠
            </div>
            <h2 className="text-2xl font-bold text-amber-900 mb-4">
              No Reply Guys Found Yet!
            </h2>
            <p className="text-amber-800 text-lg mb-6 max-w-md mx-auto">
              Start posting more engaging content to discover who replies to you most! 
              The more you interact, the more reply guys you'll find.
            </p>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-300 max-w-md mx-auto">
              <h3 className="font-semibold text-amber-900 mb-3">💡 Tips to Find Reply Guys:</h3>
              <ul className="text-left text-amber-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  Post thought-provoking questions
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  Share interesting takes on trending topics
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  Engage with other people's content
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  Be active in channels and communities
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => {
                if (userFid) {
                  handleGetReplyGuys(userFid);
                }
              }}
              className="mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-amber-400"
            >
              🔄 Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 