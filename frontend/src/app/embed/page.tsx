import { Metadata } from 'next';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'QuickTop8 - Your Digital Squad',
  description: 'Discover your closest friends based on mutual affinity scores. Relive the MySpace era with your most interactive Farcaster friends! 🔥',
  openGraph: {
    title: 'QuickTop8 - Your Digital Squad',
    description: 'Discover your closest friends based on mutual affinity scores and see their friends of friends. Relive the MySpace era with your most interactive Farcaster friends! 🔥',
    images: ['https://quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app/og-image.png'],
    type: 'website',
    url: 'https://quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app/embed',
  },
  other: {
    'fc:miniapp': 'QuickTop8',
    'fc:miniapp:domain': 'quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app',
    'fc:miniapp:icon': 'https://quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app/icon.png',
    'fc:miniapp:home': 'https://quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app'
  }
};

export default function EmbedPage() {
  return (
    <div className="embed-container">
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-400 rounded-full transform rotate-12 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-pink-400 rounded-full transform -rotate-12 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-indigo-400 rounded-full transform rotate-30 animate-pulse"></div>
        </div>

        {/* QUICKTOP8 Logo */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-purple-800 bg-opacity-90 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider border border-purple-600">
            QUICKTOP8
          </div>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative z-10 border-4 border-purple-800">
          <div className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-purple-500 animate-bounce">
                🤠
              </div>
              <h1 className="text-3xl font-bold text-purple-900 ml-4">
                Your Top 8 Friends
              </h1>
            </div>
            <p className="text-purple-800 text-lg">
              Discover your closest friends based on mutual affinity scores 🤠
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-300">
              <h3 className="font-semibold text-purple-900 mb-2">💖 Ride or Die</h3>
              <p className="text-sm text-purple-700">
                Find your closest friends with the highest mutual affinity
              </p>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border-2 border-pink-300">
              <h3 className="font-semibold text-pink-900 mb-2">💎 Best Friends</h3>
              <p className="text-sm text-pink-700">
                See who your friends are closest to and expand your network
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-300">
              <h3 className="font-semibold text-indigo-900 mb-2">🌟 Social Discovery</h3>
              <p className="text-sm text-indigo-700">
                Rich social insights powered by Neynar's affinity scoring
              </p>
            </div>

            {/* Troubleshooting Info */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300">
              <h3 className="font-semibold text-yellow-900 mb-2">🔧 Troubleshooting</h3>
              <p className="text-sm text-yellow-700 mb-2">
                Having issues? Check our health status:
              </p>
              <div className="flex justify-center space-x-2">
                <a 
                  href="/api/health" 
                  target="_blank"
                  className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded transition-colors"
                >
                  Health Check
                </a>
                <a 
                  href="/api/test" 
                  target="_blank"
                  className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded transition-colors"
                >
                  API Test
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <a 
              href="/app" 
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block border-2 border-purple-400"
            >
              🤠 Open Mini App
            </a>
          </div>

          {/* QuickTop8 Stats */}
          <div className="mt-6 pt-4 border-t-2 border-purple-300">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">💖</div>
                <div className="text-xs text-purple-700">Top Friends</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600">💎</div>
                <div className="text-xs text-pink-700">Affinity Scores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">🌟</div>
                <div className="text-xs text-indigo-700">Social Discovery</div>
              </div>
            </div>
          </div>

          {/* Error Handling Tips */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <details className="text-xs text-gray-600">
              <summary className="cursor-pointer hover:text-gray-800 font-medium">
                🔧 Common Issues & Solutions
              </summary>
              <div className="mt-2 text-left space-y-1">
                <div><strong>Rate Limited:</strong> Wait 1 minute and try again</div>
                <div><strong>API Key Error:</strong> Check environment configuration</div>
                <div><strong>Network Error:</strong> Check your internet connection</div>
                <div><strong>User Not Found:</strong> Verify the FID is correct</div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
} 