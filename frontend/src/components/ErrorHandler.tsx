'use client'

import { useEffect } from 'react'

export default function ErrorHandler() {
  useEffect(() => {
    // Suppress external script errors
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args) => {
      const message = args[0]?.toString() || ''
      
      // Suppress common external errors
      if (
        message.includes('ethereum') ||
        message.includes('isZerion') ||
        message.includes('window.ethereum') ||
        message.includes('Failed to set window.ethereum') ||
        message.includes('Cannot redefine property') ||
        message.includes('ERR_BLOCKED_BY_CLIENT') ||
        message.includes('warpcast.com')
      ) {
        return // Suppress these errors
      }
      
      originalError.apply(console, args)
    }
    
    console.warn = (...args) => {
      const message = args[0]?.toString() || ''
      
      // Suppress common external warnings
      if (
        message.includes('ethereum') ||
        message.includes('isZerion') ||
        message.includes('window.ethereum') ||
        message.includes('Failed to set window.ethereum') ||
        message.includes('Cannot redefine property') ||
        message.includes('ERR_BLOCKED_BY_CLIENT') ||
        message.includes('warpcast.com')
      ) {
        return // Suppress these warnings
      }
      
      originalWarn.apply(console, args)
    }
    
    // Cleanup function
    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])
  
  return null
} 