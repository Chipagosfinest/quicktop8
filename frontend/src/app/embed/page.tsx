import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Friends of Friends - Your Digital Squad',
  description: 'Discover your closest friends based on mutual affinity scores',
  openGraph: {
    title: 'Friends of Friends - Your Digital Squad',
    description: 'Discover your closest friends based on mutual affinity scores',
    images: ['https://friends-of-friends.vercel.app/og-image.png'],
    url: 'https://friends-of-friends.vercel.app/embed',
  },
  other: {
    'fc:miniapp': 'Friends of Friends',
    'fc:miniapp:domain': 'friends-of-friends.vercel.app',
    'fc:miniapp:icon': 'https://friends-of-friends.vercel.app/icon.png',
    'fc:miniapp:home': 'https://friends-of-friends.vercel.app'
  }
}

export default function EmbedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* FRIENDS OF FRIENDS Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full text-2xl font-bold text-white shadow-lg border-4 border-purple-500 mb-4">
            🤠
          </div>
          <h1 className="text-3xl font-bold text-purple-900 mb-2">
            FRIENDS OF FRIENDS
          </h1>
          <p className="text-purple-700 text-lg">
            Your Digital Squad
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-8 border-2 border-purple-300 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              Discover Your Top 8 Friends
            </h2>
            <p className="text-purple-700 text-lg mb-6">
              Relive the MySpace era with your most interactive Farcaster friends! 
              Connect your account to see who you vibe with the most.
            </p>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-purple-900 mb-1">Smart Scoring</h3>
                <p className="text-sm text-purple-700">
                  Based on mutual interactions, likes, recasts, and follows
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-2xl mb-2">🤝</div>
                <h3 className="font-semibold text-purple-900 mb-1">Real Connections</h3>
                <p className="text-sm text-purple-700">
                  Find your true friends, not just followers
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href="https://friends-of-friends.vercel.app/app"
              className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-purple-400 text-lg"
            >
              🤠 Find My Top 8
            </a>
          </div>
        </div>

        {/* Friends of Friends Stats */}
        <div className="mt-8 text-center">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-300">
            <h3 className="text-xl font-bold text-purple-900 mb-4">
              Why Friends of Friends?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-2xl mb-1">🎯</div>
                <div className="font-semibold text-purple-900">Smart Algorithm</div>
                <div className="text-purple-700">Advanced affinity scoring</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🔒</div>
                <div className="font-semibold text-purple-900">Privacy First</div>
                <div className="text-purple-700">Your data stays private</div>
              </div>
              <div>
                <div className="text-2xl mb-1">⚡</div>
                <div className="font-semibold text-purple-900">Lightning Fast</div>
                <div className="text-purple-700">Instant results</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 