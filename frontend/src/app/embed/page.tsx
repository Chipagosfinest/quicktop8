import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ride or Die Top 8 - Your Longest-Standing Farcaster Friends',
  description: 'Discover your ride or die friends on Farcaster with original engagement links and tip them!',
  openGraph: {
    title: 'Ride or Die Top 8 - Your Longest-Standing Farcaster Friends',
    description: 'Discover your ride or die friends on Farcaster with original engagement links and tip them!',
    images: ['https://quicktop8-di3y3yllp-chipagosfinests-projects.vercel.app/og-image.png'],
  },
  other: {
    'fc:miniapp': 'Ride or Die Top 8',
    'fc:miniapp:domain': 'quicktop8-di3y3yllp-chipagosfinests-projects.vercel.app',
    'fc:miniapp:icon': 'https://quicktop8-di3y3yllp-chipagosfinests-projects.vercel.app/icon.png',
    'fc:miniapp:home': 'https://quicktop8-di3y3yllp-chipagosfinests-projects.vercel.app'
  }
};

export default function EmbedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ride or Die Top 8</h1>
          <p className="text-gray-600 text-lg">Your longest-standing Farcaster friends, with original engagement links and tipping!</p>
        </div>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">🔥 Ride or Die</h3>
            <p className="text-sm text-purple-700">Discover your most loyal mutuals and celebrate your Farcaster journey together.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💜 Tip Your Friends</h3>
            <p className="text-sm text-blue-700">Show appreciation with a tip for your ride or die friends.</p>
          </div>
        </div>
        <div className="mt-6">
          <a href="/app" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Open Mini App
          </a>
        </div>
      </div>
    </div>
  );
} 