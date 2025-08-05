import { Top8Stats } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface StatsSectionProps {
  stats: Top8Stats
  totalUsers: number
}

export function StatsSection({ stats, totalUsers }: StatsSectionProps) {
  return (
    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-purple-400">
      <h3 className="text-xl font-bold text-purple-900 mb-4 text-center">📊 Your Digital Squad Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-300">
          <div className="text-2xl font-bold text-purple-600">{totalUsers}</div>
          <div className="text-purple-700 text-sm">Total Connections</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-300">
          <div className="text-2xl font-bold text-purple-600">{stats.average_affinity_score?.toFixed(1) || 'N/A'}</div>
          <div className="text-purple-700 text-sm">Avg Affinity</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-300">
          <div className="text-2xl font-bold text-purple-600">{stats.top_affinity_score?.toFixed(1) || 'N/A'}</div>
          <div className="text-purple-700 text-sm">Top Score</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-300">
          <div className="text-2xl font-bold text-purple-600">{stats.verified_users || 0}</div>
          <div className="text-purple-700 text-sm">Verified</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm text-purple-600 bg-purple-50 rounded-lg p-2">
          💡 <strong>Network Strength:</strong> {formatNumber(stats.total_followers || 0)} total followers across your squad
        </div>
      </div>
    </div>
  )
} 