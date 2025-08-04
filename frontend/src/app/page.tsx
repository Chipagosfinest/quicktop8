import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Top8Friend {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  interactions: number
  lastInteraction: string
  interactionTypes: {
    likes: number
    replies: number
    recasts: number
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Top 8 Friends
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Discover your most interactive friends on Farcaster
            </p>
            <div className="mt-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                🎯 Mini App Ready
              </Badge>
            </div>
          </div>

          {/* Main Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Welcome to QuickTop8</CardTitle>
              <CardDescription>
                This Mini App analyzes your Farcaster interactions to discover your Top 8 most interactive friends.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  This Mini App is designed to work within the Farcaster app. 
                  Launch it from your Farcaster client to get started!
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    How to Use:
                  </h3>
                  <ol className="text-left text-blue-700 dark:text-blue-300 space-y-1">
                    <li>1. Open this Mini App from within Farcaster</li>
                    <li>2. Connect your wallet if prompted</li>
                    <li>3. Enter your Farcaster ID (FID)</li>
                    <li>4. Discover your Top 8 most interactive friends!</li>
                  </ol>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    Features:
                  </h3>
                  <ul className="text-left text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Analyzes likes, replies, and recasts</li>
                    <li>• Ranks friends by interaction frequency</li>
                    <li>• Shows detailed interaction statistics</li>
                    <li>• Beautiful, responsive design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>QuickTop8 - Farcaster Mini App</p>
            <p className="text-sm">Built with Next.js and the Farcaster Mini App SDK</p>
          </div>
        </div>
      </div>
    </div>
  )
}
