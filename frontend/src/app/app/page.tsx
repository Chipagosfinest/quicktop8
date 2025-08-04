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
  originalEngagementCastHash: string
  originalEngagementCastUrl: string
  rideOrDieScore: number
  daysSinceFirstEngagement: number
  engagementFrequency: number
}

export default function App() {
  const [friends, setFriends] = useState<MutualFollow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const [userFid, setUserFid] = useState<number | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [tippingUser, setTippingUser] = useState<MutualFollow | null>(null)
  const [tipAmount, setTipAmount] = useState(500)
  
  const { isSDKLoaded, isConnected, userFid: contextUserFid, context, signInWithFarcaster } = useMiniApp()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMiniApp = window.location.href.includes('farcaster.com') || 
                       window.location.href.includes('warpcast.com') ||
                       window.parent !== window ||
                       (window as any).ReactNativeWebView
      setIsInMiniApp(isMiniApp)
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

  useEffect(() => {
    if (isSDKLoaded && isInMiniApp) {
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
      const response = await fetch("/api/replyguys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fid }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setFriends(data.friends || [])
    } catch (err) {
      console.error("Error fetching top 8:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch your ride or die crew")
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
        body: JSON.stringify({ recipientFid, amount }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert(`Successfully tipped ${(amount / 100).toFixed(2)} to your Bitcoin bro! 🎉`)
      setTippingUser(null)
      setTipAmount(500)
    } catch (err) {
      console.error("Error tipping:", err)
      alert(err instanceof Error ? err.message : "Failed to send tip")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getEngagementIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️'
      case 'recast': return '🔄'
      case 'reply': return '💬'
      default: return '🤝'
    }
  }

  const getRideOrDieBadge = (score: number) => {
    if (score >= 500) return <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full text-xs font-semibold">🏆 Legend</span>
    if (score >= 200) return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-semibold">⭐ All-Star</span>
    if (score >= 50) return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-semibold">🎖️ Hall of Famer</span>
    return <span className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-semibold">👑 Supporter</span>
  }

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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-yellow-400 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-gray-800 rounded-full transform rotate-45"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-gray-800 rounded-full transform -rotate-12"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-gray-800 rounded-full transform rotate-30"></div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black bg-opacity-80 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider">
          BRAINLESS TALES
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-yellow-300 animate-bounce">
              ₿
            </div>
            <h1 className="text-4xl font-bold text-white ml-4 drop-shadow-lg">
              Ride or Die Top 8
            </h1>
          </div>
          <p className="text-white text-lg mb-2 drop-shadow-md">
            Your longest-standing Farcaster friends on the crypto roller coaster! 🎢
          </p>
          <div className="flex justify-center space-x-2 mb-4">
            <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">🔥 Ride or Die</span>
            <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">💎 Bitcoin Bros</span>
            <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">🎢 Crypto Coaster</span>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-yellow-300 animate-spin mx-auto mb-4">
              ₿
            </div>
            <p className="text-white text-lg">Loading your ride or die crew...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
              ⚠️
            </div>
            <p className="text-white text-lg mb-4">{error}</p>
            <button
              onClick={() => {
                if (userFid) {
                  handleGetTop8(userFid);
                }
              }}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && friends.length > 0 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Your Crypto Roller Coaster Crew 🎢
              </h2>
              <p className="text-white opacity-90">
                These Bitcoin bros have been riding the ups and downs with you!
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend, index) => (
                <div
                  key={friend.fid}
                  className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-2 border-yellow-300 hover:border-orange-400 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg border-2 border-yellow-300">
                      ₿
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Ride or Die Score</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {friend.rideOrDieScore}
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
                      {friend.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {friend.username || `FID ${friend.fid}`}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {friend.display_name || 'Crypto Warrior'}
                    </p>
                    <div className="flex justify-center space-x-1 mb-3">
                      {getRideOrDieBadge(friend.rideOrDieScore)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Days Riding:</span>
                      <span className="font-semibold text-orange-600">
                        {friend.daysSinceFirstEngagement}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Interactions:</span>
                      <span className="font-semibold text-orange-600">
                        {friend.totalInteractions}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Engagement Freq:</span>
                      <span className="font-semibold text-orange-600">
                        {friend.engagementFrequency}
                      </span>
                    </div>
                  </div>

                  {friend.originalEngagementCastUrl && (
                    <div className="mb-4">
                      <a
                        href={friend.originalEngagementCastUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm"
                      >
                        🎢 View Original Cast
                      </a>
                    </div>
                  )}

                  <button
                    onClick={() => setTippingUser(friend)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    💰 Tip Bitcoin Bro
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && friends.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
              🎢
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Ride or Die Friends Yet
            </h3>
            <p className="text-white opacity-90 mb-4">
              Start engaging with your mutual follows to build your crypto roller coaster crew!
            </p>
            <button
              onClick={() => userFid && handleGetTop8(userFid)}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {tippingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
                ₿
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tip {tippingUser.username || `FID ${tippingUser.fid}`}
              </h3>
              <p className="text-gray-600">
                Show appreciation for your ride or die Bitcoin bro! 🎢
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[100, 500, 1000, 2500, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  className={`p-3 rounded-lg font-semibold transition-all duration-300 ${
                    tipAmount === amount
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ${(amount / 100).toFixed(2)}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setTippingUser(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTip(tippingUser.fid, tipAmount)}
                disabled={!tipAmount}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Tip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 