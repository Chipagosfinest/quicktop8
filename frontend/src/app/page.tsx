

"use client"

import { useEffect, useState, useCallback } from 'react'
import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'
import Image from 'next/image'

export default function Home() {
  const { 
    isSDKLoaded, 
    isConnected, 
    isAuthenticated, 
    userFid, 
    authenticateUser, 
    signInWithFarcaster 
  } = useMiniApp()

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null)

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Fetching user data via Quick Auth...')
      
      // First test with a simpler endpoint
      const testResponse = await sdk.quickAuth.fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quicktop8-alpha.vercel.app'}/api/user/test`)
      
      if (testResponse.ok) {
        const testData = await testResponse.json()
        console.log('Test API working:', testData)
        
        // Now try the actual user endpoint with query parameters
        const response = await sdk.quickAuth.fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quicktop8-alpha.vercel.app'}/api/user?fid=${userFid}`)
        
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
          console.log('User data fetched successfully:', data)
        } else {
          console.error('Failed to fetch user data:', response.status)
          // Fallback to test data
          setUserData({
            fid: userFid,
            username: `user_${userFid}`,
            displayName: `User ${userFid}`,
            message: 'Using fallback data - API endpoint not working',
            test: true
          })
        }
      } else {
        console.error('Test API failed:', testResponse.status)
        setUserData({
          fid: userFid,
          username: `user_${userFid}`,
          displayName: `User ${userFid}`,
          message: 'API endpoints not working - using mock data',
          test: true
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserData({
        fid: userFid,
        username: `user_${userFid}`,
        displayName: `User ${userFid}`,
        message: 'Error occurred - using mock data',
        test: true
      })
    } finally {
      setLoading(false)
    }
  }, [userFid])

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        console.log('Home page: Initializing Mini App...')
        
        // Check if we're in a Mini App environment
        const miniAppCheck = await sdk.isInMiniApp()
        setIsInMiniApp(miniAppCheck)
        console.log('Mini App environment detected:', miniAppCheck)
        
        // Wait for SDK to be loaded
        if (isSDKLoaded) {
          console.log('Home page: SDK is loaded, calling sdk.actions.ready()')
        await sdk.actions.ready()
          console.log('Home page: sdk.actions.ready() completed successfully')
          
          // If already authenticated, get user data via Quick Auth
          if (isAuthenticated && userFid) {
            await fetchUserData()
          }
        } else {
          console.log('Home page: SDK not loaded yet, waiting...')
        }
      } catch (err) {
        console.error('Home page: Failed to call sdk.actions.ready():', err)
      }
    }

    // Call ready() when the component mounts and SDK is loaded
    if (isSDKLoaded) {
    initMiniApp()
    }
  }, [isSDKLoaded, isAuthenticated, userFid, fetchUserData])

  const handleQuickAuth = async () => {
    try {
      const result = await authenticateUser()
      console.log('Quick Auth result:', result)
      if (result && userFid) {
        await fetchUserData()
      }
    } catch (error) {
      console.error('Quick Auth failed:', error)
    }
  }

  const handleSignIn = async () => {
    try {
      const result = await signInWithFarcaster()
      console.log('Sign In result:', result)
    } catch (error) {
      console.error('Sign In failed:', error)
    }
  }

  // Show loading state
  if (!isSDKLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QuickTop8...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Reply Guy
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          Discover your biggest fans on Farcaster and send them prayer emoji NFTs!
        </p>
        
        {/* Add to Warpcast Button */}
        <div className="mb-8">
                      <button
              onClick={async () => {
                try {
                  await sdk.actions.addMiniApp()
                  alert('✅ App added to your Farcaster! You can now find it in your apps screen.')
                } catch (error) {
                  if (error === 'RejectedByUser') {
                    alert('❌ App add cancelled by user')
                  } else {
                    console.error('Error adding mini app:', error)
                    alert('❌ Error adding app to Farcaster')
                  }
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-colors font-medium shadow-lg"
            >
              ➕ Add to Farcaster
            </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
          
          {/* Environment Detection */}
          {isInMiniApp !== null && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Mini App Environment:</span>
                <span className={`px-2 py-1 rounded text-xs ${isInMiniApp ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {isInMiniApp ? '✅ Detected' : '⚠️ Not Detected'}
                </span>
              </div>
            </div>
          )}
          
          {/* Authentication Status */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SDK Loaded:</span>
              <span className={`px-2 py-1 rounded text-xs ${isSDKLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isSDKLoaded ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connected:</span>
              <span className={`px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {isConnected ? '✅' : '⚠️'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authenticated:</span>
              <span className={`px-2 py-1 rounded text-xs ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {isAuthenticated ? '✅' : '⚠️'}
              </span>
            </div>
            {userFid && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User FID:</span>
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                  {userFid}
                </span>
              </div>
            )}
          </div>

          {/* Show different content based on authentication status */}
          {isAuthenticated && userFid ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold mb-2">🎉 Successfully Authenticated!</h3>
                <p className="text-green-700 text-sm">
                  You&apos;re signed in as FID: {userFid}
                </p>
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading your data...</p>
                </div>
              ) : userData ? (
                <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-blue-800 font-semibold mb-2">📊 Your Top 8 Friends</h3>
                    
                    {/* Debug info */}
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p><strong>Debug:</strong> Data received: {JSON.stringify({
                        hasTopInteractions: !!userData.topInteractions,
                        topInteractionsLength: userData.topInteractions?.length,
                        isTest: userData.test,
                        message: userData.message,
                        hasRealData: !userData.test && userData.topInteractions?.length > 0
                      })}</p>
                    </div>
                    
                    {userData.test ? (
                      <div className="text-sm text-blue-700">
                        <p className="mb-2">🔄 <strong>Status:</strong> {userData.message}</p>
                        <p className="mb-2">👤 <strong>User:</strong> {userData.displayName} (FID: {userData.fid})</p>
                        <p className="text-xs text-blue-600">This is fallback data while we connect to the real API</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">👤 User:</span>
                          <span className="text-sm font-medium text-blue-800">{userData.displayName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">📊 Followers:</span>
                          <span className="text-sm font-medium text-blue-800">{userData.followerCount?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">📝 Casts:</span>
                          <span className="text-sm font-medium text-blue-800">{userData.castCount?.toLocaleString()}</span>
                        </div>
                        
                        {userData.bio && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm text-gray-700">{userData.bio}</p>
                          </div>
                        )}
                        
                        {userData.topInteractions && userData.topInteractions.length > 0 ? (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-blue-800">💬 Your Top Reply Guys & Inner Circle</h4>
                              <button
                                onClick={() => {
                                  const shareText = `💬 My Top Reply Guys & Inner Circle:\n\n${userData.topInteractions.slice(0, 8).map((friend: any, index: number) =>
                                    `${index + 1}. @${friend.username} - ${friend.interactionCount} interactions (${friend.likes} likes, ${friend.replies} replies, ${friend.recasts} recasts)`
                                  ).join('\n')}\n\nDiscover yours at: https://quicktop8-alpha.vercel.app`

                                  if (navigator.share) {
                                    navigator.share({
                                      title: 'Reply Guy - My Top Reply Guys',
                                      text: shareText,
                                      url: 'https://quicktop8-alpha.vercel.app'
                                    })
                                  } else {
                                    navigator.clipboard.writeText(shareText)
                                    alert('📋 Share text copied to clipboard!')
                                  }
                                }}
                                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs rounded-full transition-colors font-medium"
                              >
                                📤 Share
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              {userData.topInteractions.slice(0, 8).map((friend: any, index: number) => (
                                <div
                                  key={friend.fid}
                                  className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => {
                                    // Open user's Farcaster profile
                                    window.open(`https://warpcast.com/${friend.username}`, '_blank')
                                  }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      <Image
                                        src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.fid}`}
                                        alt={`${friend.displayName || friend.username}'s avatar`}
                                        width={48}
                                        height={48}
                                        className="rounded-full border-2 border-gray-200"
                                        onError={(e) => {
                                          // Fallback to dicebear avatar on error
                                          const target = e.target as HTMLImageElement
                                          target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.fid}`
                                        }}
                                      />
                                      {friend.verified && (
                                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                          ✓
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <h5 className="text-sm font-semibold text-gray-900 truncate">
                                          {friend.displayName || friend.username}
                                        </h5>
                                        {index === 0 && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            👑 Top Reply Guy
                                          </span>
                                        )}
                                        {index === 1 && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            💜 Inner Circle
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                                      {friend.bio && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{friend.bio}</p>
                                      )}
                                      
                                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                        <span>{friend.followerCount?.toLocaleString()} followers</span>
                                        <span>•</span>
                                        <span>{friend.interactionCount} total interactions</span>
                                      </div>
                                      
                                      <div className="flex items-center space-x-3 mt-2">
                                        <span className="text-xs text-red-500">❤️ {friend.likes}</span>
                                        <span className="text-xs text-blue-500">💬 {friend.replies}</span>
                                        <span className="text-xs text-green-500">🔄 {friend.recasts}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 mt-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation() // Prevent card click
                                        // Send prayer emoji NFT to the user's address
                                        sdk.actions.sendToken({
                                          recipientFid: friend.fid,
                                          amount: '1000000000000000', // 0.001 ETH (18 decimals) - mint fee
                                          token: 'eip155:8453/erc20:0x4200000000000000000000000000000000000006' // Base ETH
                                        }).then((result) => {
                                          if (result.success) {
                                            alert(`🙏 Prayer emoji NFT minted and sent to @${friend.username}!\n\nTransaction: ${result.send.transaction}\n\nYour prayer has been recorded on-chain!`)
                                          } else {
                                            alert(`🙏 Prayer NFT failed: ${result.error}`)
                                          }
                                        }).catch((error) => {
                                          console.error('Error minting prayer NFT:', error)
                                          alert(`🙏 Error minting prayer NFT for @${friend.username}: ${error}`)
                                        })
                                      }}
                                      className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white text-xs rounded-full transition-colors font-medium"
                                    >
                                      🙏 Send Prayer
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                                         <p className="text-sm text-yellow-800">
                               🚧 <strong>Coming Soon:</strong> We&apos;re working on analyzing your actual interactions to show your real top 8 friends!
                             </p>
                             <p className="text-xs text-yellow-600 mt-1">
                               For now, we&apos;re showing your profile data. The interaction analysis will be available soon.
                             </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={fetchUserData}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  🔍 Load My Data
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary: Quick Auth (works in Mini App) */}
              <button
                onClick={handleQuickAuth}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🚀 Quick Auth
              </button>
              
              {/* Secondary: Sign In with Farcaster (only show when not in Mini App) */}
              {isInMiniApp === false && (
                <>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">or</p>
                  </div>
                  
                  <button
                    onClick={handleSignIn}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    📱 Sign In with Farcaster
                  </button>
                  
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">
                      Use this option if Quick Auth doesn&apos;t work
                    </p>
                  </div>
                </>
              )}
              
              {/* Show message when in Mini App but not authenticated */}
              {isInMiniApp === true && !isAuthenticated && (
                <div className="text-center">
                  <p className="text-gray-500 text-xs">
                    Quick Auth should work automatically in Mini App environment
            </p>
          </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
