'use client'

import { useState } from 'react'
import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'
import { useTop8 } from '@/lib/hooks/useTop8'
import { UserCard } from '@/components/UserCard'
import { StatsSection } from '@/components/StatsSection'

export default function App() {
  const [showScoringPrimer, setShowScoringPrimer] = useState(false)
  
  const {
    top8,
    loading,
    error,
    userFid,
    stats,
    hasMore,
    allUsers,
    handleGetTop8,
    loadMore,
    isInMiniApp,
    isSDKLoaded
  } = useTop8()

  const { signInWithFarcaster } = useMiniApp()

  const handleShareResults = async () => {
    if (!userFid || top8.length === 0) return

    try {
      const top3 = top8.slice(0, 3)
      const top3Usernames = top3.map(user => `@${user.username}`).join(' ')
      
      // Create viral embedded cast with dynamic content
      const shareText = `🤠 Just discovered my Top 8 on QuickTop8!\n\n${top3.map((user, i) => 
        `${i + 1}. ${user.display_name || user.username} (${user.mutual_affinity_score.toFixed(0)} affinity)`
      ).join('\n')}\n\n${top3Usernames} - you're my ride or dies! 💜\n\nDiscover your Top 8 at quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app`

      // Use the compose API to create an embedded cast
      await sdk.actions.openUrl({
        url: `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds=${encodeURIComponent('https://quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app/embed')}`
      })

      console.log('Shared results with embedded cast successfully')
    } catch (error) {
      console.error('Error sharing results:', error)
    }
  }

  const handleTipUser = async (fid: number, username: string) => {
    try {
      // Use the latest sendToken API for better wallet integration
      const result = await sdk.actions.sendToken({
        token: 'eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
        amount: '1000000', // 1 USDC (6 decimals)
        recipientFid: fid
      })

      if (result.success) {
        console.log(`Tipped ${username} successfully: ${result.send.transaction}`)
      } else {
        console.error('Tip failed:', result.reason, result.error)
      }
    } catch (error) {
      console.error('Error tipping user:', error)
      // Fallback to URL method if sendToken fails
      try {
        await sdk.actions.openUrl({
          url: `https://warpcast.com/~/tip/${fid}?amount=1000&message=${encodeURIComponent(`Thanks for being in my Top 8! 🤠`)}`
        })
      } catch (fallbackError) {
        console.error('Fallback tip also failed:', fallbackError)
      }
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-400 rounded-full transform rotate-12 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400 rounded-full transform -rotate-12 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-purple-400 rounded-full transform rotate-30 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-purple-600 bg-opacity-90 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider border border-purple-500">
          QUICKTOP8
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-purple-500 animate-bounce">
              🤠
            </div>
            <h1 className="text-4xl font-bold text-purple-900 ml-4 drop-shadow-lg">
              Your Digital Squad
            </h1>
          </div>
          <p className="text-purple-800 text-lg mb-2 drop-shadow-md">
            Relive the MySpace era with your most interactive Farcaster friends. Connect your account to see who you vibe with the most! 🔥
          </p>
          
          {/* Scoring Primer */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-300 inline-block mb-4">
            <button
              onClick={() => setShowScoringPrimer(!showScoringPrimer)}
              className="text-sm text-purple-700 hover:text-purple-900 font-semibold flex items-center space-x-2"
            >
              <span>📊</span>
              <span>How is my Top 8 calculated?</span>
              <span className={`transform transition-transform ${showScoringPrimer ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showScoringPrimer && (
              <div className="mt-3 text-left text-xs text-purple-600 bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="font-semibold mb-2">🎯 Affinity Scoring System:</div>
                <ul className="space-y-1">
                  <li>• <strong>Mutual Affinity Score:</strong> Based on how much you and your friend interact with each other's content</li>
                  <li>• <strong>Interaction Types:</strong> Likes, recasts, replies, and follows all contribute to the score</li>
                  <li>• <strong>Recency Bonus:</strong> Recent interactions are weighted more heavily</li>
                  <li>• <strong>Network Density:</strong> How connected they are to your broader social network</li>
                  <li>• <strong>Ranking:</strong> #1 = Highest affinity, #8 = Still great but lower on the list</li>
                </ul>
                <div className="mt-2 text-center text-purple-500 font-medium">
                  💡 Higher scores = stronger friendship bonds!
                </div>
              </div>
            )}
          </div>

          {stats && (
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-300 inline-block">
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
            {/* Enhanced Stats Section */}
            {stats && <StatsSection stats={stats} totalUsers={allUsers.length} />}

            {/* Share Button */}
            <div className="text-center">
              <button
                onClick={handleShareResults}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-purple-400"
              >
                🤠 Share My Top 8
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {allUsers.map((user, index) => (
                <UserCard 
                  key={user.fid} 
                  user={user} 
                  index={index} 
                  onTip={handleTipUser}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : '🔄 Load More Connections'}
                </button>
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