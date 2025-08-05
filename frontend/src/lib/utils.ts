import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AffinityTitle } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAffinityTitle(score: number, rank: number): AffinityTitle {
  if (rank === 1) return { title: "Ride or Die", icon: "💖", color: "from-pink-500 to-red-500" }
  if (rank === 2) return { title: "Bestie", icon: "💎", color: "from-blue-500 to-purple-500" }
  if (rank === 3) return { title: "Squad Leader", icon: "🌟", color: "from-yellow-500 to-orange-500" }
  
  if (score >= 90) return { title: "Soulmate", icon: "💖", color: "from-pink-500 to-red-500" }
  if (score >= 80) return { title: "Best Friend", icon: "💎", color: "from-blue-500 to-purple-500" }
  if (score >= 70) return { title: "Close Friend", icon: "✨", color: "from-green-500 to-blue-500" }
  if (score >= 60) return { title: "Good Friend", icon: "👋", color: "from-gray-500 to-gray-600" }
  if (score >= 50) return { title: "Friend", icon: "🤝", color: "from-gray-400 to-gray-500" }
  return { title: "Connection", icon: "🔗", color: "from-gray-300 to-gray-400" }
}

export function getNetworkDensityColor(density: number): string {
  if (density >= 50) return "text-green-600"
  if (density >= 25) return "text-yellow-600"
  return "text-red-600"
}

export function getEngagementColor(score: number): string {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  if (score >= 40) return "text-orange-600"
  return "text-red-600"
}

export function formatLastInteraction(timestamp?: string): string {
  if (!timestamp) return "Never"
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
