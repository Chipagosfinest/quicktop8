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
    likes: number
    recasts: number
    replies: number
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
  const [isAddingToFarcaster, setIsAddingToFarcaster] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  
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

  const handleAddToFarcaster = async () => {
    if (!isSDKLoaded) {
      console.log('SDK not loaded yet')
      return
    }

    setIsAddingToFarcaster(true)
    try {
      console.log('Attempting to add Mini App to Farcaster...')
      
      // Use the addMiniApp action from the SDK
      const result = await sdk.actions.addMiniApp()
      console.log('Add Mini App result:', result)
      
      if (result) {
        console.log('Mini App added successfully!')
        // You could show a success message here
      } else {
        console.log('Add Mini App failed or was cancelled')
      }
    } catch (error) {
      console.error('Error adding Mini App:', error)
    } finally {
      setIsAddingToFarcaster(false)
    }
  }

  const handleShare = async () => {
    if (!isSDKLoaded) {
      console.log('SDK not loaded yet')
      return
    }

    setIsSharing(true)
    try {
      console.log('Attempting to share...')
      
      // Create more engaging share content
      const topFriend = friends[0];
      const shareText = topFriend 
        ? `🤠 Just discovered my top mutual friend on Farcaster: @${topFriend.username}! Check out my "Wanted: More Friends Like These" list with QuickTop8! 💫`
        : "🤠 Check out my top mutual friends from the last 30 days with QuickTop8! Discover friends you want more of! 💫";
      
      const shareUrl = window.location.href
      
      // Use the openUrl action to share via Farcaster
      await sdk.actions.openUrl({
        url: `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`
      })
      console.log('Share successful!')
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleTipFriend = async (friend: Friend) => {
    if (!isSDKLoaded) {
      console.log('SDK not loaded yet')
      return
    }

    try {
      console.log('Attempting to tip friend:', friend.username)
      
      // Use the sendToken action to tip the friend
      const result = await sdk.actions.sendToken({
        recipientFid: friend.fid,
        amount: "1000000", // 1 USDC (6 decimals)
        token: "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base USDC
      })
      
      if (result.success) {
        console.log('Tip successful!', result.send.transaction)
        // You could show a success message here
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
      {/* Cowboy Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-amber-400 rounded-full transform rotate-12 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-orange-400 rounded-full transform -rotate-12 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-yellow-400 rounded-full transform rotate-30 animate-pulse"></div>
        <div className="absolute top-60 left-1/4 w-12 h-12 bg-red-400 rounded-full transform -rotate-45 animate-bounce"></div>
        <div className="absolute bottom-40 right-1/3 w-18 h-18 bg-brown-400 rounded-full transform rotate-60 animate-pulse"></div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <div className="bg-amber-800 bg-opacity-90 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider border border-amber-600">
          QUICKTOP8
        </div>
        {isSDKLoaded && isInMiniApp && (
          <>
            <button
              onClick={handleAddToFarcaster}
              disabled={isAddingToFarcaster}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded-lg font-semibold text-sm transition-colors border border-green-500"
            >
              {isAddingToFarcaster ? 'Adding...' : '📱 Add App'}
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded-lg font-semibold text-sm transition-colors border border-blue-500"
            >
              {isSharing ? 'Sharing...' : '📤 Share'}
            </button>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-amber-500 animate-bounce">
              🤠
            </div>
            <h1 className="text-4xl font-bold text-amber-900 ml-4 drop-shadow-lg">
              Wanted: More Friends Like These
            </h1>
          </div>
          <p className="text-amber-800 text-lg mb-2 drop-shadow-md">
            Your top mutual friends from the last 30 days - the ones you want more of! 🤠
          </p>
          <div className="flex justify-center space-x-2 mb-4">
            <span className="bg-amber-800 bg-opacity-20 text-amber-800 px-3 py-1 rounded-full text-sm border border-amber-600">🤠 Wanted Posters</span>
            <span className="bg-orange-800 bg-opacity-20 text-orange-800 px-3 py-1 rounded-full text-sm border border-orange-600">💫 Top Mutuals</span>
            <span className="bg-yellow-800 bg-opacity-20 text-yellow-800 px-3 py-1 rounded-full text-sm border border-yellow-600">🌟 More Like These</span>
          </div>
          
          {/* Mini App Actions */}
          {isSDKLoaded && isInMiniApp && (
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={handleAddToFarcaster}
                disabled={isAddingToFarcaster}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-400 disabled:to-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 border-green-400 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isAddingToFarcaster ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Adding to Farcaster...
                  </>
                ) : (
                  <>
                    📱 Add to Farcaster
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 border-blue-400 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isSharing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sharing...
                  </>
                ) : (
                  <>
                    📤 Share Results
                  </>
                )}
              </button>
            </div>
          )}
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
                Wanted: More Friends Like These 🤠
              </h2>
              <p className="text-amber-800 opacity-90 mb-3">
                Your top mutual friends from the last 30 days - the ones you want more of!
              </p>
              <div className="bg-amber-100 rounded-lg p-3 max-w-md mx-auto">
                <div className="text-xs text-amber-800 font-semibold mb-1">📊 How We Score Friendships:</div>
                <div className="text-xs text-amber-700 space-y-1">
                  <div>• <strong>Longevity:</strong> Days since first engagement</div>
                  <div>• <strong>Frequency:</strong> Interactions per day</div>
                  <div>• <strong>Quality:</strong> Type of engagement (likes, recasts, replies)</div>
                  <div>• <strong>Reciprocity:</strong> Mutual follow duration</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend, index) => (
                <div
                  key={friend.fid}
                  className={`bg-amber-50 bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group ${
                    index % 2 === 0 
                      ? 'border-amber-400 hover:border-amber-500 hover:bg-amber-100' 
                      : 'border-orange-400 hover:border-orange-500 hover:bg-orange-100'
                  }`}
                  onClick={() => window.open(`https://warpcast.com/${friend.username}`, '_blank')}
                >
                  {/* Rich Header with Rank */}
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <div className="text-4xl mr-2">🤠</div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-900">WANTED</div>
                        <div className="text-xs text-amber-700">#{index + 1} Top Mutual</div>
                      </div>
                    </div>
                    <div className="text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-block">
                      Score: {friend.rideOrDieScore}
                    </div>
                    <div className="text-xs text-amber-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view profile →
                    </div>
                  </div>

                  {/* Rich Profile Section */}
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-amber-500 overflow-hidden bg-gradient-to-br from-amber-600 to-orange-700">
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
                    <h3 className="font-bold text-amber-900 text-xl mb-1">
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
                    {friend.bio && (
                      <p className="text-amber-600 text-xs mb-3 line-clamp-3 italic bg-amber-100 p-2 rounded">
                        "{friend.bio}"
                      </p>
                    )}
                    <div className="flex justify-center mb-3">
                      {getWantedBadge(friend.rideOrDieScore)}
                    </div>
                  </div>

                  {/* Rich Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-amber-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-amber-800">{friend.totalInteractions}</div>
                      <div className="text-xs text-amber-600">Total Interactions</div>
                    </div>
                    <div className="bg-orange-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-800">{friend.daysSinceFirstEngagement}</div>
                      <div className="text-xs text-orange-600">Days Connected</div>
                    </div>
                    <div className="bg-yellow-100 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-yellow-800">{friend.engagementFrequency.toFixed(2)}</div>
                      <div className="text-xs text-yellow-600">Engagement/Day</div>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-800">{friend.relationshipScore}</div>
                      <div className="text-xs text-green-600">Relationship Score</div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-amber-800 mb-2">📅 Connection Timeline</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-amber-600">Followed:</span>
                        <span className="font-semibold text-amber-800">
                          {formatDate(friend.followDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600">First Engagement:</span>
                        <span className="font-semibold text-amber-800">
                          {friend.firstEngagement ? formatDate(friend.firstEngagement) : 'None yet'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600">Engagement Type:</span>
                        <span className="font-semibold text-amber-800">
                          {getEngagementIcon(friend.engagementType)} {friend.engagementType || 'follow'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rich Social Data */}
                  {friend.follower_count && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-amber-800 mb-2">📈 Social Stats</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-blue-100 rounded p-2 text-center">
                          <div className="font-bold text-blue-800">{friend.follower_count}</div>
                          <div className="text-blue-600">Followers</div>
                        </div>
                        <div className="bg-green-100 rounded p-2 text-center">
                          <div className="font-bold text-green-800">{friend.following_count}</div>
                          <div className="text-green-600">Following</div>
                        </div>
                        <div className="bg-purple-100 rounded p-2 text-center">
                          <div className="font-bold text-purple-800">{friend.cast_count}</div>
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
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-red-100 rounded p-2 text-center">
                          <div className="font-bold text-red-800">{friend.engagement_breakdown.likes}</div>
                          <div className="text-red-600">Likes</div>
                        </div>
                        <div className="bg-orange-100 rounded p-2 text-center">
                          <div className="font-bold text-orange-800">{friend.engagement_breakdown.recasts}</div>
                          <div className="text-orange-600">Recasts</div>
                        </div>
                        <div className="bg-yellow-100 rounded p-2 text-center">
                          <div className="font-bold text-yellow-800">{friend.engagement_breakdown.replies}</div>
                          <div className="text-yellow-600">Replies</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Engagement Analysis */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-amber-800 mb-2 flex items-center justify-between">
                      <span>📊 Engagement Analysis</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const longevity = friend.daysSinceFirstEngagement * 2;
                          const frequency = friend.engagementFrequency * 50;
                          const interactions = friend.totalInteractions * 5;
                          const followDuration = (Date.now() - new Date(friend.followDate).getTime()) / (1000 * 60 * 60 * 24) * 0.5;
                          const displayName = friend.ens_name ? `${friend.ens_name} (@${friend.username})` : `@${friend.username}`;
                          
                          const richInfo = friend.follower_count ? 
                            `\n📈 Social Stats:\n• Followers: ${friend.follower_count}\n• Following: ${friend.following_count}\n• Casts: ${friend.cast_count}\n• Mutual Friends: ${friend.mutual_friends_count || 0}` : '';
                          
                          const engagementInfo = friend.engagement_breakdown ?
                            `\n🎯 Your Engagement:\n• Likes: ${friend.engagement_breakdown.likes}\n• Recasts: ${friend.engagement_breakdown.recasts}\n• Replies: ${friend.engagement_breakdown.replies}` : '';
                          
                          alert(`Friendship Score Breakdown for ${displayName}:${richInfo}${engagementInfo}\n\n📊 Score Components:\n• Longevity (${friend.daysSinceFirstEngagement} days × 2): ${longevity.toFixed(1)}\n• Frequency (${friend.engagementFrequency.toFixed(2)}/day × 50): ${frequency.toFixed(1)}\n• Interactions (${friend.totalInteractions} × 5): ${interactions}\n• Follow Duration (${(followDuration/0.5).toFixed(0)} days × 0.5): ${followDuration.toFixed(1)}\n\n🎯 Total Score: ${friend.rideOrDieScore}\n\n💡 What this means:\n${friend.rideOrDieScore > 100 ? '🌟 Elite Connection - You engage frequently and have a long history' : 
                            friend.rideOrDieScore > 50 ? '💫 Strong Bond - Regular engagement with good history' : 
                            friend.rideOrDieScore > 20 ? '🤝 Good Friend - Some engagement, growing connection' : '👋 New Connection - Early stages of friendship'}`);
                        }}
                        className="text-xs text-amber-600 hover:text-amber-800 bg-amber-100 px-2 py-1 rounded-full hover:bg-amber-200 transition-colors"
                      >
                        ℹ️ How scored?
                      </button>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-800 mb-1">
                          {friend.rideOrDieScore}
                        </div>
                        <div className="text-xs text-amber-600">Mutual Friend Score</div>
                        <div className="text-xs text-amber-500 mt-1">
                          {friend.rideOrDieScore > 100 ? '🌟 Elite Connection' : 
                           friend.rideOrDieScore > 50 ? '💫 Strong Bond' : 
                           friend.rideOrDieScore > 20 ? '🤝 Good Friend' : '👋 New Connection'}
                        </div>
                        <div className="text-xs text-amber-400 mt-2">
                          Based on engagement frequency, longevity, and interaction quality
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* Clickable Card Actions */}
                    <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => window.open(`https://warpcast.com/${friend.username}`, '_blank')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-xs border-2 border-blue-400"
                      >
                        👤 {friend.ens_name ? 'View ENS' : 'View Profile'}
                      </button>
                      
                      {friend.originalEngagementCastUrl && (
                        <a
                          href={friend.originalEngagementCastUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 text-xs border-2 border-amber-400"
                        >
                          🤠 First Cast
                        </a>
                      )}
                    </div>
                    
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