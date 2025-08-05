'use client'

import { useState, useEffect } from 'react'
import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'

interface Top8User {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  ens_name?: string
  mutual_affinity_score: number
  rank: number
  // Enhanced interaction data
  interaction_stats?: {
    total_interactions: number
    recent_interactions: number // last 30 days
    interaction_types: {
      likes: number
      recasts: number
      replies: number
    }
    last_interaction_date?: string
    engagement_score: number // calculated based on interaction frequency and recency
  }
  // Their top 3 friends
  top_friends?: Array<{
    fid: number
    username: string
    display_name: string
    pfp_url: string
    bio: string
    ens_name?: string
    mutual_affinity_score: number
    neynar_user_score?: number
  }>
  // Social scope - who they're connected to in your network
  social_scope?: {
    mutual_friends: Array<{
      fid: number
      username: string
      display_name: string
      pfp_url: string
      mutual_affinity_score: number
    }>
    friends_of_friends: Array<{
      fid: number
      username: string
      display_name: string
      pfp_url: string
      mutual_affinity_score: number
      connected_via: string // who connects them
    }>
    network_stats: {
      total_mutual_friends: number
      total_friends_of_friends: number
      network_density: number // percentage of your network they're connected to
    }
  }
}

export default function App() {
  const [top8, setTop8] = useState<Top8User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userFid, setUserFid] = useState<number | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [expandedUser, setExpandedUser] = useState<number | null>(null)

  const { isSDKLoaded, isConnected, userFid: contextUserFid, context, signInWithFarcaster } = useMiniApp()

  const isInMiniApp = typeof window !== 'undefined' && window.location.href.includes('warpcast.com')

  useEffect(() => {
    if (isSDKLoaded && isConnected && contextUserFid && context) {
      console.log('Farcaster context received:', context)
      console.log('User FID detected:', contextUserFid)
      
      const fid = parseInt(contextUserFid.toString())
      setUserFid(fid)
      
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

      setTop8(data.top8 || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching Top 8:', error)
      setError(error instanceof Error ? error.message : "Failed to fetch your Top 8")
    } finally {
      setLoading(false)
    }
  }

  const handleTipUser = async (fid: number, username: string) => {
    try {
      // Create tip URL using Farcaster's tipping system
      const tipUrl = `https://warpcast.com/~/tip/${fid}?amount=1000&message=${encodeURIComponent(`Thanks for being in my Top 8! 🤠`)}`
      
      await sdk.actions.openUrl({
        url: tipUrl
      })

      console.log(`Tipped ${username} successfully`)
    } catch (error) {
      console.error('Error tipping user:', error)
    }
  }

  const handleShareResults = async () => {
    if (!userFid || top8.length === 0) return

    try {
      const top3 = top8.slice(0, 3)
      const shareText = `🤠 My Top 8 on QuickTop8:\n\n${top3.map((user, i) => 
        `${i + 1}. @${user.username} (${user.mutual_affinity_score.toFixed(0)} affinity)`
      ).join('\n')}\n\nDiscover your Top 8 at quicktop8.vercel.app`

      await sdk.actions.openUrl({
        url: `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`
      })

      console.log('Shared results successfully')
    } catch (error) {
      console.error('Error sharing results:', error)
    }
  }

  const getAffinityTitle = (score: number, rank: number) => {
    if (rank === 1) return { title: "Ride or Die", icon: "💖", color: "from-pink-500 to-red-500" }
    if (rank === 2) return { title: "Bestie", icon: "💎", color: "from-blue-500 to-purple-500" }
    if (rank === 3) return { title: "Squad Leader", icon: "🌟", color: "from-yellow-500 to-orange-500" }
    
    if (score >= 90) return { title: "Soulmate", icon: "💖", color: "from-pink-500 to-red-500" }
    if (score >= 80) return { title: "Best Friend", icon: "💎", color: "from-blue-500 to-purple-500" }
    if (score >= 70) return { title: "Close Friend", icon: "✨", color: "from-green-500 to-blue-500" }
    if (score >= 60) return { title: "Good Friend", icon: "👋", color: "from-gray-500 to-gray-600" }
    if (score >= 50) return { title: "Friend", icon: "🤝", color: "from-gray-400 to-gray-500" }
    return { title: "Connection", icon: "🔗", color: "from-gray-300 to-gray-400" }
  }

  const getNetworkDensityColor = (density: number) => {
    if (density >= 50) return "text-green-600"
    if (density >= 25) return "text-yellow-600"
    return "text-red-600"
  }

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const formatLastInteraction = (timestamp?: string) => {
    if (!timestamp) return "Never"
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-800 dark:text-purple-300">Connecting to Farcaster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-400 rounded-full transform rotate-12 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-pink-400 rounded-full transform -rotate-12 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-indigo-400 rounded-full transform rotate-30 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-purple-800 bg-opacity-90 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider border border-purple-600">
          QUICKTOP8
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-purple-500 animate-bounce">
              🤠
            </div>
            <h1 className="text-4xl font-bold text-purple-900 ml-4 drop-shadow-lg">
              Your Top 8
            </h1>
          </div>
          <p className="text-purple-800 text-lg mb-2 drop-shadow-md">
            Discover your closest friends and their social networks
          </p>
          {stats && (
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-300 inline-block">
              <div className="text-sm text-purple-700">
                <span className="font-semibold">Average Affinity:</span> {stats.average_affinity_score?.toFixed(1) || 'N/A'}
                <span className="mx-2">•</span>
                <span className="font-semibold">Top Score:</span> {stats.top_affinity_score?.toFixed(1) || 'N/A'}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-purple-500 animate-spin mx-auto mb-4">
              🤠
            </div>
            <p className="text-purple-800 text-lg">Finding your Top 8 and analyzing social networks...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
              ⚠️
            </div>
            <p className="text-purple-800 text-lg mb-4">{error}</p>
            <button
              onClick={() => {
                if (userFid) {
                  handleGetTop8(userFid);
                }
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors border-2 border-purple-500"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && top8.length > 0 && (
          <div className="space-y-8">
            {/* Share Button */}
            <div className="text-center">
              <button
                onClick={handleShareResults}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-green-400"
              >
                🤠 Share My Top 8
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {top8.map((user, index) => {
                const affinityTitle = getAffinityTitle(user.mutual_affinity_score, user.rank)
                const isExpanded = expandedUser === user.fid
                
                return (
                  <div
                    key={user.fid}
                    className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group relative ${
                      index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50' :
                      index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50' :
                      index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-red-50' :
                      'border-purple-400 hover:border-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className={`absolute -top-3 -right-3 bg-gradient-to-r ${affinityTitle.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
                      #{user.rank}
                    </div>

                    {/* Affinity Score Badge */}
                    <div className="absolute -top-3 -left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {user.mutual_affinity_score.toFixed(0)}
                    </div>

                    {/* Profile Section */}
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-purple-500 overflow-hidden bg-gradient-to-br from-purple-600 to-pink-700">
                        {user.pfp_url ? (
                          <img 
                            src={user.pfp_url} 
                            alt={`${user.username}'s profile`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-white font-bold text-xl ${user.pfp_url ? 'hidden' : ''}`}>
                          {user.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-purple-900 text-lg mb-1">
                        {user.ens_name ? (
                          <span>
                            <span className="text-purple-600">{user.ens_name}</span>
                            <span className="text-purple-600 text-sm ml-2">@{user.username}</span>
                          </span>
                        ) : (
                          `@${user.username}`
                        )}
                      </h3>
                      
                      <p className="text-purple-700 text-sm mb-2">
                        {user.display_name || 'Friend'}
                      </p>

                      {/* Affinity Title Badge */}
                      <div className={`inline-block bg-gradient-to-r ${affinityTitle.color} text-white px-3 py-1 rounded-full text-xs font-bold mb-2`}>
                        {affinityTitle.icon} {affinityTitle.title}
                      </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <div className="mb-4">
                        <p className="text-purple-600 text-xs italic bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                          "{user.bio}"
                        </p>
                      </div>
                    )}

                    {/* Interaction Stats */}
                    {user.interaction_stats && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-purple-800 mb-2">💬 Interaction Stats</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-blue-50 rounded p-2 text-center">
                            <div className="font-bold text-blue-800">{user.interaction_stats.total_interactions}</div>
                            <div className="text-blue-600">Total</div>
                          </div>
                          <div className="bg-green-50 rounded p-2 text-center">
                            <div className="font-bold text-green-800">{user.interaction_stats.recent_interactions}</div>
                            <div className="text-green-600">Recent (30d)</div>
                          </div>
                        </div>
                        
                        {/* Engagement Score */}
                        <div className="mt-2 text-center">
                          <div className={`text-xs font-semibold ${getEngagementColor(user.interaction_stats.engagement_score)}`}>
                            ⭐ {user.interaction_stats.engagement_score.toFixed(0)} Engagement Score
                          </div>
                        </div>

                        {/* Interaction Types */}
                        <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                          <div className="bg-red-50 rounded p-1 text-center">
                            <div className="font-bold text-red-800">❤️ {user.interaction_stats.interaction_types.likes}</div>
                          </div>
                          <div className="bg-blue-50 rounded p-1 text-center">
                            <div className="font-bold text-blue-800">🔄 {user.interaction_stats.interaction_types.recasts}</div>
                          </div>
                          <div className="bg-green-50 rounded p-1 text-center">
                            <div className="font-bold text-green-800">💬 {user.interaction_stats.interaction_types.replies}</div>
                          </div>
                        </div>

                        {/* Last Interaction */}
                        <div className="mt-2 text-center">
                          <div className="text-xs text-gray-600">
                            Last interaction: {formatLastInteraction(user.interaction_stats.last_interaction_date)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Network Stats */}
                    {user.social_scope && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-purple-800 mb-2">🌐 Network Scope</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-blue-50 rounded p-2 text-center">
                            <div className="font-bold text-blue-800">{user.social_scope.network_stats.total_mutual_friends}</div>
                            <div className="text-blue-600">Mutual Friends</div>
                          </div>
                          <div className="bg-green-50 rounded p-2 text-center">
                            <div className="font-bold text-green-800">{user.social_scope.network_stats.total_friends_of_friends}</div>
                            <div className="text-green-600">Friends of Friends</div>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <div className={`text-xs font-semibold ${getNetworkDensityColor(user.social_scope.network_stats.network_density)}`}>
                            {user.social_scope.network_stats.network_density.toFixed(1)}% Network Density
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedUser(isExpanded ? null : user.fid)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-2 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm border-2 border-indigo-400 mb-2"
                    >
                      {isExpanded ? '📉 Collapse' : '📈 Expand Social Scope'}
                    </button>

                    {/* Expanded Social Scope */}
                    {isExpanded && user.social_scope && (
                      <div className="space-y-4 mt-4">
                        {/* Mutual Friends */}
                        {user.social_scope.mutual_friends.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-purple-800 mb-2">🤝 Mutual Friends</div>
                            <div className="space-y-2">
                              {user.social_scope.mutual_friends.map((friend) => (
                                <div key={friend.fid} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded p-2 text-xs border border-blue-200">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
                                      {friend.pfp_url ? (
                                        <img 
                                          src={friend.pfp_url} 
                                          alt={`${friend.username}'s profile`}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                          {friend.username?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-blue-800">@{friend.username}</div>
                                      <div className="text-blue-600">{friend.display_name}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Friends of Friends */}
                        {user.social_scope.friends_of_friends.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-purple-800 mb-2">🌟 Friends of Friends</div>
                            <div className="space-y-2">
                              {user.social_scope.friends_of_friends.map((friend) => (
                                <div key={friend.fid} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded p-2 text-xs border border-green-200">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600">
                                      {friend.pfp_url ? (
                                        <img 
                                          src={friend.pfp_url} 
                                          alt={`${friend.username}'s profile`}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                          {friend.username?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-green-800">@{friend.username}</div>
                                      <div className="text-green-600">{friend.display_name}</div>
                                      <div className="text-green-500 text-xs">via @{friend.connected_via}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Top Friends Section */}
                        {user.top_friends && user.top_friends.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-purple-800 mb-2">💫 Their Top Friends</div>
                            <div className="space-y-2">
                              {user.top_friends.map((friend, idx) => (
                                <div key={friend.fid} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded p-2 text-xs border border-pink-200">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600">
                                      {friend.pfp_url ? (
                                        <img 
                                          src={friend.pfp_url} 
                                          alt={`${friend.username}'s profile`}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                          {friend.username?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-purple-800">@{friend.username}</div>
                                      <div className="text-purple-600">{friend.mutual_affinity_score.toFixed(0)} affinity</div>
                                    </div>
                                    {friend.neynar_user_score && (
                                      <div className="text-purple-500 text-xs">⭐ {friend.neynar_user_score.toFixed(1)}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://warpcast.com/${user.username}`, '_blank');
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 text-sm border-2 border-purple-400"
                      >
                        👤 View Profile
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTipUser(user.fid, user.username);
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 text-sm border-2 border-amber-400"
                      >
                        💰 Tip $1
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stats Section */}
            {stats && (
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-purple-400">
                <h3 className="text-xl font-bold text-purple-900 mb-4 text-center">📊 Your Top 8 Stats</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-300">
                    <div className="text-2xl font-bold text-purple-600">{top8.length}</div>
                    <div className="text-purple-700 text-sm">Total Friends</div>
                  </div>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border-2 border-pink-300">
                    <div className="text-2xl font-bold text-pink-600">{stats.average_affinity_score?.toFixed(1) || 'N/A'}</div>
                    <div className="text-pink-700 text-sm">Avg Affinity</div>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-300">
                    <div className="text-2xl font-bold text-indigo-600">{stats.top_affinity_score?.toFixed(1) || 'N/A'}</div>
                    <div className="text-indigo-700 text-sm">Top Score</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && top8.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-purple-500 mx-auto mb-6 animate-bounce">
              🤠
            </div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              No Top 8 Found Yet!
            </h2>
            <p className="text-purple-800 text-lg mb-6 max-w-md mx-auto">
              Start interacting with people on Farcaster to build your Top 8 based on mutual affinity scores!
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300 max-w-md mx-auto">
              <h3 className="font-semibold text-purple-900 mb-3">💡 Tips to Build Your Top 8:</h3>
              <ul className="text-left text-purple-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Like and recast content from people you enjoy
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Reply to casts and engage in conversations
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Follow people whose content resonates with you
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Be active in channels and communities
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => {
                if (userFid) {
                  handleGetTop8(userFid);
                }
              }}
              className="mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-purple-400"
            >
              🔄 Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 