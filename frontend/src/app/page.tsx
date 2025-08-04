

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          QuickTop8
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Discover your most interactive friends on Farcaster (last 45 days)
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
          <p className="text-gray-600 mb-4">
            This Mini App analyzes your recent Farcaster interactions (last 45 days) to find your Top 8 friends.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Launch this Mini App from within Farcaster to get started!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
