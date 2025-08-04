"use client"

import { useState } from "react"

export default function SimplePage() {
  const [fid, setFid] = useState("")
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

      alert(`Found ${data.friends?.length || 0} friends!`)
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
              Top 8 Friends (Simple)
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Simple version without Mini App SDK
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Enter Farcaster ID</h2>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Enter your FID (e.g., 194)"
                value={fid}
                onChange={(e) => setFid(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button 
                onClick={handleGetTop8} 
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Get Top 8"}
              </button>
            </div>
            {error && (
              <p className="text-red-500 mt-2 text-sm">{error}</p>
            )}
          </div>

          <div className="text-center text-gray-500">
            <p>This is a simplified version to test the deployment.</p>
            <p>Check the console for any errors.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 