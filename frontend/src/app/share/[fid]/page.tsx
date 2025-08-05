import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface SharePageProps {
  params: Promise<{
    fid: string
  }>
}

// Generate metadata for the share page
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { fid } = await params
  
  try {
    // Fetch the user's Top 8 data to generate personalized metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://friends-of-friends.vercel.app'}/api/top8-simple?fid=${fid}&page=1`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      return {
        title: 'Friends of Friends - Top 8',
        description: 'Discover your closest friends based on mutual affinity scores',
        openGraph: {
          title: 'Friends of Friends - Top 8',
          description: 'Discover your closest friends based on mutual affinity scores',
          images: ['https://friends-of-friends.vercel.app/og-image.png'],
          url: `https://friends-of-friends.vercel.app/share/${fid}`,
        },
      }
    }
    
    const data = await response.json()
    const top8 = data.top8 || []
    const stats = data.stats || {}
    
    if (top8.length === 0) {
      return {
        title: 'Friends of Friends - Top 8',
        description: 'Discover your closest friends based on mutual affinity scores',
        openGraph: {
          title: 'Friends of Friends - Top 8',
          description: 'Discover your closest friends based on mutual affinity scores',
          images: ['https://friends-of-friends.vercel.app/og-image.png'],
          url: `https://friends-of-friends.vercel.app/share/${fid}`,
        },
      }
    }
    
    // Create personalized metadata
    const top3 = top8.slice(0, 3)
    const top3Names = top3.map((user: any) => user.display_name || user.username).join(', ')
    const averageAffinity = stats.average_affinity_score?.toFixed(1) || 'N/A'
    
    return {
      title: `Top 8 Friends - ${top3Names}`,
      description: `Discovered ${top8.length} close friends with ${averageAffinity} average affinity score. ${top3Names} are my ride or dies! 💜`,
      openGraph: {
        title: `Top 8 Friends - ${top3Names}`,
        description: `Discovered ${top8.length} close friends with ${averageAffinity} average affinity score. ${top3Names} are my ride or dies! 💜`,
        images: [
          {
            url: 'https://friends-of-friends.vercel.app/og-image.png',
            width: 1200,
            height: 630,
            alt: 'Friends of Friends Top 8'
          }
        ],
        url: `https://friends-of-friends.vercel.app/share/${fid}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Top 8 Friends - ${top3Names}`,
        description: `Discovered ${top8.length} close friends with ${averageAffinity} average affinity score. ${top3Names} are my ride or dies! 💜`,
        images: ['https://friends-of-friends.vercel.app/og-image.png'],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Friends of Friends - Top 8',
      description: 'Discover your closest friends based on mutual affinity scores',
      openGraph: {
        title: 'Friends of Friends - Top 8',
        description: 'Discover your closest friends based on mutual affinity scores',
        images: ['https://friends-of-friends.vercel.app/og-image.png'],
        url: `https://friends-of-friends.vercel.app/share/${fid}`,
      },
    }
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { fid } = await params
  
  try {
    // Fetch the user's Top 8 data
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://friends-of-friends.vercel.app'}/api/top8-simple?fid=${fid}&page=1`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      notFound()
    }
    
    const data = await response.json()
    const top8 = data.top8 || []
    const stats = data.stats || {}
    
    if (top8.length === 0) {
      // Show a friendly message instead of 404
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full text-2xl font-bold text-white shadow-lg border-4 border-purple-500 mb-4">
              🤠
            </div>
            <h1 className="text-3xl font-bold text-purple-900 mb-2">
              No Top 8 Found
            </h1>
            <p className="text-purple-700 text-lg mb-6">
              This user hasn't generated their Top 8 yet, or they don't have enough connections.
            </p>
            <a
              href="https://friends-of-friends.vercel.app/app"
              className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-purple-400 text-lg"
            >
              🤠 Find My Top 8
            </a>
          </div>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full text-2xl font-bold text-white shadow-lg border-4 border-purple-500 mb-4">
              🤠
            </div>
            <h1 className="text-3xl font-bold text-purple-900 mb-2">
              Top 8 Friends
            </h1>
            <p className="text-purple-700 text-lg">
              Discovered through mutual affinity scores
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-300 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-900">{top8.length}</div>
                  <div className="text-sm text-purple-700">Total Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">{stats.average_affinity_score?.toFixed(1) || 'N/A'}</div>
                  <div className="text-sm text-purple-700">Avg Affinity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">{stats.top_affinity_score?.toFixed(1) || 'N/A'}</div>
                  <div className="text-sm text-purple-700">Top Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">{stats.verified_users || 0}</div>
                  <div className="text-sm text-purple-700">Verified</div>
                </div>
              </div>
            </div>
          )}

          {/* Top 8 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {top8.map((user: any, index: number) => (
              <div key={user.fid} className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-300 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={user.pfp_url || '/prayer-hand-emoji.svg'} 
                        alt={user.display_name || user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/prayer-hand-emoji.svg';
                        }}
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-purple-900 truncate">
                      {user.display_name || user.username}
                    </div>
                    <div className="text-sm text-purple-700 truncate">
                      @{user.username}
                    </div>
                    <div className="text-xs text-purple-600">
                      {user.mutual_affinity_score?.toFixed(1) || 'N/A'} affinity
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="https://friends-of-friends.vercel.app/app"
              className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-purple-400 text-lg"
            >
              🤠 Find My Top 8
            </a>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading share page:', error)
    notFound()
  }
} 