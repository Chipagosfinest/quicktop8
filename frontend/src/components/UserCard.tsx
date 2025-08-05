import { Top8User } from '@/lib/types'
import { getAffinityTitle, formatLastInteraction } from '@/lib/utils'
import { sdk } from '@farcaster/miniapp-sdk'

interface UserCardProps {
  user: Top8User
  index: number
  onTip: (fid: number, username: string) => Promise<void>
}

export function UserCard({ user, index, onTip }: UserCardProps) {
  const affinityTitle = getAffinityTitle(user.mutual_affinity_score, user.rank)

  const handleCardClick = async () => {
    try {
      // Open user profile in Warpcast
      await sdk.actions.openUrl({
        url: `https://warpcast.com/${user.username}`
      })
    } catch (error) {
      console.error('Error opening profile:', error)
      // Fallback to window.open
      window.open(`https://warpcast.com/${user.username}`, '_blank')
    }
  }

  const handleTipClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await onTip(user.fid, user.username)
  }

  return (
    <div
      data-rank={user.rank}
      className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group relative ${
        index === 0 ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-purple-100' :
        index === 1 ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-white' :
        index === 2 ? 'border-purple-200 bg-gradient-to-r from-white to-purple-50' :
        'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
      }`}
      onClick={handleCardClick}
    >
      {/* Profile Section */}
      <div className="text-center mb-4">
        {/* Rank above profile picture */}
        <div className={`inline-block bg-gradient-to-r ${affinityTitle.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg mb-3`}>
          #{user.rank}
        </div>
        
        <div className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-purple-500 overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 relative">
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
          {user.verified && (
            <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              ✓
            </div>
          )}
        </div>
        
        {/* Better Organized User Info */}
        <div className="space-y-2">
          <h3 className="font-bold text-purple-900 text-lg">
            {user.display_name || user.username}
          </h3>
          
          <div className="text-purple-600 text-sm">
            {user.ens_name ? (
              <span>
                <span className="text-purple-600 font-medium">{user.ens_name}</span>
                <span className="text-purple-500 ml-2">@{user.username}</span>
              </span>
            ) : (
              <span className="text-purple-600 font-medium">@{user.username}</span>
            )}
          </div>

          {/* Bio - Positioned between username and connection type */}
          {user.bio && (
            <div className="mt-2">
              <p className="text-purple-600 text-xs italic bg-purple-50 p-2 rounded-lg border-l-3 border-purple-400 leading-relaxed">
                "{user.bio}"
              </p>
            </div>
          )}

          {/* Affinity Title Badge */}
          <div className={`inline-block bg-gradient-to-r ${affinityTitle.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
            {affinityTitle.icon} {affinityTitle.title}
          </div>
        </div>
      </div>

      {/* Friends of Friends - More Meaningful Label */}
      {user.social_scope && user.social_scope.friends_of_friends.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-purple-800 mb-2">🌟 Friends of Friends</div>
          <div className="text-xs text-purple-600 mb-2 italic">
            People they interact with most
          </div>
          <div className="flex flex-wrap gap-1">
            {user.social_scope.friends_of_friends.slice(0, 4).map((friend) => (
              <button
                key={friend.fid}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://warpcast.com/${friend.username}`, '_blank');
                }}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full px-2 py-1 text-xs border border-purple-200 hover:from-purple-100 hover:to-indigo-100 transition-colors"
              >
                <span className="text-purple-800 font-medium text-xs">@{friend.username}</span>
              </button>
            ))}
            {user.social_scope.friends_of_friends.length > 4 && (
              <span className="text-xs text-gray-500">+{user.social_scope.friends_of_friends.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* Interaction Stats */}
      {user.interaction_stats && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-purple-800 mb-2">💬 Recent Activity</div>
          <div className="grid grid-cols-3 gap-1 text-xs">
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
          <div className="mt-2 text-center">
            <div className="text-xs text-gray-600">
              Last: {formatLastInteraction(user.interaction_stats.last_interaction_date)}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleTipClick}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 text-sm border-2 border-purple-400"
        >
          💰 Tip $1
        </button>
        
        {/* Affinity Score below tip button */}
        <div className="text-center">
          <div className="text-xs text-purple-600 font-medium mb-1">Affinity Score</div>
          <div className="text-lg font-bold text-purple-700 bg-purple-50 rounded-lg py-1 px-2 border border-purple-200">
            {user.mutual_affinity_score.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
} 