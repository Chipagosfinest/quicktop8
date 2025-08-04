"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'

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
  // New ride or die fields
  originalEngagementCastHash: string
  originalEngagementCastUrl: string
  rideOrDieScore: number
  daysSinceFirstEngagement: number
  engagementFrequency: number
}

export default function AppPage() {
  const [friends, setFriends] = useState<MutualFollow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const [userFid, setUserFid] = useState<number | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [tippingUser, setTippingUser] = useState<number | null>(null)
  const [tipAmount, setTipAmount] = useState(500) // Default $5.00
  
  const { isSDKLoaded, isConnected, userFid: contextUserFid, context, signInWithFarcaster } = useMiniApp()

  // Check if we're in a Mini App environment and get user data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Detect Mini App environment more reliably
      const isMiniApp = window.location.href.includes('farcaster.com') || 
                       window.location.href.includes('warpcast.com') ||
                       window.parent !== window || // Running in iframe
                       (window as any).ReactNativeWebView // Running in React Native WebView
      setIsInMiniApp(isMiniApp)
    }
  }, [])

  // Auto-detect user FID when Mini App is ready
  useEffect(() => {
    if (isSDKLoaded && isConnected && contextUserFid) {
      const fid = parseInt(contextUserFid)
      setUserFid(fid)
      // Create a user profile object from available data
      const profile = {
        fid: fid,
        username: (context as any)?.user?.username || `user_${fid}`,
        displayName: (context as any)?.user?.displayName || `User ${fid}`,
        pfpUrl: (context as any)?.user?.pfpUrl || ''
      }
      setUserProfile(profile)
      // Automatically fetch top 8 when user is detected
      handleGetTop8(fid)
    }
  }, [isSDKLoaded, isConnected, contextUserFid, context])

  // Essential Mini App compliance: Call ready() when SDK is loaded
  useEffect(() => {
    if (isSDKLoaded && isInMiniApp) {
      // Call ready() to hide splash screen and show app content
      sdk.actions.ready()
        .then(() => {
          console.log('Mini App ready - splash screen hidden')
        })
        .catch((err) => {
          console.log('Ready() call failed (may be running outside Mini App):', err)
        })
    }
  }, [isSDKLoaded, isInMiniApp])

  const handleGetTop8 = async (fid: number) => {
    if (!fid) {
      setError("No FID detected. Please try again.")
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
        body: JSON.stringify({ fid }),
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

  const handleTip = async (recipientFid: number, amount: number) => {
    try {
      const response = await fetch("/api/wallet/tip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          recipientFid, 
          amount,
          message: "Thanks for being a ride or die! 💜"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create tip")
      }

      // Open tip URL in new window
      window.open(data.tipUrl, '_blank')
      setTippingUser(null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tip")
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

  const getRideOrDieBadge = (score: number) => {
    if (score >= 1000) return { text: '🔥 Ride or Die', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    if (score >= 500) return { text: '💜 Loyal Friend', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' }
    if (score >= 200) return { text: '💙 Good Friend', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' }
    return { text: '🤝 Mutual', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' }
  }

  // Show loading state while detecting user
  if (!isSDKLoaded && isInMiniApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Connecting to Farcaster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent mb-4">
              Ride or Die Top 8
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              Discover your longest-standing mutual follows with original engagement history
            </p>
            <div className="flex justify-center gap-2">
              {isInMiniApp && (
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                  🎯 Mini App
                </Badge>
              )}
              <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300">
                🔥 Ride or Die
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                💜 Tip Friends
              </Badge>
            </div>
          </div>

          {/* User Profile (if detected) */}
          {userProfile && (
            <Card className="mb-8 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userProfile.pfpUrl} alt={userProfile.displayName} />
                    <AvatarFallback>{userProfile.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-purple-800 dark:text-purple-200">
                      {userProfile.displayName}
                    </CardTitle>
                    <CardDescription className="text-purple-700 dark:text-purple-300">
                      @{userProfile.username} • FID: {userProfile.fid}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Auth Button for users not automatically detected */}
          {!userFid && (
            <Card className="mb-8 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
              <CardHeader>
                <CardTitle className="text-purple-800 dark:text-purple-200">Connect Your Farcaster Account</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Sign in with Farcaster to discover your ride or die friends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={async () => {
                    try {
                      setError("")
                      // Try to authenticate with Farcaster
                      const authResult = await signInWithFarcaster()
                      if (authResult) {
                        // After auth, try to get context again
                        const userContext = await sdk.context
                        if (userContext?.user?.fid) {
                          const fid = parseInt(userContext.user.fid.toString())
                          setUserFid(fid)
                          const profile = {
                            fid: fid,
                            username: userContext.user.username || `user_${fid}`,
                            displayName: userContext.user.displayName || `User ${fid}`,
                            pfpUrl: userContext.user.pfpUrl || ''
                          }
                          setUserProfile(profile)
                          // Automatically fetch top 8
                          handleGetTop8(fid)
                        }
                      }
                    } catch (err) {
                      setError("Failed to connect with Farcaster. Please try again.")
                      console.error("Auth error:", err)
                    }
                  }}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white px-8 py-3 rounded-lg font-semibold"
                >
                  {loading ? 'Connecting...' : '🔗 Sign In with Farcaster'}
                </Button>
              </CardContent>
            </Card>
          )}

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
                Your Ride or Die Top 8
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {friends.map((friend, index) => {
                  const rideOrDieBadge = getRideOrDieBadge(friend.rideOrDieScore)
                  return (
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
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <Badge className={`text-xs ${rideOrDieBadge.color}`}>
                              {rideOrDieBadge.text}
                            </Badge>
                          </div>
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
                            <span className="text-gray-500 dark:text-gray-400">Ride or Die Score:</span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">{friend.rideOrDieScore}</span>
                          </div>
                          
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
                          
                          {friend.originalEngagementCastUrl && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Original cast:</span>
                              <a 
                                href={friend.originalEngagementCastUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                              >
                                View Cast 🔗
                              </a>
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Total interactions:</span>
                            <span className="font-medium dark:text-white">{friend.totalInteractions}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Engagement frequency:</span>
                            <span className="font-medium dark:text-white">{friend.engagementFrequency}/day</span>
                          </div>
                        </div>
                        
                        {/* Tip Button */}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Button 
                            onClick={() => setTippingUser(friend.fid)}
                            className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white"
                            size="sm"
                          >
                            💜 Tip {friend.display_name?.split(' ')[0] || friend.username}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && friends.length === 0 && userFid && (
            <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <p className="text-gray-600 dark:text-gray-300">
                  No mutual follows with engagement found. Try engaging more with your followers to see your top friends!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Finding your ride or die friends...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take 10-30 seconds</p>
            </div>
          )}

          {/* Tip Modal */}
          {tippingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <CardTitle>💜 Tip Your Ride or Die</CardTitle>
                  <CardDescription>
                    Show appreciation for your longest-standing mutual follow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tip Amount
                    </label>
                    <select
                      value={tipAmount}
                      onChange={(e) => setTipAmount(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value={100}>$1.00</option>
                      <option value={500}>$5.00</option>
                      <option value={1000}>$10.00</option>
                      <option value={2500}>$25.00</option>
                      <option value={5000}>$50.00</option>
                      <option value={10000}>$100.00</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleTip(tippingUser, tipAmount)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700"
                    >
                      💜 Send Tip
                    </Button>
                    <Button
                      onClick={() => setTippingUser(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 