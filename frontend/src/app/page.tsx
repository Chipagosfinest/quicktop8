

"use client"

import { useEffect } from 'react'
import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'

export default function Home() {
  const { 
    isSDKLoaded, 
    isConnected, 
    isAuthenticated, 
    userFid, 
    authenticateUser, 
    signInWithFarcaster 
  } = useMiniApp()

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        console.log('Home page: Initializing Mini App...')
        
        // Wait for SDK to be loaded
        if (isSDKLoaded) {
          console.log('Home page: SDK is loaded, calling sdk.actions.ready()')
          await sdk.actions.ready()
          console.log('Home page: sdk.actions.ready() completed successfully')
        } else {
          console.log('Home page: SDK not loaded yet, waiting...')
        }
      } catch (err) {
        console.error('Home page: Failed to call sdk.actions.ready():', err)
      }
    }

    // Call ready() when the component mounts and SDK is loaded
    if (isSDKLoaded) {
      initMiniApp()
    }
  }, [isSDKLoaded])

  const handleQuickAuth = async () => {
    try {
      const result = await authenticateUser()
      console.log('Quick Auth result:', result)
    } catch (error) {
      console.error('Quick Auth failed:', error)
    }
  }

  const handleSignIn = async () => {
    try {
      const result = await signInWithFarcaster()
      console.log('Sign In result:', result)
    } catch (error) {
      console.error('Sign In failed:', error)
    }
  }

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
          
          {/* Authentication Status */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SDK Loaded:</span>
              <span className={`px-2 py-1 rounded text-xs ${isSDKLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isSDKLoaded ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connected:</span>
              <span className={`px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {isConnected ? '✅' : '⚠️'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authenticated:</span>
              <span className={`px-2 py-1 rounded text-xs ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {isAuthenticated ? '✅' : '⚠️'}
              </span>
            </div>
            {userFid && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User FID:</span>
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                  {userFid}
                </span>
              </div>
            )}
          </div>

          <p className="text-gray-600 mb-4">
            This Mini App analyzes your recent Farcaster interactions (last 45 days) to find your Top 8 friends.
          </p>
          
          {/* Authentication Buttons */}
          <div className="space-y-3 mb-4">
            <button
              onClick={handleQuickAuth}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔐 Quick Auth
            </button>
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔑 Sign In with Farcaster
            </button>
          </div>

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
