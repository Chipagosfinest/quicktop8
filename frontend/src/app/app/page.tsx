"use client"

import { useState, useEffect } from "react"

import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'

interface Friend {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  ens_name?: string
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
  // Rich Neynar data
  follower_count?: number
  following_count?: number
  cast_count?: number
  verified_addresses?: string[]
  active_status?: string
  last_active?: string
  mutual_friends_count?: number
  engagement_breakdown?: {
    uniqueLikes: number
    uniqueRecasts: number
    uniqueReplies: number
    totalLikes: number
    totalRecasts: number
    totalReplies: number
    engagedCasts: number
    uniqueInteractions: number
    totalInteractions: number
  }
  recent_casts?: Array<{
    hash: string
    text: string
    timestamp: string
    reactions_count: number
    recasts_count: number
    replies_count: number
  }>
}

export default function App() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const [userFid, setUserFid] = useState<number | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  
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

  const getFriendType = (friend: Friend) => {
    if (friend.rideOrDieScore >= 500) return { type: "Legend", icon: "👑", color: "from-purple-500 to-pink-500" }
    if (friend.rideOrDieScore >= 200) return { type: "All-Star", icon: "⭐", color: "from-yellow-500 to-orange-500" }
    if (friend.rideOrDieScore >= 50) return { type: "Hall of Famer", icon: "🏆", color: "from-amber-500 to-yellow-500" }
    return { type: "Wanted", icon: "🤠", color: "from-amber-600 to-orange-600" }
  }

  const getActivityStatus = (friend: Friend) => {
    if (!friend.last_active) return "Unknown"
    const lastActive = new Date(friend.last_active)
    const now = new Date()
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) return "🟢 Active now"
    if (diffHours < 24) return "🟡 Active today"
    if (diffHours < 168) return "🟠 Active this week"
    return "🔴 Inactive"
  }

  const getTopTopics = (friend: Friend) => {
    if (!friend.recent_casts || friend.recent_casts.length === 0) return []
    
    const words = friend.recent_casts
      .map(cast => cast.text.toLowerCase())
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'have', 'will', 'been', 'they', 'from', 'your', 'know', 'just', 'like', 'what', 'when', 'where', 'here', 'there', 'their', 'about', 'would', 'could', 'should'].includes(word))
    
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word)
  }

  const handleTipFriend = async (friend: Friend) => {
    if (!isSDKLoaded) {
      console.log('SDK not loaded yet')
      return
    }

    try {
      console.log('Attempting to tip friend:', friend.username)
      
      const result = await sdk.actions.sendToken({
        recipientFid: friend.fid,
        amount: "1000000", // 1 USDC (6 decimals)
        token: "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base USDC
      })
      
      if (result.success) {
        console.log('Tip successful!', result.send.transaction)
      } else {
        console.log('Tip failed or was cancelled:', result.reason)
      }
    } catch (error) {
      console.error('Error tipping friend:', error)
    }
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
              Your Most Wanted Friends
            </h1>
          </div>
          <p className="text-amber-800 text-lg mb-2 drop-shadow-md">
            Discover your top mutual friends with rich engagement data from Neynar
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-amber-500 animate-spin mx-auto mb-4">
              🤠
            </div>
            <p className="text-amber-800 text-lg">Analyzing your network...</p>
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
                Your Network Analysis 🤠
              </h2>
              <p className="text-amber-800 opacity-90 mb-3">
                Powered by Neynar's rich social data
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend, index) => {
                const friendType = getFriendType(friend)
                const activityStatus = getActivityStatus(friend)
                const topTopics = getTopTopics(friend)
                
                return (
                  <div
                    key={friend.fid}
                    className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group ${
                      index % 2 === 0 
                        ? 'border-amber-400 hover:border-amber-500 hover:bg-amber-50' 
                        : 'border-orange-400 hover:border-orange-500 hover:bg-orange-50'
                    }`}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    {/* Rank Badge */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r ${friendType.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      #{index + 1}
                    </div>

                    {/* Profile Section */}
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-amber-500 overflow-hidden bg-gradient-to-br from-amber-600 to-orange-700">
                        {friend.pfp_url ? (
                          <img 
                            src={friend.pfp_url} 
                            alt={`${friend.username}'s profile`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-white font-bold text-xl ${friend.pfp_url ? 'hidden' : ''}`}>
                          {friend.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-amber-900 text-lg mb-1">
                        {friend.ens_name ? (
                          <span>
                            <span className="text-purple-600">{friend.ens_name}</span>
                            <span className="text-amber-600 text-sm ml-2">@{friend.username}</span>
                          </span>
                        ) : (
                          `@${friend.username || `Friend ${friend.fid}`}`
                        )}
                      </h3>
                      
                      <p className="text-amber-700 text-sm mb-2">
                        {friend.display_name || 'Mutual Friend'}
                      </p>

                      {/* Friend Type Badge */}
                      <div className={`inline-block bg-gradient-to-r ${friendType.color} text-white px-3 py-1 rounded-full text-xs font-bold mb-2`}>
                        {friendType.icon} {friendType.type}
                      </div>

                      {/* Activity Status */}
                      <div className="text-xs text-gray-600 mb-2">
                        {activityStatus}
                      </div>
                    </div>

                    {/* Bio */}
                    {friend.bio && (
                      <div className="mb-4">
                        <p className="text-amber-600 text-xs italic bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                          "{friend.bio}"
                        </p>
                      </div>
                    )}

                    {/* Rich Social Stats */}
                    {friend.follower_count && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-amber-800 mb-2">📊 Social Stats</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-blue-50 rounded p-2 text-center">
                            <div className="font-bold text-blue-800">{friend.follower_count.toLocaleString()}</div>
                            <div className="text-blue-600">Followers</div>
                          </div>
                          <div className="bg-green-50 rounded p-2 text-center">
                            <div className="font-bold text-green-800">{friend.following_count?.toLocaleString() || 'N/A'}</div>
                            <div className="text-green-600">Following</div>
                          </div>
                          <div className="bg-purple-50 rounded p-2 text-center">
                            <div className="font-bold text-purple-800">{friend.cast_count?.toLocaleString() || 'N/A'}</div>
                            <div className="text-purple-600">Casts</div>
                          </div>
                        </div>
                        {friend.mutual_friends_count && (
                          <div className="text-center mt-2">
                            <div className="text-xs text-amber-600">
                              🤝 {friend.mutual_friends_count} mutual friends
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                                         {/* Engagement Breakdown */}
                     {friend.engagement_breakdown && (
                       <div className="mb-4">
                         <div className="text-sm font-semibold text-amber-800 mb-2">🎯 Your Engagement</div>
                         <div className="space-y-3">
                           {/* Unique Interactions */}
                           <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                             <div className="text-center mb-2">
                               <div className="text-lg font-bold text-green-800">{friend.engagement_breakdown.uniqueInteractions}</div>
                               <div className="text-xs text-green-600">Unique Casts Engaged</div>
                             </div>
                             <div className="grid grid-cols-3 gap-2 text-xs">
                               <div className="bg-red-50 rounded p-1 text-center">
                                 <div className="font-bold text-red-800">{friend.engagement_breakdown.uniqueLikes}</div>
                                 <div className="text-red-600">Likes</div>
                               </div>
                               <div className="bg-orange-50 rounded p-1 text-center">
                                 <div className="font-bold text-orange-800">{friend.engagement_breakdown.uniqueRecasts}</div>
                                 <div className="text-orange-600">Recasts</div>
                               </div>
                               <div className="bg-yellow-50 rounded p-1 text-center">
                                 <div className="font-bold text-yellow-800">{friend.engagement_breakdown.uniqueReplies}</div>
                                 <div className="text-yellow-600">Replies</div>
                               </div>
                             </div>
                           </div>
                           
                           {/* Total Interactions */}
                           {friend.engagement_breakdown.totalInteractions > friend.engagement_breakdown.uniqueInteractions && (
                             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                               <div className="text-center mb-2">
                                 <div className="text-lg font-bold text-blue-800">{friend.engagement_breakdown.totalInteractions}</div>
                                 <div className="text-xs text-blue-600">Total Interactions</div>
                               </div>
                               <div className="grid grid-cols-3 gap-2 text-xs">
                                 <div className="bg-red-50 rounded p-1 text-center">
                                   <div className="font-bold text-red-800">{friend.engagement_breakdown.totalLikes}</div>
                                   <div className="text-red-600">Likes</div>
                                 </div>
                                 <div className="bg-orange-50 rounded p-1 text-center">
                                   <div className="font-bold text-orange-800">{friend.engagement_breakdown.totalRecasts}</div>
                                   <div className="text-orange-600">Recasts</div>
                                 </div>
                                 <div className="bg-yellow-50 rounded p-1 text-center">
                                   <div className="font-bold text-yellow-800">{friend.engagement_breakdown.totalReplies}</div>
                                   <div className="text-yellow-600">Replies</div>
                                 </div>
                               </div>
                             </div>
                           )}
                           
                           {/* Engagement Rate */}
                           <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                             <div className="text-center">
                               <div className="text-lg font-bold text-purple-800">{friend.engagement_breakdown.engagedCasts}</div>
                               <div className="text-xs text-purple-600">Casts They Engaged With</div>
                               <div className="text-xs text-purple-500 mt-1">
                                 {friend.engagement_breakdown.uniqueInteractions > 0 ? 
                                   `${Math.round((friend.engagement_breakdown.uniqueInteractions / friend.engagement_breakdown.engagedCasts) * 100)}% engagement rate` : 
                                   'No engagement yet'}
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}

                    {/* Recent Topics */}
                    {topTopics.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-amber-800 mb-2">💬 Recent Topics</div>
                        <div className="flex flex-wrap gap-1">
                          {topTopics.map((topic, idx) => (
                            <span key={idx} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                              #{topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Connection Stats */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-amber-800 mb-2">📈 Connection Stats</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-amber-50 rounded p-2 text-center">
                          <div className="font-bold text-amber-800">{friend.totalInteractions}</div>
                          <div className="text-amber-600">Total Interactions</div>
                        </div>
                        <div className="bg-orange-50 rounded p-2 text-center">
                          <div className="font-bold text-orange-800">{friend.daysSinceFirstEngagement}</div>
                          <div className="text-orange-600">Days Connected</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://warpcast.com/${friend.username}`, '_blank');
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm border-2 border-blue-400"
                      >
                        👤 View Profile
                      </button>
                      
                      {isSDKLoaded && isInMiniApp && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTipFriend(friend);
                          }}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm border-2 border-green-400"
                        >
                          💰 Tip 1 USDC
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loading && !error && friends.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
              🤠
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">
              No Top Mutual Friends Found
            </h3>
            <p className="text-amber-800 opacity-90 mb-4">
              Start engaging with your mutual follows to discover friends you want more of!
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