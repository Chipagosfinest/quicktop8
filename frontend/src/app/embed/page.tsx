import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QuickTop8 - Your Top 8 Mutual Friends',
  description: 'Discover your top 8 mutual friends on Farcaster - the ones you engage with most!',
  openGraph: {
    title: 'QuickTop8 - Your Top 8 Mutual Friends',
    description: 'Discover your top 8 mutual friends on Farcaster - the ones you engage with most!',
    images: ['https://quicktop8-ab64635us-chipagosfinests-projects.vercel.app/og-image.png'],
  },
  other: {
    'fc:miniapp': 'QuickTop8',
    'fc:miniapp:domain': 'quicktop8-ab64635us-chipagosfinests-projects.vercel.app',
    'fc:miniapp:icon': 'https://quicktop8-ab64635us-chipagosfinests-projects.vercel.app/icon.png',
    'fc:miniapp:home': 'https://quicktop8-ab64635us-chipagosfinests-projects.vercel.app'
  }
};

export default function EmbedPage() {
  return (
    <div className="embed-container">
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Cowboy Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-amber-400 rounded-full transform rotate-12 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-orange-400 rounded-full transform -rotate-12 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-yellow-400 rounded-full transform rotate-30 animate-pulse"></div>
          <div className="absolute top-60 left-1/4 w-12 h-12 bg-red-400 rounded-full transform -rotate-45 animate-bounce"></div>
          <div className="absolute bottom-40 right-1/3 w-18 h-18 bg-brown-400 rounded-full transform rotate-60 animate-pulse"></div>
        </div>

        {/* QUICKTOP8 Logo */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-amber-800 bg-opacity-90 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider border border-amber-600">
            QUICKTOP8
          </div>
        </div>

        <div className="bg-amber-50 bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative z-10 border-4 border-amber-800">
          <div className="mb-6">
            {/* Cowboy Hat Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-amber-500 animate-bounce">
                🤠
              </div>
              <h1 className="text-3xl font-bold text-amber-900 ml-4">
                Wanted: Top 8 Friends
              </h1>
            </div>
            <p className="text-amber-800 text-lg">
              Your most engaged mutual friends on Farcaster! 🤠
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-300">
              <h3 className="font-semibold text-amber-900 mb-2">🤠 Wanted Posters</h3>
              <p className="text-sm text-amber-700">
                Discover your top 8 mutual friends based on your interactions!
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-300">
              <h3 className="font-semibold text-orange-900 mb-2">💫 Ride or Die Friends</h3>
              <p className="text-sm text-orange-700">
                Find the friends you engage with most and want more like them!
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-300">
              <h3 className="font-semibold text-yellow-900 mb-2">🌟 Friendship Goals</h3>
              <p className="text-sm text-yellow-700">
                Celebrate your strongest connections and find more like them!
              </p>
            </div>
          </div>

          <div className="mt-6">
            <a 
              href="/app" 
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block border-2 border-amber-400"
            >
              🤠 Open Mini App
            </a>
          </div>

          {/* QuickTop8 Stats */}
          <div className="mt-6 pt-4 border-t-2 border-amber-300">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-amber-600">🤠</div>
                <div className="text-xs text-amber-700">Wanted Friends</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">💫</div>
                <div className="text-xs text-orange-700">Ride or Die</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">🌟</div>
                <div className="text-xs text-yellow-700">Friendship Goals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 