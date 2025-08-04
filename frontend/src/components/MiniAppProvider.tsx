"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface MiniAppContextType {
  isSDKLoaded: boolean
  isConnected: boolean
  userFid?: string
  context?: unknown
  connectWallet: () => Promise<void>
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined)

export function useMiniApp() {
  const context = useContext(MiniAppContext)
  if (context === undefined) {
    throw new Error('useMiniApp must be used within a MiniAppProvider')
  }
  return context
}

interface MiniAppProviderProps {
  children: ReactNode
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [userFid, setUserFid] = useState<string>()
  const [context, setContext] = useState<unknown>()

  useEffect(() => {
    const initSDK = async () => {
      try {
        // Initialize SDK but don't call ready() yet
        setIsSDKLoaded(true)
        
        // Get user's context if available - with error handling for deprecated domains
        try {
          const userContext = await sdk.context
          console.log("Farcaster context received:", userContext)
          setContext(userContext)
          
          if (userContext?.user?.fid) {
            console.log("User FID detected:", userContext.user.fid)
            setUserFid(userContext.user.fid.toString())
            setIsConnected(true)
          } else {
            console.log("No user FID found in context")
          }
        } catch (contextErr) {
          console.log("Context not available (may be running outside Mini App):", contextErr)
          // Don't fail the entire initialization if context fails
        }
      } catch (err) {
        console.log("Mini App SDK initialization completed (some features may not be available):", err)
        // Still mark as loaded so the app can function
        setIsSDKLoaded(true)
      }
    }

    initSDK()
  }, [])

  // Call ready() when the app is actually ready to display
  useEffect(() => {
    if (isSDKLoaded) {
      const callReady = async () => {
        try {
          console.log('Calling sdk.actions.ready() - app is ready to display')
          await sdk.actions.ready()
          console.log('sdk.actions.ready() completed successfully')
        } catch (err) {
          console.error("Failed to call sdk.actions.ready():", err)
        }
      }
      
      // Small delay to ensure the app content is fully rendered
      const timer = setTimeout(callReady, 100)
      return () => clearTimeout(timer)
    }
  }, [isSDKLoaded])

  const connectWallet = async () => {
    try {
      // Check if we're in a Farcaster mini-app environment
      if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        console.log('Running in Vercel environment - wallet connection may not be available')
        // In Vercel environment, we'll rely on manual FID input
        return
      }

      if (sdk.wallet?.ethProvider) {
        await sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' })
        setIsConnected(true)
        
        // Refresh context after connection - with error handling
        try {
          const userContext = await sdk.context
          setContext(userContext)
          
          if (userContext?.user?.fid) {
            setUserFid(userContext.user.fid.toString())
          }
        } catch (contextErr) {
          console.log("Could not refresh context after wallet connection:", contextErr)
        }
      } else {
        console.log('No wallet provider available - using manual FID input')
      }
    } catch (err) {
      console.log("Wallet connection not available (this is normal in development):", err)
      // Don't treat this as an error - it's expected in some environments
    }
  }

  const value = {
    isSDKLoaded,
    isConnected,
    userFid,
    context,
    connectWallet
  }

  return (
    <MiniAppContext.Provider value={value}>
      {children}
    </MiniAppContext.Provider>
  )
} 