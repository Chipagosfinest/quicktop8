export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          QuickTop8 Test Page
        </h1>
        <p className="text-gray-600 text-lg">
          If you can see this, Next.js is working on Vercel!
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Environment Variables:</h2>
          <p>BACKEND_URL: {process.env.BACKEND_URL || 'Not set'}</p>
          <p>NEYNAR_WEBHOOK_SECRET: {process.env.NEYNAR_WEBHOOK_SECRET ? 'Set' : 'Not set'}</p>
        </div>
      </div>
    </div>
  )
} 