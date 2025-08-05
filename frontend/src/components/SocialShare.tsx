'use client'

import { useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface SocialShareProps {
  replyGuys: any[]
  userFid: number | null
  onShare?: () => void
}

export default function SocialShare({ replyGuys, userFid, onShare }: SocialShareProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareType, setShareType] = useState<'results' | 'challenge' | 'leaderboard'>('results')

  const generateShareText = () => {
    if (shareType === 'results') {
      const topReplyGuys = replyGuys.slice(0, 3)
      return `🤠 My top reply guys on QuickTop8:\n\n${topReplyGuys.map((rg, i) => 
        `${i + 1}. @${rg.username} (${rg.replyCount} replies, ${rg.reply_quality_score?.toFixed(0) || 0} quality score)`
      ).join('\n')}\n\nDiscover your reply guys at quicktop8.vercel.app`
    } else if (shareType === 'challenge') {
      return `🏆 Challenge: Can you beat my reply guy quality score of ${replyGuys[0]?.reply_quality_score?.toFixed(0) || 0}?\n\nFind your top reply guys at quicktop8.vercel.app`
    } else {
      return `📊 I just discovered ${replyGuys.length} reply guys with an average quality score of ${(replyGuys.reduce((sum, rg) => sum + (rg.reply_quality_score || 0), 0) / replyGuys.length).toFixed(0)}!\n\nWhat's your score? quicktop8.vercel.app`
    }
  }

  const handleShare = async () => {
    if (!userFid || replyGuys.length === 0) return

    setIsSharing(true)
    try {
      const shareText = generateShareText()
      
      // Use Farcaster SDK to open compose with pre-filled text
      await sdk.actions.openUrl({
        url: `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`
      })

      onShare?.()
      console.log('Shared successfully')
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleTipTopReplyGuy = async () => {
    if (!userFid || replyGuys.length === 0) return

    try {
      const topReplyGuy = replyGuys[0]
      const tipUrl = `https://warpcast.com/~/tip/${topReplyGuy.fid}?amount=1000&message=${encodeURIComponent('Thanks for being my top reply guy! 🤠')}`
      
      await sdk.actions.openUrl({
        url: tipUrl
      })
    } catch (error) {
      console.error('Error tipping:', error)
    }
  }

  if (replyGuys.length === 0) return null

  return (
    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-green-400">
      <h3 className="text-xl font-bold text-green-900 mb-4 text-center">
        📤 Share Your Results
      </h3>
      
      <div className="space-y-4">
        {/* Share Type Selector */}
        <div className="flex justify-center">
          <div className="bg-green-50 rounded-xl p-1 border-2 border-green-300">
            <button
              onClick={() => setShareType('results')}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                shareType === 'results'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'text-green-700 hover:bg-green-100'
              }`}
            >
              📊 Results
            </button>
            <button
              onClick={() => setShareType('challenge')}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                shareType === 'challenge'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'text-green-700 hover:bg-green-100'
              }`}
            >
              🏆 Challenge
            </button>
            <button
              onClick={() => setShareType('leaderboard')}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                shareType === 'leaderboard'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'text-green-700 hover:bg-green-100'
              }`}
            >
              📈 Stats
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
          <p className="text-green-800 text-sm font-semibold mb-2">Preview:</p>
          <p className="text-green-700 text-xs whitespace-pre-wrap">
            {generateShareText()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? '📤 Sharing...' : '📤 Share to Warpcast'}
          </button>
          
          <button
            onClick={handleTipTopReplyGuy}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-amber-400"
            title="Tip your top reply guy"
          >
            💰 Tip #1
          </button>
        </div>

        {/* Social Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-300">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Social Tips:</h4>
          <ul className="text-blue-700 text-xs space-y-1">
            <li>• Share during peak hours for maximum engagement</li>
            <li>• Tag friends to challenge them to beat your score</li>
            <li>• Use the challenge mode to create friendly competition</li>
            <li>• Tip your top reply guys to strengthen relationships</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 