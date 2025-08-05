import { useState, useEffect } from 'react'
import { useMiniApp } from '@/components/MiniAppProvider'
import { sdk } from '@farcaster/miniapp-sdk'
import { Top8User, Top8Stats } from '../types'

export function useTop8() {
  const [top8, setTop8] = useState<Top8User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userFid, setUserFid] = useState<number | null>(null)
  const [stats, setStats] = useState<Top8Stats | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [allUsers, setAllUsers] = useState<Top8User[]>([])

  const { isSDKLoaded, isConnected, userFid: contextUserFid, context } = useMiniApp()

  const isInMiniApp = typeof window !== 'undefined' && window.location.href.includes('warpcast.com')

  useEffect(() => {
    if (isSDKLoaded && isConnected && contextUserFid && context) {
      console.log('Farcaster context received:', context)
      console.log('User FID detected:', contextUserFid)
      
      const fid = parseInt(contextUserFid.toString())
      setUserFid(fid)
      
      // Call sdk.actions.ready() to hide splash screen
      const callReady = async () => {
        try {
          await sdk.actions.ready()
          console.log('Mini App ready() called successfully')
        } catch (error) {
          console.error('Error calling ready():', error)
        }
      }
      callReady()
      
      handleGetTop8(fid)
    }
  }, [isSDKLoaded, isConnected, contextUserFid, context])

  const handleGetTop8 = async (fid: number, page: number = 1) => {
    if (!fid) {
      setError("No FID detected. Please try again.")
      return
    }

    if (page === 1) {
      setLoading(true)
      setError("")
    }

    try {
      console.log('🔍 Frontend: Fetching Top 8 for FID:', fid, 'Page:', page)
      
      const response = await fetch(`/api/top8-simple?fid=${fid}&page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log('🔍 Frontend: Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Frontend: API error:', errorData)
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Frontend: API response:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }

      const newUsers = data.top8 || []
      
      if (page === 1) {
        setTop8(newUsers)
        setAllUsers(newUsers)
      } else {
        setAllUsers(prev => [...prev, ...newUsers])
      }
      
      setStats(data.stats || null)
      setHasMore(newUsers.length === 8) // If we got 8 users, there might be more
      
      // Log debug info if available
      if (data.debug) {
        console.log('🔍 Frontend: Debug info:', data.debug)
      }
      
    } catch (error) {
      console.error('❌ Frontend: Error fetching Top 8:', error)
      if (page === 1) {
        setError(error instanceof Error ? error.message : "Failed to fetch your Top 8")
      }
    } finally {
      if (page === 1) {
        setLoading(false)
      }
    }
  }

  const loadMore = async () => {
    if (!userFid || !hasMore || loading) return
    
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    await handleGetTop8(userFid, nextPage)
    
    // Scroll to the new content smoothly
    setTimeout(() => {
      const newCards = document.querySelectorAll('[data-rank]')
      if (newCards.length > 0) {
        const firstNewCard = newCards[newCards.length - 8] // First card of new batch
        firstNewCard?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  // Call ready() even if no user context (for testing)
  useEffect(() => {
    if (isSDKLoaded && isInMiniApp) {
      const callReady = async () => {
        try {
          await sdk.actions.ready()
          console.log('Mini App ready() called (fallback)')
        } catch (error) {
          console.error('Error calling ready() (fallback):', error)
        }
      }
      callReady()
    }
  }, [isSDKLoaded, isInMiniApp])

  return {
    top8,
    loading,
    error,
    userFid,
    stats,
    currentPage,
    hasMore,
    allUsers,
    handleGetTop8,
    loadMore,
    isInMiniApp,
    isSDKLoaded
  }
} 