import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crypto Streams - Your Top 8 Recommended Streamers',
  description: 'Discover your favorite crypto content creators on Farcaster and send them gifts!',
  openGraph: {
    title: 'Crypto Streams - Your Top 8 Recommended Streamers',
    description: 'Discover your favorite crypto content creators on Farcaster and send them gifts!',
    images: ['https://quicktop8-ove8p1obu-chipagosfinests-projects.vercel.app/og-image.png'],
  },
  other: {
    'fc:miniapp': 'Crypto Streams',
    'fc:miniapp:domain': 'quicktop8-ove8p1obu-chipagosfinests-projects.vercel.app',
    'fc:miniapp:icon': 'https://quicktop8-ove8p1obu-chipagosfinests-projects.vercel.app/icon.png',
    'fc:miniapp:home': 'https://quicktop8-ove8p1obu-chipagosfinests-projects.vercel.app'
  }
};

export default function EmbedPage() {
  return (
    <div className="embed-container">
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Crypto Streams Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-green-400 rounded-full transform rotate-12 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-red-400 rounded-full transform -rotate-12 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-yellow-400 rounded-full transform rotate-30 animate-pulse"></div>
          <div className="absolute top-60 left-1/4 w-12 h-12 bg-pink-400 rounded-full transform -rotate-45 animate-bounce"></div>
          <div className="absolute bottom-40 right-1/3 w-18 h-18 bg-cyan-400 rounded-full transform rotate-60 animate-pulse"></div>
        </div>

        {/* CRYPTO STREAMS Logo */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black bg-opacity-80 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider">
            CRYPTO STREAMS
          </div>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative z-10 border-2 border-purple-300">
          <div className="mb-6">
            {/* Gaming Controller Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-purple-300 animate-bounce">
                🎮
              </div>
              <h1 className="text-3xl font-bold text-gray-900 ml-4">
                Recommended Streamers
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Your favorite crypto content creators! 🚀
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">🎮 Live Now</h3>
              <p className="text-sm text-purple-700">
                Discover your top 8 recommended crypto streamers based on your interactions!
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">💎 Crypto Bros</h3>
              <p className="text-sm text-blue-700">
                Find your favorite crypto content creators and support them with gifts!
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🚀 To The Moon</h3>
              <p className="text-sm text-green-700">
                Send emoji gifts worth 1-10 USDC to your favorite streamers!
              </p>
            </div>
          </div>

          <div className="mt-6">
            <a 
              href="/app" 
              className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
            >
              🎮 Open Mini App
            </a>
          </div>

          {/* Crypto Streams Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">🎮</div>
                <div className="text-xs text-gray-600">Live Streams</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">💎</div>
                <div className="text-xs text-gray-600">Crypto Bros</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">🚀</div>
                <div className="text-xs text-gray-600">To The Moon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 