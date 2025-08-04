"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface MiniAppContextType {
  isSDKLoaded: boolean
  isConnected: boolean
  isAuthenticated: boolean
  userFid?: string
  context?: unknown
  authToken?: string
  connectWallet: () => Promise<void>
  authenticateUser: () => Promise<any>
  signInWithFarcaster: () => Promise<any>
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userFid, setUserFid] = useState<string>()
  const [context, setContext] = useState<unknown>()
  const [authToken, setAuthToken] = useState<string>()

  useEffect(() => {
    const initSDK = async () => {
      try {
        console.log('Initializing Mini App SDK...')
        setIsSDKLoaded(true)
        
        // Get user's context if available
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
        }
      } catch (err) {
        console.log("Mini App SDK initialization completed (some features may not be available):", err)
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
          // Wait a bit longer to ensure the app is fully rendered
          await new Promise(resolve => setTimeout(resolve, 200))
          
          console.log('Calling sdk.actions.ready() - app is ready to display')
          await sdk.actions.ready()
          console.log('sdk.actions.ready() completed successfully')
        } catch (err) {
          console.error("Failed to call sdk.actions.ready():", err)
        }
      }
      
      // Call ready() after a delay to ensure the app content is fully rendered
      const timer = setTimeout(callReady, 300)
      return () => clearTimeout(timer)
    }
  }, [isSDKLoaded])

  // Quick Auth - The easiest way to get an authenticated session
  const authenticateUser = async () => {
    try {
      console.log('Attempting Quick Auth...')
      
      // For now, we'll use the context to get user info
      // Quick Auth implementation depends on SDK version
      const userContext = await sdk.context
      
      if (userContext?.user?.fid) {
        setUserFid(userContext.user.fid.toString())
        setIsConnected(true)
        setIsAuthenticated(true)
        console.log('User authenticated via context')
        return { success: true, user: userContext.user }
      } else {
        console.log('No user context available for Quick Auth')
        return null
      }
    } catch (err) {
      console.error('Quick Auth error:', err)
      return null
    }
  }

  // Sign In with Farcaster - Alternative authentication method
  const signInWithFarcaster = async () => {
    try {
      console.log('Attempting Sign In with Farcaster...')
      
      // Use signIn to get a Sign in with Farcaster authentication credential
      // Generate a nonce for the sign-in request
      const nonce = Math.random().toString(36).substring(2, 15)
      const signInResult = await sdk.actions.signIn({ nonce })
      console.log('Sign In result:', signInResult)
      
      if (signInResult) {
        console.log('Sign In successful - credential received')
        
        // Send credential to backend for verification
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              signInResult: signInResult
            })
          })
          
          if (response.ok) {
            const result = await response.json()
            if (result.token) {
              setAuthToken(result.token)
              setIsAuthenticated(true)
              console.log('Credential verified - session token received')
            }
          }
        } catch (verifyErr) {
          console.error('Credential verification failed:', verifyErr)
        }
        
        return signInResult
      } else {
        console.log('Sign In failed - no credential received')
        return null
      }
    } catch (err) {
      console.error('Sign In error:', err)
      return null
    }
  }

  const connectWallet = async () => {
    try {
      // Check if we're in a Farcaster mini-app environment
      if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        console.log('Running in Vercel environment - wallet connection may not be available')
        return
      }

      if (sdk.wallet?.ethProvider) {
        await sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' })
        setIsConnected(true)
        
        // Refresh context after connection
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
    }
  }

  const value = {
    isSDKLoaded,
    isConnected,
    isAuthenticated,
    userFid,
    context,
    authToken,
    connectWallet,
    authenticateUser,
    signInWithFarcaster
  }

  return (
    <MiniAppContext.Provider value={value}>
      {children}
    </MiniAppContext.Provider>
  )
} 