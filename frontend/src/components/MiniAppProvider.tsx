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
        
        // Get user's context if available
        const userContext = await sdk.context
        setContext(userContext)
        
        if (userContext?.user?.fid) {
          setUserFid(userContext.user.fid.toString())
          setIsConnected(true)
        }
      } catch (err) {
        console.error("Failed to initialize Mini App SDK:", err)
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
      if (sdk.wallet?.ethProvider) {
        await sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' })
        setIsConnected(true)
        
        // Refresh context after connection
        const userContext = await sdk.context
        setContext(userContext)
        
        if (userContext?.user?.fid) {
          setUserFid(userContext.user.fid.toString())
        }
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err)
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