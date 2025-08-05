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
}

export default function Top8Page() {
  const [top8, setTop8] = useState<Top8User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userFid, setUserFid] = useState<number | null>(null)
  const [stats, setStats] = useState<any>(null)

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

  const getAffinityLevel = (score: number) => {
    if (score >= 90) return { level: "Soulmate", icon: "💖", color: "from-pink-500 to-red-500" }
    if (score >= 80) return { level: "Best Friend", icon: "💎", color: "from-blue-500 to-purple-500" }
    if (score >= 70) return { level: "Close Friend", icon: "🌟", color: "from-yellow-500 to-orange-500" }
    if (score >= 60) return { level: "Good Friend", icon: "✨", color: "from-green-500 to-blue-500" }
    if (score >= 50) return { level: "Friend", icon: "👋", color: "from-gray-500 to-gray-600" }
    return { level: "Acquaintance", icon: "🤝", color: "from-gray-400 to-gray-500" }
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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-purple-500 animate-bounce">
              👑
            </div>
            <h1 className="text-4xl font-bold text-purple-900 ml-4 drop-shadow-lg">
              Your Top 8
            </h1>
          </div>
          <p className="text-purple-800 text-lg mb-2 drop-shadow-md">
            Discover your closest friends based on mutual affinity scores
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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-purple-500 animate-spin mx-auto mb-4">
              👑
            </div>
            <p className="text-purple-800 text-lg">Finding your Top 8...</p>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {top8.map((user, index) => {
                const affinityLevel = getAffinityLevel(user.mutual_affinity_score)
                
                return (
                  <div
                    key={user.fid}
                    className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group relative ${
                      index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50' :
                      index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50' :
                      index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-red-50' :
                      'border-purple-400 hover:border-purple-500 hover:bg-purple-50'
                    }`}
                    onClick={() => window.open(`https://warpcast.com/${user.username}`, '_blank')}
                  >
                    {/* Rank Badge */}
                    <div className={`absolute -top-3 -right-3 bg-gradient-to-r ${affinityLevel.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
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

                      {/* Affinity Level Badge */}
                      <div className={`inline-block bg-gradient-to-r ${affinityLevel.color} text-white px-3 py-1 rounded-full text-xs font-bold mb-2`}>
                        {affinityLevel.icon} {affinityLevel.level}
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

                    {/* Top Friends Section */}
                    {user.top_friends && user.top_friends.length > 0 && (
                      <div className="mb-4">
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
              👑
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