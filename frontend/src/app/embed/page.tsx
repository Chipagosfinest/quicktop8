import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ride or Die Top 8 - Your Longest-Standing Farcaster Friends',
  description: 'Discover your ride or die friends on Farcaster with original engagement links and tip them!',
  openGraph: {
    title: 'Ride or Die Top 8 - Your Longest-Standing Farcaster Friends',
    description: 'Discover your ride or die friends on Farcaster with original engagement links and tip them!',
    images: ['https://quicktop8-ddoijak01-chipagosfinests-projects.vercel.app/og-image.png'],
  },
  other: {
    'fc:miniapp': 'Ride or Die Top 8',
    'fc:miniapp:domain': 'quicktop8-ddoijak01-chipagosfinests-projects.vercel.app',
    'fc:miniapp:icon': 'https://quicktop8-ddoijak01-chipagosfinests-projects.vercel.app/icon.png',
    'fc:miniapp:home': 'https://quicktop8-ddoijak01-chipagosfinests-projects.vercel.app'
  }
};

export default function EmbedPage() {
  return (
    <div className="embed-container">
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-yellow-400 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Roller Coaster Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-wood-800 rounded-full transform rotate-45"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-4 border-wood-800 rounded-full transform -rotate-12"></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-wood-800 rounded-full transform rotate-30"></div>
        </div>

        {/* BRAINLESS TALES Logo */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black bg-opacity-80 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider">
            BRAINLESS TALES
          </div>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative z-10 border-2 border-yellow-300">
          <div className="mb-6">
            {/* Bitcoin Coin Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-yellow-300 animate-bounce">
                ₿
              </div>
              <h1 className="text-3xl font-bold text-gray-900 ml-4">
                Ride or Die Top 8
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Your longest-standing Farcaster friends on the crypto roller coaster! 🎢
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-2">🔥 Ride or Die</h3>
              <p className="text-sm text-orange-700">
                Discover your most loyal mutuals and celebrate your Farcaster journey together on the crypto roller coaster!
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">💎 Bitcoin Bros</h3>
              <p className="text-sm text-blue-700">
                Find your Bitcoin bros who've been riding the ups and downs with you in the crypto trenches!
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🎢 Crypto Coaster</h3>
              <p className="text-sm text-green-700">
                Show appreciation with tips for your ride or die friends who've been on this wild ride!
              </p>
            </div>
          </div>

          <div className="mt-6">
            <a 
              href="/app" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
            >
              🎢 Open Mini App
            </a>
          </div>

          {/* Roller Coaster Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600">₿</div>
                <div className="text-xs text-gray-600">Bitcoin Bros</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">🎢</div>
                <div className="text-xs text-gray-600">Crypto Coaster</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">💎</div>
                <div className="text-xs text-gray-600">Ride or Die</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 