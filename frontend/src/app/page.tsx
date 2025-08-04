"use client"

import { useState } from "react"
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
  const [fid, setFid] = useState("")
  const [friends, setFriends] = useState<Top8Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGetTop8 = async () => {
    if (!fid) {
      setError("Please enter a FID")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/top8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fid: parseInt(fid) }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch Top 8")
      }

      setFriends(data.friends)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

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
          </div>

          {/* Input Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enter Farcaster ID</CardTitle>
              <CardDescription>
                Enter your Farcaster ID (FID) to analyze your interactions and find your Top 8 friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Enter your FID (e.g., 194)"
                  value={fid}
                  onChange={(e) => setFid(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <Button 
                  onClick={handleGetTop8} 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? "Analyzing..." : "Get Top 8"}
                </Button>
              </div>
              {error && (
                <p className="text-red-500 mt-2 text-sm">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {friends.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {friends.map((friend, index) => (
                <Card key={friend.fid} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <Avatar className="w-16 h-16 mx-auto mb-2">
                      <AvatarImage src={friend.pfp_url} alt={friend.display_name} />
                      <AvatarFallback>{friend.display_name?.charAt(0) || friend.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{friend.display_name}</CardTitle>
                    <CardDescription>@{friend.username}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {friend.bio && friend.bio.length > 50 
                          ? `${friend.bio.substring(0, 50)}...` 
                          : friend.bio}
                      </div>
                      
                      <div className="flex justify-center gap-2 text-xs">
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                          ❤️ {friend.interactionTypes.likes}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          💬 {friend.interactionTypes.replies}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          🔄 {friend.interactionTypes.recasts}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Total: {friend.interactions} interactions
                      </div>
                      
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Last: {new Date(friend.lastInteraction).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && friends.length === 0 && !error && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Top 8 Yet</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Enter your Farcaster ID above to discover your most interactive friends
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
